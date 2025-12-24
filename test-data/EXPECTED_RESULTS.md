# Stress Test Expected Results

This document describes the expected outcomes when uploading `stress-test-events.json`.

## Test Cases

| Referral ID | Case Description | Expected Status | Expected Appointment | Data Quality Flag |
|-------------|------------------|-----------------|---------------------|-------------------|
| REF-001 | Normal happy path (3 events) | COMPLETED | APT-001 (historical) | None |
| REF-002 | Duplicate events (same seq twice) | SCHEDULED | None | Duplicate detected |
| REF-003 | Out-of-order events | CANCELLED | APT-003 (cancelled) | None |
| REF-004 | Gap in sequence (missing seq 2) | SCHEDULED | None | Gap detected |
| REF-005 | Appointment cancelled | RECEIVED | None (cancelled) | None |
| REF-006 | Multiple appointments (reschedule) | SCHEDULED | APT-006B (latest) | None |
| REF-007 | Terminal state (NO_SHOW) | NO_SHOW | APT-007 | None |
| REF-RECEIVED | Status enum test | RECEIVED | None | None |
| REF-SCHEDULED | Status enum test | SCHEDULED | None | None |
| REF-COMPLETED | Status enum test | COMPLETED | None | None |
| REF-CANCELLED | Status enum test | CANCELLED | None | None |
| REF-NO_SHOW | Status enum test | NO_SHOW | None | None |
| REF-009 | Large sequence numbers | SCHEDULED | None | None |
| REF-010 | Empty payload | RECEIVED (default) | None | Invalid event? |

## Summary Metrics (Expected)

After upload, the Dashboard should show:
- **Total Referrals**: 14
- **By Status**:
  - RECEIVED: 2 (REF-005, REF-RECEIVED)
  - SCHEDULED: 4 (REF-002, REF-006, REF-SCHEDULED, REF-009)
  - COMPLETED: 2 (REF-001, REF-COMPLETED)
  - CANCELLED: 2 (REF-003, REF-CANCELLED)
  - NO_SHOW: 2 (REF-007, REF-NO_SHOW)
- **Total Events**: 30 (or 29 if duplicate is filtered)

## Data Quality Issues (Expected)

The Data Quality page should flag:
1. **REF-002**: Duplicate event at seq=1
2. **REF-004**: Gap (missing seq=2)
3. **REF-010**: Possibly flagged for empty payload

## How to Verify

1. Upload `test-data/stress-test-events.json` via Admin Upload
2. Check Dashboard → Overview for totals
3. Check Dashboard → Referrals list for individual statuses
4. Check Dashboard → Data Quality for flags
5. Compare against this document
