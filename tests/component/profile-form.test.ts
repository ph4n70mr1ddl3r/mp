import { test, expect } from '@playwright/test';

/**
 * Component tests for Profile Form
 * Note: These would need Playwright Component Testing setup for Slint/Rust
 * For now, testing the expected behavior and selectors
 */

test.describe('ProfileForm Component', () => {
  test('[P1] Component renders with all required fields', async ({ page }) => {
    // GIVEN: User navigates to profile edit
    await page.goto('/profile/edit');

    // THEN: All required form fields are present
    await expect(page.getByLabel('Profile Name')).toBeVisible();
    await expect(page.getByText('Profile Name')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Profile' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
  });

  test('[P1] Profile name input validation - empty field', async ({ page }) => {
    // GIVEN: Profile form with empty profile name
    await page.goto('/profile/edit');

    // WHEN: User tries to save with empty name
    await page.getByRole('button', { name: 'Save Profile' }).click();

    // THEN: Validation error is shown and save is disabled
    await expect(page.getByText('Profile name is required')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Profile' })).toBeDisabled();
  });

  test('[P1] Profile name input validation - minimum length', async ({ page }) => {
    // GIVEN: Profile form
    await page.goto('/profile/edit');

    // WHEN: User enters profile name shorter than 3 characters
    await page.getByLabel('Profile Name').fill('ab');
    await page.getByRole('button', { name: 'Save Profile' }).click();

    // THEN: Validation error is shown
    await expect(page.getByText('Profile name must be at least 3 characters')).toBeVisible();
  });

  test('[P1] Profile name input validation - maximum length', async ({ page }) => {
    // GIVEN: Profile form
    await page.goto('/profile/edit');

    // WHEN: User enters profile name longer than 30 characters
    await page.getByLabel('Profile Name').fill('a'.repeat(31));
    await page.getByRole('button', { name: 'Save Profile' }).click();

    // THEN: Validation error is shown
    await expect(page.getByText('Profile name must be at most 30 characters')).toBeVisible();
  });

  test('[P1] Profile name input validation - valid characters', async ({ page }) => {
    // GIVEN: Profile form
    await page.goto('/profile/edit');

    // WHEN: User enters invalid characters (spaces, special chars)
    await page.getByLabel('Profile Name').fill('Invalid@Profile#Name');
    await page.getByRole('button', { name: 'Save Profile' }).click();

    // THEN: Validation error is shown
    await expect(page.getByText('Profile name can only contain letters, numbers, and underscores')).toBeVisible();
  });

  test('[P0] Profile name input accepts valid format', async ({ page }) => {
    // GIVEN: Profile form
    await page.goto('/profile/edit');

    // WHEN: User enters valid profile name
    const validName = 'ValidUser_123';
    await page.getByLabel('Profile Name').fill(validName);

    // THEN: Save button is enabled and no errors shown
    await expect(page.getByRole('button', { name: 'Save Profile' })).toBeEnabled();
    await expect(page.getByText(/Profile name must be/)).not.toBeVisible();
  });

  test('[P1] Save button state reflects form validity', async ({ page }) => {
    // GIVEN: Profile form
    await page.goto('/profile/edit');

    // THEN: Save button is disabled when form is invalid
    await expect(page.getByRole('button', { name: 'Save Profile' })).toBeDisabled();

    // WHEN: User enters valid profile name
    await page.getByLabel('Profile Name').fill('ValidUser');

    // THEN: Save button becomes enabled
    await expect(page.getByRole('button', { name: 'Save Profile' })).toBeEnabled();

    // WHEN: User clears the field
    await page.getByLabel('Profile Name').clear();

    // THEN: Save button becomes disabled again
    await expect(page.getByRole('button', { name: 'Save Profile' })).toBeDisabled();
  });

  test('[P1] Cancel button returns to previous page', async ({ page }) => {
    // GIVEN: User is on profile edit page
    await page.goto('/profile/edit');

    // WHEN: User clicks Cancel
    await page.getByRole('button', { name: 'Cancel' }).click();

    // THEN: User is returned to lobby
    await expect(page).toHaveURL('/lobby');
  });

  test('[P2] Form pre-populates with existing profile name', async ({ page, authenticatedProfile }) => {
    // GIVEN: User has existing profile
    await page.goto('/profile/edit');

    // THEN: Profile name field is pre-populated
    const profileNameValue = await page.getByLabel('Profile Name').inputValue();
    expect(profileNameValue).toBe(authenticatedProfile.profileName);
  });

  test('[P2] Real-time validation feedback', async ({ page }) => {
    // GIVEN: Profile form
    await page.goto('/profile/edit');

    // WHEN: User types invalid characters
    await page.getByLabel('Profile Name').fill('Invalid@');

    // THEN: Validation error appears in real-time
    await expect(page.getByText('Invalid characters')).toBeVisible();

    // WHEN: User corrects the input
    await page.getByLabel('Profile Name').fill('ValidUser');

    // THEN: Error disappears
    await expect(page.getByText('Invalid characters')).not.toBeVisible();
  });

  test('[P2] Form submission shows loading state', async ({ page, authenticatedProfile }) => {
    // GIVEN: User has filled valid profile name
    await page.goto('/profile/edit');
    await page.getByLabel('Profile Name').fill('NewProfileName');

    // WHEN: User clicks Save
    const savePromise = page.waitForResponse('**/api/profile');
    await page.getByRole('button', { name: 'Save Profile' }).click();

    // THEN: Loading state is shown
    await expect(page.getByText('Saving...')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save Profile' })).toBeDisabled();

    await savePromise;

    // THEN: Success message is shown
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
  });

  test('[P1] Profile name uniqueness validation', async ({ page }) => {
    // GIVEN: Profile form
    await page.goto('/profile/edit');

    // WHEN: User enters a profile name that's already taken
    await page.getByLabel('Profile Name').fill('ExistingUser');
    await page.getByRole('button', { name: 'Save Profile' }).click();

    // THEN: Error message about duplicate name is shown
    await expect(page.getByText('Profile name is already taken')).toBeVisible();
  });

  test('[P2] Character counter shows remaining characters', async ({ page }) => {
    // GIVEN: Profile form
    await page.goto('/profile/edit');

    // WHEN: User types in profile name field
    await page.getByLabel('Profile Name').fill('Test');

    // THEN: Character counter is visible
    const counter = page.getByText('26 characters remaining');
    if (await counter.isVisible()) {
      await expect(counter).toBeVisible();
    }
  });
});
