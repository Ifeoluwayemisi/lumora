 Production Deployment & Operations Toolkit

## 🎯 Overview

This toolkit contains production-ready scripts and documentation for deploying, monitoring, and maintaining Lumora in production environments.

---

## 📦 What's Included

### 1. **Deployment Scripts**

#### `deployment-check.js`

Pre-deployment verification system. Validates all production readiness requirements.

```bash
npm run deploy:check
```

**Checks:**

- ✓ Environment variables configured
- ✓ Database connectivity
- ✓ Prisma client generated
- ✓ Security headers in place
- ✓ API endpoints available
- ✓ Frontend setup complete

**Output:** Color-coded report with pass/fail breakdown and deployment readiness score.

---

#### `production-monitor.js`

Real-time production monitoring dashboard with comprehensive system metrics.

```bash
npm run monitor:prod
```

**Displays:**

- 📡 API Health (status & response time)
- 🗄️ Database Health (status & performance)
- 💻 System Metrics (uptime, memory, CPU)
- 📊 Request Statistics (total, errors, error rate)
- 💡 Recommendations (automated suggestions)

**Updates:** Every 10 seconds
**No Configuration Required:** Just run it!

---

#### `backup-recovery.js`

Complete database backup and recovery system with point-in-time restore.

```bash
npm run backup:create      # Create backup
npm run backup:list        # List all backups
npm run backup:restore     # Restore from backup
npm run backup:cleanup     # Remove old backups
npm run backup:verify      # Verify backup integrity
```

**Features:**

- Automated backup creation & verification
- Point-in-time recovery
- Retention policy (30 days by default)
- Backup integrity checking
- Detailed logging

**Backup Location:** `./backups/`
**Logs:** `./backups/logs/`

---

### 2. **Documentation**

#### `PRODUCTION_DEPLOYMENT_GUIDE.md`

Complete production deployment procedures covering all scenarios.

**Contents:**

- Pre-deployment checklist
- Deployment procedures (traditional, Docker, cloud)
- Monitoring setup
- Security configuration
- Backup strategy
- Troubleshooting guide
- Performance optimization
- Escalation procedures

---

#### `INCIDENT_RESPONSE_PLAN.md`

Step-by-step procedures for responding to production incidents.

**Coverage:**

- 4-level severity classification
- Critical incident scenarios with recovery steps
- Response team roles and responsibilities
- Communication protocol
- Root cause analysis process
- Prevention measures

---

#### `OPERATIONS_MANUAL.md` (⭐ START HERE!)

Quick reference for daily operations and troubleshooting.

**Sections:**

- Quick start commands
- Operational command reference
- Troubleshooting guide (quick fixes)
- Security checklist
- Performance monitoring
- Disaster recovery workflows
- Maintenance schedule

---

## 🚀 Quick Start

### First Time Setup

```bash
# 1. Run pre-deployment check
npm run deploy:check

# 2. If all green, proceed with deployment
npm run build
npm run migrate:prod

# 3. Create initial backup
npm run backup:create

# 4. Start the API
npm start

# 5. Monitor in background
npm run monitor:prod &

# 6. Run smoke tests
npm run test:smoke
```

### Daily Operations

```bash
# Start API
npm start

# Monitor (in another terminal)
npm run monitor:prod

# Check database health
npm run db:health

# Create daily backup
npm run backup:create
```

---

## 📊 Command Reference

### Deployment Commands

| Command                | Purpose                       | When to Use       |
| ---------------------- | ----------------------------- | ----------------- |
| `npm run deploy:check` | Validate production readiness | Before deployment |
| `npm run build`        | Build/prepare for production  | During deployment |
| `npm run migrate:prod` | Deploy database changes       | With code updates |
| `npm start`            | Start production server       | Go live           |

### Monitoring Commands

| Command                      | Purpose               | Output                 |
| ---------------------------- | --------------------- | ---------------------- |
| `npm run monitor:prod`       | Real-time dashboard   | Live metrics every 10s |
| `npm run db:health`          | Quick DB check        | Health status          |
| `npm run db:analyze-queries` | Performance analysis  | Slow query details     |
| `npm run db:optimize`        | Database optimization | Execution summary      |

### Backup Commands

| Command                  | Purpose            | Output                  |
| ------------------------ | ------------------ | ----------------------- |
| `npm run backup:create`  | Create backup      | Backup file path & size |
| `npm run backup:list`    | Show all backups   | List with dates & sizes |
| `npm run backup:verify`  | Test backup        | Verification status     |
| `npm run backup:restore` | Restore backup     | Restoration status      |
| `npm run backup:cleanup` | Remove old backups | Count of cleaned files  |

### Testing Commands

| Command                    | Purpose                | When to Use        |
| -------------------------- | ---------------------- | ------------------ |
| `npm run test:smoke`       | Quick validation tests | Post-deployment    |
| `npm run test:unit`        | Unit tests             | After code changes |
| `npm run test:integration` | Integration tests      | Before production  |
| `npm run test:e2e`         | End-to-end tests       | Critical features  |

---

## 🔍 Monitoring Dashboard

When you run `npm run monitor:prod`, you see:

```
╔════════════════════════════════════════════════════════╗
║  🚀 LUMORA PRODUCTION MONITORING DASHBOARD             ║
║════════════════════════════════════════════════════════║

📡 API HEALTH
  Status: HEALTHY (green)
  Response Time: 185ms

🗄️ DATABASE HEALTH
  Status: HEALTHY (green)
  Response Time: 42ms

💻 SYSTEM METRICS
  Uptime: 12.5 hours
  CPU: 2/8 cores

📈 MEMORY USAGE
  Total: 16 GB
  Used: 8.5 GB
  Free: 7.5 GB
  Usage: 53% (green)

📊 REQUEST STATISTICS
  Total: 15,234
  Errors: 5
  Error Rate: 0.03% (green)

💡 RECOMMENDATIONS
  ✅ All systems nominal

═══════════════════════════════════════════════════════
Last Updated: 2024-01-15T14:30:45.123Z
```

**Green = Healthy | Yellow = Warning | Red = Critical**

---

## 🛟 Troubleshooting Quick Guide

### API Not Starting?

```bash
npm run deploy:check  # Identifies the issue
```

### Database Connection Failed?

```bash
npm run db:health    # Shows the problem
psql $DATABASE_URL -c "SELECT 1"  # Direct test
```

### High Memory Usage?

```bash
npm run monitor:prod  # Check current status
npm run gc:force      # Force garbage collection
pm2 restart lumora-api  # Restart if needed
```

### Slow Queries?

```bash
npm run db:analyze-queries  # Find bottlenecks
npm run db:optimize         # Optimize database
```

### Need to Restore Database?

```bash
npm run backup:list                              # See available backups
npm run backup:restore --file backup-YYYY-MM-DD.sql  # Restore
npm run db:verify                                # Verify restoration
```

---

## 📋 Incident Response

**Production Incident Detected?**

1. **Immediately:**

   ```bash
   npm run monitor:prod  # See current status
   ```

2. **Diagnose:**
   - API down? → Check `deployment-check.js` output
   - DB down? → Run `npm run db:health`
   - Slow? → Run `npm run db:analyze-queries`

3. **Recover:**
   - Process crash → `pm2 restart lumora-api`
   - DB issue → `npm run backup:restore`
   - Memory leak → `npm run gc:force` then restart

4. **Document:**
   - What happened?
   - How long was service down?
   - What fixed it?
   - How to prevent?

**See:** `INCIDENT_RESPONSE_PLAN.md` for detailed procedures

---

## 🔐 Security Essentials

### Before Going Live

- [ ] Environment variables configured (never commit .env)
- [ ] JWT secret set to random >32 char string
- [ ] Database user has least privileges
- [ ] SSL/TLS enabled
- [ ] CORS configured properly
- [ ] Security headers enabled

### Regular Tasks

```bash
npm audit              # Check vulnerabilities (weekly)
npm run deploy:check   # Full system check (monthly)
npm run backup:create  # Create backup (daily)
```

**See:** `PRODUCTION_DEPLOYMENT_GUIDE.md` for full security checklist

---

## 📚 Documentation Map

```
├── OPERATIONS_MANUAL.md (⭐ START HERE - Quick reference)
│
├── PRODUCTION_DEPLOYMENT_GUIDE.md (Complete deployment guide)
│   ├── Pre-deployment checklist
│   ├── Deployment procedures (3 options)
│   ├── Security configuration
│   ├── Monitoring setup
│   ├── Performance optimization
│   └── Troubleshooting
│
├── INCIDENT_RESPONSE_PLAN.md (Incident handling)
│   ├── Severity levels
│   ├── Response procedures
│   ├── Critical scenarios
│   ├── Communication protocol
│   └── Root cause analysis
│
└── This README
    ├── Quick start
    ├── Command reference
    ├── Troubleshooting guide
    └── Security checklist
```

---

## 🛠️ Scripts Technical Details

### `deployment-check.js`

- **Language**: JavaScript (Node.js)
- **Dependencies**: dotenv, postgres
- **Runtime**: ~30 seconds
- **Output**: Color-coded pass/fail report
- **Exit Code**: 0 (all pass) or 1 (failures)

### `production-monitor.js`

- **Language**: JavaScript (Node.js)
- **Update Interval**: 10 seconds
- **Memory Overhead**: ~50MB
- **CPU Usage**: <1%
- **Stop**: Press Ctrl+C

### `backup-recovery.js`

- **Language**: JavaScript (Node.js)
- **Backup Format**: PostgreSQL SQL dump
- **Verification**: Structure & content validation
- **Retention**: 30 days (configurable)
- **Restore Time**: Depends on database size

---

## 💡 Best Practices

### Daily

✓ Monitor dashboard active
✓ Check for alerts
✓ Create backup

### Weekly

✓ Review performance metrics
✓ Run `npm audit`
✓ Verify backup restoration

### Monthly

✓ Full security audit (`npm run deploy:check`)
✓ Database optimization
✓ Load testing

### Quarterly

✓ Disaster recovery drill
✓ Dependency updates
✓ Security review

---

## 📞 Support

### When Things Go Wrong

**Option 1: Quick Self-Help**

1. Check `OPERATIONS_MANUAL.md` troubleshooting section
2. Run `npm run deploy:check` for diagnosis
3. Run `npm run monitor:prod` to see status

**Option 2: Incident Response**

1. Follow `INCIDENT_RESPONSE_PLAN.md`
2. Determine severity level
3. Execute appropriate recovery procedure

**Option 3: Escalation**

- Level 1: Check documentation
- Level 2: Run diagnostic scripts
- Level 3: Contact on-call team
- Level 4: Activate disaster recovery

---

## 📞 Getting Help

| Issue                | Resource                       |
| -------------------- | ------------------------------ |
| Deployment questions | PRODUCTION_DEPLOYMENT_GUIDE.md |
| Daily operations     | OPERATIONS_MANUAL.md           |
| Production incident  | INCIDENT_RESPONSE_PLAN.md      |
| Database problem     | `npm run db:health`            |
| System status        | `npm run monitor:prod`         |
| Need backup?         | `npm run backup:create`        |

---

## 📝 Changelog

### v1.0 (2024)

- ✅ Deployment check script
- ✅ Production monitoring dashboard
- ✅ Backup & recovery system
- ✅ Complete documentation
- ✅ Incident response procedures

---

## 🎯 Future Enhancements

- [ ] Kubernetes deployment support
- [ ] Multi-region failover
- [ ] Automated scaling
- [ ] Advanced analytics
- [ ] Machine learning anomaly detection

---

## 📄 License

These tools are part of the Lumora project.

---

**Version**: 1.0  
**Last Updated**: 2024  
**Maintained By**: DevOps Team  
**Status**: Production Ready ✅

For questions or contributions, please contact the DevOps team.
