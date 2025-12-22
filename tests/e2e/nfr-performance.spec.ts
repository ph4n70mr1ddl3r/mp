import { test, expect } from '../support/fixtures';
import { NFRTestHelpers } from '../support/helpers/nfr-helpers';

test.describe('NFR - Performance', () => {
  test('[P0] Authentication completes in less than 10 seconds', async ({ page, cryptoKeys }) => {
    const keyPair = await cryptoKeys.getKeyPair();

    // Measure authentication time
    const result = await NFRTestHelpers.measureAuthTime(async () => {
      await page.goto('/');
      await page.getByLabel('Private Key Input').fill(keyPair.privateKey);
      await page.getByRole('button', { name: 'Authenticate' }).click();
      await expect(page).toHaveURL('/lobby', { timeout: 10000 });
    }, 10000);

    // THEN: Performance requirement is met
    expect(result.passed).toBe(true, `Authentication took ${result.elapsed}ms, should be < 10000ms`);
    console.log(`✅ Authentication time: ${result.elapsed}ms (requirement: <10000ms)`);
  });

  test('[P0] Messages appear in lobby within 2 seconds', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is authenticated and in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: User sends a message
    const messageText = 'Performance test message';
    const result = await NFRTestHelpers.measureMessageDeliveryTime(async () => {
      await page.getByPlaceholder('Type your message').fill(messageText);
      await page.getByRole('button', { name: 'Send' }).click();
      await expect(page.getByText(messageText)).toBeVisible();
    }, 2000);

    // THEN: Message delivery meets NFR
    expect(result.passed).toBe(true, `Message delivery took ${result.elapsed}ms, should be < 2000ms`);
    console.log(`✅ Message delivery time: ${result.elapsed}ms (requirement: <2000ms)`);
  });

  test('[P0] Lobby updates occur within 2 seconds', async ({ page, browser, multipleProfiles }) => {
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

    // WHEN: User 2 leaves
    const result = await NFRTestHelpers.measureLobbyUpdateTime(async () => {
      await context2.close();
      await expect(page1.getByText(`${user2.profileName} left`)).toBeVisible();
    }, 2000);

    // THEN: Lobby update meets NFR
    expect(result.passed).toBe(true, `Lobby update took ${result.elapsed}ms, should be < 2000ms`);
    console.log(`✅ Lobby update time: ${result.elapsed}ms (requirement: <2000ms)`);

    await context1.close();
  });

  test('[P1] Multiple concurrent users perform well', async ({ browser, multipleProfiles }) => {
    const userCount = 5;
    const users = multipleProfiles.slice(0, userCount);

    // WHEN: 5 users connect simultaneously
    const result = await NFRTestHelpers.runPerformanceBenchmark([
      {
        name: 'Connect 5 concurrent users',
        fn: async () => {
          await Promise.all(
            users.map(async (user, index) => {
              const context = await browser.newContext();
              const page = await context.newPage();
              await page.goto('/');
              await page.getByLabel('Private Key Input').fill(user.publicKey.replace('0x', '00'.repeat(32)));
              await page.getByRole('button', { name: 'Authenticate' }).click();
              await expect(page).toHaveURL('/lobby', { timeout: 10000 });
              await context.close();
            })
          );
        },
        maxTimeMs: 15000, // 15 seconds for 5 users
      },
    ]);

    // THEN: Performance benchmark passes
    expect(result.overallPassed).toBe(true);
    console.log(NFRTestHelpers.generatePerformanceReport(result));

    // Individual results
    result.results.forEach(r => {
      expect(r.passed).toBe(true, `${r.name} took ${r.elapsed}ms, threshold: ${r.threshold}ms`);
    });
  });

  test('[P1] Performance under load - 10 messages', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is in lobby
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: User sends 10 messages rapidly
    const startTime = Date.now();
    for (let i = 0; i < 10; i++) {
      await page.getByPlaceholder('Type your message').fill(`Message ${i}`);
      await page.getByRole('button', { name: 'Send' }).click();
      await page.waitForTimeout(100);
    }
    const elapsed = Date.now() - startTime;

    // THEN: All messages are delivered
    for (let i = 0; i < 10; i++) {
      await expect(page.getByText(`Message ${i}`)).toBeVisible();
    }

    // Average message time should be reasonable
    const avgMessageTime = elapsed / 10;
    expect(avgMessageTime).toBeLessThan(500); // Average < 500ms per message
    console.log(`✅ 10 messages sent in ${elapsed}ms (avg: ${avgMessageTime}ms per message)`);
  });

  test('[P2] Profile update performance', async ({ page, authenticatedProfile }) => {
    // GIVEN: User is authenticated
    await page.goto('/');

    await page.getByLabel('Private Key Input').fill(authenticatedProfile.publicKey.replace('0x', '00'.repeat(32)));
    await page.getByRole('button', { name: 'Authenticate' }).click();
    await expect(page).toHaveURL('/lobby', { timeout: 10000 });

    // WHEN: User updates profile
    const startTime = Date.now();
    await page.getByText('Edit Profile').click();
    await page.getByLabel('Profile Name').clear();
    await page.getByLabel('Profile Name').fill('PerformanceTest');
    await page.getByRole('button', { name: 'Save Profile' }).click();
    await expect(page.getByText('Profile updated successfully')).toBeVisible();
    const elapsed = Date.now() - startTime;

    // THEN: Profile update is fast (<1 second)
    expect(elapsed).toBeLessThan(1000);
    console.log(`✅ Profile update: ${elapsed}ms (requirement: <1000ms)`);
  });
});

test.describe('NFR - Performance Benchmarking', () => {
  test('[P0] Complete user journey performance', async ({ page, browser, multipleProfiles }) => {
    const user1 = multipleProfiles[0];
    const user2 = multipleProfiles[1];

    const result = await NFRTestHelpers.runPerformanceBenchmark([
      {
        name: 'Complete user journey - Auth + Profile + Message',
        fn: async () => {
          const context = await browser.newContext();
          const page = await context.newPage();

          // Auth
          await page.goto('/');
          await page.getByLabel('Private Key Input').fill(user1.publicKey.replace('0x', '00'.repeat(32)));
          await page.getByRole('button', { name: 'Authenticate' }).click();
          await expect(page).toHaveURL('/lobby', { timeout: 10000 });

          // Profile update
          await page.getByText('Edit Profile').click();
          await page.getByLabel('Profile Name').fill('BenchmarkUser');
          await page.getByRole('button', { name: 'Save Profile' }).click();
          await expect(page.getByText('Profile updated successfully')).toBeVisible();

          // Send message
          await page.getByPlaceholder('Type your message').fill('Benchmark message');
          await page.getByRole('button', { name: 'Send' }).click();
          await expect(page.getByText('Benchmark message')).toBeVisible();

          await context.close();
        },
        maxTimeMs: 15000, // 15 seconds total
      },
    ]);

    expect(result.overallPassed).toBe(true);
    console.log(NFRTestHelpers.generatePerformanceReport(result));

    const benchmarkResult = result.results[0];
    expect(benchmarkResult.passed).toBe(true);
    console.log(`✅ Complete journey: ${benchmarkResult.elapsed}ms (requirement: <${benchmarkResult.threshold}ms)`);
  });

  test('[P1] Concurrent operations performance', async ({ browser, multipleProfiles }) => {
    const users = multipleProfiles.slice(0, 3);

    // WHEN: 3 users perform operations concurrently
    const result = await NFRTestHelpers.runPerformanceBenchmark([
      {
        name: 'Concurrent authentication (3 users)',
        fn: async () => {
          await Promise.all(
            users.map(async (user) => {
              const context = await browser.newContext();
              const page = await context.newPage();
              await page.goto('/');
              await page.getByLabel('Private Key Input').fill(user.publicKey.replace('0x', '00'.repeat(32)));
              await page.getByRole('button', { name: 'Authenticate' }).click();
              await expect(page).toHaveURL('/lobby', { timeout: 10000 });
              await context.close();
            })
          );
        },
        maxTimeMs: 12000, // 12 seconds for 3 users
      },
    ]);

    expect(result.overallPassed).toBe(true);
    console.log(NFRTestHelpers.generatePerformanceReport(result));
  });
});
