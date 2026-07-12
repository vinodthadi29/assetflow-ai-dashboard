import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRoleAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

const UpdateAssetSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  subcategory: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseValue: z.coerce.number().optional(),
  currentValue: z.coerce.number().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  depreciationRate: z.coerce.number().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
})

/**
 * GET /api/assets/[id]
 * Fetch single asset details
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const asset = await prisma.asset.findFirst({
        where: { id: params.id, deletedAt: null },
        include: {
          allocations: true,
          bookings: true,
          maintenance: true,
          activities: { take: 20, orderBy: { createdAt: 'desc' } },
        },
      })

      if (!asset) {
        return NextResponse.json(
          { success: false, error: 'Asset not found' },
          { status: 404 }
        )
      }

      await logAuditActivity({
        userId: auth.userId,
        action: 'ASSET_CREATED',
        description: `Viewed asset: ${asset.name}`,
        metadata: { assetId: asset.id },
      })

      return NextResponse.json({ success: true, data: asset })
    } catch (error) {
      console.error('[v0] Error fetching asset:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch asset' },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * PATCH /api/assets/[id]
 * Update asset
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRoleAuth(
    async (req: NextRequest, auth: AuthToken) => {
      try {
        const body = await req.json()
        const validatedData = UpdateAssetSchema.parse(body)

        const asset = await prisma.asset.findFirst({
          where: { id: params.id, deletedAt: null },
        })

        if (!asset) {
          return NextResponse.json(
            { success: false, error: 'Asset not found' },
            { status: 404 }
          )
        }

        const updatedAsset = await prisma.asset.update({
          where: { id: params.id },
          data: {
            ...validatedData,
            purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : undefined,
            warrantyExpiry: validatedData.warrantyExpiry ? new Date(validatedData.warrantyExpiry) : undefined,
            updatedAt: new Date(),
          },
        })

        await logAuditActivity({
          userId: auth.userId,
          action: 'ASSET_CREATED',
          description: `Updated asset: ${asset.name}`,
          metadata: { assetId: asset.id, changes: validatedData },
        })

        return NextResponse.json({ success: true, data: updatedAsset })
      } catch (error) {
        console.error('[v0] Error updating asset:', error)
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', details: error.errors },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { success: false, error: 'Failed to update asset' },
          { status: 500 }
        )
      }
    },
    ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']
  )(request)
}

/**
 * DELETE /api/assets/[id]
 * Soft delete asset
 */
export async function DELETE(
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

        const deletedAsset = await prisma.asset.update({
          where: { id: params.id },
          data: { deletedAt: new Date() },
        })

        await logAuditActivity({
          userId: auth.userId,
          action: 'ASSET_CREATED',
          description: `Deleted asset: ${asset.name}`,
          metadata: { assetId: asset.id },
        })

        return NextResponse.json({ success: true, data: deletedAsset })
      } catch (error) {
        console.error('[v0] Error deleting asset:', error)
        return NextResponse.json(
          { success: false, error: 'Failed to delete asset' },
          { status: 500 }
        )
      }
    },
    ['ADMIN']
  )(request)
}
