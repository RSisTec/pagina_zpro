// Arquivo específico para a página de isentos
// Contém funções para gerenciamento de isentos

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const session = utils.protegerRota();
    if (!session) return;
    
    // Inicializar componentes
    initializeSidebar();
    initializeLogout();
    initializeModals();
    initializeIsentoForm();
    
    // Carregar isentos
    carregarIsentos();
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
    // Modal de Isento
    const isentoModal = document.getElementById('isento-modal');
    const btnNovoIsento = document.getElementById('btn-novo-isento');
    const closeIsentoModal = document.getElementById('close-isento-modal');
    
    if (isentoModal && btnNovoIsento && closeIsentoModal) {
        btnNovoIsento.addEventListener('click', function() {
            // Limpar formulário
            document.getElementById('isento-form').reset();
            document.getElementById('isento-id').value = '';
            document.getElementById('isento-modal-title').textContent = 'Novo Isento';
            document.getElementById('outro-motivo-container').style.display = 'none';
            
            // Limpar veículos
            const veiculosContainer = document.getElementById('isento-veiculos-container');
            veiculosContainer.innerHTML = `
                <div class="d-flex mb-2">
                    <input type="text" class="form-control isento-veiculo" placeholder="Placa do veículo">
                    <button type="button" class="btn btn-sm btn-danger ml-2 btn-remover-veiculo">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Adicionar evento ao botão de remover
            adicionarEventoRemoverVeiculo();
            
            // Mostrar modal
            isentoModal.classList.add('active');
        });
        
        closeIsentoModal.addEventListener('click', function() {
            isentoModal.classList.remove('active');
        });
        
        isentoModal.addEventListener('click', function(e) {
            if (e.target === isentoModal) {
                isentoModal.classList.remove('active');
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

// Inicializar formulário de isento
function initializeIsentoForm() {
    const isentoForm = document.getElementById('isento-form');
    const btnAdicionarVeiculo = document.getElementById('btn-adicionar-veiculo');
    const isentoMotivo = document.getElementById('isento-motivo');
    const outroMotivoContainer = document.getElementById('outro-motivo-container');
    
    // Mostrar/esconder campo de outro motivo
    if (isentoMotivo) {
        isentoMotivo.addEventListener('change', function() {
            if (this.value === 'Outro') {
                outroMotivoContainer.style.display = 'block';
            } else {
                outroMotivoContainer.style.display = 'none';
            }
        });
    }
    
    // Adicionar veículo
    if (btnAdicionarVeiculo) {
        btnAdicionarVeiculo.addEventListener('click', function() {
            const veiculosContainer = document.getElementById('isento-veiculos-container');
            
            // Criar novo campo de veículo
            const novoVeiculo = document.createElement('div');
            novoVeiculo.className = 'd-flex mb-2';
            novoVeiculo.innerHTML = `
                <input type="text" class="form-control isento-veiculo" placeholder="Placa do veículo">
                <button type="button" class="btn btn-sm btn-danger ml-2 btn-remover-veiculo">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            // Adicionar ao container
            veiculosContainer.appendChild(novoVeiculo);
            
            // Adicionar evento ao botão de remover
            adicionarEventoRemoverVeiculo();
        });
    }
    
    // Adicionar evento ao botão de remover veículo
    adicionarEventoRemoverVeiculo();
    
    // Submeter formulário
    if (isentoForm) {
        isentoForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const id = document.getElementById('isento-id').value;
            const nome = document.getElementById('isento-nome').value.trim();
            const documento = document.getElementById('isento-documento').value.trim();
            const motivo = document.getElementById('isento-motivo').value;
            const outroMotivo = document.getElementById('isento-outro-motivo').value.trim();
            
            // Validar campos obrigatórios
            if (!nome) {
                showNotification('Por favor, digite o nome do isento', 'error');
                return;
            }
            
            if (!documento) {
                showNotification('Por favor, digite o CPF ou CNPJ do isento', 'error');
                return;
            }
            
            if (!motivo) {
                showNotification('Por favor, selecione o motivo da isenção', 'error');
                return;
            }
            
            if (motivo === 'Outro' && !outroMotivo) {
                showNotification('Por favor, especifique o motivo da isenção', 'error');
                return;
            }
            
            // Obter veículos
            const veiculosInputs = document.querySelectorAll('.isento-veiculo');
            const veiculos = [];
            
            veiculosInputs.forEach(input => {
                const placa = input.value.trim().toUpperCase();
                if (placa) {
                    if (!utils.validarPlaca(placa)) {
                        showNotification(`Placa inválida: ${placa}. Use o formato ABC1234 ou ABC1D23.`, 'error');
                        return;
                    }
                    veiculos.push(placa);
                }
            });
            
            if (veiculos.length === 0) {
                showNotification('Por favor, adicione pelo menos um veículo', 'error');
                return;
            }
            
            // Criar objeto isento
            const isento = {
                nome,
                documento,
                motivo: motivo === 'Outro' ? outroMotivo : motivo,
                veiculos
            };
            
            // Salvar isento
            if (id) {
                // Atualizar isento existente
                API.Isento.atualizar(id, isento)
                    .then(response => {
                        if (response.success) {
                            showNotification('Isento atualizado com sucesso', 'success');
                            document.getElementById('isento-modal').classList.remove('active');
                            carregarIsentos();
                        } else {
                            showNotification('Erro ao atualizar isento: ' + response.message, 'error');
                        }
                    });
            } else {
                // Adicionar novo isento
                API.Isento.adicionar(isento)
                    .then(response => {
                        if (response.success) {
                            showNotification('Isento adicionado com sucesso', 'success');
                            document.getElementById('isento-modal').classList.remove('active');
                            carregarIsentos();
                        } else {
                            showNotification('Erro ao adicionar isento: ' + response.message, 'error');
                        }
                    });
            }
        });
    }
}

// Adicionar evento ao botão de remover veículo
function adicionarEventoRemoverVeiculo() {
    const botoesRemover = document.querySelectorAll('.btn-remover-veiculo');
    
    botoesRemover.forEach(botao => {
        botao.addEventListener('click', function() {
            // Verificar se é o único campo de veículo
            if (document.querySelectorAll('.isento-veiculo').length > 1) {
                // Remover o campo
                this.parentElement.remove();
            } else {
                // Limpar o campo
                this.parentElement.querySelector('.isento-veiculo').value = '';
            }
        });
    });
}

// Carregar isentos
function carregarIsentos() {
    const isentosList = document.getElementById('isentos-list');
    
    if (!isentosList) return;
    
    // Mostrar loader
    isentosList.innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
        </div>
    `;
    
    // Buscar isentos
    API.Isento.listar()
        .then(response => {
            if (response.success) {
                const isentos = response.data;
                
                // Verificar se há isentos
                if (isentos.length === 0) {
                    isentosList.innerHTML = '<div class="alert alert-info">Não há isentos cadastrados.</div>';
                    return;
                }
                
                // Limpar lista
                isentosList.innerHTML = '';
                
                // Adicionar isentos à lista
                isentos.forEach(isento => {
                    const isentoCard = document.createElement('div');
                    isentoCard.className = 'client-card';
                    isentoCard.innerHTML = `
                        <div class="client-header">
                            <div class="client-name">${isento.nome}</div>
                            <span class="client-type isento">${isento.motivo}</span>
                        </div>
                        <div class="client-info">
                            <div class="result-item">
                                <div class="result-label">Documento</div>
                                <div class="result-value">${isento.documento}</div>
                            </div>
                        </div>
                        <div class="client-vehicles">
                            <div class="result-label">Veículos</div>
                            <div class="vehicle-tags">
                                ${isento.veiculos.map(placa => `
                                    <span class="vehicle-tag"><i class="fas fa-car"></i> ${placa}</span>
                                `).join('')}
                            </div>
                        </div>
                        <div class="text-right mt-3">
                            <button class="btn btn-sm btn-outline btn-editar" data-id="${isento.id}">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-danger btn-excluir" data-id="${isento.id}">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    `;
                    
                    // Adicionar à lista
                    isentosList.appendChild(isentoCard);
                    
                    // Adicionar eventos aos botões
                    const btnEditar = isentoCard.querySelector('.btn-editar');
                    const btnExcluir = isentoCard.querySelector('.btn-excluir');
                    
                    btnEditar.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        editarIsento(id);
                    });
                    
                    btnExcluir.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        confirmarExclusao(id);
                    });
                });
            } else {
                isentosList.innerHTML = `<div class="alert alert-danger">Erro ao carregar isentos: ${response.message}</div>`;
            }
        });
}

// Editar isento
function editarIsento(id) {
    // Buscar isento
    API.Isento.listar()
        .then(response => {
            if (response.success) {
                const isentos = response.data;
                const isento = isentos.find(i => i.id === id);
                
                if (!isento) {
                    showNotification('Isento não encontrado', 'error');
                    return;
                }
                
                // Preencher formulário
                document.getElementById('isento-id').value = isento.id;
                document.getElementById('isento-nome').value = isento.nome;
                document.getElementById('isento-documento').value = isento.documento;
                
                // Verificar se o motivo é um dos padrões
                const motivosPadroes = ['Funcionário', 'Parceiro', 'Autoridade', 'Convênio'];
                if (motivosPadroes.includes(isento.motivo)) {
                    document.getElementById('isento-motivo').value = isento.motivo;
                    document.getElementById('outro-motivo-container').style.display = 'none';
                } else {
                    document.getElementById('isento-motivo').value = 'Outro';
                    document.getElementById('isento-outro-motivo').value = isento.motivo;
                    document.getElementById('outro-motivo-container').style.display = 'block';
                }
                
                // Preencher veículos
                const veiculosContainer = document.getElementById('isento-veiculos-container');
                veiculosContainer.innerHTML = '';
                
                isento.veiculos.forEach(placa => {
                    const veiculoDiv = document.createElement('div');
                    veiculoDiv.className = 'd-flex mb-2';
                    veiculoDiv.innerHTML = `
                        <input type="text" class="form-control isento-veiculo" placeholder="Placa do veículo" value="${placa}">
                        <button type="button" class="btn btn-sm btn-danger ml-2 btn-remover-veiculo">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    
                    veiculosContainer.appendChild(veiculoDiv);
                });
                
                // Adicionar evento aos botões de remover
                adicionarEventoRemoverVeiculo();
                
                // Atualizar título do modal
                document.getElementById('isento-modal-title').textContent = 'Editar Isento';
                
                // Mostrar modal
                document.getElementById('isento-modal').classList.add('active');
            } else {
                showNotification('Erro ao buscar isento: ' + response.message, 'error');
            }
        });
}

// Confirmar exclusão
function confirmarExclusao(id) {
    // Buscar isento
    API.Isento.listar()
        .then(response => {
            if (response.success) {
                const isentos = response.data;
                const isento = isentos.find(i => i.id === id);
                
                if (!isento) {
                    showNotification('Isento não encontrado', 'error');
                    return;
                }
                
                // Atualizar mensagem de confirmação
                document.getElementById('confirmacao-mensagem').textContent = `Tem certeza que deseja excluir o isento "${isento.nome}"?`;
                
                // Configurar botão de confirmar
                const btnConfirmar = document.getElementById('btn-confirmar');
                btnConfirmar.onclick = function() {
                    excluirIsento(id);
                    document.getElementById('confirmacao-modal').classList.remove('active');
                };
                
                // Mostrar modal
                document.getElementById('confirmacao-modal').classList.add('active');
            } else {
                showNotification('Erro ao buscar isento: ' + response.message, 'error');
            }
        });
}

// Excluir isento
function excluirIsento(id) {
    API.Isento.remover(id)
        .then(response => {
            if (response.success) {
                showNotification('Isento excluído com sucesso', 'success');
                carregarIsentos();
            } else {
                showNotification('Erro ao excluir isento: ' + response.message, 'error');
            }
        });
}
