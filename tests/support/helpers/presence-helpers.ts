/**
 * Presence test helpers
 * Utilities for testing real-time user presence and lobby updates
 */

export interface PresenceState {
  publicKey: string;
  profileName?: string;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
}

export class PresenceTestHelper {
  private presenceStates: Map<string, PresenceState> = new Map();

  /**
   * Create a presence state for a user
   */
  createPresenceState(publicKey: string, profileName?: string): PresenceState {
    const state: PresenceState = {
      publicKey,
      profileName,
      status: 'online',
      lastSeen: new Date().toISOString(),
    };

    this.presenceStates.set(publicKey, state);
    return state;
  }

  /**
   * Update user presence status
   */
  updatePresence(publicKey: string, status: 'online' | 'offline' | 'away'): void {
    const state = this.presenceStates.get(publicKey);
    if (state) {
      state.status = status;
      state.lastSeen = new Date().toISOString();
      this.presenceStates.set(publicKey, state);
    }
  }

  /**
   * Get all online users
   */
  getOnlineUsers(): PresenceState[] {
    return Array.from(this.presenceStates.values()).filter(
      state => state.status === 'online'
    );
  }

  /**
   * Get user count by status
   */
  getUserCount(status?: 'online' | 'offline' | 'away'): number {
    if (!status) {
      return this.presenceStates.size;
    }
    return Array.from(this.presenceStates.values()).filter(
      state => state.status === status
    ).length;
  }

  /**
   * Verify presence update timing
   */
  verifyPresenceUpdateTiming(
    updateTime: Date,
    maxDelayMs: number = 2000
  ): { passed: boolean; elapsed: number } {
    const now = new Date();
    const elapsed = now.getTime() - updateTime.getTime();

    return {
      passed: elapsed < maxDelayMs,
      elapsed,
    };
  }

  /**
   * Simulate user join event
   */
  simulateUserJoin(publicKey: string, profileName?: string): PresenceState {
    return this.createPresenceState(publicKey, profileName);
  }

  /**
   * Simulate user leave event
   */
  simulateUserLeave(publicKey: string): void {
    this.updatePresence(publicKey, 'offline');
  }

  /**
   * Simulate multiple users joining
   */
  simulateMultipleUsersJoin(count: number): PresenceState[] {
    const users: PresenceState[] = [];
    for (let i = 0; i < count; i++) {
      users.push(
        this.createPresenceState(
          this.generatePublicKey(),
          `User${i}`
        )
      );
    }
    return users;
  }

  /**
   * Verify lobby display matches presence states
   */
  verifyLobbyDisplay(
    lobbyUsers: Array<{ publicKey: string; profileName?: string; isOnline: boolean }>
  ): boolean {
    for (const lobbyUser of lobbyUsers) {
      const presenceState = this.presenceStates.get(lobbyUser.publicKey);
      if (!presenceState) {
        return false; // User in lobby not in presence states
      }

      const expectedOnline = presenceState.status === 'online';
      if (lobbyUser.isOnline !== expectedOnline) {
        return false; // Online status mismatch
      }
    }
    return true;
  }

  /**
   * Generate a test public key
   */
  private generatePublicKey(): string {
    const bytes = new Array(32).fill(0).map(() =>
      Math.floor(Math.random() * 256)
    );
    return '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Clear all presence states
   */
  clear(): void {
    this.presenceStates.clear();
  }

  /**
   * Get presence states as array
   */
  getAllPresenceStates(): PresenceState[] {
    return Array.from(this.presenceStates.values());
  }
}
