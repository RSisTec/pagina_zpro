// Arquivo específico para a página de empresas do superadmin
// Contém funções para listagem, cadastro, edição e detalhes de empresas

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    verificarSessao();
    
    // Inicializar componentes
    initializeSidebar();
    initializeLogout();
    initializeModals();
    initializeEmpresaForm();
    initializeFiltros();
    
    // Verificar se há ID na URL (para detalhes)
    const urlParams = new URLSearchParams(window.location.search);
    const empresaId = urlParams.get('id');
    
    if (empresaId) {
        // Carregar detalhes da empresa
        carregarDetalhesEmpresa(empresaId);
    } else {
        // Carregar lista de empresas
        carregarEmpresas();
    }
});

// Verificar sessão
function verificarSessao() {
    // Verificar se existe uma sessão de superadmin
    superadminAPI.verificarSessaoSuperadmin()
        .then(session => {
            // Exibir nome do usuário
            const userNameElement = document.getElementById('superadmin-user-name');
            if (userNameElement) {
                userNameElement.textContent = session.nome;
            }
        })
        .catch(error => {
            // Redirecionar para login
            window.location.href = 'login.html';
        });
}

// Inicializar sidebar
function initializeSidebar() {
    const sidebarToggle = document.getElementById('superadmin-sidebar-toggle');
    const sidebar = document.getElementById('superadmin-sidebar');
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.toggle('superadmin-sidebar-collapsed');
        });
    }
    
    // Em telas menores, fechar sidebar ao clicar em um link
    const sidebarLinks = document.querySelectorAll('.superadmin-sidebar-link');
    
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
            
            // Encerrar sessão
            superadminAPI.encerrarSessaoSuperadmin()
                .then(() => {
                    // Redirecionar para login
                    window.location.href = 'login.html';
                })
                .catch(error => {
                    // Mostrar erro
                    showNotification(error.mensagem || 'Erro ao encerrar sessão', 'error');
                });
        });
    }
}

// Inicializar modais
function initializeModals() {
    // Modal de Empresa
    const empresaModal = document.getElementById('empresa-modal');
    const btnNovaEmpresa = document.getElementById('btn-nova-empresa');
    const closeEmpresaModal = document.getElementById('close-empresa-modal');
    
    if (empresaModal && btnNovaEmpresa && closeEmpresaModal) {
        btnNovaEmpresa.addEventListener('click', function() {
            // Limpar formulário
            document.getElementById('empresa-form').reset();
            document.getElementById('empresa-id').value = '';
            document.getElementById('empresa-modal-title').textContent = 'Nova Empresa';
            
            // Definir datas padrão
            const hoje = new Date();
            const umAnoDepois = new Date();
            umAnoDepois.setFullYear(hoje.getFullYear() + 1);
            
            document.getElementById('empresa-data-inicio').valueAsDate = hoje;
            document.getElementById('empresa-data-fim').valueAsDate = umAnoDepois;
            
            // Mostrar modal
            empresaModal.classList.add('active');
        });
        
        closeEmpresaModal.addEventListener('click', function() {
            empresaModal.classList.remove('active');
        });
        
        empresaModal.addEventListener('click', function(e) {
            if (e.target === empresaModal) {
                empresaModal.classList.remove('active');
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
    
    // Modal de Detalhes da Empresa
    const detalhesEmpresaModal = document.getElementById('detalhes-empresa-modal');
    const closeDetalhesEmpresaModal = document.getElementById('close-detalhes-empresa-modal');
    
    if (detalhesEmpresaModal && closeDetalhesEmpresaModal) {
        closeDetalhesEmpresaModal.addEventListener('click', function() {
            detalhesEmpresaModal.classList.remove('active');
            
            // Limpar ID da URL
            const url = new URL(window.location.href);
            url.searchParams.delete('id');
            window.history.replaceState({}, '', url);
            
            // Recarregar lista de empresas
            carregarEmpresas();
        });
        
        detalhesEmpresaModal.addEventListener('click', function(e) {
            if (e.target === detalhesEmpresaModal) {
                detalhesEmpresaModal.classList.remove('active');
                
                // Limpar ID da URL
                const url = new URL(window.location.href);
                url.searchParams.delete('id');
                window.history.replaceState({}, '', url);
                
                // Recarregar lista de empresas
                carregarEmpresas();
            }
        });
    }
}

// Inicializar formulário de empresa
function initializeEmpresaForm() {
    const empresaForm = document.getElementById('empresa-form');
    
    if (empresaForm) {
        // Máscara para CNPJ
        const cnpjInput = document.getElementById('empresa-cnpj');
        if (cnpjInput) {
            cnpjInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 14) {
                    value = value.slice(0, 14);
                }
                
                if (value.length > 12) {
                    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2}).*/, '$1.$2.$3/$4-$5');
                } else if (value.length > 8) {
                    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d+).*/, '$1.$2.$3/$4');
                } else if (value.length > 5) {
                    value = value.replace(/^(\d{2})(\d{3})(\d+).*/, '$1.$2.$3');
                } else if (value.length > 2) {
                    value = value.replace(/^(\d{2})(\d+).*/, '$1.$2');
                }
                
                e.target.value = value;
            });
        }
        
        // Máscara para telefone
        const telefoneInput = document.getElementById('empresa-telefone');
        if (telefoneInput) {
            telefoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                if (value.length > 11) {
                    value = value.slice(0, 11);
                }
                
                if (value.length > 10) {
                    value = value.replace(/^(\d{2})(\d{5})(\d{4}).*/, '($1) $2-$3');
                } else if (value.length > 6) {
                    value = value.replace(/^(\d{2})(\d{4})(\d+).*/, '($1) $2-$3');
                } else if (value.length > 2) {
                    value = value.replace(/^(\d{2})(\d+).*/, '($1) $2');
                }
                
                e.target.value = value;
            });
        }
        
        // Submeter formulário
        empresaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const id = document.getElementById('empresa-id').value;
            const nome = document.getElementById('empresa-nome').value.trim();
            const cnpj = document.getElementById('empresa-cnpj').value.trim();
            const telefone = document.getElementById('empresa-telefone').value.trim();
            const email = document.getElementById('empresa-email').value.trim();
            const endereco = document.getElementById('empresa-endereco').value.trim();
            const responsavel = document.getElementById('empresa-responsavel').value.trim();
            const logo = document.getElementById('empresa-logo').value.trim();
            const dataInicio = document.getElementById('empresa-data-inicio').value;
            const dataFim = document.getElementById('empresa-data-fim').value;
            const status = document.getElementById('empresa-status').value;
            
            // Validar campos obrigatórios da empresa
            if (!nome) {
                showNotification('Por favor, digite o nome da empresa', 'error');
                return;
            }
            
            if (!cnpj) {
                showNotification('Por favor, digite o CNPJ da empresa', 'error');
                return;
            }
            
            if (!telefone) {
                showNotification('Por favor, digite o telefone da empresa', 'error');
                return;
            }
            
            if (!email) {
                showNotification('Por favor, digite o email da empresa', 'error');
                return;
            }
            
            if (!utils.validarEmail(email)) {
                showNotification('Por favor, digite um email válido', 'error');
                return;
            }
            
            if (!endereco) {
                showNotification('Por favor, digite o endereço da empresa', 'error');
                return;
            }
            
            if (!responsavel) {
                showNotification('Por favor, digite o nome do responsável', 'error');
                return;
            }
            
            if (!dataInicio) {
                showNotification('Por favor, selecione a data de início da licença', 'error');
                return;
            }
            
            if (!dataFim) {
                showNotification('Por favor, selecione a data de término da licença', 'error');
                return;
            }
            
            // Validar datas
            const dataInicioObj = new Date(dataInicio);
            const dataFimObj = new Date(dataFim);
            
            if (dataFimObj <= dataInicioObj) {
                showNotification('A data de término deve ser posterior à data de início', 'error');
                return;
            }
            
            // Criar objeto empresa
            const dadosEmpresa = {
                nome,
                cnpj,
                telefone,
                email,
                endereco,
                responsavel,
                logo,
                dataInicioLicenca: dataInicio,
                dataFimLicenca: dataFim,
                status
            };
            
            // Se for edição, atualizar empresa
            if (id) {
                // Mostrar loader
                const btnSalvar = document.getElementById('btn-salvar-empresa');
                const btnText = btnSalvar.innerHTML;
                btnSalvar.innerHTML = '<div class="loader-sm"></div>';
                btnSalvar.disabled = true;
                
                // Atualizar empresa
                superadminAPI.atualizarEmpresa(id, dadosEmpresa)
                    .then(empresa => {
                        // Mostrar sucesso
                        showNotification('Empresa atualizada com sucesso', 'success');
                        
                        // Fechar modal
                        document.getElementById('empresa-modal').classList.remove('active');
                        
                        // Recarregar lista de empresas ou detalhes
                        const urlParams = new URLSearchParams(window.location.search);
                        const empresaIdUrl = urlParams.get('id');
                        
                        if (empresaIdUrl) {
                            carregarDetalhesEmpresa(empresaIdUrl);
                        } else {
                            carregarEmpresas();
                        }
                    })
                    .catch(error => {
                        // Mostrar erro
                        showNotification(error.mensagem || 'Erro ao atualizar empresa', 'error');
                        
                        // Restaurar botão
                        btnSalvar.innerHTML = btnText;
                        btnSalvar.disabled = false;
                    });
            } else {
                // Validar campos do administrador
                const adminNome = document.getElementById('admin-nome').value.trim();
                const adminEmail = document.getElementById('admin-email').value.trim();
                const adminLogin = document.getElementById('admin-login').value.trim();
                const adminSenha = document.getElementById('admin-senha').value;
                
                if (!adminNome) {
                    showNotification('Por favor, digite o nome do administrador', 'error');
                    return;
                }
                
                if (!adminEmail) {
                    showNotification('Por favor, digite o email do administrador', 'error');
                    return;
                }
                
                if (!utils.validarEmail(adminEmail)) {
                    showNotification('Por favor, digite um email válido para o administrador', 'error');
                    return;
                }
                
                if (!adminLogin) {
                    showNotification('Por favor, digite o login do administrador', 'error');
                    return;
                }
                
                if (!adminSenha) {
                    showNotification('Por favor, digite a senha do administrador', 'error');
                    return;
                }
                
                if (adminSenha.length < 6) {
                    showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
                    return;
                }
                
                // Criar objeto administrador
                const dadosAdmin = {
                    nome: adminNome,
                    email: adminEmail,
                    login: adminLogin,
                    senha: adminSenha
                };
                
                // Mostrar loader
                const btnSalvar = document.getElementById('btn-salvar-empresa');
                const btnText = btnSalvar.innerHTML;
                btnSalvar.innerHTML = '<div class="loader-sm"></div>';
                btnSalvar.disabled = true;
                
                // Cadastrar empresa
                superadminAPI.cadastrarEmpresa(dadosEmpresa, dadosAdmin)
                    .then(empresa => {
                        // Mostrar sucesso
                        showNotification('Empresa cadastrada com sucesso', 'success');
                        
                        // Fechar modal
                        document.getElementById('empresa-modal').classList.remove('active');
                        
                        // Recarregar lista de empresas
                        carregarEmpresas();
                    })
                    .catch(error => {
                        // Mostrar erro
                        showNotification(error.mensagem || 'Erro ao cadastrar empresa', 'error');
                        
                        // Restaurar botão
                        btnSalvar.innerHTML = btnText;
                        btnSalvar.disabled = false;
                    });
            }
        });
    }
}

// Inicializar filtros
function initializeFiltros() {
    const btnFiltrar = document.getElementById('btn-filtrar');
    
    if (btnFiltrar) {
        btnFiltrar.addEventListener('click', function() {
            carregarEmpresas();
        });
    }
}

// Carregar empresas
function carregarEmpresas() {
    const empresasList = document.getElementById('empresas-list');
    
    if (!empresasList) return;
    
    // Mostrar loader
    empresasList.innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
        </div>
    `;
    
    // Obter filtros
    const filtroStatus = document.getElementById('filtro-status').value;
    const filtroLicenca = document.getElementById('filtro-licenca').value;
    const filtroBusca = document.getElementById('filtro-busca').value.trim();
    
    // Criar objeto de filtros
    const filtros = {
        status: filtroStatus,
        licenca: filtroLicenca,
        busca: filtroBusca
    };
    
    // Listar empresas
    superadminAPI.listarEmpresas(filtros)
        .then(empresas => {
            // Verificar se há empresas
            if (empresas.length === 0) {
                empresasList.innerHTML = `
                    <div class="alert alert-info">
                        Nenhuma empresa encontrada com os filtros selecionados.
                    </div>
                `;
                return;
            }
            
            // Limpar lista
            empresasList.innerHTML = '';
            
            // Adicionar empresas
            empresas.forEach(empresa => {
                const hoje = new Date().getTime();
                const diasRestantes = Math.max(0, Math.floor((empresa.dataFimLicenca - hoje) / (24 * 60 * 60 * 1000)));
                const licencaStatus = diasRestantes === 0 ? 'vencida' : (diasRestantes <= 30 ? 'vencendo' : 'vigente');
                const dataInicio = new Date(empresa.dataInicioLicenca).toLocaleDateString('pt-BR');
                const dataFim = new Date(empresa.dataFimLicenca).toLocaleDateString('pt-BR');
                
                const empresaCard = document.createElement('div');
                empresaCard.className = 'superadmin-company-card';
                empresaCard.innerHTML = `
                    <div class="superadmin-company-header">
                        <div class="superadmin-company-name">${empresa.nome}</div>
                        <div class="superadmin-company-status ${empresa.status ? 'active' : 'inactive'}">${empresa.status ? 'Ativo' : 'Inativo'}</div>
                    </div>
                    <div class="superadmin-company-body">
                        <div class="superadmin-company-info">
                            <div class="superadmin-info-item">
                                <div class="superadmin-info-label">CNPJ</div>
                                <div class="superadmin-info-value">${empresa.cnpj}</div>
                            </div>
                            <div class="superadmin-info-item">
                                <div class="superadmin-info-label">Telefone</div>
                                <div class="superadmin-info-value">${empresa.telefone}</div>
                            </div>
                            <div class="superadmin-info-item">
                                <div class="superadmin-info-label">Email</div>
                                <div class="superadmin-info-value">${empresa.email}</div>
                            </div>
                            <div class="superadmin-info-item">
                                <div class="superadmin-info-label">Licença</div>
                                <div class="superadmin-info-value ${licencaStatus}">
                                    ${dataInicio} a ${dataFim}
                                    <br>
                                    ${diasRestantes === 0 ? 'Vencida' : `${diasRestantes} dias restantes`}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="superadmin-company-footer">
                        <button class="btn btn-sm btn-outline btn-detalhes" data-id="${empresa.id}">
                            <i class="fas fa-eye"></i> Detalhes
                        </button>
                        <button class="btn btn-sm btn-outline btn-editar" data-id="${empresa.id}">
                            <i class="fas fa-edit"></i> Editar
                        </button>
                        <button class="btn btn-sm ${empresa.status ? 'btn-danger' : 'btn-success'} btn-status" data-id="${empresa.id}" data-status="${!empresa.status}">
                            <i class="fas ${empresa.status ? 'fa-ban' : 'fa-check'}"></i> ${empresa.status ? 'Desativar' : 'Ativar'}
                        </button>
                    </div>
                `;
                
                // Adicionar à lista
                empresasList.appendChild(empresaCard);
                
                // Adicionar eventos aos botões
                const btnDetalhes = empresaCard.querySelector('.btn-detalhes');
                const btnEditar = empresaCard.querySelector('.btn-editar');
                const btnStatus = empresaCard.querySelector('.btn-status');
                
                btnDetalhes.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    carregarDetalhesEmpresa(id);
                });
                
                btnEditar.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    editarEmpresa(id);
                });
                
                btnStatus.addEventListener('click', function() {
                    const id = this.getAttribute('data-id');
                    const status = this.getAttribute('data-status') === 'true';
                    confirmarAlteracaoStatus(id, status);
                });
            });
        })
        .catch(error => {
            // Mostrar erro
            empresasList.innerHTML = `
                <div class="alert alert-danger">
                    ${error.mensagem || 'Erro ao carregar empresas'}
                </div>
            `;
        });
}

// Editar empresa
function editarEmpresa(id) {
    // Obter empresa
    superadminAPI.obterEmpresa(id)
        .then(empresa => {
            // Preencher formulário
            document.getElementById('empresa-id').value = empresa.id;
            document.getElementById('empresa-nome').value = empresa.nome;
            document.getElementById('empresa-cnpj').value = empresa.cnpj;
            document.getElementById('empresa-telefone').value = empresa.telefone;
            document.getElementById('empresa-email').value = empresa.email;
            document.getElementById('empresa-endereco').value = empresa.endereco;
            document.getElementById('empresa-responsavel').value = empresa.responsavel;
            document.getElementById('empresa-logo').value = empresa.logo || '';
            document.getElementById('empresa-data-inicio').value = new Date(empresa.dataInicioLicenca).toISOString().split('T')[0];
            document.getElementById('empresa-data-fim').value = new Date(empresa.dataFimLicenca).toISOString().split('T')[0];
            document.getElementById('empresa-status').value = empresa.status.toString();
            
            // Esconder campos do administrador
            document.getElementById('admin-nome').parentElement.parentElement.style.display = 'none';
            document.getElementById('admin-email').parentElement.parentElement.style.display = 'none';
            document.getElementById('admin-login').parentElement.parentElement.style.display = 'none';
            document.getElementById('admin-senha').parentElement.parentElement.style.display = 'none';
            document.querySelector('.form-section-title').parentElement.style.display = 'none';
            
            // Atualizar título do modal
            document.getElementById('empresa-modal-title').textContent = 'Editar Empresa';
            
            // Mostrar modal
            document.getElementById('empresa-modal').classList.add('active');
        })
        .catch(error => {
            // Mostrar erro
            showNotification(error.mensagem || 'Erro ao carregar empresa', 'error');
        });
}

// Confirmar alteração de status
function confirmarAlteracaoStatus(id, status) {
    // Obter empresa
    superadminAPI.obterEmpresa(id)
        .then(empresa => {
            // Atualizar mensagem de confirmação
            document.getElementById('confirmacao-mensagem').textContent = `Tem certeza que deseja ${status ? 'ativar' : 'desativar'} a empresa "${empresa.nome}"?`;
            
            // Configurar botão de confirmar
            const btnConfirmar = document.getElementById('btn-confirmar');
            btnConfirmar.onclick = function() {
                alterarStatusEmpresa(id, status);
                document.getElementById('confirmacao-modal').classList.remove('active');
            };
            
            // Mostrar modal
            document.getElementById('confirmacao-modal').classList.add('active');
        })
        .catch(error => {
            // Mostrar erro
            showNotification(error.mensagem || 'Erro ao carregar empresa', 'error');
        });
}

// Alterar status da empresa
function alterarStatusEmpresa(id, status) {
    // Alterar status
    superadminAPI.alterarStatusEmpresa(id, status)
        .then(empresa => {
            // Mostrar sucesso
            showNotification(`Empresa ${status ? 'ativada' : 'desativada'} com sucesso`, 'success');
            
            // Recarregar lista de empresas ou detalhes
            const urlParams = new URLSearchParams(window.location.search);
            const empresaIdUrl = urlParams.get('id');
            
            if (empresaIdUrl) {
                carregarDetalhesEmpresa(empresaIdUrl);
            } else {
                carregarEmpresas();
            }
        })
        .catch(error => {
            // Mostrar erro
            showNotification(error.mensagem || 'Erro ao alterar status da empresa', 'error');
        });
}

// Carregar detalhes da empresa
function carregarDetalhesEmpresa(id) {
    // Atualizar URL
    const url = new URL(window.location.href);
    url.searchParams.set('id', id);
    window.history.replaceState({}, '', url);
    
    // Obter empresa
    superadminAPI.obterEmpresa(id)
        .then(empresa => {
            // Preencher detalhes
            document.getElementById('detalhes-empresa-title').textContent = 'Detalhes da Empresa';
            document.getElementById('detalhes-empresa-nome').textContent = empresa.nome;
            document.getElementById('detalhes-empresa-status').textContent = empresa.status ? 'Ativo' : 'Inativo';
            document.getElementById('detalhes-empresa-status').className = `empresa-status ${empresa.status ? 'active' : 'inactive'}`;
            document.getElementById('detalhes-empresa-cnpj').textContent = empresa.cnpj;
            document.getElementById('detalhes-empresa-telefone').textContent = empresa.telefone;
            document.getElementById('detalhes-empresa-email').textContent = empresa.email;
            document.getElementById('detalhes-empresa-endereco').textContent = empresa.endereco;
            document.getElementById('detalhes-empresa-responsavel').textContent = empresa.responsavel;
            document.getElementById('detalhes-empresa-data-inicio').textContent = new Date(empresa.dataInicioLicenca).toLocaleDateString('pt-BR');
            document.getElementById('detalhes-empresa-data-fim').textContent = new Date(empresa.dataFimLicenca).toLocaleDateString('pt-BR');
            
            // Calcular dias restantes
            const hoje = new Date().getTime();
            const diasRestantes = Math.max(0, Math.floor((empresa.dataFimLicenca - hoje) / (24 * 60 * 60 * 1000)));
            document.getElementById('detalhes-empresa-dias-restantes').textContent = diasRestantes === 0 ? 'Vencida' : `${diasRestantes} dias`;
            
            // Configurar logo
            const logoContainer = document.getElementById('detalhes-empresa-logo');
            if (empresa.logo) {
                logoContainer.innerHTML = `<img src="${empresa.logo}" alt="${empresa.nome}" class="empresa-logo">`;
            } else {
                logoContainer.innerHTML = `<i class="fas fa-building"></i>`;
            }
            
            // Configurar botões
            const btnEditar = document.getElementById('detalhes-btn-editar');
            btnEditar.onclick = function() {
                editarEmpresa(id);
            };
            
            const btnAcessar = document.getElementById('detalhes-btn-acessar');
            btnAcessar.onclick = function() {
                acessarComoAdmin(id);
            };
            
            // Carregar estatísticas
            superadminAPI.obterEstatisticasEmpresa(id)
                .then(estatisticas => {
                    document.getElementById('detalhes-empresa-total-usuarios').textContent = estatisticas.totalUsuarios;
                    document.getElementById('detalhes-empresa-total-veiculos').textContent = estatisticas.totalVeiculos;
                    document.getElementById('detalhes-empresa-total-mensalistas').textContent = estatisticas.totalMensalistas;
                    document.getElementById('detalhes-empresa-total-servicos').textContent = estatisticas.totalServicos;
                })
                .catch(error => {
                    // Mostrar erro
                    showNotification(error.mensagem || 'Erro ao carregar estatísticas', 'error');
                });
            
            // Mostrar modal
            document.getElementById('detalhes-empresa-modal').classList.add('active');
        })
        .catch(error => {
            // Mostrar erro
            showNotification(error.mensagem || 'Erro ao carregar detalhes da empresa', 'error');
            
            // Limpar ID da URL
            const url = new URL(window.location.href);
            url.searchParams.delete('id');
            window.history.replaceState({}, '', url);
            
            // Recarregar lista de empresas
            carregarEmpresas();
        });
}

// Acessar como administrador
function acessarComoAdmin(id) {
    // Acessar como admin
    superadminAPI.acessarComoAdmin(id)
        .then(session => {
            // Redirecionar para dashboard da empresa
            window.location.href = '../pages/admin.html';
        })
        .catch(error => {
            // Mostrar erro
            showNotification(error.mensagem || 'Erro ao acessar como administrador', 'error');
        });
}

// Mostrar notificação
function showNotification(message, type = 'info') {
    const notification = document.getElementById('notification');
    const notificationMessage = document.getElementById('notification-message');
    
    if (notification && notificationMessage) {
        // Definir mensagem
        notificationMessage.textContent = message;
        
        // Definir tipo
        notification.className = 'notification';
        notification.classList.add(type);
        
        // Mostrar notificação
        notification.classList.add('active');
        
        // Esconder após 5 segundos
        setTimeout(() => {
            notification.classList.remove('active');
        }, 5000);
    }
}
