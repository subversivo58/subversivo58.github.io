![Gráfico](assets/media/image/graph.webp)

### Markdown com HTML

Uma das vantagens do Markdown é que ele aceita HTML puro no meio do texto. Isso permite recursos que a sintaxe simples não oferece, como blocos coloridos, elementos expansíveis e pequenos ajustes de estilo. Este post mistura os dois formatos para testar se o parser respeita cada parte.

#### Bloco de aviso

O bloco abaixo foi escrito inteiramente em HTML, com estilo direto no elemento:

<div style="padding: 12px; border: 1px solid #888; border-radius: 8px;">
  <strong>Aviso:</strong> este bloco está escrito em HTML dentro de um arquivo Markdown. Se ele aparece com borda e cantos arredondados, o parser deixou o HTML passar.
</div>

Depois do bloco, o texto volta ao Markdown normal, com **negrito**, *itálico* e um [link de exemplo](https://example.com). É importante que a transição entre os dois formatos não deixe espaços estranhos nem quebre a formatação do parágrafo seguinte.

#### Elementos de texto

O HTML tem elementos que o Markdown não cobre, e vários deles são úteis em blogs:

- Texto com <mark>destaque amarelo</mark> para chamar atenção
- Fórmulas simples como H<sub>2</sub>O e x<sup>2</sup>
- Atalhos de teclado como <kbd>Ctrl</kbd> + <kbd>C</kbd>
- Abreviações como <abbr title="HyperText Markup Language">HTML</abbr>, com explicação ao passar o mouse

---

A linha horizontal acima separa duas partes do texto. Ela também é Markdown, escrita com três hifens em uma linha sozinha.

#### Conteúdo expansível

O elemento `details` cria uma área que abre e fecha sem nenhum JavaScript:

<details>
  <summary>Clique para expandir</summary>
  <p>Este conteúdo estava escondido. Ele pode ter vários parágrafos, listas e até outros elementos dentro.</p>
  <p>É um recurso útil para respostas de perguntas frequentes ou detalhes técnicos que nem todo leitor precisa ver.</p>
</details>

#### Figura com legenda

<figure>
  <img src="assets/media/image/graph.webp" alt="Gráfico de exemplo" style="max-width: 100%; height: auto;">
  <figcaption>Legenda da figura, escrita com o elemento figcaption do HTML.</figcaption>
</figure>

> Misturar Markdown e HTML é como cozinhar com receita e improviso: a receita dá a base, e o improviso resolve o que ela não previu.

Se tudo acima apareceu corretamente formatado, o parser mescla bem os dois mundos.
