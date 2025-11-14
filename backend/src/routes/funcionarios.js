import express from 'express'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { funcionarios } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()
router.use(verifyToken)

router.get('/', async (req, res, next) => {
  try {
    const result = await db.select().from(funcionarios).orderBy(funcionarios.nome)
    res.json(result)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const id = crypto.randomUUID()
    await db.insert(funcionarios).values({ id, ...req.body })
    const [novo] = await db.select().from(funcionarios).where(eq(funcionarios.id, id))
    res.status(201).json(novo)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    await db.update(funcionarios).set(req.body).where(eq(funcionarios.id, req.params.id))
    const [atualizado] = await db.select().from(funcionarios).where(eq(funcionarios.id, req.params.id))
    res.json(atualizado)
  } catch (error) {
    next(error)
  }
})

export default router
