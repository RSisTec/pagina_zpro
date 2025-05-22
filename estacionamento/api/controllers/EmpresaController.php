<?php
/**
 * Controlador de empresas
 */
class EmpresaController {
    private $pdo;
    private $auth;
    private $request;
    private $logger;
    
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
        
        // Verificar se é superadmin
        if ($payload['tipo'] !== 'superadmin') {
            Response::forbidden('Acesso permitido apenas para superadmins');
        }
        
        $this->payload = $payload;
    }
    
    /**
     * Listar empresas
     */
    public function index() {
        // Obter parâmetros de filtro
        $params = $this->request->getParams();
        
        // Construir consulta SQL
        $sql = "
            SELECT id, nome, cnpj, telefone, email, endereco, responsavel, logo,
                   data_inicio_licenca, data_fim_licenca, status, data_criacao
            FROM empresas
            WHERE 1=1
        ";
        
        $sqlParams = [];
        
        // Aplicar filtros
        if (isset($params['status']) && $params['status'] !== 'todos') {
            $status = $params['status'] === 'ativo' ? true : false;
            $sql .= " AND status = :status";
            $sqlParams['status'] = $status;
        }
        
        if (isset($params['licenca']) && $params['licenca'] !== 'todas') {
            $hoje = date('Y-m-d');
            
            if ($params['licenca'] === 'vigente') {
                $sql .= " AND data_fim_licenca > :hoje";
                $sqlParams['hoje'] = $hoje;
            } else if ($params['licenca'] === 'vencendo') {
                $trintaDias = date('Y-m-d', strtotime('+30 days'));
                $sql .= " AND data_fim_licenca > :hoje AND data_fim_licenca <= :trinta_dias";
                $sqlParams['hoje'] = $hoje;
                $sqlParams['trinta_dias'] = $trintaDias;
            } else if ($params['licenca'] === 'vencida') {
                $sql .= " AND data_fim_licenca <= :hoje";
                $sqlParams['hoje'] = $hoje;
            }
        }
        
        if (isset($params['busca']) && !empty($params['busca'])) {
            $busca = '%' . $params['busca'] . '%';
            $sql .= " AND (nome ILIKE :busca OR cnpj ILIKE :busca OR email ILIKE :busca OR responsavel ILIKE :busca)";
            $sqlParams['busca'] = $busca;
        }
        
        // Ordenação
        $sql .= " ORDER BY status DESC, nome ASC";
        
        // Executar consulta
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($sqlParams);
        $empresas = $stmt->fetchAll();
        
        // Formatar datas
        foreach ($empresas as &$empresa) {
            $empresa['data_inicio_licenca'] = strtotime($empresa['data_inicio_licenca']) * 1000;
            $empresa['data_fim_licenca'] = strtotime($empresa['data_fim_licenca']) * 1000;
            $empresa['data_criacao'] = strtotime($empresa['data_criacao']) * 1000;
        }
        
        // Retornar resposta
        Response::success($empresas);
    }
    
    /**
     * Obter detalhes de uma empresa
     * 
     * @param string $id ID da empresa
     */
    public function show($id) {
        // Buscar empresa
        $stmt = $this->pdo->prepare("
            SELECT id, nome, cnpj, telefone, email, endereco, responsavel, logo,
                   data_inicio_licenca, data_fim_licenca, status, data_criacao
            FROM empresas
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $empresa = $stmt->fetch();
        
        if (!$empresa) {
            Response::notFound('Empresa não encontrada');
        }
        
        // Formatar datas
        $empresa['data_inicio_licenca'] = strtotime($empresa['data_inicio_licenca']) * 1000;
        $empresa['data_fim_licenca'] = strtotime($empresa['data_fim_licenca']) * 1000;
        $empresa['data_criacao'] = strtotime($empresa['data_criacao']) * 1000;
        
        // Buscar estatísticas da empresa
        $stmt = $this->pdo->prepare("
            SELECT 
                (SELECT COUNT(*) FROM usuarios WHERE empresa_id = :id) AS total_usuarios,
                (SELECT COUNT(*) FROM veiculos WHERE empresa_id = :id) AS total_veiculos,
                (SELECT COUNT(*) FROM veiculos WHERE empresa_id = :id AND status = 'no-patio') AS veiculos_no_patio,
                (SELECT COUNT(*) FROM mensalistas WHERE empresa_id = :id) AS total_mensalistas,
                (SELECT COUNT(*) FROM isentos WHERE empresa_id = :id) AS total_isentos,
                (SELECT COUNT(*) FROM servicos WHERE empresa_id = :id) AS total_servicos
        ");
        
        $stmt->execute(['id' => $id]);
        $estatisticas = $stmt->fetch();
        
        // Adicionar estatísticas à empresa
        $empresa['estatisticas'] = $estatisticas;
        
        // Retornar resposta
        Response::success($empresa);
    }
    
    /**
     * Cadastrar empresa
     */
    public function store() {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros da empresa
        if (!isset($params['empresa']) || !is_array($params['empresa'])) {
            Response::error('Dados da empresa são obrigatórios', 400);
        }
        
        $empresa = $params['empresa'];
        
        if (!isset($empresa['nome']) || empty($empresa['nome'])) {
            Response::error('Nome da empresa é obrigatório', 400);
        }
        
        if (!isset($empresa['cnpj']) || empty($empresa['cnpj'])) {
            Response::error('CNPJ da empresa é obrigatório', 400);
        }
        
        if (!isset($empresa['telefone']) || empty($empresa['telefone'])) {
            Response::error('Telefone da empresa é obrigatório', 400);
        }
        
        if (!isset($empresa['email']) || empty($empresa['email'])) {
            Response::error('Email da empresa é obrigatório', 400);
        }
        
        if (!isset($empresa['endereco']) || empty($empresa['endereco'])) {
            Response::error('Endereço da empresa é obrigatório', 400);
        }
        
        if (!isset($empresa['responsavel']) || empty($empresa['responsavel'])) {
            Response::error('Responsável da empresa é obrigatório', 400);
        }
        
        if (!isset($empresa['dataInicioLicenca']) || empty($empresa['dataInicioLicenca'])) {
            Response::error('Data de início da licença é obrigatória', 400);
        }
        
        if (!isset($empresa['dataFimLicenca']) || empty($empresa['dataFimLicenca'])) {
            Response::error('Data de fim da licença é obrigatória', 400);
        }
        
        // Validar parâmetros do administrador
        if (!isset($params['admin']) || !is_array($params['admin'])) {
            Response::error('Dados do administrador são obrigatórios', 400);
        }
        
        $admin = $params['admin'];
        
        if (!isset($admin['nome']) || empty($admin['nome'])) {
            Response::error('Nome do administrador é obrigatório', 400);
        }
        
        if (!isset($admin['email']) || empty($admin['email'])) {
            Response::error('Email do administrador é obrigatório', 400);
        }
        
        if (!isset($admin['login']) || empty($admin['login'])) {
            Response::error('Login do administrador é obrigatório', 400);
        }
        
        if (!isset($admin['senha']) || empty($admin['senha'])) {
            Response::error('Senha do administrador é obrigatória', 400);
        }
        
        // Verificar se já existe empresa com o mesmo CNPJ
        $stmt = $this->pdo->prepare("
            SELECT id FROM empresas WHERE cnpj = :cnpj
        ");
        
        $stmt->execute(['cnpj' => $empresa['cnpj']]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe uma empresa com este CNPJ', 400);
        }
        
        // Verificar se já existe empresa com o mesmo email
        $stmt = $this->pdo->prepare("
            SELECT id FROM empresas WHERE email = :email
        ");
        
        $stmt->execute(['email' => $empresa['email']]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe uma empresa com este email', 400);
        }
        
        // Verificar se já existe usuário com o mesmo login
        $stmt = $this->pdo->prepare("
            SELECT id FROM usuarios WHERE login = :login
        ");
        
        $stmt->execute(['login' => $admin['login']]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um usuário com este login', 400);
        }
        
        // Verificar se já existe usuário com o mesmo email
        $stmt = $this->pdo->prepare("
            SELECT id FROM usuarios WHERE email = :email
        ");
        
        $stmt->execute(['email' => $admin['email']]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um usuário com este email', 400);
        }
        
        // Iniciar transação
        $this->pdo->beginTransaction();
        
        try {
            // Gerar ID da empresa
            $empresaId = 'emp_' . uniqid();
            
            // Formatar datas
            $dataInicioLicenca = date('Y-m-d', $empresa['dataInicioLicenca'] / 1000);
            $dataFimLicenca = date('Y-m-d', $empresa['dataFimLicenca'] / 1000);
            
            // Inserir empresa
            $stmt = $this->pdo->prepare("
                INSERT INTO empresas (
                    id, nome, cnpj, telefone, email, endereco, responsavel, logo,
                    data_inicio_licenca, data_fim_licenca, status, data_criacao
                ) VALUES (
                    :id, :nome, :cnpj, :telefone, :email, :endereco, :responsavel, :logo,
                    :data_inicio_licenca, :data_fim_licenca, :status, NOW()
                )
            ");
            
            $stmt->execute([
                'id' => $empresaId,
                'nome' => $empresa['nome'],
                'cnpj' => $empresa['cnpj'],
                'telefone' => $empresa['telefone'],
                'email' => $empresa['email'],
                'endereco' => $empresa['endereco'],
                'responsavel' => $empresa['responsavel'],
                'logo' => $empresa['logo'] ?? '',
                'data_inicio_licenca' => $dataInicioLicenca,
                'data_fim_licenca' => $dataFimLicenca,
                'status' => isset($empresa['status']) ? $empresa['status'] : true
            ]);
            
            // Gerar ID do administrador
            $adminId = 'usr_' . uniqid();
            
            // Inserir administrador
            $stmt = $this->pdo->prepare("
                INSERT INTO usuarios (
                    id, empresa_id, nome, email, login, senha, nivel, data_criacao, data_atualizacao
                ) VALUES (
                    :id, :empresa_id, :nome, :email, :login, :senha, 'admin', NOW(), NOW()
                )
            ");
            
            $stmt->execute([
                'id' => $adminId,
                'empresa_id' => $empresaId,
                'nome' => $admin['nome'],
                'email' => $admin['email'],
                'login' => $admin['login'],
                'senha' => $admin['senha'] // Em produção, usar password_hash
            ]);
            
            // Criar tabela de preços padrão
            $precoId = 'prc_' . uniqid();
            
            $stmt = $this->pdo->prepare("
                INSERT INTO tabelas_precos (
                    id, empresa_id, nome, descricao, valor_primeira_hora, valor_hora_adicional,
                    valor_diaria, valor_mensalidade, ativo, data_criacao
                ) VALUES (
                    :id, :empresa_id, 'Tabela Padrão', 'Tabela de preços padrão',
                    10.00, 5.00, 30.00, 300.00, true, NOW()
                )
            ");
            
            $stmt->execute([
                'id' => $precoId,
                'empresa_id' => $empresaId
            ]);
            
            // Registrar log
            $stmt = $this->pdo->prepare("
                INSERT INTO logs (
                    superadmin_id, acao, tabela, registro_id, dados_novos, ip, data_hora
                ) VALUES (
                    :superadmin_id, 'cadastro', 'empresas', :registro_id, :dados_novos, :ip, NOW()
                )
            ");
            
            $stmt->execute([
                'superadmin_id' => $this->payload['id'],
                'registro_id' => $empresaId,
                'dados_novos' => json_encode($empresa),
                'ip' => $this->request->getIp()
            ]);
            
            // Confirmar transação
            $this->pdo->commit();
            
            // Buscar empresa cadastrada
            $stmt = $this->pdo->prepare("
                SELECT id, nome, cnpj, telefone, email, endereco, responsavel, logo,
                       data_inicio_licenca, data_fim_licenca, status, data_criacao
                FROM empresas
                WHERE id = :id
            ");
            
            $stmt->execute(['id' => $empresaId]);
            $empresaCadastrada = $stmt->fetch();
            
            // Formatar datas
            $empresaCadastrada['data_inicio_licenca'] = strtotime($empresaCadastrada['data_inicio_licenca']) * 1000;
            $empresaCadastrada['data_fim_licenca'] = strtotime($empresaCadastrada['data_fim_licenca']) * 1000;
            $empresaCadastrada['data_criacao'] = strtotime($empresaCadastrada['data_criacao']) * 1000;
            
            // Retornar resposta
            Response::success($empresaCadastrada, 'Empresa cadastrada com sucesso', 201);
        } catch (Exception $e) {
            // Cancelar transação
            $this->pdo->rollback();
            
            // Registrar erro
            $this->logger->error('Erro ao cadastrar empresa', [
                'erro' => $e->getMessage(),
                'empresa' => $empresa,
                'admin' => $admin
            ]);
            
            // Retornar erro
            Response::serverError('Erro ao cadastrar empresa: ' . $e->getMessage());
        }
    }
    
    /**
     * Atualizar empresa
     * 
     * @param string $id ID da empresa
     */
    public function update($id) {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['nome']) || empty($params['nome'])) {
            Response::error('Nome da empresa é obrigatório', 400);
        }
        
        if (!isset($params['cnpj']) || empty($params['cnpj'])) {
            Response::error('CNPJ da empresa é obrigatório', 400);
        }
        
        if (!isset($params['telefone']) || empty($params['telefone'])) {
            Response::error('Telefone da empresa é obrigatório', 400);
        }
        
        if (!isset($params['email']) || empty($params['email'])) {
            Response::error('Email da empresa é obrigatório', 400);
        }
        
        if (!isset($params['endereco']) || empty($params['endereco'])) {
            Response::error('Endereço da empresa é obrigatório', 400);
        }
        
        if (!isset($params['responsavel']) || empty($params['responsavel'])) {
            Response::error('Responsável da empresa é obrigatório', 400);
        }
        
        if (!isset($params['dataInicioLicenca']) || empty($params['dataInicioLicenca'])) {
            Response::error('Data de início da licença é obrigatória', 400);
        }
        
        if (!isset($params['dataFimLicenca']) || empty($params['dataFimLicenca'])) {
            Response::error('Data de fim da licença é obrigatória', 400);
        }
        
        // Verificar se a empresa existe
        $stmt = $this->pdo->prepare("
            SELECT id FROM empresas WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        
        if ($stmt->rowCount() === 0) {
            Response::notFound('Empresa não encontrada');
        }
        
        // Verificar se já existe empresa com o mesmo CNPJ
        $stmt = $this->pdo->prepare("
            SELECT id FROM empresas WHERE cnpj = :cnpj AND id != :id
        ");
        
        $stmt->execute([
            'cnpj' => $params['cnpj'],
            'id' => $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe uma empresa com este CNPJ', 400);
        }
        
        // Verificar se já existe empresa com o mesmo email
        $stmt = $this->pdo->prepare("
            SELECT id FROM empresas WHERE email = :email AND id != :id
        ");
        
        $stmt->execute([
            'email' => $params['email'],
            'id' => $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe uma empresa com este email', 400);
        }
        
        // Buscar dados atuais da empresa
        $stmt = $this->pdo->prepare("
            SELECT * FROM empresas WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $empresaAtual = $stmt->fetch();
        
        // Formatar datas
        $dataInicioLicenca = date('Y-m-d', $params['dataInicioLicenca'] / 1000);
        $dataFimLicenca = date('Y-m-d', $params['dataFimLicenca'] / 1000);
        
        // Atualizar empresa
        $stmt = $this->pdo->prepare("
            UPDATE empresas
            SET nome = :nome,
                cnpj = :cnpj,
                telefone = :telefone,
                email = :email,
                endereco = :endereco,
                responsavel = :responsavel,
                logo = :logo,
                data_inicio_licenca = :data_inicio_licenca,
                data_fim_licenca = :data_fim_licenca,
                status = :status
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'nome' => $params['nome'],
            'cnpj' => $params['cnpj'],
            'telefone' => $params['telefone'],
            'email' => $params['email'],
            'endereco' => $params['endereco'],
            'responsavel' => $params['responsavel'],
            'logo' => $params['logo'] ?? $empresaAtual['logo'],
            'data_inicio_licenca' => $dataInicioLicenca,
            'data_fim_licenca' => $dataFimLicenca,
            'status' => isset($params['status']) ? $params['status'] : $empresaAtual['status']
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                superadmin_id, acao, tabela, registro_id, dados_antigos, dados_novos, ip, data_hora
            ) VALUES (
                :superadmin_id, 'atualizacao', 'empresas', :registro_id, :dados_antigos, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'superadmin_id' => $this->payload['id'],
            'registro_id' => $id,
            'dados_antigos' => json_encode($empresaAtual),
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar empresa atualizada
        $stmt = $this->pdo->prepare("
            SELECT id, nome, cnpj, telefone, email, endereco, responsavel, logo,
                   data_inicio_licenca, data_fim_licenca, status, data_criacao
            FROM empresas
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $empresaAtualizada = $stmt->fetch();
        
        // Formatar datas
        $empresaAtualizada['data_inicio_licenca'] = strtotime($empresaAtualizada['data_inicio_licenca']) * 1000;
        $empresaAtualizada['data_fim_licenca'] = strtotime($empresaAtualizada['data_fim_licenca']) * 1000;
        $empresaAtualizada['data_criacao'] = strtotime($empresaAtualizada['data_criacao']) * 1000;
        
        // Retornar resposta
        Response::success($empresaAtualizada, 'Empresa atualizada com sucesso');
    }
    
    /**
     * Atualizar status da empresa
     * 
     * @param string $id ID da empresa
     */
    public function updateStatus($id) {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['status'])) {
            Response::error('Status é obrigatório', 400);
        }
        
        // Verificar se a empresa existe
        $stmt = $this->pdo->prepare("
            SELECT id, status FROM empresas WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $empresa = $stmt->fetch();
        
        if (!$empresa) {
            Response::notFound('Empresa não encontrada');
        }
        
        // Atualizar status
        $stmt = $this->pdo->prepare("
            UPDATE empresas
            SET status = :status
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'status' => $params['status']
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                superadmin_id, acao, tabela, registro_id, dados_antigos, dados_novos, ip, data_hora
            ) VALUES (
                :superadmin_id, 'atualizacao_status', 'empresas', :registro_id, :dados_antigos, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'superadmin_id' => $this->payload['id'],
            'registro_id' => $id,
            'dados_antigos' => json_encode(['status' => $empresa['status']]),
            'dados_novos' => json_encode(['status' => $params['status']]),
            'ip' => $this->request->getIp()
        ]);
        
        // Retornar resposta
        Response::success([
            'id' => $id,
            'status' => $params['status']
        ], 'Status da empresa atualizado com sucesso');
    }
}
