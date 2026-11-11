/**
 * images.mjs
 * Atributos e classes das imagens Markdown.
 */

import {
  consumeSuffixFromNextSibling
} from './Utils.mjs';

function applyImageClasses(root) {
  for (const image of root.querySelectorAll('img')) {
    image.classList.add(
      'img-fluid',
      'w-100'
    );

    consumeSuffixFromNextSibling(
      image,
      [['{', '}']]
    );
  }
}

export default {
  stage: ['after'],

  after(root) {
    applyImageClasses(root);
  }
};