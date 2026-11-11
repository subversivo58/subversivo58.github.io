/**
 * registry.mjs
 * Registro e validação das extensões Markdown.
 */

const registeredExtensions = new Map();

const validStages = new Set([
  'before',
  'after'
]);

function validateExtension(key, extension) {
  if (
    typeof key !== 'string' ||
    !key.trim()
  ) {
    throw new TypeError(
      'O nome da extensão precisa ser uma string não vazia.'
    );
  }

  if (
    !extension ||
    typeof extension !== 'object' ||
    Array.isArray(extension)
  ) {
    throw new TypeError(
      `A extensão "${key}" precisa ser um objeto.`
    );
  }

  if (
    !Array.isArray(extension.stage) ||
    extension.stage.length === 0
  ) {
    throw new TypeError(
      `A extensão "${key}" precisa declarar stage.`
    );
  }

  const stages = new Set(extension.stage);

  for (const stage of stages) {
    if (!validStages.has(stage)) {
      throw new RangeError(
        `Estágio inválido na extensão "${key}": ${stage}`
      );
    }
  }

  if (
    stages.has('before') &&
    typeof extension.before !== 'function'
  ) {
    throw new TypeError(
      `A extensão "${key}" declara "before", mas não implementa before().`
    );
  }

  if (
    stages.has('after') &&
    typeof extension.after !== 'function'
  ) {
    throw new TypeError(
      `A extensão "${key}" declara "after", mas não implementa after().`
    );
  }

  if (
    extension.before !== undefined &&
    typeof extension.before !== 'function'
  ) {
    throw new TypeError(
      `A função before() da extensão "${key}" é inválida.`
    );
  }

  if (
    extension.after !== undefined &&
    typeof extension.after !== 'function'
  ) {
    throw new TypeError(
      `A função after() da extensão "${key}" é inválida.`
    );
  }
}

/**
 * Registra uma extensão individual.
 */
export function registerMarkdownExtension(key, extension) {
  validateExtension(key, extension);

  if (registeredExtensions.has(key)) {
    throw new Error(
      `A extensão "${key}" já foi registrada.`
    );
  }

  registeredExtensions.set(key, extension);

  return extension;
}

/**
 * Registra várias extensões de uma só vez.
 *
 * Recebe um objeto no formato:
 * {
 *   tables,
 *   images,
 *   anchors
 * }
 */
export function registerMarkdownExtensions(extensions) {
  if (
    !extensions ||
    typeof extensions !== 'object' ||
    Array.isArray(extensions)
  ) {
    throw new TypeError(
      'O registro de extensões precisa ser um objeto.'
    );
  }

  const entries = Object.entries(extensions);

  // Valida tudo antes de alterar o registro.
  for (const [key, extension] of entries) {
    validateExtension(key, extension);

    if (registeredExtensions.has(key)) {
      throw new Error(
        `A extensão "${key}" já foi registrada.`
      );
    }
  }

  for (const [key, extension] of entries) {
    registeredExtensions.set(key, extension);
  }

  return registeredExtensions.size;
}

/**
 * Retorna uma cópia do registro.
 */
export function getRegisteredMarkdownExtensions() {
  return new Map(registeredExtensions);
}

/**
 * Resolve os nomes selecionados para suas extensões.
 */
export function resolveMarkdownExtensions(names = []) {
  if (!Array.isArray(names)) {
    throw new TypeError(
      'options.extensions precisa ser um array de nomes.'
    );
  }

  const selected = [];

  for (const name of names) {
    if (typeof name !== 'string') {
      throw new TypeError(
        'Cada extensão selecionada precisa ser identificada por uma string.'
      );
    }

    const extension = registeredExtensions.get(name);

    if (!extension) {
      throw new Error(
        `A extensão "${name}" não está registrada.`
      );
    }

    selected.push({
      name,
      extension
    });
  }

  return selected;
}