# Test Design: Epic 3 - Real-time Lobby & Presence

**Date:** 2025-12-22
**Author:** Riddler
**Status:** Draft

---

## Executive Summary

**Scope:** Full test design for Epic 3 (Real-time Lobby & Presence)

**Risk Summary:**

- Total risks identified: 16
- High-priority risks (≥6): 9
- Critical categories: PERF (5), TECH (5), DATA (3), SEC (2), BUS (1)

**Coverage Summary:**

- P0 scenarios: 14 (28 hours)
- P1 scenarios: 11 (11 hours)
- P2/P3 scenarios: 7 (3 hours)
- **Total effort**: 42 hours (~5.5 days)

---

## Risk Assessment

### High-Priority Risks (Score ≥6)

| Risk ID | Category | Description   | Probability | Impact | Score | Mitigation   | Owner   | Timeline |
| ------- | -------- | ------------- | ----------- | ------ | ----- | ------------ | ------- | -------- |
| R-001   | PERF     | Lobby updates exceed 2s NFR requirement | 3           | 3      | 9     | Optimize WebSocket, connection pooling | Dev   | 2025-12-23 |
| R-002   | TECH     | WebSocket connection failures | 3           | 3      | 9     | Auto-reconnect, connection health checks | Dev   | 2025-12-23 |
| R-003   | PERF     | Memory leaks with many concurrent users | 2           | 3      | 6     | Proper cleanup, connection limits | Dev   | 2025-12-24 |
| R-004   | DATA     | Presence state inconsistency | 3           | 3      | 9     | Centralized state management, atomic updates | Dev   | 2025-12-23 |
| R-005   | TECH     | Race conditions in user join/leave | 3           | 2      | 6     | Synchronization mechanisms | Dev   | 2025-12-24 |
| R-006   | SEC      | Unauthorized lobby access | 2           | 3      | 6     | Authentication required for WebSocket | Dev   | 2025-12-24 |
| R-007   | DATA     | User list corruption with concurrent updates | 2           | 3      | 6     | Thread-safe data structures | Dev   | 2025-12-24 |
| R-008   | PERF     | Server overload with 100+ concurrent users | 2           | 3      | 6     | Load testing, horizontal scaling | Dev   | 2025-12-25 |
| R-009   | BUS      | Users don't appear in lobby (ghost users) | 3           | 2      | 6     | Heartbeat mechanism, timeout detection | Dev   | 2025-12-24 |

### Medium-Priority Risks (Score 3-4)

| Risk ID | Category | Description   | Probability | Impact | Score | Mitigation   | Owner   |
| ------- | -------- | ------------- | ----------- | ------ | ----- | ------------ | ------- |
| R-010   | TECH     | WebSocket message format errors | 2           | 2      | 4     | Schema validation | Dev   |
| R-011   | DATA     | Profile name display incorrect | 2           | 2      | 4     | Profile lookup validation | QA   |
| R-012   | TECH     | Network partition handling | 2           | 2      | 4     | Timeout and retry logic | Dev   |
| R-013   | OPS      | Server restart loses lobby state | 2           | 2      | 4     | State persistence | Dev   |
| R-014   | PERF     | Large user lists cause UI lag | 2           | 2      | 4     | Pagination, virtual scrolling | Dev   |
| R-015   | TECH     | Client disconnects without notice | 2           | 2      | 4     | Graceful disconnect handling | Dev   |

### Low-Priority Risks (Score 1-2)

| Risk ID | Category | Description   | Probability | Impact | Score | Action  |
| ------- | -------- | ------------- | ----------- | ------ | ----- | ------- |
| R-016   | BUS      | Users confused by lobby UI | 1           | 1      | 1     | Monitor |

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
| Real-time lobby updates | E2E | R-001 | 5 | QA | 2s NFR compliance |
| WebSocket connection | API | R-002 | 6 | QA | Connection lifecycle, errors |
| Presence state management | API | R-004 | 5 | QA | State consistency, atomic updates |
| User join/leave detection | E2E | R-005 | 4 | QA | Race condition prevention |
| Unauthorized access prevention | API | R-006 | 3 | QA | Authentication required |
| Memory leak prevention | API | R-003 | 4 | DEV | Resource cleanup |
| User list integrity | API | R-007 | 4 | QA | Concurrent update handling |
| Concurrent user load | API | R-008 | 3 | QA | 100+ users, load testing |
| Ghost user detection | E2E | R-009 | 3 | QA | Heartbeat, timeout |

**Total P0**: 37 tests, 28 hours

### P1 (High) - Run on PR to main

**Criteria**: Important features + Medium risk (3-4) + Common workflows

| Requirement   | Test Level | Risk Link | Test Count | Owner | Notes   |
| ------------- | ---------- | --------- | ---------- | ----- | ------- |
| WebSocket message validation | Unit | R-010 | 4 | DEV | Schema validation |
| Profile name display | E2E | R-011 | 3 | QA | Correct identity display |
| Network partition recovery | E2E | R-012 | 3 | QA | Timeout, retry scenarios |
| Server restart state | API | R-013 | 2 | QA | State persistence |
| Large user list UI | E2E | R-014 | 2 | QA | UI performance, pagination |
| Graceful disconnect | API | R-015 | 3 | QA | Clean disconnect handling |

**Total P1**: 17 tests, 11 hours

### P2 (Medium) - Run nightly/weekly

**Criteria**: Secondary features + Low risk (1-2) + Edge cases

| Requirement   | Test Level | Test Count | Owner | Notes   |
| ------------- | ---------- | ---------- | ----- | ------- |
| Lobby UI usability | E2E | 3 | QA | User guidance, clarity |

**Total P2**: 3 tests, 1 hour

### P3 (Low) - Run on-demand

| Requirement   | Test Level | Test Count | Owner | Notes   |
| ------------- | ---------- | ---------- | ----- | ------- |
| User behavior analytics | API | 2 | QA | Usage tracking |
| Lobby UI customization | E2E | 2 | QA | Theme, layout options |

**Total P3**: 4 tests, 2 hours

---

## Execution Order

### Smoke Tests (<5 min)

**Purpose**: Fast feedback, catch build-breaking issues

- [ ] WebSocket connects successfully (30s)
- [ ] User appears in lobby after joining (45s)
- [ ] Lobby updates within 2 seconds (45s)
- [ ] User removed from lobby after disconnect (45s)

**Total**: 4 scenarios

### P0 Tests (<10 min)

**Purpose**: Critical path validation

- [ ] E2E: Real-time lobby updates (2min)
- [ ] API: WebSocket connection lifecycle (1min)
- [ ] API: Presence state management (1min)
- [ ] E2E: User join/leave race conditions (2min)
- [ ] API: Unauthorized access prevention (1min)
- [ ] API: Memory leak detection (1min)
- [ ] API: Concurrent user handling (1min)

**Total**: 7 scenarios

### P1 Tests (<30 min)

**Purpose**: Important feature coverage

- [ ] Unit: Message schema validation (1min)
- [ ] E2E: Profile name display (2min)
- [ ] E2E: Network partition recovery (3min)
- [ ] API: Server restart state (2min)
- [ ] E2E: Large user list UI (2min)
- [ ] API: Disconnect handling (2min)

**Total**: 6 scenarios

### P2/P3 Tests (<60 min)

**Purpose**: Full regression coverage

- [ ] E2E: UI usability scenarios (15min)
- [ ] API: User analytics (10min)
- [ ] E2E: UI customization (15min)

**Total**: 3 scenarios

---

## Resource Estimates

### Test Development Effort

| Priority  | Count             | Hours/Test | Total Hours       | Notes                   |
| --------- | ----------------- | ---------- | ----------------- | ----------------------- |
| P0        | 37                | 0.76       | 28                | Complex setup, real-time |
| P1        | 17                | 0.65       | 11                | Standard coverage       |
| P2        | 3                 | 0.33       | 1                 | Simple scenarios        |
| P3        | 4                 | 0.50       | 2                 | Exploratory             |
| **Total** | **61**            | **-**      | **42**            | **~5.5 days**           |

### Prerequisites

**Test Data:**

- User factory (faker-based, auto-cleanup)
- WebSocket fixture (setup/teardown for connections)
- Lobby state fixture (test data for presence)

**Tooling:**

- tokio-tungstenite for WebSocket testing
- Rust testing framework (cargo test)
- Playwright for E2E tests
- Load testing tools (k6 or similar)

**Environment:**

- WSL/Linux backend with WebSocket support
- SQLite database
- Multiple client connections for testing

---

## Quality Gate Criteria

### Pass/Fail Thresholds

- **P0 pass rate**: 100% (no exceptions)
- **P1 pass rate**: ≥95% (waivers required for failures)
- **P2/P3 pass rate**: ≥90% (informational)
- **High-risk mitigations**: 100% complete or approved waivers

### Coverage Targets

- **Critical paths**: ≥90% (WebSocket, presence, updates)
- **Real-time performance**: 100% (PERF category)
- **Concurrent scenarios**: ≥85%
- **Edge cases**: ≥70%

### Non-Negotiable Requirements

- [ ] All P0 tests pass
- [ ] No high-risk (≥6) items unmitigated
- [ ] Real-time updates meet 2s requirement (NFR2, NFR3)
- [ ] WebSocket connections stable
- [ ] Presence state always consistent
- [ ] No ghost users in lobby

---

## Mitigation Plans

### R-001: Lobby Updates Exceed 2s (Score: 9)

**Mitigation Strategy:** Optimize WebSocket message handling, implement connection pooling, reduce payload size
**Owner:** dev-team
**Timeline:** 2025-12-23
**Status:** Planned
**Verification:** Performance testing with timing measurements

### R-002: WebSocket Connection Failures (Score: 9)

**Mitigation Strategy:** Auto-reconnect logic, connection health checks, exponential backoff
**Owner:** dev-team
**Timeline:** 2025-12-23
**Status:** Planned
**Verification:** Network failure simulation tests

### R-004: Presence State Inconsistency (Score: 9)

**Mitigation Strategy:** Centralized state management, atomic database updates, event sourcing
**Owner:** dev-team
**Timeline:** 2025-12-23
**Status:** Planned
**Verification:** Concurrent update stress tests

### R-005: Race Conditions in Join/Leave (Score: 6)

**Mitigation Strategy:** Synchronization mechanisms, database transactions, event ordering
**Owner:** dev-team
**Timeline:** 2025-12-24
**Status:** Planned
**Verification:** Multi-client concurrent testing

---

## Assumptions and Dependencies

### Assumptions

1. WebSocket infrastructure is stable and available
2. Users can successfully authenticate and create profiles (Epics 1-2 complete)
3. Database supports concurrent reads/writes
4. Network latency is reasonable (<100ms)

### Dependencies

1. **WebSocket Library**: tokio-tungstenite - Required by 2025-12-23
2. **Authentication**: Epics 1-2 complete - Required by 2025-12-24
3. **Database**: SQLite with concurrent access - Required by 2025-12-23
4. **Load Testing**: k6 or similar - Required by 2025-12-25

### Risks to Plan

- **Risk**: WebSocket library compatibility issues
  - **Impact**: Delays in real-time implementation
  - **Contingency**: Alternative WebSocket libraries evaluated
- **Risk**: Load testing infrastructure unavailable
  - **Impact**: Cannot validate 100+ concurrent users
  - **Contingency**: Manual testing with multiple clients

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
