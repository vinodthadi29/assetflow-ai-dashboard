import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { generateToken, generateRefreshToken } from '@/lib/auth-middleware'
import { logAuditActivity } from '@/lib/audit-logger'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      await logAuditActivity({
        userId: 'SYSTEM',
        action: 'LOGIN',
        entityType: 'User',
        entityId: email,
        reason: 'Failed - User not found',
        ipAddress: request.headers.get('x-forwarded-for') || 'UNKNOWN',
      })

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const passwordValid = await bcrypt.compare(password, user.password)

    if (!passwordValid) {
      await logAuditActivity({
        userId: user.id,
        action: 'ACCESS_DENIED',
        entityType: 'User',
        entityId: user.id,
        reason: 'Failed login - Invalid password',
        ipAddress: request.headers.get('x-forwarded-for') || 'UNKNOWN',
      })

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const accessToken = generateToken(user.id, user.email, user.role)
    const refreshToken = generateRefreshToken(user.id)

    await prisma.session.create({
      data: {
        userId: user.id,
        refreshToken,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    })

    await logAuditActivity({
      userId: user.id,
      action: 'LOGIN',
      entityType: 'User',
      entityId: user.id,
      ipAddress: request.headers.get('x-forwarded-for') || 'UNKNOWN',
    })

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
