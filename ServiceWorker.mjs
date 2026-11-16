
/**
 * @license The MIT License (MIT)             - [https://github.com/Pluggeding/pluggeding.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */

// Imports temporariamente comentados para manter o teste que funcionou.
import AWIndexedDB from './assets/js/modules/lib/AwesomeIndexedDB.mjs';
// import Emitter from './assets/js/modules/Emitter.mjs';

const AdminHTML = `<!--
  @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/main/LICENSE]
  @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
  @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/main/VERSIONING.md]
-->
<!DOCTYPE html>
<html lang="en-US" class="i18n-loading">
<head>
    <title>Subversivo58 | Administração</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <meta name="description" content="Subversivo58 Personal Blog Page">
    <meta name="keywords" content="blog, news, projects, tech, tendences, cyberculture, subversivo58">
    <meta name="author" content="Subversivo58">

    <!-- Simple \`window.console\` debugger -->
    <meta name="DEBUG" content="false">
    <meta name="reply-to" content="https://github.com/subversivo58/subversivo58.github.io/issues/new">

    <link rel="copyright" href="copyright.html">
    <meta name="robots" content="noindex">

    <!-- Twitter Open Graph -->
    <meta name="twitter:site" content="@subversivo58">
    <meta name="twitter:card" content="summary_large_image">

    <!-- Open Graph -->
    <meta property="og:url" content="https://subversivo58.github.io/admin.html">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Subversivo58 | Administração">
    <meta property="og:description" content="Subversivo58 Personal Blog Page">
    <meta property="og:image" content="https://subversivo58.github.io/assets/media/image/graph.webp">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="720">

    <link rel="icon" href="favicon.ico">

    <!-- Preload -->
    <link rel="modulepreload" href="assets/js/setup.mjs">

    <link rel="stylesheet" type="text/css" href="./assets/vendor/bootstrapv4/bootstrap.min.css">
    <link type="text/css" rel="stylesheet" href="assets/css/main.css">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#1ebfff">

    <noscript>
        <meta http-equiv="refresh" content="0;url=nojs.html">
    </noscript>
</head>

<body id="body">

    <!-- CONTENT CONTAINER -->
    <section id="index-central-block" class="container-fluid px-0 py-5 fill-height">
        <!--vertical align on parent using my-auto, horizontal align on self mx-auto- ->
        <div class="row mx-0 fill-height h-100">
        </div>-->
    </section>

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

        <!-- FOOTBODY -->
        <section id="footbody" data-lazy-target class="container-fluid">
            <div class="row">

                <div class="col-sm-6 col-md-4 col-lg-3 widget-column">
                    <div class="row">
                        <picture class="col">
                            <img alt="Brand"
                                 src="./assets/media/image/1x1.gif"
                                 data-src="./assets/media/image/logos/site-logo@500x100.webp" data-lazy-target
                                 width="300" height="50" class="img-fluid w-100 cp">
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

                    <!--
                    <div class="mt-3 row">
                        <a href="./signup" rel="nofollow" class="col ct">
                            <button type="button" class="btn btn-block btn-outline-info rounded-0">
                                <i data-i18n-html="footer.content.start" class="i18n"></i>
                            </button>
                        </a>
                    </div>
                    -->
                </div>

                <div class="col-12 my-5 d-sm-none dropdown-divider"></div>

                <div class="col-sm-6 col-md-4 col-lg-3 widget-column">
                    <span id="general-contact" data-i18n-html="footer.content.contactnf" class="i18n white"></span>

                    <div class="mt-3 col px-0">
                        <small class="col-1 ct pl-0">🏢</small>
                        <small class="col pl-0">
                            <a href="https://www.google.com/search?q=@subversivo58" target="_blank" rel="noopener">Subversivo58</a>
                        </small>
                    </div>

                    <div class="col mt-3 px-0">
                        <small class="col-1 ct pl-0">🗺️</small>
                        <small class="col pl-0">
                            <a href="geo:Porto Alegre, RS - Brasil">Porto Alegre, RS - Brasil</a>
                        </small>
                    </div>

                    <div class="col mt-3 px-0">
                        <small class="col-1 ct pl-0">📧</small>
                        <small class="col pl-0">
                            <a href="mailto:subversivo58@gmail.com?subject=Contact" rel="nofollow">subversivo58@gmail.com</a>
                        </small>
                    </div>

                    <div class="col mt-3 px-0">
                        <small class="col-1 ct pl-0">🌎</small>
                        <small class="col pl-0">
                            <a href="https://subversivo58.github.io/">https://subversivo58.github.io/</a>
                        </small>
                    </div>

                    <div class="col mt-3 px-0">
                        <small class="col-1 ct pl-0">📱</small>
                        <small class="col pl-0">
                            <a href="tel:+5551984419162">+55 (51) 98441-9162</a>
                        </small>
                    </div>

                    <div class="col mt-3 px-0">
                        <small class="col-1 ct pl-0">🧭</small>
                        <small class="col pl-0">
                            <a href="geo:-30.0397,-51.2382">-30.0397,-51.2382</a>
                        </small>
                    </div>

                    <div class="mt-3 row ct">
                        <figure class="col mb-0">
                            <a href="https://www.openstreetmap.org/#map=12/-30.0397/-51.2382" target="_blank" rel="noopener">
                                <img alt="geo map"
                                     src="./assets/media/image/1x1.gif"
                                     data-src="assets/media/image/poa-osm-print.webp" data-lazy-target
                                     width="285" height="165" class="img-fluid w-100 cp">
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
                        <a class="row mx-0 cp" href="./about.html">
                            <small class="col-1 px-0">❔</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="footer.about"></small>
                        </a>
                    </div>

                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="copyright.html">
                            <small class="col-1 px-0">©️</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="combo.copyr"></small>
                        </a>
                    </div>

                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="docs/">
                            <small class="col-1 px-0">📖</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="footer.content.docs"></small>
                        </a>
                    </div>

                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="policy.html">
                            <small class="col-1 px-0">📃</small>
                            <small class="i18n col px-0 ml-2" data-i18n-html="footer.content.policies"></small>
                        </a>
                    </div>

                    <div class="col mt-3 footer-column-bb px-0">
                        <a class="row mx-0 cp" href="./dpo.html">
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

                    <!--
                    <div class="col mt-3 footer-column-bb px-0">
                        <i class="col-1 ct fa fa-group pl-0"></i>
                        <small class="col pl-0">
                            <a href="//forum.himliy.com/">
                                <span data-i18n-html="footer.content.forum" class="i18n"></span>
                                <i class="fr">↗️</i>
                            </a>
                        </small>
                    </div>
                    <div class="col mt-3 footer-column-bb px-0">
                        <i class="col-1 ct fa fa-wrench pl-0"></i>
                        <small class="col pl-0">
                            <a href="//dev.himliy.com/">
                                <span data-i18n-html="footer.content.devtool" class="i18n"></span>
                                <i class="fr">↗️</i>
                            </a>
                        </small>
                    </div>
                    <div class="col mt-3 footer-column-bb px-0">
                        <i class="col-1 ct fa fa-cogs pl-0"></i>
                        <small class="col pl-0">
                            <a href="//api.himliy.com/">
                                <span data-i18n-html="footer.content.api" class="i18n"></span>
                                <i class="fr">↗️</i>
                            </a>
                        </small>
                    </div>
                    -->

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
    <script type="module" src="./assets/js/setup.mjs"></script>

</body>
</html>`;

const Routes = new Map();

function RegisterRoute(path, handler) {
    Routes.set(path, handler);
}

function Router(request) {
    const url = new URL(request.url);
    const handler = Routes.get(url.pathname);
    if (!handler) return null;
    return handler(request);
}

RegisterRoute('/admin.html', () => new Response(AdminHTML, {
    status: 200,
    headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store'
    }
}));

self.addEventListener('install', event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// ---------------------------------------------------------------
// Envios de formulário (POST) interceptados pelo Service Worker.
// Banco, versão, store e rotas vêm de config/settings.json.
// Os envios ficam em chaves-valor: cada chave guarda um array de objetos.
// ---------------------------------------------------------------
let settingsPromise = null;
let databasePromise = null;

function loadSettings() {
    if (!settingsPromise) {
        settingsPromise = fetch(new URL('config/settings.json', self.location.href), {
            cache: 'no-store'
        }).then(response => {
            if (!response.ok) throw new Error(`settings.json (${response.status})`);
            return response.json();
        });

        settingsPromise.catch(() => { settingsPromise = null; });
    }

    return settingsPromise;
}

// Usa a mesma biblioteca e a mesma configuração que a página.
function getDatabase() {
    if (!databasePromise) {
        databasePromise = loadSettings().then(settings => {
            const database = settings.database;
            const connection = new AWIndexedDB(database.name, database.version, false);
            return connection.open(database.indexed);
        });

        databasePromise.catch(() => { databasePromise = null; });
    }

    return databasePromise;
}

async function appendSubmission(store, key, entry) {
    const db = await getDatabase();

    const previous = await db.read({ tbn: store, tbk: key });
    const list = Array.isArray(previous) ? previous : [];
    list.push(entry);

    // tbv em array é tratado pela biblioteca como vários valores;
    // por isso o array da chave vai embrulhado em outro array.
    await db.create([{ tbn: store, tbk: key, tbv: [list] }]);
}

function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json; charset=utf-8' }
    });
}

async function handlePost(request) {
    const url = new URL(request.url);

    if (url.origin !== self.location.origin) return fetch(request);

    const settings = await loadSettings().catch(() => null);
    const route = settings && settings.submissions.routes[url.pathname];

    // Não é um envio configurado: segue normalmente para a rede.
    if (!route) return fetch(request);

    try {
        const form = await request.formData();

        await appendSubmission(route.store, route.key, {
            ...Object.fromEntries(form.entries()),
            sentAt: new Date().toISOString()
        });

        return jsonResponse({ ok: true }, 200);
    } catch (error) {
        console.error('[SW] Falha ao guardar o envio:', error);
        return jsonResponse({ ok: false }, 500);
    }
}

self.addEventListener('fetch', event => {
    const request = event.request;

    if (request.method === 'POST') {
        event.respondWith(handlePost(request));
        return;
    }

    if (request.method !== 'GET') return;

    const url = new URL(request.url);
    if (url.origin !== self.location.origin) return;

    const response = Router(request);
    if (response) {
        event.respondWith(Promise.resolve(response));
    }
});

export { Router, RegisterRoute, Routes };
