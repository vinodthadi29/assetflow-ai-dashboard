import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  return withAuth(async (_req, _auth) => {
    const [assetsRes, allocationsRes] = await Promise.all([
      supabase.from('assets').select('*').is('deleted_at', null),
      supabase.from('allocations').select('*').eq('status', 'APPROVED'),
    ])

    const assets = assetsRes.data || []
    const allocations = allocationsRes.data || []
    const utilizationRate = assets.length ? (allocations.length / assets.length) * 100 : 0

    return NextResponse.json({
      success: true,
      metrics: {
        assetROI: Math.min(utilizationRate * 1.2, 100),
        idleCost: (assets.length - allocations.length) * 500 * 12,
        maintenanceForecast: assets.length * 0.8 * 200,
        carbonSavings: allocations.length * 2.5,
        utilizationRate,
      },
      timestamp: new Date().toISOString(),
    })
  })(request)
}
