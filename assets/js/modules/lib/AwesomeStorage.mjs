/**
 * Awesome Storage - Storage utilities
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import {
    IsWebBrowserContext,
    IsWebWorkerContext,
    IsServiceWorkerContext,
    IsFrameBox,
    noop, dc, wd, nv, sw, ua, ls, ss, ot, dt, ts
} from '../helpers/BasePrefixes.mjs'

import MISH from './AwesomeIndexedDB.mjs'


export const Caches = {
    clear(name = false) {
        // the Cache API only exists in secure contexts (https or localhost)
        if ( typeof caches === 'undefined' ) {
            return Promise.resolve()
        }
        if ( typeof name === 'string' && name.trim() !== '' && name.length !== 0 ) {
            return caches.delete(name)
        }
        return caches.keys().then(names => Promise.all(names.map(cacheName => caches.delete(cacheName))))
    }
}



/**
 * Cookies CRUD
 */
export const Cookies = {
    /**
     * Get cookie
     * @param  {String}  cname - cookie name
     * @param  {Boolean} regex - use RegExp to find cookie
     * @return {Object}:Promise
     */
    get(cname, regex = false, sync = false) {
        const search = name => {
            return dc.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + name.replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1") || false
        }
        if ( sync ) {
            return regex ? (() => {
                let re = new RegExp('[; ]' + cname + '([^\\s;]*)='),
                    sMatch = (' ' + dc.cookie).match(re)
                return sMatch ? (search(cname) ? search(cname + sMatch[1]) : false) : false
            })() : search(cname);
        }
        return new Promise((resolve, reject) => {

            if ( regex ) {
                let re = new RegExp('[; ]' + cname + '([^\\s;]*)='),
                    sMatch = (' ' + dc.cookie).match(re)
                if ( sMatch ) {
                    (search(cname)) ? resolve(search(cname + sMatch[1])) : reject()
                } else {
                    reject()
                }
            } else {
                (search(cname)) ? resolve(search(cname)) : reject()
            }
        })
    },
    getSync(cname, regex = false) {
        return this.get(cname, regex, true)
    },
    /**
     * Set cookie
     * @param  {String}           name - name of cookie
     * @param  {String|number}   value - value of cookie
     * @param  {Object}        options - optional configuration (expiration, domain, path, secure, same-site) - all options is "optional"
     * @return {Object}:Promise
     */
    set(name, value, options) {
        return new Promise((resolve, reject) => {
            let def = {
                expire: "",
                domain: "; domain=" + location.hostname,
                path: "; path=/",
                secure: "; Secure",
                same: "; SameSite=Strict"
            }
            let makeTime = t => {
                if ( typeof t === 'number' ) {
                    let d = new Date()
                    d.setMilliseconds(d.getMilliseconds() + t * 864e+5)
                    return d.toString()
                }
            }
            if ( !!options && typeof options === 'object' ) {
                def.expire = (typeof options.expire === 'number') ? "; expires=" + makeTime(options.expire) : ""
                def.domain = (!!options.domain && typeof options.domain === 'string') ? "; domain=" + options.domain : "; domain=" + location.hostname
                def.path   = (!!options.path && typeof options.path === 'string') ? "; path=" + options.path : "; path=/"
                def.secure = (!!options.secure && typeof options.secure === 'boolean') ? def.secure : ""
                def.same   = (!!options.same && typeof options.same === 'string' && (options.same === 'Strict' || options.same === 'Lax') ) ? "; SameSite=" + options.same : "; SameSite=Strict"
            }
            let n = ( (typeof name === 'string' && name.length > 1 && name.trim() !== '') || (typeof name === 'number' && name.toString().length > 0) ) ? name : false,
                v = ( (typeof value === 'string' && value.length > 0 && value.trim() !== '') || (typeof value === 'number' && value.toString().length > 0 ) ) ? value : false,
                e = def.expire,
                d = def.domain,
                p = def.path,
                h = def.secure,
                s = def.same;
            try {
                if ( !!n && !!v ) {
                    resolve(v, dc.cookie = name + "=" + value + e + d + p + h + s)
                } else {
                    reject('Invalid cookie name or value!')
                }
            } catch(e) {
                reject(e)
            }
        })
    },
    /**
     * Delete one cookie
     * @param  {String}    name - name of cookie
     * @param  {String}  domain - base domain (root) [default: `location.hostname`]
     * @param  {String}    path - path of this cookie [default: base domain "/"]
     * @return {Object}:Promise - [It would be strange to return an error o.O]
     */
    del(name, domain, path) {
        return new Promise((resolve, reject) => {
            let expires = "; expires=Thu, 01 Jan 1970 00:00:00 UTC",
                d = (!!domain && typeof domain === 'string') ? domain : location.hostname,
                p = (!!path && typeof path === 'string') ? path : "/"
            try {
                resolve(dc.cookie = name + "=" + expires + "; domain=" + d + "; path=" + p)
            } catch(e) {
                reject(e)
            }
        })
    },
    /**
     * Clear all cookies
     * @param  {String}  domain - cookie domain (default: `loation.hostname`)
     * @param  {String}    path - path of this cookie (default: base domain "/")
     * @return {Object}:Promise - [cookie.lenght define success or failure... Find a better way to do this]
     */
    clear(domain, path) {
        return new Promise(resolve => {
            try {
                const deleteCookie = cookiename => {
                    let expires = "; expires=Thu, 01 Jan 1970 00:00:00 UTC",
                        d = (!!domain && typeof domain === 'string') ? domain : location.hostname,
                        p = (!!path && typeof path === 'string') ? path : "/",
                        name = cookiename
                    dc.cookie = name + "=" + expires + "; domain=" + d + "; path=" + p
                }
                let cookies = dc.cookie.split(";")
                for (let i = 0; i < cookies.length; i++) {
                     let spcook =  cookies[i].split("=")
                     deleteCookie(spcook[0])
                     continue
                }
                if ( dc.cookie.length === 0 ) {
                    resolve(true)
                } else {
                    resolve(false)
                }
            } catch(e) {
                resolve(e)
            }
        })
    }
}

export function Storage(mode = 'localStorage') {

    let storagement = (typeof mode === 'string' && (mode === 'localStorage' || mode === 'sessionStorage')) ? mode : 'localStorage'

    return {
        /**
         * Get (request) entire
         * @param {String} key - index of entire
         * @param {String} regex - for generate {RegExp}
         * @return {String|Undefined}
         */
        get(key, regex) {
            let keys = Object.keys(wd[storagement]).join('; ')
            if ( !!regex && typeof regex === 'string' ) {
                let r = new RegExp('[; ]' + regex + '([^\\s;]*)')
                let m = (' ' + keys).match(r)
                return (!!m) ? wd[storagement].getItem(regex + m[1]) : null
            } else {
                return wd[storagement].getItem(key)
            }
        },
        /**
         * Set (create) entire
         * @param {String} key - index of entire
         * @param {String|Object|Array} - entire value [note: {Object|Array} use `JSON.stringify`]
         */
        set(key, val) {
            if ( typeof val !== 'string' ) {
                wd[storagement].setItem(key, JSON.stringify(val))
                return
            }
            wd[storagement].setItem(key, val)
        },
        /**
         * Delete (remove) entire
         * @param {String} key - index of entire
         */
        del(key) {
            wd[storagement].removeItem(key)
        },
        /**
         * Get (request) all entires
         * @param {String} regex - for generate {RegExp}
         * @return {Array} - lot of entires [or empty]
         */
        all(regex) {
            let keys = Object.keys(wd[storagement]),
                result = [],
                self = this
            if ( regex && typeof regex === 'string' ) {
                let r = new RegExp(regex)
                keys.forEach((key, i) => {
                    if ( r.test(key) ) {
                        result.push({
                            key: key,
                            value: self.get(key)
                        })
                    }
                })
            } else {
                keys.forEach((key, i) => {
                    result.push({
                        key: key,
                        value: self.get(key)
                    })
                })
            }
            return result
        },
        /**
         * Get (request) `JSON` values has been parsed (using `JSON.parse`)
         * @param {String} key - index of entire
         * @param {String} regex - for generate {RegEx}
         * @return {String|Undefined}
         */
        json(key, regex) {
            return this.get(key, regex) ? JSON.parse(this.get(key, regex)) : null
        },
        /**
         * Clear (remove) all entires from `sessionStorage`
         */
        clear(eraseall = false) {
            if ( !eraseall ) {
                wd[storagement].clear()
            } else {
                ss.clear()
                ls.clear()
            }
        }
    }
}


// databases of this project (used when the browser can not list all of them)
const KNOWN_DATABASES = ['Subversivo58']

// maximum time (ms) waiting for the clean up: a blocked deletion (another page holding the database)
// must never freeze the caller (e.g. a page that reloads after the clean up)
const CLEAN_TIMEOUT = 3000

/**
 * Clear all browser storagement: local/session storage, caches, IndexedDB and cookies
 * @return {Promise<void>} resolves when everything has been cleaned (or after `CLEAN_TIMEOUT`); never rejects
 */
export function CleanBrowserStoragement() {
    const warn = label => error => console.warn(`[CleanBrowserStoragement] ${label}:`, error)
    let timer
    // clear local and session storagement
    try {
        Storage().clear(true)
    } catch (error) {
        warn('could not clear local/session storage')(error)
    }
    // clear all caches (if exist)
    const cachesDone = Promise.resolve().then(() => Caches.clear(true)).catch(warn('could not clear the caches'))
    // clear all indexeddb: a browser without `indexedDB.databases()` can not list every database,
    // so it erases only the ones we know; a failure here must never break the clean up
    const idb = MISH('tmp').eraseAll().catch(error => {
        warn('could not erase all databases, trying the known ones')(error)
        return MISH('tmp').erase(KNOWN_DATABASES)
    }).catch(warn('could not erase the IndexedDB databases'))
    // clear all cookies
    const cookies = Promise.resolve().then(() => Cookies.clear()).catch(warn('could not clear the cookies'))
    // wait for all of them, but never longer than the timeout
    const timeout = new Promise(resolve => { timer = setTimeout(resolve, CLEAN_TIMEOUT) })
    return Promise.race([Promise.all([cachesDone, idb, cookies]), timeout]).then(noop).finally(() => clearTimeout(timer))
}
