// Arquivo principal de JavaScript
// Contém funções utilitárias e componentes reutilizáveis

// Namespace para funções utilitárias
const utils = {
    // Formatar moeda
    formatarMoeda: function(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    },
    
    // Formatar data
    formatarData: function(timestamp) {
        return new Date(timestamp).toLocaleDateString('pt-BR');
    },
    
    // Formatar data e hora
    formatarDataHora: function(timestamp) {
        return new Date(timestamp).toLocaleString('pt-BR');
    },
    
    // Calcular tempo de permanência
    calcularTempoPermanencia: function(entrada, saida) {
        const diff = saida - entrada;
        const segundos = Math.floor(diff / 1000);
        const minutos = Math.floor(segundos / 60);
        const horas = Math.floor(minutos / 60);
        const dias = Math.floor(horas / 24);
        
        if (dias > 0) {
            return `${dias}d ${horas % 24}h ${minutos % 60}m`;
        } else {
            return `${horas}h ${minutos % 60}m`;
        }
    },
    
    // Gerar número de ticket
    gerarTicket: function() {
        const data = new Date();
        const ano = data.getFullYear().toString().substr(2);
        const mes = (data.getMonth() + 1).toString().padStart(2, '0');
        const dia = data.getDate().toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        
        return `${ano}${mes}${dia}${random}`;
    },
    
    // Validar email
    validarEmail: function(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Validar placa
    validarPlaca: function(placa) {
        // Formato antigo: AAA-1234
        // Formato novo: AAA1A34
        const reAntigo = /^[A-Z]{3}-\d{4}$/;
        const reNovo = /^[A-Z]{3}\d[A-Z]\d{2}$/;
        
        return reAntigo.test(placa) || reNovo.test(placa);
    },
    
    // Proteger rota (verificar autenticação)
    protegerRota: function() {
        // Verificar se existe sessão
        const session = JSON.parse(localStorage.getItem('session') || 'null');
        
        if (!session) {
            // Redirecionar para login
            window.location.href = 'login.html';
            return null;
        }
        
        // Verificar se a empresa está ativa
        const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
        const empresa = empresas.find(e => e.id === session.empresaId);
        
        if (!empresa || !empresa.status) {
            // Remover sessão
            localStorage.removeItem('session');
            
            // Redirecionar para login com mensagem
            localStorage.setItem('login_message', 'A empresa está inativa. Entre em contato com o suporte.');
            window.location.href = 'login.html';
            return null;
        }
        
        // Verificar se a licença está válida
        const hoje = new Date().getTime();
        if (empresa.dataFimLicenca < hoje) {
            // Remover sessão
            localStorage.removeItem('session');
            
            // Redirecionar para login com mensagem
            localStorage.setItem('login_message', 'A licença da empresa expirou. Entre em contato com o suporte.');
            window.location.href = 'login.html';
            return null;
        }
        
        return session;
    },
    
    // Obter dados da empresa atual
    obterEmpresaAtual: function() {
        // Verificar se existe sessão
        const session = JSON.parse(localStorage.getItem('session') || 'null');
        
        if (!session) {
            return null;
        }
        
        // Buscar empresa
        const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
        return empresas.find(e => e.id === session.empresaId) || null;
    },
    
    // Prefixar chave do localStorage com ID da empresa
    getStorageKey: function(key) {
        const session = JSON.parse(localStorage.getItem('session') || 'null');
        
        if (!session) {
            return key;
        }
        
        return `${session.empresaId}_${key}`;
    },
    
    // Obter dados do localStorage com prefixo da empresa
    getStorageData: function(key, defaultValue = '[]') {
        const storageKey = this.getStorageKey(key);
        return JSON.parse(localStorage.getItem(storageKey) || defaultValue);
    },
    
    // Salvar dados no localStorage com prefixo da empresa
    setStorageData: function(key, data) {
        const storageKey = this.getStorageKey(key);
        localStorage.setItem(storageKey, JSON.stringify(data));
    }
};

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

// Inicializar componentes comuns
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar notificação
    initializeNotification();
    
    // Exibir informações da empresa no cabeçalho (se estiver logado)
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    
    if (session) {
        // Exibir nome da empresa
        const empresaNomeElement = document.querySelector('.empresa-nome');
        if (empresaNomeElement) {
            empresaNomeElement.textContent = session.empresa;
        }
        
        // Exibir nome do usuário
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = session.nome;
        }
        
        // Exibir nível do usuário
        const userRoleElement = document.querySelector('.user-role');
        if (userRoleElement) {
            userRoleElement.textContent = session.nivel === 'admin' ? 'Administrador' : 
                                          (session.nivel === 'operador' ? 'Operador' : 'Visualizador');
        }
    }
});
