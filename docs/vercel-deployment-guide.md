# Vercel Deployment Guide

This guide walks you through deploying your Feedback Fusion application to Vercel for use with n8n automation workflows.

## Prerequisites

- Vercel account (free tier is sufficient)
- Vercel CLI installed: `npm install -g vercel`

## Step 1: Set Up PostgreSQL Database

### Option A: Vercel Postgres (Recommended)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Storage" tab
3. Click "Create Database" > "Postgres"
4. Name your database: `feedback-fusion-db`
5. Select your region (same as your app region)
6. Click "Create"
7. Copy the `POSTGRES_URL` connection string

### Option B: Railway PostgreSQL (Alternative)
1. Go to [Railway.app](https://railway.app/)
2. Create new project
3. Add PostgreSQL service
4. Copy the connection string from Variables tab

## Step 2: Configure Environment Variables

You need to set up these environment variables in Vercel:

```bash
# Database
DATABASE_URL=your-postgresql-connection-string

# Authentication (generate random strings)
ADMIN_PASSWORD=your-secure-admin-password
NEXTAUTH_SECRET=your-nextauth-secret-key

# Google Sheets (for n8n integration - get from Google Cloud Console)
GOOGLE_SHEETS_PRIVATE_KEY=your-google-private-key
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account-email
GOOGLE_SHEETS_ID=your-spreadsheet-id

# Environment
NODE_ENV=production
```

### Setting Environment Variables in Vercel:

**Method 1: Via Vercel CLI**
```bash
vercel env add DATABASE_URL
vercel env add ADMIN_PASSWORD  
vercel env add NEXTAUTH_SECRET
vercel env add GOOGLE_SHEETS_PRIVATE_KEY
vercel env add GOOGLE_SHEETS_CLIENT_EMAIL
vercel env add GOOGLE_SHEETS_ID
```

**Method 2: Via Vercel Dashboard**
1. Go to your project settings
2. Click "Environment Variables"
3. Add each variable with values

## Step 3: Deploy to Vercel

```bash
# Login to Vercel (if not already logged in)
vercel login

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? (select your account)
# - Link to existing project? N
# - Project name: feedback-fusion
# - Directory: ./
# - Override settings? N
```

## Step 4: Set Up Database Schema

After successful deployment, set up your database:

```bash
# Run database migrations on production
vercel env pull .env.production
npx prisma db push --accept-data-loss
```

## Step 5: Seed Database (Optional)

```bash
# Call the seed endpoint
curl -X POST https://your-vercel-app.vercel.app/api/admin/seed-database
```

## Step 6: Test Your Deployment

Test these API endpoints:

```bash
# Get feedback data
curl https://your-vercel-app.vercel.app/api/admin/analytics/export

# Get insights for n8n
curl https://your-vercel-app.vercel.app/api/admin/analytics/insights

# Test webhook endpoint
curl -X POST https://your-vercel-app.vercel.app/api/webhooks/feedback-notification \
  -H "Content-Type: application/json" \
  -d '{"test": true}'
```

## Step 7: Update n8n Configuration

Once deployed, update your n8n workflows with your production URLs:

```
Base URL: https://your-vercel-app.vercel.app
Export API: https://your-vercel-app.vercel.app/api/admin/analytics/export
Insights API: https://your-vercel-app.vercel.app/api/admin/analytics/insights
Webhook URL: https://your-vercel-app.vercel.app/api/webhooks/feedback-notification
```

## Environment Variable Examples

### Generating Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Generate ADMIN_PASSWORD
openssl rand -base64 16
```

### Google Sheets Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google Sheets API
4. Create Service Account
5. Download credentials JSON
6. Extract `private_key` and `client_email`
7. Share your Google Sheet with the service account email

## Troubleshooting

### Common Issues:

1. **Build Fails**: Check that all environment variables are set
2. **Database Connection**: Verify DATABASE_URL format
3. **API 500 Errors**: Check Vercel function logs
4. **Prisma Issues**: Run `npx prisma generate` locally first

### Checking Logs:
```bash
vercel logs
```

### Force Redeploy:
```bash
vercel --force
```

## Next Steps

After successful deployment:

1. ✅ Your app is live and APIs are accessible
2. ✅ Database is set up and persistent
3. ✅ Ready for n8n automation workflows
4. 📋 Follow the [Phase 4 Detailed Walkthrough](./phase-4-detailed-walkthrough.md) to set up n8n

## Security Notes

- Never commit environment variables to Git
- Use strong passwords for admin access
- Regularly rotate API keys and secrets
- Monitor Vercel usage and logs for suspicious activity 