# Production Deployment Day Checklist

## 🎯 Pre-Deployment (3 days before)

### Infrastructure Setup

- [ ] Production database created and accessible
- [ ] Database user created with least privileges
- [ ] SSL/TLS certificates obtained
- [ ] Load balancer configured (if applicable)
- [ ] CDN configured (if applicable)
- [ ] Storage/uploads directory created
- [ ] Logging infrastructure configured

### Code Preparation

- [ ] All code merged to main branch
- [ ] All tests passing locally
- [ ] Code review sign-off obtained
- [ ] Build tested in staging environment
- [ ] Database migrations tested in staging
- [ ] Frontend build tested in staging

### Documentation & Communication

- [ ] Deployment plan shared with team
- [ ] Rollback procedures documented
- [ ] Team trained on incident response
- [ ] Customers notified of planned deployment
- [ ] Support team briefed
- [ ] Status page prepared

### Environment Configuration

- [ ] Production `.env` file created
- [ ] All environment variables documented
- [ ] JWT_SECRET generated (random, >32 chars)
- [ ] BCRYPT_SALT configured
- [ ] Database connection string verified
- [ ] Service credentials stored securely
- [ ] No secrets committed to git
- [ ] Deployment credentials secured

---

## 📋 24 Hours Before Deployment

### Final Verification

- [ ] Production database backup schedule configured
- [ ] Monitoring alerts configured (thresholds set)
- [ ] Log aggregation configured
- [ ] Status page ready for updates
- [ ] Incident response team on standby
- [ ] Post-mortem meeting scheduled

### Team Readiness

- [ ] All team members aware of timeline
- [ ] On-call engineer confirmed
- [ ] Manager available for escalation
- [ ] Communication channels verified (Slack, email, etc.)
- [ ] Phone numbers documented

### Final Code Review

- [ ] Security audit completed
- [ ] Performance review completed
- [ ] Database schema validated
- [ ] API endpoints verified
- [ ] No console.log statements in production code
- [ ] No hardcoded secrets in code

### Staging Final Test

```bash
cd backend
npm run deploy:check    # Must be 100%
npm run test:smoke      # Must pass
npm run test:e2e        # Critical flows pass
npm run monitor:prod &  # Monitor for 30 mins - watch for errors
npm run backup:create   # Test backup process
```

---

## 🚀 Deployment Day - Before Launch

### 2 Hours Before Deployment

**Notification**

- [ ] Send message to #general: "Deployment starting in 2 hours"
- [ ] Update status page: "Deployment scheduled"

**Final Checks**

```bash
cd backend

# 1. Pre-deployment check
npm run deploy:check
# ✅ All systems green? Continue
# ❌ Any failures? STOP and fix

# 2. Database health
npm run db:health
# ✅ Connected? Continue
# ❌ Issues? STOP and investigate

# 3. Current backup
npm run backup:list
# ✅ Recent backup exists? Continue
# ❌ No recent backup? Run: npm run backup:create
```

### 30 Minutes Before Deployment

**Environment Verification**

- [ ] Correct environment (production, not staging)
- [ ] DATABASE_URL points to production DB
- [ ] API_URL points to production domain
- [ ] NODE_ENV=production
- [ ] All secrets are correct

**Team Communication**

- [ ] Incident response team standing by
- [ ] On-call engineer available
- [ ] Slack channel active
- [ ] Status page monitor ready

**Last Backup**

```bash
npm run backup:create
# Note the filename: backup-YYYY-MM-DD.sql
# Save this path for quick recovery if needed
```

**Staging Destroy** (if separate staging environment)

- [ ] Optional: Reset staging after deployment for next iteration

---

## ⚠️ Deployment Execution

### Step 1: Pre-deployment System Check (5 minutes)

```bash
npm run deploy:check
```

**Expected Result:** 100% pass rate
✅ Green checkmarks throughout

**If failures:**

- Don't proceed
- Fix issues
- Re-run check
- Restart entire process

### Step 2: Code Deployment

Choose ONE based on your setup:

**Option A: Traditional Server**

```bash
git pull origin main
npm install
npm run build
npm run migrate:prod
```

**Option B: Docker**

```bash
docker pull registry.lumora.com/luminous/api:latest
docker run -d --name lumora-api-prod \
  --env-file .env.prod \
  -p 5000:5000 \
  registry.lumora.com/luminous/api:latest
```

**Option C: Cloud Platform**

```bash
# Heroku
git push heroku main

# AWS/Other
./deploy-to-production.sh
```

### Step 3: Service Start

```bash
npm start
# Or if using PM2:
pm2 restart lumora-api
```

**Monitor for:**

- ✅ Service starts without errors
- ✅ No emergency restart loops
- ✅ Database connections established

### Step 4: Immediate Verification (5 minutes)

```bash
# Quick health check
curl https://api.lumora.com/api/health
# Expected: 200 OK

# Smoke tests
npm run test:smoke
# Expected: All tests pass
```

**If issues:**

- [ ] Check error logs: `pm2 logs lumora-api`
- [ ] Verify database: `npm run db:health`
- [ ] Check environment variables
- [ ] See incident response procedures

### Step 5: Start Live Monitoring (continuous)

```
# Terminal 2 - Run monitoring dashboard
npm run monitor:prod
```

**Watch for:**

- 🟢 API Health: HEALTHY
- 🟢 Database: HEALTHY
- 🟢 Memory: < 70%
- 🟢 Error Rate: < 1%
- 🟢 Response Time: < 500ms

---

## ✅ Post-Deployment - First Hour

### Every 5 Minutes (First 15 minutes)

- [ ] Check monitoring dashboard for red alerts
- [ ] Monitor error logs for critical errors
- [ ] Verify database integrity
- [ ] Check response times

### At 15 Minutes

```bash
npm run test:smoke
# Should pass without issues
```

- [ ] All smoke tests passing
- [ ] No critical errors
- [ ] User reports: no issues

### At 30 Minutes

- [ ] Review monitoring dashboard
- [ ] Check for memory leaks (should be stable)
- [ ] Review error log summary
- [ ] Check database connections
- [ ] Verify backup system working

### At 60 Minutes (1 Hour)

- [ ] All systems stable
- [ ] No errors beyond normal threshold
- [ ] Response times normal
- [ ] Database performing well
- [ ] Ready to declare success

**Status Update:** "Deployment successful - all systems operational"

---

## 📊 Extended Post-Deployment (First Day)

### First 4 Hours

- [ ] Continuous monitoring active
- [ ] Error rate normal (< 1%)
- [ ] Performance metrics normal
- [ ] No critical issues
- [ ] User feedback: positive

### After 12 Hours

```bash
npm run db:health
npm run db:analyze-queries
```

- [ ] Database healthy
- [ ] No query performance issues
- [ ] Memory stable
- [ ] CPU usage normal

### After 24 Hours

```bash
npm run deploy:check
npm run backup:create  # First full backup as production
```

- [ ] All systems green
- [ ] No unexpected errors
- [ ] Performance stable
- [ ] Backup created and verified

---

## 🛑 If Deployment Fails

### Immediate Actions (< 1 minute)

- [ ] Stop deployment process
- [ ] Note time and symptom
- [ ] Screenshot error messages
- [ ] Activate incident response

### Diagnosis (< 5 minutes)

```bash
# Stop service
pm2 stop lumora-api

# Check logs
pm2 logs lumora-api --lines 50

# Check system
npm run deploy:check

# Check database
npm run db:health
```

### Recovery Options (in order)

**Option 1: Fix and Retry**

- If simple config issue (< 10 minutes to fix)
- Fix the issue
- Restart service
- Re-verify with `npm run test:smoke`

**Option 2: Rollback**

- If can't identify issue in 10 minutes
- Stop service: `pm2 stop lumora-api`
- Revert code: `git checkout main~1`
- Restart: `npm start`
- Verify: `npm run test:smoke`

**Option 3: Restore from Backup**

```bash
npm run backup:list
# Find pre-deployment backup
npm run backup:restore --file backup-YYYY-MM-DDpre-deploy.sql
```

- Stop service
- Restore database
- Verify restoration
- Restart service

### Communication

- Update status page: "Deployment rolled back - investigating"
- Notify team on Slack
- Schedule incident review for tomorrow
- Document what went wrong

---

## 📞 During Deployment

### Communication Protocol

**Before Starting:**

- Message: "🚀 Deployment starting now"
- Channel: #engineering (or your team channel)

**Every 15 minutes (if > 15 min deployment):**

- Update: "✅ Deployment 50% complete - systems normal"
- Include: Current step and status

**On Completion:**

- Update: "🎉 Deployment successful - system live"
- Include: "monitors running, all systems operational"

**If Issues:**

- Update: "⚠️ Deployment halted - investigating issue"
- Include: "estimated 10 min delay" or rollback plan

### Keep Slack Channel Active

- Don't disappear during deployment
- Respond to questions quickly
- Update team every 15 minutes
- Be transparent about issues

---

## ✨ Success Criteria

Deployment is **successful** when:

- ✅ All pre-deployment checks passed
- ✅ Service started without errors
- ✅ Smoke tests passing
- ✅ Health endpoints responding
- ✅ Database functioning normally
- ✅ Monitoring dashboard green
- ✅ Error rate < 1%
- ✅ Response times normal (< 500ms)
- ✅ First hour stable
- ✅ First day stable

---

## 📋 Quick Reference During Deployment

### Critical Commands (Keep Handy!)

```bash
# Check if system ready
npm run deploy:check

# Start monitoring
npm run monitor:prod

# Quick health check
npm run test:smoke

# Database health
npm run db:health

# Logs
pm2 logs lumora-api

# Restart if needed
pm2 restart lumora-api

# Restore from backup (emergency only)
npm run backup:restore --file backup-YYYY-MM-DD.sql
```

### Team Escalation

**Level 1 Problems** (< 2 minutes to fix):

- Environment variable issue
- Memory issue
- Process crash

**Level 2 Problems** (2-10 minutes):

- Database connection issue
- Configuration issue
- Need to review logs

**Level 3 Problems** (> 10 minutes):

- Rollback
- Restore from backup
- Incident response protocol

---

## 🎓 Post-Deployment Review

### Day After Deployment

Schedule: 30-minute team meeting

**Agenda:**

1. What went well? (5 min)
2. What could be improved? (10 min)
3. Any issues encountered? (10 min)
4. Action items for next time (5 min)

**Document:**

- Actual deployment time vs estimate
- Issues encountered and resolution
- Improvements to make next time
- Lessons learned

---

## 📝 Deployment Log Template

Use this to record your deployment:

```
DEPLOYMENT LOG - Date: YYYY-MM-DD

Pre-Deployment Check:
  Status: ✅ PASS / ❌ FAIL
  Time: HH:MM
  Issues: [list any]

Code Deployment:
  Start Time: HH:MM
  End Time: HH:MM
  Duration: XX minutes
  Method: [Traditional/Docker/Cloud]

Verification:
  Smoke Tests: ✅ PASS / ❌ FAIL
  Health Check: ✅ HEALTHY / ❌ ISSUES
  Monitoring: ✅ GREEN / ⚠️ WARNING / ❌ CRITICAL

Issues Encountered:
  [List any with resolution]

Success Criteria Met:
  All 10 criteria: ✅ YES / ❌ NO

Final Status: ✅ SUCCESSFUL / ❌ ROLLED BACK

Next Deployment: YYYY-MM-DD (planned)
```

---

## 🆘 Emergency Contacts

Update these before deployment:

| Role               | Name | Phone | Slack |
| ------------------ | ---- | ----- | ----- |
| Incident Commander |      |       |       |
| Technical Lead     |      |       |       |
| DevOps Engineer    |      |       |       |
| Database Admin     |      |       |       |
| Manager            |      |       |       |

---

## ✅ Final Verification Before Declaring Success

- [ ] All systems showing green in monitoring
- [ ] No critical errors in logs
- [ ] Database responding normally
- [ ] API response times < 500ms
- [ ] Error rate < 1%
- [ ] Users reporting normal experience
- [ ] Team debriefs completed
- [ ] Post-mortem scheduled (if any issues)
- [ ] Documentation updated
- [ ] Deployment marked complete

---

**Version**: 1.0  
**print this page before deployment day!**  
**Keep handy throughout the process**

Good luck with your deployment! You've got this! 🚀
