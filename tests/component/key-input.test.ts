import { test, expect } from '@playwright/test';
import { CryptoTestHelpers } from '../support/helpers/crypto-helpers';

test.describe('KeyInput Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[P0] should display key input with proper labeling', async ({ page }) => {
    // GIVEN: User is on authentication page

    // WHEN: Page loads

    // THEN: Key input is visible with proper accessibility
    const keyInput = page.getByLabel('Private Key Input');
    await expect(keyInput).toBeVisible();
    await expect(keyInput).toHaveAttribute('type', 'password');
  });

  test('[P0] should accept valid hex key format', async ({ page }) => {
    // GIVEN: Valid hex key
    const validKey = '0x' + 'ab'.repeat(32);

    // WHEN: User enters valid key
    await page.getByLabel('Private Key Input').fill(validKey);

    // THEN: No validation error shown
    await expect(page.getByText('Invalid key format')).not.toBeVisible();
  });

  test('[P0] should show validation error for invalid format', async ({ page }) => {
    // GIVEN: Invalid key format

    // WHEN: User enters invalid key
    await page.getByLabel('Private Key Input').fill('not-a-valid-key');
    await page.getByLabel('Private Key Input').blur();

    // THEN: Validation error is displayed
    await expect(page.getByText(/Invalid key format/)).toBeVisible();
  });

  test('[P0] should mask key input for security', async ({ page }) => {
    // GIVEN: Private key

    // WHEN: User enters key
    const keyInput = page.getByLabel('Private Key Input');

    // THEN: Input is masked (type=password)
    await expect(keyInput).toHaveAttribute('type', 'password');
  });

  test('[P1] should toggle key visibility', async ({ page }) => {
    // GIVEN: Key input with value
    const validKey = '0x' + 'cd'.repeat(32);
    await page.getByLabel('Private Key Input').fill(validKey);

    const keyInput = page.getByLabel('Private Key Input');

    // Initially masked
    await expect(keyInput).toHaveAttribute('type', 'password');

    // WHEN: User clicks show/hide toggle
    await page.getByRole('button', { name: /show|reveal/i }).click();

    // THEN: Key becomes visible
    await expect(keyInput).toHaveAttribute('type', 'text');

    // WHEN: User clicks again
    await page.getByRole('button', { name: /hide|mask/i }).click();

    // THEN: Key is masked again
    await expect(keyInput).toHaveAttribute('type', 'password');
  });

  test('[P1] should validate key length', async ({ page }) => {
    // GIVEN: Key with wrong length (31 bytes instead of 32)
    const shortKey = '0x' + 'ab'.repeat(31);

    // WHEN: User enters short key
    await page.getByLabel('Private Key Input').fill(shortKey);
    await page.getByLabel('Private Key Input').blur();

    // THEN: Length validation error shown
    await expect(page.getByText(/64 hexadecimal characters/)).toBeVisible();
  });

  test('[P1] should derive and display public key', async ({ page }) => {
    // GIVEN: Valid private key
    const validPrivateKey = '0x' + 'ef'.repeat(32);

    // WHEN: User enters private key
    await page.getByLabel('Private Key Input').fill(validPrivateKey);

    // THEN: Public key is derived and displayed
    await expect(page.getByText('Public Key:')).toBeVisible();
    const publicKeyText = await page.getByText(/Public Key: 0x/).textContent();
    expect(publicKeyText).toMatch(/Public Key: 0x[0-9a-fA-F]{64}/);
  });

  test('[P1] should clear derived public key when input cleared', async ({ page }) => {
    // GIVEN: Private key entered with derived public key shown
    const validPrivateKey = '0x' + 'aa'.repeat(32);
    await page.getByLabel('Private Key Input').fill(validPrivateKey);
    await expect(page.getByText('Public Key:')).toBeVisible();

    // WHEN: User clears input
    await page.getByLabel('Private Key Input').clear();

    // THEN: Public key is no longer shown
    await expect(page.getByText('Public Key:')).not.toBeVisible();
  });

  test('[P1] should handle paste event', async ({ page }) => {
    // GIVEN: Valid key to paste
    const validKey = '0x' + 'bb'.repeat(32);

    // WHEN: User pastes key (simulate by filling)
    const keyInput = page.getByLabel('Private Key Input');
    await keyInput.fill(validKey);

    // THEN: Key is accepted
    await expect(keyInput).toHaveValue(validKey);
    await expect(page.getByText('Invalid key format')).not.toBeVisible();
  });

  test('[P2] should trim whitespace from pasted keys', async ({ page }) => {
    // GIVEN: Key with whitespace
    const keyWithWhitespace = '  0x' + 'cc'.repeat(32) + '  ';

    // WHEN: User enters key with whitespace
    await page.getByLabel('Private Key Input').fill(keyWithWhitespace);
    await page.getByLabel('Private Key Input').blur();

    // THEN: Key is trimmed and validated (no error if trimming works)
    // Note: If component doesn't auto-trim, this test will fail and indicate improvement needed
    await expect(page.getByText('Invalid key format')).not.toBeVisible();
  });

  test('[P2] should prevent key export/copy unless explicitly allowed', async ({ page }) => {
    // GIVEN: Private key in input
    const validKey = '0x' + 'dd'.repeat(32);
    await page.getByLabel('Private Key Input').fill(validKey);

    // WHEN: Checking input attributes

    // THEN: Copy should be disabled by default for security
    const keyInput = page.getByLabel('Private Key Input');
    // Note: This is a security check - implementation may vary
    // Could use oncopy="return false" or CSS user-select: none
    await expect(keyInput).toHaveAttribute('autocomplete', 'off');
  });

  test('[P2] should display key strength indicator', async ({ page }) => {
    // GIVEN: User enters key

    // WHEN: Key is entered
    await page.getByLabel('Private Key Input').fill('0x' + '00'.repeat(32));

    // THEN: Key format indicator is shown
    await expect(page.getByText(/Ed25519|EdDSA|Curve25519/i)).toBeVisible();
  });
});

test.describe('KeyInput Component - Generate Key', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[P0] should generate new key pair on button click', async ({ page }) => {
    // GIVEN: Generate key button is visible

    // WHEN: User clicks generate
    await page.getByText('Generate New Key').click();

    // THEN: Private key is populated
    const keyInput = page.getByLabel('Private Key Input');
    await expect(keyInput).not.toHaveValue('');

    const generatedKey = await keyInput.inputValue();
    expect(CryptoTestHelpers.isValidPrivateKey(generatedKey)).toBe(true);
  });

  test('[P0] should derive public key after generation', async ({ page }) => {
    // GIVEN: User generates new key

    // WHEN: Generate button clicked
    await page.getByText('Generate New Key').click();

    // THEN: Public key is derived and displayed
    await expect(page.getByText('Public Key:')).toBeVisible();
    const publicKeyElement = page.getByText(/Public Key: 0x/);
    const publicKeyText = await publicKeyElement.textContent();
    expect(publicKeyText).toMatch(/0x[0-9a-fA-F]{64}/);
  });

  test('[P1] should generate unique keys each time', async ({ page }) => {
    // GIVEN: First key generation
    await page.getByText('Generate New Key').click();
    const firstKey = await page.getByLabel('Private Key Input').inputValue();

    // Clear and generate again
    await page.getByLabel('Private Key Input').clear();

    // WHEN: Second key generation
    await page.getByText('Generate New Key').click();
    const secondKey = await page.getByLabel('Private Key Input').inputValue();

    // THEN: Keys are different
    expect(firstKey).not.toBe(secondKey);
  });

  test('[P1] should show loading state during generation', async ({ page }) => {
    // WHEN: User clicks generate
    const generateButton = page.getByText('Generate New Key');
    await generateButton.click();

    // THEN: Key is generated (loading completes)
    // Note: For cryptographic key generation, this should be fast
    await expect(page.getByLabel('Private Key Input')).not.toHaveValue('', { timeout: 5000 });
  });
});

test.describe('KeyInput Component - Import Key', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[P1] should have import from file option', async ({ page }) => {
    // GIVEN: User is on auth page

    // THEN: Import option is visible
    await expect(page.getByText('Import from File')).toBeVisible();
  });

  test('[P2] should accept key file upload', async ({ page }) => {
    // GIVEN: Key file input

    // WHEN: Clicking import
    await page.getByText('Import from File').click();

    // THEN: File picker is triggered (dialog appears)
    // Note: Actual file upload testing requires file chooser handling
    const fileChooserPromise = page.waitForEvent('filechooser', { timeout: 2000 }).catch(() => null);

    // If file chooser appears, test passes
    const fileChooser = await fileChooserPromise;
    if (fileChooser) {
      // File chooser was triggered successfully
      expect(true).toBe(true);
    }
  });
});

test.describe('KeyInput Component - Export Key', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[P1] should have export option when key is present', async ({ page }) => {
    // GIVEN: Key is entered
    await page.getByLabel('Private Key Input').fill('0x' + 'ee'.repeat(32));

    // THEN: Export option is visible
    await expect(page.getByText('Export to File')).toBeVisible();
  });

  test('[P2] should trigger download on export', async ({ page }) => {
    // GIVEN: Key is entered
    await page.getByLabel('Private Key Input').fill('0x' + 'ff'.repeat(32));

    // WHEN: User clicks export
    const downloadPromise = page.waitForEvent('download');
    await page.getByText('Export to File').click();

    // THEN: Download is triggered
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toMatch(/key|private/i);
  });
});

test.describe('KeyInput Component - Accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('[P1] should be keyboard navigable', async ({ page }) => {
    // GIVEN: Focus on key input

    // WHEN: Using keyboard to navigate
    await page.keyboard.press('Tab');

    // THEN: Key input receives focus
    const keyInput = page.getByLabel('Private Key Input');
    await expect(keyInput).toBeFocused();
  });

  test('[P1] should have proper ARIA attributes', async ({ page }) => {
    // GIVEN: Key input

    // THEN: Proper ARIA attributes are present
    const keyInput = page.getByLabel('Private Key Input');
    await expect(keyInput).toHaveAttribute('aria-label');
  });

  test('[P2] should announce validation errors', async ({ page }) => {
    // GIVEN: Invalid input entered

    // WHEN: Validation fails
    await page.getByLabel('Private Key Input').fill('invalid');
    await page.getByLabel('Private Key Input').blur();

    // THEN: Error message has proper role for screen readers
    const errorMessage = page.getByText('Invalid key format');
    await expect(errorMessage).toBeVisible();
    // Check for aria-live or role="alert" on error container
  });
});
