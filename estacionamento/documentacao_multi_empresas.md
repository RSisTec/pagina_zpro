# Documentação do Sistema de Estacionamento Multi-Empresas

## Visão Geral

Este documento descreve a arquitetura e funcionamento do sistema de estacionamento multi-empresas, desenvolvido para permitir que múltiplas empresas utilizem a mesma plataforma de forma isolada e segura.

## Estrutura do Sistema

O sistema está organizado em duas áreas principais:

1. **Área de Superadmin**: Acesso exclusivo para administradores do sistema, com funcionalidades para gerenciar empresas, licenças e acessos.

2. **Área Administrativa**: Acesso para usuários das empresas, com funcionalidades específicas para gerenciamento de estacionamentos.

## Hierarquia de Acesso

O sistema possui a seguinte hierarquia de acesso:

1. **Superadmin**: Acesso total ao sistema, gerencia empresas e licenças.
2. **Administrador**: Acesso total à empresa específica, gerencia usuários e configurações.
3. **Operador**: Acesso às operações diárias da empresa, sem acesso a relatórios e configurações.
4. **Visualizador**: Acesso apenas para visualização de dados, sem permissão para alterações.

## Isolamento de Dados

Todos os dados são isolados por empresa, garantindo que cada empresa tenha acesso apenas aos seus próprios dados. Este isolamento é implementado através de:

1. **Banco de Dados**: Todas as tabelas possuem um campo `empresa_id` que relaciona os registros à empresa correspondente.
2. **APIs**: Todas as operações de leitura e escrita verificam a empresa do usuário logado.
3. **Interface**: Cada empresa possui sua própria área administrativa isolada.

## Fluxos Principais

### Fluxo de Superadmin

1. Acesso via URL específica (`/superadmin/login.html`)
2. Dashboard com estatísticas globais
3. Gerenciamento de empresas (cadastro, edição, ativação/desativação)
4. Monitoramento de licenças
5. Acesso como administrador de qualquer empresa

### Fluxo de Empresa

1. Acesso via URL principal (`/pages/login.html`)
2. Dashboard com estatísticas da empresa
3. Gerenciamento de veículos no pátio
4. Cadastro de mensalistas, isentos, serviços e preços
5. Geração de relatórios

## Banco de Dados

O sistema utiliza um banco de dados relacional MySQL com as seguintes tabelas principais:

- `superadmins`: Administradores do sistema
- `empresas`: Empresas cadastradas
- `usuarios`: Usuários das empresas
- `sessoes`: Sessões ativas
- `mensalistas`: Clientes mensalistas
- `veiculos_mensalistas`: Veículos dos mensalistas
- `isentos`: Clientes isentos
- `veiculos_isentos`: Veículos dos isentos
- `tabelas_precos`: Tabelas de preços
- `servicos`: Serviços oferecidos
- `veiculos`: Registro de veículos
- `servicos_realizados`: Serviços realizados
- `logs`: Registro de ações

O script completo de criação do banco de dados está disponível em `/sql/database.sql`.

## Implementação Técnica

### Frontend

- HTML5, CSS3 e JavaScript puro
- Design responsivo para desktop e mobile
- Simulação de APIs usando localStorage

### Segurança

- Autenticação por token
- Verificação de permissões em todas as operações
- Isolamento de dados por empresa
- Logs de todas as ações realizadas

## Credenciais Padrão

### Superadmin
- **Login**: superadmin
- **Senha**: super123

### Administrador de Empresa (criado automaticamente ao cadastrar empresa)
- **Login**: Definido no cadastro da empresa
- **Senha**: Definida no cadastro da empresa

## Instalação e Configuração

1. Fazer upload dos arquivos para um servidor web
2. Criar o banco de dados usando o script SQL fornecido
3. Configurar a conexão com o banco de dados (em um ambiente real)
4. Acessar a área de superadmin e cadastrar empresas

## Considerações para Produção

Para um ambiente de produção real, recomenda-se:

1. Implementar um backend real (PHP, Node.js, etc.)
2. Configurar HTTPS para segurança
3. Implementar hashing de senhas
4. Configurar backups automáticos
5. Implementar rate limiting para prevenir ataques
