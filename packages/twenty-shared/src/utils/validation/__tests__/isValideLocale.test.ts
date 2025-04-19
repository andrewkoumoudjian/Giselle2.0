import { isValidLocale } from '../isValidLocale';

describe('isValidLocale', () => {
  it('returns true for valid locales', () => {
    expect(isValidLocale('en')).toBe(true);
    expect(isValidLocale('fr-FR')).toBe(true);
  });

  it('returns false for invalid locales', () => {
    expect(isValidLocale('invalid-locale')).toBe(false);
    expect(isValidLocale(null)).toBe(false);
  });
});
