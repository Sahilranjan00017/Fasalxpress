# Fix for Fasalxpress Vercel Deployment – API Not Working

## Summary
Your SPA (client) is loading correctly on https://fasal-xpress.vercel.app/, but the API (`/api/*`) endpoints are not responding. 

**Root cause:** Missing environment variables on Vercel.

## What Changed
1. ✅ Added env var validation to `/api/index.ts` — now logs warnings if critical vars are missing
2. ✅ Created `/VERCEL_ENV_SETUP.md` — detailed guide for setting up env vars on Vercel

## Action Required: Set Environment Variables on Vercel

### Step 1: Go to Vercel Dashboard
- Open https://vercel.com
- Select your project: **Fasalxpress** (or **fasal-xpress** depending on naming)
- Click **Settings** (top right)

### Step 2: Add Environment Variables
Go to **Settings** → **Environment Variables** and add these variables for **both Production and Preview**:

**Backend (Required):**
```
SUPABASE_URL = https://tdwpvljcpqkmushtausd.supabase.co
SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkd3B2bGpjcHFrbXVzaHRhdXNkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDE2NDI3MSwiZXhwIjoyMDc5NzQwMjcxfQ.tE7nNJ7HTpi7hVPs9G0awz1XlE0z3gbHq4R2AeKu89U
```

**Frontend (Required):**
```
VITE_SUPABASE_URL = https://tdwpvljcpqkmushtausd.supabase.co
VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRkd3B2bGpjcXFrbXVzaHRhdXNkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxNjQyNzEsImV4cCI6MjA3OTc0MDI3MX0.vRyj14hkVR1JdtUQ5PvGlipwrwBt_ojbemOqV4vTxbI
```

**Optional (if you use email):**
```
NODEMAILER_EMAIL = sahilranjan017@gmail.com
NODEMAILER_PASSWORD = onjpjhmxdomyeoal
NODEMAILER_FROM = noreply@agrobuild.com
```

### Step 3: Redeploy
After setting environment variables:
- Go to **Deployments**
- Click the three dots on the latest deployment
- Select **Redeploy**
- Wait for build to complete

## Verify API Works

Once redeployed, test the API by running these commands in a terminal or browser:

```bash
# Health check (should return HTTP 200)
curl -i https://fasal-xpress.vercel.app/api/health

# Ping (should return HTTP 200)
curl -i https://fasal-xpress.vercel.app/api/ping

# Database test (should return HTTP 200 with sample product ID)
curl -i https://fasal-xpress.vercel.app/api/db-test
```

All three should return **HTTP 200** with JSON responses like:
- Health: `{"status":"ok","time":"2025-12-12T06:30:00.000Z"}`
- Ping: `{"message":"ping pong"}`
- DB Test: `{"ok":true,"sample":{"id":"..."}}`

## If Still Not Working

1. **Check Vercel Logs:**
   - Go to Vercel dashboard → **Functions** or **Logs**
   - Look for errors from `api/index.ts` function
   - If you see "SUPABASE_URL is missing", go back to Step 2 and verify the value was saved

2. **Verify the values match:**
   - Open your local `.env` file
   - Compare the values in Vercel Settings with your `.env`
   - They must match exactly (no typos, no extra spaces)

3. **Make sure to select both Production AND Preview:**
   - When adding each environment variable in Vercel, check both **Production** and **Preview** boxes
   - Click **Save** after each variable

4. **Redeploy is required:**
   - Simply setting env vars doesn't update the deployed version
   - You must go to **Deployments** and **Redeploy** the latest commit
   - Wait for the build to complete (usually 2-3 minutes)

## File Changes Made

1. **`/api/index.ts`** — Added env var validation logging for debugging
2. **`/VERCEL_ENV_SETUP.md`** — Complete setup guide (reference document)

Both files have been committed and pushed. The only remaining step is for you to set the environment variables on the Vercel dashboard.

---

**Questions?** Check `/VERCEL_ENV_SETUP.md` in the repo for detailed troubleshooting and alternative setup methods.
