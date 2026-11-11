![Gráfico](assets/media/image/graph.webp)

### Blocos de código

Blogs de tecnologia vivem de exemplos de código, e um bom sistema precisa exibi-los sem quebrar o layout. Linhas muito longas, indentação e caracteres especiais como `<`, `>` e `&` costumam ser os pontos que mais dão problema. Este post reúne trechos em várias linguagens para testar tudo isso.

#### JavaScript

Um exemplo de como carregar um arquivo Markdown e inseri-lo na página:

```javascript
async function carregarPost(id) {
  const resposta = await fetch(`assets/posts/${id}.md`);

  if (!resposta.ok) {
    throw new Error(`Post não encontrado: ${id}`);
  }

  const markdown = await resposta.text();
  const html = parseMarkdown(markdown);

  document.querySelector("#post").innerHTML = html;
}

const id = location.hash.slice(1);
carregarPost(id).catch((erro) => console.error(erro));
```

O trecho lê a hash do endereço, busca o arquivo correspondente e renderiza o resultado. Se o arquivo não existir, o erro é registrado no console.

#### CSS

Estilos básicos para deixar imagens fluidas dentro do post:

```css
.post img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1rem auto;
  border-radius: 8px;
}

.post pre {
  overflow-x: auto;
  padding: 1rem;
}
```

#### HTML

Um exemplo de estrutura de página, com caracteres especiais que precisam ser escapados:

```html
<article class="post">
  <h3>Título do post</h3>
  <p>Texto com <strong>destaque</strong> &amp; símbolos.</p>
</article>
```

#### Terminal

Comandos de Git para publicar uma alteração:

```bash
git add assets/posts/
git commit -m "novo post de teste"
git push origin main
```

#### JSON

O formato de cada item do índice de artigos:

```json
{
  "id": "post-04",
  "title": "Blocos de código",
  "date": 1793232000,
  "tags": ["teste", "código"]
}
```

#### Código em linha

Nem todo código precisa de bloco. Funções como `fetch()`, propriedades como `innerHTML` e comandos como `git status` aparecem no meio das frases, e o estilo deles deve diferenciar do texto comum sem quebrar a linha.

> Código é texto que precisa ser lido por pessoas e executado por máquinas, nessa ordem.

Se os blocos acima rolaram na horizontal em vez de estourar a largura da tela, o CSS está certo.
