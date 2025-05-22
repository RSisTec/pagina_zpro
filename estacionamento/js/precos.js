// Adaptação do arquivo precos.js para usar a API PHP/PostgreSQL

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticação
    if (!API.Auth.isAuthenticated()) {
        window.location.href = '/pages/login.html';
        return;
    }

    // Verificar permissões
    const user = API.Auth.getCurrentUser();
    if (user && user.nivel === 'visualizador') {
        window.location.href = '/pages/admin.html';
        return;
    }

    // Elementos da página
    const precosContainer = document.getElementById('precos-container');
    const btnNovoPreco = document.getElementById('btn-novo-preco');
    const modalPreco = document.getElementById('modal-preco');
    const formPreco = document.getElementById('form-preco');
    
    // Variáveis globais
    let modoEdicao = false;
    
    // Carregar tabelas de preços
    carregarPrecos();
    
    // Configurar botões de ação
    if (btnNovoPreco) {
        btnNovoPreco.addEventListener('click', function() {
            // Limpar formulário
            formPreco.reset();
            document.getElementById('preco-id').value = '';
            
            // Definir modo de cadastro
            modoEdicao = false;
            document.getElementById('modal-titulo').textContent = 'Nova Tabela de Preços';
            
            // Mostrar modal
            modalPreco.classList.add('mostrar');
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
    
    // Configurar formulário de preço
    if (formPreco) {
        formPreco.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Obter dados do formulário
            const id = document.getElementById('preco-id').value;
            const nome = document.getElementById('nome').value.trim();
            const descricao = document.getElementById('descricao').value.trim();
            const valorPrimeiraHora = document.getElementById('valor-primeira-hora').value.trim();
            const valorHoraAdicional = document.getElementById('valor-hora-adicional').value.trim();
            const valorDiaria = document.getElementById('valor-diaria').value.trim();
            const valorMensalidade = document.getElementById('valor-mensalidade').value.trim();
            
            // Validar campos obrigatórios
            if (!nome || !valorPrimeiraHora || !valorHoraAdicional || !valorDiaria || !valorMensalidade) {
                Utils.mostrarNotificacao('Por favor, preencha todos os campos obrigatórios', 'error');
                return;
            }
            
            // Preparar dados
            const dados = {
                nome,
                descricao,
                valorPrimeiraHora: parseFloat(valorPrimeiraHora.replace(',', '.')),
                valorHoraAdicional: parseFloat(valorHoraAdicional.replace(',', '.')),
                valorDiaria: parseFloat(valorDiaria.replace(',', '.')),
                valorMensalidade: parseFloat(valorMensalidade.replace(',', '.'))
            };
            
            // Mostrar carregamento
            Utils.mostrarCarregamento(modoEdicao ? 'Atualizando tabela de preços...' : 'Cadastrando tabela de preços...');
            
            // Cadastrar ou atualizar tabela de preços
            const promise = modoEdicao
                ? API.Preco.atualizar(id, dados)
                : API.Preco.cadastrar(dados);
            
            promise
                .then(response => {
                    Utils.esconderCarregamento();
                    
                    if (response.success) {
                        Utils.mostrarNotificacao(
                            modoEdicao ? 'Tabela de preços atualizada com sucesso!' : 'Tabela de preços cadastrada com sucesso!',
                            'success'
                        );
                        
                        // Fechar modal
                        modalPreco.classList.remove('mostrar');
                        
                        // Recarregar tabelas de preços
                        carregarPrecos();
                    } else {
                        Utils.mostrarNotificacao(response.message || 'Erro ao processar tabela de preços', 'error');
                    }
                })
                .catch(error => {
                    Utils.esconderCarregamento();
                    Utils.mostrarNotificacao('Erro ao processar tabela de preços: ' + error.message, 'error');
                });
        });
    }
    
    // Função para carregar tabelas de preços
    function carregarPrecos() {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando tabelas de preços...');
        
        // Consultar tabelas de preços
        API.Preco.listar()
            .then(response => {
                Utils.esconderCarregamento();
                
                const precos = response.data;
                
                if (precos.length === 0) {
                    precosContainer.innerHTML = `
                        <div class="alerta alerta-info">
                            <p>Não há tabelas de preços cadastradas.</p>
                        </div>
                    `;
                    return;
                }
                
                // Exibir tabelas de preços
                let html = '';
                
                precos.forEach(preco => {
                    html += `
                        <div class="card ${preco.ativo ? 'ativo' : ''}">
                            <div class="card-header">
                                <h3>${preco.nome}</h3>
                                <span class="badge ${preco.ativo ? 'ativo' : 'inativo'}">${preco.ativo ? 'Ativa' : 'Inativa'}</span>
                            </div>
                            <div class="card-body">
                                <p><strong>Descrição:</strong> ${preco.descricao || '-'}</p>
                                <p><strong>Primeira hora:</strong> ${Utils.formatarValor(preco.valor_primeira_hora)}</p>
                                <p><strong>Hora adicional:</strong> ${Utils.formatarValor(preco.valor_hora_adicional)}</p>
                                <p><strong>Diária:</strong> ${Utils.formatarValor(preco.valor_diaria)}</p>
                                <p><strong>Mensalidade:</strong> ${Utils.formatarValor(preco.valor_mensalidade)}</p>
                            </div>
                            <div class="card-footer">
                                <button class="btn btn-primary" onclick="editarPreco('${preco.id}')">Editar</button>
                                ${!preco.ativo ? `<button class="btn btn-success" onclick="ativarPreco('${preco.id}')">Ativar</button>` : ''}
                                ${!preco.ativo ? `<button class="btn btn-danger" onclick="excluirPreco('${preco.id}')">Excluir</button>` : ''}
                            </div>
                        </div>
                    `;
                });
                
                precosContainer.innerHTML = html;
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar tabelas de preços: ' + error.message, 'error');
            });
    }
    
    // Função global para editar tabela de preços
    window.editarPreco = function(id) {
        // Mostrar carregamento
        Utils.mostrarCarregamento('Carregando dados da tabela de preços...');
        
        // Consultar tabela de preços
        API.Preco.obter(id)
            .then(response => {
                Utils.esconderCarregamento();
                
                if (!response.data) {
                    Utils.mostrarNotificacao('Tabela de preços não encontrada', 'error');
                    return;
                }
                
                const preco = response.data;
                
                // Preencher formulário
                document.getElementById('preco-id').value = preco.id;
                document.getElementById('nome').value = preco.nome;
                document.getElementById('descricao').value = preco.descricao || '';
                document.getElementById('valor-primeira-hora').value = preco.valor_primeira_hora.toString().replace('.', ',');
                document.getElementById('valor-hora-adicional').value = preco.valor_hora_adicional.toString().replace('.', ',');
                document.getElementById('valor-diaria').value = preco.valor_diaria.toString().replace('.', ',');
                document.getElementById('valor-mensalidade').value = preco.valor_mensalidade.toString().replace('.', ',');
                
                // Definir modo de edição
                modoEdicao = true;
                document.getElementById('modal-titulo').textContent = 'Editar Tabela de Preços';
                
                // Mostrar modal
                modalPreco.classList.add('mostrar');
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao carregar tabela de preços: ' + error.message, 'error');
            });
    };
    
    // Função global para ativar tabela de preços
    window.ativarPreco = function(id) {
        // Confirmar ativação
        Utils.confirmar('Tem certeza que deseja ativar esta tabela de preços? A tabela atualmente ativa será desativada.')
            .then(confirmado => {
                if (!confirmado) return;
                
                // Mostrar carregamento
                Utils.mostrarCarregamento('Ativando tabela de preços...');
                
                // Ativar tabela de preços
                API.Preco.ativar(id)
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        if (response.success) {
                            Utils.mostrarNotificacao('Tabela de preços ativada com sucesso!', 'success');
                            
                            // Recarregar tabelas de preços
                            carregarPrecos();
                        } else {
                            Utils.mostrarNotificacao(response.message || 'Erro ao ativar tabela de preços', 'error');
                        }
                    })
                    .catch(error => {
                        Utils.esconderCarregamento();
                        Utils.mostrarNotificacao('Erro ao ativar tabela de preços: ' + error.message, 'error');
                    });
            });
    };
    
    // Função global para excluir tabela de preços
    window.excluirPreco = function(id) {
        // Confirmar exclusão
        Utils.confirmar('Tem certeza que deseja excluir esta tabela de preços? Esta ação não pode ser desfeita.')
            .then(confirmado => {
                if (!confirmado) return;
                
                // Mostrar carregamento
                Utils.mostrarCarregamento('Excluindo tabela de preços...');
                
                // Excluir tabela de preços
                API.Preco.excluir(id)
                    .then(response => {
                        Utils.esconderCarregamento();
                        
                        if (response.success) {
                            Utils.mostrarNotificacao('Tabela de preços excluída com sucesso!', 'success');
                            
                            // Recarregar tabelas de preços
                            carregarPrecos();
                        } else {
                            Utils.mostrarNotificacao(response.message || 'Erro ao excluir tabela de preços', 'error');
                        }
                    })
                    .catch(error => {
                        Utils.esconderCarregamento();
                        Utils.mostrarNotificacao('Erro ao excluir tabela de preços: ' + error.message, 'error');
                    });
            });
    };
});
