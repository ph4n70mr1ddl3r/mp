import { faker } from '@faker-js/faker';

export interface TestUser {
  id?: string;
  publicKey: string;
  profileName?: string;
  email?: string;
  createdAt?: string;
}

/**
 * User Factory for creating test users
 * Generates unique users with proper cryptographic keys
 */
export class UserFactory {
  private createdUsers: string[] = [];

  /**
   * Create a new test user with generated cryptographic key pair
   */
  async createUser(overrides: Partial<TestUser> = {}): Promise<TestUser> {
    const user: TestUser = {
      publicKey: this.generatePublicKey(),
      profileName: overrides.profileName || faker.person.fullName(),
      email: overrides.email || faker.internet.email(),
      createdAt: new Date().toISOString(),
      ...overrides,
    };

    // In real implementation, this would create user via API
    // For now, just track the user
    this.createdUsers.push(user.publicKey);

    return user;
  }

  /**
   * Generate a valid-looking public key for testing
   * In real tests, this would generate actual Ed25519 keys
   */
  private generatePublicKey(): string {
    // Generate a 32-byte key and encode as hex
    const bytes = faker.number.int({ min: 0, max: 255 });
    const keyArray = new Array(32).fill(0).map(() => faker.number.int({ min: 0, max: 255 }));
    return '0x' + keyArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Create multiple users at once
   */
  async createUsers(count: number, overrides: Partial<TestUser> = {}): Promise<TestUser[]> {
    const users: TestUser[] = [];
    for (let i = 0; i < count; i++) {
      users.push(await this.createUser(overrides));
    }
    return users;
  }

  /**
   * Create a user with a specific public key
   */
  async createUserWithKey(publicKey: string, overrides: Partial<TestUser> = {}): Promise<TestUser> {
    const user: TestUser = {
      publicKey,
      profileName: overrides.profileName || faker.person.fullName(),
      email: overrides.email || faker.internet.email(),
      createdAt: new Date().toISOString(),
      ...overrides,
    };

    this.createdUsers.push(user.publicKey);
    return user;
  }

  /**
   * Clean up all created users
   * In real implementation, this would delete users via API
   */
  async cleanup(): Promise<void> {
    // In real implementation, would call DELETE /api/users/{publicKey} for each
    this.createdUsers = [];
    console.log(`Cleaned up ${this.createdUsers.length} test users`);
  }
}
