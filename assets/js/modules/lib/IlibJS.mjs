/**
 * IlibJS - Document translator
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import _ from '../helpers/Helpers.mjs'

async function GetResource(uri, options = {}) {
    try {
        return await fetch(uri, options).then(response => response.json())
    } catch(ex) {
        return {}
    }
}

/**
 * Simple and funny Storage System in memory
 */
class MemoryStorage {
    constructor(key) {
        this.key = key
        this.resources = []
        this.dictionary = {}
        this.length = 0
    }

    add(uri, resource) {
        const index = this.resources.findIndex(item => item.uri === uri)
        const entry = { uri, resource }

        if (index >= 0) {
            this.resources[index] = entry
        } else {
            this.resources.push(entry)
        }

        this.length = this.resources.length
        return entry
    }

    put(resource) {
        this.dictionary = resource && typeof resource === 'object'
            ? resource
            : {}

        return this.dictionary
    }

    get() {
        return {
            key: this.key,
            resources: this.resources,
            dictionary: this.dictionary
        }
    }

    del(uri) {
        this.resources = this.resources.filter(item => item.uri !== uri)
        this.length = this.resources.length
        return this.length
    }

    clear() {
        this.resources = []
        this.dictionary = {}
        this.length = 0
    }
}

// MutationObserver helper.
const SpyDOM = (node, callback, options = {}) => {
    if (!node || typeof MutationObserver === 'undefined') {
        return false
    }

    const observer = new MutationObserver(callback)
    observer.observe(node, options)

    return observer
}

/**
 * Get element attribute
 * @param element {Object} - NodeType HTMLElement
 * @param attribute {String} - attribute name criteria
 */
const GetAttributeData = (element, attribute) => {
    if (_.isElement(element) && typeof attribute === 'string' && attribute) {
        return element.getAttribute(attribute)
    }

    if (_.isElement(element) && !attribute) {
        return {
            tooltip: element.getAttribute('data-i18n-tooltip'),
            place: element.getAttribute('data-i18n-place'),
            multi: element.getAttribute('data-i18n-multi'),
            title: element.getAttribute('data-i18n-title'),
            html: element.getAttribute('data-i18n-html'),
            alt: element.getAttribute('data-i18n-alt'),
            img: element.getAttribute('data-i18n-img')
        }
    }

    return false
}

/**
 * Find one word in a dictionary object.
 * Supports both direct keys and dot-separated paths.
 */
const FindWord = (expression, language) => {
    if (
        typeof expression !== 'string' ||
        !expression ||
        !language ||
        typeof language !== 'object'
    ) {
        return false
    }

    try {
        return expression.split('.').reduce((value, key) => {
            if (
                value === null ||
                value === undefined ||
                !Object.prototype.hasOwnProperty.call(Object(value), key)
            ) {
                return undefined
            }

            return value[key]
        }, language) ?? false

    } catch (error) {
        return false
    }
}

/**
 * Translate a source element using the active JSON dictionary.
 */
const Translate = (node, data, mode, getWord) => {
    if (!_.isElement(node) || !data || typeof getWord !== 'function') {
        return false
    }

    const setAttr = (element, attribute) => {
        const attributes = [
            ['title', attribute.title],
            ['data-tooltip-title', attribute.tooltip],
            ['placeholder', attribute.place],
            ['alt', attribute.alt]
        ]

        attributes.forEach(([name, key]) => {
            if (!key) return

            const translated = getWord(key)

            if (
                translated !== false &&
                translated !== null &&
                translated !== undefined
            ) {
                element.setAttribute(name, String(translated))
            }
        })

        if (attribute.img) {
            const translated = getWord(attribute.img)

            if (
                translated !== false &&
                translated !== null &&
                translated !== undefined
            ) {
                element.setAttribute('title', String(translated))
                element.setAttribute('alt', String(translated))
            }
        }
    }

    const translatedHTML = key => {
        const value = key ? getWord(key) : false

        return value === false || value === null || value === undefined
            ? false
            : String(value)
    }

    setAttr(node, data)

    const content = translatedHTML(
        data.html || (mode === 'set' ? data.multi : false)
    )

    if (content !== false) {
        switch (mode) {
            case 'prepend':
                node.insertAdjacentHTML('afterbegin', ` ${content} `)
                break

            case 'append':
                node.insertAdjacentHTML('beforeend', ` ${content} `)
                break

            case 'pure':
            case 'set':
                node.innerHTML = ` ${content} `
                break
        }
    }

    const hasData = Object.values(data).some(value => !!value)

    if (!hasData) {
        console.log(
            `Element: ${node} does not contain attributes to define`,
            node
        )
    }

    node.setAttribute('translated', 'true')

    return true
}

/**
 * Layout translation based on JSON dictionaries.
 */
export default class IlibJS {
    /**
     * Constructor class
     * @param {String} alias
     * @param {Object} options
     */
    constructor(alias, options = {}) {
        this.alias = typeof alias === 'string' ? alias : 'i18n'
        this.storage = new MemoryStorage(this.alias)
        this.global = false

        this.baseselector = '[class^="i18n"]:not([translated])'

        if (options && typeof options === 'object') {
            // Custom storage system.
            if ('storage' in options) {
                const candidate = options.storage
                let storage = candidate

                if (typeof candidate === 'function') {
                    if (
                        /^class\s/.test(
                            Function.prototype.toString.call(candidate)
                        )
                    ) {
                        storage = new candidate(this.alias)
                    } else {
                        storage = candidate(this.alias)
                    }
                }

                if (
                    !storage ||
                    typeof storage.get !== 'function' ||
                    typeof storage.put !== 'function' ||
                    typeof storage.add !== 'function'
                ) {
                    throw new TypeError(
                        'options.storage must be a storage instance or a factory returning get(), put() and add().'
                    )
                }

                this.storage = storage
            }

            // Populate dictionary to global object.
            if ('global' in options) {
                this.global = true
            }

            if ('dictionary' in options) {
                this.storage.put(options.dictionary)
            }
        }

        /**
         * Find one word expression in dictionary object.
         */
        this.getWord = expression => {
            return FindWord(
                expression,
                this.storage.get().dictionary
            )
        }
    }

    changeDictionary(uri) {
        const resources = this.storage.get().resources || []

        const schema = resources.find(item => item.uri === uri)

        if (!schema) return false

        const dictionary = this.storage.put(schema.resource)

        if (this.global && typeof window !== 'undefined') {
            window[this.alias] = dictionary
        }

        return dictionary
    }

    addDictionary(uri, resource) {
        const resources = this.storage.get().resources || []

        if (!resources.find(item => item.uri === uri)) {
            this.storage.add(uri, resource)
        }

        return this
    }

    async get(uri, options = {}) {
        const resources = this.storage.get().resources || []

        const matched = resources.find(item => item.uri === uri)

        if (matched) {
            const dictionary = this.storage.put(matched.resource)

            if (this.global && typeof window !== 'undefined') {
                window[this.alias] = dictionary
            }

            return dictionary
        }

        try {
            const response = await fetch(uri, options)

            if (!response.ok) {
                throw new Error(
                    `HTTP ${response.status} ${response.statusText}`
                )
            }

            const result = await response.json()

            this.storage.add(uri, result)

            const dictionary = this.storage.put(result)

            if (this.global && typeof window !== 'undefined') {
                window[this.alias] = dictionary
            }

            return dictionary

        } catch (error) {
            const failure = new Error(
                `Failed request ${uri} resource.`
            )

            failure.cause = error

            throw failure
        }
    }

    // Return the current dictionary.
    dictionary() {
        return this.storage.get().dictionary
    }

    /**
     * Translate all matching source elements.
     */
    transcript(dictionary = false) {
        if (dictionary && _.isObject(dictionary)) {
            this.storage.put(dictionary)
        }

        const pre = _.DOM.querySelectorAll(
            '.i18n-prepend:not([translated])'
        ) || []

        const app = _.DOM.querySelectorAll(
            '.i18n-append:not([translated])'
        ) || []

        const pure = _.DOM.querySelectorAll(
            '.i18n-pure:not([translated])'
        ) || []

        const set = _.DOM.querySelectorAll(
            '.i18n:not([translated])'
        ) || []

        const runNodes = (elements, mode) => {
            for (const element of elements) {
                Translate(
                    element,
                    GetAttributeData(element),
                    mode,
                    this.getWord
                )

                for (const child of _.DOM.querySelectorAll(
                    this.baseselector,
                    element
                )) {
                    this.subtree(child)
                }
            }
        }

        runNodes(pre, 'prepend')
        runNodes(app, 'append')
        runNodes(pure, 'pure')
        runNodes(set, 'set')

        return this
    }
      /**
     * Transcript dynamic Node's (traversable).
     * @param nodeElement {Node} - NodeElement
     */
    subtree(nodeElement) {
        if (
            !nodeElement ||
            nodeElement.nodeType !== 1 ||
            nodeElement.hasAttribute('translated')
        ) {
            return false
        }

        const classes = nodeElement.classList

        let mode = false

        if (classes.contains('i18n-prepend')) {
            mode = 'prepend'
        } else if (classes.contains('i18n-append')) {
            mode = 'append'
        } else if (classes.contains('i18n-pure')) {
            mode = 'pure'
        } else if (classes.contains('i18n')) {
            mode = 'set'
        }

        if (mode) {
            Translate(
                nodeElement,
                GetAttributeData(nodeElement),
                mode,
                this.getWord
            )
        }

        // Process matching descendants.
        for (const child of nodeElement.querySelectorAll(
            this.baseselector
        )) {
            this.subtree(child)
        }

        return !!mode
    }

    /**
     * Observe changes in dynamic DOM fragments.
     * @param target {Node}
     * @param selector {String}
     */
    observe(target, selector = this.baseselector) {
        const observer = SpyDOM(
            target,
            mutations => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(addedNode => {
                        if (
                            addedNode &&
                            addedNode.nodeType === 1
                        ) {
                            // Process the added element itself.
                            if (addedNode.matches(selector)) {
                                this.subtree(addedNode)
                            }

                            // Process matching descendants.
                            addedNode.querySelectorAll(selector).forEach(
                                node => this.subtree(node)
                            )
                        }
                    })
                })
            },
            {
                childList: true,
                subtree: true
            }
        )

        return observer
    }
}