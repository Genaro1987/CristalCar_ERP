import express from 'express'
import { db } from '../db/index.js'
import { movimentacoes, planoContas, dreContasVinculadas, planoDRE } from '../db/schema.js'
import { eq, and, between, sql } from 'drizzle-orm'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()
router.use(verifyToken)

// Relatório DRE
router.get('/dre', async (req, res, next) => {
  try {
    const { dataInicio, dataFim } = req.query

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' })
    }

    // Buscar todas as movimentações do período
    const movs = await db
      .select({
        mov: movimentacoes,
        conta: planoContas
      })
      .from(movimentacoes)
      .leftJoin(planoContas, eq(movimentacoes.contaId, planoContas.id))
      .where(and(
        between(movimentacoes.dataMovimento, dataInicio, dataFim),
        eq(movimentacoes.status, 'PAGO')
      ))

    // Agrupar por conta
    const agrupado = {}
    movs.forEach(({ mov, conta }) => {
      if (!agrupado[mov.contaId]) {
        agrupado[mov.contaId] = {
          conta,
          total: 0
        }
      }
      agrupado[mov.contaId].total += mov.tipo === 'ENTRADA' ? mov.valor : -mov.valor
    })

    res.json({
      periodo: { dataInicio, dataFim },
      dados: agrupado
    })
  } catch (error) {
    next(error)
  }
})

// Fluxo de Caixa
router.get('/fluxo-caixa', async (req, res, next) => {
  try {
    const { dataInicio, dataFim } = req.query

    if (!dataInicio || !dataFim) {
      return res.status(400).json({ error: 'dataInicio e dataFim são obrigatórios' })
    }

    const movs = await db
      .select()
      .from(movimentacoes)
      .where(between(movimentacoes.dataMovimento, dataInicio, dataFim))
      .orderBy(movimentacoes.dataMovimento)

    let saldoAcumulado = 0
    const fluxo = movs.map(mov => {
      const valor = mov.tipo === 'ENTRADA' ? mov.valor : -mov.valor
      saldoAcumulado += valor
      return {
        data: mov.dataMovimento,
        descricao: mov.descricao,
        tipo: mov.tipo,
        valor: mov.valor,
        saldo: saldoAcumulado
      }
    })

    res.json(fluxo)
  } catch (error) {
    next(error)
  }
})

export default router
