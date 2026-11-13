
/**
 * @license The MIT License (MIT)
 * @copyright Copyright (c) 2021 Lauro Moraes
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
                    !window.confirm(
                        'Descartar as alterações da postagem em edição?'
                    )
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
                heading.textContent = 'Nova Postagem'
            }

            if (editor.elements.generate) {
                editor.elements.generate.textContent = 'Gerar postagem'
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
                editor.setStatus('Postagem atualizada com sucesso.')
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
                heading.textContent = 'Editar Postagem'
            }

            editor.elements.generate.textContent = 'Atualizar postagem'

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

            editor.setStatus('Postagem carregada para edição.')

            editor.elements.title.focus()

        }

    }

    async refresh() {

        try {

            const settings = await this.postManager.loadSettings()

            this.posts = [...settings.articles.storage].sort(
                (a, b) => this.getPostTimestamp(b) - this.getPostTimestamp(a)
            )

            this.renderLists()

            return true

        } catch (error) {

            console.error('[ADMIN POSTS]:', error)

            this.renderMessage(
                'Não foi possível carregar as postagens.'
            )

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
            this.renderMessage('Nenhuma postagem publicada.')
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

    const item = document.createElement('div')

    item.className = 'list-group-item px-2 py-2'

    const row = document.createElement('div')

    row.className = 'd-flex align-items-center'


    // MINIATURA
    const cover = document.createElement('div')

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
            cover.innerHTML = '<span aria-hidden="true">▧</span>'
        }

        cover.appendChild(image)

    } else {

        cover.innerHTML = '<span aria-hidden="true">▧</span>'

    }

  

    // INFORMAÇÕES
    const content = document.createElement('div')

    content.className = 'flex-grow-1'
    content.style.minWidth = '0'

    const title = document.createElement('div')

    title.className = 'font-weight-bold text-break'
    title.style.fontSize = '13px'
    title.style.lineHeight = '1.3'

    title.textContent = post.title || 'Postagem sem título'

    const date = document.createElement('small')

    date.className = 'd-block text-muted'
    date.style.fontSize = '11px'

    const timestamp = this.getPostTimestamp(post)

    if (timestamp) {

        date.textContent = new Date(timestamp).toLocaleDateString(
            'pt-BR'
        )

    }

    content.append(title, date)

    row.append(cover, content)

    // AÇÕES
    const actions = document.createElement('div')

    actions.className = 'd-flex align-items-center mt-2'

    const edit = document.createElement('button')

    edit.type = 'button'
    edit.className = 'btn btn-outline-primary rounded-0 mr-1'
    edit.textContent = 'Editar'
    edit.dataset.postAction = 'edit'
    edit.dataset.postId = post.id

    edit.style.fontSize = '11px'
    edit.style.padding = '3px 7px'
    edit.style.lineHeight = '1.2'

    const remove = document.createElement('button')

    remove.type = 'button'
    remove.className = 'btn btn-outline-danger rounded-0'
    remove.textContent = 'Excluir'
    remove.dataset.postAction = 'delete'
    remove.dataset.postId = post.id

    remove.style.fontSize = '11px'
    remove.style.padding = '3px 7px'
    remove.style.lineHeight = '1.2'

    actions.append(edit, remove)

    item.append(row, actions)

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
                `Não foi possível carregar o Markdown (${response.status}).`
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

            this.editor.setStatus(
                'Não foi possível carregar a postagem para edição.'
            )

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
                'A postagem não existe mais no cadastro. Atualização cancelada.'
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
                'A postagem não existe mais no cadastro.'
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

            this.editor.setStatus(
                `Não foi possível preparar a exclusão: ${error.message}`
            )

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

        modal.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content rounded-0">

                    <div class="modal-header">

                        <h5
                            id="admin-delete-title"
                            class="modal-title">
                            Apagar postagem
                        </h5>

                        <button
                            type="button"
                            class="close"
                            data-modal-close
                            aria-label="Fechar">
                            <span aria-hidden="true">&times;</span>
                        </button>

                    </div>

                    <div class="modal-body">

                        <p class="mb-2">
                            Deseja realmente excluir esta postagem?
                        </p>

                        <strong
                            class="d-block text-break"
                            data-post-title>
                        </strong>

                        <p
                            class="small mt-3 mb-0"
                            role="status"
                            aria-live="polite"
                            data-modal-status
                            hidden>
                        </p>

                    </div>

                    <div class="modal-footer">

                        <button
                            type="button"
                            class="btn btn-outline-secondary rounded-0"
                            data-modal-close>
                            Cancelar
                        </button>

                        <button
                            type="button"
                            class="btn btn-danger rounded-0"
                            data-modal-confirm>
                            Sim, excluir
                        </button>

                    </div>

                </div>
            </div>
        `

        modal.querySelector('[data-post-title]').textContent =
            post.title || 'Postagem sem título'

        document.body.append(backdrop, modal)
        document.body.classList.add('modal-open')

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
            confirm.textContent = 'Excluindo...'

            modal.querySelectorAll('[data-modal-close]').forEach(button => {
                button.disabled = true
            })

            status.hidden = false
            status.className = 'small mt-3 mb-0 text-muted'
            status.textContent = 'Excluindo postagem no GitHub...'

            try {

                const result = await this.editor.onCreate(payload)

                if (!result || result.published !== true) {

                    throw new Error(
                        'O GitHub não confirmou a exclusão.'
                    )

                }

                status.className =
                    'alert alert-success rounded-0 mt-3 mb-0'

                status.textContent =
                    'Postagem excluída com sucesso!'

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

                status.textContent =
                    'Não foi possível excluir a postagem.'

                this.editor.setStatus(
                    `Falha ao excluir postagem: ${error.message}`
                )

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
