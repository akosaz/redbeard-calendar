# Deployment Guide

This guide covers deploying the Redbeard Calendar application using the most cost-effective approach: **Backend on VPS** + **Frontend on Vercel (free)**.

**Total Monthly Cost**: $5-10 for VPS (frontend is free)

---

## Architecture Overview

```
┌─────────────────────────────────┐
│   Vercel/Netlify (FREE)         │
│   ├─ Next.js Frontend           │
│   └─ Global CDN                 │
└──────────────┬──────────────────┘
               │ HTTPS API calls
               ▼
┌─────────────────────────────────┐
│   VPS (DigitalOcean/Hetzner)    │
│   └─ Docker Compose:            │
│      ├─ Fastify Backend (8080)  │
│      └─ PostgreSQL (5432)       │
└─────────────────────────────────┘
```

---

## Part 1: Backend Deployment (VPS)

### Prerequisites

- Linux VPS with Docker installed (Ubuntu 22.04 recommended)
- Domain name (optional but recommended)
- SSH access to your server

### Recommended VPS Providers

| Provider | Cost | Specs |
|----------|------|-------|
| [Hetzner](https://www.hetzner.com/cloud) | €4.5/mo | 2 vCPU, 4GB RAM |
| [DigitalOcean](https://www.digitalocean.com/) | $6/mo | 1 vCPU, 1GB RAM |
| [Linode](https://www.linode.com/) | $5/mo | 1 vCPU, 1GB RAM |

### Step 1: Prepare Your Server

SSH into your VPS:

```bash
ssh root@your-server-ip
```

Install Docker and Docker Compose:

```bash
# Update system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Install Docker Compose
apt install docker-compose-plugin -y

# Verify installation
docker --version
docker compose version
```

### Step 2: Deploy the Application

Clone your repository:

```bash
cd /opt
git clone https://github.com/yourusername/redbeard-calendar.git
cd redbeard-calendar
```

Create environment file:

```bash
cp .env.example .env
nano .env
```

Update with your values:

```env
# PostgreSQL Configuration
POSTGRES_USER=redbeard
POSTGRES_PASSWORD=YOUR_SECURE_DB_PASSWORD_HERE
POSTGRES_DB=redbeard_calendar
POSTGRES_PORT=5432

# Backend Configuration
BACKEND_PORT=8080
ADMIN_PASSWORD=YOUR_SECURE_ADMIN_PASSWORD_HERE

# Frontend URL (for CORS) - Update after deploying frontend
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

**IMPORTANT**: Use strong passwords! Generate them with:
```bash
openssl rand -base64 32
```

**Note on FRONTEND_URL**: This allows the backend to accept requests only from your frontend domain. Update it after you deploy the frontend to Vercel.

### Step 3: Build and Start Services

```bash
# Build and start containers
docker compose up -d

# Check logs
docker compose logs -f

# Verify services are running
docker compose ps
```

You should see both `redbeard-postgres` and `redbeard-backend` running.

### Step 4: Initialize Database

Run database migrations:

```bash
# Access the backend container
docker compose exec backend sh

# Inside container, run migrations
npm run db:push

# Exit container
exit
```

### Step 5: Configure Firewall

```bash
# Allow SSH
ufw allow 22/tcp

# Allow backend API
ufw allow 8080/tcp

# Enable firewall
ufw enable
```

### Step 6: Test the Deployment

```bash
# Health check
curl http://localhost:8080/health

# Should return:
# {"status":"ok","timestamp":"...","uptime":...}

# Test API
curl "http://localhost:8080/api/availability?year=2025&month=10"
```

### Step 7: Set Up Nginx Reverse Proxy (Optional but Recommended)

Install Nginx:

```bash
apt install nginx -y
```

Create Nginx configuration:

```bash
nano /etc/nginx/sites-available/redbeard
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;  # or use IP address

    location / {
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/redbeard /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 8: Add SSL Certificate (Free with Let's Encrypt)

```bash
# Install Certbot
apt install certbot python3-certbot-nginx -y

# Get certificate
certbot --nginx -d api.yourdomain.com

# Auto-renewal is set up automatically
```

---

## Part 2: Frontend Deployment (Vercel - FREE)

### Prerequisites

- GitHub/GitLab account
- Vercel account (free tier)

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### Step 3: Set Environment Variables

In Vercel dashboard, add these environment variables:

```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
ADMIN_PASSWORD=YOUR_SECURE_ADMIN_PASSWORD
ADMIN_ROUTE_SLUG=your-secret-admin-route
ADMIN_COOKIE=redbeard_admin_session
```

**IMPORTANT**: `ADMIN_PASSWORD` must match the one in your backend `.env`

### Step 4: Deploy

Click "Deploy" - Vercel will build and deploy automatically.

Your frontend will be live at: `https://your-project.vercel.app`

### Step 5: Add Custom Domain (Optional)

1. In Vercel dashboard, go to Settings > Domains
2. Add your custom domain (e.g., `calendar.yourdomain.com`)
3. Update your DNS records as instructed by Vercel

---

## Maintenance & Operations

### Updating the Backend

```bash
# SSH into server
ssh root@your-server-ip
cd /opt/redbeard-calendar

# Pull latest changes
git pull

# Rebuild and restart
docker compose down
docker compose up -d --build

# Check logs
docker compose logs -f backend
```

### Updating the Frontend

Simply push to your repository - Vercel auto-deploys:

```bash
git push origin main
```

### Database Backups

Create automatic backups:

```bash
# Create backup script
nano /opt/backup-db.sh
```

Add:

```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR
docker compose exec -T postgres pg_dump -U redbeard redbeard_calendar | gzip > $BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql.gz

# Keep only last 7 days
find $BACKUP_DIR -name "backup-*.sql.gz" -mtime +7 -delete
```

Make executable and add to cron:

```bash
chmod +x /opt/backup-db.sh

# Add to crontab (daily at 2 AM)
crontab -e
# Add: 0 2 * * * /opt/backup-db.sh
```

### Restore Database

```bash
# List backups
ls -lh /opt/backups/

# Restore from backup
gunzip < /opt/backups/backup-YYYYMMDD-HHMMSS.sql.gz | docker compose exec -T postgres psql -U redbeard redbeard_calendar
```

### Monitoring

Check service health:

```bash
# Check containers
docker compose ps

# View logs
docker compose logs -f

# Check resource usage
docker stats

# System resources
htop
```

### Troubleshooting

**Backend won't start:**
```bash
# Check logs
docker compose logs backend

# Verify environment variables
docker compose exec backend env | grep DATABASE_URL

# Restart services
docker compose restart
```

**Database connection issues:**
```bash
# Check PostgreSQL logs
docker compose logs postgres

# Verify database is accessible
docker compose exec postgres psql -U redbeard -c "SELECT 1"
```

**Port conflicts:**
```bash
# Check what's using port 8080
lsof -i :8080

# Change BACKEND_PORT in .env if needed
```

---

## Security Checklist

- [ ] Use strong passwords (generated with `openssl rand -base64 32`)
- [ ] Keep `ADMIN_PASSWORD` secret and matching on backend/frontend
- [ ] Enable UFW firewall
- [ ] Set up SSL certificate (Let's Encrypt)
- [ ] Keep Docker images updated: `docker compose pull && docker compose up -d`
- [ ] Enable automatic security updates: `apt install unattended-upgrades`
- [ ] Use obscure `ADMIN_ROUTE_SLUG` in frontend
- [ ] Regularly backup database
- [ ] Monitor logs for suspicious activity

---

## Cost Breakdown

| Service | Provider | Monthly Cost |
|---------|----------|--------------|
| Backend + DB | Hetzner/DigitalOcean | $5-10 |
| Frontend | Vercel (Free Tier) | $0 |
| Domain (optional) | Namecheap/Cloudflare | $1-2/year |
| SSL Certificate | Let's Encrypt | $0 |
| **Total** | | **$5-10/month** |

---

## Alternative: All-in-One Docker (Not Recommended for Production)

If you want to run frontend in Docker too (testing only):

```bash
# Uncomment frontend service in docker-compose.yml
# Then:
docker compose --profile full-stack up -d
```

**Why not recommended?**
- No CDN benefits
- Slower global performance
- Manual SSL certificate management
- No automatic deployments
- Wastes server resources

---

## Support & Resources

- **Docker Docs**: https://docs.docker.com/
- **Vercel Docs**: https://vercel.com/docs
- **Let's Encrypt**: https://letsencrypt.org/
- **PostgreSQL Backups**: https://www.postgresql.org/docs/current/backup-dump.html
