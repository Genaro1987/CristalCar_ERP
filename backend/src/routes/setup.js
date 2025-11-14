import express from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { db } from '../db/index.js'
import { sql } from 'drizzle-orm'

const router = express.Router()

// Rota para criar todas as tabelas
router.post('/create-tables', async (req, res, next) => {
  try {
    console.log('🔧 Iniciando criação de tabelas...')

    // Criar tabela de funcionários
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS funcionarios (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        cpf TEXT NOT NULL UNIQUE,
        telefone TEXT,
        email TEXT,
        cargo TEXT,
        data_admissao TEXT,
        data_demissao TEXT,
        ativo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de usuários
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS usuarios (
        id TEXT PRIMARY KEY,
        codigo TEXT NOT NULL UNIQUE,
        funcionario_id TEXT REFERENCES funcionarios(id),
        username TEXT NOT NULL UNIQUE,
        senha TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        perfil TEXT NOT NULL DEFAULT 'usuario',
        permissoes TEXT,
        ativo INTEGER DEFAULT 1,
        ultimo_acesso TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de plano de contas
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS plano_contas (
        id TEXT PRIMARY KEY,
        codigo TEXT NOT NULL UNIQUE,
        descricao TEXT NOT NULL,
        tipo TEXT NOT NULL,
        nivel INTEGER NOT NULL,
        conta_pai_id TEXT REFERENCES plano_contas(id),
        considera_resultado INTEGER DEFAULT 1,
        tipo_gasto TEXT,
        usa_objetivo INTEGER DEFAULT 0,
        ativo INTEGER DEFAULT 1,
        ordem INTEGER,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de plano DRE
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS plano_dre (
        id TEXT PRIMARY KEY,
        codigo TEXT NOT NULL UNIQUE,
        descricao TEXT NOT NULL,
        nivel INTEGER NOT NULL,
        item_pai_id TEXT REFERENCES plano_dre(id),
        tipo TEXT NOT NULL,
        formula TEXT,
        ordem INTEGER NOT NULL,
        ativo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de vinculação DRE x Contas
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS dre_contas_vinculadas (
        id TEXT PRIMARY KEY,
        dre_id TEXT NOT NULL REFERENCES plano_dre(id),
        conta_id TEXT NOT NULL REFERENCES plano_contas(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de bancos
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS bancos (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        agencia TEXT,
        conta TEXT,
        tipo TEXT,
        saldo_inicial REAL DEFAULT 0,
        ativo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de movimentações
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS movimentacoes (
        id TEXT PRIMARY KEY,
        tipo TEXT NOT NULL,
        descricao TEXT NOT NULL,
        conta_id TEXT NOT NULL REFERENCES plano_contas(id),
        banco_id TEXT REFERENCES bancos(id),
        valor REAL NOT NULL,
        data_movimento TEXT NOT NULL,
        data_vencimento TEXT,
        data_pagamento TEXT,
        status TEXT NOT NULL DEFAULT 'PENDENTE',
        forma_pagamento TEXT,
        observacoes TEXT,
        nota_fiscal_id TEXT,
        origem TEXT DEFAULT 'MANUAL',
        usuario_id TEXT REFERENCES usuarios(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de notas fiscais de venda
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS notas_fiscais_venda (
        id TEXT PRIMARY KEY,
        numero_nota TEXT NOT NULL,
        serie_nota TEXT,
        chave_acesso TEXT UNIQUE,
        data_emissao TEXT NOT NULL,
        cliente_cpf_cnpj TEXT,
        cliente_nome TEXT,
        cliente_endereco TEXT,
        cliente_cidade TEXT,
        cliente_uf TEXT,
        cliente_telefone TEXT,
        cliente_email TEXT,
        valor_total REAL NOT NULL,
        valor_produtos REAL,
        valor_servicos REAL,
        valor_desconto REAL,
        xml_completo TEXT,
        status TEXT DEFAULT 'ATIVA',
        importado_em TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de parcelas de vendas
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS vendas_parcelas (
        id TEXT PRIMARY KEY,
        nota_fiscal_id TEXT NOT NULL REFERENCES notas_fiscais_venda(id),
        numero_parcela INTEGER NOT NULL,
        data_vencimento TEXT NOT NULL,
        valor REAL NOT NULL,
        status TEXT DEFAULT 'PENDENTE',
        data_pagamento TEXT,
        valor_recebido REAL,
        movimentacao_id TEXT REFERENCES movimentacoes(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de notas fiscais de compra
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS notas_fiscais_compra (
        id TEXT PRIMARY KEY,
        numero_nota TEXT NOT NULL,
        serie_nota TEXT,
        chave_acesso TEXT UNIQUE,
        data_emissao TEXT NOT NULL,
        fornecedor_cpf_cnpj TEXT,
        fornecedor_nome TEXT,
        fornecedor_endereco TEXT,
        fornecedor_cidade TEXT,
        fornecedor_uf TEXT,
        fornecedor_telefone TEXT,
        fornecedor_email TEXT,
        valor_total REAL NOT NULL,
        valor_produtos REAL,
        valor_servicos REAL,
        valor_desconto REAL,
        xml_completo TEXT,
        origem_importacao TEXT,
        status TEXT DEFAULT 'ATIVA',
        importado_em TEXT DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de parcelas de compras
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS compras_parcelas (
        id TEXT PRIMARY KEY,
        nota_fiscal_id TEXT NOT NULL REFERENCES notas_fiscais_compra(id),
        numero_parcela INTEGER NOT NULL,
        data_vencimento TEXT NOT NULL,
        valor REAL NOT NULL,
        status TEXT DEFAULT 'PENDENTE',
        data_pagamento TEXT,
        valor_pago REAL,
        movimentacao_id TEXT REFERENCES movimentacoes(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de objetivos
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS objetivos (
        id TEXT PRIMARY KEY,
        conta_id TEXT NOT NULL REFERENCES plano_contas(id),
        ano INTEGER NOT NULL,
        trimestre INTEGER NOT NULL,
        meta_trimestral REAL NOT NULL,
        tipo TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de objetivos semanas
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS objetivos_semanas (
        id TEXT PRIMARY KEY,
        objetivo_id TEXT NOT NULL REFERENCES objetivos(id),
        numero_semana INTEGER NOT NULL,
        data_inicio TEXT NOT NULL,
        data_fim TEXT NOT NULL,
        meta_semanal REAL NOT NULL,
        realizado REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de arquivos importados
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS arquivos_importados (
        id TEXT PRIMARY KEY,
        nome_arquivo TEXT NOT NULL,
        tipo_arquivo TEXT NOT NULL,
        tamanho INTEGER,
        status TEXT DEFAULT 'PROCESSANDO',
        erro_mensagem TEXT,
        registros_processados INTEGER DEFAULT 0,
        usuario_id TEXT REFERENCES usuarios(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Criar tabela de logs de auditoria
    await db.run(sql`
      CREATE TABLE IF NOT EXISTS logs_auditoria (
        id TEXT PRIMARY KEY,
        usuario_id TEXT REFERENCES usuarios(id),
        acao TEXT NOT NULL,
        modulo TEXT NOT NULL,
        registro_id TEXT,
        descricao TEXT,
        dados_anteriores TEXT,
        dados_novos TEXT,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `)

    console.log('✅ Todas as tabelas criadas com sucesso!')

    res.json({
      success: true,
      message: 'Todas as 15 tabelas foram criadas com sucesso!',
      tables: [
        'funcionarios',
        'usuarios',
        'plano_contas',
        'plano_dre',
        'dre_contas_vinculadas',
        'bancos',
        'movimentacoes',
        'notas_fiscais_venda',
        'vendas_parcelas',
        'notas_fiscais_compra',
        'compras_parcelas',
        'objetivos',
        'objetivos_semanas',
        'arquivos_importados',
        'logs_auditoria'
      ]
    })

  } catch (error) {
    console.error('❌ Erro ao criar tabelas:', error)
    next(error)
  }
})

// Rota para verificar status das tabelas
router.get('/check-tables', async (req, res, next) => {
  try {
    const result = await db.run(sql`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `)

    res.json({
      success: true,
      totalTables: result.rows?.length || 0,
      tables: result.rows?.map(r => r.name) || []
    })

  } catch (error) {
    next(error)
  }
})

// Rota para inicializar dados básicos
router.post('/initialize-data', async (req, res, next) => {
  try {
    console.log('🔧 Inicializando dados básicos...')

    // Verificar se já existe usuário
    const existingUsers = await db.run(sql`SELECT COUNT(*) as count FROM usuarios`)

    if (existingUsers.rows[0]?.count > 0) {
      return res.json({
        success: false,
        message: 'Banco já possui dados. Inicialização cancelada para evitar duplicação.'
      })
    }

    // 1. Criar usuário admin
    const userId = crypto.randomUUID()
    const hashedPassword = await bcrypt.hash('admin123', 10)

    await db.run(sql`
      INSERT INTO usuarios (id, codigo, username, senha, email, perfil, permissoes, ativo)
      VALUES (
        ${userId},
        'ADM001',
        'admin',
        ${hashedPassword},
        'admin@cristalcar.com',
        'admin',
        '{}',
        1
      )
    `)

    console.log('✅ Usuário admin criado')

    // 2. Criar plano de contas básico
    const contasBasicas = [
      { codigo: '1', descricao: 'RECEITAS', tipo: 'RECEITA', nivel: 1 },
      { codigo: '1.1', descricao: 'Receitas Operacionais', tipo: 'RECEITA', nivel: 2 },
      { codigo: '1.1.01', descricao: 'Vendas de Serviços', tipo: 'RECEITA', nivel: 3 },
      { codigo: '2', descricao: 'DESPESAS', tipo: 'DESPESA', nivel: 1 },
      { codigo: '2.1', descricao: 'Despesas Operacionais', tipo: 'DESPESA', nivel: 2 },
      { codigo: '2.1.01', descricao: 'Salários e Encargos', tipo: 'DESPESA', nivel: 3, tipoGasto: 'FIXO' },
      { codigo: '2.1.02', descricao: 'Aluguel', tipo: 'DESPESA', nivel: 3, tipoGasto: 'FIXO' },
      { codigo: '2.1.03', descricao: 'Material de Consumo', tipo: 'DESPESA', nivel: 3, tipoGasto: 'VARIAVEL' },
    ]

    for (const conta of contasBasicas) {
      await db.run(sql`
        INSERT INTO plano_contas (id, codigo, descricao, tipo, nivel, considera_resultado, tipo_gasto, usa_objetivo, ativo, ordem)
        VALUES (
          ${crypto.randomUUID()},
          ${conta.codigo},
          ${conta.descricao},
          ${conta.tipo},
          ${conta.nivel},
          1,
          ${conta.tipoGasto || null},
          0,
          1,
          0
        )
      `)
    }

    console.log(`✅ ${contasBasicas.length} contas criadas`)

    // 3. Criar banco padrão
    await db.run(sql`
      INSERT INTO bancos (id, nome, agencia, conta, tipo, saldo_inicial, ativo)
      VALUES (
        ${crypto.randomUUID()},
        'Caixa Geral',
        '0000',
        '0000',
        'CORRENTE',
        0,
        1
      )
    `)

    console.log('✅ Banco "Caixa Geral" criado')

    res.json({
      success: true,
      message: 'Dados inicializados com sucesso!',
      created: {
        users: 1,
        accounts: contasBasicas.length,
        banks: 1
      },
      credentials: {
        username: 'admin',
        password: 'admin123',
        warning: '⚠️ ALTERE A SENHA APÓS O PRIMEIRO LOGIN!'
      }
    })

  } catch (error) {
    console.error('❌ Erro ao inicializar dados:', error)
    next(error)
  }
})

export default router
