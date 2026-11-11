/**
 * extension-utils.mjs
 * Utilitários compartilhados pelas extensões Markdown.
 */

export function parseAttributeTokens(source) {
  const attributes = [];

  const tokenPattern =
    /([#.][\w-]+|[\w:-]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s]+)))?/g;

  let match;

  while ((match = tokenPattern.exec(source))) {
    const token = match[1];

    if (token[0] === '#') {
      attributes.push([
        'id',
        token.slice(1)
      ]);

    } else if (token[0] === '.') {
      attributes.push([
        'class',
        token.slice(1)
      ]);

    } else {
      attributes.push([
        token,
        match[2] ?? match[3] ?? match[4] ?? ''
      ]);
    }
  }

  return attributes;
}

export function applyAttributes(element, source) {
  for (const [name, value] of parseAttributeTokens(source)) {
    if (name === 'class') {
      for (const className of value.split(/\s+/).filter(Boolean)) {
        element.classList.add(className);
      }

    } else if (name === 'id') {
      element.setAttribute('id', value);

    } else if (name) {
      element.setAttribute(name, value);
    }
  }
}

/**
 * Reconhece atributos entre parênteses ou chaves
 * imediatamente após um elemento.
 */
export function takeAttributeSuffix(text, open, close) {
  const leading = text.match(/^\s*/)?.[0] ?? '';
  const start = leading.length;

  if (text[start] !== open) {
    return null;
  }

  let quote = null;

  for (let i = start + 1; i < text.length; i++) {
    const char = text[i];

    if (quote) {
      if (
        char === quote &&
        text[i - 1] !== '\\'
      ) {
        quote = null;
      }

    } else if (
      char === '"' ||
      char === "'"
    ) {
      quote = char;

    } else if (char === close) {
      return {
        attributes: text.slice(start + 1, i),
        remainder: text.slice(i + 1),
        leading
      };
    }
  }

  return null;
}

/**
 * Reconhece atributos no final de títulos e blocos.
 */
export function takeTrailingAttributeSuffix(text) {
  const match = text.match(/\{([^{}]*)\}\s*$/);

  if (!match) return null;

  return {
    attributes: match[1],
    remainder: text.slice(0, match.index)
  };
}

/**
 * Consome atributos encontrados no próximo nó de texto.
 */
export function consumeSuffixFromNextSibling(
  element,
  delimiters
) {
  const next = element.nextSibling;

  if (next?.nodeType !== Node.TEXT_NODE) {
    return false;
  }

  for (const [open, close] of delimiters) {
    const suffix = takeAttributeSuffix(
      next.nodeValue,
      open,
      close
    );

    if (!suffix) continue;

    applyAttributes(
      element,
      suffix.attributes
    );

    next.nodeValue =
      suffix.leading + suffix.remainder;

    if (!next.nodeValue) {
      next.remove();
    }

    return true;
  }

  return false;
}