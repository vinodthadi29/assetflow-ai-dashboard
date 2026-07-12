# Development Guide - AssetFlow AI

## Quick Start

### 1. Environment Setup

```bash
# Install dependencies
pnpm install

# Set up .env.local (see .env.local.example)
cp .env.local.example .env.local

# For local PostgreSQL development
# DATABASE_URL="postgresql://user:password@localhost:5432/assetflow"

# For Neon serverless (recommended)
# Get from https://console.neon.tech/
```

### 2. Database Setup

```bash
# Create migration and sync database
pnpm prisma migrate dev --name init

# Or push existing schema
pnpm prisma db push

# Open Prisma Studio to view/edit data
pnpm prisma studio
```

### 3. Start Development Server

```bash
pnpm dev
```

Visit http://localhost:3000

## Project Architecture

### Frontend Architecture

```
Components Hierarchy:
┌─ Page (app/dashboard/page.tsx)
├─ Sidebar (navigation)
├─ Header (search, notifications)
└─ Content
   ├─ Stats Cards
   ├─ Assets List (Table)
   └─ Maintenance Schedule
```

### Backend Architecture

```
API Routes:
/api/
├─ assets/          (CRUD + filtering)
├─ allocations/     (create, approve, reject)
├─ bookings/        (create, list, check conflicts)
├─ maintenance/     (tickets, scheduling)
├─ audits/          (create, verify items)
├─ dashboard/       (statistics, analytics)
└─ activity/        (audit logs)
```

### Data Flow

```
User Action
    ↓
Component Hook (useAssets, useAllocations, etc.)
    ↓
React Query (caching, loading states)
    ↓
API Client (apiClient.getAssets())
    ↓
API Route (/api/assets)
    ↓
Prisma ORM
    ↓
PostgreSQL
```

## Key Technologies

### Frontend
- **Next.js 16** - Build system, routing, API routes
- **React 19** - UI library
- **React Query** - Data fetching & caching
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Zod** - Validation

### Backend
- **Prisma** - ORM and database management
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Axios** - HTTP client

## Common Development Tasks

### Adding a New Feature

1. **Update Database Schema**
   ```bash
   # Edit prisma/schema.prisma
   pnpm prisma migrate dev --name add_feature_name
   ```

2. **Create API Route**
   ```typescript
   // app/api/features/route.ts
   import { NextRequest, NextResponse } from 'next/server'
   
   export async function GET(request: NextRequest) {
     // Implement endpoint
   }
   ```

3. **Create React Hook**
   ```typescript
   // hooks/use-features.ts
   import { useQuery } from 'react-query'
   import { apiClient } from '@/lib/api'
   
   export function useFeatures() {
     return useQuery('features', () => apiClient.getFeatures())
   }
   ```

4. **Create Component**
   ```typescript
   // components/features/feature-list.tsx
   'use client'
   import { useFeatures } from '@/hooks/use-features'
   
   export function FeatureList() {
     const { data, isLoading } = useFeatures()
     // Render component
   }
   ```

### Adding API Endpoint

Example: Create asset endpoint

```typescript
// app/api/assets/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreateAssetSchema = z.object({
  name: z.string().min(1),
  category: z.string(),
  location: z.string(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = CreateAssetSchema.parse(body)
    
    // TODO: Create asset with Prisma
    // const asset = await prisma.asset.create({
    //   data: {
    //     assetId: generateAssetId(),
    //     ...data,
    //   }
    // })
    
    return NextResponse.json({ success: true, data: asset }, { status: 201 })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create' }, { status: 400 })
  }
}
```

### Adding UI Component

Example: Asset table component

```typescript
// components/dashboard/assets-list.tsx
'use client'

import { useAssets } from '@/hooks/use-assets'
import { MoreVertical } from 'lucide-react'

export function AssetsList() {
  const { data, isLoading, error } = useAssets()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error loading assets</div>

  return (
    <div className="rounded-xl border border-border bg-card/50">
      <table className="w-full">
        <thead>
          <tr>
            <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
            <th className="px-6 py-3 text-left text-sm font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {data?.data?.map((asset) => (
            <tr key={asset.id} className="border-b border-border/30">
              <td className="px-6 py-4">{asset.name}</td>
              <td className="px-6 py-4">{asset.category}</td>
              <td className="px-6 py-4">{asset.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

## Database Operations

### Query with Prisma

```typescript
// Find assets
const assets = await prisma.asset.findMany({
  where: { status: 'AVAILABLE' },
  include: { allocations: true },
  take: 10,
  skip: 0,
})

// Create asset
const asset = await prisma.asset.create({
  data: {
    assetId: 'AST-001',
    name: 'MacBook Pro',
    category: 'COMPUTERS',
    location: 'Office A',
  },
})

// Update asset
const updated = await prisma.asset.update({
  where: { id: 'asset-id' },
  data: { status: 'IN_MAINTENANCE' },
})

// Delete (soft delete)
const deleted = await prisma.asset.update({
  where: { id: 'asset-id' },
  data: { deletedAt: new Date() },
})
```

### With Relations

```typescript
// Get allocation with asset and users
const allocation = await prisma.allocation.findUnique({
  where: { id: 'allocation-id' },
  include: {
    asset: true,
    toUser: true,
    fromUser: true,
  },
})

// Create allocation with relations
const allocation = await prisma.allocation.create({
  data: {
    allocationId: 'ALLOC-001',
    assetId: 'asset-id',
    toUserId: 'user-id',
    startDate: new Date(),
    status: 'PENDING',
  },
})
```

## Testing

### Running Tests

```bash
# Run all tests
pnpm test

# Run specific test file
pnpm test components/dashboard

# Watch mode
pnpm test --watch
```

### Writing Tests

```typescript
// __tests__/hooks/use-assets.test.ts
import { renderHook, waitFor } from '@testing-library/react'
import { useAssets } from '@/hooks/use-assets'

describe('useAssets', () => {
  it('should fetch assets', async () => {
    const { result } = renderHook(() => useAssets())
    
    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true)
    })
    
    expect(result.current.data).toBeDefined()
  })
})
```

## Performance Tips

1. **Use React Query for caching**
   - Automatic background refetching
   - Stale-while-revalidate pattern
   - Reduces API calls

2. **Optimize database queries**
   - Use `include` only when needed
   - Index frequently queried fields
   - Use pagination for large datasets

3. **Component optimization**
   - Memoize expensive computations
   - Lazy load routes
   - Code split large components

4. **Image optimization**
   - Use Next.js Image component
   - Provide multiple sizes
   - Use modern formats (WebP)

## Debugging

### Enable Debug Logs

```typescript
// In .env.local
DEBUG=assetflow:*

// In code
console.log('[assetflow] Message:', data)
```

### Database Debugging

```bash
# Open Prisma Studio
pnpm prisma studio

# View real-time queries (Neon)
# Go to https://console.neon.tech/
```

### React DevTools

```bash
# Install browser extension
# Inspect components, hooks, props
```

## Deployment

### To Vercel

```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys
# Set environment variables in Vercel dashboard
```

### Environment Variables

```
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=https://yourdomain.com
```

### Database Migration

```bash
# Apply migrations to production
pnpm prisma migrate deploy
```

## Common Issues

### Port Already in Use

```bash
# Kill process on port 3000
lsof -i :3000
kill -9 <PID>

# Or use different port
pnpm dev -- -p 3001
```

### Prisma Client Out of Sync

```bash
# Regenerate Prisma client
pnpm prisma generate
```

### Database Connection Timeout

```bash
# Check DATABASE_URL in .env.local
# Verify network connectivity
# For Neon, check connection pooling settings
```

### Hot Reload Not Working

```bash
# Clear Next.js cache
rm -rf .next

# Restart dev server
pnpm dev
```

## Code Style

We follow these conventions:

- **TypeScript** - All code must be typed
- **ESLint** - Run `pnpm lint` before committing
- **Prettier** - Automatically formatted on save
- **Component naming** - PascalCase for components
- **File naming** - kebab-case for files
- **Constants** - UPPER_SNAKE_CASE in caps

## Resources

- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Prisma Docs](https://www.prisma.io/docs)
- [TailwindCSS Docs](https://tailwindcss.com/docs)
- [React Query Docs](https://react-query.tanstack.com)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

## Getting Help

1. Check the README.md
2. Look at similar components
3. Check API documentation
4. Open an issue on GitHub
5. Contact the development team
