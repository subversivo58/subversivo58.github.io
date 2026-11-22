
/**
 * @license The MIT License (MIT)
 * @copyright Copyright (c) 2010-2026 Lauro Moraes
 *
 * @file RSSFeed.mjs
 * @description Geração do feed RSS das postagens do Blog Subversivo58.
 */

const DEFAULT_SITE_ORIGIN = `${globalThis.location.protocol}//${globalThis.location.host}`

export default class RSSFeed {
    /**
     * Escapa caracteres reservados do XML e remove caracteres de controle inválidos.
     */
    static escapeXML(value) {
        return String(value ?? '')
            .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, '')
            .replace(/[&<>"']/g, char => ({
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&apos;'
            })[char])
    }

    /**
     * Normaliza timestamps em segundos ou milissegundos.
     */
    static normalizeDate(value) {
        const timestamp = Number(value)

        if (!Number.isFinite(timestamp) || timestamp <= 0) {
            return null
        }

        const milliseconds = timestamp > 1e12
            ? timestamp
            : timestamp * 1000

        const date = new Date(milliseconds)

        return Number.isNaN(date.getTime()) ? null : date
    }

    /**
     * Converte uma data para o formato RFC 822 utilizado pelo RSS.
     */
    static formatDate(date) {
        return date ? date.toUTCString() : ''
    }

    /**
     * Resolve um endereço público pertencente ao próprio site.
     */
    static buildURL(path, siteOrigin) {
        if (typeof path !== 'string' || !path.trim()) {
            return null
        }

        try {
            const url = new URL(
                path.trim().replace(/^\/+/, ''),
                `${siteOrigin.replace(/\/+$/, '')}/`
            )

            if (url.origin !== siteOrigin) {
                return null
            }

            return url.href
        } catch {
            return null
        }
    }

    /**
     * Resolve o endereço público de uma postagem.
     */
    static buildPostURL(post, siteOrigin) {
        const path = typeof post.path === 'string' && post.path.trim()
            ? post.path.trim()
            : (post.slug ? `posts/${post.slug}.html` : '')

        return this.buildURL(path, siteOrigin)
    }

    /**
     * Identifica o tipo MIME da imagem pela extensão.
     */
    static getImageType(imageURL) {
        const extension = imageURL
            .split(/[?#]/)[0]
            .split('.')
            .pop()
            .toLowerCase()

        const types = {
            avif: 'image/avif',
            gif: 'image/gif',
            jpeg: 'image/jpeg',
            jpg: 'image/jpeg',
            png: 'image/png',
            svg: 'image/svg+xml',
            webp: 'image/webp'
        }

        return types[extension] || 'image/*'
    }

    /**
     * Gera o XML RSS 2.0 a partir de articles.storage.
     *
     * @param {object[]} posts Lista de postagens.
     * @param {object} options Configurações opcionais do feed.
     * @returns {string} Documento XML completo.
     */
    static generate(posts = [], options = {}) {
        const siteOrigin = String(
            options.siteOrigin || DEFAULT_SITE_ORIGIN
        ).replace(/\/+$/, '')

        const feedPath = options.feedPath || '/feed.xml'
        const blogPath = options.blogPath || '/blog.html'

        const channelTitle = options.title || 'Blog Subversivo58'
        const channelDescription = options.description ||
            'Publicações do Blog Subversivo58.'

        const language = options.language || 'pt-BR'
        const generatedAt = this.normalizeDate(
            options.generatedAt ?? Date.now()
        ) || new Date()

        const items = (Array.isArray(posts) ? posts : [])
            .filter(post => post && typeof post === 'object')
            .map(post => {
                const title = String(post.title || '').trim()
                const link = this.buildPostURL(post, siteOrigin)

                if (!title || !link) return null

                const publishedAt = this.normalizeDate(
                    post.timestamp ?? post.date
                )

                const updatedAt = this.normalizeDate(
                    post.lastModified
                ) || publishedAt

                const summary = String(post.summary || '').trim()

                const cover = this.buildURL(
                    post.cover,
                    siteOrigin
                )

                const tags = Array.isArray(post.tags)
                    ? [...new Set(
                        post.tags
                            .map(tag => String(tag).trim())
                            .filter(Boolean)
                    )]
                    : []

                return {
                    title,
                    link,
                    publishedAt,
                    updatedAt,
                    summary,
                    cover,
                    tags
                }
            })
            .filter(Boolean)
            .sort((a, b) => (
                (b.publishedAt?.getTime() || 0) -
                (a.publishedAt?.getTime() || 0)
            ))

        const xmlItems = items.map(item => {
            const fields = [
                `        <title>${this.escapeXML(item.title)}</title>`,
                `        <link>${this.escapeXML(item.link)}</link>`,
                `        <guid isPermaLink="true">${this.escapeXML(item.link)}</guid>`
            ]

            if (item.cover) {
                const imageURL = this.escapeXML(item.cover)
                const imageType = this.escapeXML(
                    this.getImageType(item.cover)
                )

                // Media RSS: imagem principal e miniatura da postagem.
                fields.push(
                    `        <media:content url="${imageURL}" type="${imageType}" medium="image" />`,
                    `        <media:thumbnail url="${imageURL}" />`
                )
            }

            if (item.summary || item.cover) {
                const descriptionParts = []

                if (item.cover) {
                    descriptionParts.push(
                        `<img src="${this.escapeXML(item.cover)}" alt="${this.escapeXML(item.title)}" />`
                    )
                }

                if (item.summary) {
                    descriptionParts.push(
                        `<p>${this.escapeXML(item.summary)}</p>`
                    )
                }

                fields.push(
                    `        <description>${this.escapeXML(descriptionParts.join('\n'))}</description>`
                )
            }

            if (item.publishedAt) {
                fields.push(
                    `        <pubDate>${this.formatDate(item.publishedAt)}</pubDate>`
                )
            }

            if (item.updatedAt) {
                fields.push(
                    `        <atom:updated>${item.updatedAt.toISOString()}</atom:updated>`
                )
            }

            item.tags.forEach(tag => {
                fields.push(
                    `        <category>${this.escapeXML(tag)}</category>`
                )
            })

            return [
                '    <item>',
                ...fields,
                '    </item>'
            ].join('\n')
        })

        const channelLink = `${siteOrigin}${blogPath}`
        const feedURL = `${siteOrigin}${feedPath}`

        return [
            '<?xml version="1.0" encoding="UTF-8"?>',
            '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">',
            '  <channel>',
            `    <title>${this.escapeXML(channelTitle)}</title>`,
            `    <link>${this.escapeXML(channelLink)}</link>`,
            `    <description>${this.escapeXML(channelDescription)}</description>`,
            `    <language>${this.escapeXML(language)}</language>`,
            `    <lastBuildDate>${this.formatDate(generatedAt)}</lastBuildDate>`,
            `    <atom:link href="${this.escapeXML(feedURL)}" rel="self" type="application/rss+xml" />`,
            ...xmlItems,
            '  </channel>',
            '</rss>',
            ''
        ].join('\n')
    }
}
