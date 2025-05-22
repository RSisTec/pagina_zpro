// Adaptação do arquivo admin.js para usar a API PHP/PostgreSQL

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (!API.Auth.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Elementos da página
    const carrosPatioContainer = document.getElementById('carros-patio');
    const btnEntradaVeiculo = document.getElementById('btn-entrada-veiculo');
    const btnSaidaVeiculo = document.getElementById('btn-saida-veiculo');
    const modalEntrada = document.getElementById('modal-entrada');
    const modalSaida = document.getElementById('modal-saida');
    const formEntrada = document.getElementById('form-entrada');
    const formSaida = document.getElementById('form-saida');
    const inputPlaca = document.getElementById('placa');
    const inputTicket = document.getElementById('ticket');
    
    // Carregar carros no pátio
    carregarCarrosPatio();
    
    // Configurar botões de ação
    if (btnEntradaVeiculo) {
        btnEntradaVeiculo.addEventListener('click', function() {
            modalEntrada.classList.add('mostrar');
        });
    }
    
    if (btnSaidaVeiculo) {
        btnSaidaVeiculo.addEventListener('click', function() {
            modalSaida.classList.add('mostrar');
        });
    }
    
    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('mostrar');
            }
        });
    });
    
    // Configurar formulário de entrada
    if (formEntrada) {
        formEntrada.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const placa = inputPlaca.value.trim().toUpperCase();
            
            if (!placa) {
                Utils.mostrarNotificacao('Por favor, informe a placa do veículo', 'error');
                return;
            }
            
            // Mostrar carregamento
            Utils.mostrarCarregamento('Consultando placa...');
            
            // Consultar placa
            API.Veiculo.consultarPlaca(placa)
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.data && response.data.status === 'no-patio') {
                        Utils.mostrarNotificacao('Este veículo já está no pátio!', 'error');
                        return;
                    }
                    
                    // Preencher formulário com dados do veículo se já existir
                    if (response.data) {
                        document.getElementById('modelo').value = response.data.modelo || '';
                        document.getElementById('cor').value = response.data.cor || '';
                        
                        if (response.data.tipo_cliente === 'mensalista') {
                            document.getElementById('tipo-cliente').value = 'mensalista';
                            document.getElementById('id-cliente').value = response.data.id_cliente || '';
                            document.getElementById('container-mensalista').style.display = 'block';
                            document.getElementById('container-isento').style.display = 'none';
                            document.getElementById('container-telefone').style.display = 'none';
                        } else if (response.data.tipo_cliente === 'isento') {
                            document.getElementById('tipo-cliente').value = 'isento';
                            document.getElementById('id-cliente').value = response.data.id_cliente || '';
                            document.getElementById('container-mensalista').style.display = 'none';
                            document.getElementById('container-isento').style.display = 'block';
                            document.getElementById('container-telefone').style.display = 'none';
                        } else {
                            document.getElementById('tipo-cliente').value = 'normal';
                            document.getElementById('container-mensalista').style.display = 'none';
                            document.getElementById('container-isento').style.display = 'none';
                            document.getElementById('container-telefone').style.display = 'block';
                            document.getElementById('telefone').value = response.data.telefone || '';
                        }
                    } else {
                        // Limpar formulário para novo veículo
                        document.getElementById('modelo').value = '';
                        document.getElementById('cor').value = '';
                        document.getElementById('tipo-cliente').value = 'normal';
                        document.getElementById('container-mensalista').style.display = 'none';
                        document.getElementById('container-isento').style.display = 'none';
                        document.getElementById('container-telefone').style.display = 'block';
                        document.getElementById('telefone').value = '';
                    }
                    
                    // Mostrar segunda etapa do formulário
                    document.getElementById('entrada-etapa-1').style.display = 'none';
                    document.getElementById('entrada-etapa-2').style.display = 'block';
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao consultar placa: ' + error.message, 'error');
                });
        });
        
        // Configurar segunda etapa do formulário de entrada
        document.getElementById('form-entrada-etapa-2').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const placa = inputPlaca.value.trim().toUpperCase();
            const modelo = document.getElementById('modelo').value.trim();
            const cor = document.getElementById('cor').value.trim();
            const tipoCliente = document.getElementById('tipo-cliente').value;
            let idCliente = null;
            let telefone = null;
            
            if (!modelo || !cor) {
                Utils.mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
                return;
            }
            
            if (tipoCliente === 'mensalista') {
                idCliente = document.getElementById('id-cliente').value;
                if (!idCliente) {
                    Utils.mostrarNotificacao('Por favor, selecione um mensalista', 'error');
                    return;
                }
            } else if (tipoCliente === 'isento') {
                idCliente = document.getElementById('id-cliente').value;
                if (!idCliente) {
                    Utils.mostrarNotificacao('Por favor, selecione um isento', 'error');
                    return;
                }
            } else {
                telefone = document.getElementById('telefone').value.trim();
                if (!telefone) {
                    Utils.mostrarNotificacao('Por favor, informe o telefone do cliente', 'error');
                    return;
                }
            }
            
            // Gerar ticket
            const ticket = Utils.gerarTicket();
            
            // Preparar dados para registro
            const dados = {
                placa,
                modelo,
                cor,
                tipo_cliente: tipoCliente,
                id_cliente: idCliente,
                telefone,
                ticket
            };
            
            // Mostrar carregamento
            Utils.mostrarCarregamento('Registrando entrada...');
            
            // Registrar entrada
            API.Veiculo.registrarEntrada(dados)
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        Utils.mostrarNotificacao('Entrada registrada com sucesso!', 'success');
                        
                        // Fechar modal
                        modalEntrada.classList.remove('mostrar');
                        
                        // Limpar formulário
                        formEntrada.reset();
                        document.getElementById('entrada-etapa-1').style.display = 'block';
                        document.getElementById('entrada-etapa-2').style.display = 'none';
                        
                        // Recarregar carros no pátio
                        carregarCarrosPatio();
                        
                        // Enviar SMS (simulado)
                        if (telefone) {
                            Utils.mostrarNotificacao(`SMS enviado para ${telefone} com o ticket ${ticket}`, 'info');
                        }
                    } else {
                        Utils.mostrarNotificacao(response.message || 'Erro ao registrar entrada', 'error');
                    }
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao registrar entrada: ' + error.message, 'error');
                });
        });
        
        // Voltar para primeira etapa
        document.getElementById('btn-voltar-etapa-1').addEventListener('click', function() {
            document.getElementById('entrada-etapa-1').style.display = 'block';
            document.getElementById('entrada-etapa-2').style.display = 'none';
        });
        
        // Configurar seleção de tipo de cliente
        document.getElementById('tipo-cliente').addEventListener('change', function() {
            const tipoCliente = this.value;
            
            if (tipoCliente === 'mensalista') {
                document.getElementById('container-mensalista').style.display = 'block';
                document.getElementById('container-isento').style.display = 'none';
                document.getElementById('container-telefone').style.display = 'none';
                
                // Carregar mensalistas
                carregarMensalistas();
            } else if (tipoCliente === 'isento') {
                document.getElementById('container-mensalista').style.display = 'none';
                document.getElementById('container-isento').style.display = 'block';
                document.getElementById('container-telefone').style.display = 'none';
                
                // Carregar isentos
                carregarIsentos();
            } else {
                document.getElementById('container-mensalista').style.display = 'none';
                document.getElementById('container-isento').style.display = 'none';
                document.getElementById('container-telefone').style.display = 'block';
            }
        });
    }
    
    // Configurar formulário de saída
    if (formSaida) {
        formSaida.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const ticket = inputTicket.value.trim().toUpperCase();
            
            if (!ticket) {
                Utils.mostrarNotificacao('Por favor, informe o ticket do veículo', 'error');
                return;
            }
            
            // Mostrar carregamento
            Utils.mostrarCarregamento('Consultando ticket...');
            
            // Consultar ticket
            API.Veiculo.consultarTicket(ticket)
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (!response.data) {
                        Utils.mostrarNotificacao('Ticket não encontrado', 'error');
                        return;
                    }
                    
                    if (response.data.status !== 'no-patio') {
                        Utils.mostrarNotificacao('Este veículo não está no pátio', 'error');
                        return;
                    }
                    
                    // Preencher dados do veículo
                    const veiculo = response.data;
                    
                    // Calcular tempo de permanência
                    const entrada = new Date(veiculo.entrada);
                    const agora = new Date();
                    const permanencia = agora - entrada;
                    
                    // Obter tabela de preços ativa
                    API.Preco.listar({ ativo: true })
                        .then(response => {
                            const tabelaPreco = response.data[0];
                            
                            // Calcular valor
                            let valor = 0;
                            
                            if (veiculo.tipo_cliente === 'mensalista' || veiculo.tipo_cliente === 'isento') {
                                valor = 0;
                            } else {
                                const horasDecorridas = permanencia / (1000 * 60 * 60);
                                
                                if (horasDecorridas <= 1) {
                                    valor = tabelaPreco.valor_primeira_hora;
                                } else {
                                    valor = tabelaPreco.valor_primeira_hora + 
                                            Math.ceil(horasDecorridas - 1) * tabelaPreco.valor_hora_adicional;
                                }
                                
                                // Se ultrapassar o valor da diária, cobrar a diária
                                if (valor > tabelaPreco.valor_diaria) {
                                    valor = tabelaPreco.valor_diaria;
                                }
                            }
                            
                            // Preencher dados no modal de saída
                            document.getElementById('saida-placa').textContent = veiculo.placa;
                            document.getElementById('saida-modelo').textContent = veiculo.modelo;
                            document.getElementById('saida-cor').textContent = veiculo.cor;
                            document.getElementById('saida-entrada').textContent = Utils.formatarData(veiculo.entrada);
                            document.getElementById('saida-permanencia').textContent = Utils.formatarTempoPermanencia(permanencia);
                            document.getElementById('saida-valor').textContent = Utils.formatarValor(valor);
                            document.getElementById('saida-tipo-cliente').textContent = veiculo.tipo_cliente;
                            
                            // Armazenar ID do veículo e valor para uso posterior
                            document.getElementById('saida-id-veiculo').value = veiculo.id;
                            document.getElementById('saida-valor-total').value = valor;
                            
                            // Mostrar segunda etapa do formulário
                            document.getElementById('saida-etapa-1').style.display = 'none';
                            document.getElementById('saida-etapa-2').style.display = 'block';
                        })
                        .catch(error => {
                            Utils.mostrarNotificacao('Erro ao obter tabela de preços: ' + error.message, 'error');
                        });
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao consultar ticket: ' + error.message, 'error');
                });
        });
        
        // Configurar segunda etapa do formulário de saída
        document.getElementById('form-saida-etapa-2').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const idVeiculo = document.getElementById('saida-id-veiculo').value;
            const valorTotal = document.getElementById('saida-valor-total').value;
            const formaPagamento = document.getElementById('forma-pagamento').value;
            const cpfNota = document.getElementById('cpf-nota').value.trim();
            
            if (!formaPagamento) {
                Utils.mostrarNotificacao('Por favor, selecione a forma de pagamento', 'error');
                return;
            }
            
            // Preparar dados para registro
            const dados = {
                forma_pagamento: formaPagamento,
                valor_total: valorTotal,
                cpf_nota: cpfNota || null
            };
            
            // Mostrar carregamento
            Utils.mostrarCarregamento('Registrando saída...');
            
            // Registrar saída
            API.Veiculo.registrarSaida(idVeiculo, dados)
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        Utils.mostrarNotificacao('Saída registrada com sucesso!', 'success');
                        
                        // Fechar modal
                        modalSaida.classList.remove('mostrar');
                        
                        // Limpar formulário
                        formSaida.reset();
                        document.getElementById('saida-etapa-1').style.display = 'block';
                        document.getElementById('saida-etapa-2').style.display = 'none';
                        
                        // Recarregar carros no pátio
                        carregarCarrosPatio();
                        
                        // Enviar SMS (simulado)
                        Utils.mostrarNotificacao(`Comprovante enviado para o cliente`, 'info');
                    } else {
                        Utils.mostrarNotificacao(response.message || 'Erro ao registrar saída', 'error');
                    }
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao registrar saída: ' + error.message, 'error');
                });
        });
        
        // Voltar para primeira etapa
        document.getElementById('btn-voltar-saida-etapa-1').addEventListener('click', function() {
            document.getElementById('saida-etapa-1').style.display = 'block';
            document.getElementById('saida-etapa-2').style.display = 'none';
        });
        
        // Configurar checkbox de CPF na nota
        document.getElementById('deseja-cpf').addEventListener('change', function() {
            if (this.checked) {
                document.getElementById('container-cpf').style.display = 'block';
            } else {
                document.getElementById('container-cpf').style.display = 'none';
                document.getElementById('cpf-nota').value = '';
            }
        });
    }
    
    // Função para carregar carros no pátio
    function carregarCarrosPatio() {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando veículos...');
        
        // Consultar veículos no pátio
        API.Veiculo.listar({ status: 'no-patio' })
            .then(response => {
                Utils.esconderCarregamento();
                
                const veiculos = response.data;
                
                if (veiculos.length === 0) {
                    carrosPatioContainer.innerHTML = `
                        <div class="alerta alerta-info">
                            <p>Não há veículos no pátio no momento.</p>
                        </div>
                    `;
                    return;
                }
                
                // Exibir veículos
                let html = '';
                
                veiculos.forEach(veiculo => {
                    // Calcular tempo de permanência
                    const entrada = new Date(veiculo.entrada);
                    const agora = new Date();
                    const permanencia = agora - entrada;
                    
                    let tipoClienteTexto = 'Normal';
                    if (veiculo.tipo_cliente === 'mensalista') tipoClienteTexto = 'Mensalista';
                    if (veiculo.tipo_cliente === 'isento') tipoClienteTexto = 'Isento';
                    
                    html += `
                        <div class="card">
                            <div class="card-header">
                                <h3>${veiculo.placa}</h3>
                                <span class="badge ${veiculo.tipo_cliente}">${tipoClienteTexto}</span>
                            </div>
                            <div class="card-body">
                                <p><strong>Modelo:</strong> ${veiculo.modelo}</p>
                                <p><strong>Cor:</strong> ${veiculo.cor}</p>
                                <p><strong>Entrada:</strong> ${Utils.formatarData(veiculo.entrada)}</p>
                                <p><strong>Permanência:</strong> ${Utils.formatarTempoPermanencia(permanencia)}</p>
                                <p><strong>Ticket:</strong> ${veiculo.ticket}</p>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary" onclick="registrarSaida('${veiculo.ticket}')">Registrar Saída</button>
                                <button class="btn btn-secondary" onclick="adicionarServico('${veiculo.id}')">Adicionar Serviço</button>
                            </div>
                        </div>
                    `;
                });
                
                carrosPatioContainer.innerHTML = html;
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar veículos: ' + error.message, 'error');
            });
    }
    
    // Função para carregar mensalistas
    function carregarMensalistas() {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando mensalistas...');
        
        // Consultar mensalistas
        API.Mensalista.listar({ status: 'vigente' })
            .then(response => {
                Utils.esconderCarregamento();
                
                const mensalistas = response.data;
                const selectMensalista = document.getElementById('id-cliente');
                
                // Limpar select
                selectMensalista.innerHTML = '<option value="">Selecione um mensalista</option>';
                
                // Preencher select
                mensalistas.forEach(mensalista => {
                    const option = document.createElement('option');
                    option.value = mensalista.id;
                    option.textContent = `${mensalista.nome} (${mensalista.documento})`;
                    selectMensalista.appendChild(option);
                });
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar mensalistas: ' + error.message, 'error');
            });
    }
    
    // Função para carregar isentos
    function carregarIsentos() {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando isentos...');
        
        // Consultar isentos
        API.Isento.listar()
            .then(response => {
                Utils.esconderCarregamento();
                
                const isentos = response.data;
                const selectIsento = document.getElementById('id-cliente');
                
                // Limpar select
                selectIsento.innerHTML = '<option value="">Selecione um isento</option>';
                
                // Preencher select
                isentos.forEach(isento => {
                    const option = document.createElement('option');
                    option.value = isento.id;
                    option.textContent = `${isento.nome} (${isento.motivo})`;
                    selectIsento.appendChild(option);
                });
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar isentos: ' + error.message, 'error');
            });
    }
    
    // Função global para registrar saída
    window.registrarSaida = function(ticket) {
        // Preencher ticket no formulário
        inputTicket.value = ticket;
        
        // Abrir modal
        modalSaida.classList.add('mostrar');
        
        // Simular submit do formulário
        formSaida.dispatchEvent(new Event('submit'));
    };
    
    // Função global para adicionar serviço
    window.adicionarServico = function(veiculoId) {
        // Redirecionar para página de serviços com ID do veículo
        window.location.href = `/pages/servicos.html?veiculo=${veiculoId}`;
    };
});
