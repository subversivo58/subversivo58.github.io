/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2018 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */

import {IsWebBrowserContext} from './BasePrefixes.mjs'
/**
 * Helper's DOM manipulate HTMLElement [not allow in (Web|Service) Worker]
 * @extend -> Plugin._
 */
export let _ = {}
if ( IsWebBrowserContext ) {
    _ = {
        create(tag) {
            return dc.createElement(tag)
        },
        createTN(text) {
            return dc.createTextNode(text)
        },
        getA(element, attr) {
            return UTILS.isElement(element) ? element.getAttribute(attr) : false
        },
        has(element, attr) {
            return element.hasAttribute(attr)
        },
        setA(element, attr, value) {
            element.setAttribute(attr, value)
        },
        getBI(id) {
            return dc.getElementById(id)
        },
        getCN(className) {
            return dc.getElementsByClassName(className)
        },
        getTN(tagName, node) {
            if ( node ) {
                return node.getElementsByTagName(tagName)
            }
            return dc.getElementsByTagName(tagName)
        },
        qS(target, node, head = false) {
            if ( head ) {
                return dc.head.querySelector(target)
            } else if ( target && node ) {
                return node.querySelector(target)
            }
            return dc.querySelector(target)
        },
        qSA(target, node, head = false) {
            if ( head ) {
                return dc.head.querySelectorAll(target)
            } else if ( target && node ) {
                return node.querySelectorAll(target)
            }
            return dc.querySelectorAll(target)
        },
        addClass(el, classes) {
            let list = classes.trim().split(' ')
            list.forEach(item => {
                el.classList.add(item)
            })
            return this
        },
        removeClass(el, classes) {
            let list = classes.trim().split(' ')
            list.forEach(item => {
                el.classList.remove(item)
            })
            return this
        }
    }
}
