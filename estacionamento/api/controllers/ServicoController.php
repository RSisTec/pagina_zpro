<?php
/**
 * Controlador de serviços
 */
class ServicoController {
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
     * Listar serviços
     */
    public function index() {
        // Obter parâmetros de filtro
        $params = $this->request->getParams();
        
        // Construir consulta SQL
        $sql = "
            SELECT id, empresa_id, nome, descricao, valor, ativo, data_criacao, data_atualizacao
            FROM servicos
            WHERE empresa_id = :empresa_id
        ";
        
        $sqlParams = [
            'empresa_id' => $this->empresaId
        ];
        
        // Aplicar filtros
        if (isset($params['ativo']) && $params['ativo'] !== '') {
            $ativo = $params['ativo'] === 'true' || $params['ativo'] === '1';
            $sql .= " AND ativo = :ativo";
            $sqlParams['ativo'] = $ativo;
        }
        
        if (isset($params['busca']) && !empty($params['busca'])) {
            $busca = '%' . $params['busca'] . '%';
            $sql .= " AND (nome ILIKE :busca OR descricao ILIKE :busca)";
            $sqlParams['busca'] = $busca;
        }
        
        // Ordenação
        $sql .= " ORDER BY nome ASC";
        
        // Executar consulta
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($sqlParams);
        $servicos = $stmt->fetchAll();
        
        // Formatar datas
        foreach ($servicos as &$servico) {
            $servico['data_criacao'] = strtotime($servico['data_criacao']) * 1000;
            $servico['data_atualizacao'] = $servico['data_atualizacao'] ? strtotime($servico['data_atualizacao']) * 1000 : null;
        }
        
        // Retornar resposta
        Response::success($servicos);
    }
    
    /**
     * Obter detalhes de um serviço
     * 
     * @param string $id ID do serviço
     */
    public function show($id) {
        // Buscar serviço
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, descricao, valor, ativo, data_criacao, data_atualizacao
            FROM servicos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $servico = $stmt->fetch();
        
        if (!$servico) {
            Response::notFound('Serviço não encontrado');
        }
        
        // Formatar datas
        $servico['data_criacao'] = strtotime($servico['data_criacao']) * 1000;
        $servico['data_atualizacao'] = $servico['data_atualizacao'] ? strtotime($servico['data_atualizacao']) * 1000 : null;
        
        // Retornar resposta
        Response::success($servico);
    }
    
    /**
     * Cadastrar serviço
     */
    public function store() {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['nome']) || empty($params['nome'])) {
            Response::error('Nome é obrigatório', 400);
        }
        
        if (!isset($params['valor']) || $params['valor'] === '') {
            Response::error('Valor é obrigatório', 400);
        }
        
        // Verificar se já existe serviço com o mesmo nome
        $stmt = $this->pdo->prepare("
            SELECT id FROM servicos
            WHERE nome = :nome AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'nome' => $params['nome'],
            'empresa_id' => $this->empresaId
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um serviço com este nome', 400);
        }
        
        // Gerar ID do serviço
        $id = 'srv_' . uniqid();
        
        // Inserir serviço
        $stmt = $this->pdo->prepare("
            INSERT INTO servicos (
                id, empresa_id, nome, descricao, valor, ativo, data_criacao
            ) VALUES (
                :id, :empresa_id, :nome, :descricao, :valor, :ativo, NOW()
            )
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId,
            'nome' => $params['nome'],
            'descricao' => $params['descricao'] ?? null,
            'valor' => $params['valor'],
            'ativo' => isset($params['ativo']) ? $params['ativo'] : true
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'cadastro', 'servicos', :registro_id, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar serviço cadastrado
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, descricao, valor, ativo, data_criacao
            FROM servicos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $servico = $stmt->fetch();
        
        // Formatar datas
        $servico['data_criacao'] = strtotime($servico['data_criacao']) * 1000;
        
        // Retornar resposta
        Response::success($servico, 'Serviço cadastrado com sucesso', 201);
    }
    
    /**
     * Atualizar serviço
     * 
     * @param string $id ID do serviço
     */
    public function update($id) {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['nome']) || empty($params['nome'])) {
            Response::error('Nome é obrigatório', 400);
        }
        
        if (!isset($params['valor']) || $params['valor'] === '') {
            Response::error('Valor é obrigatório', 400);
        }
        
        // Buscar serviço
        $stmt = $this->pdo->prepare("
            SELECT * FROM servicos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $servico = $stmt->fetch();
        
        if (!$servico) {
            Response::notFound('Serviço não encontrado');
        }
        
        // Verificar se já existe serviço com o mesmo nome
        $stmt = $this->pdo->prepare("
            SELECT id FROM servicos
            WHERE nome = :nome AND empresa_id = :empresa_id AND id != :id
        ");
        
        $stmt->execute([
            'nome' => $params['nome'],
            'empresa_id' => $this->empresaId,
            'id' => $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um serviço com este nome', 400);
        }
        
        // Atualizar serviço
        $stmt = $this->pdo->prepare("
            UPDATE servicos
            SET nome = :nome,
                descricao = :descricao,
                valor = :valor,
                ativo = :ativo,
                data_atualizacao = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'nome' => $params['nome'],
            'descricao' => $params['descricao'] ?? null,
            'valor' => $params['valor'],
            'ativo' => isset($params['ativo']) ? $params['ativo'] : $servico['ativo']
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'atualizacao', 'servicos', :registro_id, :dados_antigos, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_antigos' => json_encode($servico),
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar serviço atualizado
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, descricao, valor, ativo, data_criacao, data_atualizacao
            FROM servicos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $servicoAtualizado = $stmt->fetch();
        
        // Formatar datas
        $servicoAtualizado['data_criacao'] = strtotime($servicoAtualizado['data_criacao']) * 1000;
        $servicoAtualizado['data_atualizacao'] = strtotime($servicoAtualizado['data_atualizacao']) * 1000;
        
        // Retornar resposta
        Response::success($servicoAtualizado, 'Serviço atualizado com sucesso');
    }
    
    /**
     * Excluir serviço
     * 
     * @param string $id ID do serviço
     */
    public function destroy($id) {
        // Buscar serviço
        $stmt = $this->pdo->prepare("
            SELECT * FROM servicos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $servico = $stmt->fetch();
        
        if (!$servico) {
            Response::notFound('Serviço não encontrado');
        }
        
        // Verificar se existem serviços realizados com este serviço
        $stmt = $this->pdo->prepare("
            SELECT id FROM servicos_realizados
            WHERE servico_id = :servico_id
        ");
        
        $stmt->execute(['servico_id' => $id]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Não é possível excluir o serviço pois existem serviços realizados associados a ele', 400);
        }
        
        // Excluir serviço
        $stmt = $this->pdo->prepare("
            DELETE FROM servicos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'exclusao', 'servicos', :registro_id, :dados_antigos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_antigos' => json_encode($servico),
            'ip' => $this->request->getIp()
        ]);
        
        // Retornar resposta
        Response::success(null, 'Serviço excluído com sucesso');
    }
    
    /**
     * Adicionar serviço a um veículo
     * 
     * @param string $veiculoId ID do veículo
     * @param string $servicoId ID do serviço
     */
    public function addToVeiculo($veiculoId, $servicoId) {
        // Buscar veículo
        $stmt = $this->pdo->prepare("
            SELECT * FROM veiculos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $veiculoId,
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculo = $stmt->fetch();
        
        if (!$veiculo) {
            Response::notFound('Veículo não encontrado');
        }
        
        // Buscar serviço
        $stmt = $this->pdo->prepare("
            SELECT * FROM servicos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $servicoId,
            'empresa_id' => $this->empresaId
        ]);
        
        $servico = $stmt->fetch();
        
        if (!$servico) {
            Response::notFound('Serviço não encontrado');
        }
        
        // Verificar se o serviço já foi adicionado ao veículo
        $stmt = $this->pdo->prepare("
            SELECT id FROM servicos_realizados
            WHERE veiculo_id = :veiculo_id AND servico_id = :servico_id
        ");
        
        $stmt->execute([
            'veiculo_id' => $veiculoId,
            'servico_id' => $servicoId
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Este serviço já foi adicionado a este veículo', 400);
        }
        
        // Gerar ID do serviço realizado
        $id = 'sr_' . uniqid();
        
        // Inserir serviço realizado
        $stmt = $this->pdo->prepare("
            INSERT INTO servicos_realizados (
                id, veiculo_id, servico_id, nome_servico, valor, data_adicao
            ) VALUES (
                :id, :veiculo_id, :servico_id, :nome_servico, :valor, NOW()
            )
        ");
        
        $stmt->execute([
            'id' => $id,
            'veiculo_id' => $veiculoId,
            'servico_id' => $servicoId,
            'nome_servico' => $servico['nome'],
            'valor' => $servico['valor']
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'cadastro', 'servicos_realizados', :registro_id, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_novos' => json_encode([
                'veiculo_id' => $veiculoId,
                'servico_id' => $servicoId,
                'nome_servico' => $servico['nome'],
                'valor' => $servico['valor']
            ]),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar serviço realizado
        $stmt = $this->pdo->prepare("
            SELECT id, veiculo_id, servico_id, nome_servico, valor, data_adicao
            FROM servicos_realizados
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $servicoRealizado = $stmt->fetch();
        
        // Formatar datas
        $servicoRealizado['data_adicao'] = strtotime($servicoRealizado['data_adicao']) * 1000;
        
        // Retornar resposta
        Response::success($servicoRealizado, 'Serviço adicionado ao veículo com sucesso', 201);
    }
    
    /**
     * Remover serviço de um veículo
     * 
     * @param string $veiculoId ID do veículo
     * @param string $servicoRealizadoId ID do serviço realizado
     */
    public function removeFromVeiculo($veiculoId, $servicoRealizadoId) {
        // Buscar veículo
        $stmt = $this->pdo->prepare("
            SELECT * FROM veiculos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $veiculoId,
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculo = $stmt->fetch();
        
        if (!$veiculo) {
            Response::notFound('Veículo não encontrado');
        }
        
        // Buscar serviço realizado
        $stmt = $this->pdo->prepare("
            SELECT * FROM servicos_realizados
            WHERE id = :id AND veiculo_id = :veiculo_id
        ");
        
        $stmt->execute([
            'id' => $servicoRealizadoId,
            'veiculo_id' => $veiculoId
        ]);
        
        $servicoRealizado = $stmt->fetch();
        
        if (!$servicoRealizado) {
            Response::notFound('Serviço realizado não encontrado');
        }
        
        // Excluir serviço realizado
        $stmt = $this->pdo->prepare("
            DELETE FROM servicos_realizados
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $servicoRealizadoId]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'exclusao', 'servicos_realizados', :registro_id, :dados_antigos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $servicoRealizadoId,
            'dados_antigos' => json_encode($servicoRealizado),
            'ip' => $this->request->getIp()
        ]);
        
        // Retornar resposta
        Response::success(null, 'Serviço removido do veículo com sucesso');
    }
}
