// Adaptação do arquivo usuarios.js para usar a API PHP/PostgreSQL

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (!API.Auth.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Verificar permissões
    const user = API.Auth.getCurrentUser();
    if (user && user.nivel !== 'admin') {
        window.location.href = '/pages/admin.html';
        return;
    }

    // Elementos da página
    const usuariosContainer = document.getElementById('usuarios-container');
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const modalUsuario = document.getElementById('modal-usuario');
    const formUsuario = document.getElementById('form-usuario');
    
    // Variáveis globais
    let modoEdicao = false;
    
    // Carregar usuários
    carregarUsuarios();
    
    // Configurar botões de ação
    if (btnNovoUsuario) {
        btnNovoUsuario.addEventListener('click', function() {
            // Limpar formulário
            formUsuario.reset();
            document.getElementById('usuario-id').value = '';
            
            // Definir modo de cadastro
            modoEdicao = false;
            document.getElementById('modal-titulo').textContent = 'Novo Usuário';
            
            // Mostrar campos de senha
            document.getElementById('container-senha').style.display = 'block';
            document.getElementById('container-confirmar-senha').style.display = 'block';
            
            // Mostrar modal
            modalUsuario.classList.add('mostrar');
        });
    }
    
    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('mostrar');
            }
        });
    });
    
    // Configurar formulário de usuário
    if (formUsuario) {
        formUsuario.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const id = document.getElementById('usuario-id').value;
            const nome = document.getElementById('nome').value.trim();
            const login = document.getElementById('login').value.trim();
            const email = document.getElementById('email').value.trim();
            const nivel = document.getElementById('nivel').value;
            const senha = document.getElementById('senha').value;
            const confirmarSenha = document.getElementById('confirmar-senha').value;
            
            // Validar campos obrigatórios
            if (!nome || !login || !nivel) {
                Utils.mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
                return;
            }
            
            // Validar senha em modo de cadastro
            if (!modoEdicao) {
                if (!senha) {
                    Utils.mostrarNotificacao('Por favor, informe a senha', 'error');
                    return;
                }
                
                if (senha !== confirmarSenha) {
                    Utils.mostrarNotificacao('As senhas não conferem', 'error');
                    return;
                }
            }
            
            // Preparar dados
            const dados = {
                nome,
                login,
                email,
                nivel
            };
            
            // Adicionar senha apenas se informada
            if (senha) {
                dados.senha = senha;
            }
            
            // Mostrar carregamento
            Utils.mostrarCarregamento(modoEdicao ? 'Atualizando usuário...' : 'Cadastrando usuário...');
            
            // Cadastrar ou atualizar usuário
            const promise = modoEdicao
                ? API.Usuario.atualizar(id, dados)
                : API.Usuario.cadastrar(dados);
            
            promise
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        Utils.mostrarNotificacao(
                            modoEdicao ? 'Usuário atualizado com sucesso!' : 'Usuário cadastrado com sucesso!',
                            'success'
                        );
                        
                        // Fechar modal
                        modalUsuario.classList.remove('mostrar');
                        
                        // Recarregar usuários
                        carregarUsuarios();
                    } else {
                        Utils.mostrarNotificacao(response.message || 'Erro ao processar usuário', 'error');
                    }
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao processar usuário: ' + error.message, 'error');
                });
        });
    }
    
    // Função para carregar usuários
    function carregarUsuarios() {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando usuários...');
        
        // Consultar usuários
        API.Usuario.listar()
            .then(response => {
                Utils.esconderCarregamento();
                
                const usuarios = response.data;
                
                if (usuarios.length === 0) {
                    usuariosContainer.innerHTML = `
                        <div class="alerta alerta-info">
                            <p>Não há usuários cadastrados.</p>
                        </div>
                    `;
                    return;
                }
                
                // Exibir usuários
                let html = '';
                
                usuarios.forEach(usuario => {
                    let nivelTexto = 'Visualizador';
                    let nivelClasse = 'visualizador';
                    
                    if (usuario.nivel === 'admin') {
                        nivelTexto = 'Administrador';
                        nivelClasse = 'admin';
                    } else if (usuario.nivel === 'operador') {
                        nivelTexto = 'Operador';
                        nivelClasse = 'operador';
                    }
                    
                    html += `
                        <div class="card">
                            <div class="card-header">
                                <h3>${usuario.nome}</h3>
                                <span class="badge ${nivelClasse}">${nivelTexto}</span>
                            </div>
                            <div class="card-body">
                                <p><strong>Login:</strong> ${usuario.login}</p>
                                <p><strong>Email:</strong> ${usuario.email || '-'}</p>
                                <p><strong>Último acesso:</strong> ${usuario.ultimo_acesso ? Utils.formatarData(usuario.ultimo_acesso) : 'Nunca acessou'}</p>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary" onclick="editarUsuario('${usuario.id}')">Editar</button>
                                <button class="btn btn-secondary" onclick="resetarSenha('${usuario.id}')">Resetar Senha</button>
                                ${usuario.id !== user.id ? `<button class="btn btn-danger" onclick="excluirUsuario('${usuario.id}')">Excluir</button>` : ''}
                            </div>
                        </div>
                    `;
                });
                
                usuariosContainer.innerHTML = html;
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar usuários: ' + error.message, 'error');
            });
    }
    
    // Função global para editar usuário
    window.editarUsuario = function(id) {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando dados do usuário...');
        
        // Consultar usuário
        API.Usuario.obter(id)
            .then(response => {
                Utils.esconderCarregamento();
                
                if (!response.data) {
                    Utils.mostrarNotificacao('Usuário não encontrado', 'error');
                    return;
                }
                
                const usuario = response.data;
                
                // Preencher formulário
                document.getElementById('usuario-id').value = usuario.id;
                document.getElementById('nome').value = usuario.nome;
                document.getElementById('login').value = usuario.login;
                document.getElementById('email').value = usuario.email || '';
                document.getElementById('nivel').value = usuario.nivel;
                
                // Limpar campos de senha
                document.getElementById('senha').value = '';
                document.getElementById('confirmar-senha').value = '';
                
                // Esconder campos de senha (opcional em edição)
                document.getElementById('container-senha').style.display = 'block';
                document.getElementById('container-confirmar-senha').style.display = 'block';
                
                // Definir modo de edição
                modoEdicao = true;
                document.getElementById('modal-titulo').textContent = 'Editar Usuário';
                
                // Mostrar modal
                modalUsuario.classList.add('mostrar');
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar usuário: ' + error.message, 'error');
            });
    };
    
    // Função global para resetar senha
    window.resetarSenha = function(id) {
        // Confirmar reset
        Utils.confirmar('Tem certeza que deseja resetar a senha deste usuário? Uma nova senha será gerada e enviada por email.')
            .then(confirmado => {
                if (!confirmado) return;
                
                // Mostrar carregamento
                Utils.mostrarCarregamento('Resetando senha...');
                
                // Resetar senha
                API.Usuario.resetarSenha(id)
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        if (response.success) {
                            Utils.mostrarNotificacao('Senha resetada com sucesso! A nova senha é: ' + response.data.senha, 'success');
                        } else {
                            Utils.mostrarNotificacao(response.message || 'Erro ao resetar senha', 'error');
                        }
                    })
                    .catch(error => {
                        Utils.esconderCarregamento();
                        Utils.mostrarNotificacao('Erro ao resetar senha: ' + error.message, 'error');
                    });
            });
    };
    
    // Função global para excluir usuário
    window.excluirUsuario = function(id) {
        // Confirmar exclusão
        Utils.confirmar('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')
            .then(confirmado => {
                if (!confirmado) return;
                
                // Mostrar carregamento
                Utils.mostrarCarregamento('Excluindo usuário...');
                
                // Excluir usuário
                API.Usuario.excluir(id)
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        if (response.success) {
                            Utils.mostrarNotificacao('Usuário excluído com sucesso!', 'success');
                            
                            // Recarregar usuários
                            carregarUsuarios();
                        } else {
                            Utils.mostrarNotificacao(response.message || 'Erro ao excluir usuário', 'error');
                        }
                    })
                    .catch(error => {
                        Utils.esconderCarregamento();
                        Utils.mostrarNotificacao('Erro ao excluir usuário: ' + error.message, 'error');
                    });
            });
    };
});
