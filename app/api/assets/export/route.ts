import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

/**
 * GET /api/assets/export?format=csv
 * Export assets as CSV
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const format = searchParams.get('format') || 'csv'
      const category = searchParams.get('category')
      const status = searchParams.get('status')
      const location = searchParams.get('location')

      // Build where clause based on filters
      const where: any = { deletedAt: null }
      if (category) where.category = category
      if (status) where.status = status
      if (location) where.location = location

      const assets = await prisma.asset.findMany({
        where,
        orderBy: { assetId: 'asc' },
      })

      if (format === 'csv') {
        // Generate CSV
        const headers = [
          'Asset ID',
          'Name',
          'Category',
          'Status',
          'Location',
          'Assigned To',
          'Manufacturer',
          'Model',
          'Serial Number',
          'Purchase Date',
          'Purchase Value',
          'Current Value',
          'Warranty Expiry',
          'Notes',
        ]

        const rows = assets.map((asset) => [
          asset.assetId,
          asset.name,
          asset.category,
          asset.status,
          asset.location,
          asset.assignedTo || '',
          asset.manufacturer || '',
          asset.model || '',
          asset.serialNumber || '',
          asset.purchaseDate ? asset.purchaseDate.toISOString().split('T')[0] : '',
          asset.purchaseValue || '',
          asset.currentValue || '',
          asset.warrantyExpiry ? asset.warrantyExpiry.toISOString().split('T')[0] : '',
          asset.notes || '',
        ])

        const csv = [
          headers.join(','),
          ...rows.map((row) =>
            row
              .map((cell) =>
                typeof cell === 'string' && cell.includes(',')
                  ? `"${cell}"`
                  : cell
              )
              .join(',')
          ),
        ].join('\n')

        await logAuditActivity({
          userId: auth.userId,
          action: 'ASSET_CREATED',
          description: `Exported ${assets.length} assets as CSV`,
          metadata: { format, assetCount: assets.length },
        })

        return new NextResponse(csv, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="assets-${new Date().toISOString().split('T')[0]}.csv"`,
          },
        })
      } else if (format === 'json') {
        await logAuditActivity({
          userId: auth.userId,
          action: 'ASSET_CREATED',
          description: `Exported ${assets.length} assets as JSON`,
          metadata: { format, assetCount: assets.length },
        })

        return NextResponse.json({
          success: true,
          data: assets,
          exportedAt: new Date().toISOString(),
          totalRecords: assets.length,
        })
      }

      return NextResponse.json(
        { success: false, error: 'Unsupported format' },
        { status: 400 }
      )
    } catch (error) {
      console.error('[v0] Error exporting assets:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to export assets' },
        { status: 500 }
      )
    }
  })(request)
}
