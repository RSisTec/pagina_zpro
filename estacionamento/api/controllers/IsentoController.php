<?php
/**
 * Controlador de isentos
 */
class IsentoController {
    private $pdo;
    private $auth;
    private $request;
    private $logger;
    private $payload;
    private $empresaId;
    
    /**
     * Construtor
     */
    public function __construct() {
        global $pdo, $auth, $request, $logger;
        
        $this->pdo = $pdo;
        $this->auth = $auth;
        $this->request = $request;
        $this->logger = $logger;
        
        // Verificar autenticação
        $token = $this->request->getAuthToken();
        
        if (!$token) {
            Response::unauthorized('Token não fornecido');
        }
        
        // Validar token
        $payload = $this->auth->validateToken($token);
        
        if (!$payload) {
            Response::unauthorized('Token inválido ou expirado');
        }
        
        $this->payload = $payload;
        
        // Verificar se é usuário e definir empresa_id
        if ($payload['tipo'] === 'usuario') {
            $this->empresaId = $payload['empresa_id'];
        } else if ($payload['tipo'] === 'superadmin' && isset($this->request->getParams()['empresa_id'])) {
            $this->empresaId = $this->request->getParams()['empresa_id'];
        } else if ($payload['tipo'] === 'superadmin') {
            Response::error('ID da empresa é obrigatório', 400);
        }
    }
    
    /**
     * Listar isentos
     */
    public function index() {
        // Obter parâmetros de filtro
        $params = $this->request->getParams();
        
        // Construir consulta SQL
        $sql = "
            SELECT id, empresa_id, nome, documento, motivo, data_criacao, data_atualizacao
            FROM isentos
            WHERE empresa_id = :empresa_id
        ";
        
        $sqlParams = [
            'empresa_id' => $this->empresaId
        ];
        
        // Aplicar filtros
        if (isset($params['motivo']) && !empty($params['motivo'])) {
            $sql .= " AND motivo = :motivo";
            $sqlParams['motivo'] = $params['motivo'];
        }
        
        if (isset($params['busca']) && !empty($params['busca'])) {
            $busca = '%' . $params['busca'] . '%';
            $sql .= " AND (nome ILIKE :busca OR documento ILIKE :busca)";
            $sqlParams['busca'] = $busca;
        }
        
        // Ordenação
        $sql .= " ORDER BY nome ASC";
        
        // Executar consulta
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($sqlParams);
        $isentos = $stmt->fetchAll();
        
        // Formatar datas
        foreach ($isentos as &$isento) {
            $isento['data_criacao'] = strtotime($isento['data_criacao']) * 1000;
            $isento['data_atualizacao'] = $isento['data_atualizacao'] ? strtotime($isento['data_atualizacao']) * 1000 : null;
        }
        
        // Retornar resposta
        Response::success($isentos);
    }
    
    /**
     * Obter detalhes de um isento
     * 
     * @param string $id ID do isento
     */
    public function show($id) {
        // Buscar isento
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, documento, motivo, data_criacao, data_atualizacao
            FROM isentos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $isento = $stmt->fetch();
        
        if (!$isento) {
            Response::notFound('Isento não encontrado');
        }
        
        // Formatar datas
        $isento['data_criacao'] = strtotime($isento['data_criacao']) * 1000;
        $isento['data_atualizacao'] = $isento['data_atualizacao'] ? strtotime($isento['data_atualizacao']) * 1000 : null;
        
        // Buscar veículos do isento
        $stmt = $this->pdo->prepare("
            SELECT id, isento_id, placa, modelo, cor, data_criacao
            FROM veiculos_isentos
            WHERE isento_id = :isento_id
        ");
        
        $stmt->execute(['isento_id' => $id]);
        $veiculos = $stmt->fetchAll();
        
        // Formatar datas dos veículos
        foreach ($veiculos as &$veiculo) {
            $veiculo['data_criacao'] = strtotime($veiculo['data_criacao']) * 1000;
        }
        
        // Adicionar veículos ao isento
        $isento['veiculos'] = $veiculos;
        
        // Retornar resposta
        Response::success($isento);
    }
    
    /**
     * Cadastrar isento
     */
    public function store() {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['nome']) || empty($params['nome'])) {
            Response::error('Nome é obrigatório', 400);
        }
        
        if (!isset($params['documento']) || empty($params['documento'])) {
            Response::error('Documento é obrigatório', 400);
        }
        
        if (!isset($params['motivo']) || empty($params['motivo'])) {
            Response::error('Motivo é obrigatório', 400);
        }
        
        // Verificar se já existe isento com o mesmo documento
        $stmt = $this->pdo->prepare("
            SELECT id FROM isentos
            WHERE documento = :documento AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'documento' => $params['documento'],
            'empresa_id' => $this->empresaId
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um isento com este documento', 400);
        }
        
        // Gerar ID do isento
        $id = 'ise_' . uniqid();
        
        // Inserir isento
        $stmt = $this->pdo->prepare("
            INSERT INTO isentos (
                id, empresa_id, nome, documento, motivo, data_criacao
            ) VALUES (
                :id, :empresa_id, :nome, :documento, :motivo, NOW()
            )
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId,
            'nome' => $params['nome'],
            'documento' => $params['documento'],
            'motivo' => $params['motivo']
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'cadastro', 'isentos', :registro_id, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar isento cadastrado
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, documento, motivo, data_criacao
            FROM isentos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $isento = $stmt->fetch();
        
        // Formatar datas
        $isento['data_criacao'] = strtotime($isento['data_criacao']) * 1000;
        
        // Retornar resposta
        Response::success($isento, 'Isento cadastrado com sucesso', 201);
    }
    
    /**
     * Atualizar isento
     * 
     * @param string $id ID do isento
     */
    public function update($id) {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['nome']) || empty($params['nome'])) {
            Response::error('Nome é obrigatório', 400);
        }
        
        if (!isset($params['documento']) || empty($params['documento'])) {
            Response::error('Documento é obrigatório', 400);
        }
        
        if (!isset($params['motivo']) || empty($params['motivo'])) {
            Response::error('Motivo é obrigatório', 400);
        }
        
        // Buscar isento
        $stmt = $this->pdo->prepare("
            SELECT * FROM isentos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $isento = $stmt->fetch();
        
        if (!$isento) {
            Response::notFound('Isento não encontrado');
        }
        
        // Verificar se já existe isento com o mesmo documento
        $stmt = $this->pdo->prepare("
            SELECT id FROM isentos
            WHERE documento = :documento AND empresa_id = :empresa_id AND id != :id
        ");
        
        $stmt->execute([
            'documento' => $params['documento'],
            'empresa_id' => $this->empresaId,
            'id' => $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um isento com este documento', 400);
        }
        
        // Atualizar isento
        $stmt = $this->pdo->prepare("
            UPDATE isentos
            SET nome = :nome,
                documento = :documento,
                motivo = :motivo,
                data_atualizacao = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'nome' => $params['nome'],
            'documento' => $params['documento'],
            'motivo' => $params['motivo']
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'atualizacao', 'isentos', :registro_id, :dados_antigos, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_antigos' => json_encode($isento),
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar isento atualizado
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, documento, motivo, data_criacao, data_atualizacao
            FROM isentos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $isentoAtualizado = $stmt->fetch();
        
        // Formatar datas
        $isentoAtualizado['data_criacao'] = strtotime($isentoAtualizado['data_criacao']) * 1000;
        $isentoAtualizado['data_atualizacao'] = strtotime($isentoAtualizado['data_atualizacao']) * 1000;
        
        // Retornar resposta
        Response::success($isentoAtualizado, 'Isento atualizado com sucesso');
    }
    
    /**
     * Excluir isento
     * 
     * @param string $id ID do isento
     */
    public function destroy($id) {
        // Buscar isento
        $stmt = $this->pdo->prepare("
            SELECT * FROM isentos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $isento = $stmt->fetch();
        
        if (!$isento) {
            Response::notFound('Isento não encontrado');
        }
        
        // Verificar se existem veículos no pátio associados a este isento
        $stmt = $this->pdo->prepare("
            SELECT id FROM veiculos
            WHERE id_cliente = :id_cliente AND tipo_cliente = 'isento' AND status = 'no-patio'
        ");
        
        $stmt->execute(['id_cliente' => $id]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Não é possível excluir o isento pois existem veículos no pátio associados a ele', 400);
        }
        
        // Iniciar transação
        $this->pdo->beginTransaction();
        
        try {
            // Excluir veículos do isento
            $stmt = $this->pdo->prepare("
                DELETE FROM veiculos_isentos
                WHERE isento_id = :isento_id
            ");
            
            $stmt->execute(['isento_id' => $id]);
            
            // Excluir isento
            $stmt = $this->pdo->prepare("
                DELETE FROM isentos
                WHERE id = :id
            ");
            
            $stmt->execute(['id' => $id]);
            
            // Registrar log
            $stmt = $this->pdo->prepare("
                INSERT INTO logs (
                    usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, ip, data_hora
                ) VALUES (
                    :usuario_id, :empresa_id, 'exclusao', 'isentos', :registro_id, :dados_antigos, :ip, NOW()
                )
            ");
            
            $stmt->execute([
                'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
                'empresa_id' => $this->empresaId,
                'registro_id' => $id,
                'dados_antigos' => json_encode($isento),
                'ip' => $this->request->getIp()
            ]);
            
            // Confirmar transação
            $this->pdo->commit();
            
            // Retornar resposta
            Response::success(null, 'Isento excluído com sucesso');
        } catch (Exception $e) {
            // Cancelar transação
            $this->pdo->rollback();
            
            // Registrar erro
            $this->logger->error('Erro ao excluir isento', [
                'erro' => $e->getMessage(),
                'isento_id' => $id
            ]);
            
            // Retornar erro
            Response::serverError('Erro ao excluir isento: ' . $e->getMessage());
        }
    }
    
    /**
     * Listar veículos de um isento
     * 
     * @param string $id ID do isento
     */
    public function veiculos($id) {
        // Verificar se o isento existe
        $stmt = $this->pdo->prepare("
            SELECT id FROM isentos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        if ($stmt->rowCount() === 0) {
            Response::notFound('Isento não encontrado');
        }
        
        // Buscar veículos do isento
        $stmt = $this->pdo->prepare("
            SELECT id, isento_id, placa, modelo, cor, data_criacao
            FROM veiculos_isentos
            WHERE isento_id = :isento_id
        ");
        
        $stmt->execute(['isento_id' => $id]);
        $veiculos = $stmt->fetchAll();
        
        // Formatar datas
        foreach ($veiculos as &$veiculo) {
            $veiculo['data_criacao'] = strtotime($veiculo['data_criacao']) * 1000;
        }
        
        // Retornar resposta
        Response::success($veiculos);
    }
    
    /**
     * Adicionar veículo a um isento
     * 
     * @param string $id ID do isento
     */
    public function addVeiculo($id) {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['placa']) || empty($params['placa'])) {
            Response::error('Placa é obrigatória', 400);
        }
        
        if (!isset($params['modelo']) || empty($params['modelo'])) {
            Response::error('Modelo é obrigatório', 400);
        }
        
        if (!isset($params['cor']) || empty($params['cor'])) {
            Response::error('Cor é obrigatória', 400);
        }
        
        // Verificar se o isento existe
        $stmt = $this->pdo->prepare("
            SELECT id FROM isentos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        if ($stmt->rowCount() === 0) {
            Response::notFound('Isento não encontrado');
        }
        
        // Verificar se já existe veículo com esta placa para este isento
        $stmt = $this->pdo->prepare("
            SELECT id FROM veiculos_isentos
            WHERE isento_id = :isento_id AND placa = :placa
        ");
        
        $stmt->execute([
            'isento_id' => $id,
            'placa' => $params['placa']
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um veículo com esta placa para este isento', 400);
        }
        
        // Verificar se já existe veículo com esta placa para outro isento
        $stmt = $this->pdo->prepare("
            SELECT vi.id, i.nome
            FROM veiculos_isentos vi
            JOIN isentos i ON vi.isento_id = i.id
            WHERE vi.placa = :placa AND vi.isento_id != :isento_id AND i.empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'placa' => $params['placa'],
            'isento_id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculoOutroIsento = $stmt->fetch();
        
        if ($veiculoOutroIsento) {
            Response::error("Esta placa já está cadastrada para o isento {$veiculoOutroIsento['nome']}", 400);
        }
        
        // Verificar se já existe veículo com esta placa para algum mensalista
        $stmt = $this->pdo->prepare("
            SELECT vm.id, m.nome
            FROM veiculos_mensalistas vm
            JOIN mensalistas m ON vm.mensalista_id = m.id
            WHERE vm.placa = :placa AND m.empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'placa' => $params['placa'],
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculoMensalista = $stmt->fetch();
        
        if ($veiculoMensalista) {
            Response::error("Esta placa já está cadastrada para o mensalista {$veiculoMensalista['nome']}", 400);
        }
        
        // Gerar ID do veículo
        $veiculoId = 'vis_' . uniqid();
        
        // Inserir veículo
        $stmt = $this->pdo->prepare("
            INSERT INTO veiculos_isentos (
                id, isento_id, placa, modelo, cor, data_criacao
            ) VALUES (
                :id, :isento_id, :placa, :modelo, :cor, NOW()
            )
        ");
        
        $stmt->execute([
            'id' => $veiculoId,
            'isento_id' => $id,
            'placa' => $params['placa'],
            'modelo' => $params['modelo'],
            'cor' => $params['cor']
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'cadastro', 'veiculos_isentos', :registro_id, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $veiculoId,
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar veículo cadastrado
        $stmt = $this->pdo->prepare("
            SELECT id, isento_id, placa, modelo, cor, data_criacao
            FROM veiculos_isentos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $veiculoId]);
        $veiculo = $stmt->fetch();
        
        // Formatar datas
        $veiculo['data_criacao'] = strtotime($veiculo['data_criacao']) * 1000;
        
        // Retornar resposta
        Response::success($veiculo, 'Veículo adicionado com sucesso', 201);
    }
    
    /**
     * Remover veículo de um isento
     * 
     * @param string $id ID do isento
     * @param string $veiculoId ID do veículo
     */
    public function removeVeiculo($id, $veiculoId) {
        // Verificar se o isento existe
        $stmt = $this->pdo->prepare("
            SELECT id FROM isentos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        if ($stmt->rowCount() === 0) {
            Response::notFound('Isento não encontrado');
        }
        
        // Verificar se o veículo existe
        $stmt = $this->pdo->prepare("
            SELECT * FROM veiculos_isentos
            WHERE id = :id AND isento_id = :isento_id
        ");
        
        $stmt->execute([
            'id' => $veiculoId,
            'isento_id' => $id
        ]);
        
        $veiculo = $stmt->fetch();
        
        if (!$veiculo) {
            Response::notFound('Veículo não encontrado');
        }
        
        // Verificar se existem veículos no pátio com esta placa associados a este isento
        $stmt = $this->pdo->prepare("
            SELECT id FROM veiculos
            WHERE placa = :placa AND id_cliente = :id_cliente AND tipo_cliente = 'isento' AND status = 'no-patio'
        ");
        
        $stmt->execute([
            'placa' => $veiculo['placa'],
            'id_cliente' => $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Não é possível remover o veículo pois ele está no pátio', 400);
        }
        
        // Excluir veículo
        $stmt = $this->pdo->prepare("
            DELETE FROM veiculos_isentos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $veiculoId]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'exclusao', 'veiculos_isentos', :registro_id, :dados_antigos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $veiculoId,
            'dados_antigos' => json_encode($veiculo),
            'ip' => $this->request->getIp()
        ]);
        
        // Retornar resposta
        Response::success(null, 'Veículo removido com sucesso');
    }
}
