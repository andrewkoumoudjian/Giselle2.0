import { isValidUuid } from '../isValidUuid';

describe('isValidUuid', () => {
  it('returns true for valid UUIDs', () => {
    expect(isValidUuid('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
  });

  it('returns false for invalid UUIDs', () => {
    expect(isValidUuid('invalid-uuid')).toBe(false);
    expect(isValidUuid('')).toBe(false);
    // isValidUuid doesn't accept null, so we're not testing that case
  });
});
