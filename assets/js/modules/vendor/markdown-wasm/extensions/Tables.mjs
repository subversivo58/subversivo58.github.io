/**
 * tables.mjs
 * Tratamento de tabelas Markdown longas.
 */

/**
 * Divide tabelas grandes em grupos de linhas.
 * Cada grupo conserva o cabeçalho e o separador.
 */
function splitLongMarkdownTables(source, maxRows = 5) {
  const lines = source.split(/\r?\n/);
  const result = [];

  let current = [];
  let fence = null;

  const isSeparator = line => {
    const cells = line.trim()
      .replace(/^\|/, '')
      .replace(/\|$/, '')
      .split('|');

    return cells.length > 1 &&
      cells.every(cell =>
        /^\s*:?-{3,}:?\s*$/.test(cell)
      );
  };

  const flush = () => {
    if (current.length) {
      result.push(current.join('\n'));
      current = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const fenceMatch = line.match(
      /^\s{0,3}(`{3,}|~{3,})/
    );

    if (fence) {
      current.push(line);

      if (
        fenceMatch &&
        fenceMatch[1][0] === fence.char &&
        fenceMatch[1].length >= fence.length
      ) {
        fence = null;
      }

      continue;
    }

    if (fenceMatch) {
      fence = {
        char: fenceMatch[1][0],
        length: fenceMatch[1].length
      };

      current.push(line);
      continue;
    }

    const next = lines[i + 1] ?? '';

    const isTable =
      line.includes('|') &&
      isSeparator(next);

    if (!isTable) {
      current.push(line);
      continue;
    }

    const header = line;
    const separator = next;
    const rows = [];

    i += 2;

    while (
      i < lines.length &&
      lines[i].trim() !== '' &&
      lines[i].includes('|')
    ) {
      rows.push(lines[i]);
      i++;
    }

    i--;

    if (rows.length <= maxRows) {
      current.push(
        header,
        separator,
        ...rows
      );

      continue;
    }

    flush();

    for (
      let start = 0;
      start < rows.length;
      start += maxRows
    ) {
      const group = rows.slice(
        start,
        start + maxRows
      );

      result.push([
        header,
        separator,
        ...group
      ].join('\n'));
    }
  }

  flush();

  return result.filter(chunk => chunk.trim());
}

/**
 * Reúne tabelas consecutivas geradas pela divisão.
 */
function mergeAdjacentTables(root) {
  for (const table of [...root.querySelectorAll('table')]) {
    let next = table.nextElementSibling;

    while (next?.tagName === 'TABLE') {
      const firstRow = table.tHead?.rows[0];
      const nextRow = next.tHead?.rows[0];

      if (
        !firstRow ||
        !nextRow ||
        firstRow.cells.length !== nextRow.cells.length
      ) {
        break;
      }

      const destination =
        table.tBodies[0] || table.createTBody();

      const source = next.tBodies[0];

      if (source) {
        while (source.firstElementChild) {
          destination.appendChild(
            source.firstElementChild
          );
        }
      }

      const remove = next;
      next = next.nextElementSibling;
      remove.remove();
    }
  }
}

function applyTableClasses(root) {
  for (const table of root.querySelectorAll('table')) {
    table.classList.add(
      'table',
      'table-bordered',
      'w-100'
    );
  }
}

/**
 * Coloca cada tabela dentro de um .table-responsive (Bootstrap):
 * se a tabela for mais larga que a tela, ela rola na horizontal
 * dentro do próprio quadro, sem esticar a página.
 */
function wrapTables(root) {
  for (const table of root.querySelectorAll('table')) {
    if (table.parentElement?.classList.contains('table-responsive')) {
      continue;
    }

    const wrapper = table.ownerDocument.createElement('div');

    wrapper.className = 'table-responsive';

    table.replaceWith(wrapper);

    wrapper.appendChild(table);
  }
}

export default {
  stage: ['before', 'after'],

  before(markdown, options = {}) {
    const maxRows = options.tableRows ?? 5;

    if (
      !Number.isInteger(maxRows) ||
      maxRows < 1
    ) {
      throw new RangeError(
        'tableRows precisa ser um inteiro maior que zero.'
      );
    }

    return splitLongMarkdownTables(
      markdown,
      maxRows
    ).join('\n\n');
  },

  after(root) {
    mergeAdjacentTables(root);
    applyTableClasses(root);
    wrapTables(root);
  }
};