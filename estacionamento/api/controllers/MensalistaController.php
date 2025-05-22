<?php
/**
 * Controlador de mensalistas
 */
class MensalistaController {
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
     * Listar mensalistas
     */
    public function index() {
        // Obter parâmetros de filtro
        $params = $this->request->getParams();
        
        // Construir consulta SQL
        $sql = "
            SELECT id, empresa_id, nome, documento, telefone, email, endereco, plano, 
                   data_inicio, data_fim, data_criacao, data_atualizacao
            FROM mensalistas
            WHERE empresa_id = :empresa_id
        ";
        
        $sqlParams = [
            'empresa_id' => $this->empresaId
        ];
        
        // Aplicar filtros
        if (isset($params['status']) && !empty($params['status'])) {
            $hoje = date('Y-m-d');
            
            if ($params['status'] === 'vigente') {
                $sql .= " AND data_fim >= :hoje";
                $sqlParams['hoje'] = $hoje;
            } else if ($params['status'] === 'vencendo') {
                $trintaDias = date('Y-m-d', strtotime('+30 days'));
                $sql .= " AND data_fim >= :hoje AND data_fim <= :trinta_dias";
                $sqlParams['hoje'] = $hoje;
                $sqlParams['trinta_dias'] = $trintaDias;
            } else if ($params['status'] === 'vencido') {
                $sql .= " AND data_fim < :hoje";
                $sqlParams['hoje'] = $hoje;
            }
        }
        
        if (isset($params['plano']) && !empty($params['plano'])) {
            $sql .= " AND plano = :plano";
            $sqlParams['plano'] = $params['plano'];
        }
        
        if (isset($params['busca']) && !empty($params['busca'])) {
            $busca = '%' . $params['busca'] . '%';
            $sql .= " AND (nome ILIKE :busca OR documento ILIKE :busca OR telefone ILIKE :busca OR email ILIKE :busca)";
            $sqlParams['busca'] = $busca;
        }
        
        // Ordenação
        $sql .= " ORDER BY nome ASC";
        
        // Executar consulta
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($sqlParams);
        $mensalistas = $stmt->fetchAll();
        
        // Formatar datas e adicionar status
        $hoje = time();
        foreach ($mensalistas as &$mensalista) {
            $mensalista['data_inicio'] = strtotime($mensalista['data_inicio']) * 1000;
            $mensalista['data_fim'] = strtotime($mensalista['data_fim']) * 1000;
            $mensalista['data_criacao'] = strtotime($mensalista['data_criacao']) * 1000;
            $mensalista['data_atualizacao'] = $mensalista['data_atualizacao'] ? strtotime($mensalista['data_atualizacao']) * 1000 : null;
            
            // Calcular status
            $dataFim = strtotime($mensalista['data_fim']);
            if ($dataFim < $hoje) {
                $mensalista['status'] = 'vencido';
            } else if ($dataFim < strtotime('+30 days')) {
                $mensalista['status'] = 'vencendo';
            } else {
                $mensalista['status'] = 'vigente';
            }
        }
        
        // Retornar resposta
        Response::success($mensalistas);
    }
    
    /**
     * Obter detalhes de um mensalista
     * 
     * @param string $id ID do mensalista
     */
    public function show($id) {
        // Buscar mensalista
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, documento, telefone, email, endereco, plano, 
                   data_inicio, data_fim, data_criacao, data_atualizacao
            FROM mensalistas
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $mensalista = $stmt->fetch();
        
        if (!$mensalista) {
            Response::notFound('Mensalista não encontrado');
        }
        
        // Formatar datas e adicionar status
        $mensalista['data_inicio'] = strtotime($mensalista['data_inicio']) * 1000;
        $mensalista['data_fim'] = strtotime($mensalista['data_fim']) * 1000;
        $mensalista['data_criacao'] = strtotime($mensalista['data_criacao']) * 1000;
        $mensalista['data_atualizacao'] = $mensalista['data_atualizacao'] ? strtotime($mensalista['data_atualizacao']) * 1000 : null;
        
        // Calcular status
        $hoje = time();
        $dataFim = strtotime($mensalista['data_fim']);
        if ($dataFim < $hoje) {
            $mensalista['status'] = 'vencido';
        } else if ($dataFim < strtotime('+30 days')) {
            $mensalista['status'] = 'vencendo';
        } else {
            $mensalista['status'] = 'vigente';
        }
        
        // Buscar veículos do mensalista
        $stmt = $this->pdo->prepare("
            SELECT id, mensalista_id, placa, modelo, cor, data_criacao
            FROM veiculos_mensalistas
            WHERE mensalista_id = :mensalista_id
        ");
        
        $stmt->execute(['mensalista_id' => $id]);
        $veiculos = $stmt->fetchAll();
        
        // Formatar datas dos veículos
        foreach ($veiculos as &$veiculo) {
            $veiculo['data_criacao'] = strtotime($veiculo['data_criacao']) * 1000;
        }
        
        // Adicionar veículos ao mensalista
        $mensalista['veiculos'] = $veiculos;
        
        // Retornar resposta
        Response::success($mensalista);
    }
    
    /**
     * Cadastrar mensalista
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
        
        if (!isset($params['telefone']) || empty($params['telefone'])) {
            Response::error('Telefone é obrigatório', 400);
        }
        
        if (!isset($params['plano']) || empty($params['plano'])) {
            Response::error('Plano é obrigatório', 400);
        }
        
        if (!isset($params['dataInicio']) || empty($params['dataInicio'])) {
            Response::error('Data de início é obrigatória', 400);
        }
        
        if (!isset($params['dataFim']) || empty($params['dataFim'])) {
            Response::error('Data de fim é obrigatória', 400);
        }
        
        // Verificar se já existe mensalista com o mesmo documento
        $stmt = $this->pdo->prepare("
            SELECT id FROM mensalistas
            WHERE documento = :documento AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'documento' => $params['documento'],
            'empresa_id' => $this->empresaId
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um mensalista com este documento', 400);
        }
        
        // Gerar ID do mensalista
        $id = 'men_' . uniqid();
        
        // Formatar datas
        $dataInicio = date('Y-m-d', $params['dataInicio'] / 1000);
        $dataFim = date('Y-m-d', $params['dataFim'] / 1000);
        
        // Inserir mensalista
        $stmt = $this->pdo->prepare("
            INSERT INTO mensalistas (
                id, empresa_id, nome, documento, telefone, email, endereco, plano,
                data_inicio, data_fim, data_criacao
            ) VALUES (
                :id, :empresa_id, :nome, :documento, :telefone, :email, :endereco, :plano,
                :data_inicio, :data_fim, NOW()
            )
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId,
            'nome' => $params['nome'],
            'documento' => $params['documento'],
            'telefone' => $params['telefone'],
            'email' => $params['email'] ?? null,
            'endereco' => $params['endereco'] ?? null,
            'plano' => $params['plano'],
            'data_inicio' => $dataInicio,
            'data_fim' => $dataFim
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'cadastro', 'mensalistas', :registro_id, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar mensalista cadastrado
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, documento, telefone, email, endereco, plano, 
                   data_inicio, data_fim, data_criacao
            FROM mensalistas
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $mensalista = $stmt->fetch();
        
        // Formatar datas
        $mensalista['data_inicio'] = strtotime($mensalista['data_inicio']) * 1000;
        $mensalista['data_fim'] = strtotime($mensalista['data_fim']) * 1000;
        $mensalista['data_criacao'] = strtotime($mensalista['data_criacao']) * 1000;
        
        // Retornar resposta
        Response::success($mensalista, 'Mensalista cadastrado com sucesso', 201);
    }
    
    /**
     * Atualizar mensalista
     * 
     * @param string $id ID do mensalista
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
        
        if (!isset($params['telefone']) || empty($params['telefone'])) {
            Response::error('Telefone é obrigatório', 400);
        }
        
        if (!isset($params['plano']) || empty($params['plano'])) {
            Response::error('Plano é obrigatório', 400);
        }
        
        if (!isset($params['dataInicio']) || empty($params['dataInicio'])) {
            Response::error('Data de início é obrigatória', 400);
        }
        
        if (!isset($params['dataFim']) || empty($params['dataFim'])) {
            Response::error('Data de fim é obrigatória', 400);
        }
        
        // Buscar mensalista
        $stmt = $this->pdo->prepare("
            SELECT * FROM mensalistas
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $mensalista = $stmt->fetch();
        
        if (!$mensalista) {
            Response::notFound('Mensalista não encontrado');
        }
        
        // Verificar se já existe mensalista com o mesmo documento
        $stmt = $this->pdo->prepare("
            SELECT id FROM mensalistas
            WHERE documento = :documento AND empresa_id = :empresa_id AND id != :id
        ");
        
        $stmt->execute([
            'documento' => $params['documento'],
            'empresa_id' => $this->empresaId,
            'id' => $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um mensalista com este documento', 400);
        }
        
        // Formatar datas
        $dataInicio = date('Y-m-d', $params['dataInicio'] / 1000);
        $dataFim = date('Y-m-d', $params['dataFim'] / 1000);
        
        // Atualizar mensalista
        $stmt = $this->pdo->prepare("
            UPDATE mensalistas
            SET nome = :nome,
                documento = :documento,
                telefone = :telefone,
                email = :email,
                endereco = :endereco,
                plano = :plano,
                data_inicio = :data_inicio,
                data_fim = :data_fim,
                data_atualizacao = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'nome' => $params['nome'],
            'documento' => $params['documento'],
            'telefone' => $params['telefone'],
            'email' => $params['email'] ?? null,
            'endereco' => $params['endereco'] ?? null,
            'plano' => $params['plano'],
            'data_inicio' => $dataInicio,
            'data_fim' => $dataFim
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'atualizacao', 'mensalistas', :registro_id, :dados_antigos, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_antigos' => json_encode($mensalista),
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar mensalista atualizado
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, documento, telefone, email, endereco, plano, 
                   data_inicio, data_fim, data_criacao, data_atualizacao
            FROM mensalistas
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $mensalistaAtualizado = $stmt->fetch();
        
        // Formatar datas
        $mensalistaAtualizado['data_inicio'] = strtotime($mensalistaAtualizado['data_inicio']) * 1000;
        $mensalistaAtualizado['data_fim'] = strtotime($mensalistaAtualizado['data_fim']) * 1000;
        $mensalistaAtualizado['data_criacao'] = strtotime($mensalistaAtualizado['data_criacao']) * 1000;
        $mensalistaAtualizado['data_atualizacao'] = strtotime($mensalistaAtualizado['data_atualizacao']) * 1000;
        
        // Retornar resposta
        Response::success($mensalistaAtualizado, 'Mensalista atualizado com sucesso');
    }
    
    /**
     * Excluir mensalista
     * 
     * @param string $id ID do mensalista
     */
    public function destroy($id) {
        // Buscar mensalista
        $stmt = $this->pdo->prepare("
            SELECT * FROM mensalistas
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $mensalista = $stmt->fetch();
        
        if (!$mensalista) {
            Response::notFound('Mensalista não encontrado');
        }
        
        // Verificar se existem veículos no pátio associados a este mensalista
        $stmt = $this->pdo->prepare("
            SELECT id FROM veiculos
            WHERE id_cliente = :id_cliente AND tipo_cliente = 'mensalista' AND status = 'no-patio'
        ");
        
        $stmt->execute(['id_cliente' => $id]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Não é possível excluir o mensalista pois existem veículos no pátio associados a ele', 400);
        }
        
        // Iniciar transação
        $this->pdo->beginTransaction();
        
        try {
            // Excluir veículos do mensalista
            $stmt = $this->pdo->prepare("
                DELETE FROM veiculos_mensalistas
                WHERE mensalista_id = :mensalista_id
            ");
            
            $stmt->execute(['mensalista_id' => $id]);
            
            // Excluir mensalista
            $stmt = $this->pdo->prepare("
                DELETE FROM mensalistas
                WHERE id = :id
            ");
            
            $stmt->execute(['id' => $id]);
            
            // Registrar log
            $stmt = $this->pdo->prepare("
                INSERT INTO logs (
                    usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, ip, data_hora
                ) VALUES (
                    :usuario_id, :empresa_id, 'exclusao', 'mensalistas', :registro_id, :dados_antigos, :ip, NOW()
                )
            ");
            
            $stmt->execute([
                'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
                'empresa_id' => $this->empresaId,
                'registro_id' => $id,
                'dados_antigos' => json_encode($mensalista),
                'ip' => $this->request->getIp()
            ]);
            
            // Confirmar transação
            $this->pdo->commit();
            
            // Retornar resposta
            Response::success(null, 'Mensalista excluído com sucesso');
        } catch (Exception $e) {
            // Cancelar transação
            $this->pdo->rollback();
            
            // Registrar erro
            $this->logger->error('Erro ao excluir mensalista', [
                'erro' => $e->getMessage(),
                'mensalista_id' => $id
            ]);
            
            // Retornar erro
            Response::serverError('Erro ao excluir mensalista: ' . $e->getMessage());
        }
    }
    
    /**
     * Listar veículos de um mensalista
     * 
     * @param string $id ID do mensalista
     */
    public function veiculos($id) {
        // Verificar se o mensalista existe
        $stmt = $this->pdo->prepare("
            SELECT id FROM mensalistas
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        if ($stmt->rowCount() === 0) {
            Response::notFound('Mensalista não encontrado');
        }
        
        // Buscar veículos do mensalista
        $stmt = $this->pdo->prepare("
            SELECT id, mensalista_id, placa, modelo, cor, data_criacao
            FROM veiculos_mensalistas
            WHERE mensalista_id = :mensalista_id
        ");
        
        $stmt->execute(['mensalista_id' => $id]);
        $veiculos = $stmt->fetchAll();
        
        // Formatar datas
        foreach ($veiculos as &$veiculo) {
            $veiculo['data_criacao'] = strtotime($veiculo['data_criacao']) * 1000;
        }
        
        // Retornar resposta
        Response::success($veiculos);
    }
    
    /**
     * Adicionar veículo a um mensalista
     * 
     * @param string $id ID do mensalista
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
        
        // Verificar se o mensalista existe
        $stmt = $this->pdo->prepare("
            SELECT id FROM mensalistas
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        if ($stmt->rowCount() === 0) {
            Response::notFound('Mensalista não encontrado');
        }
        
        // Verificar se já existe veículo com esta placa para este mensalista
        $stmt = $this->pdo->prepare("
            SELECT id FROM veiculos_mensalistas
            WHERE mensalista_id = :mensalista_id AND placa = :placa
        ");
        
        $stmt->execute([
            'mensalista_id' => $id,
            'placa' => $params['placa']
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um veículo com esta placa para este mensalista', 400);
        }
        
        // Verificar se já existe veículo com esta placa para outro mensalista
        $stmt = $this->pdo->prepare("
            SELECT vm.id, m.nome
            FROM veiculos_mensalistas vm
            JOIN mensalistas m ON vm.mensalista_id = m.id
            WHERE vm.placa = :placa AND vm.mensalista_id != :mensalista_id AND m.empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'placa' => $params['placa'],
            'mensalista_id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculoOutroMensalista = $stmt->fetch();
        
        if ($veiculoOutroMensalista) {
            Response::error("Esta placa já está cadastrada para o mensalista {$veiculoOutroMensalista['nome']}", 400);
        }
        
        // Verificar se já existe veículo com esta placa para algum isento
        $stmt = $this->pdo->prepare("
            SELECT vi.id, i.nome
            FROM veiculos_isentos vi
            JOIN isentos i ON vi.isento_id = i.id
            WHERE vi.placa = :placa AND i.empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'placa' => $params['placa'],
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculoIsento = $stmt->fetch();
        
        if ($veiculoIsento) {
            Response::error("Esta placa já está cadastrada para o isento {$veiculoIsento['nome']}", 400);
        }
        
        // Gerar ID do veículo
        $veiculoId = 'vms_' . uniqid();
        
        // Inserir veículo
        $stmt = $this->pdo->prepare("
            INSERT INTO veiculos_mensalistas (
                id, mensalista_id, placa, modelo, cor, data_criacao
            ) VALUES (
                :id, :mensalista_id, :placa, :modelo, :cor, NOW()
            )
        ");
        
        $stmt->execute([
            'id' => $veiculoId,
            'mensalista_id' => $id,
            'placa' => $params['placa'],
            'modelo' => $params['modelo'],
            'cor' => $params['cor']
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'cadastro', 'veiculos_mensalistas', :registro_id, :dados_novos, :ip, NOW()
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
            SELECT id, mensalista_id, placa, modelo, cor, data_criacao
            FROM veiculos_mensalistas
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
     * Remover veículo de um mensalista
     * 
     * @param string $id ID do mensalista
     * @param string $veiculoId ID do veículo
     */
    public function removeVeiculo($id, $veiculoId) {
        // Verificar se o mensalista existe
        $stmt = $this->pdo->prepare("
            SELECT id FROM mensalistas
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        if ($stmt->rowCount() === 0) {
            Response::notFound('Mensalista não encontrado');
        }
        
        // Verificar se o veículo existe
        $stmt = $this->pdo->prepare("
            SELECT * FROM veiculos_mensalistas
            WHERE id = :id AND mensalista_id = :mensalista_id
        ");
        
        $stmt->execute([
            'id' => $veiculoId,
            'mensalista_id' => $id
        ]);
        
        $veiculo = $stmt->fetch();
        
        if (!$veiculo) {
            Response::notFound('Veículo não encontrado');
        }
        
        // Verificar se existem veículos no pátio com esta placa associados a este mensalista
        $stmt = $this->pdo->prepare("
            SELECT id FROM veiculos
            WHERE placa = :placa AND id_cliente = :id_cliente AND tipo_cliente = 'mensalista' AND status = 'no-patio'
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
            DELETE FROM veiculos_mensalistas
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $veiculoId]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'exclusao', 'veiculos_mensalistas', :registro_id, :dados_antigos, :ip, NOW()
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
