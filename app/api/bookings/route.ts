import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

const CreateBookingSchema = z.object({
  assetId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  purpose: z.string().optional(),
})

/**
 * GET /api/bookings
 * Fetch all bookings with conflict detection
 */
export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const bookings = await prisma.booking.findMany({
        include: {
          asset: { select: { id: true, assetId: true, name: true } },
          user: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      })

      const assets = await prisma.asset.findMany({
        where: { deletedAt: null },
        select: { id: true, assetId: true, name: true },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'BOOKING_VIEWED',
        description: `Viewed ${bookings.length} bookings`,
      })

      return NextResponse.json({
        success: true,
        data: bookings,
        assets,
      })
    } catch (error) {
      console.error('[v0] Error fetching bookings:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 500 }
      )
    }
  })(request)
}

/**
 * POST /api/bookings
 * Create new booking with conflict detection
 */
export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const body = await req.json()
      const validatedData = CreateBookingSchema.parse(body)

      // Check for conflicts
      const conflicts = await prisma.booking.findMany({
        where: {
          assetId: validatedData.assetId,
          status: { in: ['PENDING', 'ACTIVE'] },
          OR: [
            {
              startDate: { lte: new Date(validatedData.endDate) },
              endDate: { gte: new Date(validatedData.startDate) },
            },
          ],
        },
      })

      if (conflicts.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: 'Asset is already booked during this period',
            conflicts: conflicts.map((c) => c.id),
          },
          { status: 409 }
        )
      }

      // Generate booking ID
      const lastBooking = await prisma.booking.findFirst({
        orderBy: { createdAt: 'desc' },
      })
      const bookingNumber = (parseInt(lastBooking?.bookingId?.split('-')[1] || '0') + 1)
        .toString()
        .padStart(4, '0')
      const bookingId = `BOOK-${bookingNumber}`

      const booking = await prisma.booking.create({
        data: {
          ...validatedData,
          bookingId,
          userId: auth.userId,
          status: 'PENDING',
          startDate: new Date(validatedData.startDate),
          endDate: new Date(validatedData.endDate),
        },
        include: {
          asset: { select: { id: true, assetId: true, name: true } },
          user: { select: { id: true, name: true } },
        },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'BOOKING_CREATED',
        description: `Created booking ${bookingId}`,
        metadata: { bookingId: booking.id },
      })

      return NextResponse.json({ success: true, data: booking }, { status: 201 })
    } catch (error) {
      console.error('[v0] Error creating booking:', error)
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { success: false, error: 'Validation failed', details: error.errors },
          { status: 400 }
        )
      }
      return NextResponse.json(
        { success: false, error: 'Failed to create booking' },
        { status: 500 }
      )
    }
  })(request)
}
