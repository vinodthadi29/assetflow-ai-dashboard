import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRoleAuth, AuthToken } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'
import { logAuditActivity } from '@/lib/audit-logger'

const CreateSchema = z.object({
  assetId: z.string().min(1),
  toUserId: z.string().min(1),
  startDate: z.string(),
  endDate: z.string().optional(),
  reason: z.string().optional(),
})

export async function GET(request: NextRequest) {
  return withAuth(async (req, auth) => {
    const status = req.nextUrl.searchParams.get('status')
    let query = supabase.from('allocations').select(`
      *,
      asset:assets(id, asset_id, name),
      toUser:users!allocations_to_user_id_fkey(id, name)
    `)
    if (status) query = query.eq('status', status)
    query = query.order('created_at', { ascending: false })
    const { data, error } = await query
    if (error) throw error

    const { data: assets } = await supabase.from('assets').select('id, asset_id, name').eq('status', 'AVAILABLE').is('deleted_at', null)
    const { data: users } = await supabase.from('users').select('id, name')

    return NextResponse.json({ success: true, data, assets, users })
  })(request)
}

export async function POST(request: NextRequest) {
  return withRoleAuth(async (req, auth) => {
    const body = await req.json()
    const v = CreateSchema.parse(body)

    const { data: conflicts } = await supabase.from('allocations')
      .select('id')
      .eq('asset_id', v.assetId)
      .in('status', ['PENDING', 'APPROVED'])
      .lte('start_date', v.endDate || v.startDate)

    if (conflicts && conflicts.length > 0) {
      return NextResponse.json({ success: false, error: 'Asset is already allocated during this period', conflicts: conflicts.map(c => c.id) }, { status: 409 })
    }

    const { data: last } = await supabase.from('allocations').select('allocation_id').order('created_at', { ascending: false }).limit(1).maybeSingle()
    const num = (parseInt(last?.allocation_id?.split('-')[1] || '0') + 1).toString().padStart(4, '0')

    const { data, error } = await supabase.from('allocations').insert({
      allocation_id: `ALLOC-${num}`,
      asset_id: v.assetId,
      to_user_id: v.toUserId,
      start_date: v.startDate,
      end_date: v.endDate || null,
      reason: v.reason || null,
      status: 'PENDING',
    }).select(`*, asset:assets(id, asset_id, name), toUser:users!allocations_to_user_id_fkey(id, name)`).single()

    if (error) throw error
    await logAuditActivity({ userId: auth.userId, action: 'ALLOCATION_CREATED', entityId: data.id })
    return NextResponse.json({ success: true, data }, { status: 201 })
  }, ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'])(request)
}
