// Adaptação do arquivo index.js para usar a API PHP/PostgreSQL

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do formulário de consulta
    const consultaForm = document.getElementById('consulta-form');
    const tipoConsultaSelect = document.getElementById('tipo-consulta');
    const valorConsultaInput = document.getElementById('valor-consulta');
    const resultadoConsulta = document.getElementById('resultado-consulta');
    
    // Configurar formulário de consulta
    if (consultaForm) {
        consultaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const tipoConsulta = tipoConsultaSelect.value;
            const valorConsulta = valorConsultaInput.value.trim();
            
            if (!valorConsulta) {
                Utils.mostrarNotificacao('Por favor, informe o valor para consulta', 'error');
                return;
            }
            
            // Mostrar carregamento
            Utils.mostrarCarregamento('Consultando veículo...');
            
            // Consultar veículo
            if (tipoConsulta === 'telefone') {
                // Consultar por telefone
                API.Veiculo.listar({ busca: valorConsulta })
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        const veiculos = response.data.filter(v => v.telefone === valorConsulta && v.status === 'no-patio');
                        
                        if (veiculos.length === 0) {
                            resultadoConsulta.innerHTML = `
                                <div class="alerta alerta-info">
                                    <p>Nenhum veículo encontrado com este telefone.</p>
                                </div>
                            `;
                            return;
                        }
                        
                        // Exibir resultados
                        exibirResultadosConsulta(veiculos);
                    })
                    .catch(error => {
                        Utils.esconderCarregamento();
                        Utils.mostrarNotificacao('Erro ao consultar veículo: ' + error.message, 'error');
                    });
            } else {
                // Consultar por ticket
                API.Veiculo.consultarTicket(valorConsulta)
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        if (!response.data) {
                            resultadoConsulta.innerHTML = `
                                <div class="alerta alerta-info">
                                    <p>Nenhum veículo encontrado com este ticket.</p>
                                </div>
                            `;
                            return;
                        }
                        
                        // Exibir resultados
                        exibirResultadosConsulta([response.data]);
                    })
                    .catch(error => {
                        Utils.esconderCarregamento();
                        Utils.mostrarNotificacao('Erro ao consultar veículo: ' + error.message, 'error');
                    });
            }
        });
    }
    
    // Função para exibir resultados da consulta
    function exibirResultadosConsulta(veiculos) {
        let html = '';
        
        veiculos.forEach(veiculo => {
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
                    
                    // Formatar informações
                    const tempoPermanencia = Utils.formatarTempoPermanencia(permanencia);
                    const valorFormatado = Utils.formatarValor(valor);
                    
                    html += `
                        <div class="card">
                            <div class="card-header">
                                <h3>Veículo: ${veiculo.placa}</h3>
                            </div>
                            <div class="card-body">
                                <p><strong>Modelo:</strong> ${veiculo.modelo}</p>
                                <p><strong>Cor:</strong> ${veiculo.cor}</p>
                                <p><strong>Entrada:</strong> ${Utils.formatarData(veiculo.entrada)}</p>
                                <p><strong>Tempo de permanência:</strong> ${tempoPermanencia}</p>
                                <p><strong>Valor atual:</strong> ${valorFormatado}</p>
                                <p><strong>Ticket:</strong> ${veiculo.ticket}</p>
                            </div>
                        </div>
                    `;
                    
                    resultadoConsulta.innerHTML = html;
                })
                .catch(error => {
                    Utils.mostrarNotificacao('Erro ao obter tabela de preços: ' + error.message, 'error');
                });
        });
    }
});
