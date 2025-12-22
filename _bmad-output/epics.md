---
stepsCompleted: [1, 2, 3, 4]
inputDocuments: ["/home/riddler/mp/_bmad-output/prd.md", "/home/riddler/mp/_bmad-output/architecture.md", "/home/riddler/mp/_bmad-output/ux-design-specification.md"]
requirementsExtractionCompleted: true
extractionDate: "2025-12-22"
frCount: 27
nfrCount: 12
epicDesignCompleted: true
epicDesignDate: "2025-12-22"
totalEpics: 4
storyCreationCompleted: true
storyCreationDate: "2025-12-22"
totalStories: 25
validationCompleted: true
validationDate: "2025-12-22"
workflowStatus: "complete"
---

# mp - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for mp, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: Users can authenticate using only their private key (no username/password/sign-up)
FR2: Users can provide their private key through multiple methods (file upload, text input, clipboard paste)
FR3: Users can generate a new private key client-side if they don't have one
FR4: System extracts public key from private key during authentication
FR5: Public key automatically becomes the user's unique account identifier
FR6: Authentication completes within 10 seconds from private key submission to lobby access
FR7: Users can export their private key to a file for backup
FR8: Users can copy their private key to clipboard for easy access
FR9: System creates a user profile automatically when user first authenticates with a public key
FR10: Users can set a username or profile name linked to their public key
FR11: Users can update their profile name at any time
FR12: System stores public key → username/profile name mappings in a database
FR13: Users are identified in chats by their profile name (when set) or public key (when no profile name)
FR14: Users can view a live lobby showing all currently online users
FR15: Users can see other users' profile names or public keys in the lobby
FR16: User presence (online/offline) updates in real-time
FR17: Lobby automatically updates when users join or leave
FR18: Users can send text messages in the lobby
FR19: Every message is automatically signed with the sender's private key before transmission
FR20: All messages display the sender's profile name (or public key if no profile name)
FR21: Messages appear in the lobby in real-time (within 2 seconds of being sent)
FR22: Users can view the complete message history for the current session
FR23: Every message displays a cryptographic signature verification indicator
FR24: Users can verify that a message was signed by the claimed public key
FR25: System validates all message signatures before displaying them
FR26: Invalid or tampered messages are rejected and not displayed
FR27: Users can view the cryptographic signature details for any message

### NonFunctional Requirements

NFR1: Authentication completes within 10 seconds from private key submission to lobby access
NFR2: Messages appear in lobby within 2 seconds of being sent
NFR3: Lobby updates (user join/leave) occur within 2 seconds
NFR4: Private keys are never stored in plaintext on the server
NFR5: Private keys are never transmitted over the network
NFR6: All cryptographic operations (signing, verification) use secure, well-established algorithms
NFR7: Signature verification is mandatory for all messages before display
NFR8: Desktop-first platform: Windows desktop GUI using Rust + Slint framework
NFR9: Backend runs on WSL/Linux infrastructure
NFR10: Real-time communication via WebSocket
NFR11: Profile database stores public key to username mappings
NFR12: WCAG AA compliance for accessibility

### Additional Requirements

**From Architecture:**

- Starter Template Required: Direct Slint Project Setup using `cargo new mp-desktop` - this is part of Epic 1 implementation (integrated into authentication stories)
- Infrastructure Requirements: WSL/Linux backend deployment, SQLite database (MVP), PostgreSQL migration path
- Integration Requirements: EdDSA signature algorithm (ed25519-dalek library), WebSocket communication (tokio-tungstenite), Axum backend framework with tokio runtime
- Data Migration/Setup Requirements: SQLite database with users table (public_key as PRIMARY KEY, username, profile_name, created_at, last_seen) and messages table (id, sender_public_key, content, signature, timestamp)
- Monitoring/Logging Requirements: Not specified for MVP
- API Versioning Requirements: REST API for profile management (/api/user-profile, /api/lobby-messages), WebSocket path /ws/lobby
- Security Implementation Requirements: Client-side cryptographic operations only, private keys never leave client, server-side signature validation, EdDSA deterministic signatures

**From UX Design:**

- Responsive Design Requirements: Desktop-first (Windows desktop application), minimum window size 800x600, optimal window size 1200x800, maximum message width 900px for readability
- Accessibility Requirements: WCAG AA compliance (already covered in NFR12), ARIA labels for verification badges, screen reader support for cryptographic elements, keyboard navigation support, focus indicators on all interactive elements
- Browser/Device Compatibility: Windows desktop only (no mobile/tablet support), Windows Narrator screen reader compatibility, Windows high contrast mode support
- User Interaction Patterns: Discord-inspired dark theme with light variant, verification badges (green checkmark + "Verified" text), message bubbles with integrated verification display, user list sidebar with online status
- Animation/Transition Requirements: Smooth real-time updates for lobby chat, verification badge transitions, loading states for signing/verification operations
- Error Handling UX Requirements: Clear error messages for invalid keys, signature verification failures, network issues; Visual feedback for authentication, messaging, and verification states

### FR Coverage Map

FR1: Epic 1 - Private key authentication (no username/password/sign-up)
FR2: Epic 1 - Multiple private key input methods (file, text, clipboard)
FR3: Epic 1 - Client-side private key generation
FR4: Epic 1 - Public key extraction from private key
FR5: Epic 1 - Public key as unique account identifier
FR6: Epic 1 - Authentication completes within 10 seconds
FR7: Epic 1 - Private key export for backup
FR8: Epic 1 - Private key clipboard copy
FR9: Epic 2 - Automatic profile creation on first authentication
FR10: Epic 2 - Username/profile name setting
FR11: Epic 2 - Profile name updates
FR12: Epic 2 - Database storage of public key → username mappings
FR13: Epic 2 - User identification by profile name or public key
FR14: Epic 3 - Live lobby showing online users
FR15: Epic 3 - View other users' identities in lobby
FR16: Epic 3 - Real-time presence updates
FR17: Epic 3 - Automatic lobby updates on user join/leave
FR18: Epic 4 - Send text messages in lobby
FR19: Epic 4 - Automatic message signing with private key
FR20: Epic 4 - Display sender identity with messages
FR21: Epic 4 - Real-time message delivery (within 2 seconds)
FR22: Epic 4 - View complete message history
FR23: Epic 4 - Cryptographic signature verification indicators
FR24: Epic 4 - Verify messages signed by claimed public key
FR25: Epic 4 - Server-side signature validation
FR26: Epic 4 - Reject invalid/tampered messages
FR27: Epic 4 - View cryptographic signature details

## Epic List

### Epic 1: Cryptographic Authentication & Setup
**Goal:** Users can authenticate using their private key and gain secure access to the system
**Value:** Zero-friction Web3-native identity without traditional account creation
**Coverage:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8
**Stories:** ~5-7 stories covering key input, validation, authentication flow, and private key management

### Epic 2: Profile & Identity Management
**Goal:** Users can create and manage their profile identity linked to their cryptographic key
**Value:** Personal identity with cryptographic proof, user-friendly display names
**Coverage:** FR9, FR10, FR11, FR12, FR13
**Stories:** ~3-5 stories covering profile creation, username management, and database storage

### Epic 3: Real-time Lobby & Presence
**Goal:** Users can join the live lobby and see who's currently online
**Value:** Real-time community interaction and presence awareness
**Coverage:** FR14, FR15, FR16, FR17
**Stories:** ~4-6 stories covering lobby display, presence tracking, and real-time updates

### Epic 4: Cryptographic Messaging & Verification
**Goal:** Users can send and receive cryptographically verified messages with complete trust
**Value:** Tamper-proof, verifiable communication where every message is cryptographically guaranteed
**Coverage:** FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26, FR27
**Stories:** ~8-10 stories covering messaging, automatic signing, real-time delivery, and complete verification system

<!-- Epic sections -->

## Epic 1: Cryptographic Authentication & Setup

Users can authenticate using their private key and gain secure access to the system. Zero-friction Web3-native identity without traditional account creation.

### Story 1.1: Private Key Input Methods

As a user,
I want to provide my private key through multiple convenient methods,
So that I can easily authenticate regardless of how I store my key.

**Acceptance Criteria:**

**Given** the authentication screen is displayed
**When** I click "Paste from Clipboard"
**Then** the private key from my clipboard is pasted into the input field
**And** I can see the key in the input field for verification

**Given** the authentication screen is displayed
**When** I click "Upload Key File"
**Then** a file picker opens allowing me to select a private key file
**And** the file contents are loaded into the input field

**Given** the authentication screen is displayed
**When** I manually type or paste my private key into the text input
**Then** the key is displayed in the input field
**And** real-time validation provides feedback on the key format

### Story 1.2: Private Key Generation

As a new user,
I want to generate a new private key pair directly in the application,
So that I can start using the application immediately without needing an existing key.

**Acceptance Criteria:**

**Given** the authentication screen is displayed
**When** I click "Generate New Key"
**Then** a new Ed25519 private key pair is generated client-side
**And** the private key is displayed in the input field
**And** the public key is derived and ready for use

**Given** a new key pair has been generated
**When** the generation completes
**Then** I am presented with an option to save the key to a file
**And** I can choose where to save the private key backup

**Given** a new key pair has been generated
**When** I proceed with authentication
**Then** the public key is extracted and used for authentication
**And** the key pair is available for future use

### Story 1.3: Private Key Validation and Public Key Extraction

As a user,
I want to have my private key validated and the public key automatically extracted,
So that I can be confident my key is valid before proceeding to authentication.

**Acceptance Criteria:**

**Given** I have entered a private key
**When** I submit the key for validation
**Then** the key format is validated (Ed25519 format)
**And** appropriate error messages are shown for invalid formats

**Given** the private key format is valid
**When** validation completes successfully
**Then** the public key is automatically extracted from the private key
**And** the public key is displayed to me for confirmation

**Given** the public key is extracted
**When** the extraction completes
**Then** the public key is in the correct format for use as my account identifier
**And** I can proceed to authentication with this public key

### Story 1.4: Authentication Flow and Access

As a user,
I want to authenticate using my private key and gain access to the application,
So that I can use the cryptographic chat without creating a traditional account.

**Acceptance Criteria:**

**Given** my public key has been extracted
**When** I submit for authentication
**Then** the authentication process begins
**And** I see a loading indicator during the process

**Given** authentication is in progress
**When** the system processes my request
**Then** my public key is checked against the user database
**And** a user profile is created if this is my first authentication
**And** authentication completes within 10 seconds

**Given** authentication completes successfully
**When** the process finishes
**Then** I am granted access to the lobby chat interface
**And** my public key serves as my unique account identifier
**And** I can see my identity in the system

### Story 1.5: Private Key Management and Backup

As a user,
I want to export, backup, and copy my private key for secure storage,
So that I can safely store my key and use it across different sessions.

**Acceptance Criteria:**

**Given** I have authenticated successfully
**When** I access the private key management feature
**Then** I can see options to export, copy, and backup my key

**Given** I want to export my key to a file
**When** I click "Export to File"
**Then** a file save dialog opens
**And** I can save my private key to a secure location
**And** the exported file contains only my private key in a secure format

**Given** I want to copy my key to clipboard
**When** I click "Copy to Clipboard"
**Then** my private key is copied to the system clipboard
**And** I receive confirmation that the key was copied
**And** I can paste the key elsewhere for backup purposes

**Given** I have exported or copied my key
**When** the operation completes
**Then** I am shown security reminders about protecting my key
**And** I understand that losing my key means losing access to my account
