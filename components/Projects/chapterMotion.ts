/**
 * Chapter entrances for project stories.
 *
 * Each chapter *type* has one entrance, identical in every project, so the
 * motion itself tells the visitor where they are in a story (the challenge
 * is always typed out, the stack always drops in...) and every story feels
 * like part of one series:
 *
 *   all       chapter label slides in from the left
 *   cover     initials grow in; title lines rise through a mask; lead fades up
 *   challenge the statement is typed out behind a caret
 *   craft     list items slide in from the right, one after another
 *   process   tech tags drop into place (a video fades up instead)
 *   result    the statement rises word by word; the call to action follows
 *
 * Entrances are short (under ~2s of a 5s chapter) so there is time to read.
 * `animateChapter` returns a gsap.Context: reverting it restores the
 * chapter's DOM exactly (SplitText included), so leaving and re-entering a
 * chapter replays it cleanly. Callers skip it under reduced motion.
 */
import { gsap, SplitText } from '@/lib/gsap';

type Recipe = (slide: HTMLElement, tl: gsap.core.Timeline) => void | (() => void);

const q = <T extends HTMLElement = HTMLElement>(root: HTMLElement, sel: string) =>
  root.querySelector<T>(sel);

const recipes: Record<string, Recipe> = {
  cover(slide, tl) {
    const mono = q(slide, '.story-monogram');
    const category = q(slide, '.story-slide-cover > .story-chapter');
    const title = q(slide, '.story-cover-title');
    const lead = q(slide, '.story-slide-cover > .story-lead');
    if (mono) tl.from(mono, { scale: 0.6, opacity: 0, transformOrigin: '100% 0%', duration: 1.4, ease: 'expo.out' }, 0);
    if (category) tl.from(category, { x: -16, opacity: 0, duration: 0.5, ease: 'power3.out' }, 0.1);
    if (title) {
      const split = SplitText.create(title, { type: 'lines', mask: 'lines' });
      tl.from(split.lines, { yPercent: 105, duration: 0.9, ease: 'expo.out', stagger: 0.09 }, 0.15);
    }
    if (lead) tl.from(lead, { y: 16, opacity: 0, duration: 0.7, ease: 'power3.out' }, 0.55);
  },

  challenge(slide, tl) {
    const statement = q(slide, '.story-statement');
    if (!statement) return;
    // Characters keep their space while hidden, so lines never reflow and
    // the bottom-aligned copy doesn't jump as the text appears.
    const split = SplitText.create(statement, { type: 'words,chars' });
    const chars = split.chars as HTMLElement[];
    const caret = document.createElement('span');
    caret.className = 'story-caret';
    caret.setAttribute('aria-hidden', 'true');
    statement.append(caret);

    // Caret sits after `el` (or before it, for the very first character).
    const place = (el: HTMLElement, edge: 'left' | 'right' = 'right') => {
      const box = el.getBoundingClientRect();
      const host = statement.getBoundingClientRect();
      caret.style.transform = `translate(${box[edge] - host.left}px, ${box.top - host.top}px)`;
      caret.style.height = `${box.height}px`;
    };

    gsap.set(chars, { visibility: 'hidden' });
    place(chars[0], 'left');

    const step = Math.min(0.032, 1.6 / chars.length);
    chars.forEach((char, i) => {
      tl.call(() => {
        char.style.visibility = 'visible';
        place(char);
      }, undefined, 0.2 + i * step);
    });
    // Blink a few times once typed, then go.
    tl.to(caret, { opacity: 0, duration: 0.01, repeat: 5, yoyo: true, repeatDelay: 0.38 }, '+=0.15');
    tl.set(caret, { opacity: 0 });

    return () => caret.remove();
  },

  craft(slide, tl) {
    const items = slide.querySelectorAll<HTMLElement>('.story-list li');
    tl.from(items, { x: 48, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.09 }, 0.15);
  },

  process(slide, tl) {
    const tags = slide.querySelectorAll<HTMLElement>('.story-tags li');
    const media = q(slide, '.story-media');
    if (tags.length) {
      tl.from(tags, { y: -28, opacity: 0, duration: 0.6, ease: 'back.out(2.2)', stagger: 0.07 }, 0.15);
    }
    if (media) tl.from(media, { y: 20, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.15);
  },

  result(slide, tl) {
    const statement = q(slide, '.story-statement');
    const cta = q(slide, '.story-cta-block');
    if (statement) {
      const split = SplitText.create(statement, { type: 'words', mask: 'words' });
      tl.from(split.words, { yPercent: 110, duration: 0.8, ease: 'expo.out', stagger: 0.035 }, 0.15);
    }
    if (cta) tl.from(cta, { y: 28, opacity: 0, duration: 0.8, ease: 'power3.out' }, 0.75);
  },
};

export function animateChapter(slide: HTMLElement): gsap.Context | null {
  const content = q(slide, '.story-slide');
  const type = content?.dataset.chapter;
  if (!content || !type) return null;

  return gsap.context(() => {
    const tl = gsap.timeline();
    // Shared by every chapter after the cover.
    const label = q(content, ':scope > .story-chapter');
    if (label && type !== 'cover') tl.from(label, { x: -16, opacity: 0, duration: 0.5, ease: 'power3.out' }, 0);
    return recipes[type]?.(slide, tl);
  }, slide);
}
