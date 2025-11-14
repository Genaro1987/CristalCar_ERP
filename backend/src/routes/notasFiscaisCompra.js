import express from 'express'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { notasFiscaisCompra, comprasParcelas } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()
router.use(verifyToken)

router.get('/', async (req, res, next) => {
  try {
    const result = await db.select().from(notasFiscaisCompra).orderBy(notasFiscaisCompra.dataEmissao)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const id = crypto.randomUUID()
    await db.insert(notasFiscaisCompra).values({ id, ...req.body })
    const [novo] = await db.select().from(notasFiscaisCompra).where(eq(notasFiscaisCompra.id, id))
    res.status(201).json(novo)
  } catch (error) {
    next(error)
  }
})

router.post('/:id/parcelas', async (req, res, next) => {
  try {
    const { parcelas } = req.body
    const novos = parcelas.map(p => ({
      id: crypto.randomUUID(),
      notaFiscalId: req.params.id,
      ...p
    }))
    await db.insert(comprasParcelas).values(novos)
    res.status(201).json({ message: 'Parcelas criadas com sucesso' })
  } catch (error) {
    next(error)
  }
})

export default router
