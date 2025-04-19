import { absoluteUrlSchema } from '../absoluteUrlSchema';

describe('absoluteUrlSchema', () => {
  it('should transform a relative URL to an absolute URL', () => {
    expect(absoluteUrlSchema.parse('example.com')).toBe('https://example.com');
  });

  it('should keep an absolute URL as is', () => {
    expect(absoluteUrlSchema.parse('https://example.com')).toBe('https://example.com');
    expect(absoluteUrlSchema.parse('http://example.com')).toBe('http://example.com');
  });

  it('should reject invalid URLs', () => {
    expect(() => absoluteUrlSchema.parse('')).toThrow();
    expect(() => absoluteUrlSchema.parse('invalid url')).toThrow();
    expect(() => absoluteUrlSchema.parse('123')).toThrow();
  });
});
