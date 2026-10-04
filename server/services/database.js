import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
})

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
})

export const query = (text, params) => pool.query(text, params)

export const getUser = async (userId) => {
  const result = await query('SELECT * FROM users WHERE user_id = $1', [userId])
  return result.rows[0]
}

export const createUser = async (userData) => {
  const { userId, email, accountName, accountType, derivTokenHash } = userData
  const result = await query(
    'INSERT INTO users (user_id, email, account_name, account_type, deriv_token_hash, is_connected) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
    [userId, email, accountName, accountType, derivTokenHash, true]
  )
  return result.rows[0]
}

export const updateUser = async (userId, updates) => {
  const fields = Object.keys(updates).map((k, i) => `${k} = $${i + 2}`).join(', ')
  const values = [userId, ...Object.values(updates)]
  const result = await query(
    `UPDATE users SET ${fields}, updated_at = CURRENT_TIMESTAMP WHERE user_id = $1 RETURNING *`,
    values
  )
  return result.rows[0]
}

export const saveTrade = async (tradeData) => {
  const { userId, contractId, symbol, action, amount, entryPrice, stopLoss, takeProfit } = tradeData
  const result = await query(
    `INSERT INTO trades (user_id, contract_id, symbol, action, amount, entry_price, stop_loss, take_profit, status, executed_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) RETURNING *`,
    [userId, contractId, symbol, action, amount, entryPrice, stopLoss, takeProfit, 'open']
  )
  return result.rows[0]
}

export const getUserTrades = async (userId, status = null) => {
  const queryStr = status
    ? 'SELECT * FROM trades WHERE user_id = $1 AND status = $2 ORDER BY created_at DESC'
    : 'SELECT * FROM trades WHERE user_id = $1 ORDER BY created_at DESC'
  const params = status ? [userId, status] : [userId]
  const result = await query(queryStr, params)
  return result.rows
}

export const saveBotLog = async (userId, action, status, details) => {
  await query(
    'INSERT INTO bot_logs (user_id, action, status, details) VALUES ($1, $2, $3, $4)',
    [userId, action, status, JSON.stringify(details)]
  )
}

export default pool
