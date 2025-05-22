// Arquivo específico para a página de mensalistas
// Contém funções para gerenciamento de mensalistas

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const session = utils.protegerRota();
    if (!session) return;
    
    // Inicializar componentes
    initializeSidebar();
    initializeLogout();
    initializeModals();
    initializeMensalistaForm();
    
    // Carregar mensalistas
    carregarMensalistas();
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
    // Modal de Mensalista
    const mensalistaModal = document.getElementById('mensalista-modal');
    const btnNovoMensalista = document.getElementById('btn-novo-mensalista');
    const closeMensalistaModal = document.getElementById('close-mensalista-modal');
    
    if (mensalistaModal && btnNovoMensalista && closeMensalistaModal) {
        btnNovoMensalista.addEventListener('click', function() {
            // Limpar formulário
            document.getElementById('mensalista-form').reset();
            document.getElementById('mensalista-id').value = '';
            document.getElementById('mensalista-modal-title').textContent = 'Novo Mensalista';
            
            // Limpar veículos
            const veiculosContainer = document.getElementById('mensalista-veiculos-container');
            veiculosContainer.innerHTML = `
                <div class="d-flex mb-2">
                    <input type="text" class="form-control mensalista-veiculo" placeholder="Placa do veículo">
                    <button type="button" class="btn btn-sm btn-danger ml-2 btn-remover-veiculo">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            // Adicionar evento ao botão de remover
            adicionarEventoRemoverVeiculo();
            
            // Mostrar modal
            mensalistaModal.classList.add('active');
        });
        
        closeMensalistaModal.addEventListener('click', function() {
            mensalistaModal.classList.remove('active');
        });
        
        mensalistaModal.addEventListener('click', function(e) {
            if (e.target === mensalistaModal) {
                mensalistaModal.classList.remove('active');
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

// Inicializar formulário de mensalista
function initializeMensalistaForm() {
    const mensalistaForm = document.getElementById('mensalista-form');
    const btnAdicionarVeiculo = document.getElementById('btn-adicionar-veiculo');
    
    // Adicionar veículo
    if (btnAdicionarVeiculo) {
        btnAdicionarVeiculo.addEventListener('click', function() {
            const veiculosContainer = document.getElementById('mensalista-veiculos-container');
            
            // Criar novo campo de veículo
            const novoVeiculo = document.createElement('div');
            novoVeiculo.className = 'd-flex mb-2';
            novoVeiculo.innerHTML = `
                <input type="text" class="form-control mensalista-veiculo" placeholder="Placa do veículo">
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
    if (mensalistaForm) {
        mensalistaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const id = document.getElementById('mensalista-id').value;
            const nome = document.getElementById('mensalista-nome').value.trim();
            const documento = document.getElementById('mensalista-documento').value.trim();
            const telefone = document.getElementById('mensalista-telefone').value.trim();
            const email = document.getElementById('mensalista-email').value.trim();
            const endereco = document.getElementById('mensalista-endereco').value.trim();
            const plano = document.getElementById('mensalista-plano').value;
            const dataInicio = document.getElementById('mensalista-data-inicio').value;
            const dataFim = document.getElementById('mensalista-data-fim').value;
            
            // Validar campos obrigatórios
            if (!nome) {
                showNotification('Por favor, digite o nome do mensalista', 'error');
                return;
            }
            
            if (!documento) {
                showNotification('Por favor, digite o CPF ou CNPJ do mensalista', 'error');
                return;
            }
            
            if (!telefone) {
                showNotification('Por favor, digite o telefone do mensalista', 'error');
                return;
            }
            
            if (!utils.validarTelefone(telefone)) {
                showNotification('Formato de telefone inválido. Use (XX) XXXXX-XXXX ou XXXXXXXXXXX.', 'error');
                return;
            }
            
            if (!plano) {
                showNotification('Por favor, selecione o plano do mensalista', 'error');
                return;
            }
            
            if (!dataInicio) {
                showNotification('Por favor, selecione a data de início do plano', 'error');
                return;
            }
            
            if (!dataFim) {
                showNotification('Por favor, selecione a data de término do plano', 'error');
                return;
            }
            
            // Obter veículos
            const veiculosInputs = document.querySelectorAll('.mensalista-veiculo');
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
            
            // Criar objeto mensalista
            const mensalista = {
                nome,
                documento,
                telefone,
                email,
                endereco,
                plano,
                dataInicio: new Date(dataInicio).getTime(),
                dataFim: new Date(dataFim).getTime(),
                veiculos
            };
            
            // Salvar mensalista
            if (id) {
                // Atualizar mensalista existente
                API.Mensalista.atualizar(id, mensalista)
                    .then(response => {
                        if (response.success) {
                            showNotification('Mensalista atualizado com sucesso', 'success');
                            document.getElementById('mensalista-modal').classList.remove('active');
                            carregarMensalistas();
                        } else {
                            showNotification('Erro ao atualizar mensalista: ' + response.message, 'error');
                        }
                    });
            } else {
                // Adicionar novo mensalista
                API.Mensalista.adicionar(mensalista)
                    .then(response => {
                        if (response.success) {
                            showNotification('Mensalista adicionado com sucesso', 'success');
                            document.getElementById('mensalista-modal').classList.remove('active');
                            carregarMensalistas();
                        } else {
                            showNotification('Erro ao adicionar mensalista: ' + response.message, 'error');
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
            if (document.querySelectorAll('.mensalista-veiculo').length > 1) {
                // Remover o campo
                this.parentElement.remove();
            } else {
                // Limpar o campo
                this.parentElement.querySelector('.mensalista-veiculo').value = '';
            }
        });
    });
}

// Carregar mensalistas
function carregarMensalistas() {
    const mensalistasList = document.getElementById('mensalistas-list');
    
    if (!mensalistasList) return;
    
    // Mostrar loader
    mensalistasList.innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
        </div>
    `;
    
    // Buscar mensalistas
    API.Mensalista.listar()
        .then(response => {
            if (response.success) {
                const mensalistas = response.data;
                
                // Verificar se há mensalistas
                if (mensalistas.length === 0) {
                    mensalistasList.innerHTML = '<div class="alert alert-info">Não há mensalistas cadastrados.</div>';
                    return;
                }
                
                // Limpar lista
                mensalistasList.innerHTML = '';
                
                // Adicionar mensalistas à lista
                mensalistas.forEach(mensalista => {
                    const mensalistaCard = document.createElement('div');
                    mensalistaCard.className = 'client-card';
                    mensalistaCard.innerHTML = `
                        <div class="client-header">
                            <div class="client-name">${mensalista.nome}</div>
                            <span class="client-type mensalista">${mensalista.plano}</span>
                        </div>
                        <div class="client-info">
                            <div class="result-item">
                                <div class="result-label">Documento</div>
                                <div class="result-value">${mensalista.documento}</div>
                            </div>
                            <div class="result-item">
                                <div class="result-label">Telefone</div>
                                <div class="result-value">${mensalista.telefone}</div>
                            </div>
                            <div class="result-item">
                                <div class="result-label">Email</div>
                                <div class="result-value">${mensalista.email || 'Não informado'}</div>
                            </div>
                            <div class="result-item">
                                <div class="result-label">Validade</div>
                                <div class="result-value">${utils.formatarData(mensalista.dataInicio)} a ${utils.formatarData(mensalista.dataFim)}</div>
                            </div>
                        </div>
                        <div class="client-vehicles">
                            <div class="result-label">Veículos</div>
                            <div class="vehicle-tags">
                                ${mensalista.veiculos.map(placa => `
                                    <span class="vehicle-tag"><i class="fas fa-car"></i> ${placa}</span>
                                `).join('')}
                            </div>
                        </div>
                        <div class="text-right mt-3">
                            <button class="btn btn-sm btn-outline btn-editar" data-id="${mensalista.id}">
                                <i class="fas fa-edit"></i> Editar
                            </button>
                            <button class="btn btn-sm btn-danger btn-excluir" data-id="${mensalista.id}">
                                <i class="fas fa-trash"></i> Excluir
                            </button>
                        </div>
                    `;
                    
                    // Adicionar à lista
                    mensalistasList.appendChild(mensalistaCard);
                    
                    // Adicionar eventos aos botões
                    const btnEditar = mensalistaCard.querySelector('.btn-editar');
                    const btnExcluir = mensalistaCard.querySelector('.btn-excluir');
                    
                    btnEditar.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        editarMensalista(id);
                    });
                    
                    btnExcluir.addEventListener('click', function() {
                        const id = this.getAttribute('data-id');
                        confirmarExclusao(id);
                    });
                });
            } else {
                mensalistasList.innerHTML = `<div class="alert alert-danger">Erro ao carregar mensalistas: ${response.message}</div>`;
            }
        });
}

// Editar mensalista
function editarMensalista(id) {
    // Buscar mensalista
    API.Mensalista.listar()
        .then(response => {
            if (response.success) {
                const mensalistas = response.data;
                const mensalista = mensalistas.find(m => m.id === id);
                
                if (!mensalista) {
                    showNotification('Mensalista não encontrado', 'error');
                    return;
                }
                
                // Preencher formulário
                document.getElementById('mensalista-id').value = mensalista.id;
                document.getElementById('mensalista-nome').value = mensalista.nome;
                document.getElementById('mensalista-documento').value = mensalista.documento;
                document.getElementById('mensalista-telefone').value = mensalista.telefone;
                document.getElementById('mensalista-email').value = mensalista.email || '';
                document.getElementById('mensalista-endereco').value = mensalista.endereco || '';
                document.getElementById('mensalista-plano').value = mensalista.plano;
                
                // Formatar datas
                const dataInicio = new Date(mensalista.dataInicio);
                const dataFim = new Date(mensalista.dataFim);
                
                document.getElementById('mensalista-data-inicio').value = dataInicio.toISOString().split('T')[0];
                document.getElementById('mensalista-data-fim').value = dataFim.toISOString().split('T')[0];
                
                // Preencher veículos
                const veiculosContainer = document.getElementById('mensalista-veiculos-container');
                veiculosContainer.innerHTML = '';
                
                mensalista.veiculos.forEach(placa => {
                    const veiculoDiv = document.createElement('div');
                    veiculoDiv.className = 'd-flex mb-2';
                    veiculoDiv.innerHTML = `
                        <input type="text" class="form-control mensalista-veiculo" placeholder="Placa do veículo" value="${placa}">
                        <button type="button" class="btn btn-sm btn-danger ml-2 btn-remover-veiculo">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                    
                    veiculosContainer.appendChild(veiculoDiv);
                });
                
                // Adicionar evento aos botões de remover
                adicionarEventoRemoverVeiculo();
                
                // Atualizar título do modal
                document.getElementById('mensalista-modal-title').textContent = 'Editar Mensalista';
                
                // Mostrar modal
                document.getElementById('mensalista-modal').classList.add('active');
            } else {
                showNotification('Erro ao buscar mensalista: ' + response.message, 'error');
            }
        });
}

// Confirmar exclusão
function confirmarExclusao(id) {
    // Buscar mensalista
    API.Mensalista.listar()
        .then(response => {
            if (response.success) {
                const mensalistas = response.data;
                const mensalista = mensalistas.find(m => m.id === id);
                
                if (!mensalista) {
                    showNotification('Mensalista não encontrado', 'error');
                    return;
                }
                
                // Atualizar mensagem de confirmação
                document.getElementById('confirmacao-mensagem').textContent = `Tem certeza que deseja excluir o mensalista "${mensalista.nome}"?`;
                
                // Configurar botão de confirmar
                const btnConfirmar = document.getElementById('btn-confirmar');
                btnConfirmar.onclick = function() {
                    excluirMensalista(id);
                    document.getElementById('confirmacao-modal').classList.remove('active');
                };
                
                // Mostrar modal
                document.getElementById('confirmacao-modal').classList.add('active');
            } else {
                showNotification('Erro ao buscar mensalista: ' + response.message, 'error');
            }
        });
}

// Excluir mensalista
function excluirMensalista(id) {
    API.Mensalista.remover(id)
        .then(response => {
            if (response.success) {
                showNotification('Mensalista excluído com sucesso', 'success');
                carregarMensalistas();
            } else {
                showNotification('Erro ao excluir mensalista: ' + response.message, 'error');
            }
        });
}
