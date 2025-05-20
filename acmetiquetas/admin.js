// URL da API para produtos (substitua pela URL real da sua API)
const PRODUCTS_API_URL = 'https://api.exemplo.com/produtos';

// Variáveis globais
let produtos = [];
let produtosFiltrados = [];
let produtoParaExcluir = null;

// Verificar autenticação
function verificarAutenticacao() {
    const token = localStorage.getItem('authToken');
    if (!token) {
        // Redirecionar para a página de login
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Função para buscar produtos da API
async function buscarProdutos() {
    if (!verificarAutenticacao()) return;

    try {
        // Exibir indicador de carregamento
        document.getElementById('products-loading').style.display = 'block';
        document.getElementById('products-error').style.display = 'none';
        document.getElementById('products-empty').style.display = 'none';
        document.getElementById('products-table-container').style.display = 'none';
        
        // Em um ambiente real, descomentar a linha abaixo para buscar da API real
        // const response = await fetch(PRODUCTS_API_URL, {
        //     headers: {
        //         'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //     }
        // });
        
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
        
        // Armazenar os produtos
        produtos = data;
        produtosFiltrados = [...produtos];
        
        // Exibir os produtos
        renderizarProdutos();
        
    } catch (error) {
        console.error('Erro ao buscar produtos:', error);
        document.getElementById('products-loading').style.display = 'none';
        document.getElementById('products-error').style.display = 'block';
    }
}

// Função para renderizar os produtos na tabela
function renderizarProdutos() {
    const tableBody = document.getElementById('products-table-body');
    const loadingElement = document.getElementById('products-loading');
    const errorElement = document.getElementById('products-error');
    const emptyElement = document.getElementById('products-empty');
    const tableContainer = document.getElementById('products-table-container');
    
    // Esconder o indicador de carregamento
    loadingElement.style.display = 'none';
    
    // Verificar se há produtos para exibir
    if (produtosFiltrados.length === 0) {
        errorElement.style.display = 'none';
        emptyElement.style.display = 'block';
        tableContainer.style.display = 'none';
        return;
    }
    
    // Limpar a tabela
    tableBody.innerHTML = '';
    
    // Adicionar os produtos à tabela
    produtosFiltrados.forEach(produto => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${produto.id}</td>
            <td class="product-image-cell">
                <img src="${produto.imagem}" alt="${produto.nome}" class="product-image-thumbnail">
            </td>
            <td>${produto.nome}</td>
            <td>${produto.descricao}</td>
            <td>R$ ${produto.preco.toFixed(2)}</td>
            <td>
                <div class="product-actions">
                    <button class="btn-action btn-edit" data-id="${produto.id}" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" data-id="${produto.id}" title="Excluir">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            </td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Exibir a tabela
    errorElement.style.display = 'none';
    emptyElement.style.display = 'none';
    tableContainer.style.display = 'block';
    
    // Adicionar eventos aos botões de ação
    adicionarEventosBotoes();
}

// Função para adicionar eventos aos botões de ação
function adicionarEventosBotoes() {
    // Botões de editar
    document.querySelectorAll('.btn-edit').forEach(botao => {
        botao.addEventListener('click', () => {
            const produtoId = parseInt(botao.getAttribute('data-id'));
            editarProduto(produtoId);
        });
    });
    
    // Botões de excluir
    document.querySelectorAll('.btn-delete').forEach(botao => {
        botao.addEventListener('click', () => {
            const produtoId = parseInt(botao.getAttribute('data-id'));
            confirmarExclusao(produtoId);
        });
    });
}

// Função para filtrar produtos
function filtrarProdutos(termo) {
    if (!termo.trim()) {
        produtosFiltrados = [...produtos];
    } else {
        termo = termo.toLowerCase();
        produtosFiltrados = produtos.filter(produto => 
            produto.nome.toLowerCase().includes(termo) || 
            produto.descricao.toLowerCase().includes(termo)
        );
    }
    
    renderizarProdutos();
}

// Função para abrir o modal de edição de produto
function editarProduto(produtoId) {
    const produto = produtos.find(p => p.id === produtoId);
    if (!produto) return;
    
    // Preencher o formulário com os dados do produto
    document.getElementById('modal-title').textContent = 'Editar Produto';
    document.getElementById('product-id').value = produto.id;
    document.getElementById('product-name').value = produto.nome;
    document.getElementById('product-description').value = produto.descricao;
    document.getElementById('product-full-description').value = produto.descricaoCompleta;
    document.getElementById('product-price').value = produto.preco;
    document.getElementById('product-image').value = produto.imagem;
    
    // Exibir o modal
    const modal = document.getElementById('product-modal');
    modal.style.display = 'block';
}

// Função para abrir o modal de adição de produto
function adicionarProduto() {
    // Limpar o formulário
    document.getElementById('modal-title').textContent = 'Adicionar Novo Produto';
    document.getElementById('product-id').value = '';
    document.getElementById('product-form').reset();
    
    // Exibir o modal
    const modal = document.getElementById('product-modal');
    modal.style.display = 'block';
}

// Função para confirmar exclusão de produto
function confirmarExclusao(produtoId) {
    produtoParaExcluir = produtoId;
    
    // Exibir o modal de confirmação
    const modal = document.getElementById('confirm-modal');
    modal.style.display = 'block';
}

// Função para excluir produto
async function excluirProduto() {
    if (!produtoParaExcluir) return;
    
    try {
        // Em um ambiente real, descomentar a linha abaixo para excluir via API real
        // const response = await fetch(`${PRODUCTS_API_URL}/${produtoParaExcluir}`, {
        //     method: 'DELETE',
        //     headers: {
        //         'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        //     }
        // });
        
        // Para fins de demonstração, simulamos uma resposta da API
        // Em produção, remova este bloco e use o fetch real acima
        const mockResponse = {
            ok: true,
            json: async () => {
                // Simulando um pequeno atraso como em uma API real
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Remover o produto do array local
                produtos = produtos.filter(p => p.id !== produtoParaExcluir);
                produtosFiltrados = produtosFiltrados.filter(p => p.id !== produtoParaExcluir);
                
                return { success: true };
            }
        };
        
        // Usar a resposta simulada para demonstração
        const response = mockResponse;
        
        if (!response.ok) {
            throw new Error('Falha ao excluir produto');
        }
        
        // Obter os dados da resposta
        await response.json();
        
        // Fechar o modal de confirmação
        document.getElementById('confirm-modal').style.display = 'none';
        
        // Renderizar os produtos atualizados
        renderizarProdutos();
        
        // Exibir mensagem de sucesso (pode ser implementado conforme necessário)
        alert('Produto excluído com sucesso!');
        
    } catch (error) {
        console.error('Erro ao excluir produto:', error);
        alert('Erro ao excluir produto. Tente novamente.');
    } finally {
        produtoParaExcluir = null;
    }
}

// Função para salvar produto (adicionar ou editar)
async function salvarProduto(event) {
    event.preventDefault();
    
    // Obter os dados do formulário
    const produtoId = document.getElementById('product-id').value;
    const nome = document.getElementById('product-name').value;
    const descricao = document.getElementById('product-description').value;
    const descricaoCompleta = document.getElementById('product-full-description').value;
    const preco = parseFloat(document.getElementById('product-price').value);
    const imagem = document.getElementById('product-image').value;
    
    // Criar o objeto do produto
    const produto = {
        nome,
        descricao,
        descricaoCompleta,
        preco,
        imagem
    };
    
    try {
        let response;
        
        if (produtoId) {
            // Editar produto existente
            produto.id = parseInt(produtoId);
            
            // Em um ambiente real, descomentar a linha abaixo para atualizar via API real
            // response = await fetch(`${PRODUCTS_API_URL}/${produtoId}`, {
            //     method: 'PUT',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            //     },
            //     body: JSON.stringify(produto)
            // });
            
            // Para fins de demonstração, simulamos uma resposta da API
            // Em produção, remova este bloco e use o fetch real acima
            response = {
                ok: true,
                json: async () => {
                    // Simulando um pequeno atraso como em uma API real
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Atualizar o produto no array local
                    const index = produtos.findIndex(p => p.id === produto.id);
                    if (index !== -1) {
                        produtos[index] = produto;
                    }
                    
                    // Atualizar também nos produtos filtrados
                    const indexFiltrado = produtosFiltrados.findIndex(p => p.id === produto.id);
                    if (indexFiltrado !== -1) {
                        produtosFiltrados[indexFiltrado] = produto;
                    }
                    
                    return { success: true, produto };
                }
            };
        } else {
            // Adicionar novo produto
            // Em um ambiente real, descomentar a linha abaixo para adicionar via API real
            // response = await fetch(PRODUCTS_API_URL, {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //         'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            //     },
            //     body: JSON.stringify(produto)
            // });
            
            // Para fins de demonstração, simulamos uma resposta da API
            // Em produção, remova este bloco e use o fetch real acima
            response = {
                ok: true,
                json: async () => {
                    // Simulando um pequeno atraso como em uma API real
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    // Gerar um ID para o novo produto
                    const novoId = produtos.length > 0 ? Math.max(...produtos.map(p => p.id)) + 1 : 1;
                    produto.id = novoId;
                    
                    // Adicionar o produto ao array local
                    produtos.push(produto);
                    produtosFiltrados.push(produto);
                    
                    return { success: true, produto };
                }
            };
        }
        
        if (!response.ok) {
            throw new Error('Falha ao salvar produto');
        }
        
        // Obter os dados da resposta
        await response.json();
        
        // Fechar o modal
        document.getElementById('product-modal').style.display = 'none';
        
        // Renderizar os produtos atualizados
        renderizarProdutos();
        
        // Exibir mensagem de sucesso (pode ser implementado conforme necessário)
        alert(produtoId ? 'Produto atualizado com sucesso!' : 'Produto adicionado com sucesso!');
        
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        alert('Erro ao salvar produto. Tente novamente.');
    }
}

// Função para fazer logout
function logout() {
    // Limpar o localStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Redirecionar para a página de login
    window.location.href = 'login.html';
}

// Inicializar a página de administração
document.addEventListener('DOMContentLoaded', () => {
    // Verificar autenticação
    if (!verificarAutenticacao()) return;
    
    // Exibir o nome do usuário
    const userData = JSON.parse(localStorage.getItem('userData') || '{}');
    if (userData.name) {
        document.getElementById('admin-username').textContent = userData.name;
    }
    
    // Buscar produtos
    buscarProdutos();
    
    // Adicionar evento de pesquisa
    const searchInput = document.getElementById('search-products');
    searchInput.addEventListener('input', (event) => {
        filtrarProdutos(event.target.value);
    });
    
    // Adicionar evento ao botão de adicionar produto
    document.getElementById('btn-add-product').addEventListener('click', adicionarProduto);
    
    // Adicionar evento ao botão de logout
    document.getElementById('btn-logout').addEventListener('click', logout);
    
    // Adicionar evento ao formulário de produto
    document.getElementById('product-form').addEventListener('submit', salvarProduto);
    
    // Adicionar evento ao botão de cancelar no modal de produto
    document.getElementById('btn-cancel').addEventListener('click', () => {
        document.getElementById('product-modal').style.display = 'none';
    });
    
    // Adicionar evento ao botão de fechar no modal de produto
    document.querySelector('#product-modal .close-modal').addEventListener('click', () => {
        document.getElementById('product-modal').style.display = 'none';
    });
    
    // Adicionar evento ao botão de confirmar exclusão
    document.getElementById('btn-confirm-delete').addEventListener('click', excluirProduto);
    
    // Adicionar evento ao botão de cancelar exclusão
    document.getElementById('btn-cancel-delete').addEventListener('click', () => {
        document.getElementById('confirm-modal').style.display = 'none';
        produtoParaExcluir = null;
    });
    
    // Fechar modais ao clicar fora deles
    window.addEventListener('click', (event) => {
        const productModal = document.getElementById('product-modal');
        const confirmModal = document.getElementById('confirm-modal');
        
        if (event.target === productModal) {
            productModal.style.display = 'none';
        }
        
        if (event.target === confirmModal) {
            confirmModal.style.display = 'none';
            produtoParaExcluir = null;
        }
    });
});
