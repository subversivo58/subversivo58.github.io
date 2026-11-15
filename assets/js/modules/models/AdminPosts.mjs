
/**
 * @license The MIT License (MIT)
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 *
 * @file AdminPosts.mjs
 * @description Gerenciamento das postagens na administração.
 */

class AdminPosts {

    constructor(editor) {

        this.editor = editor
        this.postManager = editor.postManager

        this.posts = []
        this.lists = []

        this.modal = null
        this.modalBackdrop = null
        this.modalBusy = false

        this.settingsPath = this.postManager.settingsPath

        this.installEditorIntegration()

    }

    mount() {

        this.lists = [
            document.getElementById('admin-posts-list-mobile'),
            document.getElementById('admin-posts-list-desktop')
        ].filter(Boolean)

        this.lists.forEach(list => {
            list.addEventListener('click', event => {
                this.handleListClick(event, list)
            })
        })

        const newPostButton = document.getElementById('admin-new-post')

        if (newPostButton) {
            newPostButton.addEventListener('click', () => {

                if (!this.editor.editingPost) return

                if (
                    this.editor.hasChanges &&
                    !window.confirm(this.editor.message('discard_changes'))
                ) {
                    return
                }

                this.editor.resetEditor()

            })
        }

        return this.refresh()

    }

    installEditorIntegration() {

        const editor = this.editor
        const manager = this.postManager

        editor.editingPost = null
        editor.adminPosts = this

        // Intercepta a criação para transformar a operação
        // em atualização quando houver uma postagem em edição.
        const createPost = manager.createPost.bind(manager)

        manager.createPost = data => {

            if (editor.editingPost) {
                return this.prepareUpdatePost(
                    editor.editingPost,
                    data
                )
            }

            return createPost(data)

        }

        // Mantém o estado do editor sincronizado com o modo
        // de criação ou edição.
        const resetEditor = editor.resetEditor.bind(editor)

        editor.resetEditor = (...args) => {

            const result = resetEditor(...args)

            editor.editingPost = null

            const heading = document.querySelector(
                '#admin-post-editor-container .card-header h3'
            )

            if (heading) {
                this.setKey(heading, 'admin_dashboard.new_post')
            }

            if (editor.elements.generate) {
                this.setKey(editor.elements.generate, 'admin_dashboard.editor.generate')
            }

            return result

        }

        // Atualiza a listagem depois de uma publicação.
        const confirmPublication = editor.confirmPublication.bind(editor)

        editor.confirmPublication = async (...args) => {

            const result = await confirmPublication(...args)

            await this.refresh()

            return result

        }

        // Ajusta a mensagem quando a operação é uma atualização.
        const generatePost = editor.generatePost.bind(editor)

        editor.generatePost = async (...args) => {

            const updating = !!editor.editingPost

            const result = await generatePost(...args)

            if (
                updating &&
                result &&
                result.published !== false
            ) {
                editor.setStatus('post_updated')
            }

            return result

        }

        // Carrega uma postagem publicada no editor.
        editor.loadPublishedPost = (post, markdown) => {

            editor.resetEditor()

            const path = this.getPostPath(post)

            editor.editingPost = {
                ...post,
                path,
                markdown
            }

            editor.elements.title.value = post.title || ''
            editor.elements.summary.value = post.summary || ''
            editor.elements.content.value = markdown || ''

            editor.elements.tags.value = Array.isArray(post.tags)
                ? post.tags.join(', ')
                : (post.tags || '')

            editor.summaryManual = !!post.summary

            editor.readingTime = Number(post.readingTime) > 0
                ? Number(post.readingTime)
                : 1

            editor.currentDraftKey = null
            editor.hasChanges = false

            const heading = document.querySelector(
                '#admin-post-editor-container .card-header h3'
            )

            if (heading) {
                this.setKey(heading, 'admin_dashboard.edit_post')
            }

            this.setKey(editor.elements.generate, 'admin_dashboard.update_post')

            const container = document.getElementById(
                'admin-post-editor-container'
            )

            if (container) {
                container.classList.remove('d-none')
                container.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }

            editor.updatePreview()

            editor.setStatus('post_loaded')

            editor.elements.title.focus()

        }

    }

    translate() {
        if (typeof this.editor.translate === 'function') {
            this.editor.translate()
        }
    }

    setKey(element, key) {
        if (!element) return
        element.classList.add('i18n')
        element.setAttribute('data-i18n-html', key)
        element.removeAttribute('translated')
        this.translate()
    }

    async refresh() {

        try {

            const settings = await this.postManager.loadSettings()

            this.posts = [...settings.articles.storage].sort(
                (a, b) => this.getPostTimestamp(b) - this.getPostTimestamp(a)
            )

            this.renderLists()
            this.translate()

            return true

        } catch (error) {

            console.error('[ADMIN POSTS]:', error)
            return false

        }

    }

    renderMessage(message) {

        this.lists.forEach(list => {

            list.replaceChildren()

            const item = document.createElement('div')

            item.className = 'list-group-item small text-muted'
            item.textContent = message

            list.appendChild(item)

        })

    }

    renderLists() {

        if (!this.posts.length) {
            return
        }

        this.lists.forEach(list => {

            list.replaceChildren()

            this.posts.forEach(post => {

                list.appendChild(this.createPostItem(post))

            })

        })

    }

 
createPostItem(post) {

        const fragment = document.getElementById(
            'admin-post-item-template'
        ).content.cloneNode(true)

        const item = fragment.querySelector('[data-post-item]')
        const cover = item.querySelector('[data-post-cover]')
        const title = item.querySelector('[data-post-title]')
        const date = item.querySelector('[data-post-date]')
        const edit = item.querySelector('[data-post-action="edit"]')
        const remove = item.querySelector('[data-post-action="delete"]')

        // MINIATURA (dinâmica: depende dos dados da postagem)
        cover.className = 'mr-2 flex-shrink-0'
        cover.style.width = '48px'
        cover.style.height = '48px'
        cover.style.display = 'flex'
        cover.style.alignItems = 'center'
        cover.style.justifyContent = 'center'
        cover.style.backgroundColor = '#e9ecef'
        cover.style.color = '#6c757d'

        const coverPath = (
            post.cover ||
            (Array.isArray(post.images) ? post.images[0] : null)
        )

        if (
            typeof coverPath === 'string' &&
            coverPath.startsWith('assets/posts/images/')
        ) {

            const image = document.createElement('img')

            image.src = coverPath
            image.alt = ''
            image.loading = 'lazy'
            image.style.width = '48px'
            image.style.height = '48px'
            image.style.objectFit = 'cover'
            image.style.display = 'block'

            image.onerror = () => {
                cover.textContent = '▧'
            }

            cover.appendChild(image)

        } else {

            cover.textContent = '▧'

        }

        // TÍTULO (fallback traduzível pelo template)
        if (post.title) {
            title.textContent = post.title
        } else {
            this.setKey(title, 'admin_dashboard.posts_list.untitled')
        }

        // DATA (locale do documento, não fixo em pt-BR)
        const timestamp = this.getPostTimestamp(post)

        if (timestamp) {
            date.textContent = new Date(timestamp).toLocaleDateString(
                document.documentElement.lang || undefined
            )
        }

        // AÇÕES (textos vêm do template com data-i18n-html)
        edit.dataset.postId = post.id
        remove.dataset.postId = post.id

        return item

    }

    async handleListClick(event, list) {

        const button = event.target.closest('[data-post-action]')

        if (!button || !list.contains(button)) return

        const id = button.dataset.postId

        const post = this.posts.find(item => item.id === id)

        if (!post) return

        if (button.dataset.postAction === 'edit') {

            await this.editPost(post)

        } else if (button.dataset.postAction === 'delete') {

            await this.deletePost(post, button)

        }

    }

    getPostTimestamp(post) {

        const timestamp = Number(post.timestamp)

        if (Number.isFinite(timestamp) && timestamp > 0) {
            return timestamp > 1e12 ? timestamp : timestamp * 1000
        }

        const date = Number(post.date)

        return Number.isFinite(date) && date > 0
            ? date * 1000
            : 0

    }

    getOriginalTimestamp(post) {

        const timestamp = Number(post.timestamp)

        if (Number.isFinite(timestamp) && timestamp > 0) {
            return timestamp > 1e12 ? timestamp : timestamp * 1000
        }

        const date = Number(post.date)

        if (Number.isFinite(date) && date > 0) {
            return date * 1000
        }

        return Date.now()

    }

    getPostPath(post) {

        if (
            typeof post.path === 'string' &&
            post.path.trim()
        ) {
            return post.path
        }

        return `assets/posts/${encodeURIComponent(post.id)}.md`

    }

    async fetchPostMarkdown(post) {

        const path = this.getPostPath(post)

        const response = await fetch(path, {
            cache: 'no-store'
        })

        if (!response.ok) {

            throw new Error(
                'markdown_fetch_error'
            )

        }

        return response.text()

    }

    async editPost(post) {

        try {

            const markdown = await this.fetchPostMarkdown(post)

            this.editor.loadPublishedPost(post, markdown)

            const close = document.getElementById(
                'slide-link-admin-close'
            )

            if (
                close &&
                window.matchMedia('(max-width: 767px)').matches
            ) {
                close.click()
            }

        } catch (error) {

            console.error('[ADMIN POSTS]:', error)

            this.editor.setStatus('post_load_error')

        }

    }

    extractImagePaths(markdown) {

        const paths = new Set()

        const pattern =
            /!\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)/g

        let match

        while ((match = pattern.exec(String(markdown || ''))) !== null) {

            const path = match[1] || match[2]

            if (
                typeof path === 'string' &&
                path.startsWith('assets/posts/images/')
            ) {
                paths.add(path)
            }

        }

        return [...paths]

    }

    collectPostImages(post, markdown = '') {

        const images = new Set()

        if (Array.isArray(post.images)) {

            post.images.forEach(path => {

                if (
                    typeof path === 'string' &&
                    path.startsWith('assets/posts/images/')
                ) {
                    images.add(path)
                }

            })

        }

        if (
            typeof post.cover === 'string' &&
            post.cover.startsWith('assets/posts/images/')
        ) {
            images.add(post.cover)
        }

        this.extractImagePaths(markdown).forEach(path => {
            images.add(path)
        })

        return [...images]

    }

    collectOtherPostImages(posts, excludedId) {

        const images = new Set()

        posts.forEach(post => {

            if (post.id === excludedId) return

            this.collectPostImages(post).forEach(path => {
                images.add(path)
            })

        })

        return images

    }

    async prepareUpdatePost(post, data) {

        const settings = await this.postManager.loadSettings()

        const storage = settings.articles.storage

        const index = storage.findIndex(
            item => item.id === post.id
        )

        if (index < 0) {

            throw new Error(
                'post_missing'
            )

        }

        const current = storage[index]

        const now = Date.now()

        const markdown = String(data.content || '')

        const path = this.getPostPath(current)

        const images = this.extractImagePaths(markdown)

        const imageFiles = this.postManager.orderImages(
            markdown,
            data.images || []
        )

        const otherImages = this.collectOtherPostImages(
            storage,
            current.id
        )

        const oldImages = this.collectPostImages(
            current,
            post.markdown
        )

        const newImagePaths = new Set(images)

        const obsoleteImages = oldImages.filter(image => (
            !newImagePaths.has(image) &&
            !otherImages.has(image)
        ))

        const metadata = {

            ...current,

            id: current.id,

            title: String(data.title || '').trim(),

            summary: String(data.summary || '').trim(),

            path,

            cover: images[0] || null,

            images,

            tags: this.postManager.normalizeTags(data.tags || []),

            timestamp: this.getOriginalTimestamp(current),

            lastModified: now,

            readingTime: this.postManager.normalizeReadingTime(
                data.readingTime
            )

        }

        storage[index] = metadata

        settings.last_modified = now

        const files = new Map()

        imageFiles.forEach(image => {

            files.set(image.path, {
                path: image.path,
                content: image.file
            })

        })

        files.set(path, {
            path,
            content: markdown
        })

        obsoleteImages.forEach(image => {

            files.set(image, {
                path: image,
                content: null,
                delete: true
            })

        })

        const updatedSettings = JSON.stringify(settings, null, 4)

        files.set(this.settingsPath, {
            path: this.settingsPath,
            content: updatedSettings
        })

        return {

            ...metadata,

            markdown,

            imageFiles,

            files: [...files.values()],

            updatedSettings

        }

    }

    async prepareDeletePost(post, markdown) {

        const settings = await this.postManager.loadSettings()

        const storage = settings.articles.storage

        const index = storage.findIndex(
            item => item.id === post.id
        )

        if (index < 0) {

            throw new Error(
                'post_missing_delete'
            )

        }

        const current = storage[index]

        const markdownPath = this.getPostPath(current)

        const images = this.collectPostImages(
            current,
            markdown
        )

        const otherImages = this.collectOtherPostImages(
            storage,
            current.id
        )

        storage.splice(index, 1)

        const now = Date.now()

        settings.last_modified = now

        const files = new Map()

        files.set(markdownPath, {
            path: markdownPath,
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

        const updatedSettings = JSON.stringify(settings, null, 4)

        files.set(this.settingsPath, {
            path: this.settingsPath,
            content: updatedSettings
        })

        return {

            id: current.id,

            title: current.title,

            files: [...files.values()],

            updatedSettings

        }

    }

    async deletePost(post, trigger) {

        if (this.modalBusy) return

        trigger.disabled = true

        try {

            // Recupera o conteúdo e prepara a exclusão
            // antes de apresentar a confirmação.
            const markdown = await this.fetchPostMarkdown(post)

            const payload = await this.prepareDeletePost(
                post,
                markdown
            )

            this.openDeleteModal(post, payload, trigger)

        } catch (error) {

            console.error('[ADMIN POSTS]:', error)

            this.editor.setStatus('delete_prepare_error', error.message)

        } finally {

            trigger.disabled = false

        }

    }

    openDeleteModal(post, payload, trigger) {

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
            document.getElementById('admin-delete-modal-template')
                .content.cloneNode(true)
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

                if (!this.modalBusy) {
                    this.closeModal()
                }

            })

        })

        modal.addEventListener('click', event => {

            if (
                event.target === modal &&
                !this.modalBusy
            ) {
                this.closeModal()
            }

        })

        this.modalKeyHandler = event => {

            if (
                event.key === 'Escape' &&
                this.modal &&
                !this.modalBusy
            ) {
                this.closeModal()
            }

        }

        document.addEventListener(
            'keydown',
            this.modalKeyHandler
        )

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

                    throw new Error(
                        'github_not_confirmed'
                    )

                }

                status.className =
                    'alert alert-success rounded-0 mt-3 mb-0'

                this.setKey(status, 'admin_dashboard.delete_modal.success')

                if (
                    this.editor.editingPost &&
                    this.editor.editingPost.id === post.id
                ) {

                    this.editor.resetEditor()

                    const container = document.getElementById(
                        'admin-post-editor-container'
                    )

                    if (container) {
                        container.classList.add('d-none')
                    }

                }

                window.setTimeout(async () => {

                    this.closeModal(true)

                    await this.refresh()

                }, 1000)

            } catch (error) {

                console.error('[ADMIN POSTS]:', error)

                status.className =
                    'alert alert-danger rounded-0 mt-3 mb-0'

                this.setKey(status, 'admin_dashboard.delete_modal.error')

                this.editor.setStatus('delete_error', error.message)

                window.setTimeout(() => {
                    this.closeModal(true)
                }, 2000)

            }

        })

        confirm.focus()

    }

    closeModal(force = false) {

        // O fechamento manual continua bloqueado durante a operação.
        // O fechamento forçado é reservado ao término do processo.
        if (!this.modal || (this.modalBusy && !force)) return

        this.modal.remove()

        if (this.modalBackdrop) {
            this.modalBackdrop.remove()
        }

        document.body.classList.remove('modal-open')

        document.removeEventListener(
            'keydown',
            this.modalKeyHandler
        )

        this.modal = null
        this.modalBackdrop = null
        this.modalBusy = false

    }

}

export { AdminPosts }

export default AdminPosts
