# Incident Response Plan

## 🚨 Overview

This document defines procedures for responding to and resolving critical incidents affecting Lumora production environment. All team members should familiarize themselves with this plan.

---

## 📞 Incident Response Team

| Role                       | Responsibility                          | Contact            |
| -------------------------- | --------------------------------------- | ------------------ |
| **Incident Commander**     | Coordinates response, declares severity | Primary: [Contact] |
| **Technical Lead**         | Diagnoses and implements fixes          | [Contact]          |
| **DevOps Engineer**        | Infrastructure & deployment             | [Contact]          |
| **Database Administrator** | Database recovery & optimization        | [Contact]          |
| **Communications Lead**    | Customer updates & notifications        | [Contact]          |

---

## 🎯 Incident Severity Levels

### Level 1: Critical

- **Impact**: Complete service outage or data loss
- **Symptoms**: API completely down, database unavailable
- **Response Time**: < 5 minutes
- **Escalation**: Immediate full team mobilization
- **Communication**: Every 15 minutes

### Level 2: High

- **Impact**: Significant functionality unavailable, errors for many users
- **Symptoms**: Verification API failing, high error rates (> 10%)
- **Response Time**: < 15 minutes
- **Escalation**: Technical lead + DevOps
- **Communication**: Every 30 minutes

### Level 3: Medium

- **Impact**: Reduced functionality, specific feature broken
- **Symptoms**: One API endpoint failing, degraded performance
- **Response Time**: < 1 hour
- **Escalation**: Technical lead
- **Communication**: Every hour

### Level 4: Low

- **Impact**: Minor issue, no user-facing impact
- **Symptoms**: Slow queries, non-critical errors in logs
- **Response Time**: < 4 hours
- **Escalation**: Regular team
- **Communication**: Documented in ticket

---

## 🚨 Critical Incident Response

### Scenario 1: Complete API Outage

**Detection**

```bash
# Monitoring alerts: Health check fails
# Symptom: curl http://api.lumora.com/api/health → Connection refused
```

**Immediate Actions (0-2 min)**

1. Declare incident Level 1
2. Activate incident response team
3. Check system status:
   ```bash
   pm2 status
   docker ps (if Docker)
   systemctl status lumora
   ```

**Diagnosis (2-5 min)**

```bash
# Check process status
pm2 logs lumora-api --lines 100

# Check system resources
free -h  # Memory
df -h    # Disk space
top -b -n1 | head -20

# Check database connectivity
psql -h $DB_HOST -c "SELECT 1" || echo "Database unreachable"

# Check port availability
netstat -tlnp | grep 5000
```

**Recovery Options**

**Option A: Service Restart (if process crashed)**

```bash
pm2 restart lumora-api

# Wait for service to come online
for i in {1..30}; do
  if curl -f http://localhost:5000/api/health > /dev/null 2>&1; then
    echo "Service recovered"
    break
  fi
  sleep 2
done
```

**Option B: Database Recovery (if DB connection failed)**

```bash
# Restart PostgreSQL
sudo systemctl restart postgresql

# Verify database
psql -h $DB_HOST -U $DB_USER -d lumora_prod -c "SELECT 1"

# Restore API connection
pm2 restart lumora-api
```

**Option C: Full Service Recovery (if system compromised)**

```bash
# Restore from backup
npm run backup:restore -- --file ./backups/backup-LATEST.sql

# Restart all services
pm2 restart all

# Verify systems
npm run deploy:check
```

**Verification (after recovery)**

```bash
# Health check
curl http://api.lumora.com/api/health

# Database connectivity
npm run db:health

# Monitoring dashboard
npm run monitor:prod  # (background)

# Run smoke tests
npm run test:smoke
```

**Communication**

- Notify status page: "Service recovered - investigating root cause"
- Update stakeholders
- Schedule post-mortem

---

### Scenario 2: Database Connectivity Issues

**Detection**

```bash
# Symptoms:
# - Slow database responses (> 10 seconds)
# - Connection pool exhaustion
# - Specific API endpoints timing out
```

**Diagnosis**

```bash
# Check active connections
psql -c "SELECT count(*) FROM pg_stat_activity;"

# Check for locked tables
psql -c "SELECT * FROM pg_locks WHERE NOT granted;"

# Check slow queries
psql -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"

# Check database size
du -sh /var/lib/postgresql/13/main/base/[DB_OID]/
```

**Recovery**

**Option A: Kill Long-Running Queries**

```bash
# Identify long-running query
psql -c "SELECT pid, now() - pg_stat_activity.query_start AS duration, query
         FROM pg_stat_activity
         WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes';"

# Terminate long query
psql -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE duration > '5 min';"
```

**Option B: Increase Connection Pool**

```bash
# Edit connection pool settings in .env
# DATABASE_POOL_MIN=5 -> DATABASE_POOL_MIN=10
# DATABASE_POOL_MAX=20 -> DATABASE_POOL_MAX=50

pm2 restart lumora-api
```

**Option C: Restart PostgreSQL**

```bash
sudo systemctl restart postgresql

# Wait for service
sleep 10

# Verify
psql -c "SELECT 1"

# Restart API
pm2 restart lumora-api
```

---

### Scenario 3: High Memory Usage / Memory Leak

**Detection**

```bash
# Symptom: Memory usage growing over time
# Alert: Memory > 85% of available
```

**Diagnosis**

```bash
# Check Node process memory
pm2 monit

# Get detailed stats
ps aux | grep "node" | grep -v grep

# Heap snapshot
node --expose-gc -e "require('heapdump').writeSnapshot()"
```

**Recovery**

**Option A: Graceful Restart**

```bash
pm2 restart lumora-api --wait-ready --listen-timeout 10000
```

**Option B: Force Garbage Collection**

```bash
# Restart process with explicit GC
pm2 restart lumora-api

# Monitor memory
pm2 monit
```

**Option C: Identify Memory Leak (investigation)**

```bash
# Generate heap dump
curl http://localhost:5000/api/admin/heap-dump

# Analyze dump with DevTools or clinic.js
npm install -g clinic
clinic doctor -- npm start
```

---

### Scenario 4: Data Corruption / Loss

**Detection**

```bash
# Symptoms:
# - Incorrect data in database
# - Missing records in verification tables
# - User reports account data discrepancies
```

**Immediate Actions**

1. **Declare Level 1 incident immediately**
2. **Take database offline** (stop writes)

   ```bash
   # Disable API
   pm2 stop lumora-api

   # Set to read-only
   # psql -c "ALTER DATABASE lumora_prod SET default_transaction_read_only = on;"
   ```

3. **Preserve all evidence** (logs, database state)

**Recovery**

```bash
# 1. Find before-corruption backup
npm run backup:list

# 2. Verify backup integrity
npm run backup:verify -- --file backup-YYYY-MM-DD.sql

# 3. Restore from backup
npm run backup:restore -- --file backup-YYYY-MM-DD.sql

# 4. Verify restoration
npm run db:verify

# 5. Replay any data since backup (if transaction logs available)
npm run db:replay-logs -- --since 2024-01-15T12:00:00Z

# 6. Restart services
pm2 restart lumora-api
```

---

## 📋 Incident Response Checklist

### Immediate Response (0-10 minutes)

- [ ] Declare incident severity level
- [ ] Activate incident response team
- [ ] Start status page notification
- [ ] Begin collecting logs and diagnostics
- [ ] Assess scope of impact (how many users affected?)
- [ ] Document timeline of events

### Initial Investigation (10-30 minutes)

- [ ] Review application logs
- [ ] Check system resources
- [ ] Verify database connectivity
- [ ] Check for recent deployments/changes
- [ ] Review monitoring dashboards
- [ ] Attempt initial recovery steps

### Active Resolution (30+ minutes)

- [ ] Implement recovery solution
- [ ] Test recovery in staging if possible
- [ ] Monitor system for stability
- [ ] Communicate progress to stakeholders
- [ ] Escalate if needed
- [ ] Document all steps taken

### Post-Recovery (after restoration)

- [ ] Verify all systems operational
- [ ] Run comprehensive tests
- [ ] Confirm no data loss/corruption
- [ ] Update status page
- [ ] Schedule post-mortem (within 24 hours)
- [ ] Document incident report

---

## 📞 Communication Protocol

### Initial Alert (immediately)

**To**: Incident Commander, Technical Team
**Message**: "INCIDENT: [Level X] - [Brief Description]"

### Update #1 (within 15 minutes)

- Severity level
- Known impact
- Suspected cause
- Current actions

### Subsequent Updates (every 30-60 minutes)

- Current status
- % completion of recovery
- Estimated time to resolution
- Any new developments

### Resolution Notification

- All clear message
- Brief root cause summary
- Link to post-mortem
- Thank you to team

### Sample Message Template

```
🚨 INCIDENT UPDATE #[N]
Level: [1-4]
Status: [Investigating/Mitigating/Resolved]

Issue: [Brief description]
Impact: [Who/what affected]
Current Actions: [What we're doing]
ETA: [Expected resolution time]

Questions: [Contact]
```

---

## 🔍 Root Cause Analysis

### Post-Incident Review (within 24 hours)

Document:

1. **Timeline**: When did issue start? When detected? When resolved?
2. **Root Cause**: What actually caused the problem?
3. **Detection Gap**: Why wasn't it caught earlier?
4. **Response Gap**: What slowed us down?
5. **Preventative Measures**: How can we prevent this?

### Meeting Agenda

```
Duration: 45 minutes
1. Timeline Review (10 min)
2. Root Cause Analysis (15 min)
3. Detection & Response (10 min)
4. Action Items (10 min)
```

### Action Items Template

```
Issue: [What happened]
Action: [What to do]
Owner: [Who's responsible]
Deadline: [When due]
Priority: [Critical/High/Medium]
```

---

## 🛡️ Prevention Measures

### Monitoring & Alerting

```bash
# Enable comprehensive monitoring
npm run deploy:check  # Pre-deployment
npm run monitor:prod  # Ongoing (background)

# Set up alert thresholds
- CPU > 80%
- Memory > 85%
- Error rate > 5%
- Response time > 2s
- Database connections > 90% pool
```

### Testing & Validation

```bash
# Regular testing
npm run test:unit        # After code changes
npm run test:integration # Daily
npm run test:smoke       # Post-deployment
npm run test:load        # Weekly

# Chaos testing (monthly)
npm run test:chaos -- --scenario random-failure
```

### Change Management

- All production changes require:
  - [ ] Code review approval
  - [ ] Staging deployment & testing
  - [ ] Backup created before deployment
  - [ ] Rollback plan documented
  - [ ] Change window scheduled

---

## 📞 Emergency Contacts

### On-Call Schedule

[Link to on-call rotation]

### Escalation Chain

1. **Tier 1**: First responder
2. **Tier 2**: Incident Commander
3. **Tier 3**: Team Lead
4. **Tier 4**: Management/C-Level

### External Contacts

- **Database Vendor Support**: [Contact]
- **Hosting Provider**: [Contact]
- **Security**: [Contact]

---

**Last Updated**: 2024
**Next Review**: Quarterly
**Owner**: DevOps Team
