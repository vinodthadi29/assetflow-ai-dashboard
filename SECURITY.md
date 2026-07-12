# AssetFlow AI - Security Guidelines

## Overview

This document outlines security best practices, known vulnerabilities, and mitigation strategies for AssetFlow AI.

## Critical Security Issues & Status

### 1. Authentication & Authorization

#### Issue: JWT Secret Hardcoding
**Severity**: CRITICAL  
**Status**: PARTIALLY FIXED

**Before**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'
```

**After**:
```typescript
const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('CRITICAL: JWT_SECRET environment variable not set')
}
```

**Action Required**:
1. Generate secrets: `openssl rand -base64 32`
2. Set in production environment
3. Never commit .env files
4. Rotate secrets every 90 days

#### Issue: No Token Blacklist
**Severity**: HIGH  
**Status**: IMPLEMENTED

Tokens are now checked against blacklist on validation. Upgrade logout endpoint to call `blacklistToken()`.

#### Issue: Refresh Token Storage
**Severity**: HIGH  
**Status**: NEEDS IMPLEMENTATION

Refresh tokens should be stored in HTTP-only, Secure, SameSite cookies:

```typescript
res.setHeader('Set-Cookie', `refreshToken=${token}; HttpOnly; Secure; SameSite=Strict; Path=/api/auth`)
```

---

### 2. API Security

#### Issue: No Rate Limiting
**Severity**: HIGH  
**Status**: IMPLEMENTED

Rate limiter available in `lib/security-middleware.ts`:

```typescript
import { rateLimitMiddleware } from '@/lib/security-middleware'

// In API route:
const { allowed, remaining } = await rateLimitMiddleware(request, 'api')
if (!allowed) {
  return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
}
```

#### Issue: No CORS Headers
**Severity**: MEDIUM  
**Status**: NEEDS IMPLEMENTATION

Add CORS middleware to all API routes:

```typescript
import { corsMiddleware, addSecurityHeaders } from '@/lib/security-middleware'

export async function POST(request: NextRequest) {
  const corsError = corsMiddleware(request, ['http://localhost:3000', 'https://assetflow.app'])
  if (corsError instanceof NextResponse) {
    return corsError
  }
  
  // Your handler...
  const response = NextResponse.json({...})
  return addSecurityHeaders(response)
}
```

#### Issue: Missing Security Headers
**Severity**: MEDIUM  
**Status**: IMPLEMENTED

Headers automatically added by `addSecurityHeaders()`:
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- X-XSS-Protection: 1; mode=block
- Content-Security-Policy: Strict
- Referrer-Policy: strict-origin-when-cross-origin

---

### 3. Input Validation

#### Issue: Inconsistent Validation
**Severity**: HIGH  
**Status**: PARTIALLY FIXED

All API endpoints must validate input with Zod schemas:

```typescript
import { z } from 'zod'

const CreateAssetSchema = z.object({
  name: z.string().min(1).max(255),
  category: z.enum(['COMPUTERS', 'EQUIPMENT', ...]),
  location: z.string().min(1).max(255),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const validated = CreateAssetSchema.parse(body) // Throws on invalid
  
  // Use validated data only
}
```

#### Issue: No Output Escaping
**Severity**: MEDIUM  
**Status**: MONITORING

React automatically escapes HTML in JSX. Ensure any dangerously inserted HTML is sanitized:

```typescript
// UNSAFE - Never do this
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// SAFE - Use this
<div>{userInput}</div>
```

---

### 4. Password Security

#### Issue: Weak Password Validation
**Severity**: MEDIUM  
**Status**: IMPLEMENTED

Use `validatePasswordStrength()` from `lib/security-middleware.ts`:

```typescript
import { validatePasswordStrength, hashPassword } from '@/lib/security-middleware'

const validation = validatePasswordStrength(password)
if (!validation.valid) {
  return NextResponse.json({ errors: validation.errors }, { status: 400 })
}

const hashedPassword = await hashPassword(password)
```

**Requirements**:
- Minimum 12 characters
- 1 uppercase letter
- 1 lowercase letter
- 1 number
- 1 special character

---

### 5. File Upload Security

#### Issue: No File Validation
**Severity**: HIGH  
**Status**: IMPLEMENTED

Use `validateFileUpload()` before accepting files:

```typescript
import { validateFileUpload } from '@/lib/security-middleware'

const validation = validateFileUpload(file, {
  maxSize: 50 * 1024 * 1024, // 50MB
  allowedTypes: ['image/jpeg', 'image/png', 'application/pdf']
})

if (!validation.valid) {
  return NextResponse.json({ error: validation.error }, { status: 400 })
}
```

**Forbidden Extensions**: exe, bat, cmd, sh, js, php, asp

---

### 6. Database Security

#### Issue: Missing Foreign Key Enforcement
**Severity**: MEDIUM  
**Status**: NEEDS SCHEMA UPDATE

Ensure all relationships have proper cascading deletes:

```prisma
model Allocation {
  id String @id @default(cuid())
  assetId String
  asset Asset @relation(fields: [assetId], references: [id], onDelete: Cascade)
  // ...
}
```

---

### 7. Audit Logging

#### Issue: Incomplete Audit Trail
**Severity**: MEDIUM  
**Status**: PARTIALLY IMPLEMENTED

All sensitive operations must be logged:

```typescript
import { logAuditActivity } from '@/lib/audit-logger'

await logAuditActivity({
  userId: auth.userId,
  action: 'UPDATE',
  entityType: 'Asset',
  entityId: asset.id,
  reason: 'Updated asset location',
  oldValues: { location: asset.location },
  newValues: { location: newLocation },
})
```

---

## Security Checklist

### Before Every Deployment

- [ ] All environment secrets set
- [ ] No `console.log()` statements logging sensitive data
- [ ] No hardcoded passwords or keys
- [ ] All endpoints rate-limited
- [ ] All endpoints input-validated
- [ ] All responses include security headers
- [ ] All sensitive operations logged
- [ ] Database backups working
- [ ] Error tracking enabled (Sentry)
- [ ] Logs aggregated (ELK/Datadog)

### During Development

- [ ] Use `.env.local` (never commit)
- [ ] Copy from `.env.example`
- [ ] Generate strong secrets
- [ ] Never log user passwords
- [ ] Use HTTPS in production
- [ ] Keep dependencies updated
- [ ] Run security audit: `npm audit`
- [ ] Use static analysis: `eslint`

### Production Requirements

- [ ] JWT secrets 32+ characters, random
- [ ] Rate limiting configured
- [ ] CORS restricted to known origins
- [ ] HTTPS/TLS enforced
- [ ] Security headers all present
- [ ] WAF enabled (Cloudflare, AWS)
- [ ] DDoS protection active
- [ ] Monitoring and alerting active
- [ ] Incident response plan
- [ ] Regular security audits scheduled

---

## Attack Surface & Mitigations

### SQL Injection
**Risk**: Database compromise, data theft  
**Mitigation**: Parameterized queries (Prisma), input validation (Zod)

### XSS (Cross-Site Scripting)
**Risk**: Session hijacking, data theft  
**Mitigation**: React escaping, CSP headers, output validation

### CSRF (Cross-Site Request Forgery)
**Risk**: Unauthorized actions on user's behalf  
**Mitigation**: SameSite cookies, CSRF tokens

### Brute Force
**Risk**: Account compromise  
**Mitigation**: Rate limiting, account lockout, 2FA

### Privilege Escalation
**Risk**: Unauthorized access  
**Mitigation**: Role-based access control (RBAC), permission checks on all endpoints

### Token Replay
**Severity**: Session hijacking  
**Mitigation**: IP/User-Agent binding, token expiration, blacklisting

### Man-in-the-Middle
**Risk**: Data interception  
**Mitigation**: HTTPS/TLS, certificate pinning, key pinning

---

## Reporting Security Issues

**Do NOT** open public GitHub issues for security vulnerabilities.

**Instead**:
1. Email security@assetflow.app
2. Include: vulnerability description, reproduction steps, severity
3. Allow 48 hours for initial response
4. Give us 90 days before public disclosure

---

## Regular Maintenance

### Weekly
- Monitor error tracking (Sentry)
- Review failed authentication attempts
- Check rate limiter metrics

### Monthly
- Update dependencies: `npm update`
- Run security audit: `npm audit`
- Review audit logs for anomalies

### Quarterly
- Full security audit
- Penetration testing
- Dependency vulnerability scan

### Annually
- Full security compliance audit
- Employee security training
- Incident response drill

---

## Links & Resources

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- NIST Cybersecurity Framework: https://www.nist.gov/cyberframework/
- CWE Top 25: https://cwe.mitre.org/top25/
- Node.js Security: https://nodejs.org/en/docs/guides/nodejs-security/

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025 | Initial audit and security framework |

---

**Last Updated**: 2025  
**Next Review**: Every 3 months  
**Status**: ACTIVE - Security is ongoing process
