# Estrutura do Projeto - Site de Consulta de Placas

## Estrutura de Arquivos
```
consulta_placas_site/
├── index.html              # Página principal do site
├── css/
│   ├── style.css           # Estilos principais
│   └── responsive.css      # Estilos específicos para responsividade
├── js/
│   ├── main.js             # Lógica principal e inicialização
│   ├── modals.js           # Gerenciamento dos modais
│   ├── api.js              # Simulação de integração com APIs
│   └── validation.js       # Validação de formulários
├── assets/
│   ├── images/             # Imagens do site
│   └── icons/              # Ícones utilizados
└── README.md               # Documentação do projeto
```

## Layout da Página Principal

### Cabeçalho
- Logo do serviço de consulta de placas
- Menu de navegação (Home, Como Funciona, Contato)
- Botão de Login/Cadastro (abre o modal de cadastro)

### Banner Principal
- Imagem de fundo relacionada a veículos/placas
- Título chamativo: "Consulta de Placas Veiculares"
- Subtítulo: "Informações rápidas e precisas sobre veículos"
- CTA (Call to Action): "Cadastre-se e ganhe 5 créditos grátis"

### Seção de Planos de Créditos
- 3 cards de opções de compra:
  1. **Plano Básico**:
     - 10 créditos
     - Valor: R$ 29,90
     - Validade: 30 dias
     - Botão "Comprar Agora"
  
  2. **Plano Padrão**:
     - 30 créditos
     - Valor: R$ 69,90
     - Validade: 60 dias
     - Botão "Comprar Agora"
     - Tag "Mais Popular"
  
  3. **Plano Premium**:
     - 100 créditos
     - Valor: R$ 199,90
     - Validade: 90 dias
     - Botão "Comprar Agora"
     - Tag "Melhor Custo-Benefício"

### Seção "Como Funciona"
- Passo 1: Cadastre-se e receba 5 créditos grátis
- Passo 2: Escolha um plano de créditos
- Passo 3: Realize consultas de placas quando precisar

### Seção de Benefícios
- Rapidez nas consultas
- Informações confiáveis
- Suporte ao cliente
- Interface intuitiva

### Rodapé
- Links úteis
- Informações de contato
- Políticas de privacidade e termos de uso
- Copyright

## Modais

### Modal de Cadastro
- Campos:
  - Nome completo
  - CPF/CNPJ (com validação e formatação)
  - E-mail
  - Telefone (com formatação para WhatsApp)
- Checkbox para aceitar termos de uso
- Botão "Cadastrar"
- Link para já tenho cadastro

### Modal de Confirmação de Código
- Mensagem explicativa sobre o código enviado por WhatsApp
- Campo para inserir o código de 6 dígitos
- Botão para reenviar código
- Botão "Confirmar"
- Contador regressivo para reenvio

### Modal de Sucesso no Cadastro
- Ícone de sucesso
- Mensagem de boas-vindas
- Informação sobre os 5 créditos adicionados
- Botão "Começar a usar"

### Modal de Erro
- Ícone de alerta
- Mensagem de erro retornada pela API
- Botão "Tentar novamente"

## Fluxo de Usuário

1. Usuário acessa a página principal
2. Clica em "Cadastre-se" ou tenta comprar créditos sem estar logado
3. Modal de cadastro é exibido
4. Usuário preenche os dados e clica em "Cadastrar"
5. Sistema simula envio de código por WhatsApp
6. Modal de confirmação de código é exibido
7. Usuário insere o código recebido
8. Sistema valida o código:
   - Se válido: exibe modal de sucesso e redireciona para área logada
   - Se inválido: exibe modal de erro com a mensagem retornada pela API
9. Após logado, usuário pode comprar créditos
10. Ao clicar em "Comprar" em um dos planos, sistema simula processo de pagamento

## Simulação de APIs

### API de Cadastro
- Endpoint simulado: `/api/register`
- Método: POST
- Dados enviados: nome, cpf/cnpj, email, telefone
- Resposta de sucesso: `{success: true, message: "Código enviado com sucesso", userId: "12345"}`
- Resposta de erro: `{success: false, message: "Erro específico"}`

### API de Confirmação de Código
- Endpoint simulado: `/api/confirm-code`
- Método: POST
- Dados enviados: userId, code
- Resposta de sucesso: `{success: true, message: "Cadastro realizado com sucesso", credits: 5}`
- Resposta de erro: `{success: false, message: "Código inválido ou expirado"}`

### API de Compra de Créditos
- Endpoint simulado: `/api/buy-credits`
- Método: POST
- Dados enviados: userId, planId, paymentMethod
- Resposta de sucesso: `{success: true, message: "Compra realizada com sucesso", credits: X}`
- Resposta de erro: `{success: false, message: "Erro no processamento do pagamento"}`
