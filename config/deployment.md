# Deployment Configuration

## Vercel Deployment

This project is configured for deployment on Vercel with the following settings:

### Automatic Deployment Setup

1. **Connect Repository**: Connect your GitHub repository to Vercel
2. **Framework Detection**: Vercel will automatically detect this as a Next.js project
3. **Build Configuration**: Uses the settings from `vercel.json`

### Environment Variables

Set the following environment variables in the Vercel dashboard:

| Variable | Description | Example |
|----------|-------------|---------|
| `GOOGLE_SHEETS_PRIVATE_KEY` | Private key from Google Service Account JSON | `-----BEGIN PRIVATE KEY-----\n...` |
| `GOOGLE_SHEETS_CLIENT_EMAIL` | Service account email | `your-service@project.iam.gserviceaccount.com` |
| `GOOGLE_SHEETS_ID` | Google Sheets document ID | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms` |
| `ADMIN_PASSWORD` | Secure password for admin access | `your-secure-password` |
| `NEXTAUTH_SECRET` | Random string for session encryption | `generated-secret-key` |

### Build Settings

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node.js Version**: 18.x (recommended)

### Domain Configuration

1. **Custom Domain**: Configure your custom domain in Vercel dashboard
2. **HTTPS**: Automatically enabled by Vercel
3. **Redirects**: Configure any necessary redirects in `vercel.json`

### Performance Optimization

- **Edge Functions**: API routes are configured for optimal performance
- **Static Generation**: Pages are statically generated where possible
- **Image Optimization**: Next.js image optimization is enabled
- **Caching**: Appropriate cache headers are set for static assets

### Monitoring

- **Analytics**: Enable Vercel Analytics for performance monitoring
- **Logs**: Access deployment and function logs through Vercel dashboard
- **Error Tracking**: Consider integrating Sentry for error monitoring

## Manual Deployment

For manual deployment or custom hosting:

```bash
# Build the project
npm run build

# Start production server (if self-hosting)
npm start

# Or deploy the .next folder to your hosting provider
```

## Environment Setup Script

Generate a NextAuth secret:
```bash
openssl rand -hex 32
```

## Security Considerations

- Ensure all environment variables are properly set
- Use strong passwords for admin access
- Enable HTTPS in production
- Regularly rotate API keys and secrets
- Monitor for unauthorized access attempts 