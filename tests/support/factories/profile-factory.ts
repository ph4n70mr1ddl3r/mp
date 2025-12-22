import { faker } from '@faker-js/faker';

export interface TestProfile {
  publicKey: string;
  profileName: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Profile Factory for creating test user profiles
 * Generates unique profiles with cryptographic keys
 */
export class ProfileFactory {
  private createdProfiles: string[] = [];

  /**
   * Create a new test profile with generated cryptographic key
   */
  async createProfile(overrides: Partial<TestProfile> = {}): Promise<TestProfile> {
    const profile: TestProfile = {
      publicKey: this.generatePublicKey(),
      profileName: overrides.profileName || this.generateProfileName(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };

    this.createdProfiles.push(profile.publicKey);
    return profile;
  }

  /**
   * Generate a valid-looking public key for testing
   */
  private generatePublicKey(): string {
    const bytes = new Array(32).fill(0).map(() => faker.number.int({ min: 0, max: 255 }));
    return '0x' + bytes.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Generate a profile name (username)
   */
  private generateProfileName(): string {
    const adjectives = ['Swift', 'Clever', 'Brave', 'Wise', 'Quick', 'Bold'];
    const nouns = ['Fox', 'Wolf', 'Eagle', 'Hawk', 'Tiger', 'Lion'];

    const adjective = faker.helpers.arrayElement(adjectives);
    const noun = faker.helpers.arrayElement(nouns);
    const number = faker.number.int({ min: 1, max: 9999 });

    return `${adjective}${noun}${number}`;
  }

  /**
   * Create multiple profiles at once
   */
  async createProfiles(count: number, overrides: Partial<TestProfile> = {}): Promise<TestProfile[]> {
    const profiles: TestProfile[] = [];
    for (let i = 0; i < count; i++) {
      profiles.push(await this.createProfile(overrides));
    }
    return profiles;
  }

  /**
   * Create a profile with a specific name
   */
  async createProfileWithName(profileName: string, overrides: Partial<TestProfile> = {}): Promise<TestProfile> {
    return this.createProfile({
      profileName,
      ...overrides,
    });
  }

  /**
   * Clean up all created profiles
   */
  async cleanup(): Promise<void> {
    // In real implementation, would delete profiles via API
    this.createdProfiles = [];
    console.log(`Cleaned up ${this.createdProfiles.length} test profiles`);
  }
}
