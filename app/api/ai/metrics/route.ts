import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Lazy imports to avoid build-time issues
    const { authenticateRequest } = await import('@/lib/auth-middleware')
    const { calculateAssetMetrics } = await import('@/lib/ai-insights')

    // Verify authentication
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Calculate metrics
    const metrics = await calculateAssetMetrics()

    return NextResponse.json({
      success: true,
      metrics,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Error calculating metrics:', error)
    return NextResponse.json(
      { error: 'Failed to calculate metrics' },
      { status: 500 }
    )
  }
}
