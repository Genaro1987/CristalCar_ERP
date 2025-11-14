import express from 'express'
import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { db } from '../db/index.js'
import { usuarios } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { verifyToken } from '../middleware/auth.js'

const router = express.Router()
router.use(verifyToken)

router.get('/', async (req, res, next) => {
  try {
    const result = await db.select().from(usuarios)
    const semSenhas = result.map(({ senha, ...user }) => user)
    res.json(semSenhas)
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  try {
    const { senha, ...data } = req.body
    const hashedPassword = await bcrypt.hash(senha, 10)
    const id = crypto.randomUUID()
    await db.insert(usuarios).values({ id, ...data, senha: hashedPassword })
    const [novo] = await db.select().from(usuarios).where(eq(usuarios.id, id))
    const { senha: _, ...semSenha } = novo
    res.status(201).json(semSenha)
  } catch (error) {
    next(error)
  }
})

router.put('/:id', async (req, res, next) => {
  try {
    const { senha, ...data } = req.body
    const updateData = data
    if (senha) {
      updateData.senha = await bcrypt.hash(senha, 10)
    }
    await db.update(usuarios).set(updateData).where(eq(usuarios.id, req.params.id))
    const [atualizado] = await db.select().from(usuarios).where(eq(usuarios.id, req.params.id))
    const { senha: _, ...semSenha } = atualizado
    res.json(semSenha)
  } catch (error) {
    next(error)
  }
})

export default router
