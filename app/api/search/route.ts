import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  return withAuth(async (req, _auth) => {
    const q = req.nextUrl.searchParams.get('q') || ''
    if (q.length < 2) return NextResponse.json({ success: true, results: [] })

    const results: Array<{ type: string; id: string; title: string; subtitle: string }> = []

    const { data: assets } = await supabase
      .from('assets')
      .select('id, name, category, status')
      .or(`name.ilike.%${q}%,asset_id.ilike.%${q}%`)
      .is('deleted_at', null)
      .limit(10)
    results.push(...(assets || []).map(a => ({ type: 'asset', id: a.id, title: a.name, subtitle: `${a.category} - ${a.status}` })))

    const { data: users } = await supabase
      .from('users')
      .select('id, name, email, role')
      .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(10)
    results.push(...(users || []).map(u => ({ type: 'user', id: u.id, title: u.name, subtitle: `${u.email} - ${u.role}` })))

    return NextResponse.json({ success: true, results: results.slice(0, 20) })
  })(request)
}
