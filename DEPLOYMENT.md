# Deployment Guide for AssetFlow AI

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL database
- Git

### Local Development

1. **Install dependencies**
   ```bash
   pnpm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your database URL and API keys
   ```

3. **Initialize database**
   ```bash
   npx prisma db push
   ```

4. **Run development server**
   ```bash
   pnpm dev
   ```

5. **Open browser**
   ```
   http://localhost:3000
   ```

## Production Deployment

### Vercel (Recommended for Frontend)

1. **Connect your repository**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

2. **Configure environment variables**
   - Add all variables from `.env.local` to Vercel dashboard
   - Critical variables:
     - `DATABASE_URL` - PostgreSQL connection string
     - `NEXTAUTH_SECRET` - For session encryption
     - `API_KEY` - For third-party services

3. **Deploy**
   ```bash
   git push origin main
   ```
   Vercel automatically deploys on push.

### Database Options

#### Option 1: Neon (Recommended)
- Serverless PostgreSQL
- Scale to zero when not in use
- Free tier available
- Easy integration with Vercel

**Setup:**
1. Visit https://neon.tech
2. Create new project
3. Copy connection string
4. Add to Vercel as `DATABASE_URL`

#### Option 2: AWS RDS
- Managed PostgreSQL
- High availability options
- Multi-region support
- IAM authentication

**Setup:**
1. Create RDS instance in AWS console
2. Configure security groups
3. Get connection string
4. Add to environment variables

#### Option 3: DigitalOcean Managed Database
- Affordable managed PostgreSQL
- Backups included
- Easy scaling
- Free tier available

**Setup:**
1. Create managed database cluster
2. Whitelist your IP
3. Get connection string
4. Add to environment variables

### Backend Deployment

#### Option A: Vercel Functions
- Backend runs as serverless functions
- No separate server needed
- Already included in this setup via `/app/api` routes
- Scales automatically

#### Option B: Railway
- Simple Docker deployment
- Good for traditional servers
- Free tier with generous limits

**Setup:**
1. Connect GitHub repository
2. Railway auto-detects Next.js
3. Set environment variables
4. Deploy with one click

#### Option C: Render
- Fast deployments
- Free tier available
- Simple configuration
- Auto-scaling

**Setup:**
1. Connect GitHub repository
2. Create new web service
3. Set build command: `pnpm build`
4. Set start command: `pnpm start`
5. Add environment variables
6. Deploy

### Docker Deployment

Build and run locally:

```bash
# Build image
docker build -t assetflow-ai .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="your-db-url" \
  -e NEXTAUTH_SECRET="your-secret" \
  assetflow-ai
```

### Environment Variables Checklist

Create `.env.production` with:

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
NEXTAUTH_SECRET=generate-with: openssl rand -base64 32
NEXTAUTH_URL=https://yourdomain.com

# API Configuration
NEXT_PUBLIC_API_URL=https://yourdomain.com/api
API_TIMEOUT=30000

# Third-party Services (optional)
SLACK_WEBHOOK_URL=your-slack-webhook
SENDGRID_API_KEY=your-sendgrid-key

# Analytics
NEXT_PUBLIC_GA_ID=your-google-analytics-id
```

## CI/CD Pipeline

### GitHub Actions Setup

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Deploy to Vercel
        uses: vercel/action@master
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

## Database Migrations

### Create migration
```bash
npx prisma migrate dev --name migration_name
```

### Apply migrations in production
```bash
npx prisma migrate deploy
```

### Rollback (use with caution)
```bash
npx prisma migrate resolve --rolled-back migration_name
```

## Monitoring & Logging

### Vercel Analytics
- Built-in Web Vitals monitoring
- Deployment history
- Error tracking

### Database Monitoring
- Query performance in Neon dashboard
- Connection pools
- Backup status

### Error Tracking
Integrate Sentry:

```bash
pnpm add @sentry/nextjs
```

Configure in `next.config.mjs`:
```js
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
})
```

## Scaling Considerations

### Horizontal Scaling
- Vercel handles automatically
- Database connection pooling needed for multiple instances
- Use Redis for session sharing across instances

### Caching Strategy
- Implement Redis for cache layer
- Cache API responses with 5-10 minute TTL
- Cache static content with CloudFlare

### Database Optimization
- Add indexes for frequently queried fields
- Use connection pooling (Pgbouncer)
- Regular VACUUM and ANALYZE

## Security Checklist

- [ ] Enable HTTPS (automatic with Vercel)
- [ ] Set CSRF tokens
- [ ] Validate all inputs (using Zod schemas)
- [ ] Use parameterized queries (Prisma does this)
- [ ] Rate limit API endpoints
- [ ] Enable CORS properly
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Use environment variables for secrets
- [ ] Enable database encryption at rest

## Backup Strategy

### Automated Backups
- Neon: Automatic daily backups
- RDS: Configure backup retention (7-35 days)
- DigitalOcean: Automatic daily backups

### Manual Backup
```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

## Rollback Procedure

1. **Application Rollback**
   ```bash
   git revert <commit-hash>
   git push origin main
   # Vercel auto-deploys
   ```

2. **Database Rollback**
   ```bash
   npx prisma migrate resolve --rolled-back <migration>
   npx prisma db push
   ```

3. **Data Recovery**
   - Restore from automated backups
   - Use point-in-time recovery if available

## Performance Optimization

### Frontend
- Image optimization with Next.js Image
- Code splitting automatic with Next.js
- Font loading optimization
- Minification and compression

### Backend
- Database indexing strategy
- Query optimization
- Connection pooling
- Caching layer

### Monitoring
Track in Vercel Analytics:
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)

Target metrics:
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

## Support & Documentation

- **Vercel Docs:** https://vercel.com/docs
- **Next.js Docs:** https://nextjs.org/docs
- **Prisma Docs:** https://www.prisma.io/docs
- **Neon Docs:** https://neon.tech/docs
