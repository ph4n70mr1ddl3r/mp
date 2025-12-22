---
project_name: 'mp'
user_name: 'Riddler'
date: '2025-12-22'
sections_completed: ['technology_stack', 'naming_conventions', 'code_organization', 'security_model', 'communication_patterns', 'error_handling']
---

# Project Context for AI Agents

_This file contains critical rules and patterns that AI agents must follow when implementing code in this project. Focus on unobvious details that agents might otherwise miss._

---

## Technology Stack & Versions

**Core Technologies:**

- **Language:** Rust (latest stable)
- **Desktop Client GUI:** Slint framework (latest stable)
  - Use Slint's declarative UI architecture
  - Implement reactive signals for state management
  - Build custom components for cryptographic features

- **Backend Server:** Axum web framework (latest stable)
  - Use tokio async runtime
  - Implement type-safe request/response handling

- **Database:** SQLite (latest stable)
  - Zero configuration, file-based storage
  - Perfect for MVP with migration path to PostgreSQL

- **Cryptographic Library:** ed25519-dalek (latest stable)
  - EdDSA signature generation and verification
  - Client-side signing, server-side verification

- **WebSocket:** tokio-tungstenite (latest stable)
  - Real-time bidirectional communication
  - Integrates with Axum backend

---

## Critical Implementation Rules

### Security Model (CRITICAL)

**PRIVATE KEY HANDLING:**
- ⚠️ **NEVER** store, transmit, or log private keys
- ⚠️ **NEVER** send private keys over network (even encrypted)
- All cryptographic operations happen client-side
- Server only receives public keys and signatures

**SIGNATURE VERIFICATION:**
- Every message MUST be signed before transmission
- Server MUST verify signature before broadcasting
- Use EdDSA deterministic signatures (ed25519-dalek)
- Hash message content before signing (SHA256)

### Code Organization Rules

**Project Structure (MONOREPO):**

```
mp/
├── mp-server/          # Backend (Axum + SQLite)
│   ├── src/
│   │   ├── routes/     # API endpoints
│   │   ├── database/   # Schema & models
│   │   ├── crypto/     # Signature verification
│   │   ├── websocket/  # Real-time communication
│   │   └── utils/      # Helpers & errors
│   └── tests/
└── mp-desktop/         # Client (Rust + Slint)
    ├── src/
    │   ├── ui/         # Slint components
    │   │   ├── components/
    │   │   └── screens/
    │   ├── crypto/     # Signing operations
    │   ├── network/    # WebSocket & API
    │   ├── state/      # App state management
    │   └── utils/
    └── tests/
```

**Module Organization:**
- All UI code in `src/ui/`
- All cryptographic code in `src/crypto/`
- All network code in `src/network/`
- All state management in `src/state/`

### Naming Conventions (MUST FOLLOW)

**Database:**
- Tables: `snake_case` (users, messages, user_profiles)
- Columns: `snake_case` (public_key, profile_name, created_at)
- Primary Keys: `snake_case` with `_id` suffix

**API Endpoints:**
- Paths: `kebab-case` (/api/user-profile, /api/lobby-messages)
- Query Params: `snake_case` (user_id, profile_name)
- JSON Fields: `snake_case` in requests/responses

**Rust Code:**
- Components: `kebab-case.rs` (verification-badge.rs)
- Modules: `snake_case.rs` (websocket_client.rs)
- Tests: `mod_name_tests.rs`
- Constants: `SCREAMING_SNAKE_CASE` (MAX_MESSAGE_LENGTH)

**File Organization:**
```
src/ui/components/verification-badge.rs
src/crypto/signature_verification.rs
src/network/websocket_client.rs
```

### Communication Patterns

**WebSocket Messages:**
```json
{
  "type": "message_type",
  "data": {
    "content": "message text",
    "sender_public_key": "0x...",
    "signature": "base64_signature",
    "timestamp": "2025-12-22T10:30:00Z"
  }
}
```

**Message Types:**
- `auth_request`
- `auth_response`
- `lobby_message`
- `user_joined`
- `user_left`
- `verification_status`

**API Response Format:**
```json
{
  "data": { ... },
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": "Technical details (optional)"
  }
}
```

### Error Handling Patterns

**Error Codes (UPPER_SNAKE_CASE):**
- `AUTH_FAILED`
- `INVALID_SIGNATURE`
- `INVALID_PUBLIC_KEY`
- `NETWORK_ERROR`
- `DATABASE_ERROR`

**Client-Side Error Handling:**
- Log technical errors to console
- Show user-friendly messages in UI
- Retry failed operations (except auth failures)

### Database Schema

**Users Table:**
```sql
CREATE TABLE users (
    public_key TEXT PRIMARY KEY,
    username TEXT,
    profile_name TEXT,
    created_at TEXT NOT NULL,
    last_seen TEXT NOT NULL
);
```

**Messages Table:**
```sql
CREATE TABLE messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sender_public_key TEXT NOT NULL,
    content TEXT NOT NULL,
    signature TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (sender_public_key) REFERENCES users(public_key)
);
```

### Cryptographic Operations

**Client-Side Signing Pattern:**
```rust
fn sign_message(private_key: &PrivateKey, message: &str) -> Signature {
    // 1. Create deterministic hash of message
    let hash = sha256(message);
    // 2. Sign hash with EdDSA
    private_key.sign(hash.as_ref())
}
```

**Server-Side Verification Pattern:**
```rust
fn verify_signature(
    public_key: &PublicKey,
    message: &str,
    signature: &Signature
) -> bool {
    // 1. Hash message deterministically
    let hash = sha256(message);
    // 2. Verify signature matches public key
    public_key.verify(hash.as_ref(), signature).is_ok()
}
```

### State Management (Slint)

**Use Reactive Signals:**
```rust
#[derive(Default, Clone)]
pub struct AppState {
    pub auth_state: AuthState,
    pub lobby_state: LobbyState,
    pub message_state: MessageState,
}
```

**State Update Flow:**
1. User action triggers event
2. Event handler validates input
3. Call appropriate service (crypto, network, db)
4. Update state reactively
5. UI automatically updates via bindings

### Component Architecture (Slint)

**Custom Components Required:**
- `VerificationBadge` - Display cryptographic verification status
- `MessageCard` - Chat message with verification display
- `UserItem` - User list entry with identity
- `KeyInput` - Secure private key input
- `SignatureIndicator` - Show signing/verification progress

### Configuration Management

**Config File Format (TOML):**
```toml
[server]
host = "127.0.0.1"
port = 8080
websocket_path = "/ws"

[database]
path = "./data/mp.db"

[crypto]
signature_algorithm = "Ed25519"
```

**Config Loading:**
- Load from file on startup
- Override with environment variables
- Validate all required fields present

### Development Workflow

**Build Commands:**
- Server: `cargo build --release` (in mp-server/)
- Client: `cargo build --release` (in mp-desktop/)
- Tests: `cargo test` (in each directory)

**Run Commands:**
- Server: `cargo run` (in mp-server/)
- Client: `cargo run` (in mp-desktop/)

### Testing Requirements

**Test Organization:**
- Unit tests colocated with modules
- Integration tests in `tests/` directory per workspace
- Tests for cryptographic operations MUST verify signature correctness
- WebSocket tests MUST test real-time message delivery

### Anti-Patterns (NEVER DO THESE)

❌ **Wrong: camelCase table name**
```sql
CREATE TABLE UserProfiles (...);
```
✅ **Correct:**
```sql
CREATE TABLE user_profiles (...);
```

❌ **Wrong: inconsistent endpoint naming**
```
GET /api/userProfile/{publicKey}
```
✅ **Correct:**
```
GET /api/user-profile/{public_key}
```

❌ **Wrong: storing private keys**
```rust
fn save_private_key(key: &PrivateKey) {
    database.save(key.to_string()); // NEVER DO THIS
: not❌ **Wrongrust
fn handle_message(msg: Message) {
    lobby.broadcast(msg); // MUST verify signature}
```

 verifying signatures**
``` first
}
```

---

## writing Implementation Checklist

Before code, verify:

- any [ ] Following correct naming conventions for the file type
- [ ] Placing code in correct module directory
- [ ] Private keys never leave client
- [ ] All messages signed before sending
- [ ] All signatures verified before processing
- [ ] Using snake_case for database/API/JSON
- [ ] Using kebab-case for API endpoints
- [ ] Error handling follows defined patterns
- [ ] Tests included for new functionality

---

**CRITICAL REMINDER:** This project implements cryptographic authentication. Security is paramount. Never compromise on private key handling or signature verification.
