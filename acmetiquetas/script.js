// URL da API para buscar produtos (substitua pela URL real da sua API)
const API_URL = 'https://api.exemplo.com/produtos';

// Número de WhatsApp para contato (substitua pelo número real)
const WHATSAPP_NUMBER = '5500000000000';

// Array para armazenar os produtos carregados da API
let produtos = [];

// Função para buscar produtos da API
async function buscarProdutos() {
    try {
        // Exibir indicador de carregamento
        const produtosContainer = document.getElementById('produtos-container');
        produtosContainer.innerHTML = '<div class="loading">Carregando produtos...</div>';
        
        // Em um ambiente real, descomentar a linha abaixo para buscar da API real
        // const response = await fetch(API_URL);
        
        // Para fins de demonstração, simulamos uma resposta da API
        // Em produção, remova este bloco e use o fetch real acima
        const mockResponse = {
            ok: true,
            json: async () => {
                // Simulando um pequeno atraso como em uma API real
                await new Promise(resolve => setTimeout(resolve, 800));
                
                return [
                    {
                        id: 1,
                        nome: "Etiquetas Adesivas Personalizadas",
                        descricao: "Etiquetas adesivas personalizadas para produtos e embalagens.",
                        descricaoCompleta: "Nossas etiquetas adesivas personalizadas são ideais para identificação de produtos, embalagens e materiais promocionais. Produzidas com materiais de alta qualidade, garantem durabilidade e excelente acabamento.",
                        preco: 45.90,
                        imagem: "https://via.placeholder.com/300x200?text=Etiqueta+Adesiva"
                    },
                    {
                        id: 2,
                        nome: "Etiquetas para Roupas",
                        descricao: "Etiquetas de tecido para roupas e produtos têxteis.",
                        descricaoCompleta: "Etiquetas de tecido para identificação de peças de vestuário e produtos têxteis. Produzidas com materiais de alta qualidade, são confortáveis ao contato com a pele e resistentes a múltiplas lavagens.",
                        preco: 39.90,
                        imagem: "https://via.placeholder.com/300x200?text=Etiqueta+Roupa"
                    },
                    {
                        id: 3,
                        nome: "Etiquetas para Alimentos",
                        descricao: "Etiquetas específicas para embalagens de alimentos.",
                        descricaoCompleta: "Etiquetas para embalagens de alimentos, produzidas com materiais seguros e atóxicos, adequados para contato indireto com alimentos. Resistentes à umidade e variações de temperatura.",
                        preco: 52.50,
                        imagem: "https://via.placeholder.com/300x200?text=Etiqueta+Alimento"
                    }
                ];
            }
        };
        
        // Usar a resposta simulada para demonstração
        const response = mockResponse;
        
        if (!response.ok) {
            throw new Error('Falha ao buscar produtos da API');
        }
        
        // Obter os dados da resposta
        const data = await response.json();
        
        // Armazenar os produtos no array global
        produtos = data;
        
        // Criar os cards de produtos
        criarCardsProdutos();
        
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        const produtosContainer = document.getElementById('produtos-container');
        produtosContainer.innerHTML = `
            <div class="error-message">
                <p>Não foi possível carregar os produtos.</p>
                <button class="btn btn-retry" onclick="buscarProdutos()">Tentar novamente</button>
            </div>
        `;
    }
}

// Função para criar os cards de produtos
function criarCardsProdutos() {
    const produtosContainer = document.getElementById('produtos-container');
    
    // Limpar o container antes de adicionar os novos cards
    produtosContainer.innerHTML = '';
    
    if (produtos.length === 0) {
        produtosContainer.innerHTML = '<div class="no-products">Nenhum produto encontrado</div>';
        return;
    }
    
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
                    <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Tenho interesse no produto: ${encodeURIComponent(produto.nome)}" class="btn btn-whatsapp" target="_blank">
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
        <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Tenho interesse no produto: ${encodeURIComponent(produto.nome)}" class="modal-produto-botao" target="_blank">
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
    buscarProdutos();
});
