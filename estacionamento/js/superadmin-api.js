// Arquivo para APIs específicas do superadmin
// Contém funções para gerenciamento de empresas e superadmin

// Namespace para APIs do superadmin
const superadminAPI = {
    // Autenticar superadmin
    autenticarSuperadmin: function(login, senha) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar superadmins
                const superadmins = JSON.parse(localStorage.getItem('superadmins') || '[]');
                
                // Se não existir nenhum superadmin, criar o padrão
                if (superadmins.length === 0) {
                    const superadminPadrao = {
                        id: 'super_' + Date.now().toString(36),
                        nome: 'Super Admin',
                        email: 'admin@sistema.com',
                        login: 'superadmin',
                        senha: 'super123',
                        dataCriacao: new Date().getTime()
                    };
                    
                    superadmins.push(superadminPadrao);
                    localStorage.setItem('superadmins', JSON.stringify(superadmins));
                }
                
                // Buscar superadmin pelo login
                const superadmin = superadmins.find(s => s.login === login);
                
                if (!superadmin) {
                    reject({ mensagem: 'Usuário não encontrado' });
                    return;
                }
                
                // Verificar senha
                if (superadmin.senha !== senha) {
                    reject({ mensagem: 'Senha incorreta' });
                    return;
                }
                
                // Criar sessão
                const session = {
                    id: superadmin.id,
                    nome: superadmin.nome,
                    email: superadmin.email,
                    login: superadmin.login,
                    dataLogin: new Date().getTime()
                };
                
                // Salvar sessão
                localStorage.setItem('superadmin_session', JSON.stringify(session));
                
                // Retornar sessão
                resolve(session);
            }, 800);
        });
    },
    
    // Verificar sessão do superadmin
    verificarSessaoSuperadmin: function() {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar sessão
                const session = JSON.parse(localStorage.getItem('superadmin_session') || 'null');
                
                if (!session) {
                    reject({ mensagem: 'Sessão não encontrada' });
                    return;
                }
                
                // Retornar sessão
                resolve(session);
            }, 300);
        });
    },
    
    // Encerrar sessão do superadmin
    encerrarSessaoSuperadmin: function() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Remover sessão
                localStorage.removeItem('superadmin_session');
                
                // Retornar sucesso
                resolve({ mensagem: 'Sessão encerrada com sucesso' });
            }, 500);
        });
    },
    
    // Obter estatísticas globais
    obterEstatisticasGlobais: function() {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar empresas
                const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
                
                // Contar empresas ativas
                const empresasAtivas = empresas.filter(e => e.status).length;
                
                // Contar licenças vencendo
                const hoje = new Date().getTime();
                const licencasVencendo = empresas.filter(e => {
                    const diasRestantes = Math.floor((e.dataFimLicenca - hoje) / (24 * 60 * 60 * 1000));
                    return diasRestantes >= 0 && diasRestantes <= 30;
                }).length;
                
                // Contar veículos
                let totalVeiculos = 0;
                
                empresas.forEach(empresa => {
                    // Buscar veículos da empresa
                    const veiculosKey = `${empresa.id}_veiculos`;
                    const veiculos = JSON.parse(localStorage.getItem(veiculosKey) || '[]');
                    
                    totalVeiculos += veiculos.length;
                });
                
                // Retornar estatísticas
                resolve({
                    totalEmpresas: empresas.length,
                    empresasAtivas,
                    licencasVencendo,
                    totalVeiculos
                });
            }, 800);
        });
    },
    
    // Listar empresas
    listarEmpresas: function(filtros = {}) {
        return new Promise((resolve) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar empresas
                const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
                
                // Aplicar filtros
                let empresasFiltradas = [...empresas];
                
                if (filtros.status && filtros.status !== 'todos') {
                    const status = filtros.status === 'ativo';
                    empresasFiltradas = empresasFiltradas.filter(e => e.status === status);
                }
                
                if (filtros.licenca && filtros.licenca !== 'todas') {
                    const hoje = new Date().getTime();
                    
                    if (filtros.licenca === 'vigente') {
                        empresasFiltradas = empresasFiltradas.filter(e => e.dataFimLicenca > hoje);
                    } else if (filtros.licenca === 'vencendo') {
                        empresasFiltradas = empresasFiltradas.filter(e => {
                            const diasRestantes = Math.floor((e.dataFimLicenca - hoje) / (24 * 60 * 60 * 1000));
                            return diasRestantes >= 0 && diasRestantes <= 30;
                        });
                    } else if (filtros.licenca === 'vencida') {
                        empresasFiltradas = empresasFiltradas.filter(e => e.dataFimLicenca <= hoje);
                    }
                }
                
                if (filtros.busca) {
                    const busca = filtros.busca.toLowerCase();
                    empresasFiltradas = empresasFiltradas.filter(e => 
                        e.nome.toLowerCase().includes(busca) || 
                        e.cnpj.toLowerCase().includes(busca) || 
                        e.email.toLowerCase().includes(busca) || 
                        e.responsavel.toLowerCase().includes(busca)
                    );
                }
                
                // Ordenar por status (ativas primeiro) e depois por nome
                empresasFiltradas.sort((a, b) => {
                    if (a.status !== b.status) {
                        return a.status ? -1 : 1;
                    }
                    return a.nome.localeCompare(b.nome);
                });
                
                // Retornar empresas
                resolve(empresasFiltradas);
            }, 800);
        });
    },
    
    // Obter empresa
    obterEmpresa: function(id) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar empresas
                const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
                
                // Buscar empresa pelo ID
                const empresa = empresas.find(e => e.id === id);
                
                if (!empresa) {
                    reject({ mensagem: 'Empresa não encontrada' });
                    return;
                }
                
                // Retornar empresa
                resolve(empresa);
            }, 500);
        });
    },
    
    // Cadastrar empresa
    cadastrarEmpresa: function(dadosEmpresa, dadosAdmin) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Validar campos obrigatórios da empresa
                if (!dadosEmpresa.nome || !dadosEmpresa.cnpj || !dadosEmpresa.telefone || 
                    !dadosEmpresa.email || !dadosEmpresa.endereco || !dadosEmpresa.responsavel || 
                    !dadosEmpresa.dataInicioLicenca || !dadosEmpresa.dataFimLicenca) {
                    reject({ mensagem: 'Todos os campos da empresa são obrigatórios' });
                    return;
                }
                
                // Validar campos obrigatórios do administrador
                if (!dadosAdmin.nome || !dadosAdmin.email || !dadosAdmin.login || !dadosAdmin.senha) {
                    reject({ mensagem: 'Todos os campos do administrador são obrigatórios' });
                    return;
                }
                
                // Buscar empresas
                const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
                
                // Verificar se já existe empresa com o mesmo CNPJ
                const cnpjExistente = empresas.find(e => e.cnpj === dadosEmpresa.cnpj);
                
                if (cnpjExistente) {
                    reject({ mensagem: 'Já existe uma empresa com este CNPJ' });
                    return;
                }
                
                // Verificar se já existe empresa com o mesmo email
                const emailExistente = empresas.find(e => e.email === dadosEmpresa.email);
                
                if (emailExistente) {
                    reject({ mensagem: 'Já existe uma empresa com este email' });
                    return;
                }
                
                // Buscar usuários
                const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                
                // Verificar se já existe usuário com o mesmo login
                const loginExistente = usuarios.find(u => u.login === dadosAdmin.login);
                
                if (loginExistente) {
                    reject({ mensagem: 'Já existe um usuário com este login' });
                    return;
                }
                
                // Verificar se já existe usuário com o mesmo email
                const emailAdminExistente = usuarios.find(u => u.email === dadosAdmin.email);
                
                if (emailAdminExistente) {
                    reject({ mensagem: 'Já existe um usuário com este email' });
                    return;
                }
                
                // Criar ID da empresa
                const empresaId = 'emp_' + Date.now().toString(36) + Math.random().toString(36).substr(2);
                
                // Criar objeto da empresa
                const novaEmpresa = {
                    id: empresaId,
                    nome: dadosEmpresa.nome,
                    cnpj: dadosEmpresa.cnpj,
                    telefone: dadosEmpresa.telefone,
                    email: dadosEmpresa.email,
                    endereco: dadosEmpresa.endereco,
                    responsavel: dadosEmpresa.responsavel,
                    logo: dadosEmpresa.logo || '',
                    dataInicioLicenca: new Date(dadosEmpresa.dataInicioLicenca).getTime(),
                    dataFimLicenca: new Date(dadosEmpresa.dataFimLicenca).getTime(),
                    status: dadosEmpresa.status === true || dadosEmpresa.status === 'true',
                    dataCriacao: new Date().getTime()
                };
                
                // Criar objeto do administrador
                const novoAdmin = {
                    id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substr(2),
                    empresaId: empresaId,
                    nome: dadosAdmin.nome,
                    email: dadosAdmin.email,
                    login: dadosAdmin.login,
                    senha: dadosAdmin.senha,
                    nivel: 'admin',
                    dataCriacao: new Date().getTime(),
                    dataAtualizacao: new Date().getTime()
                };
                
                // Adicionar empresa
                empresas.push(novaEmpresa);
                localStorage.setItem('empresas', JSON.stringify(empresas));
                
                // Adicionar administrador
                usuarios.push(novoAdmin);
                localStorage.setItem('usuarios', JSON.stringify(usuarios));
                
                // Criar tabela de preços padrão
                const precos = JSON.parse(localStorage.getItem('precos') || '[]');
                
                const precoPadrao = {
                    id: 'prc_' + Date.now().toString(36) + Math.random().toString(36).substr(2),
                    empresaId: empresaId,
                    nome: 'Tabela Padrão',
                    descricao: 'Tabela de preços padrão',
                    valorPrimeiraHora: 10,
                    valorHoraAdicional: 5,
                    valorDiaria: 30,
                    valorMensalidade: 300,
                    ativo: true,
                    dataCriacao: new Date().getTime()
                };
                
                precos.push(precoPadrao);
                localStorage.setItem('precos', JSON.stringify(precos));
                
                // Retornar empresa
                resolve(novaEmpresa);
            }, 1000);
        });
    },
    
    // Atualizar empresa
    atualizarEmpresa: function(id, dadosEmpresa) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Validar campos obrigatórios
                if (!dadosEmpresa.nome || !dadosEmpresa.cnpj || !dadosEmpresa.telefone || 
                    !dadosEmpresa.email || !dadosEmpresa.endereco || !dadosEmpresa.responsavel || 
                    !dadosEmpresa.dataInicioLicenca || !dadosEmpresa.dataFimLicenca) {
                    reject({ mensagem: 'Todos os campos são obrigatórios' });
                    return;
                }
                
                // Buscar empresas
                const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
                
                // Buscar índice da empresa
                const index = empresas.findIndex(e => e.id === id);
                
                if (index === -1) {
                    reject({ mensagem: 'Empresa não encontrada' });
                    return;
                }
                
                // Verificar se já existe empresa com o mesmo CNPJ
                const cnpjExistente = empresas.find(e => e.cnpj === dadosEmpresa.cnpj && e.id !== id);
                
                if (cnpjExistente) {
                    reject({ mensagem: 'Já existe uma empresa com este CNPJ' });
                    return;
                }
                
                // Verificar se já existe empresa com o mesmo email
                const emailExistente = empresas.find(e => e.email === dadosEmpresa.email && e.id !== id);
                
                if (emailExistente) {
                    reject({ mensagem: 'Já existe uma empresa com este email' });
                    return;
                }
                
                // Atualizar empresa
                empresas[index] = {
                    ...empresas[index],
                    nome: dadosEmpresa.nome,
                    cnpj: dadosEmpresa.cnpj,
                    telefone: dadosEmpresa.telefone,
                    email: dadosEmpresa.email,
                    endereco: dadosEmpresa.endereco,
                    responsavel: dadosEmpresa.responsavel,
                    logo: dadosEmpresa.logo || empresas[index].logo,
                    dataInicioLicenca: new Date(dadosEmpresa.dataInicioLicenca).getTime(),
                    dataFimLicenca: new Date(dadosEmpresa.dataFimLicenca).getTime(),
                    status: dadosEmpresa.status === true || dadosEmpresa.status === 'true'
                };
                
                // Salvar empresas
                localStorage.setItem('empresas', JSON.stringify(empresas));
                
                // Retornar empresa atualizada
                resolve(empresas[index]);
            }, 1000);
        });
    },
    
    // Alterar status da empresa
    alterarStatusEmpresa: function(id, status) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar empresas
                const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
                
                // Buscar índice da empresa
                const index = empresas.findIndex(e => e.id === id);
                
                if (index === -1) {
                    reject({ mensagem: 'Empresa não encontrada' });
                    return;
                }
                
                // Atualizar status
                empresas[index].status = status;
                
                // Salvar empresas
                localStorage.setItem('empresas', JSON.stringify(empresas));
                
                // Retornar empresa atualizada
                resolve(empresas[index]);
            }, 800);
        });
    },
    
    // Obter estatísticas da empresa
    obterEstatisticasEmpresa: function(id) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar empresas
                const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
                
                // Buscar empresa pelo ID
                const empresa = empresas.find(e => e.id === id);
                
                if (!empresa) {
                    reject({ mensagem: 'Empresa não encontrada' });
                    return;
                }
                
                // Buscar usuários da empresa
                const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                const usuariosEmpresa = usuarios.filter(u => u.empresaId === id);
                
                // Buscar veículos da empresa
                const veiculosKey = `${id}_veiculos`;
                const veiculos = JSON.parse(localStorage.getItem(veiculosKey) || '[]');
                
                // Buscar mensalistas da empresa
                const mensalistasKey = `${id}_mensalistas`;
                const mensalistas = JSON.parse(localStorage.getItem(mensalistasKey) || '[]');
                
                // Buscar serviços da empresa
                const servicosKey = `${id}_servicos`;
                const servicos = JSON.parse(localStorage.getItem(servicosKey) || '[]');
                
                // Retornar estatísticas
                resolve({
                    totalUsuarios: usuariosEmpresa.length,
                    totalVeiculos: veiculos.length,
                    totalMensalistas: mensalistas.length,
                    totalServicos: servicos.length
                });
            }, 800);
        });
    },
    
    // Acessar como administrador
    acessarComoAdmin: function(id) {
        return new Promise((resolve, reject) => {
            // Simular delay de rede
            setTimeout(() => {
                // Buscar empresas
                const empresas = JSON.parse(localStorage.getItem('empresas') || '[]');
                
                // Buscar empresa pelo ID
                const empresa = empresas.find(e => e.id === id);
                
                if (!empresa) {
                    reject({ mensagem: 'Empresa não encontrada' });
                    return;
                }
                
                // Verificar se a empresa está ativa
                if (!empresa.status) {
                    reject({ mensagem: 'Empresa inativa' });
                    return;
                }
                
                // Verificar se a licença está válida
                const hoje = new Date().getTime();
                if (empresa.dataFimLicenca < hoje) {
                    reject({ mensagem: 'Licença expirada' });
                    return;
                }
                
                // Buscar usuários da empresa
                const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
                const admin = usuarios.find(u => u.empresaId === id && u.nivel === 'admin');
                
                if (!admin) {
                    reject({ mensagem: 'Administrador não encontrado' });
                    return;
                }
                
                // Criar sessão
                const session = {
                    id: admin.id,
                    empresaId: admin.empresaId,
                    empresa: empresa.nome,
                    nome: admin.nome,
                    email: admin.email,
                    login: admin.login,
                    nivel: admin.nivel,
                    dataLogin: new Date().getTime(),
                    superadminAccess: true
                };
                
                // Salvar sessão
                localStorage.setItem('session', JSON.stringify(session));
                
                // Retornar sessão
                resolve(session);
            }, 800);
        });
    }
};
