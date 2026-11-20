/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 *
 * @file PostManager.mjs
 * @description Gerenciamento de postagens HTML em /posts/<slug>.html, metadados e sitemap.
 */

import Hashids from '../vendor/Hashids/hashids-es6.mjs'
import { highlightCodeBlocks } from '../lib/Highlight.mjs'

const SITE_ORIGIN = 'https://subversivo58.github.io'
const DEFAULT_OG_IMAGE = 'assets/media/image/graph.webp'

const esc = text => String(text ?? '').replace(
    /[&<>"]/g,
    char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char])
)

export default class PostManager {
    constructor(options = {}) {
        this.hashids = new Hashids(
            options.salt ?? 'subversivo58',
            options.minLength ?? 8
        )

        this.settingsPath = String(options.settingsPath ?? 'config/settings.json').replace(/^\/+/, '')
        this.sitemapPath = String(options.sitemapPath ?? 'sitemap.xml').replace(/^\/+/, '')
        this.templatePath = String(options.templatePath ?? 'assets/tpl/post-page.tpl').replace(/^\/+/, '')
        this.blogUrl = options.blogUrl ?? `${SITE_ORIGIN}/blog.html`
        this.siteOrigin = options.siteOrigin ?? SITE_ORIGIN

        this.committedSettings = null
        this.committedSitemap = null
        this.templateCache = null
    }

    /**
     * Gera um Hash ID (mantido para Footoodles).
     */
    generateID(timestamp = Date.now()) {
        return this.hashids.encode(timestamp)
    }

    decodeID(id) {
        return this.hashids.decode(id)
    }

    /**
     * Converte título ou texto livre em slug válido para /posts/<slug>.html.
     */
    slugify(text) {
        return String(text ?? '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .replace(/-{2,}/g, '-')
    }

    ensureUniqueSlug(rawSlug, storage = [], ignoreSlug = null) {
        const base = this.slugify(rawSlug) || `post-${Date.now()}`
        const taken = new Set(
            storage
                .filter(item => item && item.slug && item.slug !== ignoreSlug)
                .map(item => String(item.slug))
        )

        if (!taken.has(base)) return base

        let counter = 2
        while (taken.has(`${base}-${counter}`)) {
            counter++
        }
        return `${base}-${counter}`
    }

    buildPostPath(slug) {
        return `posts/${slug}.html`
    }

    buildPostURL(slug) {
        return `${this.siteOrigin}/${this.buildPostPath(slug)}`
    }

    normalizeTags(tags = []) {
        const values = Array.isArray(tags)
            ? tags
            : String(tags).split(',')

        return [...new Set(
            values
                .map(tag => String(tag).trim().toLowerCase())
                .filter(Boolean)
        )]
    }

    normalizeReadingTime(value) {
        const readingTime = Number(value)
        if (!Number.isFinite(readingTime)) return 1
        return Math.max(1, Math.round(readingTime))
    }

    /**
     * Extrai caminhos em assets/posts/images/ na ordem em que aparecem no HTML.
     */
    extractImagePaths(html) {
        const doc = new DOMParser().parseFromString(String(html || ''), 'text/html')
        const paths = []
        const seen = new Set()

        doc.querySelectorAll('img').forEach(img => {
            const raw = img.getAttribute('data-src') || img.getAttribute('src') || ''
            const normalized = raw.replace(/^\/+/, '')
            if (normalized.startsWith('assets/posts/images/') && !seen.has(normalized)) {
                seen.add(normalized)
                paths.push(normalized)
            }
        })

        return paths
    }

    orderImages(html, images = []) {
        const orderedPaths = this.extractImagePaths(html)
        const byPath = new Map(images.map(item => [item.path.replace(/^\/+/, ''), item]))
        const result = []

        for (const path of orderedPaths) {
            const found = byPath.get(path)
            if (found) {
                result.push({
                    ...found,
                    path
                })
            }
        }

        // Mantém quaisquer imagens enviadas que tenham correspondência
        for (const item of images) {
            const clean = item.path.replace(/^\/+/, '')
            if (!result.some(entry => entry.path === clean)) {
                result.push({ ...item, path: clean })
            }
        }

        return result
    }

    async loadTemplate() {
        if (this.templateCache) return this.templateCache

        const response = await fetch(`/${this.templatePath}`, {
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(`Não foi possível carregar /${this.templatePath}: ${response.status}`)
        }

        this.templateCache = await response.text()
        return this.templateCache
    }

    highlightPostContent(html) {
        const raw = String(html || '').trim()
        if (!raw || !/<pre\b/i.test(raw)) return raw
        const doc = new DOMParser().parseFromString(raw, 'text/html')
        highlightCodeBlocks(doc.body, { autoDetect: true, normalizeBarePre: true })
        return doc.body.innerHTML.trim()
    }

    async renderPostHTML({
        title,
        slug,
        author = '',
        summary = '',
        tags = [],
        cover = null,
        content = '',
        timestamp = Date.now(),
        lastModified = timestamp,
        readingTime = 1
    }) {
        const template = await this.loadTemplate()
        const url = this.buildPostURL(slug)
        const ogImagePath = (cover || DEFAULT_OG_IMAGE).replace(/^\/+/, '')
        const ogImage = `${this.siteOrigin}/${ogImagePath}`
        const publishedIso = new Date(timestamp).toISOString()
        const modifiedIso = new Date(lastModified).toISOString()
        const formattedDate = new Date(timestamp).toLocaleDateString('pt-BR', { dateStyle: 'medium' })
        const minutes = this.normalizeReadingTime(readingTime)
        const highlightedContent = this.highlightPostContent(content)

        const updatedHtml = lastModified && timestamp && lastModified !== timestamp
            ? `<div class="blog-post-updated" data-post-updated="${esc(modifiedIso)}">Atualizado em ${esc(new Date(lastModified).toLocaleDateString('pt-BR', { dateStyle: 'medium' }))}</div>`
            : ''

        const cleanTags = this.normalizeTags(tags)
        const tagsHtml = cleanTags.length
            ? `<div class="d-flex flex-wrap align-items-center">${cleanTags.map(tag => `<span class="border rounded-pill px-2 py-1 mr-2 mb-2 small">${esc(tag)}</span>`).join('')}</div>`
            : ''

        const replacements = {
            '{{post_title}}': esc(title),
            '{{post_description}}': esc(summary || title),
            '{{post_keywords}}': esc(cleanTags.join(', ') || 'blog, subversivo58'),
            '{{post_url}}': esc(url),
            '{{post_image}}': esc(ogImage),
            '{{post_slug}}': esc(slug),
            '{{post_author}}': esc(String(author || '')),
            '{{post_published_iso}}': esc(publishedIso),
            '{{post_modified_iso}}': esc(modifiedIso),
            '{{post_date_formatted}}': esc(formattedDate),
            '{{post_reading_time}}': esc(String(minutes)),
            '{{post_reading_time_text}}': esc(`${minutes} min de leitura`),
            '{{post_content}}': highlightedContent,
            '{{post_updated_html}}': updatedHtml,
            '{{post_tags_html}}': tagsHtml
        }

        let html = template
        for (const [token, value] of Object.entries(replacements)) {
            html = html.split(token).join(value)
        }
        return html
    }

    async loadSettings() {
        if (this.committedSettings) {
            return structuredClone(this.committedSettings)
        }

        const settingsURL = new URL(`/${this.settingsPath}`, document.baseURI)
        settingsURL.searchParams.set('_', Date.now().toString())

        const response = await fetch(settingsURL, { cache: 'no-store' })
        if (!response.ok) {
            throw new Error(`Não foi possível carregar /${this.settingsPath}: ${response.status}`)
        }

        const settings = await response.json()
        if (!settings.articles || !Array.isArray(settings.articles.storage)) {
            throw new Error('A estrutura articles.storage não foi encontrada ou não é um array.')
        }

        return settings
    }

    markCommitted({ settings = null, sitemap = null } = {}) {
        if (settings) {
            this.committedSettings = typeof settings === 'string'
                ? JSON.parse(settings)
                : structuredClone(settings)
        }
        if (typeof sitemap === 'string') {
            this.committedSitemap = sitemap
        }
    }

    async loadSitemapXML() {
        if (this.committedSitemap) return this.committedSitemap

        const response = await fetch(`/${this.sitemapPath}?_=${Date.now()}`, {
            cache: 'no-store'
        })
        if (!response.ok) return null
        return response.text()
    }

    async prepareSitemap(timestamp, { upsertUrl = null, removeUrl = null } = {}) {
        try {
            let xml = await this.loadSitemapXML()
            if (!xml) return null

            const date = new Date(timestamp).toISOString().slice(0, 10)
            const escapeRegex = str => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

            // Atualiza lastmod do blog.html
            const blogEntry = new RegExp(
                `(<url>\\s*<loc>${escapeRegex(this.blogUrl)}</loc>)([\\s\\S]*?)(</url>)`
            )
            if (blogEntry.test(xml)) {
                xml = xml.replace(blogEntry, (match, open, body, close) => {
                    const cleaned = body.replace(/\s*<lastmod>[^<]*<\/lastmod>/, '')
                    return `${open}${cleaned.replace(/\s*$/, '')}\n        <lastmod>${date}</lastmod>\n    ${close}`
                })
            }

            if (removeUrl) {
                const removePattern = new RegExp(
                    `\\s*<url>\\s*<loc>${escapeRegex(removeUrl)}</loc>[\\s\\S]*?</url>`,
                    'g'
                )
                xml = xml.replace(removePattern, '')
            }

            if (upsertUrl) {
                const upsertPattern = new RegExp(
                    `(<url>\\s*<loc>${escapeRegex(upsertUrl)}</loc>)([\\s\\S]*?)(</url>)`
                )
                if (upsertPattern.test(xml)) {
                    xml = xml.replace(upsertPattern, (match, open, body, close) => {
                        const cleaned = body.replace(/\s*<lastmod>[^<]*<\/lastmod>/, '')
                        return `${open}${cleaned.replace(/\s*$/, '')}\n        <lastmod>${date}</lastmod>\n    ${close}`
                    })
                } else {
                    const entryXml = `    <url>\n        <loc>${esc(upsertUrl)}</loc>\n        <changefreq>monthly</changefreq>\n        <priority>0.7</priority>\n        <lastmod>${date}</lastmod>\n    </url>\n`
                    xml = xml.replace('</urlset>', `${entryXml}</urlset>`)
                }
            }

            return xml
        } catch {
            return null
        }
    }

    async createPost(data = {}) {
        const timestamp = Date.now()
        const lastModified = timestamp
        const settings = await this.loadSettings()

        const slug = this.ensureUniqueSlug(
            data.slug || data.title,
            settings.articles.storage
        )
        const path = this.buildPostPath(slug)

        const contentHtml = String(data.content ?? '').trim()
        const imageFiles = this.orderImages(contentHtml, data.images ?? [])
        const images = this.extractImagePaths(contentHtml)
        const cover = images[0] ?? null
        const tags = this.normalizeTags(data.tags ?? [])
        const summary = String(data.summary ?? '').trim()
        const readingTime = this.normalizeReadingTime(data.readingTime)

        const postMetadata = {
            slug,
            author: String(data.author || ''),
            title: String(data.title ?? '').trim(),
            summary,
            path,
            cover,
            images,
            tags,
            timestamp,
            lastModified,
            readingTime
        }

        const fullHtml = await this.renderPostHTML({
            ...postMetadata,
            content: contentHtml
        })

        settings.articles.storage.unshift(postMetadata)
        settings.last_modified = timestamp
        const updatedSettings = JSON.stringify(settings, null, 4)

        const updatedSitemap = await this.prepareSitemap(timestamp, {
            upsertUrl: this.buildPostURL(slug)
        })

        const files = [
            ...imageFiles.map(image => ({
                path: image.path,
                content: image.file
            })),
            {
                path,
                content: fullHtml
            },
            {
                path: this.settingsPath,
                content: updatedSettings
            },
            ...(updatedSitemap ? [{
                path: this.sitemapPath,
                content: updatedSitemap
            }] : [])
        ]

        return {
            ...postMetadata,
            filename: `${slug}.html`,
            html: contentHtml,
            fullHtml,
            imageFiles,
            files,
            updatedSettings,
            updatedSitemap
        }
    }
}

export { PostManager }
