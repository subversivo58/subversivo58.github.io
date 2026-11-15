/**
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 *
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