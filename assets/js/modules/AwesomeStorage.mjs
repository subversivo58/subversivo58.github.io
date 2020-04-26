/**
 * Awesome Storage - Storage utilities
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2020 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import {
    IsWebBrowserContext,
    IsWebWorkerContext,
    IsServiceWorkerContext,
    IsFrameBox,
    noop, dc, wd, nv, sw, ua, ls, ss, ot, dt, ts
} from './BasePrefixes.mjs'

import MISH from './AwesomeIndexedDB.mjs'


export const Caches = {
    clear(name = false) {
        if ( typeof name === 'string' && name.trim() !== '' && name.length !== 0 ) {
            caches.delete(name)
        } else {
            caches.keys().then(names => {
                for (let name of names) {
                     caches.delete(name)
                }
            })
        }
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
    get(cname, regex = false) {
        return new Promise((resolve, reject) => {
            const search = name => {
                return dc.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + name.replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1") || false
            }
            if ( regex ) {
                let re = new RegExp('[; ]' + cname + '([^\\s;]*)='),
                    sMatch = (' ' + dc.cookie).match(re)
                if ( sMatch ) {
                    (search(cname)) ? resolve(search(cname + sMatch[1])) : reject('not found cookie')
                } else {
                    reject('not found cookie reg')
                }
            } else {
                (search(cname)) ? resolve(search(cname)) : reject('not found cookie')
            }
        })
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
                domain = (!!domain && typeof domain === 'string') ? domain : location.hostname,
                path = (!!path && typeof path === 'string') ? path : "/"
            try {
                resolve(dc.cookie = name + "=" + expires + "; domain=" + domain + "; path=" + path)
            } catch(_) {
                reject()
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
                deleteCookie = cookiename => {
                    let expires = "; expires=Thu, 01 Jan 1970 00:00:00 UTC",
                        domain = (!!domain && typeof domain === 'string') ? domain : location.hostname,
                        path = (!!path && typeof path === 'string') ? path : "/",
                        name = cookiename
                    dc.cookie = name + "=" + expires + "; domain=" + domain + "; path=" + path
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
            } catch(_) {
                resolve(false)
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


export function CleanBrowserStoragement() {
    // clear local and session storagement
    Storage().clear(true)
    // clear all caches (if exist)
    Caches.clear(true)
    // clear all indexeddb
    MISH('tmp').eraseAll()
    // clear all cookies
    Cookies.clear().then(noop)
}