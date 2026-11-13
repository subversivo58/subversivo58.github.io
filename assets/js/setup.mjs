
/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
'use strict'
  
// Console de depuração (liga sozinho quando <meta name="DEBUG" content="true">).
// Fica como primeiro import para registrar os erros dos módulos seguintes.
import './modules/lib/DebugConsole.mjs'


// Carrega as configurações sempre com dados atualizados do servidor.
const settingsResponse = await fetch(
    new URL('../../config/settings.json', import.meta.url),
    {
        cache: 'no-store'
    }
)

if (!settingsResponse.ok) {
    throw new Error(
        `[SETUP]: Failed to load settings.json (${settingsResponse.status})`
    )
}

const settings = await settingsResponse.json()


// helpers
import _, {
    IsWebBrowserContext,
    IsWebWorkerContext,
    IsServiceWorkerContext,
    IsFrameBox,
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
} from './modules/helpers/Exporter.mjs'

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
} from './modules/functions/Functions.mjs'

import MarkdownEditor from './modules/models/MarkdownEditor.mjs'
import { loadMarkdown } from './modules/lib/MarkdownKit.mjs'

//import GitHubAPI from './modules/lib/GitHubAPI.mjs'

let GitHubAPIInstance = null


// vendors
import BootstrapNative from './modules/vendor/bootstrap-native.mjs'

// LazyLoadImage
import LazyLoad from './modules/lib/LazyLoad.mjs'

// libs
import {
    Emitter,
    CryptoHandler,
    GitHubAPI,
    AWCookies,
    AWStorage,
    AWCache,
    AWClearBrowserStoragement,
    AWIndexedDB,
    IlibJS
} from './modules/lib/Exporter.mjs'

// Cookies desativados: este site não funciona nesse modo, mostra a página explicativa
if ( !navigator.cookieEnabled && PathName(true) !== 'nocookie' ) {
    location.replace('/nocookie.html')
}

const LocalStorage = AWStorage()

import PolicyHandler from './modules/models/PolicyHandler.mjs'

import Templates from './modules/models/Templates.mjs'

// Postagens recentes (carrossel da home e resumo no rodapé)
import { renderFooterNews, renderIndexCarousel } from './modules/models/RecentPosts.mjs'

import indexedDBLogs from './modules/lib/IndexedLogs.mjs'

import { DrawerEvents, SlideMenus } from './modules/models/UIHandler.mjs'


// logging
const SetupLog = new indexedDBLogs('[SETUP]: ')




// IndexedDB manager
const ConnectionDB = new AWIndexedDB(
    settings.database.name,
    settings.database.version,
    noop
)

// Shared database connection
let DBMethods = null

try {


DBMethods = await ConnectionDB.open(
    settings.database.indexed
)



  


    

  
    // Inject the shared connection into the logger.
    SetupLog.setConnection(DBMethods)

    SetupLog.success('IndexedDB connection established', {
        database: settings.database.name,
        version: settings.database.version,
        stores: settings.database.indexed.map(item => item.tbn)
    })
    
} catch (error) {

    console.error(
        '[SETUP]: IndexedDB initialization failed',
        error
    )

}




// LifeCycle
import LifeCycle from './modules/core/LifeCycle.mjs'

const Activity = new LifeCycle()

const Policy = Activity.create(
    new PolicyHandler('Subversivo58_Policy', SetupLog)
)

Policy.onchange(data => {
    console.log(data)
})

Policy.resume()




let BaseRootRegExp = new RegExp(BaseRoot),
    redirectAfterSetup = (dc.referrer !== '') ? (dc.referrer.includes(BaseRoot) ? dc.referrer : BaseRoot) : BaseRoot,
    SettingsCFG

// Instance and "mode" (i18n|l10n|Intl)
const i18n = new IlibJS('i18n')

// Tradução em tempo de execução (texto montado por JavaScript).
// Sem a chave no dicionário usa o texto padrão; {nome} é trocado por vars.nome.
const tr = (key, fallback, vars = {}) => {
    const word = i18n.getWord(key)
    const text = (typeof word === 'string' && word) ? word : fallback

    return text.replace(/\{(\w+)\}/g, (match, name) => name in vars ? vars[name] : match)
}


const Events = new Emitter('setup')

import NotifyJS from './modules/lib/Notifications.mjs'

import Permissions from './modules/lib/Permissions.mjs'

const BrowserPermissions = new Permissions();

const Notify = new NotifyJS({


  permissions: BrowserPermissions,
    watchPermissions: true,
    player: SoundPlay,
    translate: tr,
    //logger: NotifyLogger.loging,
    // only for "bootstraped" template
    gui: {
        /**
         * Axis direction: mobile as detected by `isMobile()` detection or all screen less than 576 width
         * rb = right & bottom (default) [for non-mobile view]
         * rt = right & top (default for mobile view)[mobile/desktop]
         * lb = left & bottom [for non-mobile view]
         * lt = left & top [mobile/desktop]
         * @type {String}
         */
        axis: 'rb',
        /**
         * Order vertical direction: inverted in mobile (mobile show from top to down, desktop show from bottom to up)
         * fl = first last (default) [desktop last is show in first down, mobile is show on first up]
         * fe = first end [desktop last show in top, mobile last show in down]
         * @type {String}
         */
        order: 'fl',
        /**
         * User settings: enable or disable user choices (default: enabled all)
         * @note: user choices is precedent as settings: axis, order, sound
         */
        choices: {
            mute: true,  // user mute sound (default: true = enabled to choice)
            axis: true,  // user choose "axis" ... the same options as axis up
            order: true, // user choose "order" ... the same options as order up
            dir: true,   // user choose "text direction" (default left to right) [left to right or right to left]
            /**
             * User choose auto collapse big texts and (or) images
             */
            collapse: {
                text: true,
                image: true
            }
        }
    }
})


/**
 * Change border-bottom of fixed navbar
 * @see  scroll {@link https://stackoverflow.com/questions/4096863/how-to-get-and-set-the-current-web-page-scroll-position#28488360}
 * @revise - change to `IntersectionObserver()` (if disponible)
 * @priority: LESS
 */
_.DOM.waitEl(dc, '#navbar-fixed' , list => {
    if ( list[0] && _.DOM.isVisible(list[0]) ) {
        let DocumentTop = 0
        _.DOM.event(wd, 'scroll', function(ev) {
            ev.stopPropagation()
            let observ = dc.documentElement.scrollTop || dc.body.scrollTop
            if ( observ > 10 ) {
                _.$('#navbar-fixed').addClass('navbar-box-shadow')
            }
            if ( observ < 10 ) {
                _.$('#navbar-fixed').removeClass('navbar-box-shadow')
            }
            DocumentTop = observ
        }, _.EventOptions(false, true, false))
    }
})


if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/ServiceWorker.mjs', {
        type: 'module'
    });
}


const SetupDOMReady = async evt => {

// After HTMLDocument is charged and parsed [don't wait charge stylesheet's, images and subframe's]
//_.DOM.event(dc, 'DOMContentLoaded', async evt => {




  // One-time browser storage cleanup
if (location.search === '?clear-site-data=1') {

    // Remove the trigger to prevent repeated execution
    wd.history.replaceState(
        null,
        '',
        wd.location.pathname + wd.location.hash
    );

    try {
        await Policy.refuseStoragement(true);

        console.log('[SETUP]: Browser storagement cleared');

    } catch (error) {
        console.error('[SETUP]: Browser storagement cleanup failed', error);
    }

    wd.location.reload();
    return;
}



  // this route
    const router = PathName(true)

  dc.documentElement.lang = PolicyHandler.language
    await i18n.get(`${BaseRoot}assets/lang/${PolicyHandler.language}.json`, {
        credentials: 'include',
        cache: 'reload'
    })

    const TemplatesReady = new Templates(settings.templates, {
        rule: [
           'full_year',
           'source_version_canonical',
           'disable_on_policy'
        ],
        replacement: [
            new Date().getFullYear(),
            settings.source.version.canonical,
            function() {
              return (router === 'policy') ? 'disabled="disabled"' : ''
            }
        ]
    }, i18n)





    // lazy-load instance
    const lazyLoad = new LazyLoad('undefined');
    // @revise - move this to PolicyInspector.mjs class constructor
    // @priority: MODERATE
    const DataStoragePolicy = () => {
        AWCookies.get('__DSPolicy__').catch(() => {
            //console.log('???')
            // @revise defaulted "english" message
            // @priority: HIGH
const DSNotify = new NotifyJS({
    permissions: BrowserPermissions,
    watchPermissions: false
});
            // action event
            DSNotify.on('click', data => {
                //console.log(data)
                if ( 'action' in data ) {
                    switch( data.action ) {
                        case 'cookie-agree':
                           Redirect('policy.html#cookie-agree');
                            break;
                        case 'cookie-policy':
                           Redirect('policy.html#policy-general');
                            break;
                        case 'terms-policy':
                           Redirect('policy.html#policy-terms')
                           break;
                    }
                }
            });

            let NotifyI18nStorage = i18n.dictionary().notify.storage
            // @revise - create notification and show ()
            DSNotify.create({
                title: NotifyI18nStorage.title,
                body: NotifyI18nStorage.body,
                badage: 'assets/media/image/icons/badage-monochrome.webp',
                actions: NotifyI18nStorage.actions,
                bootstrap: {
                    pinned: true
                }
            }).show();
        });
    }




            ;[...dc.querySelectorAll('.parallax')].forEach(obj => {
                let speed = obj.dataset.parallaxSpeed || 3;
                wd.addEventListener('scroll', evt => {
                    let yPos = 2*((wd.pageYOffset || dc.body.scrollTop) / speed).toFixed(2)
                    obj.style.backgroundPosition = '0 -' + yPos + 'px'
                }, _.EventOptions(false, true, false))
            })




    // Troca de idioma (pop-up do drawer)
    // O idioma escolhido é um cookie funcional ("i18n"), lido pelo PolicyHandler.language.
    // Depois de salvar, a página é recarregada para aplicar a tradução.
    dc.addEventListener('click', async evt => {

        // Ao abrir o pop-up, destaca o idioma atual
        if ( evt.target.closest('#drawer-language-selector') ) {
            const current = PolicyHandler.language
            dc.querySelectorAll('.change-language').forEach(item => {
                item.classList.toggle('border', item.id === current)
                item.classList.toggle('border-info', item.id === current)
            })
            return
        }

        const option = evt.target.closest('.change-language')

        if ( !option || !settings.source.language.includes(option.id) ) {
            return
        }

        try {
            await AWCookies.set('i18n', option.id, {
                expire: 365,
                secure: wd.location.protocol === 'https:'
            })
            wd.location.reload()
        } catch (error) {
            console.error('[SETUP]: could not save the language cookie', error)
        }
    })

    // router
    switch (router) {

        case 'index':
        case 'dpo':
        case 'about':
        case 'admin':
        case 'blog':
        case '404':
        case 'nocookie':
            // check URI "search" fragment
            if ( location.search === '?utm_source=homescreen' ) {
                // is pwa launch ... register log
            }
        
            await TemplatesReady.import
            // Exibe o atalho administrativo quando existe uma chave salva.
            const adminShortcut = dc.getElementById('drawer-admin')

            if (adminShortcut && LocalStorage.get('github-token')) {
                adminShortcut.classList.remove('d-none')
            }

if (router === 'index') {

      renderIndexCarousel(settings, document.getElementById('index-central-block'), { locale: PolicyHandler.language, translate: tr })
}







if (router === 'blog') {

    const box = document.getElementById('index-central-block')
    const { renderMarkdownURL } = await loadMarkdown()

    const mdOptions = {
        extensions: ['tables', 'images', 'anchors', 'externalLinks', 'blockAttributes', 'highlight']
    }

    // Compatibilidade: timestamp novo em milissegundos e date legado em segundos.
    const getPostTimestamp = post => {
        const timestamp = Number(post.timestamp)
        if (Number.isFinite(timestamp) && timestamp > 0) {
            return timestamp > 1e12 ? timestamp : timestamp * 1000
        }
        const date = Number(post.date)
        return Number.isFinite(date) && date > 0 ? date * 1000 : 0
    }

    // Recupera a data da última modificação.
    const getLastModifiedTimestamp = post => {
        const timestamp = Number(post.lastModified)

        if (!Number.isFinite(timestamp) || timestamp <= 0) {
            return 0
        }

        return timestamp > 1e12 ? timestamp : timestamp * 1000
    }

    const posts = [...settings.articles.storage].sort(
        (a, b) => getPostTimestamp(b) - getPostTimestamp(a)
    )
    const maxList = settings.articles['blog-max-list']

    const esc = text => String(text ?? '').replace(
        /[&<>"]/g,
        char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char])
    )

    const formatDate = timestamp => {
        if (!timestamp) return ''
        const date = new Date(timestamp)
        if (Number.isNaN(date.getTime())) return ''
        return date.toLocaleDateString(PolicyHandler.language, { dateStyle: 'medium' })
    }

    const getReadingTime = post => {
        const value = Number(post.readingTime)
        return Number.isFinite(value) && value > 0 ? Math.ceil(value) : null
    }

    let drawing = 0
    let visible = maxList
    let currentId = null

    const itemHTML = item => {
        const date = formatDate(getPostTimestamp(item))
        return `
        <a href="#${encodeURIComponent(item.id)}"
           class="list-group-item list-group-item-action rounded-0${item.id === currentId ? ' active' : ''}">
            ${esc(item.title)}

            ${date ? `<small class="d-block">${date}</small>` : ''}
        </a>`
    }

    const updateMore = () => {
        const count = document.getElementById('blog-count')
        const more = document.getElementById('blog-more')
        if (!count || !more) return
        const shown = Math.min(visible, posts.length)
        count.textContent = tr('blog.showing', 'Mostrando {shown} de {total}', {
            shown, total: posts.length
        })
        count.hidden = posts.length <= maxList
        more.hidden = shown >= posts.length
    }

    const loadMore = () => {
        const list = document.getElementById('blog-list')
        if (!list) return
        const from = Math.min(visible, posts.length)
        visible = Math.min(visible + maxList, posts.length)
        list.insertAdjacentHTML('beforeend', posts.slice(from, visible).map(itemHTML).join(''))
        updateMore()
    }

    const drawBlog = async () => {
        const run = ++drawing
        const id = decodeURIComponent(location.hash.slice(1))
        const post = id ? posts.find(item => item.id === id) : posts[0]
        currentId = post ? post.id : null

        const index = post ? posts.indexOf(post) : -1
        if (index >= visible) visible = Math.ceil((index + 1) / maxList) * maxList

        let article = `<p class="ct my-5">${tr('blog.empty', 'Nada publicado ainda.')}</p>`
        if (posts.length && !post) {
            article = `<p class="ct my-5">${tr('blog.not_found', 'Post não encontrado.')}</p>`
        }

        if (post) {
            try {
                article = await renderMarkdownURL(
                    `assets/posts/${encodeURIComponent(post.id)}.md`,
                    mdOptions
                )
            } catch (error) {
                console.error('[BLOG]:', error)
                article = `<p class="ct my-5">${tr('blog.load_error', 'Não foi possível carregar este post.')}</p>`
            }
        }

        if (run !== drawing) return

        let postHeader = ''
        let postFooter = ''

        if (post) {
            const date = formatDate(getPostTimestamp(post))
            const readingTime = getReadingTime(post)
            const metadata = [date, readingTime ? `${readingTime} min de leitura` : ''].filter(Boolean)

            postHeader = `
                <header class="mb-4">
                    <h3>${esc(post.title)}</h3>

                    ${metadata.length ? `<p class="small text-muted">${metadata.join(' · ')}</p>` : ''}
                </header>`

            // Exibe a atualização somente quando a data for diferente da criação.
            const createdTimestamp = getPostTimestamp(post)
            const modifiedTimestamp = getLastModifiedTimestamp(post)

            const updatedDate = (
                createdTimestamp &&
                modifiedTimestamp &&
                createdTimestamp !== modifiedTimestamp
            ) ? formatDate(modifiedTimestamp) : ''

            // Tags em pílulas com contorno, sem # e sem funcionalidade por enquanto.
            const tags = Array.isArray(post.tags)
                ? post.tags.map(tag => String(tag).trim()).filter(Boolean)
                : []

            const footerContent = []

            if (updatedDate) {
                footerContent.push(`
                    <p class="small text-danger text-right mb-2">
                        Última atualização: ${esc(updatedDate)}
                    </p>`)
            }

            if (tags.length) {
                footerContent.push(`
                    <div class="d-flex flex-wrap align-items-center">
                        ${tags.map(tag => `
                            <span class="border rounded-pill px-2 py-1 mr-2 mb-2 small">
                                ${esc(tag)}
                            </span>
                        `).join('')}
                    </div>`)
            }

            if (footerContent.length) {
                postFooter = `
                    <footer class="mt-4">
                        ${footerContent.join('')}
                    </footer>`
            }
        }

        box.innerHTML = `
            <div class="container">
                ${postHeader}
                <article class="text-break markdown-body">${article}</article>
                ${postFooter}
                <hr class="my-4">
                <h4 class="mt-5">Mais postagens</h4>
                <div id="blog-list" class="list-group">
                    ${posts.slice(0, visible).map(itemHTML).join('')}
                </div>
                <p id="blog-count" class="small text-muted ct mt-3 mb-0" hidden></p>
                <button type="button"
                        id="blog-more"
                        class="btn btn-outline-secondary btn-block rounded-0 cp mt-3 i18n"
                        data-i18n-html="blog.load_more"
                        hidden>Carregar mais</button>
                <div class="mb-5"></div>
            </div>`

        document.getElementById('blog-more').addEventListener('click', loadMore)
        updateMore()
        window.scrollTo(0, 0)
    }

    window.addEventListener('hashchange', drawBlog)
    await drawBlog()
}











        
if (router === 'admin') {

    const TOKEN_KEY = 'github-token'
    const AUTH_KEY = 'github-authenticated'
    const REPOSITORY_OWNER = 'subversivo58'
    const REPOSITORY_NAME = 'subversivo58.github.io'
    const REPOSITORY_BRANCH = 'main'

    const clearGitHubAuth = () => {
        LocalStorage.del(TOKEN_KEY)
        LocalStorage.del(AUTH_KEY)
        GitHubAPIInstance = null
    }

    const authenticateGitHub = async token => {
        const api = new GitHubAPI({ token })
        const response = await api.GHInstance.getUser().getProfile()
        GitHubAPIInstance = api
        return response.data
    }

    // Restaura e valida o token salvo no navegador.
    const storedToken = LocalStorage.get(TOKEN_KEY)
    if (storedToken) {
        try {
            await authenticateGitHub(storedToken)
            LocalStorage.set(AUTH_KEY, 'true')
        } catch (error) {
            console.error('[ADMIN]: A autenticação armazenada não é válida.', error)
            clearGitHubAuth()
        }
    }

    if (!GitHubAPIInstance) {
        const modal = document.querySelector('#modal-github-auth')
        const input = document.querySelector('#github-auth-key')
        const button = document.querySelector('#github-auth-verify')
        const status = document.querySelector('#github-auth-status')

        if (!modal || !input || !button || !status) {
            throw new Error('[ADMIN]: Elementos do modal de autenticação não encontrados.')
        }

        const githubAuthModal = new BootstrapNative.Modal(modal)
        githubAuthModal.show()

        button.addEventListener('click', async () => {
            const apiKey = input.value.trim()
            if (!apiKey) {
                status.textContent = 'Informe sua API Key.'
                return
            }

            button.disabled = true
            status.textContent = 'Verificando autenticação...'

            try {
                const profile = await authenticateGitHub(apiKey)
                LocalStorage.set(TOKEN_KEY, apiKey)
                LocalStorage.set(AUTH_KEY, 'true')
                status.textContent = `Autenticado como ${profile.login}.`
                githubAuthModal.hide()
            } catch (error) {
                GitHubAPIInstance = null
                status.textContent = 'Falha na autenticação. Verifique sua API Key.'
                console.error('[ADMIN]:', error)
            } finally {
                button.disabled = false
            }
        })
    }

    SlideMenus()
    AnchorScrool()

    const editorContainer = document.getElementById('admin-post-editor-container')
    const editorRoot = document.getElementById('admin-post-editor')
    const openEditorButton = document.getElementById('admin-new-post')
    const closeEditorButton = document.getElementById('admin-close-post-editor')

    const markdownEditor = new MarkdownEditor({
        root: editorRoot,
        db: DBMethods,
        permissions: BrowserPermissions,

        onCreate: async post => {
            try {
                if (!GitHubAPIInstance) {
                    throw new Error('Autenticação do GitHub indisponível.')
                }

                if (!post || !Array.isArray(post.files) || !post.files.length) {
                    throw new Error('A postagem não contém arquivos para publicação.')
                }

                for (const file of post.files) {
                    if (!file || typeof file.path !== 'string' ||
                        !file.path.trim() || !('content' in file)) {
                        throw new Error('A lista de arquivos contém um item inválido.')
                    }
                }

                const api = GitHubAPIInstance
                api.setRepo(REPOSITORY_OWNER, REPOSITORY_NAME)
                await api.setBranch(REPOSITORY_BRANCH)

                const response = await api.pushFiles(
                    `Publicação: ${post.title || post.id}`,
                    post.files
                )

                console.log('[ADMIN]: Publicação concluída.', response)
                return { published: true, post, response }

            } catch (error) {
                console.error('[ADMIN]: Falha ao publicar postagem.', error)
                throw error
            }
        }
    })

    markdownEditor.mount()

    openEditorButton.addEventListener('click', () => {
        editorContainer.classList.remove('d-none')
        editorContainer.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })

    closeEditorButton.addEventListener('click', () => {
        editorContainer.classList.add('d-none')
    })

}
            break

        case 'control':
            break

        case 'donations':
            await TemplatesReady.import
            //
            ;(async () => {
                const { renderMarkdownURL, ParseFlags } = await loadMarkdown()

                let WhitePaperBox = _.DOM.getById('copyright-container');

                if ( WhitePaperBox ) {
                    const outputHTML = await renderMarkdownURL('./docs/donations.md', {
                        // HTML cru em bloco é permitido nestes documentos
                        parseFlags: ParseFlags.DEFAULT,
                        extensions: ['tables', 'images', 'anchors', 'externalLinks', 'blockAttributes']
                    })

                    WhitePaperBox.insertAdjacentHTML('afterbegin', outputHTML)

                    // @revise - revise support for anchor get dinamic elements on Functions.mjs file
                    // @priority: MEDIUM
                    setTimeout(AnchorScrool, 2000);
                    i18n.transcript()
                }
            })()
            break

        case 'copyright':
            await TemplatesReady.import
            //
            ;(async () => {
                const { renderMarkdownURL, ParseFlags } = await loadMarkdown()

                let WhitePaperBox = _.DOM.getById('copyright-container');

                if ( WhitePaperBox ) {
                    const outputHTML = await renderMarkdownURL('./docs/licenses.md', {
                        // HTML cru em bloco é permitido nestes documentos
                        parseFlags: ParseFlags.DEFAULT,
                        extensions: ['tables', 'images', 'anchors', 'externalLinks', 'blockAttributes']
                    })

                    WhitePaperBox.insertAdjacentHTML('afterbegin', outputHTML)

                    // @revise - revise support for anchor get dinamic elements on Functions.mjs file
                    // @priority: MEDIUM
                    setTimeout(AnchorScrool, 2000);
                    i18n.transcript()
                }
            })()
            break

        case 'you-in-control-of-your-data':
            await TemplatesReady.import
            //
            ;(async () => {
                const { renderMarkdownURL, ParseFlags } = await loadMarkdown()

                let WhitePaperBox = _.DOM.getById('white-paper-container');

                if ( WhitePaperBox ) {
                    const outputHTML = await renderMarkdownURL('./docs/white-paper.md', {
                        // HTML cru em bloco é permitido nestes documentos
                        parseFlags: ParseFlags.DEFAULT,
                        extensions: ['images', 'anchors', 'externalLinks', 'blockAttributes']
                    })

                    WhitePaperBox.insertAdjacentHTML('afterbegin', outputHTML)

                    // @revise - revise support for anchor get dinamic elements on Functions.mjs file
                    // @priority: MEDIUM
                    setTimeout(AnchorScrool, 2000);
                }

                        const targetHash = location.hash.slice(1);
                        if ( location.hash !== '' && ['self-security-hosted'].includes(targetHash) ) {
                            // @deprecated - wd.history.pushState('', dc.title, wd.location.href.replace(wd.location.hash, ''));
                            let target = null;
                            switch (targetHash) {
                              case 'self-security-hosted':
                                  target = _.DOM.getById('self-security-hosted')
                                  break
                            }
                            if ( target ) {
                                let vertical = target.getBoundingClientRect().y - 120
                                wd.scrollTo({
                                    top: vertical, // could be negative value
                                    left: 0,
                                    behavior: 'smooth' // @see support {@link https://caniuse.com/#feat=css-scroll-behavior}
                                });
                            }
                        }
                        // @revise - revise support for anchor get dinamic elements on Functions.mjs file
                        // @priority: MEDIUM
                        AnchorScrool();
            })()
            break

        case 'policy':
            await TemplatesReady.import
            //
            ;(async () => {
                // get policies containers
                let GeneralPolicyBox     = _.DOM.getById('policy-container-general');
                let DataStoragePolicyBox = _.DOM.getById('policy-container-storage');
                let TermsPolicyBox       = _.DOM.getById('policy-container-terms');
                let PrivacyPolicyBox     = _.DOM.getById('policy-container-privacy');

                // @revise - move this to Functions.mjs
                // @priority: MODERATE
                const PrinterJS = (_html, _injectHeader = '') => {
                    let popup = window.open('about:blank', 'PRINT', 'rel=noopener');
                    popup.opener = null;
                    popup.location = location.origin;
                    if ( popup ) {
                        popup.document.write(`
                            <!DOCTYPE html>
                            <html lang="${document.lang || 'en-US'}">
                            <head>
                                <title>${document.title}</title>
                                <meta charset="UTF-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
                                <link type="text/css" rel="stylesheet" href="${new URL('assets/vendor/bootstrapv4/bootstrap.min.css', document.baseURI).href}">
                                <link type="text/css" rel="stylesheet" href="${new URL('assets/css/main.css', document.baseURI).href}">
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
                }
                //
                if ( GeneralPolicyBox && !DataStoragePolicyBox && TermsPolicyBox && PrivacyPolicyBox ) {
                    // @revise - get terms definition from `json` language interface library
                    // @priority: HIGH
                    const { renderMarkdownURL, ParseFlags } = await loadMarkdown()

                    const mdOptions = {
                        // HTML cru em bloco é permitido nestes documentos
                        parseFlags: ParseFlags.DEFAULT,
                        extensions: ['tables', 'anchors', 'externalLinks', 'blockAttributes']
                    }

                    // Em sequência, para não misturar chamadas ao parser
                    const policies = []

                    for (const url of [
                        './docs/policies/privacy.md',
                        './docs/policies/terms.md',
                        './docs/policies/policy.md'
                    ]) {
                        policies.push(await renderMarkdownURL(url, mdOptions))
                    }

                    await Promise.resolve(policies).then(result => {
                        let AllPolicyContentHTML = ``,
                            // @revise - get terms definition from `json` language interface library
                            // @priority: HIGH
                            PolicyHeaders = [
                                '<h2>Privacidade</h2>',
                                '<h2>Termos</h2>',
                                '<h2>Politica Geral</h2>'
                            ]
                        ;[PrivacyPolicyBox, TermsPolicyBox, GeneralPolicyBox].forEach((elm, idx, arr) => {
                            let outputHTML = result[idx]
                            AllPolicyContentHTML += PolicyHeaders[idx] + outputHTML;
                            elm.insertAdjacentHTML('afterbegin', outputHTML)

                            // in last iteraction
                            idx === arr.length -1 ? (() => {
                                elm.insertAdjacentHTML('afterbegin', `
                                    <div class="col-12 my-2 px-0"><span class="badge badge-light border-def contrast" title="Extimated time to reading this document">Reading: ${ReadingTextTime(result[idx]).time} min</span>
                                    <span class="badge badge-dark" title="Document version">Versão: 1.0.0</span>
                                    <span class="badge badge-light border-def contrast mt-1 cp printable-launcher" title="Print">Imprimir&nbsp;🖨️</span>`
                                );
                                // printer
                                elm.querySelector('.printable-launcher').addEventListener('click', evt => {
                                    PrinterJS(AllPolicyContentHTML)
                                }, false)
                            })() : null
                        });

                        const targetHash = location.hash.slice(1);
                        if ( location.hash !== '' && ['policy-general','policy-terms','policy-privacy', 'cookie-agree'].includes(targetHash) ) {
                            // @deprecated - wd.history.pushState('', dc.title, wd.location.href.replace(wd.location.hash, ''));
                            let target = null;
                            switch (targetHash) {
                              case 'policy-privacy':
                                  target = _.DOM.getById('policy-container-privacy')
                                  break;
                              case 'policy-terms':
                                  target = _.DOM.getById('policy-container-terms')
                                  break;
                              case 'policy-general':
                                  target = _.DOM.getById('policy-container-general')
                                  break;
                              case 'cookie-agree':
                                  target = _.DOM.getById('policy-cookie-agree')
                                  break
                            }
                            if ( target ) {
                                let vertical = target.getBoundingClientRect().y - 120
                                wd.scrollTo({
                                    top: vertical, // could be negative value
                                    left: 0,
                                    behavior: 'smooth' // @see support {@link https://caniuse.com/#feat=css-scroll-behavior}
                                });
                            }
                        }
                        // @revise - revise support for anchor get dinamic elements on Functions.mjs file
                        // @priority: MEDIUM
                        AnchorScrool();
                    })

                } else {
                    // @revise - Notify error in request documents
                    // @priority: MODERATE
                    console.log('oooops...')
                }
            })();

            let AcceptCookiesBtn = _.DOM.getById('yes-cookies-accept');

            if ( AcceptCookiesBtn ) {
                const GoToDisable = () => {
                    AcceptCookiesBtn.innerHTML = '😮 click to disable cookies!';
                    AcceptCookiesBtn.setAttribute('data-toggle', 'modal')
                    AcceptCookiesBtn.setAttribute('data-target', '#modal-clear-metadata')
                    // re-launch Bootstrap Native for this dinamic attributes
                    //BootstrapNative.initCallback(AcceptCookiesBtn.parentElement)
                    _.DOM.waitEl(dc, '#modal-clear-metadata', list => {
                        list[0] ? BootstrapNative.initCallback(AcceptCookiesBtn.parentElement) : null;
                    })

                    const RemoveAttr = () => {
                        AcceptCookiesBtn.removeAttribute('data-toggle')
                        AcceptCookiesBtn.removeAttribute('data-target')
                    }

                    // check cookies
                    ;[...dc.querySelectorAll('[data-charge-type]')].forEach(btn => {
                        let finish;

                
                        PressHoldCollorCharger(btn, init => {
                            btn.classList.add(btn.dataset.chargeType)
                        }, end => {
                            btn.classList.remove(btn.dataset.chargeType)
                            if ( finish ) {
                                if ( btn.id === 'clear-all-data-storage' ) {
                                    console.log(btn.id)
                                    Policy.refuseStoragement(true /*force clear-all-data but, not cookie*/).then(success => {
                                       console.log('all data-storagement clear!', Policy.permission)
                                       RemoveAttr();
                                       wd.location.reload(true)
                                       // notify
                                    }).catch(error => {
                                       console.log('error in clear storagement ... sorry')
                                       // notify
                                    })
                                } else if ( btn.id === 'refuse-cookie-storage' ) {
                                    console.log(btn.id)
                                    Policy.refuseStoragement().then(success => {
                                       console.log('cookies has been disabled', Policy.permission)
                                       RemoveAttr();
                                       wd.location.reload(true)
                                       // notify
                                    }).catch(error => {
                                       console.log('error in cookies disabling ... sorry', error)
                                       // notify
                                    })
                                }
                                //finish = false
                            } else {
                              console.log('BUSTA HINE')
                            }
                        }, complete => {
                            console.log("pressHold event fired!", btn.id);
                            finish = true
                        }, 100)
                    })
                }
                // check cookie state
                if ( Policy.permission === 'authorized' ) {
                    GoToDisable()
                } else {
                    PressHoldCollorCharger(AcceptCookiesBtn, init => {
                        AcceptCookiesBtn.classList.add('background-charge-success')
                    }, end => {
                        AcceptCookiesBtn.classList.remove('background-charge-success')
                    }, complete => {
                       Policy.acceptStoragement().then(success => {
                          console.log('cookies has been actived')
                          AcceptCookiesBtn.addEventListener('mouseleave', () => {
                              AcceptCookiesBtn.classList.remove('background-charge-success')
                              GoToDisable()
                          }, {once: true})
                          // notify
                       }).catch(error => {
                          console.log('error in cookies activaction ... sorry')
                          // notify
                       })
                    }, 100)
                }
            }

            break;

        default:
            console.log(router)
            break;

    }
  















    // Rodapé: últimas postagens (limite: settings.articles['footer-max-list'])
    renderFooterNews(settings, document.getElementById('dinamic-footer-news'), PolicyHandler.language)

    // @revise - lazy-load global initializator?
    // @oriority: MEDIUM
    lazyLoad.observe([...dc.querySelectorAll('[data-lazy-target]')]);


    // storage policy info
    ( router !== 'policy' && router !== 'nocookie' ) ? DataStoragePolicy() : null;

    // @revise - random RBG ... for `footer#foothead` (change this to UIModel.mjs)
    // @priority: LESS
    let bgColor = `rgb(${[1,2,3].map(x => Math.random() * 256 | 0)})`
    try {
        dc.styleSheets[1].insertRule(`:root {--random-color: ${bgColor};}`)

        let element = document.getElementById('foothead');

        // If the background color is dark, add the light-text class to it
        if ( !BrightnessDetector(bgColor) ) {
            element.classList.add('light-text');
        } else {
            element.classList.add('dark-text');
        }
    } catch(e){/*console.log(e)*/}





    // fix BootstrapNative Modals for dinamic templates
    const processFixModals = (root = dc) => {
        root.querySelectorAll('[data-fix-modal]').forEach(element => {
            if ( element.tagName === 'A' ) {
                _.DOM.event(element, 'click', evt => {
                    evt.preventDefault()
                }, _.EventOptions(false, false, false))
            }
            let attribute = element.dataset.fixModal;
            element.removeAttribute('data-fix-modal')
            element.setAttribute('data-toggle', 'modal')
            element.setAttribute('data-target', attribute)
            _.DOM.waitEl(dc, attribute, list => {
                list[0] ? BootstrapNative.initCallback(element.parentElement) : null;
            })
        })
    }

    processFixModals()

    // Intercepta qualquer clique em link com href="::" para nunca navegar e garantir abertura do modal
    _.DOM.event(dc, 'click', evt => {
        const link = evt.target && evt.target.closest ? evt.target.closest('a[href="::"], [data-fix-modal]') : null;
        if ( link ) {
            evt.preventDefault();
            if ( link.dataset.fixModal ) {
                processFixModals(dc);
            }
        }
    });

    // @revise - anchor smooth (revise Functions.mjs and add dinamic elements observer filter)
    // @priority: MEDIUM
    AnchorScrool();

    i18n.transcript()
    i18n.observe(document)

    // Preferências individuais do usuário
    const preferenceSwitches = {
        'sets-media-audio': 'mediaAudio',
        'sets-media-video': 'mediaVideo',
        'sets-geo-stats': 'geoStats',
        'sets-effect-audio': 'effectAudio',
        'sets-effect-notific': 'effectNotific',
        'sets-conn-notific': 'connNotific',
        'sets-conn-notific2': 'connNotific2'
    }

    // Estado inicial: todos os switches desligados.
    const userPreferences = {
        mediaAudio: false,
        mediaVideo: false,
        geoStats: false,
        effectAudio: false,
        effectNotific: false,
        connNotific: false,
        connNotific2: false
    }

    // Recupera as preferências salvas.
    if (DBMethods) {
        try {
            const savedPreferences = await DBMethods.read({
                tbn: 'config',
                tbk: 'preferences'
            })

            if (
                savedPreferences &&
                typeof savedPreferences === 'object' &&
                !Array.isArray(savedPreferences)
            ) {
                Object.keys(userPreferences).forEach(key => {
                    if (typeof savedPreferences[key] === 'boolean') {
                        userPreferences[key] = savedPreferences[key]
                    }
                })
            }
        } catch (error) {
            console.error(
                '[SETUP]: Could not load user preferences',
                error
            )
        }
    }

    // Atualiza o indicador visual de cada switch.
    const renderPreferenceSwitch = (id, enabled) => {
        const element = dc.getElementById(id)
        if (!element) return

        element.textContent = enabled ? '🟢' : '🔴'
    }

    // Aplica os estados recuperados ao painel.
    Object.entries(preferenceSwitches).forEach(([id, key]) => {
        renderPreferenceSwitch(id, userPreferences[key])
    })

    // Serializa as gravações para preservar a ordem dos cliques.
    let preferenceSaveQueue = Promise.resolve()

    // Alterna e salva a preferência acionada.
    dc.addEventListener('click', evt => {

      
        const element = evt.target.closest(
            '#settings-slide [id^="sets-"]'
        )

      
        if (
            !element ||
            !Object.prototype.hasOwnProperty.call(
                preferenceSwitches,
                element.id
            )
        ) {
            return
        }

        const key = preferenceSwitches[element.id]

        userPreferences[key] = !userPreferences[key]

        renderPreferenceSwitch(element.id, userPreferences[key])

        if (!DBMethods) {
            console.error(
                '[SETUP]: IndexedDB connection unavailable; preference not saved.'
            )
            return
        }

        const preferencesToSave = { ...userPreferences }

        preferenceSaveQueue = preferenceSaveQueue
            .then(() => DBMethods.update([{
                tbn: 'config',
                tbk: 'preferences',
                tbv: preferencesToSave
            }]))
            .catch(error => {
                console.error(
                    '[SETUP]: Could not save user preferences',
                    error
                )
            })
    })

    DrawerEvents(BrowserPermissions, Notify)

SlideMenus()

ColorPallet('#color-palette-container')

//}, _.EventOptions(false, true, true), true);


};


// Executa quando o DOM estiver pronto
if (dc.readyState === 'loading') {
    _.DOM.event(dc, 'DOMContentLoaded', SetupDOMReady);
} else {
    SetupDOMReady();
}

/*@excluir
// User "self data-base" schema

const UserSchema = {
  preference {
      site: {
          language: 'en-US',
          cookies: false,
          dictionary: false,
          songs: {
              effects: false,
              notifications: false
          },
          analytics: {
              base: false,
              geo: false
          }
      },
      profile: {
          alias: '',
          avatar: ''
      }
  }
}


 */
















/*@exluir



function upperReq() {
  let chars = password;
  if (/[a-z].?[A-Z]/g.test(chars) || /[A-Z].?[a-z]/g.test(chars)) {
    passStrength++;
  }
}

function numReq() {
  let chars = password;
  if (/[0-9]/g.test(chars)) {
    passStrength++;
  }
}

function specialReq() {
  let chars = password;
  if (/[!@#\$%\^\&*\)\(+=._-]/g.test(chars)) {
    passStrength++;
  }
}





 



const permissionsNames = [
  "geolocation",
  "notifications",
  "push",
  "midi",
  "camera",
  "microphone",
  "speaker",
  "device-info",
  "background-fetch",
  "background-sync",
  "bluetooth",
  "persistent-storage",
  "ambient-light-sensor",
  "accelerometer",
  "gyroscope",
  "magnetometer",
  "clipboard",
  "display-capture",
  "nfc"
]

const getAllPermissions = async () => {
  const allPermissions = []
  // We use Promise.all to wait until all the permission queries are resolved
  await Promise.all(
    permissionsNames.map(async permissionName => {
        try {
          let permission
          switch (permissionName) {
            case 'push':
              // Not necessary but right now Chrome only supports push messages with  notifications
              permission = await navigator.permissions.query({name: permissionName, userVisibleOnly: true})
              break
            default:
              permission = await navigator.permissions.query({name: permissionName})
          }
          console.log(permission)
          allPermissions.push({permissionName, state: permission.state})
        }
        catch(e){
          allPermissions.push({permissionName, state: 'error', errorMessage: e.toString()})
        }
    })
  )
  return allPermissions
}

(async function () {
  const allPermissions = await getAllPermissions()
  console.log(JSON.stringify(allPermissions, null, 4))
})()
*//**
 * Debug: Browser Permissions
 *
const DebugPermissions = async () => {
    console.group('[DEBUG] Browser Permissions')

    try {
        await BrowserPermissions.ready

        console.table(
            BrowserPermissions.permission.map(permission => ({
                permission,
                status: BrowserPermissions.status[permission]
            }))
        )

        console.log('Notification.permission:', 
            typeof Notification !== 'undefined'
                ? Notification.permission
                : 'API unsupported'
        )

        console.log('Permissions API:', 
            navigator.permissions ? 'Available' : 'Unavailable'
        )

        console.log('Full status:', BrowserPermissions.status)

    } catch (error) {
        console.error('[DEBUG] Permission check failed:', error)
    }

    console.groupEnd()
}

// Run diagnostic
//DebugPermissions()*/



/** @excluir

(async () => {
    console.log('[SW DEBUG] Verificando Service Workers...');

    if (!('serviceWorker' in navigator)) {
        console.log('[SW DEBUG] API não disponível');
        return;
    }

    try {
        const registrations =
            await navigator.serviceWorker.getRegistrations();

        console.log('[SW DEBUG] Quantidade:', registrations.length);

        console.table(registrations.map(registration => ({
            scope: registration.scope,
            active: registration.active?.state || 'none',
            installing: registration.installing?.state || 'none',
            waiting: registration.waiting?.state || 'none'
        })));

        if (registrations.length === 0) {
            console.log('[SW DEBUG] Nenhum Service Worker registrado.');
        }

    } catch (error) {
        console.error('[SW DEBUG] Erro:', error);
    }
})();



(async () => {
    const report = {};
    const ua = navigator.userAgent;

    // Environment
    report.environment = {
        userAgent: ua,
        platform: navigator.platform,
        language: navigator.language,
        online: navigator.onLine,
        secureContext: isSecureContext,
        origin: location.origin
    };

    // Browser identification
    report.browser = {
        chrome: ua.match(/Chrome\/([\d.]+)/)?.[1] || null,
        firefox: ua.match(/Firefox\/([\d.]+)/)?.[1] || null,
        edge: ua.match(/Edg\/([\d.]+)/)?.[1] || null,
        samsung: ua.match(/SamsungBrowser\/([\d.]+)/)?.[1] || null
    };

    // Notifications API
    report.notifications = {
        available: 'Notification' in window,
        permission: window.Notification?.permission || 'unavailable',
        constructor: typeof window.Notification,
        prototype: typeof window.Notification?.prototype,
        serviceWorkerRequiredForConstructor:
            typeof window.Notification === 'function'
    };

    // Permissions API
    report.permissions = {
        available: 'permissions' in navigator,
        query: typeof navigator.permissions?.query
    };

    if (navigator.permissions?.query) {
        const descriptors = [
            'notifications',
            'push',
            'geolocation',
            'camera',
            'microphone',
            'persistent-storage'
        ];

        report.permissions.descriptors = {};

        for (const name of descriptors) {
            try {
                const result = await navigator.permissions.query({ name });
                report.permissions.descriptors[name] = result.state;
            } catch (error) {
                report.permissions.descriptors[name] =
                    `${error.name}: ${error.message}`;
            }
        }
    }

    // Service Worker
    report.serviceWorker = {
        available: 'serviceWorker' in navigator,
        controller: navigator.serviceWorker?.controller?.state || null,
        registrations: []
    };

    if (navigator.serviceWorker) {
        try {
            const registrations =
                await navigator.serviceWorker.getRegistrations();

            report.serviceWorker.registrations =
                registrations.map(registration => ({
                    scope: registration.scope,
                    active: registration.active?.state || null,
                    waiting: registration.waiting?.state || null
                }));
        } catch (error) {
            report.serviceWorker.error = error.message;
        }
    }

    // Push API
    report.push = {
        available: 'PushManager' in window,
        subscription: 'PushSubscription' in window
    };

    // Storage API
    report.storage = {
        available: 'storage' in navigator,
        estimate: typeof navigator.storage?.estimate,
        persist: typeof navigator.storage?.persist,
        persisted: typeof navigator.storage?.persisted
    };

    // Display capabilities
    report.display = {
        visibility: document.visibilityState,
        focused: document.hasFocus(),
        hidden: document.hidden
    };

    console.group('[BROWSER CAPABILITIES]');
    console.log('Complete report:', report);

    for (const [section, data] of Object.entries(report)) {
        console.group(section);
        console.table(
            typeof data === 'object' && !Array.isArray(data)
                ? Object.entries(data).map(([key, value]) => ({
                    property: key,
                    value: typeof value === 'object'
                        ? JSON.stringify(value)
                        : value
                }))
                : data
        );
        console.groupEnd();
    }

    console.groupEnd();

    return report;
})();
*/
      