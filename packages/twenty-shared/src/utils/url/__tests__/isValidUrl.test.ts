import { isValidUrl } from '../isValidUrl';

describe('isValidUrl', () => {
  it('returns true for valid urls', () => {
    expect(isValidUrl('http://www.example.com')).toBe(true);
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('https://sub.domain.example.com/path?query=1')).toBe(true);
  });

  it('returns false for invalid urls', () => {
    expect(isValidUrl('invalid..com')).toBe(false);
    expect(isValidUrl('example.com')).toBe(false); // Missing protocol
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('invalid domain.com')).toBe(false);
  });
});
