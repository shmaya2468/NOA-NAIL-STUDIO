import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * Premium scroll-in treatment for section headings only — a line-mask
 * reveal (blur → sharp, translateY, stagger) via GSAP SplitText, plus a
 * single gradient light-sweep across any <em> emphasis word the first time
 * each heading comes into view. Body copy keeps the lighter IntersectionObserver
 * fade in reveal.js — this module deliberately never touches paragraphs, so
 * the "stronger heading / subtler body copy" balance the design calls for
 * stays enforced structurally, not just by convention.
 */
export function initScrollReveals() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  const run = () => {
    // The Hand/Pedicure Portfolio intros and the About intro get their own
    // sequenced timelines (see initCenteredIntro / initAboutIntro below)
    // instead of the generic per-heading treatment, so their headings are
    // excluded here to avoid animating them twice.
    const headings = Array.from(document.querySelectorAll('.section-title:not(#heroTitle)')).filter(
      (h) => !h.closest('[data-feet-intro]') && !h.closest('[data-hands-intro]') && !h.closest('.about-copy')
    );

    headings.forEach((heading) => {
      const split = new SplitText(heading, { type: 'lines', mask: 'lines', linesClass: 'sr-line' });
      syncSplitAlignment(heading, split);

      gsap.set(split.lines, { yPercent: 105, opacity: 0, filter: 'blur(10px)' });
      gsap.to(split.lines, {
        yPercent: 0,
        opacity: 1,
        filter: 'blur(0px)',
        duration: 1,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
      });

      const em = pickHighlightEm(heading);
      if (em) {
        em.classList.add('sr-highlight');
        gsap.fromTo(
          em,
          { backgroundPosition: '200% 0' },
          {
            backgroundPosition: '-40% 0',
            duration: 1.3,
            ease: 'power2.inOut',
            delay: 0.55,
            scrollTrigger: { trigger: heading, start: 'top 88%', once: true },
          }
        );
      }
    });

    initCenteredIntro('[data-feet-intro]');
    initCenteredIntro('[data-hands-intro]');
    // Isolated: a failure in this one section's SplitText/timeline setup
    // must never be able to skip ScrollTrigger.refresh() below (which the
    // Cover Flow galleries and every other reveal on the page depend on).
    try {
      initAboutIntro();
    } catch (err) {
      console.error('About intro animation failed to initialize:', err);
    }
    ScrollTrigger.refresh();
  };

  // Split after webfonts settle so line-wrap measurement (and therefore the
  // per-line mask heights) match what actually renders.
  if (document.fonts?.ready) document.fonts.ready.then(run);
  else run();
}

/**
 * SplitText's `mask: 'lines'` reconstruction can fragment an inline element
 * that sits right at an auto-wrap boundary into two `<em>` clones — one
 * left empty, one holding the actual word (confirmed via inspection: an
 * `<em class="sr-highlight"></em><em>word</em>` pair). Picking the first
 * `<em>` unconditionally can land the shimmer highlight on the empty one,
 * so this picks the first one that actually has text instead — correct
 * whether or not SplitText ends up splitting it, at any heading width.
 */
function pickHighlightEm(heading) {
  return Array.from(heading.querySelectorAll('em')).find((em) => em.textContent.trim().length > 0) || null;
}

/**
 * SplitText hard-codes `text-align: start` as an inline style on every line
 * mask/line div it generates, which silently overrides any CSS (including a
 * mobile `text-align: center` override on the heading's own ancestor) since
 * an inline style always wins. Copying the heading's own resolved alignment
 * onto those generated wrappers keeps a centered heading actually centered
 * once split, on any breakpoint.
 */
function syncSplitAlignment(heading, split) {
  const align = getComputedStyle(heading).textAlign;
  if (!align || align === 'start') return;
  [...split.lines, ...heading.querySelectorAll('.sr-line-mask')].forEach((el) => {
    el.style.textAlign = align;
  });
}

/**
 * A small bespoke "wow moment" for a centered single-intro section (Hand
 * Portfolio, Pedicure Portfolio): eyebrow fades in, the heading reveals
 * through its line mask, a thin gold rule draws itself under it, the
 * supporting copy rises in, and the emphasised word gets one light sweep —
 * in that order, once, on scroll-in. Everything here has a fully visible,
 * unanimated default in the markup/CSS, so the section still reads
 * correctly if this never runs (no JS, reduced motion).
 */
function initCenteredIntro(selector) {
  const wrap = document.querySelector(selector);
  const heading = wrap?.querySelector('.section-title');
  if (!wrap || !heading) return;

  const eyebrow = wrap.querySelector('.eyebrow');
  const rule = wrap.querySelector('.section-title-rule');
  const lede = wrap.querySelector('.section-lede');

  const split = new SplitText(heading, { type: 'lines', mask: 'lines', linesClass: 'sr-line' });
  syncSplitAlignment(heading, split);
  const em = pickHighlightEm(heading);
  if (em) em.classList.add('sr-highlight');

  if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 10 });
  gsap.set(split.lines, { yPercent: 105, opacity: 0, filter: 'blur(10px)' });
  if (rule) gsap.set(rule, { scaleX: 0 });
  if (em) gsap.set(em, { backgroundPosition: '200% 0' });
  if (lede) gsap.set(lede, { opacity: 0, y: 18 });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: wrap, start: 'top 82%', once: true },
  });

  if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.55 });
  tl.to(
    split.lines,
    { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 1, stagger: 0.12 },
    eyebrow ? '-=0.2' : 0
  );
  if (rule) tl.to(rule, { scaleX: 1, duration: 0.7, ease: 'power2.inOut' }, '-=0.35');
  if (lede) tl.to(lede, { opacity: 1, y: 0, duration: 0.8 }, '-=0.4');
  if (em) tl.to(em, { backgroundPosition: '-40% 0', duration: 1.2, ease: 'power2.inOut' }, '-=0.5');
}

/**
 * Bespoke sequenced reveal for the About section's intro copy — eyebrow,
 * headline (line-mask reveal + one gold sweep through "נועה"), the personal
 * bio paragraphs, the "אצלנו בסטודיו" subhead (+ its own gold sweep), then
 * the supporting paragraph. Every text element here shares one subtle
 * blur-to-sharp settle (not just the bio) so the whole block emerges as one
 * luminous moment rather than a plain fade. Durations/overlaps are kept
 * short and tightly staggered (full sequence lands in ~2.5s, heading and
 * body tweens each under a second) so the section reads as responsive
 * rather than a wait — quicker than initCenteredIntro's own pacing on
 * purpose, since that one guards a single "wow moment" per page view while
 * this text needs to be legible fast. The Noa/studio photos and the 01–04
 * benefit cards below keep their own separate IntersectionObserver `.reveal`
 * fade (reveal.js) — untouched here.
 */
function initAboutIntro() {
  const copy = document.querySelector('.about-copy');
  const heading = copy?.querySelector('.section-title');
  if (!copy || !heading) return;

  const eyebrow = copy.querySelector('.eyebrow');
  const bioParas = copy.querySelectorAll('.about-bio');
  const subhead = copy.querySelector('.about-subhead');
  const lede = copy.querySelector('p.lede');

  const split = new SplitText(heading, { type: 'lines', mask: 'lines', linesClass: 'sr-line' });
  syncSplitAlignment(heading, split);
  const em = pickHighlightEm(heading);
  if (em) em.classList.add('sr-highlight');

  if (eyebrow) gsap.set(eyebrow, { opacity: 0, y: 10, filter: 'blur(6px)' });
  gsap.set(split.lines, { yPercent: 105, opacity: 0, filter: 'blur(10px)' });
  if (em) gsap.set(em, { backgroundPosition: '200% 0' });
  if (bioParas.length) gsap.set(bioParas, { opacity: 0, y: 22, filter: 'blur(6px)' });
  if (subhead) {
    gsap.set(subhead, { opacity: 0, y: 14, filter: 'blur(6px)' });
    subhead.classList.add('sr-highlight');
    gsap.set(subhead, { backgroundPosition: '200% 0' });
  }
  if (lede) gsap.set(lede, { opacity: 0, y: 18, filter: 'blur(6px)' });

  const tl = gsap.timeline({
    defaults: { ease: 'power3.out' },
    scrollTrigger: { trigger: copy, start: 'top 82%', once: true },
  });

  if (eyebrow) tl.to(eyebrow, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.4 });
  tl.to(split.lines, { yPercent: 0, opacity: 1, filter: 'blur(0px)', duration: 0.6, stagger: 0.06 }, eyebrow ? '-=0.2' : 0);
  if (em) tl.to(em, { backgroundPosition: '-40% 0', duration: 0.8, ease: 'power2.inOut' }, '-=0.35');
  if (bioParas.length) {
    tl.to(bioParas, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55, stagger: 0.08 }, '-=0.3');
  }
  if (subhead) {
    tl.to(subhead, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.5 }, '-=0.3');
    tl.to(subhead, { backgroundPosition: '-40% 0', duration: 0.8, ease: 'power2.inOut' }, '-=0.35');
  }
  if (lede) tl.to(lede, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.55 }, '-=0.3');
}
