// URL da API para autenticação (substitua pela URL real da sua API)
const AUTH_API_URL = 'https://api.exemplo.com/auth';

// Função para autenticar o usuário
async function autenticarUsuario(username, password) {
    try {
        // Exibir indicador de carregamento (pode ser implementado conforme necessário)
        document.querySelector('.btn-login').innerHTML = '<i class="fas fa-spinner fa-spin"></i> Autenticando...';
        document.querySelector('.btn-login').disabled = true;
        
        // Em um ambiente real, descomentar a linha abaixo para autenticar via API real
        // const response = await fetch(AUTH_API_URL, {
        //     method: 'POST',
        //     headers: {
        //         'Content-Type': 'application/json'
        //     },
        //     body: JSON.stringify({ username, password })
        // });
        
        // Para fins de demonstração, simulamos uma resposta da API
        // Em produção, remova este bloco e use o fetch real acima
        const mockResponse = {
            ok: true,
            json: async () => {
                // Simulando um pequeno atraso como em uma API real
                await new Promise(resolve => setTimeout(resolve, 800));
                
                // Credenciais para teste (em produção, isso seria validado pelo backend)
                if (username === 'admin' && password === 'admin123') {
                    return {
                        success: true,
                        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFkbWluIiwiaWF0IjoxNjE2MTQ4MzY1fQ.example-token',
                        user: {
                            id: 1,
                            username: 'admin',
                            name: 'Administrador'
                        }
                    };
                } else {
                    return {
                        success: false,
                        message: 'Credenciais inválidas'
                    };
                }
            }
        };
        
        // Usar a resposta simulada para demonstração
        const response = mockResponse;
        
        // Obter os dados da resposta
        const data = await response.json();
        
        // Restaurar o botão
        document.querySelector('.btn-login').innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        document.querySelector('.btn-login').disabled = false;
        
        if (data.success) {
            // Armazenar o token e informações do usuário no localStorage
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userData', JSON.stringify(data.user));
            
            // Redirecionar para a página de administração
            window.location.href = 'admin.html';
        } else {
            // Exibir mensagem de erro
            const errorElement = document.getElementById('login-error');
            errorElement.style.display = 'block';
            errorElement.querySelector('p').textContent = data.message || 'Usuário ou senha incorretos. Tente novamente.';
        }
        
    } catch (error) {
        console.error('Erro ao autenticar:', error);
        
        // Restaurar o botão
        document.querySelector('.btn-login').innerHTML = '<i class="fas fa-sign-in-alt"></i> Entrar';
        document.querySelector('.btn-login').disabled = false;
        
        // Exibir mensagem de erro
        const errorElement = document.getElementById('login-error');
        errorElement.style.display = 'block';
        errorElement.querySelector('p').textContent = 'Erro ao conectar com o servidor. Tente novamente mais tarde.';
    }
}

// Verificar se o usuário já está autenticado
function verificarAutenticacao() {
    const token = localStorage.getItem('authToken');
    if (token) {
        // Redirecionar para a página de administração
        window.location.href = 'admin.html';
    }
}

// Inicializar a página de login
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se o usuário já está autenticado
    verificarAutenticacao();
    
    // Adicionar evento de submit ao formulário
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Autenticar o usuário
        autenticarUsuario(username, password);
    });
});
