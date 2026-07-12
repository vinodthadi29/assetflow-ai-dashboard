import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

const createMaintenanceSchema = z.object({
  assetId: z.string().min(1),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'EMERGENCY']),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const tickets = await prisma.maintenanceTicket.findMany({
        include: { asset: { select: { id: true, assetId: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      })

      const assets = await prisma.asset.findMany({
        select: { id: true, assetId: true, name: true },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'MAINTENANCE_VIEWED',
        description: `Viewed ${tickets.length} maintenance tickets`,
      })

      return NextResponse.json({
        success: true,
        data: tickets,
        assets,
      })
    } catch (error) {
      console.error('[v0] Error fetching maintenance tickets:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch maintenance tickets' },
        { status: 500 }
      )
    }
  })(request)
}

export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const body = await req.json()
      const validated = createMaintenanceSchema.parse(body)

      // Generate ticket ID
      const lastTicket = await prisma.maintenanceTicket.findFirst({
        orderBy: { createdAt: 'desc' },
      })
      const ticketNumber = (parseInt(lastTicket?.ticketId?.split('-')[1] || '0') + 1)
        .toString()
        .padStart(4, '0')
      const ticketId = `MAINT-${ticketNumber}`

      const ticket = await prisma.maintenanceTicket.create({
        data: {
          ...validated,
          ticketId,
          status: 'OPEN',
          createdBy: auth.userId,
        },
        include: { asset: { select: { id: true, assetId: true, name: true } } },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'MAINTENANCE_CREATED',
        description: `Created maintenance ticket ${ticketId}`,
        metadata: { ticketId: ticket.id },
      })

      return NextResponse.json(
        {
          success: true,
          data: ticket,
        },
        { status: 201 }
      )
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: error.errors },
          { status: 400 }
        )
      }
      console.error('[v0] Error creating maintenance ticket:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create maintenance ticket' },
        { status: 500 }
      )
    }
  })(request)
}
