# KeevOS Deployment Guide

## Option A: Vercel + Supabase (Recommended)

### Prerequisites
- Vercel account
- Supabase project (schema + policies applied)
- GitHub repository with KeevOS code

### Steps

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial KeevOS deployment"
   git remote add origin <your-repo>
   git push origin main
   ```

2. **Connect Vercel**
   - Go to vercel.com → New Project → Import from GitHub
   - Select your KeevOS repository
   - Framework: Next.js (auto-detected)

3. **Configure Environment Variables in Vercel**
   Add all variables from `.env.example`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `KEEVOS_API_KEY`
   - `NEXT_PUBLIC_APP_URL` (your Vercel domain)
   - `RESEND_API_KEY` (if using email)

4. **Deploy**
   Click Deploy. Vercel will build and deploy automatically.

5. **Custom Domain**
   In Vercel → Settings → Domains, add your domain.

---

## Option B: Self-Hosted (Docker / VPS)

### Requirements
- Ubuntu 22.04 VPS (min 2GB RAM)
- Node.js 20+
- Nginx as reverse proxy
- Supabase cloud or self-hosted

### Build

```bash
npm install
npm run build
```

### Run Production

```bash
NODE_ENV=production npm run start
# Or use PM2:
pm2 start npm --name "keevos" -- start
```

### Nginx Config

```nginx
server {
    listen 80;
    server_name keevos.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### SSL with Certbot

```bash
certbot --nginx -d keevos.yourdomain.com
```

---

## Database Setup

### Supabase Cloud

1. Create project at supabase.com
2. Go to SQL Editor
3. Run `supabase/schema.sql`
4. Run `supabase/policies.sql`
5. Run `supabase/storage.sql`

### Production Connection Strings

Use **connection pooler** URL for `DATABASE_URL` (Supabase → Settings → Database → Connection pooling).
Use **direct URL** for `DIRECT_URL` (for migrations).

---

## Post-Deployment Checklist

- [ ] Environment variables set
- [ ] Database schema applied
- [ ] RLS policies applied
- [ ] Storage bucket created
- [ ] First admin user registered
- [ ] Health check passing: `GET /api/health`
- [ ] Seed data loaded (optional): `npm run db:seed`
- [ ] Backup schedule configured

---

## Monitoring

- Health endpoint: `GET /api/health`
- Audit logs: `/admin/audit-logs`
- Backup status: `/admin/backups`

For error monitoring, add Sentry:
```bash
npm install @sentry/nextjs
```
Follow Sentry Next.js wizard for setup.
