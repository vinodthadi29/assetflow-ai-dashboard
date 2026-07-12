import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withRoleAuth } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'
import { logAuditActivity } from '@/lib/audit-logger'

const UpdateSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']),
  rejectedReason: z.string().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRoleAuth(async (req, auth) => {
    const { id } = await params
    const body = await req.json()
    const v = UpdateSchema.parse(body)

    const { data: allocation } = await supabase
      .from('allocations')
      .select('*')
      .eq('id', id)
      .maybeSingle()
    if (!allocation) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const updates: Record<string, unknown> = { status: v.status, updated_at: new Date().toISOString() }
    if (v.status === 'APPROVED') { updates.approved_at = new Date().toISOString(); updates.approved_by = auth.userId }
    if (v.status === 'REJECTED') { updates.rejected_at = new Date().toISOString(); updates.rejected_reason = v.rejectedReason }

    const { data, error } = await supabase
      .from('allocations')
      .update(updates)
      .eq('id', id)
      .select(`*, asset:assets(id, asset_id, name), toUser:users!allocations_to_user_id_fkey(id, name)`)
      .single()
    if (error) throw error

    if (v.status === 'APPROVED') await supabase.from('assets').update({ status: 'IN_USE' }).eq('id', allocation.asset_id)
    if (v.status === 'COMPLETED') await supabase.from('assets').update({ status: 'AVAILABLE' }).eq('id', allocation.asset_id)

    await logAuditActivity({ userId: auth.userId, action: 'ALLOCATION_UPDATED', entityId: id, description: `Status: ${v.status}` })
    return NextResponse.json({ success: true, data })
  }, ['ADMIN', 'ASSET_MANAGER'])(request)
}
