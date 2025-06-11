# Phase 4.2: n8n Environment Setup Guide

## Overview
This guide covers setting up n8n for automating Feedback Fusion workflows. We'll use **n8n Cloud** for simplicity and reliability, but also provide self-hosted options.

## Option A: n8n Cloud (Recommended for Getting Started)

### 1. Create n8n Cloud Account
1. Go to [n8n.cloud](https://n8n.cloud)
2. Sign up for a free account (provides 5,000 executions/month)
3. Verify your email address
4. Access your n8n instance at `your-account.n8n.cloud`

### 2. Initial Setup
1. Complete the welcome wizard
2. Set up your admin user credentials
3. Note your instance URL (needed for API calls)

### 3. Configure Environment Variables
In n8n Cloud Settings → Environment:
```bash
# Feedback Fusion API Base URL
FEEDBACK_FUSION_API_URL=https://your-domain.vercel.app

# Database connection (if using custom database)
DATABASE_TYPE=sqlite
DATABASE_URL=your-database-connection

# LLM API credentials (choose one)
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key

# Google Sheets credentials
GOOGLE_SHEETS_PRIVATE_KEY=your-private-key
GOOGLE_SHEETS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GOOGLE_SHEETS_SPREADSHEET_ID=your-spreadsheet-id

# Notification settings (optional)
SLACK_WEBHOOK_URL=your-slack-webhook-url
DISCORD_WEBHOOK_URL=your-discord-webhook-url
```

## Option B: Self-Hosted n8n (Advanced Users)

### Docker Compose Setup
```yaml
# docker-compose.yml
version: '3.8'
services:
  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    container_name: n8n-feedback-fusion
    restart: unless-stopped
    ports:
      - "5678:5678"
    environment:
      - GENERIC_TIMEZONE=America/New_York
      - TZ=America/New_York
      - WEBHOOK_URL=https://your-domain.com
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-secure-password
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=n8n-password
      - N8N_ENCRYPTION_KEY=your-encryption-key
    volumes:
      - n8n_data:/home/node/.n8n
      - ./local-files:/files
    depends_on:
      - postgres

  postgres:
    image: postgres:13
    container_name: n8n-postgres
    restart: unless-stopped
    environment:
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=n8n-password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  n8n_data:
  postgres_data:
```

### Run with Docker Compose
```bash
# Create the setup
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs n8n
```

## Google Sheets API Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "Feedback Fusion Automation"
3. Enable Google Sheets API
4. Enable Google Drive API (for file access)

### 2. Create Service Account
1. Go to IAM & Admin → Service Accounts
2. Create service account: "n8n-feedback-fusion"
3. Download JSON credentials file
4. Extract these values for n8n:
   - `private_key` → `GOOGLE_SHEETS_PRIVATE_KEY`
   - `client_email` → `GOOGLE_SHEETS_CLIENT_EMAIL`

### 3. Create Google Sheets
1. Create new spreadsheet: "Feedback Fusion Analytics"
2. Create these sheets:
   - `Feedback_Analysis` (main export data)
   - `AI_Insights` (AI-generated insights)
   - `Export_Log` (automation tracking)
3. Share spreadsheet with service account email
4. Copy spreadsheet ID from URL → `GOOGLE_SHEETS_SPREADSHEET_ID`

## LLM API Setup

### Option 1: OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create API key
3. Add to n8n: `OPENAI_API_KEY`
4. Recommended model: `gpt-4o-mini` (cost-effective)

### Option 2: Anthropic Claude
1. Go to [Anthropic Console](https://console.anthropic.com)
2. Create API key
3. Add to n8n: `ANTHROPIC_API_KEY`
4. Recommended model: `claude-3-haiku-20240307`

## Testing n8n Setup

### 1. Create Test Workflow
1. In n8n, create new workflow: "Test Feedback Fusion Connection"
2. Add Manual Trigger node
3. Add HTTP Request node:
   - Method: GET
   - URL: `${FEEDBACK_FUSION_API_URL}/api/admin/analytics/export`
   - Authentication: None (for now)
4. Execute workflow to test API connection

### 2. Test Google Sheets Connection
1. Add Google Sheets node
2. Configure with your credentials
3. Test writing to "Export_Log" sheet
4. Verify data appears in spreadsheet

### 3. Test LLM Connection
1. Add OpenAI/Anthropic node
2. Test with simple prompt: "Say hello"
3. Verify response

## Security Configuration

### n8n Cloud Security
- Enable 2FA on your account
- Use strong passwords
- Regularly rotate API keys
- Monitor execution logs

### Self-Hosted Security
```yaml
# Additional security environment variables
- N8N_BASIC_AUTH_ACTIVE=true
- N8N_BASIC_AUTH_USER=admin
- N8N_BASIC_AUTH_PASSWORD=your-secure-password
- N8N_JWT_AUTH_ACTIVE=true
- N8N_JWT_AUTH_HEADER=authorization
- N8N_ENCRYPTION_KEY=your-32-character-encryption-key
```

### SSL/HTTPS Setup (Self-Hosted)
```nginx
# nginx.conf for reverse proxy
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:5678;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Monitoring & Maintenance

### Health Check Endpoints
- n8n Cloud: Built-in monitoring
- Self-hosted: `http://localhost:5678/healthz`

### Backup Strategy
```bash
# Backup n8n data (self-hosted)
docker exec n8n-feedback-fusion n8n export:workflow --all --output=/files/backup-$(date +%Y%m%d).json
docker exec n8n-feedback-fusion n8n export:credentials --all --output=/files/creds-backup-$(date +%Y%m%d).json

# Backup database
docker exec n8n-postgres pg_dump -U n8n n8n > backup-$(date +%Y%m%d).sql
```

### Log Monitoring
```bash
# View n8n logs
docker compose logs -f n8n

# Check execution history in n8n UI
# Navigate to Executions tab for debugging
```

## Next Steps

After completing this setup:
1. ✅ Mark Phase 4.2 as complete in tasks
2. ➡️ Move to Phase 4.3: Daily Sheets Export Workflow
3. 🔧 Begin building automation workflows

## Troubleshooting

### Common Issues
1. **API Connection Fails**: Check FEEDBACK_FUSION_API_URL and ensure your Vercel app is deployed
2. **Google Sheets Access Denied**: Verify service account has editor access to spreadsheet
3. **LLM API Errors**: Check API key validity and account credits
4. **Webhook Timeouts**: Increase timeout settings in n8n workflow nodes

### Getting Help
- n8n Community: [community.n8n.io](https://community.n8n.io)
- n8n Documentation: [docs.n8n.io](https://docs.n8n.io)
- Feedback Fusion Issues: Create GitHub issue in project repo 