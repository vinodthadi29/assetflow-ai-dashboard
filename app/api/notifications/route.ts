import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  return withAuth(async (req, auth) => {
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20')
    const { data, error } = await supabase.from('notifications')
      .select('*').eq('user_id', auth.userId).order('created_at', { ascending: false }).limit(limit)
    if (error) throw error

    const { count } = await supabase.from('notifications').select('*', { count: 'exact', head: true }).eq('user_id', auth.userId).is('read_at', null)
    return NextResponse.json({ success: true, data, unreadCount: count || 0 })
  })(request)
}

export async function POST(request: NextRequest) {
  return withAuth(async (req, auth) => {
    const { action, notificationId } = await req.json()

    if (action === 'mark-read' && notificationId) {
      await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', notificationId)
    } else if (action === 'mark-all-read') {
      await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('user_id', auth.userId).is('read_at', null)
    }

    return NextResponse.json({ success: true })
  })(request)
}
