/**
 * @file Templates.mjs
 * @description HTML template and fragment builder.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */
import _, {
    IsWebBrowserContext,
    IsWebWorkerContext,
    IsServiceWorkerContext,
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
} from "../helpers/Exporter.mjs";

import IlibJS from "../lib/IlibJS.mjs";

import BootstrapNative from "../vendor/bootstrap-native.mjs";

// LazyLoadImage
import LazyLoad from "../lib/LazyLoad.mjs";

// lazy-load instance
const lazyLoad = new LazyLoad("undefined");

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
    //SpyDOM,
    PressHoldCollorCharger
} from "../functions/Functions.mjs";

/**
 * Initializes the Bootstrap Native components that have not been started yet.
 * @description Bootstrap scans the page when it loads. If the target of a button, such as a modal, comes from a template that was not inserted yet, the button would not work. This runs after the templates are inserted.
 */
const initPendingComponents = (analytics = null) => {
    try {
        document.querySelectorAll("[data-fix-modal]").forEach(element => {
            if (element.tagName === "A") {
                element.addEventListener(
                    "click",
                    evt => {
                        evt.preventDefault();
                    },
                    false
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

        const list = BootstrapNative.componentsInit;
        Object.keys(list).forEach(name => {
            const Constructor = list[name][0],
                selector = list[name][1];
            document.querySelectorAll(selector).forEach(element => {
                if (!element[name]) {
                    try {
                        new Constructor(element);
                    } catch (error) {
                        console.error(`BSN (re-init ${name}): ${error}`);
                        analytics?.trackError?.("templates", error)?.catch?.(() => {});
                    }
                }
            });
        });
    } catch (error) {
        console.warn(
            "Templates: não foi possível reiniciar os componentes do Bootstrap",
            error
        );
        analytics?.trackError?.("templates", error)?.catch?.(() => {});
    }
};

const observedTargets = new WeakSet();

/**
 * Fetches the templates of the route, applies the replacements and inserts them in the DOM.
 * @param {Object} cfg - Item of the templates list in settings.json, with source and files.
 * @param {Object} replace - Rule and replacement used by FindAndReplace.
 * @param {Object} i18n - IlibJS instance.
 * @return {Promise<void>} Resolves when all templates have been inserted.
 */
const RenderTemplate = (cfg, replace, i18n, analytics = null) => {
    let urls = [],
        param = [],
        len = cfg.files.length;

    for (let i = 0; i < len; i++) {
        urls.push(cfg.files[i].file);
        param.push({
            mode: cfg.files[i].mode,
            target: cfg.files[i].target
        });
    }

    /**
     * Fetches a template, returning an empty string for failed responses.
     * @param {string} url
     * @param {number} i - Position of the template in the list.
     * @return {Promise<string>}
     */
    let fetchResource = (url, i) => {
        return Fetch(url)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.text();
            })
            .then(text => {
                return FindAndReplace(
                    replace.rule,
                    replace.replacement,
                    text,
                    i18n
                );
            })
            .catch(error => {
                console.warn(
                    `Templates: não foi possível carregar "${url}"`,
                    error
                );
                analytics?.trackError?.("templates", error)?.catch?.(() => {});
                return undefined;
            });
    };

    /**
     * Observes a DOM node with a single MutationObserver per target.
     * @param {Node} node
     * @param {Function} callback
     * @param {MutationObserverInit} options
     * @description Repeated calls for the same node are ignored.
     */
    let SpyDOM = (node, callback, options) => {
        if (observedTargets.has(node)) {
            return;
        }
        observedTargets.add(node);
        new MutationObserver(callback).observe(node, options);
    };

    // request resource
    return Promise.all(urls.map(fetchResource)).then(response => {
        response.forEach((item, i, array) => {
            // refuse "undefined"
            if (item) {
                let target = _.DOM.querySelector(param[i].target);
                if (!target) {
                    console.warn(
                        `Templates: alvo "${param[i].target}" não encontrado`
                    );
                    analytics?.trackError?.(
                        "templates",
                        new Error(`Target "${param[i].target}" not found`)
                    )?.catch?.(() => {});
                    return;
                }
                // initialize MutationObserver
                SpyDOM(
                    target,
                    mutations => {
                        mutations.forEach(mutation => {
                            [...mutation.addedNodes].forEach(addedNode => {
                                if (/element/g.test(_.type(addedNode))) {
                                    [
                                        ..._.DOM.querySelectorAll(
                                            '[class^="i18n"]:not([translated])',
                                            addedNode
                                        )
                                    ].forEach(node => {
                                        i18n.subtree(node);
                                    });
                                    // search all lazy-load(s) elements
                                    lazyLoad.observe(addedNode);
                                }
                            });
                        });
                    },
                    { childList: true }
                );
                switch (param[i].mode) {
                    case "insertBefore":
                        target.insertAdjacentHTML("beforebegin", item);
                        break;
                    case "insertAfter":
                        target.insertAdjacentHTML("afterend", item);
                        break;
                    case "append":
                        target.insertAdjacentHTML("beforeend", item);
                        break;
                    case "prepend":
                        target.insertAdjacentHTML("afterbegin", item);
                        break;
                }
            }
        });
    });
};

/**
 *
 */
export default class Templates {
    /**
     * @param  {Array}  templates configurações dos templates
     * @param  {Object} replace   regras de substituição
     * @param  {Object} iLib      instância do IlibJS
     */
    constructor(templates = [], replace = false, iLib = false, analytics = null) {
        this.templates = templates;
        this.replace = !!replace
            ? replace
            : {
                  rule: [],
                  replacement: []
              };
        this.iLib = iLib && iLib instanceof IlibJS ? iLib : new IlibJS("i18n");
        this.analytics = analytics || null;
    }

    /**
     *
     */
    get import() {
        const route = PathName(true);

        const currentRoute =
            route === "index"
                ? "/"
                : route.endsWith("/index")
                  ? `/${route.slice(0, -5)}`
                  : `/${route}`;

        const jobs = [];

        this.templates.forEach(item => {
            const source = item.source;

            const matches = _.isString(source)
                ? source === "*" || source === currentRoute
                : _.isArray(source) && source.includes(currentRoute);

            if (matches) {
                jobs.push(RenderTemplate(item, this.replace, this.iLib, this.analytics));
            }
        });

        // permite aguardar: await TemplatesReady.import
        return Promise.all(jobs).then(results => {
            initPendingComponents(this.analytics);
            return results;
        });
    }
}
