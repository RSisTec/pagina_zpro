// Arquivo para simulação de APIs
// Contém funções para simular requisições a um backend

// Namespace para APIs
const api = {
    // Autenticar usuário
    autenticar: function(login, senha) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar usuários
                const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                
                // Buscar usuário pelo login
                const usuario = usuarios.find(u => u.login === login);
                
                if (!usuario) {
                    reject({ mensagem: 'Usuário não encontrado' });
                    return;
                }
                
                // Verificar senha
                if (usuario.senha !== senha) {
                    reject({ mensagem: 'Senha incorreta' });
                    return;
                }
                
                // Verificar se a empresa está ativa
                const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
                const empresa = empresas.find(e => e.id === usuario.empresaId);
                
                if (!empresa) {
                    reject({ mensagem: 'Empresa não encontrada' });
                    return;
                }
                
                if (!empresa.status) {
                    reject({ mensagem: 'Empresa inativa. Entre em contato com o suporte.' });
                    return;
                }
                
                // Verificar se a licença está válida
                const hoje = new Date().getTime();
                if (empresa.dataFimLicenca < hoje) {
                    reject({ mensagem: 'Licença expirada. Entre em contato com o suporte.' });
                    return;
                }
                
                // Criar sessão
                const session = {
                    id: usuario.id,
                    empresaId: usuario.empresaId,
                    empresa: empresa.nome,
                    nome: usuario.nome,
                    email: usuario.email,
                    login: usuario.login,
                    nivel: usuario.nivel,
                    dataLogin: new Date().getTime()
                };
                
                // Salvar sessão
                localStorage.setItem('session', JSON.stringify(session));
                
                // Retornar sessão
                resolve(session);
            }, 800);
        });
    },
    
    // Consultar veículo por placa
    consultarPlaca: function(placa) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Buscar veículos da empresa atual
                const veiculos = utils.getStorageData('veiculos');
                
                // Verificar se o veículo já está no pátio
                const veiculoNoPatio = veiculos.find(v => 
                    v.placa === placa && 
                    v.status === 'no-patio'
                );
                
                if (veiculoNoPatio) {
                    resolve({
                        status: 'no-patio',
                        veiculo: veiculoNoPatio
                    });
                    return;
                }
                
                // Verificar se o veículo já passou pelo pátio
                const veiculoHistorico = veiculos.find(v => 
                    v.placa === placa && 
                    v.status === 'saiu'
                );
                
                if (veiculoHistorico) {
                    resolve({
                        status: 'historico',
                        veiculo: {
                            placa: veiculoHistorico.placa,
                            modelo: veiculoHistorico.modelo,
                            cor: veiculoHistorico.cor
                        }
                    });
                    return;
                }
                
                // Verificar se é um mensalista
                const mensalistas = utils.getStorageData('mensalistas');
                
                for (const mensalista of mensalistas) {
                    const veiculoMensalista = mensalista.veiculos.find(v => v.placa === placa);
                    
                    if (veiculoMensalista) {
                        resolve({
                            status: 'mensalista',
                            veiculo: {
                                placa: veiculoMensalista.placa,
                                modelo: veiculoMensalista.modelo,
                                cor: veiculoMensalista.cor
                            },
                            mensalista: {
                                id: mensalista.id,
                                nome: mensalista.nome
                            }
                        });
                        return;
                    }
                }
                
                // Verificar se é um isento
                const isentos = utils.getStorageData('isentos');
                
                for (const isento of isentos) {
                    const veiculoIsento = isento.veiculos.find(v => v.placa === placa);
                    
                    if (veiculoIsento) {
                        resolve({
                            status: 'isento',
                            veiculo: {
                                placa: veiculoIsento.placa,
                                modelo: veiculoIsento.modelo,
                                cor: veiculoIsento.cor
                            },
                            isento: {
                                id: isento.id,
                                nome: isento.nome,
                                motivo: isento.motivo
                            }
                        });
                        return;
                    }
                }
                
                // Veículo não encontrado
                resolve({
                    status: 'novo'
                });
            }, 800);
        });
    },
    
    // Adicionar veículo ao pátio
    adicionarVeiculo: function(veiculo) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Validar campos obrigatórios
                if (!veiculo.placa || !veiculo.modelo || !veiculo.cor || !veiculo.telefone) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Buscar veículos da empresa atual
                const veiculos = utils.getStorageData('veiculos');
                
                // Verificar se o veículo já está no pátio
                const veiculoExistente = veiculos.find(v => 
                    v.placa === veiculo.placa && 
                    v.status === 'no-patio'
                );
                
                if (veiculoExistente) {
                    reject({ mensagem: 'Este veículo já está no pátio' });
                    return;
                }
                
                // Gerar ticket
                const ticket = utils.gerarTicket();
                
                // Criar objeto do veículo
                const novoVeiculo = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    empresaId: session.empresaId,
                    placa: veiculo.placa,
                    modelo: veiculo.modelo,
                    cor: veiculo.cor,
                    ticket: ticket,
                    telefone: veiculo.telefone,
                    entrada: new Date().getTime(),
                    saida: null,
                    tipoCliente: veiculo.tipoCliente || 'normal',
                    idCliente: veiculo.idCliente || null,
                    servicos: [],
                    valorTotal: 0,
                    formaPagamento: null,
                    cpfNota: null,
                    status: 'no-patio',
                    observacoes: veiculo.observacoes || ''
                };
                
                // Adicionar veículo
                veiculos.push(novoVeiculo);
                utils.setStorageData('veiculos', veiculos);
                
                // Simular envio de mensagem
                console.log(`Mensagem enviada para ${veiculo.telefone}: Seu veículo foi registrado no estacionamento. Ticket: ${ticket}`);
                
                // Retornar veículo adicionado
                resolve(novoVeiculo);
            }, 1000);
        });
    },
    
    // Listar veículos no pátio
    listarVeiculosNoPatio: function() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    resolve([]);
                    return;
                }
                
                // Buscar veículos da empresa atual
                const veiculos = utils.getStorageData('veiculos');
                
                // Filtrar veículos no pátio
                const veiculosNoPatio = veiculos.filter(v => 
                    v.empresaId === session.empresaId && 
                    v.status === 'no-patio'
                );
                
                // Ordenar por entrada (mais recentes primeiro)
                veiculosNoPatio.sort((a, b) => b.entrada - a.entrada);
                
                // Retornar veículos
                resolve(veiculosNoPatio);
            }, 800);
        });
    },
    
    // Buscar veículo por ticket
    buscarVeiculoPorTicket: function(ticket) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Buscar veículos da empresa atual
                const veiculos = utils.getStorageData('veiculos');
                
                // Buscar veículo pelo ticket
                const veiculo = veiculos.find(v => 
                    v.empresaId === session.empresaId && 
                    v.ticket === ticket && 
                    v.status === 'no-patio'
                );
                
                if (!veiculo) {
                    reject({ mensagem: 'Veículo não encontrado ou já saiu do pátio' });
                    return;
                }
                
                // Calcular valor a pagar
                const agora = new Date().getTime();
                const tempoEstacionado = agora - veiculo.entrada;
                const horasEstacionado = Math.ceil(tempoEstacionado / (1000 * 60 * 60));
                
                // Buscar tabela de preços ativa
                const precos = utils.getStorageData('precos');
                const tabelaPrecos = precos.find(p => 
                    p.empresaId === session.empresaId && 
                    p.ativo
                ) || {
                    valorPrimeiraHora: 10,
                    valorHoraAdicional: 5,
                    valorDiaria: 30
                };
                
                // Calcular valor
                let valor = 0;
                
                if (veiculo.tipoCliente === 'mensalista') {
                    valor = 0; // Mensalistas não pagam por hora
                } else if (veiculo.tipoCliente === 'isento') {
                    valor = 0; // Isentos não pagam
                } else {
                    // Verificar se é diária
                    const diasEstacionado = Math.floor(horasEstacionado / 24);
                    
                    if (diasEstacionado > 0) {
                        valor = diasEstacionado * tabelaPrecos.valorDiaria;
                        
                        // Adicionar horas extras
                        const horasExtras = horasEstacionado % 24;
                        
                        if (horasExtras > 0) {
                            if (horasExtras === 1) {
                                valor += tabelaPrecos.valorPrimeiraHora;
                            } else {
                                valor += tabelaPrecos.valorPrimeiraHora + (horasExtras - 1) * tabelaPrecos.valorHoraAdicional;
                            }
                        }
                    } else {
                        // Calcular por hora
                        if (horasEstacionado <= 1) {
                            valor = tabelaPrecos.valorPrimeiraHora;
                        } else {
                            valor = tabelaPrecos.valorPrimeiraHora + (horasEstacionado - 1) * tabelaPrecos.valorHoraAdicional;
                        }
                    }
                }
                
                // Adicionar valor dos serviços
                if (veiculo.servicos && veiculo.servicos.length > 0) {
                    veiculo.servicos.forEach(servico => {
                        valor += servico.valor;
                    });
                }
                
                // Retornar veículo com valor calculado
                resolve({
                    veiculo,
                    valor,
                    horasEstacionado,
                    tempoPermanencia: utils.calcularTempoPermanencia(veiculo.entrada, agora)
                });
            }, 800);
        });
    },
    
    // Registrar saída de veículo
    registrarSaida: function(ticket, formaPagamento, cpfNota) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Buscar veículos da empresa atual
                const veiculos = utils.getStorageData('veiculos');
                
                // Buscar índice do veículo
                const index = veiculos.findIndex(v => 
                    v.empresaId === session.empresaId && 
                    v.ticket === ticket && 
                    v.status === 'no-patio'
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Veículo não encontrado ou já saiu do pátio' });
                    return;
                }
                
                // Calcular valor a pagar
                const agora = new Date().getTime();
                const tempoEstacionado = agora - veiculos[index].entrada;
                const horasEstacionado = Math.ceil(tempoEstacionado / (1000 * 60 * 60));
                
                // Buscar tabela de preços ativa
                const precos = utils.getStorageData('precos');
                const tabelaPrecos = precos.find(p => 
                    p.empresaId === session.empresaId && 
                    p.ativo
                ) || {
                    valorPrimeiraHora: 10,
                    valorHoraAdicional: 5,
                    valorDiaria: 30
                };
                
                // Calcular valor
                let valor = 0;
                
                if (veiculos[index].tipoCliente === 'mensalista') {
                    valor = 0; // Mensalistas não pagam por hora
                } else if (veiculos[index].tipoCliente === 'isento') {
                    valor = 0; // Isentos não pagam
                } else {
                    // Verificar se é diária
                    const diasEstacionado = Math.floor(horasEstacionado / 24);
                    
                    if (diasEstacionado > 0) {
                        valor = diasEstacionado * tabelaPrecos.valorDiaria;
                        
                        // Adicionar horas extras
                        const horasExtras = horasEstacionado % 24;
                        
                        if (horasExtras > 0) {
                            if (horasExtras === 1) {
                                valor += tabelaPrecos.valorPrimeiraHora;
                            } else {
                                valor += tabelaPrecos.valorPrimeiraHora + (horasExtras - 1) * tabelaPrecos.valorHoraAdicional;
                            }
                        }
                    } else {
                        // Calcular por hora
                        if (horasEstacionado <= 1) {
                            valor = tabelaPrecos.valorPrimeiraHora;
                        } else {
                            valor = tabelaPrecos.valorPrimeiraHora + (horasEstacionado - 1) * tabelaPrecos.valorHoraAdicional;
                        }
                    }
                }
                
                // Adicionar valor dos serviços
                if (veiculos[index].servicos && veiculos[index].servicos.length > 0) {
                    veiculos[index].servicos.forEach(servico => {
                        valor += servico.valor;
                    });
                }
                
                // Atualizar veículo
                veiculos[index].saida = agora;
                veiculos[index].valorTotal = valor;
                veiculos[index].formaPagamento = formaPagamento;
                veiculos[index].cpfNota = cpfNota || null;
                veiculos[index].status = 'saiu';
                
                // Salvar veículos
                utils.setStorageData('veiculos', veiculos);
                
                // Simular envio de mensagem
                console.log(`Mensagem enviada para ${veiculos[index].telefone}: Seu veículo saiu do estacionamento. Valor pago: ${utils.formatarMoeda(valor)}`);
                
                // Retornar veículo atualizado
                resolve({
                    veiculo: veiculos[index],
                    valor,
                    horasEstacionado,
                    tempoPermanencia: utils.calcularTempoPermanencia(veiculos[index].entrada, agora)
                });
            }, 1000);
        });
    },
    
    // Listar mensalistas
    listarMensalistas: function() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    resolve([]);
                    return;
                }
                
                // Buscar mensalistas da empresa atual
                const mensalistas = utils.getStorageData('mensalistas');
                
                // Filtrar mensalistas da empresa atual
                const mensalistasEmpresa = mensalistas.filter(m => 
                    m.empresaId === session.empresaId
                );
                
                // Ordenar por nome
                mensalistasEmpresa.sort((a, b) => a.nome.localeCompare(b.nome));
                
                // Retornar mensalistas
                resolve(mensalistasEmpresa);
            }, 800);
        });
    },
    
    // Cadastrar mensalista
    cadastrarMensalista: function(mensalista) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Validar campos obrigatórios
                if (!mensalista.nome || !mensalista.documento || !mensalista.telefone || 
                    !mensalista.plano || !mensalista.dataInicio || !mensalista.dataFim) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Buscar mensalistas da empresa atual
                const mensalistas = utils.getStorageData('mensalistas');
                
                // Criar objeto do mensalista
                const novoMensalista = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    empresaId: session.empresaId,
                    nome: mensalista.nome,
                    documento: mensalista.documento,
                    telefone: mensalista.telefone,
                    email: mensalista.email || '',
                    endereco: mensalista.endereco || '',
                    plano: mensalista.plano,
                    dataInicio: new Date(mensalista.dataInicio).getTime(),
                    dataFim: new Date(mensalista.dataFim).getTime(),
                    veiculos: mensalista.veiculos || []
                };
                
                // Adicionar mensalista
                mensalistas.push(novoMensalista);
                utils.setStorageData('mensalistas', mensalistas);
                
                // Retornar mensalista adicionado
                resolve(novoMensalista);
            }, 1000);
        });
    },
    
    // Atualizar mensalista
    atualizarMensalista: function(id, mensalista) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Validar campos obrigatórios
                if (!mensalista.nome || !mensalista.documento || !mensalista.telefone || 
                    !mensalista.plano || !mensalista.dataInicio || !mensalista.dataFim) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Buscar mensalistas da empresa atual
                const mensalistas = utils.getStorageData('mensalistas');
                
                // Buscar índice do mensalista
                const index = mensalistas.findIndex(m => 
                    m.empresaId === session.empresaId && 
                    m.id === id
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Mensalista não encontrado' });
                    return;
                }
                
                // Atualizar mensalista
                mensalistas[index] = {
                    ...mensalistas[index],
                    nome: mensalista.nome,
                    documento: mensalista.documento,
                    telefone: mensalista.telefone,
                    email: mensalista.email || '',
                    endereco: mensalista.endereco || '',
                    plano: mensalista.plano,
                    dataInicio: new Date(mensalista.dataInicio).getTime(),
                    dataFim: new Date(mensalista.dataFim).getTime(),
                    veiculos: mensalista.veiculos || mensalistas[index].veiculos
                };
                
                // Salvar mensalistas
                utils.setStorageData('mensalistas', mensalistas);
                
                // Retornar mensalista atualizado
                resolve(mensalistas[index]);
            }, 1000);
        });
    },
    
    // Excluir mensalista
    excluirMensalista: function(id) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Buscar mensalistas da empresa atual
                const mensalistas = utils.getStorageData('mensalistas');
                
                // Buscar índice do mensalista
                const index = mensalistas.findIndex(m => 
                    m.empresaId === session.empresaId && 
                    m.id === id
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Mensalista não encontrado' });
                    return;
                }
                
                // Verificar se há veículos no pátio
                const veiculos = utils.getStorageData('veiculos');
                const veiculosNoPatio = veiculos.filter(v => 
                    v.empresaId === session.empresaId && 
                    v.tipoCliente === 'mensalista' && 
                    v.idCliente === id && 
                    v.status === 'no-patio'
                );
                
                if (veiculosNoPatio.length > 0) {
                    reject({ mensagem: 'Não é possível excluir o mensalista pois há veículos no pátio' });
                    return;
                }
                
                // Remover mensalista
                mensalistas.splice(index, 1);
                utils.setStorageData('mensalistas', mensalistas);
                
                // Retornar sucesso
                resolve({ mensagem: 'Mensalista excluído com sucesso' });
            }, 1000);
        });
    },
    
    // Listar isentos
    listarIsentos: function() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    resolve([]);
                    return;
                }
                
                // Buscar isentos da empresa atual
                const isentos = utils.getStorageData('isentos');
                
                // Filtrar isentos da empresa atual
                const isentosEmpresa = isentos.filter(i => 
                    i.empresaId === session.empresaId
                );
                
                // Ordenar por nome
                isentosEmpresa.sort((a, b) => a.nome.localeCompare(b.nome));
                
                // Retornar isentos
                resolve(isentosEmpresa);
            }, 800);
        });
    },
    
    // Cadastrar isento
    cadastrarIsento: function(isento) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Validar campos obrigatórios
                if (!isento.nome || !isento.documento || !isento.motivo) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Buscar isentos da empresa atual
                const isentos = utils.getStorageData('isentos');
                
                // Criar objeto do isento
                const novoIsento = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    empresaId: session.empresaId,
                    nome: isento.nome,
                    documento: isento.documento,
                    motivo: isento.motivo,
                    veiculos: isento.veiculos || []
                };
                
                // Adicionar isento
                isentos.push(novoIsento);
                utils.setStorageData('isentos', isentos);
                
                // Retornar isento adicionado
                resolve(novoIsento);
            }, 1000);
        });
    },
    
    // Atualizar isento
    atualizarIsento: function(id, isento) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Validar campos obrigatórios
                if (!isento.nome || !isento.documento || !isento.motivo) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Buscar isentos da empresa atual
                const isentos = utils.getStorageData('isentos');
                
                // Buscar índice do isento
                const index = isentos.findIndex(i => 
                    i.empresaId === session.empresaId && 
                    i.id === id
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Isento não encontrado' });
                    return;
                }
                
                // Atualizar isento
                isentos[index] = {
                    ...isentos[index],
                    nome: isento.nome,
                    documento: isento.documento,
                    motivo: isento.motivo,
                    veiculos: isento.veiculos || isentos[index].veiculos
                };
                
                // Salvar isentos
                utils.setStorageData('isentos', isentos);
                
                // Retornar isento atualizado
                resolve(isentos[index]);
            }, 1000);
        });
    },
    
    // Excluir isento
    excluirIsento: function(id) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Buscar isentos da empresa atual
                const isentos = utils.getStorageData('isentos');
                
                // Buscar índice do isento
                const index = isentos.findIndex(i => 
                    i.empresaId === session.empresaId && 
                    i.id === id
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Isento não encontrado' });
                    return;
                }
                
                // Verificar se há veículos no pátio
                const veiculos = utils.getStorageData('veiculos');
                const veiculosNoPatio = veiculos.filter(v => 
                    v.empresaId === session.empresaId && 
                    v.tipoCliente === 'isento' && 
                    v.idCliente === id && 
                    v.status === 'no-patio'
                );
                
                if (veiculosNoPatio.length > 0) {
                    reject({ mensagem: 'Não é possível excluir o isento pois há veículos no pátio' });
                    return;
                }
                
                // Remover isento
                isentos.splice(index, 1);
                utils.setStorageData('isentos', isentos);
                
                // Retornar sucesso
                resolve({ mensagem: 'Isento excluído com sucesso' });
            }, 1000);
        });
    },
    
    // Listar serviços
    listarServicos: function() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    resolve([]);
                    return;
                }
                
                // Buscar serviços da empresa atual
                const servicos = utils.getStorageData('servicos');
                
                // Filtrar serviços da empresa atual
                const servicosEmpresa = servicos.filter(s => 
                    s.empresaId === session.empresaId
                );
                
                // Ordenar por nome
                servicosEmpresa.sort((a, b) => a.nome.localeCompare(b.nome));
                
                // Retornar serviços
                resolve(servicosEmpresa);
            }, 800);
        });
    },
    
    // Cadastrar serviço
    cadastrarServico: function(servico) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Validar campos obrigatórios
                if (!servico.nome || !servico.valor) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Buscar serviços da empresa atual
                const servicos = utils.getStorageData('servicos');
                
                // Criar objeto do serviço
                const novoServico = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    empresaId: session.empresaId,
                    nome: servico.nome,
                    descricao: servico.descricao || '',
                    valor: parseFloat(servico.valor),
                    tempoEstimado: parseInt(servico.tempoEstimado) || 0
                };
                
                // Adicionar serviço
                servicos.push(novoServico);
                utils.setStorageData('servicos', servicos);
                
                // Retornar serviço adicionado
                resolve(novoServico);
            }, 1000);
        });
    },
    
    // Atualizar serviço
    atualizarServico: function(id, servico) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Validar campos obrigatórios
                if (!servico.nome || !servico.valor) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Buscar serviços da empresa atual
                const servicos = utils.getStorageData('servicos');
                
                // Buscar índice do serviço
                const index = servicos.findIndex(s => 
                    s.empresaId === session.empresaId && 
                    s.id === id
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Serviço não encontrado' });
                    return;
                }
                
                // Atualizar serviço
                servicos[index] = {
                    ...servicos[index],
                    nome: servico.nome,
                    descricao: servico.descricao || '',
                    valor: parseFloat(servico.valor),
                    tempoEstimado: parseInt(servico.tempoEstimado) || 0
                };
                
                // Salvar serviços
                utils.setStorageData('servicos', servicos);
                
                // Retornar serviço atualizado
                resolve(servicos[index]);
            }, 1000);
        });
    },
    
    // Excluir serviço
    excluirServico: function(id) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Buscar serviços da empresa atual
                const servicos = utils.getStorageData('servicos');
                
                // Buscar índice do serviço
                const index = servicos.findIndex(s => 
                    s.empresaId === session.empresaId && 
                    s.id === id
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Serviço não encontrado' });
                    return;
                }
                
                // Verificar se há veículos com este serviço
                const veiculos = utils.getStorageData('veiculos');
                const veiculosComServico = veiculos.filter(v => 
                    v.empresaId === session.empresaId && 
                    v.status === 'no-patio' && 
                    v.servicos && 
                    v.servicos.some(s => s.id === id)
                );
                
                if (veiculosComServico.length > 0) {
                    reject({ mensagem: 'Não é possível excluir o serviço pois há veículos utilizando-o' });
                    return;
                }
                
                // Remover serviço
                servicos.splice(index, 1);
                utils.setStorageData('servicos', servicos);
                
                // Retornar sucesso
                resolve({ mensagem: 'Serviço excluído com sucesso' });
            }, 1000);
        });
    },
    
    // Adicionar serviço ao veículo
    adicionarServicoAoVeiculo: function(veiculoId, servicoId) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Buscar veículos da empresa atual
                const veiculos = utils.getStorageData('veiculos');
                
                // Buscar índice do veículo
                const veiculoIndex = veiculos.findIndex(v => 
                    v.empresaId === session.empresaId && 
                    v.id === veiculoId && 
                    v.status === 'no-patio'
                );
                
                if (veiculoIndex === -1) {
                    reject({ mensagem: 'Veículo não encontrado ou já saiu do pátio' });
                    return;
                }
                
                // Buscar serviço
                const servicos = utils.getStorageData('servicos');
                const servico = servicos.find(s => 
                    s.empresaId === session.empresaId && 
                    s.id === servicoId
                );
                
                if (!servico) {
                    reject({ mensagem: 'Serviço não encontrado' });
                    return;
                }
                
                // Verificar se o serviço já foi adicionado
                if (veiculos[veiculoIndex].servicos && veiculos[veiculoIndex].servicos.some(s => s.id === servicoId)) {
                    reject({ mensagem: 'Este serviço já foi adicionado ao veículo' });
                    return;
                }
                
                // Adicionar serviço ao veículo
                if (!veiculos[veiculoIndex].servicos) {
                    veiculos[veiculoIndex].servicos = [];
                }
                
                veiculos[veiculoIndex].servicos.push({
                    id: servico.id,
                    nome: servico.nome,
                    valor: servico.valor,
                    dataAdicao: new Date().getTime()
                });
                
                // Salvar veículos
                utils.setStorageData('veiculos', veiculos);
                
                // Retornar veículo atualizado
                resolve(veiculos[veiculoIndex]);
            }, 1000);
        });
    },
    
    // Remover serviço do veículo
    removerServicoDoVeiculo: function(veiculoId, servicoId) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Buscar veículos da empresa atual
                const veiculos = utils.getStorageData('veiculos');
                
                // Buscar índice do veículo
                const veiculoIndex = veiculos.findIndex(v => 
                    v.empresaId === session.empresaId && 
                    v.id === veiculoId && 
                    v.status === 'no-patio'
                );
                
                if (veiculoIndex === -1) {
                    reject({ mensagem: 'Veículo não encontrado ou já saiu do pátio' });
                    return;
                }
                
                // Verificar se o veículo tem serviços
                if (!veiculos[veiculoIndex].servicos || veiculos[veiculoIndex].servicos.length === 0) {
                    reject({ mensagem: 'Este veículo não possui serviços' });
                    return;
                }
                
                // Buscar índice do serviço
                const servicoIndex = veiculos[veiculoIndex].servicos.findIndex(s => s.id === servicoId);
                
                if (servicoIndex === -1) {
                    reject({ mensagem: 'Serviço não encontrado neste veículo' });
                    return;
                }
                
                // Remover serviço
                veiculos[veiculoIndex].servicos.splice(servicoIndex, 1);
                
                // Salvar veículos
                utils.setStorageData('veiculos', veiculos);
                
                // Retornar veículo atualizado
                resolve(veiculos[veiculoIndex]);
            }, 1000);
        });
    },
    
    // Listar preços
    listarPrecos: function() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    resolve([]);
                    return;
                }
                
                // Buscar preços da empresa atual
                const precos = utils.getStorageData('precos');
                
                // Filtrar preços da empresa atual
                const precosEmpresa = precos.filter(p => 
                    p.empresaId === session.empresaId
                );
                
                // Ordenar por status (ativos primeiro) e depois por nome
                precosEmpresa.sort((a, b) => {
                    if (a.ativo !== b.ativo) {
                        return a.ativo ? -1 : 1;
                    }
                    return a.nome.localeCompare(b.nome);
                });
                
                // Retornar preços
                resolve(precosEmpresa);
            }, 800);
        });
    },
    
    // Cadastrar preço
    cadastrarPreco: function(preco) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Validar campos obrigatórios
                if (!preco.nome || 
                    isNaN(preco.valorPrimeiraHora) || 
                    isNaN(preco.valorHoraAdicional) || 
                    isNaN(preco.valorDiaria) || 
                    isNaN(preco.valorMensalidade)) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Buscar preços da empresa atual
                const precos = utils.getStorageData('precos');
                
                // Criar objeto do preço
                const novoPreco = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    empresaId: session.empresaId,
                    nome: preco.nome,
                    descricao: preco.descricao || '',
                    valorPrimeiraHora: parseFloat(preco.valorPrimeiraHora),
                    valorHoraAdicional: parseFloat(preco.valorHoraAdicional),
                    valorDiaria: parseFloat(preco.valorDiaria),
                    valorMensalidade: parseFloat(preco.valorMensalidade),
                    ativo: preco.ativo === true || preco.ativo === 'true',
                    dataCriacao: new Date().getTime()
                };
                
                // Se for o primeiro preço ou for ativo, desativar os outros
                if (precos.length === 0 || novoPreco.ativo) {
                    precos.forEach(p => {
                        if (p.empresaId === session.empresaId) {
                            p.ativo = false;
                        }
                    });
                    
                    // Se for o primeiro, ativar
                    if (precos.length === 0) {
                        novoPreco.ativo = true;
                    }
                }
                
                // Adicionar preço
                precos.push(novoPreco);
                utils.setStorageData('precos', precos);
                
                // Retornar preço adicionado
                resolve(novoPreco);
            }, 1000);
        });
    },
    
    // Atualizar preço
    atualizarPreco: function(id, preco) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Validar campos obrigatórios
                if (!preco.nome || 
                    isNaN(preco.valorPrimeiraHora) || 
                    isNaN(preco.valorHoraAdicional) || 
                    isNaN(preco.valorDiaria) || 
                    isNaN(preco.valorMensalidade)) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Buscar preços da empresa atual
                const precos = utils.getStorageData('precos');
                
                // Buscar índice do preço
                const index = precos.findIndex(p => 
                    p.empresaId === session.empresaId && 
                    p.id === id
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Tabela de preços não encontrada' });
                    return;
                }
                
                // Verificar se está ativando
                const ativando = preco.ativo === true || preco.ativo === 'true';
                
                // Se estiver ativando, desativar os outros
                if (ativando && !precos[index].ativo) {
                    precos.forEach(p => {
                        if (p.empresaId === session.empresaId) {
                            p.ativo = false;
                        }
                    });
                }
                
                // Atualizar preço
                precos[index] = {
                    ...precos[index],
                    nome: preco.nome,
                    descricao: preco.descricao || '',
                    valorPrimeiraHora: parseFloat(preco.valorPrimeiraHora),
                    valorHoraAdicional: parseFloat(preco.valorHoraAdicional),
                    valorDiaria: parseFloat(preco.valorDiaria),
                    valorMensalidade: parseFloat(preco.valorMensalidade),
                    ativo: ativando
                };
                
                // Salvar preços
                utils.setStorageData('precos', precos);
                
                // Retornar preço atualizado
                resolve(precos[index]);
            }, 1000);
        });
    },
    
    // Ativar preço
    ativarPreco: function(id) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Buscar preços da empresa atual
                const precos = utils.getStorageData('precos');
                
                // Desativar todos os preços
                precos.forEach(p => {
                    if (p.empresaId === session.empresaId) {
                        p.ativo = false;
                    }
                });
                
                // Buscar índice do preço
                const index = precos.findIndex(p => 
                    p.empresaId === session.empresaId && 
                    p.id === id
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Tabela de preços não encontrada' });
                    return;
                }
                
                // Ativar preço
                precos[index].ativo = true;
                
                // Salvar preços
                utils.setStorageData('precos', precos);
                
                // Retornar preço ativado
                resolve(precos[index]);
            }, 1000);
        });
    },
    
    // Excluir preço
    excluirPreco: function(id) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Buscar preços da empresa atual
                const precos = utils.getStorageData('precos');
                
                // Buscar índice do preço
                const index = precos.findIndex(p => 
                    p.empresaId === session.empresaId && 
                    p.id === id
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Tabela de preços não encontrada' });
                    return;
                }
                
                // Verificar se é o único preço
                const precosEmpresa = precos.filter(p => p.empresaId === session.empresaId);
                
                if (precosEmpresa.length === 1) {
                    reject({ mensagem: 'Não é possível excluir a única tabela de preços' });
                    return;
                }
                
                // Verificar se está ativo
                if (precos[index].ativo) {
                    reject({ mensagem: 'Não é possível excluir uma tabela de preços ativa. Ative outra tabela primeiro.' });
                    return;
                }
                
                // Remover preço
                precos.splice(index, 1);
                utils.setStorageData('precos', precos);
                
                // Retornar sucesso
                resolve({ mensagem: 'Tabela de preços excluída com sucesso' });
            }, 1000);
        });
    },
    
    // Listar usuários
    listarUsuarios: function() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    resolve([]);
                    return;
                }
                
                // Verificar se é administrador
                if (session.nivel !== 'admin') {
                    resolve([]);
                    return;
                }
                
                // Buscar usuários da empresa atual
                const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                
                // Filtrar usuários da empresa atual
                const usuariosEmpresa = usuarios.filter(u => 
                    u.empresaId === session.empresaId
                );
                
                // Ordenar por nível (admin primeiro) e depois por nome
                usuariosEmpresa.sort((a, b) => {
                    if (a.nivel !== b.nivel) {
                        return a.nivel === 'admin' ? -1 : (b.nivel === 'admin' ? 1 : 0);
                    }
                    return a.nome.localeCompare(b.nome);
                });
                
                // Retornar usuários (sem senha)
                resolve(usuariosEmpresa.map(u => {
                    const { senha, ...usuarioSemSenha } = u;
                    return usuarioSemSenha;
                }));
            }, 800);
        });
    },
    
    // Cadastrar usuário
    cadastrarUsuario: function(usuario) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Verificar se é administrador
                if (session.nivel !== 'admin') {
                    reject({ mensagem: 'Apenas administradores podem cadastrar usuários' });
                    return;
                }
                
                // Validar campos obrigatórios
                if (!usuario.nome || !usuario.email || !usuario.login || !usuario.senha || !usuario.nivel) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Validar email
                if (!utils.validarEmail(usuario.email)) {
                    reject({ mensagem: 'Email inválido' });
                    return;
                }
                
                // Validar senha
                if (usuario.senha.length < 6) {
                    reject({ mensagem: 'A senha deve ter pelo menos 6 caracteres' });
                    return;
                }
                
                // Buscar usuários
                const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                
                // Verificar se já existe usuário com o mesmo login
                const loginExistente = usuarios.find(u => u.login === usuario.login);
                
                if (loginExistente) {
                    reject({ mensagem: 'Já existe um usuário com este login' });
                    return;
                }
                
                // Verificar se já existe usuário com o mesmo email
                const emailExistente = usuarios.find(u => u.email === usuario.email);
                
                if (emailExistente) {
                    reject({ mensagem: 'Já existe um usuário com este email' });
                    return;
                }
                
                // Criar objeto do usuário
                const novoUsuario = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                    empresaId: session.empresaId,
                    nome: usuario.nome,
                    email: usuario.email,
                    login: usuario.login,
                    senha: usuario.senha,
                    nivel: usuario.nivel,
                    dataCriacao: new Date().getTime(),
                    dataAtualizacao: new Date().getTime()
                };
                
                // Adicionar usuário
                usuarios.push(novoUsuario);
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
                
                // Retornar usuário adicionado (sem senha)
                const { senha, ...usuarioSemSenha } = novoUsuario;
                resolve(usuarioSemSenha);
            }, 1000);
        });
    },
    
    // Atualizar usuário
    atualizarUsuario: function(id, usuario) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Verificar se é administrador
                if (session.nivel !== 'admin') {
                    reject({ mensagem: 'Apenas administradores podem atualizar usuários' });
                    return;
                }
                
                // Validar campos obrigatórios
                if (!usuario.nome || !usuario.email || !usuario.login || !usuario.nivel) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Validar email
                if (!utils.validarEmail(usuario.email)) {
                    reject({ mensagem: 'Email inválido' });
                    return;
                }
                
                // Buscar usuários
                const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                
                // Buscar índice do usuário
                const index = usuarios.findIndex(u => 
                    u.empresaId === session.empresaId && 
                    u.id === id
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Usuário não encontrado' });
                    return;
                }
                
                // Verificar se está tentando alterar o último administrador
                if (usuarios[index].nivel === 'admin' && usuario.nivel !== 'admin') {
                    const admins = usuarios.filter(u => 
                        u.empresaId === session.empresaId && 
                        u.nivel === 'admin'
                    );
                    
                    if (admins.length === 1) {
                        reject({ mensagem: 'Não é possível rebaixar o último administrador' });
                        return;
                    }
                }
                
                // Verificar se já existe usuário com o mesmo login
                const loginExistente = usuarios.find(u => u.login === usuario.login && u.id !== id);
                
                if (loginExistente) {
                    reject({ mensagem: 'Já existe um usuário com este login' });
                    return;
                }
                
                // Verificar se já existe usuário com o mesmo email
                const emailExistente = usuarios.find(u => u.email === usuario.email && u.id !== id);
                
                if (emailExistente) {
                    reject({ mensagem: 'Já existe um usuário com este email' });
                    return;
                }
                
                // Atualizar usuário
                usuarios[index] = {
                    ...usuarios[index],
                    nome: usuario.nome,
                    email: usuario.email,
                    login: usuario.login,
                    nivel: usuario.nivel,
                    dataAtualizacao: new Date().getTime()
                };
                
                // Atualizar senha se fornecida
                if (usuario.senha) {
                    if (usuario.senha.length < 6) {
                        reject({ mensagem: 'A senha deve ter pelo menos 6 caracteres' });
                        return;
                    }
                    
                    usuarios[index].senha = usuario.senha;
                }
                
                // Salvar usuários
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
                
                // Retornar usuário atualizado (sem senha)
                const { senha, ...usuarioSemSenha } = usuarios[index];
                resolve(usuarioSemSenha);
            }, 1000);
        });
    },
    
    // Excluir usuário
    excluirUsuario: function(id) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Verificar se é administrador
                if (session.nivel !== 'admin') {
                    reject({ mensagem: 'Apenas administradores podem excluir usuários' });
                    return;
                }
                
                // Buscar usuários
                const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                
                // Buscar índice do usuário
                const index = usuarios.findIndex(u => 
                    u.empresaId === session.empresaId && 
                    u.id === id
                );
                
                if (index === -1) {
                    reject({ mensagem: 'Usuário não encontrado' });
                    return;
                }
                
                // Verificar se está tentando excluir a si mesmo
                if (usuarios[index].id === session.id) {
                    reject({ mensagem: 'Não é possível excluir o próprio usuário' });
                    return;
                }
                
                // Verificar se está tentando excluir o último administrador
                if (usuarios[index].nivel === 'admin') {
                    const admins = usuarios.filter(u => 
                        u.empresaId === session.empresaId && 
                        u.nivel === 'admin'
                    );
                    
                    if (admins.length === 1) {
                        reject({ mensagem: 'Não é possível excluir o último administrador' });
                        return;
                    }
                }
                
                // Remover usuário
                usuarios.splice(index, 1);
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
                
                // Retornar sucesso
                resolve({ mensagem: 'Usuário excluído com sucesso' });
            }, 1000);
        });
    },
    
    // Obter relatório de veículos
    obterRelatorioVeiculos: function(filtros) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    resolve({
                        veiculos: [],
                        totalVeiculos: 0,
                        totalValor: 0
                    });
                    return;
                }
                
                // Buscar veículos da empresa atual
                const veiculos = utils.getStorageData('veiculos');
                
                // Filtrar veículos da empresa atual
                let veiculosFiltrados = veiculos.filter(v => 
                    v.empresaId === session.empresaId
                );
                
                // Aplicar filtros
                if (filtros) {
                    // Filtro de data
                    if (filtros.dataInicio) {
                        const dataInicio = new Date(filtros.dataInicio).setHours(0, 0, 0, 0);
                        veiculosFiltrados = veiculosFiltrados.filter(v => v.entrada >= dataInicio);
                    }
                    
                    if (filtros.dataFim) {
                        const dataFim = new Date(filtros.dataFim).setHours(23, 59, 59, 999);
                        veiculosFiltrados = veiculosFiltrados.filter(v => v.entrada <= dataFim);
                    }
                    
                    // Filtro de status
                    if (filtros.status && filtros.status !== 'todos') {
                        veiculosFiltrados = veiculosFiltrados.filter(v => v.status === filtros.status);
                    }
                    
                    // Filtro de tipo de cliente
                    if (filtros.tipoCliente && filtros.tipoCliente !== 'todos') {
                        veiculosFiltrados = veiculosFiltrados.filter(v => v.tipoCliente === filtros.tipoCliente);
                    }
                    
                    // Filtro de placa
                    if (filtros.placa) {
                        veiculosFiltrados = veiculosFiltrados.filter(v => v.placa.includes(filtros.placa));
                    }
                }
                
                // Ordenar por entrada (mais recentes primeiro)
                veiculosFiltrados.sort((a, b) => b.entrada - a.entrada);
                
                // Calcular total
                const totalValor = veiculosFiltrados.reduce((total, v) => total + (v.valorTotal || 0), 0);
                
                // Retornar relatório
                resolve({
                    veiculos: veiculosFiltrados,
                    totalVeiculos: veiculosFiltrados.length,
                    totalValor
                });
            }, 1000);
        });
    },
    
    // Obter relatório de serviços
    obterRelatorioServicos: function(filtros) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    resolve({
                        servicos: [],
                        totalServicos: 0,
                        totalValor: 0
                    });
                    return;
                }
                
                // Buscar veículos da empresa atual
                const veiculos = utils.getStorageData('veiculos');
                
                // Filtrar veículos da empresa atual
                let veiculosFiltrados = veiculos.filter(v => 
                    v.empresaId === session.empresaId && 
                    v.servicos && 
                    v.servicos.length > 0
                );
                
                // Aplicar filtros
                if (filtros) {
                    // Filtro de data
                    if (filtros.dataInicio) {
                        const dataInicio = new Date(filtros.dataInicio).setHours(0, 0, 0, 0);
                        veiculosFiltrados = veiculosFiltrados.filter(v => v.entrada >= dataInicio);
                    }
                    
                    if (filtros.dataFim) {
                        const dataFim = new Date(filtros.dataFim).setHours(23, 59, 59, 999);
                        veiculosFiltrados = veiculosFiltrados.filter(v => v.entrada <= dataFim);
                    }
                    
                    // Filtro de status
                    if (filtros.status && filtros.status !== 'todos') {
                        veiculosFiltrados = veiculosFiltrados.filter(v => v.status === filtros.status);
                    }
                }
                
                // Extrair serviços
                const servicosRealizados = [];
                
                veiculosFiltrados.forEach(veiculo => {
                    veiculo.servicos.forEach(servico => {
                        servicosRealizados.push({
                            id: servico.id,
                            nome: servico.nome,
                            valor: servico.valor,
                            dataAdicao: servico.dataAdicao,
                            veiculoPlaca: veiculo.placa,
                            veiculoTicket: veiculo.ticket,
                            veiculoEntrada: veiculo.entrada,
                            veiculoSaida: veiculo.saida,
                            veiculoStatus: veiculo.status
                        });
                    });
                });
                
                // Ordenar por data (mais recentes primeiro)
                servicosRealizados.sort((a, b) => b.dataAdicao - a.dataAdicao);
                
                // Calcular total
                const totalValor = servicosRealizados.reduce((total, s) => total + s.valor, 0);
                
                // Retornar relatório
                resolve({
                    servicos: servicosRealizados,
                    totalServicos: servicosRealizados.length,
                    totalValor
                });
            }, 1000);
        });
    },
    
    // Obter estatísticas
    obterEstatisticas: function(periodo = 'hoje') {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Obter ID da empresa atual
                const session = JSON.parse(localStorage.getItem('session') || 'null');
                if (!session) {
                    resolve({
                        veiculosNoPatio: 0,
                        veiculosEntrada: 0,
                        veiculosSaida: 0,
                        valorTotal: 0,
                        servicosRealizados: 0,
                        valorServicos: 0
                    });
                    return;
                }
                
                // Buscar veículos da empresa atual
                const veiculos = utils.getStorageData('veiculos');
                
                // Filtrar veículos da empresa atual
                const veiculosEmpresa = veiculos.filter(v => 
                    v.empresaId === session.empresaId
                );
                
                // Definir período
                const hoje = new Date();
                hoje.setHours(0, 0, 0, 0);
                
                const inicioSemana = new Date(hoje);
                inicioSemana.setDate(hoje.getDate() - hoje.getDay());
                
                const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
                
                const inicioAno = new Date(hoje.getFullYear(), 0, 1);
                
                let dataInicio;
                
                switch (periodo) {
                    case 'hoje':
                        dataInicio = hoje;
                        break;
                    case 'semana':
                        dataInicio = inicioSemana;
                        break;
                    case 'mes':
                        dataInicio = inicioMes;
                        break;
                    case 'ano':
                        dataInicio = inicioAno;
                        break;
                    default:
                        dataInicio = hoje;
                }
                
                // Filtrar por período
                const veiculosPeriodo = veiculosEmpresa.filter(v => v.entrada >= dataInicio.getTime());
                
                // Calcular estatísticas
                const veiculosNoPatio = veiculosEmpresa.filter(v => v.status === 'no-patio').length;
                const veiculosEntrada = veiculosPeriodo.length;
                const veiculosSaida = veiculosPeriodo.filter(v => v.status === 'saiu').length;
                const valorTotal = veiculosPeriodo.reduce((total, v) => total + (v.valorTotal || 0), 0);
                
                // Contar serviços
                let servicosRealizados = 0;
                let valorServicos = 0;
                
                veiculosPeriodo.forEach(veiculo => {
                    if (veiculo.servicos && veiculo.servicos.length > 0) {
                        servicosRealizados += veiculo.servicos.length;
                        veiculo.servicos.forEach(servico => {
                            valorServicos += servico.valor;
                        });
                    }
                });
                
                // Retornar estatísticas
                resolve({
                    veiculosNoPatio,
                    veiculosEntrada,
                    veiculosSaida,
                    valorTotal,
                    servicosRealizados,
                    valorServicos
                });
            }, 800);
        });
    }
};
