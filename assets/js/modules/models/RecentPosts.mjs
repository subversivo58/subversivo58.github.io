/**
 * @file RecentPosts.mjs
 * @description Rendering of recent-post lists for the home carousel and the footer.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */
'use strict'


/**
 * Escapes the characters &, <, > and " in a string.
 * @param {*} text
 * @return {string}
 */
const esc = text => String(text).replace(
    /[&<>"]/g,
    char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char])
)

/**
 * Returns the publication time of a post in milliseconds.
 * @param {Object} post
 * @return {number} 0 when the post has no valid timestamp.
 * @description Values below 1e12 are treated as seconds.
 */
const getTimestamp = post => {
    const timestamp = Number(post.timestamp)
    if (Number.isFinite(timestamp) && timestamp > 0) {
        return timestamp > 1e12 ? timestamp : timestamp * 1000
    }
    const legacyDate = Number(post.date)
    return Number.isFinite(legacyDate) && legacyDate > 0 ? legacyDate * 1000 : NaN
}

/**
 * Formats a timestamp as a localized date.
 * @param {number} timestamp
 * @param {string} locale
 * @return {string} Empty string when the timestamp is invalid.
 */
const formatDate = (timestamp, locale) => {
    const date = new Date(timestamp)
    return Number.isNaN(date.getTime())
        ? ''
        : date.toLocaleDateString(locale, { dateStyle: 'medium' })
}

/**
 * Returns a timestamp in ISO format.
 * @param {number} timestamp
 * @return {string} Empty string when the timestamp is invalid.
 */
const isoDate = timestamp => {
    const date = new Date(timestamp)
    return Number.isNaN(date.getTime())
        ? ''
        : date.toISOString().slice(0, 10)
}

/**
 * Returns the reading time of a post, in minutes.
 * @param {Object} post
 * @return {number} 0 when there is no valid value.
 */
const getReadingTime = post => {
    const value = Number(post.readingTime ?? post.minutes)
    return Number.isFinite(value) && value > 0 ? Math.round(value) : 0
}

/**
 * Replaces the {name} placeholders of a text with values.
 * @param {string} text
 * @param {Object} vars
 * @return {string} Placeholders without a value are kept.
 */
const fill = (text, vars) => text.replace(
    /\{(\w+)\}/g,
    (match, name) => name in vars ? vars[name] : match
)

/**
 * Returns the most recent posts.
 * @param {Object} settings - Settings with articles.storage.
 * @param {number} limit
 * @return {Object[]}
 */
const latest = (settings, limit) => [...settings.articles.storage]
    .sort((a, b) => getTimestamp(b) - getTimestamp(a))
    .slice(0, limit)

/**
 * Converts a path to a root-relative URL.
 * @param {string} path
 * @return {string}
 */
const toRootRelative = path => `/${String(path || '').replace(/^\/+/, '')}`

/**
 * Returns the URL of a post from its path or its slug.
 * @param {Object} post
 * @return {string}
 */
const postURL = post => {
    if (post && typeof post.path === 'string' && post.path.trim()) {
        return toRootRelative(post.path)
    }
    if (post && post.slug) {
        return `/posts/${encodeURIComponent(post.slug)}.html`
    }
    return '/blog.html'
}

const ICON_DATE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>'
const ICON_TIME = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>'

/**
 * Picks one of three tone variants for a text, based on its characters.
 * @param {string} text
 * @return {number} 0, 1 or 2.
 */
const tone = text => [...String(text)].reduce(
    (sum, char) => sum + char.charCodeAt(0),
    0
) % 3

const INTERVAL = 6000

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
        return
    }

    container.innerHTML = posts.map(post => {
        const timestamp = getTimestamp(post)
        return `
        <div class="mt-3 col footer-column-bb">
            <a href="${esc(postURL(post))}" class="row">
                <small>📰 ${esc(post.title)}</small>
            </a>
            <small class="row">${formatDate(timestamp, locale)}</small>
        </div>`
    }).join('')
}

export function renderIndexCarousel(settings, container, {
    image = '/assets/media/image/graph.webp',
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
        const category = post.tags && post.tags.length ? String(post.tags[0]) : ''
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
                translate('blog.read_time', '{minutes} min de leitura'),
                { minutes: readingTime }
            ))}</span>`
            : ''

        const coverSrc = post.cover ? toRootRelative(post.cover) : toRootRelative(image)

        return `
        <div class="posts-slide">
            <a class="posts-card" href="${esc(postURL(post))}">
                <span class="posts-card-media${post.cover ? ' posts-card-media-cover' : ''}">
                    <picture>
                        <img alt="${esc(post.title || '')}"
                             src="/assets/media/image/1x1.gif"
                             data-src="${esc(coverSrc)}"
                             data-lazy-target
                             width="1200" height="720"
                             class="posts-card-img">
                    </picture>
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

    /**
     * Returns the index of the slide currently visible in the carousel.
     * @return {number}
     */
    const current = () => Math.round(track.scrollLeft / (track.clientWidth || 1))

    /**
     * Scrolls the carousel to a slide.
     * @param {number} index
     * @param {boolean} [smooth=true]
     * @description Motion is disabled when the user prefers reduced motion.
     */
    const goTo = (index, smooth = true) => {
        track.scrollTo({
            left: index * track.clientWidth,
            behavior: smooth && !reduceMotion.matches ? 'smooth' : 'auto'
        })
    }

    let frame = null
    /**
     * Updates the navigation buttons to show the current slide.
     * @description Runs once per animation frame.
     */
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
        if (frame === null) frame = requestAnimationFrame(sync)
    }, { passive: true })

    const hold = new Set()
    let timer = null
    let visible = true

    /**
     * Stops the automatic rotation of the carousel.
     */
    const stop = () => {
        clearInterval(timer)
        timer = null
    }

    /**
     * Starts the automatic rotation of the carousel.
     * @description It does not run when there are fewer than two posts, when the carousel is held or hidden, or when the user prefers reduced motion.
     */
    const play = () => {
        stop()
        if (posts.length < 2 || hold.size || !visible || document.hidden || reduceMotion.matches) {
            return
        }
        timer = setInterval(() => {
            const next = current() + 1
            goTo(next % posts.length, next < posts.length)
        }, INTERVAL)
    }

    /**
     * Pauses the automatic rotation for a reason.
     * @param {string} reason - Reason identifier, used to resume later.
     */
    const holdOn = reason => { hold.add(reason); play() }
    /**
     * Resumes the automatic rotation for a reason.
     * @param {string} reason
     */
    const holdOff = reason => { hold.delete(reason); play() }

    buttons.forEach((button, index) => {
        button.addEventListener('click', () => {
            goTo(index)
            play()
        })
    })

    container.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') holdOn('hover')
    })
    container.addEventListener('pointerleave', () => holdOff('hover'))
    track.addEventListener('pointerdown', () => holdOn('touch'))
    track.addEventListener('pointerup', () => holdOff('touch'))
    track.addEventListener('pointercancel', () => holdOff('touch'))
    container.addEventListener('focusin', event => {
        if (event.target.matches(':focus-visible')) holdOn('focus')
    })
    container.addEventListener('focusout', () => holdOff('focus'))
    document.addEventListener('visibilitychange', play)
    reduceMotion.addEventListener('change', play)

    if ('IntersectionObserver' in window) {
        new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting
            play()
        }, { threshold: .25 }).observe(container)
    }

    play()
}
