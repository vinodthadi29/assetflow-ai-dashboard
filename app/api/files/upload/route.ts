import { NextRequest, NextResponse } from 'next/server'
import { writeFile } from 'fs/promises'
import { mkdir } from 'fs/promises'
import path from 'path'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { logAuditActivity } from '@/lib/audit-logger'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const formData = await req.formData()
      const file = formData.get('file') as File
      const assetId = formData.get('assetId') as string
      const fileType = formData.get('fileType') as string

      if (!file || !assetId || !fileType) {
        return NextResponse.json(
          { error: 'File, assetId, and fileType required' },
          { status: 400 }
        )
      }

      const maxSize = 50 * 1024 * 1024
      if (file.size > maxSize) {
        return NextResponse.json({ error: 'File too large (max 50MB)' }, { status: 400 })
      }

      const allowedTypes = ['IMAGE', 'DOCUMENT', 'MANUAL', 'INVOICE', 'RECEIPT', 'WARRANTY']
      if (!allowedTypes.includes(fileType)) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
      }

      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
      })

      if (!asset) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 })
      }

      const buffer = await file.arrayBuffer()
      const filename = `${assetId}_${Date.now()}_${file.name}`
      const uploadDir = path.join(process.cwd(), 'public', 'uploads')

      await mkdir(uploadDir, { recursive: true })
      const filepath = path.join(uploadDir, filename)
      await writeFile(filepath, Buffer.from(buffer))

      const fileUrl = `/uploads/${filename}`

      await prisma.assetFile.create({
        data: {
          assetId,
          filename: file.name,
          filepath: fileUrl,
          fileType,
          fileSize: file.size,
          mimeType: file.type,
          uploadedBy: auth.userId,
          uploadedAt: new Date(),
        },
      })

      await logAuditActivity({
        userId: auth.userId,
        action: 'CREATE',
        entityType: 'AssetFile',
        entityId: assetId,
        reason: `Uploaded ${fileType}: ${file.name}`,
      })

      return NextResponse.json({
        success: true,
        data: {
          filename,
          url: fileUrl,
          fileType,
          fileSize: file.size,
        },
      })
    } catch (error) {
      console.error('[v0] File upload error:', error)
      return NextResponse.json({ success: false, error: 'File upload failed' }, { status: 500 })
    }
  })(request)
}
