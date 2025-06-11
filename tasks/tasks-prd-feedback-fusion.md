## Relevant Files

- `feedback-fusion/app/page.tsx` - Main public feedback board displaying approved feedback items (CREATED - placeholder with project info)
- `feedback-fusion/app/layout.tsx` - Root layout component with metadata and global styles (CREATED)
- `feedback-fusion/app/globals.css` - Global CSS styles with Tailwind directives (CREATED)
- `feedback-fusion/package.json` - Project dependencies and scripts configuration (CREATED)
- `feedback-fusion/tsconfig.json` - TypeScript configuration for Next.js 14 (CREATED)
- `feedback-fusion/next.config.js` - Next.js configuration with App Router settings (CREATED)
- `feedback-fusion/tailwind.config.js` - Tailwind CSS configuration with custom colors and components (CREATED)
- `feedback-fusion/postcss.config.js` - PostCSS configuration for Tailwind CSS processing (CREATED)
- `app/submit/page.tsx` - Feedback submission form page
- `app/admin/page.tsx` - Admin dashboard with pending feedback count and top voted items
- `app/admin/login/page.tsx` - Admin authentication login form
- `app/admin/moderate/page.tsx` - Admin moderation panel for approving/rejecting feedback
- `app/api/feedback/route.ts` - API endpoints for retrieving and submitting feedback
- `app/api/admin/feedback/route.ts` - API endpoints for admin feedback operations
- `app/api/admin/auth/route.ts` - API endpoints for admin authentication
- `app/api/admin/dashboard/route.ts` - API endpoint for dashboard metrics
- `app/api/votes/route.ts` - API endpoint for handling upvote functionality
- `lib/google-sheets.ts` - Google Sheets integration utilities and API wrapper
- `lib/auth.ts` - Admin session management and authentication utilities
- `components/FeedbackCard.tsx` - Reusable component for displaying individual feedback items
- `components/StatusBadge.tsx` - Component for displaying status labels with consistent styling
- `components/SubmissionForm.tsx` - Feedback submission form component
- `components/AdminLayout.tsx` - Layout wrapper for admin pages with authentication checks
- `lib/types.ts` - TypeScript interfaces for Feedback, Status, and API responses
- `lib/constants.ts` - Application constants including status values and validation rules
- `middleware.ts` - Next.js middleware for admin route protection

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npm test` to run tests. Running without a path executes all tests found by the Jest configuration.
- Google Sheets API credentials will be stored in environment variables and configured separately.

## Tasks

- [x] 1.0 Project Setup and Foundation
  - [x] 1.1 Initialize Next.js 14 project with TypeScript and App Router
  - [x] 1.2 Install and configure Tailwind CSS for styling
  - [x] 1.3 Install shadcn/ui components library for consistent UI elements
  - [x] 1.4 Set up project structure with folders: app/, components/, lib/
  - [x] 1.5 Configure environment variables for Google Sheets API and admin credentials
  - [x] 1.6 Create TypeScript interfaces in `lib/types.ts` for Feedback, Status, and API responses
  - [x] 1.7 Define application constants in `lib/constants.ts` (status values, validation rules, rate limits)
  - [x] 1.8 Set up Jest testing framework and create initial test configuration
  - [x] 1.9 Configure Vercel deployment settings and environment variable mapping

- [x] 2.0 Public User Interface (Feedback Board and Submission)
  - [x] 2.1 Create main feedback board page at `app/page.tsx` with responsive layout
  - [x] 2.2 Build `components/FeedbackCard.tsx` to display individual feedback items (implemented as `FeedbackItem.tsx`)
  - [x] 2.3 Implement `components/StatusBadge.tsx` with color-coded status labels
  - [x] 2.4 Add upvote button functionality with optimistic UI updates (enhanced with one-vote-per-user limitation)
  - [x] 2.5 Create feedback submission form at `app/submit/page.tsx`
  - [x] 2.6 Build `components/SubmissionForm.tsx` with validation and error handling (integrated into submit page)
  - [x] 2.7 Implement character limits (Title: 100, Description: 1000) with live counters
  - [x] 2.8 Add loading states and success/error feedback for all user interactions
  - [x] 2.9 Implement responsive design that works on mobile and desktop
  - [x] 2.10 Create API route `/api/feedback/route.ts` for GET (approved) and POST (submit) operations (with Google Sheets integration + fallback)
  - [x] 2.11 Create API route `/api/votes/route.ts` for upvote functionality with rate limiting (enhanced with toggle voting and user tracking)
  - [x] 2.12 Add sorting functionality (highest votes first) and implement refresh mechanism (with auto-refresh every 10s + focus refresh)
  - [x] 2.13 Display AI-generated tags on feedback cards when available
  - [x] 2.14 Create unit tests for all public-facing components and API routes

- [✅] 3.0 Database Integration and Data Layer (REVISED - No longer Google Sheets primary)
  - [x] 3.1 Choose and set up database (SQLite for simplicity vs PostgreSQL for scale)
  - [x] 3.2 Create database schema with proper tables (feedback, users, admin_sessions)
  - [x] 3.3 Install database ORM/client (Prisma, Drizzle, or native SQLite)
  - [x] 3.4 Create `lib/database.ts` with connection utilities and query functions
  - [x] 3.5 Implement feedback CRUD operations with database
  - [x] 3.6 Implement user authentication and session management with database
  - [x] 3.7 Implement vote toggle functionality with database (one vote per user)
  - [x] 3.8 Add database indexing for performance (votes, status, created_at)
  - [x] 3.9 Migrate existing Google Sheets data to database
  - [x] 3.10 Update API routes to use database instead of Google Sheets
  - [x] 3.11 Add error handling and connection pooling for database operations
  - [x] 3.12 Create database migration scripts for schema updates

- [ ] 4.0 n8n Automation Hub (PRIORITY - Core Intelligence & Insights)
  - [✅] 4.1 **Backend API Endpoints for n8n Integration**
    - [x] 4.1.1 Create `/api/admin/analytics/export` - Return all feedback data for export
    - [x] 4.1.2 Create `/api/admin/analytics/untagged` - Return feedback items without AI tags
    - [x] 4.1.3 Create `/api/admin/analytics/insights` - Return summary statistics for AI analysis
    - [x] 4.1.4 Create `/api/admin/feedback/{id}/tags` PATCH - Update feedback with AI-generated tags
    - [x] 4.1.5 Create `/api/webhooks/feedback-notification` - Real-time feedback submission webhooks
    - [x] 4.1.6 Test all endpoints with sample data and verify response formats

  - [ ] 4.2 **n8n Environment Setup and Configuration**
    - [ ] 4.2.1 Create n8n Cloud account or set up self-hosted instance
    - [ ] 4.2.2 Configure HTTP Auth credential for Feedback Fusion API access
    - [ ] 4.2.3 Set up Google Sheets credential with service account JSON
    - [ ] 4.2.4 Configure LLM API credentials (OpenAI/Claude)
    - [ ] 4.2.5 Set up environment variables (API base URL, notification webhooks)
    - [ ] 4.2.6 Test all credential connections and API accessibility
    - [ ] 4.2.7 Create webhook endpoints for manual triggers and notifications

  - [ ] 4.3 **Daily Sheets Export Workflow** (Workflow Name: "daily-sheets-export")
    - [ ] 4.3.1 Add Schedule Trigger node (daily at 2:00 AM)
    - [ ] 4.3.2 Add HTTP Request node to GET /api/admin/analytics/export
    - [ ] 4.3.3 Add Function node to transform data for Google Sheets format
    - [ ] 4.3.4 Add Google Sheets node (Clear operation) for "Feedback_Analysis" sheet
    - [ ] 4.3.5 Add Google Sheets node (Append operation) with transformed data
    - [ ] 4.3.6 Add notification node (Slack/Email) for export completion status
    - [ ] 4.3.7 Add error handling nodes with retry logic (3 attempts)
    - [ ] 4.3.8 Test workflow with current database data and verify sheet output

  - [ ] 4.4 **AI Tagging Automation Workflow** (Workflow Name: "feedback-ai-tagging")
    - [ ] 4.4.1 Add Schedule Trigger node (every 15 minutes)
    - [ ] 4.4.2 Add HTTP Request node to GET /api/admin/analytics/untagged
    - [ ] 4.4.3 Add IF node to check if untagged feedback exists (length > 0)
    - [ ] 4.4.4 Add SplitInBatches node (batch size: 3) for API rate limiting
    - [ ] 4.4.5 Add HTTP Request node for LLM API calls (OpenAI/Claude)
    - [ ] 4.4.6 Add Function node to parse LLM response and extract tags
    - [ ] 4.4.7 Add HTTP Request node to PATCH /api/admin/feedback/{id}/tags
    - [ ] 4.4.8 Add logging and error handling with retry mechanisms
    - [ ] 4.4.9 Test workflow with untagged feedback items and verify tag updates

  - [ ] 4.5 **Weekly Insights Synthesis Workflow** (Workflow Name: "feedback-insights")
    - [ ] 4.5.1 Add Schedule Trigger node (Sundays at 6:00 AM)
    - [ ] 4.5.2 Add HTTP Request node to GET /api/admin/analytics/insights
    - [ ] 4.5.3 Add Function node to prepare data summary for LLM analysis
    - [ ] 4.5.4 Add HTTP Request node for LLM insight generation
    - [ ] 4.5.5 Add Function node to parse insights and format for Google Sheets
    - [ ] 4.5.6 Add Google Sheets node to append insights to "AI_Insights" tab
    - [ ] 4.5.7 Add email notification with executive summary to product team
    - [ ] 4.5.8 Add error handling and logging for insight generation failures
    - [ ] 4.5.9 Test workflow with sample analytics data and verify insight quality

  - [ ] 4.6 **Real-time Notification Workflows** (Workflow Name: "feedback-notifications")
    - [ ] 4.6.1 Add Webhook Trigger node for new feedback submissions
    - [ ] 4.6.2 Add Function node to validate webhook payload and extract data
    - [ ] 4.6.3 Add Switch node to route notifications based on feedback category
    - [ ] 4.6.4 Add Slack notification nodes for different team channels
    - [ ] 4.6.5 Add HTTP Request node to log notification delivery status
    - [ ] 4.6.6 Test webhook endpoints with sample payloads
    - [ ] 4.6.7 Verify notification delivery to correct channels

  - [ ] 4.7 **Monitoring, Error Handling & Performance**
    - [ ] 4.7.1 Add comprehensive error handling to all n8n workflows
    - [ ] 4.7.2 Set up retry logic with exponential backoff (3 attempts maximum)
    - [ ] 4.7.3 Configure workflow execution monitoring and alerting
    - [ ] 4.7.4 Add health check endpoints for each critical workflow
    - [ ] 4.7.5 Set up quota monitoring for LLM API usage and costs
    - [ ] 4.7.6 Create backup procedures for critical workflow failures
    - [ ] 4.7.7 Test disaster recovery scenarios and failover procedures
    - [ ] 4.7.8 Optimize workflow performance and reduce execution time

  - [ ] 4.8 **Testing, Documentation & Maintenance**
    - [ ] 4.8.1 Create comprehensive workflow documentation with screenshots
    - [ ] 4.8.2 Document all API endpoint specifications with example requests/responses
    - [ ] 4.8.3 Create troubleshooting guide for common n8n workflow issues
    - [ ] 4.8.4 Set up workflow version control and automated backups
    - [ ] 4.8.5 Create maintenance schedule and update procedures
    - [ ] 4.8.6 Document LLM prompt templates and optimization strategies
    - [ ] 4.8.7 Create user training guide for automation features
    - [ ] 4.8.8 Establish monitoring dashboard and performance benchmarks

## Future Iterations (Deferred Admin Features)

- [ ] **Admin Authentication and Dashboard** (Future Phase A)
  - [ ] A.1 Create admin login page at `app/admin/login/page.tsx` with password form
  - [ ] A.2 Implement `lib/auth.ts` for admin session management using database
  - [ ] A.3 Create API route `/api/admin/auth/route.ts` for login/logout functionality
  - [ ] A.4 Build `components/AdminLayout.tsx` wrapper with authentication checks
  - [ ] A.5 Create Next.js middleware in `middleware.ts` to protect admin routes
  - [ ] A.6 Build admin dashboard at `app/admin/page.tsx` with key metrics from database
  - [ ] A.7 Create API route `/api/admin/dashboard/route.ts` for dashboard data from database
  - [ ] A.8 Display pending feedback count and "Top 5 Most Voted Features" from database
  - [ ] A.9 Add logout functionality and session timeout handling
  - [ ] A.10 Implement proper error handling for authentication failures
  - [ ] A.11 Create unit tests for authentication system and admin components

- [ ] **Admin Moderation and Status Management** (Future Phase B)
  - [ ] B.1 Create moderation panel at `app/admin/moderate/page.tsx` for pending feedback from database
  - [ ] B.2 Build approval/rejection interface with "Approve", "Reject", and "Edit" buttons
  - [ ] B.3 Implement edit functionality allowing title and description changes before approval
  - [ ] B.4 Create API route `/api/admin/feedback/route.ts` for moderation operations on database
  - [ ] B.5 Add status dropdown for approved feedback (Under Review → In Progress → Completed)
  - [ ] B.6 Implement real-time status updates that reflect on public board via database
  - [ ] B.7 Add moderation timestamp and admin tracking for audit purposes in database
  - [ ] B.8 Create confirmation dialogs for destructive actions (reject feedback)
  - [ ] B.9 Implement bulk actions for efficient moderation workflow
  - [ ] B.10 Add admin notes functionality for internal feedback tracking in database
  - [ ] B.11 Create comprehensive unit tests for all admin moderation features

- [ ] **Admin Dashboard Integration for n8n** (Future Phase C - depends on Phase A)
  - [ ] C.1 Add "Export Now" button to admin dashboard
  - [ ] C.2 Create frontend function to call /api/webhooks/manual-export
  - [ ] C.3 Add loading states and success/error feedback for manual exports
  - [ ] C.4 Add "Generate Insights" manual trigger button
  - [ ] C.5 Display last export timestamp and status on dashboard
  - [ ] C.6 Add export history and logs viewing functionality
  - [ ] C.7 Test manual triggers from admin interface
  - [ ] C.8 Verify webhook delivery and n8n workflow execution

## Migration Priority (Immediate Action Items)

**🚨 Critical Path for Performance Fix:**

1. **Database Setup (Week 1)**
   - Choose database (recommend SQLite for simplicity)
   - Create schema and tables
   - Set up ORM/database client

2. **Data Migration (Week 1)**
   - Export current Google Sheets data
   - Import into new database
   - Verify data integrity

3. **API Route Updates (Week 1-2)**
   - Update `/api/feedback` to use database
   - Update `/api/votes` to use database
   - Test performance improvements

4. **Google Sheets Export Setup (Week 2)**
   - Create export functionality
   - Set up scheduled exports
   - Decommission real-time Google Sheets integration

**Performance Goals:**
- API response times <200ms
- No more intermittent page refreshes
- Real-time vote updates
- Smooth user experience 