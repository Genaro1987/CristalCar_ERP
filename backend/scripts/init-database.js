import { createClient } from '@libsql/client'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔧 Inicializando banco de dados CristalCar ERP...\n')

const client = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

async function initDatabase() {
  try {
    // Verificar se já existe usuário admin
    const adminCheck = await client.execute('SELECT COUNT(*) as count FROM usuarios')

    if (adminCheck.rows[0].count > 0) {
      console.log('⚠️  Banco de dados já possui usuários cadastrados')
      console.log('   Pulando inicialização...\n')
      return
    }

    console.log('📝 Criando usuário administrador padrão...')

    // Criar usuário admin padrão
    const id = crypto.randomUUID()
    const senha = await bcrypt.hash('admin123', 10)

    await client.execute({
      sql: `INSERT INTO usuarios (id, codigo, username, senha, email, perfil, permissoes, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        'ADM001',
        'admin',
        senha,
        'admin@cristalcar.com',
        'admin',
        JSON.stringify({}),
        1
      ]
    })

    console.log('✅ Usuário administrador criado!')
    console.log('\n📋 Credenciais de acesso:')
    console.log('   Username: admin')
    console.log('   Senha: admin123')
    console.log('\n⚠️  IMPORTANTE: Altere a senha após o primeiro login!\n')

    // Criar algumas contas básicas no plano de contas
    console.log('💰 Criando estrutura básica do plano de contas...')

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
      await client.execute({
        sql: `INSERT INTO plano_contas (id, codigo, descricao, tipo, nivel, consideraResultado, tipoGasto, usaObjetivo, ativo, ordem)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [
          crypto.randomUUID(),
          conta.codigo,
          conta.descricao,
          conta.tipo,
          conta.nivel,
          1,
          conta.tipoGasto || null,
          0,
          1,
          0
        ]
      })
    }

    console.log(`✅ ${contasBasicas.length} contas criadas no plano de contas\n`)

    // Criar banco padrão
    console.log('🏦 Criando banco padrão...')
    await client.execute({
      sql: `INSERT INTO bancos (id, nome, agencia, conta, tipo, saldoInicial, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [
        crypto.randomUUID(),
        'Caixa Geral',
        '0000',
        '0000',
        'CORRENTE',
        0,
        1
      ]
    })

    console.log('✅ Banco "Caixa Geral" criado\n')

    console.log('🎉 Inicialização concluída com sucesso!')
    console.log('🚀 O sistema está pronto para uso!\n')

  } catch (error) {
    console.error('\n❌ Erro ao inicializar banco de dados:')
    console.error(error.message)
    process.exit(1)
  }
}

initDatabase()
