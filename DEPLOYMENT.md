# Deployment Guide

Quick reference for deploying to production.

## 🚀 Production Deployment Checklist

### Pre-Deployment

- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] Clerk configured for production domain
- [ ] Resend domain verified (or using test domain)
- [ ] Admin user created and role assigned

### Vercel Deployment

```bash
# One-time setup
npm i -g vercel
vercel login

# Deploy to production
vercel --prod
```

### Environment Variables (Vercel)

Required in Vercel Dashboard → Settings → Environment Variables:

```
DATABASE_URL
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/
RESEND_API_KEY
CRON_SECRET
```

### Post-Deployment

1. **Test authentication**: Sign in/sign up
2. **Create first admin**: Update user role in database
3. **Test report submission**: Create account, submit AM/PM
4. **Test email alerts**: Leave report unsubmitted, send alert
5. **Verify cron job**: Check Vercel logs at scheduled times

## 🔄 Database Migrations

When schema changes:

```bash
# Local
npx prisma db push

# Production - Automatic via Vercel build
# Or manually:
DATABASE_URL="production-url" npx prisma db push
```

## 📊 Monitoring

### Vercel Dashboard

- **Analytics**: Page views, performance
- **Logs**: Runtime errors, cron execution
- **Deployments**: Build status, rollback

### Database Provider

- **Neon/Supabase**: Connection stats, query performance
- **Alerts**: Set up for high connection usage

### Email Provider (Resend)

- **Dashboard**: Delivery rates, bounces
- **Logs**: Failed sends, API errors

## 🔐 Security Checklist

- [ ] `CRON_SECRET` is strong (32+ characters)
- [ ] Database uses SSL connections
- [ ] Clerk production keys (not test keys)
- [ ] Environment variables not in git
- [ ] Resend API key scoped properly

## 🔄 Rollback Process

If deployment fails:

1. **Vercel Dashboard**: Deployments → Previous deployment → Promote to Production
2. **Database**: If schema changed, manually revert or restore backup
3. **Verify**: Test critical flows (auth, reporting)

## 📈 Scaling Considerations

### Database

- **Neon**: Auto-scales, monitor connection pooling
- **Supabase**: Upgrade plan if hitting limits
- **PlanetScale**: Enable branching for zero-downtime migrations

### Vercel

- **Function Duration**: Reports should be fast (<10s)
- **Edge Functions**: Not needed for this app
- **CDN**: Automatic for static assets

### Email

- **Resend Free**: 100 emails/day
- **Upgrade**: If sending >100 alerts/day

## 🚨 Emergency Procedures

### Database Down

1. Check provider status page
2. Verify `DATABASE_URL` is correct
3. Check SSL certificate validity
4. Contact support if needed

### Authentication Broken

1. Verify Clerk API keys
2. Check redirect URLs match deployment
3. Clear cookies and retry
4. Check Clerk dashboard status

### Emails Not Sending

1. Check Resend dashboard for errors
2. Verify API key is production key
3. Check domain verification
4. Test with Resend's test endpoint

## 📝 Deployment Log Template

```
Date: YYYY-MM-DD
Version: vX.X.X
Changes:
- Feature: Added X
- Fix: Resolved Y
- Update: Changed Z

Deployment Steps:
1. Merged PR #X
2. Ran migrations
3. Deployed to Vercel
4. Verified functionality

Rollback Plan:
- Revert to deployment abc123
- Database backup: backup-YYYY-MM-DD

Notes:
- No breaking changes
- Backward compatible
```

---

## 🎯 Production-Ready Checklist

Before going live:

### Code Quality
- [ ] No console.logs in production
- [ ] Error boundaries in place
- [ ] Loading states for async operations
- [ ] Proper error messages to users

### Performance
- [ ] Images optimized (if any)
- [ ] Database indexes verified
- [ ] Queries optimized (no N+1)

### Security
- [ ] CSRF protection (built-in Next.js)
- [ ] Rate limiting on cron endpoint
- [ ] Sensitive data not logged

### User Experience
- [ ] Mobile responsive
- [ ] Accessible (keyboard navigation)
- [ ] Clear error messages
- [ ] Success confirmations

### Documentation
- [ ] README complete
- [ ] SETUP_GUIDE accessible
- [ ] Admin onboarding doc
- [ ] Operator training doc

---

**Ready to deploy!** 🚀
