# Engineering Runbook: Zero-Downtime Deployment
**Service:** Core Settlement Engine  
**Version:** v3.1  

## Deployment Protocol
1. Verify database migrations are backwards-compatible before cutover.
2. Decision approved to use Blue-Green deployment with 5% canary routing.
3. Rationale: Eliminates downtime during high-volume banking settlement hours.
4. Assigned Lead: Sarah Chen. Target: Sprint 45.