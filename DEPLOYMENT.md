# Deployment Guide

This application is ready to deploy to Vercel or Netlify.

## Environment Variables

Before deploying, you need to set these environment variables in your hosting platform:

```
VITE_SUPABASE_URL=https://0ec90b57d6e95fcbda19832f.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw
```

## Deploy to Vercel

1. Install Vercel CLI (optional):
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   vercel
   ```

3. Or connect your GitHub repository to Vercel:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your repository
   - Add environment variables
   - Click "Deploy"

## Deploy to Netlify

1. Install Netlify CLI (optional):
   ```bash
   npm i -g netlify-cli
   ```

2. Deploy:
   ```bash
   netlify deploy --prod
   ```

3. Or connect your GitHub repository to Netlify:
   - Go to https://netlify.com
   - Click "Add new site"
   - Import your repository
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Add environment variables
   - Click "Deploy"

## Configuration Files

- `vercel.json` - Vercel configuration for SPA routing
- `netlify.toml` - Netlify configuration for SPA routing

Both files ensure that all routes are properly handled by your React Router application.
