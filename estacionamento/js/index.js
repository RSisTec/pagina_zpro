// Arquivo específico para a página inicial
// Contém funções para consulta de veículos e exibição de resultados

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tabs de consulta
    initializeTabs();
    
    // Inicializar formulários de consulta
    initializeSearchForms();
    
    // Inicializar modal de resultado
    initializeResultModal();
});

// Inicializar tabs de consulta
function initializeTabs() {
    const tabs = document.querySelectorAll('.search-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            document.getElementById('ticket-tab').style.display = 'none';
            document.getElementById('telefone-tab').style.display = 'none';
            
            // Show selected tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId + '-tab').style.display = 'block';
        });
    });
}

// Inicializar formulários de consulta
function initializeSearchForms() {
    const ticketForm = document.getElementById('ticket-form');
    const telefoneForm = document.getElementById('telefone-form');
    
    // Formulário de consulta por ticket
    if (ticketForm) {
        ticketForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const ticket = document.getElementById('ticket').value.trim();
            
            if (!ticket) {
                showNotification('Por favor, digite o número do ticket', 'error');
                return;
            }
            
            // Consultar veículo por ticket
            const veiculo = utils.buscarVeiculoPorTicket(ticket);
            
            if (!veiculo) {
                showNotification('Veículo não encontrado. Verifique o número do ticket.', 'error');
                return;
            }
            
            // Exibir resultado
            exibirResultadoVeiculo(veiculo);
        });
    }
    
    // Formulário de consulta por telefone
    if (telefoneForm) {
        telefoneForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const telefone = document.getElementById('telefone').value.trim();
            
            if (!telefone) {
                showNotification('Por favor, digite o número de telefone', 'error');
                return;
            }
            
            if (!utils.validarTelefone(telefone)) {
                showNotification('Formato de telefone inválido. Use (XX) XXXXX-XXXX ou XXXXXXXXXXX.', 'error');
                return;
            }
            
            // Consultar veículos por telefone
            const veiculos = utils.buscarVeiculosPorTelefone(telefone);
            
            if (veiculos.length === 0) {
                showNotification('Nenhum veículo encontrado para este telefone.', 'error');
                return;
            }
            
            // Se houver mais de um veículo, exibir o mais recente no pátio
            const veiculosNoPatio = veiculos.filter(v => v.status === 'no_patio');
            
            if (veiculosNoPatio.length > 0) {
                // Ordenar por data de entrada (mais recente primeiro)
                veiculosNoPatio.sort((a, b) => b.entrada - a.entrada);
                exibirResultadoVeiculo(veiculosNoPatio[0]);
            } else {
                // Se não houver veículos no pátio, exibir o último finalizado
                veiculos.sort((a, b) => b.saida - a.saida);
                exibirResultadoVeiculo(veiculos[0]);
            }
        });
    }
}

// Inicializar modal de resultado
function initializeResultModal() {
    const resultModal = document.getElementById('result-modal');
    const closeModal = document.getElementById('close-modal');
    const closeResult = document.getElementById('close-result');
    
    if (resultModal) {
        // Função para mostrar modal
        window.showResultModal = function() {
            resultModal.classList.add('active');
        };
        
        // Função para esconder modal
        window.hideResultModal = function() {
            resultModal.classList.remove('active');
        };
        
        // Eventos de fechamento
        if (closeModal) {
            closeModal.addEventListener('click', hideResultModal);
        }
        
        if (closeResult) {
            closeResult.addEventListener('click', hideResultModal);
        }
        
        // Fechar modal ao clicar fora
        resultModal.addEventListener('click', function(e) {
            if (e.target === resultModal) {
                hideResultModal();
            }
        });
    }
}

// Exibir resultado da consulta de veículo
function exibirResultadoVeiculo(veiculo) {
    // Atualizar status
    const resultStatus = document.querySelector('.result-status');
    if (resultStatus) {
        if (veiculo.status === 'no_patio') {
            resultStatus.textContent = 'No Pátio';
            resultStatus.className = 'result-status active';
        } else {
            resultStatus.textContent = 'Finalizado';
            resultStatus.className = 'result-status completed';
        }
    }
    
    // Atualizar dados do veículo
    document.getElementById('result-placa').textContent = veiculo.placa;
    document.getElementById('result-modelo').textContent = veiculo.modelo;
    document.getElementById('result-cor').textContent = veiculo.cor;
    document.getElementById('result-entrada').textContent = utils.formatarData(veiculo.entrada);
    
    // Calcular e exibir tempo de permanência
    const tempoPermanencia = utils.calcularTempoPermanencia(veiculo.entrada, veiculo.saida);
    document.getElementById('result-tempo').textContent = tempoPermanencia;
    
    // Exibir número do ticket
    document.getElementById('result-ticket').textContent = '#' + veiculo.ticket;
    
    // Exibir localização do estacionamento
    document.getElementById('result-localizacao').textContent = 'Estacionamento Central - Rua das Flores, 123';
    
    // Mostrar modal com resultado
    showResultModal();
}
