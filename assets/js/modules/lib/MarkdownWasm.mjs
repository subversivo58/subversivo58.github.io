/**
 * markdown-wasm.mjs
 * Parser Markdown WebAssembly.
 *
 * O núcleo cuida de:
 * - Inicialização do WASM.
 * - Conversão Markdown para HTML.
 * - Divisão segura de documentos grandes.
 * - Registro e execução das extensões.
 * - Renderização e montagem no DOM.
 */

import {
  resolveMarkdownExtensions
} from '../vendor/markdown-wasm/extensions/Registry.mjs';

const WASM_URL = new URL(
  '../vendor/markdown-wasm/markdown.wasm',
  import.meta.url
);

export const ParseFlags = Object.freeze({
  COLLAPSE_WHITESPACE: 1,
  PERMISSIVE_ATX_HEADERS: 2,
  PERMISSIVE_URL_AUTO_LINKS: 4,
  PERMISSIVE_EMAIL_AUTO_LINKS: 8,
  NO_INDENTED_CODE_BLOCKS: 16,
  NO_HTML_BLOCKS: 32,
  NO_HTML_SPANS: 64,
  TABLES: 256,
  STRIKETHROUGH: 512,
  PERMISSIVE_WWW_AUTOLINKS: 1024,
  TASK_LISTS: 2048,
  LATEX_MATH_SPANS: 4096,
  WIKI_LINKS: 8192,
  DEFAULT: 2823,
  NO_HTML: 96
});

export class WError extends Error {
  constructor(code, message, options) {
    super(
      message || `Erro no parser WebAssembly (${code}).`,
      options
    );

    this.name = 'WError';
    this.code = code;
  }
}

const decoder = new TextDecoder('utf-8');
const encoder = new TextEncoder();

let wasmModule;

// Valores do markdown.wasm (os mesmos do markdown.es.js original):
// o parser guarda em HEAP[8176] o fim do heap e precisa que ele
// comece em 5251216; sem isso o malloc devolve endereços dentro da
// pilha e textos maiores que ~3 KB dão "memory access out of bounds".
const DYNAMIC_TOP_POINTER = 8176;
const DYNAMIC_BASE = 5251216;

function readCString(memory, pointer) {
  if (!pointer) return '';

  const bytes = new Uint8Array(memory.buffer);
  let end = pointer;

  while (end < bytes.length && bytes[end] !== 0) {
    end++;
  }

  return decoder.decode(
    bytes.subarray(pointer, end)
  );
}

async function initializeWasm() {
  const response = await fetch(WASM_URL);

  if (!response.ok) {
    throw new Error(
      `Não foi possível carregar ${WASM_URL}: HTTP ${response.status}`
    );
  }

  const buffer = await response.arrayBuffer();

  wasmModule = await WebAssembly.compile(buffer);

  return true;
}

export const ready = initializeWasm();

async function createWasmRuntime() {
  await ready;

  const memory = new WebAssembly.Memory({
    initial: 256
  });

  const table = new WebAssembly.Table({
    initial: 8,
    element: 'anyfunc'
  });

  const imports = {
    env: {
      // memcpy usado pelo parser para copiar blocos grandes
      a: (destination, source, length) => {
        new Uint8Array(memory.buffer).copyWithin(
          destination,
          source,
          source + length
        );
      },

      // cresce a memória quando o heap precisa de mais espaço
      b: requested => {
        if (requested > 2147418112) return 0;

        let size = Math.max(memory.buffer.byteLength, 16777216);

        while (size < requested) size *= 2;

        try {
          memory.grow(
            Math.ceil((size - memory.buffer.byteLength) / 65536)
          );

          return 1;
        } catch (error) {
          return 0;
        }
      },

      memory,
      table
    }
  };

  // Início do heap do parser (antes de instanciar)
  new Uint32Array(memory.buffer)[DYNAMIC_TOP_POINTER >> 2] = DYNAMIC_BASE;

  const instance = await WebAssembly.instantiate(
    wasmModule,
    imports
  );

  const wasm = instance.exports;

  wasm.c();

  const required = [
    wasm.d,
    wasm.e,
    wasm.f,
    wasm.g,
    wasm.h,
    wasm.i
  ];

  if (!required.every(fn => typeof fn === 'function')) {
    throw new Error(
      'O markdown.wasm não apresenta as exportações esperadas.'
    );
  }

  const outputPointerSlot = wasm.d(0, 4);

  if (!outputPointerSlot) {
    throw new Error(
      'Não foi possível reservar o endereço de saída do parser.'
    );
  }

  return {
    wasm,
    memory,
    outputPointerSlot
  };
}

function parseWasmChunk(
  input,
  runtime,
  flags,
  asMemoryView = false
) {
  const {
    wasm,
    memory,
    outputPointerSlot
  } = runtime;

  const inputPointer = wasm.d(
    0,
    input.byteLength + 1
  );

  if (!inputPointer) {
    throw new Error(
      'Não foi possível alocar memória para o Markdown.'
    );
  }

  try {
    const memoryBytes = new Uint8Array(memory.buffer);

    memoryBytes.set(input, inputPointer);

    memoryBytes[inputPointer + input.byteLength] = 0;

    new DataView(memory.buffer).setUint32(
      outputPointerSlot,
      0,
      true
    );

    const outputLength = wasm.i(
      inputPointer,
      input.byteLength,
      flags,
      1,
      outputPointerSlot
    );

    const errorCode = wasm.f();

    if (errorCode) {
      const errorMessage = readCString(
        memory,
        wasm.g()
      );

      wasm.h();

      throw new WError(
        errorCode,
        errorMessage
      );
    }

    const outputPointer = new DataView(
      memory.buffer
    ).getUint32(outputPointerSlot, true);

    if (!outputPointer && outputLength) {
      throw new Error(
        'O parser não retornou um endereço válido para o HTML.'
      );
    }

    const outputView = new Uint8Array(
      memory.buffer,
      outputPointer,
      outputLength
    );

    if (asMemoryView) {
      return new Uint8Array(outputView);
    }

    return decoder.decode(outputView);

  } finally {
    wasm.e(inputPointer);
  }
}

/**
 * Divide o Markdown respeitando cercas de código e blocos HTML.
 */
function splitMarkdownIntoSafeChunks(source) {
  const lines = source.match(
    /[^\r\n]*(?:\r\n|\n|\r|$)/g
  )?.filter(Boolean) ?? [source];

  const chunks = [];
  let current = '';
  let fence = null;
  const htmlStack = [];
  let previousWasQuote = false;

  const voidTags = new Set([
    'area', 'base', 'br', 'col', 'embed',
    'hr', 'img', 'input', 'link', 'meta',
    'param', 'source', 'track', 'wbr'
  ]);

  const htmlBlockStart =
    /^\s{0,3}<(?:address|article|aside|blockquote|div|dl|fieldset|figure|footer|form|h[1-6]|header|hr|main|nav|ol|p|pre|section|table|ul|picture|script|style|details)\b/i;

  function updateHtmlStack(line) {
    const tags = line.matchAll(
      /<\s*(\/?)\s*([a-z][\w:-]*)\b[^>]*>/gi
    );

    for (const tag of tags) {
      const closing = Boolean(tag[1]);
      const name = tag[2].toLowerCase();

      const selfClosing =
        /\/\s*>$/.test(tag[0]) ||
        voidTags.has(name);

      if (closing) {
        const index = htmlStack.lastIndexOf(name);

        if (index !== -1) {
          htmlStack.splice(index);
        }

      } else if (!selfClosing) {
        htmlStack.push(name);
      }
    }
  }

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    const blank = /^\s*(?:\r?\n)?$/.test(line);

    const nextLine = lines[index + 1] ?? '';

    const nextIsQuote =
      /^\s{0,3}>/.test(nextLine);

    if (blank) {
      if (
        fence ||
        htmlStack.length ||
        (previousWasQuote && nextIsQuote)
      ) {
        current += line;

      } else {
        current += line;

        if (current.trim()) {
          chunks.push(current);
        }

        current = '';
      }

      continue;
    }

    current += line;

    if (fence) {
      const closePattern = new RegExp(
        '^\\s{0,3}' +
        fence.char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') +
        '{' + fence.length + ',}\\s*$'
      );

      if (closePattern.test(line.trimEnd())) {
        fence = null;
      }

    } else {
      const fenceMatch = line.match(
        /^\s{0,3}(`{3,}|~{3,})/
      );

      if (fenceMatch) {
        fence = {
          char: fenceMatch[1][0],
          length: fenceMatch[1].length
        };

      } else if (
        htmlStack.length ||
        htmlBlockStart.test(line)
      ) {
        updateHtmlStack(line);
      }
    }

    previousWasQuote =
      /^\s{0,3}>/.test(line);
  }

  if (current.trim()) {
    chunks.push(current);
  }

  return chunks;
}
/**
 * Conversão Markdown para HTML.
 *
 * Esta função é o parser puro: não executa extensões.
 *
 * options.chunked: false por padrão. Com true o texto é dividido em
 * blocos (respeitando cercas de código e HTML) e cada bloco é
 * convertido separadamente.
 */
export async function parse(markdown, options = {}) {
  await ready;

  const input = typeof markdown === 'string'
    ? encoder.encode(markdown)
    : markdown;

  if (!(input instanceof Uint8Array)) {
    throw new TypeError(
      'parse() espera uma string ou Uint8Array.'
    );
  }

  const format = options.format ?? 'html';

  if (format !== 'html') {
    throw new RangeError(
      `Formato não suportado: ${format}`
    );
  }

  const flags = options.parseFlags ??
    (
      ParseFlags.DEFAULT |
      ParseFlags.NO_HTML_BLOCKS
    );

  // Padrão: o documento inteiro de uma vez. É correto (listas e
  // referências) e rápido: 8 MB em ~0,2 s. Dividir em partes só com
  // { chunked: true }: cada parte cria um WASM novo (centenas de vezes
  // mais lento) e quebra listas com linhas em branco entre os itens.
  if (options.chunked !== true) {
    const runtime = await createWasmRuntime();

    return parseWasmChunk(
      input,
      runtime,
      flags,
      Boolean(options.asMemoryView)
    );
  }

  const source = typeof markdown === 'string'
    ? markdown
    : decoder.decode(input);

  const chunks = splitMarkdownIntoSafeChunks(source);

  if (chunks.length <= 1) {
    const runtime = await createWasmRuntime();

    return parseWasmChunk(
      input,
      runtime,
      flags,
      Boolean(options.asMemoryView)
    );
  }

  const html = [];

  for (const chunk of chunks) {
    const runtime = await createWasmRuntime();

    html.push(
      parseWasmChunk(
        encoder.encode(chunk),
        runtime,
        flags
      )
    );
  }

  const result = html.join('');

  return options.asMemoryView
    ? encoder.encode(result)
    : result;
}

/**
 * Executa os hooks before() das extensões selecionadas.
 */
async function runBeforeExtensions(
  markdown,
  selected,
  options,
  context
) {
  let source = markdown;

  for (const { name, extension } of selected) {
    if (!extension.stage.includes('before')) {
      continue;
    }

    const result = await extension.before(
      source,
      options,
      context
    );

    if (typeof result !== 'string') {
      throw new TypeError(
        `A extensão "${name}" precisa retornar uma string em before().`
      );
    }

    source = result;
  }

  return source;
}

/**
 * Executa os hooks after() das extensões selecionadas.
 */
async function runAfterExtensions(
  root,
  selected,
  options,
  context
) {
  for (const { extension } of selected) {
    if (!extension.stage.includes('after')) {
      continue;
    }

    await extension.after(
      root,
      options,
      context
    );
  }
}

/**
 * Limpeza e normalização geral do HTML.
 * Não pertence a nenhuma extensão específica.
 */
function normalizeMarkdownDOM(root) {
  // Remove parágrafos realmente vazios.
  for (const paragraph of root.querySelectorAll('p')) {
    if (
      !paragraph.textContent.trim() &&
      paragraph.children.length === 0
    ) {
      paragraph.remove();
    }
  }

  // Reúne listas adjacentes do mesmo tipo.
  for (const list of [...root.querySelectorAll('ul, ol')]) {
    let next = list.nextElementSibling;

    while (
      next &&
      next.tagName === list.tagName
    ) {
      while (next.firstChild) {
        list.appendChild(next.firstChild);
      }

      const remove = next;
      next = next.nextElementSibling;

      remove.remove();
    }
  }
}

/**
 * Aplica as extensões selecionadas ao HTML.
 *
 * options.extensions recebe os nomes registrados.
 */
export async function applyMarkdownExtensions(
  html,
  options = {}
) {
  if (typeof document === 'undefined') {
    throw new Error(
      'As extensões HTML precisam de um navegador com DOM.'
    );
  }

  const selected = resolveMarkdownExtensions(
    options.extensions ?? []
  );

  const template = document.createElement('template');

  template.innerHTML = html;

  const root = template.content;
  const context = Object.create(null);

  await runAfterExtensions(
    root,
    selected,
    options,
    context
  );

  normalizeMarkdownDOM(root);

  return template.innerHTML;
}

/**
 * Converte uma string Markdown em HTML.
 *
 * A sequência é:
 * 1. Hooks before das extensões.
 * 2. Parser WASM.
 * 3. Hooks after das extensões.
 * 4. Normalização do DOM.
 */
export async function renderMarkdown(markdown, options = {}) {
  if (typeof markdown !== 'string') {
    throw new TypeError(
      'renderMarkdown() espera uma string Markdown.'
    );
  }

  const selected = resolveMarkdownExtensions(
    options.extensions ?? []
  );

  const context = Object.create(null);

  const source = await runBeforeExtensions(
    markdown,
    selected,
    options,
    context
  );

  const html = await parse(
    source,
    options
  );

  if (typeof document === 'undefined') {
    if (selected.some(({ extension }) =>
      extension.stage.includes('after')
    )) {
      throw new Error(
        'As extensões after precisam de um navegador com DOM.'
      );
    }

    return html;
  }

  const template = document.createElement('template');

  template.innerHTML = html;

  await runAfterExtensions(
    template.content,
    selected,
    options,
    context
  );

  normalizeMarkdownDOM(template.content);

  return template.innerHTML;
}
/**
 * Busca um arquivo Markdown e converte seu conteúdo.
 */
export async function renderMarkdownURL(url, options = {}) {
  const response = await fetch(url, {
    signal: options.signal
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao buscar Markdown (${response.status}): ${url}`
    );
  }

  const markdown = await response.text();

  return renderMarkdown(
    markdown,
    options
  );
}

/**
 * Busca um Markdown e insere o HTML em um elemento da página.
 *
 * Exemplo:
 * await mountMarkdown(
 *   './docs/donations.md',
 *   '#donations',
 *   {
 *     extensions: [
 *       'tables',
 *       'images',
 *       'anchors',
 *       'externalLinks',
 *       'blockAttributes'
 *     ]
 *   }
 * );
 */
export async function mountMarkdown(url, target, options = {}) {
  if (typeof document === 'undefined') {
    throw new Error(
      'mountMarkdown() precisa ser executado em um navegador.'
    );
  }

  const element = typeof target === 'string'
    ? document.querySelector(target)
    : target;

  if (!element) {
    throw new Error(
      `Elemento de destino não encontrado: ${target}`
    );
  }

  const html = await renderMarkdownURL(
    url,
    options
  );

  element.insertAdjacentHTML(
    options.position || 'afterbegin',
    html
  );

  return {
    element,
    html
  };
}

/**
 * Carrega vários documentos Markdown.
 *
 * Cada entrada pode ser:
 * {
 *   name: 'donations',
 *   url: './docs/donations.md'
 * }
 *
 * Também é possível selecionar extensões por entrada:
 * {
 *   name: 'donations',
 *   url: './docs/donations.md',
 *   extensions: ['tables', 'images']
 * }
 *
 * Quando a entrada não define extensions,
 * usa options.extensions.
 */
export async function loadMarkdownFiles(
  files,
  options = {}
) {
  const entries = Array.isArray(files)
    ? files
    : Object.entries(files).map(([name, url]) => ({
        name,
        url
      }));

  return Promise.all(
    entries.map(async entry => {
      const name = entry.name;
      const url = entry.url;

      const response = await fetch(url, {
        signal: options.signal
      });

      if (!response.ok) {
        throw new Error(
          `Falha ao buscar Markdown (${response.status}): ${url}`
        );
      }

      const markdown = await response.text();

      const html = await renderMarkdown(
        markdown,
        {
          ...options,
          extensions:
            entry.extensions ??
            options.extensions ??
            []
        }
      );

      return {
        name,
        url,
        markdown,
        html
      };
    })
  );
}