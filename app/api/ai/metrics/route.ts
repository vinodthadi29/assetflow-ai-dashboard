import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { calculateAssetMetrics } from '@/lib/ai-insights'

export async function GET(request: NextRequest) {
  try {
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
