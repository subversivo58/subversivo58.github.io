/**
 * HTML Templates Maker
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import _, {
    IsWebBrowserContext,
    IsWebWorkerContext,
    IsServiceWorkerContext,
    noop, dc, wd, nv, sw, ua, ls, ss, ot, dt, ts,
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
} from '../helpers/Exporter.mjs'

import IlibJS from '../lib/IlibJS.mjs'

// Bootstrap Native (mesma instância carregada pelo setup.mjs)
import BootstrapNative from '../vendor/bootstrap-native.mjs'

// LazyLoadImage
import LazyLoad from '../lib/LazyLoad.mjs'

// lazy-load instance
const lazyLoad = new LazyLoad('undefined');

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
} from '../functions/Functions.mjs'

/**
 * Ativa os componentes do Bootstrap Native que ainda não foram iniciados.
 * O Bootstrap varre a página assim que carrega; se o alvo de um botão (ex.: um modal) vem de um template
 * ainda não inserido, o botão ficava sem função. Aqui ele é iniciado depois que os templates entram.
 */
const initPendingComponents = () => {
    try {
        // Converte e previne navegação em links [data-fix-modal] vindos dos templates
        document.querySelectorAll('[data-fix-modal]').forEach(element => {
            if ( element.tagName === 'A' ) {
                element.addEventListener('click', evt => {
                    evt.preventDefault()
                }, false)
            }
            let attribute = element.dataset.fixModal;
            element.removeAttribute('data-fix-modal')
            element.setAttribute('data-toggle', 'modal')
            element.setAttribute('data-target', attribute)
            _.DOM.waitEl(dc, attribute, list => {
                list[0] ? BootstrapNative.initCallback(element.parentElement) : null;
            })
        })

        const list = BootstrapNative.componentsInit
        Object.keys(list).forEach(name => {
            const Constructor = list[name][0],
                  selector    = list[name][1]
            document.querySelectorAll(selector).forEach(element => {
                if ( !element[name] ) {
                    try {
                        new Constructor(element)
                    } catch (error) {
                        console.error(`BSN (re-init ${name}): ${error}`)
                    }
                }
            })
        })
    } catch (error) {
        console.warn('Templates: não foi possível reiniciar os componentes do Bootstrap', error)
    }
}

// alvos que já têm um MutationObserver (evita observers duplicados no mesmo alvo)
const observedTargets = new WeakSet()

/**
 * Busca os templates da rota, aplica as substituições e insere no DOM
 * @param  {Object} cfg     item de "templates" do settings.json ({source, files})
 * @param  {Object} replace {rule, replacement} usados pelo FindAndReplace
 * @param  {Object} i18n    instância do IlibJS
 * @return {Promise}        resolve quando todos os templates foram inseridos
 */
const RenderTemplate = (cfg, replace, i18n) => {
    let urls = [],
        param = [],
        len = cfg.files.length
    for (let i = 0; i < len; i++) {
         urls.push(cfg.files[i].file);
         param.push({
            mode: cfg.files[i].mode,
            target: cfg.files[i].target
         })
    }

    // se falhar (rede ou HTTP != 2xx) devolve undefined e a página segue sem esse template
    let fetchResource = (url, i) => {
        return Fetch(`${BaseRoot}assets/tpl/${url}`).then(response => {
            if ( !response.ok ) {
                throw new Error(`HTTP ${response.status}`)
            }
            return response.text()
        }).then(text => {
            return FindAndReplace(replace.rule, replace.replacement, text, i18n)
        }).catch(error => {
            console.warn(`Templates: não foi possível carregar "${url}"`, error)
            return undefined
        })
    }

    let SpyDOM = (node, callback, options) => {
        // um único observer por alvo
        if ( observedTargets.has(node) ) {
            return
        }
        observedTargets.add(node)
        new MutationObserver(callback).observe(node, options)
    }

    // request resource
    return Promise.all(urls.map(fetchResource)).then(response => {
        response.forEach((item, i, array) => {
            // refuse "undefined"
            if ( item ) {

                let target = _.DOM.querySelector(param[i].target)
                if ( !target ) {
                    console.warn(`Templates: alvo "${param[i].target}" não encontrado`)
                    return
                }
                // initialize MutationObserver
                SpyDOM(target, mutations => {
                    mutations.forEach(mutation => {
                        [...mutation.addedNodes].forEach(addedNode => {
                            if ( /element/g.test(_.type(addedNode)) ) {
                                [..._.DOM.querySelectorAll('[class^="i18n"]:not([translated])', addedNode)].forEach(node => {
                                    i18n.subtree(node)
                                });
                                // search all lazy-load(s) elements
                                lazyLoad.observe(addedNode);
                            }
                        })
                    })
                }, {childList: true})
                switch (param[i].mode) {
                    case 'insertBefore':
                        target.insertAdjacentHTML('beforebegin', item)
                    break
                    case 'insertAfter':
                        target.insertAdjacentHTML('afterend', item)
                    break
                    case 'append':
                        target.insertAdjacentHTML('beforeend', item)
                    break
                    case 'prepend':
                        target.insertAdjacentHTML('afterbegin', item)
                    break
                }
            }
        })
    })
}

/**
 *
 */
export default class Templates {
    /**
     * [constructor description]
     * @param  {Array}  templates [description]
     * @param  {[type]} iLib      [description]
     * @return {[type]}           [description]
     */
    constructor(templates = [], replace = false, iLib = false) {
        this.templates = templates
        this.replace = !(!replace) ? replace : {
            rule: [],
            replacement: []
        }
        this.iLib = (iLib && iLib instanceof IlibJS) ? iLib : new IlibJS('i18n')
    }

    /**
     * [import description]
     * @return {[type]} [description]
     */
    get import() {

        const route = PathName(true)
        const jobs = []

        this.templates.forEach(item => {

            // single {String} route
            if ( _.isString(item.source) ) {
                switch (item.source) {
                   // same route
                   case route:
                       jobs.push(RenderTemplate(item, this.replace, this.iLib))
                       break
                   // wildcard resources route
                   case '*':
                       jobs.push(RenderTemplate(item, this.replace, this.iLib))
                       break
                }
            }
            // Array of routes
            if ( _.isArray(item.source) ) {
                item.source.forEach(target => {
                    if ( target === route ) {
                        jobs.push(RenderTemplate({
                            source: route,
                            files: item.files
                        }, this.replace, this.iLib))
                    }
                })
            }
        })

        // permite aguardar: await TemplatesReady.import
        return Promise.all(jobs).then(results => {
            initPendingComponents()
            return results
        })
    }
}