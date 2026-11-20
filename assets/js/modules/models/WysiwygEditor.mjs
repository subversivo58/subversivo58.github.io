/**
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage] - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 *
 * @file WysiwygEditor.mjs
 * @description Editor WYSIWYG nativo construído do zero com suporte a imagens em IndexedDB,
 *              redimensionamento/alinhamento fora do contenteditable, <picture> + LazyLoad,
 *              rascunhos locais, reconhecimento de voz e publicação em HTML completo.
 */

import PostManager from './PostManager.mjs'
import AdminPosts from './AdminPosts.mjs'
import ImageProcessor from '../lib/ImageProcessor.mjs'

const DRAFTS_STORE = 'drafts'
const AUTOSAVE_KEY = 'autosave'
const DRAFT_PREFIX = 'draft:'
const IMAGE_PREFIX = 'img:'
const LAZY_PLACEHOLDER = '/assets/media/image/1x1.gif'

const ALLOWED_TAGS = new Set([
    'P', 'BR', 'HR',
    'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
    'STRONG', 'B', 'EM', 'I', 'U', 'S', 'DEL', 'MARK', 'SMALL', 'SUB', 'SUP',
    'UL', 'OL', 'LI',
    'BLOCKQUOTE', 'PRE', 'CODE', 'KBD',
    'A', 'IMG', 'PICTURE', 'FIGURE', 'FIGCAPTION',
    'TABLE', 'THEAD', 'TBODY', 'TFOOT', 'TR', 'TH', 'TD',
    'SPAN', 'DIV'
])

const IMAGE_EXTENSIONS = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
    'image/bmp': 'bmp'
}

class WysiwygEditor {
    constructor(options = {}) {
        this.options = options
        this.permissions = options.permissions || null
        this.root = options.root || null
        this.postManager = options.postManager || new PostManager()
        this.imageProcessor = options.imageProcessor || new ImageProcessor({ auto: true })
        this.onCreate = options.onCreate || (() => {})
        this.onStatus = options.onStatus || (() => {})
        this.translate = options.translate || (() => {})
        this.getAuthorId = options.getAuthorId || (() => '')
        this.db = options.db || null

        this.elements = {}
        this.hasChanges = false
        this.currentDraftKey = null
        this.slugManual = false

        this.summaryManual = false
        this.autoSummary = ''
        this.readingTime = 1
        this.wordCount = 0

        this._queue = Promise.resolve()
        this._pendingInserts = 0
        this.isGenerating = false

        this.mediaURLs = new Map()
        this.mediaLoading = new Set()
        this.mediaMissing = new Set()

        this.autoSaveTimer = null
        this.autoSaveInterval = 15000

        this.previewVisible = false
        this.sourceMode = false

        this.selectedImage = null
        this.savedRange = null

        this.recognition = null
        this.isRecognizing = false
        this.recognitionLastLength = 0

        this.isMounted = false
    }

    mount(root = this.root) {
        if (!root) {
            console.error('[WysiwygEditor]: Elemento raiz não informado.')
            return false
        }

        this.root = root

        this.elements = {
            editor: this.root.querySelector('.wysiwyg-editor'),
            status: this.root.querySelector('#post-editor-status'),
            readingBadge: this.root.querySelector('#post-reading-badge'),
            title: this.root.querySelector('#post-title'),
            slug: this.root.querySelector('#post-slug'),
            slugLock: this.root.querySelector('#post-slug-lock'),
            slugPreview: this.root.querySelector('#post-slug-preview'),
            summary: this.root.querySelector('#post-summary'),
            summaryRestore: this.root.querySelector('#post-summary-restore'),
            content: this.root.querySelector('#post-content'),
            htmlSource: this.root.querySelector('#post-html-source'),
            tags: this.root.querySelector('#post-tags'),

            toolbar: this.root.querySelector('#post-editor-toolbar'),
            blockFormat: this.root.querySelector('#post-block-format'),
            fontSize: this.root.querySelector('#post-font-size'),
            foreColor: this.root.querySelector('#post-fore-color'),
            backColor: this.root.querySelector('#post-back-color'),
            addImage: this.root.querySelector('#post-add-image'),
            imageInput: this.root.querySelector('#post-image-input'),
            microphone: this.root.querySelector('#post-microphone'),
            sourceToggle: this.root.querySelector('#post-source-toggle'),

            linkBar: this.root.querySelector('#wysiwyg-link-bar'),
            linkUrl: this.root.querySelector('#wysiwyg-link-url'),
            linkText: this.root.querySelector('#wysiwyg-link-text'),
            linkBlank: this.root.querySelector('#wysiwyg-link-blank'),
            linkApply: this.root.querySelector('#wysiwyg-link-apply'),
            linkRemove: this.root.querySelector('#wysiwyg-link-remove'),
            linkCancel: this.root.querySelector('#wysiwyg-link-cancel'),

            tableBar: this.root.querySelector('#wysiwyg-table-bar'),
            tableRows: this.root.querySelector('#wysiwyg-table-rows'),
            tableCols: this.root.querySelector('#wysiwyg-table-cols'),
            tableInsert: this.root.querySelector('#wysiwyg-table-insert'),
            tableCancel: this.root.querySelector('#wysiwyg-table-cancel'),

            imageOverlay: this.root.querySelector('#wysiwyg-image-overlay'),
            imgWidth: this.root.querySelector('#wysiwyg-img-width'),
            imgWidthLabel: this.root.querySelector('#wysiwyg-img-width-label'),
            imgAlt: this.root.querySelector('#wysiwyg-img-alt'),
            imgCaption: this.root.querySelector('#wysiwyg-img-caption'),
            imgDelete: this.root.querySelector('#wysiwyg-img-delete'),

            previewToggle: this.root.querySelector('#post-preview-toggle'),
            previewPanel: this.root.querySelector('#post-preview-panel'),
            previewClose: this.root.querySelector('#post-preview-close'),
            preview: this.root.querySelector('#post-preview'),

            saveDraft: this.root.querySelector('#post-save-draft'),
            draftList: this.root.querySelector('#post-draft-list'),
            openDraft: this.root.querySelector('#post-open-draft'),
            deleteDraft: this.root.querySelector('#post-delete-draft'),
            generate: this.root.querySelector('#post-generate')
        }

        try {
            document.execCommand('defaultParagraphSeparator', false, 'p')
        } catch {
            // Navegador ignora se não suportado.
        }

        this.updateSurfacePlaceholder()
        this.updateSlugPreview()
        this.initializeSpeechRecognition()
        this.updateMicrophoneButton()
        this.bindEvents()
        this.updateDerivedMetadata()
        this.startAutoSaveTimer()
        this.bindLifecycle()

        this.isMounted = true

        this.adminPosts = new AdminPosts(this)
        this.adminPosts.mount().catch(error => {
            console.error('[WysiwygEditor]: Erro ao inicializar gerenciamento de postagens:', error)
        })

        this.ready = this.initStorage()
        return true
    }

    updateSurfacePlaceholder() {
        const surface = this.elements.content
        if (!surface) return
        const placeholder = this.message('content_placeholder')
        if (placeholder && placeholder !== 'content_placeholder') {
            surface.setAttribute('data-placeholder', placeholder)
        }
    }

    async updateMicrophoneButton() {
        if (!this.elements.microphone || !this.permissions) return
        await this.permissions.ready
        this.elements.microphone.disabled = this.permissions.status.microphone !== 'granted'
    }

    initializeSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            this.recognition = null
            return false
        }

        this.recognition = new SpeechRecognition()
        this.recognition.lang = document.documentElement.lang || 'pt-BR'
        this.recognition.continuous = true
        this.recognition.interimResults = false
        this.recognition.maxAlternatives = 1

        this.recognition.onresult = event => {
            let chunk = ''
            for (let i = event.resultIndex; i < event.results.length; i++) {
                if (event.results[i].isFinal) {
                    chunk += event.results[i][0].transcript + ' '
                }
            }
            if (chunk.trim()) {
                this.elements.content.focus()
                this.restoreSelection()
                document.execCommand('insertText', false, chunk)
                this.saveSelection()
                this.markAsChanged()
                this.updatePreview()
            }
        }

        this.recognition.onstart = () => this.setSpeechRecognitionActive(true)
        this.recognition.onend = () => this.setSpeechRecognitionActive(false)
        this.recognition.onerror = event => {
            this.setSpeechRecognitionActive(false)
            this.setStatus('speech_error', event.error)
        }

        return true
    }

    setSpeechRecognitionActive(active) {
        this.isRecognizing = active
        const mic = this.elements.microphone
        if (!mic) return
        mic.classList.toggle('btn-outline-secondary', !active)
        mic.classList.toggle('btn-danger', active)
        mic.classList.toggle('pulse-red', active)
    }

    toggleSpeechRecognition() {
        if (!this.recognition) {
            this.setStatus('speech_unavailable')
            return
        }
        if (this.isRecognizing) {
            try {
                this.recognition.abort()
            } finally {
                this.setSpeechRecognitionActive(false)
            }
            return
        }
        this.saveSelection()
        this.setSpeechRecognitionActive(true)
        try {
            this.recognition.start()
        } catch (error) {
            this.setSpeechRecognitionActive(false)
            this.setStatus('speech_start_error', error.message)
        }
    }

    bindEvents() {
        const el = this.elements

        el.title.addEventListener('input', () => {
            if (!this.editingPost && !this.slugManual) {
                el.slug.value = this.postManager.slugify(el.title.value)
                this.updateSlugPreview()
            }
            this.markAsChanged()
        })

        el.slug.addEventListener('input', () => {
            this.slugManual = true
            el.slug.value = this.postManager.slugify(el.slug.value)
            this.updateSlugPreview()
            this.markAsChanged()
        })

        el.slugLock?.addEventListener('click', () => {
            const locked = el.slug.readOnly
            el.slug.readOnly = !locked
            el.slugLock.setAttribute('aria-pressed', String(locked))
            el.slugLock.textContent = locked ? '🔓' : '🔒'
            if (locked) el.slug.focus()
        })

        el.summary.addEventListener('input', () => {
            this.summaryManual = true
            this.markAsChanged()
        })

        el.summaryRestore.addEventListener('click', () => {
            this.summaryManual = false
            el.summary.value = this.autoSummary
            this.markAsChanged()
        })

        el.tags.addEventListener('input', () => this.markAsChanged())

        el.content.addEventListener('input', () => {
            this.saveSelection()
            this.markAsChanged()
            this.updateDerivedMetadata()
            if (this.previewVisible) this.updatePreview()
            this.refreshToolbarState()
        })

        el.content.addEventListener('keyup', () => {
            this.saveSelection()
            this.refreshToolbarState()
        })

        el.content.addEventListener('mouseup', () => {
            this.saveSelection()
            this.refreshToolbarState()
        })

        el.content.addEventListener('click', event => {
            const img = event.target.closest('img')
            if (img && el.content.contains(img)) {
                this.selectImage(img)
            } else {
                this.clearImageSelection()
            }
        })

        el.content.addEventListener('paste', event => {
            this.handlePaste(event)
        })

        el.content.addEventListener('keydown', event => {
            this.handleKeyDown(event)
        })

        el.htmlSource?.addEventListener('input', () => {
            this.markAsChanged()
            this.updateDerivedMetadata()
            if (this.previewVisible) this.updatePreview()
        })

        // Evita perda de seleção ao clicar nos botões da toolbar
        el.toolbar.addEventListener('mousedown', event => {
            const target = event.target.closest('button, label.wysiwyg-color-btn')
            if (
                target &&
                target.id !== 'post-preview-toggle' &&
                target.id !== 'post-source-toggle'
            ) {
                event.preventDefault()
            }
        })

        el.toolbar.addEventListener('click', event => {
            const button = event.target.closest('[data-editor-action]')
            if (!button || !el.toolbar.contains(button)) return
            const action = button.dataset.editorAction
            if (action === 'image' || action === 'microphone') return
            this.applyToolbarAction(action)
        })

        el.blockFormat?.addEventListener('change', () => {
            const tag = el.blockFormat.value || 'p'
            this.applyBlockTag(tag)
        })

        el.fontSize?.addEventListener('change', () => {
            if (el.fontSize.value) {
                this.applyFontSize(el.fontSize.value)
                el.fontSize.value = ''
            }
        })

        el.foreColor?.addEventListener('input', () => {
            this.applyCommand('foreColor', el.foreColor.value)
        })

        el.backColor?.addEventListener('input', () => {
            this.applyCommand('hiliteColor', el.backColor.value)
        })

        el.addImage.addEventListener('click', () => {
            this.saveSelection()
            el.imageInput.click()
        })

        el.imageInput.addEventListener('change', event => {
            this.insertImages(event.target.files)
            el.imageInput.value = ''
        })

        el.microphone.addEventListener('click', () => {
            this.toggleSpeechRecognition()
        })

        el.sourceToggle?.addEventListener('click', () => {
            this.toggleSourceMode()
        })

        el.previewToggle.addEventListener('click', () => {
            this.togglePreview()
        })

        el.previewClose.addEventListener('click', () => {
            this.togglePreview(false)
        })

        // Link inline bar
        el.linkApply?.addEventListener('click', () => this.applyLinkFromBar())
        el.linkRemove?.addEventListener('click', () => this.removeLinkAtSelection())
        el.linkCancel?.addEventListener('click', () => {
            el.linkBar.hidden = true
            el.content.focus()
        })

        // Table inline bar
        el.tableInsert?.addEventListener('click', () => this.insertTableFromBar())
        el.tableCancel?.addEventListener('click', () => {
            el.tableBar.hidden = true
            el.content.focus()
        })

        // Image overlay controls (fora do contenteditable)
        el.imageOverlay?.addEventListener('click', event => {
            const widthBtn = event.target.closest('[data-img-width]')
            if (widthBtn && this.selectedImage) {
                this.setImageWidth(Number(widthBtn.dataset.imgWidth))
                return
            }

            const alignBtn = event.target.closest('[data-img-align]')
            if (alignBtn && this.selectedImage) {
                this.setImageAlignment(alignBtn.dataset.imgAlign)
            }
        })

        el.imgWidth?.addEventListener('input', () => {
            if (this.selectedImage) {
                this.setImageWidth(Number(el.imgWidth.value))
            }
        })

        el.imgAlt?.addEventListener('input', () => {
            if (this.selectedImage) {
                this.selectedImage.alt = el.imgAlt.value
                this.markAsChanged()
            }
        })

        el.imgCaption?.addEventListener('input', () => {
            if (this.selectedImage) {
                this.setImageCaption(this.selectedImage, el.imgCaption.value)
            }
        })

        el.imgDelete?.addEventListener('click', () => {
            this.deleteSelectedImage()
        })

        el.saveDraft.addEventListener('click', () => this.saveDraft())
        el.openDraft.addEventListener('click', () => this.loadSelectedDraft())
        el.deleteDraft?.addEventListener('click', () => this.deleteSelectedDraft())
        el.generate.addEventListener('click', () => this.generatePost())
    }

    updateSlugPreview() {
        const slug = this.postManager.slugify(this.elements.slug?.value || '')
        if (this.elements.slugPreview) {
            this.elements.slugPreview.textContent = slug ? `/posts/${slug}.html` : ''
        }
    }

    saveSelection() {
        const selection = window.getSelection()
        if (!selection || !selection.rangeCount) return
        const range = selection.getRangeAt(0)
        if (this.elements.content.contains(range.commonAncestorContainer)) {
            this.savedRange = range.cloneRange()
        }
    }

    restoreSelection() {
        if (!this.savedRange) return false
        const selection = window.getSelection()
        if (!selection) return false
        selection.removeAllRanges()
        selection.addRange(this.savedRange)
        return true
    }

    applyCommand(command, value = null) {
        if (this.sourceMode) return
        this.elements.content.focus()
        this.restoreSelection()
        try {
            document.execCommand(command, false, value)
        } catch {
            // Ignora comando não suportado
        }
        this.saveSelection()
        this.markAsChanged()
        this.updateDerivedMetadata()
        if (this.previewVisible) this.updatePreview()
        this.refreshToolbarState()
    }

    applyBlockTag(tag) {
        if (this.sourceMode) return
        this.elements.content.focus()
        this.restoreSelection()

        if (tag === 'pre') {
            this.insertCodeBlock()
            return
        }

        const formatValue = /^h[1-6]|p|blockquote$/i.test(tag) ? `<${tag.toLowerCase()}>` : '<p>'
        try {
            document.execCommand('formatBlock', false, formatValue)
        } catch {
            // Fallback simples
        }
        this.saveSelection()
        this.markAsChanged()
        this.updateDerivedMetadata()
        if (this.previewVisible) this.updatePreview()
        this.refreshToolbarState()
    }

    applyToolbarAction(action) {
        if (this.sourceMode) return

        switch (action) {
            case 'undo':
                this.applyCommand('undo')
                break
            case 'redo':
                this.applyCommand('redo')
                break
            case 'bold':
                this.applyCommand('bold')
                break
            case 'italic':
                this.applyCommand('italic')
                break
            case 'underline':
                this.applyCommand('underline')
                break
            case 'strike':
                this.applyCommand('strikeThrough')
                break
            case 'clear-format':
                this.applyCommand('removeFormat')
                break
            case 'unordered-list':
                this.applyCommand('insertUnorderedList')
                break
            case 'ordered-list':
                this.applyCommand('insertOrderedList')
                break
            case 'align-left':
                this.applyCommand('justifyLeft')
                break
            case 'align-center':
                this.applyCommand('justifyCenter')
                break
            case 'align-right':
                this.applyCommand('justifyRight')
                break
            case 'align-justify':
                this.applyCommand('justifyFull')
                break
            case 'quote':
                this.applyBlockTag('blockquote')
                break
            case 'code':
                this.insertCodeBlock()
                break
            case 'inline-code':
                this.toggleInlineCode()
                break
            case 'hr':
                this.applyCommand('insertHorizontalRule')
                break
            case 'link':
                this.openLinkBar()
                break
            case 'table':
                this.saveSelection()
                this.elements.linkBar.hidden = true
                this.elements.tableBar.hidden = !this.elements.tableBar.hidden
                break
        }
    }

    toggleInlineCode() {
        this.elements.content.focus()
        this.restoreSelection()
        const selection = window.getSelection()
        if (!selection || !selection.rangeCount) return
        const range = selection.getRangeAt(0)
        if (!this.elements.content.contains(range.commonAncestorContainer)) return

        const existingCode = (range.commonAncestorContainer.nodeType === 1
            ? range.commonAncestorContainer
            : range.commonAncestorContainer.parentElement
        )?.closest('code')

        if (existingCode && !existingCode.closest('pre')) {
            const text = document.createTextNode(existingCode.textContent || '')
            existingCode.replaceWith(text)
        } else {
            const code = document.createElement('code')
            if (range.collapsed) {
                code.textContent = 'code'
                range.insertNode(code)
                range.selectNodeContents(code)
            } else {
                const text = range.toString()
                range.deleteContents()
                code.textContent = text
                range.insertNode(code)
                range.setStartAfter(code)
                range.collapse(true)
            }
            selection.removeAllRanges()
            selection.addRange(range)
        }

        this.saveSelection()
        this.markAsChanged()
        if (this.previewVisible) this.updatePreview()
    }

    insertCodeBlock() {
        this.elements.content.focus()
        this.restoreSelection()
        const selection = window.getSelection()
        const selected = selection?.toString() || '// code'

        const pre = document.createElement('pre')
        const code = document.createElement('code')
        code.textContent = selected
        pre.appendChild(code)

        const after = document.createElement('p')
        after.innerHTML = '<br>'

        if (selection && selection.rangeCount) {
            const range = selection.getRangeAt(0)
            range.deleteContents()
            range.insertNode(after)
            range.insertNode(pre)
            const inside = document.createRange()
            inside.selectNodeContents(code)
            selection.removeAllRanges()
            selection.addRange(inside)
        } else {
            this.elements.content.append(pre, after)
        }

        this.saveSelection()
        this.markAsChanged()
        if (this.previewVisible) this.updatePreview()
    }

    applyFontSize(size) {
        const allowed = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px']
        if (!allowed.includes(size) || this.sourceMode) return

        this.elements.content.focus()
        this.restoreSelection()

        const selection = window.getSelection()
        if (!selection || !selection.rangeCount) return
        const range = selection.getRangeAt(0)
        if (!this.elements.content.contains(range.commonAncestorContainer)) return

        const span = document.createElement('span')
        span.style.fontSize = size

        if (range.collapsed) {
            span.textContent = '\u200B'
            range.insertNode(span)
            range.setStart(span.firstChild, 1)
            range.collapse(true)
        } else {
            const frag = range.extractContents()
            span.appendChild(frag)
            range.insertNode(span)
            range.selectNodeContents(span)
        }

        selection.removeAllRanges()
        selection.addRange(range)
        this.saveSelection()
        this.markAsChanged()
        if (this.previewVisible) this.updatePreview()
    }

    openLinkBar() {
        this.saveSelection()
        const selection = window.getSelection()
        const anchor = selection?.anchorNode
            ? (selection.anchorNode.nodeType === 1 ? selection.anchorNode : selection.anchorNode.parentElement)?.closest('a')
            : null

        this.elements.tableBar.hidden = true
        this.elements.linkBar.hidden = false
        this.elements.linkUrl.value = anchor ? (anchor.getAttribute('href') || '') : 'https://'
        this.elements.linkText.value = anchor ? (anchor.textContent || '') : (selection?.toString() || '')
        this.elements.linkBlank.checked = anchor ? anchor.getAttribute('target') === '_blank' : true
        this.elements.linkRemove.hidden = !anchor
        this.elements.linkUrl.focus()
    }

    applyLinkFromBar() {
        const rawUrl = (this.elements.linkUrl.value || '').trim()
        const label = (this.elements.linkText.value || '').trim()
        const openBlank = this.elements.linkBlank.checked

        if (!rawUrl || !/^(https?:\/\/|\/|mailto:|#)/i.test(rawUrl)) {
            this.elements.linkUrl.focus()
            return
        }

        this.elements.content.focus()
        this.restoreSelection()

        const selection = window.getSelection()
        if (!selection || !selection.rangeCount) return
        const range = selection.getRangeAt(0)
        const existing = (range.commonAncestorContainer.nodeType === 1
            ? range.commonAncestorContainer
            : range.commonAncestorContainer.parentElement
        )?.closest('a')

        if (existing) {
            existing.setAttribute('href', rawUrl)
            if (label) existing.textContent = label
            if (openBlank) {
                existing.setAttribute('target', '_blank')
                existing.setAttribute('rel', 'nofollow noopener noreferrer')
                existing.classList.add('ext-link-icon')
            } else {
                existing.removeAttribute('target')
                existing.removeAttribute('rel')
                existing.classList.remove('ext-link-icon')
            }
        } else {
            const anchor = document.createElement('a')
            anchor.setAttribute('href', rawUrl)
            anchor.textContent = label || range.toString() || rawUrl
            if (openBlank) {
                anchor.setAttribute('target', '_blank')
                anchor.setAttribute('rel', 'nofollow noopener noreferrer')
                anchor.classList.add('ext-link-icon')
            }
            range.deleteContents()
            range.insertNode(anchor)
            range.setStartAfter(anchor)
            range.collapse(true)
            selection.removeAllRanges()
            selection.addRange(range)
        }

        this.elements.linkBar.hidden = true
        this.saveSelection()
        this.markAsChanged()
        if (this.previewVisible) this.updatePreview()
    }

    removeLinkAtSelection() {
        this.elements.content.focus()
        this.restoreSelection()
        const selection = window.getSelection()
        const anchor = selection?.anchorNode
            ? (selection.anchorNode.nodeType === 1 ? selection.anchorNode : selection.anchorNode.parentElement)?.closest('a')
            : null

        if (anchor) {
            const text = document.createTextNode(anchor.textContent || '')
            anchor.replaceWith(text)
            this.markAsChanged()
            if (this.previewVisible) this.updatePreview()
        }
        this.elements.linkBar.hidden = true
    }

    insertTableFromBar() {
        const rows = Math.min(20, Math.max(1, Number(this.elements.tableRows.value) || 3))
        const cols = Math.min(10, Math.max(1, Number(this.elements.tableCols.value) || 3))

        const table = document.createElement('table')
        table.className = 'table table-bordered table-sm'

        const thead = document.createElement('thead')
        const headRow = document.createElement('tr')
        for (let c = 0; c < cols; c++) {
            const th = document.createElement('th')
            th.scope = 'col'
            th.textContent = `Col ${c + 1}`
            headRow.appendChild(th)
        }
        thead.appendChild(headRow)
        table.appendChild(thead)

        if (rows > 1) {
            const tbody = document.createElement('tbody')
            for (let r = 1; r < rows; r++) {
                const tr = document.createElement('tr')
                for (let c = 0; c < cols; c++) {
                    const td = document.createElement('td')
                    td.innerHTML = '<br>'
                    tr.appendChild(td)
                }
                tbody.appendChild(tr)
            }
            table.appendChild(tbody)
        }

        this.elements.content.focus()
        this.restoreSelection()

        const selection = window.getSelection()
        const after = document.createElement('p')
        after.innerHTML = '<br>'

        if (selection && selection.rangeCount) {
            const range = selection.getRangeAt(0)
            range.deleteContents()
            range.insertNode(after)
            range.insertNode(table)
        } else {
            this.elements.content.append(table, after)
        }

        this.elements.tableBar.hidden = true
        this.saveSelection()
        this.markAsChanged()
        if (this.previewVisible) this.updatePreview()
    }

    handleKeyDown(event) {
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey) {
            const key = event.key.toLowerCase()
            if (key === 'b') {
                event.preventDefault()
                this.applyToolbarAction('bold')
                return
            }
            if (key === 'i') {
                event.preventDefault()
                this.applyToolbarAction('italic')
                return
            }
            if (key === 'u') {
                event.preventDefault()
                this.applyToolbarAction('underline')
                return
            }
            if (key === 'k') {
                event.preventDefault()
                this.openLinkBar()
                return
            }
        }

        if (event.key === 'Delete' || event.key === 'Backspace') {
            if (this.selectedImage) {
                event.preventDefault()
                this.deleteSelectedImage()
                return
            }
        }

        if (event.key === 'Tab') {
            const selection = window.getSelection()
            const pre = selection?.anchorNode
                ? (selection.anchorNode.nodeType === 1 ? selection.anchorNode : selection.anchorNode.parentElement)?.closest('pre')
                : null
            if (pre) {
                event.preventDefault()
                document.execCommand('insertText', false, '    ')
                this.markAsChanged()
            }
        }
    }

    async handlePaste(event) {
        const clipboard = event.clipboardData
        if (!clipboard) return

        // 1. Arquivos de imagem colados diretamente
        const imageFiles = Array.from(clipboard.files || []).filter(
            file => file.type && file.type.startsWith('image/')
        )
        if (imageFiles.length) {
            event.preventDefault()
            await this.insertImages(imageFiles)
            return
        }

        // 2. HTML limpo (remove mso-*, Word, scripts, estilos invasivos)
        const html = clipboard.getData('text/html')
        if (html) {
            event.preventDefault()
            const clean = this.sanitizePastedHTML(html)
            document.execCommand('insertHTML', false, clean)
            this.saveSelection()
            this.markAsChanged()
            this.updateDerivedMetadata()
            if (this.previewVisible) this.updatePreview()
            return
        }
    }

    sanitizePastedHTML(rawHtml) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(String(rawHtml || ''), 'text/html')
        const fragment = document.createDocumentFragment()

        const walk = (node, targetParent) => {
            for (const child of Array.from(node.childNodes)) {
                if (child.nodeType === Node.TEXT_NODE) {
                    targetParent.appendChild(document.createTextNode(child.textContent))
                    continue
                }
                if (child.nodeType !== Node.ELEMENT_NODE) continue

                const tag = child.tagName.toUpperCase()
                if (/^(SCRIPT|STYLE|META|LINK|XML|OBJECT|EMBED|IFRAME|NOSCRIPT|O:P)$/i.test(tag)) {
                    continue
                }

                if (!ALLOWED_TAGS.has(tag)) {
                    walk(child, targetParent)
                    continue
                }

                const cleanEl = document.createElement(tag.toLowerCase())

                if (tag === 'A') {
                    const href = child.getAttribute('href') || ''
                    if (/^(https?:\/\/|\/|mailto:|#)/i.test(href)) {
                        cleanEl.setAttribute('href', href)
                        if (href.startsWith('http')) {
                            cleanEl.setAttribute('target', '_blank')
                            cleanEl.setAttribute('rel', 'nofollow noopener noreferrer')
                            cleanEl.classList.add('ext-link-icon')
                        }
                    }
                } else if (tag === 'IMG') {
                    const src = child.getAttribute('data-src') || child.getAttribute('src') || ''
                    if (/^(https?:\/\/|\/assets\/|blob:)/i.test(src)) {
                        cleanEl.setAttribute('src', src)
                        cleanEl.setAttribute('alt', child.getAttribute('alt') || '')
                        cleanEl.className = 'img-fluid'
                        if (child.dataset.mediaHash) {
                            cleanEl.dataset.mediaHash = child.dataset.mediaHash
                        }
                    } else {
                        continue
                    }
                } else if (tag === 'TABLE') {
                    cleanEl.className = 'table table-bordered table-sm'
                }

                walk(child, cleanEl)
                targetParent.appendChild(cleanEl)
            }
        }

        walk(doc.body, fragment)
        const holder = document.createElement('div')
        holder.appendChild(fragment)
        return holder.innerHTML
    }

    refreshToolbarState() {
        if (this.sourceMode) return
        const commands = {
            bold: 'bold',
            italic: 'italic',
            underline: 'underline',
            strike: 'strikeThrough',
            'unordered-list': 'insertUnorderedList',
            'ordered-list': 'insertOrderedList'
        }

        for (const [action, cmd] of Object.entries(commands)) {
            const btn = this.elements.toolbar.querySelector(`[data-editor-action="${action}"]`)
            if (!btn) continue
            try {
                btn.classList.toggle('active', document.queryCommandState(cmd))
            } catch {
                // Ignora
            }
        }

        if (this.elements.blockFormat) {
            try {
                const block = String(document.queryCommandValue('formatBlock') || 'p')
                    .replace(/[<>]/g, '')
                    .toLowerCase()
                if (this.elements.blockFormat.querySelector(`option[value="${block}"]`)) {
                    this.elements.blockFormat.value = block
                }
            } catch {
                // Ignora
            }
        }
    }

    // ---------- Seleção e controle de imagem fora do contenteditable ----------

    selectImage(img) {
        this.clearImageSelection()
        this.selectedImage = img
        img.classList.add('wysiwyg-img-selected')

        const overlay = this.elements.imageOverlay
        if (!overlay) return

        const currentWidth = this.readImageWidthPercent(img)
        this.elements.imgWidth.value = String(currentWidth)
        this.elements.imgWidthLabel.textContent = `${currentWidth}%`
        this.elements.imgAlt.value = img.getAttribute('alt') || ''

        const figure = img.closest('figure')
        const caption = figure?.querySelector('figcaption')
        this.elements.imgCaption.value = caption ? caption.textContent : ''

        overlay.hidden = false
    }

    clearImageSelection() {
        if (this.selectedImage) {
            this.selectedImage.classList.remove('wysiwyg-img-selected')
            this.selectedImage = null
        }
        if (this.elements.imageOverlay) {
            this.elements.imageOverlay.hidden = true
        }
    }

    readImageWidthPercent(img) {
        const attr = Number(img.dataset.widthPercent)
        if (Number.isFinite(attr) && attr > 0) return attr
        const styleWidth = img.style.width || ''
        const pct = styleWidth.match(/(\d+(?:\.\d+)?)%/)
        if (pct) return Math.min(100, Math.max(15, Math.round(Number(pct[1]))))
        return 100
    }

    setImageWidth(percent) {
        if (!this.selectedImage) return
        const clamped = Math.min(100, Math.max(15, Math.round(percent)))
        this.selectedImage.dataset.widthPercent = String(clamped)
        this.selectedImage.style.width = clamped === 100 ? '' : `${clamped}%`
        this.selectedImage.style.height = 'auto'
        this.elements.imgWidth.value = String(clamped)
        this.elements.imgWidthLabel.textContent = `${clamped}%`
        this.markAsChanged()
        if (this.previewVisible) this.updatePreview()
    }

    setImageAlignment(align) {
        if (!this.selectedImage) return
        const wrapper = this.selectedImage.closest('figure') ||
            this.selectedImage.closest('picture') ||
            this.selectedImage

        wrapper.classList.remove(
            'post-image-left',
            'post-image-center',
            'post-image-right',
            'post-image-full'
        )
        wrapper.classList.add(`post-image-${align}`)

        if (align === 'full') {
            this.setImageWidth(100)
        }
        this.markAsChanged()
        if (this.previewVisible) this.updatePreview()
    }

    setImageCaption(img, text) {
        const clean = String(text || '').trim()
        let figure = img.closest('figure')
        const picture = img.closest('picture')

        if (!clean) {
            if (figure) {
                const figcaption = figure.querySelector('figcaption')
                if (figcaption) figcaption.remove()
            }
            this.markAsChanged()
            return
        }

        if (!figure) {
            figure = document.createElement('figure')
            figure.className = 'post-figure text-center my-3'
            const targetNode = picture || img
            targetNode.before(figure)
            figure.appendChild(targetNode)
        }

        let figcaption = figure.querySelector('figcaption')
        if (!figcaption) {
            figcaption = document.createElement('figcaption')
            figcaption.className = 'figure-caption small text-muted mt-1'
            figure.appendChild(figcaption)
        }
        figcaption.textContent = clean
        this.markAsChanged()
        if (this.previewVisible) this.updatePreview()
    }

    deleteSelectedImage() {
        if (!this.selectedImage) return
        const figure = this.selectedImage.closest('figure')
        const picture = this.selectedImage.closest('picture')
        const target = figure || picture || this.selectedImage
        target.remove()
        this.clearImageSelection()
        this.markAsChanged()
        this.updateDerivedMetadata()
        if (this.previewVisible) this.updatePreview()
        this.cleanupImages()
    }

    // ---------- Fonte HTML / Pré-visualização ----------

    toggleSourceMode(enable = !this.sourceMode) {
        const nextMode = Boolean(enable)
        if (nextMode === this.sourceMode) return

        this.clearImageSelection()

        if (nextMode) {
            const html = this.getCleanEditorHTML()
            this.sourceMode = true
            this.elements.htmlSource.value = html
            this.elements.content.hidden = true
            this.elements.htmlSource.hidden = false
            this.elements.sourceToggle?.classList.add('active')
            this.elements.sourceToggle?.setAttribute('aria-pressed', 'true')
            this.elements.htmlSource.focus()
        } else {
            const html = this.elements.htmlSource.value
            this.sourceMode = false
            this.elements.htmlSource.hidden = true
            this.elements.content.hidden = false
            this.setEditorHTML(html)
            this.elements.sourceToggle?.classList.remove('active')
            this.elements.sourceToggle?.setAttribute('aria-pressed', 'false')
            this.elements.content.focus()
        }

        if (this.previewVisible) this.updatePreview()
    }

    togglePreview(visible = !this.previewVisible) {
        this.previewVisible = Boolean(visible)
        this.elements.previewPanel.hidden = !this.previewVisible
        this.elements.previewToggle.setAttribute('aria-expanded', String(this.previewVisible))
        this.elements.previewToggle.classList.toggle('active', this.previewVisible)

        if (this.previewVisible) {
            this.updatePreview()
        } else {
            this.elements.previewToggle.focus()
        }
    }

    getCleanEditorHTML() {
        if (this.sourceMode) {
            return this.elements.htmlSource.value
        }

        const clone = this.elements.content.cloneNode(true)
        clone.querySelectorAll('.wysiwyg-img-selected').forEach(node => {
            node.classList.remove('wysiwyg-img-selected')
        })
        return clone.innerHTML
    }

    setEditorHTML(html) {
        const normalized = this.unwrapPicturesForEditor(String(html || ''))
        this.elements.content.innerHTML = normalized

        const missing = []
        this.elements.content.querySelectorAll('img[data-media-hash]').forEach(img => {
            const hash = img.dataset.mediaHash
            const url = this.mediaURLs.get(hash)
            if (url) {
                img.src = url
            } else if (!this.mediaMissing.has(hash)) {
                missing.push(hash)
            }
        })

        if (missing.length) {
            this.loadMedia([...new Set(missing)])
        }

        this.updateDerivedMetadata()
        if (this.previewVisible) this.updatePreview()
    }

    unwrapPicturesForEditor(html) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(html, 'text/html')

        doc.querySelectorAll('img').forEach(img => {
            const dataSrc = img.getAttribute('data-src')
            if (dataSrc && (!img.getAttribute('src') || img.getAttribute('src').includes('1x1.gif'))) {
                img.setAttribute('src', dataSrc.startsWith('/') || dataSrc.startsWith('http') || dataSrc.startsWith('blob:') ? dataSrc : `/${dataSrc.replace(/^\/+/, '')}`)
            }
            img.removeAttribute('data-lazy-target')
            img.removeAttribute('loading')
            img.classList.remove('lazy-isloaded')
        })

        return doc.body.innerHTML
    }

    updatePreview() {
        if (!this.elements.content) return
        const html = this.getCleanEditorHTML()
        if (this.elements.preview) {
            this.elements.preview.innerHTML = this.unwrapPicturesForEditor(html)
        }
        this.updateDerivedMetadata()
    }

    buildAutomaticSummary() {
        const text = this.extractPlainText()
        if (!text) return ''
        const limit = 160
        if (text.length <= limit) return text
        const excerpt = text.slice(0, limit + 1)
        const lastSpace = excerpt.lastIndexOf(' ')
        return (lastSpace > 0 ? excerpt.slice(0, lastSpace) : excerpt.slice(0, limit)).trim()
    }

    extractPlainText() {
        const source = this.sourceMode
            ? (() => {
                const tmp = document.createElement('div')
                tmp.innerHTML = this.elements.htmlSource.value
                return tmp.textContent || ''
            })()
            : (this.elements.content?.textContent || '')

        return source.replace(/\s+/g, ' ').trim()
    }

    updateDerivedMetadata() {
        const text = this.extractPlainText()
        const words = text ? text.split(/\s+/).length : 0
        this.wordCount = words
        this.readingTime = Math.max(1, Math.ceil(words / 250))

        this.autoSummary = this.buildAutomaticSummary()
        if (!this.summaryManual && this.elements.summary) {
            this.elements.summary.value = this.autoSummary
        }

        if (this.elements.readingBadge) {
            const template = this.message('reading_stats')
            this.elements.readingBadge.textContent = template && template !== 'reading_stats'
                ? template.replace('{words}', words).replace('{minutes}', this.readingTime)
                : `${words} · ${this.readingTime} min`
        }
    }

    markAsChanged() {
        this.hasChanges = true
        this.setStatus('pending_changes')
    }

    startAutoSaveTimer() {
        if (this.autoSaveTimer) clearInterval(this.autoSaveTimer)
        this.autoSaveTimer = setInterval(() => {
            if (this.hasChanges) this.autoSave()
        }, this.autoSaveInterval)
    }

    getEditorData() {
        return {
            title: this.elements.title.value.trim(),
            slug: this.postManager.slugify(this.elements.slug.value || this.elements.title.value),
            summary: this.elements.summary.value.trim(),
            content: this.getCleanEditorHTML(),
            tags: this.elements.tags.value
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean),
            readingTime: this.readingTime
        }
    }

    // ---------- Imagens locais em IndexedDB ----------

    async insertImages(files) {
        const list = Array.from(files || []).filter(
            file => file.type && file.type.startsWith('image/')
        )

        if (!list.length) return

        if (!this.db) {
            this.setStatus('images_db_unavailable')
            return
        }

        this._pendingInserts++

        try {
            const originalSize = list.reduce((total, file) => total + file.size, 0)
            let processedSize = 0
            const nodes = []

            for (const selectedFile of list) {
                let file = selectedFile
                try {
                    file = await this.imageProcessor.process(selectedFile)
                } catch {
                    file = selectedFile
                }

                if (!(file instanceof Blob)) file = selectedFile
                processedSize += file.size

                const hash = await this.hashFile(file)
                const dims = await this.readImageDimensions(file)

                await this._enqueue(async () => {
                    const key = IMAGE_PREFIX + hash
                    const exists = await this.db.read({ tbn: DRAFTS_STORE, tbk: key })
                    if (exists) return

                    await this.db.create([{
                        tbn: DRAFTS_STORE,
                        tbk: key,
                        tbv: {
                            kind: 'image',
                            name: file.name || selectedFile.name,
                            type: file.type || selectedFile.type,
                            size: file.size,
                            width: dims.width,
                            height: dims.height,
                            blob: file,
                            createdAt: new Date().toISOString()
                        }
                    }])
                })

                if (!this.mediaURLs.has(hash)) {
                    this.mediaURLs.set(hash, URL.createObjectURL(file))
                }

                const alt = selectedFile.name
                    .replace(/\.[^.]+$/, '')
                    .replace(/[<>"']/g, ' ')
                    .trim() || 'imagem'

                const picture = document.createElement('picture')
                picture.className = 'post-image-center my-3'

                const img = document.createElement('img')
                img.src = this.mediaURLs.get(hash)
                img.alt = alt
                img.className = 'img-fluid'
                img.dataset.mediaHash = hash
                if (dims.width) img.setAttribute('width', String(dims.width))
                if (dims.height) img.setAttribute('height', String(dims.height))

                picture.appendChild(img)
                nodes.push(picture)
            }

            if (this.sourceMode) this.toggleSourceMode(false)

            this.elements.content.focus()
            this.restoreSelection()

            const selection = window.getSelection()
            const range = selection && selection.rangeCount
                ? selection.getRangeAt(0)
                : null

            if (range && this.elements.content.contains(range.commonAncestorContainer)) {
                range.deleteContents()
                const after = document.createElement('p')
                after.innerHTML = '<br>'
                range.insertNode(after)
                for (let i = nodes.length - 1; i >= 0; i--) {
                    range.insertNode(nodes[i])
                }
                range.setStart(after, 0)
                range.collapse(true)
                selection.removeAllRanges()
                selection.addRange(range)
            } else {
                for (const node of nodes) {
                    const p = document.createElement('p')
                    p.innerHTML = '<br>'
                    this.elements.content.append(node, p)
                }
            }

            this.saveSelection()
            this.markAsChanged()
            this.updateDerivedMetadata()
            if (this.previewVisible) this.updatePreview()

            if (processedSize < originalSize) {
                const formatSize = size => size >= 1048576
                    ? (size / 1048576).toFixed(2) + ' MB'
                    : (size / 1024).toFixed(1) + ' KB'
                this.setStatus('images_optimized', formatSize(originalSize), formatSize(processedSize))
            } else {
                this.setStatus('images_added')
            }
        } catch (error) {
            console.error('[WysiwygEditor]: Erro ao guardar imagem:', error)
            this.setStatus('image_save_error')
        } finally {
            this._pendingInserts--
        }
    }

    async readImageDimensions(blob) {
        if (typeof createImageBitmap !== 'function') return { width: 0, height: 0 }
        try {
            const bitmap = await createImageBitmap(blob)
            const dims = { width: bitmap.width, height: bitmap.height }
            bitmap.close()
            return dims
        } catch {
            return { width: 0, height: 0 }
        }
    }

    async hashFile(file) {
        const buffer = await file.arrayBuffer()
        if (globalThis.crypto && crypto.subtle) {
            try {
                const digest = await crypto.subtle.digest('SHA-256', buffer)
                return Array.from(new Uint8Array(digest))
                    .map(byte => byte.toString(16).padStart(2, '0'))
                    .join('')
            } catch {
                // Usa fallback abaixo
            }
        }

        const bytes = new Uint8Array(buffer)
        let h1 = 0xdeadbeef
        let h2 = 0x41c6ce57
        for (let i = 0; i < bytes.length; i++) {
            h1 = Math.imul(h1 ^ bytes[i], 2654435761)
            h2 = Math.imul(h2 ^ bytes[i], 1597334677)
        }
        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
        return 'f' + (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0') + '-' + bytes.length
    }

    async loadMedia(hashes) {
        if (!this.db) return
        let changed = false

        for (const hash of hashes) {
            if (this.mediaLoading.has(hash)) continue
            this.mediaLoading.add(hash)

            try {
                const record = await this.db.read({ tbn: DRAFTS_STORE, tbk: IMAGE_PREFIX + hash })
                if (record && record.blob) {
                    const objectURL = URL.createObjectURL(record.blob)
                    this.mediaURLs.set(hash, objectURL)
                    this.elements.content.querySelectorAll(`img[data-media-hash="${hash}"]`).forEach(img => {
                        img.src = objectURL
                    })
                    changed = true
                } else {
                    this.mediaMissing.add(hash)
                }
            } catch {
                this.mediaMissing.add(hash)
            } finally {
                this.mediaLoading.delete(hash)
            }
        }

        if (changed && this.previewVisible) this.updatePreview()
    }

    releaseMedia() {
        this.mediaURLs.forEach(url => URL.revokeObjectURL(url))
        this.mediaURLs.clear()
        this.mediaLoading.clear()
        this.mediaMissing.clear()
    }

    /**
     * Prepara todas as imagens locais para envio ao GitHub e serializa o HTML
     * final com <picture><img src="/assets/media/image/1x1.gif" data-src="/..." data-lazy-target></picture>.
     */
    async prepareImages(rawHtml) {
        const parser = new DOMParser()
        const doc = parser.parseFromString(String(rawHtml || ''), 'text/html')

        doc.querySelectorAll('.wysiwyg-img-selected').forEach(node => {
            node.classList.remove('wysiwyg-img-selected')
        })

        const images = []
        const seenPath = new Set()

        const imgs = Array.from(doc.body.querySelectorAll('img'))
        for (const img of imgs) {
            const hash = img.dataset.mediaHash
            let repoPath = null

            if (hash) {
                if (!this.db) {
                    throw new Error('Banco de dados indisponível para recuperar as imagens.')
                }

                const record = await this.db.read({
                    tbn: DRAFTS_STORE,
                    tbk: IMAGE_PREFIX + hash
                })

                if (!record || !record.blob) {
                    throw new Error(`A imagem ${hash} não foi encontrada no armazenamento local.`)
                }

                const type = record.type || record.blob.type || ''
                const extension = IMAGE_EXTENSIONS[type] || 'webp'
                repoPath = `assets/posts/images/${hash}.${extension}`

                if (!seenPath.has(repoPath)) {
                    seenPath.add(repoPath)
                    images.push({
                        path: repoPath,
                        file: record.blob
                    })
                }

                if (record.width && !img.getAttribute('width')) {
                    img.setAttribute('width', String(record.width))
                }
                if (record.height && !img.getAttribute('height')) {
                    img.setAttribute('height', String(record.height))
                }

                img.removeAttribute('data-media-hash')
            } else {
                const candidate = img.getAttribute('data-src') || img.getAttribute('src') || ''
                const normalized = candidate.replace(/^\/+/, '')
                if (normalized.startsWith('assets/posts/images/')) {
                    repoPath = normalized
                }
            }

            const finalSrc = repoPath
                ? `/${repoPath}`
                : (img.getAttribute('data-src') || img.getAttribute('src') || '')

            if (finalSrc) {
                img.setAttribute('src', LAZY_PLACEHOLDER)
                img.setAttribute('data-src', finalSrc)
                img.setAttribute('data-lazy-target', '')
                img.removeAttribute('loading')
                img.classList.remove('lazy-isloaded')
                img.classList.add('img-fluid')
            }

            if (!img.closest('picture')) {
                const picture = doc.createElement('picture')
                img.before(picture)
                picture.appendChild(img)
            }
        }

        return {
            html: doc.body.innerHTML.trim(),
            images
        }
    }

    // ---------- Rascunhos & Autosave ----------

    getDraftKey(title) {
        return DRAFT_PREFIX + String(title || '')
            .normalize('NFC')
            .trim()
            .replace(/\s+/g, ' ')
            .toLowerCase()
    }

    buildDraftRecord() {
        const data = this.getEditorData()
        return {
            title: data.title,
            slug: data.slug,
            summary: data.summary,
            summaryManual: this.summaryManual,
            content: data.content,
            tags: data.tags,
            updatedAt: new Date().toISOString()
        }
    }

    _enqueue(task) {
        const run = this._queue.then(task)
        this._queue = run.catch(() => {})
        return run
    }

    async initStorage() {
        if (!this.db) {
            this.setStatus('drafts_db_unavailable')
            return false
        }

        await this.loadDraftList()
        await this.restoreAutoSave()
        await this.cleanupImages()
        return true
    }

    bindLifecycle() {
        this._onHide = () => {
            if (document.visibilityState === 'hidden') this.autoSave()
        }
        this._onPageHide = () => {
            this.autoSave()
        }
        document.addEventListener('visibilitychange', this._onHide)
        window.addEventListener('pagehide', this._onPageHide)
    }

    unbindLifecycle() {
        document.removeEventListener('visibilitychange', this._onHide)
        window.removeEventListener('pagehide', this._onPageHide)
    }

    async autoSave() {
        if (!this.hasChanges || !this.db) return false

        const draft = this.buildDraftRecord()
        this.hasChanges = false

        const empty =
            !draft.title &&
            !this.extractPlainText() &&
            !draft.tags.length &&
            !draft.summary

        try {
            await this._enqueue(() => empty
                ? this.db.delete({ tbn: DRAFTS_STORE, tbk: AUTOSAVE_KEY })
                : this.db.create([{ tbn: DRAFTS_STORE, tbk: AUTOSAVE_KEY, tbv: { kind: 'autosave', ...draft } }])
            )

            if (!this.hasChanges) {
                this.setStatus('autosave_ok')
            }
            return true
        } catch (error) {
            this.hasChanges = true
            console.error('[WysiwygEditor]: Erro no autosave:', error)
            this.setStatus('autosave_error')
            return false
        }
    }

    message(id, ...args) {
        let bank = this.root ? this.root.querySelector(`[data-msg="${id}"]`) : null
        if (bank && !bank.textContent.trim()) {
            this.translate()
            bank = this.root.querySelector(`[data-msg="${id}"]`)
        }
        let text = bank ? bank.textContent.trim() : String(id)

        args.forEach((value, index) => {
            const bankItem = this.root
                ? Array.from(this.root.querySelectorAll('[data-msg]'))
                    .find(item => item.dataset.msg === String(value))
                : null
            const resolved = bankItem ? bankItem.textContent.trim() : value
            text = text.split(`{${index}}`).join(String(resolved))
        })

        return text
    }

    setStatus(id, ...args) {
        const text = this.message(id, ...args)
        if (this.elements.status) {
            this.elements.status.textContent = text
        }
        this.onStatus(text)
    }

    async saveDraft() {
        const data = this.getEditorData()

        if (!data.title && !this.extractPlainText()) {
            this.setStatus('nothing_to_save')
            return false
        }
        if (!this.db) {
            this.setStatus('db_unavailable')
            return false
        }

        const key = this.getDraftKey(data.title)

        try {
            const updated = await this._enqueue(async () => {
                const previous = await this.db.read({ tbn: DRAFTS_STORE, tbk: key })
                const now = new Date().toISOString()

                await this.db.create([{
                    tbn: DRAFTS_STORE,
                    tbk: key,
                    tbv: {
                        kind: 'draft',
                        title: data.title,
                        slug: data.slug,
                        summary: data.summary,
                        summaryManual: this.summaryManual,
                        content: data.content,
                        tags: data.tags,
                        createdAt: (previous && previous.createdAt) || now,
                        updatedAt: now
                    }
                }])

                return !!previous
            })

            this.currentDraftKey = key
            await this.loadDraftList(key)
            this.setStatus(updated ? 'draft_updated' : 'draft_saved')
            this.cleanupImages()
            return true
        } catch (error) {
            console.error('[WysiwygEditor]: Erro ao salvar rascunho:', error)
            this.setStatus('draft_save_error')
            return false
        }
    }

    async restoreAutoSave() {
        if (!this.db) return false
        try {
            const draft = await this.db.read({ tbn: DRAFTS_STORE, tbk: AUTOSAVE_KEY })
            if (!draft || typeof draft !== 'object' || this.hasChanges) return false

            const hasContent = draft.title || draft.content || (draft.tags && draft.tags.length) || draft.summary
            if (!hasContent) return false

            this.restoreDraftData(draft)
            this.setStatus('changes_recovered')
            return true
        } catch (error) {
            console.error('[WysiwygEditor]: Erro ao recuperar autosave:', error)
            return false
        }
    }

    async loadDraftList(selected = '') {
        const select = this.elements.draftList
        if (!select || !this.db) return

        try {
            const rows = await this.db.read({ tbn: DRAFTS_STORE, method: 'like', tbk: DRAFT_PREFIX })
            rows.sort((a, b) => String(b.value?.updatedAt || '').localeCompare(String(a.value?.updatedAt || '')))

            Array.from(select.querySelectorAll('option')).slice(1).forEach(opt => opt.remove())

            rows.forEach(({ key, value }) => {
                const option = document.createElement('option')
                option.value = key
                option.textContent = (value && value.title) || this.message('draft_untitled')
                select.appendChild(option)
            })

            select.value = selected || this.currentDraftKey || ''
        } catch (error) {
            console.error('[WysiwygEditor]: Erro ao carregar rascunhos:', error)
        }
    }

    async loadSelectedDraft() {
        const key = this.elements.draftList.value
        if (!key) {
            this.setStatus('draft_select')
            return false
        }
        try {
            const draft = await this.db.read({ tbn: DRAFTS_STORE, tbk: key })
            if (!draft) {
                this.setStatus('draft_not_found')
                return false
            }
            this.restoreDraftData(draft)
            this.currentDraftKey = key
            this.hasChanges = false
            this.setStatus('draft_opened')
            return true
        } catch (error) {
            console.error('[WysiwygEditor]: Erro ao abrir rascunho:', error)
            this.setStatus('draft_open_error')
            return false
        }
    }

    async deleteSelectedDraft() {
        const key = this.elements.draftList?.value
        if (!key || !this.db) {
            this.setStatus('draft_select')
            return false
        }
        try {
            await this._enqueue(() => this.db.delete({ tbn: DRAFTS_STORE, tbk: key }))
            if (this.currentDraftKey === key) this.currentDraftKey = null
            await this.loadDraftList('')
            await this.cleanupImages()
            this.setStatus('draft_deleted')
            return true
        } catch (error) {
            console.error('[WysiwygEditor]: Erro ao remover rascunho:', error)
            return false
        }
    }

    restoreDraftData(draft) {
        if (this.sourceMode) this.toggleSourceMode(false)
        this.clearImageSelection()

        this.elements.title.value = draft.title || ''
        const resolvedSlug = draft.slug || this.postManager.slugify(draft.title || '')
        this.elements.slug.value = resolvedSlug
        this.slugManual = Boolean(draft.slug)
        this.updateSlugPreview()

        this.elements.summary.value = draft.summary || ''
        this.summaryManual = draft.summaryManual === true

        this.elements.tags.value = Array.isArray(draft.tags)
            ? draft.tags.join(', ')
            : (draft.tags || '')

        this.setEditorHTML(draft.content || '')
    }

    extractHashesFromHTML(html) {
        const hashes = new Set()
        const pattern = /data-media-hash="([A-Za-z0-9_-]+)"/g
        let match
        while ((match = pattern.exec(String(html || ''))) !== null) {
            hashes.add(match[1])
        }
        return hashes
    }

    async cleanupImages() {
        if (!this.db || this._pendingInserts > 0) return 0
        try {
            return await this._enqueue(async () => {
                if (this._pendingInserts > 0) return 0
                const [images, drafts, auto] = await Promise.all([
                    this.db.read({ tbn: DRAFTS_STORE, method: 'like', tbk: IMAGE_PREFIX }),
                    this.db.read({ tbn: DRAFTS_STORE, method: 'like', tbk: DRAFT_PREFIX }),
                    this.db.read({ tbn: DRAFTS_STORE, tbk: AUTOSAVE_KEY })
                ])

                const used = new Set()
                const collect = html => {
                    this.extractHashesFromHTML(html).forEach(h => used.add(h))
                }

                drafts.forEach(item => collect(item.value && item.value.content))
                if (auto) collect(auto.content)
                collect(this.getCleanEditorHTML())

                const stale = images.filter(item => !used.has(item.key.slice(IMAGE_PREFIX.length)))
                if (!stale.length) return 0

                await this.db.delete(stale.map(item => ({ tbn: DRAFTS_STORE, tbk: item.key })))

                stale.forEach(item => {
                    const hash = item.key.slice(IMAGE_PREFIX.length)
                    const url = this.mediaURLs.get(hash)
                    if (url) URL.revokeObjectURL(url)
                    this.mediaURLs.delete(hash)
                })

                return stale.length
            })
        } catch (error) {
            console.error('[WysiwygEditor]: Erro na limpeza de imagens:', error)
            return 0
        }
    }

    resetEditor() {
        if (this.sourceMode) this.toggleSourceMode(false)
        this.clearImageSelection()

        this.elements.title.value = ''
        this.elements.slug.value = ''
        this.elements.slug.readOnly = false
        if (this.elements.slugLock) {
            this.elements.slugLock.textContent = '🔒'
            this.elements.slugLock.setAttribute('aria-pressed', 'false')
        }
        this.slugManual = false
        this.updateSlugPreview()

        this.elements.summary.value = ''
        this.elements.content.innerHTML = ''
        if (this.elements.htmlSource) this.elements.htmlSource.value = ''
        this.elements.tags.value = ''
        this.elements.imageInput.value = ''
        this.elements.linkBar.hidden = true
        this.elements.tableBar.hidden = true

        this.summaryManual = false
        this.autoSummary = ''
        this.readingTime = 1
        this.wordCount = 0

        this.currentDraftKey = null
        this.hasChanges = false

        this.previewVisible = false
        this.elements.previewPanel.hidden = true
        this.elements.previewToggle.setAttribute('aria-expanded', 'false')
        this.elements.previewToggle.classList.remove('active')

        this.elements.draftList.value = ''

        this.updateDerivedMetadata()
        this.releaseMedia()
        this.setStatus('editor_ready_new')
    }

    async confirmPublication() {
        this.resetEditor()

        if (this.db) {
            try {
                await this._enqueue(() => this.db.delete({ tbn: DRAFTS_STORE, tbk: AUTOSAVE_KEY }))
            } catch (error) {
                console.error('[WysiwygEditor]: Erro ao limpar autosave:', error)
            }
        }

        await this.cleanupImages()
        return true
    }

    async generatePost() {
        if (this.isGenerating) return false
        this.isGenerating = true

        const button = this.elements.generate
        const originalButtonText = button ? button.textContent : ''

        if (button) {
            button.disabled = true
            button.setAttribute('aria-busy', 'true')
            button.textContent = this.message('publishing')
        }

        try {
            if (this.sourceMode) this.toggleSourceMode(false)
            this.clearImageSelection()

            const initialData = this.getEditorData()

            if (!initialData.title) {
                this.setStatus('need_title')
                this.elements.title.focus()
                return false
            }

            if (!initialData.slug) {
                this.setStatus('need_slug')
                this.elements.slug.focus()
                return false
            }

            const hasText = Boolean(this.extractPlainText())
            const hasMedia = Boolean(this.elements.content.querySelector('img, table, hr, pre'))
            if (!hasText && !hasMedia) {
                this.setStatus('need_content')
                this.elements.content.focus()
                return false
            }

            let stage = 'stage_init'
            this.setStatus('preparing')

            try {
                stage = 'stage_preview'
                this.updateDerivedMetadata()

                stage = 'stage_read'
                const data = this.getEditorData()

                stage = 'stage_autosave'
                await this.autoSave()

                stage = 'stage_images'
                const prepared = await this.prepareImages(data.content)

                stage = 'stage_files'
                const post = await this.postManager.createPost({
                    title: data.title,
                    slug: data.slug,
                    author: String(this.getAuthorId() || ''),
                    summary: data.summary,
                    readingTime: data.readingTime,
                    content: prepared.html,
                    images: prepared.images,
                    tags: data.tags
                })

                stage = 'stage_publish'
                const publication = await this.onCreate(post)

                if (publication && publication.published === true) {
                    stage = 'stage_confirm'
                    await this.confirmPublication()
                    this.setStatus('published')
                    return post
                }

                this.setStatus('prepared')
                return { published: false, post }
            } catch (error) {
                const errorName = error?.name || 'Error'
                const errorMessage = error?.message || String(error)
                console.error('[WysiwygEditor] Falha na publicação:', { stage, errorName, errorMessage })
                this.setStatus('publish_stage_error', this.message(stage), `${errorName}: ${errorMessage}`)
                return false
            }
        } finally {
            this.isGenerating = false
            if (button) {
                button.disabled = false
                button.removeAttribute('aria-busy')
                button.textContent = originalButtonText
            }
        }
    }

    destroy() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer)
            this.autoSaveTimer = null
        }
        this.unbindLifecycle()
        if (this.hasChanges) this.autoSave()
        this.releaseMedia()
        this.isMounted = false
    }
}

export { WysiwygEditor }
export default WysiwygEditor
