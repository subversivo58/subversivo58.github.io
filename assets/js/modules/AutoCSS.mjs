/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2018 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import {UTILS, _} from './Utils.mjs'

/**
 * CSS adjust layout
 */
export default {
    /**
     * CSS adjust padding, margin or font-size (default by "rem")
     * @param {Object} node - NodeType HTMLElement
     */
    adjust(node) {
        let isElement = UTILS.isElement
        /**
         * Get element attribute
         * @param  {Object} node - NodeType HTMLElement
         * @return {Object}      - index by attributes ({string|boolean})
         * @throw  {Boolean}:false
         */
        let getAttributeData = node => {
            try {
                return {
                    pd: _.getA(node, 'data-css-pd'),
                    mg: _.getA(node, 'data-css-mg'),
                    fs: _.getA(node, 'data-css-fs')
                };
            } catch(ex) {
                return false
            }
        }
        /**
         * Set element inline style
         * @param {Object} element - NodeType HTMLElement
         * @param {String}    mode - mode definition (padding, margin or font-size)
         */
        let adjustElement = (element, mode) => {
            //
            switch (mode) {
                case 'padding':
                    let pd = _.getA(element, 'data-css-pd').split(':')
                    if ( pd[0] === '0' ) {
                        $(element).css('padding', pd[1] + 'rem')
                    } else {
                        $(element).css('padding-' + pd[0], pd[1] + 'rem')
                    }
                 break
                case 'margin':
                    let mg = _.getA(element, 'data-css-mg').split(':')
                    if ( mg[0] === '0' ) {
                        $(element).css('margin', mg[1] + 'rem')
                    } else {
                        $(element).css('margin-' + mg[0], mg[1] + 'rem')
                    }
                break;
                case 'font-size':
                    let fs = _.getA(element, 'data-css-fs')
                    $(element).css('font-size', fs + 'rem')
                break
                default:
                    // do stuff...
                break
            }
        }
        // check
        if ( node && node.length > 0 && UTILS.isNodeList(node) ) {
            // from "getElementsByClassName()" [NodeList]
            [...node].forEach(target => {
                if ( isElement(target) ) {
                    let data = getAttributeData(target)
                    if ( data ) {
                        if ( data.pd ) {
                            adjustElement(target, 'padding')
                        }
                        if ( data.mg ) {
                            adjustElement(target, 'margin')
                        }
                        if ( data.fs ) {
                            adjustElement(target, 'font-size')
                        }
                    }
                }
            })
        } else if ( node && isElement(node) ) {
            // from "getElementById()" or specific ElementNode
            let childs = node.querySelectorAll('*')
            if ( childs.length > 0 ) {
                // iterate all descendents
                [...childs].forEach(child => {
                     if ( child.hasAttribute('data-css-pd') ) {
                         adjustElement(child, 'padding')
                     }
                     if ( child.hasAttribute('data-css-mg') ) {
                         adjustElement(child, 'margin')
                     }
                     if ( child.hasAttribute('data-css-fs') ) {
                         adjustElement(child, 'font-size')
                     }
                })
            } else {
                // case Node not have descendents
                if ( node.hasAttribute('data-css-pd') ) {
                    adjustElement(node, 'padding')
                }
                if ( node.hasAttribute('data-css-mg') ) {
                    adjustElement(node, 'marging')
                }
                if ( node.hasAttribute('data-css-fs') ) {
                    adjustElement(node, 'font-size')
                }
            }
        }
    },
    /**
     * Internal function auto initialize
     */
    init() {
        let css = _.getCN('css')
        // send NodeList
        this.adjust(css)
    }
}
