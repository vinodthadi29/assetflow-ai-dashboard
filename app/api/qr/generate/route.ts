import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { withAuth } from '@/lib/auth-middleware'

export async function POST(request: NextRequest) {
  return withAuth(async (req, auth) => {
    const { assetId, format = 'data-url' } = await req.json()
    if (!assetId) return NextResponse.json({ error: 'Asset ID required' }, { status: 400 })

    const qrData = JSON.stringify({ assetId, generatedAt: new Date().toISOString() })
    let qrCode: string

    if (format === 'svg') {
      qrCode = await QRCode.toString(qrData, { type: 'svg', width: 300, margin: 1, errorCorrectionLevel: 'H' })
    } else {
      qrCode = await QRCode.toDataURL(qrData, { type: 'image/png', width: 300, margin: 1, errorCorrectionLevel: 'H' })
    }

    return NextResponse.json({ success: true, qrCode, format })
  })(request)
}
