import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'
import { logAuditActivity } from '@/lib/audit-logger'

const UpdateSchema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED']),
  discrepancies: z.number().optional(),
})

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withAuth(async (req, auth) => {
    const { id } = await params
    const body = await req.json()
    const v = UpdateSchema.parse(body)

    const updates: Record<string, unknown> = { status: v.status, updated_at: new Date().toISOString() }
    if (v.discrepancies !== undefined) updates.discrepancies = v.discrepancies
    if (v.status === 'VERIFIED') {
      updates.verified_at = new Date().toISOString()
      updates.verified_by = auth.userId
    }

    const { data, error } = await supabase
      .from('audit_records')
      .update(updates)
      .eq('id', id)
      .select(`*, asset:assets(id, asset_id, name)`)
      .single()
    if (error) throw error

    await logAuditActivity({ userId: auth.userId, action: 'AUDIT_UPDATED', entityId: id })
    return NextResponse.json({ success: true, data })
  })(request)
}
