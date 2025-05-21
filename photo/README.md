# Documentação do Photo Booth (Versão Estática)

## Visão Geral
Este é um aplicativo web simples de Photo Booth que funciona totalmente no frontend, sem necessidade de backend. Ele permite aos usuários:
- Capturar fotos usando a câmera do dispositivo
- Aplicar uma moldura decorativa à foto
- Tirar fotos com contagem regressiva de 3 segundos
- Visualizar a foto capturada
- Acessar a foto através de um QR code
- Armazenar fotos localmente no navegador
- Visualizar todas as fotos capturadas em uma área administrativa
- Enviar fotos para uma API externa via FormData (configurável)

## Estrutura do Projeto
```
photo_booth_static/
├── index.html           # Página principal de captura de fotos
├── admin.html           # Página administrativa
├── css/                 # Estilos CSS
│   └── style.css        # Arquivo de estilo principal
├── js/                  # Scripts JavaScript
│   ├── camera.js        # Lógica da câmera e captura
│   └── qrcode.min.js    # Biblioteca para geração de QR code
└── images/              # Pasta para imagens (opcional)
```

## Tecnologias Utilizadas
- HTML5
- CSS3
- JavaScript puro (sem frameworks)
- API MediaDevices para acesso à câmera
- Web Storage API (localStorage) para armazenamento local
- Canvas API para manipulação de imagens
- QRCode.js para geração de QR codes

## Funcionalidades

### Página Principal (Captura)
- Acessa a câmera do dispositivo
- Exibe uma moldura decorativa sobre a imagem da câmera
- Botão "Tirar Foto" inicia uma contagem regressiva de 3 segundos
- Após a contagem, captura a foto e a exibe na tela
- Gera um QR code para acesso à foto
- Salva a foto no armazenamento local do navegador
- Botão "Nova Foto" permite capturar outra imagem

### Página Administrativa
- Lista todas as fotos capturadas e armazenadas localmente
- Exibe a data e hora de cada captura
- Permite visualizar a foto em tamanho completo
- Permite excluir fotos individualmente
- Opção para limpar todas as fotos armazenadas

## Integração com API Externa
O sistema está preparado para enviar fotos para uma API externa. Para configurar:

1. Edite a função `uploadPhotoToAPI()` no arquivo `js/camera.js`
2. Atualize a URL da API no código:
   ```javascript
   const response = await fetch('https://sua-api-externa.com/upload', {
       method: 'POST',
       body: formData
   });
   ```

## Instalação e Uso
1. Faça o upload de todos os arquivos para qualquer servidor web simples
2. Não é necessário configurar backend, banco de dados ou servidor especial
3. Acesse o arquivo index.html pelo navegador para iniciar o uso
4. Permita o acesso à câmera quando solicitado pelo navegador

## Considerações Importantes
- As fotos são armazenadas no localStorage do navegador, que tem limite de espaço (geralmente 5-10MB)
- O acesso à câmera requer conexão HTTPS em ambientes de produção (exceto localhost)
- O QR code gerado aponta para a mesma aplicação com um parâmetro de URL para visualização da foto
- Funciona melhor em navegadores modernos (Chrome, Firefox, Edge, Safari)

## Personalização
- Para alterar a moldura, modifique o estilo CSS da classe `.frame` no arquivo `css/style.css`
- Para modificar o estilo visual, edite o arquivo `css/style.css`
- Para alterar o comportamento da câmera ou do armazenamento, edite o arquivo `js/camera.js`
