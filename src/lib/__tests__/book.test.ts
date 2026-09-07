import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MAPPING, TRACKS } from '@/lib/book';

async function book() {
  return import('@/lib/book');
}

beforeEach(() => {
  vi.resetModules();
  delete process.env.NEXT_PUBLIC_BOOK_URL;
  delete process.env.CQ_BOOK_COMMERCE;
});

afterEach(() => {
  delete process.env.NEXT_PUBLIC_BOOK_URL;
  delete process.env.CQ_BOOK_COMMERCE;
});

describe('the commerce switch', () => {
  it('sells nothing until a URL is configured', async () => {
    const { commerceEnabled, bookUrl } = await book();
    expect(bookUrl()).toBeUndefined();
    expect(commerceEnabled()).toBe(false);
  });

  it('sells once a URL is set', async () => {
    process.env.NEXT_PUBLIC_BOOK_URL = 'https://example.com/book';
    const { commerceEnabled } = await book();
    expect(commerceEnabled()).toBe(true);
  });

  it('can be switched off for an institution even with a URL set', async () => {
    // This is the promise made in an institutional pitch: one setting removes
    // every buy button. If it ever stops holding, the pitch becomes a lie.
    process.env.NEXT_PUBLIC_BOOK_URL = 'https://example.com/book';
    process.env.CQ_BOOK_COMMERCE = 'false';
    const { commerceEnabled } = await book();
    expect(commerceEnabled()).toBe(false);
  });

  it('treats anything other than the literal "false" as on', async () => {
    process.env.NEXT_PUBLIC_BOOK_URL = 'https://example.com/book';
    for (const value of ['true', 'TRUE', '1', 'yes', '']) {
      vi.resetModules();
      process.env.CQ_BOOK_COMMERCE = value;
      const { commerceEnabled } = await book();
      expect(commerceEnabled()).toBe(true);
    }
  });
});

describe('what the page claims about the instrument', () => {
  it('admits the step the instrument does not implement', async () => {
    // The mapping is the honest part of the provenance page. If every row were
    // marked covered, the page would be a plug rather than an account.
    const uncovered = MAPPING.filter((row) => !row.covered);
    expect(uncovered).toHaveLength(1);
    expect(uncovered[0].step).toBe('Step 3');
  });

  it('keeps a non-college path in the tracks', async () => {
    // Trade is what makes this not exclusively a four-year product, and
    // "Figuring It Out" is the population an advising office worries about.
    const names = TRACKS.map((track) => track.name);
    expect(names).toContain('Trade');
    expect(names).toContain('Figuring It Out');
  });
});
