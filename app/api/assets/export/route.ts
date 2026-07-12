import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'
import { logAuditActivity } from '@/lib/audit-logger'

export async function GET(request: NextRequest) {
  return withAuth(async (req, auth) => {
    const { data: assets } = await supabase.from('assets').select('*').is('deleted_at', null)

    const sp = req.nextUrl.searchParams
    const format = sp.get('format') || 'csv'

    if (format === 'csv') {
      const headers = ['Asset ID','Name','Category','Status','Location','Manufacturer','Model','Serial Number','Purchase Value','Notes']
      const rows = (assets || []).map(a => [
        a.asset_id, a.name, a.category, a.status, a.location,
        a.manufacturer || '', a.model || '', a.serial_number || '',
        a.purchase_value || '', a.notes || ''
      ])
      const csv = [headers.join(','), ...rows.map(r => r.map(c => typeof c === 'string' && c.includes(',') ? `"${c}"` : c).join(','))].join('\n')
      return new NextResponse(csv, {
        headers: { 'Content-Type': 'text/csv', 'Content-Disposition': `attachment; filename="assets-${new Date().toISOString().split('T')[0]}.csv"` }
      })
    }

    await logAuditActivity({ userId: auth.userId, action: 'ASSET_EXPORTED' })
    return NextResponse.json({ success: true, data: assets })
  })(request)
}
