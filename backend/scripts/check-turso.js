import { createClient } from '@libsql/client'
import dotenv from 'dotenv'

dotenv.config()

console.log('🔍 Verificando conexão com Turso Database...\n')

// Verificar variáveis de ambiente
console.log('📋 Verificando variáveis de ambiente:')
console.log(`TURSO_DATABASE_URL: ${process.env.TURSO_DATABASE_URL ? '✅ Configurado' : '❌ Não configurado'}`)
console.log(`TURSO_AUTH_TOKEN: ${process.env.TURSO_AUTH_TOKEN ? '✅ Configurado' : '❌ Não configurado'}`)
console.log('')

if (!process.env.TURSO_DATABASE_URL || !process.env.TURSO_AUTH_TOKEN) {
  console.error('❌ Erro: Variáveis de ambiente não configuradas!')
  console.log('\n📝 Crie o arquivo .env com:')
  console.log('TURSO_DATABASE_URL=libsql://...')
  console.log('TURSO_AUTH_TOKEN=...')
  process.exit(1)
}

// Testar conexão
async function testConnection() {
  try {
    console.log('🔌 Testando conexão com Turso...')

    const client = createClient({
      url: process.env.TURSO_DATABASE_URL,
      authToken: process.env.TURSO_AUTH_TOKEN
    })

    // Executar query de teste
    const result = await client.execute('SELECT 1 as test')
    console.log('✅ Conexão estabelecida com sucesso!\n')

    // Verificar tabelas existentes
    console.log('📊 Verificando tabelas existentes...')
    const tables = await client.execute(`
      SELECT name FROM sqlite_master
      WHERE type='table'
      ORDER BY name
    `)

    if (tables.rows.length === 0) {
      console.log('⚠️  Nenhuma tabela encontrada no banco de dados')
      console.log('\n💡 Execute: npm run db:push para criar as tabelas\n')
    } else {
      console.log(`✅ ${tables.rows.length} tabela(s) encontrada(s):`)
      tables.rows.forEach(row => {
        console.log(`   - ${row.name}`)
      })
      console.log('')

      // Contar registros em algumas tabelas importantes
      if (tables.rows.some(r => r.name === 'usuarios')) {
        const usuariosCount = await client.execute('SELECT COUNT(*) as count FROM usuarios')
        console.log(`👥 Usuários cadastrados: ${usuariosCount.rows[0].count}`)
      }

      if (tables.rows.some(r => r.name === 'plano_contas')) {
        const contasCount = await client.execute('SELECT COUNT(*) as count FROM plano_contas')
        console.log(`💰 Contas no plano de contas: ${contasCount.rows[0].count}`)
      }

      if (tables.rows.some(r => r.name === 'movimentacoes')) {
        const movCount = await client.execute('SELECT COUNT(*) as count FROM movimentacoes')
        console.log(`📈 Movimentações registradas: ${movCount.rows[0].count}`)
      }
    }

    console.log('\n✅ Verificação concluída com sucesso!')
    console.log('🚀 Turso Database está pronto para uso!\n')

  } catch (error) {
    console.error('\n❌ Erro ao conectar com Turso:')
    console.error(error.message)
    console.log('\n🔧 Possíveis soluções:')
    console.log('1. Verifique se a URL e TOKEN estão corretos')
    console.log('2. Verifique sua conexão com a internet')
    console.log('3. Execute: turso db show cristalcar-erp')
    console.log('4. Gere novo token: turso db tokens create cristalcar-erp\n')
    process.exit(1)
  }
}

testConnection()
