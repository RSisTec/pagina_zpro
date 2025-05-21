# Documentação do Site de Rifas Online

## Visão Geral

Este é um site completo para rifas online, desenvolvido com HTML, CSS e JavaScript puros, sem frameworks pesados ou backend complexo. O sistema permite a criação de múltiplas rifas, cada uma com seu próprio identificador, e oferece um painel administrativo para gerenciamento.

## Estrutura do Projeto

```
rifa-online/
├── index.html                  # Página inicial com listagem de rifas ativas
├── rifa.html                   # Página de visualização individual de rifa
├── historico.html              # Página de histórico de rifas
├── admin/                      # Painel administrativo
│   ├── index.html              # Página de login do administrador
│   ├── dashboard.html          # Painel principal do administrador
│   ├── criar-rifa.html         # Formulário para criar nova rifa
│   └── rifas.html              # Página para gerenciar rifas
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
│   ├── historico.js            # Lógica da página de histórico
│   ├── admin.js                # Lógica do painel administrativo
│   └── utils.js                # Funções utilitárias
└── img/                        # Diretório para imagens
```

## Funcionalidades Principais

### Área do Usuário
- Visualização de rifas disponíveis
- Filtro e busca de rifas
- Seleção de números
- Processo de checkout com dados do comprador
- Simulação de pagamento (PIX, cartão, boleto)
- Histórico de rifas anteriores

### Painel Administrativo
- Login seguro (usuário: admin@rifaonline.com.br, senha: admin123)
- Dashboard com estatísticas
- Criação e edição de rifas
- Gerenciamento de números e vendas
- Alteração de status das rifas
- Visualização de clientes

## Integração com APIs

O sistema está preparado para integração com APIs externas. Durante o desenvolvimento, utilizamos dados mockados para simular as respostas da API. Para integrar com uma API real, você deve configurar os endpoints no arquivo `js/api.js`.

### Endpoints Principais
- `/api/rifas` - Gerenciamento de rifas
- `/api/rifas/:id/numeros` - Gerenciamento de números
- `/api/auth` - Autenticação
- `/api/pagamentos` - Processamento de pagamentos

## Instruções de Implantação

### Requisitos
- Hospedagem web com suporte a HTML, CSS e JavaScript
- Servidor de API para fornecer os dados (opcional para testes)

### Passos para Implantação

1. **Preparação dos Arquivos**
   - Descompacte o arquivo `rifa-online.zip`
   - Personalize as informações conforme necessário (logo, cores, textos)

2. **Configuração da API**
   - Abra o arquivo `js/api.js`
   - Atualize a URL base da API (`BASE_URL`) para apontar para seu servidor
   - Verifique se os endpoints estão corretos para sua implementação

3. **Upload para Hospedagem**
   - Faça upload de todos os arquivos para sua hospedagem
   - Mantenha a estrutura de diretórios intacta

4. **Teste de Funcionamento**
   - Acesse o site pelo navegador
   - Verifique se todas as páginas estão carregando corretamente
   - Teste o fluxo de compra de números
   - Teste o painel administrativo

## Personalização

### Cores e Estilos
Para alterar as cores principais do site, edite as variáveis CSS no início do arquivo `css/style.css`:

```css
:root {
    --primary-color: #4e54c8;      /* Cor principal */
    --secondary-color: #ff6b6b;     /* Cor secundária */
    --text-color: #333333;          /* Cor do texto */
    /* outras variáveis... */
}
```

### Logotipo
Para substituir o logotipo:
1. Adicione sua imagem ao diretório `img/`
2. Atualize as referências no HTML ou substitua o texto "RifaOnline" nos arquivos HTML

### Textos e Conteúdo
Edite os arquivos HTML para personalizar textos, descrições e informações de contato.

## Modo de Desenvolvimento

Durante o desenvolvimento, o sistema utiliza dados mockados para simular as respostas da API. Isso permite testar todas as funcionalidades sem um backend real.

Para alternar entre dados mockados e API real:
1. Abra o arquivo `js/api.js`
2. Localize a função `request`
3. Modifique a condição que determina quando usar dados mockados

## Acesso ao Painel Administrativo

- URL: `seu-dominio.com/admin/`
- Usuário: admin@rifaonline.com.br
- Senha: admin123

## Suporte e Contato

Para dúvidas, suporte ou personalizações adicionais, entre em contato.

---

Desenvolvido com ❤️ para atender às suas necessidades de rifas online.
