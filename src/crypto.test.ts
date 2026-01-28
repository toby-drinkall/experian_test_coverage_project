import { generateId, generateUUID, hashCode } from './crypto';

describe('Crypto', () => {
  describe('generateId', () => {
    it('should generate id of specified length', () => {
      expect(generateId(8).length).toBe(8);
      expect(generateId(16).length).toBe(16);
    });
  });

  describe('generateUUID', () => {
    it('should generate valid UUID format', () => {
      const uuid = generateUUID();
      expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });
  });

  describe('hashCode', () => {
    it('should generate consistent hash', () => {
      expect(hashCode('test')).toBe(hashCode('test'));
    });
  });
});
