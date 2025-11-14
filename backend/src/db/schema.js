import { sql } from 'drizzle-orm'
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core'

// ============================================================================
// MÓDULO ADMINISTRATIVO
// ============================================================================

// Tabela de Funcionários
export const funcionarios = sqliteTable('funcionarios', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  cpf: text('cpf').notNull().unique(),
  telefone: text('telefone'),
  email: text('email'),
  cargo: text('cargo'),
  dataAdmissao: text('data_admissao'),
  dataDemissao: text('data_demissao'),
  ativo: integer('ativo', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// Tabela de Usuários do Sistema
export const usuarios = sqliteTable('usuarios', {
  id: text('id').primaryKey(),
  codigo: text('codigo').notNull().unique(), // código único do usuário
  funcionarioId: text('funcionario_id').references(() => funcionarios.id),
  username: text('username').notNull().unique(),
  senha: text('senha').notNull(), // hash bcrypt
  email: text('email').notNull().unique(),
  perfil: text('perfil').notNull().default('usuario'), // admin, gerente, usuario, etc
  permissoes: text('permissoes', { mode: 'json' }), // JSON com permissões por módulo
  ativo: integer('ativo', { mode: 'boolean' }).default(true),
  ultimoAcesso: text('ultimo_acesso'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// ============================================================================
// FINANÇAS - PLANO DE CONTAS
// ============================================================================

export const planoContas = sqliteTable('plano_contas', {
  id: text('id').primaryKey(),
  codigo: text('codigo').notNull().unique(), // ex: 1.1.01.001
  descricao: text('descricao').notNull(),
  tipo: text('tipo').notNull(), // 'RECEITA' ou 'DESPESA'
  nivel: integer('nivel').notNull(), // 1 a 9
  contaPaiId: text('conta_pai_id').references(() => planoContas.id),
  consideraResultado: integer('considera_resultado', { mode: 'boolean' }).default(true),
  tipoGasto: text('tipo_gasto'), // 'FIXO' ou 'VARIAVEL' (apenas para despesas)
  usaObjetivo: integer('usa_objetivo', { mode: 'boolean' }).default(false),
  ativo: integer('ativo', { mode: 'boolean' }).default(true),
  ordem: integer('ordem'), // para ordenação customizada
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// ============================================================================
// FINANÇAS - PLANO DRE
// ============================================================================

export const planoDRE = sqliteTable('plano_dre', {
  id: text('id').primaryKey(),
  codigo: text('codigo').notNull().unique(),
  descricao: text('descricao').notNull(),
  nivel: integer('nivel').notNull(),
  itemPaiId: text('item_pai_id').references(() => planoDRE.id),
  tipo: text('tipo').notNull(), // 'GRUPO', 'SUBTOTAL', 'CONTA'
  formula: text('formula'), // para cálculos (ex: "soma", "subtracao")
  ordem: integer('ordem').notNull(),
  ativo: integer('ativo', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// Relacionamento DRE <-> Plano de Contas
export const dreContasVinculadas = sqliteTable('dre_contas_vinculadas', {
  id: text('id').primaryKey(),
  dreId: text('dre_id').notNull().references(() => planoDRE.id),
  contaId: text('conta_id').notNull().references(() => planoContas.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// ============================================================================
// CADASTRO DE BANCOS
// ============================================================================

export const bancos = sqliteTable('bancos', {
  id: text('id').primaryKey(),
  nome: text('nome').notNull(),
  agencia: text('agencia'),
  conta: text('conta'),
  tipo: text('tipo'), // 'CORRENTE', 'POUPANCA', 'INVESTIMENTO'
  saldoInicial: real('saldo_inicial').default(0),
  ativo: integer('ativo', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// ============================================================================
// MOVIMENTAÇÃO FINANCEIRA
// ============================================================================

export const movimentacoes = sqliteTable('movimentacoes', {
  id: text('id').primaryKey(),
  tipo: text('tipo').notNull(), // 'ENTRADA' ou 'SAIDA'
  descricao: text('descricao').notNull(),
  contaId: text('conta_id').notNull().references(() => planoContas.id),
  bancoId: text('banco_id').references(() => bancos.id),
  valor: real('valor').notNull(),
  dataMovimento: text('data_movimento').notNull(),
  dataVencimento: text('data_vencimento'),
  dataPagamento: text('data_pagamento'),
  status: text('status').notNull().default('PENDENTE'), // 'PENDENTE', 'PAGO', 'CANCELADO'
  formaPagamento: text('forma_pagamento'), // 'DINHEIRO', 'PIX', 'BOLETO', etc
  observacoes: text('observacoes'),
  notaFiscalId: text('nota_fiscal_id'), // referência para NF importada
  origem: text('origem').default('MANUAL'), // 'MANUAL', 'NFE_VENDA', 'NFE_COMPRA'
  usuarioId: text('usuario_id').references(() => usuarios.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// ============================================================================
// FATURAMENTO - NOTAS FISCAIS DE VENDA
// ============================================================================

export const notasFiscaisVenda = sqliteTable('notas_fiscais_venda', {
  id: text('id').primaryKey(),
  numeroNota: text('numero_nota').notNull(),
  serieNota: text('serie_nota'),
  chaveAcesso: text('chave_acesso').unique(),
  dataEmissao: text('data_emissao').notNull(),
  // Dados do Cliente
  clienteCpfCnpj: text('cliente_cpf_cnpj'),
  clienteNome: text('cliente_nome'),
  clienteEndereco: text('cliente_endereco'),
  clienteCidade: text('cliente_cidade'),
  clienteUf: text('cliente_uf'),
  clienteTelefone: text('cliente_telefone'),
  clienteEmail: text('cliente_email'),
  // Valores
  valorTotal: real('valor_total').notNull(),
  valorProdutos: real('valor_produtos'),
  valorServicos: real('valor_servicos'),
  valorDesconto: real('valor_desconto'),
  // XML
  xmlCompleto: text('xml_completo'), // XML completo armazenado
  status: text('status').default('ATIVA'), // 'ATIVA', 'CANCELADA'
  importadoEm: text('importado_em').default(sql`CURRENT_TIMESTAMP`),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// Parcelas/Vencimentos da NF de Venda
export const vendasParcelas = sqliteTable('vendas_parcelas', {
  id: text('id').primaryKey(),
  notaFiscalId: text('nota_fiscal_id').notNull().references(() => notasFiscaisVenda.id),
  numeroParcela: integer('numero_parcela').notNull(),
  dataVencimento: text('data_vencimento').notNull(),
  valor: real('valor').notNull(),
  status: text('status').default('PENDENTE'), // 'PENDENTE', 'RECEBIDO', 'CANCELADO'
  dataPagamento: text('data_pagamento'),
  valorRecebido: real('valor_recebido'),
  movimentacaoId: text('movimentacao_id').references(() => movimentacoes.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// ============================================================================
// COMPRAS - NOTAS FISCAIS DE COMPRA
// ============================================================================

export const notasFiscaisCompra = sqliteTable('notas_fiscais_compra', {
  id: text('id').primaryKey(),
  numeroNota: text('numero_nota').notNull(),
  serieNota: text('serie_nota'),
  chaveAcesso: text('chave_acesso').unique(),
  dataEmissao: text('data_emissao').notNull(),
  // Dados do Fornecedor
  fornecedorCpfCnpj: text('fornecedor_cpf_cnpj'),
  fornecedorNome: text('fornecedor_nome'),
  fornecedorEndereco: text('fornecedor_endereco'),
  fornecedorCidade: text('fornecedor_cidade'),
  fornecedorUf: text('fornecedor_uf'),
  fornecedorTelefone: text('fornecedor_telefone'),
  fornecedorEmail: text('fornecedor_email'),
  // Valores
  valorTotal: real('valor_total').notNull(),
  valorProdutos: real('valor_produtos'),
  valorServicos: real('valor_servicos'),
  valorDesconto: real('valor_desconto'),
  // XML
  xmlCompleto: text('xml_completo'),
  origemImportacao: text('origem_importacao'), // 'MANUAL', 'EMAIL', 'SEFAZ_API'
  status: text('status').default('ATIVA'),
  importadoEm: text('importado_em').default(sql`CURRENT_TIMESTAMP`),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// Parcelas/Pagamentos da NF de Compra
export const comprasParcelas = sqliteTable('compras_parcelas', {
  id: text('id').primaryKey(),
  notaFiscalId: text('nota_fiscal_id').notNull().references(() => notasFiscaisCompra.id),
  numeroParcela: integer('numero_parcela').notNull(),
  dataVencimento: text('data_vencimento').notNull(),
  valor: real('valor').notNull(),
  status: text('status').default('PENDENTE'),
  dataPagamento: text('data_pagamento'),
  valorPago: real('valor_pago'),
  movimentacaoId: text('movimentacao_id').references(() => movimentacoes.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// ============================================================================
// OBJETIVOS/METAS
// ============================================================================

export const objetivos = sqliteTable('objetivos', {
  id: text('id').primaryKey(),
  contaId: text('conta_id').notNull().references(() => planoContas.id),
  ano: integer('ano').notNull(),
  trimestre: integer('trimestre').notNull(), // 1, 2, 3, 4
  metaTrimestral: real('meta_trimestral').notNull(),
  tipo: text('tipo').notNull(), // 'RECEITA' ou 'DESPESA'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

// Distribuição semanal das metas
export const objetivosSemanas = sqliteTable('objetivos_semanas', {
  id: text('id').primaryKey(),
  objetivoId: text('objetivo_id').notNull().references(() => objetivos.id),
  numeroSemana: integer('numero_semana').notNull(), // 1-13 (13 semanas por trimestre)
  dataInicio: text('data_inicio').notNull(),
  dataFim: text('data_fim').notNull(),
  metaSemanal: real('meta_semanal').notNull(),
  realizado: real('realizado').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// ============================================================================
// ARQUIVOS IMPORTADOS
// ============================================================================

export const arquivosImportados = sqliteTable('arquivos_importados', {
  id: text('id').primaryKey(),
  nomeArquivo: text('nome_arquivo').notNull(),
  tipoArquivo: text('tipo_arquivo').notNull(), // 'XML_VENDA', 'XML_COMPRA', 'PLANILHA', etc
  tamanho: integer('tamanho'),
  status: text('status').default('PROCESSANDO'), // 'PROCESSANDO', 'SUCESSO', 'ERRO'
  erroMensagem: text('erro_mensagem'),
  registrosProcessados: integer('registros_processados').default(0),
  usuarioId: text('usuario_id').references(() => usuarios.id),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})

// ============================================================================
// LOGS DE AUDITORIA
// ============================================================================

export const logsAuditoria = sqliteTable('logs_auditoria', {
  id: text('id').primaryKey(),
  usuarioId: text('usuario_id').references(() => usuarios.id),
  acao: text('acao').notNull(), // 'CREATE', 'UPDATE', 'DELETE', 'LOGIN', etc
  modulo: text('modulo').notNull(), // 'USUARIOS', 'MOVIMENTACOES', 'PLANO_CONTAS', etc
  registroId: text('registro_id'),
  descricao: text('descricao'),
  dadosAnteriores: text('dados_anteriores', { mode: 'json' }),
  dadosNovos: text('dados_novos', { mode: 'json' }),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`)
})
