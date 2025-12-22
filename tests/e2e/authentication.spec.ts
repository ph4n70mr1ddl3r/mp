import { test, expect } from '../support/fixtures';
import { CryptoTestHelpers } from '../support/helpers/crypto-helpers';

test.describe('Cryptographic Authentication', () => {
  test('should display key input interface', async ({ page }) => {
    await page.goto('/');

    // Verify key input components are visible
    await expect(page.getByLabel('Private Key Input')).toBeVisible();
    await expect(page.getByText('Generate New Key')).toBeVisible();
    await expect(page.getByText('Import from File')).toBeVisible();
  });

  test('should accept private key via text input', async ({ page, cryptoKeys }) => {
    await page.goto('/');

    // Get generated test key pair
    const keyPair = await cryptoKeys.getKeyPair();

    // Input private key
    await page.getByLabel('Private Key Input').fill(keyPair.privateKey);

    // Submit authentication
    await page.getByRole('button', { name: 'Authenticate' }).click();

    // Wait for authentication to complete
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });
  });

  test('should validate private key format', async ({ page }) => {
    await page.goto('/');

    // Try invalid key format
    await page.getByLabel('Private Key Input').fill('invalid-key-format');

    await page.getByRole('button', { name: 'Authenticate' }).click();

    // Should show error message
    await expect(page.getByText('Invalid key format')).toBeVisible();
  });

  test('should generate new key pair client-side', async ({ page }) => {
    await page.goto('/');

    // Click generate new key
    await page.getByText('Generate New Key').click();

    // Wait for key generation by checking the input is populated
    await expect(page.getByLabel('Private Key Input')).not.toHaveValue('');

    // Verify private key field is populated
    const privateKey = await page.getByLabel('Private Key Input').inputValue();
    expect(privateKey).toMatch(/^0x[0-9a-f]{64}$/i);

    // Verify public key is derived
    const publicKey = await page.getByText('Public Key:').textContent();
    expect(publicKey).toMatch(/^Public Key: 0x[0-9a-f]{64}$/i);
  });

  test('should complete authentication within 10 seconds', async ({ page, cryptoKeys }) => {
    const startTime = Date.now();

    await page.goto('/');

    const keyPair = await cryptoKeys.getKeyPair();
    await page.getByLabel('Private Key Input').fill(keyPair.privateKey);
    await page.getByRole('button', { name: 'Authenticate' }).click();

    // Wait for authentication
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(10000);
  });

  test('should export private key to file', async ({ page, cryptoKeys }) => {
    await page.goto('/');

    const keyPair = await cryptoKeys.getKeyPair();
    await page.getByLabel('Private Key Input').fill(keyPair.privateKey);

    // Click export button
    await page.getByText('Export to File').click();

    // Verify download started (in real test, would verify file contents)
    const downloadPromise = page.waitForEvent('download');
    await downloadPromise;
  });

  test('should handle authentication failure gracefully', async ({ page }) => {
    await page.goto('/');

    // Use a key that doesn't exist in the system
    await page.getByLabel('Private Key Input').fill('0x' + '00'.repeat(32));
    await page.getByRole('button', { name: 'Authenticate' }).click();

    // Should show error, not crash
    await expect(page.getByText('Authentication failed')).toBeVisible();
    await expect(page).toHaveURL('/'); // Stay on login page
  });
});

test.describe('Authentication - Cryptographic Validation', () => {
  test('should verify public key extraction from private key', async ({ page, cryptoKeys }) => {
    await page.goto('/');

    const keyPair = await cryptoKeys.getKeyPair();
    await page.getByLabel('Private Key Input').fill(keyPair.privateKey);

    // Public key should be automatically extracted and displayed
    await expect(page.getByText('Public Key:')).toBeVisible();

    const displayedPublicKey = await page.getByText(/Public Key: 0x/).textContent();
    expect(displayedPublicKey?.slice(13)).toBe(CryptoTestHelpers.strip0x(keyPair.publicKey));
  });

  test('should show signature verification indicator', async ({ page }) => {
    await page.goto('/');

    // Navigate to a state where verification is shown
    await expect(page.getByText('Verification Status')).toBeVisible();
  });
});
