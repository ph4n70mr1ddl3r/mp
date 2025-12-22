import { test as base } from '@playwright/test';
import { UserFactory } from './factories/user-factory';
import { CryptographicKeyPair } from './factories/crypto-factory';

/**
 * Test fixtures for MP application
 * Provides reusable test data and setup with automatic cleanup
 */

type TestFixtures = {
  userFactory: UserFactory;
  cryptoKeys: CryptographicKeyPair;
};

export const test = base.extend<TestFixtures>({
  userFactory: async ({}, use) => {
    const factory = new UserFactory();
    await use(factory);
    await factory.cleanup();
  },

  cryptoKeys: async ({}, use) => {
    const keyPair = new CryptographicKeyPair();
    await use(keyPair);
    // Cryptographic keys don't need cleanup
  },
});

export { expect } from '@playwright/test';
