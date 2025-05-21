/**
 * Arquivo JavaScript para o painel administrativo
 */

// Variáveis globais
let rifasData = [];
let vendasData = [];
let clientesData = [];
let estatisticasData = {};

// Função para inicializar a página
async function inicializarPagina() {
    try {
        // Verificar qual página está sendo exibida
        const paginaAtual = obterPaginaAtual();
        
        // Carregar dados específicos da página
        switch (paginaAtual) {
            case 'dashboard':
                await carregarDadosDashboard();
                break;
            case 'rifas':
                await carregarRifas();
                break;
            case 'criar-rifa':
                configurarFormularioRifa();
                break;
            case 'editar-rifa':
                await carregarDadosEdicaoRifa();
                break;
            case 'gerenciar-rifa':
                await carregarDadosGerenciamentoRifa();
                break;
            case 'vendas':
                await carregarVendas();
                break;
            case 'clientes':
                await carregarClientes();
                break;
        }
        
        // Configurar eventos comuns
        configurarEventosComuns();
        
    } catch (error) {
        console.error('Erro ao inicializar página:', error);
        utils.mostrarNotificacao('Erro ao carregar dados', 'erro');
    }
}

// Função para obter a página atual
function obterPaginaAtual() {
    const path = window.location.pathname;
    const pagina = path.split('/').pop().replace('.html', '');
    
    return pagina || 'dashboard';
}

// Função para carregar dados do dashboard
async function carregarDadosDashboard() {
    try {
        // Simular carregamento de estatísticas
        estatisticasData = {
            totalRifas: 6,
            totalVendas: 124,
            totalClientes: 87,
            faturamentoTotal: 3450.00
        };
        
        // Atualizar cards de estatísticas
        document.getElementById('total-rifas').textContent = estatisticasData.totalRifas;
        document.getElementById('total-vendas').textContent = estatisticasData.totalVendas;
        document.getElementById('total-clientes').textContent = estatisticasData.totalClientes;
        document.getElementById('total-faturamento').textContent = utils.formatarMoeda(estatisticasData.faturamentoTotal);
        
        // Carregar rifas recentes
        await carregarRifasRecentes();
        
        // Carregar vendas recentes
        await carregarVendasRecentes();
        
    } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
        throw error;
    }
}

// Função para carregar rifas recentes
async function carregarRifasRecentes() {
    try {
        // Obter rifas da API
        const response = await api.obterRifas();
        
        if (response.success) {
            rifasData = response.data;
            
            // Exibir apenas as 5 primeiras rifas
            const rifasRecentes = rifasData.slice(0, 5);
            
            // Atualizar tabela de rifas
            const tabelaRifas = document.getElementById('tabela-rifas');
            
            if (tabelaRifas) {
                tabelaRifas.innerHTML = '';
                
                rifasRecentes.forEach(rifa => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${rifa.titulo}</td>
                        <td>${utils.formatarData(rifa.dataSorteio)}</td>
                        <td>${utils.formatarMoeda(rifa.valor)}</td>
                        <td>${rifa.numerosVendidos}/${rifa.totalNumeros}</td>
                        <td><span class="status-badge badge-${obterClasseStatus(rifa.status)}">${obterTextoStatus(rifa.status)}</span></td>
                        <td>
                            <div class="action-buttons">
                                <a href="gerenciar-rifa.html?id=${rifa.id}" class="btn-action btn-view" title="Visualizar">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="editar-rifa.html?id=${rifa.id}" class="btn-action btn-edit" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <button class="btn-action btn-delete" title="Excluir" data-id="${rifa.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    
                    tabelaRifas.appendChild(tr);
                });
                
                // Configurar eventos de exclusão
                configurarEventosExclusao();
            }
        }
    } catch (error) {
        console.error('Erro ao carregar rifas recentes:', error);
        throw error;
    }
}

// Função para carregar vendas recentes
async function carregarVendasRecentes() {
    try {
        // Simular carregamento de vendas recentes
        vendasData = [
            {
                id: 'venda1',
                cliente: 'João Silva',
                rifa: 'iPhone 15 Pro Max',
                numeros: [12, 34, 56],
                data: '2025-05-18T14:30:00',
                valor: 30.00,
                status: 'confirmado'
            },
            {
                id: 'venda2',
                cliente: 'Maria Oliveira',
                rifa: 'PlayStation 5 + 3 Jogos',
                numeros: [7, 21, 42, 65],
                data: '2025-05-17T10:15:00',
                valor: 20.00,
                status: 'confirmado'
            },
            {
                id: 'venda3',
                cliente: 'Pedro Santos',
                rifa: 'Smart TV 65" 4K',
                numeros: [18, 27],
                data: '2025-05-16T16:45:00',
                valor: 16.00,
                status: 'aguardando'
            },
            {
                id: 'venda4',
                cliente: 'Ana Costa',
                rifa: 'Vale Compras R$ 1.000',
                numeros: [101, 102, 103, 104, 105],
                data: '2025-05-15T09:20:00',
                valor: 12.50,
                status: 'cancelado'
            }
        ];
        
        // Atualizar tabela de vendas
        const tabelaVendas = document.getElementById('tabela-vendas');
        
        if (tabelaVendas) {
            tabelaVendas.innerHTML = '';
            
            vendasData.forEach(venda => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${venda.cliente}</td>
                    <td>${venda.rifa}</td>
                    <td>${venda.numeros.join(', ')}</td>
                    <td>${utils.formatarData(venda.data)}</td>
                    <td>${utils.formatarMoeda(venda.valor)}</td>
                    <td><span class="status-badge badge-${obterClasseStatusVenda(venda.status)}">${obterTextoStatusVenda(venda.status)}</span></td>
                `;
                
                tabelaVendas.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar vendas recentes:', error);
        throw error;
    }
}

// Função para carregar todas as rifas
async function carregarRifas() {
    try {
        // Mostrar spinner de carregamento
        const tabelaRifas = document.getElementById('tabela-rifas-completa');
        if (tabelaRifas) {
            tabelaRifas.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                            <p>Carregando rifas...</p>
                        </div>
                    </td>
                </tr>
            `;
        }
        
        // Obter rifas da API
        const response = await api.obterRifas();
        
        if (response.success) {
            rifasData = response.data;
            
            // Atualizar tabela de rifas
            if (tabelaRifas) {
                tabelaRifas.innerHTML = '';
                
                if (rifasData.length === 0) {
                    tabelaRifas.innerHTML = `
                        <tr>
                            <td colspan="7" class="text-center">
                                <p>Nenhuma rifa encontrada</p>
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                rifasData.forEach(rifa => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                        <td>${rifa.titulo}</td>
                        <td>${utils.formatarData(rifa.dataSorteio)}</td>
                        <td>${utils.formatarMoeda(rifa.valor)}</td>
                        <td>${rifa.numerosVendidos}/${rifa.totalNumeros}</td>
                        <td><span class="status-badge badge-${obterClasseStatus(rifa.status)}">${obterTextoStatus(rifa.status)}</span></td>
                        <td>
                            <div class="action-buttons">
                                <a href="gerenciar-rifa.html?id=${rifa.id}" class="btn-action btn-view" title="Visualizar">
                                    <i class="fas fa-eye"></i>
                                </a>
                                <a href="editar-rifa.html?id=${rifa.id}" class="btn-action btn-edit" title="Editar">
                                    <i class="fas fa-edit"></i>
                                </a>
                                <button class="btn-action btn-delete" title="Excluir" data-id="${rifa.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    `;
                    
                    tabelaRifas.appendChild(tr);
                });
                
                // Configurar eventos de exclusão
                configurarEventosExclusao();
            }
        } else {
            utils.mostrarNotificacao('Erro ao carregar rifas', 'erro');
        }
    } catch (error) {
        console.error('Erro ao carregar rifas:', error);
        utils.mostrarNotificacao('Erro ao carregar rifas', 'erro');
    }
}

// Função para configurar formulário de criação de rifa
function configurarFormularioRifa() {
    const formRifa = document.getElementById('form-rifa');
    
    if (formRifa) {
        // Configurar preview de imagem
        const inputImagem = document.getElementById('imagem');
        const previewImagem = document.querySelector('.image-preview');
        const previewImg = previewImagem.querySelector('img');
        
        if (inputImagem && previewImagem) {
            inputImagem.addEventListener('change', (e) => {
                const file = e.target.files[0];
                
                if (file) {
                    const reader = new FileReader();
                    
                    reader.onload = (e) => {
                        previewImg.src = e.target.result;
                        previewImagem.classList.add('has-image');
                    };
                    
                    reader.readAsDataURL(file);
                } else {
                    previewImg.src = '';
                    previewImagem.classList.remove('has-image');
                }
            });
        }
        
        // Configurar envio do formulário
        formRifa.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Obter dados do formulário
            const titulo = document.getElementById('titulo').value;
            const descricao = document.getElementById('descricao').value;
            const valor = parseFloat(document.getElementById('valor').value);
            const totalNumeros = parseInt(document.getElementById('total-numeros').value);
            const dataSorteio = document.getElementById('data-sorteio').value;
            const status = document.getElementById('status').value;
            
            // Validar dados
            if (!titulo || !descricao || isNaN(valor) || isNaN(totalNumeros) || !dataSorteio) {
                utils.mostrarNotificacao('Preencha todos os campos obrigatórios', 'erro');
                return;
            }
            
            // Criar objeto da rifa
            const novaRifa = {
                titulo,
                descricao,
                valor,
                totalNumeros,
                dataSorteio,
                status,
                imagem: previewImg.src || 'https://placehold.co/600x400/4e54c8/ffffff?text=Rifa'
            };
            
            try {
                // Desabilitar botão durante o envio
                const btnSubmit = formRifa.querySelector('button[type="submit"]');
                btnSubmit.disabled = true;
                btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                
                // Enviar para API
                const response = await api.criarRifa(novaRifa);
                
                if (response.success) {
                    utils.mostrarNotificacao('Rifa criada com sucesso!', 'sucesso');
                    
                    // Redirecionar para lista de rifas
                    setTimeout(() => {
                        window.location.href = 'rifas.html';
                    }, 1500);
                } else {
                    utils.mostrarNotificacao(response.message || 'Erro ao criar rifa', 'erro');
                    btnSubmit.disabled = false;
                    btnSubmit.textContent = 'Salvar Rifa';
                }
            } catch (error) {
                console.error('Erro ao criar rifa:', error);
                utils.mostrarNotificacao('Erro ao criar rifa', 'erro');
                btnSubmit.disabled = false;
                btnSubmit.textContent = 'Salvar Rifa';
            }
        });
    }
}

// Função para carregar dados para edição de rifa
async function carregarDadosEdicaoRifa() {
    try {
        // Obter ID da rifa da URL
        const idRifa = utils.obterParametroUrl('id');
        
        if (!idRifa) {
            window.location.href = 'rifas.html';
            return;
        }
        
        // Obter detalhes da rifa
        const response = await api.obterRifaDetalhes(idRifa);
        
        if (response.success) {
            const rifa = response.data;
            
            // Preencher formulário
            document.getElementById('titulo').value = rifa.titulo;
            document.getElementById('descricao').value = rifa.descricaoCompleta || rifa.descricao;
            document.getElementById('valor').value = rifa.valor;
            document.getElementById('total-numeros').value = rifa.totalNumeros;
            
            // Formatar data para o formato do input date
            const dataSorteio = new Date(rifa.dataSorteio);
            const dataFormatada = dataSorteio.toISOString().split('T')[0];
            document.getElementById('data-sorteio').value = dataFormatada;
            
            document.getElementById('status').value = rifa.status;
            
            // Exibir imagem
            const previewImagem = document.querySelector('.image-preview');
            const previewImg = previewImagem.querySelector('img');
            
            if (rifa.imagem) {
                previewImg.src = rifa.imagem;
                previewImagem.classList.add('has-image');
            }
            
            // Configurar formulário
            configurarFormularioRifa();
            
            // Atualizar título da página
            document.querySelector('.page-title').textContent = `Editar Rifa: ${rifa.titulo}`;
            
            // Configurar botão de envio para atualização
            const formRifa = document.getElementById('form-rifa');
            
            if (formRifa) {
                formRifa.removeEventListener('submit', formRifa.onsubmit);
                
                formRifa.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    
                    // Obter dados do formulário
                    const titulo = document.getElementById('titulo').value;
                    const descricao = document.getElementById('descricao').value;
                    const valor = parseFloat(document.getElementById('valor').value);
                    const totalNumeros = parseInt(document.getElementById('total-numeros').value);
                    const dataSorteio = document.getElementById('data-sorteio').value;
                    const status = document.getElementById('status').value;
                    
                    // Validar dados
                    if (!titulo || !descricao || isNaN(valor) || isNaN(totalNumeros) || !dataSorteio) {
                        utils.mostrarNotificacao('Preencha todos os campos obrigatórios', 'erro');
                        return;
                    }
                    
                    // Criar objeto da rifa
                    const rifaAtualizada = {
                        titulo,
                        descricao,
                        valor,
                        totalNumeros,
                        dataSorteio,
                        status,
                        imagem: previewImg.src || rifa.imagem
                    };
                    
                    try {
                        // Desabilitar botão durante o envio
                        const btnSubmit = formRifa.querySelector('button[type="submit"]');
                        btnSubmit.disabled = true;
                        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
                        
                        // Enviar para API
                        const response = await api.atualizarRifa(idRifa, rifaAtualizada);
                        
                        if (response.success) {
                            utils.mostrarNotificacao('Rifa atualizada com sucesso!', 'sucesso');
                            
                            // Redirecionar para lista de rifas
                            setTimeout(() => {
                                window.location.href = 'rifas.html';
                            }, 1500);
                        } else {
                            utils.mostrarNotificacao(response.message || 'Erro ao atualizar rifa', 'erro');
                            btnSubmit.disabled = false;
                            btnSubmit.textContent = 'Atualizar Rifa';
                        }
                    } catch (error) {
                        console.error('Erro ao atualizar rifa:', error);
                        utils.mostrarNotificacao('Erro ao atualizar rifa', 'erro');
                        btnSubmit.disabled = false;
                        btnSubmit.textContent = 'Atualizar Rifa';
                    }
                });
            }
        } else {
            utils.mostrarNotificacao('Erro ao carregar dados da rifa', 'erro');
            setTimeout(() => {
                window.location.href = 'rifas.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Erro ao carregar dados para edição:', error);
        utils.mostrarNotificacao('Erro ao carregar dados da rifa', 'erro');
    }
}

// Função para carregar dados para gerenciamento de rifa
async function carregarDadosGerenciamentoRifa() {
    try {
        // Obter ID da rifa da URL
        const idRifa = utils.obterParametroUrl('id');
        
        if (!idRifa) {
            window.location.href = 'rifas.html';
            return;
        }
        
        // Obter detalhes da rifa
        const response = await api.obterRifaDetalhes(idRifa);
        
        if (response.success) {
            const rifa = response.data;
            
            // Atualizar título da página
            document.querySelector('.page-title').textContent = `Gerenciar Rifa: ${rifa.titulo}`;
            
            // Preencher dados da rifa
            document.getElementById('rifa-titulo').textContent = rifa.titulo;
            document.getElementById('rifa-descricao').textContent = rifa.descricao;
            document.getElementById('rifa-valor').textContent = utils.formatarMoeda(rifa.valor);
            document.getElementById('rifa-data-sorteio').textContent = utils.formatarData(rifa.dataSorteio);
            document.getElementById('rifa-total-numeros').textContent = rifa.totalNumeros;
            document.getElementById('rifa-numeros-vendidos').textContent = rifa.numerosVendidos;
            
            const statusElement = document.getElementById('rifa-status');
            statusElement.textContent = obterTextoStatus(rifa.status);
            statusElement.className = `status-badge badge-${obterClasseStatus(rifa.status)}`;
            
            // Carregar números da rifa
            await carregarNumerosRifa(idRifa);
            
            // Configurar eventos de alteração de status
            configurarEventosAlteracaoStatus(idRifa, rifa.status);
            
        } else {
            utils.mostrarNotificacao('Erro ao carregar dados da rifa', 'erro');
            setTimeout(() => {
                window.location.href = 'rifas.html';
            }, 1500);
        }
    } catch (error) {
        console.error('Erro ao carregar dados para gerenciamento:', error);
        utils.mostrarNotificacao('Erro ao carregar dados da rifa', 'erro');
    }
}

// Função para carregar números da rifa
async function carregarNumerosRifa(idRifa) {
    try {
        // Mostrar spinner de carregamento
        const numerosContainer = document.getElementById('numeros-container');
        
        if (numerosContainer) {
            numerosContainer.innerHTML = `
                <div class="loading-spinner">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Carregando números...</p>
                </div>
            `;
        }
        
        // Obter números da rifa
        const response = await api.obterNumeros(idRifa);
        
        if (response.success) {
            const numerosData = response.data.numeros;
            
            // Atualizar container de números
            if (numerosContainer) {
                numerosContainer.innerHTML = '';
                
                // Agrupar números por status
                const numerosAgrupados = {
                    disponivel: [],
                    reservado: [],
                    vendido: []
                };
                
                numerosData.forEach(numero => {
                    numerosAgrupados[numero.status].push(numero);
                });
                
                // Criar resumo de números
                const resumoNumeros = document.createElement('div');
                resumoNumeros.className = 'numeros-resumo';
                resumoNumeros.innerHTML = `
                    <div class="resumo-item">
                        <span class="status-badge badge-success">Disponíveis: ${numerosAgrupados.disponivel.length}</span>
                    </div>
                    <div class="resumo-item">
                        <span class="status-badge badge-warning">Reservados: ${numerosAgrupados.reservado.length}</span>
                    </div>
                    <div class="resumo-item">
                        <span class="status-badge badge-danger">Vendidos: ${numerosAgrupados.vendido.length}</span>
                    </div>
                `;
                
                numerosContainer.appendChild(resumoNumeros);
                
                // Criar grid de números
                const numerosGrid = document.createElement('div');
                numerosGrid.className = 'numeros-grid admin-numeros-grid';
                
                numerosData.forEach(numero => {
                    const numeroElement = document.createElement('div');
                    numeroElement.className = `numero-item numero-${numero.status}`;
                    numeroElement.textContent = numero.numero.toString().padStart(2, '0');
                    
                    // Adicionar tooltip com informações do comprador
                    if (numero.status !== 'disponivel' && numero.comprador) {
                        numeroElement.setAttribute('title', `${numero.comprador.nome} (${numero.comprador.email})`);
                    }
                    
                    numerosGrid.appendChild(numeroElement);
                });
                
                numerosContainer.appendChild(numerosGrid);
            }
        } else {
            utils.mostrarNotificacao('Erro ao carregar números da rifa', 'erro');
        }
    } catch (error) {
        console.error('Erro ao carregar números da rifa:', error);
        utils.mostrarNotificacao('Erro ao carregar números da rifa', 'erro');
    }
}

// Função para configurar eventos de alteração de status
function configurarEventosAlteracaoStatus(idRifa, statusAtual) {
    const btnAlterarStatus = document.getElementById('btn-alterar-status');
    const selectStatus = document.getElementById('select-status');
    
    if (btnAlterarStatus && selectStatus) {
        // Definir status atual no select
        selectStatus.value = statusAtual;
        
        // Configurar evento de clique
        btnAlterarStatus.addEventListener('click', async () => {
            const novoStatus = selectStatus.value;
            
            if (novoStatus === statusAtual) {
                utils.mostrarNotificacao('O status selecionado é o mesmo atual', 'info');
                return;
            }
            
            try {
                // Desabilitar botão durante o envio
                btnAlterarStatus.disabled = true;
                btnAlterarStatus.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Atualizando...';
                
                // Enviar para API
                const response = await api.atualizarRifa(idRifa, { status: novoStatus });
                
                if (response.success) {
                    utils.mostrarNotificacao('Status atualizado com sucesso!', 'sucesso');
                    
                    // Atualizar status na página
                    const statusElement = document.getElementById('rifa-status');
                    statusElement.textContent = obterTextoStatus(novoStatus);
                    statusElement.className = `status-badge badge-${obterClasseStatus(novoStatus)}`;
                    
                    // Atualizar variável de status atual
                    statusAtual = novoStatus;
                } else {
                    utils.mostrarNotificacao(response.message || 'Erro ao atualizar status', 'erro');
                }
            } catch (error) {
                console.error('Erro ao atualizar status:', error);
                utils.mostrarNotificacao('Erro ao atualizar status', 'erro');
            } finally {
                // Reabilitar botão
                btnAlterarStatus.disabled = false;
                btnAlterarStatus.textContent = 'Alterar Status';
            }
        });
    }
}

// Função para carregar vendas
async function carregarVendas() {
    try {
        // Simular carregamento de vendas
        vendasData = [
            {
                id: 'venda1',
                cliente: 'João Silva',
                rifa: 'iPhone 15 Pro Max',
                numeros: [12, 34, 56],
                data: '2025-05-18T14:30:00',
                valor: 30.00,
                status: 'confirmado'
            },
            {
                id: 'venda2',
                cliente: 'Maria Oliveira',
                rifa: 'PlayStation 5 + 3 Jogos',
                numeros: [7, 21, 42, 65],
                data: '2025-05-17T10:15:00',
                valor: 20.00,
                status: 'confirmado'
            },
            {
                id: 'venda3',
                cliente: 'Pedro Santos',
                rifa: 'Smart TV 65" 4K',
                numeros: [18, 27],
                data: '2025-05-16T16:45:00',
                valor: 16.00,
                status: 'aguardando'
            },
            {
                id: 'venda4',
                cliente: 'Ana Costa',
                rifa: 'Vale Compras R$ 1.000',
                numeros: [101, 102, 103, 104, 105],
                data: '2025-05-15T09:20:00',
                valor: 12.50,
                status: 'cancelado'
            },
            {
                id: 'venda5',
                cliente: 'Carlos Mendes',
                rifa: 'iPhone 15 Pro Max',
                numeros: [78, 79, 80],
                data: '2025-05-14T11:10:00',
                valor: 30.00,
                status: 'confirmado'
            },
            {
                id: 'venda6',
                cliente: 'Fernanda Lima',
                rifa: 'Smart TV 65" 4K',
                numeros: [45, 46, 47, 48],
                data: '2025-05-13T15:30:00',
                valor: 32.00,
                status: 'confirmado'
            }
        ];
        
        // Atualizar tabela de vendas
        const tabelaVendas = document.getElementById('tabela-vendas-completa');
        
        if (tabelaVendas) {
            tabelaVendas.innerHTML = '';
            
            if (vendasData.length === 0) {
                tabelaVendas.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">
                            <p>Nenhuma venda encontrada</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            vendasData.forEach(venda => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${venda.cliente}</td>
                    <td>${venda.rifa}</td>
                    <td>${venda.numeros.join(', ')}</td>
                    <td>${utils.formatarData(venda.data)}</td>
                    <td>${utils.formatarMoeda(venda.valor)}</td>
                    <td><span class="status-badge badge-${obterClasseStatusVenda(venda.status)}">${obterTextoStatusVenda(venda.status)}</span></td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-view" title="Visualizar" data-id="${venda.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-action btn-edit" title="Alterar Status" data-id="${venda.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                tabelaVendas.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar vendas:', error);
        utils.mostrarNotificacao('Erro ao carregar vendas', 'erro');
    }
}

// Função para carregar clientes
async function carregarClientes() {
    try {
        // Simular carregamento de clientes
        clientesData = [
            {
                id: 'cliente1',
                nome: 'João Silva',
                email: 'joao.silva@exemplo.com',
                telefone: '(11) 98765-4321',
                compras: 3,
                valorTotal: 45.00,
                ultimaCompra: '2025-05-18T14:30:00'
            },
            {
                id: 'cliente2',
                nome: 'Maria Oliveira',
                email: 'maria.oliveira@exemplo.com',
                telefone: '(11) 91234-5678',
                compras: 2,
                valorTotal: 30.00,
                ultimaCompra: '2025-05-17T10:15:00'
            },
            {
                id: 'cliente3',
                nome: 'Pedro Santos',
                email: 'pedro.santos@exemplo.com',
                telefone: '(11) 99876-5432',
                compras: 1,
                valorTotal: 16.00,
                ultimaCompra: '2025-05-16T16:45:00'
            },
            {
                id: 'cliente4',
                nome: 'Ana Costa',
                email: 'ana.costa@exemplo.com',
                telefone: '(11) 98765-1234',
                compras: 1,
                valorTotal: 12.50,
                ultimaCompra: '2025-05-15T09:20:00'
            },
            {
                id: 'cliente5',
                nome: 'Carlos Mendes',
                email: 'carlos.mendes@exemplo.com',
                telefone: '(11) 91234-9876',
                compras: 1,
                valorTotal: 30.00,
                ultimaCompra: '2025-05-14T11:10:00'
            }
        ];
        
        // Atualizar tabela de clientes
        const tabelaClientes = document.getElementById('tabela-clientes');
        
        if (tabelaClientes) {
            tabelaClientes.innerHTML = '';
            
            if (clientesData.length === 0) {
                tabelaClientes.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">
                            <p>Nenhum cliente encontrado</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            clientesData.forEach(cliente => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${cliente.nome}</td>
                    <td>${cliente.email}</td>
                    <td>${cliente.telefone}</td>
                    <td>${cliente.compras}</td>
                    <td>${utils.formatarMoeda(cliente.valorTotal)}</td>
                    <td>${utils.formatarData(cliente.ultimaCompra)}</td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action btn-view" title="Visualizar" data-id="${cliente.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                `;
                
                tabelaClientes.appendChild(tr);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar clientes:', error);
        utils.mostrarNotificacao('Erro ao carregar clientes', 'erro');
    }
}

// Função para configurar eventos de exclusão
function configurarEventosExclusao() {
    const btnsDelete = document.querySelectorAll('.btn-delete');
    
    btnsDelete.forEach(btn => {
        btn.addEventListener('click', async () => {
            const idRifa = btn.getAttribute('data-id');
            
            if (confirm('Tem certeza que deseja excluir esta rifa?')) {
                try {
                    // Enviar para API
                    const response = await api.excluirRifa(idRifa);
                    
                    if (response.success) {
                        utils.mostrarNotificacao('Rifa excluída com sucesso!', 'sucesso');
                        
                        // Remover linha da tabela
                        const tr = btn.closest('tr');
                        tr.remove();
                    } else {
                        utils.mostrarNotificacao(response.message || 'Erro ao excluir rifa', 'erro');
                    }
                } catch (error) {
                    console.error('Erro ao excluir rifa:', error);
                    utils.mostrarNotificacao('Erro ao excluir rifa', 'erro');
                }
            }
        });
    });
}

// Função para configurar eventos comuns
function configurarEventosComuns() {
    // Toggle do sidebar no mobile
    const toggleSidebar = document.querySelector('.toggle-sidebar');
    const adminSidebar = document.querySelector('.admin-sidebar');
    
    if (toggleSidebar && adminSidebar) {
        toggleSidebar.addEventListener('click', () => {
            adminSidebar.classList.toggle('mobile-show');
        });
        
        // Fechar sidebar ao clicar fora
        document.addEventListener('click', (e) => {
            if (adminSidebar.classList.contains('mobile-show') && 
                !adminSidebar.contains(e.target) && 
                e.target !== toggleSidebar) {
                adminSidebar.classList.remove('mobile-show');
            }
        });
    }
    
    // Dropdown do usuário
    const dropdownToggle = document.querySelector('.dropdown-toggle');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    if (dropdownToggle && dropdownMenu) {
        dropdownToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            dropdownMenu.classList.toggle('show');
        });
        
        // Fechar dropdown ao clicar fora
        document.addEventListener('click', () => {
            dropdownMenu.classList.remove('show');
        });
    }
}

// Função para obter texto do status
function obterTextoStatus(status) {
    switch (status) {
        case 'ativa':
            return 'Ativa';
        case 'aguardando':
            return 'Aguardando Sorteio';
        case 'encerrada':
            return 'Encerrada';
        default:
            return status;
    }
}

// Função para obter classe CSS do status
function obterClasseStatus(status) {
    switch (status) {
        case 'ativa':
            return 'success';
        case 'aguardando':
            return 'warning';
        case 'encerrada':
            return 'danger';
        default:
            return 'info';
    }
}

// Função para obter texto do status de venda
function obterTextoStatusVenda(status) {
    switch (status) {
        case 'confirmado':
            return 'Confirmado';
        case 'aguardando':
            return 'Aguardando';
        case 'cancelado':
            return 'Cancelado';
        default:
            return status;
    }
}

// Função para obter classe CSS do status de venda
function obterClasseStatusVenda(status) {
    switch (status) {
        case 'confirmado':
            return 'success';
        case 'aguardando':
            return 'warning';
        case 'cancelado':
            return 'danger';
        default:
            return 'info';
    }
}

// Inicializar página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarPagina);
