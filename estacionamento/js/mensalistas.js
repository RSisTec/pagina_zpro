// Adaptação do arquivo mensalistas.js para usar a API PHP/PostgreSQL

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (!API.Auth.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Elementos da página
    const mensalistasContainer = document.getElementById('mensalistas-container');
    const btnNovoMensalista = document.getElementById('btn-novo-mensalista');
    const modalMensalista = document.getElementById('modal-mensalista');
    const formMensalista = document.getElementById('form-mensalista');
    const modalVeiculo = document.getElementById('modal-veiculo');
    const formVeiculo = document.getElementById('form-veiculo');
    
    // Variáveis globais
    let mensalistaAtual = null;
    let modoEdicao = false;
    
    // Carregar mensalistas
    carregarMensalistas();
    
    // Configurar botões de ação
    if (btnNovoMensalista) {
        btnNovoMensalista.addEventListener('click', function() {
            // Limpar formulário
            formMensalista.reset();
            document.getElementById('mensalista-id').value = '';
            
            // Definir modo de cadastro
            modoEdicao = false;
            document.getElementById('modal-titulo').textContent = 'Novo Mensalista';
            
            // Mostrar modal
            modalMensalista.classList.add('mostrar');
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
    
    // Configurar formulário de mensalista
    if (formMensalista) {
        formMensalista.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const id = document.getElementById('mensalista-id').value;
            const nome = document.getElementById('nome').value.trim();
            const documento = document.getElementById('documento').value.trim();
            const telefone = document.getElementById('telefone').value.trim();
            const email = document.getElementById('email').value.trim();
            const endereco = document.getElementById('endereco').value.trim();
            const plano = document.getElementById('plano').value;
            const dataInicio = document.getElementById('data-inicio').value;
            const dataFim = document.getElementById('data-fim').value;
            
            // Validar campos obrigatórios
            if (!nome || !documento || !telefone || !plano || !dataInicio || !dataFim) {
                Utils.mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
                return;
            }
            
            // Preparar dados
            const dados = {
                nome,
                documento,
                telefone,
                email,
                endereco,
                plano,
                dataInicio: new Date(dataInicio).getTime(),
                dataFim: new Date(dataFim).getTime()
            };
            
            // Mostrar carregamento
            Utils.mostrarCarregamento(modoEdicao ? 'Atualizando mensalista...' : 'Cadastrando mensalista...');
            
            // Cadastrar ou atualizar mensalista
            const promise = modoEdicao
                ? API.Mensalista.atualizar(id, dados)
                : API.Mensalista.cadastrar(dados);
            
            promise
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        Utils.mostrarNotificacao(
                            modoEdicao ? 'Mensalista atualizado com sucesso!' : 'Mensalista cadastrado com sucesso!',
                            'success'
                        );
                        
                        // Fechar modal
                        modalMensalista.classList.remove('mostrar');
                        
                        // Recarregar mensalistas
                        carregarMensalistas();
                    } else {
                        Utils.mostrarNotificacao(response.message || 'Erro ao processar mensalista', 'error');
                    }
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao processar mensalista: ' + error.message, 'error');
                });
        });
    }
    
    // Configurar formulário de veículo
    if (formVeiculo) {
        formVeiculo.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verificar se há um mensalista selecionado
            if (!mensalistaAtual) {
                Utils.mostrarNotificacao('Nenhum mensalista selecionado', 'error');
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
            
            // Adicionar veículo ao mensalista
            API.Mensalista.adicionarVeiculo(mensalistaAtual.id, dados)
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        Utils.mostrarNotificacao('Veículo adicionado com sucesso!', 'success');
                        
                        // Fechar modal
                        modalVeiculo.classList.remove('mostrar');
                        
                        // Limpar formulário
                        formVeiculo.reset();
                        
                        // Recarregar mensalistas
                        carregarMensalistas();
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
    
    // Função para carregar mensalistas
    function carregarMensalistas() {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando mensalistas...');
        
        // Consultar mensalistas
        API.Mensalista.listar()
            .then(response => {
                Utils.esconderCarregamento();
                
                const mensalistas = response.data;
                
                if (mensalistas.length === 0) {
                    mensalistasContainer.innerHTML = `
                        <div class="alerta alerta-info">
                            <p>Não há mensalistas cadastrados.</p>
                        </div>
                    `;
                    return;
                }
                
                // Exibir mensalistas
                let html = '';
                
                mensalistas.forEach(mensalista => {
                    // Determinar status
                    const dataFim = new Date(mensalista.data_fim);
                    const hoje = new Date();
                    const trintaDias = new Date();
                    trintaDias.setDate(hoje.getDate() + 30);
                    
                    let status = 'vigente';
                    let statusTexto = 'Vigente';
                    
                    if (dataFim < hoje) {
                        status = 'vencido';
                        statusTexto = 'Vencido';
                    } else if (dataFim <= trintaDias) {
                        status = 'vencendo';
                        statusTexto = 'Vencendo';
                    }
                    
                    // Formatar datas
                    const dataInicio = new Date(mensalista.data_inicio).toLocaleDateString('pt-BR');
                    const dataFimFormatada = dataFim.toLocaleDateString('pt-BR');
                    
                    html += `
                        <div class="card">
                            <div class="card-header">
                                <h3>${mensalista.nome}</h3>
                                <span class="badge ${status}">${statusTexto}</span>
                            </div>
                            <div class="card-body">
                                <p><strong>Documento:</strong> ${mensalista.documento}</p>
                                <p><strong>Telefone:</strong> ${mensalista.telefone}</p>
                                <p><strong>Email:</strong> ${mensalista.email || '-'}</p>
                                <p><strong>Plano:</strong> ${mensalista.plano}</p>
                                <p><strong>Período:</strong> ${dataInicio} a ${dataFimFormatada}</p>
                                
                                <div class="secao-veiculos">
                                    <h4>Veículos</h4>
                                    <div class="lista-veiculos" id="veiculos-${mensalista.id}">
                                        ${carregarVeiculosMensalista(mensalista)}
                                    </div>
                                </div>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary" onclick="editarMensalista('${mensalista.id}')">Editar</button>
                                <button class="btn btn-secondary" onclick="adicionarVeiculo('${mensalista.id}')">Adicionar Veículo</button>
                                <button class="btn btn-danger" onclick="excluirMensalista('${mensalista.id}')">Excluir</button>
                            </div>
                        </div>
                    `;
                });
                
                mensalistasContainer.innerHTML = html;
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar mensalistas: ' + error.message, 'error');
            });
    }
    
    // Função para carregar veículos de um mensalista
    function carregarVeiculosMensalista(mensalista) {
        if (!mensalista.veiculos || mensalista.veiculos.length === 0) {
            return '<p>Nenhum veículo cadastrado.</p>';
        }
        
        let html = '<ul class="lista-veiculos-item">';
        
        mensalista.veiculos.forEach(veiculo => {
            html += `
                <li>
                    <span>${veiculo.placa} - ${veiculo.modelo} (${veiculo.cor})</span>
                    <button class="btn-icon" onclick="excluirVeiculo('${mensalista.id}', '${veiculo.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </li>
            `;
        });
        
        html += '</ul>';
        
        return html;
    }
    
    // Função global para editar mensalista
    window.editarMensalista = function(id) {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando dados do mensalista...');
        
        // Consultar mensalista
        API.Mensalista.obter(id)
            .then(response => {
                Utils.esconderCarregamento();
                
                if (!response.data) {
                    Utils.mostrarNotificacao('Mensalista não encontrado', 'error');
                    return;
                }
                
                const mensalista = response.data;
                
                // Preencher formulário
                document.getElementById('mensalista-id').value = mensalista.id;
                document.getElementById('nome').value = mensalista.nome;
                document.getElementById('documento').value = mensalista.documento;
                document.getElementById('telefone').value = mensalista.telefone;
                document.getElementById('email').value = mensalista.email || '';
                document.getElementById('endereco').value = mensalista.endereco || '';
                document.getElementById('plano').value = mensalista.plano;
                
                // Formatar datas
                const dataInicio = new Date(mensalista.data_inicio);
                const dataFim = new Date(mensalista.data_fim);
                
                document.getElementById('data-inicio').value = dataInicio.toISOString().split('T')[0];
                document.getElementById('data-fim').value = dataFim.toISOString().split('T')[0];
                
                // Definir modo de edição
                modoEdicao = true;
                document.getElementById('modal-titulo').textContent = 'Editar Mensalista';
                
                // Mostrar modal
                modalMensalista.classList.add('mostrar');
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar mensalista: ' + error.message, 'error');
            });
    };
    
    // Função global para excluir mensalista
    window.excluirMensalista = function(id) {
        // Confirmar exclusão
        Utils.confirmar('Tem certeza que deseja excluir este mensalista? Esta ação não pode ser desfeita.')
            .then(confirmado => {
                if (!confirmado) return;
                
                // Mostrar carregamento
                Utils.mostrarCarregamento('Excluindo mensalista...');
                
                // Excluir mensalista
                API.Mensalista.excluir(id)
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        if (response.success) {
                            Utils.mostrarNotificacao('Mensalista excluído com sucesso!', 'success');
                            
                            // Recarregar mensalistas
                            carregarMensalistas();
                        } else {
                            Utils.mostrarNotificacao(response.message || 'Erro ao excluir mensalista', 'error');
                        }
                    })
                    .catch(error => {
                        Utils.esconderCarregamento();
                        Utils.mostrarNotificacao('Erro ao excluir mensalista: ' + error.message, 'error');
                    });
            });
    };
    
    // Função global para adicionar veículo
    window.adicionarVeiculo = function(mensalistaId) {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando dados do mensalista...');
        
        // Consultar mensalista
        API.Mensalista.obter(mensalistaId)
            .then(response => {
                Utils.esconderCarregamento();
                
                if (!response.data) {
                    Utils.mostrarNotificacao('Mensalista não encontrado', 'error');
                    return;
                }
                
                // Armazenar mensalista atual
                mensalistaAtual = response.data;
                
                // Limpar formulário
                formVeiculo.reset();
                
                // Atualizar título do modal
                document.getElementById('modal-veiculo-titulo').textContent = `Adicionar Veículo para ${mensalistaAtual.nome}`;
                
                // Mostrar modal
                modalVeiculo.classList.add('mostrar');
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar mensalista: ' + error.message, 'error');
            });
    };
    
    // Função global para excluir veículo
    window.excluirVeiculo = function(mensalistaId, veiculoId) {
        // Confirmar exclusão
        Utils.confirmar('Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.')
            .then(confirmado => {
                if (!confirmado) return;
                
                // Mostrar carregamento
                Utils.mostrarCarregamento('Excluindo veículo...');
                
                // Excluir veículo
                API.Mensalista.removerVeiculo(mensalistaId, veiculoId)
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        if (response.success) {
                            Utils.mostrarNotificacao('Veículo excluído com sucesso!', 'success');
                            
                            // Recarregar mensalistas
                            carregarMensalistas();
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
