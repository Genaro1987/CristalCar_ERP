import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { db } from './db/index.js'

// Rotas
import setupRoutes from './routes/setup.js'
import authRoutes from './routes/auth.js'
import funcionariosRoutes from './routes/funcionarios.js'
import usuariosRoutes from './routes/usuarios.js'
import planoContasRoutes from './routes/planoContas.js'
import planoDRERoutes from './routes/planoDRE.js'
import bancosRoutes from './routes/bancos.js'
import movimentacoesRoutes from './routes/movimentacoes.js'
import notasFiscaisVendaRoutes from './routes/notasFiscaisVenda.js'
import notasFiscaisCompraRoutes from './routes/notasFiscaisCompra.js'
import objetivosRoutes from './routes/objetivos.js'
import relatoriosRoutes from './routes/relatorios.js'

dotenv.config()

const PORT = process.env.PORT || 4000
const app = express()

// CORS
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  credentials: true
}))

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Rotas da API
app.use('/api/setup', setupRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/funcionarios', funcionariosRoutes)
app.use('/api/usuarios', usuariosRoutes)
app.use('/api/plano-contas', planoContasRoutes)
app.use('/api/plano-dre', planoDRERoutes)
app.use('/api/bancos', bancosRoutes)
app.use('/api/movimentacoes', movimentacoesRoutes)
app.use('/api/notas-fiscais-venda', notasFiscaisVendaRoutes)
app.use('/api/notas-fiscais-compra', notasFiscaisCompraRoutes)
app.use('/api/objetivos', objetivosRoutes)
app.use('/api/relatorios', relatoriosRoutes)

// Error handler
app.use((error, _req, res, _next) => {
  console.error('Error:', error)
  res.status(error.status || 500).json({
    error: error.message || 'Erro interno do servidor',
    details: process.env.NODE_ENV === 'development' ? error.stack : undefined
  })
})

app.listen(PORT, () => {
  console.log(`🚀 API CristalCar ERP rodando na porta ${PORT}`)
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`)
})
