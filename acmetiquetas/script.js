// Dados dos produtos (simulando um banco de dados)
const produtos = [
    {
        id: 1,
        nome: "Etiquetas Adesivas Personalizadas",
        descricao: "Etiquetas adesivas personalizadas para produtos e embalagens.",
        descricaoCompleta: "Nossas etiquetas adesivas personalizadas são ideais para identificação de produtos, embalagens e materiais promocionais. Produzidas com materiais de alta qualidade, garantem durabilidade e excelente acabamento. Disponíveis em diversos tamanhos, formatos e materiais, como papel couché, vinil, BOPP transparente e metalizado.",
        preco: 45.90,
        imagem: "images/etiqueta_adesiva.jpg"
    },
    {
        id: 2,
        nome: "Etiquetas para Roupas",
        descricao: "Etiquetas de tecido para roupas e produtos têxteis.",
        descricaoCompleta: "Etiquetas de tecido para identificação de peças de vestuário e produtos têxteis. Produzidas com materiais de alta qualidade, são confortáveis ao contato com a pele e resistentes a múltiplas lavagens. Personalizáveis com sua marca, tamanhos, composição e instruções de lavagem, atendendo às normas do INMETRO.",
        preco: 39.90,
        imagem: "images/etiqueta_roupa.jpg"
    },
    {
        id: 3,
        nome: "Etiquetas para Alimentos",
        descricao: "Etiquetas específicas para embalagens de alimentos.",
        descricaoCompleta: "Etiquetas para embalagens de alimentos, produzidas com materiais seguros e atóxicos, adequados para contato indireto com alimentos. Resistentes à umidade e variações de temperatura. Ideais para identificação de produtos alimentícios, com espaço para informações nutricionais, data de validade e código de barras, em conformidade com as normas da ANVISA.",
        preco: 52.50,
        imagem: "images/etiqueta_alimento.jpg"
    },
    {
        id: 4,
        nome: "Etiquetas de Código de Barras",
        descricao: "Etiquetas com código de barras para controle de estoque.",
        descricaoCompleta: "Etiquetas com código de barras para controle de estoque e identificação de produtos. Impressão de alta definição que garante a leitura precisa por scanners e leitores. Disponíveis em diversos formatos e padrões (EAN-13, CODE 128, QR Code, entre outros). Material resistente a manuseio frequente, ideal para uso em comércio, indústria e logística.",
        preco: 35.00,
        imagem: "images/etiqueta_codigo_barras.jpg"
    },
    {
        id: 5,
        nome: "Etiquetas de Patrimônio",
        descricao: "Etiquetas para identificação de patrimônio empresarial.",
        descricaoCompleta: "Etiquetas para identificação e controle de patrimônio empresarial. Produzidas com materiais ultra-resistentes e adesivos de alta fixação, são ideais para identificação de equipamentos, móveis e outros bens. Personalizáveis com numeração sequencial, código de barras e logotipo da empresa. Resistentes a tentativas de remoção, garantindo maior segurança para seus ativos.",
        preco: 65.80,
        imagem: "images/etiqueta_patrimonio.jpg"
    },
    {
        id: 6,
        nome: "Etiquetas RFID",
        descricao: "Etiquetas com tecnologia RFID para rastreamento.",
        descricaoCompleta: "Etiquetas com tecnologia RFID (Identificação por Radiofrequência) para rastreamento e controle avançado de produtos e ativos. Permitem leitura à distância e sem contato visual, agilizando processos de inventário e logística. Disponíveis em diversos formatos e frequências, adequadas para diferentes aplicações como controle de acesso, rastreamento de produtos, gestão de estoque e muito mais.",
        preco: 89.90,
        imagem: "images/etiqueta_rfid.jpg"
    }
];

// Função para criar os cards de produtos
function criarCardsProdutos() {
    const produtosContainer = document.getElementById('produtos-container');
    
    produtos.forEach(produto => {
        // Criar elementos
        const card = document.createElement('div');
        card.className = 'produto-card';
        
        // Verificar se a imagem existe, caso contrário usar uma imagem placeholder
        const imgSrc = produto.imagem || 'https://via.placeholder.com/300x200?text=ACM+Etiquetas';
        
        // Estrutura do card
        card.innerHTML = `
            <img src="${imgSrc}" alt="${produto.nome}" class="produto-img">
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <div class="produto-preco">R$ ${produto.preco.toFixed(2)}</div>
                <div class="produto-botoes">
                    <div class="btn btn-detalhes" data-id="${produto.id}">Ver Detalhes</div>
                    <a href="https://wa.me/5500000000000?text=Olá! Tenho interesse no produto: ${encodeURIComponent(produto.nome)}" class="btn btn-whatsapp" target="_blank">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </a>
                </div>
            </div>
        `;
        
        produtosContainer.appendChild(card);
    });
    
    // Adicionar event listeners aos botões de detalhes
    document.querySelectorAll('.btn-detalhes').forEach(botao => {
        botao.addEventListener('click', () => {
            const produtoId = parseInt(botao.getAttribute('data-id'));
            abrirModalDetalhes(produtoId);
        });
    });
}

// Função para abrir o modal com detalhes do produto
function abrirModalDetalhes(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;
    
    const modalDetalhes = document.getElementById('modal-produto-detalhes');
    
    // Verificar se a imagem existe, caso contrário usar uma imagem placeholder
    const imgSrc = produto.imagem || 'https://via.placeholder.com/600x400?text=ACM+Etiquetas';
    
    modalDetalhes.innerHTML = `
        <img src="${imgSrc}" alt="${produto.nome}" class="modal-produto-img">
        <h2 class="modal-produto-titulo">${produto.nome}</h2>
        <p class="modal-produto-descricao">${produto.descricaoCompleta}</p>
        <div class="modal-produto-preco">R$ ${produto.preco.toFixed(2)}</div>
        <a href="https://wa.me/5500000000000?text=Olá! Tenho interesse no produto: ${encodeURIComponent(produto.nome)}" class="modal-produto-botao" target="_blank">
            <i class="fab fa-whatsapp"></i> Entrar em contato
        </a>
    `;
    
    // Exibir o modal
    const modal = document.getElementById('produto-modal');
    modal.style.display = 'block';
    
    // Fechar o modal ao clicar no X
    const closeModal = document.querySelector('.close-modal');
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });
    
    // Fechar o modal ao clicar fora dele
    window.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });
}

// Inicializar o site quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    criarCardsProdutos();
});

// Função para criar imagens de placeholder para desenvolvimento
function criarImagensPlaceholder() {
    // Esta função seria usada apenas durante o desenvolvimento
    // para criar imagens de exemplo se necessário
}
