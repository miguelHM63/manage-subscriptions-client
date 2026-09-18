import { describe, expect, it, vi } from 'vitest';

vi.mock('@/config', () => ({ BRANDFETCH_CLIENT_ID: 'client-123' }));

import { resolveLogoUrl } from './logo-url';

describe('resolveLogoUrl', () => {
  it('replaces the temporary Brandfetch token with the client id', () => {
    expect(
      resolveLogoUrl(
        'https://cdn.brandfetch.io/ideQwN5lBE/w/128/h/128/fallback/lettermark/icon.webp?c=1ax1788760490595bfumLaCV7me',
      ),
    ).toBe(
      'https://cdn.brandfetch.io/ideQwN5lBE/w/128/h/128/fallback/lettermark/icon.webp?c=client-123',
    );
  });

  it('adds the client id when the Brandfetch URL has none', () => {
    expect(resolveLogoUrl('https://cdn.brandfetch.io/netflix.com/w/128/h/128')).toBe(
      'https://cdn.brandfetch.io/netflix.com/w/128/h/128?c=client-123',
    );
  });

  it('leaves other hosts, invalid URLs and empty values untouched', () => {
    expect(resolveLogoUrl('https://example.com/logo.png?c=x')).toBe(
      'https://example.com/logo.png?c=x',
    );
    expect(resolveLogoUrl('not a url')).toBe('not a url');
    expect(resolveLogoUrl(undefined)).toBeUndefined();
  });
});
