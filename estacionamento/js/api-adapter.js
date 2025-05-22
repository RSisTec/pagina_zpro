// Arquivo para adaptar o frontend para usar a API PHP/PostgreSQL
// Este arquivo deve ser incluído em todas as páginas HTML para substituir o uso do localStorage

// Importar a API
document.addEventListener('DOMContentLoaded', function() {
    // Verificar se o script da API foi carregado
    if (typeof API === 'undefined') {
        console.error('API não foi carregada corretamente');
        return;
    }

    // Verificar autenticação em páginas protegidas
    const isLoginPage = window.location.pathname.includes('login.html');
    const isSuperadminLoginPage = window.location.pathname.includes('superadmin/login.html');
    const isIndexPage = window.location.pathname === '/' || 
                        window.location.pathname.endsWith('index.html') || 
                        window.location.pathname.endsWith('/');
    
    // Se não for página de login ou index, verificar autenticação
    if (!isLoginPage && !isSuperadminLoginPage && !isIndexPage) {
        if (!API.Auth.isAuthenticated()) {
            // Redirecionar para página de login apropriada
            if (window.location.pathname.includes('superadmin')) {
                window.location.href = '/superadmin/login.html';
            } else {
                window.location.href = '/pages/login.html';
            }
            return;
        }
        
        // Verificar se o token é válido
        API.Auth.verify().catch(error => {
            console.error('Erro ao verificar token:', error);
            // Redirecionar para página de login apropriada
            if (window.location.pathname.includes('superadmin')) {
                window.location.href = '/superadmin/login.html';
            } else {
                window.location.href = '/pages/login.html';
            }
        });
        
        // Verificar permissões específicas
        const user = API.Auth.getCurrentUser();
        
        // Verificar acesso a páginas de superadmin
        if (window.location.pathname.includes('superadmin') && !API.Auth.isSuperadmin()) {
            window.location.href = '/pages/login.html';
            return;
        }
        
        // Verificar acesso a páginas administrativas
        if (user && user.nivel === 'visualizador') {
            const adminPages = ['usuarios.html', 'precos.html'];
            const currentPage = window.location.pathname.split('/').pop();
            
            if (adminPages.includes(currentPage)) {
                window.location.href = '/pages/admin.html';
                return;
            }
        }
    }
    
    // Configurar elementos comuns em todas as páginas
    setupCommonElements();
});

// Configurar elementos comuns em todas as páginas
function setupCommonElements() {
    // Configurar informações do usuário no cabeçalho
    const userInfoElement = document.getElementById('user-info');
    if (userInfoElement) {
        const user = API.Auth.getCurrentUser();
        if (user) {
            userInfoElement.textContent = `${user.nome} (${user.nivel})`;
        }
    }
    
    // Configurar botão de logout
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        logoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            API.Auth.logout().then(() => {
                // Redirecionar para página de login apropriada
                if (window.location.pathname.includes('superadmin')) {
                    window.location.href = '/superadmin/login.html';
                } else {
                    window.location.href = '/pages/login.html';
                }
            }).catch(error => {
                console.error('Erro ao fazer logout:', error);
                alert('Erro ao fazer logout. Por favor, tente novamente.');
            });
        });
    }
    
    // Configurar informações da empresa
    const empresaInfoElement = document.getElementById('empresa-info');
    if (empresaInfoElement) {
        const user = API.Auth.getCurrentUser();
        if (user && user.empresa) {
            empresaInfoElement.textContent = user.empresa.nome;
        }
    }
}

// Função para formatar data
function formatarData(timestamp) {
    if (!timestamp) return '';
    const data = new Date(timestamp);
    return data.toLocaleDateString('pt-BR') + ' ' + data.toLocaleTimeString('pt-BR');
}

// Função para formatar valor monetário
function formatarValor(valor) {
    if (valor === null || valor === undefined) return 'R$ 0,00';
    return 'R$ ' + parseFloat(valor).toFixed(2).replace('.', ',');
}

// Função para formatar tempo de permanência
function formatarTempoPermanencia(milissegundos) {
    if (!milissegundos) return '';
    
    const segundos = Math.floor(milissegundos / 1000);
    const minutos = Math.floor(segundos / 60);
    const horas = Math.floor(minutos / 60);
    const dias = Math.floor(horas / 24);
    
    const minutosRestantes = minutos % 60;
    const horasRestantes = horas % 24;
    
    let resultado = '';
    
    if (dias > 0) {
        resultado += dias + 'd ';
    }
    
    if (horasRestantes > 0 || dias > 0) {
        resultado += horasRestantes + 'h ';
    }
    
    resultado += minutosRestantes + 'm';
    
    return resultado;
}

// Função para gerar um ticket aleatório
function gerarTicket() {
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let ticket = '';
    
    for (let i = 0; i < 6; i++) {
        ticket += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    return ticket;
}

// Função para mostrar mensagem de notificação
function mostrarNotificacao(mensagem, tipo = 'success') {
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao ${tipo}`;
    notificacao.textContent = mensagem;
    
    document.body.appendChild(notificacao);
    
    // Mostrar notificação
    setTimeout(() => {
        notificacao.classList.add('mostrar');
    }, 100);
    
    // Esconder notificação após 5 segundos
    setTimeout(() => {
        notificacao.classList.remove('mostrar');
        
        // Remover notificação do DOM após animação
        setTimeout(() => {
            document.body.removeChild(notificacao);
        }, 500);
    }, 5000);
}

// Função para mostrar modal de confirmação
function confirmar(mensagem) {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.className = 'modal-confirmacao';
        
        const conteudo = document.createElement('div');
        conteudo.className = 'modal-conteudo';
        
        const texto = document.createElement('p');
        texto.textContent = mensagem;
        
        const botoes = document.createElement('div');
        botoes.className = 'modal-botoes';
        
        const botaoSim = document.createElement('button');
        botaoSim.className = 'btn btn-primary';
        botaoSim.textContent = 'Sim';
        botaoSim.addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(true);
        });
        
        const botaoNao = document.createElement('button');
        botaoNao.className = 'btn btn-secondary';
        botaoNao.textContent = 'Não';
        botaoNao.addEventListener('click', () => {
            document.body.removeChild(modal);
            resolve(false);
        });
        
        botoes.appendChild(botaoSim);
        botoes.appendChild(botaoNao);
        
        conteudo.appendChild(texto);
        conteudo.appendChild(botoes);
        
        modal.appendChild(conteudo);
        
        document.body.appendChild(modal);
    });
}

// Função para mostrar modal de carregamento
function mostrarCarregamento(mensagem = 'Carregando...') {
    const modal = document.createElement('div');
    modal.className = 'modal-carregamento';
    modal.id = 'modal-carregamento';
    
    const conteudo = document.createElement('div');
    conteudo.className = 'modal-conteudo';
    
    const spinner = document.createElement('div');
    spinner.className = 'spinner';
    
    const texto = document.createElement('p');
    texto.textContent = mensagem;
    
    conteudo.appendChild(spinner);
    conteudo.appendChild(texto);
    
    modal.appendChild(conteudo);
    
    document.body.appendChild(modal);
}

// Função para esconder modal de carregamento
function esconderCarregamento() {
    const modal = document.getElementById('modal-carregamento');
    if (modal) {
        document.body.removeChild(modal);
    }
}

// Exportar funções úteis
window.Utils = {
    formatarData,
    formatarValor,
    formatarTempoPermanencia,
    gerarTicket,
    mostrarNotificacao,
    confirmar,
    mostrarCarregamento,
    esconderCarregamento
};
