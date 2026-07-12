# AssetFlow AI - Production Deployment Guide

## Pre-Deployment Checklist

### 1. Environment Setup

```bash
# Generate secure JWT secrets
JWT_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)

echo "JWT_SECRET=$JWT_SECRET"
echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
```

### 2. Required Environment Variables

```env
# Core Configuration
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:5432/assetflow

# Authentication
JWT_SECRET=<generated-secret>
JWT_REFRESH_SECRET=<generated-secret>

# CORS & Security
ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com

# Optional: Redis for distributed token management
REDIS_URL=redis://user:password@host:6379

# Next.js Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### 3. Database Preparation

```bash
# Apply all migrations
pnpm prisma migrate deploy

# Verify database connectivity
pnpm prisma db push --skip-generate

# Seed initial admin user (if needed)
# Create via register endpoint or manual insert
```

### 4. SSL/TLS Certificate

- Ensure HTTPS is configured
- Use Let's Encrypt or AWS Certificate Manager
- Update ALLOWED_ORIGINS with production URLs

---

## Deployment Steps

### Option 1: Vercel (Recommended)

```bash
# 1. Push to GitHub
git push origin production

# 2. Connect to Vercel
# - Go to https://vercel.com/dashboard
# - Import project from GitHub
# - Set environment variables (see above)
# - Deploy

# 3. Verify deployment
curl https://your-deployment.vercel.app/api/health
```

### Option 2: Docker Deployment

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --prod

COPY . .
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

```bash
# Build image
docker build -t assetflow:1.0 .

# Run container
docker run -e DATABASE_URL=<url> \
           -e JWT_SECRET=<secret> \
           -e JWT_REFRESH_SECRET=<secret> \
           -p 3000:3000 \
           assetflow:1.0
```

### Option 3: Kubernetes Deployment

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: assetflow-api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: assetflow
  template:
    metadata:
      labels:
        app: assetflow
    spec:
      containers:
      - name: api
        image: assetflow:1.0
        ports:
        - containerPort: 3000
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: assetflow-secrets
              key: database-url
        - name: JWT_SECRET
          valueFrom:
            secretKeyRef:
              name: assetflow-secrets
              key: jwt-secret
        - name: JWT_REFRESH_SECRET
          valueFrom:
            secretKeyRef:
              name: assetflow-secrets
              key: jwt-refresh-secret
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

---

## Post-Deployment Verification

### 1. Health Check

```bash
# Basic health
curl https://yourdomain.com/api/health

# Detailed health with integrity checks
curl https://yourdomain.com/api/health?detailed=true

# Response should include:
# - status: "healthy"
# - database: { status: "connected" }
# - integrity checks: all passed
```

### 2. Security Verification

```bash
# Check security headers
curl -I https://yourdomain.com/api/health

# Look for:
# - X-Content-Type-Options: nosniff
# - X-Frame-Options: DENY
# - Strict-Transport-Security: max-age=31536000
# - Content-Security-Policy: ...
```

### 3. Login Test

```bash
# Register test user
curl -X POST https://yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "name": "Test User",
    "role": "ADMIN"
  }'

# Login
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'

# Should return: { accessToken, refreshToken, user }
```

### 4. Asset CRUD Test

```bash
# Fetch assets
curl -H "Authorization: Bearer <accessToken>" \
  https://yourdomain.com/api/assets

# Should return: { success: true, data: [], total: 0 }
```

---

## Monitoring & Maintenance

### Health Check Monitoring

```bash
# Set up daily monitoring
0 0 * * * curl https://yourdomain.com/api/health?detailed=true | logger

# Alert if status is not "healthy"
```

### Log Monitoring

Monitor these logs for issues:
- Failed login attempts (SecurityAuditLog)
- Account lockouts
- API errors
- Database connectivity issues

### Rate Limiting Adjustment

If legitimate users hit rate limits, adjust in `/lib/rate-limiter.ts`:

```typescript
export const createAuthLimiter = () =>
  new RateLimiter({
    windowMs: 15 * 60 * 1000,  // 15 minutes
    maxRequests: 5,             // <-- Increase if needed
    keyPrefix: 'auth-limit',
  })
```

### Token Secrets Rotation

Annual rotation recommended:

```bash
# 1. Generate new secrets
NEW_JWT_SECRET=$(openssl rand -base64 32)
NEW_JWT_REFRESH_SECRET=$(openssl rand -base64 32)

# 2. Update environment variables (no restart needed for reads)
# 3. All new tokens will use new secrets
# 4. Old tokens expire naturally (7-30 days)
```

---

## Troubleshooting

### Issue: Database Connection Failed

```bash
# Verify connection string format
postgresql://user:password@host:5432/database

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check firewall rules
# Ensure database port (5432) is open from deployment environment
```

### Issue: JWT_SECRET Missing

```
Error: Cannot resolve environment variable: JWT_SECRET
```

**Solution:** Set JWT_SECRET and JWT_REFRESH_SECRET in environment:

```bash
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

### Issue: Account Locked

Users locked out after failed attempts need manual unlock:

```bash
# Via database (if needed)
UPDATE "User" 
SET "failedLoginAttempts" = 0, "lockedUntil" = NULL 
WHERE "email" = 'user@example.com';
```

### Issue: High Memory Usage

Check for:
1. Database query n+1 problems
2. Large pagination sizes
3. Unresolved promise chains

Monitor via `/api/health` memory metrics.

---

## Scaling Considerations

### Database
- Connection pooling via Prisma (recommended: 10-20 connections)
- Consider read replicas for analytics
- Regular backup strategy (daily minimum)

### Redis (Optional)
- Improve token blacklist reliability
- Cache frequently accessed data
- Support distributed rate limiting

### Load Balancing
- Deploy multiple instances behind load balancer
- Sticky sessions not required (stateless)
- Use health check for routing

---

## Backup Strategy

### Daily Backups
```bash
# Automated PostgreSQL backup
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Monthly Verification
```bash
# Test restore to staging environment
psql staging_db < backup-latest.sql
```

---

## Security Hardening for Production

### 1. Firewall Rules
- Allow only HTTPS (443) to public
- Database access only from application servers
- SSH access only from VPN/bastion

### 2. API Rate Limits
- Adjust per endpoint based on usage
- Monitor for attacks via `/api/health?detailed=true`

### 3. Database Encryption
- Enable encryption at rest (AWS RDS, etc.)
- Use SSL for connections (sslmode=require)

### 4. Secrets Management
- Use AWS Secrets Manager / HashiCorp Vault
- Rotate secrets every 90 days
- Never commit secrets to Git

---

## Support & Escalation

For issues:
1. Check `/api/health?detailed=true` for system status
2. Review `SecurityAuditLog` table for recent events
3. Check application logs for errors
4. Contact support with:
   - Error message
   - Endpoint affected
   - Timestamp
   - User email

---

*Last Updated: July 12, 2026*
