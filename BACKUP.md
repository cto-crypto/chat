# KeevOS Backup & Recovery Guide

## Supabase Automated Backups (Recommended)

Supabase Pro plan includes:
- **Daily backups** retained for 7 days
- **Point-in-time recovery (PITR)** for 7 days (on higher plans)
- Accessed via: Supabase Dashboard → Settings → Backups

To restore from Supabase backup:
1. Go to Supabase Dashboard → Settings → Backups
2. Select the backup date/time
3. Click "Restore" — this restores to a new project or overwrites current

---

## Manual CLI Backup

Run a full JSON export of all tables:

```bash
npm run backup
```

This creates a timestamped file in `./backups/keevos-backup-YYYY-MM-DDTHH-MM-SS.json`

---

## Manual Backup via Dashboard

1. Log in as Owner or Admin
2. Go to `/admin/backups`
3. Click "Create Backup"
4. Download or store the backup file securely

---

## Scheduled Backups

For automated daily backups, add a cron job:

```bash
# Edit crontab
crontab -e

# Add: Run backup every day at 2 AM
0 2 * * * cd /path/to/keevos && npm run backup >> /var/log/keevos-backup.log 2>&1
```

---

## Database Export via pg_dump

```bash
pg_dump \
  "postgresql://postgres:[password]@db.[ref].supabase.co:5432/postgres" \
  --format=custom \
  --file="keevos-db-$(date +%Y%m%d).dump"
```

---

## Recovery from JSON Backup

A restore script is available:

```bash
# Coming soon: scripts/restore-db.ts
# For now: Import JSON data via Supabase Table Editor
# Or write a custom prisma script to re-insert records
```

---

## Recovery Steps (Production)

1. **Stop the application** (put in maintenance mode)
2. **Restore from Supabase** (Dashboard → Backups → Restore)
3. **Or restore from pg_dump**:
   ```bash
   pg_restore \
     --dbname="postgresql://..." \
     --clean \
     keevos-db-YYYYMMDD.dump
   ```
4. **Regenerate Prisma client** if schema changed: `npm run db:generate`
5. **Restart application**
6. **Verify** via `/api/health` endpoint

---

## Backup Storage Security

- Store backup files in encrypted cloud storage (S3, GCS, etc.)
- Never commit backup files to git (`.gitignore` excludes `backups/` directory)
- Rotate backup encryption keys quarterly
- Test restore procedures monthly

---

## Health Check

Monitor application health:

```bash
curl https://your-domain.com/api/health
# Expected: {"status":"healthy","timestamp":"...","services":{"database":"connected"}}
```

Set up uptime monitoring (UptimeRobot, Betterstack, etc.) on the `/api/health` endpoint.
