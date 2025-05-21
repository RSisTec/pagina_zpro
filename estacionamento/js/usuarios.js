// Arquivo específico para a página de usuários
// Contém funções para gerenciamento de usuários

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    const session = utils.protegerRota();
    if (!session) return;
    
    // Verificar se é administrador
    if (session.nivel !== 'admin') {
        showNotification('Você não tem permissão para acessar esta página', 'error');
        setTimeout(() => {
            window.location.href = 'admin.html';
        }, 2000);
        return;
    }
    
    // Inicializar componentes
    initializeSidebar();
    initializeLogout();
    initializeModals();
    initializeUsuarioForm();
    
    // Carregar usuários
    carregarUsuarios();
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
    // Modal de Usuário
    const usuarioModal = document.getElementById('usuario-modal');
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const closeUsuarioModal = document.getElementById('close-usuario-modal');
    
    if (usuarioModal && btnNovoUsuario && closeUsuarioModal) {
        btnNovoUsuario.addEventListener('click', function() {
            // Limpar formulário
            document.getElementById('usuario-form').reset();
            document.getElementById('usuario-id').value = '';
            document.getElementById('usuario-modal-title').textContent = 'Novo Usuário';
            
            // Mostrar campos de senha
            document.getElementById('usuario-senha').parentElement.style.display = 'block';
            document.getElementById('usuario-confirmar-senha').parentElement.style.display = 'block';
            
            // Mostrar modal
            usuarioModal.classList.add('active');
        });
        
        closeUsuarioModal.addEventListener('click', function() {
            usuarioModal.classList.remove('active');
        });
        
        usuarioModal.addEventListener('click', function(e) {
            if (e.target === usuarioModal) {
                usuarioModal.classList.remove('active');
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

// Inicializar formulário de usuário
function initializeUsuarioForm() {
    const usuarioForm = document.getElementById('usuario-form');
    
    // Submeter formulário
    if (usuarioForm) {
        usuarioForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const id = document.getElementById('usuario-id').value;
            const nome = document.getElementById('usuario-nome').value.trim();
            const email = document.getElementById('usuario-email').value.trim();
            const login = document.getElementById('usuario-login').value.trim();
            const senha = document.getElementById('usuario-senha').value;
            const confirmarSenha = document.getElementById('usuario-confirmar-senha').value;
            const nivel = document.getElementById('usuario-nivel').value;
            
            // Validar campos obrigatórios
            if (!nome) {
                showNotification('Por favor, digite o nome do usuário', 'error');
                return;
            }
            
            if (!email) {
                showNotification('Por favor, digite o email do usuário', 'error');
                return;
            }
            
            if (!utils.validarEmail(email)) {
                showNotification('Por favor, digite um email válido', 'error');
                return;
            }
            
            if (!login) {
                showNotification('Por favor, digite o login do usuário', 'error');
                return;
            }
            
            // Validar senha apenas para novos usuários ou se a senha foi preenchida
            if (!id || senha) {
                if (!senha) {
                    showNotification('Por favor, digite a senha do usuário', 'error');
                    return;
                }
                
                if (senha.length < 6) {
                    showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
                    return;
                }
                
                if (senha !== confirmarSenha) {
                    showNotification('As senhas não conferem', 'error');
                    return;
                }
            }
            
            // Criar objeto usuário
            const usuario = {
                nome,
                email,
                login,
                nivel
            };
            
            // Adicionar senha apenas se foi preenchida
            if (senha) {
                usuario.senha = senha;
            }
            
            // Buscar usuários existentes
            const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
            
            // Verificar se o login já existe
            const loginExistente = usuarios.find(u => u.login === login && u.id !== id);
            
            if (loginExistente) {
                showNotification('Este login já está em uso', 'error');
                return;
            }
            
            // Verificar se o email já existe
            const emailExistente = usuarios.find(u => u.email === email && u.id !== id);
            
            if (emailExistente) {
                showNotification('Este email já está em uso', 'error');
                return;
            }
            
            if (id) {
                // Atualizar usuário existente
                const index = usuarios.findIndex(u => u.id === id);
                
                if (index !== -1) {
                    // Manter a senha atual se não foi preenchida
                    if (!senha) {
                        usuario.senha = usuarios[index].senha;
                    }
                    
                    usuarios[index] = { ...usuarios[index], ...usuario };
                    localStorage.setItem('usuarios', JSON.stringify(usuarios));
                    
                    showNotification('Usuário atualizado com sucesso', 'success');
                    document.getElementById('usuario-modal').classList.remove('active');
                    carregarUsuarios();
                } else {
                    showNotification('Usuário não encontrado', 'error');
                }
            } else {
                // Adicionar novo usuário
                usuario.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                usuarios.push(usuario);
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
                
                showNotification('Usuário adicionado com sucesso', 'success');
                document.getElementById('usuario-modal').classList.remove('active');
                carregarUsuarios();
            }
        });
    }
}

// Carregar usuários
function carregarUsuarios() {
    const usuariosList = document.getElementById('usuarios-list');
    
    if (!usuariosList) return;
    
    // Mostrar loader
    usuariosList.innerHTML = `
        <div class="loader-container">
            <div class="loader"></div>
        </div>
    `;
    
    // Buscar usuários
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    
    // Verificar se há usuários
    if (usuarios.length === 0) {
        // Criar usuário administrador padrão
        const adminPadrao = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
            nome: 'Administrador',
            email: 'admin@estacionafacil.com',
            login: 'admin',
            senha: 'admin123',
            nivel: 'admin'
        };
        
        usuarios.push(adminPadrao);
        localStorage.setItem('usuarios', JSON.stringify(usuarios));
        
        usuariosList.innerHTML = `
            <div class="alert alert-info">
                Usuário administrador padrão criado.<br>
                Login: admin<br>
                Senha: admin123
            </div>
        `;
        
        setTimeout(() => {
            carregarUsuarios();
        }, 3000);
        
        return;
    }
    
    // Limpar lista
    usuariosList.innerHTML = '';
    
    // Adicionar usuários à lista
    usuarios.forEach(usuario => {
        const usuarioCard = document.createElement('div');
        usuarioCard.className = 'user-card';
        usuarioCard.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
            <div class="user-info">
                <div class="user-name">${usuario.nome}</div>
                <div class="user-email">${usuario.email}</div>
                <div class="user-details">
                    <div class="user-login"><strong>Login:</strong> ${usuario.login}</div>
                    <div class="user-level"><strong>Nível:</strong> ${getNivelNome(usuario.nivel)}</div>
                </div>
            </div>
            <div class="user-actions">
                <button class="btn btn-sm btn-outline btn-editar" data-id="${usuario.id}">
                    <i class="fas fa-edit"></i> Editar
                </button>
                <button class="btn btn-sm btn-danger btn-excluir" data-id="${usuario.id}" ${usuario.nivel === 'admin' && usuarios.filter(u => u.nivel === 'admin').length === 1 ? 'disabled' : ''}>
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
        `;
        
        // Adicionar à lista
        usuariosList.appendChild(usuarioCard);
        
        // Adicionar eventos aos botões
        const btnEditar = usuarioCard.querySelector('.btn-editar');
        const btnExcluir = usuarioCard.querySelector('.btn-excluir');
        
        btnEditar.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            editarUsuario(id);
        });
        
        btnExcluir.addEventListener('click', function() {
            if (this.hasAttribute('disabled')) return;
            
            const id = this.getAttribute('data-id');
            confirmarExclusao(id);
        });
    });
}

// Obter nome do nível
function getNivelNome(nivel) {
    switch (nivel) {
        case 'admin':
            return 'Administrador';
        case 'operador':
            return 'Operador';
        case 'visualizador':
            return 'Visualizador';
        default:
            return nivel;
    }
}

// Editar usuário
function editarUsuario(id) {
    // Buscar usuários
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === id);
    
    if (!usuario) {
        showNotification('Usuário não encontrado', 'error');
        return;
    }
    
    // Preencher formulário
    document.getElementById('usuario-id').value = usuario.id;
    document.getElementById('usuario-nome').value = usuario.nome;
    document.getElementById('usuario-email').value = usuario.email;
    document.getElementById('usuario-login').value = usuario.login;
    document.getElementById('usuario-nivel').value = usuario.nivel;
    
    // Esconder campos de senha
    document.getElementById('usuario-senha').value = '';
    document.getElementById('usuario-confirmar-senha').value = '';
    document.getElementById('usuario-senha').parentElement.style.display = 'block';
    document.getElementById('usuario-confirmar-senha').parentElement.style.display = 'block';
    
    // Atualizar título do modal
    document.getElementById('usuario-modal-title').textContent = 'Editar Usuário';
    
    // Mostrar modal
    document.getElementById('usuario-modal').classList.add('active');
}

// Confirmar exclusão
function confirmarExclusao(id) {
    // Buscar usuários
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuario = usuarios.find(u => u.id === id);
    
    if (!usuario) {
        showNotification('Usuário não encontrado', 'error');
        return;
    }
    
    // Verificar se é o último administrador
    if (usuario.nivel === 'admin' && usuarios.filter(u => u.nivel === 'admin').length === 1) {
        showNotification('Não é possível excluir o último administrador', 'error');
        return;
    }
    
    // Atualizar mensagem de confirmação
    document.getElementById('confirmacao-mensagem').textContent = `Tem certeza que deseja excluir o usuário "${usuario.nome}"?`;
    
    // Configurar botão de confirmar
    const btnConfirmar = document.getElementById('btn-confirmar');
    btnConfirmar.onclick = function() {
        excluirUsuario(id);
        document.getElementById('confirmacao-modal').classList.remove('active');
    };
    
    // Mostrar modal
    document.getElementById('confirmacao-modal').classList.add('active');
}

// Excluir usuário
function excluirUsuario(id) {
    // Buscar usuários
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const index = usuarios.findIndex(u => u.id === id);
    
    if (index === -1) {
        showNotification('Usuário não encontrado', 'error');
        return;
    }
    
    // Verificar se é o último administrador
    if (usuarios[index].nivel === 'admin' && usuarios.filter(u => u.nivel === 'admin').length === 1) {
        showNotification('Não é possível excluir o último administrador', 'error');
        return;
    }
    
    // Remover usuário
    usuarios.splice(index, 1);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    
    showNotification('Usuário excluído com sucesso', 'success');
    carregarUsuarios();
}
