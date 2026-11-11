/**
 * external-links.mjs
 * Comportamento padrão para links externos.
 */

export default {
  stage: ['after'],

  after(root) {
    for (const anchor of root.querySelectorAll('a')) {
      const href = anchor.getAttribute('href') || '';

      if (!/^https?:\/\//i.test(href)) {
        continue;
      }

      let external = true;

      try {
        external =
          new URL(href, document.baseURI).hostname !==
          window.location.hostname;

      } catch {
        external = true;
      }

      if (!external) continue;

      if (!anchor.hasAttribute('target')) {
        anchor.setAttribute(
          'target',
          'about:blank'
        );
      }

      const rel = new Set(
        (anchor.getAttribute('rel') || '')
          .split(/\s+/)
          .filter(Boolean)
      );

      rel.add('noopener');
      rel.add('noreferrer');

      anchor.setAttribute(
        'rel',
        [...rel].join(' ')
      );
    }
  }
};