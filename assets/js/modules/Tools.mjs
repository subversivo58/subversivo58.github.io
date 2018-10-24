/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2018 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import {UTILS, _} from './Utils.mjs'
/**
 * Collection of tools
 */
export default {
        /**
         * Convert bytes to readable size
         * @see https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript#18650828
         * @param  {Integer|String}    bytes -
         * @param  {Integer|String} decimals - optional number of decimals
         * -- note: set to "0" pass as {String} like:
         *  + bytesToSize(122345346, 0)   // output: "116.68 MB"
         *  + bytesToSize(122345346, '0') // output: "116 MB" [its realy effective]
         * @return {String}
         */
        bytesToSize(bytes, decimals) {
            if ( (0 === bytes) || (!bytes) ) {
                return '0 Bytes'
            }
            let k = 1024,
                dm = decimals || 2,
                sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
                i = Math.floor(Math.log(bytes) / Math.log(k))
            return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
        },

        /**
         * Generate UUID long and short (default: long)
         * @param  {Boolean} short - indicates return short UUID
         * @return {String}
         */
        uuid(short) {
            if ( short ) {
                return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
            }
            let s4 = () => {
                return Math.floor(Math.random() * 0x10000).toString(16)
            }
            return s4()+s4()+'-'+s4()+'-'+s4()+'-'+s4()+'-'+s4()+s4()+s4()
        },

        /**
         * Find one word in dictionary object
         * @see https://pt.stackoverflow.com/questions/269054/buscar-valores-em-um-objeto#269061
         * @param  {String} expression - word's router in dictionary
         * @param  {Object} language   - dictionary
         * @return {String} the word or {Boolean}:false to not found
         * @throw  {Boolean}:false
         */
        getWord(expression, language = {}) {
            try {
                if ( UTILS.isString(expression) && /\./g.test(expression) ) {
                    return expression.split('.').reduce((o, i) => o[i], language)
                } else {
                    return false
                }
            } catch(ex) {
                return false
            }
        },
        /**
         * Deep Freezing {Object} and {Object}(s) properties [imutable]
         * @see font: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
         * @param {Object} obj -
         */
        deepFreeze(obj) {
            // get propertis names
            let propNames = Object.getOwnPropertyNames(obj)
            // freeze properties before auto-freeze
            propNames.forEach(name => {
                let prop = obj[name]
                // freeze prop
                if ( typeof prop === 'object' && prop !== null ) {
                    this.deepFreeze(prop)
                }
            })
            // auto-freeze (nothing if already freeze)
            return Object.freeze(obj)
        }
    }
