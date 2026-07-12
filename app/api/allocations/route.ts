import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreateAllocationSchema = z.object({
  assetId: z.string().min(1),
  toUserId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
  reason: z.string().optional(),
})

const GetAllocationsSchema = z.object({
  status: z.string().optional(),
  limit: z.coerce.number().default(10),
  offset: z.coerce.number().default(0),
})

/**
 * GET /api/allocations
 * Fetch allocations with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = {
      status: searchParams.get('status') || undefined,
      limit: parseInt(searchParams.get('limit') || '10'),
      offset: parseInt(searchParams.get('offset') || '0'),
    }

    const validatedQuery = GetAllocationsSchema.parse(query)

    // Mock response
    const allocations = []

    return NextResponse.json(
      {
        success: true,
        data: allocations,
        total: 0,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Error fetching allocations:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch allocations',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/allocations
 * Create a new asset allocation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateAllocationSchema.parse(body)

    // TODO: Create allocation in database with approval workflow
    // - Check if asset is available
    // - Create allocation record
    // - Trigger approval notification if required by policy

    const allocation = {
      id: 'ALLOC-001',
      allocationId: 'ALLOC-001',
      ...validatedData,
      status: 'PENDING',
      createdAt: new Date(),
    }

    return NextResponse.json(
      {
        success: true,
        data: allocation,
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

    console.error('[API] Error creating allocation:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create allocation',
      },
      { status: 500 }
    )
  }
}
