import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

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
  try {
    const searchParams = request.nextUrl.searchParams
    const query = {
      category: searchParams.get('category') || undefined,
      status: searchParams.get('status') || undefined,
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    // Validate query parameters
    const validatedQuery = GetAssetsSchema.parse(query)

    // TODO: Query database using Prisma
    // const assets = await prisma.asset.findMany({
    //   where: {
    //     ...(validatedQuery.category && { category: validatedQuery.category }),
    //     ...(validatedQuery.status && { status: validatedQuery.status }),
    //     deletedAt: null,
    //   },
    //   take: validatedQuery.limit,
    //   skip: validatedQuery.offset,
    // })

    // Mock response for now
    const assets = [
      {
        id: 'AST-001',
        name: 'MacBook Pro 16"',
        category: 'COMPUTERS',
        status: 'IN_USE',
        location: 'Office A - Desk 1',
        owner: 'John Smith',
      },
      {
        id: 'AST-002',
        name: 'Dell Monitor 27"',
        category: 'MONITORS',
        status: 'IN_USE',
        location: 'Office B - Desk 5',
        owner: 'Sarah Johnson',
      },
    ]

    return NextResponse.json(
      {
        success: true,
        data: assets,
        total: 2,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Error fetching assets:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch assets',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/assets
 * Create a new asset
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validatedData = CreateAssetSchema.parse(body)

    // TODO: Create asset in database
    // const asset = await prisma.asset.create({
    //   data: {
    //     assetId: `AST-${Date.now()}`,
    //     ...validatedData,
    //   },
    // })

    // Mock response
    const asset = {
      id: 'AST-001',
      assetId: 'AST-001',
      ...validatedData,
      status: 'AVAILABLE',
      createdAt: new Date(),
    }

    return NextResponse.json(
      {
        success: true,
        data: asset,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: error.errors,
        },
        { status: 400 }
      )
    }

    console.error('[API] Error creating asset:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create asset',
      },
      { status: 500 }
    )
  }
}
