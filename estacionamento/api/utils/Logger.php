<?php
/**
 * Classe para gerenciamento de logs
 */
class Logger {
    private $config;
    
    /**
     * Construtor
     * 
     * @param array $config Configurações de log
     */
    public function __construct($config) {
        $this->config = $config;
        
        // Criar diretório de logs se não existir
        if (!is_dir($this->config['path'])) {
            mkdir($this->config['path'], 0755, true);
        }
    }
    
    /**
     * Registra uma mensagem de log
     * 
     * @param string $message Mensagem a ser registrada
     * @param string $level Nível do log (debug, info, warning, error)
     * @param array $context Contexto adicional
     */
    public function log($message, $level = 'info', $context = []) {
        if (!$this->config['enabled']) {
            return;
        }
        
        // Verificar nível do log
        $levels = ['debug', 'info', 'warning', 'error'];
        $configLevelIndex = array_search($this->config['level'], $levels);
        $currentLevelIndex = array_search($level, $levels);
        
        if ($currentLevelIndex < $configLevelIndex) {
            return;
        }
        
        // Formatar mensagem
        $date = date('Y-m-d H:i:s');
        $contextString = !empty($context) ? ' ' . json_encode($context) : '';
        $logMessage = "[$date] [$level] $message$contextString" . PHP_EOL;
        
        // Definir arquivo de log
        $logFile = $this->config['path'] . '/' . date('Y-m-d') . '.log';
        
        // Registrar mensagem
        file_put_contents($logFile, $logMessage, FILE_APPEND);
    }
    
    /**
     * Registra uma mensagem de debug
     * 
     * @param string $message Mensagem a ser registrada
     * @param array $context Contexto adicional
     */
    public function debug($message, $context = []) {
        $this->log($message, 'debug', $context);
    }
    
    /**
     * Registra uma mensagem de informação
     * 
     * @param string $message Mensagem a ser registrada
     * @param array $context Contexto adicional
     */
    public function info($message, $context = []) {
        $this->log($message, 'info', $context);
    }
    
    /**
     * Registra uma mensagem de aviso
     * 
     * @param string $message Mensagem a ser registrada
     * @param array $context Contexto adicional
     */
    public function warning($message, $context = []) {
        $this->log($message, 'warning', $context);
    }
    
    /**
     * Registra uma mensagem de erro
     * 
     * @param string $message Mensagem a ser registrada
     * @param array $context Contexto adicional
     */
    public function error($message, $context = []) {
        $this->log($message, 'error', $context);
    }
}
