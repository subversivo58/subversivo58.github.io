
/**
 * @license The MIT License (MIT) - [https://github.com/Pluggeding/pluggeding.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */

import AWIndexedDB from "./assets/js/modules/lib/AwesomeIndexedDB.mjs";

// ===============================================================
// CONFIGURAÇÃO GITHUB OAUTH
// ===============================================================

const GITHUB_CLIENT_ID = "Ov23limwScBObcEQ2q8m";
const GITHUB_REDIRECT_URI =
    "https://subversivo58.github.io/teste-github";

const GITHUB_AUTHORIZE_URL =
    "https://github.com/login/oauth/authorize";

const GITHUB_TOKEN_URL =
    "https://webpush-proxy.dib.workers.dev/https://github.com/login/oauth/access_token";

const GITHUB_API_USER =
    "https://api.github.com/user";

// ===============================================================
// ADMIN HTML
// ===============================================================

const AdminHTML = `<!--
  @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/main/LICENSE]
  @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
  @version 0.1.0 [development stage]
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
    <meta name="DEBUG" content="false">
    <meta name="reply-to" content="https://github.com/subversivo58/subversivo58.github.io/issues/new">
    <link rel="copyright" href="copyright.html">
    <meta name="robots" content="noindex">
    <meta name="twitter:site" content="@subversivo58">
    <meta name="twitter:card" content="summary_large_image">
    <meta property="og:url" content="https://subversivo58.github.io/admin.html">
    <meta property="og:type" content="website">
    <meta property="og:title" content="Subversivo58 | Administração">
    <meta property="og:description" content="Subversivo58 Personal Blog Page">
    <meta property="og:image" content="https://subversivo58.github.io/assets/media/image/graph.webp">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="720">
    <link rel="icon" href="favicon.ico">
    <link rel="modulepreload" href="assets/js/setup.mjs">
    <link rel="stylesheet" href="./assets/vendor/bootstrapv4/bootstrap.min.css">
    <link rel="stylesheet" href="assets/css/main.css">
    <link rel="manifest" href="manifest.json">
    <meta name="theme-color" content="#1ebfff">
    <noscript>
        <meta http-equiv="refresh" content="0;url=nojs.html">
    </noscript>
</head>
<body id="body">
    <section id="index-central-block" class="container-fluid px-0 py-5 fill-height">
    </section>
    <section class="row container-fluid px-0 mx-0">
        <span class="bg-green-special col progress-slim-0 m-0 lh-75"></span>
        <span class="bg-blue col progress-slim"></span>
        <span class="bg-red col progress-slim"></span>
        <span class="bg-aqua col progress-slim"></span>
        <span class="bg-yellowgreen col progress-slim"></span>
    </section>
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
                            <img alt="Brand" src="./assets/media/image/1x1.gif"
                                 data-src="./assets/media/image/logos/site-logo@500x100.webp"
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
                        <small class="col-1 ct pl-0">🌎</small>
                        <small class="col pl-0"><a href="https://subversivo58.github.io/">https://subversivo58.github.io/</a></small>
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
                                <img alt="geo map" src="./assets/media/image/1x1.gif"
                                     data-src="assets/media/image/poa-osm-print.webp"
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
    <script type="module" src="./assets/js/setup.mjs"></script>
</body>
</html>`;

// ===============================================================
// ROTAS
// ===============================================================

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

RegisterRoute(
    "/admin.html",
    () =>
        new Response(AdminHTML, {
            status: 200,
            headers: {
                "Content-Type": "text/html; charset=utf-8",
                "Cache-Control": "no-store"
            }
        })
);

// ===============================================================
// INDEXEDDB EXISTENTE DO BLOG
// ===============================================================

let settingsPromise = null;
let databasePromise = null;

function loadSettings() {
    if (!settingsPromise) {
        settingsPromise = fetch(
            new URL("config/settings.json", self.location.href),
            { cache: "no-store" }
        ).then(response => {
            if (!response.ok) {
                throw new Error(`settings.json (${response.status})`);
            }

            return response.json();
        });

        settingsPromise.catch(() => {
            settingsPromise = null;
        });
    }

    return settingsPromise;
}

function getDatabase() {
    if (!databasePromise) {
        databasePromise = loadSettings().then(settings => {
            const database = settings.database;

            const connection = new AWIndexedDB(
                database.name,
                database.version,
                false
            );

            return connection.open(database.indexed);
        });

        databasePromise.catch(() => {
            databasePromise = null;
        });
    }

    return databasePromise;
}

async function appendSubmission(store, key, entry) {
    const db = await getDatabase();
    const previous = await db.read({ tbn: store, tbk: key });
    const list = Array.isArray(previous) ? previous : [];

    list.push(entry);

    await db.create([
        {
            tbn: store,
            tbk: key,
            tbv: [list]
        }
    ]);
}

// ===============================================================
// ARMAZENAMENTO DA AUTENTICAÇÃO OAUTH
// ===============================================================

const AUTH_DB_NAME = "Subversivo58GitHubAuth";
const AUTH_DB_VERSION = 1;
const AUTH_STORE_NAME = "auth";

let authDatabasePromise = null;

function openAuthDatabase() {
    if (!authDatabasePromise) {
        authDatabasePromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(
                AUTH_DB_NAME,
                AUTH_DB_VERSION
            );

            request.onupgradeneeded = () => {
                const database = request.result;

                if (!database.objectStoreNames.contains(AUTH_STORE_NAME)) {
                    database.createObjectStore(AUTH_STORE_NAME);
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        authDatabasePromise.catch(() => {
            authDatabasePromise = null;
        });
    }

    return authDatabasePromise;
}

async function authStorage(action, key, value) {
    const database = await openAuthDatabase();

    return new Promise((resolve, reject) => {
        const transaction = database.transaction(
            AUTH_STORE_NAME,
            "readwrite"
        );

        const store = transaction.objectStore(AUTH_STORE_NAME);
        let request;

        if (action === "get") {
            request = store.get(key);
        } else if (action === "set") {
            request = store.put(value, key);
        } else if (action === "delete") {
            request = store.delete(key);
        } else {
            reject(new Error("Operação de armazenamento inválida."));
            return;
        }

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

// ===============================================================
// FUNÇÕES CRIPTOGRÁFICAS — PKCE
// ===============================================================

function base64UrlEncode(bytes) {
    let binary = "";

    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }

    return btoa(binary)
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=+$/g, "");
}

function randomOAuthValue(size = 32) {
    const bytes = crypto.getRandomValues(
        new Uint8Array(size)
    );

    return base64UrlEncode(bytes);
}

async function createCodeChallenge(verifier) {
    const data = new TextEncoder().encode(verifier);

    const digest = await crypto.subtle.digest(
        "SHA-256",
        data
    );

    return base64UrlEncode(
        new Uint8Array(digest)
    );
}

// ===============================================================
// DIAGNÓSTICO DO FLUXO OAUTH — SOMENTE EM MEMÓRIA
// ===============================================================

let oauthDiagnostics = [];

function logOAuth(stage, status, details = "") {
    oauthDiagnostics.push({
        time: new Date().toISOString(),
        stage,
        status,
        details: String(details || "")
    });
}

function diagnosticText() {
    return oauthDiagnostics.map(item =>
        `[${item.time}] ${item.stage} — ${item.status}${item.details ? ": " + item.details : ""}`
    ).join("\n");
}

// ===============================================================
// RESPOSTAS HTML DO TESTE
// ===============================================================

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function oauthHTML(title, message, details = "") {
    const report = diagnosticText();

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>${escapeHTML(title)}</title>
<style>
body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px;box-sizing:border-box;background:#111827;color:#e5e7eb;font:16px/1.5 sans-serif}
main{width:100%;max-width:680px;padding:28px;box-sizing:border-box;background:#1f2937;border:1px solid #374151}
h1{margin-top:0;font-size:23px}p{color:#d1d5db}
pre{padding:12px;overflow-wrap:anywhere;white-space:pre-wrap;background:#111827;color:#fca5a5}
button{padding:12px 18px;border:0;background:#238636;color:white;font-weight:600;cursor:pointer}
.report{color:#d1d5db;font-size:13px}
</style>
</head>
<body><main>
<h1>${escapeHTML(title)}</h1>
<p>${escapeHTML(message)}</p>
${details}
<h2>Diagnóstico</h2>
<pre id="oauth-diagnostic" class="report">${escapeHTML(report || "Nenhum registro disponível nesta execução.")}</pre>
<button type="button" id="copy-diagnostic">Copiar diagnóstico</button>
</main>
<script>
document.getElementById("copy-diagnostic").addEventListener("click", async () => {
 const value = document.getElementById("oauth-diagnostic").textContent;
 try {
  await navigator.clipboard.writeText(value);
  document.getElementById("copy-diagnostic").textContent = "Copiado!";
 } catch {
  const area = document.createElement("textarea");
  area.value = value;
  document.body.appendChild(area);
  area.select();
  document.execCommand("copy");
  area.remove();
  document.getElementById("copy-diagnostic").textContent = "Copiado!";
 }
});
</script>
</body></html>`;
}

function oauthResponse(title, message, status = 200, details = "") {
    return new Response(oauthHTML(title, message, details), {
        status,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store"
        }
    });
}

// ===============================================================
// INÍCIO DO FLUXO OAUTH
// ===============================================================

async function startGitHubOAuth() {
    oauthDiagnostics = [];

    logOAuth(
        "Início",
        "OK",
        "GET /teste-github recebido pelo Service Worker."
    );

    const state = randomOAuthValue(32);
    const verifier = randomOAuthValue(64);
    const challenge = await createCodeChallenge(verifier);

    logOAuth(
        "PKCE",
        "OK",
        "state, code_verifier e code_challenge gerados."
    );

    await authStorage("set", "oauth_pending", {
        state,
        verifier,
        createdAt: Date.now()
    });

    logOAuth(
        "IndexedDB",
        "OK",
        "Dados temporários OAuth armazenados."
    );

    const authorizationURL = new URL(GITHUB_AUTHORIZE_URL);

    authorizationURL.searchParams.set("client_id", GITHUB_CLIENT_ID);
    authorizationURL.searchParams.set("redirect_uri", GITHUB_REDIRECT_URI);
    authorizationURL.searchParams.set("state", state);
    authorizationURL.searchParams.set("code_challenge", challenge);
    authorizationURL.searchParams.set("code_challenge_method", "S256");

    logOAuth(
        "Redirecionamento",
        "302",
        "Indo para autorização GitHub na mesma aba."
    );

    return Response.redirect(
        authorizationURL.toString(),
        302
    );
}

// ===============================================================
// TROCA DO CÓDIGO PELO TOKEN
// ===============================================================

async function exchangeGitHubCode(code, verifier) {
    logOAuth(
        "Proxy",
        "ENVIANDO",
        "POST para troca do código por token."
    );

    const body = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
        code_verifier: verifier
    });

    const response = await fetch(GITHUB_TOKEN_URL, {
        method: "POST",
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body
    });

    const responseText = await response.text();

    logOAuth(
        "Proxy",
        `HTTP ${response.status}`,
        response.ok ? "Resposta recebida." : "Resposta com erro."
    );

    let result;

    try {
        result = JSON.parse(responseText);
    } catch {
        throw new Error(
            `Resposta não JSON (HTTP ${response.status}): ${responseText.slice(0, 1000)}`
        );
    }

    if (!response.ok || result.error || !result.access_token) {
        throw new Error(
            result.error_description ||
            result.error ||
            result.message ||
            `Falha HTTP ${response.status}: ${responseText.slice(0, 1000)}`
        );
    }

    logOAuth(
        "Token",
        "OK",
        "Token recebido; conteúdo omitido."
    );

    return result;
}

// ===============================================================
// IDENTIFICAÇÃO DA CONTA AUTENTICADA
// ===============================================================

async function getGitHubUser(accessToken) {
    logOAuth(
        "GitHub /user",
        "ENVIANDO",
        "Consultando identidade."
    );

    const response = await fetch(GITHUB_API_USER, {
        method: "GET",
        headers: {
            "Accept": "application/vnd.github+json",
            "Authorization": `Bearer ${accessToken}`,
            "X-GitHub-Api-Version": "2022-11-28"
        },
        cache: "no-store"
    });

    if (!response.ok) {
        const body = await response.text();

        logOAuth(
            "GitHub /user",
            `HTTP ${response.status}`,
            "Consulta de identidade falhou."
        );

        throw new Error(
            `GitHub /user HTTP ${response.status}: ${body.slice(0, 1000)}`
        );
    }

    const user = await response.json();

    if (!user || !user.id || !user.login) {
        throw new Error(
            "O GitHub não retornou uma identidade válida."
        );
    }

    logOAuth(
        "GitHub /user",
        "OK",
        `Conta identificada: ${user.login}.`
    );

    return user;
}

// ===============================================================
// CALLBACK OAUTH
// ===============================================================

async function handleGitHubCallback(url) {
    logOAuth(
        "Callback",
        "INÍCIO",
        "Retorno do GitHub recebido."
    );

    try {
        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");

        if (url.searchParams.get("error")) {
            throw new Error(
                url.searchParams.get("error_description") ||
                url.searchParams.get("error")
            );
        }

        if (!code) {
            throw new Error("O GitHub não retornou o código.");
        }

        if (!returnedState) {
            throw new Error("O parâmetro state não foi recebido.");
        }

        logOAuth(
            "Callback",
            "OK",
            "code e state recebidos; code omitido."
        );

        const pending = await authStorage(
            "get",
            "oauth_pending"
        );

        logOAuth(
            "IndexedDB",
            pending ? "OK" : "FALHA",
            "Leitura dos dados temporários."
        );

        if (!pending || !pending.state || !pending.verifier) {
            throw new Error(
                "Solicitação pendente não encontrada no IndexedDB."
            );
        }

        if (Date.now() - pending.createdAt > 10 * 60 * 1000) {
            await authStorage("delete", "oauth_pending");

            throw new Error(
                "Solicitação OAuth expirada (10 minutos)."
            );
        }

        if (returnedState !== pending.state) {
            await authStorage("delete", "oauth_pending");

            throw new Error(
                "O state retornado não corresponde ao original."
            );
        }

        logOAuth(
            "Validação state",
            "OK",
            "Correspondência confirmada."
        );

        await authStorage("delete", "oauth_pending");

        logOAuth(
            "IndexedDB",
            "OK",
            "Dados temporários removidos após validação."
        );

        const token = await exchangeGitHubCode(
            code,
            pending.verifier
        );

        const user = await getGitHubUser(
            token.access_token
        );

        const session = {
            authenticated: true,
            provider: "github",
            user: {
                id: user.id,
                login: user.login,
                name: user.name || user.login,
                avatar_url: user.avatar_url,
                html_url: user.html_url
            },
            access_token: token.access_token,
            token_type: token.token_type || "bearer",
            scope: token.scope || "",
            createdAt: Date.now(),
            expiresIn: token.expires_in || null
        };

        await authStorage(
            "set",
            "github_session",
            session
        );

        logOAuth(
            "Sessão",
            "OK",
            "Sessão armazenada; token omitido."
        );

        return oauthResponse(
            "Autenticação concluída",
            "O Service Worker recebeu o token e identificou a conta GitHub.",
            200,
            `<p>Conta autenticada:</p><pre>${escapeHTML(user.login)}</pre>`
        );

    } catch (error) {
        logOAuth(
            "Falha",
            "ERRO",
            error?.message || String(error)
        );

        console.error(
            "[SW] Falha na autenticação GitHub:",
            error
        );

        return oauthResponse(
            "Falha na autenticação",
            error?.message || "Erro desconhecido.",
            502
        );
    }
}

// ===============================================================
// PÁGINA DE TESTE E CONTROLE DA AUTENTICAÇÃO
// ===============================================================

async function handleGitHubOAuth(request) {
    const url = new URL(request.url);

    try {
        if (url.searchParams.get("logout") === "1") {
            await authStorage(
                "delete",
                "github_session"
            );

            logOAuth(
                "Sessão",
                "ENCERRADA",
                "Sessão local removida."
            );

            return oauthResponse(
                "Sessão encerrada",
                "A sessão GitHub local foi removida.",
                200
            );
        }

        if (
            url.searchParams.has("error") ||
            url.searchParams.has("code")
        ) {
            return await handleGitHubCallback(url);
        }

        // Todo GET sem callback inicia automaticamente a autorização.
        // Não existe botão de início nem query ?login=1.
        return await startGitHubOAuth();

    } catch (error) {
        logOAuth(
            "Erro não tratado",
            "500",
            error?.message || String(error)
        );

        console.error(
            "[SW] Erro em /teste-github:",
            error
        );

        return oauthResponse(
            "Erro no fluxo OAuth",
            error?.message || "Falha inesperada.",
            500
        );
    }
}

RegisterRoute("/teste-github", handleGitHubOAuth);
RegisterRoute("/teste-github/", handleGitHubOAuth);

// ===============================================================
// ENVIOS DE FORMULÁRIO (POST) INTERCEPTADOS PELO SERVICE WORKER
// ===============================================================

async function handlePost(request) {
    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return fetch(request);
    }

    const settings = await loadSettings().catch(() => null);
    const route = settings && settings.submissions.routes[url.pathname];

    if (!route) {
        return fetch(request);
    }

    try {
        const form = await request.formData();

        await appendSubmission(
            route.store,
            route.key,
            {
                ...Object.fromEntries(form.entries()),
                sentAt: new Date().toISOString()
            }
        );

        return jsonResponse({ ok: true }, 200);

    } catch (error) {
        console.error(
            "[SW] Falha ao guardar o envio:",
            error
        );

        return jsonResponse({ ok: false }, 500);
    }
}

function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8"
        }
    });
}

// ===============================================================
// CICLO DE VIDA E INTERCEPTAÇÃO
// ===============================================================

self.addEventListener("install", event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", event => {
    const request = event.request;

    if (request.method === "POST") {
        event.respondWith(handlePost(request));
        return;
    }

    if (request.method !== "GET") {
        return;
    }

    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    const response = Router(request);

    if (response) {
        event.respondWith(Promise.resolve(response));
    }
});

export {
    Router,
    RegisterRoute,
    Routes
};
