import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { logAuditActivity } from '@/lib/audit-logger'

export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const body = await req.json()
      const { assetId, format = 'data-url' } = body

      if (!assetId) {
        return NextResponse.json({ error: 'Asset ID required' }, { status: 400 })
      }

      const qrData = JSON.stringify({
        assetId,
        generatedAt: new Date().toISOString(),
        generatedBy: auth.userId,
      })

      let qrCode: string

      if (format === 'data-url') {
        qrCode = await QRCode.toDataURL(qrData, {
          errorCorrectionLevel: 'H',
          type: 'image/png',
          quality: 0.95,
          margin: 1,
          width: 300,
        })
      } else if (format === 'svg') {
        qrCode = await QRCode.toString(qrData, {
          errorCorrectionLevel: 'H',
          type: 'svg',
          width: 300,
          margin: 1,
        })
      } else {
        return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
      }

      await logAuditActivity({
        userId: auth.userId,
        action: 'VIEW',
        entityType: 'QRCode',
        entityId: assetId,
        reason: `Generated QR code for asset ${assetId}`,
      })

      return NextResponse.json({
        success: true,
        qrCode,
        format,
      })
    } catch (error) {
      console.error('[v0] QR code generation error:', error)
      return NextResponse.json({ success: false, error: 'Failed to generate QR code' }, { status: 500 })
    }
  })(request)
}
