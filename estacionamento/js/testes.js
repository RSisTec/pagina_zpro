// Arquivo de testes para validação da integração frontend-backend

document.addEventListener('DOMContentLoaded', function() {
    // Verificar se estamos na página de testes
    if (!window.location.pathname.includes('testes.html')) {
        return;
    }

    // Elementos da página
    const resultadosTestes = document.getElementById('resultados-testes');
    const btnIniciarTestes = document.getElementById('btn-iniciar-testes');
    
    // Configurar botão de iniciar testes
    if (btnIniciarTestes) {
        btnIniciarTestes.addEventListener('click', function() {
            iniciarTestes();
        });
    }
    
    // Função para iniciar testes
    function iniciarTestes() {
        // Limpar resultados anteriores
        resultadosTestes.innerHTML = '';
        
        // Mostrar carregamento
        Utils.mostrarCarregamento('Iniciando testes de integração...');
        
        // Array para armazenar resultados dos testes
        const resultados = [];
        
        // Executar testes em sequência
        Promise.resolve()
            // Teste de conexão com a API
            .then(() => testarConexaoAPI())
            .then(resultado => {
                resultados.push(resultado);
                return testarAutenticacao();
            })
            .then(resultado => {
                resultados.push(resultado);
                return testarCRUDVeiculos();
            })
            .then(resultado => {
                resultados.push(resultado);
                return testarCRUDMensalistas();
            })
            .then(resultado => {
                resultados.push(resultado);
                return testarCRUDIsentos();
            })
            .then(resultado => {
                resultados.push(resultado);
                return testarCRUDServicos();
            })
            .then(resultado => {
                resultados.push(resultado);
                return testarCRUDPrecos();
            })
            .then(resultado => {
                resultados.push(resultado);
                return testarRelatorios();
            })
            .then(resultado => {
                resultados.push(resultado);
                return testarCRUDUsuarios();
            })
            .then(resultado => {
                resultados.push(resultado);
                
                // Esconder carregamento
                Utils.esconderCarregamento();
                
                // Exibir resultados
                exibirResultadosTestes(resultados);
            })
            .catch(error => {
                Utils.esconderCarregamento();
                Utils.mostrarNotificacao('Erro ao executar testes: ' + error.message, 'error');
            });
    }
    
    // Função para testar conexão com a API
    function testarConexaoAPI() {
        return new Promise((resolve) => {
            console.log('Testando conexão com a API...');
            
            // Testar conexão com a API
            fetch('/api/ping')
                .then(response => response.json())
                .then(data => {
                    resolve({
                        nome: 'Conexão com a API',
                        sucesso: data.success === true,
                        mensagem: data.success ? 'Conexão estabelecida com sucesso' : 'Falha na conexão com a API'
                    });
                })
                .catch(error => {
                    resolve({
                        nome: 'Conexão com a API',
                        sucesso: false,
                        mensagem: 'Erro ao conectar com a API: ' + error.message
                    });
                });
        });
    }
    
    // Função para testar autenticação
    function testarAutenticacao() {
        return new Promise((resolve) => {
            console.log('Testando autenticação...');
            
            // Testar login com credenciais válidas
            API.Auth.login('admin', 'admin123')
                .then(response => {
                    const loginValido = response.success === true;
                    
                    // Se login falhou, retornar resultado
                    if (!loginValido) {
                        resolve({
                            nome: 'Autenticação',
                            sucesso: false,
                            mensagem: 'Falha no login com credenciais válidas'
                        });
                        return;
                    }
                    
                    // Verificar se token foi armazenado
                    const tokenArmazenado = API.Auth.isAuthenticated();
                    
                    // Testar logout
                    API.Auth.logout();
                    
                    // Verificar se token foi removido
                    const tokenRemovido = !API.Auth.isAuthenticated();
                    
                    resolve({
                        nome: 'Autenticação',
                        sucesso: loginValido && tokenArmazenado && tokenRemovido,
                        mensagem: loginValido && tokenArmazenado && tokenRemovido
                            ? 'Login, armazenamento de token e logout funcionando corretamente'
                            : 'Falha em alguma etapa da autenticação'
                    });
                })
                .catch(error => {
                    resolve({
                        nome: 'Autenticação',
                        sucesso: false,
                        mensagem: 'Erro ao testar autenticação: ' + error.message
                    });
                });
        });
    }
    
    // Função para testar CRUD de veículos
    function testarCRUDVeiculos() {
        return new Promise((resolve) => {
            console.log('Testando CRUD de veículos...');
            
            // Fazer login para obter token
            API.Auth.login('admin', 'admin123')
                .then(response => {
                    if (!response.success) {
                        resolve({
                            nome: 'CRUD de Veículos',
                            sucesso: false,
                            mensagem: 'Falha no login para testar veículos'
                        });
                        return;
                    }
                    
                    // Dados para teste
                    const veiculo = {
                        placa: 'TST' + Math.floor(Math.random() * 9000 + 1000),
                        modelo: 'Modelo Teste',
                        cor: 'Cor Teste',
                        tipo_cliente: 'normal',
                        telefone: '11999999999',
                        ticket: 'T' + Math.floor(Math.random() * 90000 + 10000)
                    };
                    
                    // Registrar entrada
                    API.Veiculo.registrarEntrada(veiculo)
                        .then(responseEntrada => {
                            if (!responseEntrada.success || !responseEntrada.data || !responseEntrada.data.id) {
                                resolve({
                                    nome: 'CRUD de Veículos',
                                    sucesso: false,
                                    mensagem: 'Falha ao registrar entrada de veículo'
                                });
                                return;
                            }
                            
                            const veiculoId = responseEntrada.data.id;
                            
                            // Consultar veículo
                            API.Veiculo.obter(veiculoId)
                                .then(responseConsulta => {
                                    if (!responseConsulta.success || !responseConsulta.data) {
                                        resolve({
                                            nome: 'CRUD de Veículos',
                                            sucesso: false,
                                            mensagem: 'Falha ao consultar veículo cadastrado'
                                        });
                                        return;
                                    }
                                    
                                    // Registrar saída
                                    API.Veiculo.registrarSaida(veiculoId, {
                                        forma_pagamento: 'dinheiro',
                                        valor_total: 10.0
                                    })
                                        .then(responseSaida => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Veículos',
                                                sucesso: responseSaida.success === true,
                                                mensagem: responseSaida.success
                                                    ? 'Operações de veículos funcionando corretamente'
                                                    : 'Falha ao registrar saída de veículo'
                                            });
                                        })
                                        .catch(error => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Veículos',
                                                sucesso: false,
                                                mensagem: 'Erro ao registrar saída: ' + error.message
                                            });
                                        });
                                })
                                .catch(error => {
                                    // Logout
                                    API.Auth.logout();
                                    
                                    resolve({
                                        nome: 'CRUD de Veículos',
                                        sucesso: false,
                                        mensagem: 'Erro ao consultar veículo: ' + error.message
                                    });
                                });
                        })
                        .catch(error => {
                            // Logout
                            API.Auth.logout();
                            
                            resolve({
                                nome: 'CRUD de Veículos',
                                sucesso: false,
                                mensagem: 'Erro ao registrar entrada: ' + error.message
                            });
                        });
                })
                .catch(error => {
                    resolve({
                        nome: 'CRUD de Veículos',
                        sucesso: false,
                        mensagem: 'Erro ao fazer login: ' + error.message
                    });
                });
        });
    }
    
    // Função para testar CRUD de mensalistas
    function testarCRUDMensalistas() {
        return new Promise((resolve) => {
            console.log('Testando CRUD de mensalistas...');
            
            // Fazer login para obter token
            API.Auth.login('admin', 'admin123')
                .then(response => {
                    if (!response.success) {
                        resolve({
                            nome: 'CRUD de Mensalistas',
                            sucesso: false,
                            mensagem: 'Falha no login para testar mensalistas'
                        });
                        return;
                    }
                    
                    // Dados para teste
                    const mensalista = {
                        nome: 'Mensalista Teste',
                        documento: 'DOC' + Math.floor(Math.random() * 9000 + 1000),
                        telefone: '11999999999',
                        email: 'teste@teste.com',
                        plano: 'Mensal',
                        dataInicio: new Date().getTime(),
                        dataFim: new Date(new Date().setMonth(new Date().getMonth() + 1)).getTime()
                    };
                    
                    // Cadastrar mensalista
                    API.Mensalista.cadastrar(mensalista)
                        .then(responseCadastro => {
                            if (!responseCadastro.success || !responseCadastro.data || !responseCadastro.data.id) {
                                resolve({
                                    nome: 'CRUD de Mensalistas',
                                    sucesso: false,
                                    mensagem: 'Falha ao cadastrar mensalista'
                                });
                                return;
                            }
                            
                            const mensalistaId = responseCadastro.data.id;
                            
                            // Atualizar mensalista
                            API.Mensalista.atualizar(mensalistaId, {
                                ...mensalista,
                                nome: 'Mensalista Atualizado'
                            })
                                .then(responseAtualizacao => {
                                    if (!responseAtualizacao.success) {
                                        resolve({
                                            nome: 'CRUD de Mensalistas',
                                            sucesso: false,
                                            mensagem: 'Falha ao atualizar mensalista'
                                        });
                                        return;
                                    }
                                    
                                    // Excluir mensalista
                                    API.Mensalista.excluir(mensalistaId)
                                        .then(responseExclusao => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Mensalistas',
                                                sucesso: responseExclusao.success === true,
                                                mensagem: responseExclusao.success
                                                    ? 'Operações de mensalistas funcionando corretamente'
                                                    : 'Falha ao excluir mensalista'
                                            });
                                        })
                                        .catch(error => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Mensalistas',
                                                sucesso: false,
                                                mensagem: 'Erro ao excluir mensalista: ' + error.message
                                            });
                                        });
                                })
                                .catch(error => {
                                    // Logout
                                    API.Auth.logout();
                                    
                                    resolve({
                                        nome: 'CRUD de Mensalistas',
                                        sucesso: false,
                                        mensagem: 'Erro ao atualizar mensalista: ' + error.message
                                    });
                                });
                        })
                        .catch(error => {
                            // Logout
                            API.Auth.logout();
                            
                            resolve({
                                nome: 'CRUD de Mensalistas',
                                sucesso: false,
                                mensagem: 'Erro ao cadastrar mensalista: ' + error.message
                            });
                        });
                })
                .catch(error => {
                    resolve({
                        nome: 'CRUD de Mensalistas',
                        sucesso: false,
                        mensagem: 'Erro ao fazer login: ' + error.message
                    });
                });
        });
    }
    
    // Função para testar CRUD de isentos
    function testarCRUDIsentos() {
        return new Promise((resolve) => {
            console.log('Testando CRUD de isentos...');
            
            // Fazer login para obter token
            API.Auth.login('admin', 'admin123')
                .then(response => {
                    if (!response.success) {
                        resolve({
                            nome: 'CRUD de Isentos',
                            sucesso: false,
                            mensagem: 'Falha no login para testar isentos'
                        });
                        return;
                    }
                    
                    // Dados para teste
                    const isento = {
                        nome: 'Isento Teste',
                        documento: 'DOC' + Math.floor(Math.random() * 9000 + 1000),
                        motivo: 'Motivo Teste'
                    };
                    
                    // Cadastrar isento
                    API.Isento.cadastrar(isento)
                        .then(responseCadastro => {
                            if (!responseCadastro.success || !responseCadastro.data || !responseCadastro.data.id) {
                                resolve({
                                    nome: 'CRUD de Isentos',
                                    sucesso: false,
                                    mensagem: 'Falha ao cadastrar isento'
                                });
                                return;
                            }
                            
                            const isentoId = responseCadastro.data.id;
                            
                            // Atualizar isento
                            API.Isento.atualizar(isentoId, {
                                ...isento,
                                nome: 'Isento Atualizado'
                            })
                                .then(responseAtualizacao => {
                                    if (!responseAtualizacao.success) {
                                        resolve({
                                            nome: 'CRUD de Isentos',
                                            sucesso: false,
                                            mensagem: 'Falha ao atualizar isento'
                                        });
                                        return;
                                    }
                                    
                                    // Excluir isento
                                    API.Isento.excluir(isentoId)
                                        .then(responseExclusao => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Isentos',
                                                sucesso: responseExclusao.success === true,
                                                mensagem: responseExclusao.success
                                                    ? 'Operações de isentos funcionando corretamente'
                                                    : 'Falha ao excluir isento'
                                            });
                                        })
                                        .catch(error => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Isentos',
                                                sucesso: false,
                                                mensagem: 'Erro ao excluir isento: ' + error.message
                                            });
                                        });
                                })
                                .catch(error => {
                                    // Logout
                                    API.Auth.logout();
                                    
                                    resolve({
                                        nome: 'CRUD de Isentos',
                                        sucesso: false,
                                        mensagem: 'Erro ao atualizar isento: ' + error.message
                                    });
                                });
                        })
                        .catch(error => {
                            // Logout
                            API.Auth.logout();
                            
                            resolve({
                                nome: 'CRUD de Isentos',
                                sucesso: false,
                                mensagem: 'Erro ao cadastrar isento: ' + error.message
                            });
                        });
                })
                .catch(error => {
                    resolve({
                        nome: 'CRUD de Isentos',
                        sucesso: false,
                        mensagem: 'Erro ao fazer login: ' + error.message
                    });
                });
        });
    }
    
    // Função para testar CRUD de serviços
    function testarCRUDServicos() {
        return new Promise((resolve) => {
            console.log('Testando CRUD de serviços...');
            
            // Fazer login para obter token
            API.Auth.login('admin', 'admin123')
                .then(response => {
                    if (!response.success) {
                        resolve({
                            nome: 'CRUD de Serviços',
                            sucesso: false,
                            mensagem: 'Falha no login para testar serviços'
                        });
                        return;
                    }
                    
                    // Dados para teste
                    const servico = {
                        nome: 'Serviço Teste',
                        descricao: 'Descrição Teste',
                        valor: 50.0,
                        ativo: true
                    };
                    
                    // Cadastrar serviço
                    API.Servico.cadastrar(servico)
                        .then(responseCadastro => {
                            if (!responseCadastro.success || !responseCadastro.data || !responseCadastro.data.id) {
                                resolve({
                                    nome: 'CRUD de Serviços',
                                    sucesso: false,
                                    mensagem: 'Falha ao cadastrar serviço'
                                });
                                return;
                            }
                            
                            const servicoId = responseCadastro.data.id;
                            
                            // Atualizar serviço
                            API.Servico.atualizar(servicoId, {
                                ...servico,
                                nome: 'Serviço Atualizado'
                            })
                                .then(responseAtualizacao => {
                                    if (!responseAtualizacao.success) {
                                        resolve({
                                            nome: 'CRUD de Serviços',
                                            sucesso: false,
                                            mensagem: 'Falha ao atualizar serviço'
                                        });
                                        return;
                                    }
                                    
                                    // Excluir serviço
                                    API.Servico.excluir(servicoId)
                                        .then(responseExclusao => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Serviços',
                                                sucesso: responseExclusao.success === true,
                                                mensagem: responseExclusao.success
                                                    ? 'Operações de serviços funcionando corretamente'
                                                    : 'Falha ao excluir serviço'
                                            });
                                        })
                                        .catch(error => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Serviços',
                                                sucesso: false,
                                                mensagem: 'Erro ao excluir serviço: ' + error.message
                                            });
                                        });
                                })
                                .catch(error => {
                                    // Logout
                                    API.Auth.logout();
                                    
                                    resolve({
                                        nome: 'CRUD de Serviços',
                                        sucesso: false,
                                        mensagem: 'Erro ao atualizar serviço: ' + error.message
                                    });
                                });
                        })
                        .catch(error => {
                            // Logout
                            API.Auth.logout();
                            
                            resolve({
                                nome: 'CRUD de Serviços',
                                sucesso: false,
                                mensagem: 'Erro ao cadastrar serviço: ' + error.message
                            });
                        });
                })
                .catch(error => {
                    resolve({
                        nome: 'CRUD de Serviços',
                        sucesso: false,
                        mensagem: 'Erro ao fazer login: ' + error.message
                    });
                });
        });
    }
    
    // Função para testar CRUD de preços
    function testarCRUDPrecos() {
        return new Promise((resolve) => {
            console.log('Testando CRUD de preços...');
            
            // Fazer login para obter token
            API.Auth.login('admin', 'admin123')
                .then(response => {
                    if (!response.success) {
                        resolve({
                            nome: 'CRUD de Preços',
                            sucesso: false,
                            mensagem: 'Falha no login para testar preços'
                        });
                        return;
                    }
                    
                    // Dados para teste
                    const preco = {
                        nome: 'Tabela Teste',
                        descricao: 'Descrição Teste',
                        valorPrimeiraHora: 10.0,
                        valorHoraAdicional: 5.0,
                        valorDiaria: 50.0,
                        valorMensalidade: 300.0
                    };
                    
                    // Cadastrar tabela de preços
                    API.Preco.cadastrar(preco)
                        .then(responseCadastro => {
                            if (!responseCadastro.success || !responseCadastro.data || !responseCadastro.data.id) {
                                resolve({
                                    nome: 'CRUD de Preços',
                                    sucesso: false,
                                    mensagem: 'Falha ao cadastrar tabela de preços'
                                });
                                return;
                            }
                            
                            const precoId = responseCadastro.data.id;
                            
                            // Atualizar tabela de preços
                            API.Preco.atualizar(precoId, {
                                ...preco,
                                nome: 'Tabela Atualizada'
                            })
                                .then(responseAtualizacao => {
                                    if (!responseAtualizacao.success) {
                                        resolve({
                                            nome: 'CRUD de Preços',
                                            sucesso: false,
                                            mensagem: 'Falha ao atualizar tabela de preços'
                                        });
                                        return;
                                    }
                                    
                                    // Excluir tabela de preços
                                    API.Preco.excluir(precoId)
                                        .then(responseExclusao => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Preços',
                                                sucesso: responseExclusao.success === true,
                                                mensagem: responseExclusao.success
                                                    ? 'Operações de tabelas de preços funcionando corretamente'
                                                    : 'Falha ao excluir tabela de preços'
                                            });
                                        })
                                        .catch(error => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Preços',
                                                sucesso: false,
                                                mensagem: 'Erro ao excluir tabela de preços: ' + error.message
                                            });
                                        });
                                })
                                .catch(error => {
                                    // Logout
                                    API.Auth.logout();
                                    
                                    resolve({
                                        nome: 'CRUD de Preços',
                                        sucesso: false,
                                        mensagem: 'Erro ao atualizar tabela de preços: ' + error.message
                                    });
                                });
                        })
                        .catch(error => {
                            // Logout
                            API.Auth.logout();
                            
                            resolve({
                                nome: 'CRUD de Preços',
                                sucesso: false,
                                mensagem: 'Erro ao cadastrar tabela de preços: ' + error.message
                            });
                        });
                })
                .catch(error => {
                    resolve({
                        nome: 'CRUD de Preços',
                        sucesso: false,
                        mensagem: 'Erro ao fazer login: ' + error.message
                    });
                });
        });
    }
    
    // Função para testar relatórios
    function testarRelatorios() {
        return new Promise((resolve) => {
            console.log('Testando relatórios...');
            
            // Fazer login para obter token
            API.Auth.login('admin', 'admin123')
                .then(response => {
                    if (!response.success) {
                        resolve({
                            nome: 'Relatórios',
                            sucesso: false,
                            mensagem: 'Falha no login para testar relatórios'
                        });
                        return;
                    }
                    
                    // Dados para teste
                    const filtro = {
                        dataInicio: new Date(new Date().setMonth(new Date().getMonth() - 1)).getTime(),
                        dataFim: new Date().getTime(),
                        tipo: 'veiculos'
                    };
                    
                    // Gerar relatório
                    API.Relatorio.gerar(filtro)
                        .then(responseRelatorio => {
                            // Logout
                            API.Auth.logout();
                            
                            resolve({
                                nome: 'Relatórios',
                                sucesso: responseRelatorio.success === true,
                                mensagem: responseRelatorio.success
                                    ? 'Geração de relatórios funcionando corretamente'
                                    : 'Falha ao gerar relatório'
                            });
                        })
                        .catch(error => {
                            // Logout
                            API.Auth.logout();
                            
                            resolve({
                                nome: 'Relatórios',
                                sucesso: false,
                                mensagem: 'Erro ao gerar relatório: ' + error.message
                            });
                        });
                })
                .catch(error => {
                    resolve({
                        nome: 'Relatórios',
                        sucesso: false,
                        mensagem: 'Erro ao fazer login: ' + error.message
                    });
                });
        });
    }
    
    // Função para testar CRUD de usuários
    function testarCRUDUsuarios() {
        return new Promise((resolve) => {
            console.log('Testando CRUD de usuários...');
            
            // Fazer login para obter token
            API.Auth.login('admin', 'admin123')
                .then(response => {
                    if (!response.success) {
                        resolve({
                            nome: 'CRUD de Usuários',
                            sucesso: false,
                            mensagem: 'Falha no login para testar usuários'
                        });
                        return;
                    }
                    
                    // Dados para teste
                    const usuario = {
                        nome: 'Usuário Teste',
                        login: 'teste' + Math.floor(Math.random() * 9000 + 1000),
                        email: 'teste@teste.com',
                        nivel: 'visualizador',
                        senha: 'senha123'
                    };
                    
                    // Cadastrar usuário
                    API.Usuario.cadastrar(usuario)
                        .then(responseCadastro => {
                            if (!responseCadastro.success || !responseCadastro.data || !responseCadastro.data.id) {
                                resolve({
                                    nome: 'CRUD de Usuários',
                                    sucesso: false,
                                    mensagem: 'Falha ao cadastrar usuário'
                                });
                                return;
                            }
                            
                            const usuarioId = responseCadastro.data.id;
                            
                            // Atualizar usuário
                            API.Usuario.atualizar(usuarioId, {
                                ...usuario,
                                nome: 'Usuário Atualizado',
                                senha: undefined // Não atualizar senha
                            })
                                .then(responseAtualizacao => {
                                    if (!responseAtualizacao.success) {
                                        resolve({
                                            nome: 'CRUD de Usuários',
                                            sucesso: false,
                                            mensagem: 'Falha ao atualizar usuário'
                                        });
                                        return;
                                    }
                                    
                                    // Excluir usuário
                                    API.Usuario.excluir(usuarioId)
                                        .then(responseExclusao => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Usuários',
                                                sucesso: responseExclusao.success === true,
                                                mensagem: responseExclusao.success
                                                    ? 'Operações de usuários funcionando corretamente'
                                                    : 'Falha ao excluir usuário'
                                            });
                                        })
                                        .catch(error => {
                                            // Logout
                                            API.Auth.logout();
                                            
                                            resolve({
                                                nome: 'CRUD de Usuários',
                                                sucesso: false,
                                                mensagem: 'Erro ao excluir usuário: ' + error.message
                                            });
                                        });
                                })
                                .catch(error => {
                                    // Logout
                                    API.Auth.logout();
                                    
                                    resolve({
                                        nome: 'CRUD de Usuários',
                                        sucesso: false,
                                        mensagem: 'Erro ao atualizar usuário: ' + error.message
                                    });
                                });
                        })
                        .catch(error => {
                            // Logout
                            API.Auth.logout();
                            
                            resolve({
                                nome: 'CRUD de Usuários',
                                sucesso: false,
                                mensagem: 'Erro ao cadastrar usuário: ' + error.message
                            });
                        });
                })
                .catch(error => {
                    resolve({
                        nome: 'CRUD de Usuários',
                        sucesso: false,
                        mensagem: 'Erro ao fazer login: ' + error.message
                    });
                });
        });
    }
    
    // Função para exibir resultados dos testes
    function exibirResultadosTestes(resultados) {
        let html = `
            <h3>Resultados dos Testes de Integração</h3>
            <div class="tabela-container">
                <table class="tabela">
                    <thead>
                        <tr>
                            <th>Teste</th>
                            <th>Resultado</th>
                            <th>Mensagem</th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let sucessos = 0;
        let falhas = 0;
        
        resultados.forEach(resultado => {
            if (resultado.sucesso) {
                sucessos++;
            } else {
                falhas++;
            }
            
            html += `
                <tr>
                    <td>${resultado.nome}</td>
                    <td><span class="badge ${resultado.sucesso ? 'sucesso' : 'falha'}">${resultado.sucesso ? 'Sucesso' : 'Falha'}</span></td>
                    <td>${resultado.mensagem}</td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                    <tfoot>
                        <tr>
                            <td><strong>Total</strong></td>
                            <td colspan="2"><strong>${sucessos} sucessos, ${falhas} falhas</strong></td>
                        </tr>
                    </tfoot>
                </table>
            </div>
        `;
        
        resultadosTestes.innerHTML = html;
        
        // Mostrar notificação com resultado geral
        if (falhas === 0) {
            Utils.mostrarNotificacao('Todos os testes foram concluídos com sucesso!', 'success');
        } else {
            Utils.mostrarNotificacao(`Testes concluídos com ${falhas} falhas. Verifique os detalhes.`, 'warning');
        }
    }
});
