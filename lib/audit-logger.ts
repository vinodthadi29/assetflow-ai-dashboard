import { prisma } from './prisma'
import { getClientIp } from './utils'

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'APPROVE'
  | 'REJECT'
  | 'VIEW'
  | 'EXPORT'
  | 'LOGIN'
  | 'LOGOUT'
  | 'ACCESS_DENIED'

export interface AuditLogInput {
  userId: string
  action: AuditAction
  entityType: string
  entityId: string
  changes?: Record<string, { old: any; new: any }>
  reason?: string
  ipAddress?: string
  userAgent?: string
}

export async function logAuditActivity(input: AuditLogInput) {
  try {
    await prisma.activity.create({
      data: {
        userId: input.userId,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        changes: input.changes ? JSON.stringify(input.changes) : null,
        reason: input.reason,
        ipAddress: input.ipAddress || 'UNKNOWN',
        userAgent: input.userAgent || 'UNKNOWN',
        timestamp: new Date(),
      },
    })
  } catch (error) {
    console.error('[v0] Failed to log audit activity:', error)
  }
}

export async function getAuditLog(
  filters?: {
    userId?: string
    entityType?: string
    entityId?: string
    action?: AuditAction
    startDate?: Date
    endDate?: Date
  },
  limit = 100,
  offset = 0
) {
  const where: any = {}

  if (filters?.userId) where.userId = filters.userId
  if (filters?.entityType) where.entityType = filters.entityType
  if (filters?.entityId) where.entityId = filters.entityId
  if (filters?.action) where.action = filters.action

  if (filters?.startDate || filters?.endDate) {
    where.timestamp = {}
    if (filters.startDate) where.timestamp.gte = filters.startDate
    if (filters.endDate) where.timestamp.lte = filters.endDate
  }

  const [activities, total] = await Promise.all([
    prisma.activity.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { timestamp: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.activity.count({ where }),
  ])

  return {
    activities,
    total,
    hasMore: offset + limit < total,
  }
}

export async function getEntityAuditTrail(entityType: string, entityId: string) {
  return prisma.activity.findMany({
    where: {
      entityType,
      entityId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
  })
}

export async function getComplianceReport(startDate: Date, endDate: Date) {
  const activities = await prisma.activity.findMany({
    where: {
      timestamp: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    },
    orderBy: { timestamp: 'desc' },
  })

  const summary = {
    totalActivities: activities.length,
    byAction: {} as Record<string, number>,
    byUser: {} as Record<string, number>,
    byEntityType: {} as Record<string, number>,
    accessDenied: activities.filter((a) => a.action === 'ACCESS_DENIED').length,
  }

  activities.forEach((activity) => {
    summary.byAction[activity.action] = (summary.byAction[activity.action] || 0) + 1
    summary.byUser[activity.userId] = (summary.byUser[activity.userId] || 0) + 1
    summary.byEntityType[activity.entityType] = (summary.byEntityType[activity.entityType] || 0) + 1
  })

  return { activities, summary }
}
