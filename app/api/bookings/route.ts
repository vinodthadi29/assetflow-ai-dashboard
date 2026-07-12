import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'
import { logAuditActivity } from '@/lib/audit-logger'

const CreateSchema = z.object({
  assetId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string(),
  purpose: z.string().optional(),
})

export async function GET(request: NextRequest) {
  return withAuth(async (req, auth) => {
    const { data, error } = await supabase.from('bookings').select(`
      *, asset:assets(id, asset_id, name), user:users(id, name)
    `).order('created_at', { ascending: false })
    if (error) throw error

    const { data: assets } = await supabase.from('assets').select('id, asset_id, name').is('deleted_at', null)
    return NextResponse.json({ success: true, data, assets })
  })(request)
}

export async function POST(request: NextRequest) {
  return withAuth(async (req, auth) => {
    const body = await req.json()
    const v = CreateSchema.parse(body)

    const { data: conflicts } = await supabase.from('bookings')
      .select('id')
      .eq('asset_id', v.assetId)
      .in('status', ['PENDING', 'ACTIVE'])
      .lte('start_date', v.endDate)
      .gte('end_date', v.startDate)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ success: false, error: 'Asset is already booked during this period', conflicts: conflicts.map(c => c.id) }, { status: 409 })
    }

    const { data: last } = await supabase.from('bookings').select('booking_id').order('created_at', { ascending: false }).limit(1).maybeSingle()
    const num = (parseInt(last?.booking_id?.split('-')[1] || '0') + 1).toString().padStart(4, '0')

    const { data, error } = await supabase.from('bookings').insert({
      booking_id: `BOOK-${num}`,
      asset_id: v.assetId,
      user_id: auth.userId,
      start_date: v.startDate,
      end_date: v.endDate,
      purpose: v.purpose || null,
      status: 'PENDING',
    }).select(`*, asset:assets(id, asset_id, name), user:users(id, name)`).single()

    if (error) throw error
    await logAuditActivity({ userId: auth.userId, action: 'BOOKING_CREATED', entityId: data.id })
    return NextResponse.json({ success: true, data }, { status: 201 })
  })(request)
}
