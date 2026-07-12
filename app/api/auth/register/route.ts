import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { hashPassword } from '@/lib/security-middleware'

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['EMPLOYEE', 'DEPARTMENT_HEAD', 'ASSET_MANAGER', 'ADMIN']).default('EMPLOYEE'),
  department: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = registerSchema.parse(body)

    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', data.email)
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 400 })
    }

    const passwordHash = await hashPassword(data.password)

    const { data: user, error } = await supabase
      .from('users')
      .insert({
        email: data.email,
        name: data.name,
        password_hash: passwordHash,
        role: data.role,
        department: data.department || null,
      })
      .select('id, email, name, role')
      .single()

    if (error) throw error

    return NextResponse.json({ message: 'User created successfully', user }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && 'errors' in (error as any)) {
      return NextResponse.json({ error: 'Validation failed' }, { status: 400 })
    }
    console.error('[auth] Register error:', error)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
