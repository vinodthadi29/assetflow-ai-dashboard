import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

export interface AuthToken {
  userId: string
  email: string
  role: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE'
  iat: number
  exp: number
}

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'

export function generateToken(userId: string, email: string, role: string): string {
  return jwt.sign(
    {
      userId,
      email,
      role,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  )
}

export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      userId,
      type: 'refresh',
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  )
}

export function verifyToken(token: string): AuthToken | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthToken
    return decoded
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
