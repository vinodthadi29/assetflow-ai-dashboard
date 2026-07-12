import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { isTokenBlacklisted } from './security-middleware'

export interface AuthToken {
  userId: string
  email: string
  role: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE'
  iat: number
  exp: number
  sessionId?: string // Track sessions for logout
}

// Validate secrets exist in production
const JWT_SECRET = process.env.JWT_SECRET
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('CRITICAL: JWT_SECRET environment variable not set')
}
if (!JWT_REFRESH_SECRET && process.env.NODE_ENV === 'production') {
  throw new Error('CRITICAL: JWT_REFRESH_SECRET environment variable not set')
}

// Safe defaults for development only
const safeJWTSecret = JWT_SECRET || 'dev-secret-never-use-in-production-' + Math.random()
const safeRefreshSecret = JWT_REFRESH_SECRET || 'dev-refresh-never-use-in-production-' + Math.random()

export function generateToken(userId: string, email: string, role: string, sessionId: string): string {
  return jwt.sign(
    {
      userId,
      email,
      role,
      sessionId,
    },
    safeJWTSecret,
    { 
      expiresIn: '7d',
      algorithm: 'HS512', // Stronger algorithm
    }
  )
}

export function generateRefreshToken(userId: string, sessionId: string): string {
  return jwt.sign(
    {
      userId,
      type: 'refresh',
      sessionId,
    },
    safeRefreshSecret,
    { 
      expiresIn: '30d',
      algorithm: 'HS512',
    }
  )
}

export function verifyToken(token: string): AuthToken | null {
  try {
    // Check if token is blacklisted (logged out)
    if (isTokenBlacklisted(token)) {
      return null
    }

    const decoded = jwt.verify(token, safeJWTSecret, {
      algorithms: ['HS512'],
    }) as AuthToken
    
    return decoded
  } catch (error) {
    console.error('[v0] Token verification failed:', error instanceof Error ? error.message : 'Unknown error')
    return null
  }
}

export function verifyRefreshToken(token: string): { userId: string; sessionId: string } | null {
  try {
    if (isTokenBlacklisted(token)) {
      return null
    }

    const decoded = jwt.verify(token, safeRefreshSecret, {
      algorithms: ['HS512'],
    }) as any
    
    return { userId: decoded.userId, sessionId: decoded.sessionId }
  } catch (error) {
    return null
  }
}

export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}

export async function authenticateRequest(request: NextRequest): Promise<AuthToken | null> {
  const token = extractTokenFromHeader(request)
  if (!token) {
    return null
  }
  return verifyToken(token)
}

export function requireAuth(requiredRoles?: string[]) {
  return async (request: NextRequest) => {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (requiredRoles && !requiredRoles.includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return auth
  }
}

export function withAuth(handler: (request: NextRequest, auth: AuthToken) => Promise<NextResponse>) {
  return async (request: NextRequest) => {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return handler(request, auth)
  }
}

export function withRoleAuth(
  handler: (request: NextRequest, auth: AuthToken) => Promise<NextResponse>,
  allowedRoles: string[]
) {
  return async (request: NextRequest) => {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!allowedRoles.includes(auth.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return handler(request, auth)
  }
}
