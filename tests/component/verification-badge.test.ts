import { test, expect } from '@playwright/test';
import { CryptoTestHelpers } from '../support/helpers/crypto-helpers';

test.describe('VerificationBadge Component', () => {
  test('[P0] Badge displays for verified messages', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/lobby');

    // WHEN: A verified message is displayed
    await page.getByPlaceholder('Type your message').fill('Verified message');
    await page.getByRole('button', { name: 'Send' }).click();

    // THEN: Verification badge is visible
    const messageElement = page.getByText('Verified message').locator('..');
    await expect(messageElement.getByText('✓ Verified')).toBeVisible();
  });

  test('[P0] Badge shows verification status', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/lobby');

    // WHEN: Message is sent
    await page.getByPlaceholder('Type your message').fill('Test verification status');
    await page.getByRole('button', { name: 'Send' }).click();

    // THEN: Badge shows correct status
    const messageElement = page.getByText('Test verification status').locator('..');
    const badge = messageElement.getByTestId('verification-badge');

    await expect(badge).toBeVisible();
    await expect(badge).toHaveClass(/verified/);
  });

  test('[P0] Badge indicates invalid signature', async ({ page }) => {
    // GIVEN: User is in lobby
    await page.goto('/lobby');

    // WHEN: Invalid signature is detected
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('receive-message', {
        detail: {
          content: 'Invalid signature message',
          senderPublicKey: '0x' + '00'.repeat(32),
          signature: '0x' + 'ff'.repeat(128),
          timestamp: new Date().toISOString(),
        }
      }));
    });

    // THEN: Verification badge shows failure
    await expect(page.getByText('✗ Verification Failed')).toBeVisible();
  });

  test('[P1] Badge displays signature details on click', async ({ page, authenticatedProfile }) => {
    // GIVEN: Verified message in lobby
    await page.goto('/lobby');

    await page.getByPlaceholder('Type your message').fill('Message with signature details');
    await page.getByRole('button', { name: 'Send' }).click();

    // WHEN: User clicks verification badge
    const messageElement = page.getByText('Message with signature details').locator('..');
    await messageElement.getByText('✓ Verified').click();

    // THEN: Signature details modal is displayed
    await expect(page.getByText('Signature Details')).toBeVisible();
    await expect(page.getByText('Public Key:')).toBeVisible();
    await expect(page.getByText('Signature:')).toBeVisible();
    await expect(page.getByText('Algorithm: Ed25519')).toBeVisible();
  });

  test('[P1] Badge tooltip shows verification info', async ({ page, authenticatedProfile }) => {
    // GIVEN: Verified message in lobby
    await page.goto('/lobby');

    await page.getByPlaceholder('Type your message').fill('Message with tooltip');
    await page.getByRole('button', { name: 'Send' }).click();

    // WHEN: User hovers over verification badge
    const messageElement = page.getByText('Message with tooltip').locator('..');
    const badge = messageElement.getByTestId('verification-badge');

    await badge.hover();

    // THEN: Tooltip shows verification information
    await expect(page.getByText('Cryptographically verified')).toBeVisible();
  });

  test('[P1] Badge has proper visual styling', async ({ page, authenticatedProfile }) => {
    // GIVEN: Verified message
    await page.goto('/lobby');

    await page.getByPlaceholder('Type your message').fill('Styled verification');
    await page.getByRole('button', { name: 'Send' }).click();

    // THEN: Badge has correct styling classes
    const messageElement = page.getByText('Styled verification').locator('..');
    const badge = messageElement.getByTestId('verification-badge');

    await expect(badge).toHaveClass(/verification-badge/);
    await expect(badge).toHaveClass(/verified/);
  });

  test('[P2] Badge is accessible', async ({ page, authenticatedProfile }) => {
    // GIVEN: Verified message
    await page.goto('/lobby');

    await page.getByPlaceholder('Type your message').fill('Accessible badge');
    await page.getByRole('button', { name: 'Send' }).click();

    // THEN: Badge has proper ARIA attributes
    const messageElement = page.getByText('Accessible badge').locator('..');
    const badge = messageElement.getByTestId('verification-badge');

    await expect(badge).toHaveAttribute('role', 'img');
    await expect(badge).toHaveAttribute('aria-label');
  });

  test('[P2] Badge shows different states', async ({ page }) => {
    // GIVEN: Different verification states
    await page.goto('/lobby');

    // Verified state
    await page.getByPlaceholder('Type your message').fill('Verified');
    await page.getByRole('button', { name: 'Send' }).click();

    let badge = page.getByText('Verified').locator('..').getByTestId('verification-badge');
    await expect(badge).toHaveText('✓ Verified');

    // Invalid signature state
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('receive-message', {
        detail: {
          content: 'Invalid',
          senderPublicKey: '0x' + '00'.repeat(32),
          signature: '0x' + 'ff'.repeat(128),
          timestamp: new Date().toISOString(),
        }
      }));
    });

    // THEN: Different states show different badges
    await expect(page.getByText('✗ Verification Failed')).toBeVisible();
  });
});

test.describe('VerificationBadge Component - Cryptographic Validation', () => {
  test('[P0] Signature format validation', async ({ page, authenticatedProfile }) => {
    // GIVEN: Verified message
    await page.goto('/lobby');

    await page.getByPlaceholder('Type your message').fill('Signature format test');
    await page.getByRole('button', { name: 'Send' }).click();

    // WHEN: User views signature details
    const messageElement = page.getByText('Signature format test').locator('..');
    await messageElement.getByText('✓ Verified').click();

    // THEN: Signature format is valid Ed25519
    const signatureText = await page.getByText(/Signature: 0x/).textContent();
    expect(signatureText).toMatch(/Signature: 0x[0-9a-f]{128}/i);
  });

  test('[P0] Public key is displayed correctly', async ({ page, authenticatedProfile }) => {
    // GIVEN: Verified message
    await page.goto('/lobby');

    await page.getByPlaceholder('Type your message').fill('Public key display');
    await page.getByRole('button', { name: 'Send' }).click();

    // WHEN: User views signature details
    const messageElement = page.getByText('Public key display').locator('..');
    await messageElement.getByText('✓ Verified').click();

    // THEN: Public key is displayed in correct format
    const publicKeyText = await page.getByText(/Public Key: 0x/).textContent();
    expect(publicKeyText).toMatch(/Public Key: 0x[0-9a-f]{64}/i);
  });

  test('[P1] Algorithm information is shown', async ({ page, authenticatedProfile }) => {
    // GIVEN: Verified message
    await page.goto('/lobby');

    await page.getByPlaceholder('Type your message').fill('Algorithm info');
    await page.getByRole('button', { name: 'Send' }).click();

    // WHEN: User views signature details
    const messageElement = page.getByText('Algorithm info').locator('..');
    await messageElement.getByText('✓ Verified').click();

    // THEN: Algorithm is specified as Ed25519
    await expect(page.getByText('Algorithm: Ed25519')).toBeVisible();
  });

  test('[P1] Timestamp is displayed', async ({ page, authenticatedProfile }) => {
    // GIVEN: Verified message
    await page.goto('/lobby');

    await page.getByPlaceholder('Type your message').fill('Timestamp display');
    await page.getByRole('button', { name: 'Send' }).click();

    // WHEN: User views signature details
    const messageElement = page.getByText('Timestamp display').locator('..');
    await messageElement.getByText('✓ Verified').click();

    // THEN: Timestamp is shown
    await expect(page.getByText('Signed at:')).toBeVisible();
    const timestampText = await page.getByText(/Signed at: \d{4}-\d{2}-\d{2}/).textContent();
    expect(timestampText).toBeTruthy();
  });
});
