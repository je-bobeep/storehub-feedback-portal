# Environment Variables Configuration

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Google Sheets API Configuration
GOOGLE_SHEETS_PRIVATE_KEY="your_google_sheets_private_key_here"
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@project.iam.gserviceaccount.com"
GOOGLE_SHEETS_ID="your_google_sheets_spreadsheet_id"

# Admin Authentication
ADMIN_PASSWORD="your_secure_admin_password"
NEXTAUTH_SECRET="your_nextauth_secret_key"

# Application Configuration
NODE_ENV="development"

# Rate Limiting
RATE_LIMIT_WINDOW=3600000  # 1 hour in milliseconds
RATE_LIMIT_MAX_REQUESTS=100

# Optional: Analytics or Monitoring
NEXT_PUBLIC_GA_ID="your_google_analytics_id"
```

## Setup Instructions

1. **Google Sheets API**: 
   - Create a Google Cloud Project
   - Enable Google Sheets API
   - Create a service account and download the JSON credentials
   - Extract `private_key` and `client_email` from the JSON file

2. **Google Sheets ID**: 
   - Create a new Google Sheets document
   - Copy the ID from the URL (between `/d/` and `/edit`)

3. **Admin Password**: 
   - Choose a secure password for admin access

4. **NextAuth Secret**: 
   - Generate a random string for session encryption
   - You can use: `openssl rand -hex 32`

## Vercel Deployment

When deploying to Vercel, add these environment variables in the Vercel dashboard under Project Settings > Environment Variables. 