import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Validation schemas
const createMaintenanceSchema = z.object({
  assetId: z.string().uuid(),
  description: z.string().min(10).max(1000),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  scheduledDate: z.string().datetime(),
  estimatedDuration: z.number().positive(),
  assignedTo: z.string().uuid().optional(),
})

const updateMaintenanceSchema = createMaintenanceSchema.partial()

// Mock data
const mockMaintenanceTickets = [
  {
    id: '1',
    assetId: 'asset-1',
    description: 'Replace oil and filters',
    priority: 'high',
    status: 'scheduled',
    scheduledDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDuration: 2,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    assetId: 'asset-2',
    description: 'Annual safety inspection',
    priority: 'medium',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    estimatedDuration: 4,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const assetId = searchParams.get('assetId')
    const status = searchParams.get('status')

    let tickets = mockMaintenanceTickets

    if (assetId) {
      tickets = tickets.filter((t) => t.assetId === assetId)
    }
    if (status) {
      tickets = tickets.filter((t) => t.status === status)
    }

    return NextResponse.json({
      success: true,
      data: tickets,
      count: tickets.length,
    })
  } catch (error) {
    console.error('[Maintenance API] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch maintenance tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createMaintenanceSchema.parse(body)

    const newTicket = {
      id: Date.now().toString(),
      ...validated,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    mockMaintenanceTickets.push(newTicket)

    return NextResponse.json(
      {
        success: true,
        data: newTicket,
        message: 'Maintenance ticket created successfully',
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }
    console.error('[Maintenance API] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create maintenance ticket' },
      { status: 500 }
    )
  }
}
