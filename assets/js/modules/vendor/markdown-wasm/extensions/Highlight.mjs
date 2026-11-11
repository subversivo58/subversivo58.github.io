/**
 * Highlight.mjs
 * Destaque de sintaxe para blocos de código, sem biblioteca externa.
 *
 * Uso no Markdown (o nome depois das três crases escolhe a linguagem):
 *
 *   ```javascript
 *   const a = 1
 *   ```
 *
 * Linguagens: javascript (js), typescript (ts), css, html (xml, svg),
 * json e bash (sh, shell). Sem nome ou com nome desconhecido o bloco
 * fica como está.
 *
 * O resultado são <span class="hl-..."> dentro do <code>. As cores
 * ficam no main.css (seção SYNTAX HIGHLIGHT).
 *
 * Para criar outra linguagem: uma gramática é só uma lista de regras
 * { re, cls, when, enter, nested } (veja jsonGrammar, a menor).
 *   re      regex com a flag "y" (sticky): casa exatamente na posição atual
 *   cls     nome da classe (hl-<cls>), ou função (valor, estado, texto, fim)
 *           que devolve o nome; null/'' deixa o trecho sem cor
 *   when    (estado, ultimoCaractere) => boolean: só tenta a regra se true
 *   enter   (estado, valor) => void: atualiza o estado ao casar
 *   nested  (estado) => 'js' | 'css': destaca o trecho com outra gramática
 */

function words(list) {
  return new Set(list.split(/\s+/));
}

/**
 * Confere se logo depois da posição "end" vem o padrão (regex sticky).
 */
function followedBy(text, end, pattern) {
  pattern.lastIndex = end;

  return pattern.test(text);
}

/* ------------------------------------------------------------------ */
/* JavaScript / TypeScript                                            */
/* ------------------------------------------------------------------ */

const JS_KEYWORDS = words(
  'as async await break case catch class const continue debugger ' +
  'default delete do else export extends finally for from function ' +
  'if import in instanceof let new of return static super switch ' +
  'this throw try typeof var void while with yield'
);

const TS_KEYWORDS = words(
  'interface type enum implements readonly public private protected ' +
  'abstract namespace declare keyof infer is satisfies'
);

const JS_LITERALS = words('true false null undefined NaN Infinity');

const JS_BUILTINS = words(
  'console window document globalThis Math JSON Object Array String ' +
  'Number Boolean Date Promise Map Set WeakMap WeakSet Symbol Error ' +
  'RegExp fetch setTimeout setInterval clearTimeout clearInterval ' +
  'parseInt parseFloat require module exports process localStorage ' +
  'sessionStorage navigator location'
);

function jsGrammar(typescript) {
  return {
    rules: [
      // comentários
      {
        re: /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y,
        cls: 'comment'
      },

      // textos: "...", '...' e `...`
      {
        re: /"(?:\\[\s\S]|[^"\\\n])*"?|'(?:\\[\s\S]|[^'\\\n])*'?|`(?:\\[\s\S]|[^`\\])*`?/y,
        cls: 'string'
      },

      // regex literal (só quando "/" não pode ser divisão)
      {
        re: /\/(?![*\/])(?:\\.|\[(?:\\.|[^\]\\\n])*\]|[^\/\\\n\[])+\/[a-z]*/y,
        cls: 'regex',
        when: (state, last) => !/[\w$)\]]/.test(last)
      },

      // palavras: keyword, literal, builtin, Classe, função(
      {
        re: /[A-Za-z_$][\w$]*/y,
        cls: (value, state, text, end) => {
          if (
            JS_KEYWORDS.has(value) ||
            (typescript && TS_KEYWORDS.has(value))
          ) {
            return 'keyword';
          }

          if (JS_LITERALS.has(value)) return 'literal';

          if (JS_BUILTINS.has(value)) return 'builtin';

          if (/^[A-Z][a-z]/.test(value)) return 'class';

          if (followedBy(text, end, /\s*\(/y)) return 'function';

          return null;
        }
      },

      // números
      {
        re: /0[xX][\da-fA-F_]+n?|0[bB][01_]+n?|0[oO][0-7_]+n?|(?:\d[\d_]*\.?\d*|\.\d+)(?:[eE][+-]?\d+)?n?/y,
        cls: 'number'
      }
    ]
  };
}

/* ------------------------------------------------------------------ */
/* CSS                                                                */
/* ------------------------------------------------------------------ */

const cssGrammar = {
  init: () => ({ depth: 0, paren: 0, atrule: false }),

  rules: [
    {
      re: /\/\*[\s\S]*?(?:\*\/|$)/y,
      cls: 'comment'
    },
    {
      re: /"(?:\\[\s\S]|[^"\\\n])*"?|'(?:\\[\s\S]|[^'\\\n])*'?/y,
      cls: 'string'
    },

    // @media, @import, @keyframes...
    {
      re: /@[\w-]+/y,
      cls: 'keyword',
      enter: state => { state.atrule = true; }
    },

    // controle de { } ( ) ;  (sem cor, só atualizam o estado)
    {
      re: /\{/y,
      cls: null,
      enter: state => { state.depth++; state.atrule = false; }
    },
    {
      re: /\}/y,
      cls: null,
      enter: state => { state.depth = Math.max(0, state.depth - 1); }
    },
    {
      re: /;/y,
      cls: null,
      enter: state => { state.atrule = false; }
    },
    {
      re: /\(/y,
      cls: null,
      enter: state => { state.paren++; }
    },
    {
      re: /\)/y,
      cls: null,
      enter: state => { state.paren = Math.max(0, state.paren - 1); }
    },

    { re: /!\s*important\b/y, cls: 'keyword' },

    // #fff dentro de um bloco
    {
      re: /#[\da-fA-F]{3,8}\b/y,
      cls: 'number',
      when: state => state.depth > 0
    },

    // seletores fora dos blocos: .classe #id :hover tag
    {
      re: /[.#][\w-]+/y,
      cls: 'selector',
      when: state => state.depth === 0 && state.paren === 0 && !state.atrule
    },
    {
      re: /::?[\w-]+/y,
      cls: 'attr',
      when: state => state.depth === 0 && state.paren === 0 && !state.atrule
    },

    // palavras: propriedade, função(), tag
    {
      re: /-{0,2}[A-Za-z_][\w-]*/y,
      cls: (value, state, text, end) => {
        if (state.depth > 0 || state.paren > 0) {
          if (followedBy(text, end, /\s*:(?!:)/y)) return 'property';

          if (followedBy(text, end, /\(/y)) return 'function';

          return null;
        }

        if (state.atrule) return null;

        return 'tag';
      }
    },

    // 12px  .5s  1.5  50%
    {
      re: /[+-]?(?:\d*\.)?\d+(?:%|[A-Za-z]+)?/y,
      cls: 'number'
    }
  ]
};

/* ------------------------------------------------------------------ */
/* HTML                                                               */
/* ------------------------------------------------------------------ */

const htmlGrammar = {
  init: () => ({ inTag: false, raw: null, pendingRaw: null }),

  rules: [
    // conteúdo de <script> e <style>: destaca como JS ou CSS
    {
      re: /[\s\S]*?(?=<\/(?:script|style)\b|$)/y,
      nested: state => (state.raw === 'script' ? 'js' : 'css'),
      when: state => !!state.raw && !state.inTag
    },

    {
      re: /<!--[\s\S]*?(?:-->|$)/y,
      cls: 'comment',
      when: state => !state.inTag
    },

    // <!DOCTYPE html>
    {
      re: /<![A-Za-z][^>]*>?/y,
      cls: 'keyword',
      when: state => !state.inTag
    },

    // <div   </div
    {
      re: /<\/?[A-Za-z][\w:.-]*/y,
      cls: 'tag',
      when: state => !state.inTag,
      enter: (state, value) => {
        state.inTag = true;

        const name = value.replace(/^<\/?/, '').toLowerCase();

        if (value.startsWith('</')) {
          state.raw = null;
          state.pendingRaw = null;
        } else {
          state.pendingRaw =
            name === 'script' || name === 'style' ? name : null;
        }
      }
    },

    // > ou />
    {
      re: /\/?>/y,
      cls: 'tag',
      when: state => state.inTag,
      enter: (state, value) => {
        state.inTag = false;

        if (state.pendingRaw && !value.startsWith('/')) {
          state.raw = state.pendingRaw;
        }

        state.pendingRaw = null;
      }
    },

    // dentro da tag: "valor" e nome-do-atributo
    {
      re: /"[^"]*"?|'[^']*'?/y,
      cls: 'string',
      when: state => state.inTag
    },
    {
      re: /[^\s"'<>\/=]+/y,
      cls: 'attr',
      when: state => state.inTag
    },

    // &amp; &#39;
    {
      re: /&#?\w+;/y,
      cls: 'number',
      when: state => !state.inTag
    }
  ]
};

/* ------------------------------------------------------------------ */
/* JSON                                                               */
/* ------------------------------------------------------------------ */

const jsonGrammar = {
  rules: [
    {
      re: /\/\/[^\n]*|\/\*[\s\S]*?(?:\*\/|$)/y,
      cls: 'comment'
    },
    {
      // "chave": vira property; "valor" vira string
      re: /"(?:\\[\s\S]|[^"\\\n])*"?/y,
      cls: (value, state, text, end) =>
        followedBy(text, end, /\s*:/y) ? 'property' : 'string'
    },
    {
      re: /-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/y,
      cls: 'number'
    },
    {
      re: /\b(?:true|false|null)\b/y,
      cls: 'literal'
    }
  ]
};

/* ------------------------------------------------------------------ */
/* Bash / shell                                                       */
/* ------------------------------------------------------------------ */

const BASH_KEYWORDS = words(
  'if then else elif fi for while until do done case esac in function ' +
  'select time return exit break continue export local readonly declare ' +
  'unset source alias'
);

const BASH_COMMANDS = words(
  'cd ls cat echo grep sed awk find git npm npx node yarn pnpm python ' +
  'python3 pip pip3 sudo chmod chown mkdir rm cp mv touch curl wget tar ' +
  'zip unzip ssh scp docker make cargo go java javac apt apt-get brew ' +
  'kill ps man head tail sort uniq wc xargs tee vim nano'
);

const bashGrammar = {
  rules: [
    // # comentário (só no começo ou depois de espaço)
    {
      re: /(?<=^|\s)#[^\n]*/y,
      cls: 'comment'
    },
    {
      re: /"(?:\\[\s\S]|[^"\\])*"?|'[^']*'?/y,
      cls: 'string'
    },
    // $VAR  ${VAR}  $1  $?
    {
      re: /\$(?:\{[^}\n]*\}?|[A-Za-z_]\w*|[@#?*$!\d-])/y,
      cls: 'variable'
    },
    // -f  --flag  --flag=valor
    {
      re: /(?<=\s)-{1,2}[A-Za-z][\w-]*/y,
      cls: 'attr'
    },
    {
      re: /[A-Za-z_][\w.-]*/y,
      cls: value => {
        if (BASH_KEYWORDS.has(value)) return 'keyword';

        if (BASH_COMMANDS.has(value)) return 'function';

        return null;
      }
    },
    {
      re: /\d+/y,
      cls: 'number'
    }
  ]
};

/* ------------------------------------------------------------------ */
/* Catálogo                                                           */
/* ------------------------------------------------------------------ */

const GRAMMARS = {
  js: jsGrammar(false),
  ts: jsGrammar(true),
  css: cssGrammar,
  html: htmlGrammar,
  json: jsonGrammar,
  bash: bashGrammar
};

// Nome escrito depois das três crases -> gramática
const ALIASES = {
  javascript: 'js',
  js: 'js',
  mjs: 'js',
  cjs: 'js',
  jsx: 'js',
  node: 'js',
  typescript: 'ts',
  ts: 'ts',
  tsx: 'ts',
  css: 'css',
  html: 'html',
  htm: 'html',
  xml: 'html',
  svg: 'html',
  json: 'json',
  jsonc: 'json',
  bash: 'bash',
  sh: 'bash',
  shell: 'bash',
  zsh: 'bash'
};

/* ------------------------------------------------------------------ */
/* Tokenizador                                                        */
/* ------------------------------------------------------------------ */

/**
 * Percorre o texto uma vez e devolve [[classe|null, trecho], ...].
 * Em cada posição vale a primeira regra que casar.
 */
function tokenize(text, grammar) {
  const state = grammar.init ? grammar.init() : {};

  const tokens = [];

  let plain = '';
  let last = '';
  let i = 0;

  const flush = () => {
    if (plain) {
      tokens.push([null, plain]);

      plain = '';
    }
  };

  while (i < text.length) {
    let matched = false;

    for (const rule of grammar.rules) {
      if (rule.when && !rule.when(state, last)) continue;

      rule.re.lastIndex = i;

      const match = rule.re.exec(text);

      if (!match || !match[0]) continue;

      const value = match[0];
      const end = i + value.length;

      if (rule.enter) rule.enter(state, value);

      if (rule.nested) {
        flush();

        tokens.push(...tokenize(value, GRAMMARS[rule.nested(state)]));
      } else {
        const cls = typeof rule.cls === 'function'
          ? rule.cls(value, state, text, end)
          : rule.cls;

        if (cls) {
          flush();

          tokens.push([cls, value]);
        } else {
          plain += value;
        }
      }

      last = value.trim().slice(-1) || last;

      i = end;

      matched = true;

      break;
    }

    if (!matched) {
      plain += text[i];

      if (!/\s/.test(text[i])) last = text[i];

      i++;
    }
  }

  flush();

  return tokens;
}

/**
 * Monta os nós com textContent: nada do código vira HTML.
 */
function render(tokens) {
  const fragment = document.createDocumentFragment();

  for (const [cls, text] of tokens) {
    if (!cls) {
      fragment.append(text);

      continue;
    }

    const span = document.createElement('span');

    span.className = `hl-${cls}`;

    span.textContent = text;

    fragment.append(span);
  }

  return fragment;
}

/* ------------------------------------------------------------------ */
/* Extensão                                                           */
/* ------------------------------------------------------------------ */

export default {
  stage: ['after'],

  after(root) {
    for (const code of root.querySelectorAll('pre > code')) {
      const match = /(?:^|\s)language-(\S+)/.exec(code.className);

      if (!match) continue;

      const language = ALIASES[match[1].toLowerCase()];

      if (!language) continue;

      code.replaceChildren(
        render(tokenize(code.textContent, GRAMMARS[language]))
      );

      code.classList.add('hl');

      code.parentElement.setAttribute('data-lang', language);
    }
  }
};
