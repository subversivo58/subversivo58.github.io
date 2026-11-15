/**
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage] - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 *
 * @file MarkdownEditor.mjs
 * @description Editor Markdown integrado ao sistema de postagens.
 */

import PostManager from './PostManager.mjs'
import AdminPosts from './AdminPosts.mjs'
import ImageProcessor from '../lib/ImageProcessor.mjs'
const DRAFTS_STORE = 'drafts'
const AUTOSAVE_KEY = 'autosave'
const DRAFT_PREFIX = 'draft:'
const IMAGE_PREFIX = 'img:'
const MEDIA_REF = /media:([A-Za-z0-9_-]+)/g

const PREVIEW_EXTENSIONS = [
    'tables',
    'images',
    'anchors',
    'externalLinks',
    'blockAttributes',
    'highlight'
]

const BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=='

class MarkdownEditor {
    constructor(options = {}) {
        this.options = options
        this.permissions = options.permissions || null
        this.root = options.root || null
        this.postManager = options.postManager || new PostManager()
        this.imageProcessor = options.imageProcessor || new ImageProcessor({ auto: true })
        this.onCreate = options.onCreate || (() => {})
        this.onStatus = options.onStatus || (() => {})
        this.translate = options.translate || (() => {})
        this.recognition = null
        this.recognitionSelection = null
        this.recognitionText = ''
        this.isRecognizing = false
        this.markdown = null
        this.previewRun = 0
        this.elements = {}
        this.db = options.db || null

        this.hasChanges = false
        this.currentDraftKey = null

        this.summaryManual = false
        this.autoSummary = ''
        this.readingTime = 1

        this._queue = Promise.resolve()
        this._pendingInserts = 0
        this.isGenerating = false

        this.mediaURLs = new Map()
        this.mediaLoading = new Set()
        this.mediaMissing = new Set()

        this.autoSaveTimer = null
        this.autoSaveInterval = 15000

        this.previewVisible = false
        this.objectURLs = []

        this.isMounted = false
    }

    mount(root = this.root) {
        if (!root) {
            console.error(
                '[MarkdownEditor]: Elemento raiz não informado.'
            )
            return false
        }

        this.root = root

        // O markup do editor vem do template markdown-editor.tpl,
        // injetado pelo settings.json (rota admin) no #admin-post-editor.

        this.elements = {
            editor: this.root.querySelector('.markdown-editor'),
            status: this.root.querySelector('#post-editor-status'),
            title: this.root.querySelector('#post-title'),
            summary: this.root.querySelector('#post-summary'),
            summaryRestore: this.root.querySelector('#post-summary-restore'),
            content: this.root.querySelector('#post-content'),
            tags: this.root.querySelector('#post-tags'),
            toolbar: this.root.querySelector('#post-editor-toolbar'),
            addImage: this.root.querySelector('#post-add-image'),
            imageInput: this.root.querySelector('#post-image-input'),
            microphone: this.root.querySelector('#post-microphone'),
            fontSize: this.root.querySelector('#post-font-size'),

            previewToggle: this.root.querySelector('#post-preview-toggle'),
            previewPanel: this.root.querySelector('#post-preview-panel'),
            previewClose: this.root.querySelector('#post-preview-close'),
            preview: this.root.querySelector('#post-preview'),

            saveDraft: this.root.querySelector('#post-save-draft'),
            draftList: this.root.querySelector('#post-draft-list'),
            openDraft: this.root.querySelector('#post-open-draft'),
            generate: this.root.querySelector('#post-generate')
        }

        this.initializeSpeechRecognition()
        this.updateMicrophoneButton()




      
        this.bindEvents()
        this.updatePreview()
        this.startAutoSaveTimer()
        this.bindLifecycle()

        this.isMounted = true

this.adminPosts = new AdminPosts(this)

this.adminPosts.mount().catch(error => {
    console.error(
        '[MarkdownEditor]: Erro ao inicializar gerenciamento de postagens:',
        error
    )
})
      

        this.ready = this.initStorage()
        this.markdownReady = this.loadMarkdownLib()

        return true
    }
async updateMicrophoneButton() {
    if (!this.elements.microphone || !this.permissions) return

    await this.permissions.ready

    this.elements.microphone.disabled =
        this.permissions.status.microphone !== 'granted'
}

initializeSpeechRecognition() {
    const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition

    if (!SpeechRecognition) {
        this.recognition = null
        return false
    }

    this.recognition = new SpeechRecognition()

    this.recognition.lang = 'pt-BR'
    this.recognition.continuous = true
    this.recognition.interimResults = true
    this.recognition.maxAlternatives = 1
    this.recognition.onresult = event => {
        this.handleSpeechRecognitionResult(event)
    }
    this.recognition.onstart = () => {
        this.setSpeechRecognitionActive(true)
    }

    this.recognition.onend = () => {
        this.setSpeechRecognitionActive(false)
    }

    this.recognition.onerror = event => {
        this.setSpeechRecognitionActive(false)

        this.setStatus('speech_error', event.error)
    }
    return true
}

saveRecognitionSelection() {
    const textarea = this.elements.content

    this.recognitionSelection = {
        start: textarea.selectionStart,
        end: textarea.selectionEnd
    }

    this.recognitionText = ''
}

handleSpeechRecognitionResult(event) {
    if (!this.isRecognizing || !this.recognitionSelection) return

    let transcript = ''

    for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript
    }

    if (transcript === this.recognitionText) return

    const textarea = this.elements.content
    const start = this.recognitionSelection.start
    const end = this.recognitionSelection.end

    textarea.setRangeText(
        transcript,
        start,
        end,
        'end'
    )

    this.recognitionSelection.end = start + transcript.length
    this.recognitionText = transcript

    this.markAsChanged()
    this.updatePreview()
}

setSpeechRecognitionActive(active) {
    this.isRecognizing = active

    const microphone = this.elements.microphone

    if (!microphone) return

    microphone.classList.toggle('btn-outline-secondary', !active)
    microphone.classList.toggle('btn-danger', active)
    microphone.classList.toggle('pulse-red', active)
}

toggleSpeechRecognition() {
    if (!this.recognition) {
        this.setStatus('speech_unavailable')
        return
    }

    if (this.isRecognizing) {
        try {
            this.recognition.abort()
            this.setSpeechRecognitionActive(false)
        } catch (error) {
            this.setSpeechRecognitionActive(false)

            console.error(
                '[MarkdownEditor]: Erro ao interromper o reconhecimento:',
                error
            )
        }

        return
    }

    this.saveRecognitionSelection()

    this.setSpeechRecognitionActive(true)

    try {
        this.recognition.start()
    } catch (error) {
        this.setSpeechRecognitionActive(false)

        console.error(
            '[MarkdownEditor]: Erro ao iniciar o reconhecimento:',
            error
        )

        this.setStatus('speech_start_error', error.message)
    }
}

  
    bindEvents() {
        const {
            title,
            summary,
            summaryRestore,
            content,
            tags,
            toolbar,
            addImage,
            imageInput,
            microphone,
            fontSize,
            previewToggle,
            previewClose,
            saveDraft,
            openDraft,
            generate
        } = this.elements

        title.addEventListener('input', () => this.markAsChanged())

        summary.addEventListener('input', () => {
            this.summaryManual = true
            this.markAsChanged()
        })

        summaryRestore.addEventListener('click', () => {
            this.summaryManual = false
            summary.value = this.autoSummary
            this.markAsChanged()
        })

        content.addEventListener('input', () => {
            this.markAsChanged()
            this.updatePreview()
        })

        tags.addEventListener('input', () => this.markAsChanged())

        // Botões da toolbar não tiram o foco do textarea,
        // exceto o botão de pré-visualização.
        toolbar.addEventListener('mousedown', event => {
            const button = event.target.closest('button')

            if (button && button.id !== 'post-preview-toggle') {
                event.preventDefault()
            }
        })

        content.addEventListener('beforeinput', event => {
            this.handleEnter(event)
        })

        toolbar.addEventListener('click', event => {
            const button = event.target.closest('[data-editor-action]')

            if (!button || !toolbar.contains(button)) return

            const action = button.dataset.editorAction

            if (action === 'image') return

            this.applyToolbarAction(action, button)
        })

        addImage.addEventListener('click', () => {
            imageInput.click()
        })

        imageInput.addEventListener('change', event => {
            this.insertImages(event.target.files)
            imageInput.value = ''
        })

        microphone.addEventListener('click', () => {
            this.toggleSpeechRecognition()
        })

        fontSize.addEventListener('change', () => {
            this.applyFontSize(fontSize.value)
        })

        previewToggle.addEventListener('click', () => {
            this.togglePreview()
        })

        previewClose.addEventListener('click', () => {
            this.togglePreview(false)
        })

        saveDraft.addEventListener('click', () => {
            this.saveDraft()
        })

        openDraft.addEventListener('click', () => {
            this.loadSelectedDraft()
        })

        generate.addEventListener('click', () => {
            this.generatePost()
        })
    }

    togglePreview(visible = !this.previewVisible) {
        const {
            previewPanel,
            previewToggle
        } = this.elements

        this.previewVisible = visible

        previewPanel.hidden = !this.previewVisible

        previewToggle.setAttribute(
            'aria-expanded',
            String(this.previewVisible)
        )

        previewToggle.classList.toggle(
            'active',
            this.previewVisible
        )

        if (!this.previewVisible) {
            previewToggle.focus()
        }
    }

    applyToolbarAction(action, button) {
        const textarea = this.elements.content

        const actions = {
            bold: () => this.toggleInline('**'),
            italic: () => this.toggleInline('*'),
            strike: () => this.toggleInline('~~'),

            heading: () => {
                const level = Number(button.dataset.level)

                if (level < 1 || level > 6) return

                this.toggleHeading(level)
            },

            'unordered-list': () => this.toggleList(false),
            'ordered-list': () => this.toggleList(true),
            quote: () => this.toggleQuote(),

            link: () => {
                const selected = textarea.value.substring(
                    textarea.selectionStart,
                    textarea.selectionEnd
                )

                const label = selected || 'texto do link'

                this.replaceSelection(
                    '[',
                    '](https://)',
                    label
                )
            },

            code: () => {
                this.insertCode()
            }
        }

        if (actions[action]) {
            actions[action]()
        }

        textarea.focus()
    }

    applyEdit(start, end, text, selStart = start + text.length, selEnd = selStart) {
        const textarea = this.elements.content

        this._editing = true

        try {
            textarea.focus()
            textarea.setSelectionRange(start, end)

            let done = false

            try {
                done = text === ''
                    ? document.execCommand('delete')
                    : document.execCommand('insertText', false, text)
            } catch (error) {
                done = false
            }

            if (
                !done ||
                textarea.value.slice(start, start + text.length) !== text
            ) {
                textarea.setRangeText(text, start, end, 'end')
                this.markAsChanged()
                this.updatePreview()
            }

            textarea.setSelectionRange(selStart, selEnd)
                  } finally {
            this._editing = false
        }
    }

    replaceSelection(before, after, placeholder = '') {
        const textarea = this.elements.content

        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        const selected = textarea.value.substring(start, end)
        const text = selected || placeholder

        this.applyEdit(
            start,
            end,
            before + text + after,
            start + before.length,
            start + before.length + text.length
        )
    }

    toggleInline(marker) {
        const textarea = this.elements.content
        const value = textarea.value

        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        const size = marker.length

        const selected = value.slice(start, end)

        const notBold = marker !== '*' || (
            value[start - 2] !== '*' && value[end + 1] !== '*'
        )

        const outside =
            start - size >= 0 &&
            value.slice(start - size, start) === marker &&
            value.slice(end, end + size) === marker &&
            notBold

        if (outside) {
            this.applyEdit(
                start - size,
                end + size,
                selected,
                start - size,
                end - size
            )
            return
        }

        const inside =
            selected.length >= size * 2 &&
            selected.startsWith(marker) &&
            selected.endsWith(marker) &&
            (marker !== '*' || !selected.startsWith('**'))

        if (inside) {
            const unwrapped = selected.slice(
                size,
                selected.length - size
            )

            this.applyEdit(
                start,
                end,
                unwrapped,
                start,
                start + unwrapped.length
            )
            return
        }

        this.applyEdit(
            start,
            end,
            marker + selected + marker,
            start + size,
            end + size
        )
    }

    getLineBlock() {
        const textarea = this.elements.content
        const value = textarea.value
        const start = textarea.selectionStart

        let end = textarea.selectionEnd

        if (end > start && value[end - 1] === '\n') end--

        const lineStart = start === 0
            ? 0
            : value.lastIndexOf('\n', start - 1) + 1

        let lineEnd = value.indexOf('\n', end)

        if (lineEnd === -1) lineEnd = value.length

        const lines = value.slice(lineStart, lineEnd).split('\n')
        const hasText = lines.some(line => line.trim())

        const targets = lines.map(line => hasText ? !!line.trim() : false)

        if (!hasText) targets[0] = true

        return { lineStart, lineEnd, lines, targets }
    }

    transformLines(mapper) {
        const textarea = this.elements.content

        const { lineStart, lineEnd, lines, targets } = this.getLineBlock()

        const { lines: result, blankBefore } = mapper(lines, targets)

        let text = result.join('\n')
        let offset = 0

        if (blankBefore && lineStart > 0) {
            const previous = textarea.value
                .slice(0, lineStart - 1)
                .split('\n')
                .pop()

            const isListLine = /^[ \t]*([-*+]|\d+[.)])[ \t]+/.test(previous)

            if (previous.trim() && !isListLine) {
                text = '\n' + text
                offset = 1
            }
        }

        const blockStart = lineStart + offset
        const blockEnd = lineStart + text.length

        if (result.length === 1) {
            this.applyEdit(lineStart, lineEnd, text, blockEnd)
        } else {
            this.applyEdit(lineStart, lineEnd, text, blockStart, blockEnd)
        }
    }

    toggleHeading(level) {
        const prefix = '#'.repeat(level) + ' '

        this.transformLines((lines, targets) => {
            const same = lines.every(
                (line, i) => !targets[i] || line.startsWith(prefix)
            )

            return {
                blankBefore: false,

                lines: lines.map((line, i) => {
                    if (!targets[i]) return line

                    const bare = line.replace(/^#{1,6}[ \t]+/, '')

                    return same ? bare : prefix + bare
                })
            }
        })
    }

    toggleList(ordered) {
        const own = ordered
            ? /^[ \t]*\d+[.)][ \t]+/
            : /^[ \t]*[-*+][ \t]+/

        const any = /^[ \t]*([-*+]|\d+[.)])[ \t]+/

        this.transformLines((lines, targets) => {
            const same = lines.every(
                (line, i) => !targets[i] || own.test(line)
            )

            let number = 0

            return {
                blankBefore: !same,

                lines: lines.map((line, i) => {
                    if (!targets[i]) return line

                    const bare = line.replace(any, '')

                    if (same) return bare

                    number++

                    return (ordered ? number + '. ' : '- ') + bare
                })
            }
        })
    }

    toggleQuote() {
        this.transformLines((lines, targets) => {
            const same = lines.every(
                (line, i) => !targets[i] || /^>/.test(line)
            )

            return {
                blankBefore: false,

                lines: lines.map((line, i) => {
                    if (!targets[i]) return line

                    return same
                        ? line.replace(/^>[ \t]?/, '')
                        : '> ' + line
                })
            }
        })
    }

    handleEnter(event) {
        if (this._editing) return

        if (
            event.inputType !== 'insertLineBreak' &&
            event.inputType !== 'insertParagraph'
        ) return

        const textarea = this.elements.content

        if (textarea.selectionStart !== textarea.selectionEnd) return

        const value = textarea.value
        const position = textarea.selectionStart

        const lineStart = position === 0
            ? 0
            : value.lastIndexOf('\n', position - 1) + 1

        let lineEnd = value.indexOf('\n', position)

        if (lineEnd === -1) lineEnd = value.length

        if (position !== lineEnd) return

        const line = value.slice(lineStart, lineEnd)

        const match = line.match(
            /^([ \t]*)(?:(>[ \t]?)|([-*+])[ \t]+|(\d+)([.)])[ \t]+)(.*)$/
        )

        if (!match) return

        const [, indent, quote, bullet, number, delimiter, rest] = match

        event.preventDefault()

        if (!rest.trim()) {
            this.applyEdit(lineStart, lineEnd, '', lineStart)
            return
        }

        const next = quote
            ? indent + quote
            : bullet
                ? indent + bullet + ' '
                : indent + (Number(number) + 1) + delimiter + ' '

        this.applyEdit(position, position, '\n' + next)
    }

    insertCode() {
        const textarea = this.elements.content

        const start = textarea.selectionStart
        const end = textarea.selectionEnd

        const selected = textarea.value.substring(start, end)
        const code = selected || 'código'

        const replacement = '\n```\n' + code + '\n```\n'

        textarea.setRangeText(
            replacement,
            start,
            end,
            'select'
        )

        textarea.focus()

        this.markAsChanged()
        this.updatePreview()
    }

    applyFontSize(size) {
        const allowedSizes = [
            '12px',
            '14px',
            '16px',
            '18px',
            '20px',
            '24px',
            '28px',
            '32px'
        ]

        if (!allowedSizes.includes(size)) return

        this.replaceSelection(
            '<span style="font-size: ' + size + ';">',
            '</span>',
            'texto'
        )

        this.elements.content.focus()
    }
      markAsChanged() {
        this.hasChanges = true
        this.setStatus('pending_changes')
    }

    startAutoSaveTimer() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer)
        }

        this.autoSaveTimer = setInterval(() => {
            if (this.hasChanges) {
                this.autoSave()
            }
        }, this.autoSaveInterval)
    }

    getEditorData() {
        return {
            title: this.elements.title.value.trim(),
            summary: this.elements.summary.value.trim(),
            content: this.elements.content.value,

            tags: this.elements.tags.value
                .split(',')
                .map(tag => tag.trim())
                .filter(Boolean),

            readingTime: this.readingTime
        }
    }



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
            const markdown = []
            const originalSize = list.reduce(
                (total, file) => total + file.size,
                0
            )

            let processedSize = 0

            for (const selectedFile of list) {
                let file = selectedFile

                try {
                    file = await this.imageProcessor.process(selectedFile)
                } catch (error) {
                    console.warn(
                        '[MarkdownEditor]: Falha no processamento da imagem; usando o original.',
                        error
                    )

                    file = selectedFile
                }

                if (!(file instanceof Blob)) {
                    file = selectedFile
                }

                processedSize += file.size

                const hash = await this.hashFile(file)

                await this._enqueue(async () => {
                    const key = IMAGE_PREFIX + hash

                    const exists = await this.db.read({
                        tbn: DRAFTS_STORE,
                        tbk: key
                    })

                    if (exists) return

                    await this.db.create([{
                        tbn: DRAFTS_STORE,
                        tbk: key,
                        tbv: {
                            kind: 'image',
                            name: file.name || selectedFile.name,
                            type: file.type || selectedFile.type,
                            size: file.size,
                            blob: file,
                            createdAt: new Date().toISOString()
                        }
                    }])
                })

                if (!this.mediaURLs.has(hash)) {
                    this.mediaURLs.set(
                        hash,
                        URL.createObjectURL(file)
                    )
                }

                const alt = selectedFile.name
                    .replace(/\.[^.]+$/, '')
                    .replace(/[\[\]()<>]/g, ' ')
                    .trim() || 'imagem'

                markdown.push(`![${alt}](media:${hash})`)
            }

            const textarea = this.elements.content

            this.applyEdit(
                textarea.selectionStart,
                textarea.selectionEnd,
                '\n' + markdown.join('\n') + '\n'
            )

            if (processedSize < originalSize) {
                const formatSize = size => size >= 1048576
                    ? (size / 1048576).toFixed(2) + ' MB'
                    : (size / 1024).toFixed(1) + ' KB'

                this.setStatus('images_optimized', formatSize(originalSize), formatSize(processedSize))
            } else {
                this.setStatus('images_added')
            }
        } catch (error) {
            console.error(
                '[MarkdownEditor]: Erro ao guardar imagem:',
                error
            )

            this.setStatus('image_save_error')
        } finally {
            this._pendingInserts--
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
            } catch (error) {
                // Usa o hash simples abaixo
            }
        }

        const bytes = new Uint8Array(buffer)

        let h1 = 0xdeadbeef
        let h2 = 0x41c6ce57

        for (let i = 0; i < bytes.length; i++) {
            h1 = Math.imul(h1 ^ bytes[i], 2654435761)
            h2 = Math.imul(h2 ^ bytes[i], 1597334677)
        }

        h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
             Math.imul(h2 ^ (h2 >>> 13), 3266489909)

        h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
             Math.imul(h1 ^ (h1 >>> 13), 3266489909)

        return 'f' +
            (h2 >>> 0).toString(16).padStart(8, '0') +
            (h1 >>> 0).toString(16).padStart(8, '0') +
            '-' + bytes.length
    }

    async loadMedia(hashes) {
        if (!this.db) return

        let changed = false

        for (const hash of hashes) {
            if (this.mediaLoading.has(hash)) continue

            this.mediaLoading.add(hash)

            try {
                const record = await this.db.read({
                    tbn: DRAFTS_STORE,
                    tbk: IMAGE_PREFIX + hash
                })

                if (record && record.blob) {
                    this.mediaURLs.set(
                        hash,
                        URL.createObjectURL(record.blob)
                    )

                    changed = true
                } else {
                    this.mediaMissing.add(hash)
                }
            } catch (error) {
                this.mediaMissing.add(hash)
            } finally {
                this.mediaLoading.delete(hash)
            }
        }

        if (changed) this.updatePreview()
    }

    releaseMedia() {
        this.objectURLs.forEach(url => {
            URL.revokeObjectURL(url)
        })

        this.objectURLs = []

        this.mediaURLs.forEach(url => {
            URL.revokeObjectURL(url)
        })

        this.mediaURLs.clear()
        this.mediaLoading.clear()
        this.mediaMissing.clear()
    }

    async loadMarkdownLib() {
        try {
            const { loadMarkdown } = await import('../lib/MarkdownKit.mjs')

            this.markdown = await loadMarkdown()

            this.updatePreview()
        } catch (error) {
            console.error(
                '[MarkdownEditor]: Erro ao carregar o Markdown WASM:',
                error
            )

            this.setStatus('markdown_load_error')
        }
    }

    async updatePreview() {
        if (
            !this.markdown ||
            !this.elements.content ||
            !this.elements.preview
        ) return

        const run = ++this.previewRun
        const missing = new Set()

        const content = this.elements.content.value.replace(
            /\]\(media:([A-Za-z0-9_-]+)\)/g,
            (match, hash) => {
                const url = this.mediaURLs.get(hash)

                if (url) return '](' + url + ')'

                if (!this.mediaMissing.has(hash)) missing.add(hash)

                return '](' + BLANK_IMAGE + ')'
            }
        )

        let html

        try {
            html = await this.markdown.renderMarkdown(content, {
                extensions: PREVIEW_EXTENSIONS
            })
        } catch (error) {
            console.error(
                '[MarkdownEditor]: Erro na pré-visualização:',
                error
            )
            return
        }

        if (run !== this.previewRun) return

        this.elements.preview.innerHTML = html

        this.updateDerivedMetadata()

        if (missing.size) this.loadMedia([...missing])
    }

    buildAutomaticSummary() {
        const preview = this.elements.preview

        if (!preview) return ''

        const text = (preview.textContent || '')
            .replace(/\s+/g, ' ')
            .trim()

        if (!text) return ''

        const limit = 160

        if (text.length <= limit) return text

        const excerpt = text.slice(0, limit + 1)
        const lastSpace = excerpt.lastIndexOf(' ')

        return (
            lastSpace > 0
                ? excerpt.slice(0, lastSpace)
                : excerpt.slice(0, limit)
        ).trim()
    }

    updateDerivedMetadata() {
        const preview = this.elements.preview

        if (!preview) return

        const text = (preview.textContent || '')
            .replace(/\s+/g, ' ')
            .trim()

        const words = text
            ? text.split(/\s+/).length
            : 0

        this.readingTime = Math.max(
            1,
            Math.ceil(words / 200)
        )

        this.autoSummary = this.buildAutomaticSummary()

              if (!this.summaryManual) {
            this.elements.summary.value = this.autoSummary
        }
    }

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
            console.warn(
                '[MarkdownEditor]: conexão com o banco não informada.'
            )

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
            !draft.content.trim() &&
            !draft.tags.length &&
            !draft.summary

        try {
            await this._enqueue(() => empty
                ? this.db.delete({
                    tbn: DRAFTS_STORE,
                    tbk: AUTOSAVE_KEY
                })
                : this.db.create([{
                    tbn: DRAFTS_STORE,
                    tbk: AUTOSAVE_KEY,
                    tbv: { kind: 'autosave', ...draft }
                }])
            )

            if (!this.hasChanges) {
                this.setStatus('autosave_ok')
            }

            return true
        } catch (error) {
            this.hasChanges = true

            console.error(
                '[MarkdownEditor]: Erro no autosave:',
                error
            )

            this.setStatus('autosave_error')

            return false
        }
    }

    message(id, ...args) {

        let bank = this.root
            ? this.root.querySelector(`[data-msg="${id}"]`)
            : null

        // Se a faixa ainda não foi traduzida, pede a tradução antes de ler.
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

        if (!data.title && !data.content.trim()) {
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
                const previous = await this.db.read({
                    tbn: DRAFTS_STORE,
                    tbk: key
                })

                const now = new Date().toISOString()

                await this.db.create([{
                    tbn: DRAFTS_STORE,
                    tbk: key,
                    tbv: {
                        kind: 'draft',
                        title: data.title,
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
            console.error(
                '[MarkdownEditor]: Erro ao salvar o rascunho:',
                error
            )

            this.setStatus('draft_save_error')

            return false
        }
    }

    async restoreAutoSave() {
        if (!this.db) return false

        try {
            const draft = await this.db.read({
                tbn: DRAFTS_STORE,
                tbk: AUTOSAVE_KEY
            })

            if (!draft || typeof draft !== 'object' || this.hasChanges) {
                return false
            }

            const hasContent =
                draft.title ||
                draft.content ||
                (draft.tags && draft.tags.length) ||
                draft.summary

            if (!hasContent) return false

            this.restoreDraftData(draft)

            this.setStatus('changes_recovered')

            return true
        } catch (error) {
            console.error(
                '[MarkdownEditor]: Erro ao recuperar autosave:',
                error
            )

            return false
        }
    }

    async loadDraftList(selected = '') {
        const select = this.elements.draftList

        if (!select || !this.db) return

        try {
            const rows = await this.db.read({
                tbn: DRAFTS_STORE,
                method: 'like',
                tbk: DRAFT_PREFIX
            })

            rows.sort((a, b) => String(b.value?.updatedAt || '')
                .localeCompare(String(a.value?.updatedAt || '')))

            select.innerHTML = ''

            const first = document.createElement('option')

            first.value = ''
            first.textContent = 'Selecionar rascunho'

            select.appendChild(first)

            rows.forEach(({ key, value }) => {
                const option = document.createElement('option')

                option.value = key
                option.textContent =
                    (value && value.title) || this.message('draft_untitled')

                select.appendChild(option)
            })

            select.value = selected || this.currentDraftKey || ''
        } catch (error) {
            console.error(
                '[MarkdownEditor]: Erro ao carregar lista de rascunhos:',
                error
            )
        }
    }

    async loadSelectedDraft() {
        const key = this.elements.draftList.value

        if (!key) {
            this.setStatus('draft_select')
            return false
        }

        try {
            const draft = await this.db.read({
                tbn: DRAFTS_STORE,
                tbk: key
            })

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
            console.error(
                '[MarkdownEditor]: Erro ao abrir o rascunho:',
                error
            )

            this.setStatus('draft_open_error')

            return false
        }
    }
      async cleanupImages() {
        if (!this.db || this._pendingInserts > 0) return 0

        try {
            return await this._enqueue(async () => {
                if (this._pendingInserts > 0) return 0

                const [images, drafts, auto] = await Promise.all([
                    this.db.read({
                        tbn: DRAFTS_STORE,
                        method: 'like',
                        tbk: IMAGE_PREFIX
                    }),
                    this.db.read({
                        tbn: DRAFTS_STORE,
                        method: 'like',
                        tbk: DRAFT_PREFIX
                    }),
                    this.db.read({
                        tbn: DRAFTS_STORE,
                        tbk: AUTOSAVE_KEY
                    })
                ])

                const used = new Set()

                const scan = text => {
                    for (const match of String(text || '').matchAll(MEDIA_REF)) {
                        used.add(match[1])
                    }
                }

                drafts.forEach(item => scan(item.value && item.value.content))

                if (auto) scan(auto.content)

                scan(this.elements.content && this.elements.content.value)

                const stale = images.filter(
                    item => !used.has(item.key.slice(IMAGE_PREFIX.length))
                )

                if (!stale.length) return 0

                await this.db.delete(stale.map(item => ({
                    tbn: DRAFTS_STORE,
                    tbk: item.key
                })))

                stale.forEach(item => {
                    const hash = item.key.slice(IMAGE_PREFIX.length)
                    const url = this.mediaURLs.get(hash)

                    if (url) URL.revokeObjectURL(url)

                    this.mediaURLs.delete(hash)
                })

                return stale.length
            })
        } catch (error) {
            console.error(
                '[MarkdownEditor]: Erro na limpeza de imagens:',
                error
            )

            return 0
        }
    }

    restoreDraftData(draft) {
        this.elements.title.value = draft.title || ''
        this.elements.content.value = draft.content || ''
        this.elements.summary.value = draft.summary || ''

        this.summaryManual = draft.summaryManual === true

        this.elements.tags.value = Array.isArray(draft.tags)
            ? draft.tags.join(', ')
            : (draft.tags || '')

        this.updatePreview()
    }


async prepareImages(markdown) {
    const hashes = [
        ...new Set(
            [...String(markdown).matchAll(MEDIA_REF)]
                .map(match => match[1])
        )
    ]

    if (!hashes.length) {
        return {
            markdown,
            images: []
        }
    }

    if (!this.db) {
        throw new Error(
            'Banco de dados indisponível para recuperar as imagens.'
        )
    }

    const images = []
    let preparedMarkdown = String(markdown)

    const extensions = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
        'image/avif': 'avif',
        'image/bmp': 'bmp'
    }

    for (const hash of hashes) {
        const record = await this.db.read({
            tbn: DRAFTS_STORE,
            tbk: IMAGE_PREFIX + hash
        })

        if (!record || !record.blob) {
            throw new Error(
                `A imagem ${hash} não foi encontrada no armazenamento local.`
            )
        }

        const type = record.type || record.blob.type || ''
        const extension = extensions[type] || 'bin'

        const path = `assets/posts/images/${hash}.${extension}`

        images.push({
            path,
            file: record.blob
        })

        const reference = new RegExp(
            '\\]\\(media:' + hash + '\\)',
            'g'
        )

        preparedMarkdown = preparedMarkdown.replace(
            reference,
            `](${path})`
        )
    }

    return {
        markdown: preparedMarkdown,
        images
    }
}


    resetEditor() {
        this.elements.title.value = ''
        this.elements.summary.value = ''
        this.elements.content.value = ''
        this.elements.tags.value = ''
        this.elements.imageInput.value = ''

        this.summaryManual = false
        this.autoSummary = ''
        this.readingTime = 1

        this.currentDraftKey = null
        this.hasChanges = false

        this.previewVisible = false
        this.elements.previewPanel.hidden = true

        this.elements.previewToggle.setAttribute(
            'aria-expanded',
            'false'
        )

        this.elements.previewToggle.classList.remove('active')

        this.elements.draftList.value = ''

        this.updatePreview()
        this.releaseMedia()

        this.setStatus('editor_ready_new')
    }

    async confirmPublication() {
        this.resetEditor()

        if (this.db) {
            try {
                await this._enqueue(() => this.db.delete({
                    tbn: DRAFTS_STORE,
                    tbk: AUTOSAVE_KEY
                }))
            } catch (error) {
                console.error(
                    '[MarkdownEditor]: Erro ao limpar autosave:',
                    error
                )
            }
        }

        await this.cleanupImages()

        return true
    }


    async generatePost() {
        // Bloqueia chamadas repetidas enquanto a publicação está em andamento.
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
            const initialData = this.getEditorData()

            if (!initialData.title) {
                this.setStatus('need_title')
                this.elements.title.focus()
                return false
            }

            if (!initialData.content.trim()) {
                this.setStatus('need_content')
                this.elements.content.focus()
                return false
            }

            let stage = 'stage_init'

            this.setStatus('preparing')

            try {
                if (this.markdownReady) {
                    stage = 'stage_library'
                    await this.markdownReady
                }

                stage = 'stage_preview'
                await this.updatePreview()

                stage = 'stage_read'
                const data = this.getEditorData()

                stage = 'stage_autosave'
                await this.autoSave()

                stage = 'stage_images'
                const prepared = await this.prepareImages(data.content)

                stage = 'stage_files'
                const post = await this.postManager.createPost({
                    title: data.title,
                    summary: data.summary,
                    readingTime: data.readingTime,
                    content: prepared.markdown,
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

                return {
                    published: false,
                    post
                }

            } catch (error) {
                const errorName = error?.name || 'Error'
                const errorMessage = error?.message || String(error)

                try {
                    console.error(
                        '[MarkdownEditor] Falha na publicação:',
                        {
                            stage,
                            name: errorName,
                            message: errorMessage,
                            stack: error?.stack || 'Pilha indisponível'
                        }
                    )
                } catch {
                    // O diagnóstico visual não depende do console.
                }

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

        if (this.hasChanges) {
            this.autoSave()
        }

        this.releaseMedia()

        this.isMounted = false
    }
}

export { MarkdownEditor }

export default MarkdownEditor