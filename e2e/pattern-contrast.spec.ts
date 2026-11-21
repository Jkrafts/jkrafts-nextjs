import { test, expect } from '@playwright/test';
import { projects, getPattern } from '../data/projects';
import { contrast, luminance, PATTERN_CONTRAST } from '../lib/patterns';

/**
 * Story slides, tiles and work rows put white text on a project's accent,
 * overlaid with its generated pattern. Text stays AA-legible on every pixel
 * as long as the accent passes with white and the pattern only ever darkens
 * it (the bottom gradient is darker still).
 */
test.describe('Project pattern contrast', () => {
  for (const project of projects) {
    test(`${project.id}: white text stays AA on the accent and its pattern`, () => {
      const { line, variant } = getPattern(project);

      expect(contrast('#ffffff', project.accentColor)).toBeGreaterThanOrEqual(4.5);
      // Darker than the accent, so white text on a line has even more contrast.
      expect(luminance(line)).toBeLessThan(luminance(project.accentColor));
      expect(contrast('#ffffff', line)).toBeGreaterThan(contrast('#ffffff', project.accentColor));
      // Same visual strength on every project: quiet, but visible.
      expect(contrast(project.accentColor, line)).toBeCloseTo(PATTERN_CONTRAST[variant], 1);
    });
  }

  test('patterns are deterministic, unique, and neighbours never share a family', () => {
    const images = projects.map((p) => getPattern(p).image);
    expect(new Set(images).size).toBe(projects.length);
    // More projects than families, so families repeat, but never side by
    // side in the work list or the /projects row.
    const variants = projects.map((p) => getPattern(p).variant);
    variants.slice(1).forEach((v, i) => expect(v, `${projects[i].id} → ${projects[i + 1].id}`).not.toBe(variants[i]));
    expect(projects.map((p) => getPattern(p).image)).toEqual(images);
  });
});
