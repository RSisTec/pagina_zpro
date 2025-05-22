<?php
/**
 * Controlador de usuários
 */
class UsuarioController {
    private $pdo;
    private $auth;
    private $request;
    private $logger;
    private $payload;
    
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
        
        // Verificar permissão
        if ($payload['tipo'] === 'usuario' && $payload['nivel'] !== 'admin') {
            Response::forbidden('Acesso permitido apenas para administradores');
        }
        
        $this->payload = $payload;
    }
    
    /**
     * Listar usuários
     */
    public function index() {
        // Definir empresa_id com base no tipo de usuário
        $empresaId = null;
        
        if ($this->payload['tipo'] === 'usuario') {
            $empresaId = $this->payload['empresa_id'];
        } else if ($this->payload['tipo'] === 'superadmin' && isset($this->request->getParams()['empresa_id'])) {
            $empresaId = $this->request->getParams()['empresa_id'];
        }
        
        if (!$empresaId) {
            Response::error('ID da empresa é obrigatório', 400);
        }
        
        // Buscar usuários
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, email, login, nivel, data_criacao, ultimo_login
            FROM usuarios
            WHERE empresa_id = :empresa_id
            ORDER BY nome ASC
        ");
        
        $stmt->execute(['empresa_id' => $empresaId]);
        $usuarios = $stmt->fetchAll();
        
        // Formatar datas
        foreach ($usuarios as &$usuario) {
            $usuario['data_criacao'] = $usuario['data_criacao'] ? strtotime($usuario['data_criacao']) * 1000 : null;
            $usuario['ultimo_login'] = $usuario['ultimo_login'] ? strtotime($usuario['ultimo_login']) * 1000 : null;
        }
        
        // Retornar resposta
        Response::success($usuarios);
    }
    
    /**
     * Obter detalhes de um usuário
     * 
     * @param string $id ID do usuário
     */
    public function show($id) {
        // Buscar usuário
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, email, login, nivel, data_criacao, ultimo_login
            FROM usuarios
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            Response::notFound('Usuário não encontrado');
        }
        
        // Verificar permissão
        if ($this->payload['tipo'] === 'usuario' && $usuario['empresa_id'] !== $this->payload['empresa_id']) {
            Response::forbidden('Acesso negado a este usuário');
        }
        
        // Formatar datas
        $usuario['data_criacao'] = $usuario['data_criacao'] ? strtotime($usuario['data_criacao']) * 1000 : null;
        $usuario['ultimo_login'] = $usuario['ultimo_login'] ? strtotime($usuario['ultimo_login']) * 1000 : null;
        
        // Retornar resposta
        Response::success($usuario);
    }
    
    /**
     * Cadastrar usuário
     */
    public function store() {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['nome']) || empty($params['nome'])) {
            Response::error('Nome é obrigatório', 400);
        }
        
        if (!isset($params['email']) || empty($params['email'])) {
            Response::error('Email é obrigatório', 400);
        }
        
        if (!isset($params['login']) || empty($params['login'])) {
            Response::error('Login é obrigatório', 400);
        }
        
        if (!isset($params['senha']) || empty($params['senha'])) {
            Response::error('Senha é obrigatória', 400);
        }
        
        if (!isset($params['nivel']) || empty($params['nivel'])) {
            Response::error('Nível é obrigatório', 400);
        }
        
        // Validar nível
        $niveisValidos = ['admin', 'operador', 'visualizador'];
        if (!in_array($params['nivel'], $niveisValidos)) {
            Response::error('Nível inválido', 400);
        }
        
        // Definir empresa_id com base no tipo de usuário
        $empresaId = null;
        
        if ($this->payload['tipo'] === 'usuario') {
            $empresaId = $this->payload['empresa_id'];
        } else if ($this->payload['tipo'] === 'superadmin' && isset($params['empresa_id'])) {
            $empresaId = $params['empresa_id'];
        }
        
        if (!$empresaId) {
            Response::error('ID da empresa é obrigatório', 400);
        }
        
        // Verificar se já existe usuário com o mesmo login na empresa
        $stmt = $this->pdo->prepare("
            SELECT id FROM usuarios
            WHERE login = :login AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'login' => $params['login'],
            'empresa_id' => $empresaId
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um usuário com este login nesta empresa', 400);
        }
        
        // Verificar se já existe usuário com o mesmo email na empresa
        $stmt = $this->pdo->prepare("
            SELECT id FROM usuarios
            WHERE email = :email AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'email' => $params['email'],
            'empresa_id' => $empresaId
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um usuário com este email nesta empresa', 400);
        }
        
        // Gerar ID do usuário
        $id = 'usr_' . uniqid();
        
        // Inserir usuário
        $stmt = $this->pdo->prepare("
            INSERT INTO usuarios (
                id, empresa_id, nome, email, login, senha, nivel, data_criacao, data_atualizacao
            ) VALUES (
                :id, :empresa_id, :nome, :email, :login, :senha, :nivel, NOW(), NOW()
            )
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $empresaId,
            'nome' => $params['nome'],
            'email' => $params['email'],
            'login' => $params['login'],
            'senha' => $params['senha'], // Em produção, usar password_hash
            'nivel' => $params['nivel']
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, superadmin_id, empresa_id, acao, tabela, registro_id, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :superadmin_id, :empresa_id, 'cadastro', 'usuarios', :registro_id, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'superadmin_id' => $this->payload['tipo'] === 'superadmin' ? $this->payload['id'] : null,
            'empresa_id' => $empresaId,
            'registro_id' => $id,
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar usuário cadastrado
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, email, login, nivel, data_criacao
            FROM usuarios
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $usuario = $stmt->fetch();
        
        // Formatar datas
        $usuario['data_criacao'] = $usuario['data_criacao'] ? strtotime($usuario['data_criacao']) * 1000 : null;
        
        // Retornar resposta
        Response::success($usuario, 'Usuário cadastrado com sucesso', 201);
    }
    
    /**
     * Atualizar usuário
     * 
     * @param string $id ID do usuário
     */
    public function update($id) {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['nome']) || empty($params['nome'])) {
            Response::error('Nome é obrigatório', 400);
        }
        
        if (!isset($params['email']) || empty($params['email'])) {
            Response::error('Email é obrigatório', 400);
        }
        
        if (!isset($params['nivel']) || empty($params['nivel'])) {
            Response::error('Nível é obrigatório', 400);
        }
        
        // Validar nível
        $niveisValidos = ['admin', 'operador', 'visualizador'];
        if (!in_array($params['nivel'], $niveisValidos)) {
            Response::error('Nível inválido', 400);
        }
        
        // Buscar usuário
        $stmt = $this->pdo->prepare("
            SELECT * FROM usuarios
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            Response::notFound('Usuário não encontrado');
        }
        
        // Verificar permissão
        if ($this->payload['tipo'] === 'usuario' && $usuario['empresa_id'] !== $this->payload['empresa_id']) {
            Response::forbidden('Acesso negado a este usuário');
        }
        
        // Verificar se está tentando rebaixar o último administrador
        if ($usuario['nivel'] === 'admin' && $params['nivel'] !== 'admin') {
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total
                FROM usuarios
                WHERE empresa_id = :empresa_id AND nivel = 'admin' AND id != :id
            ");
            
            $stmt->execute([
                'empresa_id' => $usuario['empresa_id'],
                'id' => $id
            ]);
            
            $result = $stmt->fetch();
            
            if ($result['total'] === 0) {
                Response::error('Não é possível rebaixar o último administrador', 400);
            }
        }
        
        // Verificar se já existe usuário com o mesmo email na empresa
        $stmt = $this->pdo->prepare("
            SELECT id FROM usuarios
            WHERE email = :email AND empresa_id = :empresa_id AND id != :id
        ");
        
        $stmt->execute([
            'email' => $params['email'],
            'empresa_id' => $usuario['empresa_id'],
            'id' => $id
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um usuário com este email nesta empresa', 400);
        }
        
        // Preparar dados para atualização
        $updateData = [
            'id' => $id,
            'nome' => $params['nome'],
            'email' => $params['email'],
            'nivel' => $params['nivel']
        ];
        
        // Verificar se a senha foi fornecida
        if (isset($params['senha']) && !empty($params['senha'])) {
            $updateData['senha'] = $params['senha']; // Em produção, usar password_hash
        }
        
        // Construir consulta SQL
        $sql = "
            UPDATE usuarios
            SET nome = :nome,
                email = :email,
                nivel = :nivel,
                data_atualizacao = NOW()
        ";
        
        if (isset($updateData['senha'])) {
            $sql .= ", senha = :senha";
        }
        
        $sql .= " WHERE id = :id";
        
        // Atualizar usuário
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($updateData);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, superadmin_id, empresa_id, acao, tabela, registro_id, dados_antigos, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :superadmin_id, :empresa_id, 'atualizacao', 'usuarios', :registro_id, :dados_antigos, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'superadmin_id' => $this->payload['tipo'] === 'superadmin' ? $this->payload['id'] : null,
            'empresa_id' => $usuario['empresa_id'],
            'registro_id' => $id,
            'dados_antigos' => json_encode($usuario),
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar usuário atualizado
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, email, login, nivel, data_criacao, data_atualizacao, ultimo_login
            FROM usuarios
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $usuarioAtualizado = $stmt->fetch();
        
        // Formatar datas
        $usuarioAtualizado['data_criacao'] = $usuarioAtualizado['data_criacao'] ? strtotime($usuarioAtualizado['data_criacao']) * 1000 : null;
        $usuarioAtualizado['data_atualizacao'] = $usuarioAtualizado['data_atualizacao'] ? strtotime($usuarioAtualizado['data_atualizacao']) * 1000 : null;
        $usuarioAtualizado['ultimo_login'] = $usuarioAtualizado['ultimo_login'] ? strtotime($usuarioAtualizado['ultimo_login']) * 1000 : null;
        
        // Retornar resposta
        Response::success($usuarioAtualizado, 'Usuário atualizado com sucesso');
    }
    
    /**
     * Excluir usuário
     * 
     * @param string $id ID do usuário
     */
    public function destroy($id) {
        // Buscar usuário
        $stmt = $this->pdo->prepare("
            SELECT * FROM usuarios
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $usuario = $stmt->fetch();
        
        if (!$usuario) {
            Response::notFound('Usuário não encontrado');
        }
        
        // Verificar permissão
        if ($this->payload['tipo'] === 'usuario' && $usuario['empresa_id'] !== $this->payload['empresa_id']) {
            Response::forbidden('Acesso negado a este usuário');
        }
        
        // Verificar se está tentando excluir o próprio usuário
        if ($this->payload['tipo'] === 'usuario' && $this->payload['id'] === $id) {
            Response::error('Não é possível excluir o próprio usuário', 400);
        }
        
        // Verificar se está tentando excluir o último administrador
        if ($usuario['nivel'] === 'admin') {
            $stmt = $this->pdo->prepare("
                SELECT COUNT(*) as total
                FROM usuarios
                WHERE empresa_id = :empresa_id AND nivel = 'admin' AND id != :id
            ");
            
            $stmt->execute([
                'empresa_id' => $usuario['empresa_id'],
                'id' => $id
            ]);
            
            $result = $stmt->fetch();
            
            if ($result['total'] === 0) {
                Response::error('Não é possível excluir o último administrador', 400);
            }
        }
        
        // Excluir usuário
        $stmt = $this->pdo->prepare("
            DELETE FROM usuarios
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, superadmin_id, empresa_id, acao, tabela, registro_id, dados_antigos, ip, data_hora
            ) VALUES (
                :usuario_id, :superadmin_id, :empresa_id, 'exclusao', 'usuarios', :registro_id, :dados_antigos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'superadmin_id' => $this->payload['tipo'] === 'superadmin' ? $this->payload['id'] : null,
            'empresa_id' => $usuario['empresa_id'],
            'registro_id' => $id,
            'dados_antigos' => json_encode($usuario),
            'ip' => $this->request->getIp()
        ]);
        
        // Retornar resposta
        Response::success(null, 'Usuário excluído com sucesso');
    }
}
