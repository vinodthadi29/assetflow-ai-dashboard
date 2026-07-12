import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { generateOperationsInsights } from '@/lib/ai-insights'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = await authenticateRequest(request)
    if (!auth) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Generate insights
    const insights = await generateOperationsInsights()

    // Log to security audit
    await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/audit/log`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
      },
      body: JSON.stringify({
        action: 'AI_INSIGHTS_VIEWED',
        metadata: { insightCount: insights.length },
      }),
    }).catch(() => {})

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
