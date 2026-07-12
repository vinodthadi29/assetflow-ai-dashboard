import { NextRequest, NextResponse } from 'next/server'
import { withRoleAuth, AuthToken } from '@/lib/auth-middleware'
import { getAuditLog, getComplianceReport } from '@/lib/audit-logger'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

export async function GET(request: NextRequest) {
  return withRoleAuth(
    async (req: NextRequest, auth: AuthToken) => {
      try {
        const searchParams = req.nextUrl.searchParams
        const limit = parseInt(searchParams.get('limit') || '50')
        const offset = parseInt(searchParams.get('offset') || '0')
        const userId = searchParams.get('userId')
        const entityType = searchParams.get('entityType')
        const action = searchParams.get('action')
        const startDate = searchParams.get('startDate')
        const endDate = searchParams.get('endDate')

        const filters = {
          userId: userId || undefined,
          entityType: entityType || undefined,
          action: action || undefined,
          startDate: startDate ? new Date(startDate) : undefined,
          endDate: endDate ? new Date(endDate) : undefined,
        }

        const result = await getAuditLog(filters, limit, offset)

        await logAuditActivity({
          userId: auth.userId,
          action: 'VIEW',
          entityType: 'AuditLog',
          entityId: 'LIST',
          reason: 'Accessed audit logs',
        })

        return NextResponse.json({
          success: true,
          data: result.activities,
          total: result.total,
          hasMore: result.hasMore,
        })
      } catch (error) {
        console.error('[v0] Error fetching audit logs:', error)
        return NextResponse.json({ success: false, error: 'Failed to fetch audit logs' }, { status: 500 })
      }
    },
    ['ADMIN', 'ASSET_MANAGER']
  )(request)
}

export async function POST(request: NextRequest) {
  return withRoleAuth(
    async (req: NextRequest, auth: AuthToken) => {
      try {
        const body = await req.json()
        const { reportType, startDate, endDate } = body

        if (reportType === 'compliance') {
          const report = await getComplianceReport(new Date(startDate), new Date(endDate))

          await logAuditActivity({
            userId: auth.userId,
            action: 'EXPORT',
            entityType: 'ComplianceReport',
            entityId: `${startDate}-${endDate}`,
            reason: 'Generated compliance report',
          })

          return NextResponse.json({
            success: true,
            data: report,
          })
        }

        return NextResponse.json({ success: false, error: 'Invalid report type' }, { status: 400 })
      } catch (error) {
        console.error('[v0] Error generating report:', error)
        return NextResponse.json({ success: false, error: 'Failed to generate report' }, { status: 500 })
      }
    },
    ['ADMIN', 'ASSET_MANAGER']
  )(request)
}
