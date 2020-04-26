/**
 * IlibJS - Document translator
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2020 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import _ from './Helpers.mjs'

/**
 * List of languages with ISO 639-1 codes used (supported) by Google Translator API.
 * @see https://cloud.google.com/translate/docs/languages
 */
const GAISO = [
    {
        code: "af",
        name: "Afrikaans",
        native: "Afrikaans"
    },
    {
        code: "am",
        name: "Amharic",
        native: "አማርኛ"
    },
    {
        code: "ar",
        name: "Arabic",
        native: "العربية",
        rtl: 1
    },
    {
        code: "az",
        name: "Azerbaijani",
        native: "Azərbaycanca / آذربايجان"
    },
    {
        code: "be",
        name: "Belarusian",
        native: "Беларуская"
    },
    {
        code: "bg",
        name: "Bulgarian",
        native: "Български"
    },
    {
        code: "bn",
        name: "Bengali",
        native: "বাংলা"
    },
    {
        code: "bs",
        name: "Bosnian",
        native: "Bosanski"
    },
    {
        code: "ca",
        name: "Catalan",
        native: "Català"
    },
    {
        code: "ce",
        name: "Chechen",
        native: "Нохчийн"
    },
    {
        code: "co",
        name: "Corsican",
        native: "Corsu"
    },
    {
        code: "cs",
        name: "Czech",
        native: "Česky"
    },
    {
        code: "cy",
        name: "Welsh",
        native: "Cymraeg"
    },
    {
        code: "da",
        name: "Danish",
        native: "Dansk"
    },
    {
        code: "de",
        name: "German",
        native: "Deutsch"
    },
    {
        code: "el",
        name: "Greek",
        native: "Ελληνικά"
    },
    {
        code: "en",
        name: "English",
        native: "English"
    },
    {
        code: "eo",
        name: "Esperanto",
        native: "Esperanto"
    },
    {
        code: "es",
        name: "Spanish",
        native: "Español"
    },
    {
        code: "et",
        name: "Estonian",
        native: "Eesti"
    },
    {
        code: "eu",
        name: "Basque",
        native: "Euskara"
    },
    {
        code: "fa",
        name: "Persian",
        native: "فارسی",
        rtl: 1
    },
    {
        code: "fi",
        name: "Finnish",
        native: "Suomi"
    },
    {
        code: "fr",
        name: "French",
        native: "Français"
    },
    {
        code: "fy",
        name: "West Frisian",
        native: "Frysk"
    },
    {
        code: "ga",
        name: "Irish",
        native: "Gaeilge"
    },
    {
        code: "gd",
        name: "Scottish Gaelic",
        native: "Gàidhlig"
    },
    {
        code: "gl",
        name: "Galician",
        native: "Galego"
    },
    {
        code: "gu",
        name: "Gujarati",
        native: "ગુજરાતી"
    },
    {
        code: "ha",
        name: "Hausa",
        native: "هَوُسَ",
        rtl: 1
    },
    {
        code: "he",
        name: "Hebrew",
        native: "עברית",
        rtl: 1
    },
    {
        code: "hi",
        name: "Hindi",
        native: "हिन्दी"
    },
    {
        code: "hr",
        name: "Croatian",
        native: "Hrvatski"
    },
    {
        code: "ht",
        name: "Haitian",
        native: "Krèyol ayisyen"
    },
    {
        code: "hu",
        name: "Hungarian",
        native: "Magyar"
    },
    {
        code: "hy",
        name: "Armenian",
        native: "Հայերեն"
    },
    {
        code: "id",
        name: "Indonesian",
        native: "Bahasa Indonesia"
    },
    {
        code: "ig",
        name: "Igbo",
        native: "Igbo"
    },
    {
        code: "is",
        name: "Icelandic",
        native: "Íslenska"
    },
    {
        code: "it",
        name: "Italian",
        native: "Italiano"
    },
    {
        code: "ja",
        name: "Japanese",
        native: "日本語"
    },
    {
        code: "jv",
        name: "Javanese",
        native: "Basa Jawa"
    },
    {
        code: "ka",
        name: "Georgian",
        native: "ქართული"
    },
    {
        code: "kk",
        name: "Kazakh",
        native: "Қазақша"
    },
    {
        code: "km",
        name: "Cambodian",
        native: "ភាសាខ្មែរ"
    },
    {
        code: "kn",
        name: "Kannada",
        native: "ಕನ್ನಡ"
    },
    {
        code: "ko",
        name: "Korean",
        native: "한국어"
    },
    {
        code: "ku",
        name: "Kurdish",
        native: "Kurdî / كوردی",
        rtl: 1
    },
    {
        code: "ky",
        name: "Kirghiz",
        native: "Kırgızca / Кыргызча"
    },
    {
        code: "la",
        name: "Latin",
        native: "Latina"
    },
    {
        code: "lb",
        name: "Luxembourgish",
        native: "Lëtzebuergesch"
    },
    {
        code: "lo",
        name: "Laotian",
        native: "ລາວ / Pha xa lao"
    },
    {
        code: "lt",
        name: "Lithuanian",
        native: "Lietuvių"
    },
    {
        code: "lv",
        name: "Latvian",
        native: "Latviešu"
    },
    {
        code: "mg",
        name: "Malagasy",
        native: "Malagasy"
    },
    {
        code: "mi",
        name: "Maori",
        native: "Māori"
    },
    {
        code: "mk",
        name: "Macedonian",
        native: "Македонски"
    },
    {
        code: "ml",
        name: "Malayalam",
        native: "മലയാളം"
    },
    {
        code: "mn",
        name: "Mongolian",
        native: "Монгол"
    },
    {
        code: "mr",
        name: "Marathi",
        native: "मराठी"
    },
    {
        code: "ms",
        name: "Malay",
        native: "Bahasa Melayu"
    },
    {
        code: "mt",
        name: "Maltese",
        native: "bil-Malti"
    },
    {
        code: "my",
        name: "Burmese",
        native: "မြန်မာစာ"
    },
    {
        code: "ne",
        name: "Nepali",
        native: "नेपाली"
    },
    {
        code: "nl",
        name: "Dutch",
        native: "Nederlands"
    },
    {
        code: "no",
        name: "Norwegian",
        native: "Norsk"
    },
    {
        code: "ny",
        name: "Chichewa",
        native: "Chi-Chewa"
    },
    {
        code: "pa",
        name: "Panjabi / Punjabi",
        native: "ਪੰਜਾਬੀ / पंजाबी / پنجابي"
    },
    {
        code: "pl",
        name: "Polish",
        native: "Polski"
    },
    {
        code: "ps",
        name: "Pashto",
        native: "پښتو",
        rtl: 1
    },
    {
        code: "pt",
        name: "Portuguese",
        native: "Português"
    },
    {
        code: "ro",
        name: "Romanian",
        native: "Română"
    },
    {
        code: "ru",
        name: "Russian",
        native: "Русский"
    },
    {
        code: "sd",
        name: "Sindhi",
        native: "सिनधि"
    },
    {
        code: "si",
        name: "Sinhalese",
        native: "සිංහල"
    },
    {
        code: "sk",
        name: "Slovak",
        native: "Slovenčina"
    },
    {
        code: "sl",
        name: "Slovenian",
        native: "Slovenščina"
    },
    {
        code: "sm",
        name: "Samoan",
        native: "Gagana Samoa"
    },
    {
        code: "sn",
        name: "Shona",
        native: "chiShona"
    },
    {
        code: "so",
        name: "Somalia",
        native: "Soomaaliga"
    },
    {
        code: "sq",
        name: "Albanian",
        native: "Shqip"
    },
    {
        code: "sr",
        name: "Serbian",
        native: "Српски"
    },
    {
        code: "st",
        name: "Southern Sotho",
        native: "Sesotho"
    },
    {
        code: "su",
        name: "Sundanese",
        native: "Basa Sunda"
    },
    {
        code: "sv",
        name: "Swedish",
        native: "Svenska"
    },
    {
        code: "sw",
        name: "Swahili",
        native: "Kiswahili"
    },
    {
        code: "ta",
        name: "Tamil",
        native: "தமிழ்"
    },
    {
        code: "te",
        name: "Telugu",
        native: "తెలుగు"
    },
    {
        code: "tg",
        name: "Tajik",
        native: "Тоҷикӣ"
    },
    {
        code: "th",
        name: "Thai",
        native: "ไทย / Phasa Thai"
    },
    {
        code: "tl",
        name: "Tagalog / Filipino",
        native: "Tagalog"
    },
    {
        code: "tr",
        name: "Turkish",
        native: "Türkçe"
    },
    {
        code: "uk",
        name: "Ukrainian",
        native: "Українська"
    },
    {
        code: "ur",
        name: "Urdu",
        native: "اردو",
        rtl: 1
    },
    {
        code: "uz",
        name: "Uzbek",
        native: "Ўзбек"
    },
    {
        code: "vi",
        name: "Vietnamese",
        native: "Tiếng Việt"
    },
    {
        code: "xh",
        name: "Xhosa",
        native: "isiXhosa"
    },
    {
        code: "yi",
        name: "Yiddish",
        native: "ייִדיש",
        rtl: 1
    },
    {
        code: "yo",
        name: "Yoruba",
        native: "Yorùbá"
    },
    {
        code: "zh",
        name: "Chinese",
        native: "中文"
    },
    {
        code: "zu",
        name: "Zulu",
        native: "isiZulu"
    }
]

/**
 * TODO - add auto translate option (by Google translate `fetch` api)
 */

let LastISOCode = false

function RemoteTranslation(targetblock, of = 'en', to) {
    let url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${of}&tl=${to}&dt=t&q=`
    _.DOM.querySelectorAll('.i18n-remote', targetblock).forEach(async (element, index, array) => {
        let tags = element.getElementsByTagName("*")
        if ( tags.length > 0 ) {
            let matched = [], clone = element.cloneNode(true)
            for await (let key of [...tags]) {
                matched.push({
                    e: key.outerHTML,             // element
                    w: key.textContent // word
                })
                clone.innerHTML = clone.innerHTML.replace(key.outerHTML, `(- ${key.textContent} -)`)
            }
            fetch(url + clone.innerHTML).then(r => r.json()).then(j => {
                let str = j[0][0][0]
                element.innerHTML = str.replace(/\(- (.+?) -\)/g, function(match, contents, offset, input_string) {
                    let rrx = matched.shift()
                    return rrx.e.replace(rrx.w, contents)
                })
            }).catch(console.log) // system logger?
        } else {
            fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=${of}&tl=${to}&dt=t&q=${encodeURI(element.innerHTML)}`)
            .then(respponse => respponse.json())
            .then(json => {
               element.innerHTML = json[0][0][0]
            }).catch(console.log) // system logger?
        }
    })
}

async function MakeRemoteSelectorLanguages() {
    let selector = _.DOM.getById('remote-language-selector')
    if ( !!selector ) {

        let allSupportedLangs = ''

        for await (let item of GAISO) {
            allSupportedLangs += `<option value="${item.code}">${item.native}</option>`
        }

        selector.insertAdjacentHTML('beforeend', allSupportedLangs)

        _.DOM.event(selector, 'change', evt => {
            if ( evt.target.value.length === 2 && evt.target.value !== LastISOCode ) {
                let targetLangISO = !LastISOCode ? 'en' : LastISOCode
                LastISOCode = evt.target.value
                RemoteTranslation(document, targetLangISO, LastISOCode)
            }
        })
    }
}









async function GetResource(uri, options = {}) {
    try {
        return await fetch(uri, options).then(response => response.json())
    } catch(ex) {
        //console.log(ex)
        return {
            IlibJS: 'https://github.com/iconic-dreams/ilibjs',
            author: {
                name: 'Lauro Moraes aka Subversivo58',
                url: 'https://github.com/subversivo58',
                homepage: 'https://subversivo58.github.io'
            },
            license: {
                type: 'The MIT License (MIT)',
                url: 'https://github.com/iconic-dreams/ilibjs/blob/master/LICENSE'
            }
        }
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
        this.resources.push({
            uri: uri,
            resource: resource
        })
        this.length = this.resources.length
    }

    put(resource) {
        return this.dictionary = resource
    }

    get() {
        return {
            key: this.key,
            resources: this.resources,
            dictionary: this.dictionary
        }
    }

    del(uri) {
        if ( this.resources.length > 0 ) {
            this.resources.forEach((item, i, arr) => {
                if ( item.uri === uri ) {
                    this.resources.splice(i, 1)
                }
            })
        }
    }

    clear() {
        this.resources = []
        this.dictionary = {}
    }
}

// MutationObeserver ...
const SpyDOM = (node, callback, options) => {
    let observer = new MutationObserver(callback)
    observer.observe(node, options)
}

/**
 * Get element attribute
 * @param element {Object} - NodeType HTMLElement
 * @param attribute {String} - atribute name criteria
 */
const GetAttributeData = (element, attribute) => {
    if ( _.isElement(element) && (!!attribute && typeof attribute === 'string') ) {
        return element.getAttribute(attribute)
    } else if ( _.isElement(element) && !attribute ) {
        return {
            tooltip: element.getAttribute('data-i18n-tooltip'),
            place:   element.getAttribute('data-i18n-place'),
            multi:   element.getAttribute('data-i18n-multi'),
            title:   element.getAttribute('data-i18n-title'),
            html:    element.getAttribute('data-i18n-html'),
            alt:     element.getAttribute('data-i18n-alt'),
            img:     element.getAttribute('data-i18n-img')
        }
    } else {
        return false
    }
}

/**
 * Find one word in dictionary object
 * @see https://pt.stackoverflow.com/questions/269054/buscar-valores-em-um-objeto#269061
 * @param  {String} expression - word's router in dictionary
 * @param  {Object} language   - dictionary
 * @return {String} the word or {Boolean}:false to not found
 * @throw  {Boolean}:false
 */
const FindWord = (expression, language) => {
    try {
        if ( _.isString(expression) && /\./g.test(expression) ) {
            return expression.split('.').reduce((o, i) => o[i], language)
        } else {
            return false
        }
    } catch(ex) {
        return false
    }
}

/**
 * Translate all source
 * @param {Node}     node    - HTMLElement
 * @param {Object}   data    - attributes of Node
 * @param {String}   mode    - mode of add or set word(s)
 * @param {Function} getWord -
  */
const Translate = (node, data, mode, getWord) => {
    // define attributes
    let setAttr = (element, attribute) => {
        if ( attribute.title ) {
            element.setAttribute('title', getWord(attribute.title))
        }
        if ( attribute.tooltip ) {
            element.setAttribute('data-tooltip-title', getWord(attribute.tooltip))
        }
        if ( attribute.place ) {
            element.setAttribute('placeholder', getWord(attribute.place))
        }
        if ( attribute.alt ) {
            element.setAttribute('alt', getWord(attribute.alt))
        }
        if ( attribute.img ) {
            element.setAttribute('title', getWord(attribute.img))
            element.setAttribute('alt', getWord(attribute.img))
        }
    }
    switch (mode) {
        case 'prepend':
            if ( data.html ) {
                setAttr(node, data)
                node.innerHTML = ' ' + getWord(data.html) + ' ' + node.innerHTML
            }
        break;
        case 'append':
            if ( data.html ) {
                setAttr(node, data)
                node.innerHTML += ' ' + getWord(data.html)
            }
        break
        case 'pure':
            if ( data.html ) {
                setAttr(node, data)
                node.innerHTML = ' ' + getWord(data.html)
            }
        break
        case 'set':
            if ( data.html ) {
                setAttr(node, data)
                node.innerHTML = ' ' + getWord(data.html)
            } else if ( data.multi ) {
                setAttr(node, data)
                node.innerHTML = ' ' + getWord(data.multi)
            } else {
                setAttr(node, data)
            }
        break
    }
    if ( !data.tooltip && !data.place && !data.multi && !data.title && !data.html && !data.alt && !data.img ) {
        console.log(`Element: ${node} does not contain attributes to define`)
    }
    node.setAttribute('translated', true)
}


/**
 * Layout translation based on JSON dictionaries
 */
export default class IlibJS {
    /**
     * Constructor class
     * @param  {String} alias   -
     * @param  {Object} options -
     * @return {Object}         - Instance of class
     */
    constructor(alias, options = {}) {
        this.alias = typeof alias === 'string' ? alias : 'i18n'
        this.storage = new MemoryStorage(alias)
        this.global = false

        this.baseselector = '[class^="i18n"]:not([translated])'

        if ( typeof options === 'object') {
            // storage system
            if ( 'storage' in options && typeof options.storage === 'function' ) {
                this.storage = options.storage
            }
            // populate dictionary to global object `window` (reffer by "mode")
            if ( 'global' in options ) {
                this.global = true
            }
            if ( 'dictionary' in options ) {
                try {
                     this.storage.put(options.dictionary)
                } catch(e){}
            }
        }

        /**
         * Find one word expression in dictionary object
         * @see https://pt.stackoverflow.com/questions/269054/buscar-valores-em-um-objeto#269061
         * @param  {String} expression - word's router in dictionary
         * @return {String} the word or {Boolean}:false to not found
         */
        this.getWord = expression => {
            return FindWord(expression, this.storage.get().dictionary)
        }

        // initialize remote transcriptor
        MakeRemoteSelectorLanguages()
    }

    changeDictionary(uri) {
        let schema = this.storage.get().resources.find(i => i.uri === uri)
        return schema ? this.storage.put(schema.resource) : false
    }

    addDictionary(uri, resource) {
        if ( !this.storage.get().resources.find(i => i.uri === uri) ) {
            this.storage.add(uri, resource)
        }
    }

    async get(uri, options = {}) {
        const Process = async (u, o) => {
            await fetch(u, o).then(response => response.json()).then(result => {
                this.storage.add(u, result)
                this.global ? (window[this.alias] = this.storage.put(result)) : this.storage.put(result)
            }).catch(e => {
                throw new Error(`Failed request ${u} resource.`, e)
            })
            return this.storage.get().dictionary
        }
        // pre-check current dictionaries
        return ( this.storage.length > 0 ) ? (async () => {
            let matched = this.storage.get().resources.find(res => res.uri === uri)
            return matched ? (this.global ? (window[this.alias] = this.storage.put(matched.resource)) : this.storage.put(matched.resource)) : await Process(uri, options)
        })() : await Process(uri, options)
    }

    // return current dictionary
    dictionary() {
        return this.storage.get().dictionary
    }

    /**
     * Transcript all source
     */
    transcript(dictionary = false) {
        //
        if ( dictionary && _.isObject(dictionary) ) {
            this.storage.put(dictionary)
        }
        // define
        let pre  = _.DOM.querySelectorAll('.i18n-prepend:not([translated])') || 0,
            app  = _.DOM.querySelectorAll('.i18n-append:not([translated])') || 0,
            pure = _.DOM.querySelectorAll('.i18n-pure:not([translated])') || 0,
            set  = _.DOM.querySelectorAll('.i18n:not([translated])') || 0,
            self = this
        /**
         * Run Node Elements in loop
         * @param {Object}:Array element - NodeType
         * @param {String}          mode - mode definition for use in "trancript()"
         */
        let runNodes = (element, mode) => {
            for (let i = 0; i < element.length; i++) {
                 let type = GetAttributeData(element[i])
                 Translate(element[i], type, mode, self.getWord)
                 ;[..._.DOM.querySelectorAll(self.baseselector, element[i])].forEach(subtree => {
                     self.subtree(subtree)
                 })
            }
        }
        // loops
        runNodes(pre,  'prepend')
        runNodes(app,  'append')
        runNodes(pure, 'pure')
        runNodes(set,  'set')
    }

    /**
     * Transcript dinamic Node's (traversable)
     * @param nodeElement {Node} - `NodeElement`
     */
    subtree(nodeElement) {
        // define
        let isType = false
        // get list of `Element` class
        let classes = nodeElement.getAttribute('class').split(/\s+/g)
        // check
        if ( classes.includes('i18n-prepend') ) {
            isType = 'prepend'
        } else if ( classes.includes('i18n-append') )  {
            isType = 'append'
        } else if ( classes.includes('i18n-pure') ) {
            isType = 'pure'
        } else if ( classes.includes('i18n') ) {
            isType = 'set'
        }
        // verify
        if ( isType ) {
            Translate(nodeElement, GetAttributeData(nodeElement), isType, this.getWord)
        }
    }

    /**
     * Observe changes in dinamic DOM fragments
     * @param target   {Node}   - `NodeElement` for "observe mutations"
     * @param selector {String} - selector for request into `DOM`
     */
    observe(target, selector = this.baseselector) {
        // initialize MutationObserver
        SpyDOM(target, mutations => {
            mutations.forEach(mutation => {
                [...mutation.addedNodes].forEach(addedNode => {
                    if ( /element/g.test(_.type(addedNode)) ) {
                        [..._.DOM.querySelectorAll(selector, addedNode)].forEach(node => {
                            this.subtree(node)
                        })
                    }
                })
            })
        }, {childList: true})
    }
}


/**
 * How to use:

import iLib from './pathToIlib/iLib.mjs'

// Instance and "mode" (i18n|l10n|Intl)
const i18n = new IlibJS('i18n')

// Request JSON dictonary
// second argument (optional) headers for get (`window.Fetch()`)
i18n.get('https://domain.com/pathToDictionari.json', {
    credentials: 'include',
    cache: 'reload'
})












 */