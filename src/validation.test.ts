import { isEmail, isURL } from './validation';

describe('Validation', () => {
  describe('isEmail', () => {
    it('should validate correct emails', () => {
      expect(isEmail('test@example.com')).toBe(true);
      expect(isEmail('user.name@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(isEmail('invalid')).toBe(false);
      expect(isEmail('@domain.com')).toBe(false);
    });
  });

  describe('isURL', () => {
    it('should validate correct URLs', () => {
      expect(isURL('https://example.com')).toBe(true);
    });

    it('should reject invalid URLs', () => {
      expect(isURL('not a url')).toBe(false);
    });
  });

  // TODO: Add tests for isPhoneNumber, isPostalCode, isStrongPassword, isCreditCard
});
