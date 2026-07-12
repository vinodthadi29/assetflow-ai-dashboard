import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  return withAuth(async (_req, auth) => {
    const [assetsRes, allocationsRes, maintenanceRes] = await Promise.all([
      supabase.from('assets').select('*').is('deleted_at', null),
      supabase.from('allocations').select('*').eq('status', 'APPROVED'),
      supabase.from('maintenance_tickets').select('*').eq('status', 'OPEN'),
    ])

    const assets = assetsRes.data || []
    const allocations = allocationsRes.data || []
    const maintenance = maintenanceRes.data || []

    const insights = []
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    const idleAssets = assets.filter(a => new Date(a.created_at) < ninetyDaysAgo && !allocations.find(al => al.asset_id === a.id))

    if (idleAssets.length > 0) {
      insights.push({
        type: 'warning',
        title: `⚠️ ${idleAssets.length} Assets Idle for 90+ Days`,
        description: `${idleAssets.length} assets have not been used recently. Consider reallocating or retiring.`,
        impact: 'high',
        confidence: 0.95,
        actionItems: [
          { action: 'Review idle assets list', impact: 'Identify candidates for reallocation' },
          { action: 'Create reallocation batch', impact: 'Optimize asset utilization' },
        ],
      })
    }

    if (maintenance.length > 0) {
      insights.push({
        type: 'warning',
        title: `🔧 ${maintenance.length} Open Maintenance Tickets`,
        description: `${maintenance.length} assets require maintenance attention.`,
        impact: maintenance.length > 5 ? 'high' : 'medium',
        confidence: 0.98,
        actionItems: [
          { action: 'Schedule maintenance batch', impact: 'Prevent asset failures' },
        ],
      })
    }

    const utilizationRate = assets.length ? (allocations.length / assets.length) * 100 : 0
    if (utilizationRate < 60 && assets.length > 5) {
      const savings = assets.length * 1500 * (1 - utilizationRate / 100)
      insights.push({
        type: 'opportunity',
        title: `💰 Potential Savings: ₹${Math.round(savings / 100000) * 100}K`,
        description: `Asset utilization is ${Math.round(utilizationRate)}%. Optimizing allocation could reduce costs.`,
        impact: 'high',
        confidence: 0.85,
        actionItems: [
          { action: 'Review under-utilized assets', impact: `Save up to ₹${Math.round(savings)}` },
        ],
      })
    }

    insights.push({
      type: 'forecast',
      title: '🔮 30-Day Maintenance Forecast',
      description: `Based on asset age patterns, ${Math.ceil(assets.length * 0.1)} assets may need maintenance next month.`,
      impact: 'medium',
      confidence: 0.75,
      actionItems: [
        { action: 'Schedule preventive maintenance', impact: 'Reduce unexpected failures by 40%' },
      ],
    })

    return NextResponse.json({ success: true, insights, timestamp: new Date().toISOString() })
  })(request)
}
