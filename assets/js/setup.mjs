/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
"use strict";

// Console de depuração (liga sozinho quando <meta name="DEBUG" content="true">).
// Fica como primeiro import para registrar os erros dos módulos seguintes.
import "./modules/lib/DebugConsole.mjs";

// Carrega as configurações sempre com dados atualizados do servidor.
const settingsResponse = await fetch(
    new URL("../../config/settings.json", import.meta.url),
    {
        cache: "no-store"
    }
);

if (!settingsResponse.ok) {
    throw new Error(
        `[SETUP]: Failed to load settings.json (${settingsResponse.status})`
    );
}

const settings = await settingsResponse.json();

// helpers
import _, {
    IsWebBrowserContext,
    IsWebWorkerContext,
    IsServiceWorkerContext,
    IsFrameBox,
    noop,
    dc,
    wd,
    nv,
    sw,
    ua,
    ls,
    ss,
    ot,
    dt,
    ts,
    // PHP time() approach
    time,
    // protocol
    uri,
    // root (domain)
    BaseRoot,
    // XMLHttpRequest
    XHR,
    // FormData
    FD,
    // global get APIS...
    indexedDB,
    IDBTransaction,
    IDBKeyRange,
    URL,
    Geolocation,
    RegLogout,
    Notifics,
    Fetch,
    Storage,
    Worker,
    ServiceWorker,
    Promise
} from "./modules/helpers/Exporter.mjs";

// functions
import {
    Bytes2Size,
    DeepFreeze,
    DeepEqual,
    StringDistance,
    FindAndReplace,
    Queue,
    Stack,
    PathName,
    DirsLevel,
    Redirect,
    SendBeacon,
    ColorPallet,
    TimeLength,
    TimeAgo,
    ReadingTextTime,
    AnchorScrool,
    SoundPlay,
    BrightnessDetector,
    SpyDOM,
    PressHoldCollorCharger
} from "./modules/functions/Functions.mjs";

import { loadMarkdown } from "./modules/lib/MarkdownKit.mjs";

let GitHubAPIInstance = null;

// vendors
import BootstrapNative from "./modules/vendor/bootstrap-native.mjs";

// LazyLoadImage
import LazyLoad from "./modules/lib/LazyLoad.mjs";

// libs
import {
    Emitter,
    CryptoHandler,
    AWCookies,
    AWStorage,
    AWCache,
    AWClearBrowserStoragement,
    AWIndexedDB,
    IlibJS
} from "./modules/lib/Exporter.mjs";

// Cookies desativados: este site não funciona nesse modo, mostra a página explicativa
if (!navigator.cookieEnabled && PathName(true) !== "nocookie") {
    location.replace("/nocookie.html");
}

const LocalStorage = AWStorage();

import PolicyHandler from "./modules/models/PolicyHandler.mjs";

import Templates from "./modules/models/Templates.mjs";

// Postagens recentes (carrossel da home e resumo no rodapé)
import {
    renderFooterNews,
    renderIndexCarousel
} from "./modules/models/RecentPosts.mjs";

import indexedDBLogs from "./modules/lib/IndexedLogs.mjs";

import { DrawerEvents, SlideMenus } from "./modules/models/UIHandler.mjs";

// logging
const SetupLog = new indexedDBLogs("[SETUP]: ");

// Envio de bug e feedback sem sair da página.
// O formulário é enviado por fetch: o Service Worker grava e responde 200.
const FORM_STATUS = {
    "bugs-report-form": {
        ok: "drawer.bug_report.sent",
        fail: "drawer.bug_report.failed"
    },
    "feedback-form": {
        ok: "drawer.feedback.notific.success.message",
        fail: "drawer.feedback.notific.error.message"
    },
    "fats-notes-form": {
        ok: "drawer.notes_form.sent",
        fail: "drawer.notes_form.failed"
    }
};

// Avaliação por estrelas do feedback (1 a 5, ou nenhuma).
// Sem escolha, o campo "rating" fica desabilitado e não é enviado.
const paintRating = value => {
    dc.querySelectorAll("#drawer-feedback-block .star-rating").forEach(star => {
        star.textContent = Number(star.dataset.starValue) <= value ? "★" : "☆";
    });
};

const setRating = value => {
    const input = dc.getElementById("feedback-rating");
    if (!input) return;

    if (value) {
        input.value = String(value);
        input.disabled = false;
    } else {
        input.value = "";
        input.disabled = true;
    }

    paintRating(value || 0);
};

dc.addEventListener("click", event => {
    const star = event.target.closest("#drawer-feedback-block .star-rating");
    if (!star) return;

    const value = Number(star.dataset.starValue);
    const input = dc.getElementById("feedback-rating");
    const current = input && !input.disabled ? Number(input.value) : 0;

    setRating(current === value ? 0 : value);
});

dc.addEventListener("reset", event => {
    if (event.target && event.target.id === "feedback-form") {
        setRating(0);
    }
});

dc.addEventListener("submit", async event => {
    const form = event.target;
    const keys = FORM_STATUS[form.id];

    if (!keys) return;

    event.preventDefault();

    const status = document.getElementById(`${form.id}-status`);

    const showStatus = (key, cls) => {
        if (!status) return;
        status.className = `small mt-2 mb-0 i18n ${cls}`;
        status.setAttribute("data-i18n-html", key);
        status.removeAttribute("translated");
        status.hidden = false;
        i18n.transcript();
    };

    try {
        const response = await fetch(form.action, {
            method: "POST",
            body: new FormData(form)
        });

        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        form.reset();
        if (form.id === "feedback-form") setRating(0);
        showStatus(keys.ok, "text-success");
    } catch (error) {
        console.error("[FORM]:", error);
        showStatus(keys.fail, "text-danger");
    }
});

// IndexedDB manager
const ConnectionDB = new AWIndexedDB(
    settings.database.name,
    settings.database.version,
    noop
);

// Shared database connection
let DBMethods = null;

try {
    DBMethods = await ConnectionDB.open(settings.database.indexed);

    // Inject the shared connection into the logger.
    SetupLog.setConnection(DBMethods);

    SetupLog.success("IndexedDB connection established", {
        database: settings.database.name,
        version: settings.database.version,
        stores: settings.database.indexed.map(item => item.tbn)
    });
} catch (error) {
    console.error("[SETUP]: IndexedDB initialization failed", error);
}

// LifeCycle
import LifeCycle from "./modules/core/LifeCycle.mjs";

const Activity = new LifeCycle();

const Policy = Activity.create(
    new PolicyHandler("Subversivo58_Policy", SetupLog)
);

Policy.resume();

let BaseRootRegExp = new RegExp(BaseRoot),
    redirectAfterSetup =
        dc.referrer !== ""
            ? dc.referrer.includes(BaseRoot)
                ? dc.referrer
                : BaseRoot
            : BaseRoot,
    SettingsCFG;

// Instance and "mode" (i18n|l10n|Intl)
const i18n = new IlibJS("i18n");

const Events = new Emitter("setup");

import NotifyJS from "./modules/lib/Notifications.mjs";

import Permissions from "./modules/lib/Permissions.mjs";

const BrowserPermissions = new Permissions();

const Notify = new NotifyJS({
    permissions: BrowserPermissions,
    watchPermissions: true,
    player: SoundPlay,
    translate: key => i18n.getWord(key),
    //logger: NotifyLogger.loging,
    // only for "bootstraped" template
    gui: {
        /**
         * Axis direction: as detected by `isMobile()` detection or all screen less than 576 width
         * rb = right & bottom (default) [for non-mobile view]
         * rt = right & top (default for mobile view)[mobile/desktop]         * lb = left & bottom [for non-mobile view]
         * lt = left & top [mobile/desktop]
         * @type {String}
         */
        axis: "rb",
        /**
         * Order vertical direction: inverted in mobile (mobile show from top to down, desktop show from bottom to up)
         * fl = first last (default) [desktop last is show in first down, mobile is show on first up]
         * fe = first end [desktop last show in top, mobile last show in down]
         * @type {String}
         */
        order: "fl",
        /**
         * User settings: enable or disable user choices (default: enabled all)
         * @note: user choices is precedent as settings: axis, order, sound
         */
        choices: {
            mute: true, // user mute sound (default: true = enabled to choice)
            axis: true, // user choose "axis" ... the same options as axis up
            order: true, // user choose "order" ... the same options as order up
            dir: true, // user choose "text direction" (default left to right) [left to right or right to left]
            /**
             * User choose auto collapse big texts and (or) images
             */
            collapse: {
                text: true,
                image: true
            }
        }
    }
});

/**
 * Change border-bottom of fixed navbar
 * @see  scroll {@link https://stackoverflow.com/questions/4096863/how-to-get-and-set-the-current-web-page-scroll-position#28488360}
 * @revise - change to `IntersectionObserver()` (if disponible)
 * @priority: LESS
 */
_.DOM.waitEl(dc, "#navbar-fixed", list => {
    if (list[0] && _.DOM.isVisible(list[0])) {
        let DocumentTop = 0;
        _.DOM.event(
            wd,
            "scroll",
            function (ev) {
                ev.stopPropagation();
                let observ = dc.documentElement.scrollTop || dc.body.scrollTop;
                if (observ > 10) {
                    _.$("#navbar-fixed").addClass("navbar-box-shadow");
                }
                if (observ < 10) {
                    _.$("#navbar-fixed").removeClass("navbar-box-shadow");
                }
                DocumentTop = observ;
            },
            _.EventOptions(false, true, false)
        );
    }
});

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("/ServiceWorker.mjs", {
        type: "module"
    });
}

const SetupDOMReady = async evt => {
    // After HTMLDocument is charged and parsed [don't wait charge stylesheet's, images and subframe's]
    //_.DOM.event(dc, 'DOMContentLoaded', async evt => {

    // One-time browser storage cleanup
    if (location.search === "?clear-site-data=1") {
        // Remove the trigger to prevent repeated execution
        wd.history.replaceState(
            null,
            "",
            wd.location.pathname + wd.location.hash
        );

        try {
            await Policy.refuseStoragement(true);

            console.log("[SETUP]: Browser storagement cleared");
        } catch (error) {
            console.error("[SETUP]: Browser storagement cleanup failed", error);
        }

        wd.location.reload();
        return;
    }

    // this route
    const router = PathName(true);

    PolicyHandler.supported = settings.source.language;
    dc.documentElement.lang = PolicyHandler.language;
    await i18n.get(`${BaseRoot}assets/lang/${PolicyHandler.language}.json`, {
        credentials: "include",
        cache: "reload"
    });

    const TemplatesReady = new Templates(
        settings.templates,
        {
            rule: [
                "full_year",
                "source_version_canonical",
                "disable_on_policy"
            ],
            replacement: [
                new Date().getFullYear(),
                settings.source.version.canonical,
                function () {
                    return router === "policy" ? 'disabled="disabled"' : "";
                }
            ]
        },
        i18n
    );

    // lazy-load instance
    const lazyLoad = new LazyLoad("undefined");
    // @revise - move this to PolicyInspector.mjs class constructor
    // @priority: MODERATE
    const DataStoragePolicy = () => {
        AWCookies.get("__DSPolicy__").catch(() => {
            // @revise defaulted "english" message
            // @priority: HIGH
            const DSNotify = new NotifyJS({
                permissions: BrowserPermissions,
                watchPermissions: false
            });
            // action event
            DSNotify.on("click", data => {
                if ("action" in data) {
                    switch (data.action) {
                        case "cookie-agree":
                            Redirect("policy.html#cookie-agree");
                            break;
                        case "cookie-policy":
                            Redirect("policy.html#policy-general");
                            break;
                        case "terms-policy":
                            Redirect("policy.html#policy-terms");
                            break;
                    }
                }
            });

            let NotifyI18nStorage = i18n.dictionary().notify.storage;
            // @revise - create notification and show ()
            const DSNoticeTag = "ds-policy-notice";

            DSNotify.create({
                title: NotifyI18nStorage.title,
                body: NotifyI18nStorage.body,
                badage: "assets/media/image/icons/badage-monochrome.webp",
                actions: NotifyI18nStorage.actions,
                tag: DSNoticeTag,
                bootstrap: {
                    pinned: false
                }
            }).show();

            // Dismiss automatically after a while; the user can also close it with ✖️
            setTimeout(() => {
                const closeButton = dc.querySelector(
                    `small[data-target="${DSNoticeTag}"]`
                );
                if (closeButton) closeButton.click();
            }, 15000);
        });
    };

    [...dc.querySelectorAll(".parallax")].forEach(obj => {
        let speed = obj.dataset.parallaxSpeed || 3;
        wd.addEventListener(
            "scroll",
            evt => {
                let yPos =
                    2 *
                    ((wd.pageYOffset || dc.body.scrollTop) / speed).toFixed(2);
                obj.style.backgroundPosition = "0 -" + yPos + "px";
            },
            _.EventOptions(false, true, false)
        );
    });

    // Troca de idioma (pop-up do drawer)
    // O idioma escolhido é um cookie funcional ("i18n"), lido pelo PolicyHandler.language.
    // Depois de salvar, a página é recarregada para aplicar a tradução.
    dc.addEventListener("click", async evt => {
        // Ao abrir o pop-up, destaca o idioma atual
        if (evt.target.closest("#drawer-language-selector")) {
            const current = PolicyHandler.language;
            dc.querySelectorAll(".change-language").forEach(item => {
                item.classList.toggle("border", item.id === current);
                item.classList.toggle("border-info", item.id === current);
            });
            return;
        }

        const option = evt.target.closest(".change-language");

        if (!option || !settings.source.language.includes(option.id)) {
            return;
        }

        try {
            await AWCookies.set("i18n", option.id, {
                expire: 365,
                secure: wd.location.protocol === "https:"
            });
            wd.location.reload();
        } catch (error) {
            console.error("[SETUP]: could not save the language cookie", error);
        }
    });

    // router
    switch (router) {
        case "index":
        case "dpo":
        case "about":
        case "admin":
        case "blog":
        case "404":
        case "nocookie":
            // check URI "search" fragment
            if (location.search === "?utm_source=homescreen") {
                // is pwa launch ... register log
            }

            await TemplatesReady.import;
            // Exibe o atalho administrativo quando existe uma chave salva.
            const adminShortcut = dc.getElementById("drawer-admin");

            if (adminShortcut && LocalStorage.get("github-token")) {
                adminShortcut.classList.remove("d-none");
            }

            if (router === "index") {
                renderIndexCarousel(
                    settings,
                    document.getElementById("index-central-block"),
                    {
                        locale: PolicyHandler.language,
                        translate: key => i18n.getWord(key)
                    }
                );
            }

            if (router === "blog") {
                const box = document.getElementById("index-central-block");
                const { renderMarkdownURL } = await loadMarkdown();

                const mdOptions = {
                    extensions: [
                        "tables",
                        "images",
                        "anchors",
                        "externalLinks",
                        "blockAttributes",
                        "highlight"
                    ]
                };
                let codeCopy = null;
                // Copy code blocks.
                box.addEventListener("click", async event => {
                    const button = event.target.closest("[data-code-copy]");

                    if (!button || !box.contains(button)) return;

                    const wrapper = button.closest(".code-container");
                    const code = wrapper?.querySelector("pre code");

                    if (!code) return;

                    try {
                        await navigator.clipboard.writeText(code.textContent);

                        const originalContent = button.textContent;

                        button.textContent = "✓";
                        button.classList.add("is-copied");

                        setTimeout(() => {
                            button.textContent = originalContent;
                            button.classList.remove("is-copied");
                        }, 1200);
                    } catch (error) {
                        console.error("[BLOG]: Failed to copy code.", error);
                    }
                });
                // Compatibilidade: timestamp novo em milissegundos e date legado em segundos.
                const getPostTimestamp = post => {
                    const timestamp = Number(post.timestamp);
                    if (Number.isFinite(timestamp) && timestamp > 0) {
                        return timestamp > 1e12 ? timestamp : timestamp * 1000;
                    }
                    const date = Number(post.date);
                    return Number.isFinite(date) && date > 0 ? date * 1000 : 0;
                };

                // Recupera a data da última modificação.
                const getLastModifiedTimestamp = post => {
                    const timestamp = Number(post.lastModified);

                    if (!Number.isFinite(timestamp) || timestamp <= 0) {
                        return 0;
                    }

                    return timestamp > 1e12 ? timestamp : timestamp * 1000;
                };

                const posts = [...settings.articles.storage].sort(
                    (a, b) => getPostTimestamp(b) - getPostTimestamp(a)
                );
                const maxList = settings.articles["blog-max-list"];

                const esc = text =>
                    String(text ?? "").replace(
                        /[&<>\"]/g,
                        char =>
                            ({
                                "&": "&amp;",
                                "<": "&lt;",
                                ">": "&gt;",
                                '\"': "&quot;"
                            })[char]
                    );

                const formatDate = timestamp => {
                    if (!timestamp) return "";
                    const date = new Date(timestamp);
                    if (Number.isNaN(date.getTime())) return "";
                    return date.toLocaleDateString(PolicyHandler.language, {
                        dateStyle: "medium"
                    });
                };

                const getReadingTime = post => {
                    const value = Number(post.readingTime);
                    return Number.isFinite(value) && value > 0
                        ? Math.ceil(value)
                        : null;
                };

                let drawing = 0;
                let visible = maxList;
                let currentId = null;

                const itemHTML = item => {
                    const date = formatDate(getPostTimestamp(item));
                    return `
        <a href="#${encodeURIComponent(item.id)}"
           class="list-group-item list-group-item-action rounded-0${item.id === currentId ? " active" : ""}">
            ${esc(item.title)}

            ${date ? `<small class="d-block">${date}</small>` : ""}
        </a>`;
                };

                const updateMore = () => {
                    const count = document.getElementById("blog-count");
                    const more = document.getElementById("blog-more");
                    if (!count || !more) return;
                    const shown = Math.min(visible, posts.length);
                    count.textContent = i18n
                        .getWord("blog.showing")
                        .replace("{shown}", shown)
                        .replace("{total}", posts.length);
                    count.hidden = posts.length <= maxList;
                    more.hidden = shown >= posts.length;
                };

                const loadMore = () => {
                    const list = document.getElementById("blog-list");
                    if (!list) return;
                    const from = Math.min(visible, posts.length);
                    visible = Math.min(visible + maxList, posts.length);
                    list.insertAdjacentHTML(
                        "beforeend",
                        posts.slice(from, visible).map(itemHTML).join("")
                    );
                    updateMore();
                };

                const drawBlog = async () => {
                    const run = ++drawing;
                    const id = decodeURIComponent(location.hash.slice(1));
                    const post = id
                        ? posts.find(item => item.id === id)
                        : posts[0];
                    currentId = post ? post.id : null;

                    const index = post ? posts.indexOf(post) : -1;
                    if (index >= visible)
                        visible = Math.ceil((index + 1) / maxList) * maxList;

                    let article = `<p class="ct my-5">${i18n.getWord("blog.empty")}</p>`;
                    if (posts.length && !post) {
                        article = `<p class="ct my-5">${i18n.getWord("blog.not_found")}</p>`;
                    }

                    if (post) {
                        try {
                            article = await renderMarkdownURL(
                                `assets/posts/${encodeURIComponent(post.id)}.md`,
                                mdOptions
                            );
                        } catch (error) {
                            console.error("[BLOG]:", error);
                            article = `<p class="ct my-5">${i18n.getWord("blog.load_error")}</p>`;
                        }
                    }

                    if (run !== drawing) return;

                    if (posts.length === 0) {
                        box.innerHTML = `
            <div class="container d-flex align-items-center justify-content-center text-center py-5">
                <div>
                    <div class="display-3 mb-3" aria-hidden="true">📰</div>
                    <p class="lead text-muted mb-0">${i18n.getWord("blog.empty")}</p>
                </div>
            </div>`;
                        return;
                    }

                    let postHeader = "";
                    let postFooter = "";
                    let postLicense = "";

                    if (post) {
                        const date = formatDate(getPostTimestamp(post));
                        const readingTime = getReadingTime(post);
                        const metadata = [
                            date,
                            readingTime
                                ? i18n
                                      .getWord("blog.read_time")
                                      .replace("{minutes}", readingTime)
                                : ""
                        ].filter(Boolean);

                        // Licença do conteúdo (CC BY-SA 4.0), logo após a postagem.
                        postLicense = `
                <div class="alert alert-light border small d-flex align-items-center mt-4 mb-0" role="note">
                    <img src="assets/media/image/logos/cc-by-sa-4.0.png"
                         alt="CC BY-SA 4.0" width="88" height="31"
                         class="mr-3 flex-shrink-0">
                    <span>${i18n.getWord("blog.license")}</span>
                </div>`;

                        postHeader = `
                <header class="mb-4">
                    <h3>${esc(post.title)}</h3>

                    ${metadata.length ? `<p class="small text-muted">${metadata.join(" · ")}</p>` : ""}
                </header>`;

                        // Exibe a atualização somente quando a data for diferente da criação.
                        const createdTimestamp = getPostTimestamp(post);
                        const modifiedTimestamp =
                            getLastModifiedTimestamp(post);

                        const updatedDate =
                            createdTimestamp &&
                            modifiedTimestamp &&
                            createdTimestamp !== modifiedTimestamp
                                ? formatDate(modifiedTimestamp)
                                : "";

                        // Tags em pílulas com contorno, sem # e sem funcionalidade por enquanto.
                        const tags = Array.isArray(post.tags)
                            ? post.tags
                                  .map(tag => String(tag).trim())
                                  .filter(Boolean)
                            : [];

                        const footerContent = [];

                        if (updatedDate) {
                            footerContent.push(`
                    <p class="small text-danger text-right mb-2">
                        ${esc(
                            i18n
                                .getWord("blog.updated")
                                .replace("{date}", updatedDate)
                        )}
                    </p>`);
                        }

                        if (tags.length) {
                            footerContent.push(`
                    <div class="d-flex flex-wrap align-items-center">
                        ${tags
                            .map(
                                tag => `
                            <span class="border rounded-pill px-2 py-1 mr-2 mb-2 small">
                                ${esc(tag)}
                            </span>
                        `
                            )
                            .join("")}
                    </div>`);
                        }

                        if (footerContent.length) {
                            postFooter = `
                    <footer class="mt-4">
                        ${footerContent.join("")}
                    </footer>`;
                        }
                    }

                    box.innerHTML = `
            <div class="container">
                ${postHeader}
                <article class="text-break markdown-body">${article}</article>
                ${postLicense}
                ${postFooter}
                <hr class="my-4">
                <h4 class="mt-5">${i18n.getWord("blog.more_posts")}</h4>
                <div id="blog-list" class="list-group">
                    ${posts.slice(0, visible).map(itemHTML).join("")}
                </div>
                <p id="blog-count" class="small text-muted ct mt-3 mb-0" hidden></p>
                <button type="button"
                        id="blog-more"
                        class="btn btn-outline-secondary btn-block rounded-0 cp mt-3 i18n"
                        data-i18n-html="blog.load_more"
                        hidden>Carregar mais</button>
                <div class="mb-5"></div>
            </div>`;

                    if (!codeCopy) {
                        const { default: CodeCopy } =
                            await import("./modules/lib/CodeCopy.mjs");

                        codeCopy = CodeCopy(
                            "#index-central-block",
                            "#code-copy-wrapper-template"
                        );
                    }

                    codeCopy();
                    document
                        .getElementById("blog-more")
                        .addEventListener("click", loadMore);
                    updateMore();
                    window.scrollTo(0, 0);
                };

                window.addEventListener("hashchange", drawBlog);
                await drawBlog();
            }

            if (router === "admin") {
                const [{ default: MarkdownEditor }, { default: GitHubAPI }] =
                    await Promise.all([
                        import("./modules/models/MarkdownEditor.mjs"),
                        import("./modules/lib/GitHubAPI.mjs")
                    ]);

                const TOKEN_KEY = "github-token";
                const REPOSITORY_OWNER = "subversivo58";
                const REPOSITORY_NAME = "subversivo58.github.io";
                const REPOSITORY_BRANCH = "main";

                // Mensagens do modal vêm do template github-auth.tpl.
                const authMessage = (id, value = "") => {
                    const item = dc.querySelector(
                        `#github-auth-messages [data-msg="${id}"]`
                    );

                    return item
                        ? item.textContent
                              .trim()
                              .split("{0}")
                              .join(String(value))
                        : "";
                };

                // Mantém a chave de API para publicação e edição.
                const clearGitHubAuth = () => {
                    LocalStorage.del(TOKEN_KEY);
                    GitHubAPIInstance = null;
                };

                const authenticateGitHub = async token => {
                    const api = new GitHubAPI({ token });

                    const response =
                        await api.GHInstance.getUser().getProfile();

                    GitHubAPIInstance = api;

                    return response.data;
                };

                // Restaura e valida a chave de API salva.
                const storedToken = LocalStorage.get(TOKEN_KEY);

                if (storedToken) {
                    try {
                        await authenticateGitHub(storedToken);
                    } catch (error) {
                        console.error(
                            "[ADMIN]: A chave de API armazenada não é válida.",
                            error
                        );

                        clearGitHubAuth();
                    }
                }

                // Autenticação administrativa pelo Service Worker.
                const modal = dc.getElementById("modal-github-auth");

                const statusElement = dc.getElementById("github-auth-status");

                const introElement = dc.getElementById("github-auth-intro");

                const identityElement = dc.getElementById(
                    "github-auth-identity"
                );

                const errorElement = dc.getElementById("github-auth-error");

                const diagnosticsElement = dc.getElementById(
                    "github-auth-diagnostics"
                );

                const confirmButton = dc.getElementById("github-auth-confirm");

                const copyDiagnosticsButton = dc.getElementById(
                    "github-auth-copy-diagnostics"
                );

                if (
                    !modal ||
                    !statusElement ||
                    !introElement ||
                    !identityElement ||
                    !errorElement ||
                    !diagnosticsElement ||
                    !confirmButton ||
                    !copyDiagnosticsButton
                ) {
                    throw new Error(
                        "[ADMIN]: Elementos do modal de autenticação do GitHub não encontrados."
                    );
                }

                const githubAuthModal = new BootstrapNative.Modal(modal);

                // Apresenta o erro no próprio modal e mantém o modal aberto.
                const showAuthError = (error, details = null) => {
                    const message =
                        error instanceof Error ? error.message : String(error);

                    statusElement.textContent = authMessage(
                        "github_auth_save_failed"
                    );

                    diagnosticsElement.textContent = [
                        message,
                        details ? JSON.stringify(details, null, 2) : ""
                    ]
                        .filter(Boolean)
                        .join("\n\n");

                    errorElement.hidden = false;

                    console.error("[ADMIN AUTH]:", error, details);
                };

                // Lê e valida a resposta JSON do Service Worker.
                const readAuthResponse = async response => {
                    let result;

                    try {
                        result = await response.json();
                    } catch (error) {
                        throw new Error(
                            `Resposta inválida do Service Worker (HTTP ${response.status}).`
                        );
                    }

                    if (!response.ok || result?.ok === false) {
                        throw new Error(
                            result?.error ||
                                result?.message ||
                                `Falha na requisição (HTTP ${response.status}).`
                        );
                    }

                    return result;
                };

                // Apresenta a identidade pública retornada pelo GitHub.
                const renderGitHubIdentity = user => {
                    if (!user || typeof user !== "object") {
                        throw new Error(
                            "O Service Worker não retornou os dados da identidade do GitHub."
                        );
                    }

                    const avatar = dc.getElementById("github-auth-avatar");

                    const name = dc.getElementById("github-auth-name");

                    const login = dc.getElementById("github-auth-login");

                    const id = dc.getElementById("github-auth-id");

                    const profile = dc.getElementById("github-auth-profile");

                    const emailContainer = dc.getElementById(
                        "github-auth-email-container"
                    );

                    const email = dc.getElementById("github-auth-email");

                    const profileURL = user.profile_url || user.html_url || "";

                    if (avatar) {
                        avatar.src = user.avatar_url || "";
                        avatar.alt = user.name || user.login || "GitHub";
                    }

                    if (name) {
                        name.textContent = user.name || user.login || "";
                    }

                    if (login) {
                        login.textContent = user.login ? `@${user.login}` : "";
                    }

                    if (id) {
                        id.textContent = String(user.id ?? "");
                    }

                    if (profile) {
                        profile.textContent = profileURL;
                        profile.href = profileURL || "#";
                    }

                    if (emailContainer && email) {
                        const hasEmail = Boolean(user.email);

                        emailContainer.hidden = !hasEmail;
                        email.textContent = hasEmail ? user.email : "";
                    }

                    introElement.hidden = true;
                    identityElement.hidden = false;
                    errorElement.hidden = true;

                    statusElement.textContent = authMessage(
                        "github_auth_authenticated",
                        user.login || ""
                    );
                };
                // Verifica o estado atual antes de decidir se abre o modal.

                statusElement.textContent = authMessage(
                    "github_auth_verifying"
                );

                try {
                    const response = await fetch("/admin-auth/status", {
                        method: "GET",
                        credentials: "same-origin",
                        cache: "no-store",
                        headers: {
                            Accept: "application/json"
                        }
                    });

                    const result = await readAuthResponse(response);

                    if (result.status === "authenticated") {
                        // O Service Worker já confirmou a autenticação.
                    } else if (result.status === "pending_confirmation") {
                        // Exibe a identidade e aguarda confirmação explícita.
                        githubAuthModal.show();
                        renderGitHubIdentity(result.user || result.identity);
                    } else if (result.status === "unauthenticated") {
                        githubAuthModal.show();
                        introElement.hidden = false;
                        identityElement.hidden = true;
                        statusElement.textContent = "";
                    } else {
                        throw new Error(
                            `Estado de autenticação desconhecido: ${result.status}`
                        );
                    }
                } catch (error) {
                    githubAuthModal.show();
                    showAuthError(error);
                }

                // O usuário confirma a identidade.
                // A confirmação só libera o painel depois do sucesso do POST.
                confirmButton.addEventListener("click", async () => {
                    if (confirmButton.disabled) return;

                    confirmButton.disabled = true;

                    statusElement.textContent =
                        authMessage("github_auth_saving");

                    errorElement.hidden = true;
                    diagnosticsElement.textContent = "";

                    try {
                        const response = await fetch("/admin-auth/confirm", {
                            method: "POST",
                            credentials: "same-origin",
                            cache: "no-store",
                            headers: {
                                Accept: "application/json"
                            }
                        });

                        const result = await readAuthResponse(response);

                        if (result.ok !== true) {
                            throw new Error(
                                result.error ||
                                    result.message ||
                                    "O Service Worker não confirmou a gravação da identidade."
                            );
                        }

                        // Fecha o modal somente após o Service Worker
                        // confirmar que a gravação foi concluída.
                        githubAuthModal.hide();
                    } catch (error) {
                        showAuthError(error);
                    } finally {
                        confirmButton.disabled = false;
                    }
                });

                // Copia o diagnóstico exibido no modal.
                copyDiagnosticsButton.addEventListener("click", async () => {
                    const diagnostics = diagnosticsElement.textContent || "";

                    if (!diagnostics) return;

                    try {
                        await navigator.clipboard.writeText(diagnostics);
                    } catch (error) {
                        console.error(
                            "[ADMIN AUTH]: Não foi possível copiar o diagnóstico.",
                            error
                        );
                    }
                });

                SlideMenus();
                AnchorScrool();

                const editorContainer = document.getElementById(
                    "admin-post-editor-container"
                );

                const editorRoot = document.getElementById("admin-post-editor");
                const openEditorButton =
                    document.getElementById("admin-new-post");
                const closeEditorButton = document.getElementById(
                    "admin-close-post-editor"
                );

                const markdownEditor = new MarkdownEditor({
                    root: editorRoot,
                    db: DBMethods,
                    permissions: BrowserPermissions,
                    translate: () => i18n.transcript(),

                    onCreate: async post => {
                        try {
                            if (!GitHubAPIInstance) {
                                throw new Error(
                                    "Autenticação do GitHub indisponível."
                                );
                            }

                            if (
                                !post ||
                                !Array.isArray(post.files) ||
                                !post.files.length
                            ) {
                                throw new Error(
                                    "A postagem não contém arquivos para publicação."
                                );
                            }

                            for (const file of post.files) {
                                if (
                                    !file ||
                                    typeof file.path !== "string" ||
                                    !file.path.trim() ||
                                    !("content" in file)
                                ) {
                                    throw new Error(
                                        "A lista de arquivos contém um item inválido."
                                    );
                                }
                            }

                            const api = GitHubAPIInstance;
                            api.setRepo(REPOSITORY_OWNER, REPOSITORY_NAME);
                            await api.setBranch(REPOSITORY_BRANCH);

                            const response = await api.pushFiles(
                                `Publicação: ${post.title || post.id}`,
                                post.files
                            );

                            console.log(
                                "[ADMIN]: Publicação concluída.",
                                response
                            );
                            return { published: true, post, response };
                        } catch (error) {
                            console.error(
                                "[ADMIN]: Falha ao publicar postagem.",
                                error
                            );
                            throw error;
                        }
                    }
                });

                markdownEditor.mount();

                // Footoodles admin: editor and lists share the post editor container.
                const { default: Footoodles } =
                    await import("./modules/models/Footoodles.mjs");

                const footoodles = new Footoodles({
                    getApi: () => GitHubAPIInstance,
                    repo: { owner: REPOSITORY_OWNER, name: REPOSITORY_NAME },
                    branch: REPOSITORY_BRANCH,
                    translate: path =>
                        path
                            .split(".")
                            .reduce(
                                (node, part) => node?.[part],
                                i18n.dictionary()
                            )
                });

                await footoodles.mount({
                    container: editorContainer,
                    postRoot: editorRoot,
                    lists: [
                        document.getElementById(
                            "admin-footoodles-list-desktop"
                        ),
                        document.getElementById("admin-footoodles-list-mobile")
                    ]
                });

                openEditorButton.addEventListener("click", () => {
                    editorContainer.classList.remove("d-none");
                    editorContainer.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                });

                closeEditorButton.addEventListener("click", () => {
                    editorContainer.classList.add("d-none");
                });
            }
            break;

        case "control":
            break;

        case "donations":
            await TemplatesReady.import;
            //
            (async () => {
                const { renderMarkdownURL, ParseFlags } = await loadMarkdown();

                let WhitePaperBox = _.DOM.getById("copyright-container");

                if (WhitePaperBox) {
                    const outputHTML = await renderMarkdownURL(
                        "./docs/donations.md",
                        {
                            // HTML cru em bloco é permitido nestes documentos
                            parseFlags: ParseFlags.DEFAULT,
                            extensions: [
                                "tables",
                                "images",
                                "anchors",
                                "externalLinks",
                                "blockAttributes"
                            ]
                        }
                    );

                    WhitePaperBox.insertAdjacentHTML("afterbegin", outputHTML);

                    // @revise - revise support for anchor get dinamic elements on Functions.mjs file
                    // @priority: MEDIUM
                    setTimeout(AnchorScrool, 2000);
                    i18n.transcript();
                }
            })();
            break;
        case "copyright":
            await TemplatesReady.import;
            //
            (async () => {
                const { renderMarkdownURL, ParseFlags } = await loadMarkdown();

                let WhitePaperBox = _.DOM.getById("copyright-container");

                if (WhitePaperBox) {
                    const outputHTML = await renderMarkdownURL(
                        "./docs/licenses.md",
                        {
                            // HTML cru em bloco é permitido nestes documentos
                            parseFlags: ParseFlags.DEFAULT,
                            extensions: [
                                "tables",
                                "images",
                                "anchors",
                                "externalLinks",
                                "blockAttributes"
                            ]
                        }
                    );

                    WhitePaperBox.insertAdjacentHTML("afterbegin", outputHTML);

                    // @revise - revise support for anchor get dinamic elements on Functions.mjs file
                    // @priority: MEDIUM
                    setTimeout(AnchorScrool, 2000);
                    i18n.transcript();
                }
            })();
            break;

        case "you-in-control-of-your-data":
            await TemplatesReady.import;
            //
            (async () => {
                const { renderMarkdownURL, ParseFlags } = await loadMarkdown();

                let WhitePaperBox = _.DOM.getById("white-paper-container");

                if (WhitePaperBox) {
                    const outputHTML = await renderMarkdownURL(
                        "./docs/white-paper.md",
                        {
                            // HTML cru em bloco é permitido nestes documentos
                            parseFlags: ParseFlags.DEFAULT,
                            extensions: [
                                "images",
                                "anchors",
                                "externalLinks",
                                "blockAttributes"
                            ]
                        }
                    );

                    WhitePaperBox.insertAdjacentHTML("afterbegin", outputHTML);

                    // @revise - revise support for anchor get dinamic elements on Functions.mjs file
                    // @priority: MEDIUM
                    setTimeout(AnchorScrool, 2000);
                }

                const targetHash = location.hash.slice(1);
                if (
                    location.hash !== "" &&
                    ["self-security-hosted"].includes(targetHash)
                ) {
                    // @deprecated - wd.history.pushState('', dc.title, wd.location.href.replace(wd.location.hash, ''));
                    let target = null;
                    switch (targetHash) {
                        case "self-security-hosted":
                            target = _.DOM.getById("self-security-hosted");
                            break;
                    }
                    if (target) {
                        let vertical = target.getBoundingClientRect().y - 120;
                        wd.scrollTo({
                            top: vertical, // could be negative value
                            left: 0,
                            behavior: "smooth" // @see support {@link https://caniuse.com/#feat=css-scroll-behavior}
                        });
                    }
                }
                // @revise - revise support for anchor get dinamic elements on Functions.mjs file
                // @priority: MEDIUM
                AnchorScrool();
            })();
            break;

        case "policy":
            await TemplatesReady.import;
            //
            (async () => {
                // get policies containers
                let GeneralPolicyBox = _.DOM.getById(
                    "policy-container-general"
                );
                let DataStoragePolicyBox = _.DOM.getById(
                    "policy-container-storage"
                );
                let TermsPolicyBox = _.DOM.getById("policy-container-terms");
                let PrivacyPolicyBox = _.DOM.getById(
                    "policy-container-privacy"
                );

                // @revise - move this to Functions.mjs
                // @priority: MODERATE
                const PrinterJS = (_html, _injectHeader = "") => {
                    let popup = window.open(
                        "about:blank",
                        "PRINT",
                        "rel=noopener"
                    );
                    popup.opener = null;
                    popup.location = location.origin;
                    if (popup) {
                        popup.document.write(`
                            <!DOCTYPE html>
                            <html lang="${document.documentElement.lang || "en-US"}">
                            <head>
                                <title>${document.title}</title>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                                <link type="text/css" rel="stylesheet" href="${new URL("assets/vendor/bootstrapv4/bootstrap.min.css", document.baseURI).href}">
                                <link type="text/css" rel="stylesheet" href="${new URL("assets/css/main.css", document.baseURI).href}">
                                ${_injectHeader}
                            </head>
                            <body class="markdown-body">
                                <h1>${document.title}</h1>
                                ${_html}
                                <script>
                                    document.addEventListener('DOMContentLoaded', function() {
                                        window.print();
                                        window.close();
                                    }, false);
                                </script>
                            </body>
                            </html>
                        `);
                        popup.document.close();
                        popup.focus();
                    }
                    return true;
                };
                //
                if (
                    GeneralPolicyBox &&
                    !DataStoragePolicyBox &&
                    TermsPolicyBox &&
                    PrivacyPolicyBox
                ) {
                    // @revise - get terms definition from `json` language interface library
                    // @priority: HIGH
                    const { renderMarkdownURL, ParseFlags } =
                        await loadMarkdown();

                    const mdOptions = {
                        // HTML cru em bloco é permitido nestes documentos
                        parseFlags: ParseFlags.DEFAULT,
                        extensions: [
                            "tables",
                            "anchors",
                            "externalLinks",
                            "blockAttributes"
                        ]
                    };

                    // Em sequência, para não misturar chamadas ao parser
                    const policies = [];

                    for (const url of [
                        "./docs/policies/privacy.md",
                        "./docs/policies/terms.md",
                        "./docs/policies/policy.md"
                    ]) {
                        policies.push(await renderMarkdownURL(url, mdOptions));
                    }

                    await Promise.resolve(policies).then(result => {
                        let AllPolicyContentHTML = ``,
                            PolicyHeaders = [
                                `<h2>${i18n.getWord("pages.policy.privacy.heading")}</h2>`,
                                `<h2>${i18n.getWord("pages.policy.terms.heading")}</h2>`,
                                `<h2>${i18n.getWord("pages.policy.general.heading")}</h2>`
                            ];
                        [
                            PrivacyPolicyBox,
                            TermsPolicyBox,
                            GeneralPolicyBox
                        ].forEach((elm, idx, arr) => {
                            let outputHTML = result[idx];
                            AllPolicyContentHTML +=
                                PolicyHeaders[idx] + outputHTML;
                            elm.insertAdjacentHTML("afterbegin", outputHTML);

                            // in last iteraction
                            idx === arr.length - 1
                                ? (() => {
                                      elm.insertAdjacentHTML(
                                          "afterbegin",
                                          `
                                    <div class="col-12 my-2 px-0"><span class="badge badge-light border-def contrast" title="${i18n.getWord("pages.policy.badges.reading_title")}">${i18n.getWord("blog.read_time").replace("{minutes}", ReadingTextTime(result[idx]).time)}</span>
                                    <span class="badge badge-dark" title="${i18n.getWord("pages.policy.badges.version_title")}">${i18n.getWord("pages.policy.badges.version").replace("{version}", "1.0.0")}</span>
                                    <span class="badge badge-light border-def contrast mt-1 cp printable-launcher" title="${i18n.getWord("pages.policy.badges.print_title")}">${i18n.getWord("pages.policy.badges.print")}</span>`
                                      );
                                      // printer
                                      elm.querySelector(
                                          ".printable-launcher"
                                      ).addEventListener(
                                          "click",
                                          evt => {
                                              PrinterJS(AllPolicyContentHTML);
                                          },
                                          false
                                      );
                                  })()
                                : null;
                        });

                        const targetHash = location.hash.slice(1);
                        if (
                            location.hash !== "" &&
                            [
                                "policy-general",
                                "policy-terms",
                                "policy-privacy",
                                "cookie-agree"
                            ].includes(targetHash)
                        ) {
                            // @deprecated - wd.history.pushState('', dc.title, wd.location.href.replace(wd.location.hash, ''));
                            let target = null;
                            switch (targetHash) {
                                case "policy-privacy":
                                    target = _.DOM.getById(
                                        "policy-container-privacy"
                                    );
                                    break;
                                case "policy-terms":
                                    target = _.DOM.getById(
                                        "policy-container-terms"
                                    );
                                    break;
                                case "policy-general":
                                    target = _.DOM.getById(
                                        "policy-container-general"
                                    );
                                    break;
                                case "cookie-agree":
                                    target = _.DOM.getById(
                                        "policy-cookie-agree"
                                    );
                                    break;
                            }
                            if (target) {
                                let vertical =
                                    target.getBoundingClientRect().y - 120;
                                wd.scrollTo({
                                    top: vertical, // could be negative value
                                    left: 0,
                                    behavior: "smooth" // @see support {@link https://caniuse.com/#feat=css-scroll-behavior}
                                });
                            }
                        }
                        // @revise - revise support for anchor get dinamic elements on Functions.mjs file
                        // @priority: MEDIUM
                        AnchorScrool();
                    });
                } else {
                    // @revise - Notify error in request documents
                    // @priority: MODERATE
                    console.error(
                        "[POLICY]: could not load the policy documents"
                    );
                }
            })();

            let AcceptCookiesBtn = _.DOM.getById("yes-cookies-accept");

            if (AcceptCookiesBtn) {
                const GoToDisable = () => {
                    AcceptCookiesBtn.innerHTML =
                        i18n.dictionary().pages.policy.cookies.disable;
                    AcceptCookiesBtn.setAttribute("data-toggle", "modal");
                    AcceptCookiesBtn.setAttribute(
                        "data-target",
                        "#modal-clear-metadata"
                    );
                    // re-launch Bootstrap Native for this dinamic attributes
                    //BootstrapNative.initCallback(AcceptCookiesBtn.parentElement)
                    _.DOM.waitEl(dc, "#modal-clear-metadata", list => {
                        list[0]
                            ? BootstrapNative.initCallback(
                                  AcceptCookiesBtn.parentElement
                              )
                            : null;
                    });

                    const RemoveAttr = () => {
                        AcceptCookiesBtn.removeAttribute("data-toggle");
                        AcceptCookiesBtn.removeAttribute("data-target");
                    };

                    // check cookies
                    [...dc.querySelectorAll("[data-charge-type]")].forEach(
                        btn => {
                            let finish;

                            PressHoldCollorCharger(
                                btn,
                                init => {
                                    btn.classList.add(btn.dataset.chargeType);
                                },
                                end => {
                                    btn.classList.remove(
                                        btn.dataset.chargeType
                                    );
                                    if (finish) {
                                        if (
                                            btn.id === "clear-all-data-storage"
                                        ) {
                                            Policy.refuseStoragement(
                                                true /*force clear-all-data but, not cookie*/
                                            )
                                                .then(success => {
                                                    RemoveAttr();
                                                    wd.location.reload(true);
                                                    // notify
                                                })
                                                .catch(error => {
                                                    console.error(
                                                        "[POLICY]: could not clear the data storage",
                                                        error
                                                    );
                                                    // notify
                                                });
                                        } else if (
                                            btn.id === "refuse-cookie-storage"
                                        ) {
                                            Policy.refuseStoragement()
                                                .then(success => {
                                                    RemoveAttr();
                                                    wd.location.reload(true);
                                                    // notify
                                                })
                                                .catch(error => {
                                                    console.error(
                                                        "[POLICY]: could not disable cookies",
                                                        error
                                                    );
                                                    // notify
                                                });
                                        }
                                        //finish = false
                                    }
                                },
                                complete => {
                                    finish = true;
                                },
                                100
                            );
                        }
                    );
                };
                // check cookie state
                if (Policy.permission === "authorized") {
                    GoToDisable();
                } else {
                    PressHoldCollorCharger(
                        AcceptCookiesBtn,
                        init => {
                            AcceptCookiesBtn.classList.add(
                                "background-charge-success"
                            );
                        },
                        end => {
                            AcceptCookiesBtn.classList.remove(
                                "background-charge-success"
                            );
                        },
                        complete => {
                            Policy.acceptStoragement()
                                .then(success => {
                                    AcceptCookiesBtn.classList.remove(
                                        "background-charge-success"
                                    );
                                    GoToDisable();
                                    // notify
                                })
                                .catch(error => {
                                    console.error(
                                        "[POLICY]: could not enable cookies",
                                        error
                                    );
                                    // notify
                                });
                        },
                        100
                    );
                }
            }

            break;

        default:
            break;
    } // Rodapé: últimas postagens (limite: settings.articles['footer-max-list'])
    renderFooterNews(
        settings,
        document.getElementById("dinamic-footer-news"),
        PolicyHandler.language
    );

    // @revise - lazy-load global initializator?
    // @oriority: MEDIUM
    lazyLoad.observe([...dc.querySelectorAll("[data-lazy-target]")]);

    // storage policy info
    router !== "policy" && router !== "nocookie" ? DataStoragePolicy() : null;

    // @revise - random RBG ... for `footer#foothead` (change this to UIModel.mjs)
    // @priority: LESS
    let bgColor = `rgb(${[1, 2, 3].map(x => (Math.random() * 256) | 0)})`;
    try {
        // Sets the custom property on the root element, independent of stylesheet order.
        dc.documentElement.style.setProperty("--random-color", bgColor);

        let element = document.getElementById("foothead");

        // If the background color is dark, add the light-text class to it
        if (!BrightnessDetector(bgColor)) {
            element.classList.add("light-text");
        } else {
            element.classList.add("dark-text");
        }
    } catch (e) {
        /*console.log(e)*/
    }

    // fix BootstrapNative Modals for dinamic templates
    const processFixModals = (root = dc) => {
        root.querySelectorAll("[data-fix-modal]").forEach(element => {
            if (element.tagName === "A") {
                _.DOM.event(
                    element,
                    "click",
                    evt => {
                        evt.preventDefault();
                    },
                    _.EventOptions(false, false, false)
                );
            }
            let attribute = element.dataset.fixModal;
            element.removeAttribute("data-fix-modal");
            element.setAttribute("data-toggle", "modal");
            element.setAttribute("data-target", attribute);
            _.DOM.waitEl(dc, attribute, list => {
                list[0]
                    ? BootstrapNative.initCallback(element.parentElement)
                    : null;
            });
        });
    };

    processFixModals();

    // Intercepta qualquer clique em link com href="::" para nunca navegar e garantir abertura do modal
    _.DOM.event(dc, "click", evt => {
        const link =
            evt.target && evt.target.closest
                ? evt.target.closest('a[href="::"], [data-fix-modal]')
                : null;
        if (link) {
            evt.preventDefault();
            if (link.dataset.fixModal) {
                processFixModals(dc);
            }
        }
    });

    // @revise - anchor smooth (revise Functions.mjs and add dinamic elements observer filter)
    // @priority: MEDIUM
    AnchorScrool();

    i18n.transcript();
    i18n.observe(document);

    // Libera a página após a tradução inicial.
    dc.documentElement.classList.remove("i18n-loading");
    // Preferências individuais do usuário
    const preferenceSwitches = {
        "sets-media-audio": "mediaAudio",
        "sets-media-video": "mediaVideo",
        "sets-geo-stats": "geoStats",
        "sets-effect-audio": "effectAudio",
        "sets-effect-notific": "effectNotific",
        "sets-conn-notific": "connNotific",
        "sets-conn-notific2": "connNotific2"
    };

    // Estado inicial: todos os switches desligados.
    const userPreferences = {
        mediaAudio: false,
        mediaVideo: false,
        geoStats: false,
        effectAudio: false,
        effectNotific: false,
        connNotific: false,
        connNotific2: false
    };

    // Recupera as preferências salvas.
    if (DBMethods) {
        try {
            const savedPreferences = await DBMethods.read({
                tbn: "config",
                tbk: "preferences"
            });

            if (
                savedPreferences &&
                typeof savedPreferences === "object" &&
                !Array.isArray(savedPreferences)
            ) {
                Object.keys(userPreferences).forEach(key => {
                    if (typeof savedPreferences[key] === "boolean") {
                        userPreferences[key] = savedPreferences[key];
                    }
                });
            }
        } catch (error) {
            console.error("[SETUP]: Could not load user preferences", error);
        }
    }

    // Atualiza o indicador visual de cada switch.
    const renderPreferenceSwitch = (id, enabled) => {
        const element = dc.getElementById(id);
        if (!element) return;

        const indicator = element.querySelector(".preference-indicator");
        if (!indicator) return;

        indicator.textContent = enabled ? "🟢" : "🔴";
    };

    // Aplica os estados recuperados ao painel.
    Object.entries(preferenceSwitches).forEach(([id, key]) => {
        renderPreferenceSwitch(id, userPreferences[key]);
    });

    // Serializa as gravações para preservar a ordem dos cliques.
    let preferenceSaveQueue = Promise.resolve();

    // Alterna e salva a preferência acionada.
    dc.addEventListener("click", evt => {
        const element = evt.target.closest(
            "#settings-slide .preference-switch"
        );

        if (
            !element ||
            !Object.prototype.hasOwnProperty.call(
                preferenceSwitches,
                element.id
            )
        ) {
            return;
        }

        const key = preferenceSwitches[element.id];

        userPreferences[key] = !userPreferences[key];

        renderPreferenceSwitch(element.id, userPreferences[key]);

        if (!DBMethods) {
            console.error(
                "[SETUP]: IndexedDB connection unavailable; preference not saved."
            );
            return;
        }

        const preferencesToSave = { ...userPreferences };

        preferenceSaveQueue = preferenceSaveQueue
            .then(() =>
                DBMethods.update([
                    {
                        tbn: "config",
                        tbk: "preferences",
                        tbv: preferencesToSave
                    }
                ])
            )
            .catch(error => {
                console.error(
                    "[SETUP]: Could not save user preferences",
                    error
                );
            });
    });

    DrawerEvents(BrowserPermissions, Notify);

    SlideMenus();

    ColorPallet("#color-palette-container");

    //}, _.EventOptions(false, true, true), true);
};

// Executa quando o DOM estiver pronto
if (dc.readyState === "loading") {
    _.DOM.event(dc, "DOMContentLoaded", SetupDOMReady);
} else {
    SetupDOMReady();
}

// Drawer > clear modal: press and hold the button to erase all browser data.
// Independent from the cookie consent buttons on the policy page.
const bindClearAllButton = button => {
    if (button.dataset.clearBound) return;
    button.dataset.clearBound = "true";

    let completed = false;

    PressHoldCollorCharger(
        button,
        () => {
            button.classList.add("background-charge-danger");
        },
        () => {
            button.classList.remove("background-charge-danger");
            if (!completed) return;
            completed = false;
            Policy.refuseStoragement(true)
                .then(() => wd.location.reload())
                .catch(error =>
                    console.error("[SETUP]: clear all data failed", error)
                );
        },
        () => {
            completed = true;
        },
        100
    );
};

const clearAllButton = dc.getElementById("clear-all-data-storage");
if (clearAllButton) bindClearAllButton(clearAllButton);

// The modals are injected by templates: bind the button as soon as it exists.
new MutationObserver(() => {
    const button = dc.getElementById("clear-all-data-storage");
    if (button) bindClearAllButton(button);
}).observe(dc.body, { childList: true, subtree: true });

// Footoodles: inject one random item into the footer head on any page.
// Uses the settings already loaded by setup; no admin module is imported.
const injectFootoodle = () => {
    const list = settings.articles?.footoodles ?? [];
    if (!list.length) return;

    const item = list[Math.floor(Math.random() * list.length)];

    const title = document.getElementById("footer-fh-title");
    const content = document.getElementById("footer-fh-content");
    const image = document.getElementById("footer-fh-img");

    if (title) title.textContent = item.title;
    if (content) content.textContent = item.content;
    if (image) image.style.backgroundImage = `url("${item.image}")`;

    // Shows the section only when there is something to show.
    document.getElementById("foothead")?.classList.remove("d-none");
};

injectFootoodle();

// Share: uses the native share sheet when available, otherwise copies the link.
dc.addEventListener("click", async event => {
    if (!event.target.closest("#drawer-share")) return;

    const data = { title: document.title, url: location.href };

    try {
        if (navigator.share) {
            await navigator.share(data);
        } else {
            await navigator.clipboard?.writeText(location.href);
        }
    } catch (error) {
        // the user cancelled the share sheet
    }
});
