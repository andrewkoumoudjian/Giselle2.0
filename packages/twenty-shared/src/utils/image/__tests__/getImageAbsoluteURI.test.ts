import { getImageAbsoluteURI } from '../getImageAbsoluteURI';

describe('getImageAbsoluteURI', () => {
  it('should return absolute url if the imageUrl is an absolute url', () => {
    const imageUrl = 'https://example.com/image.jpg';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe(imageUrl);
  });

  it('should return fully formed url if imageUrl is a relative url starting with /', () => {
    const imageUrl = '/path/pic.png';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe('http://localhost:3000/files/path/pic.png');
  });

  it('should return fully formed url if imageUrl is a relative url not starting with slash', () => {
    const imageUrl = 'pic.png';
    const baseUrl = 'http://localhost:3000';
    const result = getImageAbsoluteURI({ imageUrl, baseUrl });
    expect(result).toBe('http://localhost:3000/files/pic.png');
  });
});
