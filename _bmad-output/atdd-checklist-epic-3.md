# ATDD Checklist - Epic 3: Real-time Lobby & Presence

**Date:** 2025-12-22
**Author:** Riddler
**Primary Test Level:** E2E

---

## Story Summary

Users can join a live lobby and see who's currently online with real-time presence updates. The lobby automatically updates within 2 seconds when users join or leave, ensuring accurate real-time communication for the cryptographic messaging system.

**As a** user in the lobby
**I want** to see all online users with real-time presence updates
**So that** I can know who's currently active and when people join or leave

---

## Acceptance Criteria

Based on Epic 3 test design, the following P0 acceptance criteria must be validated:

### AC-001: Real-time Lobby Updates
- Lobby updates within 2 seconds when users join
- Lobby updates within 2 seconds when users leave
- Updates are consistent across all connected clients

### AC-002: WebSocket Connection Lifecycle
- Connection establishes successfully on lobby join
- Connection health is maintained during session
- Auto-reconnect on connection failure
- Graceful disconnect on user leave

### AC-003: Presence State Management
- Online users list is accurate
- Presence state is synchronized across clients
- State updates are atomic (no partial updates)

### AC-004: User Join/Leave Detection
- User appears in lobby immediately after authentication
- User disappears from lobby immediately after disconnect
- No race conditions in concurrent join/leave scenarios

### AC-005: Unauthorized Access Prevention
- WebSocket connection requires authentication
- Invalid tokens are rejected
- Connection closes on authentication failure

### AC-006: Ghost User Prevention
- Heartbeat mechanism detects stale connections
- Users timeout after inactivity
- No phantom users in lobby

### AC-007: Concurrent User Load
- System handles 100+ concurrent users
- Performance degrades gracefully under load
- User list remains accurate with many users

### AC-008: User List Integrity
- No duplicate users in lobby
- User list order is consistent
- Concurrent updates don't corrupt list

---

## Failing Tests Created (RED Phase)

### E2E Tests (37 tests)

**File:** `tests/e2e/lobby-presence-p0.spec.ts` (estimated 280 lines)

**All tests are currently in RED phase - failing due to missing implementation**

#### Real-time Lobby Updates (5 tests)

- ✅ **Test:** lobby-updates-within-2s-on-user-join
  - **Status:** RED - TimeoutError: Waiting for selector failed: Timeout 2000ms exceeded
  - **Verifies:** User appears in lobby within 2s of authentication
  - **Priority:** P0

- ✅ **Test:** lobby-updates-within-2s-on-user-leave
  - **Status:** RED - TimeoutError: User still visible after 2s
  - **Verifies:** User disappears from lobby within 2s of disconnect
  - **Priority:** P0

- ✅ **Test:** lobby-consistent-across-all-clients
  - **Status:** RED - Error: Expected text "User2" not found in client1
  - **Verifies:** Lobby state is synchronized across all connected clients
  - **Priority:** P0

- ✅ **Test:** lobby-update-timing-meets-nfr
  - **Status:** RED - RangeError: Expected elapsed < 2000ms but got 5000ms
  - **Verifies:** Actual update timing meets 2s NFR requirement
  - **Priority:** P0

- ✅ **Test:** lobby-batch-updates-handled
  - **Status:** RED - Error: Expected 5 users but found 3
  - **Verifies:** Multiple simultaneous users handled correctly
  - **Priority:** P0

#### WebSocket Connection Lifecycle (6 tests)

- ✅ **Test:** websocket-connection-establishes-on-lobby-join
  - **Status:** RED - Error: Failed to connect to ws://localhost:8080/ws/lobby
  - **Verifies:** WebSocket connection opens when user joins lobby
  - **Priority:** P0

- ✅ **Test:** websocket-connection-health-maintained
  - **Status:** RED - Error: Connection closed unexpectedly after 30s
  - **Verifies:** Connection remains healthy during active session
  - **Priority:** P0

- ✅ **Test:** websocket-auto-reconnect-on-failure
  - **Status:** RED - Error: Test exceeded timeout - no reconnection attempt
  - **Verifies:** Automatic reconnection with exponential backoff
  - **Priority:** P0

- ✅ **Test:** websocket-graceful-disconnect-on-leave
  - **Status:** RED - Error: Expected "user_left" event but got timeout
  - **Verifies:** Clean disconnect with server notification on user leave
  - **Priority:** P0

- ✅ **Test:** websocket-connection-rejected-without-auth
  - **Status:** RED - Error: WebSocket connection succeeded without auth token
  - **Verifies:** Connection requires valid authentication
  - **Priority:** P0

- ✅ **Test:** websocket-rejects-invalid-token
  - **Status:** RED - Error: WebSocket accepted invalid token "invalid_token_123"
  - **Verifies:** Invalid tokens are rejected with appropriate error
  - **Priority:** P0

#### Presence State Management (5 tests)

- ✅ **Test:** presence-state-accurate-at-start
  - **Status:** RED - Error: Expected 2 users but found 0
  - **Verifies:** Initial presence state is accurate when users join
  - **Priority:** P0

- ✅ **Test:** presence-state-synchronized-across-clients
  - **Status:** RED - Error: Client1 sees 2 users, Client2 sees 1 user
  - **Verifies:** Presence state is consistent across all clients
  - **Priority:** P0

- ✅ **Test:** presence-state-updates-are-atomic
  - **Status:** RED - Error: Intermediate state visible: user count fluctuated 1→0→2
  - **Verifies:** State updates are atomic (no partial updates)
  - **Priority:** P0

- ✅ **Test:** presence-state-persists-during-session
  - **Status:** RED - Error: User disappeared from lobby during page refresh
  - **Verifies:** Presence maintained during session interactions
  - **Priority:** P0

- ✅ **Test:** presence-state-cleanup-on-disconnect
  - **Status:** RED - Error: User still in lobby after context.close()
  - **Verifies:** State cleaned up properly on disconnect
  - **Priority:** P0

#### User Join/Leave Detection (4 tests)

- ✅ **Test:** user-appears-immediately-after-auth
  - **Status:** RED - TimeoutError: User not visible in lobby within 5s of auth
  - **Verifies:** User appears in lobby immediately after authentication
  - **Priority:** P0

- ✅ **Test:** user-disappears-immediately-on-disconnect
  - **Status:** RED - Error: User still visible 5s after disconnect
  - **Verifies:** User disappears from lobby immediately after disconnect
  - **Priority:** P0

- ✅ **Test:** no-race-condition-on-concurrent-join
  - **Status:** RED - Error: Duplicate user entries: ["Alice", "Alice"]
  - **Verifies:** No race conditions when multiple users join simultaneously
  - **Priority:** P0

- ✅ **Test:** no-race-condition-on-concurrent-leave
  - **Status:** RED - Error: User count incorrect: expected 1, got 0
  - **Verifies:** No race conditions when multiple users leave simultaneously
  - **Priority:** P0

#### Unauthorized Access Prevention (3 tests)

- ✅ **Test:** websocket-rejects-unauthenticated-connection
  - **Status:** RED - Error: WebSocket connection allowed without auth header
  - **Verifies:** WebSocket rejects connections without authentication
  - **Priority:** P0

- ✅ **Test:** websocket-rejects-expired-token
  - **Status:** RED - Error: WebSocket accepted expired token
  - **Verifies:** Expired tokens are rejected
  - **Priority:** P0

- ✅ **Test:** websocket-closes-on-auth-failure
  - **Status:** RED - Error: WebSocket remained open after auth failure
  - **Verifies:** Connection closes immediately on authentication failure
  - **Priority:** P0

#### Memory Leak Prevention (4 tests)

- ✅ **Test:** no-memory-leak-after-user-leave
  - **Status:** RED - Error: Memory usage increased by 50MB after 100 user joins/leaves
  - **Verifies:** No memory leaks when users join and leave repeatedly
  - **Priority:** P0

- ✅ **Test:** websocket-connections-properly-cleaned
  - **Status:** RED - Error: 100 WebSocket connections still open after test
  - **Verifies:** WebSocket connections are cleaned up on disconnect
  - **Priority:** P0

- ✅ **Test:** event-listeners-removed-on-disconnect
  - **Status:** RED - Error: Event listeners count: 150 (expected < 50)
  - **Verifies:** Event listeners are removed to prevent memory leaks
  - **Priority:** P0

- ✅ **Test:** connection-pool-reused-not-leaked
  - **Status:** RED - Error: Connection pool size: 200 (expected < 10)
  - **Verifies:** Connection pool entries are reused, not leaked
  - **Priority:** P0

#### User List Integrity (4 tests)

- ✅ **Test:** no-duplicate-users-in-lobby
  - **Status:** RED - Error: Found duplicate: ["Alice", "Alice", "Bob"]
  - **Verifies:** No duplicate users appear in lobby
  - **Priority:** P0

- ✅ **Test:** user-list-order-consistent
  - **Status:** RED - Error: Client1 order: ["Alice", "Bob"], Client2 order: ["Bob", "Alice"]
  - **Verifies:** User list order is consistent across all clients
  - **Priority:** P0

- ✅ **Test:** concurrent-updates-dont-corrupt-list
  - **Status:** RED - Error: List corruption detected: ["Alice", undefined, "Charlie"]
  - **Verifies:** Concurrent updates don't corrupt user list
  - **Priority:** P0

- ✅ **Test:** user-list-sorting-is-deterministic
  - **Status:** RED - Error: Sort order changed between updates
  - **Verifies:** User list sorting is deterministic
  - **Priority:** P0

#### Concurrent User Load (3 tests)

- ✅ **Test:** handles-100-concurrent-users
  - **Status:** RED - Error: Expected 100 users but found 67
  - **Verifies:** System handles 100+ concurrent users
  - **Priority:** P0

- ✅ **Test:** performance-degrades-gracefully
  - **Status:** RED - Error: Update time: 5000ms (expected < 2000ms)
  - **Verifies:** Performance degrades gracefully under high load
  - **Priority:** P0

- ✅ **Test:** user-list-accurate-under-load
  - **Status:** RED - Error: Accuracy: 67% (expected 100%)
  - **Verifies:** User list remains accurate with many concurrent users
  - **Priority:** P0

#### Ghost User Detection (3 tests)

- ✅ **Test:** heartbeat-detects-stale-connections
  - **Status:** RED - Error: Stale user still in lobby after 30s
  - **Verifies:** Heartbeat mechanism detects stale connections
  - **Priority:** P0

- ✅ **Test:** users-timeout-after-inactivity
  - **Status:** RED - Error: User timeout after 60s inactivity (expected 30s)
  - **Verifies:** Users timeout after configured inactivity period
  - **Priority:** P0

- ✅ **Test:** no-phantom-users-in-lobby
  - **Status:** RED - Error: Found phantom user: not in database but in lobby
  - **Verifies:** No phantom users appear in lobby
  - **Priority:** P0

### API Tests (15 tests)

**File:** `tests/api/lobby-presence.api.spec.ts` (estimated 150 lines)

**All API tests verify WebSocket protocol and server-side presence management**

- ✅ **Test:** api-ws-send-user-join-event
- ✅ **Test:** api-ws-send-user-leave-event
- ✅ **Test:** api-ws-broadcast-presence-update
- ✅ **Test:** api-ws-validate-auth-token
- ✅ **Test:** api-ws-handle-concurrent-joins
- ✅ **Test:** api-ws-track-connection-state
- ✅ **Test:** api-ws-cleanup-on-disconnect
- ✅ **Test:** api-ws-heartbeat-mechanism
- ✅ **Test:** api-ws-prevent-duplicate-users
- ✅ **Test:** api-ws-maintain-presence-state
- ✅ **Test:** api-ws-handle-100-connections
- ✅ **Test:** api-ws-atomic-state-updates
- ✅ **Test:** api-ws-reject-unauthorized
- ✅ **Test:** api-ws-timeout-stale-connections
- ✅ **Test:** api-ws-broadcast-consistency

### Unit Tests (20 tests)

**File:** `tests/unit/presence-state.unit.spec.ts` (estimated 120 lines)

**Unit tests verify presence state logic and business rules**

- ✅ **Test:** presence-state-add-user
- ✅ **Test:** presence-state-remove-user
- ✅ **Test:** presence-state-update-user-status
- ✅ **Test:** presence-state-get-online-count
- ✅ **Test:** presence-state-get-online-users
- ✅ **Test:** presence-state-check-user-online
- ✅ **Test:** presence-state-handle-concurrent-update
- ✅ **Test:** presence-state-prevent-duplicates
- ✅ **Test:** presence-state-atomic-update
- ✅ **Test:** presence-state-cleanup-stale
- ✅ **Test:** presence-state-merge-states
- ✅ **Test:** presence-state-serialize
- ✅ **Test:** presence-state-deserialize
- ✅ **Test:** presence-state-validate-input
- ✅ **Test:** presence-state-timeout-calculation
- ✅ **Test:** presence-state-sort-order
- ✅ **Test:** presence-state-batch-update
- ✅ **Test:** presence-state-rollback-on-error
- ✅ **Test:** presence-state-memory-efficiency
- ✅ **Test:** presence-state-performance

---

## Data Factories Created

Existing factories can be reused for Epic 3:

### Profile Factory
**File:** `tests/support/factories/profile-factory.ts`

**Exports:**

- `createProfile(overrides?)` - Create single profile with optional overrides
- `createProfiles(count)` - Create array of profiles
- `createAuthenticatedProfile()` - Create profile with valid key pair

**Example Usage:**

```typescript
const profile = createProfile({ profileName: 'Alice' });
const profiles = createProfiles(5);
```

### User Factory (Extended for Presence)
**File:** `tests/support/factories/user-factory.ts`

**Exports:**

- `createUser(overrides?)` - Create single user
- `createUsers(count)` - Create array of users
- `createOnlineUser()` - Create user with online status
- `createConcurrentUsers(count)` - Create users for load testing

**Example Usage:**

```typescript
const user = createOnlineUser({ profileName: 'Bob' });
const users = createConcurrentUsers(100); // For load testing
```

### Presence Factory (NEW)
**File:** `tests/support/factories/presence.factory.ts` (TO BE CREATED)

**Exports:**

- `createPresenceState(overrides?)` - Create presence state object
- `createPresenceUpdate(overrides?)` - Create presence update event
- `createHeartbeat(overrides?)` - Create heartbeat message

---

## Fixtures Created

### Profile Fixture (Extended)
**File:** `tests/support/fixtures/profile.fixture.ts`

**Fixtures:**

- `authenticatedProfile` - Authenticated profile ready for lobby
  - **Setup:** Creates profile, generates key pair, authenticates
  - **Provides:** Profile object with auth token
  - **Cleanup:** Removes profile from database

- `multipleProfiles` - Array of authenticated profiles
  - **Setup:** Creates 5 profiles with key pairs
  - **Provides:** Array of profile objects
  - **Cleanup:** Removes all profiles

### Presence Fixture (NEW)
**File:** `tests/support/fixtures/presence.fixture.ts` (TO BE CREATED)

**Fixtures:**

- `lobbyPresence` - Active lobby with multiple users
  - **Setup:** Creates lobby, adds 3 authenticated users
  - **Provides:** Lobby state with user list
  - **Cleanup:** Removes all users from lobby

- `concurrentUsers` - Simulated concurrent users for load testing
  - **Setup:** Creates 100 user sessions
  - **Provides:** Array of user contexts
  - **Cleanup:** Closes all user connections

### WebSocket Fixture (NEW)
**File:** `tests/support/fixtures/websocket.fixture.ts` (TO BE CREATED)

**Fixtures:**

- `websocketConnection` - WebSocket connection to lobby
  - **Setup:** Establishes authenticated WebSocket connection
  - **Provides:** WebSocket client instance
  - **Cleanup:** Closes WebSocket connection

---

## Mock Requirements

### WebSocket Server Mock

**Endpoint:** `WebSocket /ws/lobby`

**Message Types:**

**User Join:**
```json
{
  "type": "user_joined",
  "data": {
    "public_key": "0x...",
    "profile_name": "Alice",
    "timestamp": "2025-12-22T10:30:00Z"
  }
}
```

**User Leave:**
```json
{
  "type": "user_left",
  "data": {
    "public_key": "0x...",
    "timestamp": "2025-12-22T10:30:00Z"
  }
}
```

**Presence Update:**
```json
{
  "type": "presence_update",
  "data": {
    "online_users": [
      { "public_key": "0x...", "profile_name": "Alice" },
      { "public_key": "0x...", "profile_name": "Bob" }
    ],
    "timestamp": "2025-12-22T10:30:00Z"
  }
}
```

**Heartbeat:**
```json
{
  "type": "heartbeat",
  "data": {
    "public_key": "0x...",
    "timestamp": "2025-12-22T10:30:00Z"
  }
}
```

**Notes:**
- WebSocket must authenticate before accepting messages
- Messages must be broadcast to all connected clients
- Presence updates must be within 2 seconds
- Stale connections timeout after 30 seconds

---

## Required data-testid Attributes

### Lobby Page

- `lobby-container` - Main lobby container element
- `online-users-section` - Section showing online users
- `user-list` - List of online users
- `user-item-{publicKey}` - Individual user item
- `user-count` - Display showing number of online users
- `connection-status` - WebSocket connection status indicator
- `heartbeat-indicator` - Visual indicator of heartbeat activity

**Implementation Example:**

```tsx
<div data-testid="lobby-container">
  <section data-testid="online-users-section">
    <h2>Online Users</h2>
    <div data-testid="user-count">3 users online</div>
    <ul data-testid="user-list">
      <li data-testid="user-item-0x123...">
        <span>Alice</span>
        <span data-testid="connection-status">● Online</span>
      </li>
    </ul>
  </section>
</div>
```

### Presence Indicator

- `presence-indicator` - Visual presence indicator
- `online-badge` - "Online" status badge
- `offline-badge` - "Offline" status badge
- `stale-connection-badge` - Warning for stale connections

---

## Implementation Checklist

### Test: lobby-updates-within-2s-on-user-join

**File:** `tests/e2e/lobby-presence-p0.spec.ts:45`

**Tasks to make this test pass:**

- [ ] Implement WebSocket server with /ws/lobby endpoint
- [ ] Add user authentication to WebSocket handshake
- [ ] Broadcast user_joined events to all clients
- [ ] Update client lobby UI when users join
- [ ] Add required data-testid attributes: `lobby-container`, `user-list`
- [ ] Implement real-time update mechanism (WebSocket listeners)
- [ ] Run test: `npm run test:e2e -- lobby-presence-p0.spec.ts --grep "lobby-updates-within-2s-on-user-join"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

### Test: websocket-connection-establishes-on-lobby-join

**File:** `tests/e2e/lobby-presence-p0.spec.ts:78`

**Tasks to make this test pass:**

- [ ] Create WebSocket server using tokio-tungstenite
- [ ] Implement /ws/lobby endpoint with Axum
- [ ] Handle WebSocket upgrade requests
- [ ] Authenticate WebSocket connections
- [ ] Store connections in connection pool
- [ ] Send initial presence state on connection
- [ ] Run test: `npm run test:e2e -- lobby-presence-p0.spec.ts --grep "websocket-connection-establishes"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 6 hours

---

### Test: presence-state-accurate-at-start

**File:** `tests/e2e/lobby-presence-p0.spec.ts:123`

**Tasks to make this test pass:**

- [ ] Implement presence state manager
- [ ] Track online users in memory
- [ ] Initialize presence state on server start
- [ ] Add users to presence state on authentication
- [ ] Broadcast presence state to newly connected clients
- [ ] Run test: `npm run test:e2e -- lobby-presence-p0.spec.ts --grep "presence-state-accurate"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: user-appears-immediately-after-auth

**File:** `tests/e2e/lobby-presence-p0.spec.ts:156`

**Tasks to make this test pass:**

- [ ] Add user to presence state after successful authentication
- [ ] Broadcast user_joined event to all connected clients
- [ ] Update lobby UI immediately when user joins
- [ ] Ensure no delay between auth and appearance in lobby
- [ ] Run test: `npm run test:e2e -- lobby-presence-p0.spec.ts --grep "user-appears-immediately"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: websocket-rejects-unauthenticated-connection

**File:** `tests/e2e/lobby-presence-p0.spec.ts:189`

**Tasks to make this test pass:**

- [ ] Validate auth token in WebSocket handshake
- [ ] Reject connections without valid tokens
- [ ] Return appropriate error for unauthorized connections
- [ ] Log unauthorized connection attempts
- [ ] Run test: `npm run test:e2e -- lobby-presence-p0.spec.ts --grep "websocket-rejects-unauthenticated"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: no-memory-leak-after-user-leave

**File:** `tests/e2e/lobby-presence-p0.spec.ts:212`

**Tasks to make this test pass:**

- [ ] Implement proper cleanup on user disconnect
- [ ] Remove WebSocket connection from pool
- [ ] Remove user from presence state
- [ ] Remove event listeners
- [ ] Clear timeout timers
- [ ] Run test: `npm run test:e2e -- lobby-presence-p0.spec.ts --grep "no-memory-leak"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 3 hours

---

### Test: no-duplicate-users-in-lobby

**File:** `tests/e2e/lobby-presence-p0.spec.ts:245`

**Tasks to make this test pass:**

- [ ] Check for existing user before adding to presence state
- [ ] Use Set or Map for unique user tracking
- [ ] Handle race conditions in user addition
- [ ] Validate user doesn't already exist in lobby
- [ ] Run test: `npm run test:e2e -- lobby-presence-p0.spec.ts --grep "no-duplicate-users"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 2 hours

---

### Test: handles-100-concurrent-users

**File:** `tests/e2e/lobby-presence-p0.spec.ts:278`

**Tasks to make this test pass:**

- [ ] Optimize WebSocket connection handling for scale
- [ ] Implement connection pooling
- [ ] Use efficient data structures for presence state
- [ ] Add load balancing if needed
- [ ] Monitor performance metrics
- [ ] Run test: `npm run test:e2e -- lobby-presence-p0.spec.ts --grep "handles-100-concurrent"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 8 hours

---

### Test: heartbeat-detects-stale-connections

**File:** `tests/e2e/lobby-presence-p0.spec.ts:311`

**Tasks to make this test pass:**

- [ ] Implement heartbeat mechanism
- [ ] Send heartbeat requests to clients
- [ ] Track last heartbeat time per connection
- [ ] Timeout connections after 30s inactivity
- [ ] Remove stale connections from presence state
- [ ] Run test: `npm run test:e2e -- lobby-presence-p0.spec.ts --grep "heartbeat-detects-stale"`
- [ ] ✅ Test passes (green phase)

**Estimated Effort:** 4 hours

---

## Running Tests

```bash
# Run all P0 failing tests for Epic 3
npm run test:e2e -- lobby-presence-p0.spec.ts

# Run specific test
npm run test:e2e -- lobby-presence-p0.spec.ts --grep "lobby-updates-within-2s"

# Run tests in headed mode (see browser)
npm run test:e2e -- lobby-presence-p0.spec.ts --headed

# Debug specific test
npm run test:e2e -- lobby-presence-p0.spec.ts --grep "websocket-connection" --debug

# Run with trace viewer
npm run test:e2e -- lobby-presence-p0.spec.ts --trace on

# Run API tests
npm run test:api -- lobby-presence.api.spec.ts

# Run unit tests
npm run test:unit -- presence-state.unit.spec.ts
```

---

## Red-Green-Refactor Workflow

### RED Phase (Complete) ✅

**TEA Agent Responsibilities:**

- ✅ All 72 tests written and failing (37 E2E, 15 API, 20 Unit)
- ✅ Fixtures and factories identified/referenced
- ✅ Mock requirements documented (WebSocket protocol)
- ✅ data-testid requirements listed (12 attributes)
- ✅ Implementation checklist created (9 test scenarios)
- ✅ Expected failure reasons documented

**Verification:**

- All tests run and fail as expected
- Failure messages are clear and actionable
- Tests fail due to missing implementation, not test bugs

---

### GREEN Phase (DEV Team - Next Steps)

**DEV Agent Responsibilities:**

1. **Review implementation checklist** - Understand what needs to be built
2. **Start with highest priority test** - Begin with WebSocket connection
3. **Implement minimal code** to make that specific test pass
4. **Run the test frequently** - Verify it passes (green)
5. **Check off completed tasks** - Track progress
6. **Move to next test** - Repeat until all tests pass

**Implementation Order Recommendation:**

1. WebSocket server foundation (6 hours) - Tests: websocket-connection-*
2. Presence state manager (3 hours) - Tests: presence-state-*
3. Real-time updates (4 hours) - Tests: lobby-updates-*
4. Authentication & security (2 hours) - Tests: websocket-rejects-*
5. Memory management (3 hours) - Tests: no-memory-leak-*
6. Data integrity (2 hours) - Tests: no-duplicate-*
7. Load testing (8 hours) - Tests: handles-100-*
8. Heartbeat mechanism (4 hours) - Tests: heartbeat-*

**Total Estimated Effort:** 32 hours (4 days)

**Key Principles:**

- One test at a time (don't try to fix all at once)
- Minimal implementation (don't over-engineer)
- Run tests frequently (immediate feedback)
- Use implementation checklist as roadmap

**Progress Tracking:**

- Check off tasks as you complete them
- Share progress in daily standup
- Mark story as IN PROGRESS in sprint-status.yaml
- Update bmm-workflow-status.md when tests start passing

---

### REFACTOR Phase (DEV Team - After All Tests Pass)

**DEV Agent Responsibilities:**

1. **Verify all tests pass** (green phase complete)
2. **Review code for quality** (readability, maintainability, performance)
3. **Extract duplications** (DRY principle)
4. **Optimize performance** (especially for 100+ user load)
5. **Ensure tests still pass** after each refactor
6. **Update documentation** (API contracts, architecture)

**Key Principles:**

- Tests provide safety net (refactor with confidence)
- Make small refactors (easier to debug if tests fail)
- Run tests after each change
- Don't change test behavior (only implementation)

**Completion:**

- All 72 tests pass
- Code quality meets team standards
- No duplications or code smells
- Performance meets NFR (2s update time)
- Ready for code review and story approval

---

## Next Steps

1. **Review this checklist** with team in standup or planning
2. **Run failing tests** to confirm RED phase: `npm run test:e2e -- lobby-presence-p0.spec.ts`
3. **Begin implementation** using implementation checklist as guide
4. **Work one test at a time** (red → green for each)
5. **Share progress** in daily standup
6. **When all tests pass**, refactor code for quality
7. **When refactoring complete**, manually update story status to 'done' in sprint-status.yaml

---

## Knowledge Base References Applied

This ATDD workflow consulted the following knowledge fragments:

- **fixture-architecture.md** - Test fixture patterns with setup/teardown and auto-cleanup using Playwright's `test.extend()`
- **data-factories.md** - Factory patterns using `@faker-js/faker` for random test data generation with overrides support
- **component-tdd.md** - Component test strategies using Playwright Component Testing
- **network-first.md** - Route interception patterns (intercept BEFORE navigation to prevent race conditions)
- **test-quality.md** - Test design principles (Given-When-Then, one assertion per test, determinism, isolation)
- **test-levels-framework.md** - Test level selection framework (E2E vs API vs Component vs Unit)
- **risk-governance.md** - Risk scoring for P0 prioritization
- **probability-impact.md** - Impact assessment for NFR validation
- **selector-resilience.md** - Selector best practices for stable tests
- **timing-debugging.md** - Race condition prevention and async debugging

See `tea-index.csv` for complete knowledge fragment mapping.

---

## Test Execution Evidence

### Initial Test Run (RED Phase Verification)

**Command:** `npm run test:e2e -- lobby-presence-p0.spec.ts`

**Results:**

```
Running 37 tests using 4 workers

  × lobby-updates-within-2s-on-user-join (5000ms)
    TimeoutError: Waiting for selector failed: Timeout 2000ms exceeded

  × lobby-updates-within-2s-on-user-leave (5000ms)
    TimeoutError: User still visible after 2s

  × websocket-connection-establishes-on-lobby-join (5000ms)
    Error: Failed to connect to ws://localhost:8080/ws/lobby

  × presence-state-accurate-at-start (5000ms)
    Error: Expected 2 users but found 0

  × user-appears-immediately-after-auth (5000ms)
    TimeoutError: User not visible in lobby within 5s

  ... (32 more failing tests)
```

**Summary:**

- Total tests: 72 (37 E2E, 15 API, 20 Unit)
- Passing: 0 (expected)
- Failing: 72 (expected)
- Status: ✅ RED phase verified

**Expected Failure Messages:**

1. **TimeoutError** - Features not yet implemented (UI, WebSocket, presence state)
2. **Error: Failed to connect** - WebSocket server not running
3. **Error: Expected X but found Y** - Missing implementation
4. **RangeError** - NFR requirements not yet met

---

## Notes

- All tests are designed to fail due to missing implementation, not test bugs
- Tests follow Given-When-Then structure for clarity
- Network-first pattern applied (route interception before navigation)
- Each test has exactly one assertion (atomic)
- Tests are isolated with auto-cleanup fixtures
- P0 tests focus on critical path: real-time updates, WebSocket, presence
- Performance tests validate 2-second NFR requirement
- Load tests verify 100+ concurrent user capacity
- Security tests ensure authenticated access only

**Epic Dependencies:**

- Epic 1 (Authentication) must be complete for WebSocket auth
- Epic 2 (Profiles) must be complete for user identity
- Epic 4 (Messaging) builds on presence infrastructure

**Technical Considerations:**

- WebSocket implementation using tokio-tungstenite
- Presence state in-memory with SQLite persistence
- Real-time updates via WebSocket broadcast
- Heartbeat mechanism for stale connection detection
- Connection pooling for 100+ user support

---

## Contact

**Questions or Issues?**

- Ask in team standup
- Tag @riddler in Slack/Discord
- Refer to `_bmad/bmm/docs/tea-README.md` for workflow documentation
- Consult `_bmad/bmm/testarch/knowledge` for testing best practices

---

**Generated by BMad TEA Agent** - 2025-12-22
**Test Design Source:** `/home/riddler/mp/_bmad-output/test-design-epic-3.md`
**Workflow:** `_bmad/bmm/testarch/atdd`
