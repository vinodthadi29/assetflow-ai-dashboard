import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreateBookingSchema = z.object({
  assetId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  purpose: z.string().optional(),
})

const CheckConflictSchema = z.object({
  assetId: z.string().min(1),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
})

/**
 * GET /api/bookings
 * Fetch bookings with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const assetId = searchParams.get('assetId')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = parseInt(searchParams.get('offset') || '0')

    // TODO: Query bookings from database
    const bookings = []

    return NextResponse.json(
      {
        success: true,
        data: bookings,
        total: 0,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('[API] Error fetching bookings:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch bookings',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/bookings
 * Create a new booking
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateBookingSchema.parse(body)

    // Validate dates
    const startDate = new Date(validatedData.startDate)
    const endDate = new Date(validatedData.endDate)

    if (endDate <= startDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'End date must be after start date',
        },
        { status: 400 }
      )
    }

    // TODO: Check for conflicts
    // TODO: Create booking in database

    const booking = {
      id: 'BOOK-001',
      bookingId: 'BOOK-001',
      ...validatedData,
      status: 'PENDING',
      createdAt: new Date(),
    }

    return NextResponse.json(
      {
        success: true,
        data: booking,
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

    console.error('[API] Error creating booking:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create booking',
      },
      { status: 500 }
    )
  }
}
