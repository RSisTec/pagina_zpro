<?php
/**
 * Arquivo principal da API
 * 
 * Este arquivo é o ponto de entrada para todas as requisições da API
 */

// Definir cabeçalhos para CORS e JSON
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Content-Type: application/json; charset=UTF-8');

// Se for uma requisição OPTIONS, retornar apenas os cabeçalhos
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Carregar configurações
$config = require_once __DIR__ . '/config/app.php';
$dbConfig = require_once __DIR__ . '/config/database.php';

// Definir constantes
define('API_ROOT', __DIR__);
define('DEBUG_MODE', $config['debug']);

// Configurar tratamento de erros
if (DEBUG_MODE) {
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
} else {
    ini_set('display_errors', 0);
    ini_set('display_startup_errors', 0);
    error_reporting(0);
}

// Função para carregar classes automaticamente
spl_autoload_register(function ($class) {
    // Converter namespace para caminho de arquivo
    $prefix = '';
    $baseDir = __DIR__ . '/';
    
    // Verificar se a classe usa o prefixo
    $len = strlen($prefix);
    if (strncmp($prefix, $class, $len) !== 0) {
        return;
    }
    
    // Obter o caminho relativo da classe
    $relativeClass = substr($class, $len);
    
    // Substituir namespace por diretório e \ por /
    $file = $baseDir . str_replace('\\', '/', $relativeClass) . '.php';
    
    // Carregar o arquivo se existir
    if (file_exists($file)) {
        require $file;
    }
});

// Incluir utilitários e classes base
require_once __DIR__ . '/utils/Database.php';
require_once __DIR__ . '/utils/Response.php';
require_once __DIR__ . '/utils/Request.php';
require_once __DIR__ . '/utils/Auth.php';
require_once __DIR__ . '/utils/Logger.php';

// Inicializar conexão com o banco de dados
try {
    $db = new Database($dbConfig);
    $pdo = $db->getConnection();
} catch (PDOException $e) {
    Response::json([
        'status' => 'error',
        'message' => DEBUG_MODE ? $e->getMessage() : 'Erro de conexão com o banco de dados'
    ], 500);
    exit;
}

// Inicializar logger
$logger = new Logger($config['log']);

// Inicializar request
$request = new Request();

// Obter URI e método da requisição
$uri = $request->getUri();
$method = $request->getMethod();

// Remover parâmetros de consulta da URI
$uri = explode('?', $uri)[0];

// Remover barra no final da URI, se existir
$uri = rtrim($uri, '/');

// Adicionar barra no início da URI, se não existir
if ($uri !== '' && $uri[0] !== '/') {
    $uri = '/' . $uri;
}

// Definir rota base da API
$baseRoute = '/api';

// Verificar se a URI começa com a rota base
if (strpos($uri, $baseRoute) !== 0) {
    Response::json([
        'status' => 'error',
        'message' => 'Rota não encontrada'
    ], 404);
    exit;
}

// Remover a rota base da URI
$uri = substr($uri, strlen($baseRoute));

// Adicionar barra no início da URI, se não existir
if ($uri !== '' && $uri[0] !== '/') {
    $uri = '/' . $uri;
}

// Incluir arquivo de rotas
require_once __DIR__ . '/routes/api.php';

// Inicializar roteador
$router = new Router($uri, $method);

// Processar a rota
$router->process();
