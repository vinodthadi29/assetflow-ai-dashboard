# Data Models - AssetFlow AI

## Core Models Overview

### User Model
Represents users in the system with role-based access control.

```typescript
interface User {
  id: string (CUID)
  email: string (unique)
  name: string
  password: string (hashed)
  avatar: string
  role: UserRole (ADMIN | ASSET_MANAGER | DEPARTMENT_HEAD | EMPLOYEE)
  department: string
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime (soft delete)
}
```

**Relations:**
- Has many allocations
- Has many bookings
- Has many maintenance tickets
- Has many audits created
- Has many audit item verifications
- Has many activity logs

### Asset Model
Core model representing physical assets in the organization.

```typescript
interface Asset {
  id: string (CUID)
  assetId: string (unique, e.g., "AST-001")
  name: string
  description: string
  category: AssetCategory
  subcategory: string
  status: AssetStatus
  location: string
  owner: string
  assignedTo: string
  purchaseDate: DateTime
  purchaseValue: number
  currentValue: number (with depreciation)
  serialNumber: string
  qrCode: string (unique)
  manufacturer: string
  model: string
  warrantyExpiry: DateTime
  depreciationRate: number (default: 0)
  tags: string[]
  customFields: JSON (flexible fields)
  notes: string
  createdAt: DateTime
  updatedAt: DateTime
  deletedAt: DateTime (soft delete)
}
```

**Categories:**
- COMPUTERS
- MONITORS
- FURNITURE
- EQUIPMENT
- VEHICLES
- MACHINERY
- TOOLS
- OTHER

**Statuses:**
- AVAILABLE - Ready for allocation
- IN_USE - Currently allocated
- IN_MAINTENANCE - Under maintenance
- RESERVED - Reserved for booking
- RETIRED - No longer in use
- LOST - Missing
- DAMAGED - Not usable

### Allocation Model
Tracks asset transfers with approval workflow.

```typescript
interface Allocation {
  id: string (CUID)
  allocationId: string (unique, e.g., "ALLOC-001")
  assetId: string
  fromUserId: string (optional, for transfers)
  toUserId: string
  status: AllocationStatus
  reason: string
  startDate: DateTime
  endDate: DateTime (optional)
  approvedBy: string (user ID)
  approvedAt: DateTime
  rejectedReason: string
  rejectedAt: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Workflow:**
1. PENDING - Initial request created
2. APPROVED - Approved by authority
3. REJECTED - Rejected with reason
4. COMPLETED - Asset returned
5. CANCELLED - Request cancelled

**Key Features:**
- Requires approval before taking effect
- Tracks from/to users for ownership
- Stores reason for audit trail
- Supports indefinite or time-bound allocations

### Booking Model
Calendar-based resource reservation system.

```typescript
interface Booking {
  id: string (CUID)
  bookingId: string (unique, e.g., "BOOK-001")
  assetId: string
  userId: string
  startDate: DateTime
  endDate: DateTime
  purpose: string
  status: BookingStatus
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Statuses:**
- PENDING - Awaiting approval
- APPROVED - Approved
- REJECTED - Rejected
- ACTIVE - Currently booked
- COMPLETED - Booking finished
- CANCELLED - Cancelled booking

**Constraints:**
- No overlapping bookings for same asset
- Users can only book available assets
- Bookings are time-bound

### MaintenanceTicket Model
Tracks maintenance activities and scheduling.

```typescript
interface MaintenanceTicket {
  id: string (CUID)
  ticketId: string (unique, e.g., "MAINT-001")
  assetId: string
  createdBy: string
  title: string
  description: string
  type: MaintenanceType
  priority: Priority
  status: MaintenanceStatus
  scheduledDate: DateTime
  completedDate: DateTime
  estimatedCost: number
  actualCost: number
  notes: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Types:**
- PREVENTIVE - Scheduled maintenance
- CORRECTIVE - Repair of failure
- INSPECTION - Condition check
- REPAIR - Fix specific issue

**Priorities:**
- LOW - Can wait
- MEDIUM - Soon
- HIGH - Urgent
- CRITICAL - Immediate

**Statuses:**
- OPEN - Created
- IN_PROGRESS - Work started
- COMPLETED - Finished
- CANCELLED - Not needed
- ON_HOLD - Paused

### Audit Model
Comprehensive audit management for compliance.

```typescript
interface Audit {
  id: string (CUID)
  auditId: string (unique, e.g., "AUDIT-001")
  createdBy: string
  title: string
  description: string
  startDate: DateTime
  endDate: DateTime (optional)
  status: AuditStatus
  completionPercentage: number (0-100)
  notes: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Statuses:**
- PENDING - Not started
- IN_PROGRESS - Audit ongoing
- COMPLETED - Audit finished
- CANCELLED - Audit cancelled

**Tracks:**
- Which assets are verified
- Discrepancies found
- Missing assets
- Condition of assets

### AuditItem Model
Individual items being audited within an audit.

```typescript
interface AuditItem {
  id: string (CUID)
  auditId: string
  assetId: string
  verifiedBy: string (user ID)
  status: AuditItemStatus
  location: string
  condition: AssetCondition
  notes: string
  verifiedAt: DateTime
  createdAt: DateTime
}
```

**Item Statuses:**
- PENDING - Not yet verified
- VERIFIED - Verified, all good
- DISCREPANCY - Location/condition issue
- MISSING - Asset not found
- EXTRA - Unexpected asset found

**Conditions:**
- EXCELLENT - Like new
- GOOD - Normal wear
- FAIR - Some damage
- POOR - Major damage
- DAMAGED - Not usable

### Approval Model
Generic approval workflow for multiple entity types.

```typescript
interface Approval {
  id: string (CUID)
  approvalId: string (unique)
  type: ApprovalType
  entityId: string
  requestedBy: string
  status: ApprovalStatus
  comments: string
  createdAt: DateTime
  updatedAt: DateTime
}
```

**Types:**
- ALLOCATION - Asset allocation approval
- BOOKING - Resource booking approval
- MAINTENANCE - Maintenance ticket approval
- ASSET_RETIREMENT - Asset retirement approval

**Statuses:**
- PENDING - Awaiting decision
- APPROVED - Approved
- REJECTED - Rejected

### Activity Model
Audit log for compliance and debugging.

```typescript
interface Activity {
  id: string (CUID)
  userId: string
  assetId: string (optional)
  allocationId: string (optional)
  action: ActivityAction
  description: string
  metadata: JSON
  createdAt: DateTime
}
```

**Actions:**
- ASSET_CREATED
- ASSET_UPDATED
- ASSET_DELETED
- ALLOCATION_REQUESTED
- ALLOCATION_APPROVED
- ALLOCATION_REJECTED
- BOOKING_CREATED
- BOOKING_APPROVED
- BOOKING_CANCELLED
- MAINTENANCE_CREATED
- MAINTENANCE_COMPLETED
- AUDIT_STARTED
- AUDIT_COMPLETED
- USER_LOGIN
- SETTINGS_CHANGED

### Session Model
Authentication session management.

```typescript
interface Session {
  id: string (CUID)
  userId: string
  token: string (JWT)
  expiresAt: DateTime
  createdAt: DateTime
}
```

## Key Relationships

### Asset Lifecycle
```
Asset Created
    ↓
Asset Available
    ↓
[Allocated ↔ Booking ↔ Maintenance]
    ↓
Asset Retired/Disposed
```

### Allocation Workflow
```
User Requests Allocation
    ↓
Pending Approval
    ↓
Approved or Rejected
    ↓
Active (In Use)
    ↓
Completed (Returned)
```

### Audit Process
```
Start Audit
    ↓
Create Audit Items
    ↓
Verify Each Item
    ↓
Track Discrepancies
    ↓
Generate Report
    ↓
Complete Audit
```

## Indexing Strategy

Indexes are created for:
- User email (login)
- Asset status (filtering)
- Asset category (filtering)
- Allocation status (workflow)
- Booking dates (conflict detection)
- Maintenance status (filtering)
- Audit status (filtering)
- Activity action (audit logs)
- Soft delete dates (data retrieval)

## Soft Deletes

Users, Assets, and Allocations support soft deletes. Data is never permanently deleted but marked with `deletedAt` timestamp.

## Custom Fields

The Asset model includes a `customFields` JSON field for storing flexible metadata without schema changes.

Example:
```json
{
  "manufacturer_warranty": "24 months",
  "internal_id": "ACME-12345",
  "department_code": "ENG-001"
}
```

## Timestamps

All models include:
- `createdAt` - Record creation time
- `updatedAt` - Last modification time
- `deletedAt` - Soft delete marker (optional)

## Sample Data Relationships

```typescript
// Complete asset with relations
const asset = await prisma.asset.findUnique({
  where: { id: 'asset-id' },
  include: {
    allocations: {
      include: { toUser: true, fromUser: true }
    },
    bookings: {
      include: { user: true }
    },
    maintenance: true,
    auditItems: {
      include: { audit: true }
    },
    activities: true,
  },
})

// Complete allocation workflow
const allocation = await prisma.allocation.findUnique({
  where: { id: 'alloc-id' },
  include: {
    asset: true,
    toUser: true,
    fromUser: true,
    activities: true,
  },
})
```

## Best Practices

1. **Always use transactions for multi-step operations**
   ```typescript
   await prisma.$transaction([
     prisma.asset.update(...),
     prisma.allocation.create(...),
     prisma.activity.create(...),
   ])
   ```

2. **Use `include` selectively** - Only fetch needed relations

3. **Paginate large result sets** - Use `take` and `skip`

4. **Soft delete instead of hard delete** - Preserve audit trail

5. **Add activity logs for compliance** - Track all changes

6. **Use meaningful IDs** - Asset IDs like "AST-001", not UUIDs alone

## Migration Notes

When modifying schema:
1. Create new migration: `pnpm prisma migrate dev --name change_description`
2. Review generated migration file
3. Test with existing data
4. Deploy migration to staging first
5. Verify data integrity after migration
6. Deploy to production
