# Architecture Documentation

## System Overview

The Mini Gigs Hub is a **source-of-truth reporting system** for managing multiple freelancing accounts across platforms. It enforces accountability through manual shift reporting and provides analytics for operational insights.

## Architecture Principles

### 1. **Server-First Architecture**
- Server Components for all reads
- Server Actions for all writes
- Client Components only for interactivity (forms, charts)
- Reduces client-side JavaScript bundle

### 2. **Database as Source of Truth**
- PostgreSQL with strict constraints
- Unique indexes prevent duplicate reports
- Cascading deletes maintain referential integrity
- Append-only reports for audit trails

### 3. **No External API Dependencies**
- Manual data entry (ToS compliance)
- No scraping, no automation of platform data
- Operator accountability through manual submission

## Data Flow

### Report Submission Flow

```
User Input (Form)
    ↓
Client Component (shift-report-form.tsx)
    ↓
Server Action (submitShiftReport)
    ↓
Validation & Business Logic
    ↓
Prisma ORM
    ↓
PostgreSQL Database
    ↓
Revalidate Cache (Next.js)
    ↓
Updated Dashboard
```

### Analytics Flow

```
Page Request
    ↓
Server Component (analytics/page.tsx)
    ↓
Query Functions (lib/queries/analytics.ts)
    ↓
Database Aggregations
    ↓
Transform Data
    ↓
Pass to Client Chart Components
    ↓
Render with Recharts
```

## Database Design

### Entity Relationship Diagram

```
User (1) ──────── (*) ShiftReport
                       │
                       │ (FK: accountId)
                       │
Account (1) ────── (*) ShiftReport
   │
   │ (1:*)
   │
Gig (*)
```

### Key Constraints

1. **ShiftReport Uniqueness**
   ```prisma
   @@unique([accountId, reportDate, shift])
   ```
   Enforces: Only one AM and one PM report per account per day

2. **Platform + Email Uniqueness**
   ```prisma
   @@unique([platform, email])
   ```
   Enforces: One account per email per platform

3. **Cascade Deletes**
   ```prisma
   onDelete: Cascade
   ```
   Ensures: Clean deletion of related records

## Security Model

### Authentication (Clerk)

```
User Request
    ↓
Middleware (middleware.ts)
    ↓
Clerk Authentication
    ↓
Protected Route / API
    ↓
getCurrentUser() helper
    ↓
User object with role
```

### Authorization Levels

| Feature | Admin | Operator |
|---------|-------|----------|
| View Dashboard | ✓ | ✓ |
| Submit Reports | ✓ | ✗ |
| Create Accounts | ✓ | ✗ |
| Edit Accounts | ✓ | ✗ |
| Delete Accounts | ✓ | ✗ |
| Add Gigs | ✓ | ✗ |
| Add Withdrawals | ✓ | ✗ |
| Add Expenditures | ✓ | ✗ |
| Add/Update Payout Details | ✓ | ✗ |
| Report Accounts Created | ✓ | ✗ |
| Send Alerts | ✓ | ✗ |
| View Analytics | ✓ | ✓ |
| Export CSV | ✓ | ✓ |

### Role Enforcement

```typescript
// lib/auth.ts
export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== UserRole.admin) {
    throw new Error('Forbidden');
  }
  return user;
}
```

## State Management

### Server State (Database)
- Single source of truth
- No client-side state duplication
- Revalidation via `revalidatePath()`

### Form State (React)
- Local component state only
- Optimistic UI updates discouraged (append-only model)
- Server validation is final

### No Global State
- No Redux, Zustand, or Context needed
- Server Components fetch fresh data
- Forms submit directly to Server Actions

## Performance Optimization

### Database Indexes

```prisma
@@index([reportDate, shift])  // Analytics queries
@@index([accountId])          // Account filtering
@@index([status])             // Active account filtering
```

### Query Patterns

**Good:**
```typescript
// Fetch with includes (1 query)
const account = await db.account.findUnique({
  where: { id },
  include: { gigs: true, _count: { select: { shiftReports: true } } }
});
```

**Bad:**
```typescript
// N+1 query anti-pattern
const accounts = await db.account.findMany();
for (const account of accounts) {
  const gigs = await db.gig.findMany({ where: { accountId: account.id } });
}
```

### Caching Strategy

- Next.js default caching for Server Components
- `revalidatePath()` for targeted invalidation
- No manual cache management

## Email Architecture

### Email Flow

```
Trigger (Manual or Cron)
    ↓
Server Action / API Route
    ↓
Query Missing Reports
    ↓
Get Admin Emails
    ↓
Render React Email Template
    ↓
Resend API
    ↓
Email Delivery
```

### Template System

```typescript
// React Email Components
MissingReportsEmail({
  missingReports: [...],
  date: "..."
})
    ↓
Rendered to HTML
    ↓
Sent via Resend
```

## Cron Job Architecture

### Vercel Cron

```json
{
  "crons": [{
    "path": "/api/cron/check-missing-reports",
    "schedule": "0 10,18 * * *"
  }]
}
```

### Security

```typescript
// Verify secret in cron endpoint
const authHeader = request.headers.get('authorization');
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## Analytics Architecture

### Aggregation Patterns

```typescript
// Time-series aggregation
const dateMap = new Map<string, { date, totalAvailable, totalPending }>();

reports.forEach(report => {
  const dateKey = format(report.reportDate, 'yyyy-MM-dd');
  // Aggregate by date
});

return Array.from(dateMap.values());
```

### Chart Rendering

```typescript
// Server Component fetches data
const balanceTrends = await getBalanceTrends(14);

// Pass to Client Component for rendering
<BalanceTrendChart data={balanceTrends} />
```

## Error Handling

### Database Errors

```typescript
try {
  await db.shiftReport.create({ data });
} catch (error: any) {
  if (error.code === 'P2002') {  // Unique constraint violation
    return { success: false, error: 'Report already exists' };
  }
  return { success: false, error: 'Failed to create report' };
}
```

### Form Validation

- Client-side: HTML5 validation (required, min, max)
- Server-side: Prisma schema validation
- User feedback: Error states in forms

## Deployment Architecture

### Vercel Platform

```
Next.js App
    ↓
Serverless Functions (Server Actions, API Routes)
    ↓
Edge Network (Static Assets)
    ↓
Vercel CDN
```

### Database Connection

```
Vercel Function
    ↓
Connection Pooling (Prisma)
    ↓
PostgreSQL (Neon/Supabase)
```

### Environment Isolation

| Environment | Database | Auth Keys | Email |
|-------------|----------|-----------|-------|
| Development | Local/Test DB | Clerk Test | Resend Test |
| Production | Cloud DB | Clerk Prod | Resend Prod |

## Scalability Considerations

### Current Limits

- **Database**: PostgreSQL handles millions of reports
- **Serverless**: Vercel functions auto-scale
- **Email**: Resend free tier = 100/day (upgrade available)

### Future Scaling

1. **Multi-tenant Mode**
   - Add `organizationId` to all models
   - Row-level security policies
   - Tenant isolation

2. **Advanced Analytics**
   - Separate analytics database
   - Pre-aggregated materialized views
   - Background jobs for heavy computations

3. **Real-time Updates**
   - WebSocket connections
   - Supabase Realtime
   - Live dashboard updates

## Code Organization

### Separation of Concerns

```
/lib
  /actions    - Server Actions (writes)
  /queries    - Database queries (reads)
  /email      - Email templates & sender
  auth.ts     - Authentication helpers
  db.ts       - Prisma client
```

### Component Hierarchy

```
Page (Server Component)
    ↓
Data Fetching (queries)
    ↓
Client Components (forms, charts)
    ↓
Server Actions (mutations)
```

## Testing Strategy (Not Implemented)

### Recommended Approach

1. **Unit Tests**: Server Actions, query functions
2. **Integration Tests**: Database operations, email sending
3. **E2E Tests**: Critical flows (report submission, auth)

### Test Tools

- Jest for unit tests
- Playwright for E2E
- Prisma test database

## Monitoring & Observability (Future)

### Recommended Tools

- **Vercel Analytics**: Performance, errors
- **Sentry**: Error tracking
- **Prisma Pulse**: Database change events
- **PostHog**: User behavior analytics

---

**This architecture prioritizes:**
- ✅ Simplicity over complexity
- ✅ Server-side rendering over client-side
- ✅ Database constraints over application logic
- ✅ Type safety over runtime checks
- ✅ Manual accountability over automation
