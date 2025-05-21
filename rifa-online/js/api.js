/**
 * Arquivo para comunicação com APIs externas
 */

// Configuração da API
const API = {
    // URL base da API (deve ser configurada de acordo com o ambiente)
    BASE_URL: 'https://api.rifaonline.com.br',
    
    // Endpoints da API
    ENDPOINTS: {
        RIFAS: '/rifas',
        RIFA_DETALHES: '/rifas/:id',
        RIFA_NUMEROS: '/rifas/:id/numeros',
        RIFA_RESERVAR: '/rifas/:id/reservar',
        RIFA_CONFIRMAR: '/rifas/:id/confirmar',
        PAGAMENTO: '/pagamentos',
        PAGAMENTO_STATUS: '/pagamentos/:id/status',
        AUTH_LOGIN: '/auth/login',
        AUTH_VERIFICAR: '/auth/verificar',
        USUARIO: '/usuario',
        HISTORICO: '/historico'
    },
    
    // Headers padrão para requisições
    getHeaders() {
        const headers = {
            'Content-Type': 'application/json'
        };
        
        // Adiciona token de autenticação se disponível
        const token = utils.obterToken();
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
        
        return headers;
    },
    
    // Método para construir URLs com parâmetros
    buildUrl(endpoint, params = {}) {
        let url = this.BASE_URL + endpoint;
        
        // Substitui parâmetros na URL (ex: :id por um valor real)
        Object.keys(params).forEach(key => {
            url = url.replace(`:${key}`, params[key]);
        });
        
        return url;
    },
    
    // Método genérico para fazer requisições
    async request(method, endpoint, params = {}, data = null) {
        try {
            const url = this.buildUrl(endpoint, params);
            
            const options = {
                method,
                headers: this.getHeaders()
            };
            
            if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                options.body = JSON.stringify(data);
            }
            
            const response = await fetch(url, options);
            
            // Verifica se a resposta é um JSON válido
            const contentType = response.headers.get('content-type');
            const isJson = contentType && contentType.includes('application/json');
            
            // Processa a resposta
            if (isJson) {
                const responseData = await response.json();
                
                // Se a resposta não for bem-sucedida, lança um erro
                if (!response.ok) {
                    throw {
                        status: response.status,
                        message: responseData.message || 'Erro na requisição',
                        data: responseData
                    };
                }
                
                return responseData;
            } else {
                // Para respostas não-JSON
                if (!response.ok) {
                    throw {
                        status: response.status,
                        message: 'Erro na requisição'
                    };
                }
                
                return await response.text();
            }
        } catch (error) {
            console.error('Erro na requisição API:', error);
            
            // Simula resposta para desenvolvimento local
            if (this.BASE_URL.includes('localhost') || this.BASE_URL.includes('rifaonline')) {
                return this.mockResponse(endpoint, params, method, data);
            }
            
            throw error;
        }
    },
    
    // Métodos específicos para cada tipo de requisição
    async get(endpoint, params = {}) {
        return this.request('GET', endpoint, params);
    },
    
    async post(endpoint, params = {}, data = {}) {
        return this.request('POST', endpoint, params, data);
    },
    
    async put(endpoint, params = {}, data = {}) {
        return this.request('PUT', endpoint, params, data);
    },
    
    async delete(endpoint, params = {}) {
        return this.request('DELETE', endpoint, params);
    },
    
    // Métodos específicos para cada funcionalidade
    
    // Obter todas as rifas
    async obterRifas(filtro = {}) {
        // Durante o desenvolvimento, usamos dados mockados
        return this.mockResponse(this.ENDPOINTS.RIFAS, {}, 'GET', filtro);
    },
    
    // Obter detalhes de uma rifa específica
    async obterRifaDetalhes(id) {
        return this.get(this.ENDPOINTS.RIFA_DETALHES, { id });
    },
    
    // Obter números de uma rifa
    async obterNumeros(idRifa) {
        return this.get(this.ENDPOINTS.RIFA_NUMEROS, { id: idRifa });
    },
    
    // Reservar números de uma rifa
    async reservarNumeros(idRifa, dados) {
        return this.post(this.ENDPOINTS.RIFA_RESERVAR, { id: idRifa }, dados);
    },
    
    // Confirmar pagamento de números reservados
    async confirmarPagamento(idRifa, idReserva, dadosPagamento) {
        return this.post(this.ENDPOINTS.RIFA_CONFIRMAR, { id: idRifa }, {
            idReserva,
            ...dadosPagamento
        });
    },
    
    // Autenticação de administrador
    async login(email, senha) {
        return this.post(this.ENDPOINTS.AUTH_LOGIN, {}, { email, senha });
    },
    
    // Verificar autenticação
    async verificarAuth() {
        return this.get(this.ENDPOINTS.AUTH_VERIFICAR);
    },
    
    // Obter histórico de rifas
    async obterHistorico(pagina = 1, filtro = {}) {
        return this.get(this.ENDPOINTS.HISTORICO, { pagina, ...filtro });
    },
    
    // Criar nova rifa (admin)
    async criarRifa(dadosRifa) {
        return this.post(this.ENDPOINTS.RIFAS, {}, dadosRifa);
    },
    
    // Atualizar rifa existente (admin)
    async atualizarRifa(id, dadosRifa) {
        return this.put(this.ENDPOINTS.RIFA_DETALHES, { id }, dadosRifa);
    },
    
    // Excluir rifa (admin)
    async excluirRifa(id) {
        return this.delete(this.ENDPOINTS.RIFA_DETALHES, { id });
    },
    
    // Método para simular respostas da API durante desenvolvimento
    mockResponse(endpoint, params, method, data) {
        // Simulação de atraso de rede
        return new Promise(resolve => {
            setTimeout(() => {
                // Simulação de resposta para diferentes endpoints
                if (endpoint === this.ENDPOINTS.RIFAS) {
                    resolve(this.mockRifas());
                } else if (endpoint.includes('/rifas/') && endpoint.endsWith('/numeros')) {
                    resolve(this.mockNumeros(params.id));
                } else if (endpoint.includes('/rifas/') && !endpoint.includes('/numeros')) {
                    resolve(this.mockRifaDetalhes(params.id));
                } else if (endpoint === this.ENDPOINTS.AUTH_LOGIN) {
                    resolve(this.mockLogin(data.email, data.senha));
                } else if (endpoint === this.ENDPOINTS.HISTORICO) {
                    resolve(this.mockHistorico());
                } else {
                    // Resposta genérica para outros endpoints
                    resolve({
                        success: true,
                        message: 'Operação simulada com sucesso',
                        data: data || {}
                    });
                }
            }, 800); // Simula um atraso de 800ms
        });
    },
    
    // Dados mockados para desenvolvimento
    mockRifas() {
        return {
            success: true,
            data: [
                {
                    id: 'rifa1',
                    titulo: 'iPhone 15 Pro Max',
                    descricao: 'Concorra a um iPhone 15 Pro Max novo, lacrado na caixa. Cor: Titânio Azul, 256GB.',
                    imagem: 'https://placehold.co/600x400/4e54c8/ffffff?text=iPhone+15',
                    valor: 10.00,
                    totalNumeros: 100,
                    numerosVendidos: 37,
                    dataSorteio: '2025-06-15T18:00:00',
                    status: 'ativa'
                },
                {
                    id: 'rifa2',
                    titulo: 'PlayStation 5 + 3 Jogos',
                    descricao: 'PlayStation 5 Edição Digital + 3 jogos à escolha do ganhador + 1 ano de PS Plus.',
                    imagem: 'https://placehold.co/600x400/4e54c8/ffffff?text=PlayStation+5',
                    valor: 5.00,
                    totalNumeros: 200,
                    numerosVendidos: 142,
                    dataSorteio: '2025-05-30T19:00:00',
                    status: 'ativa'
                },
                {
                    id: 'rifa3',
                    titulo: 'Smart TV 65" 4K',
                    descricao: 'Smart TV Samsung 65 polegadas 4K, com sistema Tizen e controle por voz.',
                    imagem: 'https://placehold.co/600x400/4e54c8/ffffff?text=Smart+TV',
                    valor: 8.00,
                    totalNumeros: 150,
                    numerosVendidos: 98,
                    dataSorteio: '2025-06-05T20:00:00',
                    status: 'ativa'
                },
                {
                    id: 'rifa4',
                    titulo: 'Notebook Gamer',
                    descricao: 'Notebook Gamer Acer Predator com Intel i7, 16GB RAM, SSD 512GB e RTX 3060.',
                    imagem: 'https://placehold.co/600x400/4e54c8/ffffff?text=Notebook+Gamer',
                    valor: 15.00,
                    totalNumeros: 80,
                    numerosVendidos: 12,
                    dataSorteio: '2025-07-10T18:00:00',
                    status: 'ativa'
                },
                {
                    id: 'rifa5',
                    titulo: 'Vale Compras R$ 1.000',
                    descricao: 'Vale compras no valor de R$ 1.000 para utilizar em qualquer loja do Shopping.',
                    imagem: 'https://placehold.co/600x400/4e54c8/ffffff?text=Vale+Compras',
                    valor: 2.50,
                    totalNumeros: 500,
                    numerosVendidos: 321,
                    dataSorteio: '2025-05-25T16:00:00',
                    status: 'aguardando'
                },
                {
                    id: 'rifa6',
                    titulo: 'Viagem para Cancún',
                    descricao: 'Pacote de viagem para Cancún para 2 pessoas, com passagens aéreas e 7 diárias em resort all-inclusive.',
                    imagem: 'https://placehold.co/600x400/4e54c8/ffffff?text=Viagem+Cancún',
                    valor: 25.00,
                    totalNumeros: 200,
                    numerosVendidos: 200,
                    dataSorteio: '2025-04-30T15:00:00',
                    status: 'encerrada'
                }
            ]
        };
    },
    
    mockRifaDetalhes(id) {
        const rifas = this.mockRifas().data;
        const rifa = rifas.find(r => r.id === id) || rifas[0];
        
        return {
            success: true,
            data: {
                ...rifa,
                descricaoCompleta: rifa.descricao + ' Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl. Nullam euismod, nisl eget aliquam ultricies, nunc nisl aliquet nunc, quis aliquam nisl nunc quis nisl.',
                regras: [
                    'Os números só serão confirmados após a confirmação do pagamento.',
                    'O sorteio será realizado na data indicada, utilizando a Loteria Federal.',
                    'O resultado será divulgado no site e nas redes sociais.',
                    'O prêmio será entregue em até 30 dias após o sorteio.',
                    'Em caso de cancelamento, o valor será devolvido integralmente.'
                ],
                ganhadores: rifa.status === 'encerrada' ? [
                    {
                        nome: 'João Silva',
                        numero: 42,
                        data: '2025-05-01T15:30:00'
                    }
                ] : []
            }
        };
    },
    
    mockNumeros(idRifa) {
        // Gera números aleatórios para simulação
        const total = 100; // Número total de números na rifa
        const numeros = [];
        
        for (let i = 1; i <= total; i++) {
            // Status aleatório para simulação
            const random = Math.random();
            let status;
            
            if (random < 0.6) {
                status = 'disponivel';
            } else if (random < 0.8) {
                status = 'reservado';
            } else {
                status = 'vendido';
            }
            
            numeros.push({
                numero: i,
                status,
                comprador: status !== 'disponivel' ? {
                    nome: 'Comprador ' + i,
                    email: 'comprador' + i + '@exemplo.com'
                } : null
            });
        }
        
        return {
            success: true,
            data: {
                idRifa,
                numeros
            }
        };
    },
    
    mockLogin(email, senha) {
        // Simula autenticação básica
        if (email === 'admin@rifaonline.com.br' && senha === 'admin123') {
            return {
                success: true,
                data: {
                    token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFkbWluIFJpZmFPbmxpbmUiLCJpYXQiOjE1MTYyMzkwMjJ9',
                    usuario: {
                        id: 1,
                        nome: 'Admin RifaOnline',
                        email: 'admin@rifaonline.com.br',
                        role: 'admin'
                    }
                }
            };
        } else {
            return {
                success: false,
                message: 'Credenciais inválidas'
            };
        }
    },
    
    mockHistorico() {
        return {
            success: true,
            data: {
                rifas: [
                    {
                        id: 'rifa6',
                        titulo: 'Viagem para Cancún',
                        descricao: 'Pacote de viagem para Cancún para 2 pessoas, com passagens aéreas e 7 diárias em resort all-inclusive.',
                        imagem: 'https://placehold.co/600x400/4e54c8/ffffff?text=Viagem+Cancún',
                        dataSorteio: '2025-04-30T15:00:00',
                        status: 'encerrada',
                        totalParticipantes: 150,
                        totalNumeros: 200,
                        ganhadores: [
                            {
                                nome: 'Maria Oliveira',
                                numero: 78,
                                data: '2025-04-30T15:30:00'
                            }
                        ]
                    },
                    {
                        id: 'rifa7',
                        titulo: 'Xbox Series X',
                        descricao: 'Console Xbox Series X novo, com 1 controle e 2 jogos.',
                        imagem: 'https://placehold.co/600x400/4e54c8/ffffff?text=Xbox+Series+X',
                        dataSorteio: '2025-03-15T17:00:00',
                        status: 'encerrada',
                        totalParticipantes: 87,
                        totalNumeros: 100,
                        ganhadores: [
                            {
                                nome: 'Pedro Santos',
                                numero: 42,
                                data: '2025-03-15T17:30:00'
                            }
                        ]
                    },
                    {
                        id: 'rifa8',
                        titulo: 'Bicicleta Elétrica',
                        descricao: 'Bicicleta elétrica com autonomia de 60km e velocidade máxima de 25km/h.',
                        imagem: 'https://placehold.co/600x400/4e54c8/ffffff?text=Bicicleta+Elétrica',
                        dataSorteio: '2025-02-28T16:00:00',
                        status: 'encerrada',
                        totalParticipantes: 120,
                        totalNumeros: 150,
                        ganhadores: [
                            {
                                nome: 'Ana Costa',
                                numero: 137,
                                data: '2025-02-28T16:30:00'
                            }
                        ]
                    }
                ],
                paginacao: {
                    total: 10,
                    porPagina: 3,
                    paginaAtual: 1,
                    totalPaginas: 4
                }
            }
        };
    }
};

// Exporta o objeto API para uso global
window.api = API;
