
/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 *
 * @file PostManager.mjs
 * @description Gerenciamento e identificação de postagens Markdown.
 */

import Hashids from '../vendor/Hashids/hashids-es6.mjs'

export default class PostManager {

    constructor(options = {}) {

        this.hashids = new Hashids(
            options.salt ?? 'subversivo58',
            options.minLength ?? 8
        )

        this.settingsPath =
            options.settingsPath ?? 'config/settings.json'

    }

    /**
     * Gera um identificador para a postagem.
     */
    generateID(timestamp = Date.now()) {

        return this.hashids.encode(timestamp)

    }

    /**
     * Monta o conteúdo Markdown da postagem.
     * O título é utilizado somente como metadado.
     */
    buildMarkdown({ content }) {

        return content?.trim() ?? ''

    }

    /**
     * Normaliza e remove tags duplicadas.
     */
    normalizeTags(tags = []) {

        const values = Array.isArray(tags)
            ? tags
            : String(tags).split(/\s+/)

        return [...new Set(
            values
                .map(tag => String(tag).trim().toLowerCase())
                .filter(Boolean)
        )]

    }

    /**
     * Normaliza o tempo estimado de leitura.
     */
    normalizeReadingTime(value) {

        const readingTime = Number(value)

        if (!Number.isFinite(readingTime)) {
            return 1
        }

        return Math.max(1, Math.round(readingTime))

    }

    /**
     * Organiza as imagens conforme sua ordem no Markdown.
     */
    orderImages(markdown, images = []) {

    const orderedImages = []
    const usedImages = new Set()

    const imagePattern =
        /!\[[^\]]*\]\((?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)/g

    let match

    while ((match = imagePattern.exec(markdown)) !== null) {

        const imagePath = match[1] ?? match[2]

        const image = images.find(item =>
            item.path === imagePath
        )

        if (!image || usedImages.has(image.path)) {
            continue
        }

        usedImages.add(image.path)
        orderedImages.push(image)

    }

    return orderedImages

    }

    /**
     * Carrega o settings.json atual.
     */
    async loadSettings() {

        // Usa uma URL exclusiva para impedir a reutilização de
        // settings.json por caches intermediários ou do navegador.
        const settingsURL = new URL(
            this.settingsPath,
            document.baseURI
        )

        settingsURL.searchParams.set('_', Date.now().toString())

        const response = await fetch(settingsURL, {
            cache: 'no-store'
        })

        if (!response.ok) {
            throw new Error(
                `Não foi possível carregar ${this.settingsPath}: ${response.status}`
            )
        }

        const settings = await response.json()

        if (
            !settings.articles ||
            !Array.isArray(settings.articles.storage)
        ) {
            throw new Error(
                'A estrutura articles.storage não foi encontrada ou não é um array.'
            )
        }

        return settings

    }

    /**
     * Atualiza o índice de postagens e prepara o JSON.
     */
    async prepareSettings(postMetadata, timestamp) {

        const settings = await this.loadSettings()

        // A postagem mais recente fica na primeira posição.
        settings.articles.storage.unshift(postMetadata)

        // Atualiza a data de modificação do arquivo.
        settings.last_modified = timestamp

        // Converte novamente o objeto para texto JSON.
        return JSON.stringify(settings, null, 4)

    }

    /**
     * Cria uma postagem e prepara todos os arquivos.
     */
    async createPost(data = {}) {

    // Data original de criação da postagem.
    const timestamp = Date.now()

    // Na criação, a última modificação é igual à criação.
    const lastModified = timestamp

    const id = this.generateID(timestamp)

    const markdown = this.buildMarkdown(data)

    // Organiza os arquivos pela ordem das referências Markdown.
    const imageFiles = this.orderImages(
        markdown,
        data.images ?? []
    )

    // Os caminhos das imagens já são completos.
    const images = imageFiles.map(image => image.path)

    // A primeira imagem será a capa.
    const cover = images[0] ?? null

    const tags = this.normalizeTags(data.tags ?? [])

    const summary = String(data.summary ?? '').trim()

    const readingTime = this.normalizeReadingTime(
        data.readingTime
    )

    const postMetadata = {
        id,
        title: data.title?.trim() ?? '',
        summary,
        path: `assets/posts/${id}.md`,
        cover,
        images,
        tags,
        timestamp,
        lastModified,
        readingTime
    }

    // Lê e atualiza o settings.json em memória.
    const updatedSettings = await this.prepareSettings(
        postMetadata,
        timestamp
    )

    // Prepara todos os arquivos para publicação.
    const files = [

        // Imagens na pasta exclusiva.
        ...imageFiles.map(image => ({
            path: image.path,
            content: image.file
        })),

        // Arquivo Markdown.
        {
            path: postMetadata.path,
            content: markdown
        },

        // settings.json atualizado.
        {
            path: this.settingsPath,
            content: updatedSettings
        }

    ]

    return {

        ...postMetadata,

        filename: `${id}.md`,

        markdown,

        // Arquivos File mantidos apenas em memória.
        imageFiles,

        // Lista completa pronta para a API.
        files,

        // Conteúdo JSON atualizado.
        updatedSettings

    }

}

    /**
     * Decodifica um Hash ID.
     */
    decodeID(id) {

        return this.hashids.decode(id)

    }

}

export { PostManager }
