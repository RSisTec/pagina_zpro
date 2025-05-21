# Requisitos Detalhados - Sistema de Estacionamento

## Visão Geral
Sistema moderno e responsivo para gerenciamento de estacionamento, desenvolvido inteiramente em HTML, CSS e JavaScript puros, sem frameworks pesados ou backend complexo. O sistema deve funcionar em uma hospedagem simples.

## Área do Cliente

### Tela Inicial
- Interface para consulta por telefone ou número do ticket
- Visualização dos dados do veículo após consulta
- Exibição do tempo de permanência
- Apresentação dos dados da empresa (localização do estacionamento)

## Área Administrativa

### Autenticação
- Sistema de login com usuário e senha
- Níveis de acesso (usuário master e usuários adicionais)
- Cadastro de novos usuários pelo administrador

### Dashboard Principal
- Visualização de todos os carros no pátio
- Adição de novos carros
- Baixa de carros (saída)
- Acesso a outras funcionalidades administrativas

### Gestão de Veículos
- **Entrada de Veículos:**
  - Cadastro por placa
  - Integração com API para verificar histórico do veículo
  - Verificação automática se o veículo já está no pátio
  - Preenchimento automático de modelo e cor para veículos recorrentes
  - Identificação automática de mensalistas
  - Identificação de veículos isentos
  - Coleta de número de telefone para envio de mensagem
  - Atualização automática da lista de veículos após cadastro

- **Saída de Veículos:**
  - Consulta por número do ticket
  - Exibição dos dados do veículo
  - Cálculo do tempo de permanência
  - Cálculo do valor a ser pago
  - Seleção da forma de pagamento
  - Opção para incluir CPF na nota
  - Envio de mensagem ao cliente com dados da retirada
  - Atualização automática da lista de veículos após saída

### Gestão de Preços
- Cadastro de preços com variáveis de horários
- Definição de regras de cobrança

### Gestão de Mensalistas
- Cadastro de clientes mensalistas
- Cadastro de veículos associados aos mensalistas
- Tratamento diferenciado na entrada/saída

### Gestão de Isentos
- Cadastro de pessoas isentas
- Cadastro de veículos associados aos isentos
- Tratamento diferenciado na entrada/saída

### Gestão de Serviços
- Cadastro de serviços oferecidos (lavagem, conserto, etc.)
- Definição de valores para cada serviço
- Opção para registrar serviços sem estacionamento

### Relatórios
- Filtro por data
- Quantidade de veículos no pátio
- Serviços realizados
- Valores totais arrecadados

## Requisitos Técnicos

### Integração com APIs
- API para consulta de placas
- API para verificação de veículos no pátio
- API para envio de mensagens aos clientes
- API para consulta de serviços e valores

### Interface
- Design moderno e responsivo
- Compatibilidade com diferentes dispositivos
- Modais para interações principais
- Alertas para notificações importantes

### Armazenamento
- Armazenamento local de dados (localStorage)
- Simulação de APIs para demonstração

### Segurança
- Autenticação para área administrativa
- Proteção de rotas administrativas
- Validação de dados de entrada

## Fluxos Principais

### Fluxo de Entrada de Veículo
1. Operador insere a placa do veículo
2. Sistema consulta API para verificar histórico
3. Se veículo já passou pelo estabelecimento, preenche modelo e cor automaticamente
4. Se veículo está no pátio, exibe alerta
5. Se veículo é de mensalista, carrega dados do mensalista
6. Se veículo é isento, identifica isenção
7. Operador confirma ou completa dados
8. Operador insere número de telefone do cliente
9. Sistema envia mensagem ao cliente
10. Sistema registra entrada e atualiza lista de veículos

### Fluxo de Saída de Veículo
1. Operador insere número do ticket
2. Sistema consulta dados do veículo
3. Sistema calcula tempo de permanência e valor
4. Operador seleciona forma de pagamento
5. Operador pergunta se cliente deseja CPF na nota
6. Se sim, operador insere CPF
7. Sistema registra saída e envia mensagem ao cliente
8. Sistema atualiza lista de veículos

### Fluxo de Serviço Sem Estacionamento
1. Operador seleciona opção de serviço
2. Operador insere placa do veículo
3. Sistema consulta serviços disponíveis
4. Operador seleciona serviços desejados
5. Sistema calcula valor total
6. Operador finaliza registro
7. Sistema não contabiliza tempo de pátio
