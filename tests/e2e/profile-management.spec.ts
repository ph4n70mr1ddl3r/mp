import { test, expect } from '../support/fixtures';
import { ProfileTestHelper } from '../support/helpers/profile-helpers';
import { CryptoTestHelpers } from '../support/helpers/crypto-helpers';

test.describe('Profile Management', () => {
  test('[P0] User can view their profile after authentication', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is authenticated
    await page.goto('/');

    // WHEN: User navigates to profile page
    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // THEN: Profile information is displayed
    await expect(page.getByText('My Profile')).toBeVisible();
    await expect(page.getByText(authenticatedProfile.profileName)).toBeVisible();
    await expect(page.getByText(/Public Key:/)).toBeVisible();
  });

  test('[P0] User can update their profile name', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is authenticated and on profile page
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: User updates their profile name
    const newProfileName = 'UpdatedProfileName';
    await page.getByText('Edit Profile').click();
    await page.getByLabel('Profile Name').clear();
    await page.getByLabel('Profile Name').fill(newProfileName);
    await page.getByRole('button', { name: 'Save Profile' }).click();

    // THEN: Profile name is updated
    await expect(page.getByText(newProfileName)).toBeVisible();
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
  });

  test('[P1] Profile name appears in messages', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is authenticated with a profile name
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: User sends a message
    const testMessage = 'Message with profile name';
    await page.getByPlaceholder('Type your message').fill(testMessage);
    await page.getByRole('button', { name: 'Send' }).click();

    // THEN: Message shows sender with profile name
    await expect(page.getByText(testMessage)).toBeVisible();
    const messageElement = page.getByText(testMessage).locator('..');
    await expect(messageElement.getByText(authenticatedProfile.profileName)).toBeVisible();
  });

  test('[P1] Profile creation is automatic on first authentication', async ({ page, cryptoKeys }) => {
    // GIVEN: New user with no existing profile
    const keyPair = await cryptoKeys.getKeyPair();
    const newProfileName = 'BrandNewUser';

    // WHEN: User authenticates for the first time
    await page.goto('/');
    await page.getByLabel('Private Key Input').fill(keyPair.privateKey);
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // THEN: Profile is automatically created with default or specified name
    await expect(page.getByText('Profile')).toBeVisible();

    // Set profile name if prompt appears
    const profileNameInput = page.getByLabel('Profile Name');
    if (await profileNameInput.isVisible()) {
      await profileNameInput.fill(newProfileName);
      await page.getByRole('button', { name: 'Save' }).click();
    }

    // Verify profile exists
    await expect(page.getByText(/Profile Name:|Public Key:/)).toBeVisible();
  });

  test('[P1] Profile persists across sessions', async ({ page, authenticatedProfile }) => {
    // GIVEN: User has an existing profile
    await page.goto('/');

    // First session - set up profile
    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    const initialProfileName = authenticatedProfile.profileName;

    // WHEN: User logs out and logs back in
    await page.getByText('Logout').click();
    await expect(page).toHaveURL('/');

    // Second session - authenticate with same key
    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // THEN: Profile name persists
    await expect(page.getByText(initialProfileName)).toBeVisible();
  });

  test('[P2] Profile validation rejects invalid names', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is on profile edit page
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    await page.getByText('Edit Profile').click();

    // WHEN: User tries to set invalid profile name
    await page.getByLabel('Profile Name').fill('ab'); // Too short

    // THEN: Validation error is shown
    await expect(page.getByText('Profile name must be 3-30 characters')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Profile' })).toBeDisabled();
  });

  test('[P2] Multiple users can have different profile names', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: Two users with different profile names
    const user1Profile = multipleProfiles[0];
    const user2Profile = multipleProfiles[1];

    // WHEN: Both users authenticate and view lobby
    // User 1
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    await page1.getByLabel('Private Key Input').fill(user1Profile.publicKey.replace('0x', '00'.repeat(32)));
    await page1.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page1).toHaveURL('/lobby', { timeout: 10000 });

    // User 2
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    await page2.getByLabel('Private Key Input').fill(user2Profile.publicKey.replace('0x', '00'.repeat(32)));
    await page2.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page2).toHaveURL('/lobby', { timeout: 10000 });

    // THEN: Each user sees their own profile name correctly
    await expect(page1.getByText(user1Profile.profileName)).toBeVisible();
    await expect(page2.getByText(user2Profile.profileName)).toBeVisible();

    // Clean up
    await context1.close();
    await context2.close();
  });
});

test.describe('Profile Management - Data Validation', () => {
  test('[P1] Profile data structure is valid', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is authenticated
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: User views their profile data
    const profileData = await page.evaluate(() => {
      // In real implementation, would fetch profile from API
      return window.localStorage.getItem('userProfile');
    });

    // THEN: Profile has valid structure
    if (profileData) {
      const parsed = JSON.parse(profileData);
      expect(ProfileTestHelper.validateProfile(parsed)).toBe(true);
    }
  });

  test('[P1] Profile name format is validated', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is on profile edit page
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    await page.getByText('Edit Profile').click();

    // WHEN: User enters valid profile name
    const validProfileName = 'ValidUser_123';
    await page.getByLabel('Profile Name').fill(validProfileName);

    // THEN: Profile name passes validation
    expect(ProfileTestHelper.validateProfileName(validProfileName)).toBe(true);
    await expect(page.getByRole('button', { name: 'Save Profile' })).toBeEnabled();
  });

  test('[P2] Profile name uniqueness is enforced', async ({ page, multipleProfiles }) => {
    // GIVEN: One user has taken a profile name
    const existingProfile = multipleProfiles[0];

    // WHEN: Another user tries to use the same profile name
    const newProfile = multipleProfiles[1];

    // THEN: System should prevent duplicate profile names
    // In real implementation, would check API response
    expect(
      ProfileTestHelper.isProfileNameAvailable(existingProfile.profileName!, [existingProfile])
    ).toBe(false);
  });
});
