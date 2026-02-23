# Phase 13 - 10-Minute Verification (CTO Quickstart)

## What's New
- ✅ Full admin system operational
- ✅ Zero engineering required for customer support (basic operations)
- ✅ Production-ready security posture for demo (MFA + RBAC + IP whitelist)

## Test These 3 Things (≤10 minutes)
1. **Login**
   - Visit: https://admin.bridgeflow.example.com
   - Use admin credentials (dev stub available) and complete MFA
2. **Find customer**
   - Search for a known customer (e.g., `TestCorp`)
   - Open tenant and verify user count & subscription
3. **Fix problem**
   - Suspend a test tenant then Reactivate it
   - Confirm audit logs and notifications

## If It Works
- Reply: "Phase 13 approved"
- We’ll begin customer onboarding and schedule Phase 14 planning

## If It Doesn't Work
- Reply with a screenshot and brief note of failing step
- We commit to addressing critical fixes with a 2-hour SLA for the demo window

## Verification Commands 📊
After running the demo helper, use the following quick checks:

```powershell
# Quick verification script
.\start\verify-demo.ps1

# Show latest run directory
Get-ChildItem start\logs -Directory | Sort-Object LastWriteTime -Descending | Select-Object -First 1

# See API errors only
Select-String -Path "start\logs\*\api.log" -Pattern "ERROR|FAILED"
```

## Notes
- Self-service demo package is in `/docs/Layer0-Admin-Bridgeflow/`
- Known issues & test exclusions are documented in `KNOWN-ISSUES.md` (Phase 14 backlog)
