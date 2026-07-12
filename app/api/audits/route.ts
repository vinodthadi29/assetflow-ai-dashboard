import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'
import { logAuditActivity } from '@/lib/audit-logger'

const CreateSchema = z.object({
  assetId: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  return withAuth(async (_req, auth) => {
    const { data, error } = await supabase.from('audit_records').select(`
      *, asset:assets(id, asset_id, name)
    `).order('created_at', { ascending: false })
    if (error) throw error

    const { data: assets } = await supabase.from('assets').select('id, asset_id, name')
    return NextResponse.json({ success: true, data, assets })
  })(request)
}

export async function POST(request: NextRequest) {
  return withAuth(async (req, auth) => {
    const body = await req.json()
    const v = CreateSchema.parse(body)

    const { data: last } = await supabase.from('audit_records').select('audit_id').order('created_at', { ascending: false }).limit(1).maybeSingle()
    const num = (parseInt(last?.audit_id?.split('-')[1] || '0') + 1).toString().padStart(4, '0')

    const { data, error } = await supabase.from('audit_records').insert({
      audit_id: `AUDIT-${num}`,
      asset_id: v.assetId || null,
      created_by: auth.userId,
      notes: v.notes || null,
      status: 'PENDING',
      discrepancies: 0,
    }).select(`*, asset:assets(id, asset_id, name)`).single()

    if (error) throw error
    await logAuditActivity({ userId: auth.userId, action: 'AUDIT_CREATED', entityId: data.id })
    return NextResponse.json({ success: true, data }, { status: 201 })
  })(request)
}
