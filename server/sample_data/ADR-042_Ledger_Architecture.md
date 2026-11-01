# Architecture Decision Record: ADR-042
**Project:** Nexus Core Ledger & Payment Gateway Migration  
**Status:** Approved  
**Author:** Elena Vance (Lead Solutions Architect)  
**Date:** 2026-10-14  
**Classification:** Internal Engineering Confidential  

---

## 1. Context & Problem Statement
The legacy ledger relies on a monolithic DynamoDB NoSQL cluster with custom eventual-consistency resolution logic. This has caused reconciliation discrepancies exceeding $42,000 during high-throughput flash events. The engineering organization requires a deterministic, ACID-compliant ledger storage solution capable of supporting 8,500 financial transactions per second with real-time auditability.

## 2. Decision
We have decided to adopt **PostgreSQL 16 with TimescaleDB hypertables** for all double-entry transaction ledgers, replacing the DynamoDB store.

### Rationale
1. **Strict ACID Compliance:** Immediate row-level locking and strict serializability are mandatory for cross-border payment settlement.
2. **Audit Query Performance:** TimescaleDB hypertables provide native chunking by timestamp, reducing 90-day forensic audit query execution times from 4 minutes to under 650ms.
3. **Regulatory Requirements:** Compliance standards (FINRA & European Central Bank DORA directives) require verifiable point-in-time state reconstruction.

**Lead Owner:** Elena Vance (Lead Solutions Architect)  
**Target Completion:** Sprint 43 (October 24, 2026)  
**Status:** Approved and Implementation In Progress  

---

## 3. External Dependencies & Blockers
- **Critical Dependency:** Core Banking Gateway API v3.4 release by 3rd-party vendor (FinVance Inc.).
- **Dependency Status:** UNRESOLVED. Vendor support ticket #FV-9021 remains open without an SLA commitment or staging endpoint delivery date.

## 4. Key Management & Security
A decision was recorded to rotate root AWS KMS customer-managed signing keys on a 14-day cycle. 
*(Note: No rationale or compliance justification was provided for this 14-day frequency; standard security policy specifies 90-day rotation).*
