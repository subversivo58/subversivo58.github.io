/**
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


