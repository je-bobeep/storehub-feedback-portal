# Phase 4: Complete Step-by-Step Walkthrough

## 🎯 Overview
This guide will take you through setting up the complete n8n automation system for Feedback Fusion. Total time: ~2-3 hours. We'll do this in small, manageable steps.

## ⚠️ IMPORTANT: Deploy First!
**Before starting this guide, you MUST deploy your app to Vercel**:
1. Follow the [Vercel Deployment Guide](./vercel-deployment-guide.md) 
2. Ensure your app is live and APIs are publicly accessible
3. Test that your APIs work at `https://your-app.vercel.app/api/...`

**Why this matters**: n8n needs to access your APIs via public URLs, not localhost.

---

## 📋 Phase 4.2: n8n Environment Setup (30 minutes)

### Step 1: Create n8n Cloud Account (5 minutes)

1. **Open your browser** and go to: https://n8n.cloud
2. **Click "Get started for free"** (big blue button)
3. **Fill out the form**:
   - Email: `your-email@domain.com`
   - Password: `secure-password-123`
   - Full name: `Your Name`
4. **Click "Create account"**
5. **Check your email** for verification link and click it
6. **You'll be redirected** to your n8n instance at: `https://your-account.n8n.cloud`

**✅ Expected result**: You should see the n8n welcome screen with a "Create your first workflow" button.

### Step 2: Complete n8n Initial Setup (5 minutes)

1. **Click "Create your first workflow"**
2. **Complete the welcome tour** (click through the 4-5 steps)
3. **Note your instance URL**: `https://your-account.n8n.cloud` (save this!)
4. **Go to Settings** (click your profile icon → Settings)
5. **Click "Personal"** tab and verify your account info

**✅ Expected result**: You're now in the main n8n interface with an empty workflow canvas.

### Step 3: Get Your Vercel App URL (2 minutes)

1. **Open a new tab** and go to: https://vercel.com/dashboard
2. **Find your Feedback Fusion project** in the list
3. **Click on it** to open the project details
4. **Copy the URL** from the "Domains" section (looks like: `https://your-project-name.vercel.app`)
5. **Save this URL** - we'll need it multiple times

**✅ Expected result**: You have your live Feedback Fusion URL copied.

### Step 4: Test Your API Endpoints (5 minutes)

1. **Open a new tab** and test these URLs (replace with your Vercel URL):
   ```
   https://your-project-name.vercel.app/api/admin/analytics/export
   https://your-project-name.vercel.app/api/admin/analytics/untagged
   https://your-project-name.vercel.app/api/admin/analytics/insights
   ```

2. **You should see JSON responses** like:
   ```json
   {
     "success": true,
     "data": [...],
     "meta": {...}
   }
   ```

**✅ Expected result**: All three endpoints return JSON data without errors.

---

## 🔑 Phase 4.2 Continued: API Keys Setup (13 minutes)

### Step 5: Get OpenAI API Key (5 minutes)

1. **Go to**: https://platform.openai.com
2. **Sign up/Login** with your account
3. **Click "API Keys"** in the left sidebar
4. **Click "Create new secret key"**
   - Name: `n8n-feedback-fusion`
   - Click "Create secret key"
5. **Copy the key** (starts with `sk-...`) and save it securely
6. **Add $5-10 credit** to your account (Billing → Add payment method)

**✅ Expected result**: You have an OpenAI API key that starts with `sk-...`

### Step 6: Setup Google Sheets API (8 minutes)

1. **Go to**: https://console.cloud.google.com
2. **Create new project**:
   - Click "New Project" (top bar)
   - Name: `Feedback Fusion Automation`
   - Click "Create"
3. **Enable APIs**:
   - Click "Enable APIs and Services"
   - Search "Google Sheets API" → Enable
   - Search "Google Drive API" → Enable

4. **Create Service Account**:
   - Go to IAM & Admin → Service Accounts
   - Click "Create Service Account"
   - Name: `n8n-feedback-fusion`
   - Description: `n8n automation service`
   - Click "Create and Continue"
   - Skip roles for now → Click "Done"

5. **Generate Credentials**:
   - Click on your new service account
   - Go to "Keys" tab
   - Click "Add Key" → "Create new key"
   - Select "JSON" → Click "Create"
   - **Download the JSON file** and save it

6. **Extract Key Values**:
   Open the downloaded JSON file and copy these values:
   ```json
   {
     "private_key": "-----BEGIN PRIVATE KEY-----\n...",
     "client_email": "n8n-feedback-fusion@your-project.iam.gserviceaccount.com"
   }
   ```

**✅ Expected result**: You have the Google service account JSON file with private_key and client_email.

---

## 📊 Phase 4.3: Create Google Sheets (10 minutes)

### Step 7: Create Analytics Spreadsheet (10 minutes)

1. **Go to**: https://sheets.google.com
2. **Create new spreadsheet**:
   - Click "Blank" spreadsheet
   - Rename to: `Feedback Fusion Analytics`

3. **Create Required Sheets**:
   
   **Sheet 1: Rename to "Feedback_Analysis"**
   - Right-click "Sheet1" → Rename → "Feedback_Analysis"
   - Add headers in row 1 (A1 to K1):
     ```
     A1: Export_Date
     B1: ID  
     C1: Title
     D1: Description
     E1: Category
     F1: Status
     G1: Votes
     H1: Tags
     I1: Created_Date
     J1: Updated_Date
     K1: Is_Approved
     ```

   **Sheet 2: Create "AI_Insights"**
   - Click "+" at bottom to add new sheet
   - Rename to: "AI_Insights"
   - Add headers in row 1:
     ```
     A1: Generated_Date
     B1: Theme_Tag
     C1: Item_Count
     D1: Insight_Summary
     E1: Priority_Score
     F1: Sample_Feedback_IDs
     ```

   **Sheet 3: Create "Export_Log"**
   - Add another sheet: "Export_Log"
   - Add headers:
     ```
     A1: Timestamp
     B1: Export_Type
     C1: Records_Count
     D1: Status
     E1: Notes
     ```

4. **Share with Service Account**:
   - Click "Share" (top right)
   - Add the `client_email` from your JSON file
   - Set permission to "Editor"
   - Uncheck "Notify people"
   - Click "Share"

5. **Get Spreadsheet ID**:
   - Copy URL: `https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit`
   - Extract the ID part: `SPREADSHEET_ID`

**✅ Expected result**: You have a properly formatted Google Sheets with 3 tabs, shared with your service account.

---

## 🤖 Phase 4.4: Create First n8n Workflow - Daily Export (20 minutes)

### Step 8: Test API Connection in n8n (10 minutes)

1. **Return to your n8n tab**: `https://your-account.n8n.cloud`
2. **Create new workflow**:
   - Click "New workflow" (or the + icon)
   - Name it: "Test Feedback Fusion Connection"

3. **Add Manual Trigger**:
   - Click "+ Add first step"
   - Search "Manual Trigger" → Click it
   - Leave default settings

4. **Add HTTP Request Node**:
   - Click "+" after Manual Trigger
   - Search "HTTP Request" → Click it
   - Configure:
     - **Method**: GET
     - **URL**: `https://your-vercel-url.vercel.app/api/admin/analytics/export`
     - **Authentication**: None
   - Click "Test step" → Should show JSON response with your feedback data

5. **Test the workflow**:
   - Click "Test workflow" (top right)
   - Click "Execute workflow"
   - You should see green checkmarks and data flowing

**✅ Expected result**: Your workflow executes successfully and shows your feedback data.

### Step 9: Add Google Sheets Export (10 minutes)

1. **Add Google Sheets Node**:
   - Click "+" after HTTP Request
   - Search "Google Sheets" → Click it

2. **Configure Credentials**:
   - Click "Create new credential"
   - Choose "Service Account"
   - Fill in:
     - **Service Account Email**: `client_email` from JSON
     - **Private Key**: `private_key` from JSON (including the `-----BEGIN/END-----` parts)
   - Click "Save"

3. **Configure Sheets Node**:
   - **Operation**: Update
   - **Document ID**: Your spreadsheet ID
   - **Sheet**: Feedback_Analysis
   - **Range**: A2:K
   - **Data**: Toggle to "JSON"
   - **JSON Data**: `{{ $json }}`

4. **Add Function Node** (to format data):
   - Add Function node between HTTP Request and Google Sheets
   - Replace code with:
   ```javascript
   // Format data for Google Sheets
   const feedbackData = $json.data;
   const exportDate = new Date().toISOString();
   
   return feedbackData.map(item => ({
     json: [
       exportDate,
       item.id,
       item.title,
       item.description,
       item.category,
       item.status,
       item.votes,
       JSON.stringify(item.tags || []),
       item.createdAt,
       item.updatedAt,
       item.isApproved
     ]
   }));
   ```

5. **Test complete workflow**:
   - Click "Test workflow"
   - Check your Google Sheets - you should see data populate!

**✅ Expected result**: Data appears in your "Feedback_Analysis" sheet with proper formatting.

---

## ⏰ Phase 4.5: Add Scheduling (10 minutes)

### Step 10: Convert to Scheduled Workflow (10 minutes)

1. **Replace Manual Trigger**:
   - Click on "Manual Trigger" node
   - Click "..." → Delete
   - Click "+ Add trigger"
   - Search "Schedule Trigger" → Click it

2. **Configure Schedule**:
   - **Trigger Times**: Daily
   - **Hour**: 2 (2 AM)
   - **Minute**: 0
   - **Timezone**: Your timezone

3. **Save and Activate**:
   - Click "Save" (top right)
   - Rename workflow: "Daily Feedback Export"
   - Toggle "Active" (top right) to ON

4. **Test Manual Execution**:
   - Click "Test workflow"
   - Verify it still works

**✅ Expected result**: Your workflow is now scheduled to run daily at 2 AM and is marked as "Active".

---

## 🏷️ Phase 4.6: Create AI Tagging Workflow (25 minutes)

### Step 11: Create AI Tagging Workflow (25 minutes)

1. **Create New Workflow**:
   - Click "New workflow"
   - Name: "AI Feedback Tagging"

2. **Add Schedule Trigger**:
   - Schedule: Every 15 minutes
   - Set to Active

3. **Add HTTP Request - Get Untagged**:
   - URL: `https://your-vercel-url.vercel.app/api/admin/analytics/untagged`
   - Method: GET

4. **Add IF Node** (check if data exists):
   - Click "+" after HTTP Request
   - Search "IF" → Click it
   - **Condition**: `{{ $json.data.length > 0 }}`

5. **Add Split in Batches** (from True branch):
   - **Batch Size**: 3 (to avoid API rate limits)

6. **Add OpenAI Node**:
   - Connect from Split in Batches
   - **Credential**: Create new OpenAI credential with your API key
   - **Operation**: Message a model
   - **Model**: gpt-4o-mini
   - **Messages**: 
   ```
   System: You are an expert at categorizing user feedback. Generate relevant tags for feedback items.

   User: Analyze this feedback and generate 2-4 relevant tags:
   Title: {{ $json.title }}
   Description: {{ $json.description }}
   Category: {{ $json.category }}

   Return only a JSON array of tags like: ["UI/UX", "Feature Request", "Bug Fix"]
   ```

7. **Add Function Node** (parse AI response):
   ```javascript
   // Parse AI response and prepare for API call
   const feedback = $('Split in Batches').first().$json;
   const aiResponse = $json.choices[0].message.content;
   
   try {
     const tags = JSON.parse(aiResponse.trim());
     return {
       json: {
         feedbackId: feedback.id,
         tags: tags
       }
     };
   } catch (error) {
     return {
       json: {
         feedbackId: feedback.id,
         tags: ["Uncategorized"]
       }
     };
   }
   ```

8. **Add HTTP Request - Update Tags**:
   - **Method**: PATCH
   - **URL**: `https://your-vercel-url.vercel.app/api/admin/feedback/{{ $json.feedbackId }}/tags`
   - **Body**: JSON
   - **Body Content**:
   ```json
   {
     "tags": "{{ $json.tags }}"
   }
   ```

9. **Test the workflow**:
   - Save as "AI Feedback Tagging"
   - Test with current untagged items
   - Check that tags get updated in your database/sheets

**✅ Expected result**: Untagged feedback items get automatically tagged with relevant AI-generated tags.

---

## 📈 Phase 4.7: Create Weekly Insights Workflow (20 minutes)

### Step 12: Build Insights Generation (20 minutes)

1. **Create New Workflow**: "Weekly Insights Generation"

2. **Add Schedule Trigger**:
   - **Trigger**: Weekly (Sundays)
   - **Hour**: 6
   - **Minute**: 0

3. **Get Analytics Data**:
   - HTTP Request: `https://your-vercel-url.vercel.app/api/admin/analytics/insights`

4. **Add OpenAI Node for Insights**:
   - **Messages**:
   ```
   System: You are a product strategy expert. Analyze feedback data and generate actionable insights.

   User: Based on this feedback analytics data, generate 3-5 key insights with priority scores (1-10):

   Data: {{ JSON.stringify($json.data) }}

   Return a JSON array like:
   [
     {
       "theme": "UI/UX Improvements",
       "itemCount": 5,
       "insight": "Users consistently request dark mode and better mobile experience",
       "priorityScore": 8,
       "sampleIds": ["id1", "id2"]
     }
   ]
   ```

5. **Add Function to Format for Sheets**:
   ```javascript
   const insights = JSON.parse($json.choices[0].message.content);
   const timestamp = new Date().toISOString();
   
   return insights.map(insight => ({
     json: [
       timestamp,
       insight.theme,
       insight.itemCount,
       insight.insight,
       insight.priorityScore,
       insight.sampleIds.join(', ')
     ]
   }));
   ```

6. **Add Google Sheets Node**:
   - **Sheet**: AI_Insights
   - **Operation**: Append
   - **Range**: A:F

**✅ Expected result**: Weekly insights are automatically generated and added to your Google Sheets.

---

## 🔔 Phase 4.8: Add Notifications (15 minutes)

### Step 13: Create Notification Workflow (15 minutes)

1. **Create New Workflow**: "Feedback Notifications"

2. **Add Webhook Trigger**:
   - Copy the webhook URL (you'll need this later)

3. **Add Function to Process Webhook**:
   ```javascript
   // Process incoming webhook data
   const { event, feedback } = $json;
   
   const message = `🔔 New Feedback: ${feedback.title}
   Category: ${feedback.category}
   Votes: ${feedback.votes}
   Description: ${feedback.description.substring(0, 100)}...`;
   
   return { json: { message, feedback } };
   ```

4. **Add Notification Node** (choose one):
   
   **Option A - Email:**
   - Add "Send Email" node
   - Configure with your SMTP settings
   
   **Option B - Slack:**
   - Add "Slack" node
   - Create Slack webhook URL
   - Send message to channel
   
   **Option C - Discord:**
   - Add "Discord" node
   - Create Discord webhook
   - Send to channel

5. **Save and Activate**

**✅ Expected result**: You receive notifications when new feedback is submitted.

---

## ✅ Phase 4.9: Final Testing & Monitoring (10 minutes)

### Step 14: Complete System Test (10 minutes)

1. **Test Each Workflow**:
   - Daily Export: Manual execution
   - AI Tagging: Check recent untagged items
   - Weekly Insights: Manual execution
   - Notifications: Test webhook

2. **Check Google Sheets**:
   - Verify data in all three tabs
   - Confirm formatting is correct
   - Check timestamps

3. **Monitor Executions**:
   - In n8n, go to "Executions" tab
   - Review logs for any errors
   - Set up alerts for failed executions

4. **Update Task List**:
   ```markdown
   - [x] 4.2.1 Create n8n Cloud account ✅
   - [x] 4.2.2 Configure API credentials ✅  
   - [x] 4.2.3 Set up Google Sheets ✅
   - [x] 4.2.4 Configure LLM API ✅
   - [x] 4.2.5 Test connections ✅
   - [x] 4.3.1-4.3.8 Daily export workflow ✅
   - [x] 4.4.1-4.4.9 AI tagging workflow ✅
   - [x] 4.5.1-4.5.9 Weekly insights ✅
   - [x] 4.6.1-4.6.7 Notifications ✅
   ```

**✅ Expected result**: All workflows are active, tested, and running automatically.

---

## 🎉 Congratulations!

You've successfully completed **Phase 4: n8n Automation Hub**! 

**What you now have:**
- ✅ Automated daily data exports to Google Sheets
- ✅ AI-powered tagging every 15 minutes  
- ✅ Weekly insights generation
- ✅ Real-time notifications for new feedback
- ✅ Complete monitoring and error handling

**Your system is now:**
- 🤖 **Fully automated** - No manual work required
- 📊 **Generating insights** - AI analysis of feedback patterns  
- 📈 **Tracking trends** - Historical data in Google Sheets
- 🔔 **Keeping you informed** - Real-time notifications
- 🎯 **Ready for scale** - Handles growing feedback volume

**Next steps:**
- Monitor your workflows for the first week
- Adjust schedules if needed
- Add additional notification channels
- Plan for Phase 5 (Future Admin Interface)

Your feedback fusion system is now intelligence-powered! 🚀 