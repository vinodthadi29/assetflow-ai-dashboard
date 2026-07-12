import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const limit = parseInt(searchParams.get('limit') || '20')
      const unreadOnly = searchParams.get('unreadOnly') === 'true'

      const notifications = await prisma.notification.findMany({
        where: {
          userId: auth.userId,
          ...(unreadOnly && { readAt: null }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })

      const unreadCount = await prisma.notification.count({
        where: {
          userId: auth.userId,
          readAt: null,
        },
      })

      return NextResponse.json({
        success: true,
        data: notifications,
        unreadCount,
      })
    } catch (error) {
      console.error('[v0] Error fetching notifications:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch notifications' }, { status: 500 })
    }
  })(request)
}

export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const body = await req.json()
      const { action } = body

      if (action === 'mark-read') {
        const { notificationId } = body
        await prisma.notification.update({
          where: { id: notificationId },
          data: { readAt: new Date() },
        })

        await logAuditActivity({
          userId: auth.userId,
          action: 'UPDATE',
          entityType: 'Notification',
          entityId: notificationId,
          reason: 'Marked notification as read',
        })

        return NextResponse.json({ success: true })
      }

      if (action === 'mark-all-read') {
        await prisma.notification.updateMany({
          where: {
            userId: auth.userId,
            readAt: null,
          },
          data: { readAt: new Date() },
        })

        return NextResponse.json({ success: true })
      }

      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    } catch (error) {
      console.error('[v0] Error updating notifications:', error)
      return NextResponse.json({ success: false, error: 'Failed to update notifications' }, { status: 500 })
    }
  })(request)
}
