// Arquivo principal de JavaScript
// Contém funções utilitárias e inicialização global

// Configuração inicial
document.addEventListener('DOMContentLoaded', function() {
    // Inicializar dados de exemplo se não existirem
    initializeLocalStorage();
    
    // Inicializar componentes comuns
    initializeComponents();
});

// Inicialização do localStorage com dados de exemplo
function initializeLocalStorage() {
    // Verificar se já existem dados
    if (!localStorage.getItem('veiculos')) {
        // Criar alguns veículos de exemplo
        const veiculosExemplo = [
            {
                id: '1',
                placa: 'ABC1234',
                modelo: 'Gol G6',
                cor: 'Prata',
                ticket: '12345',
                telefone: '11999998888',
                entrada: new Date('2025-05-21T08:30:00').getTime(),
                saida: null,
                tipoCliente: 'normal',
                idCliente: null,
                servicos: [],
                valorTotal: 0,
                formaPagamento: null,
                cpfNota: null,
                status: 'no_patio'
            },
            {
                id: '2',
                placa: 'DEF5678',
                modelo: 'Civic',
                cor: 'Preto',
                ticket: '12346',
                telefone: '11999997777',
                entrada: new Date('2025-05-21T09:15:00').getTime(),
                saida: null,
                tipoCliente: 'mensalista',
                idCliente: '1',
                servicos: [],
                valorTotal: 0,
                formaPagamento: null,
                cpfNota: null,
                status: 'no_patio'
            },
            {
                id: '3',
                placa: 'GHI9012',
                modelo: 'Corolla',
                cor: 'Branco',
                ticket: '12347',
                telefone: '11999996666',
                entrada: new Date('2025-05-21T10:00:00').getTime(),
                saida: new Date('2025-05-21T12:30:00').getTime(),
                tipoCliente: 'normal',
                idCliente: null,
                servicos: [],
                valorTotal: 25.00,
                formaPagamento: 'cartao',
                cpfNota: '123.456.789-00',
                status: 'finalizado'
            }
        ];
        
        localStorage.setItem('veiculos', JSON.stringify(veiculosExemplo));
    }
    
    // Inicializar mensalistas se não existirem
    if (!localStorage.getItem('mensalistas')) {
        const mensalistasExemplo = [
            {
                id: '1',
                nome: 'João Silva',
                documento: '123.456.789-00',
                telefone: '11999995555',
                email: 'joao@exemplo.com',
                endereco: 'Rua Exemplo, 123',
                plano: 'Mensal',
                dataInicio: new Date('2025-05-01').getTime(),
                dataFim: new Date('2025-06-01').getTime(),
                veiculos: ['DEF5678']
            }
        ];
        
        localStorage.setItem('mensalistas', JSON.stringify(mensalistasExemplo));
    }
    
    // Inicializar isentos se não existirem
    if (!localStorage.getItem('isentos')) {
        const isentosExemplo = [
            {
                id: '1',
                nome: 'Maria Oliveira',
                documento: '987.654.321-00',
                motivo: 'Funcionário',
                veiculos: ['JKL3456']
            }
        ];
        
        localStorage.setItem('isentos', JSON.stringify(isentosExemplo));
    }
    
    // Inicializar serviços se não existirem
    if (!localStorage.getItem('servicos')) {
        const servicosExemplo = [
            {
                id: '1',
                nome: 'Lavagem Simples',
                descricao: 'Lavagem externa do veículo',
                valor: 30.00,
                tempoEstimado: 30
            },
            {
                id: '2',
                nome: 'Lavagem Completa',
                descricao: 'Lavagem externa e interna do veículo',
                valor: 60.00,
                tempoEstimado: 60
            },
            {
                id: '3',
                nome: 'Polimento',
                descricao: 'Polimento da pintura do veículo',
                valor: 120.00,
                tempoEstimado: 120
            }
        ];
        
        localStorage.setItem('servicos', JSON.stringify(servicosExemplo));
    }
    
    // Inicializar preços se não existirem
    if (!localStorage.getItem('precos')) {
        const precosExemplo = [
            {
                id: '1',
                nome: 'Padrão',
                valorPrimeiraHora: 10.00,
                valorHoraAdicional: 5.00,
                valorDiaria: 50.00,
                horaInicio: '00:00',
                horaFim: '23:59',
                diasSemana: [0, 1, 2, 3, 4, 5, 6]
            },
            {
                id: '2',
                nome: 'Noturno',
                valorPrimeiraHora: 12.00,
                valorHoraAdicional: 6.00,
                valorDiaria: 60.00,
                horaInicio: '18:00',
                horaFim: '06:00',
                diasSemana: [0, 1, 2, 3, 4, 5, 6]
            }
        ];
        
        localStorage.setItem('precos', JSON.stringify(precosExemplo));
    }
    
    // Inicializar usuários se não existirem
    if (!localStorage.getItem('usuarios')) {
        const usuariosExemplo = [
            {
                id: '1',
                nome: 'Administrador',
                usuario: 'admin',
                senha: 'admin', // Em produção, isso seria um hash
                nivel: 'admin',
                ativo: true
            }
        ];
        
        localStorage.setItem('usuarios', JSON.stringify(usuariosExemplo));
    }
}

// Inicialização de componentes comuns
function initializeComponents() {
    // Placeholder para o logo
    const logoPlaceholder = document.getElementById('logo-placeholder');
    if (logoPlaceholder) {
        logoPlaceholder.onerror = function() {
            this.src = 'https://via.placeholder.com/150x50?text=EstacionaFacil';
        };
    }
    
    // Toggle do menu mobile
    const navToggle = document.getElementById('nav-toggle');
    const navList = document.getElementById('nav-list');
    
    if (navToggle && navList) {
        navToggle.addEventListener('click', function() {
            navList.classList.toggle('active');
        });
    }
    
    // Inicializar notificações
    initializeNotifications();
}

// Sistema de notificações
function initializeNotifications() {
    window.showNotification = function(message, type = 'info') {
        const notification = document.getElementById('notification');
        const notificationMessage = document.getElementById('notification-message');
        const closeNotification = document.getElementById('close-notification');
        
        if (notification && notificationMessage) {
            notificationMessage.textContent = message;
            notification.className = 'notification notification-' + type + ' show';
            
            setTimeout(function() {
                hideNotification();
            }, 5000);
        }
        
        if (closeNotification) {
            closeNotification.addEventListener('click', hideNotification);
        }
    };
    
    window.hideNotification = function() {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.classList.remove('show');
        }
    };
}

// Funções utilitárias

// Formatar data
function formatarData(timestamp) {
    if (!timestamp) return '';
    
    const data = new Date(timestamp);
    const dia = String(data.getDate()).padStart(2, '0');
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const ano = data.getFullYear();
    const hora = String(data.getHours()).padStart(2, '0');
    const minuto = String(data.getMinutes()).padStart(2, '0');
    
    return `${dia}/${mes}/${ano} ${hora}:${minuto}`;
}

// Calcular tempo de permanência
function calcularTempoPermanencia(entrada, saida = null) {
    if (!entrada) return '';
    
    const dataEntrada = new Date(entrada);
    const dataSaida = saida ? new Date(saida) : new Date();
    
    const diffMs = dataSaida - dataEntrada;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${diffHrs}h ${diffMins}min`;
}

// Calcular valor a pagar
function calcularValorAPagar(entrada, saida = null, tipoCliente = 'normal') {
    if (!entrada || tipoCliente !== 'normal') return 0;
    
    const dataEntrada = new Date(entrada);
    const dataSaida = saida ? new Date(saida) : new Date();
    
    const diffMs = dataSaida - dataEntrada;
    const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
    
    // Buscar preço atual
    const precos = JSON.parse(localStorage.getItem('precos') || '[]');
    if (precos.length === 0) return 0;
    
    const precoPadrao = precos[0];
    
    // Calcular valor
    let valor = 0;
    if (diffHrs <= 1) {
        valor = precoPadrao.valorPrimeiraHora;
    } else {
        valor = precoPadrao.valorPrimeiraHora + (diffHrs - 1) * precoPadrao.valorHoraAdicional;
    }
    
    // Se o valor ultrapassar a diária, cobrar apenas a diária
    if (valor > precoPadrao.valorDiaria) {
        valor = precoPadrao.valorDiaria;
    }
    
    return valor;
}

// Gerar ID único
function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Gerar número de ticket
function gerarTicket() {
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    const ultimoTicket = veiculos.length > 0 ? parseInt(veiculos[veiculos.length - 1].ticket || '0') : 0;
    return String(ultimoTicket + 1).padStart(5, '0');
}

// Verificar se veículo está no pátio
function verificarVeiculoNoPatio(placa) {
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    return veiculos.find(v => v.placa === placa && v.status === 'no_patio');
}

// Buscar veículo por placa
function buscarVeiculoPorPlaca(placa) {
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    return veiculos.find(v => v.placa === placa);
}

// Buscar veículo por ticket
function buscarVeiculoPorTicket(ticket) {
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    return veiculos.find(v => v.ticket === ticket);
}

// Buscar veículo por telefone
function buscarVeiculosPorTelefone(telefone) {
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    return veiculos.filter(v => v.telefone === telefone);
}

// Verificar se veículo é de mensalista
function verificarMensalista(placa) {
    const mensalistas = JSON.parse(localStorage.getItem('mensalistas') || '[]');
    return mensalistas.find(m => m.veiculos.includes(placa));
}

// Verificar se veículo é isento
function verificarIsento(placa) {
    const isentos = JSON.parse(localStorage.getItem('isentos') || '[]');
    return isentos.find(i => i.veiculos.includes(placa));
}

// Adicionar veículo ao pátio
function adicionarVeiculoAoPatio(veiculo) {
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    veiculos.push(veiculo);
    localStorage.setItem('veiculos', JSON.stringify(veiculos));
    return veiculo;
}

// Atualizar veículo
function atualizarVeiculo(veiculo) {
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    const index = veiculos.findIndex(v => v.id === veiculo.id);
    
    if (index !== -1) {
        veiculos[index] = veiculo;
        localStorage.setItem('veiculos', JSON.stringify(veiculos));
        return veiculo;
    }
    
    return null;
}

// Remover veículo do pátio (dar baixa)
function removerVeiculoDoPatio(id, formaPagamento, cpfNota) {
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    const index = veiculos.findIndex(v => v.id === id && v.status === 'no_patio');
    
    if (index !== -1) {
        const veiculo = veiculos[index];
        veiculo.saida = new Date().getTime();
        veiculo.status = 'finalizado';
        veiculo.formaPagamento = formaPagamento;
        veiculo.cpfNota = cpfNota;
        veiculo.valorTotal = calcularValorAPagar(veiculo.entrada, veiculo.saida, veiculo.tipoCliente);
        
        veiculos[index] = veiculo;
        localStorage.setItem('veiculos', JSON.stringify(veiculos));
        return veiculo;
    }
    
    return null;
}

// Validar placa de veículo (formato brasileiro)
function validarPlaca(placa) {
    // Formato antigo: ABC1234
    const regexAntigo = /^[A-Z]{3}[0-9]{4}$/;
    
    // Formato Mercosul: ABC1D23
    const regexMercosul = /^[A-Z]{3}[0-9]{1}[A-Z]{1}[0-9]{2}$/;
    
    return regexAntigo.test(placa) || regexMercosul.test(placa);
}

// Validar telefone (formato brasileiro)
function validarTelefone(telefone) {
    // Remove caracteres não numéricos
    const numeroLimpo = telefone.replace(/\D/g, '');
    
    // Verifica se tem entre 10 e 11 dígitos (com ou sem DDD)
    return numeroLimpo.length >= 10 && numeroLimpo.length <= 11;
}

// Validar CPF
function validarCPF(cpf) {
    // Remove caracteres não numéricos
    const cpfLimpo = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpfLimpo.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1+$/.test(cpfLimpo)) return false;
    
    // Validação do primeiro dígito verificador
    let soma = 0;
    for (let i = 0; i < 9; i++) {
        soma += parseInt(cpfLimpo.charAt(i)) * (10 - i);
    }
    let resto = 11 - (soma % 11);
    let digitoVerificador1 = resto === 10 || resto === 11 ? 0 : resto;
    
    if (digitoVerificador1 !== parseInt(cpfLimpo.charAt(9))) return false;
    
    // Validação do segundo dígito verificador
    soma = 0;
    for (let i = 0; i < 10; i++) {
        soma += parseInt(cpfLimpo.charAt(i)) * (11 - i);
    }
    resto = 11 - (soma % 11);
    let digitoVerificador2 = resto === 10 || resto === 11 ? 0 : resto;
    
    return digitoVerificador2 === parseInt(cpfLimpo.charAt(10));
}

// Verificar autenticação
function verificarAutenticacao() {
    const session = JSON.parse(localStorage.getItem('session') || 'null');
    
    if (!session) {
        return false;
    }
    
    // Verificar se a sessão expirou
    if (new Date().getTime() > session.expiresAt) {
        localStorage.removeItem('session');
        return false;
    }
    
    return session;
}

// Proteger rota administrativa
function protegerRota() {
    const session = verificarAutenticacao();
    
    if (!session) {
        window.location.href = 'login.html';
        return false;
    }
    
    return session;
}

// Formatar moeda (R$)
function formatarMoeda(valor) {
    return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

// Simular envio de mensagem para o cliente
function enviarMensagemParaCliente(telefone, mensagem) {
    console.log(`Mensagem enviada para ${telefone}: ${mensagem}`);
    return true;
}

// Exportar funções para uso global
window.utils = {
    formatarData,
    calcularTempoPermanencia,
    calcularValorAPagar,
    gerarId,
    gerarTicket,
    verificarVeiculoNoPatio,
    buscarVeiculoPorPlaca,
    buscarVeiculoPorTicket,
    buscarVeiculosPorTelefone,
    verificarMensalista,
    verificarIsento,
    adicionarVeiculoAoPatio,
    atualizarVeiculo,
    removerVeiculoDoPatio,
    validarPlaca,
    validarTelefone,
    validarCPF,
    verificarAutenticacao,
    protegerRota,
    formatarMoeda,
    enviarMensagemParaCliente
};
