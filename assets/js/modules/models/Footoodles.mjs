/**
 * @license The MIT License (MIT)
 * @copyright Copyright (c) 2026 Lauro Moraes - [https://github.com/subversivo58]
 *
 * @file Footoodles.mjs
 * @description Administração de Footoodles em painel isolado com pré-visualização de imagem e renovação de sessão.
 */

import PostManager from './PostManager.mjs'
import ImageProcessor from '../lib/ImageProcessor.mjs'

const FOOTOODLES_PATH = 'assets/footoodles'
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const TITLE_LIMIT = 50
const CONTENT_LIMIT = 280

class Footoodles {
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
    }

    tr(key) {
        return this.translate(`admin_dashboard.footoodles.${key}`)
    }

    // ---------- data ----------

    async load() {
        if (this.committed) {
            return structuredClone(this.committed)
        }

        const settings = await this.posts.loadSettings()
        settings.articles.footoodles = settings.articles.footoodles ?? []
        return settings
    }

    async list() {
        const settings = await this.load()
        return settings.articles.footoodles
    }

    imagePath(id, file) {
        const extension = (file.name.split('.').pop() || 'png').toLowerCase()
        return `${FOOTOODLES_PATH}/images/${id}.${extension}`
    }

    async commit(message, settings, files = []) {
        if (typeof this.ensureSession === 'function') {
            const valid = await this.ensureSession(false)
            if (!valid) {
                throw new Error('GitHub session unavailable')
            }
        }

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

    async create({ title, content, image }) {
        const settings = await this.load()
        const id = this.posts.generateID()
        const processed = await this.images.process(image)
        const path = this.imagePath(id, processed)

        const entry = { id, title, content, image: path }
        settings.articles.footoodles.unshift(entry)

        await this.commit(`Footoodle: ${title}`, settings, [
            { path, content: processed }
        ])

        return entry
    }

    async edit(id, { title, content, image = null }) {
        const settings = await this.load()
        const list = settings.articles.footoodles
        const index = list.findIndex(item => item.id === id)

        if (index < 0) throw new Error('Footoodle not found')

        const current = list[index]
        const files = []
        let path = current.image

        if (image) {
            const processed = await this.images.process(image)
            path = this.imagePath(id, processed)
            files.push({ path, content: processed })

            if (current.image !== path && !this.isImageShared(list, current.image, id)) {
                files.push({ path: current.image, delete: true })
            }
        }

        list[index] = { ...current, title, content, image: path }
        await this.commit(`Footoodle: ${title}`, settings, files)
        return list[index]
    }

    async remove(id) {
        const settings = await this.load()
        const list = settings.articles.footoodles
        const target = list.find(item => item.id === id)

        if (!target) throw new Error('Footoodle not found')

        settings.articles.footoodles = list.filter(item => item.id !== id)

        const files = this.isImageShared(settings.articles.footoodles, target.image, id)
            ? []
            : [{ path: target.image, delete: true }]

        await this.commit(`Remove footoodle: ${target.title}`, settings, files)
    }

    isImageShared(list, path, ignoreId) {
        return list.some(item => item.id !== ignoreId && item.image === path)
    }

    // ---------- admin interface ----------

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

    setPreviewFile(file) {
        this.clearPreview()
        if (!file || !this.el?.imagePreview) return
        this.previewObjectUrl = URL.createObjectURL(file)
        this.el.imagePreview.src = this.previewObjectUrl
        this.el.imagePreview.hidden = false
    }

    setPreviewUrl(path) {
        this.clearPreview()
        if (!path || !this.el?.imagePreview) return
        this.el.imagePreview.src = `/${String(path).replace(/^\/+/, '')}`
        this.el.imagePreview.hidden = false
    }

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

    resetForm() {
        this.editingId = null
        this.el.title.value = ''
        this.el.content.value = ''
        this.el.image.value = ''
        this.el.imageName.textContent = ''
        this.clearPreview()
        this.updateCount()
    }

    updateCount() {
        const length = this.el.content.value.length
        this.el.count.textContent = this.tr('character_count').replace('{count}', length)
    }

    setStatus(key, className = '') {
        this.el.status.className = `small mt-2 mb-0 ${className}`
        this.el.status.textContent = this.tr(key)
        this.el.status.hidden = false
    }

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

    note(key) {
        const paragraph = document.createElement('p')
        paragraph.className = 'small text-muted px-2 mb-0 col-12'
        paragraph.textContent = this.tr(key)
        return paragraph
    }

    renderCard(item) {
        const col = document.createElement('div')
        col.className = 'col-12 col-md-6 col-xl-4 mb-3'

        const card = document.createElement('div')
        card.className = 'card rounded-0 h-100 border'

        const thumbWrap = document.createElement('div')
        thumbWrap.className = 'admin-footoodle-thumb bg-light'
        const img = document.createElement('img')
        img.src = `/${String(item.image || '').replace(/^\/+/, '')}`
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

    button(label, className, handler) {
        const button = document.createElement('button')
        button.type = 'button'
        button.className = `btn btn-sm rounded-0 cp ${className}`
        button.textContent = label
        button.addEventListener('click', handler)
        return button
    }

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
