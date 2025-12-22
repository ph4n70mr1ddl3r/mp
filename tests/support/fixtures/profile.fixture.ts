import { test as base } from '@playwright/test';
import { ProfileFactory } from '../factories/profile-factory';

/**
 * Profile fixture - provides authenticated user with profile data
 */

type ProfileFixtures = {
  profileFactory: ProfileFactory;
  authenticatedProfile: {
    publicKey: string;
    profileName: string;
  };
  multipleProfiles: Array<{
    publicKey: string;
    profileName: string;
  }>;
};

export const test = base.extend<ProfileFixtures>({
  profileFactory: async ({}, use) => {
    const factory = new ProfileFactory();
    await use(factory);
  },

  authenticatedProfile: async ({ page, profileFactory }, use) => {
    // Create a test profile
    const profile = await profileFactory.createProfile();

    // In real implementation, would authenticate with this key
    // For now, just provide the profile data
    await use({
      publicKey: profile.publicKey,
      profileName: profile.profileName,
    });

    // Cleanup is handled by profileFactory.cleanup()
  },

  multipleProfiles: async ({ profileFactory }, use) => {
    // Create 3 test profiles for multi-user testing
    const profiles = await profileFactory.createProfiles(3);
    await use(profiles);

    // Cleanup is handled by profileFactory.cleanup()
  },
});

export { expect } from '@playwright/test';
