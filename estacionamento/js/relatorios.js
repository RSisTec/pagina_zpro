// Arquivo específico para a página de relatórios
// Contém funções para geração e visualização de relatórios

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const session = utils.protegerRota();
    if (!session) return;
    
    // Inicializar componentes
    initializeSidebar();
    initializeLogout();
    initializeFilters();
    
    // Definir data inicial como primeiro dia do mês atual
    const hoje = new Date();
    const primeiroDiaMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
    document.getElementById('filtro-data-inicio').valueAsDate = primeiroDiaMes;
    document.getElementById('filtro-data-fim').valueAsDate = hoje;
    
    // Carregar relatório inicial
    carregarRelatorio();
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

// Inicializar filtros
function initializeFilters() {
    const btnFiltrar = document.getElementById('btn-filtrar');
    const btnExportar = document.getElementById('btn-exportar-relatorio');
    
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', function() {
            carregarRelatorio();
        });
    }
    
    if (btnExportar) {
        btnExportar.addEventListener('click', function() {
            exportarRelatorio();
        });
    }
}

// Carregar relatório
function carregarRelatorio() {
    // Obter filtros
    const dataInicio = new Date(document.getElementById('filtro-data-inicio').value);
    const dataFim = new Date(document.getElementById('filtro-data-fim').value);
    const tipo = document.getElementById('filtro-tipo').value;
    const cliente = document.getElementById('filtro-cliente').value;
    
    // Validar datas
    if (isNaN(dataInicio.getTime()) || isNaN(dataFim.getTime())) {
        showNotification('Por favor, selecione datas válidas', 'error');
        return;
    }
    
    // Ajustar data final para incluir todo o dia
    dataFim.setHours(23, 59, 59, 999);
    
    // Buscar veículos
    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
    
    // Filtrar veículos
    let veiculosFiltrados = veiculos.filter(veiculo => {
        const dataEntrada = new Date(veiculo.entrada);
        
        // Filtrar por data
        if (dataEntrada < dataInicio || dataEntrada > dataFim) {
            return false;
        }
        
        // Filtrar por tipo
        if (tipo === 'estacionamento' && veiculo.servicos && veiculo.servicos.length > 0) {
            return false;
        }
        
        if (tipo === 'servicos' && (!veiculo.servicos || veiculo.servicos.length === 0)) {
            return false;
        }
        
        // Filtrar por cliente
        if (cliente === 'mensalista' && veiculo.tipoCliente !== 'mensalista') {
            return false;
        }
        
        if (cliente === 'isento' && veiculo.tipoCliente !== 'isento') {
            return false;
        }
        
        if (cliente === 'normal' && (veiculo.tipoCliente === 'mensalista' || veiculo.tipoCliente === 'isento')) {
            return false;
        }
        
        return true;
    });
    
    // Ordenar por data de entrada (mais recente primeiro)
    veiculosFiltrados.sort((a, b) => b.entrada - a.entrada);
    
    // Atualizar resumo
    atualizarResumo(veiculosFiltrados);
    
    // Atualizar gráficos
    atualizarGraficos(veiculosFiltrados, dataInicio, dataFim);
    
    // Atualizar tabela de detalhes
    atualizarTabela(veiculosFiltrados);
}

// Atualizar resumo
function atualizarResumo(veiculos) {
    // Calcular total de veículos
    const totalVeiculos = veiculos.filter(v => !v.servicos || v.servicos.length === 0).length;
    
    // Calcular total de serviços
    const totalServicos = veiculos.filter(v => v.servicos && v.servicos.length > 0).length;
    
    // Calcular faturamento
    const faturamento = veiculos.reduce((total, veiculo) => {
        return total + (veiculo.valorTotal || 0);
    }, 0);
    
    // Calcular tempo médio
    let tempoTotal = 0;
    let veiculosComTempo = 0;
    
    veiculos.forEach(veiculo => {
        if (veiculo.entrada && veiculo.saida) {
            const entrada = new Date(veiculo.entrada);
            const saida = new Date(veiculo.saida);
            const diffMs = saida - entrada;
            const diffHrs = diffMs / (1000 * 60 * 60);
            
            if (diffHrs > 0) {
                tempoTotal += diffHrs;
                veiculosComTempo++;
            }
        }
    });
    
    const tempoMedio = veiculosComTempo > 0 ? tempoTotal / veiculosComTempo : 0;
    
    // Atualizar elementos
    document.getElementById('total-veiculos').textContent = totalVeiculos;
    document.getElementById('total-servicos').textContent = totalServicos;
    document.getElementById('total-faturamento').textContent = utils.formatarMoeda(faturamento);
    document.getElementById('tempo-medio').textContent = tempoMedio.toFixed(1) + 'h';
}

// Atualizar gráficos
function atualizarGraficos(veiculos, dataInicio, dataFim) {
    // Gráfico de faturamento por dia
    atualizarGraficoFaturamento(veiculos, dataInicio, dataFim);
    
    // Gráfico de distribuição por tipo
    atualizarGraficoDistribuicao(veiculos);
}

// Atualizar gráfico de faturamento
function atualizarGraficoFaturamento(veiculos, dataInicio, dataFim) {
    // Criar array de datas entre dataInicio e dataFim
    const datas = [];
    const dataAtual = new Date(dataInicio);
    
    while (dataAtual <= dataFim) {
        datas.push(new Date(dataAtual));
        dataAtual.setDate(dataAtual.getDate() + 1);
    }
    
    // Calcular faturamento por dia
    const faturamentoPorDia = datas.map(data => {
        const dataStr = data.toISOString().split('T')[0];
        
        // Filtrar veículos do dia
        const veiculosDoDia = veiculos.filter(veiculo => {
            const dataEntrada = new Date(veiculo.entrada);
            return dataEntrada.toISOString().split('T')[0] === dataStr;
        });
        
        // Calcular faturamento
        const faturamento = veiculosDoDia.reduce((total, veiculo) => {
            return total + (veiculo.valorTotal || 0);
        }, 0);
        
        return {
            data: dataStr,
            faturamento
        };
    });
    
    // Preparar dados para o gráfico
    const labels = faturamentoPorDia.map(item => {
        const data = new Date(item.data);
        return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    });
    
    const dados = faturamentoPorDia.map(item => item.faturamento);
    
    // Criar ou atualizar gráfico
    const ctx = document.getElementById('chart-faturamento').getContext('2d');
    
    if (window.chartFaturamento) {
        window.chartFaturamento.data.labels = labels;
        window.chartFaturamento.data.datasets[0].data = dados;
        window.chartFaturamento.update();
    } else {
        window.chartFaturamento = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Faturamento (R$)',
                    data: dados,
                    backgroundColor: 'rgba(54, 162, 235, 0.5)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return 'R$ ' + value;
                            }
                        }
                    }
                }
            }
        });
    }
}

// Atualizar gráfico de distribuição
function atualizarGraficoDistribuicao(veiculos) {
    // Contar veículos por tipo
    const normais = veiculos.filter(v => v.tipoCliente !== 'mensalista' && v.tipoCliente !== 'isento').length;
    const mensalistas = veiculos.filter(v => v.tipoCliente === 'mensalista').length;
    const isentos = veiculos.filter(v => v.tipoCliente === 'isento').length;
    
    // Preparar dados para o gráfico
    const dados = [normais, mensalistas, isentos];
    
    // Criar ou atualizar gráfico
    const ctx = document.getElementById('chart-distribuicao').getContext('2d');
    
    if (window.chartDistribuicao) {
        window.chartDistribuicao.data.datasets[0].data = dados;
        window.chartDistribuicao.update();
    } else {
        window.chartDistribuicao = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Normal', 'Mensalista', 'Isento'],
                datasets: [{
                    data: dados,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.5)',
                        'rgba(54, 162, 235, 0.5)',
                        'rgba(255, 206, 86, 0.5)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }
}

// Atualizar tabela de detalhes
function atualizarTabela(veiculos) {
    const tabela = document.getElementById('tabela-detalhes');
    
    if (!tabela) return;
    
    // Limpar tabela
    tabela.innerHTML = '';
    
    // Verificar se há veículos
    if (veiculos.length === 0) {
        tabela.innerHTML = '<tr><td colspan="8" class="text-center">Nenhum registro encontrado</td></tr>';
        return;
    }
    
    // Adicionar veículos à tabela
    veiculos.forEach(veiculo => {
        const tr = document.createElement('tr');
        
        // Calcular tempo de permanência
        let tempoPermanencia = '';
        if (veiculo.entrada && veiculo.saida) {
            const entrada = new Date(veiculo.entrada);
            const saida = new Date(veiculo.saida);
            const diffMs = saida - entrada;
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            tempoPermanencia = `${diffHrs}h ${diffMins}min`;
        } else if (veiculo.entrada) {
            const entrada = new Date(veiculo.entrada);
            const agora = new Date();
            const diffMs = agora - entrada;
            const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
            const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
            
            tempoPermanencia = `${diffHrs}h ${diffMins}min (em aberto)`;
        }
        
        // Determinar tipo
        let tipo = 'Normal';
        if (veiculo.tipoCliente === 'mensalista') {
            tipo = 'Mensalista';
        } else if (veiculo.tipoCliente === 'isento') {
            tipo = 'Isento';
        } else if (veiculo.servicos && veiculo.servicos.length > 0) {
            tipo = 'Serviço';
        }
        
        // Preencher células
        tr.innerHTML = `
            <td>${utils.formatarData(veiculo.entrada)}</td>
            <td>${veiculo.ticket || '-'}</td>
            <td>${veiculo.placa}</td>
            <td>${tipo}</td>
            <td>${utils.formatarDataHora(veiculo.entrada)}</td>
            <td>${veiculo.saida ? utils.formatarDataHora(veiculo.saida) : '-'}</td>
            <td>${tempoPermanencia}</td>
            <td>${utils.formatarMoeda(veiculo.valorTotal || 0)}</td>
        `;
        
        // Adicionar à tabela
        tabela.appendChild(tr);
    });
}

// Exportar relatório
function exportarRelatorio() {
    // Obter filtros
    const dataInicio = document.getElementById('filtro-data-inicio').value;
    const dataFim = document.getElementById('filtro-data-fim').value;
    const tipo = document.getElementById('filtro-tipo').value;
    const cliente = document.getElementById('filtro-cliente').value;
    
    // Criar nome do arquivo
    const nomeArquivo = `relatorio_${dataInicio}_a_${dataFim}.csv`;
    
    // Obter dados da tabela
    const tabela = document.getElementById('tabela-detalhes');
    const linhas = tabela.querySelectorAll('tr');
    
    // Criar conteúdo CSV
    let csv = 'Data,Ticket,Placa,Tipo,Entrada,Saída,Tempo,Valor\n';
    
    linhas.forEach(linha => {
        const colunas = linha.querySelectorAll('td');
        
        // Verificar se é uma linha de dados
        if (colunas.length === 8) {
            const valores = Array.from(colunas).map(coluna => {
                // Escapar aspas duplas
                return `"${coluna.textContent.replace(/"/g, '""')}"`;
            });
            
            csv += valores.join(',') + '\n';
        }
    });
    
    // Criar link de download
    const link = document.createElement('a');
    link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
    link.download = nomeArquivo;
    link.style.display = 'none';
    
    // Adicionar ao documento e clicar
    document.body.appendChild(link);
    link.click();
    
    // Remover link
    document.body.removeChild(link);
    
    // Mostrar notificação
    showNotification('Relatório exportado com sucesso', 'success');
}
