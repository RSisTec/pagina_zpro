<?php
/**
 * Classe para manipulação de respostas HTTP
 */
class Response {
    /**
     * Envia uma resposta JSON
     * 
     * @param mixed $data Dados a serem enviados
     * @param int $statusCode Código de status HTTP
     */
    public static function json($data, $statusCode = 200) {
        http_response_code($statusCode);
        echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        exit;
    }
    
    /**
     * Envia uma resposta de sucesso
     * 
     * @param mixed $data Dados a serem enviados
     * @param string $message Mensagem de sucesso
     * @param int $statusCode Código de status HTTP
     */
    public static function success($data = null, $message = 'Operação realizada com sucesso', $statusCode = 200) {
        self::json([
            'status' => 'success',
            'message' => $message,
            'data' => $data
        ], $statusCode);
    }
    
    /**
     * Envia uma resposta de erro
     * 
     * @param string $message Mensagem de erro
     * @param int $statusCode Código de status HTTP
     * @param mixed $errors Erros adicionais
     */
    public static function error($message = 'Ocorreu um erro', $statusCode = 400, $errors = null) {
        $response = [
            'status' => 'error',
            'message' => $message
        ];
        
        if ($errors !== null) {
            $response['errors'] = $errors;
        }
        
        self::json($response, $statusCode);
    }
    
    /**
     * Envia uma resposta de não autorizado
     * 
     * @param string $message Mensagem de erro
     */
    public static function unauthorized($message = 'Não autorizado') {
        self::error($message, 401);
    }
    
    /**
     * Envia uma resposta de proibido
     * 
     * @param string $message Mensagem de erro
     */
    public static function forbidden($message = 'Acesso negado') {
        self::error($message, 403);
    }
    
    /**
     * Envia uma resposta de não encontrado
     * 
     * @param string $message Mensagem de erro
     */
    public static function notFound($message = 'Recurso não encontrado') {
        self::error($message, 404);
    }
    
    /**
     * Envia uma resposta de erro interno
     * 
     * @param string $message Mensagem de erro
     */
    public static function serverError($message = 'Erro interno do servidor') {
        self::error($message, 500);
    }
}
