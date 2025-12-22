# Test Design: Epic 4 - Cryptographic Messaging & Verification

**Date:** 2025-12-22
**Author:** Riddler
**Status:** Draft

---

## Executive Summary

**Scope:** Full test design for Epic 4 (Cryptographic Messaging & Verification)

**Risk Summary:**

- Total risks identified: 22
- High-priority risks (≥6): 12
- Critical categories: SEC (8), PERF (4), TECH (5), DATA (3), BUS (2)

**Coverage Summary:**

- P0 scenarios: 20 (40 hours)
- P1 scenarios: 15 (15 hours)
- P2/P3 scenarios: 10 (4 hours)
- **Total effort**: 59 hours (~7.5 days)

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description   | Probability | Impact | Score | Mitigation   | Owner   | Timeline |
| ------- | -------- | ------------- | ----------- | ------ | ----- | ------------ | ------- | -------- |
| R-001   | SEC      | Message signature verification bypass | 3           | 3      | 9     | Mandatory signature verification | Dev   | 2025-12-23 |
| R-002   | SEC      | Tampered messages displayed as valid | 3           | 3      | 9     | Server-side verification required | Dev   | 2025-12-23 |
| R-003   | SEC      | Private key exposure during signing | 2           | 3      | 6     | Secure memory handling, no logging | Dev   | 2025-12-23 |
| R-004   | SEC      | Invalid signature acceptance | 3           | 3      | 9     | Strict EdDSA verification | Dev   | 2025-12-23 |
| R-005   | SEC      | Message substitution attack | 3           | 3      | 9     | Content hashing before signing | Dev   | 2025-12-23 |
| R-006   | PERF     | Message delivery exceeds 2s NFR | 3           | 2      | 6     | Optimize verification, caching | Dev   | 2025-12-24 |
| R-007   | DATA     | Message history corruption | 2           | 3      | 6     | Database transactions, integrity checks | Dev   | 2025-12-24 |
| R-008   | TECH     | EdDSA signature library bugs | 2           | 3      | 6     | Use ed25519-dalek, comprehensive tests | Dev   | 2025-12-23 |
| R-009   | SEC      | Replay attacks with old messages | 2           | 3      | 6     | Timestamp validation, nonce tracking | Dev   | 2025-12-24 |
| R-010   | TECH     | WebSocket message transmission errors | 2           | 2      | 4     | Error handling, retry logic | Dev   | 2025-12-24 |
| R-011   | PERF     | Large messages cause delays | 2           | 2      | 4     | Message size limits, streaming | Dev   | 2025-12-24 |
| R-012   | BUS      | Users don't trust verification display | 3           | 2      | 6     | Clear UX, verification indicators | UX    | 2025-12-25 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description   | Probability | Impact | Score | Mitigation   | Owner   |
| ------- | -------- | ------------- | ----------- | ------ | ----- | ------------ | ------- |
| R-013   | SEC      | Signature display reveals private key | 1           | 3      | 3     | Display only public verification | Dev   |
| R-014   | TECH     | Message parsing errors | 2           | 2      | 4     | Schema validation | Dev   |
| R-015   | DATA     | Database deadlock with concurrent messages | 2           | 2      | 4     | Transaction isolation levels | Dev   |
| R-016   | TECH     | Clock skew affects timestamp validation | 2           | 2      | 4     | Allow time tolerance | Dev   |
| R-017   | PERF     | Signature verification bottleneck | 2           | 2      | 4     | Caching, parallel verification | Dev   |
| R-018   | BUS      | Profile name display issues | 2           | 2      | 4     | Fallback to public key | Dev   |
| R-019   | TECH     | Message queue overflow | 2           | 2      | 4     | Queue limits, backpressure | Dev   |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description   | Probability | Impact | Score | Action  |
| ------- | -------- | ------------- | ----------- | ------ | ----- | ------- |
| R-020   | TECH     | Edge cases in message formatting | 1           | 2      | 2     | Monitor |
| R-021   | BUS      | Users want message editing | 1           | 1      | 1     | Monitor |
| R-022   | TECH     | Non-ASCII character handling | 1           | 1      | 1     | Monitor |

### Risk Category Legend

- **TECH**: Technical/Architecture (flaws, integration, scalability)
- **SEC**: Security (access controls, auth, data exposure)
- **PERF**: Performance (SLA violations, degradation, resource limits)
- **DATA**: Data Integrity (loss, corruption, inconsistency)
- **BUS**: Business Impact (UX harm, logic errors, revenue)
- **OPS**: Operations (deployment, config, monitoring)

---

## Test Coverage Plan

### P0 (Critical) - Run on every commit

**Criteria**: Blocks core journey + High risk (≥6) + No workaround

| Requirement   | Test Level | Risk Link | Test Count | Owner | Notes   |
| ------------- | ---------- | --------- | ---------- | ----- | ------- |
| Message signature verification | API | R-001 | 8 | QA | Mandatory verification |
| Tampered message rejection | API | R-002 | 6 | QA | Invalid signature detection |
| Private key security | Unit | R-003 | 5 | DEV | No exposure, secure handling |
| Invalid signature rejection | API | R-004 | 6 | QA | EdDSA strict validation |
| Message substitution prevention | Unit | R-005 | 5 | DEV | Content hashing |
| Real-time delivery | E2E | R-006 | 5 | QA | 2s NFR compliance |
| Message history integrity | API | R-007 | 6 | QA | Database consistency |
| EdDSA library correctness | Unit | R-008 | 8 | DEV | Cryptographic verification |
| Replay attack prevention | API | R-009 | 4 | QA | Timestamp, nonce validation |
| Verification UX trust | E2E | R-012 | 4 | QA | Clear indicators, user confidence |

**Total P0**: 57 tests, 40 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement   | Test Level | Risk Link | Test Count | Owner | Notes   |
| ------------- | ---------- | --------- | ---------- | ----- | ------- |
| Message sending | E2E | R-014 | 3 | QA | Text input, sending flow |
| Sender identity display | E2E | R-018 | 3 | QA | Profile name or public key |
| Database concurrency | API | R-015 | 4 | QA | Concurrent message handling |
| Timestamp validation | API | R-016 | 3 | QA | Clock skew tolerance |
| Verification performance | API | R-017 | 3 | QA | Caching, optimization |
| Message queue management | API | R-019 | 3 | QA | Queue limits, overflow |

**Total P1**: 19 tests, 15 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement   | Test Level | Test Count | Owner | Notes   |
| ------------- | ---------- | ---------- | ----- | ------- |
| Message formatting edge cases | Unit | 4 | DEV | Special characters, encoding |
| Non-ASCII character support | Unit | 3 | DEV | Unicode, emoji handling |

**Total P2**: 7 tests, 2 hours

### P3 (Low) - Run on-demand

| Requirement   | Test Level | Test Count | Owner | Notes   |
| ------------- | ---------- | ---------- | ----- | ------- |
| Message editing (future feature) | E2E | 2 | QA | Feature exploration |
| Message analytics | API | 2 | QA | Usage tracking |

**Total P3**: 4 tests, 2 hours

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] Message signed and verified successfully (30s)
- [ ] Invalid signature rejected (45s)
- [ ] Message delivered within 2 seconds (45s)
- [ ] Verification indicator displays correctly (30s)

**Total**: 4 scenarios

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] API: Signature verification (2min)
- [ ] API: Tampered message rejection (2min)
- [ ] Unit: Private key security (1min)
- [ ] API: Invalid signature detection (1min)
- [ ] Unit: Content hashing (1min)
- [ ] E2E: Real-time delivery (2min)
- [ ] API: Message history integrity (1min)

**Total**: 7 scenarios

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] E2E: Message sending flow (3min)
- [ ] E2E: Sender identity display (2min)
- [ ] API: Database concurrency (3min)
- [ ] API: Timestamp validation (2min)
- [ ] API: Verification performance (2min)
- [ ] API: Message queue management (2min)

**Total**: 6 scenarios

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage

- [ ] Unit: Message formatting edge cases (15min)
- [ ] Unit: Non-ASCII character support (15min)
- [ ] E2E: Message editing exploration (10min)
- [ ] API: Message analytics (10min)

**Total**: 4 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority  | Count             | Hours/Test | Total Hours       | Notes                   |
| --------- | ----------------- | ---------- | ----------------- | ----------------------- |
| P0        | 57                | 0.70       | 40                | Complex setup, security |
| P1        | 19                | 0.79       | 15                | Standard coverage       |
| P2        | 7                 | 0.29       | 2                 | Simple scenarios        |
| P3        | 4                 | 0.50       | 2                 | Exploratory             |
| **Total** | **87**            | **-**      | **59**            | **~7.5 days**           |

### Prerequisites

**Test Data:**

- User factory (faker-based, auto-cleanup)
- Message fixture (setup/teardown for test messages)
- Signature fixture (valid/invalid test signatures)

**Tooling:**

- ed25519-dalek for cryptographic operations
- Rust testing framework (cargo test)
- Playwright for E2E tests
- tokio-tungstenite for WebSocket testing

**Environment:**

- WSL/Linux backend with WebSocket support
- SQLite database for message history
- Client-server setup for E2E tests

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: ≥95% (waivers required for failures)
- **P2/P3 pass rate**: ≥90% (informational)
- **High-risk mitigations**: 100% complete or approved waivers

### Coverage Targets

- **Critical paths**: ≥95% (messaging, verification)
- **Security scenarios**: 100% (SEC category)
- **Cryptographic operations**: 100%
- **Edge cases**: ≥80%

### Non-Negotiable Requirements

- [ ] All P0 tests pass
- [ ] No high-risk (≥6) items unmitigated
- [ ] Security tests (SEC category) pass 100%
- [ ] Messages delivered within 2s (NFR2)
- [ ] Every message cryptographically verified
- [ ] Tampered messages always rejected
- [ ] No signature verification bypass possible

---

## Mitigation Plans

### R-001: Message Signature Verification Bypass (Score: 9)

**Mitigation Strategy:** Mandatory server-side signature verification before message display
**Owner:** dev-team
**Timeline:** 2025-12-23
**Status:** Planned
**Verification:** Negative tests attempt to bypass verification

### R-002: Tampered Messages Displayed (Score: 9)

**Mitigation Strategy:** Server-side verification using sender's public key from database
**Owner:** dev-team
**Timeline:** 2025-12-23
**Status:** Planned
**Verification:** Tampering attempt tests

### R-004: Invalid Signature Acceptance (Score: 9)

**Mitigation Strategy:** Strict EdDSA verification with no tolerance for invalid signatures
**Owner:** dev-team
**Timeline:** 2025-12-23
**Status:** Planned
**Verification:** Cryptographic test vectors

### R-005: Message Substitution Attack (Score: 9)

**Mitigation Strategy:** Hash message content before signing, verify hash matches
**Owner:** dev-team
**Timeline:** 2025-12-23
**Status:** Planned
**Verification:** Substitution attempt tests

### R-009: Replay Attacks (Score: 6)

**Mitigation Strategy:** Timestamp validation and nonce tracking to prevent replay
**Owner:** dev-team
**Timeline:** 2025-12-24
**Status:** Planned
**Verification:** Replay attack simulation

---

## Assumptions and Dependencies

### Assumptions

1. EdDSA signatures are cryptographically secure
2. Users have valid private keys (Epic 1 complete)
3. Profiles exist for all users (Epic 2 complete)
4. WebSocket infrastructure is stable (Epic 3 complete)
5. Clock synchronization is reasonable (<60s skew)

### Dependencies

1. **Cryptographic Library**: ed25519-dalek - Required by 2025-12-23
2. **Previous Epics**: Epics 1-3 complete - Required by 2025-12-24
3. **WebSocket**: tokio-tungstenite - Required by 2025-12-23
4. **Database**: SQLite with message history - Required by 2025-12-23

### Risks to Plan

- **Risk**: EdDSA library has critical vulnerability
  - **Impact**: Complete security failure
  - **Contingency**: Library audit, alternative libraries evaluated
- **Risk**: Cryptographic operations too slow
  - **Impact**: 2s delivery requirement not met
  - **Contingency**: Caching, parallel verification, hardware acceleration

---

## Approval

**Test Design Approved By:**

- [ ] Product Manager: {name} Date: {date}
- [ ] Tech Lead: {name} Date: {date}
- [ ] QA Lead: {name} Date: {date}

**Comments:**

---

---

---

## Appendix

### Knowledge Base References

- `risk-governance.md` - Risk classification framework
- `probability-impact.md` - Risk scoring methodology
- `test-levels-framework.md` - Test level selection
- `test-priorities-matrix.md` - P0-P3 prioritization

### Related Documents

- PRD: /home/riddler/mp/_bmad-output/prd.md
- Epic: /home/riddler/mp/_bmad-output/epics.md
- Architecture: /home/riddler/mp/_bmad-output/architecture.md
- Project Context: /home/riddler/mp/_bmad-output/project-context.md

---

**Generated by**: BMad TEA Agent - Test Architect Module
**Workflow**: `_bmad/bmm/testarch/test-design`
**Version**: 4.0 (BMad v6)
