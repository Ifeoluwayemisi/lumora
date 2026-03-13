# Production Deployment & Operations Guide

## 🚀 Overview

This guide covers the complete deployment and operations workflow for Lumora in production environments. It includes pre-deployment checks, deployment procedures, monitoring, and disaster recovery.

---

## 📋 Pre-Deployment Checklist

### 1. **Environment Readiness**

```bash
# Run comprehensive deployment checks
npm run deploy:check
```

**Required Environment Variables:**

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secure random token (min 32 chars)
- `JWT_EXPIRES_IN` - Token expiration (e.g., "7d")
- `BCRYPT_SALT` - Bcrypt salt rounds (10-12)
- `NODE_ENV` - Set to "production"
- `PORT` - API port (default: 5000)
- `FRONTEND_URL` - Frontend application URL
- `OPENAI_API_KEY` - For AI risk scoring features

### 2. **Database Preparation**

```bash
# Create initial backup
npm run backup:create

# Run migrations
npm run migrate:prod

# Seed initial data (if needed)
npm run seed:prod

# Verify database health
npm run db:health
```

### 3. **Security Verification**

- [ ] HTTPS/SSL certificates configured
- [ ] CORS properly configured for production domain
- [ ] Security headers enabled (CSP, X-Frame-Options)
- [ ] Database credentials stored securely
- [ ] API keys rotated before deployment
- [ ] Rate limiting enabled
- [ ] Input validation on all endpoints

---

## 🔄 Deployment Procedures

### Option 1: Traditional Server Deployment

#### Step 1: Prepare Application

```bash
# Clone repository
git clone <repository-url>
cd lumora

# Install dependencies
npm install

# Set environment variables
cp .env.example .env
# Edit .env with production values
nano .env

# Build frontend (if not using separate deployment)
cd frontend
npm install
npm run build
cd ..
```

#### Step 2: Setup Database

```bash
# Create PostgeSQL database
createdb lumora_prod

# Run Prisma migrations
npx prisma migrate deploy

# Verify migrations
npx prisma db execute --stdin < schema-validation.sql
```

#### Step 3: Start Application

```bash
# Production start with PM2
pm2 start npm --name "lumora-api" -- start

# Create PM2 config
pm2 save
pm2 startup

# Monitor process
pm2 logs lumora-api
pm2 monit
```

### Option 2: Docker Deployment

```bash
# Build Docker image
docker build -t lumora:latest .

# Run container with environment file
docker run -d \
  --name lumora-prod \
  --env-file .env.prod \
  -p 5000:5000 \
  -v /data/lumora/uploads:/app/uploads \
  lumora:latest

# Verify container running
docker logs lumora-prod
docker ps | grep lumora
```

### Option 3: Cloud Platform (AWS/Heroku/Vercel)

#### AWS Elastic Beanstalk

```bash
# Initialize EB
eb init -p "Node.js 18 running on 64bit Amazon Linux 2" lumora

# Set environment variables
eb setenv \
  DATABASE_URL=$DATABASE_URL \
  JWT_SECRET=$JWT_SECRET \
  # ... other vars

# Deploy
eb create lumora-prod
eb deploy
```

#### Heroku

```bash
# Create app
heroku create lumora-prod

# Add PostgreSQL add-on
heroku addons:create heroku-postgresql:standard-0 -a lumora-prod

# Set environment variables
heroku config:set \
  NODE_ENV=production \
  JWT_SECRET=$JWT_SECRET \
  # ... other vars

# Deploy
git push heroku main
```

---

## 📊 Production Monitoring

### Real-Time Dashboard

```bash
# Start monitoring dashboard (updates every 10 seconds)
npm run monitor:prod
```

**Monitored Metrics:**

- API health & response times
- Database connectivity
- Memory usage & CPU load
- Error rates
- System uptime
- Active connections

### Health Checks

```bash
# API health check
curl http://api.lumora.com/api/health

# Database check
curl http://api.lumora.com/api/db-health

# System status
curl http://api.lumora.com/api/system/status
```

### Logging Strategy

**Log Levels (in production):**

- `error` - Critical failures requiring attention
- `warn` - Recoverable issues
- `info` - Important events
- `debug` - Disabled in production

**Log Aggregation:**

```bash
# View recent errors
tail -f ~/lumora/logs/error.log

# Summarize error patterns
grep "ERROR" logs/error.log | sort | uniq -c | sort -rn

# Monitor API performance
grep "response time" logs/api.log | \
  awk '{sum +=$NF; count++} END {print "Average:", sum/count, "ms"}'
```

---

## 🔐 Security in Production

### 1. **Database Security**

```sql
-- Create read-only API user
CREATE USER lumora_api WITH ENCRYPTED PASSWORD 'strong_password';
GRANT CONNECT ON DATABASE lumora_prod TO lumora_api;
GRANT USAGE ON SCHEMA public TO lumora_api;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO lumora_api;

-- Enable SSL connections
ALTER SYSTEM SET ssl = ON;
```

### 2. **API Security Headers**

**Configured in app.js:**

```javascript
// X-Frame-Options: prevent clickjacking
// X-Content-Type-Options: prevent MIME sniffing
// Content-Security-Policy: restrict resource loading
// Strict-Transport-Security: enforce HTTPS
```

### 3. **Rate Limiting**

Default rate limits per IP:

- Auth endpoints: 5 requests/15 minutes
- Verification: 10 requests/minute
- General API: 100 requests/minute

### 4. **Firewall Rules**

**Recommended configuration:**

- Allow: `80/tcp` (HTTP redirect)
- Allow: `443/tcp` (HTTPS)
- Allow: `5432/tcp` (Database - internal only)
- Deny: All other ports

```bash
# UFW example
ufw allow 80/tcp
ufw allow 443/tcp
ufw deny from any to any port 5432
```

---

## 💾 Backup & Disaster Recovery

### Automated Backup Schedule

```bash
# Hourly backup (cron job)
0 * * * * /usr/bin/node /app/backup-recovery.js create

# Daily backup
0 2 * * * /usr/bin/node /app/backup-recovery.js create

# Weekly full backup
0 3 * * 0 /usr/bin/node /app/backup-recovery.js create

# Cleanup old backups (monthly)
0 4 1 * * /usr/bin/node /app/backup-recovery.js cleanup
```

### Create Manual Backup

```bash
# Create backup immediately
npm run backup:create

# List all backups
npm run backup:list

# Backup file location: ./backups/backup-YYYY-MM-DD.sql
```

### Restore from Backup

```bash
# Restore specific backup
npm run backup:restore -- --file ./backups/backup-2024-01-15.sql

# Verify data after restore
npm run db:verify

# Run tests
npm run test:e2e
```

### Recovery Objectives

- **RTO** (Recovery Time Objective): < 30 minutes
- **RPO** (Recovery Point Objective): 1 hour (hourly backups)

---

## 🛠️ Troubleshooting Common Issues

### Issue: API Not Responding

```bash
# Check process status
pm2 status

# View error logs
pm2 logs lumora-api

# Restart API
pm2 restart lumora-api

# Full restart
pm2 stop lumora-api && pm2 start lumora-api
```

### Issue: Database Connection Failures

```bash
# Check database connectivity
psql -h $DB_HOST -U $DB_USER -d lumora_prod -c "SELECT NOW();"

# Verify connection string
echo $DATABASE_URL

# Check PostgreSQL service
sudo systemctl status postgresql

# Restart PostgreSQL
sudo systemctl restart postgresql
```

### Issue: High Memory Usage

```bash
# Check memory consumption
pm2 monit

# View detailed process stats
ps aux | grep node

# Force garbage collection
npm run gc:force

# Restart with clean slate
pm2 delete lumora-api
pm2 start npm --name "lumora-api" -- start
```

### Issue: Slow Response Times

```bash
# Analyze database queries
npm run db:analyze-queries

# Check database connections
psql -c "SELECT * FROM pg_stat_activity;"

# View slow query log
tail -f logs/slow-queries.log

# Optimize indexes
npm run db:optimize
```

---

## 📈 Performance Optimization

### Database Optimization

```sql
-- Create indexes for common queries
CREATE INDEX idx_verifications_product_id ON verifications(product_id);
CREATE INDEX idx_verifications_status ON verifications(status);
CREATE INDEX idx_users_email ON users(email);

-- Enable query statistics
ALTER SYSTEM SET log_min_duration_statement = 1000;  -- Log queries > 1 second
```

### Caching Strategy

- Redis caching for frequently accessed data
- Browser caching for static assets
- Database query result caching

### Load Balancing

```nginx
# nginx configuration for multiple API instances
upstream lumora_api {
    server localhost:5000;
    server localhost:5001;
    server localhost:5002;
}

server {
    listen 443 ssl http2;
    server_name api.lumora.com;

    location /api {
        proxy_pass http://lumora_api;
        proxy_set_header X-Forwarded-Proto https;
    }
}
```

---

## 📞 Escalation Procedures

### Level 1: Automated Recovery

- **Duration**: 0-5 minutes
- Monitor detects issue → automatic restart
- Example: API process crash → auto-restart

### Level 2: Manual Intervention

- **Duration**: 5-15 minutes
- DevOps team investigates logs
- Apply fixes: code hotfix, config change
- Example: memory leak → redeploy with patch

### Level 3: Incident Response

- **Duration**: 15-60 minutes
- Rollback to previous version
- Data recovery if needed
- Post-mortem analysis

### Level 4: Disaster Recovery

- **Duration**: > 1 hour
- Restore from backup
- Notify stakeholders
- Extended investigation

---

## ✅ Deployment Verification

After deployment, verify all systems:

```bash
# Full verification suite
npm run deploy:check

# Test critical flows
npm run test:smoke

# Verify database
npm run db:health

# Check monitoring
npm run monitor:prod  # (in background)

# Load testing (optional)
npm run load-test:prod
```

---

## 📚 Additional Resources

- [Backup & Recovery Guide](./BACKUP_RECOVERY_GUIDE.md)
- [Security Best Practices](./SECURITY_BEST_PRACTICES.md)
- [Performance Tuning](./PERFORMANCE_TUNING.md)
- [Infrastructure as Code](./INFRASTRUCTURE.md)
- [Incident Response Plan](./INCIDENT_RESPONSE_PLAN.md)

---

**Last Updated**: 2024
**Maintained By**: DevOps Team
**Environment**: Production
