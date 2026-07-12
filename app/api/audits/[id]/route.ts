import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

const updateAuditSchema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
  discrepancies: z.number().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const body = await req.json()
      const validated = updateAuditSchema.parse(body)

      const audit = await prisma.auditRecord.findUnique({
        where: { id: params.id },
      })

      if (!audit) {
        return NextResponse.json(
          { success: false, error: 'Audit not found' },
          { status: 404 }
        )
      }

      const updatedAudit = await prisma.auditRecord.update({
        where: { id: params.id },
        data: {
          status: validated.status,
          discrepancies: validated.discrepancies ?? audit.discrepancies,
          verifiedAt: validated.status === 'VERIFIED' ? new Date() : undefined,
          verifiedBy: validated.status === 'VERIFIED' ? auth.userId : undefined,
        },
        include: { asset: { select: { id: true, assetId: true, name: true } } },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'AUDIT_UPDATED',
        description: `Updated audit record ${audit.auditId} to ${validated.status}`,
        metadata: { auditId: audit.id, newStatus: validated.status },
      })

      return NextResponse.json({ success: true, data: updatedAudit })
    } catch (error) {
      console.error('[v0] Error updating audit:', error)
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: error.errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to update audit' },
        { status: 500 }
      )
    }
  })(request)
}
