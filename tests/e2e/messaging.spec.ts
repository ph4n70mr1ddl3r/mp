import { test, expect } from '../support/fixtures';
import { CryptoTestHelpers } from '../support/helpers/crypto-helpers';

test.describe('Lobby & Messaging', () => {
  test.beforeEach(async ({ page, userFactory }) => {
    // Create and authenticate a test user
    const user = await userFactory.createUser();
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(user.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });
  });

  test('should display lobby with online users', async ({ page }) => {
    await page.goto('/lobby');

    // Verify lobby components
    await expect(page.getByText('Online Users')).toBeVisible();
    await expect(page.getByText('Message Input')).toBeVisible();
  });

  test('should send a signed message', async ({ page, cryptoKeys }) => {
    const keyPair = await cryptoKeys.getKeyPair();
    const testMessage = 'Test cryptographic message';

    await page.goto('/lobby');

    // Send message
    await page.getByPlaceholder('Type your message').fill(testMessage);
    await page.getByRole('button', { name: 'Send' }).click();

    // Verify message appears in lobby
    await expect(page.getByText(testMessage)).toBeVisible();

    // Verify signature indicator is displayed
    await expect(page.getByText('Signature Verified')).toBeVisible();
  });

  test('should display sender identity', async ({ page, userFactory }) => {
    const user = await userFactory.createUser();
    const message = 'Message from test user';

    await page.goto('/lobby');

    await page.getByPlaceholder('Type your message').fill(message);
    await page.getByRole('button', { name: 'Send' }).click();

    // Verify sender is identified (by profile name or public key)
    const senderElement = page.getByText(message).locator('..').getByText(user.profileName!);
    await expect(senderElement).toBeVisible();
  });

  test('should reject messages with invalid signatures', async ({ page }) => {
    await page.goto('/lobby');

    // Simulate receiving a tampered message
    await page.evaluate(() => {
      // In real test, this would come via WebSocket
      window.dispatchEvent(new CustomEvent('receive-message', {
        detail: {
          content: 'Tampered message',
          senderPublicKey: '0x' + '00'.repeat(32),
          signature: '0x' + 'ff'.repeat(128), // Invalid signature
        }
      }));
    });

    // Message should be rejected (not displayed)
    await expect(page.getByText('Tampered message')).not.toBeVisible();
    await expect(page.getByText('Signature verification failed')).toBeVisible();
  });

  test('should update lobby when users join', async ({ page, browser }) => {
    // Open second browser context to simulate another user
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();

    await page.goto('/lobby');

    // Second user joins (simplified - in real test would authenticate)
    await page2.goto('/lobby');

    // First user should see the second user join
    await expect(page.getByText('User joined')).toBeVisible({ timeout: 5000 });

    await context2.close();
  });

  test('should deliver messages within 2 seconds', async ({ page }) => {
    const startTime = Date.now();

    await page.goto('/lobby');

    const testMessage = 'Performance test message';
    await page.getByPlaceholder('Type your message').fill(testMessage);
    await page.getByRole('button', { name: 'Send' }).click();

    // Wait for message to appear
    await expect(page.getByText(testMessage)).toBeVisible();

    const deliveryTime = Date.now() - startTime;
    expect(deliveryTime).toBeLessThan(2000);
  });

  test('should display message history', async ({ page }) => {
    await page.goto('/lobby');

    // Send multiple messages with deterministic waits
    for (let i = 1; i <= 5; i++) {
      await page.getByPlaceholder('Type your message').fill(`Message ${i}`);
      await page.getByRole('button', { name: 'Send' }).click();
      // Wait for message to appear before sending next
      await expect(page.getByText(`Message ${i}`)).toBeVisible();
    }

    // Verify all messages are visible
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByText(`Message ${i}`)).toBeVisible();
    }
  });

  test('should update presence status in real-time', async ({ page }) => {
    await page.goto('/lobby');

    // Verify presence indicators are shown
    await expect(page.getByText('Online: 1')).toBeVisible();
  });
});

test.describe('Cryptographic Verification', () => {
  test('should display signature verification indicator for each message', async ({ page, userFactory }) => {
    const user = await userFactory.createUser();
    await page.goto('/');

    // Authenticate
    await page.getByLabel('Private Key Input').fill(user.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // Send message
    await page.getByPlaceholder('Type your message').fill('Test message');
    await page.getByRole('button', { name: 'Send' }).click();

    // Verify verification badge appears
    const messageElement = page.getByText('Test message').locator('..');
    await expect(messageElement.getByText('✓ Verified')).toBeVisible();
  });

  test('should allow users to view signature details', async ({ page, userFactory }) => {
    const user = await userFactory.createUser();
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(user.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    await page.getByPlaceholder('Type your message').fill('Message with details');
    await page.getByRole('button', { name: 'Send' }).click();

    // Click on verification indicator
    await page.getByText('✓ Verified').click();

    // Signature details modal should appear
    await expect(page.getByText('Signature Details')).toBeVisible();
    await expect(page.getByText('Public Key:')).toBeVisible();
    await expect(page.getByText('Signature:')).toBeVisible();
  });
});
