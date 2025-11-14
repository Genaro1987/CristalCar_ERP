import express from 'express'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { db } from '../db/index.js'
import { usuarios } from '../db/schema.js'
import { eq } from 'drizzle-orm'
import { generateToken } from '../middleware/auth.js'

const router = express.Router()

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { username, senha } = req.body

    if (!username || !senha) {
      return res.status(400).json({ error: 'Username e senha são obrigatórios' })
    }

    // Buscar usuário
    const [user] = await db
      .select()
      .from(usuarios)
      .where(eq(usuarios.username, username))
      .limit(1)

    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    if (!user.ativo) {
      return res.status(401).json({ error: 'Usuário inativo' })
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, user.senha)

    if (!senhaValida) {
      return res.status(401).json({ error: 'Credenciais inválidas' })
    }

    // Atualizar último acesso
    await db
      .update(usuarios)
      .set({ ultimoAcesso: new Date().toISOString() })
      .where(eq(usuarios.id, user.id))

    // Gerar token
    const token = generateToken(user)

    // Remover senha da resposta
    const { senha: _, ...userSemSenha } = user

    res.json({
      token,
      user: userSemSenha
    })
  } catch (error) {
    next(error)
  }
})

// Criar primeiro usuário admin (apenas se não existir nenhum)
router.post('/setup', async (req, res, next) => {
  try {
    const { username, senha, email } = req.body

    if (!username || !senha || !email) {
      return res.status(400).json({ error: 'Todos os campos são obrigatórios' })
    }

    // Verificar se já existe algum usuário
    const existingUsers = await db.select().from(usuarios).limit(1)

    if (existingUsers.length > 0) {
      return res.status(400).json({ error: 'Sistema já foi inicializado' })
    }

    // Criar usuário admin
    const hashedPassword = await bcrypt.hash(senha, 10)
    const id = crypto.randomUUID()
    const codigo = 'ADM001'

    await db.insert(usuarios).values({
      id,
      codigo,
      username,
      senha: hashedPassword,
      email,
      perfil: 'admin',
      permissoes: {},
      ativo: true
    })

    const token = generateToken({
      id,
      username,
      email,
      perfil: 'admin',
      permissoes: {}
    })

    res.status(201).json({
      message: 'Usuário administrador criado com sucesso',
      token,
      user: {
        id,
        codigo,
        username,
        email,
        perfil: 'admin'
      }
    })
  } catch (error) {
    next(error)
  }
})

// Verificar se o sistema precisa de setup
router.get('/check-setup', async (req, res, next) => {
  try {
    const existingUsers = await db.select().from(usuarios).limit(1)
    res.json({ needsSetup: existingUsers.length === 0 })
  } catch (error) {
    next(error)
  }
})

export default router
