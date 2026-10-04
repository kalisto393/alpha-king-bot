# Deploying Alpha King BOT to Render

## Prerequisites

1. Render account (create at https://render.com)
2. GitHub repository with the code
3. Environment variables ready

## Deployment Steps

### 1. Push to GitHub

```bash
git add .
git commit -m "Add Deriv backend and Render config"
git push origin main
```

### 2. Connect to Render

1. Go to https://dashboard.render.com
2. Click "New" → "Web Service"
3. Connect your GitHub account
4. Select `alpha-king-bot` repository
5. Configure:
   - **Name**: `alpha-king-bot-backend`
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Starter (or Pro for better performance)

### 3. Set Environment Variables

In Render dashboard, add these to your service:

```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://your-frontend-domain.onrender.com
JWT_SECRET=generate-a-long-random-string-here
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://host:port
```

### 4. Deploy Frontend

1. Create another service for static site
2. Build command: `npm run build`
3. Static publish path: `dist`
4. Set `FRONTEND_URL` in backend pointing to this frontend URL

### 5. Setup Database (PostgreSQL)

1. In Render dashboard, create PostgreSQL database
2. Copy connection string to `DATABASE_URL` in backend service
3. Initialize schema (see database-schema.sql)

### 6. Setup Redis (Optional but recommended)

1. Create Redis instance in Render
2. Copy URL to `REDIS_URL` environment variable

### 7. Verify Deployment

```bash
# Test health check
curl https://your-backend.onrender.com/api/health

# Should return:
# {"status":"ok","timestamp":"...","environment":"production"}
```

## Environment Variables for Production

```bash
# Generate a strong JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Monitoring

- View logs: https://dashboard.render.com → Service → Logs
- Set up alerts: Render dashboard → Settings → Notifications
- Monitor uptime: External monitoring service

## Custom Domain

1. Go to service settings
2. Custom Domain
3. Add your domain
4. Update DNS records as instructed

## Database Backups

Render automatically backs up PostgreSQL. To restore:

1. Render dashboard → Database → Backups
2. Select backup point
3. Click Restore

## Scaling

For production traffic:

1. Upgrade plan from Starter to Pro/Premium
2. Enable auto-scaling if available
3. Use Redis for session caching
4. Implement rate limiting

## Security Checklist

- [ ] Change JWT_SECRET to strong value
- [ ] Enable HTTPS (automatic with Render)
- [ ] Set CORS_ORIGINS properly
- [ ] Use environment variables for all secrets
- [ ] Never commit .env files
- [ ] Enable database backups
- [ ] Set up monitoring/alerts
- [ ] Review Deriv token handling
- [ ] Implement request logging
- [ ] Set up rate limiting

## Troubleshooting

### 502 Bad Gateway
- Check logs for errors
- Verify environment variables
- Check database connection

### CORS Issues
- Verify FRONTEND_URL matches actual domain
- Check CORS middleware in server.js

### Database Connection Failed
- Verify DATABASE_URL format
- Check database is running
- Verify credentials

## Cost Estimate

- Backend Web Service (Starter): $7/month
- Frontend Static (Free): $0/month
- PostgreSQL (Starter): $7/month
- Redis (Starter): $7/month
- **Total**: ~$21/month

Upgrade to Pro for production: ~$50-100/month depending on usage.
