import { NextRequest, NextResponse } from 'next/server'
import { withAuth, AuthToken } from '@/lib/auth-middleware'
import { prisma } from '@/lib/prisma'
import { logAuditActivity } from '@/lib/audit-logger'

export async function GET(request: NextRequest) {
  return withAuth(async (req: NextRequest, auth: AuthToken) => {
    try {
      const searchParams = req.nextUrl.searchParams
      const query = searchParams.get('q') || ''
      const type = searchParams.get('type') || 'all'
      const limit = parseInt(searchParams.get('limit') || '20')

      if (!query || query.length < 2) {
        return NextResponse.json({
          success: true,
          results: [],
          message: 'Query too short',
        })
      }

      const searchQuery = `%${query}%`
      const results: any[] = []

      if (type === 'all' || type === 'assets') {
        const assets = await prisma.asset.findMany({
          where: {
            OR: [{ name: { contains: query, mode: 'insensitive' } }, { description: { contains: query, mode: 'insensitive' } }, { serialNumber: { contains: query, mode: 'insensitive' } }],
            deletedAt: null,
          },
          take: limit,
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
            location: true,
          },
        })

        results.push(
          ...assets.map((asset) => ({
            type: 'asset',
            id: asset.id,
            title: asset.name,
            subtitle: `${asset.category} - ${asset.status}`,
            metadata: { location: asset.location },
          }))
        )
      }

      if (type === 'all' || type === 'users') {
        const users = await prisma.user.findMany({
          where: {
            OR: [{ name: { contains: query, mode: 'insensitive' } }, { email: { contains: query, mode: 'insensitive' } }],
          },
          take: limit,
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
          },
        })

        results.push(
          ...users.map((user) => ({
            type: 'user',
            id: user.id,
            title: user.name,
            subtitle: `${user.email} - ${user.role}`,
          }))
        )
      }

      if (type === 'all' || type === 'maintenance') {
        const tickets = await prisma.maintenanceTicket.findMany({
          where: {
            OR: [{ description: { contains: query, mode: 'insensitive' } }],
            status: { not: 'CLOSED' },
          },
          take: limit,
          include: {
            asset: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })

        results.push(
          ...tickets.map((ticket) => ({
            type: 'maintenance',
            id: ticket.id,
            title: `${ticket.asset.name} - ${ticket.priority}`,
            subtitle: ticket.description,
            metadata: { assetId: ticket.asset.id, status: ticket.status },
          }))
        )
      }

      if (type === 'all' || type === 'allocations') {
        const allocations = await prisma.allocation.findMany({
          where: {
            status: { in: ['ACTIVE', 'PENDING'] },
          },
          take: limit,
          include: {
            asset: {
              select: {
                id: true,
                name: true,
              },
            },
            assignedToUser: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        })

        const filtered = allocations.filter(
          (alloc) =>
            alloc.asset.name.toLowerCase().includes(query.toLowerCase()) ||
            (alloc.assignedToUser?.name || '').toLowerCase().includes(query.toLowerCase())
        )

        results.push(
          ...filtered.map((alloc) => ({
            type: 'allocation',
            id: alloc.id,
            title: `${alloc.asset.name} → ${alloc.assignedToUser?.name || 'Unassigned'}`,
            subtitle: alloc.status,
            metadata: { assetId: alloc.assetId, assignedTo: alloc.assignedTo },
          }))
        )
      }

      await logAuditActivity({
        userId: auth.userId,
        action: 'VIEW',
        entityType: 'Search',
        entityId: 'GLOBAL',
        reason: `Searched for: ${query}`,
      })

      return NextResponse.json({
        success: true,
        results: results.slice(0, limit),
        total: results.length,
      })
    } catch (error) {
      console.error('[v0] Search error:', error)
      return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 })
    }
  })(request)
}
