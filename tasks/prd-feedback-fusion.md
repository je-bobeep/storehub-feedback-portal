# Product Requirements Document: Feedback Fusion

## Introduction/Overview

Feedback Fusion is a full-stack application designed to revolutionize how teams handle user feedback. The system consists of a public-facing feedback submission and voting platform, an admin moderation panel, and an intelligent backend automation system powered by AI. The platform captures user feedback in a performant database, moderates it through an admin interface, and uses AI-powered analysis to automatically tag feedback and generate actionable insights that are exported to Google Sheets for product team analysis.

**Problem Statement**: Current feedback management is fragmented, requiring manual categorization and analysis, making it difficult to identify patterns and prioritize feature development based on user needs. Additionally, using spreadsheets as primary databases creates performance bottlenecks and poor user experience.

**Solution**: An integrated platform with a proper database backend that streamlines feedback collection and intelligent automation to transform raw feedback into strategic insights exported to Google Sheets for easy consumption by product teams. **Phase 1 focuses on core automation and AI-powered insights; admin interface will be added in future iterations.**

## Goals

1. **Streamline Feedback Collection**: Provide a simple, intuitive interface for users to submit feature requests and feedback with fast response times
2. **Enable Democratic Prioritization**: Allow users to upvote feedback without barriers, creating organic prioritization with real-time updates  
3. **Automate Intelligence Generation**: Use AI to automatically categorize feedback and generate actionable insights
4. **Deliver Strategic Value**: Transform scattered feedback into clustered themes with synthesized recommendations exported to Google Sheets for product team consumption
5. **Future: Efficient Moderation**: Admin tools for feedback management will be added in subsequent iterations

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

10. **Google Sheets Export Integration**
    - Must export feedback data to Google Sheets on configurable schedule (default: daily)
    - Must include all approved feedback with current vote counts and tags
    - Must maintain Google Sheets as read-only analysis destination
    - Must handle Google Sheets API rate limiting gracefully
    - Must provide manual export trigger for admins

11. **AI-Powered Tagging Workflow**
    - Must query database for untagged approved feedback
    - Must run on configurable schedule (default: every 15 minutes)
    - Must send title and description to configured LLM API
    - Must generate relevant tags array (e.g., ["UI/UX", "Bug", "Feature Request", "Performance"])
    - Must write generated tags back to database
    - Must export updated tags to Google Sheets on next scheduled export

12. **Insight Synthesis Workflow**
    - Must query database for all tagged feedback
    - Must run on configurable schedule (default: daily)
    - Must group feedback by AI-generated tags using database queries
    - Must generate one-sentence actionable insights for each major theme
    - Must write insights directly to Google Sheets "AI_Insights" tab
    - Must include sample feedback IDs for each insight

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
- **Automation**: n8n workflows
- **Deployment**: Vercel (frontend) + database hosting
- **AI Integration**: Configurable LLM API (OpenAI, Claude, etc.)
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
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  moderated_by VARCHAR(100),
  admin_notes TEXT,
  is_approved BOOLEAN DEFAULT FALSE
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

**Google Sheets Export Schema (Analysis Destination):**
**Sheet: "Feedback_Analysis"**
```
Columns:
- A: Export_Date (ISO timestamp)
- B: ID (from database)
- C: Title
- D: Description
- E: Status
- F: Votes
- G: Tags (JSON array as string)
- H: Created_Date
- I: Approved_Date
- J: Admin_Notes
```

**Sheet: "AI_Insights"**
```
Columns:
- A: Generated_Date (ISO timestamp)
- B: Theme/Tag (string)
- C: Item_Count (number)
- D: Insight_Summary (text)
- E: Priority_Score (number, 1-10)
- F: Sample_Feedback_IDs (comma-separated)
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
```

## n8n Workflow Setup Tasks (Product Owner Action Items)

### Prerequisite Setup
1. **Create n8n Account**: Sign up for n8n cloud or set up self-hosted instance
2. **Configure Database Access**:
   - Set up database connection credentials in n8n
   - Test database connectivity
3. **Configure Google Sheets Access**:
   - Create Google Cloud Project
   - Enable Google Sheets API
   - Create service account with Sheets access
   - Download service account JSON credentials
4. **Set up LLM API Access**: Obtain API key for chosen LLM provider

### Workflow 1: AI Tagging Automation
1. **Create New Workflow** named "Feedback-AI-Tagging"
2. **Add Schedule Trigger** (15 minutes interval)
3. **Add Database Query Node**:
   - Query for approved feedback where tags IS NULL
   - SELECT id, title, description FROM feedback WHERE is_approved = TRUE AND tags IS NULL
4. **Add HTTP Request Node (LLM API)** for each untagged item
5. **Add Database Update Node**:
   - UPDATE feedback SET tags = ? WHERE id = ?
6. **Test and Activate Workflow**

### Workflow 2: Data Export to Google Sheets
1. **Create New Workflow** named "Database-to-Sheets-Export"
2. **Add Schedule Trigger** (daily)
3. **Add Database Query Node**:
   - SELECT all approved feedback with current data
4. **Add Google Sheets Node (Clear and Write)**:
   - Clear existing data in "Feedback_Analysis" sheet
   - Write fresh export with current data
5. **Test and Activate Workflow**

### Workflow 3: Insight Synthesis
1. **Create New Workflow** named "Feedback-Insight-Synthesis"
2. **Add Schedule Trigger** (daily, after export)
3. **Add Database Query Node** (aggregate by tags)
4. **Add HTTP Request Node (LLM Synthesis)** for insights
5. **Add Google Sheets Node (Write to AI_Insights)**
6. **Test and Activate Workflow**

## Migration Strategy

### Phase 1: Database Setup
- Create new database schema
- Migrate existing Google Sheets data to database
- Update API routes to use database instead of Google Sheets
- Maintain Google Sheets fallback during transition

### Phase 2: Performance Optimization
- Remove Google Sheets dependencies from real-time operations
- Implement database indexing
- Add connection pooling if needed

### Phase 3: Export Integration
- Set up n8n workflows for Google Sheets export
- Configure automated insights generation
- Decommission direct Google Sheets integration from app

## Success Metrics

### Performance Metrics
- **API Response Time**: <200ms for 95% of requests
- **Page Load Time**: <1 second for feedback board
- **Real-time Updates**: Vote changes visible within 500ms

### Existing Metrics
- **Feedback Submission Rate**: Target 10+ submissions per week after 2 weeks of launch
- **Upvote Engagement**: Average 5+ votes per approved feedback item
- **Admin Moderation Time**: <24 hours from submission to approval/rejection
- **AI Tagging Accuracy**: >80% of generated tags considered relevant by admin review
- **Insight Generation**: Generate 3-5 actionable insights per week
- **System Reliability**: 99% uptime for both frontend and automation workflows

## Open Questions

1. **Database Choice**: Start with SQLite for simplicity or go directly to PostgreSQL for scalability?
2. **Data Migration**: How to cleanly migrate existing Google Sheets data to database?
3. **Export Frequency**: Should Google Sheets export be real-time, hourly, or daily?
4. **Backup Strategy**: How to backup database data reliably?
5. **Hosting**: Where to host the database (Vercel Postgres, Railway, self-hosted)?

---

**Document Version**: 2.0  
**Last Updated**: January 2025  
**Next Review Date**: After database migration completion 