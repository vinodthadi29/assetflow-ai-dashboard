import { NextRequest, NextResponse } from 'next/server'
import { SignJWT, jwtVerify } from 'jose'

export interface AuthToken {
  userId: string
  email: string
  role: 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE'
  sessionId: string
  iat?: number
  exp?: number
}

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || 'assetflow-dev-secret-key-change-in-production'
  return new TextEncoder().encode(secret)
}

export async function generateToken(
  userId: string,
  email: string,
  role: string,
  sessionId: string
): Promise<string> {
  return new SignJWT({ userId, email, role, sessionId })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJWTSecret())
}

export async function generateRefreshToken(userId: string, sessionId: string): Promise<string> {
  return new SignJWT({ userId, sessionId, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(getJWTSecret())
}

export async function verifyToken(token: string): Promise<AuthToken | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret())
    return payload as unknown as AuthToken
  } catch {
    return null
  }
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string; sessionId: string } | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret())
    if ((payload as any).type !== 'refresh') return null
    return { userId: payload.userId as string, sessionId: payload.sessionId as string }
  } catch {
    return null
  }
}

export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  return authHeader.slice(7)
}

export async function authenticateRequest(request: NextRequest): Promise<AuthToken | null> {
  const token = extractTokenFromHeader(request)
  if (!token) return null
  return verifyToken(token)
}

export function withAuth(
  handler: (request: NextRequest, auth: AuthToken) => Promise<NextResponse>
) {
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
