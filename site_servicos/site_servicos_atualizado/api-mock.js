// Simulação de API para testes do formulário de contato
// Este arquivo deve ser executado com Node.js

const http = require('http');
const url = require('url');

// Configuração do servidor
const hostname = '0.0.0.0'; // Permite acesso de qualquer origem
const port = 3000;

// Criação do servidor
const server = http.createServer((req, res) => {
  // Configurar cabeçalhos CORS para permitir requisições de qualquer origem
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Lidar com requisições OPTIONS (preflight CORS)
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    res.end();
    return;
  }
  
  // Verificar se é uma requisição POST para o endpoint /contato
  const parsedUrl = url.parse(req.url, true);
  
  if (req.method === 'POST' && parsedUrl.pathname === '/contato') {
    let body = '';
    
    // Coletar dados do corpo da requisição
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    // Processar dados quando a requisição estiver completa
    req.on('end', () => {
      try {
        // Tentar fazer o parse do JSON
        const formData = JSON.parse(body);
        console.log('Dados recebidos:', formData);
        
        // Verificar se todos os campos obrigatórios estão presentes
        if (!formData.nome || !formData.email || !formData.servico || !formData.mensagem) {
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            sucesso: false, 
            mensagem: 'Campos obrigatórios não preenchidos' 
          }));
          return;
        }
        
        // Simular processamento (poderia ser salvamento em banco de dados, envio de email, etc.)
        setTimeout(() => {
          // Responder com sucesso
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ 
            sucesso: true, 
            mensagem: 'Mensagem recebida com sucesso!',
            id: Date.now() // Simula um ID único para a mensagem
          }));
        }, 1000); // Simula um atraso de 1 segundo no processamento
        
      } catch (error) {
        // Erro ao fazer parse do JSON
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ 
          sucesso: false, 
          mensagem: 'Formato de dados inválido' 
        }));
      }
    });
  } else {
    // Rota não encontrada
    res.statusCode = 404;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ 
      sucesso: false, 
      mensagem: 'Endpoint não encontrado' 
    }));
  }
});

// Iniciar o servidor
server.listen(port, hostname, () => {
  console.log(`Servidor mock de API rodando em http://${hostname}:${port}`);
  console.log('Endpoint disponível: POST /contato');
  console.log('Pressione Ctrl+C para encerrar');
});
