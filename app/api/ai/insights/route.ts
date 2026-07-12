import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Lazy imports to avoid build-time issues
    const { authenticateRequest } = await import('@/lib/auth-middleware')
    const { generateOperationsInsights } = await import('@/lib/ai-insights')

    // Verify authentication
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate insights
    const insights = await generateOperationsInsights()

    // Log to security audit (non-blocking)
    if (process.env.NEXT_PUBLIC_APP_URL) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/audit/log`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        },
        body: JSON.stringify({
          action: 'AI_INSIGHTS_VIEWED',
          metadata: { insightCount: (insights as any[]).length },
        }),
      }).catch(() => {})
    }

    return NextResponse.json({
      success: true,
      insights,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[v0] Error generating insights:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}
