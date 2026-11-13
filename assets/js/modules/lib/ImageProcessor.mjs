
/**
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2026 Subversivo58
 *
 * @file ImageProcessor.mjs
 * @description Processamento local e independente de imagens no navegador.
 */

class ImageProcessor {
    constructor(options = {}) {
        this.options = {
            auto: false,
            maxLandscapeWidth: 1280,
            maxPortraitHeight: 960,
            maxSquareSize: 800,
            quality: 0.78,
            ...options
        }

        this.options.auto = options.auto === true
    }

    async process(file) {
        if (!this.options.auto) return file

        return this.optimize(file)
    }

    async optimize(file) {
        if (!(file instanceof Blob)) return file

        const type = this.getType(file)

        if (!['image/jpeg', 'image/webp'].includes(type)) {
            return file
        }

        if (
            type === 'image/webp' &&
            await this.isAnimatedWebP(file)
        ) {
            return file
        }

        try {
            return await this.render(file, {
                format: 'image/webp',
                resize: true,
                quality: this.options.quality
            })
        } catch (error) {
            console.warn(
                '[ImageProcessor]: Não foi possível otimizar a imagem.',
                error
            )

            return file
        }
    }

    async resize(file) {
        const type = this.getType(file)

        if (!['image/jpeg', 'image/webp'].includes(type)) {
            return file
        }

        if (
            type === 'image/webp' &&
            await this.isAnimatedWebP(file)
        ) {
            return file
        }

        try {
            return await this.render(file, {
                format: type,
                resize: true,
                quality: this.options.quality
            })
        } catch (error) {
            console.warn('[ImageProcessor]: Falha ao redimensionar.', error)
            return file
        }
    }

    async compress(file) {
        const type = this.getType(file)

        if (!['image/jpeg', 'image/webp'].includes(type)) {
            return file
        }

        if (
            type === 'image/webp' &&
            await this.isAnimatedWebP(file)
        ) {
            return file
        }

        try {
            return await this.render(file, {
                format: type,
                resize: false,
                quality: this.options.quality
            })
        } catch (error) {
            console.warn('[ImageProcessor]: Falha ao comprimir.', error)
            return file
        }
    }

    async convert(file, format) {
        const sourceType = this.getType(file)
        const targetType = this.normalizeType(format)

        if (
            !['image/jpeg', 'image/webp'].includes(sourceType) ||
            !['image/jpeg', 'image/webp'].includes(targetType)
        ) {
            return file
        }

        if (
            sourceType === 'image/webp' &&
            await this.isAnimatedWebP(file)
        ) {
            return file
        }

        try {
            return await this.render(file, {
                format: targetType,
                resize: false,
                quality: this.options.quality
            })
        } catch (error) {
            console.warn('[ImageProcessor]: Falha na conversão.', error)
            return file
        }
    }

    async render(file, options = {}) {
        if (typeof createImageBitmap !== 'function') {
            return file
        }

        const bitmap = await createImageBitmap(file)

        try {
            const originalWidth = bitmap.width
            const originalHeight = bitmap.height

            const dimensions = options.resize
                ? this.getDimensions(originalWidth, originalHeight)
                : {
                    width: originalWidth,
                    height: originalHeight
                }

            const canvas = document.createElement('canvas')

            canvas.width = dimensions.width
            canvas.height = dimensions.height

            const context = canvas.getContext('2d', {
                alpha: true
            })

            if (!context) return file

            context.imageSmoothingEnabled = true
            context.imageSmoothingQuality = 'high'

            context.drawImage(
                bitmap,
                0,
                0,
                dimensions.width,
                dimensions.height
            )

            const blob = await new Promise(resolve => {
                canvas.toBlob(
                    resolve,
                    options.format,
                    options.quality
                )
            })

            if (!blob || blob.size >= file.size) {
                return file
            }

            const extension = options.format === 'image/webp'
                ? 'webp'
                : 'jpg'

            const name = this.replaceExtension(
                file.name || 'image',
                extension
            )

            return new File(
                [blob],
                name,
                {
                    type: options.format,
                    lastModified: file.lastModified || Date.now()
                }
            )
        } finally {
            bitmap.close()
        }
    }

    getDimensions(width, height) {
        let maxWidth = width
        let maxHeight = height

        if (width === height) {
            maxWidth = this.options.maxSquareSize
            maxHeight = this.options.maxSquareSize
        } else if (width > height) {
            maxWidth = this.options.maxLandscapeWidth
        } else {
            maxHeight = this.options.maxPortraitHeight
        }

        const scale = Math.min(
            1,
            maxWidth / width,
            maxHeight / height
        )

        return {
            width: Math.max(1, Math.round(width * scale)),
            height: Math.max(1, Math.round(height * scale))
        }
    }

    getType(file) {
        if (file.type) return this.normalizeType(file.type)

        const extension = String(file.name || '')
            .split('.')
            .pop()
            .toLowerCase()

        const types = {
            jpg: 'image/jpeg',
            jpeg: 'image/jpeg',
            webp: 'image/webp',
            png: 'image/png',
            gif: 'image/gif',
            svg: 'image/svg+xml'
        }

        return types[extension] || ''
    }

    normalizeType(type) {
        const value = String(type || '').toLowerCase()

        if (
            value === 'image/jpg' ||
            value === 'image/pjpeg'
        ) {
            return 'image/jpeg'
        }

        return value
    }

    replaceExtension(name, extension) {
        const base = String(name || 'image')
            .replace(/\.[^.]+$/, '')

        return base + '.' + extension
    }

    async isAnimatedWebP(file) {
        if (this.getType(file) !== 'image/webp') return false

        try {
            const buffer = await file.arrayBuffer()
            const bytes = new Uint8Array(buffer)

            if (bytes.length < 16) return false

            const readText = (start, length) => {
                return String.fromCharCode(
                    ...bytes.slice(start, start + length)
                )
            }

            if (
                readText(0, 4) !== 'RIFF' ||
                readText(8, 4) !== 'WEBP'
            ) {
                return false
            }

            let offset = 12

            while (offset + 8 <= bytes.length) {
                const chunk = readText(offset, 4)

                const size =
                    bytes[offset + 4] |
                    (bytes[offset + 5] << 8) |
                    (bytes[offset + 6] << 16) |
                    (bytes[offset + 7] << 24)

                if (chunk === 'ANIM' || chunk === 'ANMF') {
                    return true
                }

                if (size < 0 || offset + 8 + size > bytes.length) {
                    return false
                }

                offset += 8 + size + (size % 2)
            }
        } catch (error) {
            console.warn(
                '[ImageProcessor]: Não foi possível verificar a animação WebP.',
                error
            )

            return true
        }

        return false
    }
}

export { ImageProcessor }

export default ImageProcessor
