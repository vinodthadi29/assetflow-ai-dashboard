import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRoleAuth, AuthToken } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'
import { logAuditActivity } from '@/lib/audit-logger'

const UpdateSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  status: z.string().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  purchase_value: z.coerce.number().optional(),
  current_value: z.coerce.number().optional(),
  notes: z.string().optional(),
  assigned_to: z.string().optional(),
})

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withAuth(async (_req, auth) => {
    const { id } = await params
    const { data, error } = await supabase.from('assets').select('*').eq('id', id).is('deleted_at', null).maybeSingle()
    if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ success: true, data })
  })(request)
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRoleAuth(async (req, auth) => {
    const { id } = await params
    const body = await req.json()
    const validated = UpdateSchema.parse(body)
    const { data, error } = await supabase.from('assets').update({ ...validated, updated_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) throw error
    await logAuditActivity({ userId: auth.userId, action: 'ASSET_UPDATED', entityId: id })
    return NextResponse.json({ success: true, data })
  }, ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'])(request)
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return withRoleAuth(async (_req, auth) => {
    const { id } = await params
    const { data, error } = await supabase.from('assets').update({ deleted_at: new Date().toISOString() }).eq('id', id).select().single()
    if (error) throw error
    await logAuditActivity({ userId: auth.userId, action: 'ASSET_DELETED', entityId: id })
    return NextResponse.json({ success: true, data })
  }, ['ADMIN'])(request)
}
