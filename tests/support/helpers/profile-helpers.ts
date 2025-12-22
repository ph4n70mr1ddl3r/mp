/**
 * Profile test helpers
 * Utilities for testing user profile functionality
 */

export interface ProfileData {
  publicKey: string;
  profileName?: string;
  username?: string;
  createdAt?: string;
  updatedAt?: string;
}

export class ProfileTestHelper {
  /**
   * Validate profile data structure
   */
  static validateProfile(profile: any): boolean {
    return (
      profile &&
      typeof profile === 'object' &&
      typeof profile.publicKey === 'string' &&
      profile.publicKey.length > 0 &&
      (!profile.profileName || typeof profile.profileName === 'string') &&
      (!profile.username || typeof profile.username === 'string')
    );
  }

  /**
   * Validate profile name format
   */
  static validateProfileName(profileName: string): boolean {
    // Profile name should be 3-30 characters, alphanumeric and underscores
    const profileNameRegex = /^[a-zA-Z0-9_]{3,30}$/;
    return profileNameRegex.test(profileName);
  }

  /**
   * Validate public key format
   */
  static validatePublicKey(publicKey: string): boolean {
    // Ed25519 public key: 32 bytes = 64 hex chars + 0x prefix
    return /^0x[0-9a-fA-F]{64}$/.test(publicKey);
  }

  /**
   * Check if profile name is available (not already taken)
   */
  static isProfileNameAvailable(
    profileName: string,
    existingProfiles: ProfileData[]
  ): boolean {
    return !existingProfiles.some(
      profile => profile.profileName === profileName
    );
  }

  /**
   * Find profile by public key
   */
  static findProfileByPublicKey(
    publicKey: string,
    profiles: ProfileData[]
  ): ProfileData | undefined {
    return profiles.find(profile => profile.publicKey === publicKey);
  }

  /**
   * Find profile by profile name
   */
  static findProfileByProfileName(
    profileName: string,
    profiles: ProfileData[]
  ): ProfileData | undefined {
    return profiles.find(profile => profile.profileName === profileName);
  }

  /**
   * Get display name (profileName or truncated public key)
   */
  static getDisplayName(profile: ProfileData): string {
    if (profile.profileName) {
      return profile.profileName;
    }

    // Fallback to truncated public key
    if (profile.publicKey) {
      return `${profile.publicKey.slice(0, 8)}...`;
    }

    return 'Unknown';
  }

  /**
   * Compare profile updates
   */
  static compareProfiles(
    original: ProfileData,
    updated: ProfileData
  ): {
    profileNameChanged: boolean;
    usernameChanged: boolean;
    timestampUpdated: boolean;
  } {
    return {
      profileNameChanged: original.profileName !== updated.profileName,
      usernameChanged: original.username !== updated.username,
      timestampUpdated: original.updatedAt !== updated.updatedAt,
    };
  }

  /**
   * Verify profile persistence
   */
  static verifyProfilePersistence(
    initialProfile: ProfileData,
    retrievedProfile: ProfileData
  ): boolean {
    return (
      initialProfile.publicKey === retrievedProfile.publicKey &&
      initialProfile.profileName === retrievedProfile.profileName
    );
  }

  /**
   * Generate test profile data
   */
  static generateTestProfile(overrides: Partial<ProfileData> = {}): ProfileData {
    return {
      publicKey: overrides.publicKey || this.generatePublicKey(),
      profileName: overrides.profileName || this.generateProfileName(),
      username: overrides.username,
      createdAt: overrides.createdAt || new Date().toISOString(),
      updatedAt: overrides.updatedAt || new Date().toISOString(),
    };
  }

  /**
   * Generate a valid public key
   */
  private static generatePublicKey(): string {
    const bytes = new Array(32).fill(0).map(() =>
      Math.floor(Math.random() * 256)
    );
    return '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a profile name
   */
  private static generateProfileName(): string {
    const adjectives = ['Swift', 'Clever', 'Brave', 'Wise', 'Quick', 'Bold'];
    const nouns = ['Fox', 'Wolf', 'Eagle', 'Hawk', 'Tiger', 'Lion'];

    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 9999) + 1;

    return `${adjective}${noun}${number}`;
  }

  /**
   * Create multiple test profiles
   */
  static generateMultipleProfiles(count: number): ProfileData[] {
    return Array.from({ length: count }, () => this.generateTestProfile());
  }

  /**
   * Verify profile visibility in messages
   */
  static verifyProfileVisibilityInMessage(
    message: any,
    expectedProfileName: string
  ): boolean {
    // In a real message object, the sender field should contain profile info
    return (
      message &&
      message.sender &&
      (message.sender.profileName === expectedProfileName ||
        message.sender.displayName === expectedProfileName)
    );
  }

  /**
   * Check profile name uniqueness in a list
   */
  static checkProfileNameUniqueness(profiles: ProfileData[]): {
    allUnique: boolean;
    duplicates: string[];
  } {
    const profileNames = profiles
      .filter(p => p.profileName)
      .map(p => p.profileName);

    const duplicates = profileNames.filter(
      (name, index) => profileNames.indexOf(name) !== index
    );

    return {
      allUnique: duplicates.length === 0,
      duplicates,
    };
  }
}
