# Vercel Environment Variables Setup

## Required Environment Variables

Your serverless API (`/api/*`) requires the following environment variables to be set in Vercel for **Production** and **Preview** deployments.

### Backend (Server-side) — REQUIRED

These are critical for the API to function:

| Variable | Value | Source | Environment |
|----------|-------|--------|-------------|
| `SUPABASE_URL` | `https://tdwpvljcpqkmushtausd.supabase.co` | `.env` `SUPABASE_URL` | Production, Preview |
| `SUPABASE_SERVICE_ROLE_KEY` | (from `.env`) | `.env` `SUPABASE_SERVICE_ROLE_KEY` | Production, Preview |

### Frontend (Client-side) — REQUIRED

These are public and used by the React app:

| Variable | Value | Source | Environment |
|----------|-------|--------|-------------|
| `VITE_SUPABASE_URL` | `https://tdwpvljcpqkmushtausd.supabase.co` | `.env` `VITE_SUPABASE_URL` | Production, Preview |
| `VITE_SUPABASE_ANON_KEY` | (from `.env`) | `.env` `VITE_SUPABASE_ANON_KEY` | Production, Preview |

### Optional (for Email & Other Features)

| Variable | Value | Environment |
|----------|-------|-------------|
| `NODEMAILER_EMAIL` | `sahilranjan017@gmail.com` | Production, Preview |
| `NODEMAILER_PASSWORD` | (app password from `.env`) | Production, Preview |
| `NODEMAILER_FROM` | `noreply@agrobuild.com` | Production, Preview |
| `PING_MESSAGE` | `ping pong` | Production, Preview |
| `VITE_PUBLIC_BUILDER_KEY` | `d541bd9b11024863969ca057f8edcdfb` | Production, Preview |

## How to Set Environment Variables on Vercel

### Option 1: Vercel Dashboard (Recommended)

1. Go to your project on **Vercel** → **Settings** → **Environment Variables**
2. For each variable above:
   - Enter the **Variable Name** (e.g., `SUPABASE_URL`)
   - Enter the **Value** (copy from your local `.env`)
   - Select **Production** and **Preview** checkboxes
   - Click **Save**
3. Once all variables are set, **redeploy** your project:
   - Go to **Deployments** → **Redeploy** (use latest commit) OR
   - Push a commit to trigger a new build

### Option 2: Vercel CLI

```bash
# Install Vercel CLI (if not already installed)
npm i -g vercel

# Login (if not logged in)
vercel login

# Link your project
cd /workspaces/Fasalxpress
vercel link

# Set environment variables from .env (one by one or paste manually)
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
# ... repeat for others

# Redeploy
vercel --prod
```

## Verification

Once environment variables are set and the project is redeployed, run these checks:

```bash
# Health check
curl -i https://fasal-xpress.vercel.app/api/health

# Ping
curl -i https://fasal-xpress.vercel.app/api/ping

# Database connectivity test
curl -i https://fasal-xpress.vercel.app/api/db-test
```

All three should return **HTTP 200** with JSON responses.

## Troubleshooting

If API endpoints return **500 errors** or **DEPLOYMENT_NOT_FOUND**:

1. **Check Vercel Logs:**
   - Go to your project → **Functions** or **Logs**
   - Look for errors in the `api/index.ts` function logs
   - Common issues: missing env vars, Supabase connection errors

2. **Verify env vars are set:**
   - Go to **Settings** → **Environment Variables**
   - Confirm all Backend variables have values for **Production** and **Preview**
   - Confirm the values match your local `.env`

3. **Redeploy after adding env vars:**
   - Even if the build succeeds, environment variables only take effect on a new deployment
   - Go to **Deployments** → **Redeploy** the latest commit, or push a new commit

4. **Check function initialization:**
   - The `api/index.ts` file logs missing env vars to console
   - View Vercel function logs to see any initialization warnings

## Local Testing

To verify the API works locally before deploying:

```bash
# Install dependencies
pnpm install

# Start dev server (includes serverless API)
pnpm dev

# Test endpoints
curl -i http://localhost:8080/api/health
curl -i http://localhost:8080/api/ping
curl -i http://localhost:8080/api/db-test
```

All should return HTTP 200 with valid JSON.
