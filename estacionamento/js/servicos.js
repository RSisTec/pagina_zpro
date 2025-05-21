// Arquivo específico para a página de serviços
// Contém funções para gerenciamento de serviços

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const session = utils.protegerRota();
    if (!session) return;
    
    // Inicializar componentes
    initializeSidebar();
    initializeLogout();
    initializeModals();
    initializeServicoForm();
    
    // Carregar serviços
    carregarServicos();
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
    // Modal de Serviço
    const servicoModal = document.getElementById('servico-modal');
    const btnNovoServico = document.getElementById('btn-novo-servico');
    const closeServicoModal = document.getElementById('close-servico-modal');
    
    if (servicoModal && btnNovoServico && closeServicoModal) {
        btnNovoServico.addEventListener('click', function() {
            // Limpar formulário
            document.getElementById('servico-form').reset();
            document.getElementById('servico-id').value = '';
            document.getElementById('servico-modal-title').textContent = 'Novo Serviço';
            
            // Mostrar modal
            servicoModal.classList.add('active');
        });
        
        closeServicoModal.addEventListener('click', function() {
            servicoModal.classList.remove('active');
        });
        
        servicoModal.addEventListener('click', function(e) {
            if (e.target === servicoModal) {
                servicoModal.classList.remove('active');
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

// Inicializar formulário de serviço
function initializeServicoForm() {
    const servicoForm = document.getElementById('servico-form');
    
    // Submeter formulário
    if (servicoForm) {
        servicoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const id = document.getElementById('servico-id').value;
            const nome = document.getElementById('servico-nome').value.trim();
            const descricao = document.getElementById('servico-descricao').value.trim();
            const valor = parseFloat(document.getElementById('servico-valor').value);
            const tempoEstimado = parseInt(document.getElementById('servico-tempo').value);
            
            // Validar campos obrigatórios
            if (!nome) {
                showNotification('Por favor, digite o nome do serviço', 'error');
                return;
            }
            
            if (!descricao) {
                showNotification('Por favor, digite a descrição do serviço', 'error');
                return;
            }
            
            if (isNaN(valor) || valor <= 0) {
                showNotification('Por favor, digite um valor válido para o serviço', 'error');
                return;
            }
            
            if (isNaN(tempoEstimado) || tempoEstimado <= 0) {
                showNotification('Por favor, digite um tempo estimado válido para o serviço', 'error');
                return;
            }
            
            // Criar objeto serviço
            const servico = {
                nome,
                descricao,
                valor,
                tempoEstimado
            };
            
            // Salvar serviço
            if (id) {
                // Atualizar serviço existente
                API.Servico.atualizar(id, servico)
                    .then(response => {
                        if (response.success) {
                            showNotification('Serviço atualizado com sucesso', 'success');
                            document.getElementById('servico-modal').classList.remove('active');
                            carregarServicos();
                        } else {
                            showNotification('Erro ao atualizar serviço: ' + response.message, 'error');
                        }
                    });
            } else {
                // Adicionar novo serviço
                API.Servico.adicionar(servico)
                    .then(response => {
                        if (response.success) {
                            showNotification('Serviço adicionado com sucesso', 'success');
                            document.getElementById('servico-modal').classList.remove('active');
                            carregarServicos();
                        } else {
                            showNotification('Erro ao adicionar serviço: ' + response.message, 'error');
                        }
                    });
            }
        });
    }
}

// Carregar serviços
function carregarServicos() {
    const servicosList = document.getElementById('servicos-list');
    
    if (!servicosList) return;
    
    // Mostrar loader
    servicosList.innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
        </div>
    `;
    
    // Buscar serviços
    API.Servico.listar()
        .then(response => {
            if (response.success) {
                const servicos = response.data;
                
                // Verificar se há serviços
                if (servicos.length === 0) {
                    servicosList.innerHTML = '<div class="alert alert-info">Não há serviços cadastrados.</div>';
                    return;
                }
                
                // Limpar lista
                servicosList.innerHTML = '';
                
                // Adicionar serviços à lista
                servicos.forEach(servico => {
                    const servicoCard = document.createElement('div');
                    servicoCard.className = 'service-card';
                    servicoCard.innerHTML = `
                        <div class="service-header">
                            <div class="service-icon">
                                <i class="fas fa-tools"></i>
                            </div>
                            <div class="service-title">${servico.nome}</div>
                        </div>
                        <div class="service-description">
                            ${servico.descricao}
                        </div>
                        <div class="service-details mt-2">
                            <div><i class="fas fa-clock mr-1"></i> ${servico.tempoEstimado} minutos</div>
                        </div>
                        <div class="service-price">
                            ${utils.formatarMoeda(servico.valor)}
                        </div>
                        <div class="text-right mt-3">
                            <button class="btn btn-sm btn-outline btn-editar" data-id="${servico.id}">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-danger btn-excluir" data-id="${servico.id}">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    `;
                    
                    // Adicionar à lista
                    servicosList.appendChild(servicoCard);
                    
                    // Adicionar eventos aos botões
                    const btnEditar = servicoCard.querySelector('.btn-editar');
                    const btnExcluir = servicoCard.querySelector('.btn-excluir');
                    
                    btnEditar.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        editarServico(id);
                    });
                    
                    btnExcluir.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        confirmarExclusao(id);
                    });
                });
            } else {
                servicosList.innerHTML = `<div class="alert alert-danger">Erro ao carregar serviços: ${response.message}</div>`;
            }
        });
}

// Editar serviço
function editarServico(id) {
    // Buscar serviço
    API.Servico.listar()
        .then(response => {
            if (response.success) {
                const servicos = response.data;
                const servico = servicos.find(s => s.id === id);
                
                if (!servico) {
                    showNotification('Serviço não encontrado', 'error');
                    return;
                }
                
                // Preencher formulário
                document.getElementById('servico-id').value = servico.id;
                document.getElementById('servico-nome').value = servico.nome;
                document.getElementById('servico-descricao').value = servico.descricao;
                document.getElementById('servico-valor').value = servico.valor;
                document.getElementById('servico-tempo').value = servico.tempoEstimado;
                
                // Atualizar título do modal
                document.getElementById('servico-modal-title').textContent = 'Editar Serviço';
                
                // Mostrar modal
                document.getElementById('servico-modal').classList.add('active');
            } else {
                showNotification('Erro ao buscar serviço: ' + response.message, 'error');
            }
        });
}

// Confirmar exclusão
function confirmarExclusao(id) {
    // Buscar serviço
    API.Servico.listar()
        .then(response => {
            if (response.success) {
                const servicos = response.data;
                const servico = servicos.find(s => s.id === id);
                
                if (!servico) {
                    showNotification('Serviço não encontrado', 'error');
                    return;
                }
                
                // Atualizar mensagem de confirmação
                document.getElementById('confirmacao-mensagem').textContent = `Tem certeza que deseja excluir o serviço "${servico.nome}"?`;
                
                // Configurar botão de confirmar
                const btnConfirmar = document.getElementById('btn-confirmar');
                btnConfirmar.onclick = function() {
                    excluirServico(id);
                    document.getElementById('confirmacao-modal').classList.remove('active');
                };
                
                // Mostrar modal
                document.getElementById('confirmacao-modal').classList.add('active');
            } else {
                showNotification('Erro ao buscar serviço: ' + response.message, 'error');
            }
        });
}

// Excluir serviço
function excluirServico(id) {
    API.Servico.remover(id)
        .then(response => {
            if (response.success) {
                showNotification('Serviço excluído com sucesso', 'success');
                carregarServicos();
            } else {
                showNotification('Erro ao excluir serviço: ' + response.message, 'error');
            }
        });
}
