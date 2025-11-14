import { NextRequest, NextResponse } from 'next/server'
import { getTursoClient } from '@/lib/turso'

export async function POST(request: NextRequest) {
  try {
    const client = getTursoClient()

    console.log('🔧 Criando tabelas...')

    // Criar todas as tabelas
    const tables = [
      // Funcionários
      `CREATE TABLE IF NOT EXISTS funcionarios (
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
      )`,

      // Usuários
      `CREATE TABLE IF NOT EXISTS usuarios (
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
      )`,

      // Plano de Contas
      `CREATE TABLE IF NOT EXISTS plano_contas (
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
      )`,

      // Bancos
      `CREATE TABLE IF NOT EXISTS bancos (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        agencia TEXT,
        conta TEXT,
        tipo TEXT,
        saldo_inicial REAL DEFAULT 0,
        ativo INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Movimentações
      `CREATE TABLE IF NOT EXISTS movimentacoes (
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
      )`,

      // Notas Fiscais Venda
      `CREATE TABLE IF NOT EXISTS notas_fiscais_venda (
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
      )`,

      // Vendas Parcelas
      `CREATE TABLE IF NOT EXISTS vendas_parcelas (
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
      )`,

      // Notas Fiscais Compra
      `CREATE TABLE IF NOT EXISTS notas_fiscais_compra (
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
      )`,

      // Compras Parcelas
      `CREATE TABLE IF NOT EXISTS compras_parcelas (
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
      )`,

      // Objetivos
      `CREATE TABLE IF NOT EXISTS objetivos (
        id TEXT PRIMARY KEY,
        conta_id TEXT NOT NULL REFERENCES plano_contas(id),
        ano INTEGER NOT NULL,
        trimestre INTEGER NOT NULL,
        meta_trimestral REAL NOT NULL,
        tipo TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Objetivos Semanas
      `CREATE TABLE IF NOT EXISTS objetivos_semanas (
        id TEXT PRIMARY KEY,
        objetivo_id TEXT NOT NULL REFERENCES objetivos(id),
        numero_semana INTEGER NOT NULL,
        data_inicio TEXT NOT NULL,
        data_fim TEXT NOT NULL,
        meta_semanal REAL NOT NULL,
        realizado REAL DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Arquivos Importados
      `CREATE TABLE IF NOT EXISTS arquivos_importados (
        id TEXT PRIMARY KEY,
        nome_arquivo TEXT NOT NULL,
        tipo_arquivo TEXT NOT NULL,
        tamanho INTEGER,
        status TEXT DEFAULT 'PROCESSANDO',
        erro_mensagem TEXT,
        registros_processados INTEGER DEFAULT 0,
        usuario_id TEXT REFERENCES usuarios(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`,

      // Logs Auditoria
      `CREATE TABLE IF NOT EXISTS logs_auditoria (
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
      )`,

      // Plano DRE
      `CREATE TABLE IF NOT EXISTS plano_dre (
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
      )`,

      // DRE Contas Vinculadas
      `CREATE TABLE IF NOT EXISTS dre_contas_vinculadas (
        id TEXT PRIMARY KEY,
        dre_id TEXT NOT NULL REFERENCES plano_dre(id),
        conta_id TEXT NOT NULL REFERENCES plano_contas(id),
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )`
    ]

    for (const sql of tables) {
      await client.execute(sql)
    }

    console.log('✅ Tabelas criadas!')

    return NextResponse.json({
      success: true,
      message: 'Todas as 15 tabelas foram criadas com sucesso!',
      tables: [
        'funcionarios', 'usuarios', 'plano_contas', 'plano_dre',
        'dre_contas_vinculadas', 'bancos', 'movimentacoes',
        'notas_fiscais_venda', 'vendas_parcelas',
        'notas_fiscais_compra', 'compras_parcelas',
        'objetivos', 'objetivos_semanas',
        'arquivos_importados', 'logs_auditoria'
      ]
    })

  } catch (error: any) {
    console.error('❌ Erro ao criar tabelas:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
