# API PHP para Sistema de Estacionamento Multi-Empresas

Esta API foi desenvolvida para conectar o sistema de estacionamento multi-empresas a um banco de dados PostgreSQL.

## Estrutura da API

A API segue uma arquitetura RESTful simples, com os seguintes componentes:

- `config/` - Configurações do sistema e conexão com o banco de dados
- `controllers/` - Controladores que processam as requisições
- `models/` - Modelos que interagem com o banco de dados
- `routes/` - Definição de rotas da API
- `utils/` - Funções utilitárias
- `index.php` - Ponto de entrada da API

## Endpoints Disponíveis

A API fornece endpoints para todas as funcionalidades do sistema, incluindo:

### Autenticação
- `POST /api/auth/login` - Login de usuário
- `POST /api/auth/superadmin/login` - Login de superadmin
- `GET /api/auth/verify` - Verificar sessão atual
- `POST /api/auth/logout` - Encerrar sessão

### Empresas
- `GET /api/empresas` - Listar empresas
- `GET /api/empresas/{id}` - Obter detalhes de uma empresa
- `POST /api/empresas` - Cadastrar empresa
- `PUT /api/empresas/{id}` - Atualizar empresa
- `PATCH /api/empresas/{id}/status` - Alterar status da empresa

### Usuários
- `GET /api/usuarios` - Listar usuários
- `GET /api/usuarios/{id}` - Obter detalhes de um usuário
- `POST /api/usuarios` - Cadastrar usuário
- `PUT /api/usuarios/{id}` - Atualizar usuário
- `DELETE /api/usuarios/{id}` - Excluir usuário

### Veículos
- `GET /api/veiculos` - Listar veículos no pátio
- `GET /api/veiculos/{id}` - Obter detalhes de um veículo
- `GET /api/veiculos/placa/{placa}` - Consultar veículo por placa
- `GET /api/veiculos/ticket/{ticket}` - Consultar veículo por ticket
- `POST /api/veiculos` - Registrar entrada de veículo
- `PUT /api/veiculos/{id}/saida` - Registrar saída de veículo

### Mensalistas
- `GET /api/mensalistas` - Listar mensalistas
- `GET /api/mensalistas/{id}` - Obter detalhes de um mensalista
- `POST /api/mensalistas` - Cadastrar mensalista
- `PUT /api/mensalistas/{id}` - Atualizar mensalista
- `DELETE /api/mensalistas/{id}` - Excluir mensalista
- `GET /api/mensalistas/{id}/veiculos` - Listar veículos de um mensalista
- `POST /api/mensalistas/{id}/veiculos` - Adicionar veículo a um mensalista
- `DELETE /api/mensalistas/{id}/veiculos/{veiculoId}` - Remover veículo de um mensalista

### Isentos
- `GET /api/isentos` - Listar isentos
- `GET /api/isentos/{id}` - Obter detalhes de um isento
- `POST /api/isentos` - Cadastrar isento
- `PUT /api/isentos/{id}` - Atualizar isento
- `DELETE /api/isentos/{id}` - Excluir isento
- `GET /api/isentos/{id}/veiculos` - Listar veículos de um isento
- `POST /api/isentos/{id}/veiculos` - Adicionar veículo a um isento
- `DELETE /api/isentos/{id}/veiculos/{veiculoId}` - Remover veículo de um isento

### Serviços
- `GET /api/servicos` - Listar serviços
- `GET /api/servicos/{id}` - Obter detalhes de um serviço
- `POST /api/servicos` - Cadastrar serviço
- `PUT /api/servicos/{id}` - Atualizar serviço
- `DELETE /api/servicos/{id}` - Excluir serviço
- `POST /api/veiculos/{id}/servicos/{servicoId}` - Adicionar serviço a um veículo
- `DELETE /api/veiculos/{id}/servicos/{servicoId}` - Remover serviço de um veículo

### Preços
- `GET /api/precos` - Listar tabelas de preços
- `GET /api/precos/{id}` - Obter detalhes de uma tabela de preços
- `POST /api/precos` - Cadastrar tabela de preços
- `PUT /api/precos/{id}` - Atualizar tabela de preços
- `DELETE /api/precos/{id}` - Excluir tabela de preços
- `PATCH /api/precos/{id}/ativar` - Ativar tabela de preços

### Relatórios
- `GET /api/relatorios/veiculos` - Relatório de veículos
- `GET /api/relatorios/servicos` - Relatório de serviços
- `GET /api/relatorios/mensalistas` - Relatório de mensalistas
- `GET /api/estatisticas` - Estatísticas gerais

## Configuração

Para configurar a API, edite o arquivo `config/database.php` com os dados de conexão do seu banco PostgreSQL:

```php
<?php
return [
    'host' => 'seu_host',
    'port' => 'sua_porta',
    'database' => 'seu_banco',
    'username' => 'seu_usuario',
    'password' => 'sua_senha'
];
```

## Requisitos

- PHP 7.4 ou superior
- Extensão PDO para PostgreSQL
- PostgreSQL 10 ou superior

## Instalação

1. Copie os arquivos da API para o diretório do seu servidor web
2. Configure o banco de dados em `config/database.php`
3. Certifique-se de que o servidor web tem permissão de escrita nos diretórios `logs/` e `uploads/`
4. Configure o servidor web para direcionar todas as requisições para `index.php`

## Segurança

A API utiliza tokens JWT para autenticação. Cada requisição deve incluir um token válido no cabeçalho `Authorization`.

## Integração com o Frontend

O frontend foi adaptado para consumir esta API. Todas as chamadas ao localStorage foram substituídas por requisições HTTP para os endpoints correspondentes.
