import { sleep, timeout } from './async';

describe('Async', () => {
  describe('sleep', () => {
    it('should wait for specified time', async () => {
      const start = Date.now();
      await sleep(100);
      const elapsed = Date.now() - start;
      expect(elapsed).toBeGreaterThanOrEqual(90);
    });
  });

  describe('timeout', () => {
    it('should resolve if promise completes in time', async () => {
      const result = await timeout(Promise.resolve('done'), 1000);
      expect(result).toBe('done');
    });

    it('should reject if promise times out', async () => {
      await expect(
        timeout(new Promise(r => setTimeout(r, 1000)), 50)
      ).rejects.toThrow('Timeout');
    });
  });
});
