import { test, expect } from '../support/fixtures';
import { NFRTestHelpers } from '../support/helpers/nfr-helpers';
import { MessageFactory } from '../support/factories/message-factory';

test.describe('Error Handling', () => {
  test('[P0] Invalid signature rejects message', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: System receives message with invalid signature
    await page.evaluate(() => {
      // Simulate receiving tampered message
      window.dispatchEvent(new CustomEvent('receive-message', {
        detail: {
          content: 'Tampered message',
          senderPublicKey: '0x' + '00'.repeat(32),
          signature: '0x' + 'ff'.repeat(128), // Invalid signature
          timestamp: new Date().toISOString(),
        }
      }));
    });

    // THEN: Message is rejected and not displayed
    await expect(page.getByText('Tampered message')).not.toBeVisible();
    await expect(page.getByText('Signature verification failed')).toBeVisible();
  });

  test('[P0] Network failure shows error message', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: Network connection fails
    await page.context().setOffline(true);

    // User tries to send message
    await page.getByPlaceholder('Type your message').fill('Test message');
    await page.getByRole('button', { name: 'Send' }).click();

    // THEN: Error message is displayed
    await expect(page.getByText('Connection error. Please check your network.')).toBeVisible();

    // Restore connection
    await page.context().setOffline(false);
  });

  test('[P0] Private key validation rejects invalid format', async ({ page }) => {
    // GIVEN: User is on authentication page
    await page.goto('/');

    // WHEN: User enters invalid private key format
    await page.getByLabel('Private Key Input').fill('invalid-key-format');
    await page.getByRole('button', { name: 'Authenticate' }).click();

    // THEN: Validation error is shown
    await expect(page.getByText('Invalid key format. Must be 64 hexadecimal characters.')).toBeVisible();
    await expect(page).toHaveURL('/'); // Stay on login page
  });

  test('[P1] Authentication failure with non-existent key', async ({ page, cryptoKeys }) => {
    // GIVEN: User provides a key that doesn't exist in the system
    const keyPair = await cryptoKeys.getKeyPair();
    await page.goto('/');

    // WHEN: User tries to authenticate
    await page.getByLabel('Private Key Input').fill(keyPair.privateKey);
    await page.getByRole('button', { name: 'Authenticate' }).click();

    // THEN: Authentication fails gracefully with error message
    await expect(page.getByText('Authentication failed. Key not recognized.')).toBeVisible();
    await expect(page).toHaveURL('/'); // Stay on login page
  });

  test('[P1] Recovery from network errors', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // Simulate network failure
    await page.context().setOffline(true);
    await page.getByPlaceholder('Type your message').fill('Message during outage');
    await page.getByRole('button', { name: 'Send' }).click();

    await expect(page.getByText('Connection error')).toBeVisible();

    // WHEN: Network is restored
    await page.context().setOffline(false);

    // THEN: Connection recovers automatically - wait for reconnection indicator
    await expect(page.getByText('Reconnected')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('Connection error')).not.toBeVisible();
  });

  test('[P1] Server restart recovery', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is authenticated and in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: Server restarts (simulated by closing and reopening WebSocket)
    await page.evaluate(() => {
      // Simulate server restart
      window.dispatchEvent(new CustomEvent('server-restart'));
    });

    // THEN: Client reconnects automatically
    await expect(page.getByText('Reconnecting...')).toBeVisible();
    await expect(page.getByText('Connected')).toBeVisible({ timeout: 10000 });
  });

  test('[P2] Message queue during offline', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: User goes offline and tries to send message
    await page.context().setOffline(true);
    await page.getByPlaceholder('Type your message').fill('Queued message');
    await page.getByRole('button', { name: 'Send' }).click();

    // THEN: Message is queued locally
    await expect(page.getByText('Message queued (offline)')).toBeVisible();

    // WHEN: User comes back online
    await page.context().setOffline(false);

    // THEN: Queued messages are sent - wait for queue to clear
    await expect(page.getByText('Message queued (offline)')).not.toBeVisible({ timeout: 5000 });
  });

  test('[P2] Rate limiting displays appropriate message', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: User sends messages rapidly (rate limiting triggered)
    for (let i = 0; i < 15; i++) {
      await page.getByPlaceholder('Type your message').fill(`Message ${i}`);
      await page.getByRole('button', { name: 'Send' }).click();
      await page.waitForTimeout(100);
    }

    // THEN: Rate limit message is displayed
    await expect(page.getByText('Too many messages. Please wait a moment.')).toBeVisible();
  });

  test('[P2] Graceful handling of malformed messages', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: Malformed message is received
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('receive-message', {
        detail: {
          // Missing required fields
          content: 'Incomplete message',
        }
      }));
    });

    // THEN: Message is rejected without crashing
    await expect(page.getByText('Malformed message received')).toBeVisible();
    await expect(page).toHaveURL('/lobby'); // Still in lobby
  });
});

test.describe('Error Handling - Cryptographic Validation', () => {
  test('[P0] All messages have valid signatures', async ({ page, authenticatedProfile, messageFactory }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: User sends message
    await page.getByPlaceholder('Type your message').fill('Test message');
    await page.getByRole('button', { name: 'Send' }).click();

    // THEN: Message has signature
    const messages = await page.locator('[data-testid="message"]').all();
    expect(messages.length).toBeGreaterThan(0);

    // Verify signature format
    for (const message of messages) {
      const signatureElement = message.locator('[data-testid="signature"]');
      if (await signatureElement.isVisible()) {
        const signature = await signatureElement.textContent();
        expect(signature).toMatch(/^0x[0-9a-f]{128}$/i);
      }
    }
  });

  test('[P0] Tampered messages are detected', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: Tampered message is received (signature doesn't match content)
    const messageFactory = new MessageFactory();
    const tamperedMessage = messageFactory.createTamperedMessage(
      authenticatedProfile.publicKey,
      'Original content'
    );

    await page.evaluate((msg) => {
      window.dispatchEvent(new CustomEvent('receive-message', { detail: msg }));
    }, tamperedMessage);

    // THEN: Tampered message is rejected
    await expect(page.getByText('Signature verification failed')).toBeVisible();
    await expect(page.getByText('Original content')).not.toBeVisible();
  });

  test('[P1] Multiple invalid signatures are handled', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: Multiple invalid messages are received
    for (let i = 0; i < 3; i++) {
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('receive-message', {
          detail: {
            content: `Invalid message ${i}`,
            senderPublicKey: '0x' + '00'.repeat(32),
            signature: '0x' + 'ff'.repeat(128),
            timestamp: new Date().toISOString(),
          }
        }));
      });
    }

    // THEN: All are rejected, error is logged
    await expect(page.getByText('Signature verification failed')).toBeVisible();
  });
});

test.describe('Error Handling - Performance Under Error', () => {
  test('[P0] Authentication timeout is handled', async ({ page }) => {
    // GIVEN: Slow authentication
    const startTime = Date.now();

    await page.goto('/');

    // Simulate slow response
    await page.route('**/api/auth', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 15000)); // 15 second delay
      route.continue();
    });

    await page.getByLabel('Private Key Input').fill('0x' + '00'.repeat(32));
    await page.getByRole('button', { name: 'Authenticate' }).click();

    // WHEN: Authentication times out
    await expect(page.getByText('Authentication timeout. Please try again.')).toBeVisible({ timeout: 20000 });

    const elapsed = Date.now() - startTime;

    // THEN: Timeout is reasonable and error is shown
    expect(elapsed).toBeLessThan(20000);
    await expect(page).toHaveURL('/');
  });

  test('[P1] Lobby recovery after errors', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: Multiple errors occur
    await page.context().setOffline(true);
    await page.getByPlaceholder('Type your message').fill('Message 1');
    await page.getByRole('button', { name: 'Send' }).click();

    await page.context().setOffline(false);
    await page.waitForTimeout(2000);

    // THEN: Lobby recovers and functions normally
    await page.getByPlaceholder('Type your message').fill('Message after recovery');
    await page.getByRole('button', { name: 'Send' }).click();
    await expect(page.getByText('Message after recovery')).toBeVisible();
  });
});
