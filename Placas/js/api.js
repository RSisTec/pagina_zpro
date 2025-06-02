/**
 * Arquivo de simulação de API
 * Responsável por simular as chamadas de API para o backend
 */

// Simulação de banco de dados local
const db = {
    usuarios: [],
    codigosEnviados: {},
    sessaoAtual: null
};

// Simulação de API de cadastro
function apiCadastro(dados) {
    return new Promise((resolve, reject) => {
        // Simulando delay de rede
        setTimeout(() => {
            // Verificar se e-mail já existe
            const emailExiste = db.usuarios.some(user => user.email === dados.email);
            if (emailExiste) {
                reject({
                    success: false,
                    message: "Este e-mail já está cadastrado em nossa base de dados."
                });
                return;
            }
            
            // Verificar se documento já existe
            const documentoExiste = db.usuarios.some(user => user.documento === dados.documento);
            if (documentoExiste) {
                reject({
                    success: false,
                    message: "Este CPF/CNPJ já está cadastrado em nossa base de dados."
                });
                return;
            }
            
            // Gerar ID de usuário temporário
            const userId = 'user_' + Math.random().toString(36).substr(2, 9);
            
            // Gerar código de verificação (6 dígitos)
            const codigo = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Armazenar código para validação posterior
            db.codigosEnviados[userId] = {
                codigo: codigo,
                expiraEm: new Date().getTime() + (5 * 60 * 1000), // 5 minutos
                dados: dados
            };
            
            console.log(`Código gerado para ${dados.telefone}: ${codigo}`);
            
            resolve({
                success: true,
                message: "Código enviado com sucesso para o seu WhatsApp.",
                userId: userId
            });
        }, 1500); // Delay de 1.5 segundos para simular rede
    });
}

// Simulação de API de confirmação de código
function apiConfirmarCodigo(userId, codigo) {
    return new Promise((resolve, reject) => {
        // Simulando delay de rede
        setTimeout(() => {
            // Verificar se o userId existe
            if (!db.codigosEnviados[userId]) {
                reject({
                    success: false,
                    message: "Sessão expirada. Por favor, tente novamente."
                });
                return;
            }
            
            const registroEnvio = db.codigosEnviados[userId];
            
            // Verificar se o código expirou
            if (new Date().getTime() > registroEnvio.expiraEm) {
                reject({
                    success: false,
                    message: "Código expirado. Por favor, solicite um novo código."
                });
                return;
            }
            
            // Verificar se o código está correto
            if (registroEnvio.codigo !== codigo) {
                reject({
                    success: false,
                    message: "Código inválido. Por favor, verifique e tente novamente."
                });
                return;
            }
            
            // Criar usuário
            const novoUsuario = {
                id: userId,
                nome: registroEnvio.dados.nome,
                documento: registroEnvio.dados.documento,
                email: registroEnvio.dados.email,
                telefone: registroEnvio.dados.telefone,
                creditos: 5,
                dataCadastro: new Date()
            };
            
            // Adicionar ao "banco de dados"
            db.usuarios.push(novoUsuario);
            
            // Limpar código usado
            delete db.codigosEnviados[userId];
            
            // Definir sessão atual
            db.sessaoAtual = novoUsuario;
            
            resolve({
                success: true,
                message: "Cadastro realizado com sucesso!",
                usuario: {
                    id: novoUsuario.id,
                    nome: novoUsuario.nome,
                    email: novoUsuario.email,
                    creditos: novoUsuario.creditos
                }
            });
        }, 1500); // Delay de 1.5 segundos para simular rede
    });
}

// Simulação de API de reenvio de código
function apiReenviarCodigo(userId) {
    return new Promise((resolve, reject) => {
        // Simulando delay de rede
        setTimeout(() => {
            // Verificar se o userId existe
            if (!db.codigosEnviados[userId]) {
                reject({
                    success: false,
                    message: "Sessão expirada. Por favor, tente novamente."
                });
                return;
            }
            
            const registroEnvio = db.codigosEnviados[userId];
            
            // Gerar novo código de verificação (6 dígitos)
            const novoCodigo = Math.floor(100000 + Math.random() * 900000).toString();
            
            // Atualizar código e tempo de expiração
            db.codigosEnviados[userId] = {
                codigo: novoCodigo,
                expiraEm: new Date().getTime() + (5 * 60 * 1000), // 5 minutos
                dados: registroEnvio.dados
            };
            
            console.log(`Novo código gerado para ${registroEnvio.dados.telefone}: ${novoCodigo}`);
            
            resolve({
                success: true,
                message: "Novo código enviado com sucesso para o seu WhatsApp."
            });
        }, 1500); // Delay de 1.5 segundos para simular rede
    });
}

// Simulação de API de login
function apiLogin(email, senha) {
    return new Promise((resolve, reject) => {
        // Simulando delay de rede
        setTimeout(() => {
            // Nesta simulação, qualquer senha é aceita para um e-mail cadastrado
            const usuario = db.usuarios.find(user => user.email === email);
            
            if (!usuario) {
                reject({
                    success: false,
                    message: "E-mail ou senha incorretos."
                });
                return;
            }
            
            // Definir sessão atual
            db.sessaoAtual = usuario;
            
            resolve({
                success: true,
                message: "Login realizado com sucesso!",
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    creditos: usuario.creditos
                }
            });
        }, 1000); // Delay de 1 segundo para simular rede
    });
}

// Simulação de API de compra de créditos
function apiComprarCreditos(plano) {
    return new Promise((resolve, reject) => {
        // Verificar se há usuário logado
        if (!db.sessaoAtual) {
            reject({
                success: false,
                message: "Usuário não autenticado."
            });
            return;
        }
        
        // Simulando delay de rede
        setTimeout(() => {
            let creditos = 0;
            let valor = 0;
            
            // Definir créditos e valor com base no plano
            switch (plano) {
                case 'basic':
                    creditos = 10;
                    valor = 29.90;
                    break;
                case 'standard':
                    creditos = 30;
                    valor = 69.90;
                    break;
                case 'premium':
                    creditos = 100;
                    valor = 199.90;
                    break;
                default:
                    reject({
                        success: false,
                        message: "Plano inválido."
                    });
                    return;
            }
            
            // Atualizar créditos do usuário
            const usuario = db.usuarios.find(user => user.id === db.sessaoAtual.id);
            if (usuario) {
                usuario.creditos += creditos;
                db.sessaoAtual = usuario;
                
                resolve({
                    success: true,
                    message: `Compra realizada com sucesso! ${creditos} créditos foram adicionados à sua conta.`,
                    creditos: usuario.creditos,
                    compra: {
                        plano: plano,
                        creditos: creditos,
                        valor: valor
                    }
                });
            } else {
                reject({
                    success: false,
                    message: "Erro ao processar compra. Tente novamente."
                });
            }
        }, 2000); // Delay de 2 segundos para simular rede
    });
}

// Simulação de API de consulta de placa
function apiConsultarPlaca(placa) {
    return new Promise((resolve, reject) => {
        // Verificar se há usuário logado
        if (!db.sessaoAtual) {
            reject({
                success: false,
                message: "Usuário não autenticado."
            });
            return;
        }
        
        // Verificar se o usuário tem créditos
        if (db.sessaoAtual.creditos <= 0) {
            reject({
                success: false,
                message: "Você não possui créditos suficientes para realizar esta consulta."
            });
            return;
        }
        
        // Simulando delay de rede
        setTimeout(() => {
            // Validar formato da placa
            const placaRegex = /^[A-Z]{3}[0-9][0-9A-Z][0-9]{2}$/;
            if (!placaRegex.test(placa)) {
                reject({
                    success: false,
                    message: "Formato de placa inválido."
                });
                return;
            }
            
            // Debitar crédito
            const usuario = db.usuarios.find(user => user.id === db.sessaoAtual.id);
            if (usuario) {
                usuario.creditos -= 1;
                db.sessaoAtual = usuario;
                
                // Dados fictícios de veículo
                const dadosVeiculo = {
                    placa: placa,
                    marca: ["Volkswagen", "Fiat", "Chevrolet", "Ford", "Toyota", "Honda", "Hyundai", "Renault"][Math.floor(Math.random() * 8)],
                    modelo: "Modelo " + Math.floor(Math.random() * 10),
                    ano: 2010 + Math.floor(Math.random() * 13),
                    cor: ["Preto", "Branco", "Prata", "Vermelho", "Azul", "Cinza"][Math.floor(Math.random() * 6)],
                    situacao: ["Regular", "Regular", "Regular", "Com restrição"][Math.floor(Math.random() * 4)]
                };
                
                resolve({
                    success: true,
                    message: "Consulta realizada com sucesso!",
                    creditos: usuario.creditos,
                    veiculo: dadosVeiculo
                });
            } else {
                reject({
                    success: false,
                    message: "Erro ao processar consulta. Tente novamente."
                });
            }
        }, 1500); // Delay de 1.5 segundos para simular rede
    });
}
