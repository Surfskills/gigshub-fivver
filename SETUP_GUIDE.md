# Setup Guide - Mini Gigs Hub

Complete step-by-step guide to get your application running.

## 📋 Prerequisites Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL database (Neon/Supabase/PlanetScale)
- [ ] Clerk account (free tier works)
- [ ] Gmail account with App Password (for Nodemailer alerts)
- [ ] Vercel account for deployment (optional)

---

## 🔧 Step 1: Local Development Setup

### 1.1 Install Dependencies

```bash
npm install
```

### 1.2 Configure Environment Variables

Create `.env.local` in the root directory:

```bash
# Database - Get from Neon/Supabase/PlanetScale
DATABASE_URL="postgresql://user:password@host.region.neon.tech:5432/database?sslmode=require"

# Clerk - Get from https://dashboard.clerk.com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
CLERK_SECRET_KEY=sk_test_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Clerk redirects
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/

# Nodemailer / Gmail SMTP - For alerts (use Gmail App Password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
ALERT_EMAIL_TO=ojjfred@gmail.com

# Cron security (generate a random string)
CRON_SECRET=use-a-long-random-string-here-min-32-chars
```

### 1.3 Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Optional: Open Prisma Studio to view data
npx prisma studio
```

### 1.4 Run Development Server

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🔐 Step 2: Clerk Authentication Setup

### 2.1 Create Clerk Application

1. Go to https://dashboard.clerk.com
2. Create new application
3. Choose "Email + Password" or "Email + Google" (recommended)
4. Copy API keys to `.env.local`

### 2.2 Configure Clerk Settings

In Clerk Dashboard:

1. **Paths**: Set sign-in URL to `/sign-in`, sign-up to `/sign-up`
2. **Sessions**: Enable session token customization (if needed)
3. **User Profile**: Enable name, email fields

### 2.3 Create First Admin User

1. Sign up via the app
2. Your first user is automatically created
3. Promote to admin via Prisma Studio or SQL:

```sql
UPDATE "User" SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## 📊 Step 3: Database Provider Setup

Choose one:

### Option A: Neon (Recommended)

1. Go to https://neon.tech
2. Create new project
3. Copy connection string
4. Add to `.env.local` as `DATABASE_URL`

### Option B: Supabase

1. Go to https://supabase.com
2. Create new project
3. Go to Settings → Database
4. Copy "Connection Pooling" URI (Transaction mode)
5. Add to `.env.local`

### Option C: PlanetScale

1. Go to https://planetscale.com
2. Create database
3. Create branch
4. Get connection string
5. Add to `.env.local`

---

## 📧 Step 4: Email Setup (Resend)

### 4.1 Create Resend Account

1. Go to https://resend.com
2. Sign up (free tier: 100 emails/day)
3. Verify your email

### 4.2 Add Domain (Production) or Use Test Domain

**For Development:**
- Use default sending domain: `onboarding@resend.dev`

**For Production:**
1. Add your domain in Resend dashboard
2. Add DNS records (SPF, DKIM, DMARC)
3. Verify domain

### 4.3 Update Email Template

Edit `src/lib/email/send.ts`:

```typescript
from: 'Mini Gigs Hub (Fivver)<alerts@yourdomain.com>', // Change to your domain
```

---

## 🚀 Step 5: Deployment to Vercel

### 5.1 Connect to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel
```

### 5.2 Add Environment Variables

In Vercel Dashboard → Project → Settings → Environment Variables:

Add all variables from `.env.local`:
- `DATABASE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `RESEND_API_KEY`
- `CRON_SECRET`
- All `NEXT_PUBLIC_CLERK_*` variables

### 5.3 Configure Clerk for Production

In Clerk Dashboard:
1. Add production domain: `your-app.vercel.app`
2. Update redirect URLs
3. Get production API keys
4. Update Vercel environment variables

### 5.4 Enable Cron Jobs

The `vercel.json` file is already configured:
- Runs at 10 AM and 6 PM daily
- Sends missing report alerts automatically

---

## 🧪 Step 6: Testing the Application

### 6.1 Create Test Account

1. Sign in as admin
2. Go to "Accounts"
3. Click "Add Account"
4. Fill in:
   - Platform: Fiverr
   - Email: test@fiverr.com
   - Username: testuser
   - Type of Gigs: API Development

### 6.2 Submit Test Report

1. Go to "Submit Reports"
2. Fill AM report for test account
3. Submit
4. Verify on dashboard (should show no missing AM report)

### 6.3 Test Email Alerts

1. Create another account
2. Don't submit report
3. Check dashboard (should show missing report)
4. Click "Send Alert Email"
5. Check your admin email inbox

### 6.4 Test Analytics

1. Submit reports for a few days
2. Go to "Analytics"
3. View charts and trends

### 6.5 Test CSV Export

1. Go to "History"
2. Click "Export Reports CSV"
3. Select date range
4. Download and verify CSV

---

## 🔄 Step 7: Daily Operations

### Operator Workflow

**Morning Shift (AM):**
1. Sign in
2. Go to "Submit Reports"
3. Fill orders completed, balances, notes
4. Submit AM report

**Evening Shift (PM):**
1. Sign in
2. Go to "Submit Reports"
3. Fill orders completed, balances, notes
4. Submit PM report

### Admin Workflow

**Daily:**
1. Check dashboard for missing reports
2. Review analytics trends
3. Send alerts if needed

**Weekly:**
1. Export CSV reports
2. Review operator performance
3. Check platform completion rates

---

## ⚙️ Step 8: Customization

### Add Custom Platform

Edit `prisma/schema.prisma`:

```prisma
enum Platform {
  fiverr
  upwork
  direct
  freelancer  // Add new platform
}
```

Then:
```bash
npx prisma db push
```

### Change Alert Schedule

Edit `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/check-missing-reports",
      "schedule": "0 8,20 * * *"  // 8 AM and 8 PM
    }
  ]
}
```

### Add Custom Metrics

Edit `src/lib/actions/reports.ts` and add new fields to `submitShiftReport`.

---

## 🐛 Troubleshooting

### Database Connection Fails

- Check `DATABASE_URL` format
- Verify SSL mode for cloud databases: `?sslmode=require`
- Test connection in Prisma Studio

### Clerk Authentication Not Working

- Verify API keys are correct
- Check redirect URLs match
- Ensure middleware is running

### Emails Not Sending

- Verify Resend API key
- Check "from" email domain
- Review Resend dashboard logs

### Cron Jobs Not Running

- Verify `CRON_SECRET` is set
- Check Vercel deployment logs
- Ensure `vercel.json` is in root

---

## 📞 Support

For issues:
1. Check logs: `npm run dev` output
2. Check Vercel logs (production)
3. Check Clerk dashboard (auth issues)
4. Check Resend dashboard (email issues)

---

**🎉 You're all set! Start managing your freelancing operations.**
