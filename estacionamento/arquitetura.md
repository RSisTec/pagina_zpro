# Arquitetura do Sistema de Estacionamento

## Estrutura de Arquivos

```
estacionamento/
├── index.html                # Página inicial (consulta por telefone/ticket)
├── css/
│   ├── style.css             # Estilos globais
│   ├── login.css             # Estilos da página de login
│   ├── admin.css             # Estilos da área administrativa
│   └── components.css        # Estilos de componentes reutilizáveis
├── js/
│   ├── main.js               # Funções principais e inicialização
│   ├── auth.js               # Autenticação e controle de acesso
│   ├── api.js                # Simulação de APIs e integração
│   ├── storage.js            # Gerenciamento de armazenamento local
│   ├── utils.js              # Funções utilitárias
│   ├── components/
│   │   ├── modal.js          # Componente de modal
│   │   ├── notification.js   # Componente de notificação
│   │   └── table.js          # Componente de tabela
│   └── modules/
│       ├── entrada.js        # Módulo de entrada de veículos
│       ├── saida.js          # Módulo de saída de veículos
│       ├── mensalistas.js    # Módulo de gestão de mensalistas
│       ├── isentos.js        # Módulo de gestão de isentos
│       ├── servicos.js       # Módulo de gestão de serviços
│       ├── precos.js         # Módulo de gestão de preços
│       ├── usuarios.js       # Módulo de gestão de usuários
│       └── relatorios.js     # Módulo de relatórios
├── pages/
│   ├── login.html            # Página de login
│   ├── admin.html            # Dashboard administrativo
│   ├── mensalistas.html      # Gestão de mensalistas
│   ├── isentos.html          # Gestão de isentos
│   ├── servicos.html         # Gestão de serviços
│   ├── precos.html           # Gestão de preços
│   ├── usuarios.html         # Gestão de usuários
│   └── relatorios.html       # Relatórios
└── img/
    ├── logo.png              # Logo do sistema
    ├── icons/                # Ícones do sistema
    └── backgrounds/          # Imagens de fundo
```

## Fluxo de Navegação

### Área do Cliente
1. **Página Inicial (index.html)**
   - Formulário para consulta por telefone ou número do ticket
   - Após consulta, exibe modal com dados do veículo e tempo de permanência

### Área Administrativa
1. **Login (pages/login.html)**
   - Formulário de autenticação
   - Redirecionamento para dashboard após login bem-sucedido

2. **Dashboard (pages/admin.html)**
   - Visão geral dos carros no pátio
   - Botões para adicionar/remover carros
   - Menu de navegação para outras áreas

3. **Gestão de Mensalistas (pages/mensalistas.html)**
   - Listagem de mensalistas
   - Formulário para adicionar/editar mensalistas
   - Associação de veículos a mensalistas

4. **Gestão de Isentos (pages/isentos.html)**
   - Listagem de isentos
   - Formulário para adicionar/editar isentos
   - Associação de veículos a isentos

5. **Gestão de Serviços (pages/servicos.html)**
   - Listagem de serviços
   - Formulário para adicionar/editar serviços e valores

6. **Gestão de Preços (pages/precos.html)**
   - Configuração de preços por horário
   - Regras de cobrança

7. **Gestão de Usuários (pages/usuarios.html)**
   - Listagem de usuários do sistema
   - Formulário para adicionar/editar usuários

8. **Relatórios (pages/relatorios.html)**
   - Filtros por data
   - Exibição de dados estatísticos
   - Gráficos e tabelas

## Estrutura de Dados

### Veículos
```javascript
{
  id: String,                // ID único do veículo (gerado automaticamente)
  placa: String,             // Placa do veículo
  modelo: String,            // Modelo do veículo
  cor: String,               // Cor do veículo
  ticket: String,            // Número do ticket
  telefone: String,          // Telefone do cliente
  entrada: Date,             // Data e hora de entrada
  saida: Date,               // Data e hora de saída (null se ainda estiver no pátio)
  tipoCliente: String,       // "normal", "mensalista", "isento"
  idCliente: String,         // ID do mensalista ou isento (se aplicável)
  servicos: Array,           // Lista de serviços contratados
  valorTotal: Number,        // Valor total a ser pago
  formaPagamento: String,    // Forma de pagamento
  cpfNota: String,           // CPF para nota fiscal (opcional)
  status: String             // "no_patio", "finalizado"
}
```

### Mensalistas
```javascript
{
  id: String,                // ID único do mensalista
  nome: String,              // Nome do mensalista
  documento: String,         // CPF ou CNPJ
  telefone: String,          // Telefone de contato
  email: String,             // Email de contato
  endereco: String,          // Endereço
  plano: String,             // Tipo de plano
  dataInicio: Date,          // Data de início do plano
  dataFim: Date,             // Data de término do plano
  veiculos: Array            // Lista de placas de veículos associados
}
```

### Isentos
```javascript
{
  id: String,                // ID único do isento
  nome: String,              // Nome do isento
  documento: String,         // CPF ou CNPJ
  motivo: String,            // Motivo da isenção
  veiculos: Array            // Lista de placas de veículos associados
}
```

### Serviços
```javascript
{
  id: String,                // ID único do serviço
  nome: String,              // Nome do serviço
  descricao: String,         // Descrição do serviço
  valor: Number,             // Valor do serviço
  tempoEstimado: Number      // Tempo estimado em minutos
}
```

### Preços
```javascript
{
  id: String,                // ID único da configuração de preço
  nome: String,              // Nome da configuração (ex: "Diurno", "Noturno")
  valorPrimeiraHora: Number, // Valor da primeira hora
  valorHoraAdicional: Number,// Valor de cada hora adicional
  valorDiaria: Number,       // Valor da diária
  horaInicio: String,        // Hora de início da vigência (formato HH:MM)
  horaFim: String,           // Hora de fim da vigência (formato HH:MM)
  diasSemana: Array          // Dias da semana aplicáveis (0-6, onde 0 é domingo)
}
```

### Usuários
```javascript
{
  id: String,                // ID único do usuário
  nome: String,              // Nome do usuário
  usuario: String,           // Nome de usuário para login
  senha: String,             // Senha (hash)
  nivel: String,             // "admin", "operador"
  ativo: Boolean             // Status do usuário
}
```

## Simulação de APIs

Para demonstração do sistema, serão implementadas simulações de APIs utilizando localStorage:

1. **API de Consulta de Placas**
   - Simula a verificação se o veículo já passou pelo estabelecimento
   - Retorna modelo e cor se disponíveis

2. **API de Verificação de Pátio**
   - Verifica se o veículo já está no pátio
   - Retorna status e dados do veículo

3. **API de Mensalistas**
   - Verifica se a placa pertence a um mensalista
   - Retorna dados do mensalista

4. **API de Isentos**
   - Verifica se a placa pertence a um isento
   - Retorna dados do isento

5. **API de Serviços**
   - Retorna lista de serviços disponíveis e valores

6. **API de Mensagens**
   - Simula o envio de mensagens para clientes
   - Exibe notificação no sistema

## Responsividade

O sistema será desenvolvido seguindo o conceito de Mobile First, garantindo compatibilidade com:

- Smartphones (320px+)
- Tablets (768px+)
- Desktops (1024px+)
- Telas grandes (1440px+)

Serão utilizadas media queries para adaptar o layout a diferentes tamanhos de tela, e unidades relativas (rem, %, vh/vw) para garantir escalabilidade.

## Segurança

1. **Autenticação**
   - Armazenamento seguro de credenciais (hash de senhas)
   - Controle de sessão via localStorage com expiração

2. **Proteção de Rotas**
   - Verificação de autenticação em todas as páginas administrativas
   - Redirecionamento para login quando não autenticado

3. **Validação de Dados**
   - Validação de todos os inputs do usuário
   - Sanitização de dados antes do armazenamento
