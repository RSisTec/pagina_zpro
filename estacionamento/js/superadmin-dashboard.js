// Arquivo específico para a página de dashboard do superadmin
// Contém funções para exibição de estatísticas e empresas recentes

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    verificarSessao();
    
    // Inicializar componentes
    initializeSidebar();
    initializeLogout();
    
    // Carregar dados
    carregarEstatisticas();
    carregarEmpresasRecentes();
    carregarLicencasVencendo();
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

// Carregar estatísticas
function carregarEstatisticas() {
    // Obter estatísticas globais
    superadminAPI.obterEstatisticasGlobais()
        .then(estatisticas => {
            // Atualizar contadores
            document.getElementById('total-empresas').textContent = estatisticas.totalEmpresas;
            document.getElementById('empresas-ativas').textContent = estatisticas.empresasAtivas;
            document.getElementById('licencas-vencendo').textContent = estatisticas.licencasVencendo;
            document.getElementById('total-veiculos').textContent = estatisticas.totalVeiculos;
        })
        .catch(error => {
            // Mostrar erro
            showNotification(error.mensagem || 'Erro ao carregar estatísticas', 'error');
        });
}

// Carregar empresas recentes
function carregarEmpresasRecentes() {
    const empresasRecentesContainer = document.getElementById('empresas-recentes');
    
    if (!empresasRecentesContainer) return;
    
    // Mostrar loader
    empresasRecentesContainer.innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
        </div>
    `;
    
    // Listar empresas (limitado a 3 mais recentes)
    superadminAPI.listarEmpresas()
        .then(empresas => {
            // Limitar a 3 empresas
            const empresasRecentes = empresas.slice(0, 3);
            
            // Verificar se há empresas
            if (empresasRecentes.length === 0) {
                empresasRecentesContainer.innerHTML = `
                    <div class="alert alert-info">
                        Nenhuma empresa cadastrada. <a href="empresas.html" class="alert-link">Cadastrar empresa</a>
                    </div>
                `;
                return;
            }
            
            // Limpar container
            empresasRecentesContainer.innerHTML = '';
            
            // Adicionar empresas
            empresasRecentes.forEach(empresa => {
                const hoje = new Date().getTime();
                const diasRestantes = Math.max(0, Math.floor((empresa.dataFimLicenca - hoje) / (24 * 60 * 60 * 1000)));
                const licencaStatus = diasRestantes === 0 ? 'vencida' : (diasRestantes <= 30 ? 'vencendo' : 'vigente');
                
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
                                <div class="superadmin-info-label">Licença</div>
                                <div class="superadmin-info-value ${licencaStatus}">
                                    ${diasRestantes === 0 ? 'Vencida' : `${diasRestantes} dias restantes`}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="superadmin-company-footer">
                        <a href="empresas.html?id=${empresa.id}" class="btn btn-sm btn-outline">
                            <i class="fas fa-eye"></i> Detalhes
                        </a>
                    </div>
                `;
                
                // Adicionar ao container
                empresasRecentesContainer.appendChild(empresaCard);
            });
        })
        .catch(error => {
            // Mostrar erro
            empresasRecentesContainer.innerHTML = `
                <div class="alert alert-danger">
                    ${error.mensagem || 'Erro ao carregar empresas'}
                </div>
            `;
        });
}

// Carregar licenças vencendo
function carregarLicencasVencendo() {
    const licencasVencendoLista = document.getElementById('licencas-vencendo-lista');
    
    if (!licencasVencendoLista) return;
    
    // Mostrar loader
    licencasVencendoLista.innerHTML = `
        <tr>
            <td colspan="5" class="text-center">
                <div class="loader-sm"></div>
            </td>
        </tr>
    `;
    
    // Listar empresas com licenças vencendo
    superadminAPI.listarEmpresas({ licenca: 'vencendo' })
        .then(empresas => {
            // Verificar se há empresas
            if (empresas.length === 0) {
                licencasVencendoLista.innerHTML = `
                    <tr>
                        <td colspan="5" class="text-center">
                            Nenhuma licença próxima do vencimento
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Limpar lista
            licencasVencendoLista.innerHTML = '';
            
            // Adicionar empresas
            empresas.forEach(empresa => {
                const hoje = new Date().getTime();
                const diasRestantes = Math.max(0, Math.floor((empresa.dataFimLicenca - hoje) / (24 * 60 * 60 * 1000)));
                const dataVencimento = new Date(empresa.dataFimLicenca).toLocaleDateString('pt-BR');
                
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${empresa.nome}</td>
                    <td>${dataVencimento}</td>
                    <td>${diasRestantes} dias</td>
                    <td>
                        <span class="badge ${empresa.status ? 'badge-success' : 'badge-danger'}">
                            ${empresa.status ? 'Ativo' : 'Inativo'}
                        </span>
                    </td>
                    <td>
                        <a href="empresas.html?id=${empresa.id}" class="btn btn-sm btn-outline">
                            <i class="fas fa-eye"></i> Detalhes
                        </a>
                    </td>
                `;
                
                // Adicionar à lista
                licencasVencendoLista.appendChild(tr);
            });
        })
        .catch(error => {
            // Mostrar erro
            licencasVencendoLista.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        ${error.mensagem || 'Erro ao carregar licenças'}
                    </td>
                </tr>
            `;
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
