import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateToken, generateRefreshToken } from '@/lib/auth-middleware'
import { logAuditActivity } from '@/lib/audit-logger'
import { createAuthLimiter } from '@/lib/rate-limiter'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

const authLimiter = createAuthLimiter()
const MAX_FAILED_ATTEMPTS = 5
const LOCKOUT_DURATION_MS = 30 * 60 * 1000 // 30 minutes

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Check rate limit by IP
    const ipLimitResult = await authLimiter.checkLimit(`ip:${clientIP}`)
    if (!ipLimitResult.allowed) {
      return NextResponse.json(
        { error: 'Too many login attempts. Try again later.' },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((ipLimitResult.resetTime - Date.now()) / 1000)) } }
      )
    }

    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      await prisma.securityAuditLog.create({
        data: {
          action: 'LOGIN_ATTEMPT',
          status: 'FAILED',
          reason: 'User not found',
          ipAddress: clientIP,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Check if account is locked
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      await prisma.securityAuditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_ATTEMPT_LOCKED',
          status: 'BLOCKED',
          reason: 'Account locked due to failed attempts',
          ipAddress: clientIP,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })

      return NextResponse.json(
        { error: 'Account temporarily locked. Try again later.' },
        { status: 429 }
      )
    }

    // Check if account is active
    if (!user.isActive) {
      await prisma.securityAuditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_ATTEMPT_INACTIVE',
          status: 'BLOCKED',
          reason: 'Account is inactive',
          ipAddress: clientIP,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      })

      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    // Check rate limit by email
    const emailLimitResult = await authLimiter.checkLimit(`email:${email}`)
    if (!emailLimitResult.allowed) {
      // Record failed attempt
      await prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: { increment: 1 },
          lockedUntil: new Date(Date.now() + LOCKOUT_DURATION_MS),
        },
      })

      return NextResponse.json(
        { error: 'Too many login attempts. Account locked.' },
        { status: 429 }
      )
    }

    const passwordValid = await bcrypt.compare(password, user.password)

    if (!passwordValid) {
      const newFailedAttempts = user.failedLoginAttempts + 1

      // Lock account if max attempts exceeded
      const shouldLock = newFailedAttempts >= MAX_FAILED_ATTEMPTS

      await Promise.all([
        prisma.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: newFailedAttempts,
            lockedUntil: shouldLock ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null,
          },
        }),
        prisma.securityAuditLog.create({
          data: {
            userId: user.id,
            action: 'LOGIN_FAILED',
            status: shouldLock ? 'BLOCKED' : 'FAILED',
            reason: `Invalid password (attempt ${newFailedAttempts}/${MAX_FAILED_ATTEMPTS})`,
            ipAddress: clientIP,
            userAgent: request.headers.get('user-agent') || undefined,
          },
        }),
      ])

      if (shouldLock) {
        return NextResponse.json(
          { error: 'Account locked due to multiple failed attempts' },
          { status: 429 }
        )
      }

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    // Create session with transaction
    const session = await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken: '', // Will be updated
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    const accessToken = generateToken(user.id, user.email, user.role, session.id, user.tokenVersion)
    const refreshToken = generateRefreshToken(user.id, session.id, user.tokenVersion)

    // Update session and reset failed attempts atomically
    await Promise.all([
      prisma.session.update({
        where: { id: session.id },
        data: { refreshToken },
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          failedLoginAttempts: 0,
          lockedUntil: null,
          lastLoginAt: new Date(),
        },
      }),
      prisma.securityAuditLog.create({
        data: {
          userId: user.id,
          action: 'LOGIN_SUCCESS',
          status: 'SUCCESS',
          ipAddress: clientIP,
          userAgent: request.headers.get('user-agent') || undefined,
        },
      }),
    ])

    const response = NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          department: user.departmentId,
        },
        accessToken,
        refreshToken,
      },
      { status: 200 }
    )

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
    })

    return response
  } catch (error) {
    console.error('[v0] Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
