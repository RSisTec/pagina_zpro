// Arquivo específico para a área administrativa
// Contém funções para gerenciamento de veículos, login e dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const session = utils.protegerRota();
    if (!session) return;
    
    // Atualizar informações do usuário
    document.getElementById('user-name').textContent = session.nome;
    document.getElementById('user-level').textContent = session.nivel === 'admin' ? 'Admin' : 'Operador';
    
    // Inicializar componentes da área administrativa
    initializeSidebar();
    initializeLogout();
    initializeModals();
    initializeEntradaForm();
    initializeSaidaForm();
    initializeServicoForm();
    
    // Carregar dados iniciais
    carregarDashboard();
    carregarVeiculosNoPatio();
});

// Inicializar sidebar
function initializeSidebar() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.getElementById('sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('sidebar-collapsed');
        });
    }
    
    // Em telas menores, fechar sidebar ao clicar em um link
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (window.innerWidth < 992) {
                sidebar.classList.remove('active');
            }
        });
    });
}

// Inicializar logout
function initializeLogout() {
    const logoutLink = document.getElementById('logout-link');
    
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remover sessão
            localStorage.removeItem('session');
            
            // Redirecionar para login
            window.location.href = 'login.html';
        });
    }
}

// Inicializar modais
function initializeModals() {
    // Modal de Entrada
    const entradaModal = document.getElementById('entrada-modal');
    const btnEntrada = document.getElementById('btn-entrada');
    const closeEntradaModal = document.getElementById('close-entrada-modal');
    
    if (entradaModal && btnEntrada && closeEntradaModal) {
        btnEntrada.addEventListener('click', function() {
            entradaModal.classList.add('active');
        });
        
        closeEntradaModal.addEventListener('click', function() {
            entradaModal.classList.remove('active');
        });
        
        entradaModal.addEventListener('click', function(e) {
            if (e.target === entradaModal) {
                entradaModal.classList.remove('active');
            }
        });
    }
    
    // Modal de Saída
    const saidaModal = document.getElementById('saida-modal');
    const btnSaida = document.getElementById('btn-saida');
    const closeSaidaModal = document.getElementById('close-saida-modal');
    
    if (saidaModal && btnSaida && closeSaidaModal) {
        btnSaida.addEventListener('click', function() {
            saidaModal.classList.add('active');
        });
        
        closeSaidaModal.addEventListener('click', function() {
            saidaModal.classList.remove('active');
        });
        
        saidaModal.addEventListener('click', function(e) {
            if (e.target === saidaModal) {
                saidaModal.classList.remove('active');
            }
        });
    }
    
    // Modal de Serviço
    const servicoModal = document.getElementById('servico-modal');
    const btnServico = document.getElementById('btn-servico');
    const closeServicoModal = document.getElementById('close-servico-modal');
    
    if (servicoModal && btnServico && closeServicoModal) {
        btnServico.addEventListener('click', function() {
            servicoModal.classList.add('active');
            carregarServicos();
        });
        
        closeServicoModal.addEventListener('click', function() {
            servicoModal.classList.remove('active');
        });
        
        servicoModal.addEventListener('click', function(e) {
            if (e.target === servicoModal) {
                servicoModal.classList.remove('active');
            }
        });
    }
}

// Inicializar formulário de entrada
function initializeEntradaForm() {
    // Elementos do formulário
    const entradaForm = document.getElementById('entrada-form');
    const entradaPlaca = document.getElementById('entrada-placa');
    const btnConsultarPlaca = document.getElementById('btn-consultar-placa');
    const btnVoltarPlaca = document.getElementById('btn-voltar-placa');
    const btnAvancarContato = document.getElementById('btn-avancar-contato');
    const btnVoltarDados = document.getElementById('btn-voltar-dados');
    
    // Steps do formulário
    const stepPlaca = document.getElementById('step-placa');
    const stepDados = document.getElementById('step-dados');
    const stepContato = document.getElementById('step-contato');
    
    const stepPlacaContent = document.getElementById('step-placa-content');
    const stepDadosContent = document.getElementById('step-dados-content');
    const stepContatoContent = document.getElementById('step-contato-content');
    
    // Alertas
    const alertaVeiculoPatio = document.getElementById('alerta-veiculo-patio');
    const alertaMensalista = document.getElementById('alerta-mensalista');
    const alertaIsento = document.getElementById('alerta-isento');
    
    // Campos de dados
    const entradaModelo = document.getElementById('entrada-modelo');
    const entradaCor = document.getElementById('entrada-cor');
    const entradaTelefone = document.getElementById('entrada-telefone');
    const entradaObservacoes = document.getElementById('entrada-observacoes');
    
    // Variáveis de controle
    let veiculoConsultado = null;
    let mensalistaConsultado = null;
    let isentoConsultado = null;
    
    // Consultar placa
    if (btnConsultarPlaca) {
        btnConsultarPlaca.addEventListener('click', function() {
            const placa = entradaPlaca.value.trim().toUpperCase();
            
            if (!placa) {
                showNotification('Por favor, digite a placa do veículo', 'error');
                return;
            }
            
            if (!utils.validarPlaca(placa)) {
                showNotification('Formato de placa inválido. Use ABC1234 ou ABC1D23.', 'error');
                return;
            }
            
            // Verificar se veículo já está no pátio
            const veiculoNoPatio = utils.verificarVeiculoNoPatio(placa);
            if (veiculoNoPatio) {
                alertaVeiculoPatio.style.display = 'block';
                alertaMensalista.style.display = 'none';
                alertaIsento.style.display = 'none';
                
                entradaModelo.value = veiculoNoPatio.modelo;
                entradaCor.value = veiculoNoPatio.cor;
                
                veiculoConsultado = veiculoNoPatio;
                mensalistaConsultado = null;
                isentoConsultado = null;
                
                // Avançar para o próximo step
                avancarParaDados();
                return;
            }
            
            // Verificar se é mensalista
            const mensalista = utils.verificarMensalista(placa);
            if (mensalista) {
                alertaVeiculoPatio.style.display = 'none';
                alertaMensalista.style.display = 'block';
                alertaIsento.style.display = 'none';
                
                mensalistaConsultado = mensalista;
                isentoConsultado = null;
            } else {
                alertaMensalista.style.display = 'none';
            }
            
            // Verificar se é isento
            const isento = utils.verificarIsento(placa);
            if (isento) {
                alertaVeiculoPatio.style.display = 'none';
                alertaIsento.style.display = 'block';
                
                isentoConsultado = isento;
                if (!mensalistaConsultado) {
                    alertaMensalista.style.display = 'none';
                }
            } else {
                alertaIsento.style.display = 'none';
            }
            
            // Buscar veículo no histórico
            const veiculoHistorico = utils.buscarVeiculoPorPlaca(placa);
            if (veiculoHistorico) {
                entradaModelo.value = veiculoHistorico.modelo;
                entradaCor.value = veiculoHistorico.cor;
                veiculoConsultado = veiculoHistorico;
            } else {
                entradaModelo.value = '';
                entradaCor.value = '';
                veiculoConsultado = null;
            }
            
            // Avançar para o próximo step
            avancarParaDados();
        });
    }
    
    // Avançar para dados
    function avancarParaDados() {
        stepPlaca.classList.remove('active');
        stepDados.classList.add('active');
        stepContato.classList.remove('active');
        
        stepPlacaContent.style.display = 'none';
        stepDadosContent.style.display = 'block';
        stepContatoContent.style.display = 'none';
    }
    
    // Voltar para placa
    if (btnVoltarPlaca) {
        btnVoltarPlaca.addEventListener('click', function() {
            stepPlaca.classList.add('active');
            stepDados.classList.remove('active');
            stepContato.classList.remove('active');
            
            stepPlacaContent.style.display = 'block';
            stepDadosContent.style.display = 'none';
            stepContatoContent.style.display = 'none';
        });
    }
    
    // Avançar para contato
    if (btnAvancarContato) {
        btnAvancarContato.addEventListener('click', function() {
            const modelo = entradaModelo.value.trim();
            const cor = entradaCor.value.trim();
            
            if (!modelo) {
                showNotification('Por favor, digite o modelo do veículo', 'error');
                return;
            }
            
            if (!cor) {
                showNotification('Por favor, digite a cor do veículo', 'error');
                return;
            }
            
            stepPlaca.classList.remove('active');
            stepDados.classList.remove('active');
            stepContato.classList.add('active');
            
            stepPlacaContent.style.display = 'none';
            stepDadosContent.style.display = 'none';
            stepContatoContent.style.display = 'block';
        });
    }
    
    // Voltar para dados
    if (btnVoltarDados) {
        btnVoltarDados.addEventListener('click', function() {
            stepPlaca.classList.remove('active');
            stepDados.classList.add('active');
            stepContato.classList.remove('active');
            
            stepPlacaContent.style.display = 'none';
            stepDadosContent.style.display = 'block';
            stepContatoContent.style.display = 'none';
        });
    }
    
    // Submeter formulário
    if (entradaForm) {
        entradaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const placa = entradaPlaca.value.trim().toUpperCase();
            const modelo = entradaModelo.value.trim();
            const cor = entradaCor.value.trim();
            const telefone = entradaTelefone.value.trim();
            const observacoes = entradaObservacoes.value.trim();
            
            if (!telefone) {
                showNotification('Por favor, digite o telefone do cliente', 'error');
                return;
            }
            
            if (!utils.validarTelefone(telefone)) {
                showNotification('Formato de telefone inválido. Use (XX) XXXXX-XXXX ou XXXXXXXXXXX.', 'error');
                return;
            }
            
            // Determinar tipo de cliente
            let tipoCliente = 'normal';
            let idCliente = null;
            
            if (mensalistaConsultado) {
                tipoCliente = 'mensalista';
                idCliente = mensalistaConsultado.id;
            } else if (isentoConsultado) {
                tipoCliente = 'isento';
                idCliente = isentoConsultado.id;
            }
            
            // Criar novo veículo
            const novoVeiculo = {
                id: utils.gerarId(),
                placa: placa,
                modelo: modelo,
                cor: cor,
                ticket: utils.gerarTicket(),
                telefone: telefone,
                entrada: new Date().getTime(),
                saida: null,
                tipoCliente: tipoCliente,
                idCliente: idCliente,
                servicos: [],
                valorTotal: 0,
                formaPagamento: null,
                cpfNota: null,
                status: 'no_patio',
                observacoes: observacoes
            };
            
            // Adicionar veículo ao pátio
            utils.adicionarVeiculoAoPatio(novoVeiculo);
            
            // Enviar mensagem para o cliente
            const mensagem = `Seu veículo ${modelo} (${placa}) foi registrado no estacionamento. Seu ticket é #${novoVeiculo.ticket}.`;
            utils.enviarMensagemParaCliente(telefone, mensagem);
            
            // Fechar modal e atualizar lista
            document.getElementById('entrada-modal').classList.remove('active');
            
            // Limpar formulário
            entradaForm.reset();
            alertaVeiculoPatio.style.display = 'none';
            alertaMensalista.style.display = 'none';
            alertaIsento.style.display = 'none';
            
            // Voltar para o primeiro step
            stepPlaca.classList.add('active');
            stepDados.classList.remove('active');
            stepContato.classList.remove('active');
            
            stepPlacaContent.style.display = 'block';
            stepDadosContent.style.display = 'none';
            stepContatoContent.style.display = 'none';
            
            // Atualizar dashboard e lista de veículos
            carregarDashboard();
            carregarVeiculosNoPatio();
            
            // Mostrar notificação
            showNotification('Veículo adicionado com sucesso!', 'success');
        });
    }
}

// Inicializar formulário de saída
function initializeSaidaForm() {
    // Elementos do formulário
    const saidaForm = document.getElementById('saida-form');
    const saidaTicket = document.getElementById('saida-ticket');
    const btnConsultarTicket = document.getElementById('btn-consultar-ticket');
    const btnVoltarTicket = document.getElementById('btn-voltar-ticket');
    const btnAvancarFinalizar = document.getElementById('btn-avancar-finalizar');
    
    // Steps do formulário
    const stepTicket = document.getElementById('step-ticket');
    const stepPagamento = document.getElementById('step-pagamento');
    const stepFinalizar = document.getElementById('step-finalizar');
    
    const stepTicketContent = document.getElementById('step-ticket-content');
    const stepPagamentoContent = document.getElementById('step-pagamento-content');
    const stepFinalizarContent = document.getElementById('step-finalizar-content');
    
    // Campos de resultado
    const saidaPlaca = document.getElementById('saida-placa');
    const saidaModelo = document.getElementById('saida-modelo');
    const saidaEntrada = document.getElementById('saida-entrada');
    const saidaTempo = document.getElementById('saida-tempo');
    const saidaValor = document.getElementById('saida-valor');
    const saidaStatus = document.getElementById('saida-status');
    
    // Campos de pagamento
    const saidaPagamento = document.getElementById('saida-pagamento');
    const saidaCpfCheck = document.getElementById('saida-cpf-check');
    const saidaCpfContainer = document.getElementById('saida-cpf-container');
    const saidaCpf = document.getElementById('saida-cpf');
    
    // Variáveis de controle
    let veiculoConsultado = null;
    
    // Consultar ticket
    if (btnConsultarTicket) {
        btnConsultarTicket.addEventListener('click', function() {
            const ticket = saidaTicket.value.trim();
            
            if (!ticket) {
                showNotification('Por favor, digite o número do ticket', 'error');
                return;
            }
            
            // Buscar veículo por ticket
            const veiculo = utils.buscarVeiculoPorTicket(ticket);
            
            if (!veiculo) {
                showNotification('Veículo não encontrado. Verifique o número do ticket.', 'error');
                return;
            }
            
            if (veiculo.status !== 'no_patio') {
                showNotification('Este veículo não está mais no pátio.', 'error');
                return;
            }
            
            // Preencher dados do veículo
            saidaPlaca.textContent = veiculo.placa;
            saidaModelo.textContent = veiculo.modelo;
            saidaEntrada.textContent = utils.formatarData(veiculo.entrada);
            saidaTempo.textContent = utils.calcularTempoPermanencia(veiculo.entrada);
            
            // Calcular valor a pagar
            const valor = utils.calcularValorAPagar(veiculo.entrada, null, veiculo.tipoCliente);
            saidaValor.textContent = utils.formatarMoeda(valor);
            
            // Atualizar status
            saidaStatus.textContent = 'No Pátio';
            saidaStatus.className = 'result-status active';
            
            // Guardar veículo consultado
            veiculoConsultado = veiculo;
            
            // Avançar para o próximo step
            avancarParaPagamento();
        });
    }
    
    // Avançar para pagamento
    function avancarParaPagamento() {
        stepTicket.classList.remove('active');
        stepPagamento.classList.add('active');
        stepFinalizar.classList.remove('active');
        
        stepTicketContent.style.display = 'none';
        stepPagamentoContent.style.display = 'block';
        stepFinalizarContent.style.display = 'none';
    }
    
    // Voltar para ticket
    if (btnVoltarTicket) {
        btnVoltarTicket.addEventListener('click', function() {
            stepTicket.classList.add('active');
            stepPagamento.classList.remove('active');
            stepFinalizar.classList.remove('active');
            
            stepTicketContent.style.display = 'block';
            stepPagamentoContent.style.display = 'none';
            stepFinalizarContent.style.display = 'none';
        });
    }
    
    // Toggle CPF
    if (saidaCpfCheck) {
        saidaCpfCheck.addEventListener('change', function() {
            saidaCpfContainer.style.display = this.checked ? 'block' : 'none';
        });
    }
    
    // Avançar para finalizar
    if (btnAvancarFinalizar) {
        btnAvancarFinalizar.addEventListener('click', function() {
            const formaPagamento = saidaPagamento.value;
            
            if (!formaPagamento) {
                showNotification('Por favor, selecione a forma de pagamento', 'error');
                return;
            }
            
            // Verificar CPF se marcado
            if (saidaCpfCheck.checked) {
                const cpf = saidaCpf.value.trim();
                
                if (!cpf) {
                    showNotification('Por favor, digite o CPF', 'error');
                    return;
                }
                
                if (!utils.validarCPF(cpf)) {
                    showNotification('CPF inválido. Verifique o número digitado.', 'error');
                    return;
                }
            }
            
            // Avançar para o próximo step
            stepTicket.classList.remove('active');
            stepPagamento.classList.remove('active');
            stepFinalizar.classList.add('active');
            
            stepTicketContent.style.display = 'none';
            stepPagamentoContent.style.display = 'none';
            stepFinalizarContent.style.display = 'block';
        });
    }
    
    // Submeter formulário
    if (saidaForm) {
        saidaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (!veiculoConsultado) {
                showNotification('Veículo não encontrado.', 'error');
                return;
            }
            
            const formaPagamento = saidaPagamento.value;
            const cpf = saidaCpfCheck.checked ? saidaCpf.value.trim() : null;
            
            // Remover veículo do pátio
            const veiculoAtualizado = utils.removerVeiculoDoPatio(veiculoConsultado.id, formaPagamento, cpf);
            
            if (!veiculoAtualizado) {
                showNotification('Erro ao finalizar saída do veículo.', 'error');
                return;
            }
            
            // Enviar mensagem para o cliente
            const mensagem = `Seu veículo ${veiculoAtualizado.modelo} (${veiculoAtualizado.placa}) foi retirado do estacionamento. Valor: ${utils.formatarMoeda(veiculoAtualizado.valorTotal)}.`;
            utils.enviarMensagemParaCliente(veiculoAtualizado.telefone, mensagem);
            
            // Fechar modal e atualizar lista
            document.getElementById('saida-modal').classList.remove('active');
            
            // Limpar formulário
            saidaForm.reset();
            saidaCpfContainer.style.display = 'none';
            
            // Voltar para o primeiro step
            stepTicket.classList.add('active');
            stepPagamento.classList.remove('active');
            stepFinalizar.classList.remove('active');
            
            stepTicketContent.style.display = 'block';
            stepPagamentoContent.style.display = 'none';
            stepFinalizarContent.style.display = 'none';
            
            // Atualizar dashboard e lista de veículos
            carregarDashboard();
            carregarVeiculosNoPatio();
            
            // Mostrar notificação
            showNotification('Saída de veículo registrada com sucesso!', 'success');
        });
    }
}

// Inicializar formulário de serviço
function initializeServicoForm() {
    const servicoForm = document.getElementById('servico-form');
    const servicoPlaca = document.getElementById('servico-placa');
    const servicoTipo = document.getElementById('servico-tipo');
    const servicoTelefone = document.getElementById('servico-telefone');
    
    // Carregar serviços disponíveis
    function carregarServicos() {
        const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
        
        // Limpar select
        servicoTipo.innerHTML = '<option value="">Selecione o serviço</option>';
        
        // Adicionar opções
        servicos.forEach(servico => {
            const option = document.createElement('option');
            option.value = servico.id;
            option.textContent = `${servico.nome} - ${utils.formatarMoeda(servico.valor)}`;
            servicoTipo.appendChild(option);
        });
    }
    
    // Expor função para uso global
    window.carregarServicos = carregarServicos;
    
    // Submeter formulário
    if (servicoForm) {
        servicoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const placa = servicoPlaca.value.trim().toUpperCase();
            const tipoServico = servicoTipo.value;
            const telefone = servicoTelefone.value.trim();
            const observacoes = document.getElementById('servico-observacoes').value.trim();
            
            if (!placa) {
                showNotification('Por favor, digite a placa do veículo', 'error');
                return;
            }
            
            if (!utils.validarPlaca(placa)) {
                showNotification('Formato de placa inválido. Use ABC1234 ou ABC1D23.', 'error');
                return;
            }
            
            if (!tipoServico) {
                showNotification('Por favor, selecione o tipo de serviço', 'error');
                return;
            }
            
            if (!telefone) {
                showNotification('Por favor, digite o telefone do cliente', 'error');
                return;
            }
            
            if (!utils.validarTelefone(telefone)) {
                showNotification('Formato de telefone inválido. Use (XX) XXXXX-XXXX ou XXXXXXXXXXX.', 'error');
                return;
            }
            
            // Buscar serviço selecionado
            const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
            const servico = servicos.find(s => s.id === tipoServico);
            
            if (!servico) {
                showNotification('Serviço não encontrado.', 'error');
                return;
            }
            
            // Buscar veículo existente ou criar novo
            let veiculo = utils.buscarVeiculoPorPlaca(placa);
            
            if (!veiculo) {
                // Criar novo veículo
                veiculo = {
                    id: utils.gerarId(),
                    placa: placa,
                    modelo: 'Não informado',
                    cor: 'Não informado',
                    ticket: utils.gerarTicket(),
                    telefone: telefone,
                    entrada: new Date().getTime(),
                    saida: new Date().getTime(), // Já finalizado
                    tipoCliente: 'normal',
                    idCliente: null,
                    servicos: [servico],
                    valorTotal: servico.valor,
                    formaPagamento: null,
                    cpfNota: null,
                    status: 'finalizado',
                    observacoes: observacoes
                };
                
                // Adicionar veículo
                utils.adicionarVeiculoAoPatio(veiculo);
            } else {
                // Adicionar serviço ao veículo existente
                veiculo.servicos.push(servico);
                veiculo.valorTotal += servico.valor;
                veiculo.observacoes = observacoes;
                
                // Atualizar veículo
                utils.atualizarVeiculo(veiculo);
            }
            
            // Enviar mensagem para o cliente
            const mensagem = `Seu serviço de ${servico.nome} foi registrado. Valor: ${utils.formatarMoeda(servico.valor)}.`;
            utils.enviarMensagemParaCliente(telefone, mensagem);
            
            // Fechar modal e atualizar dashboard
            document.getElementById('servico-modal').classList.remove('active');
            
            // Limpar formulário
            servicoForm.reset();
            
            // Atualizar dashboard
            carregarDashboard();
            
            // Mostrar notificação
            showNotification('Serviço registrado com sucesso!', 'success');
        });
    }
}

// Carregar dados do dashboard
function carregarDashboard() {
    // Buscar veículos no pátio
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    const veiculosNoPatio = veiculos.filter(v => v.status === 'no_patio');
    
    // Atualizar contador de veículos
    document.getElementById('total-veiculos').textContent = veiculosNoPatio.length;
    
    // Buscar mensalistas
    const mensalistas = JSON.parse(localStorage.getItem('mensalistas') || '[]');
    document.getElementById('total-mensalistas').textContent = mensalistas.length;
    
    // Calcular serviços de hoje
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const servicosHoje = veiculos.filter(v => {
        const dataEntrada = new Date(v.entrada);
        dataEntrada.setHours(0, 0, 0, 0);
        return dataEntrada.getTime() === hoje.getTime() && v.servicos && v.servicos.length > 0;
    });
    
    document.getElementById('total-servicos').textContent = servicosHoje.length;
    
    // Calcular faturamento de hoje
    const faturamentoHoje = veiculos.reduce((total, v) => {
        const dataEntrada = new Date(v.entrada);
        dataEntrada.setHours(0, 0, 0, 0);
        
        if (dataEntrada.getTime() === hoje.getTime() && v.status === 'finalizado') {
            return total + v.valorTotal;
        }
        
        return total;
    }, 0);
    
    document.getElementById('total-faturamento').textContent = utils.formatarMoeda(faturamentoHoje);
}

// Carregar veículos no pátio
function carregarVeiculosNoPatio() {
    const vehiclesList = document.getElementById('vehicles-list');
    
    if (!vehiclesList) return;
    
    // Buscar veículos no pátio
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    const veiculosNoPatio = veiculos.filter(v => v.status === 'no_patio');
    
    // Ordenar por data de entrada (mais recente primeiro)
    veiculosNoPatio.sort((a, b) => b.entrada - a.entrada);
    
    // Limpar lista
    vehiclesList.innerHTML = '';
    
    // Verificar se há veículos
    if (veiculosNoPatio.length === 0) {
        vehiclesList.innerHTML = '<div class="alert alert-info">Não há veículos no pátio no momento.</div>';
        return;
    }
    
    // Adicionar veículos à lista
    veiculosNoPatio.forEach(veiculo => {
        // Determinar cor do veículo para a barra lateral
        let corCSS = '';
        switch (veiculo.cor.toLowerCase()) {
            case 'preto':
                corCSS = '#000000';
                break;
            case 'branco':
                corCSS = '#ffffff';
                break;
            case 'prata':
                corCSS = '#c0c0c0';
                break;
            case 'vermelho':
                corCSS = '#ff0000';
                break;
            case 'azul':
                corCSS = '#0000ff';
                break;
            case 'verde':
                corCSS = '#00ff00';
                break;
            case 'amarelo':
                corCSS = '#ffff00';
                break;
            default:
                corCSS = '#95a5a6';
        }
        
        // Criar elemento do veículo
        const vehicleCard = document.createElement('div');
        vehicleCard.className = 'vehicle-card';
        vehicleCard.innerHTML = `
            <div class="vehicle-color" style="background-color: ${corCSS}"></div>
            <div class="vehicle-info">
                <div class="vehicle-plate">${veiculo.placa}</div>
                <div class="vehicle-details">
                    <div class="vehicle-detail">
                        <i class="fas fa-car vehicle-detail-icon"></i>
                        ${veiculo.modelo}
                    </div>
                    <div class="vehicle-detail">
                        <i class="fas fa-clock vehicle-detail-icon"></i>
                        ${utils.calcularTempoPermanencia(veiculo.entrada)}
                    </div>
                    <div class="vehicle-detail">
                        <i class="fas fa-ticket-alt vehicle-detail-icon"></i>
                        #${veiculo.ticket}
                    </div>
                    <div class="vehicle-detail">
                        <i class="fas fa-phone vehicle-detail-icon"></i>
                        ${veiculo.telefone}
                    </div>
                </div>
                <div class="vehicle-actions">
                    <button class="btn btn-sm btn-outline btn-saida-rapida" data-id="${veiculo.id}">
                        <i class="fas fa-sign-out-alt"></i> Saída Rápida
                    </button>
                </div>
            </div>
        `;
        
        // Adicionar à lista
        vehiclesList.appendChild(vehicleCard);
        
        // Adicionar evento de saída rápida
        const btnSaidaRapida = vehicleCard.querySelector('.btn-saida-rapida');
        btnSaidaRapida.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            
            // Buscar veículo
            const veiculo = veiculos.find(v => v.id === id);
            
            if (!veiculo) {
                showNotification('Veículo não encontrado.', 'error');
                return;
            }
            
            // Preencher dados no modal de saída
            document.getElementById('saida-ticket').value = veiculo.ticket;
            
            // Simular clique no botão de consulta
            document.getElementById('btn-consultar-ticket').click();
            
            // Abrir modal de saída
            document.getElementById('saida-modal').classList.add('active');
        });
    });
}
