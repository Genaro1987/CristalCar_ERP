const crypto = require('node:crypto')
const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const { createClient } = require('@libsql/client')

dotenv.config()

const PORT = process.env.PORT || 4000

if (!process.env.TURSO_DATABASE_URL) {
  throw new Error('TURSO_DATABASE_URL não configurado. Atualize o arquivo .env.')
}

if (!process.env.TURSO_AUTH_TOKEN) {
  console.warn('Aviso: TURSO_AUTH_TOKEN não configurado. Conexões públicas podem falhar.')
}

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN
})

const app = express()

const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*'
}))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/customers', async (_req, res, next) => {
  try {
    const result = await turso.execute('SELECT id, name, email FROM customers ORDER BY name LIMIT 100')
    res.json(result.rows)
  } catch (error) {
    next(error)
  }
})

app.post('/customers', async (req, res, next) => {
  const { name, email } = req.body

  if (!name || !email) {
    return res.status(400).json({ message: 'Campos name e email são obrigatórios.' })
  }

  try {
    const id = crypto.randomUUID()
    await turso.execute({
      sql: 'INSERT INTO customers (id, name, email) VALUES (?, ?, ?)',
      args: [id, name, email]
    })

    res.status(201).json({ id, name, email })
  } catch (error) {
    next(error)
  }
})

app.use((error, _req, res, _next) => {
  console.error(error)
  res.status(500).json({ message: 'Erro interno inesperado.' })
})

app.listen(PORT, () => {
  console.log(`API ouvindo na porta ${PORT}`)
})
