import { NextRequest, NextResponse } from 'next/server'
import { getTursoClient } from '@/lib/turso'
import bcrypt from 'bcryptjs'
import { randomUUID } from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const client = getTursoClient()

    console.log('🔧 Inicializando dados...')

    // Verificar se já existe usuário
    const existing = await client.execute('SELECT COUNT(*) as count FROM usuarios')
    if (existing.rows[0]?.count > 0) {
      return NextResponse.json({
        success: false,
        message: 'Banco já possui dados. Inicialização cancelada.'
      })
    }

    // 1. Criar usuário admin
    const userId = randomUUID()
    const hashedPassword = await bcrypt.hash('admin123', 10)

    await client.execute({
      sql: `INSERT INTO usuarios (id, codigo, username, senha, email, perfil, permissoes, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [userId, 'ADM001', 'admin', hashedPassword, 'admin@cristalcar.com', 'admin', '{}', 1]
    })

    // 2. Criar plano de contas básico
    const contas = [
      { codigo: '1', descricao: 'RECEITAS', tipo: 'RECEITA', nivel: 1 },
      { codigo: '1.1', descricao: 'Receitas Operacionais', tipo: 'RECEITA', nivel: 2 },
      { codigo: '1.1.01', descricao: 'Vendas de Serviços', tipo: 'RECEITA', nivel: 3 },
      { codigo: '2', descricao: 'DESPESAS', tipo: 'DESPESA', nivel: 1 },
      { codigo: '2.1', descricao: 'Despesas Operacionais', tipo: 'DESPESA', nivel: 2 },
      { codigo: '2.1.01', descricao: 'Salários e Encargos', tipo: 'DESPESA', nivel: 3, tipoGasto: 'FIXO' },
      { codigo: '2.1.02', descricao: 'Aluguel', tipo: 'DESPESA', nivel: 3, tipoGasto: 'FIXO' },
      { codigo: '2.1.03', descricao: 'Material de Consumo', tipo: 'DESPESA', nivel: 3, tipoGasto: 'VARIAVEL' },
    ]

    for (const conta of contas) {
      await client.execute({
        sql: `INSERT INTO plano_contas (id, codigo, descricao, tipo, nivel, considera_resultado, tipo_gasto, usa_objetivo, ativo, ordem)
              VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        args: [randomUUID(), conta.codigo, conta.descricao, conta.tipo, conta.nivel, 1, conta.tipoGasto || null, 0, 1, 0]
      })
    }

    // 3. Criar banco padrão
    await client.execute({
      sql: `INSERT INTO bancos (id, nome, agencia, conta, tipo, saldo_inicial, ativo)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [randomUUID(), 'Caixa Geral', '0000', '0000', 'CORRENTE', 0, 1]
    })

    return NextResponse.json({
      success: true,
      message: 'Dados inicializados com sucesso!',
      created: {
        users: 1,
        accounts: contas.length,
        banks: 1
      },
      credentials: {
        username: 'admin',
        password: 'admin123',
        warning: '⚠️ ALTERE A SENHA APÓS O PRIMEIRO LOGIN!'
      }
    })

  } catch (error: any) {
    console.error('❌ Erro:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
