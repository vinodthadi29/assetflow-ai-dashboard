import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { generateToken } from '@/lib/auth-middleware'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 })
    }

    const decoded = jwt.verify(refreshToken, JWT_SECRET) as any
    const session = await prisma.session.findFirst({
      where: {
        refreshToken,
        userId: decoded.userId,
        expiresAt: {
          gt: new Date(),
        },
      },
      include: {
        user: true,
      },
    })

    if (!session) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
    }

    const user = session.user
    const newAccessToken = generateToken(user.id, user.email, user.role)

    return NextResponse.json(
      {
        accessToken: newAccessToken,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[v0] Refresh token error:', error)
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}
