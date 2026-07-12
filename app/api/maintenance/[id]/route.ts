import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

const updateMaintenanceSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const body = await req.json()
      const validated = updateMaintenanceSchema.parse(body)

      const ticket = await prisma.maintenanceTicket.findUnique({
        where: { id: params.id },
      })

      if (!ticket) {
        return NextResponse.json(
          { success: false, error: 'Ticket not found' },
          { status: 404 }
        )
      }

      const updatedTicket = await prisma.maintenanceTicket.update({
        where: { id: params.id },
        data: {
          status: validated.status,
          completedAt: validated.status === 'COMPLETED' ? new Date() : undefined,
          completedBy: validated.status === 'COMPLETED' ? auth.userId : undefined,
        },
        include: { asset: { select: { id: true, assetId: true, name: true } } },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'MAINTENANCE_UPDATED',
        description: `Updated maintenance ticket ${ticket.ticketId} to ${validated.status}`,
        metadata: { ticketId: ticket.id, newStatus: validated.status },
      })

      return NextResponse.json({ success: true, data: updatedTicket })
    } catch (error) {
      console.error('[v0] Error updating maintenance ticket:', error)
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: error.errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to update maintenance ticket' },
        { status: 500 }
      )
    }
  })(request)
}
