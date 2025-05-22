-- Script SQL para criação do banco de dados do sistema de estacionamento multi-empresas
-- Autor: Manus AI
-- Data: 22/05/2025

-- Criação do banco de dados
CREATE DATABASE IF NOT EXISTS estacionamento_db;
USE estacionamento_db;

-- Configuração de charset
SET NAMES utf8mb4;
SET character_set_client = utf8mb4;

-- Tabela de superadmins
CREATE TABLE superadmins (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    login VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL
);

-- Tabela de empresas
CREATE TABLE empresas (
    id VARCHAR(36) PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    cnpj VARCHAR(20) NOT NULL UNIQUE,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    endereco TEXT NOT NULL,
    responsavel VARCHAR(100) NOT NULL,
    logo VARCHAR(255) NULL,
    data_inicio_licenca DATE NOT NULL,
    data_fim_licenca DATE NOT NULL,
    status BOOLEAN NOT NULL DEFAULT TRUE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_empresas_status (status),
    INDEX idx_empresas_licenca (data_fim_licenca)
);

-- Tabela de usuários
CREATE TABLE usuarios (
    id VARCHAR(36) PRIMARY KEY,
    empresa_id VARCHAR(36) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    login VARCHAR(50) NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nivel ENUM('admin', 'operador', 'visualizador') NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    ultimo_login TIMESTAMP NULL,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE KEY uk_usuario_login_empresa (login, empresa_id),
    UNIQUE KEY uk_usuario_email_empresa (email, empresa_id),
    INDEX idx_usuarios_nivel (nivel),
    INDEX idx_usuarios_empresa (empresa_id)
);

-- Tabela de sessões
CREATE TABLE sessoes (
    id VARCHAR(36) PRIMARY KEY,
    usuario_id VARCHAR(36) NULL,
    superadmin_id VARCHAR(36) NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    data_inicio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_expiracao TIMESTAMP NOT NULL,
    ip VARCHAR(45) NULL,
    user_agent TEXT NULL,
    superadmin_access BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (superadmin_id) REFERENCES superadmins(id) ON DELETE CASCADE,
    CHECK (usuario_id IS NOT NULL OR superadmin_id IS NOT NULL),
    INDEX idx_sessoes_token (token),
    INDEX idx_sessoes_expiracao (data_expiracao)
);

-- Tabela de mensalistas
CREATE TABLE mensalistas (
    id VARCHAR(36) PRIMARY KEY,
    empresa_id VARCHAR(36) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NULL,
    endereco TEXT NULL,
    plano VARCHAR(50) NOT NULL,
    data_inicio DATE NOT NULL,
    data_fim DATE NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    INDEX idx_mensalistas_empresa (empresa_id),
    INDEX idx_mensalistas_data_fim (data_fim)
);

-- Tabela de veículos de mensalistas
CREATE TABLE veiculos_mensalistas (
    id VARCHAR(36) PRIMARY KEY,
    mensalista_id VARCHAR(36) NOT NULL,
    placa VARCHAR(10) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    cor VARCHAR(30) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (mensalista_id) REFERENCES mensalistas(id) ON DELETE CASCADE,
    UNIQUE KEY uk_veiculo_mensalista_placa (mensalista_id, placa),
    INDEX idx_veiculos_mensalistas_placa (placa)
);

-- Tabela de isentos
CREATE TABLE isentos (
    id VARCHAR(36) PRIMARY KEY,
    empresa_id VARCHAR(36) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    documento VARCHAR(20) NOT NULL,
    motivo TEXT NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    INDEX idx_isentos_empresa (empresa_id)
);

-- Tabela de veículos de isentos
CREATE TABLE veiculos_isentos (
    id VARCHAR(36) PRIMARY KEY,
    isento_id VARCHAR(36) NOT NULL,
    placa VARCHAR(10) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    cor VARCHAR(30) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (isento_id) REFERENCES isentos(id) ON DELETE CASCADE,
    UNIQUE KEY uk_veiculo_isento_placa (isento_id, placa),
    INDEX idx_veiculos_isentos_placa (placa)
);

-- Tabela de tabelas de preços
CREATE TABLE tabelas_precos (
    id VARCHAR(36) PRIMARY KEY,
    empresa_id VARCHAR(36) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NULL,
    valor_primeira_hora DECIMAL(10, 2) NOT NULL,
    valor_hora_adicional DECIMAL(10, 2) NOT NULL,
    valor_diaria DECIMAL(10, 2) NOT NULL,
    valor_mensalidade DECIMAL(10, 2) NOT NULL,
    ativo BOOLEAN NOT NULL DEFAULT FALSE,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    INDEX idx_tabelas_precos_empresa (empresa_id),
    INDEX idx_tabelas_precos_ativo (ativo)
);

-- Tabela de serviços
CREATE TABLE servicos (
    id VARCHAR(36) PRIMARY KEY,
    empresa_id VARCHAR(36) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    tempo_estimado INT NULL COMMENT 'Tempo estimado em minutos',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    INDEX idx_servicos_empresa (empresa_id)
);

-- Tabela de veículos
CREATE TABLE veiculos (
    id VARCHAR(36) PRIMARY KEY,
    empresa_id VARCHAR(36) NOT NULL,
    placa VARCHAR(10) NOT NULL,
    modelo VARCHAR(50) NOT NULL,
    cor VARCHAR(30) NOT NULL,
    ticket VARCHAR(20) NOT NULL,
    telefone VARCHAR(20) NOT NULL,
    entrada TIMESTAMP NOT NULL,
    saida TIMESTAMP NULL,
    tipo_cliente ENUM('normal', 'mensalista', 'isento') NOT NULL DEFAULT 'normal',
    id_cliente VARCHAR(36) NULL COMMENT 'ID do mensalista ou isento, se aplicável',
    valor_total DECIMAL(10, 2) NULL,
    forma_pagamento ENUM('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia') NULL,
    cpf_nota VARCHAR(14) NULL,
    status ENUM('no-patio', 'saiu') NOT NULL DEFAULT 'no-patio',
    observacoes TEXT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE CASCADE,
    UNIQUE KEY uk_veiculo_ticket_empresa (ticket, empresa_id),
    INDEX idx_veiculos_empresa (empresa_id),
    INDEX idx_veiculos_placa (placa),
    INDEX idx_veiculos_status (status),
    INDEX idx_veiculos_entrada (entrada),
    INDEX idx_veiculos_tipo_cliente (tipo_cliente)
);

-- Tabela de serviços realizados
CREATE TABLE servicos_realizados (
    id VARCHAR(36) PRIMARY KEY,
    veiculo_id VARCHAR(36) NOT NULL,
    servico_id VARCHAR(36) NOT NULL,
    nome_servico VARCHAR(100) NOT NULL COMMENT 'Nome do serviço no momento da realização',
    valor DECIMAL(10, 2) NOT NULL COMMENT 'Valor do serviço no momento da realização',
    data_adicao TIMESTAMP NOT NULL,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE,
    FOREIGN KEY (servico_id) REFERENCES servicos(id) ON DELETE RESTRICT,
    INDEX idx_servicos_realizados_veiculo (veiculo_id),
    INDEX idx_servicos_realizados_servico (servico_id),
    INDEX idx_servicos_realizados_data (data_adicao)
);

-- Tabela de logs
CREATE TABLE logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    empresa_id VARCHAR(36) NULL,
    usuario_id VARCHAR(36) NULL,
    superadmin_id VARCHAR(36) NULL,
    acao VARCHAR(50) NOT NULL,
    tabela VARCHAR(50) NOT NULL,
    registro_id VARCHAR(36) NULL,
    dados_antigos JSON NULL,
    dados_novos JSON NULL,
    ip VARCHAR(45) NULL,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (empresa_id) REFERENCES empresas(id) ON DELETE SET NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (superadmin_id) REFERENCES superadmins(id) ON DELETE SET NULL,
    INDEX idx_logs_empresa (empresa_id),
    INDEX idx_logs_usuario (usuario_id),
    INDEX idx_logs_superadmin (superadmin_id),
    INDEX idx_logs_acao (acao),
    INDEX idx_logs_tabela (tabela),
    INDEX idx_logs_data (data_hora)
);

-- Inserir superadmin padrão
INSERT INTO superadmins (id, nome, email, login, senha, data_criacao)
VALUES ('super_admin_default', 'Super Admin', 'admin@sistema.com', 'superadmin', 'super123', NOW());

-- Procedimento para criar tabela de preços padrão para uma empresa
DELIMITER //
CREATE PROCEDURE criar_tabela_precos_padrao(IN p_empresa_id VARCHAR(36))
BEGIN
    DECLARE tabela_id VARCHAR(36);
    SET tabela_id = CONCAT('prc_', UUID());
    
    INSERT INTO tabelas_precos (
        id, empresa_id, nome, descricao, 
        valor_primeira_hora, valor_hora_adicional, 
        valor_diaria, valor_mensalidade, ativo
    ) VALUES (
        tabela_id, p_empresa_id, 'Tabela Padrão', 'Tabela de preços padrão',
        10.00, 5.00, 30.00, 300.00, TRUE
    );
END //
DELIMITER ;

-- Trigger para garantir que cada empresa tenha pelo menos uma tabela de preços ativa
DELIMITER //
CREATE TRIGGER after_update_tabela_precos
AFTER UPDATE ON tabelas_precos
FOR EACH ROW
BEGIN
    DECLARE count_ativas INT;
    
    IF OLD.ativo = TRUE AND NEW.ativo = FALSE THEN
        -- Verificar se existe outra tabela ativa para esta empresa
        SELECT COUNT(*) INTO count_ativas 
        FROM tabelas_precos 
        WHERE empresa_id = NEW.empresa_id AND ativo = TRUE;
        
        IF count_ativas = 0 THEN
            -- Se não houver nenhuma tabela ativa, reativar esta
            UPDATE tabelas_precos SET ativo = TRUE WHERE id = NEW.id;
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Não é possível desativar a única tabela de preços ativa.';
        END IF;
    END IF;
END //
DELIMITER ;

-- Trigger para garantir que apenas uma tabela de preços esteja ativa por empresa
DELIMITER //
CREATE TRIGGER before_insert_update_tabela_precos
BEFORE INSERT ON tabelas_precos
FOR EACH ROW
BEGIN
    IF NEW.ativo = TRUE THEN
        -- Desativar todas as outras tabelas de preços da empresa
        UPDATE tabelas_precos 
        SET ativo = FALSE 
        WHERE empresa_id = NEW.empresa_id AND ativo = TRUE;
    END IF;
END //
DELIMITER ;

-- Trigger para criar tabela de preços padrão ao criar uma empresa
DELIMITER //
CREATE TRIGGER after_insert_empresa
AFTER INSERT ON empresas
FOR EACH ROW
BEGIN
    CALL criar_tabela_precos_padrao(NEW.id);
END //
DELIMITER ;

-- Trigger para verificar se é o último administrador antes de excluir ou alterar nível
DELIMITER //
CREATE TRIGGER before_update_usuario
BEFORE UPDATE ON usuarios
FOR EACH ROW
BEGIN
    DECLARE count_admins INT;
    
    IF OLD.nivel = 'admin' AND NEW.nivel != 'admin' THEN
        -- Verificar se é o último administrador
        SELECT COUNT(*) INTO count_admins 
        FROM usuarios 
        WHERE empresa_id = NEW.empresa_id AND nivel = 'admin' AND id != NEW.id;
        
        IF count_admins = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Não é possível rebaixar o último administrador.';
        END IF;
    END IF;
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER before_delete_usuario
BEFORE DELETE ON usuarios
FOR EACH ROW
BEGIN
    DECLARE count_admins INT;
    
    IF OLD.nivel = 'admin' THEN
        -- Verificar se é o último administrador
        SELECT COUNT(*) INTO count_admins 
        FROM usuarios 
        WHERE empresa_id = OLD.empresa_id AND nivel = 'admin' AND id != OLD.id;
        
        IF count_admins = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Não é possível excluir o último administrador.';
        END IF;
    END IF;
END //
DELIMITER ;

-- Visão para estatísticas de empresas
CREATE VIEW vw_estatisticas_empresas AS
SELECT 
    e.id AS empresa_id,
    e.nome AS empresa_nome,
    e.status AS empresa_status,
    e.data_fim_licenca,
    (SELECT COUNT(*) FROM usuarios u WHERE u.empresa_id = e.id) AS total_usuarios,
    (SELECT COUNT(*) FROM veiculos v WHERE v.empresa_id = e.id) AS total_veiculos,
    (SELECT COUNT(*) FROM veiculos v WHERE v.empresa_id = e.id AND v.status = 'no-patio') AS veiculos_no_patio,
    (SELECT COUNT(*) FROM mensalistas m WHERE m.empresa_id = e.id) AS total_mensalistas,
    (SELECT COUNT(*) FROM isentos i WHERE i.empresa_id = e.id) AS total_isentos,
    (SELECT COUNT(*) FROM servicos s WHERE s.empresa_id = e.id) AS total_servicos,
    (SELECT SUM(v.valor_total) FROM veiculos v WHERE v.empresa_id = e.id AND v.status = 'saiu') AS valor_total_faturado
FROM empresas e;

-- Visão para relatório de veículos
CREATE VIEW vw_relatorio_veiculos AS
SELECT 
    v.id,
    v.empresa_id,
    e.nome AS empresa_nome,
    v.placa,
    v.modelo,
    v.cor,
    v.ticket,
    v.telefone,
    v.entrada,
    v.saida,
    v.tipo_cliente,
    CASE 
        WHEN v.tipo_cliente = 'mensalista' THEN (SELECT m.nome FROM mensalistas m WHERE m.id = v.id_cliente)
        WHEN v.tipo_cliente = 'isento' THEN (SELECT i.nome FROM isentos i WHERE i.id = v.id_cliente)
        ELSE NULL
    END AS cliente_nome,
    v.valor_total,
    v.forma_pagamento,
    v.cpf_nota,
    v.status,
    v.observacoes,
    TIMESTAMPDIFF(MINUTE, v.entrada, COALESCE(v.saida, NOW())) AS tempo_permanencia_minutos,
    (SELECT COUNT(*) FROM servicos_realizados sr WHERE sr.veiculo_id = v.id) AS total_servicos,
    (SELECT SUM(sr.valor) FROM servicos_realizados sr WHERE sr.veiculo_id = v.id) AS valor_servicos
FROM veiculos v
JOIN empresas e ON v.empresa_id = e.id;

-- Visão para relatório de serviços
CREATE VIEW vw_relatorio_servicos AS
SELECT 
    sr.id,
    sr.veiculo_id,
    v.empresa_id,
    e.nome AS empresa_nome,
    v.placa,
    v.ticket,
    sr.servico_id,
    sr.nome_servico,
    sr.valor,
    sr.data_adicao,
    v.entrada,
    v.saida,
    v.status
FROM servicos_realizados sr
JOIN veiculos v ON sr.veiculo_id = v.id
JOIN empresas e ON v.empresa_id = e.id;

-- Visão para relatório de mensalistas
CREATE VIEW vw_relatorio_mensalistas AS
SELECT 
    m.id,
    m.empresa_id,
    e.nome AS empresa_nome,
    m.nome AS mensalista_nome,
    m.documento,
    m.telefone,
    m.email,
    m.plano,
    m.data_inicio,
    m.data_fim,
    (SELECT COUNT(*) FROM veiculos_mensalistas vm WHERE vm.mensalista_id = m.id) AS total_veiculos,
    CASE 
        WHEN m.data_fim < CURDATE() THEN 'Vencido'
        WHEN m.data_fim BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY) THEN 'Vencendo'
        ELSE 'Vigente'
    END AS status_plano
FROM mensalistas m
JOIN empresas e ON m.empresa_id = e.id;

-- Comentários nas tabelas
ALTER TABLE superadmins COMMENT 'Usuários com acesso de superadministrador do sistema';
ALTER TABLE empresas COMMENT 'Empresas cadastradas no sistema';
ALTER TABLE usuarios COMMENT 'Usuários das empresas com diferentes níveis de acesso';
ALTER TABLE sessoes COMMENT 'Sessões ativas de usuários e superadmins';
ALTER TABLE mensalistas COMMENT 'Clientes mensalistas das empresas';
ALTER TABLE veiculos_mensalistas COMMENT 'Veículos associados aos mensalistas';
ALTER TABLE isentos COMMENT 'Clientes isentos de pagamento';
ALTER TABLE veiculos_isentos COMMENT 'Veículos associados aos isentos';
ALTER TABLE tabelas_precos COMMENT 'Tabelas de preços das empresas';
ALTER TABLE servicos COMMENT 'Serviços oferecidos pelas empresas';
ALTER TABLE veiculos COMMENT 'Registro de veículos que entraram no estacionamento';
ALTER TABLE servicos_realizados COMMENT 'Serviços realizados em veículos';
ALTER TABLE logs COMMENT 'Registro de ações realizadas no sistema';
