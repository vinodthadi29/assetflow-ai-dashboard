import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRoleAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

const CreateAllocationSchema = z.object({
  assetId: z.string().min(1, 'Asset is required'),
  toUserId: z.string().min(1, 'User is required'),
  startDate: z.string(),
  endDate: z.string().optional(),
  reason: z.string().optional(),
})

/**
 * GET /api/allocations
 * Fetch all allocations with conflict detection
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const status = searchParams.get('status')

      const where: any = {}
      if (status) where.status = status

      const allocations = await prisma.allocation.findMany({
        where,
        include: {
          asset: { select: { id: true, assetId: true, name: true } },
          toUser: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      // Get available assets and users for form
      const assets = await prisma.asset.findMany({
        where: { deletedAt: null, status: 'AVAILABLE' },
        select: { id: true, assetId: true, name: true },
      })

      const users = await prisma.user.findMany({
        select: { id: true, name: true },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'ALLOCATION_CREATED',
        description: `Viewed ${allocations.length} allocations`,
      })

      return NextResponse.json({
        success: true,
        data: allocations,
        assets,
        users,
      })
    } catch (error) {
      console.error('[v0] Error fetching allocations:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch allocations' },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * POST /api/allocations
 * Create new allocation with conflict detection
 */
export async function POST(request: NextRequest) {
  return withRoleAuth(
    async (req: NextRequest, auth: AuthToken) => {
      try {
        const body = await req.json()
        const validatedData = CreateAllocationSchema.parse(body)

        // Check for conflicts (asset already allocated during period)
        const conflicts = await prisma.allocation.findMany({
          where: {
            assetId: validatedData.assetId,
            status: { in: ['PENDING', 'APPROVED'] },
            OR: [
              {
                startDate: { lte: new Date(validatedData.endDate || validatedData.startDate) },
                endDate: { gte: new Date(validatedData.startDate) },
              },
              {
                startDate: { lte: new Date(validatedData.endDate || validatedData.startDate) },
                endDate: null,
              },
            ],
          },
        })

        if (conflicts.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: 'Asset is already allocated during this period',
              conflicts: conflicts.map((c) => c.id),
            },
            { status: 409 }
          )
        }

        // Generate unique allocationId
        const lastAllocation = await prisma.allocation.findFirst({
          orderBy: { createdAt: 'desc' },
        })
        const allocationNumber = (parseInt(lastAllocation?.allocationId?.split('-')[1] || '0') + 1)
          .toString()
          .padStart(4, '0')
        const allocationId = `ALLOC-${allocationNumber}`

        const allocation = await prisma.allocation.create({
          data: {
            ...validatedData,
            allocationId,
            status: 'PENDING',
            startDate: new Date(validatedData.startDate),
            endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
          },
          include: {
            asset: { select: { id: true, assetId: true, name: true } },
            toUser: { select: { id: true, name: true } },
          },
        })

        await logAuditActivity({
          userId: auth.userId,
          action: 'ALLOCATION_CREATED',
          description: `Created allocation ${allocationId}`,
          metadata: { allocationId: allocation.id },
        })

        return NextResponse.json({ success: true, data: allocation }, { status: 201 })
      } catch (error) {
        console.error('[v0] Error creating allocation:', error)
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', details: error.errors },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { success: false, error: 'Failed to create allocation' },
          { status: 500 }
        )
      }
    },
    ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD']
  )(request)
}
