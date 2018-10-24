/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2018 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import {UTILS, _} from './Utils.mjs'
import TOOLS from './Tools.mjs'

/**
 * Layout translation based on JSON dictionaries
 */
export default {
    /**
     * Get element attribute
     * @param element {Object} - NodeType HTMLElement
     * @param attribute {String} - atribute name criteria
     */
    getAttributeData(element, attribute) {
        if ( UTILS.isElement(element) && (!!attribute && typeof attribute === 'string') ) {
            return _.getA(element, attribute)
        } else if ( UTILS.isElement(element) && !attribute ) {
            return {
                tooltip: _.getA(element, 'data-i18n-tooltip'),
                place:   _.getA(element, 'data-i18n-place'),
                multi:   _.getA(element, 'data-i18n-multi'),
                title:   _.getA(element, 'data-i18n-title'),
                html:    _.getA(element, 'data-i18n-html'),
                alt:     _.getA(element, 'data-i18n-alt'),
                img:     _.getA(element, 'data-i18n-img')
            }
        } else {
            return false
        }
    },

    /**
     * Transcript all source
     * @param {Node}   node - HTMLElement
     * @param {Object} data - attributes of Node
     * @param {String} mode - mode of add or set word(s)
     */
    transcript(node, data, mode) {
        let getWord = TOOLS.getWord
        // define attributes
        let setAttr = (element, attribute) => {
            if ( attribute.title ) {
                _.setA(element, 'title', getWord(attribute.title))
            }
            if ( attribute.tooltip ) {
                _.setA(element, 'data-tooltip-title', getWord(attribute.tooltip))
            }
            if ( attribute.place ) {
                _.setA(element, 'placeholder', getWord(attribute.place))
            }
            if ( attribute.alt ) {
                _.setA(element, 'alt', getWord(attribute.alt))
            }
            if ( attribute.img ) {
                _.setA(element, 'title', getWord(attribute.img))
                _.setA(element, 'alt', getWord(attribute.img))
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
            console.log(node)
        }
        _.setA(node, 'translated', true)
    },
    /**
     * Transcript dinamic Node's (traversable)
     * @param {Node} nodeElement
     */
    subtree(nodeElement) {
        // define
        let isType = false,
            self = this
        let classes = nodeElement.getAttribute('class').split(/\s+/g)
        //
        if ( classes.includes('i18n-prepend') ) {
            isType = 'prepend'
        } else if ( classes.includes('i18n-append') )  {
            isType = 'append'
        } else if ( classes.includes('i18n-pure') ) {
            isType = 'pure'
        } else if ( classes.includes('i18n') ) {
            isType = 'set'
        }
        //
        if ( isType ) {
            self.transcript(nodeElement, self.getAttributeData(nodeElement), isType)
        }
    },
    /**
     * Transcript all source
     */
    all(scope) {
        // define
        let pre  = _.qSA('.i18n-prepend:not([translated])') || 0,
            app  = _.qSA('.i18n-append:not([translated])') || 0,
            pure = _.qSA('.i18n-pure:not([translated])') || 0,
            set  = _.qSA('.i18n:not([translated])') || 0,
            self = scope
        /**
         * Run Node Elements in loop
         * @param {Object}:Array element - NodeType
         * @param {String}          mode - mode definition for use in "trancript()"
         */
        let runNodes = (element, mode) => {
            for (let i = 0; i < element.length; i++) {
                 let type = self.getAttributeData(element[i])
                 self.transcript(element[i], type, mode)
                 ;[..._.qSA('[class^="i18n"]:not([translated])', element[i])].forEach(subtree => {
                     self.subtree(subtree)
                 })
            }
        }
        // loops
        runNodes(pre,  'prepend')
        runNodes(app,  'append')
        runNodes(pure, 'pure')
        runNodes(set,  'set')
    },

    /**
     * Object initialize function
     * @param scope {Object} - retrieve Plugin instance reference
     */
    init() {
        // send dictionary object (by Plugin instance) [because Plugin this is differ of object this]
        console.log('[DEBUG!] Transcript Source Code Interface!')
        this.all(this)
    }
}
