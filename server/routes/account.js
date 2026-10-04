import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import DerivAPIClient from '../services/derivAPI.js'

const router = express.Router()

// Get account summary
router.get('/summary', verifyToken, async (req, res) => {
  try {
    const derivToken = req.headers['x-deriv-token']
    if (!derivToken) {
      return res.status(400).json({
        ok: false,
        error: 'Deriv token required in headers'
      })
    }

    const derivClient = new DerivAPIClient(derivToken)
    const [balance, positions] = await Promise.all([
      derivClient.getAccountBalance(),
      derivClient.getOpenPositions()
    ])

    res.json({
      ok: true,
      account: {
        userId: req.user.userId,
        accountName: req.user.accountName,
        accountType: req.user.accountType,
        balance: balance.ok ? balance.balance : 0,
        currency: balance.ok ? balance.currency : 'USD',
        openPositions: positions.ok ? positions.positions.length : 0,
        botStatus: 'online'
      }
    })
  } catch (error) {
    console.error('Account summary error:', error)
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch account summary'
    })
  }
})

// Get balance only
router.get('/balance', verifyToken, async (req, res) => {
  try {
    const derivToken = req.headers['x-deriv-token']
    if (!derivToken) {
      return res.status(400).json({
        ok: false,
        error: 'Deriv token required'
      })
    }

    const derivClient = new DerivAPIClient(derivToken)
    const balance = await derivClient.getAccountBalance()

    res.json({
      ok: balance.ok,
      balance: balance.balance || 0,
      currency: balance.currency || 'USD'
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch balance'
    })
  }
})

// Get open positions
router.get('/positions', verifyToken, async (req, res) => {
  try {
    const derivToken = req.headers['x-deriv-token']
    if (!derivToken) {
      return res.status(400).json({
        ok: false,
        error: 'Deriv token required'
      })
    }

    const derivClient = new DerivAPIClient(derivToken)
    const positions = await derivClient.getOpenPositions()

    res.json({
      ok: positions.ok,
      positions: positions.positions || [],
      count: positions.positions?.length || 0
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch positions'
    })
  }
})

// Get trade history
router.get('/history', verifyToken, async (req, res) => {
  try {
    const derivToken = req.headers['x-deriv-token']
    const limit = parseInt(req.query.limit) || 50

    if (!derivToken) {
      return res.status(400).json({
        ok: false,
        error: 'Deriv token required'
      })
    }

    const derivClient = new DerivAPIClient(derivToken)
    const history = await derivClient.getTradeHistory(limit)

    res.json({
      ok: history.ok,
      trades: history.trades || [],
      count: history.trades?.length || 0
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch trade history'
    })
  }
})

export default router
