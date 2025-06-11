# Google Sheets Integration Setup Guide

## 🔧 Step 1: Google Cloud Project Setup

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create a new project** or select existing one
3. **Enable Google Sheets API**:
   - Go to APIs & Services > Library
   - Search for "Google Sheets API"
   - Click "Enable"

## 🔑 Step 2: Create Service Account

1. **Go to APIs & Services > Credentials**
2. **Click "Create Credentials" > "Service Account"**
3. **Fill in details**:
   - Service account name: `feedback-fusion-sheets`
   - Description: `Service account for feedback fusion Google Sheets integration`
4. **Click "Create and Continue"**
5. **Skip roles section** (click "Continue")
6. **Click "Done"**

## 📜 Step 3: Generate JSON Key

1. **Click on your newly created service account**
2. **Go to "Keys" tab**
3. **Click "Add Key" > "Create new key"**
4. **Select "JSON" format**
5. **Click "Create"** - this downloads the JSON file

## 📊 Step 4: Create Google Sheet

1. **Go to Google Sheets**: https://sheets.google.com/
2. **Create a new spreadsheet**
3. **Name it**: "Feature Requests - Feedback Fusion"
4. **Copy the Spreadsheet ID** from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID_HERE/edit
   ```

## 🔗 Step 5: Share Sheet with Service Account

1. **Click "Share" button** in your Google Sheet
2. **Add the service account email** (from the JSON file: `client_email`)
3. **Give it "Editor" permissions**
4. **Click "Send"**

## 🌍 Step 6: Set Environment Variables

Create a `.env.local` file in your project root with:

```env
# Google Sheets Integration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_from_step_4
GOOGLE_SHEETS_SHEET_NAME=Feedback
GOOGLE_SHEETS_CLIENT_EMAIL=your_service_account_email_from_json
GOOGLE_SHEETS_PRIVATE_KEY="your_private_key_from_json_with_newlines"

# Admin Authentication (for later phases)
ADMIN_PASSWORD=your_secure_admin_password_here
```

### 📝 Important Notes:

- **Private Key**: Copy the entire `private_key` value from JSON, including `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----`
- **Newlines**: Keep the `\n` characters in the private key
- **Quotes**: Wrap the private key in double quotes
- **Security**: Never commit `.env.local` to git (it's already in `.gitignore`)

## 🧪 Step 7: Test Connection

After setting up environment variables, you can test the connection by running the app and checking the console logs.

## ✅ You're Ready!

Once you've completed these steps, the Google Sheets integration will be ready to use! 