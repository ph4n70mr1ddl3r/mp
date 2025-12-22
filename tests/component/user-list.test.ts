import { test, expect } from '@playwright/test';

test.describe('UserList Component', () => {
  test('[P0] Displays all online users', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: Two users in lobby
    const user1 = multipleProfiles[0];
    const user2 = multipleProfiles[1];

    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    await page1.getByLabel('Private Key Input').fill(user1.publicKey.replace('0x', '00'.repeat(32)));
    await page1.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page1).toHaveURL('/lobby', { timeout: 10000 });

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    await page2.getByLabel('Private Key Input').fill(user2.publicKey.replace('0x', '00'.repeat(32)));
    await page2.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page2).toHaveURL('/lobby', { timeout: 10000 });

    // THEN: User 1 sees both users in lobby
    await expect(page1.getByTestId('user-list')).toBeVisible();
    await expect(page1.getByText(user1.profileName)).toBeVisible();
    await expect(page1.getByText(user2.profileName)).toBeVisible();

    await context1.close();
    await context2.close();
  });

  test('[P0] Shows user count', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: Three users in lobby
    const users = multipleProfiles.slice(0, 3);

    const contexts = await Promise.all(
      users.map(async (user, index) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('/');
        await page.getByLabel('Private Key Input').fill(user.publicKey.replace('0x', '00'.repeat(32)));
        await page.getByRole('button', { name: 'Authenticate' }).click();
        await expect(page).toHaveURL('/lobby', { timeout: 10000 });
        return { context, page };
      })
    );

    // THEN: Each user sees "3 users online"
    for (const { page } of contexts) {
      await expect(page.getByText('3 users online')).toBeVisible();
    }

    await Promise.all(contexts.map(c => c.context.close()));
  });

  test('[P0] Updates when users join', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: User 1 is in lobby
    const user1 = multipleProfiles[0];
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    await page1.getByLabel('Private Key Input').fill(user1.publicKey.replace('0x', '00'.repeat(32)));
    await page1.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page1).toHaveURL('/lobby', { timeout: 10000 });

    await expect(page1.getByText('1 user online')).toBeVisible();

    // WHEN: User 2 joins
    const user2 = multipleProfiles[1];
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    await page2.getByLabel('Private Key Input').fill(user2.publicKey.replace('0x', '00'.repeat(32)));
    await page2.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page2).toHaveURL('/lobby', { timeout: 10000 });

    // THEN: User 1 sees updated count
    await expect(page1.getByText('2 users online')).toBeVisible();
    await expect(page1.getByText(user2.profileName)).toBeVisible();

    await context1.close();
    await context2.close();
  });

  test('[P0] Updates when users leave', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: Two users in lobby
    const user1 = multipleProfiles[0];
    const user2 = multipleProfiles[1];

    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    await page1.getByLabel('Private Key Input').fill(user1.publicKey.replace('0x', '00'.repeat(32)));
    await page1.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page1).toHaveURL('/lobby', { timeout: 10000 });

    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    await page2.getByLabel('Private Key Input').fill(user2.publicKey.replace('0x', '00'.repeat(32)));
    await page2.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page2).toHaveURL('/lobby', { timeout: 10000 });

    await expect(page1.getByText('2 users online')).toBeVisible();

    // WHEN: User 2 leaves
    await context2.close();

    // THEN: User 1 sees updated count
    await expect(page1.getByText('1 user online')).toBeVisible();

    await context1.close();
  });

  test('[P1] Shows user presence indicators', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: User is online
    const user1 = multipleProfiles[0];
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    await page1.getByLabel('Private Key Input').fill(user1.publicKey.replace('0x', '00'.repeat(32)));
    await page1.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page1).toHaveURL('/lobby', { timeout: 10000 });

    // THEN: User shows online status
    const userElement = page1.getByText(user1.profileName).locator('..');
    await expect(userElement.getByText('● Online')).toBeVisible();

    await context1.close();
  });

  test('[P1] Users are sorted consistently', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: Multiple users in lobby
    const users = multipleProfiles.slice(0, 3);

    const contexts = await Promise.all(
      users.map(async (user, index) => {
        const context = await browser.newContext();
        const page = await context.newPage();
        await page.goto('/');
        await page.getByLabel('Private Key Input').fill(user.publicKey.replace('0x', '00'.repeat(32)));
        await page.getByRole('button', { name: 'Authenticate' }).click();
        await expect(page).toHaveURL('/lobby', { timeout: 10000 });
        return { context, page };
      })
    );

    // THEN: User order is consistent across all clients
    const page1UserOrder = await contexts[0].page.locator('[data-testid="user-list"]').textContent();
    const page2UserOrder = await contexts[1].page.locator('[data-testid="user-list"]').textContent();

    expect(page1UserOrder).toBe(page2UserOrder);

    await Promise.all(contexts.map(c => c.context.close()));
  });

  test('[P2] Empty state when no users', async ({ page }) => {
    // GIVEN: User navigates to lobby
    await page.goto('/lobby');

    // THEN: Shows empty state
    await expect(page.getByText('No users online')).toBeVisible();
    await expect(page.getByText('Be the first to join!')).toBeVisible();
  });

  test('[P2] User list scrolls when many users', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: 20 users in lobby (simulated)
    const contexts = await Promise.all(
      Array.from({ length: 20 }, (_, i) => {
        const context = browser.newContext();
        return context.then(async ctx => {
          const page = await ctx.newPage();
          await page.goto('/');
          await page.getByLabel('Private Key Input').fill(`0x${i.toString(16).repeat(32)}`);
          await page.getByRole('button', { name: 'Authenticate' }).click();
          await expect(page).toHaveURL('/lobby', { timeout: 10000 });
          return { context: ctx, page };
        });
      })
    );

    // THEN: User list is scrollable
    for (const { page } of contexts) {
      const userList = page.getByTestId('user-list');
      await expect(userList).toHaveClass(/scrollable/);
    }

    await Promise.all(contexts.map(c => c.context.close()));
  });

  test('[P2] User profile names are clickable', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/lobby');

    // WHEN: User clicks on their own profile name
    await page.getByText(authenticatedProfile.profileName).click();

    // THEN: Profile details or edit modal opens
    await expect(page.getByText('Profile Details')).toBeVisible();
  });
});

test.describe('UserList Component - Presence Tracking', () => {
  test('[P0] Presence updates within 2 seconds', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: Two users in lobby
    const user1 = multipleProfiles[0];
    const user2 = multipleProfiles[1];

    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    await page1.getByLabel('Private Key Input').fill(user1.publicKey.replace('0x', '00'.repeat(32)));
    await page1.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page1).toHaveURL('/lobby', { timeout: 10000 });

    const startTime = Date.now();

    // WHEN: User 2 joins
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    await page2.getByLabel('Private Key Input').fill(user2.publicKey.replace('0x', '00'.repeat(32)));
    await page2.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page2).toHaveURL('/lobby', { timeout: 10000 });

    // THEN: Presence update is reflected within 2 seconds
    await expect(page1.getByText('2 users online')).toBeVisible({ timeout: 5000 });
    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(2000);

    await context1.close();
    await context2.close();
  });

  test('[P1] Online status persists during session', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/lobby');

    // WHEN: User performs actions (send message, navigate to profile, back)
    await page.getByPlaceholder('Type your message').fill('Test message');
    await page.getByRole('button', { name: 'Send' }).click();
    await page.getByText('Profile').click();
    await page.getByText('Back to Lobby').click();

    // THEN: User remains marked as online
    const userElement = page.getByText(authenticatedProfile.profileName).locator('..');
    await expect(userElement.getByText('● Online')).toBeVisible();

    await expect(page.getByText('1 user online')).toBeVisible();
  });

  test('[P2] User list is responsive', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: Multiple users
    const user1 = multipleProfiles[0];

    const context1 = await browser.newContext();
    const page1 = await context1.newPage();

    // WHEN: Viewport is resized
    await page1.setViewportSize({ width: 375, height: 667 }); // Mobile size

    await page1.goto('/');
    await page1.getByLabel('Private Key Input').fill(user1.publicKey.replace('0x', '00'.repeat(32)));
    await page1.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page1).toHaveURL('/lobby', { timeout: 10000 });

    // THEN: User list adapts to mobile view
    const userList = page1.getByTestId('user-list');
    await expect(userList).toHaveClass(/mobile/);

    await context1.close();
  });
});
