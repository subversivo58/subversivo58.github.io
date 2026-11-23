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

const THEME_STORAGE_KEY = "theme";

const normalizeTheme = value => (value === "dark" ? "dark" : "light");

const getSavedTheme = () => {
    try {
        return normalizeTheme(LocalStorage.get(THEME_STORAGE_KEY));
    } catch (error) {
        return "light";
    }
};

const syncDrawerThemeButtons = theme => {
    const normalized = normalizeTheme(theme);
    const darkBtn = dc.getElementById("drawer-theme-dark");
    const lightBtn = dc.getElementById("drawer-theme-light");

    if (darkBtn) {
        darkBtn.classList.toggle("d-none", normalized === "dark");
        darkBtn.setAttribute("aria-pressed", String(normalized === "dark"));
    }

    if (lightBtn) {
        lightBtn.classList.toggle("d-none", normalized === "light");
        lightBtn.setAttribute("aria-pressed", String(normalized === "light"));
    }
};

const applyTheme = (theme, { persist = false } = {}) => {
    const normalized = normalizeTheme(theme);

    dc.documentElement.dataset.theme = normalized;
    dc.documentElement.classList.toggle("theme-dark", normalized === "dark");
    dc.documentElement.style.colorScheme = normalized;

    const themeColorMeta = dc.querySelector('meta[name="theme-color"]');
    if (themeColorMeta) {
        if (!themeColorMeta.dataset.lightColor) {
            themeColorMeta.dataset.lightColor =
                themeColorMeta.getAttribute("content") || "#1ebfff";
        }
        themeColorMeta.setAttribute(
            "content",
            normalized === "dark"
                ? "#1a2027"
                : themeColorMeta.dataset.lightColor
        );
    }

    syncDrawerThemeButtons(normalized);

    if (persist) {
        try {
            LocalStorage.set(THEME_STORAGE_KEY, normalized);
        } catch (error) {
            console.error("[THEME]: could not save theme preference", error);
        }
    }

    return normalized;
};

applyTheme(getSavedTheme());

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

    // Destaca blocos de código imediatamente sem depender de i18n, templates ou API do GitHub.
    const postCodeEnhancementsPromise =
        router === "post"
            ? (async () => {
                  const box = dc.getElementById("index-central-block");
                  if (!box) return;
                  try {
                      const [{ highlightCodeBlocks }, { default: CodeCopy }] =
                          await Promise.all([
                              import("./modules/lib/Highlight.mjs"),
                              import("./modules/lib/CodeCopy.mjs")
                          ]);
                      highlightCodeBlocks(box, {
                          autoDetect: true,
                          normalizeBarePre: true
                      });
                      const codeCopy = CodeCopy(
                          "#index-central-block",
                          "#code-copy-wrapper-template"
                      );
                      codeCopy();
                  } catch (error) {
                      console.error(
                          "[POST]: Failed to highlight code blocks.",
                          error
                      );
                  }

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
                          console.error("[POST]: Failed to copy code.", error);
                      }
                  });
              })()
            : Promise.resolve();

    PolicyHandler.supported = settings.source.language;
    dc.documentElement.lang = PolicyHandler.language;
    await i18n.get(`/assets/lang/${PolicyHandler.language}.json`, {
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
                            Redirect("/policy.html#cookie-agree");
                            break;
                        case "cookie-policy":
                            Redirect("/policy.html#policy-general");
                            break;
                        case "terms-policy":
                            Redirect("/policy.html#policy-terms");
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
                badage: "/assets/media/image/icons/badage-monochrome.webp",
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

    // Alternância de tema claro/escuro pelo botão do Drawer
    dc.addEventListener("click", evt => {
        const trigger = evt.target.closest(
            "#drawer-theme-dark, #drawer-theme-light"
        );
        if (!trigger) return;

        const nextTheme = trigger.id === "drawer-theme-dark" ? "dark" : "light";
        applyTheme(nextTheme, { persist: true });
    });

    _.DOM.waitEl(dc, "#drawer-theme", () => {
        syncDrawerThemeButtons(dc.documentElement.dataset.theme);
    });

    // router
    switch (router) {
        case "index":
        case "dpo":
        case "about":
        case "admin":
        case "blog":
        case "post":
        case "404":
        case "nocookie": {
            // check URI "search" fragment
            if (location.search === "?utm_source=homescreen") {
                // is pwa launch ... register log
            }

            await TemplatesReady.import;
            // Exibe o atalho administrativo quando existe uma autenticação OAuth.
            const adminShortcut = dc.getElementById("drawer-admin");
            let adminAuth = false;

            if (DBMethods) {
                try {
                    const storedAuth = await DBMethods.read({
                        tbn: "config",
                        tbk: "user-github"
                    });

                    adminAuth = Boolean(
                        storedAuth?.user && storedAuth?.tokens?.access_token
                    );
                } catch (error) {
                    console.error(
                        "[ADMIN]: Não foi possível consultar a autenticação.",
                        error
                    );
                }
            }

            if (adminShortcut && adminAuth) {
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

            // Utilitários compartilhados entre postagens e blog
            const escHTML = text =>
                String(text ?? "").replace(
                    /[&<>"]/g,
                    char =>
                        ({
                            "&": "&amp;",
                            "<": "&lt;",
                            ">": "&gt;",
                            '"': "&quot;"
                        })[char]
                );

            const AUTHOR_CACHE_PREFIX = "subversivo58:author:";

            const readAuthorCache = key => {
                try {
                    const raw = sessionStorage.getItem(
                        AUTHOR_CACHE_PREFIX + key
                    );
                    return raw ? JSON.parse(raw) : null;
                } catch {
                    return null;
                }
            };

            const writeAuthorCache = (key, author) => {
                try {
                    sessionStorage.setItem(
                        AUTHOR_CACHE_PREFIX + key,
                        JSON.stringify(author)
                    );
                } catch {
                    // Armazenamento indisponível: segue sem cache.
                }
            };

            const authorRequests = new Map();

            const fetchAuthor = id => {
                if (!id) return Promise.resolve(null);

                const key = String(id);
                const cached = readAuthorCache(key);
                if (cached) return Promise.resolve(cached);

                if (authorRequests.has(key)) {
                    return authorRequests.get(key);
                }

                const request = fetch(
                    `https://api.github.com/user/${encodeURIComponent(key)}`,
                    { headers: { Accept: "application/vnd.github+json" } }
                )
                    .then(response => (response.ok ? response.json() : null))
                    .then(user => {
                        if (!user || !user.login) return null;
                        const profile = String(user.html_url || "");
                        return {
                            login: String(user.login),
                            name: String(user.name || user.login),
                            avatar: String(user.avatar_url || ""),
                            url: /^https:\/\/github\.com\//.test(profile)
                                ? profile
                                : `https://github.com/${encodeURIComponent(user.login)}`
                        };
                    })
                    .catch(error => {
                        console.error("[BLOG]: Failed to load author.", error);
                        return null;
                    })
                    .finally(() => {
                        authorRequests.delete(key);
                    });

                authorRequests.set(key, request);

                request.then(author => {
                    if (author) writeAuthorCache(key, author);
                });

                return request;
            };

            const formatDateLocale = timestamp => {
                if (!timestamp) return "";
                const date = new Date(timestamp);
                if (Number.isNaN(date.getTime())) return "";
                return date.toLocaleDateString(PolicyHandler.language, {
                    dateStyle: "medium"
                });
            };

            if (router === "post") {
                const box = document.getElementById("index-central-block");

                if (box) {
                    box.querySelectorAll("time[datetime]").forEach(el => {
                        const formatted = formatDateLocale(
                            el.getAttribute("datetime")
                        );
                        if (formatted) el.textContent = formatted;
                    });

                    box.querySelectorAll("[data-post-reading-time]").forEach(
                        el => {
                            const mins = Number(el.dataset.postReadingTime);
                            if (Number.isFinite(mins) && mins > 0) {
                                el.textContent = i18n
                                    .getWord("blog.read_time")
                                    .replace("{minutes}", Math.ceil(mins));
                            }
                        }
                    );

                    box.querySelectorAll("[data-post-updated]").forEach(el => {
                        const formatted = formatDateLocale(
                            el.dataset.postUpdated
                        );
                        if (formatted) {
                            el.textContent = i18n
                                .getWord("blog.updated")
                                .replace("{date}", formatted);
                        }
                    });

                    const renderAuthorBadge = author => {
                        const displayName = author.name || author.login;
                        return `
                            <span class="blog-author-badge">
                                <picture class="blog-author-avatar-wrap flex-shrink-0">
                                    <img src="/assets/media/image/1x1.gif"
                                         data-src="${escHTML(author.avatar)}"
                                         data-lazy-target
                                         alt="${escHTML(displayName)}"
                                         width="22"
                                         height="22"
                                         class="blog-author-avatar">
                                </picture>
                                <a href="${escHTML(author.url)}"
                                   target="_blank"
                                   rel="noopener noreferrer"
                                   title="@${escHTML(author.login)}"
                                   class="ext-link-icon blog-author-link">${escHTML(displayName)}</a>
                            </span>`;
                    };

                    const authorBox = document.getElementById(
                        "post-author-container"
                    );
                    const metaAuthor = document.querySelector(
                        'meta[name="post-author"]'
                    )?.content;
                    const authorId =
                        authorBox?.dataset.authorId || metaAuthor || "";

                    if (authorBox && authorId) {
                        const author = await fetchAuthor(authorId);
                        if (author) {
                            authorBox.innerHTML = renderAuthorBadge(author);
                            authorBox.classList.remove("d-none");
                            lazyLoad.observe(authorBox);
                        }
                    }

                    await postCodeEnhancementsPromise;

                    lazyLoad.observe(box);
                }
            }

            if (router === "blog") {
                const box = document.getElementById("index-central-block");

                const getPostTimestamp = post => {
                    const timestamp = Number(post.timestamp);
                    if (Number.isFinite(timestamp) && timestamp > 0) {
                        return timestamp > 1e12 ? timestamp : timestamp * 1000;
                    }
                    const date = Number(post.date);
                    return Number.isFinite(date) && date > 0 ? date * 1000 : 0;
                };

                const posts = [...settings.articles.storage].sort(
                    (a, b) => getPostTimestamp(b) - getPostTimestamp(a)
                );
                const maxList =
                    Number(settings.articles["blog-max-list"]) || 10;

                const allTags = [
                    ...new Set(
                        posts
                            .flatMap(p => (Array.isArray(p.tags) ? p.tags : []))
                            .map(t => String(t).trim().toLowerCase())
                            .filter(Boolean)
                    )
                ].sort();

                let activeTag = "";
                let searchQuery = "";
                let visible = maxList;

                if (posts.length === 0) {
                    box.innerHTML = `
                        <div class="container d-flex align-items-center justify-content-center text-center py-5">
                            <div>
                                <div class="display-3 mb-3" aria-hidden="true">📰</div>
                                <p class="i18n lead text-muted mb-0" data-i18n-html="blog.empty">${escHTML(i18n.getWord("blog.empty"))}</p>
                            </div>
                        </div>`;
                } else {
                    const getFiltered = () =>
                        posts.filter(post => {
                            const tags = Array.isArray(post.tags)
                                ? post.tags.map(t => String(t).toLowerCase())
                                : [];
                            if (activeTag && !tags.includes(activeTag))
                                return false;
                            if (!searchQuery) return true;
                            const haystack = [
                                post.title,
                                post.summary,
                                post.slug,
                                ...tags
                            ]
                                .join(" ")
                                .toLowerCase();
                            return haystack.includes(searchQuery);
                        });

                    const normalizeMs = value => {
                        const num = Number(value);
                        if (!Number.isFinite(num) || num <= 0) return 0;
                        return num > 1e12 ? num : num * 1000;
                    };

                    const cardHTML = post => {
                        const postPath = `/${String(post.path || `posts/${post.slug}.html`).replace(/^\/+/, "")}`;
                        const rawCover =
                            post.cover ||
                            (Array.isArray(post.images) ? post.images[0] : "");
                        const coverUrl = rawCover
                            ? `/${String(rawCover).replace(/^\/+/, "")}`
                            : "/assets/media/image/graph.webp";
                        const publishedMs = getPostTimestamp(post);
                        const modifiedMs = normalizeMs(post.lastModified);
                        const publishedIso = publishedMs
                            ? new Date(publishedMs).toISOString()
                            : "";
                        const modifiedIso = modifiedMs
                            ? new Date(modifiedMs).toISOString()
                            : "";
                        const dateText = formatDateLocale(publishedMs);
                        const updatedFormatted =
                            modifiedMs &&
                            publishedMs &&
                            modifiedMs !== publishedMs
                                ? formatDateLocale(modifiedMs)
                                : "";
                        const updatedText = updatedFormatted
                            ? i18n
                                  .getWord("blog.updated")
                                  .replace("{date}", updatedFormatted)
                            : "";
                        const mins =
                            Number(post.readingTime) > 0
                                ? Math.ceil(Number(post.readingTime))
                                : 1;
                        const readText = i18n
                            .getWord("blog.read_time")
                            .replace("{minutes}", mins);
                        const tags = Array.isArray(post.tags) ? post.tags : [];
                        const authorId = post.author ? String(post.author) : "";

                        return `
                            <div class="col-12 col-md-6 mb-4">
                                <article class="card rounded-0 h-100 border blog-post-card">
                                    <a href="${escHTML(postPath)}" class="d-block blog-post-media">
                                        <picture class="d-block w-100 h-100">
                                            <img src="/assets/media/image/1x1.gif"
                                                 data-src="${escHTML(coverUrl)}"
                                                 data-lazy-target
                                                 alt="${escHTML(post.title)}"
                                                 class="w-100 h-100">
                                        </picture>
                                    </a>
                                    <div class="card-body d-flex flex-column">
                                        ${authorId ? `<div class="mb-2 d-none" data-blog-author="${escHTML(authorId)}"></div>` : ""}
                                        <div class="small text-muted mb-2 blog-post-meta">
                                            <div>
                                                ${dateText ? `<time datetime="${escHTML(publishedIso)}">${escHTML(dateText)}</time>` : ""}
                                                ${dateText ? `<span class="mx-1" aria-hidden="true">&middot;</span>` : ""}
                                                <span>${escHTML(readText)}</span>
                                            </div>
                                            ${updatedText ? `<div class="blog-post-updated" data-post-updated="${escHTML(modifiedIso)}">${escHTML(updatedText)}</div>` : ""}
                                        </div>
                                        <h2 class="h5 font-weight-bold mb-2">
                                            <a href="${escHTML(postPath)}" class="text-dark">${escHTML(post.title)}</a>
                                        </h2>
                                        <p class="small text-muted mb-3 flex-grow-1">${escHTML(post.summary || "")}</p>
                                        ${
                                            tags.length
                                                ? `
                                            <div class="d-flex flex-wrap mb-3">
                                                ${tags.map(tag => `<span class="badge badge-light border mr-1 mb-1 font-weight-normal">${escHTML(tag)}</span>`).join("")}
                                            </div>`
                                                : ""
                                        }
                                        <div class="mt-auto pt-2 border-top">
                                            <a href="${escHTML(postPath)}" class="i18n btn btn-sm btn-outline-info rounded-0 cp" data-i18n-html="blog.read_article">${escHTML(i18n.getWord("blog.read_article"))}</a>
                                        </div>
                                    </div>
                                </article>
                            </div>`;
                    };

                    box.innerHTML = `
                        <div class="container py-3">
                            <header class="d-flex flex-column flex-md-row align-items-md-center justify-content-between mb-4 pb-3 border-bottom">
                                <div class="mb-2 mb-md-0">
                                    <h1 class="i18n h3 mb-0 tc" data-i18n-html="navbar.blog">${escHTML(i18n.getWord("navbar.blog"))}</h1>
                                </div>
                                <div class="w-100" style="max-width: 340px;">
                                    <input type="search"
                                           id="blog-search-input"
                                           class="i18n form-control form-control-sm rounded-0"
                                           data-i18n-place="blog.search_placeholder"
                                           placeholder="${escHTML(i18n.getWord("blog.search_placeholder"))}"
                                           autocomplete="off">
                                </div>
                            </header>

                            ${
                                allTags.length
                                    ? `
                                <div id="blog-tag-filters" class="d-flex flex-wrap align-items-center mb-4">
                                    <button type="button"
                                            data-blog-tag=""
                                            class="i18n btn btn-sm btn-outline-secondary rounded-0 mr-2 mb-2 blog-tag-filter active cp"
                                            data-i18n-html="blog.all_tags">${escHTML(i18n.getWord("blog.all_tags"))}</button>
                                    ${allTags
                                        .map(
                                            tag => `
                                        <button type="button"
                                                data-blog-tag="${escHTML(tag)}"
                                                class="btn btn-sm btn-outline-secondary rounded-0 mr-2 mb-2 blog-tag-filter cp">${escHTML(tag)}</button>
                                    `
                                        )
                                        .join("")}
                                </div>`
                                    : ""
                            }

                            <div id="blog-empty-filter" class="p-4 text-center border bg-light text-muted mb-4" hidden>
                                <span class="i18n" data-i18n-html="blog.no_results">${escHTML(i18n.getWord("blog.no_results"))}</span>
                            </div>

                            <div id="blog-list" class="row"></div>

                            <p id="blog-count" class="small text-muted ct mt-2 mb-0" hidden></p>
                            <button type="button"
                                    id="blog-more"
                                    class="i18n btn btn-outline-secondary btn-block rounded-0 cp mt-3"
                                    data-i18n-html="blog.load_more"
                                    hidden>${escHTML(i18n.getWord("blog.load_more"))}</button>
                        </div>`;

                    const listEl = document.getElementById("blog-list");
                    const emptyEl =
                        document.getElementById("blog-empty-filter");
                    const countEl = document.getElementById("blog-count");
                    const moreEl = document.getElementById("blog-more");
                    const searchInput =
                        document.getElementById("blog-search-input");
                    const tagsWrap =
                        document.getElementById("blog-tag-filters");

                    const hydrateCardAuthors = () => {
                        const slots = [
                            ...listEl.querySelectorAll("[data-blog-author]")
                        ];
                        const uniqueIds = [
                            ...new Set(
                                slots
                                    .map(el => el.dataset.blogAuthor)
                                    .filter(Boolean)
                            )
                        ];

                        uniqueIds.forEach(async id => {
                            const author = await fetchAuthor(id);
                            if (!author) return;

                            const displayName = author.name || author.login;
                            const badgeHTML = `
                                <span class="blog-author-badge">
                                    <picture class="blog-author-avatar-wrap flex-shrink-0">
                                        <img src="/assets/media/image/1x1.gif"
                                             data-src="${escHTML(author.avatar)}"
                                             data-lazy-target
                                             alt="${escHTML(displayName)}"
                                             width="22"
                                             height="22"
                                             class="blog-author-avatar">
                                    </picture>
                                    <a href="${escHTML(author.url)}"
                                       target="_blank"
                                       rel="noopener noreferrer"
                                       title="@${escHTML(author.login)}"
                                       class="ext-link-icon blog-author-link">${escHTML(displayName)}</a>
                                </span>`;

                            listEl
                                .querySelectorAll("[data-blog-author]")
                                .forEach(slot => {
                                    if (slot.dataset.blogAuthor !== id) return;
                                    slot.innerHTML = badgeHTML;
                                    slot.classList.remove("d-none");
                                });

                            lazyLoad.observe(listEl);
                        });
                    };

                    const renderCatalog = () => {
                        const filtered = getFiltered();
                        const shown = Math.min(visible, filtered.length);

                        if (emptyEl) emptyEl.hidden = filtered.length > 0;
                        listEl.innerHTML = filtered
                            .slice(0, shown)
                            .map(cardHTML)
                            .join("");

                        if (countEl) {
                            countEl.textContent = i18n
                                .getWord("blog.showing")
                                .replace("{shown}", shown)
                                .replace("{total}", filtered.length);
                            countEl.hidden = filtered.length <= maxList;
                        }

                        if (moreEl) {
                            moreEl.hidden = shown >= filtered.length;
                        }

                        hydrateCardAuthors();
                        lazyLoad.observe(listEl);
                    };

                    if (searchInput) {
                        searchInput.addEventListener("input", () => {
                            searchQuery = searchInput.value
                                .trim()
                                .toLowerCase();
                            visible = maxList;
                            renderCatalog();
                        });
                    }

                    if (tagsWrap) {
                        tagsWrap.addEventListener("click", evt => {
                            const btn = evt.target.closest("[data-blog-tag]");
                            if (!btn) return;
                            activeTag = btn.dataset.blogTag || "";
                            tagsWrap
                                .querySelectorAll("[data-blog-tag]")
                                .forEach(el => {
                                    el.classList.toggle("active", el === btn);
                                });
                            visible = maxList;
                            renderCatalog();
                        });
                    }

                    if (moreEl) {
                        moreEl.addEventListener("click", () => {
                            visible += maxList;
                            renderCatalog();
                        });
                    }

                    renderCatalog();
                }
            }

            if (router === "admin") {
                const [
                    { default: WysiwygEditor },
                    { default: GitHubAPI },
                    { default: DeveloperTools }
                ] = await Promise.all([
                    import("./modules/models/WysiwygEditor.mjs"),
                    import("./modules/lib/GitHubAPI.mjs"),
                    import("./modules/lib/DeveloperTools.mjs")
                ]);

                const DevTools = new DeveloperTools({
                    database: DBMethods,
                    databaseName: settings.database.name,
                    databaseVersion: settings.database.version
                });

                const REPOSITORY_OWNER = settings.github_auth.repository_owner;
                const REPOSITORY_NAME = settings.github_auth.repository_name;
                const REPOSITORY_BRANCH = "main";
                const TOKEN_REFRESH_MARGIN_MS = 5 * 60 * 1000;

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

                const dashMessage = id => {
                    const item = dc.querySelector(
                        `#admin-dashboard-messages [data-msg="${id}"]`
                    );
                    return item ? item.textContent.trim() : "";
                };

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
                    !copyDiagnosticsButton
                ) {
                    throw new Error(
                        "[ADMIN]: Elementos do modal de autenticação do GitHub não encontrados."
                    );
                }

                const githubAuthModal = new BootstrapNative.Modal(modal);
                let currentGitHubUser = null;
                let refreshInFlight = null;

                const showAuthError = error => {
                    const message =
                        error instanceof Error ? error.message : String(error);
                    statusElement.textContent =
                        authMessage("github_auth_failed");
                    diagnosticsElement.textContent = message;
                    errorElement.hidden = false;
                    console.error("[ADMIN AUTH]:", error);
                };

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

                const renderAdminGitHubIdentity = user => {
                    if (!user || typeof user !== "object") return;
                    currentGitHubUser = user;

                    const profileURL =
                        user.profile_url || user.html_url || user.url || "";

                    const sideAvatar = dc.getElementById("admin-github-avatar");
                    const sideName = dc.getElementById("admin-github-name");
                    const sideLogin = dc.getElementById("admin-github-login");

                    if (sideAvatar) {
                        sideAvatar.dataset.src = user.avatar_url || "";
                        sideAvatar.alt = user.name || user.login || "GitHub";
                        if (user.avatar_url) lazyLoad.observe([sideAvatar]);
                    }
                    if (sideName)
                        sideName.textContent = user.name || user.login || "";
                    if (sideLogin)
                        sideLogin.textContent = user.login
                            ? `@${user.login}`
                            : "";

                    const sessAvatar = dc.getElementById(
                        "admin-session-avatar"
                    );
                    const sessName = dc.getElementById("admin-session-name");
                    const sessLogin = dc.getElementById("admin-session-login");
                    const sessId = dc.getElementById("admin-session-id");
                    const sessProfile = dc.getElementById(
                        "admin-session-profile"
                    );
                    const sessEmail = dc.getElementById("admin-session-email");

                    if (sessAvatar) {
                        sessAvatar.dataset.src = user.avatar_url || "";
                        sessAvatar.alt = user.name || user.login || "GitHub";
                        if (user.avatar_url) lazyLoad.observe([sessAvatar]);
                    }
                    if (sessName)
                        sessName.textContent = user.name || user.login || "";
                    if (sessLogin)
                        sessLogin.textContent = user.login
                            ? `@${user.login}`
                            : "";
                    if (sessId) sessId.textContent = String(user.id ?? "");
                    if (sessProfile) {
                        sessProfile.textContent = profileURL;
                        sessProfile.href = profileURL || "#";
                    }
                    if (sessEmail) sessEmail.textContent = user.email || "—";
                };

                const renderSessionDetails = storedAuth => {
                    const tokens = storedAuth?.tokens || {};
                    const scopeEl = dc.getElementById("admin-session-scope");
                    const obtainedEl = dc.getElementById(
                        "admin-session-obtained"
                    );
                    const expiresEl = dc.getElementById(
                        "admin-session-expires"
                    );
                    const statusBadge = dc.getElementById(
                        "admin-session-status-badge"
                    );
                    const navDot = dc.getElementById("admin-session-nav-dot");

                    if (scopeEl)
                        scopeEl.textContent = tokens.scope || "default";

                    const obtainedAt = Number(tokens.obtained_at);
                    const expiresIn = Number(tokens.expires_in);

                    if (obtainedEl) {
                        obtainedEl.textContent =
                            Number.isFinite(obtainedAt) && obtainedAt > 0
                                ? new Date(obtainedAt).toLocaleString(
                                      PolicyHandler.language
                                  )
                                : "—";
                    }

                    let dotClass = "is-ok";
                    let badgeClass = "badge-success";
                    let statusKey = "status_active";

                    if (
                        Number.isFinite(expiresIn) &&
                        expiresIn > 0 &&
                        Number.isFinite(obtainedAt) &&
                        obtainedAt > 0
                    ) {
                        const expiresAt = obtainedAt + expiresIn * 1000;
                        if (expiresEl) {
                            expiresEl.textContent = new Date(
                                expiresAt
                            ).toLocaleString(PolicyHandler.language);
                        }
                        const remaining = expiresAt - Date.now();
                        if (remaining <= 0) {
                            dotClass = "is-err";
                            badgeClass = "badge-danger";
                            statusKey = "status_expired";
                        } else if (remaining <= TOKEN_REFRESH_MARGIN_MS) {
                            dotClass = "is-warn";
                            badgeClass = "badge-warning";
                            statusKey = "status_expiring";
                        }
                    } else {
                        if (expiresEl)
                            expiresEl.textContent =
                                dashMessage("status_no_expiry") || "—";
                    }

                    if (statusBadge) {
                        statusBadge.className = `badge ${badgeClass}`;
                        statusBadge.textContent = dashMessage(statusKey);
                    }
                    if (navDot) {
                        navDot.className = `admin-status-dot ml-auto ${dotClass}`;
                    }
                };

                const loadSessionDiagnostics = async () => {
                    const diagPre = dc.getElementById(
                        "admin-session-diagnostics"
                    );
                    if (!diagPre) return;

                    try {
                        const response = await fetch(
                            "/admin-auth/diagnostics",
                            {
                                cache: "no-store",
                                credentials: "same-origin"
                            }
                        );
                        if (!response.ok)
                            throw new Error(`HTTP ${response.status}`);
                        const payload = await response.json();
                        const entries = Array.isArray(payload?.entries)
                            ? payload.entries
                            : [];

                        if (!entries.length) {
                            diagPre.textContent =
                                dashMessage("diagnostics_empty");
                            return;
                        }

                        diagPre.textContent = entries
                            .slice(-40)
                            .map(
                                entry =>
                                    `[${entry.time}] ${entry.stage} (${entry.status}): ${entry.details}`
                            )
                            .join("\n");
                    } catch {
                        diagPre.textContent = dashMessage("diagnostics_error");
                    }
                };

                const openReauthModal = messageText => {
                    GitHubAPIInstance = null;
                    introElement.hidden = false;
                    identityElement.hidden = true;
                    if (messageText) {
                        statusElement.textContent = messageText;
                    }
                    githubAuthModal.show();
                };

                const performTokenRefresh = async () => {
                    const response = await fetch("/admin-auth/refresh", {
                        method: "POST",
                        credentials: "same-origin",
                        cache: "no-store"
                    });

                    let payload = null;
                    try {
                        payload = await response.json();
                    } catch {
                        payload = null;
                    }

                    if (!response.ok || !payload?.ok) {
                        const err = new Error(
                            payload?.message || `HTTP ${response.status}`
                        );
                        err.reauthRequired = Boolean(
                            payload?.reauth_required || response.status === 401
                        );
                        throw err;
                    }

                    const updatedAuth = await DBMethods.read({
                        tbn: "config",
                        tbk: "user-github"
                    });

                    if (
                        !updatedAuth?.user ||
                        !updatedAuth?.tokens?.access_token
                    ) {
                        const err = new Error(
                            "Credenciais renovadas não encontradas no IndexedDB."
                        );
                        err.reauthRequired = true;
                        throw err;
                    }

                    GitHubAPIInstance = new GitHubAPI({
                        token: updatedAuth.tokens.access_token
                    });
                    renderAdminGitHubIdentity(updatedAuth.user);
                    renderSessionDetails(updatedAuth);
                    return true;
                };

                const ensureValidGitHubSession = async (
                    forceRefresh = false
                ) => {
                    if (!DBMethods) return false;

                    const run = async () => {
                        const storedAuth = await DBMethods.read({
                            tbn: "config",
                            tbk: "user-github"
                        });

                        const user = storedAuth?.user;
                        const tokens = storedAuth?.tokens;
                        const token = tokens?.access_token;

                        if (!user || !token) {
                            openReauthModal(authMessage("github_auth_failed"));
                            return false;
                        }

                        const obtainedAt = Number(tokens.obtained_at);
                        const expiresIn = Number(tokens.expires_in);
                        const isExpiring =
                            Number.isFinite(expiresIn) &&
                            expiresIn > 0 &&
                            Number.isFinite(obtainedAt) &&
                            obtainedAt > 0 &&
                            Date.now() >=
                                obtainedAt +
                                    expiresIn * 1000 -
                                    TOKEN_REFRESH_MARGIN_MS;

                        if (forceRefresh || isExpiring) {
                            if (!tokens.refresh_token) {
                                if (forceRefresh) {
                                    openReauthModal(
                                        dashMessage("reauth_needed")
                                    );
                                    return false;
                                }
                            } else {
                                try {
                                    return await performTokenRefresh();
                                } catch (error) {
                                    console.error(
                                        "[ADMIN AUTH REFRESH]:",
                                        error
                                    );
                                    if (error.reauthRequired) {
                                        openReauthModal(
                                            dashMessage("reauth_needed")
                                        );
                                    }
                                    return false;
                                }
                            }
                        }

                        if (!GitHubAPIInstance) {
                            const api = new GitHubAPI({ token });
                            try {
                                await api.GHInstance.getUser().getProfile();
                                GitHubAPIInstance = api;
                                renderAdminGitHubIdentity(user);
                                renderSessionDetails(storedAuth);
                            } catch (error) {
                                if (
                                    error?.response?.status === 401 &&
                                    tokens.refresh_token
                                ) {
                                    try {
                                        return await performTokenRefresh();
                                    } catch (refreshErr) {
                                        openReauthModal(
                                            dashMessage("reauth_needed")
                                        );
                                        return false;
                                    }
                                }
                                if (error?.response?.status === 401) {
                                    openReauthModal(
                                        dashMessage("reauth_needed")
                                    );
                                    return false;
                                }
                                throw error;
                            }
                        }

                        return Boolean(GitHubAPIInstance);
                    };

                    if (refreshInFlight) return refreshInFlight;

                    refreshInFlight = run().finally(() => {
                        refreshInFlight = null;
                    });
                    return refreshInFlight;
                };

                const loadAdminGitHubAuth = async () => {
                    if (!DBMethods) {
                        throw new Error(
                            "IndexedDB indisponível. Não foi possível recuperar a autenticação."
                        );
                    }

                    const storedAuth = await DBMethods.read({
                        tbn: "config",
                        tbk: "user-github"
                    });

                    const user = storedAuth?.user;
                    const token = storedAuth?.tokens?.access_token;

                    if (!user || !token) {
                        GitHubAPIInstance = null;
                        introElement.hidden = false;
                        identityElement.hidden = true;
                        githubAuthModal.show();
                        return;
                    }

                    const ok = await ensureValidGitHubSession(false);
                    if (ok && currentGitHubUser) {
                        statusElement.textContent = authMessage(
                            "github_auth_authenticated",
                            currentGitHubUser.login || ""
                        );
                    }
                };

                statusElement.textContent = authMessage(
                    "github_auth_verifying"
                );

                try {
                    await loadAdminGitHubAuth();
                } catch (error) {
                    GitHubAPIInstance = null;
                    githubAuthModal.show();
                    showAuthError(error);
                }

                // Navegação do Dashboard Unificado + Sidebar Responsiva
                const sidebar = dc.getElementById("admin-sidebar");
                const sidebarToggle = dc.getElementById("admin-sidebar-toggle");
                const sidebarClose = dc.getElementById("admin-sidebar-close");
                const sidebarBackdrop = dc.getElementById(
                    "admin-sidebar-backdrop"
                );

                const setSidebarOpen = open => {
                    if (!sidebar) return;
                    sidebar.classList.toggle("is-open", open);
                    if (sidebarBackdrop) sidebarBackdrop.hidden = !open;
                    if (sidebarToggle)
                        sidebarToggle.setAttribute(
                            "aria-expanded",
                            String(open)
                        );
                };

                if (sidebarToggle) {
                    sidebarToggle.addEventListener("click", () => {
                        setSidebarOpen(!sidebar?.classList.contains("is-open"));
                    });
                }
                if (sidebarClose) {
                    sidebarClose.addEventListener("click", () =>
                        setSidebarOpen(false)
                    );
                }
                if (sidebarBackdrop) {
                    sidebarBackdrop.addEventListener("click", () =>
                        setSidebarOpen(false)
                    );
                }

                const views = {
                    posts: dc.getElementById("admin-view-posts"),
                    editor: dc.getElementById("admin-view-editor"),
                    footoodles: dc.getElementById("admin-view-footoodles"),
                    session: dc.getElementById("admin-view-session"),
                    credentials: dc.getElementById("admin-view-credentials"),
                    devtools: dc.getElementById("admin-view-devtools")
                };

                const showAdminView = viewName => {
                    const target = views[viewName] ? viewName : "posts";

                    if (target === "devtools") {
                        loadDevTools();
                    }
                    Object.entries(views).forEach(([key, section]) => {
                        if (section) section.hidden = key !== target;
                    });

                    const activeNavKey = target === "editor" ? "posts" : target;
                    dc.querySelectorAll("[data-admin-nav]").forEach(btn => {
                        const isMatch = btn.dataset.adminNav === activeNavKey;
                        btn.classList.toggle("active", isMatch);
                        btn.setAttribute("aria-selected", String(isMatch));
                    });

                    setSidebarOpen(false);

                    if (target === "session") {
                        DBMethods?.read({ tbn: "config", tbk: "user-github" })
                            .then(
                                stored => stored && renderSessionDetails(stored)
                            )
                            .catch(() => {});
                        loadSessionDiagnostics();
                    }
                };
                const devToolsRoot = views.devtools;

                const devToolsText = (key, fallback) => {
                    const value = i18n.getWord(
                        `admin_dashboard.devtools.${key}`
                    );
                    return value && value !== `admin_dashboard.devtools.${key}`
                        ? value
                        : fallback;
                };

                const devToolsButton = (action, label, attributes = "") => `
    <button
        type="button"
        class="btn btn-sm btn-outline-danger rounded-0 mt-2"
        data-devtools-action="${action}"
        ${attributes}>
        ${escHTML(label)}
    </button>
`;

                const devToolsError = error => `
    <p class="text-danger mb-0">
        ${escHTML(error?.message || String(error))}
    </p>
`;

                const devToolsServiceWorkers = document.createElement("div");
                devToolsServiceWorkers.className = "col-12 mb-4";
                devToolsServiceWorkers.innerHTML = `
    <div class="card rounded-0 border">
        <div class="card-header bg-white py-2">
            <h3 class="h6 mb-0">Service Workers</h3>
        </div>
        <div class="card-body">
            <div id="admin-devtools-service-workers" class="small"></div>
        </div>
    </div>
`;

                devToolsRoot
                    .querySelector(".row")
                    ?.prepend(devToolsServiceWorkers);

                const renderServiceWorkers = result => {
                    const root = dc.getElementById(
                        "admin-devtools-service-workers"
                    );

                    if (!root) return;

                    if (!result.registrations.length) {
                        root.textContent = "Nenhum Service Worker registrado.";
                        return;
                    }

                    root.innerHTML = result.registrations
                        .map(
                            registration => `
        <article class="border-bottom pb-3 mb-3">
            <p class="font-weight-bold mb-1">
                ${escHTML(registration.scope)}
            </p>

            ${["active", "waiting", "installing"]
                .map(state => {
                    const worker = registration[state];

                    return worker
                        ? `
                    <div class="mb-1">
                        <strong>${state}:</strong>
                        ${escHTML(worker.state)}
                        <div class="text-muted text-break">
                            ${escHTML(worker.scriptURL)}
                        </div>
                    </div>
                `
                        : "";
                })
                .join("")}

            ${devToolsButton(
                "unregister-sw",
                "Desregistrar",
                `data-scope="${escHTML(registration.scope)}"`
            )}
        </article>
    `
                        )
                        .join("");
                };

                const renderIndexedDB = result => {
                    const root = dc.getElementById("admin-devtools-indexeddb");

                    if (!root) return;

                    if (!result.databases.length) {
                        root.textContent = "Nenhum banco IndexedDB encontrado.";
                        return;
                    }

                    root.innerHTML = result.databases
                        .map(
                            database => `
        <article class="border-bottom pb-3 mb-3">
            <p class="font-weight-bold mb-1">
                ${escHTML(database.name)}
            </p>

            <p class="text-muted mb-1">
                Versão: ${escHTML(database.version ?? "—")}
            </p>

            ${
                database.isApplicationDatabase
                    ? `
                <p class="text-success mb-1">
                    Banco da aplicação
                </p>

                <strong>Object Stores:</strong>

                <ul class="mb-0">
                    ${(database.objectStores || [])
                        .map(
                            store => `
                        <li>${escHTML(store)}</li>
                    `
                        )
                        .join("")}
                </ul>
            `
                    : `
                ${devToolsButton(
                    "delete-db",
                    "Excluir banco",
                    `data-name="${escHTML(database.name)}"`
                )}
            `
            }
        </article>
    `
                        )
                        .join("");
                };

                const renderCaches = result => {
                    const root = dc.getElementById(
                        "admin-devtools-cache-storage"
                    );

                    if (!root) return;

                    if (!result.caches.length) {
                        root.textContent = "Nenhum cache encontrado.";
                        return;
                    }

                    root.innerHTML = result.caches
                        .map(
                            cache => `
        <article class="border-bottom pb-3 mb-3">
            <p class="font-weight-bold mb-1">
                ${escHTML(cache.name)}
            </p>

            <p class="text-muted mb-2">
                Entradas: ${cache.count}
            </p>

            <ul class="mb-2 pl-3">
                ${cache.entries
                    .map(
                        url => `
                    <li class="text-break">${escHTML(url)}</li>
                `
                    )
                    .join("")}
            </ul>

            ${devToolsButton(
                "delete-cache",
                "Excluir cache",
                `data-name="${escHTML(cache.name)}"`
            )}
        </article>
    `
                        )
                        .join("");
                };

                const renderWebStorage = result => {
                    const root = dc.getElementById(
                        "admin-devtools-local-storage"
                    );

                    if (!root) return;

                    const renderArea = (name, storage) => `
        <section class="mb-4">
            <h4 class="h6">${name}</h4>

            <p class="text-muted mb-2">
                Registros: ${storage.count}
            </p>

            ${
                storage.entries.length
                    ? `
                ${storage.entries
                    .map(
                        entry => `
                    <div class="border-bottom py-2">
                        <strong class="text-break">
                            ${escHTML(entry.key)}
                        </strong>

                        <pre class="small bg-light border p-2 mt-1 mb-0 text-break">${escHTML(entry.value)}</pre>
                    </div>
                `
                    )
                    .join("")}
            `
                    : `
                <p class="text-muted">Nenhum registro.</p>
            `
            }

            ${devToolsButton(
                "clear-storage",
                `Limpar ${name}`,
                `data-type="${name}"`
            )}
        </section>
    `;

                    root.innerHTML =
                        renderArea("Local Storage", result.localStorage) +
                        renderArea("Session Storage", result.sessionStorage);
                };

                const renderCookies = result => {
                    const root = dc.getElementById("admin-devtools-cookies");

                    if (!root) return;

                    if (!result.cookies.length) {
                        root.textContent =
                            "Nenhum cookie acessível encontrado.";
                        return;
                    }

                    root.innerHTML = result.cookies
                        .map(
                            cookie => `
        <article class="border-bottom pb-3 mb-3">
            <strong>${escHTML(cookie.name)}</strong>

            <pre class="small bg-light border p-2 mt-1 text-break">${escHTML(cookie.value)}</pre>

            <p class="text-muted mb-1">
                Domínio: ${escHTML(cookie.domain || "—")}
            </p>

            <p class="text-muted mb-1">
                Caminho: ${escHTML(cookie.path || "—")}
            </p>

            <p class="text-muted mb-1">
                SameSite: ${escHTML(cookie.sameSite || "—")}
            </p>

            ${devToolsButton(
                "delete-cookie",
                "Excluir cookie",
                `data-name="${escHTML(cookie.name)}"
                 data-domain="${escHTML(cookie.domain || "")}"
                 data-path="${escHTML(cookie.path || "/")}"`
            )}
        </article>
    `
                        )
                        .join("");
                };

                let devToolsLoading = false;

                const loadDevTools = async () => {
                    if (devToolsLoading || !devToolsRoot) return;

                    devToolsLoading = true;

                    try {
                        const result = await DevTools.refresh();

                        const renderers = {
                            serviceWorkers: renderServiceWorkers,
                            indexedDB: renderIndexedDB,
                            caches: renderCaches,
                            webStorage: renderWebStorage,
                            cookies: renderCookies
                        };

                        Object.entries(renderers).forEach(([name, render]) => {
                            const error = result.errors[name];

                            if (error) {
                                const target = {
                                    serviceWorkers:
                                        "admin-devtools-service-workers",
                                    indexedDB: "admin-devtools-indexeddb",
                                    caches: "admin-devtools-cache-storage",
                                    webStorage: "admin-devtools-local-storage",
                                    cookies: "admin-devtools-cookies"
                                }[name];

                                const element = dc.getElementById(target);

                                if (element) {
                                    element.innerHTML = devToolsError(
                                        error.message
                                    );
                                }

                                return;
                            }

                            if (result.data[name]) {
                                render(result.data[name]);
                            }
                        });
                    } catch (error) {
                        console.error("[DEVTOOLS]:", error);
                    } finally {
                        devToolsLoading = false;
                    }
                };

                devToolsRoot.addEventListener("click", async event => {
                    const button = event.target.closest(
                        "[data-devtools-action]"
                    );

                    if (!button) return;

                    const action = button.dataset.devtoolsAction;

                    try {
                        button.disabled = true;

                        switch (action) {
                            case "unregister-sw": {
                                const scope = button.dataset.scope;

                                if (
                                    !confirm(
                                        `Desregistrar este Service Worker?\n${scope}`
                                    )
                                ) {
                                    return;
                                }

                                await DevTools.unregisterServiceWorker(scope);
                                break;
                            }

                            case "delete-db": {
                                const name = button.dataset.name;

                                if (
                                    !confirm(
                                        `Excluir o banco IndexedDB "${name}"?`
                                    )
                                ) {
                                    return;
                                }

                                await DevTools.deleteIndexedDB(name);
                                break;
                            }

                            case "delete-cache": {
                                const name = button.dataset.name;

                                if (!confirm(`Excluir o cache "${name}"?`)) {
                                    return;
                                }

                                await DevTools.deleteCache(name);
                                break;
                            }

                            case "clear-storage": {
                                const type = button.dataset.type;

                                if (
                                    !confirm(
                                        `Limpar todo o conteúdo de ${type}?`
                                    )
                                ) {
                                    return;
                                }

                                DevTools.clearStorage(type);
                                break;
                            }

                            case "delete-cookie": {
                                const name = button.dataset.name;
                                const domain = button.dataset.domain;
                                const path = button.dataset.path;

                                if (!confirm(`Excluir o cookie "${name}"?`)) {
                                    return;
                                }

                                await DevTools.deleteCookie({
                                    name,
                                    ...(domain ? { domain } : {}),
                                    ...(path ? { path } : {})
                                });

                                break;
                            }

                            default:
                                return;
                        }

                        await loadDevTools();
                    } catch (error) {
                        console.error("[DEVTOOLS]: Operation failed.", error);
                        alert(error?.message || String(error));
                    } finally {
                        button.disabled = false;
                    }
                });

                window.__adminShowView = showAdminView;

                dc.querySelectorAll("[data-admin-nav]").forEach(btn => {
                    btn.addEventListener("click", () => {
                        showAdminView(btn.dataset.adminNav);
                    });
                });

                const mobileNewPost = dc.getElementById(
                    "admin-mobile-new-post"
                );
                if (mobileNewPost) {
                    mobileNewPost.addEventListener("click", () => {
                        dc.getElementById("admin-new-post")?.click();
                    });
                }

                const sessionRefreshBtn = dc.getElementById(
                    "admin-session-refresh"
                );
                const sessionRefreshStatus = dc.getElementById(
                    "admin-session-refresh-status"
                );
                if (sessionRefreshBtn) {
                    sessionRefreshBtn.addEventListener("click", async () => {
                        sessionRefreshBtn.disabled = true;
                        if (sessionRefreshStatus) {
                            sessionRefreshStatus.hidden = false;
                            sessionRefreshStatus.className =
                                "small mt-2 mb-0 text-muted";
                            sessionRefreshStatus.textContent =
                                dashMessage("refreshing");
                        }

                        const ok = await ensureValidGitHubSession(true);
                        sessionRefreshBtn.disabled = false;

                        if (sessionRefreshStatus) {
                            sessionRefreshStatus.hidden = false;
                            sessionRefreshStatus.className = `small mt-2 mb-0 ${ok ? "text-success" : "text-danger"}`;
                            sessionRefreshStatus.textContent = ok
                                ? dashMessage("refreshed")
                                : dashMessage("refresh_failed");
                        }
                        loadSessionDiagnostics();
                    });
                }

                const diagRefreshBtn = dc.getElementById(
                    "admin-session-diagnostics-refresh"
                );
                if (diagRefreshBtn) {
                    diagRefreshBtn.addEventListener(
                        "click",
                        loadSessionDiagnostics
                    );
                }

                SlideMenus();
                AnchorScrool();

                const editorRoot = dc.getElementById("admin-post-editor");

                const wysiwygEditor = new WysiwygEditor({
                    root: editorRoot,
                    db: DBMethods,
                    permissions: BrowserPermissions,
                    translate: () => i18n.transcript(),
                    getAuthorId: () =>
                        currentGitHubUser?.id
                            ? String(currentGitHubUser.id)
                            : "",

                    onCreate: async post => {
                        try {
                            const sessionOk =
                                await ensureValidGitHubSession(false);
                            if (!sessionOk || !GitHubAPIInstance) {
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

                            const executeCommit = async () => {
                                const api = GitHubAPIInstance;
                                api.setRepo(REPOSITORY_OWNER, REPOSITORY_NAME);
                                await api.setBranch(REPOSITORY_BRANCH);
                                return api.pushFiles(
                                    `Post: ${post.operation || "create"} "${post.title || post.slug}"`,
                                    post.files
                                );
                            };

                            let response;
                            try {
                                response = await executeCommit();
                            } catch (commitError) {
                                if (commitError?.response?.status === 401) {
                                    const renewed =
                                        await ensureValidGitHubSession(true);
                                    if (!renewed) {
                                        throw new Error(
                                            dashMessage("reauth_needed") ||
                                                "Sessão expirada."
                                        );
                                    }
                                    response = await executeCommit();
                                } else {
                                    throw commitError;
                                }
                            }

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

                wysiwygEditor.mount();

                // Footoodles admin em painel isolado
                const { default: Footoodles } =
                    await import("./modules/models/Footoodles.mjs");

                const footoodles = new Footoodles({
                    getApi: () => GitHubAPIInstance,
                    ensureSession: ensureValidGitHubSession,
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
                    listEl: dc.getElementById("admin-footoodles-list"),
                    badgeEl: dc.getElementById("admin-footoodles-badge"),
                    emptyEl: dc.getElementById("admin-footoodles-empty"),
                    editorRoot: dc.getElementById("admin-footoodle-editor")
                });
            }
            break;
        }

        case "control":
            break;

        case "donations":
            await TemplatesReady.import;
            setTimeout(AnchorScrool, 500);
            i18n.transcript();
            break;

        case "copyright":
            await TemplatesReady.import;
            setTimeout(AnchorScrool, 500);
            i18n.transcript();
            break;

        case "you-in-control-of-your-data": {
            await TemplatesReady.import;
            const targetHash = location.hash.slice(1);
            if (targetHash === "self-security-hosted") {
                const target = _.DOM.getById("self-security-hosted");
                if (target) {
                    const vertical = target.getBoundingClientRect().y - 120;
                    wd.scrollTo({
                        top: vertical,
                        left: 0,
                        behavior: "smooth"
                    });
                }
            }
            AnchorScrool();
            break;
        }

        case "policy": {
            await TemplatesReady.import;
            (() => {
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

                const PrinterJS = (_html, _injectHeader = "") => {
                    let popup = window.open(
                        "about:blank",
                        "PRINT",
                        "rel=noopener"
                    );
                    if (popup) {
                        popup.opener = null;
                        popup.location = location.origin;
                        popup.document.write(`
                            <!DOCTYPE html>
                            <html lang="${document.documentElement.lang || "en-US"}">
                            <head>
                                <title>${document.title}</title>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                                <link type="text/css" rel="stylesheet" href="/assets/vendor/bootstrapv4/bootstrap.min.css">
                                <link type="text/css" rel="stylesheet" href="/assets/css/main.css">
                                ${_injectHeader}
                            </head>
                            <body class="markdown-body post-content">
                                <h1>${document.title}</h1>
                                ${_html}
                                <script>
                                    document.addEventListener('DOMContentLoaded', function() {
                                        window.print();
                                        window.close();
                                    }, false);
                                <\/script>
                            </body>
                            </html>
                        `);
                        popup.document.close();
                        popup.focus();
                    }
                    return true;
                };

                if (
                    GeneralPolicyBox &&
                    !DataStoragePolicyBox &&
                    TermsPolicyBox &&
                    PrivacyPolicyBox
                ) {
                    const PolicyHeaders = [
                        `<h2>${i18n.getWord("pages.policy.privacy.heading")}</h2>`,
                        `<h2>${i18n.getWord("pages.policy.terms.heading")}</h2>`,
                        `<h2>${i18n.getWord("pages.policy.general.heading")}</h2>`
                    ];
                    const boxes = [
                        PrivacyPolicyBox,
                        TermsPolicyBox,
                        GeneralPolicyBox
                    ];
                    const AllPolicyContentHTML = boxes
                        .map((elm, idx) => PolicyHeaders[idx] + elm.innerHTML)
                        .join("");

                    if (
                        !GeneralPolicyBox.querySelector(".printable-launcher")
                    ) {
                        const generalText = GeneralPolicyBox.textContent || "";
                        GeneralPolicyBox.insertAdjacentHTML(
                            "afterbegin",
                            `
                            <div class="col-12 my-2 px-0">
                                <span class="badge badge-light border-def contrast" title="${i18n.getWord("pages.policy.badges.reading_title")}">${i18n.getWord("blog.read_time").replace("{minutes}", ReadingTextTime(generalText).time)}</span>
                                <span class="badge badge-dark" title="${i18n.getWord("pages.policy.badges.version_title")}">${i18n.getWord("pages.policy.badges.version").replace("{version}", "1.0.0")}</span>
                                <span class="badge badge-light border-def contrast mt-1 cp printable-launcher" title="${i18n.getWord("pages.policy.badges.print_title")}">${i18n.getWord("pages.policy.badges.print")}</span>
                            </div>`
                        );
                    }

                    const printBtn = GeneralPolicyBox.querySelector(
                        ".printable-launcher"
                    );
                    if (printBtn) {
                        printBtn.addEventListener(
                            "click",
                            () => {
                                PrinterJS(AllPolicyContentHTML);
                            },
                            false
                        );
                    }

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
                                target = _.DOM.getById("policy-cookie-agree");
                                break;
                        }
                        if (target) {
                            let vertical =
                                target.getBoundingClientRect().y - 120;
                            wd.scrollTo({
                                top: vertical,
                                left: 0,
                                behavior: "smooth"
                            });
                        }
                    }

                    AnchorScrool();
                } else {
                    console.error("[POLICY]: policy containers not found");
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
        }

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
    if (image)
        image.style.backgroundImage = `url("/${String(item.image || "").replace(/^\/+/, "")}")`;

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
// Limpa as credenciais OAuth do GitHub pelos botões da sidebar e da visão de sessão.
const handleGitHubCredentialsClear = async event => {
    const button = event.target.closest(
        "#admin-github-credentials-clear, " + "#admin-session-credentials-clear"
    );

    if (!button) return;

    const confirmText =
        dc
            .querySelector(
                '#admin-dashboard-messages [data-msg="clear_confirm"]'
            )
            ?.textContent?.trim() || "Clear GitHub credentials?";

    if (!wd.confirm(confirmText)) return;

    if (!DBMethods) {
        console.error(
            "[ADMIN]: IndexedDB indisponível; não foi possível limpar as credenciais."
        );
        return;
    }

    button.disabled = true;

    try {
        await fetch("/admin-auth/logout", {
            method: "POST",
            credentials: "same-origin"
        }).catch(() => null);

        await DBMethods.delete({
            tbn: "config",
            tbk: "user-github"
        });

        // Recarrega o painel sem a autenticação anterior.
        wd.location.reload();
    } catch (error) {
        button.disabled = false;

        console.error(
            "[ADMIN]: Não foi possível limpar as credenciais do GitHub.",
            error
        );
    }
};

dc.addEventListener("click", handleGitHubCredentialsClear);
