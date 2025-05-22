<?php
/**
 * Controlador de relatórios
 */
class RelatorioController {
    private $pdo;
    private $auth;
    private $request;
    private $logger;
    private $payload;
    private $empresaId;
    
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
     * Relatório de veículos
     */
    public function veiculos() {
        // Obter parâmetros de filtro
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['dataInicio']) || empty($params['dataInicio'])) {
            Response::error('Data de início é obrigatória', 400);
        }
        
        if (!isset($params['dataFim']) || empty($params['dataFim'])) {
            Response::error('Data de fim é obrigatória', 400);
        }
        
        // Formatar datas
        $dataInicio = date('Y-m-d', $params['dataInicio'] / 1000);
        $dataFim = date('Y-m-d', $params['dataFim'] / 1000);
        
        // Construir consulta SQL
        $sql = "
            SELECT v.id, v.placa, v.modelo, v.cor, v.ticket, v.telefone, v.entrada, v.saida,
                   v.tipo_cliente, v.id_cliente, v.valor_total, v.forma_pagamento, v.cpf_nota, v.status
            FROM veiculos v
            WHERE v.empresa_id = :empresa_id
              AND DATE(v.entrada) >= :data_inicio
              AND DATE(v.entrada) <= :data_fim
        ";
        
        $sqlParams = [
            'empresa_id' => $this->empresaId,
            'data_inicio' => $dataInicio,
            'data_fim' => $dataFim
        ];
        
        // Aplicar filtros
        if (isset($params['status']) && !empty($params['status'])) {
            $sql .= " AND v.status = :status";
            $sqlParams['status'] = $params['status'];
        }
        
        if (isset($params['tipoCliente']) && !empty($params['tipoCliente'])) {
            $sql .= " AND v.tipo_cliente = :tipo_cliente";
            $sqlParams['tipo_cliente'] = $params['tipoCliente'];
        }
        
        if (isset($params['formaPagamento']) && !empty($params['formaPagamento'])) {
            $sql .= " AND v.forma_pagamento = :forma_pagamento";
            $sqlParams['forma_pagamento'] = $params['formaPagamento'];
        }
        
        // Ordenação
        $sql .= " ORDER BY v.entrada DESC";
        
        // Executar consulta
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($sqlParams);
        $veiculos = $stmt->fetchAll();
        
        // Formatar datas e calcular tempo de permanência
        $totalValor = 0;
        $totalVeiculos = count($veiculos);
        $totalHoras = 0;
        
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
            
            // Calcular horas
            $horas = $veiculo['tempo_permanencia'] / (1000 * 60 * 60);
            $totalHoras += $horas;
            
            // Somar valor total
            if ($veiculo['valor_total']) {
                $totalValor += $veiculo['valor_total'];
            }
            
            // Buscar dados do cliente se for mensalista ou isento
            if ($veiculo['tipo_cliente'] === 'mensalista' && $veiculo['id_cliente']) {
                $stmt = $this->pdo->prepare("
                    SELECT nome FROM mensalistas
                    WHERE id = :id AND empresa_id = :empresa_id
                ");
                
                $stmt->execute([
                    'id' => $veiculo['id_cliente'],
                    'empresa_id' => $this->empresaId
                ]);
                
                $mensalista = $stmt->fetch();
                
                if ($mensalista) {
                    $veiculo['cliente_nome'] = $mensalista['nome'];
                }
            } else if ($veiculo['tipo_cliente'] === 'isento' && $veiculo['id_cliente']) {
                $stmt = $this->pdo->prepare("
                    SELECT nome FROM isentos
                    WHERE id = :id AND empresa_id = :empresa_id
                ");
                
                $stmt->execute([
                    'id' => $veiculo['id_cliente'],
                    'empresa_id' => $this->empresaId
                ]);
                
                $isento = $stmt->fetch();
                
                if ($isento) {
                    $veiculo['cliente_nome'] = $isento['nome'];
                }
            }
        }
        
        // Buscar serviços realizados no período
        $stmt = $this->pdo->prepare("
            SELECT sr.id, sr.veiculo_id, sr.nome_servico, sr.valor, sr.data_adicao,
                   v.placa, v.modelo, v.cor
            FROM servicos_realizados sr
            JOIN veiculos v ON sr.veiculo_id = v.id
            WHERE v.empresa_id = :empresa_id
              AND DATE(sr.data_adicao) >= :data_inicio
              AND DATE(sr.data_adicao) <= :data_fim
        ");
        
        $stmt->execute([
            'empresa_id' => $this->empresaId,
            'data_inicio' => $dataInicio,
            'data_fim' => $dataFim
        ]);
        
        $servicos = $stmt->fetchAll();
        
        // Formatar datas dos serviços
        $totalServicos = count($servicos);
        $totalValorServicos = 0;
        
        foreach ($servicos as &$servico) {
            $servico['data_adicao'] = strtotime($servico['data_adicao']) * 1000;
            $totalValorServicos += $servico['valor'];
        }
        
        // Calcular estatísticas
        $mediaHoras = $totalVeiculos > 0 ? $totalHoras / $totalVeiculos : 0;
        $mediaValor = $totalVeiculos > 0 ? $totalValor / $totalVeiculos : 0;
        
        // Preparar resposta
        $resposta = [
            'veiculos' => $veiculos,
            'servicos' => $servicos,
            'estatisticas' => [
                'total_veiculos' => $totalVeiculos,
                'total_valor' => $totalValor,
                'total_horas' => $totalHoras,
                'media_horas' => $mediaHoras,
                'media_valor' => $mediaValor,
                'total_servicos' => $totalServicos,
                'total_valor_servicos' => $totalValorServicos,
                'total_geral' => $totalValor + $totalValorServicos
            ],
            'filtros' => [
                'data_inicio' => $params['dataInicio'],
                'data_fim' => $params['dataFim'],
                'status' => $params['status'] ?? null,
                'tipo_cliente' => $params['tipoCliente'] ?? null,
                'forma_pagamento' => $params['formaPagamento'] ?? null
            ]
        ];
        
        // Retornar resposta
        Response::success($resposta);
    }
    
    /**
     * Relatório de serviços
     */
    public function servicos() {
        // Obter parâmetros de filtro
        $params = $this->request->getParams();
        
        // Validar parâmetros
        if (!isset($params['dataInicio']) || empty($params['dataInicio'])) {
            Response::error('Data de início é obrigatória', 400);
        }
        
        if (!isset($params['dataFim']) || empty($params['dataFim'])) {
            Response::error('Data de fim é obrigatória', 400);
        }
        
        // Formatar datas
        $dataInicio = date('Y-m-d', $params['dataInicio'] / 1000);
        $dataFim = date('Y-m-d', $params['dataFim'] / 1000);
        
        // Construir consulta SQL
        $sql = "
            SELECT sr.id, sr.veiculo_id, sr.servico_id, sr.nome_servico, sr.valor, sr.data_adicao,
                   v.placa, v.modelo, v.cor, v.tipo_cliente, v.id_cliente
            FROM servicos_realizados sr
            JOIN veiculos v ON sr.veiculo_id = v.id
            WHERE v.empresa_id = :empresa_id
              AND DATE(sr.data_adicao) >= :data_inicio
              AND DATE(sr.data_adicao) <= :data_fim
        ";
        
        $sqlParams = [
            'empresa_id' => $this->empresaId,
            'data_inicio' => $dataInicio,
            'data_fim' => $dataFim
        ];
        
        // Aplicar filtros
        if (isset($params['servicoId']) && !empty($params['servicoId'])) {
            $sql .= " AND sr.servico_id = :servico_id";
            $sqlParams['servico_id'] = $params['servicoId'];
        }
        
        if (isset($params['tipoCliente']) && !empty($params['tipoCliente'])) {
            $sql .= " AND v.tipo_cliente = :tipo_cliente";
            $sqlParams['tipo_cliente'] = $params['tipoCliente'];
        }
        
        // Ordenação
        $sql .= " ORDER BY sr.data_adicao DESC";
        
        // Executar consulta
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($sqlParams);
        $servicos = $stmt->fetchAll();
        
        // Formatar datas
        $totalServicos = count($servicos);
        $totalValor = 0;
        $servicosPorTipo = [];
        
        foreach ($servicos as &$servico) {
            $servico['data_adicao'] = strtotime($servico['data_adicao']) * 1000;
            $totalValor += $servico['valor'];
            
            // Agrupar por tipo de serviço
            if (!isset($servicosPorTipo[$servico['nome_servico']])) {
                $servicosPorTipo[$servico['nome_servico']] = [
                    'nome' => $servico['nome_servico'],
                    'quantidade' => 0,
                    'valor_total' => 0
                ];
            }
            
            $servicosPorTipo[$servico['nome_servico']]['quantidade']++;
            $servicosPorTipo[$servico['nome_servico']]['valor_total'] += $servico['valor'];
            
            // Buscar dados do cliente se for mensalista ou isento
            if ($servico['tipo_cliente'] === 'mensalista' && $servico['id_cliente']) {
                $stmt = $this->pdo->prepare("
                    SELECT nome FROM mensalistas
                    WHERE id = :id AND empresa_id = :empresa_id
                ");
                
                $stmt->execute([
                    'id' => $servico['id_cliente'],
                    'empresa_id' => $this->empresaId
                ]);
                
                $mensalista = $stmt->fetch();
                
                if ($mensalista) {
                    $servico['cliente_nome'] = $mensalista['nome'];
                }
            } else if ($servico['tipo_cliente'] === 'isento' && $servico['id_cliente']) {
                $stmt = $this->pdo->prepare("
                    SELECT nome FROM isentos
                    WHERE id = :id AND empresa_id = :empresa_id
                ");
                
                $stmt->execute([
                    'id' => $servico['id_cliente'],
                    'empresa_id' => $this->empresaId
                ]);
                
                $isento = $stmt->fetch();
                
                if ($isento) {
                    $servico['cliente_nome'] = $isento['nome'];
                }
            }
        }
        
        // Converter array associativo para array indexado
        $resumoServicos = array_values($servicosPorTipo);
        
        // Preparar resposta
        $resposta = [
            'servicos' => $servicos,
            'resumo' => $resumoServicos,
            'estatisticas' => [
                'total_servicos' => $totalServicos,
                'total_valor' => $totalValor,
                'media_valor' => $totalServicos > 0 ? $totalValor / $totalServicos : 0
            ],
            'filtros' => [
                'data_inicio' => $params['dataInicio'],
                'data_fim' => $params['dataFim'],
                'servico_id' => $params['servicoId'] ?? null,
                'tipo_cliente' => $params['tipoCliente'] ?? null
            ]
        ];
        
        // Retornar resposta
        Response::success($resposta);
    }
    
    /**
     * Relatório de mensalistas
     */
    public function mensalistas() {
        // Obter parâmetros de filtro
        $params = $this->request->getParams();
        
        // Construir consulta SQL
        $sql = "
            SELECT id, empresa_id, nome, documento, telefone, email, endereco, plano, 
                   data_inicio, data_fim, data_criacao, data_atualizacao
            FROM mensalistas
            WHERE empresa_id = :empresa_id
        ";
        
        $sqlParams = [
            'empresa_id' => $this->empresaId
        ];
        
        // Aplicar filtros
        if (isset($params['status']) && !empty($params['status'])) {
            $hoje = date('Y-m-d');
            
            if ($params['status'] === 'vigente') {
                $sql .= " AND data_fim >= :hoje";
                $sqlParams['hoje'] = $hoje;
            } else if ($params['status'] === 'vencendo') {
                $trintaDias = date('Y-m-d', strtotime('+30 days'));
                $sql .= " AND data_fim >= :hoje AND data_fim <= :trinta_dias";
                $sqlParams['hoje'] = $hoje;
                $sqlParams['trinta_dias'] = $trintaDias;
            } else if ($params['status'] === 'vencido') {
                $sql .= " AND data_fim < :hoje";
                $sqlParams['hoje'] = $hoje;
            }
        }
        
        if (isset($params['plano']) && !empty($params['plano'])) {
            $sql .= " AND plano = :plano";
            $sqlParams['plano'] = $params['plano'];
        }
        
        // Ordenação
        $sql .= " ORDER BY nome ASC";
        
        // Executar consulta
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($sqlParams);
        $mensalistas = $stmt->fetchAll();
        
        // Formatar datas e adicionar status
        $hoje = time();
        $totalMensalistas = count($mensalistas);
        $mensalistasPorStatus = [
            'vigente' => 0,
            'vencendo' => 0,
            'vencido' => 0
        ];
        $mensalistasPorPlano = [];
        
        foreach ($mensalistas as &$mensalista) {
            $mensalista['data_inicio'] = strtotime($mensalista['data_inicio']) * 1000;
            $mensalista['data_fim'] = strtotime($mensalista['data_fim']) * 1000;
            $mensalista['data_criacao'] = strtotime($mensalista['data_criacao']) * 1000;
            $mensalista['data_atualizacao'] = $mensalista['data_atualizacao'] ? strtotime($mensalista['data_atualizacao']) * 1000 : null;
            
            // Calcular status
            $dataFim = strtotime($mensalista['data_fim']);
            if ($dataFim < $hoje) {
                $mensalista['status'] = 'vencido';
                $mensalistasPorStatus['vencido']++;
            } else if ($dataFim < strtotime('+30 days')) {
                $mensalista['status'] = 'vencendo';
                $mensalistasPorStatus['vencendo']++;
            } else {
                $mensalista['status'] = 'vigente';
                $mensalistasPorStatus['vigente']++;
            }
            
            // Agrupar por plano
            if (!isset($mensalistasPorPlano[$mensalista['plano']])) {
                $mensalistasPorPlano[$mensalista['plano']] = 0;
            }
            $mensalistasPorPlano[$mensalista['plano']]++;
            
            // Buscar veículos do mensalista
            $stmt = $this->pdo->prepare("
                SELECT id, mensalista_id, placa, modelo, cor, data_criacao
                FROM veiculos_mensalistas
                WHERE mensalista_id = :mensalista_id
            ");
            
            $stmt->execute(['mensalista_id' => $mensalista['id']]);
            $veiculos = $stmt->fetchAll();
            
            // Formatar datas dos veículos
            foreach ($veiculos as &$veiculo) {
                $veiculo['data_criacao'] = strtotime($veiculo['data_criacao']) * 1000;
            }
            
            // Adicionar veículos ao mensalista
            $mensalista['veiculos'] = $veiculos;
            $mensalista['total_veiculos'] = count($veiculos);
        }
        
        // Converter array associativo para array indexado
        $resumoPlanos = [];
        foreach ($mensalistasPorPlano as $plano => $quantidade) {
            $resumoPlanos[] = [
                'plano' => $plano,
                'quantidade' => $quantidade
            ];
        }
        
        // Preparar resposta
        $resposta = [
            'mensalistas' => $mensalistas,
            'estatisticas' => [
                'total_mensalistas' => $totalMensalistas,
                'por_status' => $mensalistasPorStatus,
                'por_plano' => $resumoPlanos
            ],
            'filtros' => [
                'status' => $params['status'] ?? null,
                'plano' => $params['plano'] ?? null
            ]
        ];
        
        // Retornar resposta
        Response::success($resposta);
    }
    
    /**
     * Estatísticas gerais
     */
    public function estatisticas() {
        // Obter parâmetros de filtro
        $params = $this->request->getParams();
        
        // Definir período
        $hoje = date('Y-m-d');
        $inicioMes = date('Y-m-01');
        $fimMes = date('Y-m-t');
        $inicioAno = date('Y-01-01');
        $fimAno = date('Y-12-31');
        
        // Estatísticas de veículos
        $stmt = $this->pdo->prepare("
            SELECT
                (SELECT COUNT(*) FROM veiculos WHERE empresa_id = :empresa_id AND status = 'no-patio') AS veiculos_no_patio,
                (SELECT COUNT(*) FROM veiculos WHERE empresa_id = :empresa_id AND DATE(entrada) = :hoje) AS veiculos_hoje,
                (SELECT COUNT(*) FROM veiculos WHERE empresa_id = :empresa_id AND DATE(entrada) BETWEEN :inicio_mes AND :fim_mes) AS veiculos_mes,
                (SELECT COUNT(*) FROM veiculos WHERE empresa_id = :empresa_id AND DATE(entrada) BETWEEN :inicio_ano AND :fim_ano) AS veiculos_ano,
                (SELECT SUM(valor_total) FROM veiculos WHERE empresa_id = :empresa_id AND DATE(entrada) = :hoje) AS valor_hoje,
                (SELECT SUM(valor_total) FROM veiculos WHERE empresa_id = :empresa_id AND DATE(entrada) BETWEEN :inicio_mes AND :fim_mes) AS valor_mes,
                (SELECT SUM(valor_total) FROM veiculos WHERE empresa_id = :empresa_id AND DATE(entrada) BETWEEN :inicio_ano AND :fim_ano) AS valor_ano
        ");
        
        $stmt->execute([
            'empresa_id' => $this->empresaId,
            'hoje' => $hoje,
            'inicio_mes' => $inicioMes,
            'fim_mes' => $fimMes,
            'inicio_ano' => $inicioAno,
            'fim_ano' => $fimAno
        ]);
        
        $estatisticasVeiculos = $stmt->fetch();
        
        // Estatísticas de serviços
        $stmt = $this->pdo->prepare("
            SELECT
                (SELECT COUNT(*) FROM servicos_realizados sr
                 JOIN veiculos v ON sr.veiculo_id = v.id
                 WHERE v.empresa_id = :empresa_id AND DATE(sr.data_adicao) = :hoje) AS servicos_hoje,
                (SELECT COUNT(*) FROM servicos_realizados sr
                 JOIN veiculos v ON sr.veiculo_id = v.id
                 WHERE v.empresa_id = :empresa_id AND DATE(sr.data_adicao) BETWEEN :inicio_mes AND :fim_mes) AS servicos_mes,
                (SELECT COUNT(*) FROM servicos_realizados sr
                 JOIN veiculos v ON sr.veiculo_id = v.id
                 WHERE v.empresa_id = :empresa_id AND DATE(sr.data_adicao) BETWEEN :inicio_ano AND :fim_ano) AS servicos_ano,
                (SELECT SUM(sr.valor) FROM servicos_realizados sr
                 JOIN veiculos v ON sr.veiculo_id = v.id
                 WHERE v.empresa_id = :empresa_id AND DATE(sr.data_adicao) = :hoje) AS valor_servicos_hoje,
                (SELECT SUM(sr.valor) FROM servicos_realizados sr
                 JOIN veiculos v ON sr.veiculo_id = v.id
                 WHERE v.empresa_id = :empresa_id AND DATE(sr.data_adicao) BETWEEN :inicio_mes AND :fim_mes) AS valor_servicos_mes,
                (SELECT SUM(sr.valor) FROM servicos_realizados sr
                 JOIN veiculos v ON sr.veiculo_id = v.id
                 WHERE v.empresa_id = :empresa_id AND DATE(sr.data_adicao) BETWEEN :inicio_ano AND :fim_ano) AS valor_servicos_ano
        ");
        
        $stmt->execute([
            'empresa_id' => $this->empresaId,
            'hoje' => $hoje,
            'inicio_mes' => $inicioMes,
            'fim_mes' => $fimMes,
            'inicio_ano' => $inicioAno,
            'fim_ano' => $fimAno
        ]);
        
        $estatisticasServicos = $stmt->fetch();
        
        // Estatísticas de mensalistas
        $stmt = $this->pdo->prepare("
            SELECT
                (SELECT COUNT(*) FROM mensalistas WHERE empresa_id = :empresa_id) AS total_mensalistas,
                (SELECT COUNT(*) FROM mensalistas WHERE empresa_id = :empresa_id AND data_fim >= :hoje) AS mensalistas_vigentes,
                (SELECT COUNT(*) FROM mensalistas WHERE empresa_id = :empresa_id AND data_fim < :hoje) AS mensalistas_vencidos,
                (SELECT COUNT(*) FROM mensalistas WHERE empresa_id = :empresa_id AND data_fim >= :hoje AND data_fim <= :trinta_dias) AS mensalistas_vencendo,
                (SELECT COUNT(*) FROM veiculos_mensalistas vm
                 JOIN mensalistas m ON vm.mensalista_id = m.id
                 WHERE m.empresa_id = :empresa_id) AS total_veiculos_mensalistas
        ");
        
        $stmt->execute([
            'empresa_id' => $this->empresaId,
            'hoje' => $hoje,
            'trinta_dias' => date('Y-m-d', strtotime('+30 days'))
        ]);
        
        $estatisticasMensalistas = $stmt->fetch();
        
        // Estatísticas de isentos
        $stmt = $this->pdo->prepare("
            SELECT
                (SELECT COUNT(*) FROM isentos WHERE empresa_id = :empresa_id) AS total_isentos,
                (SELECT COUNT(*) FROM veiculos_isentos vi
                 JOIN isentos i ON vi.isento_id = i.id
                 WHERE i.empresa_id = :empresa_id) AS total_veiculos_isentos
        ");
        
        $stmt->execute(['empresa_id' => $this->empresaId]);
        $estatisticasIsentos = $stmt->fetch();
        
        // Estatísticas de usuários
        $stmt = $this->pdo->prepare("
            SELECT
                (SELECT COUNT(*) FROM usuarios WHERE empresa_id = :empresa_id) AS total_usuarios,
                (SELECT COUNT(*) FROM usuarios WHERE empresa_id = :empresa_id AND nivel = 'admin') AS usuarios_admin,
                (SELECT COUNT(*) FROM usuarios WHERE empresa_id = :empresa_id AND nivel = 'operador') AS usuarios_operador,
                (SELECT COUNT(*) FROM usuarios WHERE empresa_id = :empresa_id AND nivel = 'visualizador') AS usuarios_visualizador
        ");
        
        $stmt->execute(['empresa_id' => $this->empresaId]);
        $estatisticasUsuarios = $stmt->fetch();
        
        // Buscar dados da empresa
        $stmt = $this->pdo->prepare("
            SELECT nome, data_inicio_licenca, data_fim_licenca, status
            FROM empresas
            WHERE id = :id
        ");
        
        $stmt->execute(['id' => $this->empresaId]);
        $empresa = $stmt->fetch();
        
        // Formatar datas da empresa
        $empresa['data_inicio_licenca'] = strtotime($empresa['data_inicio_licenca']) * 1000;
        $empresa['data_fim_licenca'] = strtotime($empresa['data_fim_licenca']) * 1000;
        
        // Calcular dias restantes da licença
        $diasRestantes = ceil((strtotime($empresa['data_fim_licenca']) - time()) / (60 * 60 * 24));
        $empresa['dias_restantes_licenca'] = $diasRestantes;
        
        // Preparar resposta
        $resposta = [
            'empresa' => $empresa,
            'veiculos' => $estatisticasVeiculos,
            'servicos' => $estatisticasServicos,
            'mensalistas' => $estatisticasMensalistas,
            'isentos' => $estatisticasIsentos,
            'usuarios' => $estatisticasUsuarios,
            'totais' => [
                'valor_hoje' => ($estatisticasVeiculos['valor_hoje'] ?? 0) + ($estatisticasServicos['valor_servicos_hoje'] ?? 0),
                'valor_mes' => ($estatisticasVeiculos['valor_mes'] ?? 0) + ($estatisticasServicos['valor_servicos_mes'] ?? 0),
                'valor_ano' => ($estatisticasVeiculos['valor_ano'] ?? 0) + ($estatisticasServicos['valor_servicos_ano'] ?? 0)
            ],
            'periodo' => [
                'hoje' => $hoje,
                'inicio_mes' => $inicioMes,
                'fim_mes' => $fimMes,
                'inicio_ano' => $inicioAno,
                'fim_ano' => $fimAno
            ]
        ];
        
        // Retornar resposta
        Response::success($resposta);
    }
}
