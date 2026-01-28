import { clamp, round, percentage } from './numberUtils';

describe('NumberUtils', () => {
  describe('clamp', () => {
    it('should clamp value within range', () => {
      expect(clamp(5, 0, 10)).toBe(5);
      expect(clamp(-5, 0, 10)).toBe(0);
      expect(clamp(15, 0, 10)).toBe(10);
    });
  });

  describe('round', () => {
    it('should round to specified decimals', () => {
      expect(round(3.14159, 2)).toBe(3.14);
    });
  });

  describe('percentage', () => {
    it('should calculate percentage', () => {
      expect(percentage(25, 100)).toBe(25);
      expect(percentage(0, 0)).toBe(0);
    });
  });
});
