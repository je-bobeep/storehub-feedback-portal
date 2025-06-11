# Feedback Fusion

AI-powered feedback management platform with built-in automation for tagging and insights generation.

## Features

- 📝 Public feedback submission and voting
- 🤖 AI-powered automatic tagging using Gemini AI
- 📊 Automated insight generation and analysis
- 📋 Google Sheets export for product team analysis
- 🔧 Admin interface for automation monitoring

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Database (SQLite for development)
DATABASE_URL="file:./dev.db"

# Google Sheets Integration
GOOGLE_SHEETS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----"
GOOGLE_SHEETS_CLIENT_EMAIL="your-service-account@your-project.iam.gserviceaccount.com"
GOOGLE_SHEETS_SHEET_ID="your-google-sheet-id"
GOOGLE_SHEETS_FEEDBACK_TAB="Feedback_Analysis"
GOOGLE_SHEETS_INSIGHTS_TAB="AI_Insights"

# Gemini AI Integration
GEMINI_API_KEY="your_gemini_api_key_here"

# Admin Authentication
ADMIN_PASSWORD="your_secure_admin_password"

# Cron Job Security
CRON_SECRET="your_random_secret_for_cron_protection"

# Application URLs
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Get Gemini AI API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to your `.env.local` file as `GEMINI_API_KEY`

### 3. Database Setup

```bash
# Push the schema to your database
npx prisma db push

# Generate Prisma client
npx prisma generate

# Run migration script (optional, for existing data)
npm run migrate-ai
```

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

## AI Automation

The system includes built-in AI automation that runs on schedule:

- **AI Tagging**: Every 15 minutes, processes untagged feedback
- **Insight Generation**: Daily, analyzes feedback themes and generates insights
- **Google Sheets Export**: Daily, exports all data to Google Sheets

### Manual Triggers

Access the admin interface at `/admin/automation` to manually trigger automation tasks.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm test` - Run tests
- `npm run migrate-ai` - Run AI automation migration

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Database**: SQLite with Prisma ORM (PostgreSQL for production)
- **AI**: Google Gemini AI API
- **Automation**: Vercel Cron Functions
- **Export**: Google Sheets API

## Deployment

The application is designed to deploy on Vercel with automatic cron job scheduling for AI automation.

