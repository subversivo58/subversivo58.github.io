/**
 * @file Footoodles.mjs
 * @description Admin panel for footoodle banners, with image preview and session renewal.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */
import PostManager from './PostManager.mjs'
import ImageProcessor from '../lib/ImageProcessor.mjs'

const FOOTOODLES_PATH = 'assets/footoodles'
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const TITLE_LIMIT = 50
const CONTENT_LIMIT = 280

class Footoodles {
    /**
     * Creates the footoodle manager.
     * @param {Object} [options={}]
     * @param {Function} options.getApi - Returns the GitHub API instance.
     * @param {Function} options.ensureSession - Checks the GitHub session.
     * @param {Object} options.repo - Repository with owner and name.
     * @param {string} options.branch - Branch used for the commits.
     * @param {string} options.settingsPath
     * @param {Function} options.translate - Translation function.
     */
    constructor({ getApi, ensureSession, repo, branch, settingsPath, translate } = {}) {
        this.getApi = getApi
        this.ensureSession = ensureSession
        this.repo = repo
        this.branch = branch
        this.translate = translate

        this.posts = new PostManager({ settingsPath })
        this.images = new ImageProcessor({ auto: true })

        this.editingId = null
        this.previewObjectUrl = null
        this.cardPreviewUrls = new Map()
    }

    /**
     * Returns a translated text from the footoodles dictionary.
     * @param {string} key
     * @return {string}
     */
    tr(key) {
        return this.translate(`admin_dashboard.footoodles.${key}`)
    }

    // ---------- data ----------

    /**
     * Loads the settings with the footoodles, using the committed copy when it exists.
     * @return {Promise<Object>}
     */
    async load() {
        if (this.committed) {
            return structuredClone(this.committed)
        }

        const settings = await this.posts.loadSettings()
        settings.articles.footoodles = settings.articles.footoodles ?? []
        return settings
    }

    /**
     * Returns the list of footoodles.
     * @return {Promise<Object[]>}
     */
    async list() {
        const settings = await this.load()
        return settings.articles.footoodles
    }

    /**
     * Builds the repository path of a footoodle image.
     * @param {string} id - Footoodle identifier.
     * @param {File} file - Image file, used for its extension.
     * @return {string}
     */
    imagePath(id, file) {
        const extension = (file.name.split('.').pop() || 'png').toLowerCase()
        return `${FOOTOODLES_PATH}/images/${id}.${extension}`
    }

    /**
     * Commits the given files and settings to the repository.
     * @param {string} message - Commit message.
     * @param {Object} settings - Settings to save.
     * @param {Object[]} [files=[]] - Additional files to commit.
     * @return {Promise<void>}
     * @throws {Error} If the GitHub session or API is not available.
     */
    async commit(message, settings, files = []) {
        if (typeof this.ensureSession === 'function') {
            const valid = await this.ensureSession(false)
            if (!valid) {
                throw new Error('GitHub session unavailable')
            }
        }

        /**
         * Pushes the files to the repository branch.
         * @private
         */
        const executePush = async () => {
            const api = this.getApi()
            if (!api) throw new Error('GitHub API unavailable')

            api.setRepo(this.repo.owner, this.repo.name)
            await api.setBranch(this.branch)

            return api.pushFiles(message, [
                ...files,
                {
                    path: this.posts.settingsPath,
                    content: JSON.stringify(settings, null, 4)
                }
            ])
        }

        try {
            const response = await executePush()
            this.committed = structuredClone(settings)
            return response
        } catch (error) {
            if (error?.response?.status === 401 && typeof this.ensureSession === 'function') {
                const renewed = await this.ensureSession(true)
                if (renewed) {
                    const retry = await executePush()
                    this.committed = structuredClone(settings)
                    return retry
                }
            }
            throw error
        }
    }

    /**
     * Creates a footoodle with an image.
     * @param {Object} data
     * @param {string} data.title
     * @param {string} data.content
     * @param {File} data.image
     * @return {Promise<void>}
     */
    async create({ title, content, image }) {
        const settings = await this.load()
        const id = this.posts.generateID()
        const processed = await this.images.process(image)
        const path = this.imagePath(id, processed)

        const entry = { id, title, content, image: path }
        settings.articles.footoodles.unshift(entry)

        await this.commit(`Footoodle: create "${title}"`, settings, [
            { path, content: processed }
        ])

        this.setCardPreviewFile(id, processed)

        return entry
    }

    /**
     * Updates a footoodle. The image is replaced only when a new one is given.
     * @param {string} id - Footoodle identifier.
     * @param {Object} data
     * @param {string} data.title
     * @param {string} data.content
     * @param {File|null} [data.image=null]
     * @return {Promise<void>}
     * @throws {Error} If the footoodle is not found.
     */
    async edit(id, { title, content, image = null }) {
        const settings = await this.load()
        const list = settings.articles.footoodles
        const index = list.findIndex(item => item.id === id)

        if (index < 0) throw new Error('Footoodle not found')

        const current = list[index]
        const files = []
        let path = current.image
        let processedImage = null

        if (image) {
            processedImage = await this.images.process(image)
            path = this.imagePath(id, processedImage)
            files.push({ path, content: processedImage })

            if (current.image !== path && !this.isImageShared(list, current.image, id)) {
                files.push({ path: current.image, delete: true })
            }
        }

        list[index] = { ...current, title, content, image: path }
        await this.commit(`Footoodle: update "${title}"`, settings, files)

        if (processedImage) {
            this.setCardPreviewFile(id, processedImage)
        }

        return list[index]
    }

    /**
     * Removes a footoodle, and its image when no other footoodle uses it.
     * @param {string} id
     * @return {Promise<void>}
     * @throws {Error} If the footoodle is not found.
     */
    async remove(id) {
        const settings = await this.load()
        const list = settings.articles.footoodles
        const target = list.find(item => item.id === id)

        if (!target) throw new Error('Footoodle not found')

        settings.articles.footoodles = list.filter(item => item.id !== id)

        const files = this.isImageShared(settings.articles.footoodles, target.image, id)
            ? []
            : [{ path: target.image, delete: true }]

        await this.commit(`Footoodle: delete "${target.title}"`, settings, files)

        this.clearCardPreview(id)
    }

    /**
     * Checks whether an image path is used by another footoodle.
     * @param {Object[]} list - Footoodle list.
     * @param {string} path - Image path.
     * @param {string} ignoreId - Identifier to ignore in the check.
     * @return {boolean}
     */
    isImageShared(list, path, ignoreId) {
        return list.some(item => item.id !== ignoreId && item.image === path)
    }

    // ---------- admin interface ----------

    /**
     * Gets the page elements and renders the footoodle list.
     * @param {Object} elements
     * @param {HTMLElement} elements.listEl
     * @param {HTMLElement} elements.badgeEl
     * @param {HTMLElement} elements.emptyEl
     * @param {HTMLElement} [elements.editorRoot]
     * @return {Promise<void>}
     */
    async mount({ listEl, badgeEl, emptyEl, editorRoot }) {
        this.listEl = listEl
        this.badgeEl = badgeEl
        this.emptyEl = emptyEl
        this.root = editorRoot || document.getElementById('admin-footoodle-editor')
        this.panel = document.getElementById('admin-footoodles-editor-panel')

        if (!this.root) return

        this.el = {
            imageButton: this.root.querySelector('#footoodle-image-button'),
            imageName: this.root.querySelector('#footoodle-image-name'),
            imagePreview: this.root.querySelector('#footoodle-image-preview'),
            image: this.root.querySelector('#footoodle-image'),
            title: this.root.querySelector('#footoodle-title'),
            content: this.root.querySelector('#footoodle-content'),
            count: this.root.querySelector('#footoodle-count'),
            status: this.root.querySelector('#footoodle-status'),
            save: this.root.querySelector('#footoodle-save'),
            cancel: this.root.querySelector('#footoodle-cancel'),
            heading: this.root.querySelector('#footoodle-editor-heading')
        }

        this.el.imageButton.addEventListener('click', () => this.el.image.click())
        this.el.image.addEventListener('change', () => {
            const file = this.el.image.files[0] || null
            this.el.imageName.textContent = file?.name ?? ''
            this.setPreviewFile(file)
        })
        this.el.content.addEventListener('input', () => this.updateCount())
        this.el.save.addEventListener('click', () => this.save())
        this.el.cancel.addEventListener('click', () => {
            this.resetForm()
            if (this.panel) this.panel.hidden = true
        })

        document.querySelectorAll('[data-footoodles-new]').forEach(button => {
            button.addEventListener('click', () => this.openEditor(null))
        })

        this.updateCount()
        await this.refresh()
    }

    /**
     * Releases the preview of the image selected in the form.
     * @return {void}
     */
    clearPreview() {
        if (this.previewObjectUrl) {
            URL.revokeObjectURL(this.previewObjectUrl)
            this.previewObjectUrl = null
        }
        if (this.el?.imagePreview) {
            this.el.imagePreview.src = ''
            this.el.imagePreview.hidden = true
        }
    }

    /**
     * Shows the preview of an image file selected in the form.
     * @param {File|null} file
     */
    setPreviewFile(file) {
        this.clearPreview()
        if (!file || !this.el?.imagePreview) return
        this.previewObjectUrl = URL.createObjectURL(file)
        this.el.imagePreview.src = this.previewObjectUrl
        this.el.imagePreview.hidden = false
    }

    /**
     * Shows the preview of an image that is already stored.
     * @param {string} path - Image path.
     */
    setPreviewUrl(path) {
        this.clearPreview()
        if (!path || !this.el?.imagePreview) return
        this.el.imagePreview.src = `/${String(path).replace(/^\/+/, '')}`
        this.el.imagePreview.hidden = false
    }

    /**
     * Shows the preview of an image in a footoodle card.
     * @param {string} id
     * @param {File|null} file
     */
    setCardPreviewFile(id, file) {
        this.clearCardPreview(id)

        if (!file) return

        const url = URL.createObjectURL(file)
        this.cardPreviewUrls.set(id, url)

        return url
    }

    /**
     * Releases the preview of a footoodle card.
     * @param {string} id
     */
    clearCardPreview(id) {
        const url = this.cardPreviewUrls.get(id)

        if (url) {
            URL.revokeObjectURL(url)
            this.cardPreviewUrls.delete(id)
        }
    }

    /**
     * Opens the editor, to create a footoodle or to edit an existing one.
     * @param {Object|null} [item=null] - Footoodle to edit. Null to create a new one.
     * @description Also switches the admin dashboard to the footoodles view, when available.
     */
    openEditor(item) {
        if (typeof window.__adminShowView === 'function') {
            window.__adminShowView('footoodles')
        }

        this.editingId = item ? item.id : null
        this.el.title.value = item ? item.title : ''
        this.el.content.value = item ? item.content : ''
        this.el.image.value = ''
        this.el.imageName.textContent = ''

        if (item && item.image) {
            this.setPreviewUrl(item.image)
        } else {
            this.clearPreview()
        }

        if (this.el.heading) {
            this.el.heading.textContent = this.tr(item ? 'edit' : 'new')
        }

        this.updateCount()
        this.setStatus(item ? 'editor_edit' : 'editor_new')

        if (this.panel) {
            this.panel.hidden = false
            this.panel.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }
    }

    /**
     * Clears the editing form and the image preview.
     */
    resetForm() {
        this.editingId = null
        this.el.title.value = ''
        this.el.content.value = ''
        this.el.image.value = ''
        this.el.imageName.textContent = ''
        this.clearPreview()
        this.updateCount()
    }

    /**
     * Updates the character counter of the content field.
     */
    updateCount() {
        const length = this.el.content.value.length
        this.el.count.textContent = this.tr('character_count').replace('{count}', length)
    }

    /**
     * Shows a translated status message in the form.
     * @param {string} key
     * @param {string} [className='']
     */
    setStatus(key, className = '') {
        this.el.status.className = `small mt-2 mb-0 ${className}`
        this.el.status.textContent = this.tr(key)
        this.el.status.hidden = false
    }

    /**
     * Saves the footoodle from the form, creating or updating it.
     * @return {Promise<void>}
     */
    async save() {
        const title = this.el.title.value.trim()
        const content = this.el.content.value.trim()
        const image = this.el.image.files[0] ?? null
        const editing = this.editingId !== null

        if (!title || title.length > TITLE_LIMIT) return this.setStatus('title_required', 'text-danger')
        if (!content) return this.setStatus('content_required', 'text-danger')
        if (content.length > CONTENT_LIMIT) return this.setStatus('content_limit', 'text-danger')
        if (!editing && !image) return this.setStatus('image_required', 'text-danger')
        if (image && !ACCEPTED_TYPES.includes(image.type)) return this.setStatus('image_invalid', 'text-danger')

        this.el.save.disabled = true
        this.setStatus(editing ? 'updating' : 'saving')

        try {
            if (editing) {
                await this.edit(this.editingId, { title, content, image })
                this.setStatus('updated', 'text-success')
            } else {
                await this.create({ title, content, image })
                this.setStatus('saved', 'text-success')
            }

            this.resetForm()
            if (this.panel) this.panel.hidden = true
            await this.refresh()
        } catch (error) {
            console.error('[FOOTOODLES]:', error)
            this.setStatus(editing ? 'update_error' : 'save_error', 'text-danger')
        } finally {
            this.el.save.disabled = false
        }
    }

    /**
     * Reloads the footoodle list and renders it.
     * @return {Promise<void>}
     */
    async refresh() {
        let list = null
        try {
            list = await this.list()
        } catch (error) {
            console.error('[FOOTOODLES]:', error)
        }

        if (this.badgeEl && Array.isArray(list)) {
            this.badgeEl.textContent = String(list.length)
        }

        if (!this.listEl) return
        this.listEl.replaceChildren()

        if (list === null) {
            this.listEl.appendChild(this.note('load_error'))
            return
        }

        if (this.emptyEl) {
            this.emptyEl.hidden = list.length > 0
        }

        if (!list.length) {
            return
        }

        list.forEach(item => this.listEl.appendChild(this.renderCard(item)))
    }

    /**
     * Builds a translated note paragraph.
     * @param {string} key
     * @return {HTMLParagraphElement}
     */
    note(key) {
        const paragraph = document.createElement('p')
        paragraph.className = 'small text-muted px-2 mb-0 col-12'
        paragraph.textContent = this.tr(key)
        return paragraph
    }

    /**
     * Builds the card of a footoodle, with its image and actions.
     * @param {Object} item
     * @return {HTMLElement}
     */
    renderCard(item) {
        const col = document.createElement('div')
        col.className = 'col-12 col-md-6 col-xl-4 mb-3'

        const card = document.createElement('div')
        card.className = 'card rounded-0 h-100 border'

        const thumbWrap = document.createElement('div')
        thumbWrap.className = 'admin-footoodle-thumb bg-light'
        const img = document.createElement('img')

        img.src = this.cardPreviewUrls.get(item.id)
            || `/${String(item.image || '').replace(/^\/+/, '')}`

        img.alt = item.title || ''
        img.className = 'w-100 h-100'
        img.style.objectFit = 'cover'
        thumbWrap.appendChild(img)

        const body = document.createElement('div')
        body.className = 'card-body p-3 d-flex flex-column'

        const title = document.createElement('h6')
        title.className = 'card-title font-weight-bold mb-2 text-break'
        title.textContent = item.title

        const desc = document.createElement('p')
        desc.className = 'card-text small text-muted mb-3 flex-grow-1 text-break'
        desc.textContent = item.content

        const actions = document.createElement('div')
        actions.className = 'd-flex justify-content-end'
        actions.append(
            this.button(this.tr('edit'), 'btn-outline-primary mr-2', () => this.openEditor(item)),
            this.button(this.tr('delete'), 'btn-outline-danger', () => this.confirmRemove(item.id))
        )

        body.append(title, desc, actions)
        card.append(thumbWrap, body)
        col.appendChild(card)
        return col
    }

    /**
     * Builds a button with a label, a class and a click handler.
     * @param {string} label
     * @param {string} className
     * @param {Function} handler
     * @return {HTMLButtonElement}
     */
    button(label, className, handler) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = `btn btn-sm rounded-0 cp ${className}`
        button.textContent = label
        button.addEventListener('click', handler)
        return button
    }

    /**
     * Removes a footoodle after confirmation.
     * @param {string} id
     * @return {Promise<void>}
     */
    async confirmRemove(id) {
        if (!window.confirm(this.tr('delete_confirm'))) return

        if (this.panel) this.panel.hidden = false
        this.setStatus('deleting')

        try {
            await this.remove(id)
            if (this.editingId === id) {
                this.resetForm()
                if (this.panel) this.panel.hidden = true
            }
            this.setStatus('deleted', 'text-success')
            await this.refresh()
        } catch (error) {
            console.error('[FOOTOODLES]:', error)
            this.setStatus('delete_error', 'text-danger')
        }
    }
}

export default Footoodles
