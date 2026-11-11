/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 */
'use strict'

// Listas de postagens recentes: carrossel da página inicial e resumo no rodapé.
// Usa só o índice que já está no settings.json (id, title e date), sem novas requisições.

const esc = text => String(text).replace(
    /[&<>"]/g,
    char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char])
)

const formatDate = (seconds, locale) => new Date(seconds * 1000)
    .toLocaleDateString(locale, { dateStyle: 'medium' })

// Mais recentes primeiro (date em segundos)
const latest = (settings, limit) => [...settings.articles.storage]
    .sort((a, b) => b.date - a.date)
    .slice(0, limit)

// Mesmo formato de link da lista do blog (a página do blog abre o post pelo #id)
const postURL = id => `./blog.html#${encodeURIComponent(id)}`

/**
 * Rodapé: substitui os itens fixos de #dinamic-footer-news (ícone, título e data).
 * Limite: settings.articles['footer-max-list'].
 */
export function renderFooterNews(settings, container, locale = navigator.language) {
    if (!container) return

    const posts = latest(settings, settings.articles['footer-max-list'])

    if (!posts.length) {
        container.replaceChildren()

        const column = container.closest('.widget-column')

        if (column) column.hidden = true

        return
    }

    container.innerHTML = posts.map(post => `
        <div class="mt-3 col footer-column-bb">
            <a href="${postURL(post.id)}" class="row">
                <small>📰 ${esc(post.title)}</small>
            </a>
            <small class="row">${formatDate(post.date, locale)}</small>
        </div>`).join('')
}

/**
 * Página inicial: carrossel com imagem padrão, título e data de cada post.
 * Limite: settings.articles['index-max-list'].
 */
export function renderIndexCarousel(settings, container, { image = './assets/media/image/graph.webp', locale = navigator.language } = {}) {
    if (!container) return

    const posts = latest(settings, settings.articles['index-max-list'])

    if (!posts.length) return

    const slides = posts.map(post => `
        <a class="posts-slide" href="${postURL(post.id)}">
            <img alt=""
                 src="./assets/media/image/1x1.gif"
                 data-src="${image}" data-lazy-target
                 width="1200" height="720" class="img-fluid">
            <strong class="d-block mt-2">${esc(post.title)}</strong>
            <small class="d-block">${formatDate(post.date, locale)}</small>
        </a>`).join('')

    const dots = posts.length > 1
        ? posts.map((post, index) => `<button type="button" aria-label="${index + 1}"${index === 0 ? ' aria-current="true"' : ''}></button>`).join('')
        : ''

    container.innerHTML = `
        <div id="posts-carousel" class="posts-carousel">${slides}</div>
        <div id="posts-dots" class="posts-dots">${dots}</div>`

    const track = container.querySelector('#posts-carousel')

    const buttons = [...container.querySelectorAll('#posts-dots button')]

    let frame = null

    // Marca o ponto do slide que está à vista
    const sync = () => {
        frame = null

        const current = Math.round(track.scrollLeft / track.clientWidth)

        buttons.forEach((button, index) => {
            if (index === current) {
                button.setAttribute('aria-current', 'true')
            } else {
                button.removeAttribute('aria-current')
            }
        })
    }

    track.addEventListener('scroll', () => {
        if (frame === null) frame = requestAnimationFrame(sync)
    }, { passive: true })

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' })
        })
    })
}
