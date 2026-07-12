import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { withAuth, withRoleAuth, AuthToken } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'
import { logAuditActivity } from '@/lib/audit-logger'

const CreateAssetSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1),
  subcategory: z.string().optional(),
  location: z.string().min(1),
  status: z.string().optional(),
  purchase_date: z.string().optional(),
  purchase_value: z.coerce.number().optional(),
  current_value: z.coerce.number().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  warranty_expiry: z.string().optional(),
  depreciation_rate: z.coerce.number().optional(),
  assigned_to: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    const sp = req.nextUrl.searchParams
    let query = supabase.from('assets').select('*').is('deleted_at', null)

    const search = sp.get('search')
    if (search) {
      query = query.or(`name.ilike.%${search}%,asset_id.ilike.%${search}%,serial_number.ilike.%${search}%`)
    }
    if (sp.get('category')) query = query.eq('category', sp.get('category')!)
    if (sp.get('status')) query = query.eq('status', sp.get('status')!)
    if (sp.get('location')) query = query.ilike('location', `%${sp.get('location')}%`)

    const sortBy = sp.get('sortBy') || 'asset_id'
    const sortOrder = sp.get('sortOrder') === 'desc'
    query = query.order(sortBy, { ascending: !sortOrder })

    const limit = Math.min(parseInt(sp.get('limit') || '100'), 1000)
    const offset = parseInt(sp.get('offset') || '0')
    query = query.range(offset, offset + limit - 1)

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({ success: true, data, total: count, hasMore: false })
  })(request)
}

export async function POST(request: NextRequest) {
  return withRoleAuth(async (req: NextRequest, auth: AuthToken) => {
    const body = await req.json()
    const validated = CreateAssetSchema.parse(body)

    const { data: last } = await supabase
      .from('assets')
      .select('asset_id')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const num = (parseInt(last?.asset_id?.split('-')[1] || '0') + 1).toString().padStart(4, '0')
    const assetId = `AST-${num}`

    const { data, error } = await supabase
      .from('assets')
      .insert({ ...validated, asset_id: assetId, status: validated.status || 'AVAILABLE' })
      .select()
      .single()

    if (error) throw error

    await logAuditActivity({ userId: auth.userId, action: 'ASSET_CREATED', entityType: 'Asset', entityId: data.id, description: `Created asset: ${data.name}` })

    return NextResponse.json({ success: true, data }, { status: 201 })
  }, ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'])(request)
}
