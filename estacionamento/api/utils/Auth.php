<?php
/**
 * Classe para autenticação e autorização
 */
class Auth {
    private $pdo;
    private $config;
    
    /**
     * Construtor
     * 
     * @param PDO $pdo Conexão com o banco de dados
     * @param array $config Configurações da aplicação
     */
    public function __construct($pdo, $config) {
        $this->pdo = $pdo;
        $this->config = $config;
    }
    
    /**
     * Gera um token JWT
     * 
     * @param array $payload Dados a serem incluídos no token
     * @return string Token JWT
     */
    public function generateToken($payload) {
        $header = json_encode([
            'typ' => 'JWT',
            'alg' => 'HS256'
        ]);
        
        $payload['iat'] = time();
        $payload['exp'] = time() + $this->config['auth']['token_expiration'];
        $payload = json_encode($payload);
        
        $base64Header = $this->base64UrlEncode($header);
        $base64Payload = $this->base64UrlEncode($payload);
        
        $signature = hash_hmac('sha256', "$base64Header.$base64Payload", $this->config['auth']['jwt_secret'], true);
        $base64Signature = $this->base64UrlEncode($signature);
        
        return "$base64Header.$base64Payload.$base64Signature";
    }
    
    /**
     * Verifica se um token JWT é válido
     * 
     * @param string $token Token JWT
     * @return array|false Payload do token se for válido, false caso contrário
     */
    public function validateToken($token) {
        $parts = explode('.', $token);
        
        if (count($parts) !== 3) {
            return false;
        }
        
        list($base64Header, $base64Payload, $base64Signature) = $parts;
        
        $signature = $this->base64UrlDecode($base64Signature);
        $expectedSignature = hash_hmac('sha256', "$base64Header.$base64Payload", $this->config['auth']['jwt_secret'], true);
        
        if (!hash_equals($signature, $expectedSignature)) {
            return false;
        }
        
        $payload = json_decode($this->base64UrlDecode($base64Payload), true);
        
        if (!$payload || !isset($payload['exp'])) {
            return false;
        }
        
        if ($payload['exp'] < time()) {
            return false;
        }
        
        return $payload;
    }
    
    /**
     * Codifica uma string em base64 URL-safe
     * 
     * @param string $data String a ser codificada
     * @return string String codificada
     */
    private function base64UrlEncode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Decodifica uma string em base64 URL-safe
     * 
     * @param string $data String a ser decodificada
     * @return string String decodificada
     */
    private function base64UrlDecode($data) {
        return base64_decode(strtr($data, '-_', '+/'));
    }
    
    /**
     * Autentica um usuário
     * 
     * @param string $login Login do usuário
     * @param string $senha Senha do usuário
     * @return array|false Dados do usuário se autenticado, false caso contrário
     */
    public function authenticateUser($login, $senha) {
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, nome, email, login, senha, nivel
            FROM usuarios
            WHERE login = :login
        ");
        
        $stmt->execute(['login' => $login]);
        $user = $stmt->fetch();
        
        if (!$user) {
            return false;
        }
        
        // Verificar senha (em produção, usar password_verify)
        if ($user['senha'] !== $senha) {
            return false;
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
            return false;
        }
        
        // Verificar se a licença está válida
        $dataFimLicenca = strtotime($empresa['data_fim_licenca']);
        if ($dataFimLicenca < time()) {
            return false;
        }
        
        // Remover senha dos dados retornados
        unset($user['senha']);
        
        return $user;
    }
    
    /**
     * Autentica um superadmin
     * 
     * @param string $login Login do superadmin
     * @param string $senha Senha do superadmin
     * @return array|false Dados do superadmin se autenticado, false caso contrário
     */
    public function authenticateSuperadmin($login, $senha) {
        $stmt = $this->pdo->prepare("
            SELECT id, nome, email, login, senha
            FROM superadmins
            WHERE login = :login
        ");
        
        $stmt->execute(['login' => $login]);
        $superadmin = $stmt->fetch();
        
        if (!$superadmin) {
            return false;
        }
        
        // Verificar senha (em produção, usar password_verify)
        if ($superadmin['senha'] !== $senha) {
            return false;
        }
        
        // Remover senha dos dados retornados
        unset($superadmin['senha']);
        
        return $superadmin;
    }
    
    /**
     * Registra o login de um usuário
     * 
     * @param string $id ID do usuário
     * @param string $ip Endereço IP
     * @param string $userAgent User agent
     */
    public function registerUserLogin($id, $ip, $userAgent) {
        $stmt = $this->pdo->prepare("
            UPDATE usuarios
            SET ultimo_login = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        
        // Registrar log de login
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (usuario_id, acao, tabela, ip, data_hora)
            VALUES (:usuario_id, 'login', 'usuarios', :ip, NOW())
        ");
        
        $stmt->execute([
            'usuario_id' => $id,
            'ip' => $ip
        ]);
    }
    
    /**
     * Registra o login de um superadmin
     * 
     * @param string $id ID do superadmin
     * @param string $ip Endereço IP
     * @param string $userAgent User agent
     */
    public function registerSuperadminLogin($id, $ip, $userAgent) {
        $stmt = $this->pdo->prepare("
            UPDATE superadmins
            SET ultimo_login = NOW()
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        
        // Registrar log de login
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (superadmin_id, acao, tabela, ip, data_hora)
            VALUES (:superadmin_id, 'login', 'superadmins', :ip, NOW())
        ");
        
        $stmt->execute([
            'superadmin_id' => $id,
            'ip' => $ip
        ]);
    }
}
