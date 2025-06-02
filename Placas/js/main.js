/**
 * Arquivo principal de JavaScript
 * Responsável pela inicialização e comportamentos gerais do site
 */

// Variáveis globais
let usuarioLogado = null;

// Função para inicializar o site
function inicializarSite() {
    // Configurar menu mobile
    configurarMenuMobile();
    
    // Configurar botões de compra
    configurarBotoesCompra();
    
    // Configurar rolagem suave para links internos
    configurarRolagemSuave();
    
    // Verificar se há usuário logado (simulação)
    verificarLogin();
}

// Função para configurar menu mobile
function configurarMenuMobile() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (menuToggle && mainNav) {
        menuToggle.addEventListener('click', function() {
            mainNav.classList.toggle('active');
            
            if (window.innerWidth <= 480 && authButtons) {
                authButtons.classList.toggle('active');
            }
        });
        
        // Fechar menu ao clicar em um link
        const navLinks = mainNav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                if (window.innerWidth <= 768) {
                    mainNav.classList.remove('active');
                    
                    if (window.innerWidth <= 480 && authButtons) {
                        authButtons.classList.remove('active');
                    }
                }
            });
        });
    }
}

// Função para configurar botões de compra
function configurarBotoesCompra() {
    const botoesBuy = document.querySelectorAll('.btn-buy');
    
    botoesBuy.forEach(btn => {
        btn.addEventListener('click', function() {
            const plano = this.getAttribute('data-plan');
            
            // Verificar se usuário está logado
            if (!usuarioLogado) {
                // Se não estiver logado, abrir modal de cadastro
                abrirModal('modal-cadastro');
                return;
            }
            
            // Se estiver logado, simular compra
            apiComprarCreditos(plano)
                .then(response => {
                    // Exibir mensagem de sucesso
                    mostrarErro(response.message); // Reutilizando o modal de erro para mensagens de sucesso
                })
                .catch(error => {
                    mostrarErro(error.message);
                });
        });
    });
}

// Função para configurar rolagem suave para links internos
function configurarRolagemSuave() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 70, // Ajuste para o cabeçalho fixo
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Função para verificar se há usuário logado (simulação)
function verificarLogin() {
    // Nesta simulação, não há persistência de login entre recarregamentos de página
    usuarioLogado = null;
    
    // Atualizar interface com base no status de login
    atualizarInterfaceLogin();
}

// Função para atualizar interface com base no status de login
function atualizarInterfaceLogin() {
    const btnCadastro = document.getElementById('btn-cadastro');
    const btnLogin = document.getElementById('btn-login');
    
    if (usuarioLogado) {
        // Usuário logado
        if (btnCadastro) {
            btnCadastro.textContent = `${usuarioLogado.creditos} créditos`;
            btnCadastro.classList.add('btn-credits');
        }
        
        if (btnLogin) {
            btnLogin.textContent = 'Minha Conta';
        }
    } else {
        // Usuário não logado
        if (btnCadastro) {
            btnCadastro.textContent = 'Cadastre-se';
            btnCadastro.classList.remove('btn-credits');
        }
        
        if (btnLogin) {
            btnLogin.textContent = 'Login';
        }
    }
}

// Função para definir usuário logado
function definirUsuarioLogado(usuario) {
    usuarioLogado = usuario;
    atualizarInterfaceLogin();
}

// Inicializar site quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', inicializarSite);

// Exportar funções para uso em outros arquivos
window.definirUsuarioLogado = definirUsuarioLogado;
