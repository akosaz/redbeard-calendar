# Free Deployment Guide (Supabase + Vercel)

**Total Cost: $0/month** 🎉

This guide covers deploying the Redbeard Calendar application using 100% free services:
- **Database**: Supabase (Free tier - 500MB PostgreSQL)
- **Backend**: Railway or Render (Free tier)
- **Frontend**: Vercel (Free tier)

---

## Architecture Overview

```
┌─────────────────────────────────┐
│   Vercel (FREE)                 │
│   └─ Next.js Frontend           │
└──────────────┬──────────────────┘
               │ HTTPS
               ▼
┌─────────────────────────────────┐
│   Railway/Render (FREE)         │
│   └─ Fastify Backend API        │
└──────────────┬──────────────────┘
               │ PostgreSQL
               ▼
┌─────────────────────────────────┐
│   Supabase (FREE)               │
│   └─ PostgreSQL Database        │
└─────────────────────────────────┘
```

---

## Part 1: Database Setup (Supabase)

### Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up
2. Click "New Project"
3. Fill in details:
   - **Name**: redbeard-calendar
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Plan**: Free

4. Wait for project initialization (~2 minutes)

### Step 2: Get Database Connection String

1. In Supabase dashboard, go to **Settings** > **Database**
2. Scroll to **Connection String** section
3. Select **URI** tab
4. Copy the connection string (looks like):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
5. Replace `[YOUR-PASSWORD]` with your actual database password

### Step 3: Initialize Database Schema

You have two options:

#### Option A: Using SQL Editor (Recommended)

1. In Supabase dashboard, go to **SQL Editor**
2. Click **New Query**
3. Paste this schema:

```sql
-- Create day_status table
CREATE TABLE day_status (
  date DATE PRIMARY KEY,
  status TEXT NOT NULL CHECK (status IN ('available', 'limited', 'finished')),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX idx_day_status_date ON day_status(date);

-- Enable Row Level Security (optional - if you want public read access)
ALTER TABLE day_status ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for frontend)
CREATE POLICY "Allow public read access" ON day_status
  FOR SELECT USING (true);

-- Allow authenticated updates (you can make this more restrictive)
CREATE POLICY "Allow authenticated updates" ON day_status
  FOR ALL USING (true);
```

4. Click **Run** (or press Ctrl+Enter)

#### Option B: Using Drizzle Push (From Local Machine)

```bash
# In your local project
cd backend

# Create .env with Supabase connection string
echo 'DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres' > .env
echo 'ADMIN_PASSWORD=your-admin-password' >> .env

# Push schema
npm run db:push
```

### Step 4: Verify Database

1. Go to **Table Editor** in Supabase dashboard
2. You should see `day_status` table
3. Test by adding a row manually

---

## Part 2: Backend Deployment (Railway - FREE)

Railway offers a free tier with 500 hours/month (enough for a hobby project).

### Step 1: Prepare Backend for Deployment

Create a `railway.json` in the `backend` folder:

```bash
# In backend folder
cat > railway.json << 'EOF'
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm start",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
EOF
```

### Step 2: Deploy to Railway

1. Go to [railway.app](https://railway.app) and sign up with GitHub
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Choose your `redbeard-calendar` repository
5. Railway will detect the monorepo - select `backend` as the root directory
6. Click **Deploy**

### Step 3: Configure Environment Variables

In Railway dashboard:

1. Go to **Variables** tab
2. Add these variables:

```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
ADMIN_PASSWORD=your-secure-admin-password
FRONTEND_URL=https://your-vercel-domain.vercel.app
PORT=8080
NODE_ENV=production
```

3. Click **Deploy** to restart with new variables

**Note**: Update `FRONTEND_URL` after deploying frontend to Vercel (see Step 4)

### Step 4: Get Backend URL

1. Go to **Settings** tab
2. Under **Domains**, click **Generate Domain**
3. You'll get a URL like: `https://redbeard-backend-production.up.railway.app`
4. **Save this URL** - you'll need it for frontend!

### Step 5: Test Backend

```bash
curl https://your-backend-url.up.railway.app/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}
```

---

## Part 3: Frontend Deployment (Vercel - FREE)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **Add New Project**
3. Import your `redbeard-calendar` repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Set Environment Variables

Add these in Vercel dashboard:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.up.railway.app
ADMIN_PASSWORD=your-secure-admin-password
ADMIN_ROUTE_SLUG=your-secret-admin-route
ADMIN_COOKIE=redbeard_admin_session
```

**IMPORTANT**: `ADMIN_PASSWORD` must match backend and Railway variables!

### Step 4: Deploy

Click **Deploy** - your app will be live at:
```
https://redbeard-calendar.vercel.app
```

### Step 5: Add Custom Domain (Optional)

1. In Vercel dashboard: **Settings** > **Domains**
2. Add your custom domain
3. Update DNS records as instructed

---

## Alternative: Backend on Render (FREE)

If Railway doesn't work, use Render (also free):

1. Go to [render.com](https://render.com) and sign up
2. Click **New** > **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: redbeard-backend
   - **Root Directory**: backend
   - **Environment**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Instance Type**: Free

5. Add environment variables (same as Railway)
6. Click **Create Web Service**

---

## Free Tier Limitations

### Supabase Free Tier
- ✅ 500MB database storage
- ✅ 2GB bandwidth/month
- ✅ 50,000 monthly active users
- ✅ Unlimited API requests
- ⚠️ Pauses after 7 days of inactivity (wakes up on first request)

### Railway Free Tier
- ✅ $5 credit/month (≈500 hours)
- ✅ 512MB RAM, 1 vCPU
- ✅ No credit card required
- ⚠️ Services sleep after inactivity

### Vercel Free Tier
- ✅ Unlimited personal projects
- ✅ 100GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Global CDN
- ⚠️ Serverless function timeout: 10s (not an issue for your API)

### When You'll Need to Pay

You'll only need to upgrade when you hit these limits:
- **500MB+ database size** → Upgrade Supabase to $25/month
- **500 hours/month backend runtime** → Upgrade Railway to $5/month or use VPS
- **100GB+ bandwidth** → Upgrade Vercel (unlikely for small projects)

**For most hobby projects, you'll stay free forever!**

---

## Maintenance

### Update Backend

```bash
# Make changes locally
git add .
git commit -m "Update backend"
git push origin main

# Railway/Render auto-deploys from GitHub
```

### Update Frontend

```bash
# Same process - just push
git push origin main
# Vercel auto-deploys
```

### Database Backups

Supabase Free tier includes:
- ✅ Daily automatic backups (7 day retention)
- ✅ Point-in-time recovery (paid plans)

To manually backup:

1. In Supabase dashboard: **Database** > **Backups**
2. Click **Manual Backup**
3. Download SQL dump if needed

---

## Keep Services Awake (Avoid Cold Starts)

Railway and Render free tiers sleep after inactivity. To prevent this:

### Option 1: Cron Job Service (Free)

Use [cron-job.org](https://cron-job.org):

1. Sign up (free)
2. Create new cron job
3. URL: `https://your-backend-url.up.railway.app/health`
4. Schedule: Every 5 minutes
5. Save

### Option 2: UptimeRobot (Free)

1. Go to [uptimerobot.com](https://uptimerobot.com)
2. Add New Monitor
3. Type: HTTP(s)
4. URL: Your backend health endpoint
5. Monitoring Interval: 5 minutes

This keeps your backend warm and provides uptime monitoring!

---

## Monitoring & Logs

### Railway Logs
- Dashboard → Your Service → **Logs** tab
- Real-time log streaming

### Supabase Logs
- Dashboard → **Logs** → **Postgres Logs**
- Monitor database queries and errors

### Vercel Logs
- Dashboard → Your Project → **Deployments**
- Click on deployment to see build/runtime logs

---

## Troubleshooting

### Backend won't connect to Supabase

```bash
# Test connection locally
psql "postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres"

# If it fails, check:
# 1. Password is correct (no special chars issues)
# 2. Database is not paused (wake it up by visiting Supabase dashboard)
# 3. Connection string is properly URL-encoded
```

### CORS errors in frontend

Make sure your backend `server.ts` has CORS enabled (it already does):

```typescript
fastify.register(cors, {
  origin: true, // Allows all origins in development
});
```

For production, restrict to your Vercel domain:

```typescript
fastify.register(cors, {
  origin: ['https://redbeard-calendar.vercel.app', 'https://yourcustomdomain.com'],
});
```

### Railway/Render deployment fails

Check build logs for errors. Common issues:
- Missing `package-lock.json` → Run `npm install` and commit
- Wrong Node version → Add `.node-version` file with `24`
- Environment variables missing → Double-check in dashboard

---

## Security Best Practices

- [ ] Use strong `ADMIN_PASSWORD` (generate with `openssl rand -base64 32`)
- [ ] Use obscure `ADMIN_ROUTE_SLUG` (not "admin" or "manage")
- [ ] Enable Supabase Row Level Security (RLS) for production
- [ ] Restrict CORS to your actual domain in production
- [ ] Enable Vercel Authentication for admin routes (optional)
- [ ] Monitor Supabase logs for unusual activity
- [ ] Keep dependencies updated (`npm audit`)

---

## Cost Comparison

| Setup | Database | Backend | Frontend | Total/Month |
|-------|----------|---------|----------|-------------|
| **100% Free** | Supabase Free | Railway Free | Vercel Free | **$0** |
| VPS Setup | PostgreSQL on VPS | VPS | Vercel Free | **$5-10** |
| All Paid | Supabase Pro | Railway Hobby | Vercel Pro | **$45** |

**Recommendation**: Start with 100% free setup. Upgrade only when you hit limits!

---

## When to Upgrade

Upgrade when you experience:
- **Database**: Near 500MB or need better performance
- **Backend**: Exceeding 500 hours/month or need more RAM
- **Frontend**: Need team features or more bandwidth

Most small projects never need to upgrade!

---

## Summary

With Supabase + Railway + Vercel, you get:
- ✅ **$0/month** hosting cost
- ✅ Automatic HTTPS/SSL
- ✅ Global CDN for frontend
- ✅ Automatic backups
- ✅ Easy scaling when needed
- ✅ GitHub auto-deployment

Perfect for hobby projects, MVPs, and small businesses!
