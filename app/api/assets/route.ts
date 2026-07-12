import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRoleAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'
import { hasPermission } from '@/lib/permissions'

// Request validation schemas
const CreateAssetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string(),
  location: z.string(),
  purchaseValue: z.number().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serialNumber: z.string().optional(),
  departmentId: z.string().optional(),
})

const GetAssetsSchema = z.object({
  category: z.string().optional(),
  status: z.string().optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
})

/**
 * GET /api/assets
 * Fetch assets with optional filtering
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const query = {
        category: searchParams.get('category') || undefined,
        status: searchParams.get('status') || undefined,
        limit: parseInt(searchParams.get('limit') || '10'),
        offset: parseInt(searchParams.get('offset') || '0'),
      }

      const validatedQuery = GetAssetsSchema.parse(query)

      const assets = await prisma.asset.findMany({
        where: {
          ...(validatedQuery.category && { category: validatedQuery.category }),
          ...(validatedQuery.status && { status: validatedQuery.status }),
          deletedAt: null,
        },
        include: {
          allocations: {
            where: {
              status: { in: ['ACTIVE', 'PENDING'] },
            },
          },
        },
        take: validatedQuery.limit,
        skip: validatedQuery.offset,
      })

      const total = await prisma.asset.count({
        where: {
          ...(validatedQuery.category && { category: validatedQuery.category }),
          ...(validatedQuery.status && { status: validatedQuery.status }),
          deletedAt: null,
        },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'VIEW',
        entityType: 'Asset',
        entityId: 'LIST',
        reason: `Fetched ${assets.length} assets`,
      })

      return NextResponse.json({
        success: true,
        data: assets,
        total,
        hasMore: query.offset + validatedQuery.limit < total,
      })
    } catch (error) {
      console.error('[v0] Error fetching assets:', error)
      return NextResponse.json({ success: false, error: 'Failed to fetch assets' }, { status: 500 })
    }
  })(request)
}

/**
 * POST /api/assets
 * Create a new asset
 */
export async function POST(request: NextRequest) {
  return withRoleAuth(
    async (req: NextRequest, auth: AuthToken) => {
      try {
        const user = await prisma.user.findUnique({ where: { id: auth.userId } })
        if (!user || !hasPermission(user.role, 'canCreateAssets')) {
          await logAuditActivity({
            userId: auth.userId,
            action: 'ACCESS_DENIED',
            entityType: 'Asset',
            entityId: 'CREATE',
            reason: 'Insufficient permissions',
          })
          return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
        }

        const body = await req.json()
        const validatedData = CreateAssetSchema.parse(body)

        const asset = await prisma.asset.create({
          data: {
            ...validatedData,
            status: 'AVAILABLE',
            departmentId: validatedData.departmentId || user.departmentId,
            createdBy: auth.userId,
          },
        })

        await logAuditActivity({
          userId: auth.userId,
          action: 'CREATE',
          entityType: 'Asset',
          entityId: asset.id,
          reason: `Created asset: ${asset.name}`,
        })

        return NextResponse.json({ success: true, data: asset }, { status: 201 })
      } catch (error) {
        if (error instanceof z.ZodError) {
          return NextResponse.json({ success: false, error: 'Validation failed', details: error.errors }, { status: 400 })
        }
        console.error('[v0] Error creating asset:', error)
        return NextResponse.json({ success: false, error: 'Failed to create asset' }, { status: 500 })
      }
    },
    ['ADMIN', 'ASSET_MANAGER']
  )(request)
}
