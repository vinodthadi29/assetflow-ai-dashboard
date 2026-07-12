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
  // accept both snake_case (direct) and camelCase (from form)
  purchase_date: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchase_value: z.coerce.number().optional(),
  purchaseValue: z.coerce.number().optional(),
  current_value: z.coerce.number().optional(),
  currentValue: z.coerce.number().optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  serial_number: z.string().optional(),
  serialNumber: z.string().optional(),
  warranty_expiry: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  depreciation_rate: z.coerce.number().optional(),
  depreciationRate: z.coerce.number().optional(),
  assigned_to: z.string().optional(),
  assignedTo: z.string().optional(),
  notes: z.string().optional(),
})

export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest, _auth: AuthToken) => {
    const sp = req.nextUrl.searchParams
    let query = supabase.from('assets').select('*').is('deleted_at', null)

    const search = sp.get('search')
    if (search) {
      query = query.or(`name.ilike.%${search}%,asset_id.ilike.%${search}%,serial_number.ilike.%${search}%`)
    }
    if (sp.get('category')) query = query.eq('category', sp.get('category')!)
    if (sp.get('status')) query = query.eq('status', sp.get('status')!)
    if (sp.get('location')) query = query.ilike('location', `%${sp.get('location')}%`)

    const sortBy = sp.get('sortBy') || 'created_at'
    const sortOrder = sp.get('sortOrder') === 'desc'
    query = query.order(sortBy, { ascending: !sortOrder })

    const limit = Math.min(parseInt(sp.get('limit') || '100'), 1000)
    const offset = parseInt(sp.get('offset') || '0')
    query = query.range(offset, offset + limit - 1)

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, data, total: data?.length ?? 0 })
  })(request)
}

export async function POST(request: NextRequest) {
  return withRoleAuth(async (req: NextRequest, auth: AuthToken) => {
    const body = await req.json()
    const validated = CreateAssetSchema.parse(body)

    // Normalize camelCase → snake_case
    const insertData = {
      name: validated.name,
      description: validated.description || null,
      category: validated.category,
      subcategory: validated.subcategory || null,
      location: validated.location,
      status: validated.status || 'AVAILABLE',
      manufacturer: validated.manufacturer || null,
      model: validated.model || null,
      serial_number: validated.serial_number || validated.serialNumber || null,
      purchase_date: validated.purchase_date || validated.purchaseDate || null,
      purchase_value: validated.purchase_value ?? validated.purchaseValue ?? null,
      current_value: validated.current_value ?? validated.currentValue ?? null,
      warranty_expiry: validated.warranty_expiry || validated.warrantyExpiry || null,
      depreciation_rate: validated.depreciation_rate ?? validated.depreciationRate ?? null,
      assigned_to: validated.assigned_to || validated.assignedTo || null,
      notes: validated.notes || null,
    }

    // Generate unique asset ID using max numeric suffix
    const { data: last } = await supabase
      .from('assets')
      .select('asset_id')
      .like('asset_id', 'AST-%')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    const lastNum = last?.asset_id ? parseInt(last.asset_id.replace('AST-', '')) : 0
    const assetId = `AST-${String(lastNum + 1).padStart(4, '0')}`

    const { data, error } = await supabase
      .from('assets')
      .insert({ ...insertData, asset_id: assetId })
      .select()
      .single()

    if (error) {
      console.error('[assets] Insert error:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    await logAuditActivity({
      userId: auth.userId,
      action: 'ASSET_CREATED',
      entityType: 'Asset',
      entityId: data.id,
      description: `Created asset: ${data.name}`,
    })

    return NextResponse.json({ success: true, data }, { status: 201 })
  }, ['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD'])(request)
}
