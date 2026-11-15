/**
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 *
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