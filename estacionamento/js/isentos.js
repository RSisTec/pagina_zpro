// Adaptação do arquivo isentos.js para usar a API PHP/PostgreSQL

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (!API.Auth.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Elementos da página
    const isentosContainer = document.getElementById('isentos-container');
    const btnNovoIsento = document.getElementById('btn-novo-isento');
    const modalIsento = document.getElementById('modal-isento');
    const formIsento = document.getElementById('form-isento');
    const modalVeiculo = document.getElementById('modal-veiculo');
    const formVeiculo = document.getElementById('form-veiculo');
    
    // Variáveis globais
    let isentoAtual = null;
    let modoEdicao = false;
    
    // Carregar isentos
    carregarIsentos();
    
    // Configurar botões de ação
    if (btnNovoIsento) {
        btnNovoIsento.addEventListener('click', function() {
            // Limpar formulário
            formIsento.reset();
            document.getElementById('isento-id').value = '';
            
            // Definir modo de cadastro
            modoEdicao = false;
            document.getElementById('modal-titulo').textContent = 'Novo Isento';
            
            // Mostrar modal
            modalIsento.classList.add('mostrar');
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
    
    // Configurar formulário de isento
    if (formIsento) {
        formIsento.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const id = document.getElementById('isento-id').value;
            const nome = document.getElementById('nome').value.trim();
            const documento = document.getElementById('documento').value.trim();
            const motivo = document.getElementById('motivo').value.trim();
            
            // Validar campos obrigatórios
            if (!nome || !documento || !motivo) {
                Utils.mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
                return;
            }
            
            // Preparar dados
            const dados = {
                nome,
                documento,
                motivo
            };
            
            // Mostrar carregamento
            Utils.mostrarCarregamento(modoEdicao ? 'Atualizando isento...' : 'Cadastrando isento...');
            
            // Cadastrar ou atualizar isento
            const promise = modoEdicao
                ? API.Isento.atualizar(id, dados)
                : API.Isento.cadastrar(dados);
            
            promise
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        Utils.mostrarNotificacao(
                            modoEdicao ? 'Isento atualizado com sucesso!' : 'Isento cadastrado com sucesso!',
                            'success'
                        );
                        
                        // Fechar modal
                        modalIsento.classList.remove('mostrar');
                        
                        // Recarregar isentos
                        carregarIsentos();
                    } else {
                        Utils.mostrarNotificacao(response.message || 'Erro ao processar isento', 'error');
                    }
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao processar isento: ' + error.message, 'error');
                });
        });
    }
    
    // Configurar formulário de veículo
    if (formVeiculo) {
        formVeiculo.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verificar se há um isento selecionado
            if (!isentoAtual) {
                Utils.mostrarNotificacao('Nenhum isento selecionado', 'error');
                return;
            }
            
            // Obter dados do formulário
            const placa = document.getElementById('placa').value.trim().toUpperCase();
            const modelo = document.getElementById('modelo').value.trim();
            const cor = document.getElementById('cor').value.trim();
            
            // Validar campos obrigatórios
            if (!placa || !modelo || !cor) {
                Utils.mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
                return;
            }
            
            // Preparar dados
            const dados = {
                placa,
                modelo,
                cor
            };
            
            // Mostrar carregamento
            Utils.mostrarCarregamento('Adicionando veículo...');
            
            // Adicionar veículo ao isento
            API.Isento.adicionarVeiculo(isentoAtual.id, dados)
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        Utils.mostrarNotificacao('Veículo adicionado com sucesso!', 'success');
                        
                        // Fechar modal
                        modalVeiculo.classList.remove('mostrar');
                        
                        // Limpar formulário
                        formVeiculo.reset();
                        
                        // Recarregar isentos
                        carregarIsentos();
                    } else {
                        Utils.mostrarNotificacao(response.message || 'Erro ao adicionar veículo', 'error');
                    }
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao adicionar veículo: ' + error.message, 'error');
                });
        });
    }
    
    // Função para carregar isentos
    function carregarIsentos() {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando isentos...');
        
        // Consultar isentos
        API.Isento.listar()
            .then(response => {
                Utils.esconderCarregamento();
                
                const isentos = response.data;
                
                if (isentos.length === 0) {
                    isentosContainer.innerHTML = `
                        <div class="alerta alerta-info">
                            <p>Não há isentos cadastrados.</p>
                        </div>
                    `;
                    return;
                }
                
                // Exibir isentos
                let html = '';
                
                isentos.forEach(isento => {
                    html += `
                        <div class="card">
                            <div class="card-header">
                                <h3>${isento.nome}</h3>
                                <span class="badge isento">${isento.motivo}</span>
                            </div>
                            <div class="card-body">
                                <p><strong>Documento:</strong> ${isento.documento}</p>
                                
                                <div class="secao-veiculos">
                                    <h4>Veículos</h4>
                                    <div class="lista-veiculos" id="veiculos-${isento.id}">
                                        ${carregarVeiculosIsento(isento)}
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary" onclick="editarIsento('${isento.id}')">Editar</button>
                                <button class="btn btn-secondary" onclick="adicionarVeiculo('${isento.id}')">Adicionar Veículo</button>
                                <button class="btn btn-danger" onclick="excluirIsento('${isento.id}')">Excluir</button>
                            </div>
                        </div>
                    `;
                });
                
                isentosContainer.innerHTML = html;
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar isentos: ' + error.message, 'error');
            });
    }
    
    // Função para carregar veículos de um isento
    function carregarVeiculosIsento(isento) {
        if (!isento.veiculos || isento.veiculos.length === 0) {
            return '<p>Nenhum veículo cadastrado.</p>';
        }
        
        let html = '<ul class="lista-veiculos-item">';
        
        isento.veiculos.forEach(veiculo => {
            html += `
                <li>
                    <span>${veiculo.placa} - ${veiculo.modelo} (${veiculo.cor})</span>
                    <button class="btn-icon" onclick="excluirVeiculo('${isento.id}', '${veiculo.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </li>
            `;
        });
        
        html += '</ul>';
        
        return html;
    }
    
    // Função global para editar isento
    window.editarIsento = function(id) {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando dados do isento...');
        
        // Consultar isento
        API.Isento.obter(id)
            .then(response => {
                Utils.esconderCarregamento();
                
                if (!response.data) {
                    Utils.mostrarNotificacao('Isento não encontrado', 'error');
                    return;
                }
                
                const isento = response.data;
                
                // Preencher formulário
                document.getElementById('isento-id').value = isento.id;
                document.getElementById('nome').value = isento.nome;
                document.getElementById('documento').value = isento.documento;
                document.getElementById('motivo').value = isento.motivo;
                
                // Definir modo de edição
                modoEdicao = true;
                document.getElementById('modal-titulo').textContent = 'Editar Isento';
                
                // Mostrar modal
                modalIsento.classList.add('mostrar');
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar isento: ' + error.message, 'error');
            });
    };
    
    // Função global para excluir isento
    window.excluirIsento = function(id) {
        // Confirmar exclusão
        Utils.confirmar('Tem certeza que deseja excluir este isento? Esta ação não pode ser desfeita.')
            .then(confirmado => {
                if (!confirmado) return;
                
                // Mostrar carregamento
                Utils.mostrarCarregamento('Excluindo isento...');
                
                // Excluir isento
                API.Isento.excluir(id)
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        if (response.success) {
                            Utils.mostrarNotificacao('Isento excluído com sucesso!', 'success');
                            
                            // Recarregar isentos
                            carregarIsentos();
                        } else {
                            Utils.mostrarNotificacao(response.message || 'Erro ao excluir isento', 'error');
                        }
                    })
                    .catch(error => {
                        Utils.esconderCarregamento();
                        Utils.mostrarNotificacao('Erro ao excluir isento: ' + error.message, 'error');
                    });
            });
    };
    
    // Função global para adicionar veículo
    window.adicionarVeiculo = function(isentoId) {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando dados do isento...');
        
        // Consultar isento
        API.Isento.obter(isentoId)
            .then(response => {
                Utils.esconderCarregamento();
                
                if (!response.data) {
                    Utils.mostrarNotificacao('Isento não encontrado', 'error');
                    return;
                }
                
                // Armazenar isento atual
                isentoAtual = response.data;
                
                // Limpar formulário
                formVeiculo.reset();
                
                // Atualizar título do modal
                document.getElementById('modal-veiculo-titulo').textContent = `Adicionar Veículo para ${isentoAtual.nome}`;
                
                // Mostrar modal
                modalVeiculo.classList.add('mostrar');
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar isento: ' + error.message, 'error');
            });
    };
    
    // Função global para excluir veículo
    window.excluirVeiculo = function(isentoId, veiculoId) {
        // Confirmar exclusão
        Utils.confirmar('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')
            .then(confirmado => {
                if (!confirmado) return;
                
                // Mostrar carregamento
                Utils.mostrarCarregamento('Excluindo veículo...');
                
                // Excluir veículo
                API.Isento.removerVeiculo(isentoId, veiculoId)
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        if (response.success) {
                            Utils.mostrarNotificacao('Veículo excluído com sucesso!', 'success');
                            
                            // Recarregar isentos
                            carregarIsentos();
                        } else {
                            Utils.mostrarNotificacao(response.message || 'Erro ao excluir veículo', 'error');
                        }
                    })
                    .catch(error => {
                        Utils.esconderCarregamento();
                        Utils.mostrarNotificacao('Erro ao excluir veículo: ' + error.message, 'error');
                    });
            });
    };
});
