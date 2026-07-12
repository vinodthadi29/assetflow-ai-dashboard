import { NextRequest, NextResponse } from 'next/server'
import { withRoleAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

/**
 * POST /api/assets/[id]/duplicate
 * Duplicate an asset
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRoleAuth(
    async (req: NextRequest, auth: AuthToken) => {
      try {
        const asset = await prisma.asset.findFirst({
          where: { id: params.id, deletedAt: null },
        })

        if (!asset) {
          return NextResponse.json(
            { success: false, error: 'Asset not found' },
            { status: 404 }
          )
        }

        // Generate unique assetId
        const lastAsset = await prisma.asset.findFirst({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        })
        const assetNumber = (parseInt(lastAsset?.assetId?.split('-')[1] || '0') + 1)
          .toString()
          .padStart(4, '0')
        const newAssetId = `AST-${assetNumber}`

        const duplicatedAsset = await prisma.asset.create({
          data: {
            assetId: newAssetId,
            name: `${asset.name} (Copy)`,
            description: asset.description,
            category: asset.category,
            subcategory: asset.subcategory,
            location: asset.location,
            status: 'AVAILABLE',
            purchaseDate: asset.purchaseDate,
            purchaseValue: asset.purchaseValue,
            currentValue: asset.currentValue,
            manufacturer: asset.manufacturer,
            model: asset.model,
            serialNumber: null, // Don't copy serial number
            warrantyExpiry: asset.warrantyExpiry,
            depreciationRate: asset.depreciationRate,
            tags: asset.tags,
            notes: asset.notes ? `Duplicated from ${asset.assetId}: ${asset.notes}` : `Duplicated from ${asset.assetId}`,
          },
        })

        await logAuditActivity({
          userId: auth.userId,
          action: 'ASSET_CREATED',
          description: `Duplicated asset: ${asset.name} to ${duplicatedAsset.name}`,
          metadata: { sourceAssetId: asset.id, duplicateAssetId: duplicatedAsset.id },
        })

        return NextResponse.json({ success: true, data: duplicatedAsset }, { status: 201 })
      } catch (error) {
        console.error('[v0] Error duplicating asset:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to duplicate asset' },
          { status: 500 }
        )
      }
    },
    ['ADMIN', 'ASSET_MANAGER']
  )(request)
}
