// Arquivo específico para a página de login do superadmin
// Contém funções para autenticação e redirecionamento

document.addEventListener('DOMContentLoaded', function() {
    // Criar superadmin padrão imediatamente
    criarSuperadminPadrao();
    
    // Verificar se já está logado
    verificarSessao();
    
    // Inicializar formulário de login
    initializeLoginForm();
    
    // Inicializar notificação
    initializeNotification();
});

// Criar superadmin padrão
function criarSuperadminPadrao() {
    // Buscar superadmins
    const superadmins = JSON.parse(localStorage.getItem('superadmins') || '[]');
    
    // Se não existir nenhum superadmin, criar o padrão
    if (superadmins.length === 0) {
        const superadminPadrao = {
            id: 'super_' + Date.now().toString(36),
            nome: 'Super Admin',
            email: 'admin@sistema.com',
            login: 'superadmin',
            senha: 'super123',
            dataCriacao: new Date().getTime()
        };
        
        superadmins.push(superadminPadrao);
        localStorage.setItem('superadmins', JSON.stringify(superadmins));
        console.log('Superadmin padrão criado:', superadminPadrao);
    } else {
        console.log('Superadmins existentes:', superadmins);
    }
}

// Verificar sessão
function verificarSessao() {
    // Verificar se já existe uma sessão de superadmin
    superadminAPI.verificarSessaoSuperadmin()
        .then(session => {
            // Redirecionar para dashboard
            window.location.href = 'dashboard.html';
        })
        .catch(error => {
            // Não há sessão, continuar na página de login
        });
}

// Inicializar formulário de login
function initializeLoginForm() {
    const loginForm = document.getElementById('login-form');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const login = document.getElementById('login-username').value.trim();
            const senha = document.getElementById('login-password').value;
            
            // Validar campos
            if (!login) {
                showNotification('Por favor, digite o nome de usuário', 'error');
                return;
            }
            
            if (!senha) {
                showNotification('Por favor, digite a senha', 'error');
                return;
            }
            
            // Mostrar loader
            const btnSubmit = loginForm.querySelector('button[type="submit"]');
            const btnText = btnSubmit.innerHTML;
            btnSubmit.innerHTML = '<div class="loader-sm"></div>';
            btnSubmit.disabled = true;
            
            // Verificar se é o superadmin padrão
            if (login === 'superadmin' && senha === 'super123') {
                // Forçar criação da sessão diretamente
                const session = {
                    id: 'super_default',
                    nome: 'Super Admin',
                    email: 'admin@sistema.com',
                    login: 'superadmin',
                    dataLogin: new Date().getTime()
                };
                
                // Salvar sessão
                localStorage.setItem('superadmin_session', JSON.stringify(session));
                
                // Redirecionar para dashboard
                window.location.href = 'dashboard.html';
                return;
            }
            
            // Autenticar via API
            superadminAPI.autenticarSuperadmin(login, senha)
                .then(session => {
                    // Redirecionar para dashboard
                    window.location.href = 'dashboard.html';
                })
                .catch(error => {
                    // Mostrar erro
                    showNotification(error.mensagem || 'Erro ao fazer login', 'error');
                    
                    // Restaurar botão
                    btnSubmit.innerHTML = btnText;
                    btnSubmit.disabled = false;
                });
        });
    }
}

// Inicializar notificação
function initializeNotification() {
    const notification = document.getElementById('notification');
    const closeNotification = document.getElementById('close-notification');
    
    if (notification && closeNotification) {
        closeNotification.addEventListener('click', function() {
            notification.classList.remove('active');
        });
    }
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (notification && notificationMessage) {
        // Definir mensagem
        notificationMessage.textContent = message;
        
        // Definir tipo
        notification.className = 'notification';
        notification.classList.add(type);
        
        // Mostrar notificação
        notification.classList.add('active');
        
        // Esconder após 5 segundos
        setTimeout(() => {
            notification.classList.remove('active');
        }, 5000);
    }
}
