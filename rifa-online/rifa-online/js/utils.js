/**
 * Arquivo de funções utilitárias para o site de rifas
 */

// Formatadores
const utils = {
    // Formata valor para moeda brasileira
    formatarMoeda: (valor) => {
        return valor.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    },

    // Formata data para formato brasileiro
    formatarData: (data) => {
        if (!data) return '';
        const dataObj = new Date(data);
        return dataObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    },

    // Formata data e hora para formato brasileiro
    formatarDataHora: (data) => {
        if (!data) return '';
        const dataObj = new Date(data);
        return dataObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    // Formata CPF com máscara
    formatarCPF: (cpf) => {
        return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    },

    // Formata telefone com máscara
    formatarTelefone: (telefone) => {
        if (telefone.length === 11) {
            return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        } else {
            return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        }
    },

    // Gera um ID aleatório para rifas
    gerarIdRifa: () => {
        return Math.random().toString(36).substring(2, 15) + 
               Math.random().toString(36).substring(2, 15);
    },

    // Valida e-mail
    validarEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },

    // Valida CPF
    validarCPF: (cpf) => {
        cpf = cpf.replace(/[^\d]/g, '');
        
        if (cpf.length !== 11) return false;
        
        // Verifica se todos os dígitos são iguais
        if (/^(\d)\1+$/.test(cpf)) return false;
        
        // Validação do primeiro dígito verificador
        let soma = 0;
        for (let i = 0; i < 9; i++) {
            soma += parseInt(cpf.charAt(i)) * (10 - i);
        }
        let resto = 11 - (soma % 11);
        let digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;
        
        if (digitoVerificador1 !== parseInt(cpf.charAt(9))) return false;
        
        // Validação do segundo dígito verificador
        soma = 0;
        for (let i = 0; i < 10; i++) {
            soma += parseInt(cpf.charAt(i)) * (11 - i);
        }
        resto = 11 - (soma % 11);
        let digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;
        
        return digitoVerificador2 === parseInt(cpf.charAt(10));
    },

    // Aplica máscara de CPF durante digitação
    mascaraCPF: (input) => {
        let valor = input.value.replace(/\D/g, '');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
        valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        input.value = valor;
    },

    // Aplica máscara de telefone durante digitação
    mascaraTelefone: (input) => {
        let valor = input.value.replace(/\D/g, '');
        if (valor.length > 10) {
            valor = valor.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
        } else {
            valor = valor.replace(/^(\d{2})(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        }
        input.value = valor;
    },

    // Trunca texto com reticências
    truncarTexto: (texto, limite) => {
        if (texto.length <= limite) return texto;
        return texto.substring(0, limite) + '...';
    },

    // Salva dados no localStorage
    salvarLocalStorage: (chave, valor) => {
        localStorage.setItem(chave, JSON.stringify(valor));
    },

    // Recupera dados do localStorage
    obterLocalStorage: (chave) => {
        const valor = localStorage.getItem(chave);
        return valor ? JSON.parse(valor) : null;
    },

    // Remove dados do localStorage
    removerLocalStorage: (chave) => {
        localStorage.removeItem(chave);
    },

    // Verifica se o usuário está autenticado
    verificarAutenticacao: () => {
        const token = localStorage.getItem('token');
        return !!token;
    },

    // Obtém token de autenticação
    obterToken: () => {
        return localStorage.getItem('token');
    },

    // Copia texto para a área de transferência
    copiarParaClipboard: (texto) => {
        const textarea = document.createElement('textarea');
        textarea.value = texto;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
    },

    // Exibe notificação temporária
    mostrarNotificacao: (mensagem, tipo = 'sucesso', duracao = 3000) => {
        const notificacao = document.createElement('div');
        notificacao.className = `notificacao notificacao-${tipo}`;
        notificacao.innerHTML = `
            <div class="notificacao-conteudo">
                <i class="fas ${tipo === 'sucesso' ? 'fa-check-circle' : 
                               tipo === 'erro' ? 'fa-times-circle' : 
                               tipo === 'aviso' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
                <span>${mensagem}</span>
            </div>
        `;
        
        document.body.appendChild(notificacao);
        
        // Animar entrada
        setTimeout(() => {
            notificacao.classList.add('mostrar');
        }, 10);
        
        // Remover após a duração
        setTimeout(() => {
            notificacao.classList.remove('mostrar');
            setTimeout(() => {
                document.body.removeChild(notificacao);
            }, 300);
        }, duracao);
    },

    // Adiciona máscara de carregamento
    mostrarCarregamento: (elemento, mensagem = 'Carregando...') => {
        const carregamento = document.createElement('div');
        carregamento.className = 'carregamento-overlay';
        carregamento.innerHTML = `
            <div class="carregamento-conteudo">
                <i class="fas fa-spinner fa-spin"></i>
                <p>${mensagem}</p>
            </div>
        `;
        
        elemento.classList.add('posicao-relativa');
        elemento.appendChild(carregamento);
        
        return carregamento;
    },

    // Remove máscara de carregamento
    removerCarregamento: (elemento, carregamento) => {
        if (carregamento && elemento.contains(carregamento)) {
            elemento.removeChild(carregamento);
        }
        elemento.classList.remove('posicao-relativa');
    },

    // Obtém parâmetros da URL
    obterParametrosUrl: () => {
        const params = new URLSearchParams(window.location.search);
        const parametros = {};
        
        for (const [chave, valor] of params) {
            parametros[chave] = valor;
        }
        
        return parametros;
    },

    // Obtém um parâmetro específico da URL
    obterParametroUrl: (nome) => {
        const params = new URLSearchParams(window.location.search);
        return params.get(nome);
    },

    // Compartilhar conteúdo
    compartilhar: (titulo, texto, url) => {
        if (navigator.share) {
            navigator.share({
                title: titulo,
                text: texto,
                url: url
            })
            .catch(error => console.error('Erro ao compartilhar:', error));
        } else {
            // Fallback para navegadores que não suportam a API Web Share
            utils.copiarParaClipboard(url);
            utils.mostrarNotificacao('Link copiado para a área de transferência!', 'info');
        }
    }
};

// Adiciona estilos CSS para notificações e carregamento
(function() {
    const style = document.createElement('style');
    style.textContent = `
        .posicao-relativa {
            position: relative !important;
        }
        
        .carregamento-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(255, 255, 255, 0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
        }
        
        .carregamento-conteudo {
            text-align: center;
        }
        
        .carregamento-conteudo i {
            font-size: 2rem;
            color: var(--primary-color);
            margin-bottom: 10px;
        }
        
        .notificacao {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 9999;
            transform: translateX(120%);
            transition: transform 0.3s ease;
        }
        
        .notificacao.mostrar {
            transform: translateX(0);
        }
        
        .notificacao-conteudo {
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .notificacao-sucesso {
            background-color: #4caf50;
            color: white;
        }
        
        .notificacao-erro {
            background-color: #f44336;
            color: white;
        }
        
        .notificacao-aviso {
            background-color: #ff9800;
            color: white;
        }
        
        .notificacao-info {
            background-color: #2196f3;
            color: white;
        }
    `;
    document.head.appendChild(style);
})();

// Inicialização de eventos comuns
document.addEventListener('DOMContentLoaded', () => {
    // Toggle do menu mobile
    const menuToggle = document.querySelector('.menu-toggle');
    const mainNav = document.querySelector('.main-nav');
    const overlay = document.querySelector('.overlay');
    
    if (menuToggle && mainNav && overlay) {
        menuToggle.addEventListener('click', () => {
            menuToggle.classList.toggle('active');
            mainNav.classList.toggle('active');
            overlay.classList.toggle('active');
        });
        
        overlay.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mainNav.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
    
    // Aplicar máscaras em inputs
    const cpfInputs = document.querySelectorAll('input[id="cpf"]');
    cpfInputs.forEach(input => {
        input.addEventListener('input', () => utils.mascaraCPF(input));
    });
    
    const telefoneInputs = document.querySelectorAll('input[id="telefone"]');
    telefoneInputs.forEach(input => {
        input.addEventListener('input', () => utils.mascaraTelefone(input));
    });
    
    // Toggle de visibilidade de senha
    const togglePassword = document.querySelectorAll('.toggle-password');
    togglePassword.forEach(toggle => {
        toggle.addEventListener('click', () => {
            const input = toggle.previousElementSibling;
            const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
            input.setAttribute('type', type);
            toggle.classList.toggle('fa-eye');
            toggle.classList.toggle('fa-eye-slash');
        });
    });
});

// Exporta o objeto utils para uso global
window.utils = utils;
