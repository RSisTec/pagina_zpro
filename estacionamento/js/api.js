// Arquivo para simulação de APIs
// Contém funções para consulta de placas, mensalistas, isentos e serviços

// API de Consulta de Placas
class PlacaAPI {
    // Consultar placa
    static consultar(placa) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar veículo no histórico
                const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
                const veiculoHistorico = veiculos.find(v => v.placa === placa);
                
                if (veiculoHistorico) {
                    // Veículo encontrado no histórico
                    resolve({
                        success: true,
                        message: 'Veículo encontrado no histórico',
                        data: {
                            placa: veiculoHistorico.placa,
                            modelo: veiculoHistorico.modelo,
                            cor: veiculoHistorico.cor,
                            jaPassou: true
                        }
                    });
                } else {
                    // Veículo não encontrado no histórico
                    resolve({
                        success: true,
                        message: 'Veículo não encontrado no histórico',
                        data: {
                            placa: placa,
                            jaPassou: false
                        }
                    });
                }
            }, 500);
        });
    }
}

// API de Verificação de Pátio
class PatioAPI {
    // Verificar se veículo está no pátio
    static verificar(placa) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar veículo no pátio
                const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
                const veiculoNoPatio = veiculos.find(v => v.placa === placa && v.status === 'no_patio');
                
                if (veiculoNoPatio) {
                    // Veículo encontrado no pátio
                    resolve({
                        success: true,
                        message: 'Veículo encontrado no pátio',
                        data: {
                            id: veiculoNoPatio.id,
                            placa: veiculoNoPatio.placa,
                            modelo: veiculoNoPatio.modelo,
                            cor: veiculoNoPatio.cor,
                            ticket: veiculoNoPatio.ticket,
                            entrada: veiculoNoPatio.entrada,
                            noPatio: true
                        }
                    });
                } else {
                    // Veículo não encontrado no pátio
                    resolve({
                        success: true,
                        message: 'Veículo não encontrado no pátio',
                        data: {
                            placa: placa,
                            noPatio: false
                        }
                    });
                }
            }, 500);
        });
    }
    
    // Adicionar veículo ao pátio
    static adicionar(veiculo) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Gerar ID e ticket se não existirem
                    if (!veiculo.id) {
                        veiculo.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                    }
                    
                    if (!veiculo.ticket) {
                        const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
                        const ultimoTicket = veiculos.length > 0 ? parseInt(veiculos[veiculos.length - 1].ticket || '0') : 0;
                        veiculo.ticket = String(ultimoTicket + 1).padStart(5, '0');
                    }
                    
                    // Definir data de entrada
                    veiculo.entrada = veiculo.entrada || new Date().getTime();
                    
                    // Definir status
                    veiculo.status = 'no_patio';
                    
                    // Adicionar ao localStorage
                    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
                    veiculos.push(veiculo);
                    localStorage.setItem('veiculos', JSON.stringify(veiculos));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Veículo adicionado com sucesso',
                        data: veiculo
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao adicionar veículo: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
    
    // Remover veículo do pátio (dar baixa)
    static remover(id, formaPagamento, cpfNota) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Buscar veículo
                    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
                    const index = veiculos.findIndex(v => v.id === id && v.status === 'no_patio');
                    
                    if (index === -1) {
                        // Veículo não encontrado
                        resolve({
                            success: false,
                            message: 'Veículo não encontrado no pátio',
                            data: null
                        });
                        return;
                    }
                    
                    // Atualizar veículo
                    const veiculo = veiculos[index];
                    veiculo.saida = new Date().getTime();
                    veiculo.status = 'finalizado';
                    veiculo.formaPagamento = formaPagamento;
                    veiculo.cpfNota = cpfNota;
                    
                    // Calcular valor
                    const dataEntrada = new Date(veiculo.entrada);
                    const dataSaida = new Date(veiculo.saida);
                    const diffMs = dataSaida - dataEntrada;
                    const diffHrs = Math.ceil(diffMs / (1000 * 60 * 60));
                    
                    // Buscar preço atual
                    const precos = JSON.parse(localStorage.getItem('precos') || '[]');
                    if (precos.length > 0) {
                        const precoPadrao = precos[0];
                        
                        // Calcular valor
                        let valor = 0;
                        if (diffHrs <= 1) {
                            valor = precoPadrao.valorPrimeiraHora;
                        } else {
                            valor = precoPadrao.valorPrimeiraHora + (diffHrs - 1) * precoPadrao.valorHoraAdicional;
                        }
                        
                        // Se o valor ultrapassar a diária, cobrar apenas a diária
                        if (valor > precoPadrao.valorDiaria) {
                            valor = precoPadrao.valorDiaria;
                        }
                        
                        veiculo.valorTotal = valor;
                    }
                    
                    // Salvar alterações
                    veiculos[index] = veiculo;
                    localStorage.setItem('veiculos', JSON.stringify(veiculos));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Veículo removido com sucesso',
                        data: veiculo
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao remover veículo: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
    
    // Listar veículos no pátio
    static listar() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar veículos no pátio
                const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
                const veiculosNoPatio = veiculos.filter(v => v.status === 'no_patio');
                
                // Ordenar por data de entrada (mais recente primeiro)
                veiculosNoPatio.sort((a, b) => b.entrada - a.entrada);
                
                // Retornar lista
                resolve({
                    success: true,
                    message: 'Veículos listados com sucesso',
                    data: veiculosNoPatio
                });
            }, 500);
        });
    }
}

// API de Mensalistas
class MensalistaAPI {
    // Verificar se placa pertence a mensalista
    static verificar(placa) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar mensalistas
                const mensalistas = JSON.parse(localStorage.getItem('mensalistas') || '[]');
                
                // Buscar mensalista com a placa
                const mensalista = mensalistas.find(m => m.veiculos.includes(placa));
                
                if (mensalista) {
                    // Mensalista encontrado
                    resolve({
                        success: true,
                        message: 'Veículo pertence a mensalista',
                        data: {
                            id: mensalista.id,
                            nome: mensalista.nome,
                            documento: mensalista.documento,
                            telefone: mensalista.telefone,
                            plano: mensalista.plano,
                            dataInicio: mensalista.dataInicio,
                            dataFim: mensalista.dataFim,
                            ehMensalista: true
                        }
                    });
                } else {
                    // Mensalista não encontrado
                    resolve({
                        success: true,
                        message: 'Veículo não pertence a mensalista',
                        data: {
                            placa: placa,
                            ehMensalista: false
                        }
                    });
                }
            }, 500);
        });
    }
    
    // Listar mensalistas
    static listar() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar mensalistas
                const mensalistas = JSON.parse(localStorage.getItem('mensalistas') || '[]');
                
                // Retornar lista
                resolve({
                    success: true,
                    message: 'Mensalistas listados com sucesso',
                    data: mensalistas
                });
            }, 500);
        });
    }
    
    // Adicionar mensalista
    static adicionar(mensalista) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Gerar ID se não existir
                    if (!mensalista.id) {
                        mensalista.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                    }
                    
                    // Adicionar ao localStorage
                    const mensalistas = JSON.parse(localStorage.getItem('mensalistas') || '[]');
                    mensalistas.push(mensalista);
                    localStorage.setItem('mensalistas', JSON.stringify(mensalistas));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Mensalista adicionado com sucesso',
                        data: mensalista
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao adicionar mensalista: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
    
    // Atualizar mensalista
    static atualizar(id, mensalista) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Buscar mensalistas
                    const mensalistas = JSON.parse(localStorage.getItem('mensalistas') || '[]');
                    const index = mensalistas.findIndex(m => m.id === id);
                    
                    if (index === -1) {
                        // Mensalista não encontrado
                        resolve({
                            success: false,
                            message: 'Mensalista não encontrado',
                            data: null
                        });
                        return;
                    }
                    
                    // Atualizar mensalista
                    mensalistas[index] = { ...mensalistas[index], ...mensalista };
                    
                    // Salvar alterações
                    localStorage.setItem('mensalistas', JSON.stringify(mensalistas));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Mensalista atualizado com sucesso',
                        data: mensalistas[index]
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao atualizar mensalista: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
    
    // Remover mensalista
    static remover(id) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Buscar mensalistas
                    const mensalistas = JSON.parse(localStorage.getItem('mensalistas') || '[]');
                    const index = mensalistas.findIndex(m => m.id === id);
                    
                    if (index === -1) {
                        // Mensalista não encontrado
                        resolve({
                            success: false,
                            message: 'Mensalista não encontrado',
                            data: null
                        });
                        return;
                    }
                    
                    // Remover mensalista
                    const mensalistaRemovido = mensalistas.splice(index, 1)[0];
                    
                    // Salvar alterações
                    localStorage.setItem('mensalistas', JSON.stringify(mensalistas));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Mensalista removido com sucesso',
                        data: mensalistaRemovido
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao remover mensalista: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
}

// API de Isentos
class IsentoAPI {
    // Verificar se placa pertence a isento
    static verificar(placa) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar isentos
                const isentos = JSON.parse(localStorage.getItem('isentos') || '[]');
                
                // Buscar isento com a placa
                const isento = isentos.find(i => i.veiculos.includes(placa));
                
                if (isento) {
                    // Isento encontrado
                    resolve({
                        success: true,
                        message: 'Veículo pertence a isento',
                        data: {
                            id: isento.id,
                            nome: isento.nome,
                            documento: isento.documento,
                            motivo: isento.motivo,
                            ehIsento: true
                        }
                    });
                } else {
                    // Isento não encontrado
                    resolve({
                        success: true,
                        message: 'Veículo não pertence a isento',
                        data: {
                            placa: placa,
                            ehIsento: false
                        }
                    });
                }
            }, 500);
        });
    }
    
    // Listar isentos
    static listar() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar isentos
                const isentos = JSON.parse(localStorage.getItem('isentos') || '[]');
                
                // Retornar lista
                resolve({
                    success: true,
                    message: 'Isentos listados com sucesso',
                    data: isentos
                });
            }, 500);
        });
    }
    
    // Adicionar isento
    static adicionar(isento) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Gerar ID se não existir
                    if (!isento.id) {
                        isento.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                    }
                    
                    // Adicionar ao localStorage
                    const isentos = JSON.parse(localStorage.getItem('isentos') || '[]');
                    isentos.push(isento);
                    localStorage.setItem('isentos', JSON.stringify(isentos));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Isento adicionado com sucesso',
                        data: isento
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao adicionar isento: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
    
    // Atualizar isento
    static atualizar(id, isento) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Buscar isentos
                    const isentos = JSON.parse(localStorage.getItem('isentos') || '[]');
                    const index = isentos.findIndex(i => i.id === id);
                    
                    if (index === -1) {
                        // Isento não encontrado
                        resolve({
                            success: false,
                            message: 'Isento não encontrado',
                            data: null
                        });
                        return;
                    }
                    
                    // Atualizar isento
                    isentos[index] = { ...isentos[index], ...isento };
                    
                    // Salvar alterações
                    localStorage.setItem('isentos', JSON.stringify(isentos));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Isento atualizado com sucesso',
                        data: isentos[index]
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao atualizar isento: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
    
    // Remover isento
    static remover(id) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Buscar isentos
                    const isentos = JSON.parse(localStorage.getItem('isentos') || '[]');
                    const index = isentos.findIndex(i => i.id === id);
                    
                    if (index === -1) {
                        // Isento não encontrado
                        resolve({
                            success: false,
                            message: 'Isento não encontrado',
                            data: null
                        });
                        return;
                    }
                    
                    // Remover isento
                    const isentoRemovido = isentos.splice(index, 1)[0];
                    
                    // Salvar alterações
                    localStorage.setItem('isentos', JSON.stringify(isentos));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Isento removido com sucesso',
                        data: isentoRemovido
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao remover isento: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
}

// API de Serviços
class ServicoAPI {
    // Listar serviços
    static listar() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar serviços
                const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
                
                // Retornar lista
                resolve({
                    success: true,
                    message: 'Serviços listados com sucesso',
                    data: servicos
                });
            }, 500);
        });
    }
    
    // Adicionar serviço
    static adicionar(servico) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Gerar ID se não existir
                    if (!servico.id) {
                        servico.id = Date.now().toString(36) + Math.random().toString(36).substr(2);
                    }
                    
                    // Adicionar ao localStorage
                    const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
                    servicos.push(servico);
                    localStorage.setItem('servicos', JSON.stringify(servicos));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Serviço adicionado com sucesso',
                        data: servico
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao adicionar serviço: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
    
    // Atualizar serviço
    static atualizar(id, servico) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Buscar serviços
                    const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
                    const index = servicos.findIndex(s => s.id === id);
                    
                    if (index === -1) {
                        // Serviço não encontrado
                        resolve({
                            success: false,
                            message: 'Serviço não encontrado',
                            data: null
                        });
                        return;
                    }
                    
                    // Atualizar serviço
                    servicos[index] = { ...servicos[index], ...servico };
                    
                    // Salvar alterações
                    localStorage.setItem('servicos', JSON.stringify(servicos));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Serviço atualizado com sucesso',
                        data: servicos[index]
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao atualizar serviço: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
    
    // Remover serviço
    static remover(id) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Buscar serviços
                    const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
                    const index = servicos.findIndex(s => s.id === id);
                    
                    if (index === -1) {
                        // Serviço não encontrado
                        resolve({
                            success: false,
                            message: 'Serviço não encontrado',
                            data: null
                        });
                        return;
                    }
                    
                    // Remover serviço
                    const servicoRemovido = servicos.splice(index, 1)[0];
                    
                    // Salvar alterações
                    localStorage.setItem('servicos', JSON.stringify(servicos));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Serviço removido com sucesso',
                        data: servicoRemovido
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao remover serviço: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
    
    // Registrar serviço para veículo
    static registrar(placa, idServico, telefone, observacoes) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    // Buscar serviço
                    const servicos = JSON.parse(localStorage.getItem('servicos') || '[]');
                    const servico = servicos.find(s => s.id === idServico);
                    
                    if (!servico) {
                        // Serviço não encontrado
                        resolve({
                            success: false,
                            message: 'Serviço não encontrado',
                            data: null
                        });
                        return;
                    }
                    
                    // Buscar veículo existente ou criar novo
                    const veiculos = JSON.parse(localStorage.getItem('veiculos') || '[]');
                    let veiculo = veiculos.find(v => v.placa === placa);
                    
                    if (!veiculo) {
                        // Criar novo veículo
                        veiculo = {
                            id: Date.now().toString(36) + Math.random().toString(36).substr(2),
                            placa: placa,
                            modelo: 'Não informado',
                            cor: 'Não informado',
                            ticket: String(veiculos.length + 1).padStart(5, '0'),
                            telefone: telefone,
                            entrada: new Date().getTime(),
                            saida: new Date().getTime(), // Já finalizado
                            tipoCliente: 'normal',
                            idCliente: null,
                            servicos: [servico],
                            valorTotal: servico.valor,
                            formaPagamento: null,
                            cpfNota: null,
                            status: 'finalizado',
                            observacoes: observacoes
                        };
                        
                        // Adicionar veículo
                        veiculos.push(veiculo);
                    } else {
                        // Adicionar serviço ao veículo existente
                        veiculo.servicos = veiculo.servicos || [];
                        veiculo.servicos.push(servico);
                        veiculo.valorTotal = (veiculo.valorTotal || 0) + servico.valor;
                        veiculo.observacoes = observacoes;
                        
                        // Atualizar veículo
                        const index = veiculos.findIndex(v => v.id === veiculo.id);
                        if (index !== -1) {
                            veiculos[index] = veiculo;
                        }
                    }
                    
                    // Salvar alterações
                    localStorage.setItem('veiculos', JSON.stringify(veiculos));
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Serviço registrado com sucesso',
                        data: veiculo
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao registrar serviço: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
}

// API de Mensagens
class MensagemAPI {
    // Enviar mensagem para cliente
    static enviar(telefone, mensagem) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                try {
                    console.log(`Mensagem enviada para ${telefone}: ${mensagem}`);
                    
                    // Retornar sucesso
                    resolve({
                        success: true,
                        message: 'Mensagem enviada com sucesso',
                        data: {
                            telefone: telefone,
                            mensagem: mensagem,
                            dataEnvio: new Date().getTime()
                        }
                    });
                } catch (error) {
                    // Retornar erro
                    resolve({
                        success: false,
                        message: 'Erro ao enviar mensagem: ' + error.message,
                        data: null
                    });
                }
            }, 500);
        });
    }
}

// Exportar APIs para uso global
window.API = {
    Placa: PlacaAPI,
    Patio: PatioAPI,
    Mensalista: MensalistaAPI,
    Isento: IsentoAPI,
    Servico: ServicoAPI,
    Mensagem: MensagemAPI
};
