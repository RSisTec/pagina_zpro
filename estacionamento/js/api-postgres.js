// Arquivo para integração com a API PHP/PostgreSQL
// Este arquivo substitui o api.js anterior baseado em localStorage

// Configuração base da API
const API_BASE_URL = '/api';

// Função para fazer requisições à API
async function fetchAPI(endpoint, method = 'GET', data = null, token = null) {
    const headers = {
        'Content-Type': 'application/json'
    };

    // Adicionar token de autenticação se disponível
    if (token || localStorage.getItem('token')) {
        headers['Authorization'] = `Bearer ${token || localStorage.getItem('token')}`;
    }

    const options = {
        method,
        headers,
        credentials: 'include'
    };

    // Adicionar corpo da requisição se houver dados
    if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        
        // Verificar se a resposta é JSON
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const responseData = await response.json();
            
            // Verificar se a resposta foi bem-sucedida
            if (!response.ok) {
                throw new Error(responseData.message || 'Erro na requisição');
            }
            
            return responseData;
        } else {
            // Se não for JSON, retornar o texto
            const text = await response.text();
            
            if (!response.ok) {
                throw new Error(text || 'Erro na requisição');
            }
            
            return text;
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
        throw error;
    }
}

// API de Autenticação
const AuthAPI = {
    // Login de usuário
    login: async (login, senha) => {
        const response = await fetchAPI('/auth/login', 'POST', { login, senha });
        
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response;
    },
    
    // Login de superadmin
    loginSuperadmin: async (login, senha) => {
        const response = await fetchAPI('/auth/superadmin/login', 'POST', { login, senha });
        
        if (response.data && response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        return response;
    },
    
    // Verificar sessão atual
    verify: async () => {
        try {
            const response = await fetchAPI('/auth/verify');
            
            if (response.data && response.data.user) {
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            
            return response;
        } catch (error) {
            // Se houver erro, limpar dados de autenticação
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            throw error;
        }
    },
    
    // Logout
    logout: async () => {
        try {
            await fetchAPI('/auth/logout', 'POST');
        } finally {
            // Limpar dados de autenticação independente do resultado
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },
    
    // Obter usuário atual
    getCurrentUser: () => {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
    
    // Verificar se está autenticado
    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    },
    
    // Verificar se é superadmin
    isSuperadmin: () => {
        const user = AuthAPI.getCurrentUser();
        return user && user.tipo === 'superadmin';
    },
    
    // Verificar se é admin
    isAdmin: () => {
        const user = AuthAPI.getCurrentUser();
        return user && user.nivel === 'admin';
    }
};

// API de Empresas (Superadmin)
const EmpresaAPI = {
    // Listar empresas
    listar: async (filtros = {}) => {
        const queryParams = new URLSearchParams();
        
        if (filtros.status) queryParams.append('status', filtros.status);
        if (filtros.licenca) queryParams.append('licenca', filtros.licenca);
        if (filtros.busca) queryParams.append('busca', filtros.busca);
        
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return fetchAPI(`/empresas${query}`);
    },
    
    // Obter detalhes de uma empresa
    obter: async (id) => {
        return fetchAPI(`/empresas/${id}`);
    },
    
    // Cadastrar empresa
    cadastrar: async (empresa, admin) => {
        return fetchAPI('/empresas', 'POST', { empresa, admin });
    },
    
    // Atualizar empresa
    atualizar: async (id, dados) => {
        return fetchAPI(`/empresas/${id}`, 'PUT', dados);
    },
    
    // Atualizar status da empresa
    atualizarStatus: async (id, status) => {
        return fetchAPI(`/empresas/${id}/status`, 'PATCH', { status });
    }
};

// API de Usuários
const UsuarioAPI = {
    // Listar usuários
    listar: async (empresaId = null) => {
        const user = AuthAPI.getCurrentUser();
        
        // Se for superadmin, usar o empresaId fornecido
        if (user.tipo === 'superadmin' && empresaId) {
            return fetchAPI(`/usuarios?empresa_id=${empresaId}`);
        }
        
        // Se for usuário normal, usar a empresa do usuário logado
        return fetchAPI('/usuarios');
    },
    
    // Obter detalhes de um usuário
    obter: async (id) => {
        return fetchAPI(`/usuarios/${id}`);
    },
    
    // Cadastrar usuário
    cadastrar: async (dados, empresaId = null) => {
        const user = AuthAPI.getCurrentUser();
        
        // Se for superadmin, adicionar empresaId aos dados
        if (user.tipo === 'superadmin' && empresaId) {
            dados.empresa_id = empresaId;
        }
        
        return fetchAPI('/usuarios', 'POST', dados);
    },
    
    // Atualizar usuário
    atualizar: async (id, dados) => {
        return fetchAPI(`/usuarios/${id}`, 'PUT', dados);
    },
    
    // Excluir usuário
    excluir: async (id) => {
        return fetchAPI(`/usuarios/${id}`, 'DELETE');
    }
};

// API de Veículos
const VeiculoAPI = {
    // Listar veículos
    listar: async (filtros = {}) => {
        const queryParams = new URLSearchParams();
        
        if (filtros.status) queryParams.append('status', filtros.status);
        if (filtros.tipo_cliente) queryParams.append('tipo_cliente', filtros.tipo_cliente);
        if (filtros.data_inicio) queryParams.append('data_inicio', filtros.data_inicio);
        if (filtros.data_fim) queryParams.append('data_fim', filtros.data_fim);
        if (filtros.busca) queryParams.append('busca', filtros.busca);
        
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return fetchAPI(`/veiculos${query}`);
    },
    
    // Obter detalhes de um veículo
    obter: async (id) => {
        return fetchAPI(`/veiculos/${id}`);
    },
    
    // Consultar veículo por placa
    consultarPlaca: async (placa) => {
        return fetchAPI(`/veiculos/placa/${placa}`);
    },
    
    // Consultar veículo por ticket
    consultarTicket: async (ticket) => {
        return fetchAPI(`/veiculos/ticket/${ticket}`);
    },
    
    // Registrar entrada de veículo
    registrarEntrada: async (dados) => {
        return fetchAPI('/veiculos', 'POST', dados);
    },
    
    // Registrar saída de veículo
    registrarSaida: async (id, dados) => {
        return fetchAPI(`/veiculos/${id}/saida`, 'PUT', dados);
    }
};

// API de Mensalistas
const MensalistaAPI = {
    // Listar mensalistas
    listar: async (filtros = {}) => {
        const queryParams = new URLSearchParams();
        
        if (filtros.status) queryParams.append('status', filtros.status);
        if (filtros.plano) queryParams.append('plano', filtros.plano);
        if (filtros.busca) queryParams.append('busca', filtros.busca);
        
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return fetchAPI(`/mensalistas${query}`);
    },
    
    // Obter detalhes de um mensalista
    obter: async (id) => {
        return fetchAPI(`/mensalistas/${id}`);
    },
    
    // Cadastrar mensalista
    cadastrar: async (dados) => {
        return fetchAPI('/mensalistas', 'POST', dados);
    },
    
    // Atualizar mensalista
    atualizar: async (id, dados) => {
        return fetchAPI(`/mensalistas/${id}`, 'PUT', dados);
    },
    
    // Excluir mensalista
    excluir: async (id) => {
        return fetchAPI(`/mensalistas/${id}`, 'DELETE');
    },
    
    // Listar veículos de um mensalista
    listarVeiculos: async (id) => {
        return fetchAPI(`/mensalistas/${id}/veiculos`);
    },
    
    // Adicionar veículo a um mensalista
    adicionarVeiculo: async (id, dados) => {
        return fetchAPI(`/mensalistas/${id}/veiculos`, 'POST', dados);
    },
    
    // Remover veículo de um mensalista
    removerVeiculo: async (id, veiculoId) => {
        return fetchAPI(`/mensalistas/${id}/veiculos/${veiculoId}`, 'DELETE');
    }
};

// API de Isentos
const IsentoAPI = {
    // Listar isentos
    listar: async (filtros = {}) => {
        const queryParams = new URLSearchParams();
        
        if (filtros.motivo) queryParams.append('motivo', filtros.motivo);
        if (filtros.busca) queryParams.append('busca', filtros.busca);
        
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return fetchAPI(`/isentos${query}`);
    },
    
    // Obter detalhes de um isento
    obter: async (id) => {
        return fetchAPI(`/isentos/${id}`);
    },
    
    // Cadastrar isento
    cadastrar: async (dados) => {
        return fetchAPI('/isentos', 'POST', dados);
    },
    
    // Atualizar isento
    atualizar: async (id, dados) => {
        return fetchAPI(`/isentos/${id}`, 'PUT', dados);
    },
    
    // Excluir isento
    excluir: async (id) => {
        return fetchAPI(`/isentos/${id}`, 'DELETE');
    },
    
    // Listar veículos de um isento
    listarVeiculos: async (id) => {
        return fetchAPI(`/isentos/${id}/veiculos`);
    },
    
    // Adicionar veículo a um isento
    adicionarVeiculo: async (id, dados) => {
        return fetchAPI(`/isentos/${id}/veiculos`, 'POST', dados);
    },
    
    // Remover veículo de um isento
    removerVeiculo: async (id, veiculoId) => {
        return fetchAPI(`/isentos/${id}/veiculos/${veiculoId}`, 'DELETE');
    }
};

// API de Serviços
const ServicoAPI = {
    // Listar serviços
    listar: async (filtros = {}) => {
        const queryParams = new URLSearchParams();
        
        if (filtros.ativo !== undefined) queryParams.append('ativo', filtros.ativo);
        if (filtros.busca) queryParams.append('busca', filtros.busca);
        
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return fetchAPI(`/servicos${query}`);
    },
    
    // Obter detalhes de um serviço
    obter: async (id) => {
        return fetchAPI(`/servicos/${id}`);
    },
    
    // Cadastrar serviço
    cadastrar: async (dados) => {
        return fetchAPI('/servicos', 'POST', dados);
    },
    
    // Atualizar serviço
    atualizar: async (id, dados) => {
        return fetchAPI(`/servicos/${id}`, 'PUT', dados);
    },
    
    // Excluir serviço
    excluir: async (id) => {
        return fetchAPI(`/servicos/${id}`, 'DELETE');
    },
    
    // Adicionar serviço a um veículo
    adicionarAoVeiculo: async (veiculoId, servicoId) => {
        return fetchAPI(`/veiculos/${veiculoId}/servicos/${servicoId}`, 'POST');
    },
    
    // Remover serviço de um veículo
    removerDoVeiculo: async (veiculoId, servicoRealizadoId) => {
        return fetchAPI(`/veiculos/${veiculoId}/servicos/${servicoRealizadoId}`, 'DELETE');
    }
};

// API de Preços
const PrecoAPI = {
    // Listar tabelas de preços
    listar: async (filtros = {}) => {
        const queryParams = new URLSearchParams();
        
        if (filtros.ativo !== undefined) queryParams.append('ativo', filtros.ativo);
        if (filtros.busca) queryParams.append('busca', filtros.busca);
        
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return fetchAPI(`/precos${query}`);
    },
    
    // Obter detalhes de uma tabela de preços
    obter: async (id) => {
        return fetchAPI(`/precos/${id}`);
    },
    
    // Cadastrar tabela de preços
    cadastrar: async (dados) => {
        return fetchAPI('/precos', 'POST', dados);
    },
    
    // Atualizar tabela de preços
    atualizar: async (id, dados) => {
        return fetchAPI(`/precos/${id}`, 'PUT', dados);
    },
    
    // Excluir tabela de preços
    excluir: async (id) => {
        return fetchAPI(`/precos/${id}`, 'DELETE');
    },
    
    // Ativar tabela de preços
    ativar: async (id) => {
        return fetchAPI(`/precos/${id}/ativar`, 'PATCH');
    }
};

// API de Relatórios
const RelatorioAPI = {
    // Relatório de veículos
    veiculos: async (filtros) => {
        const queryParams = new URLSearchParams();
        
        if (filtros.dataInicio) queryParams.append('dataInicio', filtros.dataInicio);
        if (filtros.dataFim) queryParams.append('dataFim', filtros.dataFim);
        if (filtros.status) queryParams.append('status', filtros.status);
        if (filtros.tipoCliente) queryParams.append('tipoCliente', filtros.tipoCliente);
        if (filtros.formaPagamento) queryParams.append('formaPagamento', filtros.formaPagamento);
        
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return fetchAPI(`/relatorios/veiculos${query}`);
    },
    
    // Relatório de serviços
    servicos: async (filtros) => {
        const queryParams = new URLSearchParams();
        
        if (filtros.dataInicio) queryParams.append('dataInicio', filtros.dataInicio);
        if (filtros.dataFim) queryParams.append('dataFim', filtros.dataFim);
        if (filtros.servicoId) queryParams.append('servicoId', filtros.servicoId);
        if (filtros.tipoCliente) queryParams.append('tipoCliente', filtros.tipoCliente);
        
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return fetchAPI(`/relatorios/servicos${query}`);
    },
    
    // Relatório de mensalistas
    mensalistas: async (filtros = {}) => {
        const queryParams = new URLSearchParams();
        
        if (filtros.status) queryParams.append('status', filtros.status);
        if (filtros.plano) queryParams.append('plano', filtros.plano);
        
        const query = queryParams.toString() ? `?${queryParams.toString()}` : '';
        return fetchAPI(`/relatorios/mensalistas${query}`);
    },
    
    // Estatísticas gerais
    estatisticas: async () => {
        return fetchAPI('/estatisticas');
    }
};

// Exportar todas as APIs
const API = {
    Auth: AuthAPI,
    Empresa: EmpresaAPI,
    Usuario: UsuarioAPI,
    Veiculo: VeiculoAPI,
    Mensalista: MensalistaAPI,
    Isento: IsentoAPI,
    Servico: ServicoAPI,
    Preco: PrecoAPI,
    Relatorio: RelatorioAPI
};
