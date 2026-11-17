/**
 * @license The MIT License (MIT)
 * @copyright Copyright (c) 2026 Lauro Moraes - [https://github.com/subversivo58]
 *
 * @file Footoodles.mjs
 * @description Footoodles admin: list, create, edit and delete (editor and lists).
 */
import PostManager from './PostManager.mjs'
import ImageProcessor from '../lib/ImageProcessor.mjs'

const FOOTOODLES_PATH = 'assets/footoodles'
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const TITLE_LIMIT = 50
const CONTENT_LIMIT = 280

class Footoodles {

    constructor({ getApi, repo, branch, settingsPath, translate } = {}) {

        this.getApi = getApi
        this.repo = repo
        this.branch = branch
        this.translate = translate

        // Reuses the post tools: ID generation (Hashids) and settings loading.
        this.posts = new PostManager({ settingsPath })
        this.images = new ImageProcessor({ auto: true })

        this.editingId = null

    }

    tr(key) {
        return this.translate(`admin_dashboard.footoodles.${key}`)
    }

    // ---------- data ----------

    async load() {

        // After a commit, the published file may take a while to update,
        // so the last committed settings are used as the source of truth.
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

    // A single commit: images plus the updated settings file.
    async commit(message, settings, files = []) {

        const api = this.getApi()
        if (!api) throw new Error('GitHub API unavailable')

        api.setRepo(this.repo.owner, this.repo.name)
        await api.setBranch(this.branch)

        const response = await api.pushFiles(message, [
            ...files,
            {
                path: this.posts.settingsPath,
                content: JSON.stringify(settings, null, 4)
            }
        ])

        this.committed = structuredClone(settings)

        return response

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

            // Removes the old image only when its path changed and no other footoodle uses it.
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

    async mount({ container, postRoot, lists }) {

        this.container = container
        this.postRoot = postRoot
        this.lists = lists
        this.root = container.querySelector('#admin-footoodle-editor')

        this.el = {
            imageButton: this.root.querySelector('#footoodle-image-button'),
            imageName: this.root.querySelector('#footoodle-image-name'),
            image: this.root.querySelector('#footoodle-image'),
            title: this.root.querySelector('#footoodle-title'),
            content: this.root.querySelector('#footoodle-content'),
            count: this.root.querySelector('#footoodle-count'),
            status: this.root.querySelector('#footoodle-status'),
            save: this.root.querySelector('#footoodle-save'),
            cancel: this.root.querySelector('#footoodle-cancel')
        }

        this.heading = container.querySelector('.card-header h3')
        this.savedHeading = null

        this.el.imageButton.addEventListener('click', () => this.el.image.click())
        this.el.image.addEventListener('change', () => {
            this.el.imageName.textContent = this.el.image.files[0]?.name ?? ''
        })
        this.el.content.addEventListener('input', () => this.updateCount())
        this.el.save.addEventListener('click', () => this.save())
        this.el.cancel.addEventListener('click', () => this.resetForm())

        // Opening the post editor hides the footoodle editor, and vice versa.
        document.getElementById('admin-new-post')?.addEventListener('click', () => this.showPostEditor())

        document.querySelectorAll('[data-footoodles-new]').forEach(button => {
            button.addEventListener('click', () => this.openEditor(null))
        })

        this.updateCount()
        await this.refresh()

    }

    // Closes the footoodles slide panel (mobile) through its own close link.
    closeSlide() {

        document.getElementById('slide-link-footoodles-close')?.click()

    }

    showPostEditor() {

        this.root.classList.add('d-none')
        this.postRoot.classList.remove('d-none')

        if (this.savedHeading !== null) {
            this.heading.textContent = this.savedHeading
            this.savedHeading = null
        }

    }

    setHeading(text) {

        if (!this.heading) return

        if (this.savedHeading === null) {
            this.savedHeading = this.heading.textContent
        }

        this.heading.textContent = text

    }

    openEditor(item) {

        this.editingId = item ? item.id : null
        this.el.title.value = item ? item.title : ''
        this.el.content.value = item ? item.content : ''
        this.el.image.value = ''
        this.el.imageName.textContent = ''
        this.updateCount()
        this.setStatus(item ? 'editor_edit' : 'editor_new')

        this.setHeading(this.tr(item ? 'tab' : 'new'))
        this.closeSlide()

        this.postRoot.classList.add('d-none')
        this.root.classList.remove('d-none')
        this.container.classList.remove('d-none')
        this.container.scrollIntoView({ behavior: 'smooth', block: 'start' })

    }

    resetForm() {

        this.editingId = null
        this.el.title.value = ''
        this.el.content.value = ''
        this.el.image.value = ''
        this.el.imageName.textContent = ''
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

        if (!title) return this.setStatus('title_required', 'text-danger')
        if (title.length > TITLE_LIMIT) return this.setStatus('title_required', 'text-danger')
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

            // Success: clears the editor. Failure keeps everything as it is.
            this.resetForm()
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

        this.lists.forEach(container => {

            container.innerHTML = ''

            if (list === null) {
                container.appendChild(this.note('load_error'))
                return
            }

            if (!list.length) {
                container.appendChild(this.note('empty'))
                return
            }

            list.forEach(item => container.appendChild(this.renderRow(item)))

        })

    }

    note(key) {

        const paragraph = document.createElement('p')
        paragraph.className = 'small text-muted px-2 mb-0'
        paragraph.textContent = this.tr(key)
        return paragraph

    }

    renderRow(item) {

        const row = document.createElement('div')
        row.className = 'list-group-item px-2 py-2'

        const top = document.createElement('div')
        top.className = 'd-flex align-items-center'

        const thumb = document.createElement('div')
        thumb.className = 'flex-shrink-0 mr-2'
        thumb.style.width = '48px'
        thumb.style.height = '48px'
        thumb.style.backgroundImage = `url("${item.image}")`
        thumb.style.backgroundSize = 'cover'
        thumb.style.backgroundPosition = 'center'

        const title = document.createElement('div')
        title.className = 'flex-grow-1 text-break small font-weight-bold'
        title.style.minWidth = '0'
        title.textContent = item.title

        top.append(thumb, title)

        const actions = document.createElement('div')
        actions.className = 'd-flex align-items-center mt-2'
        actions.append(
            this.button(this.tr('edit'), 'btn-outline-primary', () => this.openEditor(item)),
            this.button(this.tr('delete'), 'btn-outline-danger', () => this.confirmRemove(item.id))
        )

        row.append(top, actions)

        return row

    }

    button(label, className, handler) {

        const button = document.createElement('button')
        button.type = 'button'
        button.className = `btn btn-sm rounded-0 ml-1 ${className}`
        button.textContent = label
        button.addEventListener('click', handler)
        return button

    }

    async confirmRemove(id) {

        if (!window.confirm(this.tr('delete_confirm'))) return

        this.container.classList.remove('d-none')
        this.root.classList.remove('d-none')
        this.postRoot.classList.add('d-none')
        this.setStatus('deleting')

        try {
            await this.remove(id)
            if (this.editingId === id) this.resetForm()
            this.setStatus('deleted', 'text-success')
            this.closeSlide()
            await this.refresh()
        } catch (error) {
            console.error('[FOOTOODLES]:', error)
            this.setStatus('delete_error', 'text-danger')
        }

    }

}

export default Footoodles
