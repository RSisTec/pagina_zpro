/**
 * Arquivo de gerenciamento de modais
 * Responsável por controlar a exibição e comportamento dos modais
 */

// Variáveis globais para controle de modais
let modalAtivo = null;
let userId = null;
let countdownInterval = null;

// Função para abrir modal
function abrirModal(id) {
    // Fechar modal ativo, se houver
    if (modalAtivo) {
        fecharModal(modalAtivo);
    }
    
    const modal = document.getElementById(id);
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
        modalAtivo = id;
        
        // Foco no primeiro campo de input, se existir
        const primeiroInput = modal.querySelector('input');
        if (primeiroInput) {
            setTimeout(() => {
                primeiroInput.focus();
            }, 100);
        }
    }
}

// Função para fechar modal
function fecharModal(id) {
    const modal = document.getElementById(id);
    const overlay = document.querySelector('.modal-overlay');
    
    if (modal && overlay) {
        modal.classList.remove('active');
        overlay.classList.remove('active');
        
        if (modalAtivo === id) {
            modalAtivo = null;
        }
    }
    
    // Parar contador de reenvio, se estiver ativo
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}

// Função para mostrar mensagem de erro
function mostrarErro(mensagem) {
    const erroMensagem = document.getElementById('erro-mensagem');
    if (erroMensagem) {
        erroMensagem.textContent = mensagem;
        abrirModal('modal-erro');
    }
}

// Função para iniciar contador regressivo para reenvio de código
function iniciarContadorReenvio() {
    const countdownElement = document.getElementById('countdown');
    const resendLink = document.getElementById('resend-code');
    
    if (countdownElement && resendLink) {
        let segundos = 60;
        
        // Desabilitar link de reenvio
        resendLink.style.pointerEvents = 'none';
        resendLink.style.opacity = '0.5';
        
        // Mostrar contador
        countdownElement.textContent = `(${segundos}s)`;
        
        // Parar contador anterior, se existir
        if (countdownInterval) {
            clearInterval(countdownInterval);
        }
        
        // Iniciar novo contador
        countdownInterval = setInterval(() => {
            segundos--;
            countdownElement.textContent = `(${segundos}s)`;
            
            if (segundos <= 0) {
                clearInterval(countdownInterval);
                countdownInterval = null;
                countdownElement.textContent = '';
                
                // Habilitar link de reenvio
                resendLink.style.pointerEvents = 'auto';
                resendLink.style.opacity = '1';
            }
        }, 1000);
    }
}

// Configurar eventos dos modais quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    // Botões para abrir modal de cadastro
    const btnsCadastro = [
        document.getElementById('btn-cadastro'),
        document.getElementById('hero-cadastro'),
        document.getElementById('link-cadastro')
    ];
    
    btnsCadastro.forEach(btn => {
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                abrirModal('modal-cadastro');
            });
        }
    });
    
    // Botão para abrir modal de login
    const btnLogin = document.getElementById('btn-login');
    if (btnLogin) {
        btnLogin.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModal('modal-login');
        });
    }
    
    // Link para alternar para login dentro do modal de cadastro
    const linkLogin = document.getElementById('link-login');
    if (linkLogin) {
        linkLogin.addEventListener('click', function(e) {
            e.preventDefault();
            abrirModal('modal-login');
        });
    }
    
    // Botões para fechar modais
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            fecharModal(this.closest('.modal').id);
        });
    });
    
    // Fechar modal ao clicar no overlay
    const overlay = document.querySelector('.modal-overlay');
    if (overlay) {
        overlay.addEventListener('click', function() {
            if (modalAtivo) {
                fecharModal(modalAtivo);
            }
        });
    }
    
    // Formulário de cadastro
    const formCadastro = document.getElementById('form-cadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar formulário
            const validacao = validarFormularioCadastro();
            
            if (!validacao.valido) {
                mostrarErro(validacao.erros.join('\n'));
                return;
            }
            
            // Preparar dados para API
            const dados = {
                nome: document.getElementById('nome').value.trim(),
                documento: document.getElementById('documento').value.trim(),
                email: document.getElementById('email').value.trim(),
                telefone: document.getElementById('telefone').value.trim()
            };
            
            // Chamar API de cadastro
            apiCadastro(dados)
                .then(response => {
                    // Armazenar ID do usuário para uso posterior
                    userId = response.userId;
                    
                    // Abrir modal de código
                    abrirModal('modal-codigo');
                    
                    // Iniciar contador para reenvio
                    iniciarContadorReenvio();
                })
                .catch(error => {
                    mostrarErro(error.message);
                });
        });
    }
    
    // Formulário de confirmação de código
    const formCodigo = document.getElementById('form-codigo');
    if (formCodigo) {
        formCodigo.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validar código
            const validacao = validarCodigoConfirmacao();
            
            if (!validacao.valido) {
                mostrarErro('Por favor, preencha o código completo.');
                return;
            }
            
            // Chamar API de confirmação
            apiConfirmarCodigo(userId, validacao.codigo)
                .then(response => {
                    // Abrir modal de sucesso
                    abrirModal('modal-sucesso');
                })
                .catch(error => {
                    mostrarErro(error.message);
                });
        });
    }
    
    // Link para reenviar código
    const resendLink = document.getElementById('resend-code');
    if (resendLink) {
        resendLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Chamar API de reenvio
            apiReenviarCodigo(userId)
                .then(response => {
                    // Iniciar contador para reenvio
                    iniciarContadorReenvio();
                })
                .catch(error => {
                    mostrarErro(error.message);
                });
        });
    }
    
    // Botão para tentar novamente após erro
    const btnTentarNovamente = document.getElementById('btn-tentar-novamente');
    if (btnTentarNovamente) {
        btnTentarNovamente.addEventListener('click', function() {
            fecharModal('modal-erro');
        });
    }
    
    // Botão para começar a usar após cadastro bem-sucedido
    const btnComecar = document.getElementById('btn-comecar');
    if (btnComecar) {
        btnComecar.addEventListener('click', function() {
            fecharModal('modal-sucesso');
            // Aqui poderia redirecionar para área logada
        });
    }
    
    // Formulário de login
    const formLogin = document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = document.getElementById('login-email').value.trim();
            const senha = document.getElementById('login-senha').value.trim();
            
            if (!email || !senha) {
                mostrarErro('Por favor, preencha todos os campos.');
                return;
            }
            
            // Chamar API de login
            apiLogin(email, senha)
                .then(response => {
                    // Fechar modal de login
                    fecharModal('modal-login');
                    // Aqui poderia redirecionar para área logada
                })
                .catch(error => {
                    mostrarErro(error.message);
                });
        });
    }
});
