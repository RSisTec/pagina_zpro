// Adaptação do arquivo login.js para usar a API PHP/PostgreSQL

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário de login
    const loginForm = document.getElementById('login-form');
    const loginInput = document.getElementById('login');
    const senhaInput = document.getElementById('senha');
    
    // Verificar se já está autenticado
    if (API.Auth.isAuthenticated()) {
        // Redirecionar para a página administrativa
        window.location.href = '/pages/admin.html';
        return;
    }
    
    // Configurar formulário de login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const login = loginInput.value.trim();
            const senha = senhaInput.value.trim();
            
            if (!login || !senha) {
                Utils.mostrarNotificacao('Por favor, preencha todos os campos', 'error');
                return;
            }
            
            // Mostrar carregamento
            Utils.mostrarCarregamento('Autenticando...');
            
            // Fazer login
            API.Auth.login(login, senha)
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        Utils.mostrarNotificacao('Login realizado com sucesso!', 'success');
                        
                        // Redirecionar para a página administrativa
                        setTimeout(() => {
                            window.location.href = '/pages/admin.html';
                        }, 1000);
                    } else {
                        Utils.mostrarNotificacao(response.message || 'Erro ao fazer login', 'error');
                    }
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao fazer login: ' + error.message, 'error');
                });
        });
    }
});
