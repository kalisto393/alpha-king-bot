import express from 'express'
import DerivAPIClient from '../services/derivAPI.js'
import { generateToken } from '../middleware/auth.js'

const router = express.Router()

// Connect Deriv Account
router.post('/connect', async (req, res) => {
  const { token, accountName, accountType } = req.body

  if (!token) {
    return res.status(400).json({
      ok: false,
      error: 'Deriv token is required'
    })
  }

  try {
    const derivClient = new DerivAPIClient(token)
    const validation = await derivClient.validateToken()

    if (!validation.ok) {
      return res.status(401).json({
        ok: false,
        error: validation.error
      })
    }

    const accountData = validation.account
    const jwtToken = generateToken({
      userId: accountData.loginid,
      accountName: accountName || 'Alpha King Account',
      accountType: accountType || 'MT5',
      derivToken: token
    })

    res.json({
      ok: true,
      message: 'Account connected successfully',
      token: jwtToken,
      account: {
        loginId: accountData.loginid,
        email: accountData.email,
        currency: accountData.currency,
        isVirtual: accountData.is_virtual
      }
    })
  } catch (error) {
    console.error('Connection error:', error)
    res.status(500).json({
      ok: false,
      error: 'Failed to connect account'
    })
  }
})

// Validate existing token
router.post('/validate', async (req, res) => {
  const { token } = req.body

  if (!token) {
    return res.status(400).json({
      ok: false,
      error: 'Token is required'
    })
  }

  try {
    const derivClient = new DerivAPIClient(token)
    const validation = await derivClient.validateToken()

    if (!validation.ok) {
      return res.status(401).json({
        ok: false,
        error: validation.error
      })
    }

    res.json({
      ok: true,
      isValid: true,
      account: validation.account
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: 'Token validation failed'
    })
  }
})

export default router
