# MP Test Suite

Comprehensive test suite for MP (cryptographic messaging application) using Playwright.

## Overview

This test suite validates the cryptographic messaging application with:
- **Cryptographic Authentication** - Ed25519 key-based authentication
- **Real-time Messaging** - WebSocket-based lobby communication
- **Signature Verification** - Every message cryptographically signed
- **Profile Management** - Public key to username mappings

## Quick Start

### Prerequisites

- Node.js 20.11.0+ (use `.nvmrc` to set version)
- Rust toolchain (for running the application)
- `cargo` installed

### Installation

1. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npm run install: browsers
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

### Running Tests

```bash
# Run all tests
npm run test:e2e

# Run tests in headed mode (see browser)
npm run test:e2e:headed

# Run tests in debug mode
npm run test:e2e:debug

# Run tests in UI mode
npm run test:e2e:ui

# Run tests in specific browser
npm run test:e2e:firefox
npm run test:e2e:webkit

# View test report
npm run show-report
```

## Test Architecture

### Directory Structure

```
tests/
├── e2e/                          # End-to-end test files
│   ├── authentication.spec.ts    # Auth flow tests (8 tests)
│   ├── messaging.spec.ts         # Messaging tests (12 tests)
│   ├── profile-management.spec.ts # Profile tests (8 tests)
│   ├── presence-lobby.spec.ts    # Presence tests (7 tests)
│   ├── error-handling.spec.ts    # Error handling (11 tests)
│   ├── nfr-performance.spec.ts   # Performance tests (6 tests)
│   └── nfr-security.spec.ts      # Security tests (9 tests)
├── api/                          # API test files
│   └── websocket.api.spec.ts     # WebSocket API (10 tests)
├── component/                    # Component test files
│   ├── profile-form.test.ts      # Profile form (12 tests)
│   ├── verification-badge.test.ts # Verification UI (9 tests)
│   └── user-list.test.ts         # User list UI (10 tests)
├── support/                       # Test infrastructure
│   ├── fixtures/                 # Test fixtures and data factories
│   │   ├── index.ts             # Main fixture configuration
│   │   ├── profile.fixture.ts   # Profile fixtures
│   │   └── factories/           # Data factory classes
│   │       ├── user-factory.ts  # User factory
│   │       ├── crypto-factory.ts # Crypto key factory
│   │       ├── profile-factory.ts # Profile factory
│   │       └── message-factory.ts # Message factory
│   └── helpers/                 # Test utility functions
│       ├── crypto-helpers.ts    # Cryptographic utilities
│       ├── websocket-helpers.ts # WebSocket utilities
│       ├── nfr-helpers.ts       # NFR validation helpers
│       ├── presence-helpers.ts  # Presence tracking utilities
│       └── profile-helpers.ts   # Profile validation utilities
└── README.md                     # This file
```

### Key Patterns

#### 1. Fixture Architecture

Tests use Playwright's `extend` pattern for reusable fixtures:

```typescript
import { test } from '../support/fixtures';

test('user can authenticate', async ({ page, userFactory }) => {
  const user = await userFactory.createUser();
  // Use user in test
});
```

**Available Fixtures:**
- `userFactory` - Creates test users with cryptographic keys
- `cryptoKeys` - Generates cryptographic key pairs

#### 2. Data Factories

Create realistic test data with automatic cleanup:

```typescript
const user = await userFactory.createUser({
  profileName: 'Test User',
});
```

**Factories:**
- `UserFactory` - Creates users with public keys and profile data
- `CryptographicKeyPair` - Generates Ed25519-compatible key pairs

#### 3. Helper Utilities

**Crypto Helpers** (`helpers/crypto-helpers.ts`):
- Validate key formats
- Verify signatures
- Cryptographic test utilities

**WebSocket Helpers** (`helpers/websocket-helpers.ts`):
- Connect to WebSocket
- Send/receive messages
- Wait for specific message types

## Test Organization

### By Feature

**E2E Tests:**
- **authentication.spec.ts** - Cryptographic authentication flows (8 tests)
- **messaging.spec.ts** - Real-time messaging and lobby features (12 tests)
- **profile-management.spec.ts** - Profile creation, updates, persistence (8 tests)
- **presence-lobby.spec.ts** - User presence tracking, lobby updates (7 tests)
- **error-handling.spec.ts** - Error scenarios, network failures, recovery (11 tests)
- **nfr-performance.spec.ts** - Performance validation (auth <10s, messages <2s) (6 tests)
- **nfr-security.spec.ts** - Security validation (private keys, signatures) (9 tests)

**API Tests:**
- **websocket.api.spec.ts** - WebSocket communication, message validation (10 tests)

**Component Tests:**
- **profile-form.test.ts** - Profile form UI validation (12 tests)
- **verification-badge.test.ts** - Cryptographic verification UI (9 tests)
- **user-list.test.ts** - User list and presence display (10 tests)

### By Test Type

- **Happy Path** - Normal user flows
- **Error Handling** - Invalid inputs, network failures
- **Performance** - Timing validation (<10s auth, <2s messages)
- **Security** - Signature verification, tamper detection

## Best Practices

### Selector Strategy

**Use `data-testid` attributes:**
```html
<input data-testid="private-key-input" />
```

**In tests:**
```typescript
await page.getByTestId('private-key-input').fill('0x...');
```

**Avoid:**
- CSS selectors (fragile)
- XPath (slow, brittle)
- Text content (changes with localization)

### Test Isolation

Each test is isolated:
- Fresh browser context
- Fresh database state
- Automatic cleanup via fixtures

**Never:**
- Share state between tests
- Use global variables
- Forget to clean up resources

### Priority Tags

Tests are tagged with priority levels:

- **[P0]**: Critical - Run on every commit (auth, security, core functionality)
- **[P1]**: High - Run on PR to main (important features, integration)
- **[P2]**: Medium - Run nightly (edge cases, polish)
- **[P3]**: Low - Run on-demand (rarely-used features)

**Run tests by priority:**
```bash
npm run test:e2e:p0  # Critical paths only
npm run test:e2e:p1  # P0 + P1 tests
npm run test:e2e:p2  # All tests
```

### Network-First Pattern

Intercept network calls before navigation:

```typescript
// ❌ DON'T - Race condition
await page.goto('/dashboard');
await page.waitForResponse('**/api/data');

// ✅ DO - Deterministic
const responsePromise = page.waitForResponse('**/api/data');
await page.goto('/dashboard');
await responsePromise;
```

### Deterministic Tests

**Use deterministic waits, not timeouts:**
```typescript
// ❌ DON'T - Non-deterministic
await page.waitForTimeout(3000);

// ✅ DO - Wait for condition
await expect(page.getByText('Success')).toBeVisible();

// ✅ DO - Wait for network
await page.waitForResponse('**/api/users');
```

### Cryptographic Testing

**Test Key Handling:**
```typescript
test('should never expose private key', async ({ page }) => {
  const pageContent = await page.content();
  expect(pageContent).not.toContain('PRIVATE_KEY');
  expect(pageContent).not.toContain('0x');
});
```

**Test Signatures:**
```typescript
test('should verify message signatures', async ({ page }) => {
  await page.getByText('Message').click();
  await expect(page.getByText('Signature Verified')).toBeVisible();
});
```

## CI Integration

### GitHub Actions Example

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20.11.0

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright
        run: npm run install: browsers

      - name: Run tests
        run: npm run test:e2e

      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

### Test Parallelization

Tests run in parallel by default:
- `fullyParallel: true` in config
- Multiple workers (based on CPU cores)
- Each test gets isolated context

**To disable parallelization:**
```bash
npm run test:e2e -- --workers=1
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Application base URL | `http://localhost:8080` |
| `WS_URL` | WebSocket URL | `ws://localhost:8080/ws` |
| `TEST_PRIVATE_KEY` | Test private key | - |
| `TEST_PUBLIC_KEY` | Test public key | - |

## Troubleshooting

### Tests Timeout

**Increase timeouts in config:**
```typescript
use: {
  actionTimeout: 30000, // 30s
  navigationTimeout: 60000, // 60s
}
```

### Browser Issues

**Reinstall browsers:**
```bash
npx playwright install --force
```

**Clear cache:**
```bash
rm -rf node_modules/.cache
npm run install: browsers
```

### WebSocket Connection Fails

**Check server is running:**
```bash
# Start server (from project root)
cargo run --manifest-path mp-server/Cargo.toml

# In another terminal
npm run test:e2e
```

## Test Data Management

### Creating Test Users

```typescript
const user = await userFactory.createUser({
  profileName: 'Alice',
});

console.log(user.publicKey); // 0x...
console.log(user.profileName); // Alice
```

### Generating Key Pairs

```typescript
const keys = await cryptoKeys.getKeyPair();
console.log(keys.privateKey); // 0x...
console.log(keys.publicKey);  // 0x...
```

### Cleanup

Fixtures automatically clean up:
- User factories delete created users
- Browser contexts are closed
- WebSocket connections are terminated

## Knowledge Base

Refer to these resources for advanced patterns:

- **Test Quality**: `test-quality.md` - Deterministic, isolated, explicit tests
- **Fixture Architecture**: `fixture-architecture.md` - Reusable test setup
- **Data Factories**: `data-factories.md` - Realistic test data
- **Network-First**: `network-first.md` - Stable network testing
- **Risk Governance**: `risk-governance.md` - Test prioritization

## Contributing

When adding new tests:

1. Follow naming convention: `feature-name.spec.ts`
2. Use `data-testid` attributes in application
3. Implement proper cleanup
4. Add comments for complex scenarios
5. Include both happy and error paths
6. Validate timing requirements (auth <10s, messages <2s)

## Support

For issues or questions:
- Review Playwright docs: https://playwright.dev/
- Check test artifacts: `test-results/html/index.html`
- Review this README and knowledge base
