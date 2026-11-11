
/**
 * LazyLoad - 'wraper' to lazy-load with `IntersectionObserver()`
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2020 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */

// utils
const _ = {
    typeOf(o) {
        return Object.prototype.toString.call(o)
    },
    isObject(obj) {
        return obj !== null && typeof obj === 'object'
    },
    isUndefined(arg) {
        return arg === void 0
    },
    isElement(obj) {
        return obj instanceof Element
    },
    isNodeList(list) {
        return (
            list instanceof NodeList ||
            list instanceof HTMLCollection ||
            (
                _.isObject(list) &&
                !_.isUndefined(list.length) &&
                typeof list.item === 'function'
            )
        )
    },
    isString(str) {
        return typeof str === 'string'
    },
    isArray(obj) {
        return Array.isArray(obj)
    }
}

class LazyImage {
    constructor(container, margin) {
        // container: Element | undefined (viewport) | selector string
        if (_.isElement(container)) {
            this.container = container
        } else if (_.isString(container) && container.trim() !== '') {
            this.container = document.querySelector(container) || null
        } else {
            this.container = null
        }

        // margin: string ("0px 0px 200px 0px") or number (px)
        if (typeof margin === 'number' && Number.isFinite(margin)) {
            this.margin = `${margin}px`
        } else if (_.isString(margin) && margin.trim() !== '') {
            this.margin = margin
        } else {
            this.margin = '0px 0px 200px 0px'
        }

        this.options = {
            root: this.container,
            rootMargin: this.margin
        }

        /**
         * @description - native "loading" attribute detection
         * @support - {@link https://caniuse.com/#feat=loading-lazy-attr}
         * @type { Boolean }
         */
        this.nativelazy = ('loading' in HTMLImageElement.prototype)

        /** @type {IntersectionObserver|null} */
        this.observer = null

        // Keep track of elements already registered.
        this.observed = new Set()
    }

    /**
     * Normalize a request into an iterable of Elements.
     *
     * When an Element is received, it is treated as
     * a container: the element itself and its descendants
     * matching [data-lazy-target] are collected.
     *
     * @param {NodeList|HTMLCollection|Array|Element|string|false} request
     * @returns {Element[]}
     * @private
     */
    _normalize(request) {
        let targets = []

        // Element: include itself when it matches,
        // and also search its descendants.
        if (_.isElement(request)) {
            if (request.matches('[data-lazy-target]')) {
                targets.push(request)
            }

            targets.push(
                ...request.querySelectorAll('[data-lazy-target]')
            )
        }

        // NodeList, HTMLCollection or Array.
        else if (_.isNodeList(request) || _.isArray(request)) {
            targets = Array.from(request)
        }

        // CSS selector.
        else if (_.isString(request) && request.trim() !== '') {
            targets = Array.from(
                document.querySelectorAll(request)
            )
        }

        // Keep only valid Elements and remove duplicates.
        return [...new Set(
            targets.filter(target => _.isElement(target))
        )]
    }

    /**
     * Create the IntersectionObserver only once.
     * @private
     */
    _createObserver() {
        if (this.observer) return

        this.observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                const target = entry.target

                switch (true) {

                    // image
                    case (target instanceof HTMLImageElement): {
                        if (
                            !entry.isIntersecting ||
                            target.classList.contains('lazy-isloaded')
                        ) {
                            break
                        }

                        // Native lazy loading.
                        if (
                            this.nativelazy &&
                            target.getAttribute('loading') === 'lazy'
                        ) {
                            target.classList.add('lazy-isloaded')
                            observer.unobserve(target)
                            this.observed.delete(target)
                            break
                        }

                        if (!_.isUndefined(target.dataset.src)) {
                            target.src = target.dataset.src
                        }

                        if (!_.isUndefined(target.dataset.srcset)) {
                            target.srcset = target.dataset.srcset
                        }

                        if (!_.isUndefined(target.dataset.sizes)) {
                            target.sizes = target.dataset.sizes
                        }

                        target.classList.add('lazy-isloaded')
                        observer.unobserve(target)
                        this.observed.delete(target)
                        break
                    }

                    // video
                    case (target instanceof HTMLVideoElement): {
                        // @todo: implement
                        break
                    }

                    // iframe
                    case (target instanceof HTMLIFrameElement): {
                        // @todo: implement
                        break
                    }

                    // container with template
                    case (
                        target instanceof HTMLElement &&
                        /^(SECTION|DIV|ASIDE|FOOTER)$/.test(target.tagName)
                    ): {
                        if (
                            !entry.isIntersecting ||
                            target.classList.contains('lazy-isloaded')
                        ) {
                            break
                        }

                        const tpl = target.firstElementChild

                        if (tpl && tpl.tagName === 'TEMPLATE') {
                            const node = document.importNode(tpl.content, true)

                            tpl.remove()
                            target.appendChild(node)
                        }

                        target.classList.add('lazy-isloaded')
                        observer.unobserve(target)
                        this.observed.delete(target)
                        break
                    }
                }
            })
        }, this.options)
    }

    /**
     * Observe elements and lazy-load them when they intersect the root.
     *
     * Accepts:
     * - Element: searches itself and its descendants for [data-lazy-target].
     * - NodeList / HTMLCollection / Array: observes the supplied elements.
     * - String: uses the string as a CSS selector.
     *
     * @param {NodeList|HTMLCollection|Array|Element|string} request
     */
    observe(request = false) {
        const targets = this._normalize(request)

        if (targets.length === 0) {
            return
        }

        this._createObserver()

        targets.forEach(target => {
            // Ignore elements already loaded or already registered.
            if (
                target.classList.contains('lazy-isloaded') ||
                this.observed.has(target)
            ) {
                return
            }

            this.observer.observe(target)
            this.observed.add(target)
        })
    }

    /**
     * Stop observing everything.
     */
    disconnect() {
        if (this.observer) {
            this.observer.disconnect()
            this.observer = null
        }

        this.observed.clear()
    }
}

export default LazyImage
