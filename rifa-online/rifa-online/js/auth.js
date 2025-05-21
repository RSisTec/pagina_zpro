/**
 * Arquivo JavaScript para autenticação de administrador
 */

// Variáveis globais
let usuarioLogado = null;

// Função para inicializar a página
function inicializarPagina() {
    // Verificar se já está autenticado
    verificarAutenticacao();
    
    // Configurar eventos
    configurarEventos();
}

// Função para verificar autenticação
function verificarAutenticacao() {
    // Verificar se está na página de login
    const isLoginPage = window.location.pathname.includes('index.html') || 
                        window.location.pathname.endsWith('/admin/');
    
    // Obter token do localStorage
    const token = utils.obterLocalStorage('token');
    
    if (token) {
        // Verificar validade do token
        api.verificarAuth()
            .then(response => {
                if (response.success) {
                    usuarioLogado = response.data.usuario;
                    
                    // Se estiver na página de login, redirecionar para dashboard
                    if (isLoginPage) {
                        window.location.href = 'dashboard.html';
                    } else {
                        // Atualizar informações do usuário na página
                        atualizarInfoUsuario();
                    }
                } else {
                    // Token inválido, remover do localStorage
                    utils.removerLocalStorage('token');
                    
                    // Se não estiver na página de login, redirecionar
                    if (!isLoginPage) {
                        window.location.href = 'index.html';
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao verificar autenticação:', error);
                
                // Em caso de erro, remover token e redirecionar se necessário
                utils.removerLocalStorage('token');
                
                if (!isLoginPage) {
                    window.location.href = 'index.html';
                }
            });
    } else {
        // Sem token, verificar se precisa redirecionar
        if (!isLoginPage) {
            window.location.href = 'index.html';
        }
    }
}

// Função para atualizar informações do usuário na página
function atualizarInfoUsuario() {
    if (!usuarioLogado) return;
    
    // Atualizar nome e função do usuário
    const userNameElement = document.querySelector('.user-name');
    const userRoleElement = document.querySelector('.user-role');
    const userAvatarElement = document.querySelector('.user-avatar');
    
    if (userNameElement) {
        userNameElement.textContent = usuarioLogado.nome;
    }
    
    if (userRoleElement) {
        userRoleElement.textContent = obterTextoRole(usuarioLogado.role);
    }
    
    if (userAvatarElement) {
        // Obter iniciais do nome
        const iniciais = usuarioLogado.nome
            .split(' ')
            .map(nome => nome.charAt(0))
            .slice(0, 2)
            .join('');
        
        userAvatarElement.textContent = iniciais;
    }
}

// Função para obter texto da função do usuário
function obterTextoRole(role) {
    switch (role) {
        case 'admin':
            return 'Administrador';
        case 'manager':
            return 'Gerente';
        case 'editor':
            return 'Editor';
        default:
            return role;
    }
}

// Função para realizar login
async function realizarLogin(email, senha) {
    try {
        const response = await api.login(email, senha);
        
        if (response.success) {
            // Salvar token no localStorage
            utils.salvarLocalStorage('token', response.data.token);
            
            // Salvar dados do usuário
            usuarioLogado = response.data.usuario;
            
            // Redirecionar para dashboard
            window.location.href = 'dashboard.html';
            
            return true;
        } else {
            utils.mostrarNotificacao(response.message || 'Credenciais inválidas', 'erro');
            return false;
        }
    } catch (error) {
        console.error('Erro ao realizar login:', error);
        utils.mostrarNotificacao('Erro ao realizar login', 'erro');
        return false;
    }
}

// Função para realizar logout
function realizarLogout() {
    // Remover token do localStorage
    utils.removerLocalStorage('token');
    
    // Redirecionar para página de login
    window.location.href = 'index.html';
}

// Função para configurar eventos
function configurarEventos() {
    // Formulário de login
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const senha = document.getElementById('senha').value;
            
            if (!email || !senha) {
                utils.mostrarNotificacao('Preencha todos os campos', 'erro');
                return;
            }
            
            // Desabilitar botão durante o login
            const btnLogin = formLogin.querySelector('.btn-login');
            btnLogin.disabled = true;
            btnLogin.textContent = 'Entrando...';
            
            // Tentar realizar login
            const sucesso = await realizarLogin(email, senha);
            
            // Se não teve sucesso, habilitar botão novamente
            if (!sucesso) {
                btnLogin.disabled = false;
                btnLogin.textContent = 'Entrar';
            }
        });
    }
    
    // Botão de logout
    const btnLogout = document.querySelector('.btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', (e) => {
            e.preventDefault();
            realizarLogout();
        });
    }
    
    // Toggle de visibilidade de senha
    const togglePassword = document.querySelector('.toggle-password');
    if (togglePassword) {
        togglePassword.addEventListener('click', () => {
            const senhaInput = document.getElementById('senha');
            const type = senhaInput.getAttribute('type') === 'password' ? 'text' : 'password';
            senhaInput.setAttribute('type', type);
            togglePassword.classList.toggle('fa-eye');
            togglePassword.classList.toggle('fa-eye-slash');
        });
    }
    
    // Toggle do sidebar no mobile
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const adminSidebar = document.querySelector('.admin-sidebar');
    const adminContent = document.querySelector('.admin-content');
    
    if (toggleSidebar && adminSidebar) {
        toggleSidebar.addEventListener('click', () => {
            adminSidebar.classList.toggle('mobile-show');
        });
        
        // Fechar sidebar ao clicar fora
        document.addEventListener('click', (e) => {
            if (adminSidebar.classList.contains('mobile-show') && 
                !adminSidebar.contains(e.target) && 
                e.target !== toggleSidebar) {
                adminSidebar.classList.remove('mobile-show');
            }
        });
    }
    
    // Dropdown do usuário
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
    }
}

// Inicializar página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarPagina);
