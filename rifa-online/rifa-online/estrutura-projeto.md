# Estrutura do Projeto - Site de Rifas Online

## Estrutura de Diretórios
```
rifa-online/
├── index.html                  # Página inicial com listagem de rifas ativas
├── rifa.html                   # Página de visualização individual de rifa
├── historico.html              # Página de histórico de rifas
├── admin/
│   ├── index.html              # Página de login do administrador
│   ├── dashboard.html          # Painel principal do administrador
│   ├── criar-rifa.html         # Formulário para criar nova rifa
│   └── gerenciar-rifa.html     # Página para gerenciar rifa específica
├── css/
│   ├── style.css               # Estilos globais
│   ├── rifa.css                # Estilos específicos da página de rifa
│   ├── admin.css               # Estilos do painel administrativo
│   └── responsive.css          # Ajustes responsivos para diferentes dispositivos
├── js/
│   ├── main.js                 # Funções globais e inicialização
│   ├── api.js                  # Funções de comunicação com APIs
│   ├── auth.js                 # Lógica de autenticação
│   ├── rifa.js                 # Lógica específica da página de rifa
│   ├── admin.js                # Lógica do painel administrativo
│   └── utils.js                # Funções utilitárias
└── img/
    ├── logo.png                # Logo do site
    ├── icons/                  # Ícones utilizados no site
    └── placeholder.jpg         # Imagem placeholder para rifas sem imagem
```

## Arquitetura do Sistema

### Fluxo de Dados
1. **Carregamento de Dados**
   - Obtenção de rifas disponíveis via API
   - Armazenamento temporário em localStorage para melhor performance

2. **Autenticação**
   - Login de administrador via API
   - Armazenamento de token JWT em localStorage
   - Verificação de autenticação em rotas protegidas

3. **Gerenciamento de Rifas**
   - Criação/edição de rifas pelo administrador
   - Envio de dados para API
   - Atualização da interface após confirmação

4. **Compra de Números**
   - Seleção de números pelo usuário
   - Preenchimento de dados pessoais
   - Integração com API de pagamento
   - Reserva temporária e confirmação após pagamento

### Comunicação com APIs
- **Endpoint de Rifas**: `/api/rifas` - GET, POST, PUT
- **Endpoint de Autenticação**: `/api/auth` - POST
- **Endpoint de Números**: `/api/rifas/{id}/numeros` - GET, POST
- **Endpoint de Pagamentos**: `/api/pagamentos` - POST

### Armazenamento Local
- **localStorage**:
  - Token de autenticação
  - Dados de rifas em cache
  - Preferências do usuário

### Responsividade
- Design mobile-first
- Breakpoints para tablets (768px) e desktop (1024px)
- Adaptação de elementos para diferentes tamanhos de tela

### Segurança
- Validação de dados em formulários
- Proteção de rotas administrativas
- Sanitização de inputs
- Verificação de token em requisições autenticadas
