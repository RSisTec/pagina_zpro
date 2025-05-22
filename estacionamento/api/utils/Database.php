<?php
/**
 * Classe de conexão com o banco de dados PostgreSQL
 */
class Database {
    private $connection;
    private $config;
    
    /**
     * Construtor
     * 
     * @param array $config Configurações de conexão com o banco de dados
     */
    public function __construct($config) {
        $this->config = $config;
        $this->connect();
    }
    
    /**
     * Estabelece a conexão com o banco de dados
     * 
     * @throws PDOException Se ocorrer um erro na conexão
     */
    private function connect() {
        $dsn = "pgsql:host={$this->config['host']};port={$this->config['port']};dbname={$this->config['database']};";
        
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        try {
            $this->connection = new PDO(
                $dsn,
                $this->config['username'],
                $this->config['password'],
                $options
            );
            
            // Definir o schema, se especificado
            if (isset($this->config['schema'])) {
                $this->connection->exec("SET search_path TO {$this->config['schema']}");
            }
        } catch (PDOException $e) {
            throw new PDOException("Erro de conexão com o banco de dados: " . $e->getMessage());
        }
    }
    
    /**
     * Retorna a conexão com o banco de dados
     * 
     * @return PDO Conexão com o banco de dados
     */
    public function getConnection() {
        return $this->connection;
    }
    
    /**
     * Executa uma consulta SQL
     * 
     * @param string $sql Consulta SQL
     * @param array $params Parâmetros da consulta
     * @return PDOStatement Resultado da consulta
     */
    public function query($sql, $params = []) {
        $stmt = $this->connection->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
    
    /**
     * Inicia uma transação
     */
    public function beginTransaction() {
        $this->connection->beginTransaction();
    }
    
    /**
     * Confirma uma transação
     */
    public function commit() {
        $this->connection->commit();
    }
    
    /**
     * Cancela uma transação
     */
    public function rollback() {
        $this->connection->rollBack();
    }
}
