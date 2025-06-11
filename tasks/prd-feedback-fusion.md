# Product Requirements Document: Feedback Fusion

## Introduction/Overview

Feedback Fusion is a full-stack application designed to revolutionize how teams handle user feedback. The system consists of a public-facing feedback submission and voting platform, an admin moderation panel, and an intelligent backend automation system powered by AI. The platform captures user feedback in a performant database, moderates it through an admin interface, and uses AI-powered analysis to automatically tag feedback and generate actionable insights that are exported to Google Sheets for product team analysis.

**Problem Statement**: Current feedback management is fragmented, requiring manual categorization and analysis, making it difficult to identify patterns and prioritize feature development based on user needs. Additionally, using spreadsheets as primary databases creates performance bottlenecks and poor user experience.

**Solution**: An integrated platform with a proper database backend that streamlines feedback collection and **built-in intelligent automation** to transform raw feedback into strategic insights exported to Google Sheets for easy consumption by product teams. **All AI processing and automation is handled directly within the application - no external workflow tools required.**

## Goals

1. **Streamline Feedback Collection**: Provide a simple, intuitive interface for users to submit feature requests and feedback with fast response times
2. **Enable Democratic Prioritization**: Allow users to upvote feedback without barriers, creating organic prioritization with real-time updates  
3. **Automate Intelligence Generation**: Use built-in AI to automatically categorize feedback and generate actionable insights
4. **Deliver Strategic Value**: Transform scattered feedback into clustered themes with synthesized recommendations exported to Google Sheets for product team consumption
5. **Maintain System Simplicity**: All automation runs within the application itself - no external dependencies or complex configurations
6. **Future: Efficient Moderation**: Admin tools for feedback management will be added in subsequent iterations

## User Stories

### End Users
- **As a product user**, I want to easily submit feedback with a title and description so that I can communicate feature requests and issues
- **As a product user**, I want to view all approved feedback so that I can see what others are requesting
- **As a product user**, I want to upvote feedback that I agree with so that popular requests get prioritized
- **As a product user**, I want to see the status of feedback (Planned, In Progress, etc.) so that I know what's being worked on

### Admin Users (Future Iterations)
- **As a product manager**, I want to review new feedback submissions so that I can approve quality content and reject spam *(deferred)*
- **As a product manager**, I want to edit feedback titles and descriptions so that I can improve clarity before approval *(deferred)*
- **As a product manager**, I want to change the status of approved feedback so that users know our development progress *(deferred)*
- **As a product manager**, I want to see analytics on pending feedback and top-voted items so that I can prioritize development *(deferred)*

### System Intelligence
- **As a product owner**, I want the system to automatically tag feedback with relevant categories so that patterns emerge without manual work
- **As a product owner**, I want the system to generate insights by clustering similar feedback so that I understand major themes and priorities
- **As a product owner**, I want all AI processing to happen automatically within the application so that I don't need to manage external tools
- **As an admin**, I want to manually trigger AI analysis and exports when needed so that I have control over the timing

## Functional Requirements

### User-Facing Features
1. **Feedback Submission Form**
   - Must provide input fields for Title (required, max 100 characters) and Description (required, max 1000 characters)
   - Must submit data to Next.js API route which stores in Google Sheets
   - Must show success/error feedback to user
   - Must reset form after successful submission

2. **Public Feedback Board**
   - Must display all approved feedback items in a card-based layout
   - Must show Title, Description (truncated if long), Upvote Count, Status Label, and AI-generated Tags for each item
   - Must implement responsive design that works on mobile and desktop
   - Must sort feedback by upvote count (highest first) by default
   - Must update in real-time or provide refresh mechanism

3. **Upvoting System**
   - Must provide upvote button on each feedback card
   - Must increment vote count immediately (optimistic UI)
   - Must persist vote count to Google Sheets via API
   - Must prevent spam by implementing basic rate limiting (1 vote per item per IP per hour)
   - Must not require user authentication

4. **Status Labels**
   - Must display clear visual status badges with predefined values: "Submitted", "In Progress", "Completed"
   - Must use consistent color coding (e.g., blue for Submitted, orange for In Progress, green for Completed)

### Admin Features (Deferred to Future Iterations)
5. **Admin Authentication** *(Future Phase A)*
   - Must implement simple password-based login form
   - Must store admin session securely
   - Must redirect unauthorized users away from admin pages
   - Must provide logout functionality

6. **Feedback Moderation Panel** *(Future Phase B)*
   - Must display all pending (unmoderated) feedback submissions
   - Must provide "Approve", "Reject", and "Edit" actions for each submission
   - Must allow editing of title and description before approval
   - Must set initial status to "Submitted" upon approval
   - Must permanently delete rejected submissions
   - Must show moderation timestamp and admin who performed action

7. **Status Management** *(Future Phase B)*
   - Must provide dropdown menu to change status for any approved feedback
   - Must immediately reflect status changes on public board
   - Must log status change history with timestamps

8. **Admin Dashboard** *(Future Phase A)*
   - Must display count of pending feedback items
   - Must show "Top 5 Most Voted Features" with vote counts
   - Must update metrics in real-time or provide refresh mechanism

### Backend Features (Current Priority)
9. **Database Integration**
   - Must use SQLite for development and simple deployments, with PostgreSQL option for scale
   - Must provide fast API responses (<200ms for typical operations)
   - Must handle concurrent users without performance degradation
   - Must implement proper database indexing for vote counts and status queries
   - Must provide database migration scripts for schema updates

10. **Built-in AI Automation System**
    - Must integrate Gemini AI API directly into the application codebase
    - Must automatically tag untagged approved feedback on configurable schedule (default: every 15 minutes)
    - Must send title and description to Gemini API for tag generation
    - Must generate relevant tags array (e.g., ["UI/UX", "Bug", "Feature Request", "Performance"])
    - Must write generated tags back to database immediately
    - Must handle API rate limiting and errors gracefully with retry logic

11. **Built-in Insight Generation System**
    - Must analyze all tagged feedback and generate insights on configurable schedule (default: daily)
    - Must group feedback by AI-generated tags using database queries
    - Must use Gemini AI to generate one-sentence actionable insights for each major theme
    - Must calculate priority scores based on vote counts and frequency
    - Must store insights in database with timestamps and sample feedback references

12. **Google Sheets Export Integration**
    - Must export feedback data to Google Sheets on configurable schedule (default: daily)
    - Must include all approved feedback with current vote counts and tags
    - Must export generated insights to separate "AI_Insights" tab
    - Must maintain Google Sheets as read-only analysis destination
    - Must handle Google Sheets API rate limiting gracefully
    - Must provide manual export trigger for admins via admin interface

13. **Admin Automation Controls**
    - Must provide admin interface to view automation status and logs
    - Must allow manual triggering of AI tagging, insight generation, and exports
    - Must display last run timestamps and success/failure status
    - Must provide configuration options for automation schedules
    - Must show AI processing queue and progress indicators

## Non-Goals (Out of Scope)

### Phase 1 (Current)
- Admin authentication and authorization (deferred to future iteration)
- Admin moderation interface (deferred to future iteration)
- Manual feedback approval/rejection workflows (deferred to future iteration)
- User authentication/accounts for end users
- Real-time notifications or email alerts (except via n8n workflows)
- Advanced analytics or reporting dashboards
- Mobile app development
- Integration with external project management tools
- Multi-language support
- Advanced user roles beyond admin/user
- Feedback voting restrictions beyond basic rate limiting
- Custom feedback categories (relying on AI-generated tags instead)

### Overall Project
- Real-time chat or messaging features
- Complex user permission systems
- Multi-tenant or white-label solutions

## Design Considerations

- **Design System**: Implement clean, modern light-mode design inspired by feedback.featurebase.app
- **Component Library**: Use shadcn/ui or similar for consistent UI components
- **Responsive Design**: Mobile-first approach ensuring usability across devices
- **Accessibility**: Follow WCAG guidelines for form inputs, color contrast, and keyboard navigation
- **Loading States**: Implement proper loading indicators for all async operations
- **Error Handling**: User-friendly error messages with actionable next steps

## Technical Considerations

### Tech Stack
- **Frontend**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (development/simple deployment) or PostgreSQL (production scale)
- **AI Integration**: Google Gemini AI API (built-in automation)
- **Background Tasks**: Vercel Cron Functions or internal task queue
- **Deployment**: Vercel (frontend + serverless functions) + database hosting
- **Data Export**: Google Sheets (for product team analysis)

### Database Schema
**Primary Database Tables:**

**Table: feedback**
```sql
CREATE TABLE feedback (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'Under Review',
  votes INTEGER DEFAULT 0,
  voted_by TEXT, -- JSON array of user emails
  tags TEXT, -- JSON array of AI-generated tags
  ai_tagged_at TIMESTAMP, -- When AI tagging was completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  moderated_by VARCHAR(100),
  admin_notes TEXT,
  is_approved BOOLEAN DEFAULT FALSE
);
```

**Table: ai_insights**
```sql
CREATE TABLE ai_insights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  theme VARCHAR(100) NOT NULL,
  insight_summary TEXT NOT NULL,
  priority_score INTEGER DEFAULT 1,
  feedback_count INTEGER DEFAULT 0,
  sample_feedback_ids TEXT, -- JSON array of feedback IDs
  generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  exported_at TIMESTAMP
);
```

**Table: automation_logs**
```sql
CREATE TABLE automation_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_type VARCHAR(50) NOT NULL, -- 'ai_tagging', 'insight_generation', 'sheets_export'
  status VARCHAR(20) NOT NULL, -- 'running', 'completed', 'failed'
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  items_processed INTEGER DEFAULT 0,
  error_message TEXT,
  triggered_by VARCHAR(50) DEFAULT 'auto' -- 'auto', 'manual', 'admin_user'
);
```

**Table: users**
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Table: admin_sessions**
```sql
CREATE TABLE admin_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### API Routes Structure
```
/api/feedback
  - GET: Retrieve approved feedback from database
  - POST: Submit new feedback to database

/api/admin/feedback
  - GET: Retrieve pending feedback from database
  - PUT: Approve/reject/edit feedback in database
  - PATCH: Update feedback status in database

/api/admin/auth
  - POST: Admin login (database session)
  - DELETE: Admin logout

/api/admin/dashboard
  - GET: Retrieve dashboard metrics from database

/api/votes
  - POST: Increment/toggle vote count in database

/api/admin/automation
  - GET: Retrieve automation status and logs
  - POST: Manually trigger AI tasks (tagging, insights, export)

/api/cron/ai-tagging
  - POST: Scheduled AI tagging endpoint (Vercel Cron)

/api/cron/generate-insights
  - POST: Scheduled insight generation endpoint (Vercel Cron)

/api/cron/export-sheets
  - POST: Scheduled Google Sheets export endpoint (Vercel Cron)
```

## Built-in Automation Implementation

### AI Tagging Process
1. **Scheduled Trigger**: Vercel Cron runs every 15 minutes
2. **Database Query**: Find approved feedback where `ai_tagged_at IS NULL`
3. **Gemini AI Call**: Send title + description for tag generation
4. **Tag Processing**: Parse response and validate tags
5. **Database Update**: Store tags and timestamp
6. **Logging**: Record processing results in automation_logs

### Insight Generation Process
1. **Scheduled Trigger**: Vercel Cron runs daily
2. **Data Aggregation**: Group feedback by tags, calculate vote totals
3. **Gemini AI Analysis**: Send aggregated data for insight generation
4. **Insight Processing**: Parse insights and priority scores
5. **Database Storage**: Store insights in ai_insights table
6. **Logging**: Record generation results

### Google Sheets Export Process
1. **Scheduled Trigger**: Vercel Cron runs daily (after insights)
2. **Data Collection**: Gather all approved feedback and insights
3. **Sheets Update**: Clear and populate both data tabs
4. **Timestamp Update**: Mark export completion
5. **Logging**: Record export results

### Admin Controls
- **Automation Dashboard**: View all task statuses and logs
- **Manual Triggers**: Force-run any automation task
- **Schedule Configuration**: Adjust timing of automated tasks
- **Error Monitoring**: View and resolve automation failures

## Environment Variables Required

```
# Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Google Sheets
GOOGLE_SHEETS_PRIVATE_KEY=your_service_account_private_key
GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email
GOOGLE_SHEETS_SHEET_ID=your_google_sheet_id

# Database
DATABASE_URL=your_database_connection_string

# Admin
ADMIN_PASSWORD=your_admin_password

# Application
NEXT_PUBLIC_APP_URL=your_app_url
CRON_SECRET=your_cron_protection_secret
```

## Success Metrics

### Performance Metrics
- **API Response Time**: <200ms for 95% of requests
- **Page Load Time**: <1 second for feedback board
- **Real-time Updates**: Vote changes visible within 500ms
- **AI Processing Time**: <30 seconds for tag generation per feedback item
- **Automation Reliability**: 99% success rate for scheduled tasks

### Existing Metrics
- **Feedback Submission Rate**: Target 10+ submissions per week after 2 weeks of launch
- **Upvote Engagement**: Average 5+ votes per approved feedback item
- **Admin Moderation Time**: <24 hours from submission to approval/rejection
- **AI Tagging Accuracy**: >80% of generated tags considered relevant by admin review
- **Insight Generation**: Generate 3-5 actionable insights per week
- **System Reliability**: 99% uptime for both frontend and automation systems

## Migration Strategy

### Phase 1: Database Setup (Week 1)
- Create new database schema with automation tables
- Migrate existing Google Sheets data to database
- Update API routes to use database instead of Google Sheets

### Phase 2: Built-in AI System (Week 1-2)
- Integrate Gemini AI API directly into codebase
- Build AI tagging system with internal scheduling
- Create insight generation system
- Add Google Sheets export functionality

### Phase 3: Admin Interface (Week 2)
- Build automation dashboard and controls
- Add manual trigger functionality
- Implement monitoring and logging interfaces

### Phase 4: Testing & Optimization (Week 2-3)
- Test all automation systems thoroughly
- Optimize AI processing performance
- Fine-tune prompts and error handling

## Open Questions

1. **Scheduling Method**: Use Vercel Cron Functions or internal task queue for automation?
2. **AI Rate Limiting**: How to handle Gemini API quotas and rate limits efficiently?
3. **Error Recovery**: Best strategy for handling failed AI processing jobs?
4. **Admin Notifications**: Should admins be notified of automation failures?
5. **Data Backup**: How to backup both database and AI processing state?

---

**Document Version**: 3.0 - Built-in AI Architecture  
**Last Updated**: January 2025  
**Next Review Date**: After built-in automation implementation 