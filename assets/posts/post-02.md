![Gráfico](assets/media/image/graph.webp)

### Tabelas na web

Tabelas são um dos recursos que mais costumam dar problema em sistemas de blog. Elas funcionam bem em telas grandes, mas em celulares podem estourar a largura do container e forçar uma rolagem lateral na página inteira. Este post reúne algumas tabelas de tamanhos diferentes para você testar isso.

#### Formatos de imagem

A primeira tabela compara formatos de imagem muito usados na web. A escolha do formato afeta diretamente o tempo de carregamento de uma página, e em conexões móveis isso faz toda a diferença.

| Formato | Compressão | Transparência | Animação | Uso comum |
| ------- | ---------- | ------------- | -------- | --------- |
| JPEG    | Com perda  | Não           | Não      | Fotografias |
| PNG     | Sem perda  | Sim           | Não      | Capturas de tela, logotipos |
| GIF     | Sem perda  | Parcial       | Sim      | Animações curtas |
| WebP    | Ambas      | Sim           | Sim      | Quase tudo na web moderna |
| SVG     | Vetorial   | Sim           | Sim      | Ícones e ilustrações |

O WebP se tornou uma boa escolha padrão porque entrega arquivos menores que JPEG e PNG com qualidade parecida, e hoje é aceito pelos principais navegadores.

> Otimizar imagens é a melhoria de desempenho mais barata que existe: poucos minutos de trabalho e a página inteira fica mais leve.

#### Navegadores e suporte

A segunda tabela mostra um exemplo fictício de suporte a recursos em navegadores. Os valores não são reais, servem só para ocupar espaço e testar o layout.

| Recurso          | Chrome | Firefox | Safari | Edge |
| ---------------- | ------ | ------- | ------ | ---- |
| IndexedDB        | Sim    | Sim     | Sim    | Sim  |
| Service Worker   | Sim    | Sim     | Sim    | Sim  |
| BroadcastChannel | Sim    | Sim     | Sim    | Sim  |
| WebP             | Sim    | Sim     | Sim    | Sim  |

#### O que observar no teste

Ao abrir este post, vale conferir alguns pontos:

1. As colunas ficam alinhadas e legíveis?
2. A primeira tabela cabe na tela do celular sem vazar do container?
3. Existe espaço entre a tabela e o parágrafo seguinte?
4. O cabeçalho da tabela se diferencia das linhas de dados?

Se algum desses itens falhar, o problema geralmente está no CSS: tabelas precisam de um container com `overflow-x: auto` para rolar na horizontal sem quebrar o resto da página.

Para fechar, mais um parágrafo comum, só para conferir o espaçamento logo abaixo da última lista numerada e garantir que a página tenha comprimento suficiente para rolar com folga.
