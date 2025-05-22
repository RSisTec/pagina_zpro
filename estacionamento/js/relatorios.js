// Adaptação do arquivo relatorios.js para usar a API PHP/PostgreSQL

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (!API.Auth.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Elementos da página
    const formFiltro = document.getElementById('form-filtro');
    const dataInicio = document.getElementById('data-inicio');
    const dataFim = document.getElementById('data-fim');
    const tipoRelatorio = document.getElementById('tipo-relatorio');
    const resultadoRelatorio = document.getElementById('resultado-relatorio');
    const btnExportar = document.getElementById('btn-exportar');
    
    // Definir data inicial como primeiro dia do mês atual
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    dataInicio.value = primeiroDiaMes.toISOString().split('T')[0];
    
    // Definir data final como dia atual
    dataFim.value = hoje.toISOString().split('T')[0];
    
    // Configurar formulário de filtro
    if (formFiltro) {
        formFiltro.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const inicio = dataInicio.value;
            const fim = dataFim.value;
            const tipo = tipoRelatorio.value;
            
            // Validar campos obrigatórios
            if (!inicio || !fim) {
                Utils.mostrarNotificacao('Por favor, preencha as datas de início e fim', 'error');
                return;
            }
            
            // Validar período
            const dataInicioObj = new Date(inicio);
            const dataFimObj = new Date(fim);
            
            if (dataInicioObj > dataFimObj) {
                Utils.mostrarNotificacao('A data de início não pode ser posterior à data de fim', 'error');
                return;
            }
            
            // Mostrar carregamento
            Utils.mostrarCarregamento('Gerando relatório...');
            
            // Gerar relatório
            API.Relatorio.gerar({
                dataInicio: dataInicioObj.getTime(),
                dataFim: dataFimObj.getTime(),
                tipo
            })
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (!response.data || response.data.length === 0) {
                        resultadoRelatorio.innerHTML = `
                            <div class="alerta alerta-info">
                                <p>Nenhum dado encontrado para o período selecionado.</p>
                            </div>
                        `;
                        btnExportar.style.display = 'none';
                        return;
                    }
                    
                    // Exibir relatório de acordo com o tipo
                    switch (tipo) {
                        case 'veiculos':
                            exibirRelatorioVeiculos(response.data);
                            break;
                        case 'servicos':
                            exibirRelatorioServicos(response.data);
                            break;
                        case 'financeiro':
                            exibirRelatorioFinanceiro(response.data);
                            break;
                        case 'mensalistas':
                            exibirRelatorioMensalistas(response.data);
                            break;
                        default:
                            exibirRelatorioVeiculos(response.data);
                    }
                    
                    // Mostrar botão de exportar
                    btnExportar.style.display = 'block';
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao gerar relatório: ' + error.message, 'error');
                });
        });
    }
    
    // Configurar botão de exportar
    if (btnExportar) {
        btnExportar.addEventListener('click', function() {
            // Obter dados do formulário
            const inicio = dataInicio.value;
            const fim = dataFim.value;
            const tipo = tipoRelatorio.value;
            
            // Mostrar carregamento
            Utils.mostrarCarregamento('Exportando relatório...');
            
            // Exportar relatório
            API.Relatorio.exportar({
                dataInicio: new Date(inicio).getTime(),
                dataFim: new Date(fim).getTime(),
                tipo
            })
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        // Criar link para download
                        const link = document.createElement('a');
                        link.href = response.data.url;
                        link.download = response.data.filename;
                        link.click();
                        
                        Utils.mostrarNotificacao('Relatório exportado com sucesso!', 'success');
                    } else {
                        Utils.mostrarNotificacao(response.message || 'Erro ao exportar relatório', 'error');
                    }
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao exportar relatório: ' + error.message, 'error');
                });
        });
    }
    
    // Função para exibir relatório de veículos
    function exibirRelatorioVeiculos(dados) {
        let html = `
            <h3>Relatório de Veículos</h3>
            <div class="tabela-container">
                <table class="tabela">
                    <thead>
                        <tr>
                            <th>Placa</th>
                            <th>Modelo</th>
                            <th>Entrada</th>
                            <th>Saída</th>
                            <th>Permanência</th>
                            <th>Valor</th>
                            <th>Tipo</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let totalVeiculos = 0;
        let totalValor = 0;
        
        dados.forEach(veiculo => {
            totalVeiculos++;
            totalValor += veiculo.valor || 0;
            
            const entrada = new Date(veiculo.entrada);
            const saida = veiculo.saida ? new Date(veiculo.saida) : null;
            const permanencia = saida ? saida - entrada : null;
            
            html += `
                <tr>
                    <td>${veiculo.placa}</td>
                    <td>${veiculo.modelo}</td>
                    <td>${Utils.formatarData(veiculo.entrada)}</td>
                    <td>${veiculo.saida ? Utils.formatarData(veiculo.saida) : '-'}</td>
                    <td>${permanencia ? Utils.formatarTempoPermanencia(permanencia) : '-'}</td>
                    <td>${veiculo.valor ? Utils.formatarValor(veiculo.valor) : '-'}</td>
                    <td>${veiculo.tipo_cliente}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="5"><strong>Total</strong></td>
                            <td><strong>${Utils.formatarValor(totalValor)}</strong></td>
                            <td><strong>${totalVeiculos} veículos</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        resultadoRelatorio.innerHTML = html;
    }
    
    // Função para exibir relatório de serviços
    function exibirRelatorioServicos(dados) {
        let html = `
            <h3>Relatório de Serviços</h3>
            <div class="tabela-container">
                <table class="tabela">
                    <thead>
                        <tr>
                            <th>Serviço</th>
                            <th>Veículo</th>
                            <th>Data</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let totalServicos = 0;
        let totalValor = 0;
        
        dados.forEach(servico => {
            totalServicos++;
            totalValor += servico.valor || 0;
            
            html += `
                <tr>
                    <td>${servico.nome_servico}</td>
                    <td>${servico.placa} (${servico.modelo})</td>
                    <td>${Utils.formatarData(servico.data_adicao)}</td>
                    <td>${Utils.formatarValor(servico.valor)}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="3"><strong>Total</strong></td>
                            <td><strong>${Utils.formatarValor(totalValor)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        resultadoRelatorio.innerHTML = html;
    }
    
    // Função para exibir relatório financeiro
    function exibirRelatorioFinanceiro(dados) {
        let html = `
            <h3>Relatório Financeiro</h3>
            <div class="tabela-container">
                <table class="tabela">
                    <thead>
                        <tr>
                            <th>Data</th>
                            <th>Tipo</th>
                            <th>Descrição</th>
                            <th>Forma de Pagamento</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let totalEstacionamento = 0;
        let totalServicos = 0;
        let totalMensalidades = 0;
        let totalGeral = 0;
        
        dados.forEach(item => {
            const valor = item.valor || 0;
            totalGeral += valor;
            
            if (item.tipo === 'estacionamento') {
                totalEstacionamento += valor;
            } else if (item.tipo === 'servico') {
                totalServicos += valor;
            } else if (item.tipo === 'mensalidade') {
                totalMensalidades += valor;
            }
            
            html += `
                <tr>
                    <td>${Utils.formatarData(item.data)}</td>
                    <td>${item.tipo}</td>
                    <td>${item.descricao}</td>
                    <td>${item.forma_pagamento || '-'}</td>
                    <td>${Utils.formatarValor(valor)}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="4"><strong>Total Estacionamento</strong></td>
                            <td><strong>${Utils.formatarValor(totalEstacionamento)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4"><strong>Total Serviços</strong></td>
                            <td><strong>${Utils.formatarValor(totalServicos)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4"><strong>Total Mensalidades</strong></td>
                            <td><strong>${Utils.formatarValor(totalMensalidades)}</strong></td>
                        </tr>
                        <tr>
                            <td colspan="4"><strong>Total Geral</strong></td>
                            <td><strong>${Utils.formatarValor(totalGeral)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        resultadoRelatorio.innerHTML = html;
    }
    
    // Função para exibir relatório de mensalistas
    function exibirRelatorioMensalistas(dados) {
        let html = `
            <h3>Relatório de Mensalistas</h3>
            <div class="tabela-container">
                <table class="tabela">
                    <thead>
                        <tr>
                            <th>Nome</th>
                            <th>Documento</th>
                            <th>Plano</th>
                            <th>Início</th>
                            <th>Fim</th>
                            <th>Status</th>
                            <th>Valor</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let totalMensalistas = 0;
        let totalValor = 0;
        let vigentes = 0;
        let vencendo = 0;
        let vencidos = 0;
        
        dados.forEach(mensalista => {
            totalMensalistas++;
            totalValor += mensalista.valor || 0;
            
            // Determinar status
            const dataFim = new Date(mensalista.data_fim);
            const hoje = new Date();
            const trintaDias = new Date();
            trintaDias.setDate(hoje.getDate() + 30);
            
            let status = 'vigente';
            let statusTexto = 'Vigente';
            
            if (dataFim < hoje) {
                status = 'vencido';
                statusTexto = 'Vencido';
                vencidos++;
            } else if (dataFim <= trintaDias) {
                status = 'vencendo';
                statusTexto = 'Vencendo';
                vencendo++;
            } else {
                vigentes++;
            }
            
            html += `
                <tr>
                    <td>${mensalista.nome}</td>
                    <td>${mensalista.documento}</td>
                    <td>${mensalista.plano}</td>
                    <td>${Utils.formatarData(mensalista.data_inicio)}</td>
                    <td>${Utils.formatarData(mensalista.data_fim)}</td>
                    <td><span class="badge ${status}">${statusTexto}</span></td>
                    <td>${Utils.formatarValor(mensalista.valor)}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td colspan="6"><strong>Total</strong></td>
                            <td><strong>${Utils.formatarValor(totalValor)}</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
            
            <div class="resumo-container">
                <div class="card">
                    <div class="card-header">
                        <h3>Resumo</h3>
                    </div>
                    <div class="card-body">
                        <p><strong>Total de Mensalistas:</strong> ${totalMensalistas}</p>
                        <p><strong>Vigentes:</strong> ${vigentes}</p>
                        <p><strong>Vencendo em 30 dias:</strong> ${vencendo}</p>
                        <p><strong>Vencidos:</strong> ${vencidos}</p>
                    </div>
                </div>
            </div>
        `;
        
        resultadoRelatorio.innerHTML = html;
    }
});
