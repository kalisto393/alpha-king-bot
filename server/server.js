import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import authRoutes from './routes/auth.js'
import tradeRoutes from './routes/trade.js'
import accountRoutes from './routes/account.js'
import signalRoutes from './routes/signal.js'
import { errorHandler, notFound } from './middleware/errorHandler.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/account', accountRoutes)
app.use('/api/trade', tradeRoutes)
app.use('/api/signal', signalRoutes)

// Error handling
app.use(notFound)
app.use(errorHandler)

// Start server
app.listen(PORT, () => {
  console.log(`\n🤖 Alpha King BOT Backend Running`)
  console.log(`📡 Server: http://localhost:${PORT}`)
  console.log(`🔒 CORS enabled for: ${process.env.FRONTEND_URL || 'http://localhost:3000'}`)
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}\n`)
})

export default app
