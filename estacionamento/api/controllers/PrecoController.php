<?php
/**
 * Controlador de preços
 */
class PrecoController {
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
     * Listar tabelas de preços
     */
    public function index() {
        // Obter parâmetros de filtro
        $params = $this->request->getParams();
        
        // Construir consulta SQL
        $sql = "
            SELECT id, empresa_id, nome, descricao, valor_primeira_hora, valor_hora_adicional,
                   valor_diaria, valor_mensalidade, ativo, data_criacao, data_atualizacao
            FROM tabelas_precos
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
        $sql .= " ORDER BY ativo DESC, nome ASC";
        
        // Executar consulta
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($sqlParams);
        $tabelas = $stmt->fetchAll();
        
        // Formatar datas
        foreach ($tabelas as &$tabela) {
            $tabela['data_criacao'] = strtotime($tabela['data_criacao']) * 1000;
            $tabela['data_atualizacao'] = $tabela['data_atualizacao'] ? strtotime($tabela['data_atualizacao']) * 1000 : null;
        }
        
        // Retornar resposta
        Response::success($tabelas);
    }
    
    /**
     * Obter detalhes de uma tabela de preços
     * 
     * @param string $id ID da tabela de preços
     */
    public function show($id) {
        // Buscar tabela de preços
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, descricao, valor_primeira_hora, valor_hora_adicional,
                   valor_diaria, valor_mensalidade, ativo, data_criacao, data_atualizacao
            FROM tabelas_precos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $tabela = $stmt->fetch();
        
        if (!$tabela) {
            Response::notFound('Tabela de preços não encontrada');
        }
        
        // Formatar datas
        $tabela['data_criacao'] = strtotime($tabela['data_criacao']) * 1000;
        $tabela['data_atualizacao'] = $tabela['data_atualizacao'] ? strtotime($tabela['data_atualizacao']) * 1000 : null;
        
        // Retornar resposta
        Response::success($tabela);
    }
    
    /**
     * Cadastrar tabela de preços
     */
    public function store() {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['nome']) || empty($params['nome'])) {
            Response::error('Nome é obrigatório', 400);
        }
        
        if (!isset($params['valorPrimeiraHora']) || $params['valorPrimeiraHora'] === '') {
            Response::error('Valor da primeira hora é obrigatório', 400);
        }
        
        if (!isset($params['valorHoraAdicional']) || $params['valorHoraAdicional'] === '') {
            Response::error('Valor da hora adicional é obrigatório', 400);
        }
        
        if (!isset($params['valorDiaria']) || $params['valorDiaria'] === '') {
            Response::error('Valor da diária é obrigatório', 400);
        }
        
        if (!isset($params['valorMensalidade']) || $params['valorMensalidade'] === '') {
            Response::error('Valor da mensalidade é obrigatório', 400);
        }
        
        // Verificar se já existe tabela de preços com o mesmo nome
        $stmt = $this->pdo->prepare("
            SELECT id FROM tabelas_precos
            WHERE nome = :nome AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'nome' => $params['nome'],
            'empresa_id' => $this->empresaId
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe uma tabela de preços com este nome', 400);
        }
        
        // Gerar ID da tabela de preços
        $id = 'prc_' . uniqid();
        
        // Inserir tabela de preços
        $stmt = $this->pdo->prepare("
            INSERT INTO tabelas_precos (
                id, empresa_id, nome, descricao, valor_primeira_hora, valor_hora_adicional,
                valor_diaria, valor_mensalidade, ativo, data_criacao
            ) VALUES (
                :id, :empresa_id, :nome, :descricao, :valor_primeira_hora, :valor_hora_adicional,
                :valor_diaria, :valor_mensalidade, :ativo, NOW()
            )
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId,
            'nome' => $params['nome'],
            'descricao' => $params['descricao'] ?? null,
            'valor_primeira_hora' => $params['valorPrimeiraHora'],
            'valor_hora_adicional' => $params['valorHoraAdicional'],
            'valor_diaria' => $params['valorDiaria'],
            'valor_mensalidade' => $params['valorMensalidade'],
            'ativo' => isset($params['ativo']) ? $params['ativo'] : false
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'cadastro', 'tabelas_precos', :registro_id, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar tabela de preços cadastrada
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, descricao, valor_primeira_hora, valor_hora_adicional,
                   valor_diaria, valor_mensalidade, ativo, data_criacao
            FROM tabelas_precos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $tabela = $stmt->fetch();
        
        // Formatar datas
        $tabela['data_criacao'] = strtotime($tabela['data_criacao']) * 1000;
        
        // Retornar resposta
        Response::success($tabela, 'Tabela de preços cadastrada com sucesso', 201);
    }
    
    /**
     * Atualizar tabela de preços
     * 
     * @param string $id ID da tabela de preços
     */
    public function update($id) {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['nome']) || empty($params['nome'])) {
            Response::error('Nome é obrigatório', 400);
        }
        
        if (!isset($params['valorPrimeiraHora']) || $params['valorPrimeiraHora'] === '') {
            Response::error('Valor da primeira hora é obrigatório', 400);
        }
        
        if (!isset($params['valorHoraAdicional']) || $params['valorHoraAdicional'] === '') {
            Response::error('Valor da hora adicional é obrigatório', 400);
        }
        
        if (!isset($params['valorDiaria']) || $params['valorDiaria'] === '') {
            Response::error('Valor da diária é obrigatório', 400);
        }
        
        if (!isset($params['valorMensalidade']) || $params['valorMensalidade'] === '') {
            Response::error('Valor da mensalidade é obrigatório', 400);
        }
        
        // Buscar tabela de preços
        $stmt = $this->pdo->prepare("
            SELECT * FROM tabelas_precos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $tabela = $stmt->fetch();
        
        if (!$tabela) {
            Response::notFound('Tabela de preços não encontrada');
        }
        
        // Verificar se já existe tabela de preços com o mesmo nome
        $stmt = $this->pdo->prepare("
            SELECT id FROM tabelas_precos
            WHERE nome = :nome AND empresa_id = :empresa_id AND id != :id
        ");
        
        $stmt->execute([
            'nome' => $params['nome'],
            'empresa_id' => $this->empresaId,
            'id' => $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe uma tabela de preços com este nome', 400);
        }
        
        // Atualizar tabela de preços
        $stmt = $this->pdo->prepare("
            UPDATE tabelas_precos
            SET nome = :nome,
                descricao = :descricao,
                valor_primeira_hora = :valor_primeira_hora,
                valor_hora_adicional = :valor_hora_adicional,
                valor_diaria = :valor_diaria,
                valor_mensalidade = :valor_mensalidade,
                data_atualizacao = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'nome' => $params['nome'],
            'descricao' => $params['descricao'] ?? null,
            'valor_primeira_hora' => $params['valorPrimeiraHora'],
            'valor_hora_adicional' => $params['valorHoraAdicional'],
            'valor_diaria' => $params['valorDiaria'],
            'valor_mensalidade' => $params['valorMensalidade']
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'atualizacao', 'tabelas_precos', :registro_id, :dados_antigos, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_antigos' => json_encode($tabela),
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar tabela de preços atualizada
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, descricao, valor_primeira_hora, valor_hora_adicional,
                   valor_diaria, valor_mensalidade, ativo, data_criacao, data_atualizacao
            FROM tabelas_precos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $tabelaAtualizada = $stmt->fetch();
        
        // Formatar datas
        $tabelaAtualizada['data_criacao'] = strtotime($tabelaAtualizada['data_criacao']) * 1000;
        $tabelaAtualizada['data_atualizacao'] = strtotime($tabelaAtualizada['data_atualizacao']) * 1000;
        
        // Retornar resposta
        Response::success($tabelaAtualizada, 'Tabela de preços atualizada com sucesso');
    }
    
    /**
     * Excluir tabela de preços
     * 
     * @param string $id ID da tabela de preços
     */
    public function destroy($id) {
        // Buscar tabela de preços
        $stmt = $this->pdo->prepare("
            SELECT * FROM tabelas_precos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $tabela = $stmt->fetch();
        
        if (!$tabela) {
            Response::notFound('Tabela de preços não encontrada');
        }
        
        // Verificar se a tabela está ativa
        if ($tabela['ativo']) {
            Response::error('Não é possível excluir uma tabela de preços ativa', 400);
        }
        
        // Excluir tabela de preços
        $stmt = $this->pdo->prepare("
            DELETE FROM tabelas_precos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'exclusao', 'tabelas_precos', :registro_id, :dados_antigos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_antigos' => json_encode($tabela),
            'ip' => $this->request->getIp()
        ]);
        
        // Retornar resposta
        Response::success(null, 'Tabela de preços excluída com sucesso');
    }
    
    /**
     * Ativar tabela de preços
     * 
     * @param string $id ID da tabela de preços
     */
    public function ativar($id) {
        // Buscar tabela de preços
        $stmt = $this->pdo->prepare("
            SELECT * FROM tabelas_precos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $tabela = $stmt->fetch();
        
        if (!$tabela) {
            Response::notFound('Tabela de preços não encontrada');
        }
        
        // Verificar se a tabela já está ativa
        if ($tabela['ativo']) {
            Response::error('Esta tabela de preços já está ativa', 400);
        }
        
        // Iniciar transação
        $this->pdo->beginTransaction();
        
        try {
            // Desativar todas as tabelas de preços
            $stmt = $this->pdo->prepare("
                UPDATE tabelas_precos
                SET ativo = false,
                    data_atualizacao = NOW()
                WHERE empresa_id = :empresa_id
            ");
            
            $stmt->execute(['empresa_id' => $this->empresaId]);
            
            // Ativar a tabela de preços selecionada
            $stmt = $this->pdo->prepare("
                UPDATE tabelas_precos
                SET ativo = true,
                    data_atualizacao = NOW()
                WHERE id = :id
            ");
            
            $stmt->execute(['id' => $id]);
            
            // Registrar log
            $stmt = $this->pdo->prepare("
                INSERT INTO logs (
                    usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, dados_novos, ip, data_hora
                ) VALUES (
                    :usuario_id, :empresa_id, 'ativacao', 'tabelas_precos', :registro_id, :dados_antigos, :dados_novos, :ip, NOW()
                )
            ");
            
            $stmt->execute([
                'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
                'empresa_id' => $this->empresaId,
                'registro_id' => $id,
                'dados_antigos' => json_encode(['ativo' => false]),
                'dados_novos' => json_encode(['ativo' => true]),
                'ip' => $this->request->getIp()
            ]);
            
            // Confirmar transação
            $this->pdo->commit();
            
            // Buscar tabela de preços atualizada
            $stmt = $this->pdo->prepare("
                SELECT id, empresa_id, nome, descricao, valor_primeira_hora, valor_hora_adicional,
                       valor_diaria, valor_mensalidade, ativo, data_criacao, data_atualizacao
                FROM tabelas_precos
                WHERE id = :id
            ");
            
            $stmt->execute(['id' => $id]);
            $tabelaAtualizada = $stmt->fetch();
            
            // Formatar datas
            $tabelaAtualizada['data_criacao'] = strtotime($tabelaAtualizada['data_criacao']) * 1000;
            $tabelaAtualizada['data_atualizacao'] = strtotime($tabelaAtualizada['data_atualizacao']) * 1000;
            
            // Retornar resposta
            Response::success($tabelaAtualizada, 'Tabela de preços ativada com sucesso');
        } catch (Exception $e) {
            // Cancelar transação
            $this->pdo->rollback();
            
            // Registrar erro
            $this->logger->error('Erro ao ativar tabela de preços', [
                'erro' => $e->getMessage(),
                'tabela_id' => $id
            ]);
            
            // Retornar erro
            Response::serverError('Erro ao ativar tabela de preços: ' . $e->getMessage());
        }
    }
}
