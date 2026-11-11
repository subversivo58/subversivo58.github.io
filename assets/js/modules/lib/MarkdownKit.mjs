/**
 * MarkdownKit.mjs
 * Carrega a MarkdownWasm e registra as extensões uma única vez.
 *
 * Uso:
 *   const { renderMarkdown, renderMarkdownURL, ParseFlags } = await loadMarkdown()
 *
 *   const html = await renderMarkdownURL('./docs/donations.md', {
 *       extensions: ['tables', 'images', 'anchors', 'externalLinks', 'blockAttributes']
 *   })
 *
 * Tudo é carregado sob demanda (import dinâmico): as páginas que não
 * mostram Markdown não baixam o WASM.
 */

let kit = null;

export function loadMarkdown() {
  if (!kit) {
    kit = (async () => {
      const lib = await import('./MarkdownWasm.mjs');

      const {
        registerMarkdownExtensions,
        getRegisteredMarkdownExtensions
      } = await import('../vendor/markdown-wasm/extensions/Registry.mjs');

      const { markdownExtensions } =
        await import('../vendor/markdown-wasm/extensions/Exporter.mjs');

      // Registrar duas vezes gera erro: só registra se estiver vazio
      if (!getRegisteredMarkdownExtensions().size) {
        registerMarkdownExtensions(markdownExtensions);
      }

      return {
        renderMarkdown: lib.renderMarkdown,
        renderMarkdownURL: lib.renderMarkdownURL,
        ParseFlags: lib.ParseFlags
      };
    })().catch(error => {
      // Permite tentar de novo se o carregamento falhar
      kit = null;

      throw error;
    });
  }

  return kit;
}
