/**
 * @file ImageProcessor.mjs
 * @description Local, client-side image processing in the browser.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */
class ImageProcessor {
    /**
     * Creates an image processor.
     * @param {Object} [options={}]
     * @param {boolean} [options.auto=false] - Optimizes images automatically in process().
     * @param {number} [options.maxLandscapeWidth=1024] - Maximum width for landscape images.
     */
    constructor(options = {}) {
        this.options = {
            auto: false,
            maxLandscapeWidth: 1024,
            maxPortraitHeight: 768,
            maxSquareSize: 640,
            quality: 0.6,
            ...options
        }

        this.options.auto = options.auto === true
    }

    /**
     * Processes a file. Optimizes it only when automatic optimization is enabled.
     * @param {Blob} file
     * @return {Promise<Blob>}
     */
    async process(file) {
        if (!this.options.auto) return file

        return this.optimize(file)
    }

    /**
     * Optimizes an image by resizing and compressing it when it is a JPEG or WebP.
     * @param {Blob} file
     * @return {Promise<Blob>} The original file when it cannot be optimized.
     */
    async optimize(file) {
        if (!(file instanceof Blob)) return file

        const type = this.getType(file)

        if (!['image/jpeg', 'image/png', 'image/webp'].includes(type)) {
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
                quality: this.options.quality,
                force: type !== 'image/webp'
            })
        } catch (error) {
            console.warn(
                '[ImageProcessor]: Não foi possível otimizar a imagem.',
                error
            )

            return file
        }
    }

    /**
     * Resizes an image to the maximum width, keeping its proportions.
     * @param {Blob} file
     * @return {Promise<Blob>}
     */
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

    /**
     * Compresses a JPEG or WebP image.
     * @param {Blob} file
     * @return {Promise<Blob>}
     */
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

    /**
     * Converts an image to another format.
     * @param {Blob} file
     * @param {string} format - Target format, such as image/webp.
     * @return {Promise<Blob>}
     */
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

    /**
     * Draws an image on a canvas and exports it as a Blob.
     * @param {Blob} file
     * @param {Object} [options={}]
     * @return {Promise<Blob>} The original file when createImageBitmap is unavailable.
     */
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

            if (!blob || blob.type !== options.format) {
                return file
            }

            if (!options.force && blob.size >= file.size) {
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

    /**
     * Calculates the dimensions of an image that fits in the maximum sizes, keeping its proportions.
     * @param {number} width
     * @param {number} height
     * @return {{width: number, height: number}}
     */
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

    /**
     * Returns the normalized MIME type of a file, using its extension when the type is missing.
     * @param {File|Blob} file
     * @return {string}
     */
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

    /**
     * Normalizes a MIME type or image format name.
     * @param {string} type
     * @return {string}
     */
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

    /**
     * Replaces the extension of a file name.
     * @param {string} name
     * @param {string} extension
     * @return {string}
     */
    replaceExtension(name, extension) {
        const base = String(name || 'image')
            .replace(/\.[^.]+$/, '')

        return base + '.' + extension
    }

    /**
     * Checks whether a WebP file is animated.
     * @param {Blob} file
     * @return {Promise<boolean>} false for any file that is not WebP.
     */
    async isAnimatedWebP(file) {
        if (this.getType(file) !== 'image/webp') return false

        try {
            const buffer = await file.arrayBuffer()
            const bytes = new Uint8Array(buffer)

            if (bytes.length < 16) return false

            /**
             * Reads a string of characters from a byte array.
             * @private
             * @param {number} start - Start position.
             * @param {number} length - Number of bytes.
             * @return {string}
             */
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
