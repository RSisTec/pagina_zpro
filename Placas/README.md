# ConsultaPlacas - Site de Consulta de Placas Veiculares

Este projeto consiste em um site de e-commerce para venda de créditos de consulta de placas veiculares, desenvolvido com HTML, CSS e JavaScript puro para hospedagem simples.

## Estrutura do Projeto

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

## Funcionalidades Implementadas

1. **Página Principal**
   - Layout responsivo com 3 opções de compra de créditos
   - Seções informativas sobre o serviço
   - Design moderno e atraente

2. **Sistema de Cadastro**
   - Modal de cadastro com validação de campos
   - Confirmação de código via WhatsApp (simulado)
   - Tratamento de erros e mensagens de feedback

3. **Sistema de Compra**
   - Opções de planos de créditos
   - Simulação de compra e adição de créditos
   - Verificação de usuário logado

4. **Simulação de API**
   - Cadastro de usuário
   - Confirmação de código
   - Login
   - Compra de créditos
   - Consulta de placas

## Instruções de Integração

### Integração com API Real

Para integrar com sua API real, você precisará modificar os arquivos em `js/api.js`. As funções simuladas já estão estruturadas de forma semelhante a chamadas reais de API:

1. **Cadastro de Usuário**
   - Função: `apiCadastro(dados)`
   - Substitua o conteúdo da função pela chamada real à sua API

2. **Confirmação de Código**
   - Função: `apiConfirmarCodigo(userId, codigo)`
   - Substitua o conteúdo da função pela chamada real à sua API

3. **Login**
   - Função: `apiLogin(email, senha)`
   - Substitua o conteúdo da função pela chamada real à sua API

4. **Compra de Créditos**
   - Função: `apiComprarCreditos(plano)`
   - Substitua o conteúdo da função pela chamada real à sua API

5. **Consulta de Placas**
   - Função: `apiConsultarPlaca(placa)`
   - Substitua o conteúdo da função pela chamada real à sua API

### Exemplo de Integração

```javascript
// Exemplo de como modificar a função apiCadastro para usar uma API real
function apiCadastro(dados) {
    return fetch('https://sua-api.com/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(dados)
    })
    .then(response => response.json())
    .then(data => {
        if (!data.success) {
            throw data;
        }
        return data;
    });
}
```

## Personalização

### Cores e Estilos

As cores principais do site podem ser facilmente modificadas editando as variáveis CSS no início do arquivo `css/style.css`:

```css
:root {
    --primary-color: #3498db;
    --primary-dark: #2980b9;
    --secondary-color: #2ecc71;
    --accent-color: #f39c12;
    --dark-color: #2c3e50;
    --light-color: #ecf0f1;
    /* ... outras variáveis ... */
}
```

### Imagens

Para substituir as imagens, coloque seus arquivos na pasta `assets/images/` e atualize as referências no CSS e HTML conforme necessário.

## Hospedagem

Este site foi projetado para funcionar em qualquer hospedagem simples que suporte arquivos estáticos (HTML, CSS, JS). Basta fazer upload de todos os arquivos mantendo a estrutura de diretórios.

## Observações Importantes

1. Este site utiliza armazenamento em memória para simulação. Em um ambiente de produção, você precisará implementar persistência de dados através de sua API.

2. As senhas não estão sendo tratadas de forma segura nesta simulação. Em um ambiente real, utilize HTTPS e práticas seguras de autenticação.

3. O código está comentado para facilitar a compreensão e modificação.

4. Para testar o fluxo completo, abra o console do navegador para ver os códigos de verificação gerados durante o cadastro.

---

© 2025 ConsultaPlacas - Desenvolvido para consulta de placas veiculares
