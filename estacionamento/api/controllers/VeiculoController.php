<?php
/**
 * Controlador de veículos
 */
class VeiculoController {
    private $pdo;
    private $auth;
    private $request;
    private $logger;
    private $payload;
    
    /**
     * Construtor
     */
    public function __construct() {
        global $pdo, $auth, $request, $logger;
        
        $this->pdo = $pdo;
        $this->auth = $auth;
        $this->request = $request;
        $this->logger = $logger;
        
        // Verificar autenticação
        $token = $this->request->getAuthToken();
        
        if (!$token) {
            Response::unauthorized('Token não fornecido');
        }
        
        // Validar token
        $payload = $this->auth->validateToken($token);
        
        if (!$payload) {
            Response::unauthorized('Token inválido ou expirado');
        }
        
        $this->payload = $payload;
        
        // Verificar se é usuário e definir empresa_id
        if ($payload['tipo'] === 'usuario') {
            $this->empresaId = $payload['empresa_id'];
        } else if ($payload['tipo'] === 'superadmin' && isset($this->request->getParams()['empresa_id'])) {
            $this->empresaId = $this->request->getParams()['empresa_id'];
        } else if ($payload['tipo'] === 'superadmin') {
            Response::error('ID da empresa é obrigatório', 400);
        }
    }
    
    /**
     * Listar veículos no pátio
     */
    public function index() {
        // Obter parâmetros de filtro
        $params = $this->request->getParams();
        
        // Construir consulta SQL
        $sql = "
            SELECT id, empresa_id, placa, modelo, cor, ticket, telefone, entrada, saida,
                   tipo_cliente, id_cliente, valor_total, forma_pagamento, cpf_nota, status, observacoes
            FROM veiculos
            WHERE empresa_id = :empresa_id
        ";
        
        $sqlParams = [
            'empresa_id' => $this->empresaId
        ];
        
        // Aplicar filtros
        if (isset($params['status']) && !empty($params['status'])) {
            $sql .= " AND status = :status";
            $sqlParams['status'] = $params['status'];
        } else {
            // Por padrão, mostrar apenas veículos no pátio
            $sql .= " AND status = 'no-patio'";
        }
        
        if (isset($params['tipo_cliente']) && !empty($params['tipo_cliente'])) {
            $sql .= " AND tipo_cliente = :tipo_cliente";
            $sqlParams['tipo_cliente'] = $params['tipo_cliente'];
        }
        
        if (isset($params['data_inicio']) && !empty($params['data_inicio'])) {
            $dataInicio = date('Y-m-d', $params['data_inicio'] / 1000);
            $sql .= " AND DATE(entrada) >= :data_inicio";
            $sqlParams['data_inicio'] = $dataInicio;
        }
        
        if (isset($params['data_fim']) && !empty($params['data_fim'])) {
            $dataFim = date('Y-m-d', $params['data_fim'] / 1000);
            $sql .= " AND DATE(entrada) <= :data_fim";
            $sqlParams['data_fim'] = $dataFim;
        }
        
        if (isset($params['busca']) && !empty($params['busca'])) {
            $busca = '%' . $params['busca'] . '%';
            $sql .= " AND (placa ILIKE :busca OR modelo ILIKE :busca OR ticket ILIKE :busca OR telefone ILIKE :busca)";
            $sqlParams['busca'] = $busca;
        }
        
        // Ordenação
        $sql .= " ORDER BY entrada DESC";
        
        // Executar consulta
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($sqlParams);
        $veiculos = $stmt->fetchAll();
        
        // Formatar datas
        foreach ($veiculos as &$veiculo) {
            $veiculo['entrada'] = strtotime($veiculo['entrada']) * 1000;
            $veiculo['saida'] = $veiculo['saida'] ? strtotime($veiculo['saida']) * 1000 : null;
            
            // Calcular tempo de permanência
            if ($veiculo['status'] === 'no-patio') {
                $agora = time() * 1000;
                $veiculo['tempo_permanencia'] = $agora - $veiculo['entrada'];
            } else {
                $veiculo['tempo_permanencia'] = $veiculo['saida'] - $veiculo['entrada'];
            }
        }
        
        // Retornar resposta
        Response::success($veiculos);
    }
    
    /**
     * Obter detalhes de um veículo
     * 
     * @param string $id ID do veículo
     */
    public function show($id) {
        // Buscar veículo
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, placa, modelo, cor, ticket, telefone, entrada, saida,
                   tipo_cliente, id_cliente, valor_total, forma_pagamento, cpf_nota, status, observacoes
            FROM veiculos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculo = $stmt->fetch();
        
        if (!$veiculo) {
            Response::notFound('Veículo não encontrado');
        }
        
        // Formatar datas
        $veiculo['entrada'] = strtotime($veiculo['entrada']) * 1000;
        $veiculo['saida'] = $veiculo['saida'] ? strtotime($veiculo['saida']) * 1000 : null;
        
        // Calcular tempo de permanência
        if ($veiculo['status'] === 'no-patio') {
            $agora = time() * 1000;
            $veiculo['tempo_permanencia'] = $agora - $veiculo['entrada'];
        } else {
            $veiculo['tempo_permanencia'] = $veiculo['saida'] - $veiculo['entrada'];
        }
        
        // Buscar serviços realizados
        $stmt = $this->pdo->prepare("
            SELECT sr.id, sr.servico_id, sr.nome_servico, sr.valor, sr.data_adicao
            FROM servicos_realizados sr
            WHERE sr.veiculo_id = :veiculo_id
        ");
        
        $stmt->execute(['veiculo_id' => $id]);
        $servicos = $stmt->fetchAll();
        
        // Formatar datas dos serviços
        foreach ($servicos as &$servico) {
            $servico['data_adicao'] = strtotime($servico['data_adicao']) * 1000;
        }
        
        // Adicionar serviços ao veículo
        $veiculo['servicos'] = $servicos;
        
        // Buscar dados do cliente se for mensalista ou isento
        if ($veiculo['tipo_cliente'] === 'mensalista' && $veiculo['id_cliente']) {
            $stmt = $this->pdo->prepare("
                SELECT id, nome, documento, telefone, email, plano, data_inicio, data_fim
                FROM mensalistas
                WHERE id = :id AND empresa_id = :empresa_id
            ");
            
            $stmt->execute([
                'id' => $veiculo['id_cliente'],
                'empresa_id' => $this->empresaId
            ]);
            
            $mensalista = $stmt->fetch();
            
            if ($mensalista) {
                // Formatar datas
                $mensalista['data_inicio'] = strtotime($mensalista['data_inicio']) * 1000;
                $mensalista['data_fim'] = strtotime($mensalista['data_fim']) * 1000;
                
                $veiculo['cliente'] = $mensalista;
            }
        } else if ($veiculo['tipo_cliente'] === 'isento' && $veiculo['id_cliente']) {
            $stmt = $this->pdo->prepare("
                SELECT id, nome, documento, motivo
                FROM isentos
                WHERE id = :id AND empresa_id = :empresa_id
            ");
            
            $stmt->execute([
                'id' => $veiculo['id_cliente'],
                'empresa_id' => $this->empresaId
            ]);
            
            $isento = $stmt->fetch();
            
            if ($isento) {
                $veiculo['cliente'] = $isento;
            }
        }
        
        // Retornar resposta
        Response::success($veiculo);
    }
    
    /**
     * Consultar veículo por placa
     * 
     * @param string $placa Placa do veículo
     */
    public function findByPlaca($placa) {
        // Verificar se existe veículo no pátio com esta placa
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, placa, modelo, cor, ticket, telefone, entrada, status
            FROM veiculos
            WHERE placa = :placa AND empresa_id = :empresa_id AND status = 'no-patio'
        ");
        
        $stmt->execute([
            'placa' => $placa,
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculoNoPatio = $stmt->fetch();
        
        if ($veiculoNoPatio) {
            // Veículo já está no pátio
            $veiculoNoPatio['entrada'] = strtotime($veiculoNoPatio['entrada']) * 1000;
            $veiculoNoPatio['ja_no_patio'] = true;
            
            Response::success($veiculoNoPatio);
            return;
        }
        
        // Verificar se é um veículo de mensalista
        $stmt = $this->pdo->prepare("
            SELECT vm.id, vm.placa, vm.modelo, vm.cor, m.id as mensalista_id, m.nome, m.telefone, m.email, m.plano
            FROM veiculos_mensalistas vm
            JOIN mensalistas m ON vm.mensalista_id = m.id
            WHERE vm.placa = :placa AND m.empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'placa' => $placa,
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculoMensalista = $stmt->fetch();
        
        if ($veiculoMensalista) {
            // É um veículo de mensalista
            $veiculoMensalista['tipo_cliente'] = 'mensalista';
            $veiculoMensalista['id_cliente'] = $veiculoMensalista['mensalista_id'];
            
            Response::success($veiculoMensalista);
            return;
        }
        
        // Verificar se é um veículo de isento
        $stmt = $this->pdo->prepare("
            SELECT vi.id, vi.placa, vi.modelo, vi.cor, i.id as isento_id, i.nome, i.documento, i.motivo
            FROM veiculos_isentos vi
            JOIN isentos i ON vi.isento_id = i.id
            WHERE vi.placa = :placa AND i.empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'placa' => $placa,
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculoIsento = $stmt->fetch();
        
        if ($veiculoIsento) {
            // É um veículo de isento
            $veiculoIsento['tipo_cliente'] = 'isento';
            $veiculoIsento['id_cliente'] = $veiculoIsento['isento_id'];
            
            Response::success($veiculoIsento);
            return;
        }
        
        // Verificar se já passou pelo estacionamento antes
        $stmt = $this->pdo->prepare("
            SELECT placa, modelo, cor
            FROM veiculos
            WHERE placa = :placa AND empresa_id = :empresa_id
            ORDER BY entrada DESC
            LIMIT 1
        ");
        
        $stmt->execute([
            'placa' => $placa,
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculoAnterior = $stmt->fetch();
        
        if ($veiculoAnterior) {
            // Já passou pelo estacionamento antes
            $veiculoAnterior['tipo_cliente'] = 'normal';
            $veiculoAnterior['ja_cadastrado'] = true;
            
            Response::success($veiculoAnterior);
            return;
        }
        
        // Veículo novo
        Response::success([
            'placa' => $placa,
            'tipo_cliente' => 'normal',
            'novo' => true
        ]);
    }
    
    /**
     * Consultar veículo por ticket
     * 
     * @param string $ticket Ticket do veículo
     */
    public function findByTicket($ticket) {
        // Buscar veículo pelo ticket
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, placa, modelo, cor, ticket, telefone, entrada, saida,
                   tipo_cliente, id_cliente, valor_total, forma_pagamento, cpf_nota, status, observacoes
            FROM veiculos
            WHERE ticket = :ticket AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'ticket' => $ticket,
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculo = $stmt->fetch();
        
        if (!$veiculo) {
            Response::notFound('Veículo não encontrado');
        }
        
        // Formatar datas
        $veiculo['entrada'] = strtotime($veiculo['entrada']) * 1000;
        $veiculo['saida'] = $veiculo['saida'] ? strtotime($veiculo['saida']) * 1000 : null;
        
        // Calcular tempo de permanência
        if ($veiculo['status'] === 'no-patio') {
            $agora = time() * 1000;
            $veiculo['tempo_permanencia'] = $agora - $veiculo['entrada'];
            
            // Calcular valor a pagar se for cliente normal
            if ($veiculo['tipo_cliente'] === 'normal') {
                // Buscar tabela de preços ativa
                $stmt = $this->pdo->prepare("
                    SELECT id, valor_primeira_hora, valor_hora_adicional, valor_diaria
                    FROM tabelas_precos
                    WHERE empresa_id = :empresa_id AND ativo = true
                ");
                
                $stmt->execute(['empresa_id' => $this->empresaId]);
                $tabela = $stmt->fetch();
                
                if ($tabela) {
                    // Calcular valor com base no tempo de permanência
                    $minutos = floor($veiculo['tempo_permanencia'] / (1000 * 60));
                    $horas = ceil($minutos / 60);
                    
                    if ($horas <= 1) {
                        $valor = $tabela['valor_primeira_hora'];
                    } else if ($horas <= 12) {
                        $valor = $tabela['valor_primeira_hora'] + ($horas - 1) * $tabela['valor_hora_adicional'];
                    } else {
                        $valor = $tabela['valor_diaria'];
                    }
                    
                    $veiculo['valor_calculado'] = $valor;
                }
            }
        } else {
            $veiculo['tempo_permanencia'] = $veiculo['saida'] - $veiculo['entrada'];
        }
        
        // Buscar serviços realizados
        $stmt = $this->pdo->prepare("
            SELECT sr.id, sr.servico_id, sr.nome_servico, sr.valor, sr.data_adicao
            FROM servicos_realizados sr
            WHERE sr.veiculo_id = :veiculo_id
        ");
        
        $stmt->execute(['veiculo_id' => $veiculo['id']]);
        $servicos = $stmt->fetchAll();
        
        // Formatar datas dos serviços e calcular valor total
        $valorServicos = 0;
        foreach ($servicos as &$servico) {
            $servico['data_adicao'] = strtotime($servico['data_adicao']) * 1000;
            $valorServicos += $servico['valor'];
        }
        
        // Adicionar serviços e valor total ao veículo
        $veiculo['servicos'] = $servicos;
        $veiculo['valor_servicos'] = $valorServicos;
        
        if (isset($veiculo['valor_calculado'])) {
            $veiculo['valor_total_calculado'] = $veiculo['valor_calculado'] + $valorServicos;
        }
        
        // Buscar dados do cliente se for mensalista ou isento
        if ($veiculo['tipo_cliente'] === 'mensalista' && $veiculo['id_cliente']) {
            $stmt = $this->pdo->prepare("
                SELECT id, nome, documento, telefone, email, plano, data_inicio, data_fim
                FROM mensalistas
                WHERE id = :id AND empresa_id = :empresa_id
            ");
            
            $stmt->execute([
                'id' => $veiculo['id_cliente'],
                'empresa_id' => $this->empresaId
            ]);
            
            $mensalista = $stmt->fetch();
            
            if ($mensalista) {
                // Formatar datas
                $mensalista['data_inicio'] = strtotime($mensalista['data_inicio']) * 1000;
                $mensalista['data_fim'] = strtotime($mensalista['data_fim']) * 1000;
                
                $veiculo['cliente'] = $mensalista;
            }
        } else if ($veiculo['tipo_cliente'] === 'isento' && $veiculo['id_cliente']) {
            $stmt = $this->pdo->prepare("
                SELECT id, nome, documento, motivo
                FROM isentos
                WHERE id = :id AND empresa_id = :empresa_id
            ");
            
            $stmt->execute([
                'id' => $veiculo['id_cliente'],
                'empresa_id' => $this->empresaId
            ]);
            
            $isento = $stmt->fetch();
            
            if ($isento) {
                $veiculo['cliente'] = $isento;
            }
        }
        
        // Retornar resposta
        Response::success($veiculo);
    }
    
    /**
     * Registrar entrada de veículo
     */
    public function store() {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['placa']) || empty($params['placa'])) {
            Response::error('Placa é obrigatória', 400);
        }
        
        if (!isset($params['modelo']) || empty($params['modelo'])) {
            Response::error('Modelo é obrigatório', 400);
        }
        
        if (!isset($params['cor']) || empty($params['cor'])) {
            Response::error('Cor é obrigatória', 400);
        }
        
        if (!isset($params['telefone']) || empty($params['telefone'])) {
            Response::error('Telefone é obrigatório', 400);
        }
        
        // Verificar se já existe veículo no pátio com esta placa
        $stmt = $this->pdo->prepare("
            SELECT id FROM veiculos
            WHERE placa = :placa AND empresa_id = :empresa_id AND status = 'no-patio'
        ");
        
        $stmt->execute([
            'placa' => $params['placa'],
            'empresa_id' => $this->empresaId
        ]);
        
        if ($stmt->rowCount() > 0) {
            Response::error('Já existe um veículo com esta placa no pátio', 400);
        }
        
        // Gerar ID do veículo
        $id = 'vei_' . uniqid();
        
        // Gerar ticket
        $ticket = strtoupper(substr(md5(uniqid()), 0, 8));
        
        // Definir tipo de cliente e id_cliente
        $tipoCliente = 'normal';
        $idCliente = null;
        
        if (isset($params['tipo_cliente']) && in_array($params['tipo_cliente'], ['normal', 'mensalista', 'isento'])) {
            $tipoCliente = $params['tipo_cliente'];
            
            if ($tipoCliente !== 'normal' && isset($params['id_cliente'])) {
                $idCliente = $params['id_cliente'];
            }
        }
        
        // Inserir veículo
        $stmt = $this->pdo->prepare("
            INSERT INTO veiculos (
                id, empresa_id, placa, modelo, cor, ticket, telefone, entrada,
                tipo_cliente, id_cliente, status, observacoes, data_criacao
            ) VALUES (
                :id, :empresa_id, :placa, :modelo, :cor, :ticket, :telefone, NOW(),
                :tipo_cliente, :id_cliente, 'no-patio', :observacoes, NOW()
            )
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId,
            'placa' => $params['placa'],
            'modelo' => $params['modelo'],
            'cor' => $params['cor'],
            'ticket' => $ticket,
            'telefone' => $params['telefone'],
            'tipo_cliente' => $tipoCliente,
            'id_cliente' => $idCliente,
            'observacoes' => $params['observacoes'] ?? null
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'cadastro', 'veiculos', :registro_id, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar veículo cadastrado
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, placa, modelo, cor, ticket, telefone, entrada,
                   tipo_cliente, id_cliente, status, observacoes
            FROM veiculos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $veiculo = $stmt->fetch();
        
        // Formatar datas
        $veiculo['entrada'] = strtotime($veiculo['entrada']) * 1000;
        
        // Retornar resposta
        Response::success($veiculo, 'Veículo registrado com sucesso', 201);
    }
    
    /**
     * Registrar saída de veículo
     * 
     * @param string $id ID do veículo
     */
    public function registrarSaida($id) {
        // Obter parâmetros
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['valor_total']) || $params['valor_total'] === '') {
            Response::error('Valor total é obrigatório', 400);
        }
        
        if (!isset($params['forma_pagamento']) || empty($params['forma_pagamento'])) {
            Response::error('Forma de pagamento é obrigatória', 400);
        }
        
        // Buscar veículo
        $stmt = $this->pdo->prepare("
            SELECT * FROM veiculos
            WHERE id = :id AND empresa_id = :empresa_id
        ");
        
        $stmt->execute([
            'id' => $id,
            'empresa_id' => $this->empresaId
        ]);
        
        $veiculo = $stmt->fetch();
        
        if (!$veiculo) {
            Response::notFound('Veículo não encontrado');
        }
        
        // Verificar se o veículo já saiu
        if ($veiculo['status'] !== 'no-patio') {
            Response::error('Este veículo já saiu do pátio', 400);
        }
        
        // Atualizar veículo
        $stmt = $this->pdo->prepare("
            UPDATE veiculos
            SET saida = NOW(),
                valor_total = :valor_total,
                forma_pagamento = :forma_pagamento,
                cpf_nota = :cpf_nota,
                status = 'saiu'
            WHERE id = :id
        ");
        
        $stmt->execute([
            'id' => $id,
            'valor_total' => $params['valor_total'],
            'forma_pagamento' => $params['forma_pagamento'],
            'cpf_nota' => $params['cpf_nota'] ?? null
        ]);
        
        // Registrar log
        $stmt = $this->pdo->prepare("
            INSERT INTO logs (
                usuario_id, empresa_id, acao, tabela, registro_id, dados_antigos, dados_novos, ip, data_hora
            ) VALUES (
                :usuario_id, :empresa_id, 'saida', 'veiculos', :registro_id, :dados_antigos, :dados_novos, :ip, NOW()
            )
        ");
        
        $stmt->execute([
            'usuario_id' => $this->payload['tipo'] === 'usuario' ? $this->payload['id'] : null,
            'empresa_id' => $this->empresaId,
            'registro_id' => $id,
            'dados_antigos' => json_encode($veiculo),
            'dados_novos' => json_encode($params),
            'ip' => $this->request->getIp()
        ]);
        
        // Buscar veículo atualizado
        $stmt = $this->pdo->prepare("
            SELECT id, empresa_id, placa, modelo, cor, ticket, telefone, entrada, saida,
                   tipo_cliente, id_cliente, valor_total, forma_pagamento, cpf_nota, status, observacoes
            FROM veiculos
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $id]);
        $veiculoAtualizado = $stmt->fetch();
        
        // Formatar datas
        $veiculoAtualizado['entrada'] = strtotime($veiculoAtualizado['entrada']) * 1000;
        $veiculoAtualizado['saida'] = strtotime($veiculoAtualizado['saida']) * 1000;
        
        // Calcular tempo de permanência
        $veiculoAtualizado['tempo_permanencia'] = $veiculoAtualizado['saida'] - $veiculoAtualizado['entrada'];
        
        // Retornar resposta
        Response::success($veiculoAtualizado, 'Saída de veículo registrada com sucesso');
    }
}
