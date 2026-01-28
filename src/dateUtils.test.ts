import { formatDate, addDays } from './dateUtils';

describe('DateUtils', () => {
  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      expect(formatDate(date)).toBe('2024-01-15');
    });
  });

  describe('addDays', () => {
    it('should add days to date', () => {
      const date = new Date(2024, 0, 15); // Jan 15, 2024
      const result = addDays(date, 5);
      expect(result.getDate()).toBe(20);
    });
  });
});
