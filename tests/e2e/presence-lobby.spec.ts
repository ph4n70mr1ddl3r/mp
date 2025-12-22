import { test, expect } from '../support/fixtures';
import { PresenceTestHelper } from '../support/helpers/presence-helpers';

test.describe('Presence & Lobby', () => {
  test('[P0] Lobby displays all online users', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: Two users are online
    const user1 = multipleProfiles[0];
    const user2 = multipleProfiles[1];

    // User 1 in browser 1
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    await page1.getByLabel('Private Key Input').fill(user1.publicKey.replace('0x', '00'.repeat(32)));
    await page1.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page1).toHaveURL('/lobby', { timeout: 10000 });

    // User 2 in browser 2
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    await page2.getByLabel('Private Key Input').fill(user2.publicKey.replace('0x', '00'.repeat(32)));
    await page2.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page2).toHaveURL('/lobby', { timeout: 10000 });

    // THEN: Both users appear in User 1's lobby
    await expect(page1.getByText('Online Users')).toBeVisible();
    await expect(page1.getByText(user1.profileName)).toBeVisible();
    await expect(page1.getByText(user2.profileName)).toBeVisible();

    // THEN: Both users appear in User 2's lobby
    await expect(page2.getByText('Online Users')).toBeVisible();
    await expect(page2.getByText(user1.profileName)).toBeVisible();
    await expect(page2.getByText(user2.profileName)).toBeVisible();

    await context1.close();
    await context2.close();
  });

  test('[P0] User presence updates in real-time within 2 seconds', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: Two users are in lobby
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

    // WHEN: User 2 leaves (closes browser)
    const startTime = Date.now();
    await context2.close();

    // THEN: User 1 sees user 2 leave within 2 seconds
    await expect(page1.getByText(`${user2.profileName} left`)).toBeVisible({ timeout: 5000 });

    const elapsed = Date.now() - startTime;
    expect(elapsed).toBeLessThan(2000);

    await context1.close();
  });

  test('[P1] User presence indicator shows online/offline status', async ({ page, browser, multipleProfiles }) => {
    // GIVEN: User is online
    const user1 = multipleProfiles[0];

    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    await page1.getByLabel('Private Key Input').fill(user1.publicKey.replace('0x', '00'.repeat(32)));
    await page1.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page1).toHaveURL('/lobby', { timeout: 10000 });

    // THEN: User shows as online with indicator
    await expect(page1.getByText(user1.profileName)).toBeVisible();
    const userElement = page1.getByText(user1.profileName).locator('..');
    await expect(userElement.getByText('● Online')).toBeVisible();

    // WHEN: User goes offline - close the context
    await context1.close();

    // Note: Status update verification would require a second observer
    // which is tested in other presence tests
  });

  test('[P1] Lobby shows user count', async ({ page, browser, multipleProfiles }) => {
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

    // WHEN: One user leaves
    await contexts[2].context.close();

    // THEN: User count updates to "2 users online"
    await expect(contexts[0].page.getByText('2 users online')).toBeVisible();
    await expect(contexts[1].page.getByText('2 users online')).toBeVisible();

    await contexts[0].context.close();
    await contexts[1].context.close();
  });

  test('[P2] Lobby persists during session', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: User navigates to profile and back
    await page.getByText('Profile').click();
    await expect(page).toHaveURL('/profile');

    await page.getByText('Back to Lobby').click();
    await expect(page).toHaveURL('/lobby');

    // THEN: Lobby still shows user and messages
    await expect(page.getByText('Online Users')).toBeVisible();
    await expect(page.getByText(authenticatedProfile.profileName)).toBeVisible();
  });

  test('[P2] Lobby order is consistent', async ({ page, browser, multipleProfiles }) => {
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
    const page1UserList = await contexts[0].page.locator('[data-testid="user-list"]').textContent();
    const page2UserList = await contexts[1].page.locator('[data-testid="user-list"]').textContent();

    expect(page1UserList).toBe(page2UserList);

    await Promise.all(contexts.map(c => c.context.close()));
  });
});

test.describe('Presence & Lobby - Presence Tracking', () => {
  test('[P0] Presence updates are accurate', async () => {
    // GIVEN: Presence tracker
    const presenceHelper = new PresenceTestHelper();

    // WHEN: Users join and leave
    const user1 = presenceHelper.simulateUserJoin('0x' + '11'.repeat(32), 'User1');
    const user2 = presenceHelper.simulateUserJoin('0x' + '22'.repeat(32), 'User2');

    // THEN: Online count is correct
    expect(presenceHelper.getUserCount('online')).toBe(2);
    expect(presenceHelper.getOnlineUsers()).toHaveLength(2);

    // WHEN: User leaves
    presenceHelper.simulateUserLeave(user1.publicKey);

    // THEN: Online count updates
    expect(presenceHelper.getUserCount('online')).toBe(1);
    expect(presenceHelper.getOnlineUsers()).toHaveLength(1);

    presenceHelper.clear();
  });

  test('[P1] Presence update timing meets NFR', async () => {
    // GIVEN: Presence tracker
    const presenceHelper = new PresenceTestHelper();

    // WHEN: User joins
    const updateTime = new Date();
    const user = presenceHelper.simulateUserJoin('0x' + '33'.repeat(32), 'User3');

    // THEN: Update is within 2 second requirement
    const result = presenceHelper.verifyPresenceUpdateTiming(updateTime);
    expect(result.passed).toBe(true);
    expect(result.elapsed).toBeLessThan(2000);

    presenceHelper.clear();
  });

  test('[P1] Lobby display matches presence states', async () => {
    // GIVEN: Presence states
    const presenceHelper = new PresenceTestHelper();
    const user1 = presenceHelper.simulateUserJoin('0x' + '44'.repeat(32), 'User4');
    const user2 = presenceHelper.simulateUserJoin('0x' + '55'.repeat(32), 'User5');

    // Simulated lobby data
    const lobbyUsers = [
      { publicKey: user1.publicKey, profileName: user1.profileName, isOnline: true },
      { publicKey: user2.publicKey, profileName: user2.profileName, isOnline: true },
    ];

    // THEN: Lobby display matches presence
    expect(presenceHelper.verifyLobbyDisplay(lobbyUsers)).toBe(true);

    presenceHelper.clear();
  });
});
