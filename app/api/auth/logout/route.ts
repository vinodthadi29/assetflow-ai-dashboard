import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)

    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { refreshToken } = await request.json()

    if (refreshToken) {
      await prisma.session.deleteMany({
        where: {
          userId: auth.userId,
          refreshToken,
        },
      })
    }

    await logAuditActivity({
      userId: auth.userId,
      action: 'LOGOUT',
      entityType: 'User',
      entityId: auth.userId,
      ipAddress: request.headers.get('x-forwarded-for') || 'UNKNOWN',
    })

    const response = NextResponse.json({ message: 'Logged out successfully' })
    response.cookies.delete('accessToken')

    return response
  } catch (error) {
    console.error('[v0] Logout error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
