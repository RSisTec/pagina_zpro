# Documentação de Integração - Sistema de Estacionamento com PostgreSQL

## Visão Geral

Este documento descreve a integração do Sistema de Estacionamento com banco de dados PostgreSQL através de uma API PHP. A implementação permite que o sistema funcione em um ambiente multi-empresas, com isolamento completo de dados entre diferentes empresas cadastradas.

## Arquitetura

O sistema utiliza uma arquitetura em três camadas:

1. **Frontend**: HTML, CSS e JavaScript puro
2. **Backend**: API RESTful em PHP
3. **Banco de Dados**: PostgreSQL

### Diagrama de Arquitetura

```
+----------------+       +----------------+       +----------------+
|                |       |                |       |                |
|   Frontend     |------>|   API PHP     |------>|   PostgreSQL   |
|   (Browser)    |<------|   (Backend)   |<------|   (Database)   |
|                |       |                |       |                |
+----------------+       +----------------+       +----------------+
```

## Configuração do Ambiente

### Requisitos

- Servidor web (Apache/Nginx)
- PHP 7.4 ou superior
- PostgreSQL 12 ou superior
- Extensão PHP PDO_PGSQL

### Configuração do Banco de Dados

1. Crie um banco de dados PostgreSQL:
   ```sql
   CREATE DATABASE estacionamentos;
   ```

2. Execute o script SQL fornecido (`database.sql`) para criar as tabelas necessárias.

3. Configure as credenciais de acesso no arquivo `api/config/database.php`:
   ```php
   return [
       'host' => '158.220.108.253',
       'port' => '5432',
       'database' => 'estacionamentos',
       'username' => 'postgres',
       'password' => '671afde520b8c54c42843578a31d05d8',
       'charset' => 'utf8',
       'schema' => 'public'
   ];
   ```

## Estrutura da API

A API segue uma estrutura RESTful com os seguintes componentes:

- **Controllers**: Gerenciam as requisições e respostas
- **Models**: Representam as entidades do sistema
- **Routes**: Definem os endpoints disponíveis
- **Utils**: Classes utilitárias (autenticação, logs, etc.)

### Endpoints Principais

| Método | Endpoint                    | Descrição                           |
|--------|-----------------------------|------------------------------------|
| POST   | /api/auth/login             | Autenticação de usuários           |
| GET    | /api/empresas               | Listar empresas                    |
| POST   | /api/empresas               | Cadastrar empresa                  |
| GET    | /api/veiculos               | Listar veículos                    |
| POST   | /api/veiculos               | Registrar entrada de veículo       |
| PUT    | /api/veiculos/{id}/saida    | Registrar saída de veículo         |
| GET    | /api/mensalistas            | Listar mensalistas                 |
| POST   | /api/mensalistas            | Cadastrar mensalista               |
| GET    | /api/isentos                | Listar isentos                     |
| POST   | /api/isentos                | Cadastrar isento                   |
| GET    | /api/servicos               | Listar serviços                    |
| POST   | /api/servicos               | Cadastrar serviço                  |
| GET    | /api/precos                 | Listar tabelas de preços           |
| POST   | /api/precos                 | Cadastrar tabela de preços         |
| GET    | /api/relatorios             | Gerar relatórios                   |
| GET    | /api/usuarios               | Listar usuários                    |
| POST   | /api/usuarios               | Cadastrar usuário                  |

## Autenticação e Segurança

O sistema utiliza autenticação baseada em tokens JWT (JSON Web Tokens):

1. O usuário faz login com suas credenciais
2. A API valida as credenciais e retorna um token JWT
3. O frontend armazena o token no localStorage
4. Todas as requisições subsequentes incluem o token no cabeçalho Authorization
5. A API valida o token em cada requisição

### Níveis de Acesso

- **superadmin**: Acesso completo a todas as empresas
- **admin**: Acesso administrativo a uma empresa específica
- **operador**: Acesso operacional a uma empresa específica
- **visualizador**: Acesso somente leitura a uma empresa específica

## Integração Frontend-Backend

O frontend foi adaptado para consumir a API PHP/PostgreSQL através dos seguintes arquivos:

- **api-postgres.js**: Implementa as chamadas à API
- **api-adapter.js**: Adapta as chamadas para manter compatibilidade com o código existente

### Exemplo de Chamada à API

```javascript
// Autenticação
API.Auth.login(login, senha)
    .then(response => {
        if (response.success) {
            // Login bem-sucedido
        } else {
            // Erro de autenticação
        }
    })
    .catch(error => {
        // Erro de conexão
    });

// Listar veículos no pátio
API.Veiculo.listar({ status: 'no-patio' })
    .then(response => {
        const veiculos = response.data;
        // Processar veículos
    })
    .catch(error => {
        // Tratar erro
    });
```

## Isolamento Multi-Empresas

O sistema implementa isolamento completo de dados entre empresas:

1. Cada registro no banco de dados possui um campo `empresa_id`
2. Todas as consultas incluem filtro por `empresa_id`
3. O token JWT contém o ID da empresa do usuário autenticado
4. A API valida o acesso à empresa em cada requisição

## Testes e Validação

Uma página de testes automatizados está disponível em `/pages/testes.html`. Esta página executa testes de integração para validar:

- Conexão com a API
- Autenticação
- CRUD de todas as entidades
- Geração de relatórios

## Implantação

1. Faça upload dos arquivos do frontend para o servidor web
2. Faça upload dos arquivos da API para o diretório da API
3. Configure o banco de dados PostgreSQL
4. Execute o script SQL para criar as tabelas
5. Configure as credenciais de acesso no arquivo `api/config/database.php`
6. Configure o servidor web para direcionar as requisições à API

## Suporte e Manutenção

Para suporte técnico ou manutenção do sistema, entre em contato com a equipe de desenvolvimento.

---

© 2025 Sistema de Estacionamento Multi-Empresas
