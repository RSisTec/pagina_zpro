<?php
/**
 * Controlador de autenticação
 */
class AuthController {
    private $pdo;
    private $auth;
    private $request;
    private $logger;
    private $config;
    
    /**
     * Construtor
     */
    public function __construct() {
        global $pdo, $auth, $request, $logger, $config;
        
        $this->pdo = $pdo;
        $this->auth = $auth;
        $this->request = $request;
        $this->logger = $logger;
        $this->config = $config;
    }
    
    /**
     * Login de usuário
     */
    public function login() {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['login']) || !isset($params['senha'])) {
            Response::error('Login e senha são obrigatórios', 400);
        }
        
        // Autenticar usuário
        $user = $this->auth->authenticateUser($params['login'], $params['senha']);
        
        if (!$user) {
            $this->logger->warning('Tentativa de login inválida', [
                'login' => $params['login'],
                'ip' => $this->request->getIp()
            ]);
            
            Response::unauthorized('Credenciais inválidas');
        }
        
        // Registrar login
        $this->auth->registerUserLogin(
            $user['id'],
            $this->request->getIp(),
            $this->request->getUserAgent()
        );
        
        // Gerar token
        $token = $this->auth->generateToken([
            'id' => $user['id'],
            'empresa_id' => $user['empresa_id'],
            'nivel' => $user['nivel'],
            'tipo' => 'usuario'
        ]);
        
        // Buscar dados da empresa
        $stmt = $this->pdo->prepare("
            SELECT nome
            FROM empresas
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $user['empresa_id']]);
        $empresa = $stmt->fetch();
        
        // Retornar resposta
        Response::success([
            'token' => $token,
            'user' => [
                'id' => $user['id'],
                'nome' => $user['nome'],
                'email' => $user['email'],
                'login' => $user['login'],
                'nivel' => $user['nivel'],
                'empresa_id' => $user['empresa_id'],
                'empresa' => $empresa['nome']
            ]
        ]);
    }
    
    /**
     * Login de superadmin
     */
    public function loginSuperadmin() {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['login']) || !isset($params['senha'])) {
            Response::error('Login e senha são obrigatórios', 400);
        }
        
        // Autenticar superadmin
        $superadmin = $this->auth->authenticateSuperadmin($params['login'], $params['senha']);
        
        if (!$superadmin) {
            $this->logger->warning('Tentativa de login de superadmin inválida', [
                'login' => $params['login'],
                'ip' => $this->request->getIp()
            ]);
            
            Response::unauthorized('Credenciais inválidas');
        }
        
        // Registrar login
        $this->auth->registerSuperadminLogin(
            $superadmin['id'],
            $this->request->getIp(),
            $this->request->getUserAgent()
        );
        
        // Gerar token
        $token = $this->auth->generateToken([
            'id' => $superadmin['id'],
            'tipo' => 'superadmin'
        ]);
        
        // Retornar resposta
        Response::success([
            'token' => $token,
            'user' => [
                'id' => $superadmin['id'],
                'nome' => $superadmin['nome'],
                'email' => $superadmin['email'],
                'login' => $superadmin['login']
            ]
        ]);
    }
    
    /**
     * Verificar sessão atual
     */
    public function verify() {
        // Obter token
        $token = $this->request->getAuthToken();
        
        if (!$token) {
            Response::unauthorized('Token não fornecido');
        }
        
        // Validar token
        $payload = $this->auth->validateToken($token);
        
        if (!$payload) {
            Response::unauthorized('Token inválido ou expirado');
        }
        
        // Verificar tipo de usuário
        if ($payload['tipo'] === 'superadmin') {
            // Buscar dados do superadmin
            $stmt = $this->pdo->prepare("
                SELECT id, nome, email, login
                FROM superadmins
                WHERE id = :id
            ");
            
            $stmt->execute(['id' => $payload['id']]);
            $superadmin = $stmt->fetch();
            
            if (!$superadmin) {
                Response::unauthorized('Superadmin não encontrado');
            }
            
            // Retornar resposta
            Response::success([
                'user' => [
                    'id' => $superadmin['id'],
                    'nome' => $superadmin['nome'],
                    'email' => $superadmin['email'],
                    'login' => $superadmin['login'],
                    'tipo' => 'superadmin'
                ]
            ]);
        } else {
            // Buscar dados do usuário
            $stmt = $this->pdo->prepare("
                SELECT u.id, u.empresa_id, u.nome, u.email, u.login, u.nivel, e.nome as empresa_nome
                FROM usuarios u
                JOIN empresas e ON u.empresa_id = e.id
                WHERE u.id = :id
            ");
            
            $stmt->execute(['id' => $payload['id']]);
            $user = $stmt->fetch();
            
            if (!$user) {
                Response::unauthorized('Usuário não encontrado');
            }
            
            // Verificar se a empresa está ativa
            $stmt = $this->pdo->prepare("
                SELECT status, data_fim_licenca
                FROM empresas
                WHERE id = :id
            ");
            
            $stmt->execute(['id' => $user['empresa_id']]);
            $empresa = $stmt->fetch();
            
            if (!$empresa || !$empresa['status']) {
                Response::unauthorized('Empresa inativa');
            }
            
            // Verificar se a licença está válida
            $dataFimLicenca = strtotime($empresa['data_fim_licenca']);
            if ($dataFimLicenca < time()) {
                Response::unauthorized('Licença expirada');
            }
            
            // Retornar resposta
            Response::success([
                'user' => [
                    'id' => $user['id'],
                    'nome' => $user['nome'],
                    'email' => $user['email'],
                    'login' => $user['login'],
                    'nivel' => $user['nivel'],
                    'empresa_id' => $user['empresa_id'],
                    'empresa' => $user['empresa_nome'],
                    'tipo' => 'usuario',
                    'superadmin_access' => isset($payload['superadmin_access']) && $payload['superadmin_access']
                ]
            ]);
        }
    }
    
    /**
     * Encerrar sessão
     */
    public function logout() {
        // Não é necessário fazer nada no servidor, pois o token é stateless
        // O cliente deve descartar o token
        
        Response::success(null, 'Logout realizado com sucesso');
    }
}
