// Arquivo específico para a página de preços
// Contém funções para gerenciamento de tabelas de preços

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const session = utils.protegerRota();
    if (!session) return;
    
    // Inicializar componentes
    initializeSidebar();
    initializeLogout();
    initializeModals();
    initializePrecoForm();
    
    // Carregar preços
    carregarPrecos();
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

// Inicializar modais
function initializeModals() {
    // Modal de Preço
    const precoModal = document.getElementById('preco-modal');
    const btnNovoPreco = document.getElementById('btn-novo-preco');
    const closePrecoModal = document.getElementById('close-preco-modal');
    
    if (precoModal && btnNovoPreco && closePrecoModal) {
        btnNovoPreco.addEventListener('click', function() {
            // Limpar formulário
            document.getElementById('preco-form').reset();
            document.getElementById('preco-id').value = '';
            document.getElementById('preco-modal-title').textContent = 'Nova Tabela de Preços';
            
            // Mostrar modal
            precoModal.classList.add('active');
        });
        
        closePrecoModal.addEventListener('click', function() {
            precoModal.classList.remove('active');
        });
        
        precoModal.addEventListener('click', function(e) {
            if (e.target === precoModal) {
                precoModal.classList.remove('active');
            }
        });
    }
    
    // Modal de Confirmação
    const confirmacaoModal = document.getElementById('confirmacao-modal');
    const closeConfirmacaoModal = document.getElementById('close-confirmacao-modal');
    const btnCancelarConfirmacao = document.getElementById('btn-cancelar-confirmacao');
    
    if (confirmacaoModal && closeConfirmacaoModal && btnCancelarConfirmacao) {
        closeConfirmacaoModal.addEventListener('click', function() {
            confirmacaoModal.classList.remove('active');
        });
        
        btnCancelarConfirmacao.addEventListener('click', function() {
            confirmacaoModal.classList.remove('active');
        });
        
        confirmacaoModal.addEventListener('click', function(e) {
            if (e.target === confirmacaoModal) {
                confirmacaoModal.classList.remove('active');
            }
        });
    }
}

// Inicializar formulário de preço
function initializePrecoForm() {
    const precoForm = document.getElementById('preco-form');
    
    // Submeter formulário
    if (precoForm) {
        precoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const id = document.getElementById('preco-id').value;
            const nome = document.getElementById('preco-nome').value.trim();
            const descricao = document.getElementById('preco-descricao').value.trim();
            const valorPrimeiraHora = parseFloat(document.getElementById('preco-primeira-hora').value);
            const valorHoraAdicional = parseFloat(document.getElementById('preco-hora-adicional').value);
            const valorDiaria = parseFloat(document.getElementById('preco-diaria').value);
            const valorMensalidade = parseFloat(document.getElementById('preco-mensalidade').value);
            const ativo = document.getElementById('preco-ativo').value === 'true';
            
            // Validar campos obrigatórios
            if (!nome) {
                showNotification('Por favor, digite o nome da tabela de preços', 'error');
                return;
            }
            
            if (isNaN(valorPrimeiraHora) || valorPrimeiraHora <= 0) {
                showNotification('Por favor, digite um valor válido para a primeira hora', 'error');
                return;
            }
            
            if (isNaN(valorHoraAdicional) || valorHoraAdicional <= 0) {
                showNotification('Por favor, digite um valor válido para a hora adicional', 'error');
                return;
            }
            
            if (isNaN(valorDiaria) || valorDiaria <= 0) {
                showNotification('Por favor, digite um valor válido para a diária', 'error');
                return;
            }
            
            if (isNaN(valorMensalidade) || valorMensalidade <= 0) {
                showNotification('Por favor, digite um valor válido para a mensalidade', 'error');
                return;
            }
            
            // Criar objeto preço
            const preco = {
                nome,
                descricao,
                valorPrimeiraHora,
                valorHoraAdicional,
                valorDiaria,
                valorMensalidade,
                ativo,
                dataCriacao: new Date().getTime()
            };
            
            // Buscar preços existentes
            const precos = JSON.parse(localStorage.getItem('precos') || '[]');
            
            if (id) {
                // Atualizar preço existente
                const index = precos.findIndex(p => p.id === id);
                
                if (index !== -1) {
                    precos[index] = { ...precos[index], ...preco };
                    localStorage.setItem('precos', JSON.stringify(precos));
                    
                    showNotification('Tabela de preços atualizada com sucesso', 'success');
                    document.getElementById('preco-modal').classList.remove('active');
                    carregarPrecos();
                } else {
                    showNotification('Tabela de preços não encontrada', 'error');
                }
            } else {
                // Adicionar novo preço
                preco.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                
                // Se for o primeiro preço, definir como ativo
                if (precos.length === 0) {
                    preco.ativo = true;
                }
                
                precos.push(preco);
                localStorage.setItem('precos', JSON.stringify(precos));
                
                showNotification('Tabela de preços adicionada com sucesso', 'success');
                document.getElementById('preco-modal').classList.remove('active');
                carregarPrecos();
            }
        });
    }
}

// Carregar preços
function carregarPrecos() {
    const precosList = document.getElementById('precos-list');
    
    if (!precosList) return;
    
    // Mostrar loader
    precosList.innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
        </div>
    `;
    
    // Buscar preços
    const precos = JSON.parse(localStorage.getItem('precos') || '[]');
    
    // Verificar se há preços
    if (precos.length === 0) {
        // Criar preço padrão
        const precoPadrao = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            nome: 'Tabela Padrão',
            descricao: 'Tabela de preços padrão do sistema',
            valorPrimeiraHora: 10.00,
            valorHoraAdicional: 5.00,
            valorDiaria: 30.00,
            valorMensalidade: 300.00,
            ativo: true,
            dataCriacao: new Date().getTime()
        };
        
        precos.push(precoPadrao);
        localStorage.setItem('precos', JSON.stringify(precos));
        
        precosList.innerHTML = `
            <div class="alert alert-info">
                Tabela de preços padrão criada.
            </div>
        `;
        
        setTimeout(() => {
            carregarPrecos();
        }, 2000);
        
        return;
    }
    
    // Limpar lista
    precosList.innerHTML = '';
    
    // Adicionar preços à lista
    precos.forEach(preco => {
        const precoCard = document.createElement('div');
        precoCard.className = 'price-card';
        precoCard.innerHTML = `
            <div class="price-header">
                <div class="price-title">${preco.nome}</div>
                <div class="price-status ${preco.ativo ? 'active' : 'inactive'}">${preco.ativo ? 'Ativo' : 'Inativo'}</div>
            </div>
            <div class="price-description">
                ${preco.descricao || 'Sem descrição'}
            </div>
            <div class="price-details">
                <div class="price-item">
                    <div class="price-label">Primeira Hora</div>
                    <div class="price-value">${utils.formatarMoeda(preco.valorPrimeiraHora)}</div>
                </div>
                <div class="price-item">
                    <div class="price-label">Hora Adicional</div>
                    <div class="price-value">${utils.formatarMoeda(preco.valorHoraAdicional)}</div>
                </div>
                <div class="price-item">
                    <div class="price-label">Diária</div>
                    <div class="price-value">${utils.formatarMoeda(preco.valorDiaria)}</div>
                </div>
                <div class="price-item">
                    <div class="price-label">Mensalidade</div>
                    <div class="price-value">${utils.formatarMoeda(preco.valorMensalidade)}</div>
                </div>
            </div>
            <div class="text-right mt-3">
                <button class="btn btn-sm btn-outline btn-editar" data-id="${preco.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger btn-excluir" data-id="${preco.id}" ${precos.length === 1 ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i> Excluir
                </button>
                ${!preco.ativo ? `
                <button class="btn btn-sm btn-success btn-ativar" data-id="${preco.id}">
                    <i class="fas fa-check"></i> Ativar
                </button>
                ` : ''}
            </div>
        `;
        
        // Adicionar à lista
        precosList.appendChild(precoCard);
        
        // Adicionar eventos aos botões
        const btnEditar = precoCard.querySelector('.btn-editar');
        const btnExcluir = precoCard.querySelector('.btn-excluir');
        const btnAtivar = precoCard.querySelector('.btn-ativar');
        
        btnEditar.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editarPreco(id);
        });
        
        if (btnExcluir && !btnExcluir.hasAttribute('disabled')) {
            btnExcluir.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                confirmarExclusao(id);
            });
        }
        
        if (btnAtivar) {
            btnAtivar.addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                ativarPreco(id);
            });
        }
    });
}

// Editar preço
function editarPreco(id) {
    // Buscar preços
    const precos = JSON.parse(localStorage.getItem('precos') || '[]');
    const preco = precos.find(p => p.id === id);
    
    if (!preco) {
        showNotification('Tabela de preços não encontrada', 'error');
        return;
    }
    
    // Preencher formulário
    document.getElementById('preco-id').value = preco.id;
    document.getElementById('preco-nome').value = preco.nome;
    document.getElementById('preco-descricao').value = preco.descricao || '';
    document.getElementById('preco-primeira-hora').value = preco.valorPrimeiraHora;
    document.getElementById('preco-hora-adicional').value = preco.valorHoraAdicional;
    document.getElementById('preco-diaria').value = preco.valorDiaria;
    document.getElementById('preco-mensalidade').value = preco.valorMensalidade;
    document.getElementById('preco-ativo').value = preco.ativo.toString();
    
    // Atualizar título do modal
    document.getElementById('preco-modal-title').textContent = 'Editar Tabela de Preços';
    
    // Mostrar modal
    document.getElementById('preco-modal').classList.add('active');
}

// Confirmar exclusão
function confirmarExclusao(id) {
    // Buscar preços
    const precos = JSON.parse(localStorage.getItem('precos') || '[]');
    const preco = precos.find(p => p.id === id);
    
    if (!preco) {
        showNotification('Tabela de preços não encontrada', 'error');
        return;
    }
    
    // Verificar se é a única tabela
    if (precos.length === 1) {
        showNotification('Não é possível excluir a única tabela de preços', 'error');
        return;
    }
    
    // Verificar se está ativa
    if (preco.ativo) {
        showNotification('Não é possível excluir uma tabela de preços ativa. Ative outra tabela primeiro.', 'error');
        return;
    }
    
    // Atualizar mensagem de confirmação
    document.getElementById('confirmacao-mensagem').textContent = `Tem certeza que deseja excluir a tabela de preços "${preco.nome}"?`;
    
    // Configurar botão de confirmar
    const btnConfirmar = document.getElementById('btn-confirmar');
    btnConfirmar.onclick = function() {
        excluirPreco(id);
        document.getElementById('confirmacao-modal').classList.remove('active');
    };
    
    // Mostrar modal
    document.getElementById('confirmacao-modal').classList.add('active');
}

// Excluir preço
function excluirPreco(id) {
    // Buscar preços
    const precos = JSON.parse(localStorage.getItem('precos') || '[]');
    const index = precos.findIndex(p => p.id === id);
    
    if (index === -1) {
        showNotification('Tabela de preços não encontrada', 'error');
        return;
    }
    
    // Verificar se é a única tabela
    if (precos.length === 1) {
        showNotification('Não é possível excluir a única tabela de preços', 'error');
        return;
    }
    
    // Verificar se está ativa
    if (precos[index].ativo) {
        showNotification('Não é possível excluir uma tabela de preços ativa. Ative outra tabela primeiro.', 'error');
        return;
    }
    
    // Remover preço
    precos.splice(index, 1);
    localStorage.setItem('precos', JSON.stringify(precos));
    
    showNotification('Tabela de preços excluída com sucesso', 'success');
    carregarPrecos();
}

// Ativar preço
function ativarPreco(id) {
    // Buscar preços
    const precos = JSON.parse(localStorage.getItem('precos') || '[]');
    
    // Desativar todos os preços
    precos.forEach(preco => {
        preco.ativo = false;
    });
    
    // Ativar o preço selecionado
    const index = precos.findIndex(p => p.id === id);
    
    if (index !== -1) {
        precos[index].ativo = true;
        localStorage.setItem('precos', JSON.stringify(precos));
        
        showNotification('Tabela de preços ativada com sucesso', 'success');
        carregarPrecos();
    } else {
        showNotification('Tabela de preços não encontrada', 'error');
    }
}
