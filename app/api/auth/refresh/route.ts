import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, generateToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refreshToken } = body

    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 })
    }

    const decoded = verifyRefreshToken(refreshToken)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
    }

    const session = await prisma.session.findFirst({
      where: {
        id: decoded.sessionId,
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
      await logAuditActivity({
        userId: decoded.userId,
        action: 'ACCESS_DENIED',
        entityType: 'User',
        entityId: decoded.userId,
        reason: 'Refresh token validation failed - session not found',
        ipAddress: request.headers.get('x-forwarded-for') || 'UNKNOWN',
      })
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 })
    }

    const user = session.user
    const newAccessToken = generateToken(user.id, user.email, user.role, session.id)

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
