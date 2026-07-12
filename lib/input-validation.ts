import { z } from 'zod'

/**
 * Centralized input validation schemas for enterprise data
 * Prevents injection attacks, XSS, and malformed data
 */

// Base schemas
const sanitizedString = z.string().trim().max(500)
const sanitizedLongString = z.string().trim().max(5000)
const emailSchema = z.string().email().max(255)
const idSchema = z.string().cuid().or(z.string().uuid())
const percentSchema = z.number().min(0).max(100)
const uuidSchema = z.string().uuid()

// Asset validation
export const AssetCreateSchema = z.object({
  name: sanitizedString.min(1, 'Asset name required'),
  description: sanitizedLongString.optional(),
  category: z.enum(['COMPUTERS', 'MONITORS', 'FURNITURE', 'EQUIPMENT', 'VEHICLES', 'MACHINERY', 'TOOLS', 'OTHER']),
  subcategory: sanitizedString.optional(),
  location: sanitizedString.min(1),
  status: z.enum(['AVAILABLE', 'IN_USE', 'IN_MAINTENANCE', 'RESERVED', 'RETIRED', 'LOST', 'DAMAGED']).optional(),
  purchaseDate: z.string().datetime().optional(),
  purchaseValue: z.number().positive().max(999999999).optional(),
  currentValue: z.number().positive().max(999999999).optional(),
  manufacturer: sanitizedString.optional(),
  model: sanitizedString.optional(),
  serialNumber: sanitizedString.optional(),
  warrantyExpiry: z.string().datetime().optional(),
  depreciationRate: percentSchema.optional(),
  assignedTo: idSchema.optional(),
  tags: z.array(sanitizedString.max(50)).max(20).optional(),
  customFields: z.record(z.any()).optional(),
  notes: sanitizedLongString.optional(),
})

export const AssetUpdateSchema = AssetCreateSchema.partial()

export const AssetQuerySchema = z.object({
  search: sanitizedString.optional(),
  category: z.string().optional(),
  status: z.string().optional(),
  location: sanitizedString.optional(),
  condition: z.string().optional(),
  sortBy: z.enum(['assetId', 'name', 'category', 'status', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
})

// Allocation validation
export const AllocationCreateSchema = z.object({
  assetId: idSchema,
  toUserId: idSchema,
  fromUserId: idSchema.optional(),
  reason: sanitizedLongString.optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().optional(),
})

export const AllocationUpdateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED']).optional(),
  rejectedReason: sanitizedLongString.optional(),
})

// Booking validation
export const BookingCreateSchema = z.object({
  assetId: idSchema,
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  purpose: sanitizedString.optional(),
})

export const BookingUpdateSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'ACTIVE', 'COMPLETED', 'CANCELLED']).optional(),
})

// Maintenance validation
export const MaintenanceCreateSchema = z.object({
  assetId: idSchema,
  title: sanitizedString.min(1),
  description: sanitizedLongString.optional(),
  type: z.enum(['PREVENTIVE', 'CORRECTIVE', 'INSPECTION', 'REPAIR']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  scheduledDate: z.string().datetime().optional(),
  estimatedCost: z.number().positive().max(999999999).optional(),
  notes: sanitizedLongString.optional(),
})

export const MaintenanceUpdateSchema = z.object({
  status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD']).optional(),
  completedDate: z.string().datetime().optional(),
  actualCost: z.number().positive().max(999999999).optional(),
  notes: sanitizedLongString.optional(),
})

// Audit validation
export const AuditCreateSchema = z.object({
  title: sanitizedString.min(1),
  description: sanitizedLongString.optional(),
  startDate: z.string().datetime(),
  notes: sanitizedLongString.optional(),
})

export const AuditUpdateSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  completionPercentage: z.number().min(0).max(100).optional(),
  notes: sanitizedLongString.optional(),
})

export const AuditItemUpdateSchema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'DISCREPANCY', 'MISSING', 'EXTRA']),
  location: sanitizedString.optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'DAMAGED']),
  notes: sanitizedLongString.optional(),
})

// User validation
export const UserCreateSchema = z.object({
  email: emailSchema,
  password: z.string().min(12).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[!@#$%^&*]/),
  name: sanitizedString.min(2),
  role: z.enum(['ADMIN', 'ASSET_MANAGER', 'DEPARTMENT_HEAD', 'EMPLOYEE']),
  department: sanitizedString.optional(),
})

export const UserUpdateSchema = z.object({
  name: sanitizedString.optional(),
  avatar: z.string().url().optional(),
  department: sanitizedString.optional(),
})

// Search validation
export const SearchQuerySchema = z.object({
  q: sanitizedString.min(1).max(100),
  type: z.enum(['asset', 'allocation', 'booking', 'maintenance', 'audit']).optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
})

// File upload validation
export const FileUploadSchema = z.object({
  fileName: sanitizedString.max(255),
  fileSize: z.number().min(1).max(100 * 1024 * 1024), // 100MB max
  mimeType: z.string().max(50),
  fileType: z.enum(['IMAGE', 'DOCUMENT', 'MANUAL', 'INVOICE', 'RECEIPT', 'WARRANTY']),
})

// Pagination schema (reusable)
export const PaginationSchema = z.object({
  limit: z.number().min(1).max(1000).default(100),
  offset: z.number().min(0).default(0),
})

// Generic validation error response
export interface ValidationError {
  field: string
  message: string
}

export function formatZodError(error: z.ZodError): ValidationError[] {
  return error.errors.map((err) => ({
    field: err.path.join('.'),
    message: err.message,
  }))
}
