import { formatCurrency, formatNumber } from './formatters';

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format as USD', () => {
      expect(formatCurrency(1234.56)).toBe('$1,234.56');
    });
  });

  describe('formatNumber', () => {
    it('should format with commas', () => {
      expect(formatNumber(1234567)).toBe('1,234,567');
    });
  });
});
