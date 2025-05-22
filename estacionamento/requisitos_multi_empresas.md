# Requisitos para Sistema Multi-Empresas

## Visão Geral
Transformar o sistema de estacionamento atual em uma plataforma multi-empresas, onde cada empresa terá seu próprio ambiente isolado, com um superadmin que gerencia todas as empresas cadastradas.

## Requisitos Funcionais

### Área de Superadmin
1. **Login Separado**
   - Página de login exclusiva para superadmin
   - Separada do login administrativo das empresas
   - Credenciais de alto nível de segurança

2. **Gestão de Empresas**
   - Cadastro de novas empresas
   - Edição de dados das empresas
   - Visualização de todas as empresas cadastradas
   - Ativação/desativação de empresas
   - Definição de período de licença

3. **Dados das Empresas**
   - Nome da empresa
   - CNPJ
   - Endereço completo
   - Telefone
   - Email
   - Logo
   - Responsável
   - Data de início da licença
   - Data de término da licença
   - Status (ativo/inativo)

4. **Dashboard de Superadmin**
   - Visão geral de todas as empresas
   - Estatísticas de uso por empresa
   - Alertas de licenças próximas do vencimento
   - Monitoramento de atividade

### Modificações no Sistema Atual

1. **Isolamento de Dados por Empresa**
   - Todos os dados devem estar associados a uma empresa específica
   - Usuários só podem ver e manipular dados da sua própria empresa
   - Veículos, mensalistas, isentos, serviços, preços e relatórios isolados por empresa

2. **Login Administrativo**
   - Adicionar seleção de empresa no login atual
   - Validar credenciais específicas para cada empresa
   - Redirecionar para o ambiente da empresa após login

3. **APIs Simuladas**
   - Adaptar todas as APIs para filtrar por empresa
   - Adicionar ID da empresa em todas as operações
   - Garantir que nenhum dado seja acessível entre empresas diferentes

4. **Interface do Usuário**
   - Exibir informações da empresa logada
   - Personalizar com logo da empresa
   - Manter todas as funcionalidades atuais, mas isoladas por empresa

## Estrutura de Banco de Dados

1. **Tabelas Principais**
   - Empresas
   - Usuários (com relação para empresa)
   - Veículos (com relação para empresa)
   - Mensalistas (com relação para empresa)
   - Isentos (com relação para empresa)
   - Serviços (com relação para empresa)
   - Preços (com relação para empresa)
   - Superadmins (tabela separada)

2. **Relacionamentos**
   - Uma empresa possui muitos usuários
   - Uma empresa possui muitos veículos
   - Uma empresa possui muitos mensalistas
   - Uma empresa possui muitos isentos
   - Uma empresa possui muitos serviços
   - Uma empresa possui muitas tabelas de preços

3. **Requisitos de SQL**
   - Script de criação de todas as tabelas
   - Definição de chaves primárias e estrangeiras
   - Índices para otimização de consultas
   - Constraints para garantir integridade dos dados

## Considerações Técnicas

1. **Segurança**
   - Isolamento completo entre dados de empresas diferentes
   - Autenticação robusta para superadmin
   - Validação de permissões em todas as operações

2. **Performance**
   - Otimização de consultas com filtros por empresa
   - Índices adequados no banco de dados
   - Carregamento eficiente de dados específicos da empresa

3. **Usabilidade**
   - Interface intuitiva para superadmin
   - Transição suave entre empresas (quando aplicável)
   - Manutenção da experiência atual para usuários finais
