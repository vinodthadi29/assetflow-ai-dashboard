import { NextRequest, NextResponse } from 'next/server'
import { verifyRefreshToken, generateToken } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json()
    if (!refreshToken) return NextResponse.json({ error: 'Refresh token required' }, { status: 400 })

    const decoded = await verifyRefreshToken(refreshToken)
    if (!decoded) return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })

    const { data: session } = await supabase
      .from('sessions')
      .select('*, users(*)')
      .eq('id', decoded.sessionId)
      .eq('user_id', decoded.userId)
      .gt('expires_at', new Date().toISOString())
      .maybeSingle()

    if (!session) return NextResponse.json({ error: 'Session expired' }, { status: 401 })

    const user = (session as any).users
    const accessToken = await generateToken(user.id, user.email, user.role, session.id)
    return NextResponse.json({ accessToken })
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}
