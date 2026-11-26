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
const GITHUB_REDIRECT_URI = "https://subversivo58.github.io/admin.html";
const GITHUB_AUTHORIZE_URL = "https://github.com/login/oauth/authorize";
const GITHUB_TOKEN_URL =
    "https://webpush-proxy.dib.workers.dev/https://github.com/login/oauth/access_token";
const GITHUB_API_USER = "https://api.github.com/user";

// ===============================================================
// ADMIN HTML — SHELL EXISTENTE PRESERVADO
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
    <meta name="DEBUG" content="true">
    <meta name="reply-to" content="https://github.com/subversivo58/subversivo58.github.io/issues/new">
    <link rel="copyright" href="/copyright.html">
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
    <link rel="icon" href="/favicon.ico">
    <link rel="modulepreload" href="/assets/js/setup.mjs">
    <link rel="stylesheet" href="/assets/vendor/bootstrapv4/bootstrap.min.css">
    <link rel="stylesheet" href="/assets/css/main.css">
    <link rel="manifest" href="/manifest.json">
    <meta name="theme-color" content="#1ebfff">
    <noscript>
        <meta http-equiv="refresh" content="0;url=/nojs.html">
    </noscript>
</head>
<body id="body">
    <section id="index-central-block" class="container-fluid px-0 pt-5 fill-height">
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
    <script type="module" src="/assets/js/setup.mjs"></script>
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

function htmlResponse(html, status = 200) {
    return new Response(html, {
        status,
        headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "no-store"
        }
    });
}

// ===============================================================
// INDEXEDDB EXISTENTE DO BLOG
// ===============================================================

let settingsPromise = null;
let databasePromise = null;

function loadSettings() {
    if (!settingsPromise) {
        settingsPromise = fetch(
            new URL("/config/settings.json", self.location.origin),
            { cache: "no-store" }
        ).then(response => {
            if (!response.ok)
                throw new Error(`settings.json (${response.status})`);
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
    await db.create([{ tbn: store, tbk: key, tbv: [list] }]);
}

// ===============================================================
// ARMAZENAMENTO TEMPORÁRIO DA AUTENTICAÇÃO OAUTH
// ===============================================================

const AUTH_DB_NAME = "Subversivo58GitHubAuth";
const AUTH_DB_VERSION = 1;
const AUTH_STORE_NAME = "auth";
const OAUTH_PENDING_TTL = 10 * 60 * 1000;

let authDatabasePromise = null;

function openAuthDatabase() {
    if (!authDatabasePromise) {
        authDatabasePromise = new Promise((resolve, reject) => {
            const request = indexedDB.open(AUTH_DB_NAME, AUTH_DB_VERSION);

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
        const transaction = database.transaction(AUTH_STORE_NAME, "readwrite");
        const store = transaction.objectStore(AUTH_STORE_NAME);

        let request;
        let result;

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

        request.onsuccess = () => {
            result = request.result;

            if (action === "get") {
                resolve(result);
            }
        };

        request.onerror = () => {
            reject(request.error || new Error("Falha na operação IndexedDB."));
        };

        transaction.oncomplete = () => {
            if (action !== "get") resolve(true);
        };

        transaction.onerror = () => {
            reject(
                transaction.error || new Error("Falha na transação IndexedDB.")
            );
        };

        transaction.onabort = () => {
            reject(
                transaction.error || new Error("Transação IndexedDB cancelada.")
            );
        };
    });
}

// ===============================================================
// DIAGNÓSTICO — NUNCA REGISTRA TOKEN, CODE, VERIFIER OU STATE
// ===============================================================

let oauthDiagnostics = [];

function logOAuth(stage, status, details = "") {
    oauthDiagnostics.push({
        time: new Date().toISOString(),
        stage,
        status,
        details: String(details || "")
    });

    if (oauthDiagnostics.length > 100) {
        oauthDiagnostics.shift();
    }
}

async function saveDiagnostics() {
    await authStorage("set", "oauth_diagnostics", oauthDiagnostics);
}

async function readDiagnostics() {
    const saved = await authStorage("get", "oauth_diagnostics");
    return Array.isArray(saved) ? saved : oauthDiagnostics;
}

function safeFailure(code, message) {
    logOAuth("Falha", code, message);
    return { code, message };
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
    return base64UrlEncode(crypto.getRandomValues(new Uint8Array(size)));
}

async function createCodeChallenge(verifier) {
    const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(verifier)
    );

    return base64UrlEncode(new Uint8Array(digest));
}

// ===============================================================
// RESPOSTAS JSON E VALIDAÇÃO DE ORIGEM
// ===============================================================

function jsonResponse(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control": "no-store",
            Pragma: "no-cache",
            "X-Content-Type-Options": "nosniff"
        }
    });
}

function isSameOrigin(request) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    return (
        url.origin === self.location.origin &&
        (!origin || origin === self.location.origin)
    );
}

// Normaliza a identidade pública recebida diretamente do GitHub.
function publicUser(user) {
    return {
        id: user.id,
        login: user.login,
        name: user.name || user.login,
        avatar_url: user.avatar_url || null,
        html_url: user.html_url || null,
        profile_url: user.html_url || null,
        email: user.email || null
    };
}

// Formato definitivo da autenticação persistida no banco principal.
function storedGitHubAuth(user, token) {
    if (!isValidGitHubUser(user)) {
        throw new Error("GITHUB_IDENTITY_INVALID");
    }

    if (
        !token ||
        typeof token.access_token !== "string" ||
        !token.access_token
    ) {
        throw new Error("TOKEN_RESPONSE_INVALID");
    }

    return {
        user: publicUser(user),
        tokens: {
            access_token: token.access_token,
            refresh_token: token.refresh_token,
            expires_in: token.expires_in,
            refresh_token_expires_in: token.refresh_token_expires_in,
            obtained_at: token.obtained_at || Date.now(),
            token_type: token.token_type,
            scope: token.scope
        }
    };
}

function isValidGitHubUser(user) {
    return Boolean(
        user &&
        Number.isInteger(user.id) &&
        user.id > 0 &&
        typeof user.login === "string" &&
        user.login.trim()
    );
}

// ===============================================================
// GRAVAÇÃO DA AUTENTICAÇÃO NO BANCO PRINCIPAL
// ===============================================================

async function saveStoredGitHubAuth(user, token) {
    const auth = storedGitHubAuth(user, token);
    const db = await getDatabase();

    await db.create([
        {
            tbn: "config",
            tbk: "user-github",
            tbv: auth
        }
    ]);

    return true;
}

// ===============================================================
// INÍCIO DO OAUTH — POST /admin-auth/start
// ===============================================================

async function startGitHubOAuth(request) {
    if (request.method !== "POST" || !isSameOrigin(request)) {
        return jsonResponse(
            {
                ok: false,
                error: "invalid_request"
            },
            405
        );
    }

    try {
        oauthDiagnostics = [];

        logOAuth("Início", "OK", "Solicitação de autenticação recebida.");

        const state = randomOAuthValue(32);
        const verifier = randomOAuthValue(64);
        const challenge = await createCodeChallenge(verifier);

        // O state e o verifier precisam sobreviver ao redirecionamento.
        // São temporários e removidos durante o callback.
        await authStorage("set", "oauth_pending", {
            state,
            verifier,
            createdAt: Date.now()
        });

        logOAuth(
            "PKCE",
            "OK",
            "Parâmetros PKCE gerados e armazenados temporariamente."
        );

        await saveDiagnostics();

        const authorizationURL = new URL(GITHUB_AUTHORIZE_URL);

        authorizationURL.searchParams.set("client_id", GITHUB_CLIENT_ID);
        authorizationURL.searchParams.set("redirect_uri", GITHUB_REDIRECT_URI);
        authorizationURL.searchParams.set("scope", "public_repo");
        authorizationURL.searchParams.set("state", state);
        authorizationURL.searchParams.set("code_challenge", challenge);
        authorizationURL.searchParams.set("code_challenge_method", "S256");

        logOAuth(
            "Redirecionamento",
            "302",
            "Redirecionando para autorização GitHub."
        );

        await saveDiagnostics();

        return Response.redirect(authorizationURL.toString(), 303);
    } catch (error) {
        console.error("[SW] Falha ao iniciar OAuth:", error);

        safeFailure(
            "OAUTH_START_FAILED",
            "Não foi possível iniciar a autenticação."
        );

        await saveDiagnostics().catch(() => {});

        return jsonResponse(
            {
                ok: false,
                error: "OAUTH_START_FAILED",
                message:
                    "Não foi possível iniciar a autenticação. Consulte o diagnóstico."
            },
            500
        );
    }
}

// ===============================================================
// TROCA DO CÓDIGO PELO TOKEN — PROXY CLOUDFLARE
// ===============================================================

async function exchangeGitHubCode(code, verifier) {
    logOAuth("Proxy", "ENVIANDO", "Solicitando troca do código OAuth.");

    const body = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        code,
        redirect_uri: GITHUB_REDIRECT_URI,
        code_verifier: verifier
    });

    const response = await fetch(GITHUB_TOKEN_URL, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body,
        cache: "no-store"
    });

    let result;

    try {
        result = await response.json();
    } catch {
        throw new Error("TOKEN_RESPONSE_INVALID");
    }

    if (!response.ok || result.error || !result.access_token) {
        throw new Error("TOKEN_EXCHANGE_FAILED");
    }

    logOAuth(
        "Proxy",
        `HTTP ${response.status}`,
        "Resposta válida; token omitido."
    );

    return result;
}

// ===============================================================
// IDENTIFICAÇÃO DA CONTA — GITHUB /USER
// ===============================================================

async function getGitHubUser(accessToken) {
    logOAuth("GitHub /user", "ENVIANDO", "Consultando identidade da conta.");

    const response = await fetch(GITHUB_API_USER, {
        method: "GET",
        headers: {
            Accept: "application/vnd.github+json",
            Authorization: `Bearer ${accessToken}`,
            "X-GitHub-Api-Version": "2022-11-28"
        },
        cache: "no-store"
    });

    if (!response.ok) {
        throw new Error("GITHUB_IDENTITY_FAILED");
    }

    const user = await response.json();

    if (!isValidGitHubUser(user)) {
        throw new Error("GITHUB_IDENTITY_INVALID");
    }

    logOAuth("GitHub /user", "OK", "Identidade da conta recebida.");

    return user;
}

// ===============================================================
// CALLBACK — /admin.html?code=...&state=...
// ===============================================================

async function handleGitHubCallback(url) {
    logOAuth("Callback", "INÍCIO", "Retorno do GitHub recebido.");
    try {
        const oauthError = url.searchParams.get("error");

        if (oauthError) {
            await authStorage("delete", "oauth_pending");

            throw new Error("GITHUB_AUTHORIZATION_DENIED");
        }

        const code = url.searchParams.get("code");
        const returnedState = url.searchParams.get("state");

        if (!code || !returnedState) {
            throw new Error("OAUTH_CALLBACK_INCOMPLETE");
        }

        const pending = await authStorage("get", "oauth_pending");

        if (!pending || !pending.state || !pending.verifier) {
            throw new Error("OAUTH_REQUEST_NOT_FOUND");
        }

        if (Date.now() - pending.createdAt > OAUTH_PENDING_TTL) {
            await authStorage("delete", "oauth_pending");
            throw new Error("OAUTH_REQUEST_EXPIRED");
        }

        if (returnedState !== pending.state) {
            await authStorage("delete", "oauth_pending");
            throw new Error("OAUTH_STATE_MISMATCH");
        }

        logOAuth("Validação state", "OK", "Correspondência confirmada.");

        // O verifier já está em memória. Podemos remover o registro temporário
        // antes de iniciar a troca do código.
        await authStorage("delete", "oauth_pending");

        // Troca o código pelos tokens OAuth.
        const tokens = await exchangeGitHubCode(code, pending.verifier);

        // Consulta a identidade da conta autenticada.
        const user = await getGitHubUser(tokens.access_token);

        // Persiste identidade e todos os campos de token no banco principal.
        await saveStoredGitHubAuth(user, tokens);

        logOAuth(
            "Autenticação",
            "OK",
            "Identidade e credenciais OAuth gravadas no banco principal."
        );

        await saveDiagnostics();
    } catch (error) {
        const code =
            error instanceof Error ? error.message : "OAUTH_CALLBACK_FAILED";

        const knownMessages = {
            GITHUB_AUTHORIZATION_DENIED:
                "A autorização no GitHub foi cancelada ou negada.",

            OAUTH_CALLBACK_INCOMPLETE:
                "O retorno do GitHub não contém os parâmetros necessários.",

            OAUTH_REQUEST_NOT_FOUND:
                "A solicitação OAuth não foi encontrada. Inicie novamente.",

            OAUTH_REQUEST_EXPIRED:
                "A solicitação OAuth expirou. Inicie novamente.",

            OAUTH_STATE_MISMATCH: "A validação de segurança do retorno falhou.",

            TOKEN_RESPONSE_INVALID: "O proxy retornou uma resposta inválida.",

            TOKEN_EXCHANGE_FAILED:
                "Não foi possível trocar o código por um token.",

            GITHUB_IDENTITY_FAILED:
                "O GitHub não confirmou a identidade da conta.",

            GITHUB_IDENTITY_INVALID:
                "O GitHub retornou dados de identidade incompletos."
        };

        safeFailure(
            code,
            knownMessages[code] || "Falha inesperada no callback OAuth."
        );

        console.error("[SW] Falha no callback OAuth:", code);

        await authStorage("delete", "oauth_pending").catch(() => {});

        await saveDiagnostics().catch(() => {});
    }

    // O callback sempre retorna à página administrativa.
    return Response.redirect(
        new URL("/admin.html", url.origin).toString(),
        303
    );
}

// ===============================================================
// PÁGINA ADMINISTRATIVA
// ===============================================================

async function handleAdminPage(request) {
    const url = new URL(request.url);

    if (
        url.searchParams.has("code") ||
        url.searchParams.has("state") ||
        url.searchParams.has("error")
    ) {
        return handleGitHubCallback(url);
    }

    return htmlResponse(AdminHTML);
}

// ===============================================================
// ENCERRAMENTO — POST /admin-auth/logout
// ===============================================================

async function logoutGitHub(request) {
    if (request.method !== "POST" || !isSameOrigin(request)) {
        return jsonResponse(
            {
                ok: false,
                error: "invalid_request"
            },
            405
        );
    }

    try {
        await authStorage("delete", "oauth_pending");

        // Logout remove também a identidade definitiva.
        const db = await getDatabase();

        await db.delete({
            tbn: "config",
            tbk: "user-github"
        });

        logOAuth("Autenticação", "ENCERRADA", "Identidade local removida.");

        await saveDiagnostics();

        return jsonResponse({
            ok: true,
            status: "unauthenticated"
        });
    } catch (error) {
        console.error("[SW] Falha ao encerrar autenticação:", error);

        return jsonResponse(
            {
                ok: false,
                error: "AUTH_LOGOUT_FAILED",
                message: "Não foi possível encerrar a autenticação local."
            },
            500
        );
    }
}

// ===============================================================
// REVALIDAÇÃO DO TOKEN — POST /admin-auth/refresh
// ===============================================================

async function refreshGitHubToken(request) {
    if (request.method !== "POST" || !isSameOrigin(request)) {
        return jsonResponse(
            {
                ok: false,
                error: "invalid_request"
            },
            405
        );
    }

    try {
        const db = await getDatabase();
        const stored = await db.read({
            tbn: "config",
            tbk: "user-github"
        });

        const refreshToken = stored?.tokens?.refresh_token;

        if (!refreshToken) {
            safeFailure(
                "REFRESH_TOKEN_MISSING",
                "Não há refresh_token disponível para renovar a sessão."
            );
            await saveDiagnostics().catch(() => {});

            return jsonResponse(
                {
                    ok: false,
                    reauth_required: true,
                    code: "REFRESH_TOKEN_MISSING",
                    message: "É necessário autenticar novamente no GitHub."
                },
                401
            );
        }

        logOAuth(
            "Refresh",
            "ENVIANDO",
            "Solicitando renovação do token OAuth."
        );

        const body = new URLSearchParams({
            client_id: GITHUB_CLIENT_ID,
            grant_type: "refresh_token",
            refresh_token: refreshToken
        });

        const response = await fetch(GITHUB_TOKEN_URL, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body,
            cache: "no-store"
        });

        let result;
        try {
            result = await response.json();
        } catch {
            return jsonResponse(
                {
                    ok: false,
                    reauth_required: false,
                    code: "TOKEN_REFRESH_INVALID",
                    message: "Resposta inválida do proxy durante a renovação."
                },
                502
            );
        }

        if (!response.ok || result.error || !result.access_token) {
            const code = result?.error || "TOKEN_REFRESH_FAILED";
            const permanent =
                [
                    "bad_refresh_token",
                    "incorrect_client_credentials",
                    "unsupported_grant_type",
                    "invalid_grant"
                ].includes(code) || response.status === 401;

            safeFailure(
                code,
                result?.error_description || "Falha ao renovar o token OAuth."
            );
            await saveDiagnostics().catch(() => {});

            return jsonResponse(
                {
                    ok: false,
                    reauth_required: permanent,
                    code,
                    message:
                        result?.error_description ||
                        "Não foi possível renovar a sessão do GitHub."
                },
                permanent ? 401 : 502
            );
        }

        const obtainedAt = Date.now();
        const mergedTokens = {
            access_token: result.access_token,
            refresh_token: result.refresh_token || refreshToken,
            expires_in: result.expires_in ?? stored?.tokens?.expires_in,
            refresh_token_expires_in:
                result.refresh_token_expires_in ??
                stored?.tokens?.refresh_token_expires_in,
            obtained_at: obtainedAt,
            token_type:
                result.token_type || stored?.tokens?.token_type || "bearer",
            scope: result.scope ?? stored?.tokens?.scope ?? ""
        };

        let user = stored?.user;
        try {
            user = await getGitHubUser(mergedTokens.access_token);
        } catch (userError) {
            if (!isValidGitHubUser(user)) {
                return jsonResponse(
                    {
                        ok: false,
                        reauth_required: true,
                        code: "GITHUB_IDENTITY_FAILED",
                        message: "Não foi possível confirmar a conta no GitHub."
                    },
                    401
                );
            }
        }

        await saveStoredGitHubAuth(user, mergedTokens);

        logOAuth(
            "Refresh",
            "OK",
            "Token OAuth renovado com sucesso; valor omitido."
        );
        await saveDiagnostics();

        return jsonResponse({
            ok: true,
            user: publicUser(user),
            tokens: {
                expires_in: mergedTokens.expires_in,
                refresh_token_expires_in: mergedTokens.refresh_token_expires_in,
                obtained_at: mergedTokens.obtained_at,
                scope: mergedTokens.scope,
                token_type: mergedTokens.token_type
            }
        });
    } catch (error) {
        console.error("[SW] Falha ao renovar token:", error);
        safeFailure(
            "TOKEN_REFRESH_EXCEPTION",
            "Erro inesperado ao renovar sessão."
        );
        await saveDiagnostics().catch(() => {});

        return jsonResponse(
            {
                ok: false,
                reauth_required: false,
                code: "TOKEN_REFRESH_EXCEPTION",
                message: "Falha inesperada ao renovar a sessão."
            },
            500
        );
    }
}

// ===============================================================
// DIAGNÓSTICO — GET /admin-auth/diagnostics
// ===============================================================

async function getAuthDiagnostics(request) {
    if (request.method !== "GET" || !isSameOrigin(request)) {
        return jsonResponse(
            {
                ok: false,
                error: "invalid_request"
            },
            405
        );
    }

    try {
        return jsonResponse({
            ok: true,
            entries: await readDiagnostics()
        });
    } catch (error) {
        console.error("[SW] Falha ao consultar diagnósticos:", error);

        return jsonResponse(
            {
                ok: false,
                error: "DIAGNOSTICS_UNAVAILABLE",
                entries: []
            },
            500
        );
    }
}

// ===============================================================
// REGISTRO DAS ROTAS ADMINISTRATIVAS
// ===============================================================

RegisterRoute("/admin.html", handleAdminPage);
RegisterRoute("/admin-auth/start", startGitHubOAuth);
RegisterRoute("/admin-auth/refresh", refreshGitHubToken);
RegisterRoute("/admin-auth/logout", logoutGitHub);
RegisterRoute("/admin-auth/diagnostics", getAuthDiagnostics);

// ===============================================================
// FILA E SINCRONIZAÇÃO DOS REGISTROS
// ===============================================================

const RECORDS_SYNC_INTERVAL = 60 * 60 * 1000;
const RECORDS_QUEUE = {
    feedback: {
        store: "analytics",
        key: "feedback",
        marker: "records-sync-feedback",
        path: "/v1/feedback"
    },
    errors: {
        store: "analytics",
        key: "bug",
        marker: "records-sync-errors",
        path: "/v1/errors"
    }
};

let recordsSyncPromise = null;

function normalizeFeedback(entry) {
    const rating = Number(entry?.rating);
    const message =
        typeof entry?.message === "string" ? entry.message.trim() : "";

    if (
        !Number.isInteger(rating) ||
        rating < 1 ||
        rating > 5 ||
        message.length < 1 ||
        message.length > 500
    ) {
        return null;
    }

    return { rating, message };
}

function normalizeError(entry) {
    const allowedTypes = [
        "custom",
        "css",
        "javascript",
        "language",
        "plugin",
        "server"
    ];

    const type = typeof entry?.type === "string" ? entry.type.trim() : "";
    const message =
        typeof entry?.message === "string" ? entry.message.trim() : "";

    if (
        !allowedTypes.includes(type) ||
        message.length < 1 ||
        message.length > 280
    ) {
        return null;
    }

    return { type, message };
}

async function readSubmissionList(db, route) {
    const value = await db.read({
        tbn: route.store,
        tbk: route.key
    });

    return Array.isArray(value) ? value : [];
}

async function writeSubmissionList(db, route, list) {
    await db.create([
        {
            tbn: route.store,
            tbk: route.key,
            tbv: [list]
        }
    ]);
}

async function syncRecordRoute(settings, routeName) {
    const route = RECORDS_QUEUE[routeName];
    const endpoint = settings?.jwt?.records?.endpoint;

    if (!route || typeof endpoint !== "string" || !endpoint.trim()) {
        return;
    }

    const db = await getDatabase();
    let list = await readSubmissionList(db, route);

    // Registros inválidos são descartados sem consumir o intervalo.
    while (list.length) {
        const payload =
            routeName === "feedback"
                ? normalizeFeedback(list[0])
                : normalizeError(list[0]);

        if (payload) break;

        list.shift();
        await writeSubmissionList(db, route, list);
    }

    if (!list.length) return;

    const lastAttempt = await db.read({
        tbn: "config",
        tbk: route.marker
    });

    const lastAttemptTime = Number(lastAttempt) || 0;
    const now = Date.now();

    if (now - lastAttemptTime < RECORDS_SYNC_INTERVAL) {
        return;
    }

    // O marcador é gravado antes da requisição. Falhas também consomem
    // o intervalo de uma hora, independentemente da resposta recebida.
    await db.create([
        {
            tbn: "config",
            tbk: route.marker,
            tbv: now
        }
    ]);

    const payload =
        routeName === "feedback"
            ? normalizeFeedback(list[0])
            : normalizeError(list[0]);

    const baseURL = endpoint.trim().replace(/\/+$/, "");
    let response;

    try {
        response = await fetch(baseURL + route.path, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload),
            cache: "no-store"
        });
    } catch (error) {
        console.error(`[SW] Falha de rede ao sincronizar ${routeName}:`, error);
        return;
    }

    // 201 = criado; 409 = duplicado. Nos dois casos, o registro
    // já está confirmado no backend e pode sair da fila local.
    if (response.status === 201 || response.status === 409) {
        list.shift();
        await writeSubmissionList(db, route, list);
        return;
    }

    // 429, 403, erros 4xx e 5xx permanecem na fila. O marcador
    // já foi atualizado e impede nova tentativa antes de uma hora.
    console.warn(
        `[SW] Backend recusou a sincronização de ${routeName}:`,
        response.status
    );
}

async function syncPendingRecords() {
    if (recordsSyncPromise) return recordsSyncPromise;

    recordsSyncPromise = (async () => {
        try {
            const settings = await loadSettings();

            // Os limites são independentes: uma tentativa de feedback
            // não bloqueia uma tentativa de erro, e vice-versa.
            await Promise.allSettled([
                syncRecordRoute(settings, "feedback"),
                syncRecordRoute(settings, "errors")
            ]);
        } catch (error) {
            console.error(
                "[SW] Não foi possível sincronizar a fila de registros:",
                error
            );
        }
    })();

    try {
        await recordsSyncPromise;
    } finally {
        recordsSyncPromise = null;
    }
}

// ===============================================================
// ENVIOS DE FORMULÁRIO (POST)
// ===============================================================

async function handlePost(request) {
    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return fetch(request);
    }

    const routeHandler = Routes.get(url.pathname);

    if (routeHandler) {
        return routeHandler(request);
    }

    const settings = await loadSettings().catch(() => null);
    const route = settings?.submissions?.routes?.[url.pathname];

    if (!route) {
        return fetch(request);
    }

    try {
        const form = await request.formData();

        await appendSubmission(route.store, route.key, {
            ...Object.fromEntries(form.entries()),
            sentAt: new Date().toISOString()
        });

        // /notes continua apenas com armazenamento local.
        // Feedback e erros entram na fila de sincronização.
        if (route.key === "feedback" || route.key === "bug") {
            await syncPendingRecords();
        }

        return jsonResponse(
            {
                ok: true
            },
            200
        );
    } catch (error) {
        console.error("[SW] Falha ao guardar o envio:", error);

        return jsonResponse(
            {
                ok: false
            },
            500
        );
    }
}

// ===============================================================
// CICLO DE VIDA E INTERCEPTAÇÃO
// ===============================================================

self.addEventListener("install", event => {
    event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", event => {
    event.waitUntil(self.clients.claim().then(() => syncPendingRecords()));
});

self.addEventListener("fetch", event => {
    const request = event.request;
    const url = new URL(request.url);

    if (url.origin !== self.location.origin) {
        return;
    }

    if (request.method === "POST") {
        event.respondWith(handlePost(request));
        return;
    }

    if (request.method !== "GET") {
        return;
    }

    // Cada navegação/requisição GET verifica os marcadores temporais.
    // O Service Worker não depende de Periodic Background Sync.
    event.waitUntil(
        syncPendingRecords().catch(error => {
            console.error("[SW] Verificação da fila falhou:", error);
        })
    );

    const response = Router(request);

    if (response) {
        event.respondWith(Promise.resolve(response));
    }
});

export { Router, RegisterRoute, Routes };
