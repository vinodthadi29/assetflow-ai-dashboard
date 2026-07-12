import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { checkRateLimit, verifyPassword } from '@/lib/security-middleware'
import { generateToken, generateRefreshToken } from '@/lib/auth-middleware'
import { logAuditActivity } from '@/lib/audit-logger'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

const MAX_ATTEMPTS = 5
const LOCKOUT_MS = 30 * 60 * 1000

export async function POST(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'

    if (!checkRateLimit(`ip:${clientIP}`, 10, 15 * 60 * 1000)) {
      return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429 })
    }

    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    const { data: user } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .maybeSingle()

    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return NextResponse.json({ error: 'Account temporarily locked. Try again later.' }, { status: 429 })
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 403 })
    }

    const passwordValid = await verifyPassword(password, user.password_hash)

    if (!passwordValid) {
      const newAttempts = user.failed_login_attempts + 1
      const shouldLock = newAttempts >= MAX_ATTEMPTS
      await supabase.from('users').update({
        failed_login_attempts: newAttempts,
        locked_until: shouldLock ? new Date(Date.now() + LOCKOUT_MS).toISOString() : null,
      }).eq('id', user.id)
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })
    }

    const { data: session, error: sessionError } = await supabase
      .from('sessions')
      .insert({
        user_id: user.id,
        refresh_token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      })
      .select('id, refresh_token')
      .single()

    if (sessionError || !session) throw sessionError

    const accessToken = await generateToken(user.id, user.email, user.role, session.id)
    const refreshToken = await generateRefreshToken(user.id, session.id)

    await supabase.from('sessions').update({ refresh_token: refreshToken }).eq('id', session.id)
    await supabase.from('users').update({
      failed_login_attempts: 0,
      locked_until: null,
      last_login_at: new Date().toISOString(),
    }).eq('id', user.id)

    await logAuditActivity({ userId: user.id, action: 'LOGIN_SUCCESS', ipAddress: clientIP })

    return NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role, department: user.department },
      accessToken,
      refreshToken,
    })
  } catch (error) {
    console.error('[auth] Login error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
