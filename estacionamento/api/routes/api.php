<?php
/**
 * Classe para gerenciamento de rotas
 */
class Router {
    private $uri;
    private $method;
    private $routes = [];
    
    /**
     * Construtor
     * 
     * @param string $uri URI da requisição
     * @param string $method Método HTTP da requisição
     */
    public function __construct($uri, $method) {
        $this->uri = $uri;
        $this->method = $method;
        
        // Definir rotas
        $this->defineRoutes();
    }
    
    /**
     * Define as rotas da API
     */
    private function defineRoutes() {
        // Rotas de autenticação
        $this->addRoute('POST', '/auth/login', 'AuthController', 'login');
        $this->addRoute('POST', '/auth/superadmin/login', 'AuthController', 'loginSuperadmin');
        $this->addRoute('GET', '/auth/verify', 'AuthController', 'verify');
        $this->addRoute('POST', '/auth/logout', 'AuthController', 'logout');
        
        // Rotas de empresas (superadmin)
        $this->addRoute('GET', '/empresas', 'EmpresaController', 'index');
        $this->addRoute('GET', '/empresas/([a-zA-Z0-9_-]+)', 'EmpresaController', 'show');
        $this->addRoute('POST', '/empresas', 'EmpresaController', 'store');
        $this->addRoute('PUT', '/empresas/([a-zA-Z0-9_-]+)', 'EmpresaController', 'update');
        $this->addRoute('PATCH', '/empresas/([a-zA-Z0-9_-]+)/status', 'EmpresaController', 'updateStatus');
        
        // Rotas de usuários
        $this->addRoute('GET', '/usuarios', 'UsuarioController', 'index');
        $this->addRoute('GET', '/usuarios/([a-zA-Z0-9_-]+)', 'UsuarioController', 'show');
        $this->addRoute('POST', '/usuarios', 'UsuarioController', 'store');
        $this->addRoute('PUT', '/usuarios/([a-zA-Z0-9_-]+)', 'UsuarioController', 'update');
        $this->addRoute('DELETE', '/usuarios/([a-zA-Z0-9_-]+)', 'UsuarioController', 'destroy');
        
        // Rotas de veículos
        $this->addRoute('GET', '/veiculos', 'VeiculoController', 'index');
        $this->addRoute('GET', '/veiculos/([a-zA-Z0-9_-]+)', 'VeiculoController', 'show');
        $this->addRoute('GET', '/veiculos/placa/([a-zA-Z0-9_-]+)', 'VeiculoController', 'findByPlaca');
        $this->addRoute('GET', '/veiculos/ticket/([a-zA-Z0-9_-]+)', 'VeiculoController', 'findByTicket');
        $this->addRoute('POST', '/veiculos', 'VeiculoController', 'store');
        $this->addRoute('PUT', '/veiculos/([a-zA-Z0-9_-]+)/saida', 'VeiculoController', 'registrarSaida');
        
        // Rotas de mensalistas
        $this->addRoute('GET', '/mensalistas', 'MensalistaController', 'index');
        $this->addRoute('GET', '/mensalistas/([a-zA-Z0-9_-]+)', 'MensalistaController', 'show');
        $this->addRoute('POST', '/mensalistas', 'MensalistaController', 'store');
        $this->addRoute('PUT', '/mensalistas/([a-zA-Z0-9_-]+)', 'MensalistaController', 'update');
        $this->addRoute('DELETE', '/mensalistas/([a-zA-Z0-9_-]+)', 'MensalistaController', 'destroy');
        $this->addRoute('GET', '/mensalistas/([a-zA-Z0-9_-]+)/veiculos', 'MensalistaController', 'veiculos');
        $this->addRoute('POST', '/mensalistas/([a-zA-Z0-9_-]+)/veiculos', 'MensalistaController', 'addVeiculo');
        $this->addRoute('DELETE', '/mensalistas/([a-zA-Z0-9_-]+)/veiculos/([a-zA-Z0-9_-]+)', 'MensalistaController', 'removeVeiculo');
        
        // Rotas de isentos
        $this->addRoute('GET', '/isentos', 'IsentoController', 'index');
        $this->addRoute('GET', '/isentos/([a-zA-Z0-9_-]+)', 'IsentoController', 'show');
        $this->addRoute('POST', '/isentos', 'IsentoController', 'store');
        $this->addRoute('PUT', '/isentos/([a-zA-Z0-9_-]+)', 'IsentoController', 'update');
        $this->addRoute('DELETE', '/isentos/([a-zA-Z0-9_-]+)', 'IsentoController', 'destroy');
        $this->addRoute('GET', '/isentos/([a-zA-Z0-9_-]+)/veiculos', 'IsentoController', 'veiculos');
        $this->addRoute('POST', '/isentos/([a-zA-Z0-9_-]+)/veiculos', 'IsentoController', 'addVeiculo');
        $this->addRoute('DELETE', '/isentos/([a-zA-Z0-9_-]+)/veiculos/([a-zA-Z0-9_-]+)', 'IsentoController', 'removeVeiculo');
        
        // Rotas de serviços
        $this->addRoute('GET', '/servicos', 'ServicoController', 'index');
        $this->addRoute('GET', '/servicos/([a-zA-Z0-9_-]+)', 'ServicoController', 'show');
        $this->addRoute('POST', '/servicos', 'ServicoController', 'store');
        $this->addRoute('PUT', '/servicos/([a-zA-Z0-9_-]+)', 'ServicoController', 'update');
        $this->addRoute('DELETE', '/servicos/([a-zA-Z0-9_-]+)', 'ServicoController', 'destroy');
        $this->addRoute('POST', '/veiculos/([a-zA-Z0-9_-]+)/servicos/([a-zA-Z0-9_-]+)', 'ServicoController', 'addToVeiculo');
        $this->addRoute('DELETE', '/veiculos/([a-zA-Z0-9_-]+)/servicos/([a-zA-Z0-9_-]+)', 'ServicoController', 'removeFromVeiculo');
        
        // Rotas de preços
        $this->addRoute('GET', '/precos', 'PrecoController', 'index');
        $this->addRoute('GET', '/precos/([a-zA-Z0-9_-]+)', 'PrecoController', 'show');
        $this->addRoute('POST', '/precos', 'PrecoController', 'store');
        $this->addRoute('PUT', '/precos/([a-zA-Z0-9_-]+)', 'PrecoController', 'update');
        $this->addRoute('DELETE', '/precos/([a-zA-Z0-9_-]+)', 'PrecoController', 'destroy');
        $this->addRoute('PATCH', '/precos/([a-zA-Z0-9_-]+)/ativar', 'PrecoController', 'ativar');
        
        // Rotas de relatórios
        $this->addRoute('GET', '/relatorios/veiculos', 'RelatorioController', 'veiculos');
        $this->addRoute('GET', '/relatorios/servicos', 'RelatorioController', 'servicos');
        $this->addRoute('GET', '/relatorios/mensalistas', 'RelatorioController', 'mensalistas');
        $this->addRoute('GET', '/estatisticas', 'RelatorioController', 'estatisticas');
    }
    
    /**
     * Adiciona uma rota
     * 
     * @param string $method Método HTTP
     * @param string $uri URI da rota
     * @param string $controller Controlador
     * @param string $action Ação do controlador
     */
    private function addRoute($method, $uri, $controller, $action) {
        $this->routes[] = [
            'method' => $method,
            'uri' => $uri,
            'controller' => $controller,
            'action' => $action
        ];
    }
    
    /**
     * Processa a rota atual
     */
    public function process() {
        $route = $this->findRoute();
        
        if (!$route) {
            Response::notFound('Rota não encontrada');
        }
        
        $controllerName = $route['controller'];
        $actionName = $route['action'];
        $params = $route['params'] ?? [];
        
        // Carregar controlador
        $controllerFile = __DIR__ . "/../controllers/{$controllerName}.php";
        
        if (!file_exists($controllerFile)) {
            Response::serverError("Controlador não encontrado: {$controllerName}");
        }
        
        require_once $controllerFile;
        
        // Instanciar controlador
        $controller = new $controllerName();
        
        // Verificar se a ação existe
        if (!method_exists($controller, $actionName)) {
            Response::serverError("Ação não encontrada: {$actionName}");
        }
        
        // Executar ação
        call_user_func_array([$controller, $actionName], $params);
    }
    
    /**
     * Encontra a rota correspondente à requisição atual
     * 
     * @return array|null Rota encontrada ou null se não encontrar
     */
    private function findRoute() {
        foreach ($this->routes as $route) {
            if ($route['method'] !== $this->method) {
                continue;
            }
            
            // Verificar se é uma rota com parâmetros
            if (strpos($route['uri'], '(') !== false) {
                $pattern = '#^' . $route['uri'] . '$#';
                
                if (preg_match($pattern, $this->uri, $matches)) {
                    // Remover o primeiro elemento (match completo)
                    array_shift($matches);
                    
                    // Adicionar parâmetros à rota
                    $route['params'] = $matches;
                    
                    return $route;
                }
            } else {
                // Rota simples
                if ($route['uri'] === $this->uri) {
                    return $route;
                }
            }
        }
        
        return null;
    }
}
