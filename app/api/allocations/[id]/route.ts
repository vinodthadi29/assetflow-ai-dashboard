import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withRoleAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

const UpdateAllocationSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
  rejectedReason: z.string().optional(),
})

/**
 * PATCH /api/allocations/[id]
 * Update allocation status (approve, reject, complete)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return withRoleAuth(
    async (req: NextRequest, auth: AuthToken) => {
      try {
        const body = await req.json()
        const validatedData = UpdateAllocationSchema.parse(body)

        const allocation = await prisma.allocation.findUnique({
          where: { id: params.id },
          include: { asset: true, toUser: true },
        })

        if (!allocation) {
          return NextResponse.json(
            { success: false, error: 'Allocation not found' },
            { status: 404 }
          )
        }

        // Update asset status based on allocation status
        let assetStatusUpdate = {}
        if (validatedData.status === 'APPROVED') {
          assetStatusUpdate = { status: 'IN_USE' }
        } else if (validatedData.status === 'COMPLETED') {
          assetStatusUpdate = { status: 'AVAILABLE' }
        }

        const updatedAllocation = await prisma.allocation.update({
          where: { id: params.id },
          data: {
            status: validatedData.status,
            approvedAt: validatedData.status === 'APPROVED' ? new Date() : undefined,
            approvedBy: validatedData.status === 'APPROVED' ? auth.userId : undefined,
            rejectedAt: validatedData.status === 'REJECTED' ? new Date() : undefined,
            rejectedReason: validatedData.rejectedReason,
          },
          include: {
            asset: { select: { id: true, assetId: true, name: true } },
            toUser: { select: { id: true, name: true } },
          },
        })

        // Update asset status if needed
        if (Object.keys(assetStatusUpdate).length > 0) {
          await prisma.asset.update({
            where: { id: allocation.assetId },
            data: assetStatusUpdate,
          })
        }

        await logAuditActivity({
          userId: auth.userId,
          action: 'ALLOCATION_CREATED',
          description: `Updated allocation ${allocation.allocationId} to ${validatedData.status}`,
          metadata: { allocationId: allocation.id, newStatus: validatedData.status },
        })

        return NextResponse.json({ success: true, data: updatedAllocation })
      } catch (error) {
        console.error('[v0] Error updating allocation:', error)
        if (error instanceof z.ZodError) {
          return NextResponse.json(
            { success: false, error: 'Validation failed', details: error.errors },
            { status: 400 }
          )
        }
        return NextResponse.json(
          { success: false, error: 'Failed to update allocation' },
          { status: 500 }
        )
      }
    },
    ['ADMIN', 'ASSET_MANAGER']
  )(request)
}
