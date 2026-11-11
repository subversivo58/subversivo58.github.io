/**
 * block-attributes.mjs
 * Atributos personalizados em blocos Markdown.
 */

import {
  applyAttributes,
  takeTrailingAttributeSuffix,
  consumeSuffixFromNextSibling
} from './Utils.mjs';

function applyBlockAttributes(root) {
  const allowed =
    'p, ul, ol, h1, h2, h3, h4, h5, h6, hr, pre';

  for (const element of root.querySelectorAll(allowed)) {
    const last = element.lastChild;

    if (last?.nodeType === Node.TEXT_NODE) {
      const suffix = takeTrailingAttributeSuffix(
        last.nodeValue
      );

      if (suffix) {
        applyAttributes(
          element,
          suffix.attributes
        );

        last.nodeValue = suffix.remainder;

        if (!last.nodeValue.trim()) {
          last.remove();
        }
      }
    }

    if (
      element.tagName === 'UL' ||
      element.tagName === 'OL'
    ) {
      const lastItem = element.lastElementChild;

      if (lastItem?.tagName === 'LI') {
        const itemText = lastItem.lastChild;

        if (itemText?.nodeType === Node.TEXT_NODE) {
          const suffix = takeTrailingAttributeSuffix(
            itemText.nodeValue
          );

          if (suffix) {
            applyAttributes(
              element,
              suffix.attributes
            );

            itemText.nodeValue = suffix.remainder;

            if (!itemText.nodeValue.trim()) {
              itemText.remove();
            }
          }
        }
      }
    }

    consumeSuffixFromNextSibling(
      element,
      [['{', '}']]
    );

    if (/^H[1-6]$/.test(element.tagName)) {
      for (const anchor of element.querySelectorAll(
        'a.anchor[aria-hidden="true"]'
      )) {
        anchor.remove();
      }
    }
  }
}



export default {
  stage: ['after'],

  after(root) {
    applyBlockAttributes(root);
  }
};