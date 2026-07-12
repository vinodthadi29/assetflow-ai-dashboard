import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  return withAuth(async (_req, _auth) => {
    return NextResponse.json({ error: 'File upload not supported in this environment' }, { status: 501 })
  })(request)
}
