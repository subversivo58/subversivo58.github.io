![Gráfico](assets/media/image/graph.webp)

### Tabelas alinhadas

Tabelas com alinhamento diferente por coluna são um bom teste para o CSS. Texto à esquerda, valores no centro e números à direita são combinações comuns em relatórios, comparativos e listas de preços. Este post reúne três tabelas, da mais simples à mais difícil.

#### Alinhamento por coluna

A primeira tabela alinha a primeira coluna à esquerda, a segunda ao centro e a terceira à direita:

| Dispositivo | Tela (pol.) | Preço (R$) |
| :---------- | :---------: | ---------: |
| Celular     | 6,3         | 1.200      |
| Tablet      | 10,1        | 2.400      |
| Notebook    | 15,6        | 3.800      |
| Monitor     | 24,0        | 1.100      |

Valores numéricos alinhados à direita facilitam a comparação, porque as casas decimais ficam umas sobre as outras.

#### Tabela com formatação interna

Dentro das células também podem aparecer estilos de texto:

| Recurso | Descrição | Situação |
| :------ | :-------- | :------: |
| `fetch` | Busca arquivos pela rede | **Pronto** |
| `IndexedDB` | Guarda dados no navegador | *Em teste* |
| ~~jQuery~~ | Biblioteca antiga de scripts | Removido |
| [Markdown](https://example.com) | Formato dos posts | **Pronto** |

> Uma tabela bem feita conta uma história em poucos segundos, e uma tabela mal feita faz o leitor desistir antes de começar.

#### Tabela larga

A última tabela é larga de propósito, para forçar o caso em que o conteúdo não cabe na tela do celular:

| Coluna A | Coluna B | Coluna C | Coluna D | Coluna E | Coluna F | Coluna G | Coluna H |
| -------- | -------- | -------- | -------- | -------- | -------- | -------- | -------- |
| Valor 1  | Valor 2  | Valor 3  | Valor 4  | Valor 5  | Valor 6  | Valor 7  | Valor 8  |
| Valor 9  | Valor 10 | Valor 11 | Valor 12 | Valor 13 | Valor 14 | Valor 15 | Valor 16 |
| Valor 17 | Valor 18 | Valor 19 | Valor 20 | Valor 21 | Valor 22 | Valor 23 | Valor 24 |

Em telas pequenas, essa tabela deve rolar na horizontal dentro do próprio container, sem fazer a página inteira ganhar uma barra de rolagem lateral.

#### Checklist de teste

- [ ] A tabela alinhada mantém cada coluna no lado certo?
- [ ] As células com negrito, itálico, código e link aparecem formatadas?
- [ ] A tabela larga rola na horizontal sem vazar?
- [ ] Há espaço entre as tabelas e os textos ao redor?

Se todos os itens estiverem marcados, o suporte a tabelas está pronto para uso.
