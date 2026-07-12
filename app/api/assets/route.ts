import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRoleAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'
import { hasPermission } from '@/lib/permissions'

// Request validation schemas
const CreateAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category is required'),
  subcategory: z.string().optional(),
  location: z.string().min(1, 'Location is required'),
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

const GetAssetsSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  location: z.string().optional(),
  condition: z.string().optional(),
  sortBy: z.string().default('assetId'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  limit: z.coerce.number().default(100),
  offset: z.coerce.number().default(0),
})

/**
 * GET /api/assets
 * Fetch assets with advanced filtering and sorting
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const query = {
        search: searchParams.get('search') || undefined,
        category: searchParams.get('category') || undefined,
        status: searchParams.get('status') || undefined,
        location: searchParams.get('location') || undefined,
        condition: searchParams.get('condition') || undefined,
        sortBy: searchParams.get('sortBy') || 'assetId',
        sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'asc',
        limit: parseInt(searchParams.get('limit') || '100'),
        offset: parseInt(searchParams.get('offset') || '0'),
      }

      const validatedQuery = GetAssetsSchema.parse(query)

      // Build where clause
      const where: any = { deletedAt: null }
      if (validatedQuery.category) where.category = validatedQuery.category
      if (validatedQuery.status) where.status = validatedQuery.status
      if (validatedQuery.location) where.location = validatedQuery.location
      if (validatedQuery.search) {
        where.OR = [
          { name: { contains: validatedQuery.search, mode: 'insensitive' } },
          { assetId: { contains: validatedQuery.search, mode: 'insensitive' } },
          { serialNumber: { contains: validatedQuery.search, mode: 'insensitive' } },
          { description: { contains: validatedQuery.search, mode: 'insensitive' } },
        ]
      }

      // Build order by clause
      const orderBy: any = {}
      const sortField = validatedQuery.sortBy === 'assetId' ? 'assetId' : 
                        validatedQuery.sortBy === 'name' ? 'name' :
                        validatedQuery.sortBy === 'category' ? 'category' :
                        validatedQuery.sortBy === 'status' ? 'status' : 'createdAt'
      orderBy[sortField] = validatedQuery.sortOrder

      const assets = await prisma.asset.findMany({
        where,
        orderBy,
        take: validatedQuery.limit,
        skip: validatedQuery.offset,
      })

      const total = await prisma.asset.count({ where })

      await logAuditActivity({
        userId: auth.userId,
        action: 'ASSET_CREATED',
        description: `Fetched ${assets.length} assets`,
        metadata: { query: validatedQuery },
      })

      return NextResponse.json({
        success: true,
        data: assets,
        total,
        hasMore: validatedQuery.offset + validatedQuery.limit < total,
      })
    } catch (error) {
      console.error('[v0] Error fetching assets:', error)
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: error.errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to fetch assets' },
        { status: 500 }
      )
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
        if (!user) {
          return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })
        }

        const body = await req.json()
        const validatedData = CreateAssetSchema.parse(body)

        // Generate unique assetId
        const lastAsset = await prisma.asset.findFirst({
          where: { deletedAt: null },
          orderBy: { createdAt: 'desc' },
        })
        const assetNumber = (parseInt(lastAsset?.assetId?.split('-')[1] || '0') + 1)
          .toString()
          .padStart(4, '0')
        const assetId = `AST-${assetNumber}`

        const asset = await prisma.asset.create({
          data: {
            ...validatedData,
            assetId,
            status: validatedData.status || 'AVAILABLE',
            purchaseDate: validatedData.purchaseDate ? new Date(validatedData.purchaseDate) : null,
            warrantyExpiry: validatedData.warrantyExpiry ? new Date(validatedData.warrantyExpiry) : null,
            purchaseValue: validatedData.purchaseValue || null,
            currentValue: validatedData.currentValue || null,
            depreciationRate: validatedData.depreciationRate || 0,
          },
        })

        await logAuditActivity({
          userId: auth.userId,
          action: 'ASSET_CREATED',
          description: `Created asset: ${asset.name}`,
          metadata: { assetId: asset.id },
        })

        return NextResponse.json({ success: true, data: asset }, { status: 201 })
      } catch (error) {
        console.error('[v0] Error creating asset:', error)
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', details: error.errors },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { success: false, error: 'Failed to create asset' },
          { status: 500 }
        )
      }
    },
    ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']
  )(request)
}
