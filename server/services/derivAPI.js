import axios from 'axios'
import WebSocket from 'ws'

const DERIV_API_URL = 'wss://ws.derivws.com/websockets/v3'
const DERIV_REST_API = 'https://api.deriv.com/api/v3'

class DerivAPIClient {
  constructor(token) {
    this.token = token
    this.ws = null
    this.requestId = 1
    this.listeners = {}
  }

  // Validate token and get account details
  async validateToken() {
    try {
      const response = await axios.get(`${DERIV_REST_API}/authorize`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })

      if (response.data && response.data.authorize) {
        return {
          ok: true,
          account: response.data.authorize
        }
      }
      
      return { ok: false, error: 'Invalid token response' }
    } catch (error) {
      console.error('Token validation error:', error.message)
      return {
        ok: false,
        error: error.response?.data?.error?.message || 'Token validation failed'
      }
    }
  }

  // Get account balance and status
  async getAccountBalance() {
    try {
      const response = await axios.get(`${DERIV_REST_API}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })

      return {
        ok: true,
        balance: response.data.balance,
        currency: response.data.currency
      }
    } catch (error) {
      console.error('Balance fetch error:', error.message)
      return {
        ok: false,
        error: 'Failed to fetch balance'
      }
    }
  }

  // Get open positions
  async getOpenPositions() {
    try {
      const response = await axios.get(`${DERIV_REST_API}/open_positions`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })

      return {
        ok: true,
        positions: response.data.positions || []
      }
    } catch (error) {
      console.error('Open positions error:', error.message)
      return {
        ok: false,
        error: 'Failed to fetch positions',
        positions: []
      }
    }
  }

  // Get trade history
  async getTradeHistory(limit = 50) {
    try {
      const response = await axios.get(`${DERIV_REST_API}/trade_history`, {
        params: { limit },
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      })

      return {
        ok: true,
        trades: response.data.trades || []
      }
    } catch (error) {
      console.error('Trade history error:', error.message)
      return {
        ok: false,
        error: 'Failed to fetch trade history',
        trades: []
      }
    }
  }

  // Place a trade (BUY/SELL)
  async placeTrade(config) {
    const {
      symbol,
      action,
      amount,
      stopLoss,
      takeProfit,
      duration = 5,
      durationUnit = 'm'
    } = config

    try {
      const payload = {
        contract_type: action === 'BUY' ? 'CALL' : 'PUT',
        currency: 'USD',
        amount: parseFloat(amount),
        symbol: symbol || 'EURUSD',
        duration: parseInt(duration),
        duration_unit: durationUnit,
        ...(stopLoss && { stop_loss: parseFloat(stopLoss) }),
        ...(takeProfit && { take_profit: parseFloat(takeProfit) })
      }

      const response = await axios.post(
        `${DERIV_REST_API}/buy`,
        payload,
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return {
        ok: true,
        trade: response.data,
        contractId: response.data.contract_id,
        payout: response.data.payout
      }
    } catch (error) {
      console.error('Trade placement error:', error.message)
      return {
        ok: false,
        error: error.response?.data?.error?.message || 'Failed to place trade'
      }
    }
  }

  // Close position
  async closePosition(contractId) {
    try {
      const response = await axios.post(
        `${DERIV_REST_API}/sell`,
        { contract_id: contractId },
        {
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        }
      )

      return {
        ok: true,
        result: response.data
      }
    } catch (error) {
      console.error('Close position error:', error.message)
      return {
        ok: false,
        error: 'Failed to close position'
      }
    }
  }

  // Get market data via WebSocket
  connectWebSocket() {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(DERIV_API_URL)

      this.ws.on('open', () => {
        console.log('Deriv WebSocket connected')
        resolve(true)
      })

      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data)
          if (message.echo_req) {
            const reqId = message.echo_req.req_id
            if (this.listeners[reqId]) {
              this.listeners[reqId](message)
              delete this.listeners[reqId]
            }
          }
        } catch (error) {
          console.error('WebSocket message parse error:', error)
        }
      })

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error.message)
        reject(error)
      })

      this.ws.on('close', () => {
        console.log('Deriv WebSocket disconnected')
      })
    })
  }

  // Subscribe to market prices
  subscribeToPrice(symbol) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return null
    }

    const req_id = this.requestId++
    const request = {
      ticks: symbol || 'EURUSD',
      req_id
    }

    this.ws.send(JSON.stringify(request))
    return req_id
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }
}

export default DerivAPIClient
