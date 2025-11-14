import express from 'express'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { planoContas } from '../db/schema.js'
import { eq, and, isNull } from 'drizzle-orm'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()

// Todas as rotas requerem autenticação
router.use(verifyToken)

// Listar todas as contas
router.get('/', async (req, res, next) => {
  try {
    const { tipo, ativo } = req.query

    let query = db.select().from(planoContas)

    // Filtros opcionais
    const conditions = []
    if (tipo) conditions.push(eq(planoContas.tipo, tipo))
    if (ativo !== undefined) conditions.push(eq(planoContas.ativo, ativo === 'true'))

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    const contas = await query.orderBy(planoContas.codigo)

    res.json(contas)
  } catch (error) {
    next(error)
  }
})

// Buscar por ID
router.get('/:id', async (req, res, next) => {
  try {
    const [conta] = await db
      .select()
      .from(planoContas)
      .where(eq(planoContas.id, req.params.id))
      .limit(1)

    if (!conta) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }

    res.json(conta)
  } catch (error) {
    next(error)
  }
})

// Criar conta
router.post('/', async (req, res, next) => {
  try {
    const {
      codigo,
      descricao,
      tipo,
      nivel,
      contaPaiId,
      consideraResultado,
      tipoGasto,
      usaObjetivo,
      ordem
    } = req.body

    if (!codigo || !descricao || !tipo || !nivel) {
      return res.status(400).json({
        error: 'Campos obrigatórios: codigo, descricao, tipo, nivel'
      })
    }

    if (!['RECEITA', 'DESPESA'].includes(tipo)) {
      return res.status(400).json({
        error: 'Tipo deve ser RECEITA ou DESPESA'
      })
    }

    if (nivel < 1 || nivel > 9) {
      return res.status(400).json({
        error: 'Nível deve estar entre 1 e 9'
      })
    }

    const id = crypto.randomUUID()

    await db.insert(planoContas).values({
      id,
      codigo,
      descricao,
      tipo,
      nivel,
      contaPaiId: contaPaiId || null,
      consideraResultado: consideraResultado !== false,
      tipoGasto: tipoGasto || null,
      usaObjetivo: usaObjetivo || false,
      ativo: true,
      ordem: ordem || 0
    })

    const [novaConta] = await db
      .select()
      .from(planoContas)
      .where(eq(planoContas.id, id))
      .limit(1)

    res.status(201).json(novaConta)
  } catch (error) {
    next(error)
  }
})

// Atualizar conta
router.put('/:id', async (req, res, next) => {
  try {
    const {
      codigo,
      descricao,
      tipo,
      nivel,
      contaPaiId,
      consideraResultado,
      tipoGasto,
      usaObjetivo,
      ativo,
      ordem
    } = req.body

    const updateData = {}
    if (codigo !== undefined) updateData.codigo = codigo
    if (descricao !== undefined) updateData.descricao = descricao
    if (tipo !== undefined) updateData.tipo = tipo
    if (nivel !== undefined) updateData.nivel = nivel
    if (contaPaiId !== undefined) updateData.contaPaiId = contaPaiId
    if (consideraResultado !== undefined) updateData.consideraResultado = consideraResultado
    if (tipoGasto !== undefined) updateData.tipoGasto = tipoGasto
    if (usaObjetivo !== undefined) updateData.usaObjetivo = usaObjetivo
    if (ativo !== undefined) updateData.ativo = ativo
    if (ordem !== undefined) updateData.ordem = ordem

    updateData.updatedAt = new Date().toISOString()

    await db
      .update(planoContas)
      .set(updateData)
      .where(eq(planoContas.id, req.params.id))

    const [contaAtualizada] = await db
      .select()
      .from(planoContas)
      .where(eq(planoContas.id, req.params.id))
      .limit(1)

    if (!contaAtualizada) {
      return res.status(404).json({ error: 'Conta não encontrada' })
    }

    res.json(contaAtualizada)
  } catch (error) {
    next(error)
  }
})

// Deletar conta (soft delete)
router.delete('/:id', async (req, res, next) => {
  try {
    await db
      .update(planoContas)
      .set({ ativo: false, updatedAt: new Date().toISOString() })
      .where(eq(planoContas.id, req.params.id))

    res.status(204).send()
  } catch (error) {
    next(error)
  }
})

// Listar contas hierarquicamente
router.get('/hierarquia/:tipo', async (req, res, next) => {
  try {
    const { tipo } = req.params

    if (!['RECEITA', 'DESPESA'].includes(tipo.toUpperCase())) {
      return res.status(400).json({ error: 'Tipo deve ser RECEITA ou DESPESA' })
    }

    const todasContas = await db
      .select()
      .from(planoContas)
      .where(and(
        eq(planoContas.tipo, tipo.toUpperCase()),
        eq(planoContas.ativo, true)
      ))
      .orderBy(planoContas.codigo)

    // Construir hierarquia
    const buildTree = (parentId = null, nivel = 1) => {
      return todasContas
        .filter(c => c.contaPaiId === parentId && c.nivel === nivel)
        .map(conta => ({
          ...conta,
          filhos: buildTree(conta.id, nivel + 1)
        }))
    }

    const hierarquia = buildTree()

    res.json(hierarquia)
  } catch (error) {
    next(error)
  }
})

export default router
