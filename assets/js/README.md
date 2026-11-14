## Directory of scripts

**structure**:


```none
|-- setup.mjs (entry point loaded by the pages: loads the settings (config/settings.json) and imports and initializes all the other modules)
|
|-- /modules (ES6 modules)
      |
      |-- /core
      |     |-- LifeCycle.mjs (application life cycle manager, inspired by the Android LifeCycle)
      |
      |-- /functions
      |     |-- Functions.mjs (functions collection)
      |
      |-- /helpers
      |     |-- BasePrefixes.mjs (execution context detection (browser, Web Worker or Service Worker) and base prefixes for global APIs)
      |     |-- Exporter.mjs (base exportation of the helpers)
      |     |-- Helpers.mjs (utilities collection)
      |
      |-- /lib
      |     |-- AwesomeIndexedDB.mjs (IndexedDB CRUD operations)
      |     |-- AwesomeStorage.mjs (storage utilities, built on AwesomeIndexedDB.mjs)
      |     |-- CryptoHandler.mjs (WebCrypto utilities)
      |     |-- DebugConsole.mjs (mobile `window.console` debugger, enabled by <meta name="DEBUG" content="true">)
      |     |-- Emitter.mjs (event emitter)
      |     |-- Exporter.mjs (base exportation of the lib modules)
      |     |-- GitHubAPI.mjs (wrapper to upload binary files to a GitHub repository, uses the modified GitHub library)
      |     |-- IlibJS.mjs (document translator)
      |     |-- ImageProcessor.mjs (local and independent image processing in the browser)
      |     |-- IndexedLogs.mjs (indexed events log and execution tracking)
      |     |-- LazyLoad.mjs (wrapper for lazy-load with `IntersectionObserver`)
      |     |-- MarkdownKit.mjs (loads MarkdownWasm.mjs and registers the extensions only once, on demand)
      |     |-- MarkdownWasm.mjs (WebAssembly Markdown parser core: WASM initialization, Markdown to HTML conversion, safe splitting of large documents, extensions and DOM rendering)
      |     |-- Notifications.mjs (wrapper for the Notifications API)
      |     |-- Permissions.mjs (utilities for the Permissions API)
      |     |-- WebPush.mjs (Web Push 100% in the browser, Web Crypto API, no dependencies; requires a proxy)
      |
      |-- /models
      |     |-- AdminPosts.mjs (posts management in the administration)
      |     |-- Controller.mjs (permissions controller for cookies and persistent storage, based on PolicyHandler.mjs)
      |     |-- MarkdownEditor.mjs (Markdown editor integrated with the posts system)
      |     |-- PolicyHandler.mjs (policy handler)
      |     |-- PostManager.mjs (management and identification of Markdown posts)
      |     |-- RecentPosts.mjs (recent posts lists: home page carousel and footer summary)
      |     |-- Templates.mjs (HTML templates maker)
      |     |-- UIHandler.mjs (user interface event handlers)
      |
      |-- /vendor
            |-- Cbor-js.mjs (CBOR encoder and decoder, by Patrick Gansterer)
            |-- GitHub.bundle.mjs (GitHub library, rewritten to use native `fetch`)
            |-- bootstrap-native.mjs (Native JavaScript for Bootstrap v3.0.0)
            |
            |-- /Hashids
            |     |-- hashids-es6.mjs (Hashids library, ES module)
            |
            |-- /markdown-wasm
                  |-- markdown-wasm.mjs (JavaScript loader of the Markdown WebAssembly parser)
                  |-- markdown.wasm (compiled WebAssembly Markdown parser)
                  |
                  |-- /extensions (Markdown extensions)
                        |-- Anchors.mjs (custom attributes on Markdown links)
                        |-- BlockAttributes.mjs (custom attributes on Markdown blocks)
                        |-- Exporter.mjs (catalog of the Markdown extensions)
                        |-- ExternalLinks.mjs (default behavior for external links)
                        |-- Highlight.mjs (syntax highlighting for code blocks, without external library)
                        |-- Images.mjs (attributes and classes for Markdown images)
                        |-- Registry.mjs (registration and validation of the extensions)
                        |-- Tables.mjs (handling of long Markdown tables)
                        |-- Utils.mjs (utilities shared by the extensions)
```

## License

This source code is licensed under [MIT License](https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE)

Copyright (c) 2021 Lauro Moraes [[AKA Subversivo58]](https://github.com/subversivo58)

If you believe that the other sources (of third parties) may contain a conflict with this license please contact us in this email: [subversivo58@gmail.com](mailto:subversivo58@gmail.com?subject=LICENSE)
