<?php
/**
 * Classe para manipulação de requisições HTTP
 */
class Request {
    /**
     * Obtém o método HTTP da requisição
     * 
     * @return string Método HTTP
     */
    public function getMethod() {
        return $_SERVER['REQUEST_METHOD'];
    }
    
    /**
     * Obtém a URI da requisição
     * 
     * @return string URI
     */
    public function getUri() {
        return $_SERVER['REQUEST_URI'];
    }
    
    /**
     * Obtém os parâmetros da requisição
     * 
     * @return array Parâmetros
     */
    public function getParams() {
        $method = $this->getMethod();
        
        switch ($method) {
            case 'GET':
                return $_GET;
            case 'POST':
            case 'PUT':
            case 'DELETE':
            case 'PATCH':
                $contentType = isset($_SERVER['CONTENT_TYPE']) ? $_SERVER['CONTENT_TYPE'] : '';
                
                if (strpos($contentType, 'application/json') !== false) {
                    $json = file_get_contents('php://input');
                    $data = json_decode($json, true);
                    
                    if (json_last_error() === JSON_ERROR_NONE) {
                        return $data;
                    }
                    
                    return [];
                }
                
                return $_POST;
            default:
                return [];
        }
    }
    
    /**
     * Obtém um parâmetro específico da requisição
     * 
     * @param string $key Nome do parâmetro
     * @param mixed $default Valor padrão caso o parâmetro não exista
     * @return mixed Valor do parâmetro
     */
    public function getParam($key, $default = null) {
        $params = $this->getParams();
        
        return isset($params[$key]) ? $params[$key] : $default;
    }
    
    /**
     * Obtém os cabeçalhos da requisição
     * 
     * @return array Cabeçalhos
     */
    public function getHeaders() {
        $headers = [];
        
        foreach ($_SERVER as $key => $value) {
            if (strpos($key, 'HTTP_') === 0) {
                $headerKey = str_replace(' ', '-', ucwords(str_replace('_', ' ', strtolower(substr($key, 5)))));
                $headers[$headerKey] = $value;
            }
        }
        
        return $headers;
    }
    
    /**
     * Obtém um cabeçalho específico da requisição
     * 
     * @param string $key Nome do cabeçalho
     * @param mixed $default Valor padrão caso o cabeçalho não exista
     * @return mixed Valor do cabeçalho
     */
    public function getHeader($key, $default = null) {
        $headers = $this->getHeaders();
        
        return isset($headers[$key]) ? $headers[$key] : $default;
    }
    
    /**
     * Obtém o token de autenticação da requisição
     * 
     * @return string|null Token de autenticação
     */
    public function getAuthToken() {
        $authHeader = $this->getHeader('Authorization');
        
        if ($authHeader && strpos($authHeader, 'Bearer ') === 0) {
            return substr($authHeader, 7);
        }
        
        return null;
    }
    
    /**
     * Obtém o endereço IP do cliente
     * 
     * @return string Endereço IP
     */
    public function getIp() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            return $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            return $_SERVER['HTTP_X_FORWARDED_FOR'];
        } else {
            return $_SERVER['REMOTE_ADDR'];
        }
    }
    
    /**
     * Obtém o user agent do cliente
     * 
     * @return string User agent
     */
    public function getUserAgent() {
        return isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : '';
    }
}
