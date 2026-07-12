import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

const createAuditSchema = z.object({
  assetId: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const audits = await prisma.auditRecord.findMany({
        include: { asset: { select: { id: true, assetId: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      })

      const assets = await prisma.asset.findMany({
        select: { id: true, assetId: true, name: true },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'AUDIT_VIEWED',
        description: `Viewed ${audits.length} audit records`,
      })

      return NextResponse.json({
        success: true,
        data: audits,
        assets,
      })
    } catch (error) {
      console.error('[v0] Error fetching audits:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch audits' },
        { status: 500 }
      )
    }
  })(request)
}

export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const body = await req.json()
      const validated = createAuditSchema.parse(body)

      // Generate audit ID
      const lastAudit = await prisma.auditRecord.findFirst({
        orderBy: { createdAt: 'desc' },
      })
      const auditNumber = (parseInt(lastAudit?.auditId?.split('-')[1] || '0') + 1)
        .toString()
        .padStart(4, '0')
      const auditId = `AUDIT-${auditNumber}`

      const audit = await prisma.auditRecord.create({
        data: {
          ...validated,
          auditId,
          status: 'PENDING',
          discrepancies: 0,
          createdBy: auth.userId,
        },
        include: { asset: { select: { id: true, assetId: true, name: true } } },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'AUDIT_CREATED',
        description: `Created audit record ${auditId}`,
        metadata: { auditId: audit.id },
      })

      return NextResponse.json(
        {
          success: true,
          data: audit,
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
      console.error('[v0] Error creating audit:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create audit' },
        { status: 500 }
      )
    }
  })(request)
}
