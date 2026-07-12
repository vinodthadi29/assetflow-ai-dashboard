import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  return withAuth(async (req, auth) => {
    try {
      const { message } = await req.json()
      if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

      const msg = message.toLowerCase()
      let response = "I can help you manage your assets. Try asking about assets, allocations, maintenance, or bookings."

      if (msg.includes('idle') || msg.includes('unused')) {
        const { data: assets } = await supabase.from('assets').select('id, name, asset_id').eq('status', 'AVAILABLE').is('deleted_at', null).limit(5)
        response = `Found ${assets?.length || 0} available assets. ${assets?.map(a => a.name).join(', ') || 'None found'}. Would you like to create allocations?`
      } else if (msg.includes('maintenance')) {
        const { data } = await supabase.from('maintenance_tickets').select('id').eq('status', 'OPEN')
        response = `There are ${data?.length || 0} open maintenance tickets. Navigate to the Maintenance page to manage them.`
      } else if (msg.includes('asset') || msg.includes('inventory')) {
        const { count } = await supabase.from('assets').select('*', { count: 'exact', head: true }).is('deleted_at', null)
        response = `You have ${count || 0} assets in your inventory. Visit the Assets page to manage them.`
      } else if (msg.includes('booking')) {
        const { count } = await supabase.from('bookings').select('*', { count: 'exact', head: true }).in('status', ['PENDING', 'ACTIVE'])
        response = `There are ${count || 0} active or pending bookings. Visit the Bookings page to view them.`
      } else if (msg.includes('allocation')) {
        const { count } = await supabase.from('allocations').select('*', { count: 'exact', head: true }).eq('status', 'PENDING')
        response = `There are ${count || 0} pending allocations awaiting approval.`
      }

      return NextResponse.json({ success: true, message: response })
    } catch (error) {
      return NextResponse.json({ success: false, error: 'AI processing failed' }, { status: 500 })
    }
  })(request)
}
