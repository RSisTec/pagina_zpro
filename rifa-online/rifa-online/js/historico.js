/**
 * Arquivo JavaScript para a página de histórico de rifas
 */

// Variáveis globais
let historicoData = null;
let paginaAtual = 1;
let filtroAtual = 'todas';
let termoBusca = '';

// Função para inicializar a página
async function inicializarPagina() {
    try {
        // Carregar histórico de rifas
        await carregarHistorico();
        
        // Configurar eventos
        configurarEventos();
        
    } catch (error) {
        console.error('Erro ao inicializar página:', error);
        utils.mostrarNotificacao('Erro ao carregar histórico de rifas', 'erro');
    }
}

// Função para carregar histórico de rifas
async function carregarHistorico() {
    try {
        // Mostrar spinner de carregamento
        document.querySelector('.loading-spinner').style.display = 'block';
        document.getElementById('historico-lista').innerHTML = '';
        
        // Obter histórico da API
        const response = await api.obterHistorico(paginaAtual, { status: filtroAtual });
        
        if (response.success) {
            historicoData = response.data;
            
            // Exibir histórico
            exibirHistorico();
            
            // Configurar paginação
            configurarPaginacao(historicoData.paginacao);
        } else {
            utils.mostrarNotificacao('Erro ao carregar histórico', 'erro');
        }
    } catch (error) {
        console.error('Erro ao carregar histórico:', error);
        utils.mostrarNotificacao('Erro ao carregar histórico', 'erro');
    } finally {
        // Esconder spinner de carregamento
        document.querySelector('.loading-spinner').style.display = 'none';
    }
}

// Função para exibir histórico de rifas
function exibirHistorico() {
    const historicoLista = document.getElementById('historico-lista');
    historicoLista.innerHTML = '';
    
    // Verificar se há rifas para exibir
    if (!historicoData || !historicoData.rifas || historicoData.rifas.length === 0) {
        historicoLista.innerHTML = `
            <div class="sem-historico">
                <i class="fas fa-history"></i>
                <h3>Nenhuma rifa encontrada</h3>
                <p>Tente mudar os filtros ou volte mais tarde.</p>
            </div>
        `;
        return;
    }
    
    // Filtrar por termo de busca, se existir
    let rifasFiltradas = historicoData.rifas;
    
    if (termoBusca) {
        const termo = termoBusca.toLowerCase();
        rifasFiltradas = rifasFiltradas.filter(rifa => 
            rifa.titulo.toLowerCase().includes(termo) || 
            rifa.descricao.toLowerCase().includes(termo)
        );
        
        if (rifasFiltradas.length === 0) {
            historicoLista.innerHTML = `
                <div class="sem-historico">
                    <i class="fas fa-search"></i>
                    <h3>Nenhuma rifa encontrada</h3>
                    <p>Tente mudar os termos da busca.</p>
                </div>
            `;
            return;
        }
    }
    
    // Exibir rifas filtradas
    rifasFiltradas.forEach(rifa => {
        const itemHistorico = criarItemHistorico(rifa);
        historicoLista.appendChild(itemHistorico);
    });
}

// Função para criar item de histórico
function criarItemHistorico(rifa) {
    // Clonar template
    const template = document.getElementById('template-item-historico');
    const item = document.importNode(template.content, true);
    
    // Preencher dados da rifa
    const img = item.querySelector('.historico-img img');
    img.src = rifa.imagem;
    img.alt = rifa.titulo;
    
    // Status da rifa
    const statusElement = item.querySelector('.historico-status');
    statusElement.textContent = obterTextoStatus(rifa.status);
    statusElement.classList.add(`status-${rifa.status}`);
    
    // Título
    item.querySelector('.historico-titulo').textContent = rifa.titulo;
    
    // Metadados
    item.querySelector('.data-sorteio').textContent = utils.formatarData(rifa.dataSorteio);
    item.querySelector('.total-participantes').textContent = `${rifa.totalParticipantes} participantes`;
    item.querySelector('.total-numeros').textContent = `${rifa.totalNumeros} números`;
    
    // Ganhadores
    const ganhadoresContainer = item.querySelector('.ganhadores');
    
    if (rifa.ganhadores && rifa.ganhadores.length > 0) {
        rifa.ganhadores.forEach(ganhador => {
            const ganhadorElement = document.createElement('div');
            ganhadorElement.className = 'ganhador';
            ganhadorElement.innerHTML = `
                <span class="ganhador-nome">${ganhador.nome}</span>
                <span class="ganhador-numero">Número: ${ganhador.numero}</span>
            `;
            
            ganhadoresContainer.appendChild(ganhadorElement);
        });
    } else {
        ganhadoresContainer.innerHTML = '<p class="sem-ganhadores">Sorteio ainda não realizado</p>';
    }
    
    // Link para página da rifa
    const btnVerRifa = item.querySelector('.btn-ver-rifa');
    btnVerRifa.href = `rifa.html?id=${rifa.id}`;
    
    return item.firstElementChild;
}

// Função para configurar paginação
function configurarPaginacao(paginacao) {
    if (!paginacao) return;
    
    const paginasContainer = document.getElementById('paginas');
    paginasContainer.innerHTML = '';
    
    // Botão anterior
    const btnAnterior = document.querySelector('.btn-pagina[data-page="prev"]');
    btnAnterior.disabled = paginacao.paginaAtual <= 1;
    
    // Botão próximo
    const btnProximo = document.querySelector('.btn-pagina[data-page="next"]');
    btnProximo.disabled = paginacao.paginaAtual >= paginacao.totalPaginas;
    
    // Gerar botões de página
    for (let i = 1; i <= paginacao.totalPaginas; i++) {
        const btnPagina = document.createElement('button');
        btnPagina.className = `btn-pagina ${i === paginacao.paginaAtual ? 'active' : ''}`;
        btnPagina.setAttribute('data-page', i);
        btnPagina.textContent = i;
        
        btnPagina.addEventListener('click', () => {
            paginaAtual = i;
            carregarHistorico();
        });
        
        paginasContainer.appendChild(btnPagina);
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

// Função para configurar eventos
function configurarEventos() {
    // Filtro de status
    const filtroStatus = document.getElementById('filtro-status');
    if (filtroStatus) {
        filtroStatus.addEventListener('change', () => {
            filtroAtual = filtroStatus.value;
            paginaAtual = 1;
            carregarHistorico();
        });
    }
    
    // Busca de rifas
    const buscaHistorico = document.getElementById('busca-historico');
    const btnBusca = buscaHistorico?.nextElementSibling;
    
    if (buscaHistorico && btnBusca) {
        // Busca ao clicar no botão
        btnBusca.addEventListener('click', () => {
            termoBusca = buscaHistorico.value.trim();
            exibirHistorico();
        });
        
        // Busca ao pressionar Enter
        buscaHistorico.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                termoBusca = buscaHistorico.value.trim();
                exibirHistorico();
            }
        });
    }
    
    // Botões de paginação
    const btnAnterior = document.querySelector('.btn-pagina[data-page="prev"]');
    if (btnAnterior) {
        btnAnterior.addEventListener('click', () => {
            if (paginaAtual > 1) {
                paginaAtual--;
                carregarHistorico();
            }
        });
    }
    
    const btnProximo = document.querySelector('.btn-pagina[data-page="next"]');
    if (btnProximo) {
        btnProximo.addEventListener('click', () => {
            if (paginaAtual < historicoData?.paginacao?.totalPaginas) {
                paginaAtual++;
                carregarHistorico();
            }
        });
    }
}

// Inicializar página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarPagina);
