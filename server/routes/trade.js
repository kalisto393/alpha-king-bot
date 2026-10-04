import express from 'express'
import { verifyToken } from '../middleware/auth.js'
import DerivAPIClient from '../services/derivAPI.js'

const router = express.Router()

// Risk configuration validation
const validateRiskConfig = (config) => {
  if (!config.maxRiskPerTrade || config.maxRiskPerTrade <= 0) {
    return { valid: false, error: 'Invalid max risk per trade' }
  }
  if (!config.tradeAmount || config.tradeAmount <= 0) {
    return { valid: false, error: 'Invalid trade amount' }
  }
  if (config.stopLoss && config.stopLoss < 0) {
    return { valid: false, error: 'Invalid stop loss' }
  }
  return { valid: true }
}

// Place a trade
router.post('/execute', verifyToken, async (req, res) => {
  const { symbol, action, amount, stopLoss, takeProfit, duration, riskConfig } = req.body

  // Validate risk configuration
  if (riskConfig) {
    const riskValidation = validateRiskConfig(riskConfig)
    if (!riskValidation.valid) {
      return res.status(400).json({
        ok: false,
        error: riskValidation.error
      })
    }
  }

  // Validate trade parameters
  if (!symbol || !action || !amount) {
    return res.status(400).json({
      ok: false,
      error: 'Missing required trade parameters'
    })
  }

  if (!['BUY', 'SELL'].includes(action)) {
    return res.status(400).json({
      ok: false,
      error: 'Action must be BUY or SELL'
    })
  }

  try {
    const derivToken = req.headers['x-deriv-token']
    if (!derivToken) {
      return res.status(400).json({
        ok: false,
        error: 'Deriv token required'
      })
    }

    const derivClient = new DerivAPIClient(derivToken)

    // Get current balance to check risk
    const balanceResult = await derivClient.getAccountBalance()
    if (!balanceResult.ok) {
      return res.status(400).json({
        ok: false,
        error: 'Cannot verify balance'
      })
    }

    const balance = parseFloat(balanceResult.balance)
    const tradeAmount = parseFloat(amount)

    // Risk check: ensure trade amount doesn't exceed max risk
    if (riskConfig && tradeAmount > balance * (riskConfig.maxRiskPerTrade / 100)) {
      return res.status(400).json({
        ok: false,
        error: `Trade amount exceeds max risk of ${riskConfig.maxRiskPerTrade}% of balance`
      })
    }

    // Place trade
    const tradeResult = await derivClient.placeTrade({
      symbol,
      action,
      amount: tradeAmount,
      stopLoss,
      takeProfit,
      duration: duration || 5,
      durationUnit: 'm'
    })

    if (!tradeResult.ok) {
      return res.status(400).json({
        ok: false,
        error: tradeResult.error
      })
    }

    res.json({
      ok: true,
      message: 'Trade executed successfully',
      trade: {
        contractId: tradeResult.contractId,
        symbol,
        action,
        amount: tradeAmount,
        stopLoss,
        takeProfit,
        status: 'open',
        executedAt: new Date().toISOString()
      },
      payout: tradeResult.payout
    })
  } catch (error) {
    console.error('Trade execution error:', error)
    res.status(500).json({
      ok: false,
      error: 'Failed to execute trade'
    })
  }
})

// Close a trade
router.post('/close/:contractId', verifyToken, async (req, res) => {
  const { contractId } = req.params

  if (!contractId) {
    return res.status(400).json({
      ok: false,
      error: 'Contract ID is required'
    })
  }

  try {
    const derivToken = req.headers['x-deriv-token']
    if (!derivToken) {
      return res.status(400).json({
        ok: false,
        error: 'Deriv token required'
      })
    }

    const derivClient = new DerivAPIClient(derivToken)
    const result = await derivClient.closePosition(contractId)

    if (!result.ok) {
      return res.status(400).json({
        ok: false,
        error: result.error
      })
    }

    res.json({
      ok: true,
      message: 'Trade closed successfully',
      contractId,
      result: result.result
    })
  } catch (error) {
    console.error('Trade close error:', error)
    res.status(500).json({
      ok: false,
      error: 'Failed to close trade'
    })
  }
})

// Get risk configuration validation
router.post('/validate-risk', verifyToken, (req, res) => {
  const { riskConfig, balance } = req.body

  const validation = validateRiskConfig(riskConfig)
  if (!validation.valid) {
    return res.status(400).json({
      ok: false,
      error: validation.error
    })
  }

  const maxLossPerTrade = (balance * riskConfig.maxRiskPerTrade) / 100
  const recommendedLotSize = maxLossPerTrade / 100 // Simplified

  res.json({
    ok: true,
    isValid: true,
    maxLossPerTrade,
    recommendedLotSize,
    message: 'Risk configuration is valid'
  })
})

export default router
