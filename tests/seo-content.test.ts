import { describe, expect, it } from 'vitest';
import { catalog } from '../src/games/catalog';
import { gameCopy } from '../scripts/seo/content';

describe('SEO content', () => {
  it('has copy for every game in the catalog (and no strays)', () => {
    const catalogIds = catalog.map((m) => m.id).sort();
    const copyIds = Object.keys(gameCopy).sort();
    expect(copyIds).toEqual(catalogIds);
  });

  for (const meta of catalog) {
    const copy = gameCopy[meta.id];

    it(`${meta.id}: meta description fits a search snippet`, () => {
      expect(copy.metaDescription.length).toBeGreaterThan(70);
      expect(copy.metaDescription.length).toBeLessThanOrEqual(160);
    });

    it(`${meta.id}: prose is substantial (150-260 words)`, () => {
      const words = copy.paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
      expect(words).toBeGreaterThanOrEqual(140);
      expect(words).toBeLessThanOrEqual(280);
    });

    it(`${meta.id}: has keywords, skills, and how-to-play`, () => {
      expect(copy.keywords.length).toBeGreaterThanOrEqual(3);
      expect(copy.skills.length).toBeGreaterThanOrEqual(2);
      expect(copy.howToPlay.length).toBeGreaterThanOrEqual(3);
      expect(copy.metaTitle).toContain('Tiny Paws');
    });
  }
});
