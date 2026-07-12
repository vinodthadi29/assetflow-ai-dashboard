import { prisma } from './prisma'

export type UserRole = 'ADMIN' | 'ASSET_MANAGER' | 'DEPARTMENT_HEAD' | 'EMPLOYEE'

export interface Permission {
  canCreateAssets: boolean
  canEditAssets: boolean
  canDeleteAssets: boolean
  canAllocateAssets: boolean
  canApproveAllocations: boolean
  canBookResources: boolean
  canCreateMaintenance: boolean
  canApproveMaintenance: boolean
  canViewAudits: boolean
  canManageUsers: boolean
  canExportReports: boolean
  canViewAnalytics: boolean
}

export const rolePermissions: Record<UserRole, Permission> = {
  ADMIN: {
    canCreateAssets: true,
    canEditAssets: true,
    canDeleteAssets: true,
    canAllocateAssets: true,
    canApproveAllocations: true,
    canBookResources: true,
    canCreateMaintenance: true,
    canApproveMaintenance: true,
    canViewAudits: true,
    canManageUsers: true,
    canExportReports: true,
    canViewAnalytics: true,
  },
  ASSET_MANAGER: {
    canCreateAssets: true,
    canEditAssets: true,
    canDeleteAssets: true,
    canAllocateAssets: true,
    canApproveAllocations: true,
    canBookResources: true,
    canCreateMaintenance: true,
    canApproveMaintenance: true,
    canViewAudits: true,
    canManageUsers: false,
    canExportReports: true,
    canViewAnalytics: true,
  },
  DEPARTMENT_HEAD: {
    canCreateAssets: false,
    canEditAssets: false,
    canDeleteAssets: false,
    canAllocateAssets: true,
    canApproveAllocations: true,
    canBookResources: true,
    canCreateMaintenance: true,
    canApproveMaintenance: false,
    canViewAudits: false,
    canManageUsers: false,
    canExportReports: true,
    canViewAnalytics: true,
  },
  EMPLOYEE: {
    canCreateAssets: false,
    canEditAssets: false,
    canDeleteAssets: false,
    canAllocateAssets: false,
    canApproveAllocations: false,
    canBookResources: true,
    canCreateMaintenance: true,
    canApproveMaintenance: false,
    canViewAudits: false,
    canManageUsers: false,
    canExportReports: false,
    canViewAnalytics: false,
  },
}

export function getPermissions(role: UserRole): Permission {
  return rolePermissions[role]
}

export function hasPermission(role: UserRole, permission: keyof Permission): boolean {
  return rolePermissions[role][permission]
}

export async function canUserAccessAsset(userId: string, assetId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) return false
  if (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER') return true

  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
    include: {
      allocations: {
        where: {
          toUserId: userId,
          status: { in: ['APPROVED', 'COMPLETED'] },
        },
      },
    },
  })

  if (!asset) return false
  return asset.allocations.length > 0
}

export async function canUserAllocateAsset(userId: string, assetId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) return false
  if (!hasPermission(user.role, 'canAllocateAssets')) return false

  // Admins and Asset Managers can allocate any asset
  if (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER') return true

  // Other roles can only allocate assets in their department
  const asset = await prisma.asset.findUnique({
    where: { id: assetId },
  })

  if (!asset) return false
  // For department heads, check if asset is in their department
  return asset.location === user.department
}

export async function canUserApproveMaintenance(userId: string, maintenanceId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) return false
  if (!hasPermission(user.role, 'canApproveMaintenance')) return false

  const maintenance = await prisma.maintenanceTicket.findUnique({
    where: { id: maintenanceId },
    include: {
      asset: true,
    },
  })

  if (!maintenance) return false
  if (user.role === 'ADMIN' || user.role === 'ASSET_MANAGER') return true

  // Department heads can approve maintenance for assets in their department
  return maintenance.asset.location === user.department
}
