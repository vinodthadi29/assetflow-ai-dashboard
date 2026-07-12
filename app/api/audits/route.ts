import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const createAuditSchema = z.object({
  name: z.string().min(5).max(200),
  description: z.string().max(1000).optional(),
  scheduledDate: z.string().datetime(),
  assetIds: z.array(z.string().uuid()),
  assignedTo: z.string().uuid(),
})

const mockAudits = [
  {
    id: '1',
    name: 'Q1 2025 Asset Verification',
    description: 'Quarterly physical count and verification',
    status: 'in_progress',
    scheduledDate: new Date().toISOString(),
    createdAt: new Date(),
    completedAt: null,
    itemCount: 45,
    verifiedCount: 32,
  },
  {
    id: '2',
    name: 'Annual Compliance Audit',
    description: 'Full compliance and regulatory check',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    completedAt: new Date(),
    itemCount: 120,
    verifiedCount: 120,
  },
]

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status')

    let audits = mockAudits

    if (status) {
      audits = audits.filter((a) => a.status === status)
    }

    return NextResponse.json({
      success: true,
      data: audits,
      count: audits.length,
    })
  } catch (error) {
    console.error('[Audits API] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch audits' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = createAuditSchema.parse(body)

    const newAudit = {
      id: Date.now().toString(),
      ...validated,
      status: 'pending',
      createdAt: new Date(),
      completedAt: null,
      itemCount: validated.assetIds.length,
      verifiedCount: 0,
    }

    mockAudits.push(newAudit)

    return NextResponse.json(
      {
        success: true,
        data: newAudit,
        message: 'Audit created successfully',
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
    console.error('[Audits API] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create audit' },
      { status: 500 }
    )
  }
}
