/**
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 *
 * index.mjs
 * Catálogo de extensões Markdown.
 */

import tables from './Tables.mjs';
import images from './Images.mjs';
import anchors from './Anchors.mjs';
import externalLinks from './ExternalLinks.mjs';
import blockAttributes from './BlockAttributes.mjs';
import highlight from './Highlight.mjs';






export const markdownExtensions = Object.freeze({
  tables,
  images,
  anchors,
  externalLinks,
  blockAttributes,
  highlight
});

export {
  tables,
  images,
  anchors,
  externalLinks,
  blockAttributes,
  highlight
};


