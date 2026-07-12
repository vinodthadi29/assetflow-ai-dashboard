# AssetFlow AI – Autonomous Enterprise Intelligence

A production-ready enterprise asset management platform powered by AI, built with Next.js 16, React 19, and PostgreSQL.

## Overview

AssetFlow AI is a comprehensive asset management solution designed for enterprises that need to track, allocate, maintain, and audit assets at scale. The platform combines autonomous AI intelligence with real-time tracking, predictive maintenance, and role-based workflow management.

### Core Features

- **Asset Management**: Comprehensive asset lifecycle tracking with QR codes, serial numbers, and custom fields
- **Smart Allocations**: Workflow-based asset allocation with approval system and transfer tracking
- **Calendar Bookings**: Conflict-free resource booking system for shared assets
- **Maintenance Management**: Preventive and corrective maintenance ticketing with scheduling
- **Audit System**: Comprehensive audit management with verification checklists and discrepancy tracking
- **Real-time Notifications**: WebSocket-based alerts for asset status changes and approvals
- **AI Copilot**: Natural language queries for asset insights and recommendations
- **Analytics Dashboard**: Executive dashboards with KPIs and trend analysis
- **RBAC**: Role-based access control with Admin, Asset Manager, Department Head, and Employee roles

## Technology Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library with latest features
- **Tailwind CSS 4** - Utility-first styling
- **shadcn/ui** - Premium UI component library
- **React Query** - Server state management and caching
- **Recharts** - Data visualization
- **Zod** - TypeScript-first schema validation
- **Framer Motion** - Animations (planned)

### Backend
- **Next.js API Routes** - TypeScript-based backend
- **Prisma ORM** - Type-safe database access
- **PostgreSQL** - Relational database
- **JWT** - Authentication tokens
- **Zod** - Request validation

### Infrastructure
- **Vercel** - Frontend deployment
- **Neon/AWS RDS** - Database hosting
- **Docker** - Containerization (ready)

## Project Structure

```
assetflow-ai/
├── app/
│   ├── api/
│   │   ├── assets/
│   │   ├── allocations/
│   │   ├── bookings/
│   │   ├── maintenance/
│   │   └── [auth endpoints]
│   ├── dashboard/
│   ├── assets/
│   ├── allocations/
│   ├── bookings/
│   ├── maintenance/
│   ├── audits/
│   └── page.tsx
├── components/
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── stats-cards.tsx
│   │   ├── assets-list.tsx
│   │   └── [other components]
│   └── ui/
├── hooks/
│   ├── use-assets.ts
│   ├── use-allocations.ts
│   └── [other hooks]
├── lib/
│   ├── api.ts
│   ├── auth.ts
│   └── utils.ts
├── prisma/
│   └── schema.prisma
└── public/
```

## Database Schema

### Core Models

1. **User** - Authentication and authorization
   - Roles: Admin, Asset Manager, Department Head, Employee
   - Department assignments
   - Activity tracking

2. **Asset** - Physical asset records
   - QR code tracking
   - Depreciation calculation
   - Custom fields support
   - Status management (Available, In Use, Maintenance, etc.)

3. **Allocation** - Asset transfer workflow
   - Approval-based transfer process
   - From/To user tracking
   - Status workflow (Pending → Approved/Rejected → Completed)

4. **Booking** - Resource reservation system
   - Calendar-based booking
   - Conflict detection
   - Status tracking

5. **MaintenanceTicket** - Maintenance management
   - Types: Preventive, Corrective, Inspection, Repair
   - Priority levels: Low, Medium, High, Critical
   - Cost tracking

6. **Audit** - Compliance audits
   - Audit items with verification status
   - Discrepancy tracking
   - Completion percentage

7. **Activity** - Audit log
   - User action tracking
   - Metadata storage
   - Compliance auditing

## API Endpoints

### Assets
- `GET /api/assets` - List assets with filtering
- `POST /api/assets` - Create asset
- `GET /api/assets/:id` - Get asset details
- `PATCH /api/assets/:id` - Update asset
- `DELETE /api/assets/:id` - Delete asset (soft delete)

### Allocations
- `GET /api/allocations` - List allocations
- `POST /api/allocations` - Create allocation request
- `POST /api/allocations/:id/approve` - Approve allocation
- `POST /api/allocations/:id/reject` - Reject allocation

### Bookings
- `GET /api/bookings` - List bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/check-conflict` - Check booking conflicts

### Maintenance
- `GET /api/maintenance` - List maintenance tickets
- `POST /api/maintenance` - Create ticket
- `PATCH /api/maintenance/:id` - Update ticket status

### Audits
- `GET /api/audits` - List audits
- `POST /api/audits` - Start audit
- `POST /api/audits/:id/verify` - Verify asset in audit

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/activity` - Recent activity feed

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (or npm/yarn)
- PostgreSQL 14+

### Installation

1. Clone the repository
```bash
git clone <repository>
cd assetflow-ai
```

2. Install dependencies
```bash
pnpm install
```

3. Set up environment variables
```bash
cp .env.local.example .env.local
# Edit .env.local with your database URL and secrets
```

4. Set up database
```bash
pnpm prisma migrate dev
# Or for production:
pnpm prisma migrate deploy
```

5. Run development server
```bash
pnpm dev
```

Visit http://localhost:3000

## Development

### Key Commands

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run ESLint

# Database
pnpm prisma studio         # Open Prisma Studio
pnpm prisma migrate dev     # Create and apply migrations
pnpm prisma db push        # Sync schema to database

# Type checking
pnpm tsc --noEmit          # Check TypeScript types
```

### Database Migrations

Create a new migration:
```bash
pnpm prisma migrate dev --name add_feature_name
```

## Authentication

The application uses JWT-based authentication:

1. User logs in with email/password
2. Backend validates credentials and returns JWT token
3. Token stored in localStorage (client-side)
4. Token included in Authorization header for API requests
5. Token auto-clears on 401 Unauthorized response

### Protected Routes

Dashboard and management pages require authentication. Redirect to login happens automatically.

### User Roles & Permissions

| Role | Can View Assets | Can Allocate | Can Approve | Can Audit |
|------|-----------------|--------------|-------------|-----------|
| Admin | ✓ | ✓ | ✓ | ✓ |
| Asset Manager | ✓ | ✓ | ✓ | ✓ |
| Department Head | ✓ | ✓ | Limited | Limited |
| Employee | Limited | Limited | ✗ | ✗ |

## Deployment

### Vercel (Recommended)

```bash
# Connect GitHub repository to Vercel
# Set environment variables in Vercel dashboard
# Auto-deploy on push
```

### Docker

```bash
docker build -t assetflow-ai .
docker run -p 3000:3000 assetflow-ai
```

## Performance Optimization

- Server-side rendering for SEO
- Incremental static regeneration (ISR)
- Image optimization with Next.js Image
- Code splitting and lazy loading
- React Query for efficient data fetching and caching
- Database query optimization with Prisma

## Security

- HTTPS enforced in production
- JWT token validation on all protected endpoints
- Input validation with Zod
- CORS configuration
- Rate limiting ready
- SQL injection prevention (Prisma)
- XSS protection with Next.js defaults
- CSRF protection for state-changing operations

## Future Enhancements

### Phase 2 - Advanced Features
- [ ] AI Copilot with LLM integration
- [ ] Command Palette for global search
- [ ] Predictive maintenance using ML
- [ ] Real-time WebSocket notifications
- [ ] Advanced reporting and exports
- [ ] Multi-tenancy support

### Phase 3 - Integrations
- [ ] Cloud storage (AWS S3)
- [ ] Email notifications
- [ ] Slack/Teams integration
- [ ] Calendar sync (Google, Outlook)
- [ ] Third-party accounting software

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write tests
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For support, email support@assetflow.ai or open an issue on GitHub.

## Roadmap

- **Q1 2025**: Core features and initial launch
- **Q2 2025**: AI capabilities and advanced workflows
- **Q3 2025**: Mobile app and offline support
- **Q4 2025**: Advanced analytics and BI integration
