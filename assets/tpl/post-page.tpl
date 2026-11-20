<!--
  @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
  @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
  @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
-->
<!DOCTYPE html>
<html lang="pt-BR" class="i18n-loading">
<head>
    <title>Subversivo58 | {{post_title}}</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="{{post_description}}">
    <meta name="keywords" content="{{post_keywords}}">
    <meta name="author" content="Subversivo58">
    <meta name="route" content="post">
    <meta name="post-slug" content="{{post_slug}}">
    <meta name="post-author" content="{{post_author}}">
    <meta name="DEBUG" content="false">
    <meta name="reply-to" content="https://github.com/subversivo58/subversivo58.github.io/issues/new">
    <link rel="copyright" href="/copyright.html">
    <link rel="canonical" href="{{post_url}}">
    <!-- Twitter Open Graph -->
    <meta name="twitter:site" content="@subversivo58">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Subversivo58 | {{post_title}}">
    <meta name="twitter:description" content="{{post_description}}">
    <meta name="twitter:image" content="{{post_image}}">
    <!-- Open Graph -->
    <meta property="og:url" content="{{post_url}}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="Subversivo58 | {{post_title}}">
    <meta property="og:description" content="{{post_description}}">
    <meta property="og:image" content="{{post_image}}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="720">
    <meta property="article:published_time" content="{{post_published_iso}}">
    <meta property="article:modified_time" content="{{post_modified_iso}}">
    <link rel="icon" href="/favicon.ico" type="image/webp">
    <!-- Preload -->
    <link rel="modulepreload" href="/assets/js/setup.mjs">
    <link rel="stylesheet" type="text/css" href="/assets/vendor/bootstrapv4/bootstrap.min.css">
    <link rel="stylesheet" type="text/css" href="/assets/css/main.css">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#1ebfff">
    <!-- NOSCRIPT -->
    <noscript>
        <meta http-equiv="refresh" content="0;url=/nojs.html">
    </noscript>
</head>
<body id="body">
    <!-- CONTENT CONTAINER -->
    <section id="index-central-block" class="container-fluid px-0 py-5 fill-height">
        <div class="container">
            <nav aria-label="breadcrumb" class="mb-3">
                <ol class="breadcrumb bg-transparent px-0 py-1 mb-0 small">
                    <li class="breadcrumb-item">
                        <a href="/" class="i18n" data-i18n-html="navbar.home">Início</a>
                    </li>
                    <li class="breadcrumb-item">
                        <a href="/blog.html" class="i18n" data-i18n-html="navbar.blog">Blog</a>
                    </li>
                    <li class="breadcrumb-item active text-truncate" aria-current="page">{{post_title}}</li>
                </ol>
            </nav>

            <header class="mb-4">
                <h1 class="h2 font-weight-bold mb-2">{{post_title}}</h1>
                <div id="post-author-container" class="mb-2 d-none" data-author-id="{{post_author}}"></div>
                <div class="small text-muted blog-post-meta">
                    <div>
                        <time datetime="{{post_published_iso}}">{{post_date_formatted}}</time>
                        <span class="mx-1" aria-hidden="true">·</span>
                        <span data-post-reading-time="{{post_reading_time}}">{{post_reading_time_text}}</span>
                    </div>
                    {{post_updated_html}}
                </div>
            </header>

            <article class="text-break markdown-body post-content">
<!-- POST_CONTENT_START -->
{{post_content}}
<!-- POST_CONTENT_END -->
            </article>

            <div class="alert alert-light border small d-flex align-items-center mt-4 mb-0" role="note">
                <picture class="mr-3 flex-shrink-0">
                    <img src="/assets/media/image/1x1.gif"
                         data-src="/assets/media/image/logos/cc-by-sa-4.0.png"
                         data-lazy-target
                         alt="CC BY-SA 4.0"
                         width="88"
                         height="31">
                </picture>
                <span class="i18n" data-i18n-html="blog.license"></span>
            </div>

            <footer class="mt-4">
                {{post_tags_html}}
            </footer>

            <hr class="my-4">
            <div class="d-flex flex-wrap justify-content-between align-items-center mb-4">
                <a href="/blog.html" class="i18n btn btn-outline-secondary btn-sm rounded-0" data-i18n-html="blog.back_to_blog">Voltar para o blog</a>
            </div>
        </div>
    </section>

    <!-- CODE COPY TEMPLATE -->
    <template id="code-copy-wrapper-template">
        <div class="code-container">
            <button type="button" class="i18n code-copy-button" data-code-copy data-i18n-title="blog.copy_code" title="Copiar código">⧉</button>
        </div>
    </template>

    <section class="row container-fluid px-0 mx-0">
        <span class="bg-green-special col progress-slim-0 m-0 lh-75"></span>
        <span class="bg-blue col progress-slim"></span>
        <span class="bg-red col progress-slim"></span>
        <span class="bg-aqua col progress-slim"></span>
        <span class="bg-yellowgreen col progress-slim"></span>
    </section>

    <!-- FOOTER -->
    <footer id="footer-container" class="container-fluid px-0">
        <section id="foothead" class="container-fluid d-none">
            <div class="row">
                <h2 id="footer-fh-title" class="col-12 h3 ct"></h2>
                <p id="footer-fh-content" class="mt-2 col-md-10 mx-auto ct"></p>
            </div>
            <div class="mt-3 row">
                <div id="footer-fh-img" data-lazy-target class="col-12 col-md-10 col-lg-8 mx-auto"></div>
            </div>
        </section>
        <section id="footbody" data-lazy-target class="container-fluid">
            <div class="row">
                <div class="col-sm-6 col-md-4 col-lg-3 widget-column">
                    <div class="row">
                        <picture class="col">
                            <img alt="Brand" src="/assets/media/image/1x1.gif"
                                 data-src="/assets/media/image/logos/site-logo@500x100.webp"
                                 data-lazy-target width="300" height="50"
                                 class="img-fluid w-100 cp">
                        </picture>
                    </div>
                    <div class="mt-2 row">
                        <p class="col white ct">©️ 2010 - 2026 Subversivo58 ®️</p>
                    </div>
                    <div class="mt-3 row">
                        <p data-i18n-html="footer.content.desc1" class="i18n col-12 ct"></p>
                        <div class="col alert alert-info rounded-0 mx-3 p-2 ct">
                            <small data-i18n-html="footer.content.desc2" class="i18n mb-0"></small>
                        </div>
                    </div>
                </div>
                <div class="col-12 my-5 d-sm-none dropdown-divider"></div>
                <div class="col-sm-6 col-md-4 col-lg-3 widget-column">
                    <span id="general-contact" data-i18n-html="footer.content.contactnf" class="i18n white"></span>
                    <div class="mt-3 col px-0">
                        <small class="col-1 ct pl-0">🏢</small>
                        <small class="col pl-0"><a href="https://www.google.com/search?q=@subversivo58" target="_blank" rel="noopener">Subversivo58</a></small>
                    </div>
                    <div class="col mt-3 px-0">
                        <small class="col-1 ct pl-0">🗺️</small>
                        <small class="col pl-0"><a href="geo:Porto Alegre, RS - Brasil">Porto Alegre, RS - Brasil</a></small>
                    </div>
                    <div class="col mt-3 px-0">
                        <small class="col-1 ct pl-0">📧</small>
                        <small class="col pl-0"><a href="mailto:subversivo58@gmail.com?subject=Contact" rel="nofollow">subversivo58@gmail.com</a></small>
                    </div>
                    <div class="col mt-3 px-0">
                        <small class="col-1 ct pl-0">📱</small>
                        <small class="col pl-0"><a href="tel:+5551984419162">+55 (51) 98441-9162</a></small>
                    </div>
                    <div class="col mt-3 px-0">
                        <small class="col-1 ct pl-0">🧭</small>
                        <small class="col pl-0"><a href="geo:-30.0397,-51.2382">-30.0397,-51.2382</a></small>
                    </div>
                    <div class="mt-3 row ct">
                        <figure class="col mb-0">
                            <a href="https://www.openstreetmap.org/#map=12/-30.0397/-51.2382" target="_blank" rel="noopener">
                                <img alt="geo map" src="/assets/media/image/1x1.gif"
                                     data-src="/assets/media/image/poa-osm-print.webp"
                                     data-lazy-target width="285" height="165"
                                     class="img-fluid w-100 cp">
                            </a>
                            <figcaption class="bg-white">
                                ©️ <a class="tdu contrast" href="//www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> contributors
                            </figcaption>
                        </figure>
                    </div>
                </div>
                <div class="col-12 my-5 d-md-none dropdown-divider"></div>
                <div class="col-sm-6 col-md-4 col-lg-3 widget-column">
                    <span data-i18n-html="footer.content.blognew" class="i18n white"></span>
                    <div id="dinamic-footer-news" class="col px-0"></div>
                </div>
                <div class="col-12 my-5 d-sm-none d-md-block d-lg-none dropdown-divider"></div>
                <div class="col-sm-6 col-md-4 col-lg-3 widget-column">
                    <span data-i18n-html="footer.content.uselink" class="i18n white"></span>
                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="/about.html">
                            <small class="col-1 px-0">❔</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="footer.about"></small>
                        </a>
                    </div>
                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="/copyright.html">
                            <small class="col-1 px-0">©️</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="combo.copyr"></small>
                        </a>
                    </div>
                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="/docs/">
                            <small class="col-1 px-0">📖</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="footer.content.docs"></small>
                        </a>
                    </div>
                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="/policy.html">
                            <small class="col-1 px-0">📃</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="footer.content.policies"></small>
                        </a>
                    </div>
                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="/dpo.html">
                            <small class="col-1 px-0">🛡️</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="footer.content.dpo"></small>
                        </a>
                    </div>
                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="::" data-fix-modal="#modal-feedback">
                            <small class="col-1 px-0">📣</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="footer.content.feedback"></small>
                        </a>
                    </div>
                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="https://github.com/subversivo58/subversivo58.github.io" target="_blank" rel="noopener">
                            <small class="col-1 px-0">🍴</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="footer.content.source"></small>
                        </a>
                    </div>
                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="::" data-fix-modal="#modal-bugs-report">
                            <small class="col-1 px-0">🐛</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="footer.content.bugs"></small>
                        </a>
                    </div>
                </div>
            </div>
        </section>
    </footer>
    <!-- JAVASCRIPT RESOURCES -->
    <script type="module" src="/assets/js/setup.mjs"></script>
</body>
</html>
