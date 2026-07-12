import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const start = Date.now()
  try {
    const { error } = await supabase.from('assets').select('id').limit(1)
    return NextResponse.json({
      status: error ? 'degraded' : 'healthy',
      timestamp: new Date().toISOString(),
      database: { status: error ? 'error' : 'connected' },
      responseTime: Date.now() - start,
    }, { status: error ? 206 : 200 })
  } catch {
    return NextResponse.json({ status: 'unhealthy', responseTime: Date.now() - start }, { status: 503 })
  }
}
