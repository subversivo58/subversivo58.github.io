/**
 * @file AdminPosts.mjs
 * @description Admin management of HTML post files.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */
import RSSFeed from '../lib/RSSFeed.mjs'

class AdminPosts {
    /**
     * Creates the admin post manager.
     * @param {WysiwygEditor} editor - Editor instance used to create and edit posts.
     */
    constructor(editor) {
        this.editor = editor
        this.postManager = editor.postManager

        this.posts = []
        this.filterQuery = ''

        this.modal = null
        this.modalBackdrop = null
        this.modalBusy = false

        this.settingsPath = this.postManager.settingsPath
        this.sitemapPath = this.postManager.sitemapPath
        this.feedPath = 'feed.xml'

        this.installEditorIntegration()
    }

    /**
     * Adds or updates the RSS feed in the list of files to publish.
     * @description Generates the feed from the posts in the settings file and replaces any existing feed file.
     * @param {Object[]} files - Files to publish, each with path, content and delete fields.
     * @return {Object[]} The updated list.
     * @throws {Error} rss_files_missing, rss_settings_missing or rss_posts_invalid when the input is invalid.
     */
    attachRSSFeed(files) {
        if (!Array.isArray(files)) {
            throw new Error('rss_files_missing')
        }

        const settingsFile = files.find(file => (
            file.path === this.settingsPath &&
            !file.delete &&
            typeof file.content === 'string'
        ))

        if (!settingsFile) {
            throw new Error('rss_settings_missing')
        }

        const settings = JSON.parse(settingsFile.content)
        const posts = settings?.articles?.storage

        if (!Array.isArray(posts)) {
            throw new Error('rss_posts_invalid')
        }

        const feedContent = RSSFeed.generate(posts)
        const feedFile = {
            path: this.feedPath,
            content: feedContent
        }
        const existingIndex = files.findIndex(file => file.path === this.feedPath)

        if (existingIndex >= 0) {
            files[existingIndex] = feedFile
        } else {
            files.push(feedFile)
        }

        return files
    }

    /**
     * Gets the page elements and binds the list events.
     * @return {void}
     */
    mount() {
        this.listEl = document.getElementById('admin-posts-list')
        this.searchEl = document.getElementById('admin-posts-search')
        this.countBadge = document.getElementById('admin-posts-badge')
        this.emptyEl = document.getElementById('admin-posts-empty')

        if (this.listEl) {
            this.listEl.addEventListener('click', event => {
                this.handleListClick(event)
            })
        }

        if (this.searchEl) {
            this.searchEl.addEventListener('input', () => {
                this.filterQuery = this.searchEl.value.trim().toLowerCase()
                this.renderList()
                this.translate()
            })
        }

        const newPostButton = document.getElementById('admin-new-post')
        if (newPostButton) {
            newPostButton.addEventListener('click', () => {
                if (
                    this.editor.editingPost &&
                    this.editor.hasChanges &&
                    !window.confirm(this.editor.message('discard_changes'))
                ) {
                    return
                }
                this.editor.resetEditor()
                this.showView('editor')
            })
        }

        const backButton = document.getElementById('admin-back-to-posts')
        if (backButton) {
            backButton.addEventListener('click', () => {
                if (
                    this.editor.hasChanges &&
                    !window.confirm(this.editor.message('discard_changes'))
                ) {
                    return
                }
                if (this.editor.editingPost) {
                    this.editor.resetEditor()
                }
                this.showView('posts')
            })
        }

        return this.refresh()
    }

    /**
     * Shows an admin view through the dashboard, when the dashboard is available.
     * @param {string} viewName
     */
    showView(viewName) {
        if (typeof window.__adminShowView === 'function') {
            window.__adminShowView(viewName)
        }
    }

    /**
     * Connects the post manager to the editor, replacing the publish, update and delete flows.
     * @description The editor keeps a reference to this manager, so the actions of the editor and the list operate on the same data.
     */
    installEditorIntegration() {
        const editor = this.editor
        const manager = this.postManager

        editor.editingPost = null
        editor.adminPosts = this

        const createPost = manager.createPost.bind(manager)

        manager.createPost = async data => {
            if (editor.editingPost) {
                const post = await this.prepareUpdatePost(editor.editingPost, data)
                this.attachRSSFeed(post.files)
                return { ...post, operation: 'update' }
            }

            const post = await createPost(data)
            this.attachRSSFeed(post.files)
            return { ...post, operation: 'create' }
        }

        const resetEditor = editor.resetEditor.bind(editor)
        editor.resetEditor = (...args) => {
            const result = resetEditor(...args)
            editor.editingPost = null

            const heading = document.getElementById('admin-editor-heading')
            if (heading) {
                this.setKey(heading, 'admin_dashboard.new_post')
            }

            if (editor.elements.generate) {
                this.setKey(editor.elements.generate, 'admin_dashboard.editor.generate')
            }

            return result
        }

        const confirmPublication = editor.confirmPublication.bind(editor)
        editor.confirmPublication = async (...args) => {
            const result = await confirmPublication(...args)
            await this.refresh()
            return result
        }

        const generatePost = editor.generatePost.bind(editor)
        editor.generatePost = async (...args) => {
            const updating = !!editor.editingPost
            const result = await generatePost(...args)

            if (result && result.published !== false) {
                manager.markCommitted({
                    settings: result.updatedSettings,
                    sitemap: result.updatedSitemap
                })
                if (updating) {
                    editor.setStatus('post_updated')
                }
                await this.refresh()
            }

            return result
        }

        editor.loadPublishedPost = (post, contentHtml) => {
            editor.resetEditor()

            const path = this.getPostPath(post)

            editor.editingPost = {
                ...post,
                path,
                html: contentHtml
            }

            editor.elements.title.value = post.title || ''
            editor.elements.slug.value = post.slug || ''
            editor.elements.slug.readOnly = true
            if (editor.elements.slugLock) {
                editor.elements.slugLock.textContent = '🔒'
                editor.elements.slugLock.setAttribute('aria-pressed', 'false')
            }
            editor.slugManual = true
            editor.updateSlugPreview()

            editor.elements.summary.value = post.summary || ''
            editor.elements.tags.value = Array.isArray(post.tags)
                ? post.tags.join(', ')
                : (post.tags || '')

            editor.summaryManual = !!post.summary
            editor.readingTime = Number(post.readingTime) > 0 ? Number(post.readingTime) : 1

            editor.setEditorHTML(contentHtml || '')
            editor.currentDraftKey = null
            editor.hasChanges = false

            const heading = document.getElementById('admin-editor-heading')
            if (heading) {
                this.setKey(heading, 'admin_dashboard.edit_post')
            }

            this.setKey(editor.elements.generate, 'admin_dashboard.update_post')

            this.showView('editor')
            editor.setStatus('post_loaded')
            editor.elements.title.focus()
        }
    }

    /**
     * Translates the editor interface, when the editor supports it.
     */
    translate() {
        if (typeof this.editor.translate === 'function') {
            this.editor.translate()
        }
    }

    /**
     * Sets the translation key of an element and keeps its other classes.
     * @param {HTMLElement} element
     * @param {string} key - i18n key.
     */
    setKey(element, key) {
        if (!element) return
        element.classList.remove('i18n', 'i18n-append', 'i18n-prepend', 'i18n-pure')
        element.classList.add('i18n')
        const existingClasses = [...element.classList].filter(c => c !== 'i18n')
        element.className = ['i18n', ...existingClasses].join(' ')
        element.setAttribute('data-i18n-html', key)
        element.removeAttribute('translated')
        this.translate()
    }

    /**
     * Reloads the posts from the settings and renders the list.
     * @return {Promise<void>}
     * @description Failures are shown as an error message in the list.
     */
    async refresh() {
        try {
            const settings = await this.postManager.loadSettings()

            this.posts = [...settings.articles.storage].sort(
                (a, b) => this.getPostTimestamp(b) - this.getPostTimestamp(a)
            )

            if (this.countBadge) {
                this.countBadge.textContent = String(this.posts.length)
            }

            this.renderList()
            this.translate()
            return true
        } catch (error) {
            console.error('[ADMIN POSTS]:', error)
            return false
        }
    }

    /**
     * Renders the posts that match the current search, in the list.
     * @return {void}
     */
    renderList() {
        if (!this.listEl) return
        this.listEl.replaceChildren()

        const query = this.filterQuery
        const filtered = query
            ? this.posts.filter(post => {
                const haystack = [
                    post.title,
                    post.slug,
                    ...(Array.isArray(post.tags) ? post.tags : [])
                ].join(' ').toLowerCase()
                return haystack.includes(query)
            })
            : this.posts

        if (this.emptyEl) {
            this.emptyEl.hidden = filtered.length > 0
        }

        filtered.forEach(post => {
            this.listEl.appendChild(this.createPostItem(post))
        })
    }

    /**
     * Creates the list item of a post from the template.
     * @param {Object} post
     * @return {DocumentFragment|HTMLElement}
     */
    createPostItem(post) {
        const fragment = document.getElementById('admin-post-item-template').content.cloneNode(true)

        const item = fragment.querySelector('[data-post-item]')
        const cover = item.querySelector('[data-post-cover]')
        const title = item.querySelector('[data-post-title]')
        const slugEl = item.querySelector('[data-post-slug]')
        const date = item.querySelector('[data-post-date]')
        const reading = item.querySelector('[data-post-reading]')
        const tagsWrap = item.querySelector('[data-post-tags]')
        const view = item.querySelector('[data-post-action="view"]')
        const edit = item.querySelector('[data-post-action="edit"]')
        const remove = item.querySelector('[data-post-action="delete"]')

        const coverPath = post.cover || (Array.isArray(post.images) ? post.images[0] : null)
        if (typeof coverPath === 'string' && coverPath.replace(/^\/+/, '').startsWith('assets/posts/images/')) {
            const img = document.createElement('img')
            img.src = `/${coverPath.replace(/^\/+/, '')}`
            img.alt = post.title || ''
            img.className = 'admin-post-thumb-img'
            img.onerror = () => {
                cover.textContent = '📰'
            }
            cover.appendChild(img)
        } else {
            cover.textContent = '📰'
        }

        if (post.title) {
            title.textContent = post.title
        } else {
            this.setKey(title, 'admin_dashboard.posts_list.untitled')
        }

        const postUrl = `/${this.getPostPath(post)}`
        if (slugEl) {
            slugEl.textContent = postUrl
            slugEl.title = postUrl
        }

        const timestamp = this.getPostTimestamp(post)
        if (date && timestamp) {
            date.textContent = new Date(timestamp).toLocaleDateString(
                document.documentElement.lang || undefined,
                { dateStyle: 'medium' }
            )
        }

        if (reading && post.readingTime) {
            reading.textContent = `${post.readingTime} min`
        }

        if (tagsWrap && Array.isArray(post.tags) && post.tags.length) {
            post.tags.slice(0, 5).forEach(tag => {
                const badge = document.createElement('span')
                badge.className = 'badge badge-light border mr-1 mb-1 font-weight-normal'
                badge.textContent = tag
                tagsWrap.appendChild(badge)
            })
        }

        if (view) {
            view.href = postUrl
        }

        edit.dataset.postSlug = post.slug
        remove.dataset.postSlug = post.slug

        return item
    }

    /**
     * Handles the clicks on the action buttons of the list.
     * @param {MouseEvent} event
     * @return {Promise<void>}
     */
    async handleListClick(event) {
        const button = event.target.closest('button[data-post-action]')
        if (!button || !this.listEl.contains(button)) return

        const slug = button.dataset.postSlug
        const post = this.posts.find(item => item.slug === slug)
        if (!post) return

        if (button.dataset.postAction === 'edit') {
            await this.editPost(post)
        } else if (button.dataset.postAction === 'delete') {
            await this.deletePost(post, button)
        }
    }

    /**
     * Returns the time of the last update of a post, in milliseconds.
     * @param {Object} post
     * @return {number} 0 when there is no valid date.
     */
    getPostTimestamp(post) {
        const timestamp = Number(post.timestamp)
        if (Number.isFinite(timestamp) && timestamp > 0) {
            return timestamp > 1e12 ? timestamp : timestamp * 1000
        }
        const date = Number(post.date)
        return Number.isFinite(date) && date > 0 ? date * 1000 : 0
    }

    /**
     * Returns the original publication time of a post, in milliseconds.
     * @param {Object} post
     * @return {number} The current time when there is no valid date.
     */
    getOriginalTimestamp(post) {
        const timestamp = Number(post.timestamp)
        if (Number.isFinite(timestamp) && timestamp > 0) {
            return timestamp > 1e12 ? timestamp : timestamp * 1000
        }
        const date = Number(post.date)
        return Number.isFinite(date) && date > 0 ? date * 1000 : Date.now()
    }

    /**
     * Returns the relative path of the file of a post.
     * @param {Object} post
     * @return {string}
     */
    getPostPath(post) {
        if (typeof post.path === 'string' && post.path.trim()) {
            return post.path.replace(/^\/+/, '')
        }
        return this.postManager.buildPostPath(post.slug)
    }

    /**
     * Extracts the content of a post from its HTML page.
     * @description Uses the POST_CONTENT_START and POST_CONTENT_END markers when they exist. Otherwise, it reads the main content of the page.
     * @param {string} pageHtml
     * @return {string}
     */
    extractContentFromHTML(pageHtml) {
        const match = String(pageHtml || '').match(
            /<!--\s*POST_CONTENT_START\s*-->([\s\S]*?)<!--\s*POST_CONTENT_END\s*-->/
        )
        if (match) return match[1].trim()

        const doc = new DOMParser().parseFromString(String(pageHtml || ''), 'text/html')
        const article = doc.querySelector('article.post-content, article.markdown-body, article')
        return article ? article.innerHTML.trim() : ''
    }

    /**
     * Downloads the HTML page of a post and extracts its content.
     * @param {Object} post
     * @return {Promise<string>}
     * @throws {Error} post_fetch_error when the page cannot be loaded.
     */
    async fetchPostContentHTML(post) {
        const path = this.getPostPath(post)
        const response = await fetch(`/${path}?_=${Date.now()}`, { cache: 'no-store' })
        if (!response.ok) {
            throw new Error('post_fetch_error')
        }
        const pageHtml = await response.text()
        return this.extractContentFromHTML(pageHtml)
    }

    /**
     * Loads a published post into the editor for editing.
     * @param {Object} post
     * @return {Promise<void>}
     */
    async editPost(post) {
        try {
            const contentHtml = await this.fetchPostContentHTML(post)
            this.editor.loadPublishedPost(post, contentHtml)
        } catch (error) {
            console.error('[ADMIN POSTS]:', error)
            this.editor.setStatus('post_load_error')
        }
    }

    /**
     * Collects the paths of the post images that are in assets/posts/images/.
     * @param {Object} post
     * @param {string} [html='']
     * @return {Set<string>}
     */
    collectPostImages(post, html = '') {
        const images = new Set()

        if (Array.isArray(post.images)) {
            post.images.forEach(path => {
                const clean = String(path || '').replace(/^\/+/, '')
                if (clean.startsWith('assets/posts/images/')) {
                    images.add(clean)
                }
            })
        }

        if (typeof post.cover === 'string') {
            const cleanCover = post.cover.replace(/^\/+/, '')
            if (cleanCover.startsWith('assets/posts/images/')) {
                images.add(cleanCover)
            }
        }

        this.postManager.extractImagePaths(html).forEach(path => images.add(path))
        return [...images]
    }

    /**
     * Collects the image paths used by the other posts, except the one given.
     * @param {Object[]} posts
     * @param {string} excludedSlug
     * @return {Set<string>}
     */
    collectOtherPostImages(posts, excludedSlug) {
        const images = new Set()
        posts.forEach(post => {
            if (post.slug === excludedSlug) return
            this.collectPostImages(post).forEach(path => images.add(path))
        })
        return images
    }

    /**
     * Prepares the files and settings needed to update a post.
     * @param {Object} post - Post being updated.
     * @param {Object} data - New post data.
     * @return {Promise<Object>} The files and data to publish.
     * @throws {Error} post_missing when the post does not exist in the settings.
     */
    async prepareUpdatePost(post, data) {
        const settings = await this.postManager.loadSettings()
        const storage = settings.articles.storage
        const index = storage.findIndex(item => item.slug === post.slug)

        if (index < 0) {
            throw new Error('post_missing')
        }

        const current = storage[index]
        const now = Date.now()
        const oldPath = this.getPostPath(current)

        const newSlug = this.postManager.ensureUniqueSlug(
            data.slug || current.slug,
            storage,
            current.slug
        )
        const newPath = this.postManager.buildPostPath(newSlug)
        const renamed = newSlug !== current.slug

        const contentHtml = String(data.content || '').trim()
        const images = this.postManager.extractImagePaths(contentHtml)
        const imageFiles = this.postManager.orderImages(contentHtml, data.images || [])

        const otherImages = this.collectOtherPostImages(storage, current.slug)
        const oldImages = this.collectPostImages(current, post.html || '')
        const newImagePaths = new Set(images)

        const obsoleteImages = oldImages.filter(image => (
            !newImagePaths.has(image) && !otherImages.has(image)
        ))

        const metadata = {
            ...current,
            slug: newSlug,
            author: current.author || String(data.author || ''),
            title: String(data.title || '').trim(),
            summary: String(data.summary || '').trim(),
            path: newPath,
            cover: images[0] || null,
            images,
            tags: this.postManager.normalizeTags(data.tags || []),
            timestamp: this.getOriginalTimestamp(current),
            lastModified: now,
            readingTime: this.postManager.normalizeReadingTime(data.readingTime)
        }

        const fullHtml = await this.postManager.renderPostHTML({
            ...metadata,
            content: contentHtml
        })

        storage[index] = metadata
        settings.last_modified = now
        const updatedSettings = JSON.stringify(settings, null, 4)

        const updatedSitemap = await this.postManager.prepareSitemap(now, {
            upsertUrl: this.postManager.buildPostURL(newSlug),
            removeUrl: renamed ? this.postManager.buildPostURL(current.slug) : null
        })

        const files = new Map()

        imageFiles.forEach(image => {
            files.set(image.path, {
                path: image.path,
                content: image.file
            })
        })

        files.set(newPath, {
            path: newPath,
            content: fullHtml
        })

        if (renamed && oldPath !== newPath) {
            files.set(oldPath, {
                path: oldPath,
                content: null,
                delete: true
            })
        }

        obsoleteImages.forEach(image => {
            files.set(image, {
                path: image,
                content: null,
                delete: true
            })
        })

        files.set(this.settingsPath, {
            path: this.settingsPath,
            content: updatedSettings
        })

        if (updatedSitemap) {
            files.set(this.sitemapPath, {
                path: this.sitemapPath,
                content: updatedSitemap
            })
        }

        return {
            ...metadata,
            html: contentHtml,
            fullHtml,
            imageFiles,
            files: [...files.values()],
            updatedSettings,
            updatedSitemap
        }
    }

    /**
     * Prepares the files and settings needed to delete a post.
     * @param {Object} post
     * @param {string} contentHtml - Current content of the post page.
     * @return {Promise<Object>}
     * @throws {Error} post_missing_delete when the post does not exist in the settings.
     */
    async prepareDeletePost(post, contentHtml) {
        const settings = await this.postManager.loadSettings()
        const storage = settings.articles.storage
        const index = storage.findIndex(item => item.slug === post.slug)

        if (index < 0) {
            throw new Error('post_missing_delete')
        }

        const current = storage[index]
        const postPath = this.getPostPath(current)
        const images = this.collectPostImages(current, contentHtml)
        const otherImages = this.collectOtherPostImages(storage, current.slug)

        storage.splice(index, 1)

        const now = Date.now()
        settings.last_modified = now
        const updatedSettings = JSON.stringify(settings, null, 4)

        const updatedSitemap = await this.postManager.prepareSitemap(now, {
            removeUrl: this.postManager.buildPostURL(current.slug)
        })

        const files = new Map()

        files.set(postPath, {
            path: postPath,
            content: null,
            delete: true
        })

        images.forEach(image => {
            if (otherImages.has(image)) return
            files.set(image, {
                path: image,
                content: null,
                delete: true
            })
        })

        files.set(this.settingsPath, {
            path: this.settingsPath,
            content: updatedSettings
        })

        if (updatedSitemap) {
            files.set(this.sitemapPath, {
                path: this.sitemapPath,
                content: updatedSitemap
            })
        }

        const fileList = [...files.values()]
        this.attachRSSFeed(fileList)

        return {
            operation: 'delete',
            slug: current.slug,
            title: current.title,
            files: fileList,
            updatedSettings,
            updatedSitemap
        }
    }

    /**
     * Deletes a post after confirmation.
     * @param {Object} post
     * @param {HTMLElement} trigger - Button that started the action. It is disabled while the operation runs.
     * @return {Promise<void>}
     */
    async deletePost(post, trigger) {
        if (this.modalBusy) return
        trigger.disabled = true

        try {
            let contentHtml = ''
            try {
                contentHtml = await this.fetchPostContentHTML(post)
            } catch {
            }

            const payload = await this.prepareDeletePost(post, contentHtml)
            this.openDeleteModal(post, payload)
        } catch (error) {
            console.error('[ADMIN POSTS]:', error)
            this.editor.setStatus('delete_prepare_error', error.message)
        } finally {
            trigger.disabled = false
        }
    }

    /**
     * Opens the modal that confirms the deletion of a post.
     * @param {Object} post
     * @param {Object} payload - Prepared deletion data.
     */
    openDeleteModal(post, payload) {
        if (this.modal) return

        const backdrop = document.createElement('div')
        backdrop.className = 'modal-backdrop fade show'

        const modal = document.createElement('section')
        modal.className = 'modal fade show'
        modal.tabIndex = -1
        modal.setAttribute('role', 'dialog')
        modal.setAttribute('aria-modal', 'true')
        modal.setAttribute('aria-labelledby', 'admin-delete-title')
        modal.style.display = 'block'

        modal.appendChild(
            document.getElementById('admin-delete-modal-template').content.cloneNode(true)
        )

        const titleNode = modal.querySelector('[data-post-title]')
        if (post.title) {
            titleNode.textContent = post.title
        } else {
            this.setKey(titleNode, 'admin_dashboard.posts_list.untitled')
        }

        document.body.append(backdrop, modal)
        document.body.classList.add('modal-open')
        this.translate()

        this.modal = modal
        this.modalBackdrop = backdrop
        this.modalBusy = false

        const confirm = modal.querySelector('[data-modal-confirm]')
        const status = modal.querySelector('[data-modal-status]')

        modal.querySelectorAll('[data-modal-close]').forEach(button => {
            button.addEventListener('click', () => {
                if (!this.modalBusy) this.closeModal()
            })
        })

        modal.addEventListener('click', event => {
            if (event.target === modal && !this.modalBusy) this.closeModal()
        })

        this.modalKeyHandler = event => {
            if (event.key === 'Escape' && this.modal && !this.modalBusy) {
                this.closeModal()
            }
        }
        document.addEventListener('keydown', this.modalKeyHandler)

        confirm.addEventListener('click', async () => {
            if (this.modalBusy) return
            this.modalBusy = true

            confirm.disabled = true
            this.setKey(confirm, 'admin_dashboard.delete_modal.deleting')

            modal.querySelectorAll('[data-modal-close]').forEach(button => {
                button.disabled = true
            })

            status.hidden = false
            status.className = 'small mt-3 mb-0 text-muted'
            this.setKey(status, 'admin_dashboard.delete_modal.deleting_status')

            try {
                const result = await this.editor.onCreate(payload)

                if (!result || result.published !== true) {
                    throw new Error('github_not_confirmed')
                }

                this.postManager.markCommitted({
                    settings: payload.updatedSettings,
                    sitemap: payload.updatedSitemap
                })

                status.className = 'alert alert-success rounded-0 mt-3 mb-0'
                this.setKey(status, 'admin_dashboard.delete_modal.success')

                if (this.editor.editingPost && this.editor.editingPost.slug === post.slug) {
                    this.editor.resetEditor()
                    this.showView('posts')
                }

                window.setTimeout(async () => {
                    this.closeModal(true)
                    await this.refresh()
                }, 900)
            } catch (error) {
                console.error('[ADMIN POSTS]:', error)
                status.className = 'alert alert-danger rounded-0 mt-3 mb-0'
                this.setKey(status, 'admin_dashboard.delete_modal.error')
                this.editor.setStatus('delete_error', error.message)

                window.setTimeout(() => {
                    this.closeModal(true)
                }, 1800)
            }
        })

        confirm.focus()
    }

    /**
     * Closes the confirmation modal.
     * @param {boolean} [force=false] - Closes the modal even while an operation is busy.
     */
    closeModal(force = false) {
        if (!this.modal || (this.modalBusy && !force)) return
        this.modal.remove()
        if (this.modalBackdrop) this.modalBackdrop.remove()
        document.body.classList.remove('modal-open')
        document.removeEventListener('keydown', this.modalKeyHandler)
        this.modal = null
        this.modalBackdrop = null
        this.modalBusy = false
    }
}

export { AdminPosts }
export default AdminPosts