import { isValidHostname } from '../isValidHostname';

describe('isValidHostname', () => {
  it('returns true for valid hostnames', () => {
    expect(isValidHostname('www.example.com')).toBe(true);
    expect(isValidHostname('example.com')).toBe(true);
    expect(isValidHostname('sub.domain.example.com')).toBe(true);
    expect(isValidHostname('example.co.uk')).toBe(true);
  });

  it('returns false for invalid hostnames', () => {
    expect(isValidHostname('invalid..com')).toBe(false);
    expect(isValidHostname('invalid@domain.com')).toBe(false);
    expect(isValidHostname('')).toBe(false);
    expect(isValidHostname('invalid domain.com')).toBe(false);
  });
});
