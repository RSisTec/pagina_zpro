# Estrutura de Dados e Fluxos - Sistema Multi-Empresas

## Estrutura de Dados

### Entidades Principais

1. **Empresa**
   ```
   {
     id: string,
     nome: string,
     cnpj: string,
     endereco: string,
     telefone: string,
     email: string,
     logo: string,
     responsavel: string,
     dataInicioLicenca: number,
     dataFimLicenca: number,
     status: boolean,
     dataCriacao: number,
     dataAtualizacao: number
   }
   ```

2. **Superadmin**
   ```
   {
     id: string,
     nome: string,
     email: string,
     login: string,
     senha: string,
     dataCriacao: number,
     dataAtualizacao: number
   }
   ```

3. **Usuario** (modificado)
   ```
   {
     id: string,
     empresaId: string,
     nome: string,
     email: string,
     login: string,
     senha: string,
     nivel: string,
     dataCriacao: number,
     dataAtualizacao: number
   }
   ```

4. **Veículo** (modificado)
   ```
   {
     id: string,
     empresaId: string,
     placa: string,
     modelo: string,
     cor: string,
     ticket: string,
     telefone: string,
     entrada: number,
     saida: number,
     tipoCliente: string,
     idCliente: string,
     servicos: array,
     valorTotal: number,
     formaPagamento: string,
     cpfNota: string,
     status: string,
     observacoes: string
   }
   ```

5. **Mensalista** (modificado)
   ```
   {
     id: string,
     empresaId: string,
     nome: string,
     documento: string,
     telefone: string,
     email: string,
     endereco: string,
     plano: string,
     dataInicio: number,
     dataFim: number,
     veiculos: array
   }
   ```

6. **Isento** (modificado)
   ```
   {
     id: string,
     empresaId: string,
     nome: string,
     documento: string,
     motivo: string,
     veiculos: array
   }
   ```

7. **Serviço** (modificado)
   ```
   {
     id: string,
     empresaId: string,
     nome: string,
     descricao: string,
     valor: number,
     tempoEstimado: number
   }
   ```

8. **Preço** (modificado)
   ```
   {
     id: string,
     empresaId: string,
     nome: string,
     descricao: string,
     valorPrimeiraHora: number,
     valorHoraAdicional: number,
     valorDiaria: number,
     valorMensalidade: number,
     ativo: boolean,
     dataCriacao: number
   }
   ```

## Fluxos de Navegação

### Fluxo de Superadmin

1. **Acesso ao Sistema**
   - Página de login exclusiva para superadmin (`/superadmin/login.html`)
   - Validação de credenciais de superadmin
   - Redirecionamento para dashboard de superadmin

2. **Dashboard de Superadmin**
   - Visão geral de todas as empresas
   - Estatísticas de uso
   - Alertas de licenças próximas do vencimento

3. **Gestão de Empresas**
   - Listagem de todas as empresas
   - Formulário de cadastro de nova empresa
   - Edição de dados da empresa
   - Ativação/desativação de empresa

4. **Detalhes da Empresa**
   - Visualização de dados completos da empresa
   - Estatísticas de uso específicas
   - Opção para acessar o sistema como administrador da empresa

### Fluxo de Administrador de Empresa

1. **Acesso ao Sistema**
   - Página de login atual (`/pages/login.html`)
   - Seleção da empresa (se aplicável)
   - Validação de credenciais específicas da empresa
   - Redirecionamento para dashboard administrativo da empresa

2. **Dashboard Administrativo**
   - Exibição de dados da empresa logada
   - Funcionalidades atuais, mas isoladas para a empresa

3. **Gestão de Usuários**
   - Usuários associados apenas à empresa atual
   - Permissões limitadas ao escopo da empresa

4. **Demais Funcionalidades**
   - Todas as funcionalidades atuais mantidas
   - Dados isolados por empresa

## Relacionamentos

1. **Empresa → Usuários**
   - Uma empresa possui muitos usuários
   - Usuários pertencem a apenas uma empresa

2. **Empresa → Veículos**
   - Uma empresa possui muitos veículos
   - Veículos pertencem a apenas uma empresa

3. **Empresa → Mensalistas**
   - Uma empresa possui muitos mensalistas
   - Mensalistas pertencem a apenas uma empresa

4. **Empresa → Isentos**
   - Uma empresa possui muitos isentos
   - Isentos pertencem a apenas uma empresa

5. **Empresa → Serviços**
   - Uma empresa possui muitos serviços
   - Serviços pertencem a apenas uma empresa

6. **Empresa → Preços**
   - Uma empresa possui muitas tabelas de preços
   - Tabelas de preços pertencem a apenas uma empresa

## Modificações nas APIs Simuladas

1. **Autenticação**
   - API separada para autenticação de superadmin
   - Modificação da API atual para incluir empresaId

2. **Filtros por Empresa**
   - Todas as APIs devem incluir filtro por empresaId
   - Validação de permissão para acessar dados da empresa

3. **Novas APIs**
   - API para gestão de empresas (CRUD)
   - API para estatísticas de uso por empresa

## Considerações de Implementação

1. **Armazenamento Local**
   - Prefixar chaves do localStorage com empresaId
   - Separar dados de superadmin em chaves específicas

2. **Segurança**
   - Validar empresaId em todas as operações
   - Verificar permissões de acesso a dados

3. **Experiência do Usuário**
   - Manter consistência visual
   - Indicar claramente qual empresa está sendo acessada
   - Transições suaves entre áreas do sistema
