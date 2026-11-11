![Gráfico](assets/media/image/graph.webp)

### Tudo junto

Este é o último post da série e mistura quase tudo o que foi testado nos anteriores. A ideia é simular um artigo real, com texto corrido, subtítulos, citações, listas, tabela, código e imagens, para ver como o sistema se comporta quando o conteúdo é variado.

#### Introdução

Construir um blog do zero é um projeto que ensina muito. Você precisa pensar em estrutura de páginas, carregamento de arquivos, interpretação de Markdown, armazenamento local e publicação. Cada parte parece simples isolada, mas o conjunto exige organização e paciência.

Um **bom começo** é dividir o projeto em etapas pequenas. Primeiro, mostrar um post na tela. Depois, listar vários posts. Por fim, criar uma forma de escrever e publicar sem sair do navegador. Cada etapa entrega algo funcionando e dá ânimo para seguir.

> Teste final: se este post renderizou certo, os outros nove provavelmente também.

#### Planejamento

Um resumo do que o projeto precisa ter:

- Página inicial com a lista de postagens
- Página de leitura com o post completo
- Posts anteriores e posteriores logo abaixo
- Editor de Markdown com pré-visualização
- Rascunhos salvos no navegador

E uma ordem sugerida de trabalho:

1. Carregar e exibir um único post
2. Montar o índice de artigos
3. Criar a listagem na página inicial
4. Fazer a navegação entre posts
5. Construir o editor e os rascunhos

#### Situação do projeto

| Etapa | Descrição | Situação |
| :---- | :-------- | :------: |
| Leitura | Carregar e exibir posts | **Pronto** |
| Listagem | Mostrar os últimos posts | *Em andamento* |
| Editor | Escrever e publicar | Planejado |
| Publicação | GitHub Pages | Planejado |

#### Um trecho de código

A função abaixo busca um post, converte o Markdown e insere o resultado na página:

```javascript
async function mostrarPost(id) {
  const resposta = await fetch(`assets/posts/${id}.md`);
  const texto = await resposta.text();

  document.querySelector("#post").innerHTML = parseMarkdown(texto);
}
```

Nada impede de usar `parseMarkdown` com qualquer biblioteca, desde que ela aceite tabelas e HTML misturado ao texto.

#### Imagem no meio do texto

A imagem abaixo deve ser fluida, ocupando no máximo a largura do container, tanto no celular quanto no desktop:

![Gráfico repetido](assets/media/image/graph.webp)

Se ela ficou do tamanho certo e sem vazar, o teste de imagens passou.

---

#### Conclusão

Chegamos ao fim da série de testes. Foram dez postagens diferentes, com textos curtos e longos, tabelas, citações, listas, código e HTML. Agora é hora de ver onde o layout precisa de ajuste e seguir construindo.

Obrigado por rolar até aqui.
