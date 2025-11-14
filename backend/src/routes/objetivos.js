import express from 'express'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { objetivos, objetivosSemanas } from '../db/schema.js'
import { eq, and } from 'drizzle-orm'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()
router.use(verifyToken)

router.get('/', async (req, res, next) => {
  try {
    const { ano, trimestre } = req.query
    let query = db.select().from(objetivos)

    const conditions = []
    if (ano) conditions.push(eq(objetivos.ano, parseInt(ano)))
    if (trimestre) conditions.push(eq(objetivos.trimestre, parseInt(trimestre)))

    if (conditions.length > 0) {
      query = query.where(and(...conditions))
    }

    const result = await query
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { contaId, ano, trimestre, metaTrimestral, tipo } = req.body
    const id = crypto.randomUUID()

    // Cria o objetivo
    await db.insert(objetivos).values({
      id,
      contaId,
      ano,
      trimestre,
      metaTrimestral,
      tipo
    })

    // Distribui em 13 semanas
    const metaSemanal = metaTrimestral / 13
    const semanas = []

    for (let i = 1; i <= 13; i++) {
      semanas.push({
        id: crypto.randomUUID(),
        objetivoId: id,
        numeroSemana: i,
        dataInicio: '', // Calcular baseado no trimestre
        dataFim: '',
        metaSemanal
      })
    }

    await db.insert(objetivosSemanas).values(semanas)

    res.status(201).json({ id, message: 'Objetivo criado com sucesso' })
  } catch (error) {
    next(error)
  }
})

export default router
