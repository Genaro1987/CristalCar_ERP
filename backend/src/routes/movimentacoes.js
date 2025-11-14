import express from 'express'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { movimentacoes, planoContas, bancos } from '../db/schema.js'
import { eq, and, between, gte, lte, sql } from 'drizzle-orm'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

router.use(verifyToken)

// Listar movimentações com filtros
router.get('/', async (req, res, next) => {
  try {
    const {
      tipo,
      contaId,
      bancoId,
      status,
      dataInicio,
      dataFim,
      page = 1,
      limit = 50
    } = req.query

    let query = db
      .select({
        movimentacao: movimentacoes,
        conta: planoContas,
        banco: bancos
      })
      .from(movimentacoes)
      .leftJoin(planoContas, eq(movimentacoes.contaId, planoContas.id))
      .leftJoin(bancos, eq(movimentacoes.bancoId, bancos.id))

    const conditions = []
    if (tipo) conditions.push(eq(movimentacoes.tipo, tipo))
    if (contaId) conditions.push(eq(movimentacoes.contaId, contaId))
    if (bancoId) conditions.push(eq(movimentacoes.bancoId, bancoId))
    if (status) conditions.push(eq(movimentacoes.status, status))
    if (dataInicio) conditions.push(gte(movimentacoes.dataMovimento, dataInicio))
    if (dataFim) conditions.push(lte(movimentacoes.dataMovimento, dataFim))

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)
    const results = await query
      .orderBy(sql`${movimentacoes.dataMovimento} DESC`)
      .limit(parseInt(limit))
      .offset(offset)

    res.json(results)
  } catch (error) {
    next(error)
  }
})

// Buscar por ID
router.get('/:id', async (req, res, next) => {
  try {
    const [result] = await db
      .select({
        movimentacao: movimentacoes,
        conta: planoContas,
        banco: bancos
      })
      .from(movimentacoes)
      .leftJoin(planoContas, eq(movimentacoes.contaId, planoContas.id))
      .leftJoin(bancos, eq(movimentacoes.bancoId, bancos.id))
      .where(eq(movimentacoes.id, req.params.id))
      .limit(1)

    if (!result) {
      return res.status(404).json({ error: 'Movimentação não encontrada' })
    }

    res.json(result)
  } catch (error) {
    next(error)
  }
})

// Criar movimentação
router.post('/', async (req, res, next) => {
  try {
    const {
      tipo,
      descricao,
      contaId,
      bancoId,
      valor,
      dataMovimento,
      dataVencimento,
      dataPagamento,
      status,
      formaPagamento,
      observacoes
    } = req.body

    if (!tipo || !descricao || !contaId || !valor || !dataMovimento) {
      return res.status(400).json({
        error: 'Campos obrigatórios: tipo, descricao, contaId, valor, dataMovimento'
      })
    }

    if (!['ENTRADA', 'SAIDA'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo deve ser ENTRADA ou SAIDA'
      })
    }

    const id = crypto.randomUUID()

    await db.insert(movimentacoes).values({
      id,
      tipo,
      descricao,
      contaId,
      bancoId: bancoId || null,
      valor: parseFloat(valor),
      dataMovimento,
      dataVencimento: dataVencimento || null,
      dataPagamento: dataPagamento || null,
      status: status || 'PENDENTE',
      formaPagamento: formaPagamento || null,
      observacoes: observacoes || null,
      origem: 'MANUAL',
      usuarioId: req.user.id
    })

    const [novaMovimentacao] = await db
      .select()
      .from(movimentacoes)
      .where(eq(movimentacoes.id, id))
      .limit(1)

    res.status(201).json(novaMovimentacao)
  } catch (error) {
    next(error)
  }
})

// Atualizar movimentação
router.put('/:id', async (req, res, next) => {
  try {
    const updateData = { ...req.body }
    delete updateData.id
    delete updateData.createdAt
    updateData.updatedAt = new Date().toISOString()

    if (updateData.valor) {
      updateData.valor = parseFloat(updateData.valor)
    }

    await db
      .update(movimentacoes)
      .set(updateData)
      .where(eq(movimentacoes.id, req.params.id))

    const [movimentacaoAtualizada] = await db
      .select()
      .from(movimentacoes)
      .where(eq(movimentacoes.id, req.params.id))
      .limit(1)

    if (!movimentacaoAtualizada) {
      return res.status(404).json({ error: 'Movimentação não encontrada' })
    }

    res.json(movimentacaoAtualizada)
  } catch (error) {
    next(error)
  }
})

// Deletar movimentação
router.delete('/:id', async (req, res, next) => {
  try {
    await db
      .delete(movimentacoes)
      .where(eq(movimentacoes.id, req.params.id))

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// Resumo financeiro por período
router.get('/resumo/periodo', async (req, res, next) => {
  try {
    const { dataInicio, dataFim } = req.query

    if (!dataInicio || !dataFim) {
      return res.status(400).json({
        error: 'dataInicio e dataFim são obrigatórios'
      })
    }

    const entradas = await db
      .select({ total: sql`SUM(${movimentacoes.valor})` })
      .from(movimentacoes)
      .where(and(
        eq(movimentacoes.tipo, 'ENTRADA'),
        eq(movimentacoes.status, 'PAGO'),
        between(movimentacoes.dataMovimento, dataInicio, dataFim)
      ))

    const saidas = await db
      .select({ total: sql`SUM(${movimentacoes.valor})` })
      .from(movimentacoes)
      .where(and(
        eq(movimentacoes.tipo, 'SAIDA'),
        eq(movimentacoes.status, 'PAGO'),
        between(movimentacoes.dataMovimento, dataInicio, dataFim)
      ))

    const totalEntradas = entradas[0]?.total || 0
    const totalSaidas = saidas[0]?.total || 0

    res.json({
      periodo: { dataInicio, dataFim },
      entradas: totalEntradas,
      saidas: totalSaidas,
      saldo: totalEntradas - totalSaidas
    })
  } catch (error) {
    next(error)
  }
})

export default router
