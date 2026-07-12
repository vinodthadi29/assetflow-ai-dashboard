import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'
import { logAuditActivity } from '@/lib/audit-logger'

const CreateSchema = z.object({
  assetId: z.string().min(1),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION', 'REPAIR', 'EMERGENCY']),
  description: z.string().optional(),
  title: z.string().optional(),
})

export async function GET(request: NextRequest) {
  return withAuth(async (_req, auth) => {
    const { data, error } = await supabase.from('maintenance_tickets').select(`
      *, asset:assets(id, asset_id, name)
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

    const { data: last } = await supabase.from('maintenance_tickets').select('ticket_id').order('created_at', { ascending: false }).limit(1).maybeSingle()
    const num = (parseInt(last?.ticket_id?.split('-')[1] || '0') + 1).toString().padStart(4, '0')

    const { data, error } = await supabase.from('maintenance_tickets').insert({
      ticket_id: `MAINT-${num}`,
      asset_id: v.assetId,
      created_by: auth.userId,
      title: v.title || `${v.type} maintenance`,
      description: v.description || null,
      type: v.type,
      status: 'OPEN',
    }).select(`*, asset:assets(id, asset_id, name)`).single()

    if (error) throw error
    await logAuditActivity({ userId: auth.userId, action: 'MAINTENANCE_CREATED', entityId: data.id })
    return NextResponse.json({ success: true, data }, { status: 201 })
  })(request)
}
