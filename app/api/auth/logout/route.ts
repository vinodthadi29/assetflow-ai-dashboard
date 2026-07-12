import { NextRequest, NextResponse } from 'next/server'
import { authenticateRequest } from '@/lib/auth-middleware'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request)
    if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { refreshToken } = await request.json()
    if (refreshToken) {
      await supabase.from('sessions').delete()
        .eq('user_id', auth.userId)
        .eq('refresh_token', refreshToken)
    }

    return NextResponse.json({ message: 'Logged out successfully' })
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
