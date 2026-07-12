# AssetFlow AI - API Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://yourdomain.com/api
```

## Authentication

All API requests require authentication. Use JWT tokens in the Authorization header:

```
Authorization: Bearer <token>
```

## Assets Endpoints

### GET /api/assets
List all assets with filtering and pagination.

**Query Parameters:**
- `status` (string): Filter by status (active, maintenance, retired)
- `category` (string): Filter by category
- `department` (string): Filter by department
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "AST-001",
      "name": "MacBook Pro 16\"",
      "category": "Computers",
      "status": "active",
      "owner": "John Smith",
      "location": "Office Desk 1",
      "purchaseDate": "2023-01-15",
      "purchasePrice": 2499,
      "currentValue": 1875,
      "depreciation": 0.25,
      "qrCode": "AST-001-QR"
    }
  ],
  "count": 1,
  "total": 150
}
```

### POST /api/assets
Create a new asset.

**Request Body:**
```json
{
  "name": "MacBook Pro 16\"",
  "category": "Computers",
  "description": "Development machine",
  "purchaseDate": "2023-01-15",
  "purchasePrice": 2499,
  "location": "Office Desk 1",
  "owner": "user-id"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": { /* asset object */ },
  "message": "Asset created successfully"
}
```

### GET /api/assets/[id]
Get asset details.

**Response:**
```json
{
  "success": true,
  "data": { /* asset object with full details */ }
}
```

### PUT /api/assets/[id]
Update an asset.

**Request Body:** Same as POST (all fields optional)

**Response:** `200 OK`

### DELETE /api/assets/[id]
Delete an asset.

**Response:**
```json
{
  "success": true,
  "message": "Asset deleted successfully"
}
```

## Allocations Endpoints

### GET /api/allocations
List all allocations.

**Query Parameters:**
- `status` (string): pending, approved, rejected, completed
- `assetId` (string): Filter by asset
- `fromUser` (string): Filter by user
- `toUser` (string): Filter by recipient

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "ALO-001",
      "assetId": "AST-001",
      "fromUser": "user-1",
      "toUser": "user-2",
      "status": "pending",
      "reason": "Project assignment",
      "requestedAt": "2024-07-10T10:00:00Z",
      "approvedAt": null,
      "completedAt": null
    }
  ]
}
```

### POST /api/allocations
Create allocation request.

**Request Body:**
```json
{
  "assetId": "AST-001",
  "toUser": "user-2",
  "reason": "Project assignment",
  "duration": 30,
  "requiredBy": "2024-08-10T00:00:00Z"
}
```

**Response:** `201 Created`

### PUT /api/allocations/[id]/approve
Approve allocation.

**Request Body:**
```json
{
  "notes": "Approved"
}
```

**Response:** `200 OK`

### PUT /api/allocations/[id]/reject
Reject allocation.

**Request Body:**
```json
{
  "reason": "Asset needed for other project"
}
```

**Response:** `200 OK`

## Bookings Endpoints

### GET /api/bookings
List all bookings.

**Query Parameters:**
- `assetId` (string): Filter by asset
- `startDate` (string): ISO date
- `endDate` (string): ISO date
- `status` (string): active, completed, cancelled

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "BKG-001",
      "assetId": "AST-001",
      "bookedBy": "user-1",
      "startDate": "2024-07-15T09:00:00Z",
      "endDate": "2024-07-15T17:00:00Z",
      "purpose": "Team meeting presentation",
      "status": "active"
    }
  ]
}
```

### POST /api/bookings
Create booking.

**Request Body:**
```json
{
  "assetId": "AST-001",
  "startDate": "2024-07-15T09:00:00Z",
  "endDate": "2024-07-15T17:00:00Z",
  "purpose": "Team meeting"
}
```

**Response:** `201 Created`

## Maintenance Endpoints

### GET /api/maintenance
List maintenance tickets.

**Query Parameters:**
- `status` (string): scheduled, in_progress, completed, on_hold
- `priority` (string): low, medium, high, critical
- `assetId` (string): Filter by asset

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "MNT-001",
      "assetId": "AST-001",
      "description": "Replace oil and filters",
      "priority": "high",
      "status": "scheduled",
      "scheduledDate": "2024-07-20T10:00:00Z",
      "estimatedDuration": 2,
      "assignedTo": "tech-1"
    }
  ]
}
```

### POST /api/maintenance
Create maintenance ticket.

**Request Body:**
```json
{
  "assetId": "AST-001",
  "description": "Replace oil and filters",
  "priority": "high",
  "scheduledDate": "2024-07-20T10:00:00Z",
  "estimatedDuration": 2,
  "assignedTo": "tech-1"
}
```

**Response:** `201 Created`

## Audits Endpoints

### GET /api/audits
List audits.

**Query Parameters:**
- `status` (string): pending, in_progress, completed
- `dateRange` (string): Format: YYYY-MM-DD,YYYY-MM-DD

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "AUD-001",
      "name": "Q1 2025 Asset Verification",
      "status": "in_progress",
      "scheduledDate": "2024-07-10T00:00:00Z",
      "itemCount": 45,
      "verifiedCount": 32,
      "completionPercentage": 71
    }
  ]
}
```

### POST /api/audits
Create audit.

**Request Body:**
```json
{
  "name": "Q1 2025 Asset Verification",
  "description": "Quarterly physical count",
  "scheduledDate": "2024-07-10T00:00:00Z",
  "assetIds": ["AST-001", "AST-002"],
  "assignedTo": "user-1"
}
```

**Response:** `201 Created`

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": "Error message",
  "details": {}
}
```

### Status Codes

- `200 OK` - Successful request
- `201 Created` - Resource created
- `400 Bad Request` - Invalid input
- `401 Unauthorized` - Missing authentication
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate)
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - Service temporarily down

### Example Error
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "path": "name",
      "message": "String must contain at least 5 characters"
    }
  ]
}
```

## Rate Limiting

API rate limits (per minute):
- Authenticated users: 1000 requests
- Unauthenticated: 60 requests

Rate limit info returned in headers:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1621234567
```

## Webhooks

### Asset Maintenance Due
```
POST /webhooks/maintenance-due
{
  "assetId": "AST-001",
  "maintenanceId": "MNT-001",
  "dueDate": "2024-07-20T10:00:00Z"
}
```

### Allocation Status Changed
```
POST /webhooks/allocation-status
{
  "allocationId": "ALO-001",
  "status": "approved",
  "approvedBy": "user-1",
  "timestamp": "2024-07-10T15:30:00Z"
}
```

## SDK/Client Library

Install the client library:
```bash
pnpm add @assetflow/sdk
```

Usage:
```typescript
import { AssetFlowClient } from '@assetflow/sdk'

const client = new AssetFlowClient({
  apiUrl: 'https://yourdomain.com/api',
  token: 'your-jwt-token'
})

// Get all assets
const assets = await client.assets.list()

// Create asset
const newAsset = await client.assets.create({
  name: 'MacBook Pro',
  category: 'Computers',
  purchasePrice: 2499
})
```

## Pagination

All list endpoints support cursor-based pagination:

```
GET /api/assets?page=2&limit=20
```

Response includes:
```json
{
  "data": [...],
  "pagination": {
    "page": 2,
    "limit": 20,
    "total": 150,
    "pages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

## Changelog

### v1.0.0 (2024-07-10)
- Initial API release
- Assets, Allocations, Bookings endpoints
- Basic authentication
- Rate limiting

### Planned v2.0.0
- WebSocket support for real-time updates
- GraphQL endpoint
- Advanced filtering
- Batch operations
