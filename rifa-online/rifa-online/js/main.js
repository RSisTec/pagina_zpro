/**
 * Arquivo principal de JavaScript para a página inicial
 */

// Variáveis globais
let rifasData = [];
let filtroAtual = 'todas';
let termoBusca = '';

// Função para inicializar a página
async function inicializarPagina() {
    // Carregar rifas da API
    await carregarRifas();
    
    // Configurar eventos
    configurarEventos();
}

// Função para carregar rifas da API
async function carregarRifas() {
    try {
        // Mostrar spinner de carregamento
        document.querySelector('.loading-spinner').style.display = 'block';
        document.getElementById('lista-rifas').innerHTML = '';
        
        // Obter rifas da API
        const response = await api.obterRifas();
        
        if (response.success) {
            rifasData = response.data;
            
            // Filtrar e exibir rifas
            filtrarExibirRifas();
        } else {
            utils.mostrarNotificacao('Erro ao carregar rifas', 'erro');
        }
    } catch (error) {
        console.error('Erro ao carregar rifas:', error);
        utils.mostrarNotificacao('Erro ao carregar rifas', 'erro');
    } finally {
        // Esconder spinner de carregamento
        document.querySelector('.loading-spinner').style.display = 'none';
    }
}

// Função para filtrar e exibir rifas
function filtrarExibirRifas() {
    // Limpar lista de rifas
    const listaRifas = document.getElementById('lista-rifas');
    
    // Remover spinner se existir
    const spinner = listaRifas.querySelector('.loading-spinner');
    if (spinner) {
        listaRifas.removeChild(spinner);
    }
    
    // Filtrar rifas de acordo com o filtro atual
    let rifasFiltradas = rifasData;
    
    if (filtroAtual !== 'todas') {
        rifasFiltradas = rifasData.filter(rifa => rifa.status === filtroAtual);
    }
    
    // Filtrar por termo de busca, se existir
    if (termoBusca) {
        const termo = termoBusca.toLowerCase();
        rifasFiltradas = rifasFiltradas.filter(rifa => 
            rifa.titulo.toLowerCase().includes(termo) || 
            rifa.descricao.toLowerCase().includes(termo)
        );
    }
    
    // Verificar se há rifas para exibir
    if (rifasFiltradas.length === 0) {
        listaRifas.innerHTML = `
            <div class="sem-rifas">
                <i class="fas fa-ticket-alt"></i>
                <h3>Nenhuma rifa encontrada</h3>
                <p>Tente mudar os filtros ou volte mais tarde.</p>
            </div>
        `;
        return;
    }
    
    // Exibir rifas filtradas
    rifasFiltradas.forEach(rifa => {
        const cardRifa = criarCardRifa(rifa);
        listaRifas.appendChild(cardRifa);
    });
}

// Função para criar card de rifa
function criarCardRifa(rifa) {
    // Clonar template
    const template = document.getElementById('template-card-rifa');
    const card = document.importNode(template.content, true);
    
    // Preencher dados da rifa
    const img = card.querySelector('.rifa-img img');
    img.src = rifa.imagem;
    img.alt = rifa.titulo;
    
    // Status da rifa
    const statusElement = card.querySelector('.rifa-status');
    statusElement.textContent = obterTextoStatus(rifa.status);
    statusElement.classList.add(`status-${rifa.status}`);
    
    // Título e descrição
    card.querySelector('.rifa-titulo').textContent = rifa.titulo;
    card.querySelector('.rifa-descricao').textContent = utils.truncarTexto(rifa.descricao, 100);
    
    // Preço e data
    card.querySelector('.rifa-preco span').textContent = utils.formatarMoeda(rifa.valor);
    card.querySelector('.rifa-data span').textContent = utils.formatarData(rifa.dataSorteio);
    
    // Progresso
    const porcentagem = (rifa.numerosVendidos / rifa.totalNumeros) * 100;
    card.querySelector('.progresso-preenchimento').style.width = `${porcentagem}%`;
    card.querySelector('.numeros-vendidos').textContent = `${rifa.numerosVendidos} vendidos`;
    card.querySelector('.total-numeros').textContent = `de ${rifa.totalNumeros}`;
    
    // Link para página da rifa
    const btnVerRifa = card.querySelector('.btn-ver-rifa');
    btnVerRifa.href = `rifa.html?id=${rifa.id}`;
    
    return card.firstElementChild;
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
    // Filtro de rifas
    const filtroRifas = document.getElementById('filtro-rifas');
    if (filtroRifas) {
        filtroRifas.addEventListener('change', () => {
            filtroAtual = filtroRifas.value;
            filtrarExibirRifas();
        });
    }
    
    // Busca de rifas
    const buscaRifa = document.getElementById('busca-rifa');
    const btnBusca = buscaRifa?.nextElementSibling;
    
    if (buscaRifa && btnBusca) {
        // Busca ao clicar no botão
        btnBusca.addEventListener('click', () => {
            termoBusca = buscaRifa.value.trim();
            filtrarExibirRifas();
        });
        
        // Busca ao pressionar Enter
        buscaRifa.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                termoBusca = buscaRifa.value.trim();
                filtrarExibirRifas();
            }
        });
    }
    
    // Formulário de newsletter
    const formNewsletter = document.getElementById('form-newsletter');
    if (formNewsletter) {
        formNewsletter.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = formNewsletter.querySelector('input[type="email"]').value;
            
            if (email && utils.validarEmail(email)) {
                // Simular envio para API
                setTimeout(() => {
                    utils.mostrarNotificacao('E-mail cadastrado com sucesso!', 'sucesso');
                    formNewsletter.reset();
                }, 500);
            } else {
                utils.mostrarNotificacao('Por favor, informe um e-mail válido', 'erro');
            }
        });
    }
}

// Inicializar página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarPagina);
