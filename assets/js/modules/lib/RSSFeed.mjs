/**
 * @file RSSFeed.mjs
 * @description Generation of the blog RSS feed.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */
const DEFAULT_SITE_ORIGIN = `${globalThis.location.protocol}//${globalThis.location.host}`

export default class RSSFeed {
    /**
     * Escapes the characters reserved by XML and removes invalid control characters.
     * @param {*} value
     * @return {string}
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
     * Normalizes a timestamp given in seconds or milliseconds.
     * @param {number|string} value
     * @return {Date|null} null when the value is not a valid date.
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
     * Formats a date in RFC 822, the date format used by RSS.
     * @param {Date|null} date
     * @return {string} Empty string when there is no date.
     */
    static formatDate(date) {
        return date ? date.toUTCString() : ''
    }

    /**
     * Resolves a public address that belongs to the site.
     * @param {string} path
     * @param {string} siteOrigin
     * @return {string|null}
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
     * Resolves the public address of a post.
     * @param {Object} post
     * @param {string} siteOrigin
     * @return {string|null}
     */
    static buildPostURL(post, siteOrigin) {
        const path = typeof post.path === 'string' && post.path.trim()
            ? post.path.trim()
            : (post.slug ? `posts/${post.slug}.html` : '')

        return this.buildURL(path, siteOrigin)
    }

    /**
     * Returns the MIME type of an image, based on its extension.
     * @param {string} imageURL
     * @return {string}
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
     * Generates the RSS 2.0 XML from the posts.
     * @param {object[]} [posts=[]] - List of posts, usually articles.storage.
     * @param {object} [options={}] - Optional feed settings.
     * @return {string} The complete XML document.
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
