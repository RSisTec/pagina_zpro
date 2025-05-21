// URL da API para buscar produtos (substitua pela URL real da sua API)
const API_URL = "https://webhook.rsistec.com.br/webhook/acm/produtos";

// Número de WhatsApp para contato (substitua pelo número real)
const WHATSAPP_NUMBER = "5500000000000";

// Array para armazenar os produtos carregados da API
let produtos = [];

// Função para buscar produtos da API
async function buscarProdutos() {
  try {
    // Exibir indicador de carregamento
    const produtosContainer = document.getElementById("produtos-container");
    produtosContainer.innerHTML =
      '<div class="loading">Carregando produtos...</div>';

    // Em um ambiente real, descomentar a linha abaixo para buscar da API real
    const response = await fetch(API_URL);

    // Para fins de demonstração, simulamos uma resposta da API
    // Em produção, remova este bloco e use o fetch real acima
    const mockResponse = {
      ok: true,
      json: async () => {
        // Simulando um pequeno atraso como em uma API real
        await new Promise((resolve) => setTimeout(resolve, 800));

        return [
          {
            id: 1,
            nome: "Etiquetas Adesivas Personalizadas",
            descricao:
              "Etiquetas adesivas personalizadas para produtos e embalagens.",
            descricaoCompleta:
              "Nossas etiquetas adesivas personalizadas são ideais para identificação de produtos, embalagens e materiais promocionais. Produzidas com materiais de alta qualidade, garantem durabilidade e excelente acabamento.",
            preco: 45.9,
            imagem: "https://via.placeholder.com/300x200?text=Etiqueta+Adesiva",
          },
          {
            id: 2,
            nome: "Etiquetas para Roupas",
            descricao: "Etiquetas de tecido para roupas e produtos têxteis.",
            descricaoCompleta:
              "Etiquetas de tecido para identificação de peças de vestuário e produtos têxteis. Produzidas com materiais de alta qualidade, são confortáveis ao contato com a pele e resistentes a múltiplas lavagens.",
            preco: 39.9,
            imagem: "https://via.placeholder.com/300x200?text=Etiqueta+Roupa",
          },
          {
            id: 3,
            nome: "Etiquetas para Alimentos",
            descricao: "Etiquetas específicas para embalagens de alimentos.",
            descricaoCompleta:
              "Etiquetas para embalagens de alimentos, produzidas com materiais seguros e atóxicos, adequados para contato indireto com alimentos. Resistentes à umidade e variações de temperatura.",
            preco: 52.5,
            imagem:
              "https://via.placeholder.com/300x200?text=Etiqueta+Alimento",
          },
        ];
      },
    };

    // Usar a resposta simulada para demonstração
    //const response = mockResponse;

    if (!response.ok) {
      throw new Error("Falha ao buscar produtos da API");
    }

    // Obter os dados da resposta
    const data = await response.json();

    // Armazenar os produtos no array global
    produtos = data;

    // Criar os cards de produtos
    criarCardsProdutos();
    
    // Verificar se há um produto na URL para abrir automaticamente
    verificarProdutoNaURL();
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    const produtosContainer = document.getElementById("produtos-container");
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
  const produtosContainer = document.getElementById("produtos-container");

  // Limpar o container antes de adicionar os novos cards
  produtosContainer.innerHTML = "";

  if (produtos.length === 0) {
    produtosContainer.innerHTML =
      '<div class="no-products">Nenhum produto encontrado</div>';
    return;
  }

  produtos.forEach((produto) => {
    // Criar elementos
    const card = document.createElement("div");
    card.className = "produto-card";

    // Verificar se a imagem existe, caso contrário usar uma imagem placeholder
    const imgSrc =
      produto.imagem ||
      "https://via.placeholder.com/300x200?text=ACM+Etiquetas";

    // Estrutura do card
    card.innerHTML = `
            <img src="${imgSrc}" alt="${produto.nome}" class="produto-img">
            <div class="produto-info">
                <h3>${produto.nome}</h3>
                <p>${produto.descricao}</p>
                <div class="produto-preco">R$ ${produto.preco.toFixed(2)}</div>
                <div class="produto-botoes">
                    <div class="btn btn-detalhes" data-id="${
                      produto.id
                    }">Ver Detalhes</div>
                    <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Tenho interesse no produto: ${encodeURIComponent(
      produto.nome
    )}" class="btn btn-whatsapp" target="_blank">
                        <i class="fab fa-whatsapp"></i> WhatsApp
                    </a>
                </div>
            </div>
        `;

    produtosContainer.appendChild(card);
  });

  // Adicionar event listeners aos botões de detalhes
  document.querySelectorAll(".btn-detalhes").forEach((botao) => {
    botao.addEventListener("click", () => {
      const produtoId = parseInt(botao.getAttribute("data-id"));
      abrirModalDetalhes(produtoId);
    });
  });
}

// Função para abrir o modal com detalhes do produto
function abrirModalDetalhes(produtoId) {
  const produto = produtos.find((p) => p.id === produtoId);
  if (!produto) return;

  const modalDetalhes = document.getElementById("modal-produto-detalhes");

  // Verificar se a imagem existe, caso contrário usar uma imagem placeholder
  const imgSrc =
    produto.imagem || "https://via.placeholder.com/600x400?text=ACM+Etiquetas";

  modalDetalhes.innerHTML = `
        <img src="${imgSrc}" alt="${produto.nome}" class="modal-produto-img">
        <h2 class="modal-produto-titulo">${produto.nome}</h2>
        <p class="modal-produto-descricao">${produto.descricaoCompleta}</p>
        <div class="modal-produto-preco">R$ ${produto.preco.toFixed(2)}</div>
        <a href="https://wa.me/${WHATSAPP_NUMBER}?text=Olá! Tenho interesse no produto: ${encodeURIComponent(
    produto.nome
  )}" class="modal-produto-botao" target="_blank">
            <i class="fab fa-whatsapp"></i> Entrar em contato
        </a>
    `;

  // Exibir o modal
  const modal = document.getElementById("produto-modal");
  modal.style.display = "block";
  
  // Atualizar a URL com o ID do produto sem recarregar a página
  atualizarURL(produtoId);

  // Configurar eventos para fechar o modal
  configurarFechamentoModal(produtoId);
}

// Função para atualizar a URL com o ID do produto
function atualizarURL(produtoId) {
  // Criar um novo objeto URL com a URL atual
  const url = new URL(window.location.href);
  
  // Definir o parâmetro 'produto' com o ID do produto
  url.searchParams.set('produto', produtoId);
  
  // Atualizar a URL no navegador sem recarregar a página
  window.history.pushState({ produtoId: produtoId }, '', url.toString());
}

// Função para configurar o fechamento do modal
function configurarFechamentoModal(produtoId) {
  const modal = document.getElementById("produto-modal");
  
  // Fechar o modal ao clicar no X
  const closeModal = document.querySelector(".close-modal");
  closeModal.addEventListener("click", () => {
    fecharModal();
  });

  // Fechar o modal ao clicar fora dele
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      fecharModal();
    }
  });
  
  // Adicionar evento para tecla ESC
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.style.display === "block") {
      fecharModal();
    }
  });
}

// Função para fechar o modal e restaurar a URL original
function fecharModal() {
  const modal = document.getElementById("produto-modal");
  modal.style.display = "none";
  
  // Remover o parâmetro 'produto' da URL
  const url = new URL(window.location.href);
  url.searchParams.delete('produto');
  
  // Atualizar a URL no navegador sem recarregar a página
  window.history.pushState({}, '', url.toString());
}

// Função para verificar se há um produto na URL para abrir automaticamente
function verificarProdutoNaURL() {
  // Obter os parâmetros da URL atual
  const urlParams = new URLSearchParams(window.location.search);
  const produtoId = urlParams.get('produto');
  
  // Se houver um ID de produto na URL, abrir o modal correspondente
  if (produtoId) {
    // Converter para número inteiro
    const id = parseInt(produtoId);
    
    // Verificar se o produto existe
    const produto = produtos.find(p => p.id === id);
    if (produto) {
      // Pequeno atraso para garantir que a página esteja completamente carregada
      setTimeout(() => {
        abrirModalDetalhes(id);
      }, 100);
    } else {
      console.error(`Produto com ID ${id} não encontrado`);
      // Remover o parâmetro inválido da URL
      const url = new URL(window.location.href);
      url.searchParams.delete('produto');
      window.history.replaceState({}, '', url.toString());
    }
  }
}

// Lidar com navegação do histórico (botões voltar/avançar do navegador)
window.addEventListener('popstate', (event) => {
  const modal = document.getElementById("produto-modal");
  
  // Se houver estado com produtoId, abrir o modal correspondente
  if (event.state && event.state.produtoId) {
    abrirModalDetalhes(event.state.produtoId);
  } 
  // Se não houver estado mas o modal estiver aberto, fechá-lo
  else if (modal.style.display === "block") {
    modal.style.display = "none";
  }
  // Se houver parâmetro na URL, verificar e abrir o modal
  else {
    verificarProdutoNaURL();
  }
});

// Inicializar o site quando o DOM estiver carregado
document.addEventListener("DOMContentLoaded", () => {
  buscarProdutos();
});
