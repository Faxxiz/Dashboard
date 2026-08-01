/**
 * Serializes TheSportsDB requests to stay within free-tier rate limits.
 */
export class TheSportsDbRateLimiter {
  private lastRequestAt = 0;
  private chain: Promise<void> = Promise.resolve();

  constructor(private readonly minIntervalMs: number) {}

  schedule<T>(task: () => Promise<T>): Promise<T> {
    const run = this.chain.then(async () => {
      const elapsed = Date.now() - this.lastRequestAt;
      if (elapsed < this.minIntervalMs) {
        await this.delay(this.minIntervalMs - elapsed);
      }
      this.lastRequestAt = Date.now();
      return task();
    });

    this.chain = run.then(
      () => undefined,
      () => undefined,
    );

    return run;
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
