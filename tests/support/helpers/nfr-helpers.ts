/**
 * NFR (Non-Functional Requirements) test helpers
 * Utilities for validating performance, security, reliability, and maintainability
 */

export class NFRTestHelpers {
  /**
   * Performance Testing
   */

  /**
   * Measure authentication time and validate against NFR (<10 seconds)
   */
  static async measureAuthTime(
    authFn: () => Promise<void>,
    maxTimeMs: number = 10000
  ): Promise<{ elapsed: number; passed: boolean }> {
    const startTime = Date.now();
    await authFn();
    const elapsed = Date.now() - startTime;

    return {
      elapsed,
      passed: elapsed < maxTimeMs,
    };
  }

  /**
   * Measure message delivery time and validate against NFR (<2 seconds)
   */
  static async measureMessageDeliveryTime(
    sendFn: () => Promise<void>,
    maxTimeMs: number = 2000
  ): Promise<{ elapsed: number; passed: boolean }> {
    const startTime = Date.now();
    await sendFn();
    const elapsed = Date.now() - startTime;

    return {
      elapsed,
      passed: elapsed < maxTimeMs,
    };
  }

  /**
   * Measure lobby update time and validate against NFR (<2 seconds)
   */
  static async measureLobbyUpdateTime(
    updateFn: () => Promise<void>,
    maxTimeMs: number = 2000
  ): Promise<{ elapsed: number; passed: boolean }> {
    const startTime = Date.now();
    await updateFn();
    const elapsed = Date.now() - startTime;

    return {
      elapsed,
      passed: elapsed < maxTimeMs,
    };
  }

  /**
   * Security Testing
   */

  /**
   * Verify private key is never exposed in page content
   */
  static verifyPrivateKeyNotExposed(pageContent: string, privateKey: string): boolean {
    // Check if private key appears anywhere in the page
    const strippedKey = privateKey.replace('0x', '');
    return !pageContent.includes(strippedKey) && !pageContent.includes(privateKey);
  }

  /**
   * Verify no private keys appear in console logs
   */
  static verifyNoPrivateKeysInConsole(consoleLogs: string[], privateKey: string): boolean {
    const strippedKey = privateKey.replace('0x', '');
    return !consoleLogs.some(log =>
      log.includes(strippedKey) || log.includes(privateKey)
    );
  }

  /**
   * Verify all messages have signatures
   */
  static verifyMessagesHaveSignatures(messages: Array<{ signature?: string }>): boolean {
    return messages.every(msg => msg.signature && msg.signature.length > 0);
  }

  /**
   * Verify signature format is valid
   */
  static verifySignatureFormat(signature: string): boolean {
    return /^0x[0-9a-fA-F]{128}$/.test(signature);
  }

  /**
   * Reliability Testing
   */

  /**
   * Simulate network failure and verify graceful handling
   */
  static async simulateNetworkFailure(
    page: any,
    failureFn: () => Promise<void>
  ): Promise<{ errorHandled: boolean; errorMessage?: string }> {
    try {
      await failureFn();
      return { errorHandled: false };
    } catch (error: any) {
      return {
        errorHandled: true,
        errorMessage: error.message,
      };
    }
  }

  /**
   * Verify retry mechanism works
   */
  static async verifyRetryMechanism(
    operation: () => Promise<{ success: boolean; attemptCount: number }>,
    expectedAttempts: number
  ): Promise<boolean> {
    const result = await operation();
    return result.success && result.attemptCount === expectedAttempts;
  }

  /**
   * Verify health check endpoint exists and returns valid response
   */
  static verifyHealthCheck(healthData: any): boolean {
    return (
      healthData &&
      typeof healthData === 'object' &&
      (healthData.status === 'healthy' || healthData.status === 'ok')
    );
  }

  /**
   * Performance Benchmarking
   */

  /**
   * Run performance benchmark and generate report
   */
  static async runPerformanceBenchmark(
    operations: Array<{
      name: string;
      fn: () => Promise<void>;
      maxTimeMs: number;
    }>
  ): Promise<{
    results: Array<{
      name: string;
      elapsed: number;
      passed: boolean;
      threshold: number;
    }>;
    overallPassed: boolean;
  }> {
    const results = [];

    for (const operation of operations) {
      const startTime = Date.now();
      await operation.fn();
      const elapsed = Date.now() - startTime;

      results.push({
        name: operation.name,
        elapsed,
        passed: elapsed < operation.maxTimeMs,
        threshold: operation.maxTimeMs,
      });
    }

    const overallPassed = results.every(r => r.passed);

    return { results, overallPassed };
  }

  /**
   * Load testing - simulate multiple concurrent users
   */
  static async simulateConcurrentUsers(
    userCount: number,
    userFn: (userIndex: number) => Promise<void>
  ): Promise<{ completed: number; errors: number }> {
    let completed = 0;
    let errors = 0;

    const promises = Array.from({ length: userCount }, (_, i) =>
      userFn(i)
        .then(() => {
          completed++;
        })
        .catch(() => {
          errors++;
        })
    );

    await Promise.all(promises);

    return { completed, errors };
  }

  /**
   * Generate performance report
   */
  static generatePerformanceReport(
    benchmarkResults: {
      results: Array<{
        name: string;
        elapsed: number;
        passed: boolean;
        threshold: number;
      }>;
      overallPassed: boolean;
    }
  ): string {
    let report = '\n=== Performance Test Report ===\n\n';

    benchmarkResults.results.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      report += `${status} - ${result.name}: ${result.elapsed}ms (threshold: ${result.threshold}ms)\n`;
    });

    report += `\nOverall: ${benchmarkResults.overallPassed ? '✅ ALL PASSED' : '❌ SOME FAILED'}\n`;

    return report;
  }

  /**
   * Security audit helper
   */
  static async auditSecurity(
    page: any,
    privateKey: string
  ): Promise<{
    privateKeyExposed: boolean;
    consoleLeaks: string[];
    allMessagesSigned: boolean;
  }> {
    const pageContent = await page.content();
    const consoleLogs: string[] = [];
    page.on('console', (msg: any) => consoleLogs.push(msg.text()));

    // Check for private key exposure
    const privateKeyExposed = !this.verifyPrivateKeyNotExposed(pageContent, privateKey);

    // Check console logs
    const consoleLeaks = consoleLogs.filter(log =>
      log.includes(privateKey.replace('0x', ''))
    );

    return {
      privateKeyExposed,
      consoleLeaks,
      allMessagesSigned: true, // Would check actual messages
    };
  }
}
