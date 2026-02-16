# Mini Gigs Hub

A serverless Next.js application for managing multiple freelancing accounts across platforms (Fiverr, Upwork, Direct clients) with shift-based reporting, analytics, and email alerts.

## 🎯 Core Features

### ✅ Phase 1 - Core Operations
- **Account Management**: Track multiple freelancing accounts across platforms
- **Shift Reporting**: AM/PM daily reports with accountability
- **Dashboard**: Real-time view of missing reports and account health
- **Role-Based Access**: Admin and Operator roles

### ✅ Phase 2 - Analytics & Automation
- **Analytics Dashboard**: Charts showing balance trends, order completion, platform performance
- **Email Alerts**: Automated notifications for missing shift reports
- **CSV Exports**: Download reports and account data for external use
- **Cron Jobs**: Scheduled automated alerts via Vercel cron

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL (Neon/Supabase/PlanetScale)
- **ORM**: Prisma
- **Auth**: Clerk
- **Charts**: Recharts
- **Email**: Nodemailer (Gmail SMTP) + React Email
- **Deployment**: Vercel

## 📁 Project Structure

```
mini-gigs-hub/
├── prisma/
│   └── schema.prisma          # Database models
├── src/
│   ├── app/
│   │   ├── (dashboard)/       # Protected routes
│   │   │   ├── page.tsx       # Main dashboard
│   │   │   ├── accounts/      # Account management
│   │   │   ├── reports/       # Report submission & history
│   │   │   └── analytics/     # Analytics & charts
│   │   ├── api/
│   │   │   └── cron/          # Automated jobs
│   │   └── layout.tsx
│   ├── components/
│   │   ├── charts/            # Recharts components
│   │   ├── forms/             # Form components
│   │   ├── alert-button.tsx
│   │   └── export-button.tsx
│   ├── lib/
│   │   ├── actions/           # Server Actions
│   │   ├── queries/           # Database queries
│   │   ├── email/             # Email templates & sender
│   │   ├── auth.ts
│   │   ├── db.ts
│   │   └── utils.ts
│   └── middleware.ts
├── .env.example
├── package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- Clerk account
- Gmail account with App Password (for email alerts)

### 1. Clone & Install

```bash
git clone <repo-url>
cd mini-gigs-hub
npm install
```

### 2. Environment Setup

Copy `.env.example` to `.env.local` and fill in:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Resend
RESEND_API_KEY=re_...

# Cron Security
CRON_SECRET=your-random-secret
```

### 3. Database Setup

```bash
# Push schema to database
npx prisma db push

# Open Prisma Studio (optional)
npx prisma studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📊 Database Schema

### Models

- **User**: Operators and admins
- **Account**: Freelancing accounts (Fiverr/Upwork/Direct)
- **Gig**: Service offerings under accounts
- **ShiftReport**: Daily AM/PM reports (append-only)

### Key Constraints

- **Unique**: One AM and one PM report per account per day
- **Cascade Deletes**: Reports deleted when account is deleted
- **Indexed**: Optimized queries for date ranges and status filters

## 🔐 Authentication & Authorization

### Roles

- **Admin**: Full access (CRUD accounts, view all data, send alerts)
- **Operator**: Submit shift reports only

### First Admin Setup

The first user to sign up becomes an admin by default. After that, promote users manually in the database:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'admin@example.com';
```

## 📧 Email Alerts

### Manual Alerts

Admins can click "Send Alert Email" on the dashboard when missing reports are detected.

### Automated Alerts (Cron)

Configured to run twice daily (10 AM & 6 PM):

```json
{
  "crons": [
    {
      "path": "/api/cron/check-missing-reports",
      "schedule": "0 10,18 * * *"
    }
  ]
}
```

## 📥 CSV Exports

### Export Reports
- Select date range
- Downloads all shift reports with full details

### Export Accounts
- One-click download
- Includes gig counts and report statistics

## 📈 Analytics

### Available Metrics

1. **Balance Trends**: 14-day view of available & pending balances
2. **Orders Trend**: Completed vs pending orders over time
3. **Platform Completion**: Report submission rates by platform
4. **Operator Performance**: Leaderboard of report submissions

## 🚀 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Environment Variables

Set all `.env.local` variables in Vercel dashboard.

### Database

Use Neon, Supabase, or PlanetScale for managed PostgreSQL.

## 🔄 Workflow

### Daily Operator Flow

1. Sign in
2. Navigate to "Submit Reports"
3. Fill AM report (morning shift)
4. Fill PM report (evening shift)
5. Notes field for handover details

### Admin Flow

1. Check dashboard for missing reports
2. Send email alerts if needed
3. Review analytics for trends
4. Export CSV for external reporting

## 🛡 Design Principles

### Manual Entry (By Design)

- No API scraping (ToS compliance)
- Operator accountability
- Data ownership & control

### Append-Only Reports

- No editing after submission
- Audit trail preserved
- Prevents data manipulation

### Server Components First

- Fast page loads
- SEO-friendly
- Reduced client-side JS

## 🧪 Testing

### Test Shift Reporting

1. Create test account
2. Submit AM report
3. Try submitting duplicate AM (should fail)
4. Submit PM report
5. Check dashboard for completion

### Test Email Alerts

1. Leave a report unsubmitted
2. Click "Send Alert Email"
3. Check admin inbox

## 📝 Future Enhancements

- [ ] Multi-tenant (agency mode)
- [ ] Advanced analytics (ML predictions)
- [ ] Mobile app
- [ ] Webhook integrations
- [ ] Custom alert rules

## 🤝 Contributing

This is an internal tool. For feature requests, contact the development team.

## 📄 License

Proprietary - All rights reserved

---

**Built with ❤️ for freelance teams**
