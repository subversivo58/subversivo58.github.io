
/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 */
'use strict'

// Listas de postagens recentes: carrossel da página inicial e resumo no rodapé.
// Utiliza os metadados do settings.json, mantendo compatibilidade com registros antigos.

const esc = text => String(text).replace(
    /[&<>"]/g,
    char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char])
)

// Obtém o timestamp de criação em milissegundos.
// Registros antigos utilizam date em segundos.
const getTimestamp = post => {
    const timestamp = Number(post.timestamp)

    if (Number.isFinite(timestamp) && timestamp > 0) {
        return timestamp
    }

    const legacyDate = Number(post.date)

    return Number.isFinite(legacyDate) && legacyDate > 0
        ? legacyDate * 1000
        : NaN
}

const formatDate = (timestamp, locale) => {
    const date = new Date(timestamp)

    return Number.isNaN(date.getTime())
        ? ''
        : date.toLocaleDateString(locale, { dateStyle: 'medium' })
}

// Data no formato AAAA-MM-DD (atributo datetime); vazio se inválida.
const isoDate = timestamp => {
    const date = new Date(timestamp)

    return Number.isNaN(date.getTime())
        ? ''
        : date.toISOString().slice(0, 10)
}

// Obtém o tempo de leitura atual ou utiliza o campo legado minutes.
const getReadingTime = post => {
    const value = Number(post.readingTime ?? post.minutes)

    return Number.isFinite(value) && value > 0
        ? Math.round(value)
        : 0
}

// Troca {nome} pelo valor de vars.nome.
const fill = (text, vars) => text.replace(
    /\{(\w+)\}/g,
    (match, name) => name in vars ? vars[name] : match
)

// Mais recentes primeiro, utilizando timestamp em milissegundos.
const latest = (settings, limit) => [...settings.articles.storage]
    .sort((a, b) => getTimestamp(b) - getTimestamp(a))
    .slice(0, limit)

// Mesmo formato de link da lista do blog (a página do blog abre o post pelo #id).
const postURL = id => `./blog.html#${encodeURIComponent(id)}`

// Ícones (SVG embutido, herdam a cor do texto).
const ICON_DATE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
const ICON_TIME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'

// Tom do selo de categoria (0, 1 ou 2), sempre o mesmo para a mesma categoria.
const tone = text => [...String(text)].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
) % 3

// Intervalo da troca automática de slide (ms).
const INTERVAL = 6000

/**
 * Rodapé: substitui os itens fixos de #dinamic-footer-news (ícone, título e data).
 * Limite: settings.articles['footer-max-list'].
 */
export function renderFooterNews(
    settings,
    container,
    locale = navigator.language
) {
    if (!container) return

    const posts = latest(
        settings,
        settings.articles['footer-max-list']
    )

    if (!posts.length) {
        container.replaceChildren()

        const column = container.closest('.widget-column')

        if (column) column.hidden = true

        return
    }

    container.innerHTML = posts.map(post => {
        const timestamp = getTimestamp(post)

        return `
        <div class="mt-3 col footer-column-bb">
            <a href="${postURL(post.id)}" class="row">
                <small>📰 ${esc(post.title)}</small>
            </a>
            <small class="row">${formatDate(timestamp, locale)}</small>
        </div>`
    }).join('')
}

/**
 * Página inicial: carrossel de cards (imagem, categoria, título, resumo, data e tempo de leitura).
 * Limite: settings.articles['index-max-list']. Troca de slide automática.
 * Opções: image (padrão), locale (datas) e translate(chave, textoPadrao) (textos fixos).
 */
export function renderIndexCarousel(settings, container, {
    image = './assets/media/image/graph.webp',
    locale = navigator.language,
    translate = (key, fallback) => fallback
} = {}) {
    if (!container) return

    const posts = latest(
        settings,
        settings.articles['index-max-list']
    )

    if (!posts.length) return

    const slides = posts.map(post => {
        const category = post.tags && post.tags.length
            ? String(post.tags[0])
            : ''

        const readingTime = getReadingTime(post)
        const timestamp = getTimestamp(post)
        const iso = isoDate(timestamp)

        const badge = category
            ? `<span class="posts-card-badge" data-tone="${tone(category)}">${esc(category)}</span>`
            : ''

        const summary = post.summary
            ? `<span class="posts-card-summary">${esc(post.summary)}</span>`
            : ''

        const readTime = readingTime > 0
            ? `<span>${ICON_TIME}${esc(fill(
                translate(
                    'blog.read_time',
                    '{minutes} min de leitura'
                ),
                { minutes: readingTime }
            ))}</span>`
            : ''

        return `
        <div class="posts-slide">
            <a class="posts-card" href="${postURL(post.id)}">
                <span class="posts-card-media${post.cover ? ' posts-card-media-cover' : ''}">
                    <img alt=""
                         src="./assets/media/image/1x1.gif"
                         data-src="${esc(post.cover || image)}" data-lazy-target
                         width="1200" height="720" class="posts-card-img">
                    ${badge}
                </span>
                <span class="posts-card-body">
                    <strong class="posts-card-title">${esc(post.title)}</strong>
                    ${summary}
                    <span class="posts-card-meta">
                        <span>${ICON_DATE}<time${iso ? ` datetime="${iso}"` : ''}>${formatDate(timestamp, locale)}</time></span>
                        ${readTime}
                    </span>
                </span>
            </a>
        </div>`
    }).join('')

    const dots = posts.length > 1
        ? posts.map((post, index) => `<button type="button" aria-label="${index + 1}"${index === 0 ? ' aria-current="true"' : ''}></button>`).join('')
        : ''

    container.innerHTML = `
        <div id="posts-carousel" class="posts-carousel">${slides}</div>
        <div id="posts-dots" class="posts-dots">${dots}</div>`

    const track = container.querySelector('#posts-carousel')

    const buttons = [...container.querySelectorAll('#posts-dots button')]

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Slide que está à vista.
    const current = () => Math.round(
        track.scrollLeft / (track.clientWidth || 1)
    )

    const goTo = (index, smooth = true) => {
        track.scrollTo({
            left: index * track.clientWidth,
            behavior: smooth && !reduceMotion.matches
                ? 'smooth'
                : 'auto'
        })
    }

    // Marca o ponto do slide que está à vista.
    let frame = null

    const sync = () => {
        frame = null

        const index = current()

        buttons.forEach((button, position) => {
            if (position === index) {
                button.setAttribute('aria-current', 'true')
            } else {
                button.removeAttribute('aria-current')
            }
        })
    }

    track.addEventListener('scroll', () => {
        if (frame === null) {
            frame = requestAnimationFrame(sync)
        }
    }, { passive: true })

    // Troca automática: pausa com o mouse, teclado ou dedo sobre o carrossel,
    // com a aba escondida, fora da tela ou quando o usuário prefere menos movimento.
    const hold = new Set()

    let timer = null
    let visible = true

    const stop = () => {
        clearInterval(timer)
        timer = null
    }

    const play = () => {
        stop()

        if (
            posts.length < 2 ||
            hold.size ||
            !visible ||
            document.hidden ||
            reduceMotion.matches
        ) {
            return
        }

        timer = setInterval(() => {
            const next = current() + 1

            // Depois do último volta ao primeiro, sem rebobinar todos os slides.
            goTo(next % posts.length, next < posts.length)
        }, INTERVAL)
    }

    const holdOn = reason => {
        hold.add(reason)
        play()
    }

    const holdOff = reason => {
        hold.delete(reason)
        play()
    }

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            goTo(index)
            play()
        })
    })

    container.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') {
            holdOn('hover')
        }
    })

    container.addEventListener('pointerleave', () => {
        holdOff('hover')
    })

    track.addEventListener('pointerdown', () => holdOn('touch'))
    track.addEventListener('pointerup', () => holdOff('touch'))
    track.addEventListener('pointercancel', () => holdOff('touch'))

    // Foco só pausa quando vem do teclado.
    const onFocusIn = event => {
        if (event.target.matches(':focus-visible')) {
            holdOn('focus')
        }
    }

    container.addEventListener('focusin', onFocusIn)

    container.addEventListener('focusout', () => holdOff('focus'))

    document.addEventListener('visibilitychange', play)

    reduceMotion.addEventListener('change', play)

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            play()
        }, { threshold: .25 }).observe(container)
    }

    // Início automático.
    play()
}
