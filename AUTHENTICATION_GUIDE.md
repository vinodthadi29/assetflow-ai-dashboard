# Authentication System Implementation Guide

## Overview

AssetFlow AI now has a complete, production-ready authentication system with JWT-based access tokens, session management, and automatic token refresh. This guide explains how it works and how to use it.

## Architecture

### Backend Components

#### 1. Authentication Endpoints (`app/api/auth/`)

**POST /api/auth/register**
- Create new user accounts
- Input: `{ email, password, name, role }`
- Output: User details (no tokens)
- Role options: `EMPLOYEE`, `DEPARTMENT_HEAD`, `ASSET_MANAGER`, `ADMIN`

**POST /api/auth/login**
- Authenticate user and issue tokens
- Input: `{ email, password }`
- Output: `{ user, accessToken, refreshToken }`
- Sets HTTP-only secure cookie for accessToken

**POST /api/auth/logout**
- Invalidate user session
- Requires: Authorization header with valid accessToken
- Deletes session from database

**POST /api/auth/refresh**
- Issue new access token using refresh token
- Input: `{ refreshToken }`
- Output: `{ accessToken }`
- Used for automatic token refresh

#### 2. JWT Token Structure

**Access Token (7-day expiry)**
```
{
  userId: string
  email: string
  role: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE'
  sessionId: string
  iat: timestamp
  exp: timestamp
}
```

**Refresh Token (30-day expiry)**
```
{
  userId: string
  type: 'refresh'
  sessionId: string
  iat: timestamp
  exp: timestamp
}
```

#### 3. Session Management

- Sessions stored in `prisma.session` table
- Tracks userId, refreshToken, and expiration
- SessionId embedded in JWT for validation
- Supports multi-session logout (revoke all sessions)

#### 4. Security Features

- Passwords hashed with bcrypt (12 rounds)
- JWT signed with HS512 algorithm
- HTTP-only secure cookies for tokens
- CSRF protection middleware
- Rate limiting on auth endpoints
- Audit logging of all auth activities

### Frontend Components

#### 1. useAuth Hook (`hooks/use-auth.ts`)

Main authentication hook for all auth operations.

```typescript
const { user, isAuthenticated, login, logout, register, refreshAccessToken } = useAuth()
```

**State**
- `user`: Current authenticated user
- `accessToken`: Current JWT access token
- `refreshToken`: Refresh token for token renewal
- `isLoading`: Operation in progress
- `isAuthenticated`: Boolean auth status
- `error`: Last error message

**Methods**
- `login(email, password)`: Login with credentials
- `register(email, password, name, role)`: Create new account
- `logout()`: Logout and clear auth
- `refreshAccessToken()`: Manually refresh token

#### 2. ProtectedRoute Component (`components/protected-route.tsx`)

Wrapper component for protected pages.

```tsx
<ProtectedRoute requiredRole={['ADMIN', 'ASSET_MANAGER']}>
  <SensitiveContent />
</ProtectedRoute>
```

- Checks authentication on mount
- Verifies user role if specified
- Redirects to login if not authenticated
- Redirects to /unauthorized if role insufficient

#### 3. API Interceptor (`lib/api-interceptor.ts`)

Automatic token management for API calls.

```typescript
import { apiClient } from '@/lib/api-interceptor'

const data = await apiClient.get('/api/assets')
const result = await apiClient.post('/api/allocations', payload)
```

**Features**
- Automatically adds Authorization header
- Handles token expiration with automatic refresh
- Retries failed requests with new token
- Logs out user if refresh fails

## Database

### Users Table

```sql
CREATE TABLE "User" (
  id String @id @default(cuid())
  email String @unique
  password String (bcrypt hashed)
  name String
  role Role (ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE)
  departmentId String @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  sessions Session[]
)
```

### Sessions Table

```sql
CREATE TABLE "Session" (
  id String @id @default(cuid())
  userId String
  refreshToken String
  expiresAt DateTime
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Demo Credentials

For testing, use these credentials:

```
Email: admin@assetflow.com
Password: Admin123456
Role: ADMIN
```

Additional test accounts:
- `manager@assetflow.com` - Asset Manager
- `employee@assetflow.com` - Employee

## Usage Examples

### Basic Login Flow

```typescript
import { useAuth } from '@/hooks/use-auth'

export function LoginForm() {
  const { login, error, isLoading } = useAuth()

  const handleSubmit = async (email: string, password: string) => {
    const success = await login(email, password)
    if (success) {
      // Automatically redirected to dashboard
      router.push('/dashboard')
    }
  }
}
```

### Protecting Routes

```typescript
import { ProtectedRoute } from '@/components/protected-route'

export function AdminPage() {
  return (
    <ProtectedRoute requiredRole={['ADMIN']}>
      <AdminContent />
    </ProtectedRoute>
  )
}
```

### API Calls with Auth

```typescript
import { apiClient } from '@/lib/api-interceptor'

export function AssetsList() {
  const { user } = useAuth()

  useEffect(() => {
    // Token automatically added to header
    apiClient.get('/api/assets').then(setAssets)
  }, [user])
}
```

### Logout

```typescript
import { useAuth } from '@/hooks/use-auth'

export function UserMenu() {
  const { logout } = useAuth()

  return (
    <button onClick={logout}>
      Sign Out
    </button>
  )
}
```

## Environment Variables

Required for production:

```env
DATABASE_URL=postgresql://user:pass@host:5432/assetflow
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

Generate secrets with:
```bash
openssl rand -base64 32
```

## Token Refresh Flow

Automatic token refresh happens when:

1. API call returns 401 (Unauthorized)
2. Access token expired
3. Refresh token exists and valid
4. System automatically:
   - Calls `/api/auth/refresh` endpoint
   - Gets new access token
   - Retries original API call
   - User stays logged in seamlessly

## Security Best Practices

1. **Never store tokens in localStorage alone**
   - Use secure HTTP-only cookies
   - localStorage as fallback for session recovery

2. **Always use HTTPS in production**
   - Tokens transmitted over encrypted connection
   - secure flag set on cookies

3. **Validate tokens on backend**
   - Verify signature, expiration, sessionId
   - Check token blacklist for revoked tokens

4. **Implement rate limiting**
   - Prevent brute force attacks
   - 5 attempts per 15 minutes on login

5. **Audit all auth events**
   - Log successful/failed logins
   - Track token refresh usage
   - Monitor suspicious patterns

6. **Rotate secrets regularly**
   - Change JWT secrets monthly
   - Monitor for compromised tokens

## Troubleshooting

### User stuck on login page
- Check localStorage for stale tokens
- Clear browser cache and cookies
- Verify DATABASE_URL connection

### Token refresh loops
- Check JWT_REFRESH_SECRET set correctly
- Verify session exists in database
- Confirm token hasn't been manually modified

### 401 errors on protected routes
- Ensure accessToken in localStorage
- Check Authorization header format
- Verify token hasn't expired

### Cannot logout
- Check refresh token is sent in logout request
- Verify database session deletion
- Confirm cookies cleared

## Files Modified/Created

```
hooks/use-auth.ts                    - Main auth hook
lib/api-interceptor.ts               - API client with auth
components/protected-route.tsx       - Protected route wrapper
components/dashboard/header.tsx      - User menu and logout
app/login/page.tsx                   - Login page
app/register/page.tsx                - Registration page
app/api/auth/login/route.ts          - Login endpoint (updated)
app/api/auth/refresh/route.ts        - Refresh endpoint (updated)
lib/auth-middleware.ts               - Updated with session tracking
prisma/seed.ts                       - Seed script with demo users
.env.local                           - Environment variables template
```

## Next Steps

1. Run `npx prisma migrate dev` to sync schema
2. Run `npx ts-node prisma/seed.ts` to create demo users
3. Start dev server: `npm run dev`
4. Navigate to http://localhost:3000/login
5. Login with admin@assetflow.com / Admin123456

## API Integration

All backend API endpoints now require authentication:

```typescript
// GET /api/assets
// Authorization: Bearer {accessToken}

// POST /api/allocations
// Authorization: Bearer {accessToken}

// PUT /api/maintenance/{id}
// Authorization: Bearer {accessToken}
```

The API interceptor handles this automatically. See lib/api-interceptor.ts for implementation.

