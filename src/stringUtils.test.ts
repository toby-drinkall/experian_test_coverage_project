import { capitalize } from './stringUtils';

describe('StringUtils', () => {
  // TODO: Add comprehensive tests for all string utility functions

  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello');
    });
  });
});
