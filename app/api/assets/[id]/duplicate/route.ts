import { NextRequest, NextResponse } from 'next/server'
import { withRoleAuth } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'
import { logAuditActivity } from '@/lib/audit-logger'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return withRoleAuth(async (_req, auth) => {
    const { id } = await params
    const { data: asset } = await supabase
      .from('assets')
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .maybeSingle()
    if (!asset) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const { data: last } = await supabase
      .from('assets')
      .select('asset_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    const num = (parseInt(last?.asset_id?.split('-')[1] || '0') + 1).toString().padStart(4, '0')

    const { data, error } = await supabase.from('assets').insert({
      asset_id: `AST-${num}`,
      name: `${asset.name} (Copy)`,
      description: asset.description,
      category: asset.category,
      location: asset.location,
      status: 'AVAILABLE',
      manufacturer: asset.manufacturer,
      model: asset.model,
      notes: `Duplicated from ${asset.asset_id}`,
    }).select().single()

    if (error) throw error
    await logAuditActivity({ userId: auth.userId, action: 'ASSET_DUPLICATED', entityId: id })
    return NextResponse.json({ success: true, data }, { status: 201 })
  }, ['ADMIN', 'ASSET_MANAGER'])(request)
}
