# Alpha King BOT - Trading Automation Platform

## Overview

Alpha King BOT is a web-based trading automation platform that integrates with Deriv broker accounts, analyzes market charts using AI, generates trading signals, and automatically executes trades with risk management.

## Features

✅ **Deriv Account Integration** - Connect your Deriv MT5 or Standard accounts
✅ **AI Signal Generation** - Upload chart screenshots for analysis
✅ **Automated Trading** - Execute trades based on AI signals
✅ **Risk Management** - Configurable position sizing, stop loss, and take profit
✅ **Live Dashboard** - Real-time account balance, open positions, and performance metrics
✅ **Trade History** - Track all trades and performance statistics
✅ **Responsive UI** - Works on desktop and mobile browsers

## Tech Stack

### Frontend
- React 18 + Vite
- Dark neon UI (matching mockup)
- Real-time WebSocket updates

### Backend
- Node.js + Express
- Deriv API integration (REST + WebSocket)
- JWT authentication
- PostgreSQL database
- Redis caching

### Deployment
- Render.com (frontend + backend)
- PostgreSQL (Render managed)
- Redis (Render managed)

## Project Structure

```
alpha-king-bot/
├── index.html                 # HTML entry
├── vite.config.js            # Vite config
├── package.json              # Frontend deps
├── src/
│   ├── main.jsx              # React entry
│   ├── App.jsx               # Main app component
│   └── styles.css            # Neon styling
├── server/                   # Backend
│   ├── server.js             # Express server
│   ├── package.json          # Backend deps
│   ├── .env.local            # Local env
│   ├── middleware/
│   │   ├── auth.js           # JWT & token validation
│   │   └── errorHandler.js   # Error handling
│   ├── routes/
│   │   ├── auth.js           # Account connection
│   │   ├── account.js        # Balance & positions
│   │   ├── trade.js          # Trade execution
│   │   └── signal.js         # AI signal analysis
│   └── services/
│       ├── derivAPI.js       # Deriv broker connection
│       └── database.js       # PostgreSQL queries
├── database-schema.sql       # Database schema
├── render.yaml               # Render config
├── render-deploy.md          # Deployment guide
└── README.md                 # This file
```

## Installation

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/kalisto393/alpha-king-bot.git
cd alpha-king-bot
```

2. **Install frontend dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd server
npm install
cd ..
```

4. **Setup environment variables**
```bash
cp server/.env.local server/.env
# Edit server/.env with your config
```

5. **Setup PostgreSQL (optional for local dev)**
```bash
# Install PostgreSQL, then:
psql -U postgres -f database-schema.sql
```

6. **Run development servers**

Terminal 1 (Frontend):
```bash
npm run dev
# Runs on http://localhost:3000
```

Terminal 2 (Backend):
```bash
cd server
npm run dev
# Runs on http://localhost:5000
```

## Usage

### 1. Connect Deriv Account

1. Click "ADD ROBOT" or "Connect Deriv Account" button
2. Enter your Deriv token (get from Deriv → Settings → Security)
3. Select account type (MT5, Deriv X, or Standard)
4. Click "Connect Account"
5. Account info will appear on dashboard

### 2. Configure Risk Settings

1. Set max risk per trade (% of balance)
2. Set max daily loss limit
3. Set max open positions
4. Set trade lot size

### 3. Generate AI Signal

1. Go to "AI Scanner" tab
2. Upload chart screenshot (or use real-time)
3. AI analyzes pattern
4. Signal shows BUY/SELL with confidence %
5. Review Entry, TP, SL prices

### 4. Execute Trade

1. Review signal parameters
2. Click "EXECUTE" or let bot auto-trade
3. Trade executes with configured risk
4. Monitor on dashboard
5. Close manually or wait for TP/SL

## API Endpoints

### Authentication
```
POST /api/auth/connect         # Connect Deriv account
POST /api/auth/validate        # Validate token
```

### Account
```
GET  /api/account/summary      # Get account info
GET  /api/account/balance      # Get balance
GET  /api/account/positions    # Get open positions
GET  /api/account/history      # Get trade history
```

### Trading
```
POST /api/trade/execute        # Place trade
POST /api/trade/close/:id      # Close position
POST /api/trade/validate-risk  # Validate risk config
```

### Signals
```
POST /api/signal/analyze       # Analyze chart
GET  /api/signal/latest/:sym   # Get latest signal
GET  /api/signal/history/:sym  # Get signal history
```

## Security Notes

⚠️ **IMPORTANT**: This is a prototype trading bot. Use with caution.

### Risk Management
- Always set stop loss
- Never use full account balance per trade
- Start with demo account first
- Monitor bot regularly
- Set max daily loss limit
- Implement position size limits

### Security
- Never share your Deriv token
- Keep JWT_SECRET secure
- Use HTTPS in production
- Enable 2FA on Deriv account
- Regularly rotate API keys
- Use environment variables for secrets
- Implement request rate limiting
- Add IP whitelisting if possible

### Compliance
- Check local trading regulations
- Verify Deriv allows automated trading
- Include proper risk disclaimers
- Keep audit logs of trades
- Have emergency shutdown mechanism

## Deployment to Render

See [render-deploy.md](./render-deploy.md) for step-by-step instructions.

Quick summary:
```bash
# 1. Push to GitHub
git push origin main

# 2. Connect GitHub to Render
# 3. Create backend service (Node)
# 4. Create frontend service (Static)
# 5. Add environment variables
# 6. Create PostgreSQL database
# 7. Deploy!
```

## Environment Variables

```env
# Frontend
FRONTEND_URL=http://localhost:3000

# Backend
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# Cache
REDIS_URL=redis://host:6379

# Deriv
DERIV_API_KEY=your-api-key (optional)
```

## Troubleshooting

### Connection Failed
- Verify Deriv token is valid
- Check if token has expired
- Ensure backend is running
- Check CORS settings

### Trade Won't Execute
- Verify account has sufficient balance
- Check risk configuration
- Ensure bot is online
- Review trade parameters

### Database Errors
- Verify DATABASE_URL is correct
- Run database schema
- Check PostgreSQL is running

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License - see LICENSE file

## Disclaimer

🔴 **TRADING INVOLVES RISK**: This bot is for educational purposes. Use at your own risk. Past performance is not indicative of future results. Always use a demo account first. The author is not responsible for any financial losses.

## Support

For issues or questions:
- Open an issue on GitHub
- Contact: support@alphakingbot.com
- Discord: [Join our community]

## Roadmap

- [ ] Advanced AI signal models
- [ ] Multi-broker support
- [ ] Mobile app (React Native)
- [ ] Advanced backtesting engine
- [ ] Strategy marketplace
- [ ] Social trading features
- [ ] VPS hosting integration
- [ ] SMS/Email alerts

---

**Made with 🤖 for traders by Copilot**
