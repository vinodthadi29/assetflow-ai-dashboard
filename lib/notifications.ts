import { prisma } from './prisma'
import { Notification, NotificationType } from '@prisma/client'

export interface NotificationInput {
  userId: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string
  metadata?: Record<string, any>
}

export async function createNotification(input: NotificationInput): Promise<Notification> {
  return prisma.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      title: input.title,
      message: input.message,
      actionUrl: input.actionUrl,
      metadata: input.metadata ? JSON.stringify(input.metadata) : null,
    },
  })
}

export async function notifyAllocationRequest(
  assetId: string,
  assignedTo: string,
  reason?: string
) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } })
  if (!asset) return

  return createNotification({
    userId: assignedTo,
    type: 'ALLOCATION_REQUEST',
    title: `Asset Allocation: ${asset.name}`,
    message: reason || `You have been assigned ${asset.name}`,
    actionUrl: `/assets/${assetId}`,
    metadata: { assetId },
  })
}

export async function notifyAllocationApproved(
  allocationId: string,
  userId: string
) {
  const allocation = await prisma.allocation.findUnique({
    where: { id: allocationId },
    include: { asset: true },
  })

  if (!allocation) return

  return createNotification({
    userId,
    type: 'ALLOCATION_APPROVED',
    title: `Allocation Approved: ${allocation.asset.name}`,
    message: `Your allocation of ${allocation.asset.name} has been approved`,
    actionUrl: `/allocations/${allocationId}`,
  })
}

export async function notifyMaintenanceAlert(
  assetId: string,
  departmentId: string,
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
) {
  const asset = await prisma.asset.findUnique({ where: { id: assetId } })
  if (!asset) return

  const managers = await prisma.user.findMany({
    where: {
      departmentId,
      role: { in: ['ASSET_MANAGER', 'DEPARTMENT_HEAD'] },
    },
  })

  const notifications = await Promise.all(
    managers.map((manager) =>
      createNotification({
        userId: manager.id,
        type: 'MAINTENANCE_ALERT',
        title: `Maintenance Alert: ${asset.name}`,
        message: `${severity} priority maintenance needed for ${asset.name}`,
        actionUrl: `/maintenance?assetId=${assetId}`,
        metadata: { assetId, severity },
      })
    )
  )

  return notifications
}

export async function notifyBookingConfirmed(
  bookingId: string,
  userId: string,
  resourceName: string
) {
  return createNotification({
    userId,
    type: 'BOOKING_CONFIRMED',
    title: `Booking Confirmed: ${resourceName}`,
    message: `Your booking has been confirmed`,
    actionUrl: `/bookings/${bookingId}`,
  })
}

export async function notifyComplianceAlert(
  userId: string,
  title: string,
  message: string
) {
  return createNotification({
    userId,
    type: 'COMPLIANCE_ALERT',
    title,
    message,
    actionUrl: '/audits',
  })
}

export async function notifyBulk(userIds: string[], input: Omit<NotificationInput, 'userId'>) {
  return Promise.all(
    userIds.map((userId) =>
      createNotification({
        ...input,
        userId,
      })
    )
  )
}

export async function getUnreadNotifications(userId: string) {
  return prisma.notification.findMany({
    where: {
      userId,
      readAt: null,
    },
    orderBy: { createdAt: 'desc' },
  })
}

export async function markAsRead(notificationId: string) {
  return prisma.notification.update({
    where: { id: notificationId },
    data: { readAt: new Date() },
  })
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: {
      userId,
      readAt: null,
    },
    data: { readAt: new Date() },
  })
}
