// Adaptação do arquivo servicos.js para usar a API PHP/PostgreSQL

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (!API.Auth.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Elementos da página
    const servicosContainer = document.getElementById('servicos-container');
    const btnNovoServico = document.getElementById('btn-novo-servico');
    const modalServico = document.getElementById('modal-servico');
    const formServico = document.getElementById('form-servico');
    
    // Verificar se estamos na página de serviços para veículo específico
    const urlParams = new URLSearchParams(window.location.search);
    const veiculoId = urlParams.get('veiculo');
    
    // Variáveis globais
    let modoEdicao = false;
    let veiculoAtual = null;
    
    // Se tiver ID de veículo, carregar dados do veículo
    if (veiculoId) {
        carregarVeiculo(veiculoId);
        document.getElementById('titulo-pagina').textContent = 'Serviços para Veículo';
        document.getElementById('container-servicos-veiculo').style.display = 'block';
        document.getElementById('container-servicos-cadastrados').style.display = 'none';
    } else {
        // Carregar serviços cadastrados
        carregarServicos();
    }
    
    // Configurar botões de ação
    if (btnNovoServico) {
        btnNovoServico.addEventListener('click', function() {
            // Limpar formulário
            formServico.reset();
            document.getElementById('servico-id').value = '';
            
            // Definir modo de cadastro
            modoEdicao = false;
            document.getElementById('modal-titulo').textContent = 'Novo Serviço';
            
            // Mostrar modal
            modalServico.classList.add('mostrar');
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
    
    // Configurar formulário de serviço
    if (formServico) {
        formServico.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const id = document.getElementById('servico-id').value;
            const nome = document.getElementById('nome').value.trim();
            const descricao = document.getElementById('descricao').value.trim();
            const valor = document.getElementById('valor').value.trim();
            const ativo = document.getElementById('ativo').checked;
            
            // Validar campos obrigatórios
            if (!nome || !valor) {
                Utils.mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
                return;
            }
            
            // Preparar dados
            const dados = {
                nome,
                descricao,
                valor: parseFloat(valor.replace(',', '.')),
                ativo
            };
            
            // Mostrar carregamento
            Utils.mostrarCarregamento(modoEdicao ? 'Atualizando serviço...' : 'Cadastrando serviço...');
            
            // Cadastrar ou atualizar serviço
            const promise = modoEdicao
                ? API.Servico.atualizar(id, dados)
                : API.Servico.cadastrar(dados);
            
            promise
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        Utils.mostrarNotificacao(
                            modoEdicao ? 'Serviço atualizado com sucesso!' : 'Serviço cadastrado com sucesso!',
                            'success'
                        );
                        
                        // Fechar modal
                        modalServico.classList.remove('mostrar');
                        
                        // Recarregar serviços
                        carregarServicos();
                    } else {
                        Utils.mostrarNotificacao(response.message || 'Erro ao processar serviço', 'error');
                    }
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao processar serviço: ' + error.message, 'error');
                });
        });
    }
    
    // Configurar formulário de adição de serviço a veículo
    const formAdicionarServico = document.getElementById('form-adicionar-servico');
    if (formAdicionarServico) {
        formAdicionarServico.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Verificar se há um veículo selecionado
            if (!veiculoAtual) {
                Utils.mostrarNotificacao('Nenhum veículo selecionado', 'error');
                return;
            }
            
            // Obter serviço selecionado
            const servicoId = document.getElementById('servico-selecionado').value;
            
            if (!servicoId) {
                Utils.mostrarNotificacao('Por favor, selecione um serviço', 'error');
                return;
            }
            
            // Mostrar carregamento
            Utils.mostrarCarregamento('Adicionando serviço ao veículo...');
            
            // Adicionar serviço ao veículo
            API.Servico.adicionarAoVeiculo(veiculoAtual.id, servicoId)
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        Utils.mostrarNotificacao('Serviço adicionado com sucesso!', 'success');
                        
                        // Recarregar veículo
                        carregarVeiculo(veiculoAtual.id);
                    } else {
                        Utils.mostrarNotificacao(response.message || 'Erro ao adicionar serviço', 'error');
                    }
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao adicionar serviço: ' + error.message, 'error');
                });
        });
    }
    
    // Função para carregar serviços
    function carregarServicos() {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando serviços...');
        
        // Consultar serviços
        API.Servico.listar()
            .then(response => {
                Utils.esconderCarregamento();
                
                const servicos = response.data;
                
                if (servicos.length === 0) {
                    servicosContainer.innerHTML = `
                        <div class="alerta alerta-info">
                            <p>Não há serviços cadastrados.</p>
                        </div>
                    `;
                    return;
                }
                
                // Exibir serviços
                let html = '';
                
                servicos.forEach(servico => {
                    html += `
                        <div class="card">
                            <div class="card-header">
                                <h3>${servico.nome}</h3>
                                <span class="badge ${servico.ativo ? 'ativo' : 'inativo'}">${servico.ativo ? 'Ativo' : 'Inativo'}</span>
                            </div>
                            <div class="card-body">
                                <p><strong>Descrição:</strong> ${servico.descricao || '-'}</p>
                                <p><strong>Valor:</strong> ${Utils.formatarValor(servico.valor)}</p>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary" onclick="editarServico('${servico.id}')">Editar</button>
                                <button class="btn btn-danger" onclick="excluirServico('${servico.id}')">Excluir</button>
                            </div>
                        </div>
                    `;
                });
                
                servicosContainer.innerHTML = html;
                
                // Se estiver na página de adicionar serviço a veículo, preencher select
                if (veiculoId) {
                    const selectServico = document.getElementById('servico-selecionado');
                    
                    if (selectServico) {
                        // Limpar select
                        selectServico.innerHTML = '<option value="">Selecione um serviço</option>';
                        
                        // Preencher select apenas com serviços ativos
                        servicos.filter(s => s.ativo).forEach(servico => {
                            const option = document.createElement('option');
                            option.value = servico.id;
                            option.textContent = `${servico.nome} - ${Utils.formatarValor(servico.valor)}`;
                            selectServico.appendChild(option);
                        });
                    }
                }
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar serviços: ' + error.message, 'error');
            });
    }
    
    // Função para carregar veículo
    function carregarVeiculo(id) {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando dados do veículo...');
        
        // Consultar veículo
        API.Veiculo.obter(id)
            .then(response => {
                Utils.esconderCarregamento();
                
                if (!response.data) {
                    Utils.mostrarNotificacao('Veículo não encontrado', 'error');
                    return;
                }
                
                // Armazenar veículo atual
                veiculoAtual = response.data;
                
                // Preencher dados do veículo
                document.getElementById('veiculo-placa').textContent = veiculoAtual.placa;
                document.getElementById('veiculo-modelo').textContent = veiculoAtual.modelo;
                document.getElementById('veiculo-cor').textContent = veiculoAtual.cor;
                document.getElementById('veiculo-entrada').textContent = Utils.formatarData(veiculoAtual.entrada);
                
                // Calcular tempo de permanência
                const entrada = new Date(veiculoAtual.entrada);
                const agora = new Date();
                const permanencia = agora - entrada;
                document.getElementById('veiculo-permanencia').textContent = Utils.formatarTempoPermanencia(permanencia);
                
                // Carregar serviços do veículo
                const servicosVeiculoContainer = document.getElementById('servicos-veiculo');
                
                if (!veiculoAtual.servicos || veiculoAtual.servicos.length === 0) {
                    servicosVeiculoContainer.innerHTML = `
                        <div class="alerta alerta-info">
                            <p>Nenhum serviço adicionado a este veículo.</p>
                        </div>
                    `;
                } else {
                    let html = '';
                    let valorTotal = 0;
                    
                    veiculoAtual.servicos.forEach(servico => {
                        valorTotal += servico.valor;
                        
                        html += `
                            <div class="card">
                                <div class="card-header">
                                    <h3>${servico.nome_servico}</h3>
                                </div>
                                <div class="card-body">
                                    <p><strong>Valor:</strong> ${Utils.formatarValor(servico.valor)}</p>
                                    <p><strong>Data de adição:</strong> ${Utils.formatarData(servico.data_adicao)}</p>
                                </div>
                                <div class="card-footer">
                                    <button class="btn btn-danger" onclick="removerServico('${veiculoAtual.id}', '${servico.id}')">Remover</button>
                                </div>
                            </div>
                        `;
                    });
                    
                    // Adicionar card de valor total
                    html += `
                        <div class="card valor-total">
                            <div class="card-header">
                                <h3>Valor Total</h3>
                            </div>
                            <div class="card-body">
                                <p class="valor-destaque">${Utils.formatarValor(valorTotal)}</p>
                            </div>
                        </div>
                    `;
                    
                    servicosVeiculoContainer.innerHTML = html;
                }
                
                // Carregar serviços disponíveis
                carregarServicos();
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar veículo: ' + error.message, 'error');
            });
    }
    
    // Função global para editar serviço
    window.editarServico = function(id) {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando dados do serviço...');
        
        // Consultar serviço
        API.Servico.obter(id)
            .then(response => {
                Utils.esconderCarregamento();
                
                if (!response.data) {
                    Utils.mostrarNotificacao('Serviço não encontrado', 'error');
                    return;
                }
                
                const servico = response.data;
                
                // Preencher formulário
                document.getElementById('servico-id').value = servico.id;
                document.getElementById('nome').value = servico.nome;
                document.getElementById('descricao').value = servico.descricao || '';
                document.getElementById('valor').value = servico.valor.toString().replace('.', ',');
                document.getElementById('ativo').checked = servico.ativo;
                
                // Definir modo de edição
                modoEdicao = true;
                document.getElementById('modal-titulo').textContent = 'Editar Serviço';
                
                // Mostrar modal
                modalServico.classList.add('mostrar');
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar serviço: ' + error.message, 'error');
            });
    };
    
    // Função global para excluir serviço
    window.excluirServico = function(id) {
        // Confirmar exclusão
        Utils.confirmar('Tem certeza que deseja excluir este serviço? Esta ação não pode ser desfeita.')
            .then(confirmado => {
                if (!confirmado) return;
                
                // Mostrar carregamento
                Utils.mostrarCarregamento('Excluindo serviço...');
                
                // Excluir serviço
                API.Servico.excluir(id)
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        if (response.success) {
                            Utils.mostrarNotificacao('Serviço excluído com sucesso!', 'success');
                            
                            // Recarregar serviços
                            carregarServicos();
                        } else {
                            Utils.mostrarNotificacao(response.message || 'Erro ao excluir serviço', 'error');
                        }
                    })
                    .catch(error => {
                        Utils.esconderCarregamento();
                        Utils.mostrarNotificacao('Erro ao excluir serviço: ' + error.message, 'error');
                    });
            });
    };
    
    // Função global para remover serviço de veículo
    window.removerServico = function(veiculoId, servicoRealizadoId) {
        // Confirmar remoção
        Utils.confirmar('Tem certeza que deseja remover este serviço do veículo? Esta ação não pode ser desfeita.')
            .then(confirmado => {
                if (!confirmado) return;
                
                // Mostrar carregamento
                Utils.mostrarCarregamento('Removendo serviço...');
                
                // Remover serviço do veículo
                API.Servico.removerDoVeiculo(veiculoId, servicoRealizadoId)
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        if (response.success) {
                            Utils.mostrarNotificacao('Serviço removido com sucesso!', 'success');
                            
                            // Recarregar veículo
                            carregarVeiculo(veiculoId);
                        } else {
                            Utils.mostrarNotificacao(response.message || 'Erro ao remover serviço', 'error');
                        }
                    })
                    .catch(error => {
                        Utils.esconderCarregamento();
                        Utils.mostrarNotificacao('Erro ao remover serviço: ' + error.message, 'error');
                    });
            });
    };
    
    // Botão para voltar à página de administração
    const btnVoltar = document.getElementById('btn-voltar');
    if (btnVoltar) {
        btnVoltar.addEventListener('click', function() {
            window.location.href = '/pages/admin.html';
        });
    }
});
