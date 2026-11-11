/**
 * anchors.mjs
 * Atributos personalizados em links Markdown.
 */

import {
  consumeSuffixFromNextSibling
} from './Utils.mjs';

export default {
  stage: ['after'],

  after(root) {
    for (const anchor of root.querySelectorAll('a')) {
      consumeSuffixFromNextSibling(
        anchor,
        [
          ['(', ')'],
          ['{', '}']
        ]
      );
    }
  }
};