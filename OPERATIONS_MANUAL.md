# Lumora Operations Manual

## 🎯 Quick Start

**First time deployment:**

```bash
cd backend
npm install
npm run deploy:check
npm run migrate:prod
npm run start
```

**Monitor production:**

```bash
npm run monitor:prod
```

**Backup database:**

```bash
npm run backup:create
```

---

## 📚 Table of Contents

1. [Deployment Scripts](#deployment-scripts)
2. [Operational Commands](#operational-commands)
3. [Troubleshooting Guide](#troubleshooting-guide)
4. [Security Checklist](#security-checklist)
5. [Performance Monitoring](#performance-monitoring)
6. [Disaster Recovery](#disaster-recovery)

---

## 🚀 Deployment Scripts

### Pre-Deployment Check

```bash
npm run deploy:check
```

Validates:

- Environment variables configured
- Database connectivity
- Prisma client generated
- Security headers in place
- API endpoints exist
- Frontend setup complete

**Output:** Green checkmarks ✓ for all systems go, red X's for issues to fix.

### Production Migration

```bash
npm run migrate:prod
```

Deploys database schema changes to production using Prisma migrations.

**Safety**: Always creates backup before running in production.

### Database Verification

```bash
npm run db:verify
```

Checks:

- Database schema integrity
- Missing tables
- Corrupt indexes
- Orphaned records

---

## 🔄 Operational Commands

### Daily Operations

```bash
# Start API server (production)
npm start

# Start API with development monitoring
npm run dev

# Run smoke tests (post-deployment)
npm run test:smoke

# Check database health
npm run db:health
```

### Monitoring & Diagnostics

```bash
# Real-time production dashboard
npm run monitor:prod

# Analyze query performance
npm run db:analyze-queries

# View slow queries
npm run db:analyze-queries | grep "SLOW"

# Optimize database
npm run db:optimize
```

### Code Quality

```bash
# Lint and fix code
npm run lint

# Run unit tests
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e
```

### Database Operations

```bash
# Current connections
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Kill hung queries
npm run db:analyze-queries | grep "hung" | xargs kill

# Backup configuration
npm run backup:list
npm run backup:create
npm run backup:verify --file backup-2024-01-15.sql
npm run backup:restore --file backup-2024-01-15.sql
```

---

## 🛠️ Troubleshooting Guide

### API Not Starting

```bash
# Check what's wrong
npm run deploy:check

# View error logs
pm2 logs lumora-api

# Check port in use
netstat -tlnp | grep 5000
lsof -i :5000

# Kill existing process and restart
pkill -f "node src/server.js"
npm start
```

### Database Connection Failed

```bash
# Verify connection string
echo $DATABASE_URL

# Test connection
psql $DATABASE_URL -c "SELECT 1"

# Check PostgreSQL running
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql
```

### High Memory Usage

```bash
# Check current memory
pm2 monit

# Force garbage collection
npm run gc:force

# Restart service
pm2 restart lumora-api
```

### Slow Queries

```bash
# Find slow queries
npm run db:analyze-queries

# Check indexes
psql $DATABASE_URL -c "SELECT * FROM pg_stat_user_indexes;"

# Optimize database
npm run db:optimize
```

### Migration Failed

```bash
# Check migration status
npx prisma migrate status

# View migration history
ls -la prisma/migrations/

# Reset to known state (CAREFUL!)
npx prisma migrate reset --force

# Rebuild
npm run build
```

---

## 🔐 Security Checklist

### Before Going Live

- [ ] Environment variables set (don't commit .env)
- [ ] JWT secret is random & strong (>32 chars)
- [ ] BCRYPT_SALT configured (10-12 rounds)
- [ ] Database user has least privileges
- [ ] SSL/TLS enabled
- [ ] Rate limiting configured
- [ ] CORS configured for production domain
- [ ] Security headers enabled
- [ ] Logging configured (not too verbose in prod)
- [ ] Error handling doesn't expose internals

### Regular Security Tasks

```bash
# Daily: Check for security vulnerabilities
npm audit
npm audit fix

# Weekly: Review access logs
tail -n 1000 logs/access.log

# Monthly: Rotate secrets
# - JWT secret
# - Database password
# - API keys

# Quarterly: Security audit
npm run deploy:check
npm audit --production
```

---

## 📊 Performance Monitoring

### Key Metrics to Track

| Metric            | Target  | Alert Threshold |
| ----------------- | ------- | --------------- |
| API Response Time | < 200ms | > 1000ms        |
| Error Rate        | < 0.1%  | > 5%            |
| Database Response | < 100ms | > 500ms         |
| Memory Usage      | < 70%   | > 85%           |
| CPU Usage         | < 60%   | > 80%           |
| Uptime            | 99.9%   | < 99%           |

### Real-Time Monitoring

```bash
# Start monitoring (runs continuously)
npm run monitor:prod

# In the dashboard, look for:
# 🟢 Green = Healthy
# 🟡 Yellow = Degraded
# 🔴 Red = Critical
```

### Analysis Commands

```bash
# Request statistics
tail -n 10000 logs/api.log | \
  grep "response time" | \
  awk '{sum +=$NF; count++} END {print "Average:", sum/count, "ms"}'

# Error breakdown
grep "ERROR" logs/error.log | \
  grep -oP '(?<=error: )\w+' | \
  sort | uniq -c | sort -rn

# Top slow endpoints
grep "response time" logs/api.log | \
  sort -k8 -rn | head -10
```

---

## 💾 Disaster Recovery

### Backup Operations

```bash
# Create backup immediately
npm run backup:create
# Creates: ./backups/backup-YYYY-MM-DD.sql

# List all backups
npm run backup:list

# Verify backup is good
npm run backup:verify --file ./backups/backup-2024-01-15.sql

# Restore from backup (⚠️ WILL OVERWRITE DATA)
npm run backup:restore --file ./backups/backup-2024-01-15.sql

# Cleanup old backups (keeps last 30 days)
npm run backup:cleanup
```

### Automated Backup Schedule

Add to system cron:

```bash
# Hourly backups
0 * * * * cd /app/lumora/backend && npm run backup:create

# Daily backups (redundancy)
0 2 * * * cd /app/lumora/backend && npm run backup:create

# Cleanup old backups (monthly)
0 4 1 * * cd /app/lumora/backend && npm run backup:cleanup
```

### Recovery Scenarios

**Scenario A: Service Crashed**

```bash
npm run deploy:check
pm2 restart lumora-api
npm run monitor:prod
```

**Scenario B: Database Corrupted**

```bash
# 1. Stop API
pm2 stop lumora-api

# 2. Find clean backup
npm run backup:list

# 3. Restore
npm run backup:restore --file ./backups/backup-2024-01-15.sql

# 4. Verify
npm run db:verify

# 5. Restart
pm2 start lumora-api
npm run test:smoke
```

**Scenario C: Ransomware/Malicious Activity**

```bash
# 1. IMMEDIATELY take offline
pm2 stop lumora-api

# 2. Preserve logs for investigation
cp logs/* /secure/location/backup-logs/

# 3. Restore from immutable backup
npm run backup:restore --file ./backups/backup-SAFE-DATE.sql

# 4. Check database for suspicious activity
npm run db:analyze-queries

# 5. Review all recent migrations
npx prisma migrate status

# 6. Restart cleaned system
pm2 start lumora-api

# 7. Monitor closely
npm run monitor:prod
```

---

## 📖 Common Workflows

### Deploying Code Changes

```bash
# 1. In staging first
git checkout staging
git pull
npm install

# 2. Run tests
npm run test:integration
npm run test:e2e

# 3. To production
git checkout main
git pull
npm install

# 4. Pre-flight check
npm run deploy:check

# 5. Create backup
npm run backup:create

# 6. Deploy
pm2 restart lumora-api

# 7. Verify
npm run test:smoke
npm run monitor:prod  # (in background)
```

### Adding Database Changes

```bash
# 1. In development
npm run prisma:migrate

# 2. Test locally
npm run test:integration

# 3. In production (requires downtime)
npm run backup:create
npm run migrate:prod
npm run db:verify
npm run test:smoke
```

### Scaling/Load Testing

```bash
# 1. Baseline current performance
npm run monitor:prod &

# 2. Generate load
npm run test:load -- -c 50 -d 60

# 3. Analyze results
# Check monitor output for:
# - Response times
# - Error rates
# - Memory/CPU spikes

# 4. Optimize if needed
npm run db:optimize
npm run deploy:check
```

---

## 📞 Support & Escalation

### When to Contact Support

| Issue              | Action                               |
| ------------------ | ------------------------------------ |
| Service down       | Page on-call engineer immediately    |
| Database corrupted | Activate disaster recovery           |
| Slow API           | Run npm run db:analyze-queries first |
| Memory leak        | Restart service, investigate logs    |
| Deployment failed  | Rollback, review error logs          |

### Logs Location

```bash
# API logs
logs/api.log

# Error logs
logs/error.log

# Database logs
logs/db.log

# PM2 logs (if using PM2)
~/.pm2/logs/lumora-api-out.log
~/.pm2/logs/lumora-api-error.log

# View in real-time
pm2 logs lumora-api
```

---

## ✅ Maintenance Schedule

### Daily

- [ ] Check monitors (0-5 min check)
- [ ] Review critical alerts
- [ ] Verify backup creation

### Weekly

- [ ] Review performance metrics
- [ ] Check disk space
- [ ] Test backup restoration

### Monthly

- [ ] Full security audit
- [ ] Database optimization
- [ ] Dependency updates
- [ ] Cleanup old logs

### Quarterly

- [ ] Disaster recovery drill
- [ ] Load testing
- [ ] Security vulnerability scan

---

## 📚 Additional Documentation

- [Production Deployment Guide](./PRODUCTION_DEPLOYMENT_GUIDE.md)
- [Incident Response Plan](./INCIDENT_RESPONSE_PLAN.md)
- [Backup & Recovery Detailed Guide](./BACKUP_RECOVERY_GUIDE.md)
- [Security Best Practices](./SECURITY_BEST_PRACTICES.md)

---

**Version**: 1.0
**Last Updated**: 2024
**Owner**: DevOps/Operations Team

For questions or updates, submit a pull request or contact ops@lumora.com
