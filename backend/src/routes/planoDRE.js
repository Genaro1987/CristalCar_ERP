import express from 'express'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { planoDRE, dreContasVinculadas } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()
router.use(verifyToken)

router.get('/', async (req, res, next) => {
  try {
    const result = await db.select().from(planoDRE).orderBy(planoDRE.ordem)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const id = crypto.randomUUID()
    await db.insert(planoDRE).values({ id, ...req.body })
    const [novo] = await db.select().from(planoDRE).where(eq(planoDRE.id, id))
    res.status(201).json(novo)
  } catch (error) {
    next(error)
  }
})

router.post('/:id/vincular-conta', async (req, res, next) => {
  try {
    const { contaId } = req.body
    const id = crypto.randomUUID()
    await db.insert(dreContasVinculadas).values({
      id,
      dreId: req.params.id,
      contaId
    })
    res.status(201).json({ message: 'Conta vinculada com sucesso' })
  } catch (error) {
    next(error)
  }
})

export default router
