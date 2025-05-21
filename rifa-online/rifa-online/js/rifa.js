/**
 * Arquivo JavaScript para a página de detalhes da rifa
 */

// Variáveis globais
let rifaData = null;
let numerosData = [];
let numerosSelecionados = [];
let valorUnitario = 0;
let filtroNumeros = 'todos';

// Função para inicializar a página
async function inicializarPagina() {
    // Obter ID da rifa da URL
    const idRifa = utils.obterParametroUrl('id');
    
    if (!idRifa) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Carregar detalhes da rifa
        await carregarDetalhesRifa(idRifa);
        
        // Carregar números da rifa
        await carregarNumerosRifa(idRifa);
        
        // Configurar eventos
        configurarEventos();
        
    } catch (error) {
        console.error('Erro ao inicializar página:', error);
        utils.mostrarNotificacao('Erro ao carregar dados da rifa', 'erro');
    }
}

// Função para carregar detalhes da rifa
async function carregarDetalhesRifa(idRifa) {
    try {
        // Obter detalhes da rifa da API
        const response = await api.obterRifaDetalhes(idRifa);
        
        if (response.success) {
            rifaData = response.data;
            valorUnitario = rifaData.valor;
            
            // Preencher dados na página
            preencherDetalhesRifa();
        } else {
            utils.mostrarNotificacao('Erro ao carregar detalhes da rifa', 'erro');
        }
    } catch (error) {
        console.error('Erro ao carregar detalhes da rifa:', error);
        throw error;
    }
}

// Função para preencher detalhes da rifa na página
function preencherDetalhesRifa() {
    // Imagem da rifa
    document.getElementById('rifa-imagem').src = rifaData.imagem;
    document.getElementById('rifa-imagem').alt = rifaData.titulo;
    
    // Status da rifa
    const statusElement = document.getElementById('rifa-status-badge');
    statusElement.textContent = obterTextoStatus(rifaData.status);
    statusElement.className = `rifa-status status-${rifaData.status}`;
    
    // Título e descrição
    document.getElementById('rifa-titulo').textContent = rifaData.titulo;
    document.getElementById('rifa-descricao').textContent = rifaData.descricao;
    document.getElementById('rifa-descricao-completa').textContent = rifaData.descricaoCompleta;
    
    // Valor, data e números disponíveis
    document.getElementById('rifa-valor').textContent = utils.formatarMoeda(rifaData.valor);
    document.getElementById('rifa-data-sorteio').textContent = utils.formatarData(rifaData.dataSorteio);
    document.getElementById('data-sorteio-ganhadores').textContent = utils.formatarData(rifaData.dataSorteio);
    
    const numerosDisponiveis = rifaData.totalNumeros - rifaData.numerosVendidos;
    document.getElementById('rifa-numeros-disponiveis').textContent = `${numerosDisponiveis} de ${rifaData.totalNumeros}`;
    
    // Progresso
    const porcentagem = (rifaData.numerosVendidos / rifaData.totalNumeros) * 100;
    document.getElementById('progresso-barra').style.width = `${porcentagem}%`;
    document.getElementById('numeros-vendidos').textContent = `${rifaData.numerosVendidos} vendidos`;
    document.getElementById('total-numeros').textContent = `de ${rifaData.totalNumeros}`;
    
    // Ganhadores (se houver)
    if (rifaData.ganhadores && rifaData.ganhadores.length > 0) {
        document.getElementById('sem-ganhadores').style.display = 'none';
        document.getElementById('com-ganhadores').style.display = 'block';
        
        const ganhadoresList = document.getElementById('ganhadores-lista');
        ganhadoresList.innerHTML = '';
        
        rifaData.ganhadores.forEach((ganhador, index) => {
            const ganhadorElement = document.createElement('div');
            ganhadorElement.className = 'ganhador-card';
            ganhadorElement.innerHTML = `
                <div class="ganhador-posicao">${index + 1}</div>
                <div class="ganhador-info">
                    <h4>${ganhador.nome}</h4>
                    <p>Número: ${ganhador.numero} - ${utils.formatarData(ganhador.data)}</p>
                </div>
            `;
            
            ganhadoresList.appendChild(ganhadorElement);
        });
    }
}

// Função para carregar números da rifa
async function carregarNumerosRifa(idRifa) {
    try {
        // Mostrar spinner de carregamento
        document.querySelector('.loading-spinner').style.display = 'block';
        
        // Obter números da rifa da API
        const response = await api.obterNumeros(idRifa);
        
        if (response.success) {
            numerosData = response.data.numeros;
            
            // Exibir números
            exibirNumeros();
        } else {
            utils.mostrarNotificacao('Erro ao carregar números da rifa', 'erro');
        }
    } catch (error) {
        console.error('Erro ao carregar números da rifa:', error);
        throw error;
    } finally {
        // Esconder spinner de carregamento
        document.querySelector('.loading-spinner').style.display = 'none';
    }
}

// Função para exibir números da rifa
function exibirNumeros() {
    const numerosContainer = document.getElementById('numeros-container');
    numerosContainer.innerHTML = '';
    
    // Filtrar números de acordo com o filtro atual
    let numerosFiltrados = numerosData;
    
    if (filtroNumeros !== 'todos') {
        numerosFiltrados = numerosData.filter(numero => numero.status === filtroNumeros);
    }
    
    // Verificar se há números para exibir
    if (numerosFiltrados.length === 0) {
        numerosContainer.innerHTML = `
            <div class="sem-numeros-mensagem">
                <p>Nenhum número encontrado com o filtro selecionado.</p>
            </div>
        `;
        return;
    }
    
    // Exibir números filtrados
    numerosFiltrados.forEach(numero => {
        const numeroElement = document.createElement('div');
        numeroElement.className = `numero-item numero-${numero.status}`;
        numeroElement.textContent = numero.numero.toString().padStart(2, '0');
        
        // Adicionar evento de clique apenas para números disponíveis
        if (numero.status === 'disponivel') {
            numeroElement.addEventListener('click', () => toggleNumeroSelecionado(numero));
        }
        
        numerosContainer.appendChild(numeroElement);
    });
}

// Função para alternar seleção de número
function toggleNumeroSelecionado(numero) {
    const index = numerosSelecionados.findIndex(n => n.numero === numero.numero);
    
    if (index === -1) {
        // Adicionar número à seleção
        numerosSelecionados.push(numero);
        
        // Adicionar classe de selecionado ao elemento
        const numeroElement = document.querySelector(`.numero-item:nth-child(${numero.numero})`);
        if (numeroElement) {
            numeroElement.classList.add('numero-selecionado');
        }
    } else {
        // Remover número da seleção
        numerosSelecionados.splice(index, 1);
        
        // Remover classe de selecionado do elemento
        const numeroElement = document.querySelector(`.numero-item:nth-child(${numero.numero})`);
        if (numeroElement) {
            numeroElement.classList.remove('numero-selecionado');
        }
    }
    
    // Atualizar lista de números selecionados
    atualizarNumerosSelecionados();
}

// Função para atualizar lista de números selecionados
function atualizarNumerosSelecionados() {
    const listaSelecionados = document.getElementById('numeros-selecionados-lista');
    const qtdSelecionados = document.getElementById('qtd-selecionados');
    const valorTotal = document.getElementById('valor-total');
    const btnContinuar = document.getElementById('btn-continuar');
    
    // Verificar se há números selecionados
    if (numerosSelecionados.length === 0) {
        listaSelecionados.innerHTML = '<p class="sem-numeros">Nenhum número selecionado</p>';
        qtdSelecionados.textContent = '0';
        valorTotal.textContent = utils.formatarMoeda(0);
        btnContinuar.disabled = true;
        return;
    }
    
    // Limpar lista
    listaSelecionados.innerHTML = '';
    
    // Adicionar números selecionados à lista
    numerosSelecionados.forEach(numero => {
        const numeroTag = document.createElement('div');
        numeroTag.className = 'numero-tag';
        numeroTag.innerHTML = `
            <span>${numero.numero.toString().padStart(2, '0')}</span>
            <i class="fas fa-times" data-numero="${numero.numero}"></i>
        `;
        
        // Adicionar evento para remover número
        const btnRemover = numeroTag.querySelector('i');
        btnRemover.addEventListener('click', () => {
            toggleNumeroSelecionado(numero);
        });
        
        listaSelecionados.appendChild(numeroTag);
    });
    
    // Atualizar quantidade e valor total
    qtdSelecionados.textContent = numerosSelecionados.length;
    const total = numerosSelecionados.length * valorUnitario;
    valorTotal.textContent = utils.formatarMoeda(total);
    
    // Habilitar botão de continuar
    btnContinuar.disabled = false;
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
    // Tabs de conteúdo
    const tabButtons = document.querySelectorAll('.tab-btn');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remover classe active de todos os botões e conteúdos
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            button.classList.add('active');
            
            // Mostrar conteúdo correspondente
            const tabId = button.getAttribute('data-tab');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
    
    // Filtro de números
    const filtroBtns = document.querySelectorAll('.filtro-btn');
    filtroBtns.forEach(button => {
        button.addEventListener('click', () => {
            // Remover classe active de todos os botões
            document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
            
            // Adicionar classe active ao botão clicado
            button.classList.add('active');
            
            // Atualizar filtro e exibir números
            filtroNumeros = button.getAttribute('data-filter');
            exibirNumeros();
        });
    });
    
    // Busca de número específico
    const buscaNumeroInput = document.getElementById('busca-numero-input');
    const buscaNumeroBtn = document.getElementById('busca-numero-btn');
    
    if (buscaNumeroInput && buscaNumeroBtn) {
        buscaNumeroBtn.addEventListener('click', () => {
            const numero = parseInt(buscaNumeroInput.value);
            
            if (isNaN(numero) || numero <= 0 || numero > rifaData.totalNumeros) {
                utils.mostrarNotificacao('Número inválido', 'erro');
                return;
            }
            
            // Destacar número buscado
            const numeroElement = document.querySelector(`.numero-item:nth-child(${numero})`);
            if (numeroElement) {
                numeroElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                numeroElement.classList.add('numero-destacado');
                
                setTimeout(() => {
                    numeroElement.classList.remove('numero-destacado');
                }, 2000);
            } else {
                utils.mostrarNotificacao('Número não encontrado', 'erro');
            }
        });
        
        // Busca ao pressionar Enter
        buscaNumeroInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                buscaNumeroBtn.click();
            }
        });
    }
    
    // Botão de continuar
    const btnContinuar = document.getElementById('btn-continuar');
    if (btnContinuar) {
        btnContinuar.addEventListener('click', () => {
            abrirModalCheckout();
        });
    }
    
    // Modal de checkout
    const modal = document.getElementById('modal-checkout');
    const modalClose = document.querySelector('.modal-close');
    
    if (modalClose) {
        modalClose.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }
    
    // Fechar modal ao clicar fora
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    });
    
    // Navegação entre etapas do checkout
    configurarEventosCheckout();
}

// Função para abrir modal de checkout
function abrirModalCheckout() {
    // Preencher resumo da compra
    document.getElementById('resumo-titulo-rifa').textContent = rifaData.titulo;
    
    const numerosTexto = numerosSelecionados.map(n => n.numero.toString().padStart(2, '0')).join(', ');
    document.getElementById('resumo-numeros').textContent = numerosTexto;
    document.getElementById('resumo-quantidade').textContent = numerosSelecionados.length;
    
    const total = numerosSelecionados.length * valorUnitario;
    document.getElementById('resumo-valor-total').textContent = utils.formatarMoeda(total);
    
    // Mostrar primeira etapa
    document.querySelectorAll('.checkout-page').forEach(page => page.classList.remove('active'));
    document.getElementById('checkout-page-1').classList.add('active');
    
    document.querySelectorAll('.checkout-step').forEach(step => step.classList.remove('active'));
    document.querySelector('.checkout-step[data-step="1"]').classList.add('active');
    
    // Exibir modal
    document.getElementById('modal-checkout').style.display = 'block';
}

// Função para configurar eventos do checkout
function configurarEventosCheckout() {
    // Formulário de dados
    const formDados = document.getElementById('form-dados');
    if (formDados) {
        formDados.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Validar dados
            const nome = document.getElementById('nome').value;
            const email = document.getElementById('email').value;
            const telefone = document.getElementById('telefone').value;
            const cpf = document.getElementById('cpf').value;
            
            if (!nome || !email || !telefone || !cpf) {
                utils.mostrarNotificacao('Preencha todos os campos', 'erro');
                return;
            }
            
            if (!utils.validarEmail(email)) {
                utils.mostrarNotificacao('E-mail inválido', 'erro');
                return;
            }
            
            // Avançar para próxima etapa
            document.querySelectorAll('.checkout-page').forEach(page => page.classList.remove('active'));
            document.getElementById('checkout-page-2').classList.add('active');
            
            document.querySelectorAll('.checkout-step').forEach(step => step.classList.remove('active'));
            document.querySelector('.checkout-step[data-step="2"]').classList.add('active');
        });
    }
    
    // Botão voltar para números
    const btnVoltarNumeros = document.getElementById('btn-voltar-numeros');
    if (btnVoltarNumeros) {
        btnVoltarNumeros.addEventListener('click', () => {
            document.getElementById('modal-checkout').style.display = 'none';
        });
    }
    
    // Botão voltar para dados
    const btnVoltarDados = document.getElementById('btn-voltar-dados');
    if (btnVoltarDados) {
        btnVoltarDados.addEventListener('click', () => {
            document.querySelectorAll('.checkout-page').forEach(page => page.classList.remove('active'));
            document.getElementById('checkout-page-1').classList.add('active');
            
            document.querySelectorAll('.checkout-step').forEach(step => step.classList.remove('active'));
            document.querySelector('.checkout-step[data-step="1"]').classList.add('active');
        });
    }
    
    // Opções de método de pagamento
    const metodoOpcoes = document.querySelectorAll('.metodo-opcao');
    metodoOpcoes.forEach(opcao => {
        opcao.addEventListener('click', () => {
            // Remover classe active de todas as opções
            document.querySelectorAll('.metodo-opcao').forEach(op => op.classList.remove('active'));
            document.querySelectorAll('.metodo-conteudo').forEach(content => content.classList.remove('active'));
            
            // Adicionar classe active à opção clicada
            opcao.classList.add('active');
            
            // Mostrar conteúdo correspondente
            const metodoId = opcao.getAttribute('data-metodo');
            document.getElementById(`metodo-${metodoId}`).classList.add('active');
        });
    });
    
    // Botão copiar PIX
    const btnCopiarPix = document.getElementById('btn-copiar-pix');
    if (btnCopiarPix) {
        btnCopiarPix.addEventListener('click', () => {
            const pixCodigo = document.getElementById('pix-codigo-texto').value;
            utils.copiarParaClipboard(pixCodigo);
            utils.mostrarNotificacao('Código PIX copiado!', 'sucesso');
            
            // Simular confirmação de pagamento após 3 segundos
            setTimeout(() => {
                finalizarCompra();
            }, 3000);
        });
    }
    
    // Formulário de cartão
    const formCartao = document.getElementById('form-cartao');
    if (formCartao) {
        formCartao.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Simular processamento de pagamento
            const btnPagar = formCartao.querySelector('.btn-pagar');
            btnPagar.disabled = true;
            btnPagar.textContent = 'Processando...';
            
            setTimeout(() => {
                finalizarCompra();
                btnPagar.disabled = false;
                btnPagar.textContent = 'Pagar Agora';
            }, 2000);
        });
    }
    
    // Botão gerar boleto
    const btnGerarBoleto = document.getElementById('btn-gerar-boleto');
    if (btnGerarBoleto) {
        btnGerarBoleto.addEventListener('click', () => {
            btnGerarBoleto.disabled = true;
            btnGerarBoleto.textContent = 'Gerando...';
            
            setTimeout(() => {
                finalizarCompra();
                btnGerarBoleto.disabled = false;
                btnGerarBoleto.textContent = 'Gerar Boleto';
            }, 2000);
        });
    }
    
    // Botões da etapa de confirmação
    const btnVoltarRifa = document.getElementById('btn-voltar-rifa');
    if (btnVoltarRifa) {
        btnVoltarRifa.addEventListener('click', () => {
            document.getElementById('modal-checkout').style.display = 'none';
            // Limpar seleção de números
            numerosSelecionados = [];
            atualizarNumerosSelecionados();
            exibirNumeros();
        });
    }
    
    const btnCompartilhar = document.getElementById('btn-compartilhar');
    if (btnCompartilhar) {
        btnCompartilhar.addEventListener('click', () => {
            const titulo = `Participei da rifa: ${rifaData.titulo}`;
            const texto = `Acabei de comprar números na rifa ${rifaData.titulo}. Participe você também!`;
            const url = window.location.href;
            
            utils.compartilhar(titulo, texto, url);
        });
    }
}

// Função para finalizar compra
function finalizarCompra() {
    // Gerar código de reserva aleatório
    const codigoReserva = Math.random().toString(36).substring(2, 10).toUpperCase();
    document.getElementById('confirmacao-codigo').textContent = codigoReserva;
    
    // Preencher números na confirmação
    const numerosTexto = numerosSelecionados.map(n => n.numero.toString().padStart(2, '0')).join(', ');
    document.getElementById('confirmacao-numeros').textContent = numerosTexto;
    
    // Avançar para etapa de confirmação
    document.querySelectorAll('.checkout-page').forEach(page => page.classList.remove('active'));
    document.getElementById('checkout-page-3').classList.add('active');
    
    document.querySelectorAll('.checkout-step').forEach(step => step.classList.remove('active'));
    document.querySelector('.checkout-step[data-step="3"]').classList.add('active');
    
    // Atualizar status dos números selecionados
    numerosSelecionados.forEach(numero => {
        const index = numerosData.findIndex(n => n.numero === numero.numero);
        if (index !== -1) {
            numerosData[index].status = 'reservado';
        }
    });
}

// Inicializar página quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', inicializarPagina);
