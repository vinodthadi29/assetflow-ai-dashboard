# AssetFlow AI - Setup & Troubleshooting Guide

## Registration Failed Error

If you see "Registration failed. Please try again." error, it's usually because the database is not configured.

### Root Cause

The application requires a PostgreSQL database to store user accounts and asset data. Without it:
- Registration fails (can't create users)
- Login fails (can't query users)
- Dashboard won't load (can't fetch data)

### Quick Fix (5 minutes)

#### Step 1: Set Database URL
Go to your project settings (top right) → **Vars** → Add variable:

```
KEY: DATABASE_URL
VALUE: postgresql://user:password@host/database
```

For testing, you can use:
- **Neon (Recommended)**: Free tier at https://neon.tech
- **Supabase**: Free tier at https://supabase.com
- **Docker PostgreSQL**: Local development

#### Step 2: Run Migrations
```bash
pnpm prisma migrate deploy
```

This creates all required tables in your database.

#### Step 3: Generate Auth Secrets
```bash
export JWT_SECRET=$(openssl rand -base64 32)
export JWT_REFRESH_SECRET=$(openssl rand -base64 32)
```

Add these to your project **Vars** as well.

#### Step 4: Restart Dev Server
```bash
pnpm dev
```

#### Step 5: Try Registration Again
Go to `/register` and create an account.

---

## Database Setup Options

### Option 1: Neon (Recommended - 30 seconds)

1. Go to https://neon.tech and sign up
2. Create a new project
3. Copy the connection string (looks like `postgresql://user:pass@...`)
4. Set as DATABASE_URL in project Vars
5. Done! Auto-scalable and free tier available

### Option 2: Supabase (30 seconds)

1. Go to https://supabase.com and sign up
2. Create new project
3. Go to Settings → Database → Connection String
4. Copy Prisma connection string
5. Set as DATABASE_URL in project Vars
6. Done! Built-in auth and real-time capabilities

### Option 3: Docker (2 minutes)

```bash
# Start PostgreSQL in Docker
docker run --name assetflow-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=assetflow \
  -p 5432:5432 \
  -d postgres:15

# Connection string
postgresql://postgres:password@localhost:5432/assetflow
```

### Option 4: Local PostgreSQL (varies)

If you have PostgreSQL installed locally:
```
postgresql://postgres:password@localhost:5432/assetflow
```

---

## Common Errors & Fixes

### Error: "Database connection error"

**Cause**: DATABASE_URL is not set or is invalid

**Fix**:
1. Check project Vars - is DATABASE_URL set?
2. Is the connection string correct? (starts with `postgresql://`)
3. Can you connect to the database from your terminal?
   ```bash
   psql "your-connection-string"
   ```

### Error: "Auth failed" / "Invalid credentials"

**Cause**: User doesn't exist OR database migrations haven't been run

**Fix**:
```bash
# Run migrations
pnpm prisma migrate deploy

# Check migrations were applied
pnpm prisma migrate status

# Seed initial data
pnpm prisma db seed  # if seed.ts exists
```

### Error: "Account temporarily locked"

**Cause**: Too many failed login attempts (5 in 15 minutes)

**Fix**:
- Wait 30 minutes before trying again
- Or reset in database:
  ```bash
  psql your-connection-string
  UPDATE "User" SET "lockedUntil" = NULL, "failedLoginAttempts" = 0 WHERE email = 'your@email.com';
  ```

### Error: "Email already registered"

**Cause**: Account already exists with that email

**Fix**:
- Use different email or
- Delete existing user:
  ```bash
  psql your-connection-string
  DELETE FROM "User" WHERE email = 'your@email.com';
  ```

### Error: "Password must be at least 8 characters"

**Cause**: Password validation failed

**Fix**:
- Ensure password is 8+ characters
- No spaces at beginning/end
- Try different password

---

## Verification Steps

After setup, verify everything works:

```bash
# 1. Check DATABASE_URL is set
echo $DATABASE_URL

# 2. Test database connection
pnpm prisma db execute --stdin <<EOF
SELECT 1;
EOF

# 3. Check migrations were applied
pnpm prisma migrate status

# 4. Start dev server
pnpm dev

# 5. Try registration
# Go to http://localhost:3000/register
# Create account with:
#   Email: test@example.com
#   Password: TestPassword123
#   Name: Test User

# 6. Try login
# Go to http://localhost:3000/login
# Use same email/password
```

---

## For Development Only

### Mock Database (No Database Needed)

To test without a real database, you can mock the auth in development:

```typescript
// lib/prisma.ts - for development only
if (!process.env.DATABASE_URL) {
  console.warn('[v0] WARNING: DATABASE_URL not set. Using mock auth.')
  // Mock implementation
}
```

But production deployment **requires** a real database.

---

## Deployment Checklist

Before deploying to production:

- [ ] DATABASE_URL set in production environment
- [ ] JWT_SECRET set in production environment
- [ ] JWT_REFRESH_SECRET set in production environment
- [ ] Migrations run: `pnpm prisma migrate deploy`
- [ ] Build successful: `pnpm build`
- [ ] Test in staging first

---

## Still Stuck?

### Check Logs

```bash
# See dev server output
# Look for error messages with [v0] prefix

# Check database logs
# Neon: Project → Logs
# Supabase: SQL Editor → Recent Queries
# Docker: docker logs assetflow-postgres
```

### Debug Commands

```bash
# Test database connection
psql "your-database-url"

# List all tables
\dt

# Check User table
SELECT * FROM "User";

# Check migrations
SELECT * FROM "_prisma_migrations";
```

### Get Help

1. Check DEPLOYMENT_GUIDE.md for production setup
2. Check START_HERE.md for overview
3. Review DOCUMENTATION_INDEX.md for all guides

---

## Production Troubleshooting

### Issue: Registration works locally but fails on production

**Cause**: Environment variables not set on hosting platform

**Fix**:
1. Go to your hosting dashboard (Vercel/Fly/Railway)
2. Settings → Environment Variables
3. Add:
   - DATABASE_URL
   - JWT_SECRET
   - JWT_REFRESH_SECRET
4. Redeploy

### Issue: "Too many database connections"

**Cause**: Connection pool exhausted

**Fix**:
- Neon: Increase connection limit in project settings
- For production, use connection pooling:
  ```
  DATABASE_URL="postgresql://user:pass@host/db?schema=public"
  PRISMA_CLIENT_ENGINE_TYPE="dataproxy"
  ```

### Issue: Database locked / migrations stuck

**Cause**: Concurrent migration attempts

**Fix**:
```bash
# Kill any stuck migrations
pnpm prisma migrate resolve --rolled-back create_initial_schema

# Reset and retry
pnpm prisma migrate reset
pnpm prisma migrate deploy
```

---

## Performance Tips

### For Better Stability

1. **Use connection pooling** (for production)
   ```
   DATABASE_URL="pooling_connection_string"
   ```

2. **Monitor query performance**
   ```bash
   # Enable query logging
   echo "prisma.prisma = { log: ['query'] }" >> .env
   ```

3. **Regular backups**
   - Neon: Auto-backup enabled
   - Supabase: Daily backups
   - Docker: Use volumes for persistence

---

## Environment Variables Reference

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| DATABASE_URL | ✅ Yes | postgresql://... | Main database connection |
| JWT_SECRET | ✅ Yes | random-string | Auth token signing |
| JWT_REFRESH_SECRET | ✅ Yes | random-string | Refresh token signing |
| NODE_ENV | Optional | production | Set by hosting provider |
| NEXT_PUBLIC_API_URL | Optional | http://localhost:3000 | API base URL |

---

## Quick Reference

| Task | Command |
|------|---------|
| Setup database | See Database Setup Options section |
| Run migrations | `pnpm prisma migrate deploy` |
| Create admin account | `pnpm prisma db seed` |
| Reset database | `pnpm prisma migrate reset` (dev only) |
| Check connection | `pnpm prisma db execute --stdin < test.sql` |
| View schema | `pnpm prisma studio` |
| Debug schema | `pnpm prisma generate` |

---

Generated: July 12, 2026
Last Updated: July 12, 2026
