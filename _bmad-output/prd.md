---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments: []
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 0
workflowType: 'prd'
lastStep: 11
project_name: 'mp'
user_name: 'Riddler'
date: '2025-12-22'
---

# Product Requirements Document - mp

**Author:** Riddler
**Date:** 2025-12-22

## Executive Summary

This project explores **Web3-native identity and communication** by eliminating traditional account creation entirely. Users authenticate using their existing private keys, with deterministic signatures proving ownership of their public key - which automatically becomes their account identifier.

The system implements a **zero-friction onboarding experience** where users never need to sign up, create passwords, or provide personal information. Instead, their wallet address serves as their complete identity, enabling immediate access to a real-time lobby chat system.

Every interaction in the system is cryptographically signed, creating a **self-sovereign identity model** where users maintain complete ownership of their digital identity while participating in a shared communication space.

### What Makes This Special

**Identity Revolution:** By making public keys function as user profiles, this system eliminates the fundamental friction of account creation that plagues both Web2 and current Web3 applications. Users don't "join" - they simply authenticate with their existing cryptographic identity.

**Trust Through Cryptography:** Every chat message is deterministically signed, creating verifiable, tamper-proof communication where identity is cryptographically guaranteed rather than self-asserted.

**Self-Sovereign by Design:** The system embodies true decentralization - there are no accounts to be created, managed, or lost. Your wallet is your identity, your private key is your authentication, and your digital presence exists solely through cryptographic proof.

**Zero Onboarding Friction:** Users can participate immediately with any Web3 wallet, making the barrier to entry essentially zero while maintaining strong cryptographic guarantees about identity and message integrity.

## Project Classification

**Technical Type:** blockchain_web3
**Domain:** general
**Complexity:** low
**Project Context:** Greenfield - new project

This is an exploration project focused on foundational Web3 identity infrastructure, specifically examining how cryptographic identity can replace traditional account systems in communication platforms.

## Success Criteria

### User Success

**Authentication Experience:**
- Users can authenticate using only their private key (no username/password/sign-up)
- Public key automatically becomes their account identifier and is displayed as their identity
- Authentication completes in under 10 seconds from wallet connection to lobby access

**Messaging Experience:**
- Users can send messages in the lobby that are automatically signed with their deterministic signature
- All messages display verified cryptographic signatures tied to the sender's wallet address
- Users can visually verify that any message was sent by the wallet address it claims to be from
- Messages are visible to all users (no encryption), but identity is cryptographically proven

### Business Success

**Proof of Concept Validation:**
- Technical feasibility: Private key authentication successfully replaces traditional account creation
- Cryptographic trust: Deterministic signatures provide verifiable message ownership
- User experience: Web3-native identity removes onboarding friction while maintaining security
- Demonstration: Working example of how public keys can function as user accounts in real-time communication

### Technical Success

**Authentication System:**
- Private key → public key authentication flow works reliably
- No account database or user registration required
- Wallet address serves as unique user identifier

**Cryptographic Messaging:**
- Every message is deterministically signed before transmission
- Signatures are verified and displayed with each message
- Message verification ties signature to sender's wallet address
- Real-time lobby updates with signed messages from all connected users

### Measurable Outcomes

- **Functional Completeness:** 100% of core flows work as specified (login, messaging, verification)
- **Authentication Success Rate:** >95% successful private key authentications
- **Signature Verification:** 100% of messages show verifiable signatures
- **User Flow:** End-to-end experience from wallet connect to sending signed message completes without errors
- **Real-time Performance:** Lobby updates within 2 seconds of message sending

## Product Scope

### MVP - Minimum Viable Product

**Core Authentication:**
- Private key login (no sign-up, no passwords)
- Public key displayed as user identity/account
- Wallet connection and authentication flow

**Core Messaging:**
- Real-time lobby chat interface
- Automatic deterministic signing of all messages
- Display wallet address with each message
- Signature verification display (visual indicator that signature is valid)

**Infrastructure:**
- WebSocket or similar for real-time updates
- Message persistence for current session
- Signature verification system

### Growth Features (Post-POC)

- Message history persistence
- User profiles (optional, wallet-linked metadata)
- Multiple lobby/chat rooms
- File sharing with cryptographic verification
- Direct messaging between users

### Vision (Future)

- Cross-chain wallet support
- Integration with other Web3 identity systems (ENS, etc.)
- Decentralized message storage
- Advanced cryptographic features (encrypted messaging option)
- Federation with other Web3 chat systems

## User Journeys

**Journey 1: Alex Chen - Seeking Trustworthy Web3 Communication**

Alex is a Web3 developer who's frustrated with traditional chat apps where anyone can impersonate anyone else. They've been looking for a communication platform where identity is cryptographically guaranteed. While browsing Web3 communities, they discover mp - a lobby chat where every message is verifiable through cryptographic signatures.

The next evening, Alex opens mp and sees it asks them to connect their wallet. Instead of creating another username/password, they simply sign in with their existing MetaMask wallet. Within seconds, they're in the lobby and can see a live stream of messages - each one showing a wallet address and a "✓ Verified" indicator.

Alex types their first message: "Hello Web3!" and hits send. Instead of just sending text, the system automatically signs it with their private key. They see their message appear in the lobby with their wallet address displayed and a cryptographic verification badge. Another user responds: "Nice! I can verify that's really you @0x742d... - this is exactly what Web3 chat needs!"

The breakthrough moment comes when Alex realizes they can click on any message's signature and see the cryptographic proof that it came from the claimed wallet. No more fake accounts, no more impersonation - just pure cryptographic truth. Alex spends the next hour exploring the lobby, testing the verification on different messages, excited about this new paradigm of trustworthy communication.

**This journey reveals requirements for:**
- Wallet connection interface
- Real-time lobby display
- Automatic message signing
- Signature verification display
- Verifiable identity system

## Blockchain/Web3 Specific Requirements

### Project-Type Overview

This is a **cryptographic authentication and messaging system** that leverages public/private key cryptography for identity verification and real-time communication. It uses cryptographic authentication (no passwords) with a profile database for user-friendly identity management.

### Technical Architecture Considerations

**Cryptographic Authentication System:**
- Private key handling: Multiple methods (file upload, text input, clipboard paste, or client-side generation)
- Public key extraction and display as user identity
- Deterministic signature generation for all messages
- **Profile database** stores public key to username/profile name mappings

**Signature Method:**
- EdDSA or similar deterministic signature algorithm
- Every message cryptographically signed before transmission
- Signature verification tied to sender's public key
- No blockchain or gas fees required - pure cryptographic verification

**User Identity & Profile Management:**
- Public key serves as unique account identifier
- **Profile database** links public keys to usernames/profile names
- User-friendly display in chat interface (readable names with cryptographic verification)
- **Database stores:** public key, username, profile name, and any additional profile metadata

### Implementation Considerations

**Profile Database:**
- Public key → username/profile name mapping
- No password storage (cryptographic authentication only)
- Profile metadata storage (display name, avatar, etc.)
- Query optimization for real-time chat display

**Key Management:**
- Secure private key input handling (no plaintext storage)
- Client-side key generation option with secure export
- Clipboard integration for easy key management
- File-based key import/export support

**Security Model:**
- No smart contracts or blockchain transactions
- Client-side signature generation and verification
- Profile database only stores public data (no private keys)
- Deterministic signatures enable message verification

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Problem-Solving MVP - Deliver the core cryptographic authentication and verified messaging with minimal features
**Resource Requirements:** Small team, focused scope on essential functionality

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**
- Private key authentication (no sign-up, no passwords)
- Real-time lobby display showing online users
- Send messages that are automatically signed with deterministic signatures
- View all messages with cryptographic verification tied to sender's public key
- Profile database linking public keys to usernames/profile names

**Must-Have Capabilities:**
- Private key input handling (file upload, text input, clipboard paste, or client-side generation)
- Public key extraction and account creation
- Real-time chat lobby with online user display
- Deterministic message signing for all communications
- Signature verification and display for all messages
- Profile database for public key to username/profile name mapping
- User-friendly display showing readable names with cryptographic verification

### Post-MVP Features

**Phase 2 (Post-MVP):**
- Message history and persistence
- Direct messaging between users
- Enhanced profile customization (avatars, bio, etc.)
- Multiple lobby/chat rooms
- User settings and preferences

**Phase 3 (Expansion):**
- File sharing with cryptographic verification
- Integration with external identity systems
- Cross-platform support
- Advanced cryptographic features (encrypted messaging option)
- Federation with other Web3 chat systems

### Risk Mitigation Strategy

**Technical Risks:** Cryptographic implementation complexity
- **Mitigation:** Use well-established signature algorithms (EdDSA), extensive testing of signature verification
- **Simplification:** Start with basic deterministic signatures, add complexity later

**Market Risks:** User adoption of cryptographic authentication
- **Validation:** Proof of concept demonstrates technical feasibility and user experience
- **Learning:** Focus on core auth flow and messaging verification as primary value proposition

**Resource Risks:** Limited development capacity
- **Contingency:** Ultra-lean MVP with only absolute essentials
- **Priority:** Core authentication and messaging must work flawlessly, all enhancements are optional

## Functional Requirements

### User Identity & Authentication

- FR1: Users can authenticate using only their private key (no username/password/sign-up)
- FR2: Users can provide their private key through multiple methods (file upload, text input, clipboard paste)
- FR3: Users can generate a new private key client-side if they don't have one
- FR4: System extracts public key from private key during authentication
- FR5: Public key automatically becomes the user's unique account identifier
- FR6: Authentication completes within 10 seconds from private key submission to lobby access
- FR7: Users can export their private key to a file for backup
- FR8: Users can copy their private key to clipboard for easy access

### Profile Management

- FR9: System creates a user profile automatically when user first authenticates with a public key
- FR10: Users can set a username or profile name linked to their public key
- FR11: Users can update their profile name at any time
- FR12: System stores public key → username/profile name mappings in a database
- FR13: Users are identified in chats by their profile name (when set) or public key (when no profile name)

### Real-time Lobby & Presence

- FR14: Users can view a live lobby showing all currently online users
- FR15: Users can see other users' profile names or public keys in the lobby
- FR16: User presence (online/offline) updates in real-time
- FR17: Lobby automatically updates when users join or leave

### Messaging & Communication

- FR18: Users can send text messages in the lobby
- FR19: Every message is automatically signed with the sender's private key before transmission
- FR20: All messages display the sender's profile name (or public key if no profile name)
- FR21: Messages appear in the lobby in real-time (within 2 seconds of being sent)
- FR22: Users can view the complete message history for the current session

### Cryptographic Verification

- FR23: Every message displays a cryptographic signature verification indicator
- FR24: Users can verify that a message was signed by the claimed public key
- FR25: System validates all message signatures before displaying them
- FR26: Invalid or tampered messages are rejected and not displayed
- FR27: Users can view the cryptographic signature details for any message

## Non-Functional Requirements

### Performance

- Authentication completes within 10 seconds from private key submission to lobby access
- Messages appear in lobby within 2 seconds of being sent
- Lobby updates (user join/leave) occur within 2 seconds

### Security

- Private keys are never stored in plaintext on the server
- Private keys are never transmitted over the network
- All cryptographic operations (signing, verification) use secure, well-established algorithms
- Signature verification is mandatory for all messages before display
