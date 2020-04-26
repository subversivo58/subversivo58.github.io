/**
 * Functions collection
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2020 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import {
    IsWebBrowserContext,
    IsWebWorkerContext,
    IsServiceWorkerContext,
    noop, dc, wd, nv, sw, ua, ls, ss, ot, dt, ts,
    // PHP time() approach
    time,
    // protocol
    uri,
    // root (domain)
    BaseRoot,
    // XMLHttpRequest
    XHR,
    // FormData
    FD,
    // global get APIS...
    indexedDB,
    IDBTransaction,
    IDBKeyRange,
    URL,
    Geolocation,
    RegLogout,
    Notifics,
    Fetch,
    Storage,
    Worker,
    ServiceWorker,
    Promise
} from './BasePrefixes.mjs'
import _ from './Helpers.mjs'

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
const Bytes2Size = (bytes, decimals) => {
    if ( (0 === bytes) || (!bytes) ) {
        return '0 Bytes'
    }
    let k = 1024,
        dm = decimals || 2,
        sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'],
        i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * Deep Freezing {Object} and {Object}(s) properties [imutable]
 * @see font: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Reference/Global_Objects/Object/freeze
 * @param {Object} obj -
 */
const DeepFreeze = function(obj) {
    // get propertis names
    let propNames = Object.getOwnPropertyNames(obj)
    // freeze properties before auto-freeze
    propNames.forEach(name => {
        let prop = obj[name]
        // freeze prop
        if ( typeof prop === 'object' && prop !== null ) {
            DeepFreeze(prop)
        }
    })
    // auto-freeze (nothing if already freeze)
    return Object.freeze(obj)
}

/**
 *
 */
const DeepEqual = function(obj1, obj2, strictDeep = false) {
    const top1 = obj1;
    const top2 = obj2;
    const run = (obj1, obj2) => {
        for (var p in obj1) {
            //Check property exists on both objects
            if (obj1.hasOwnProperty(p) !== obj2.hasOwnProperty(p)) return false;
            switch(typeof obj1[p]) {
                case "object":
                    if((Object.is(top1, obj1[p]) && Object.is(top2, obj2[p]))
                    || (Object.is(top2, obj1[p]) && Object.is(top1, obj2[p]))
                    || (Object.is(obj1, obj2))) continue;
                    if (!run(obj1[p], obj2[p])) return false;
                    break;
                //Compare function code
                case 'function':
                    if (typeof (obj2[p]) == 'undefined' || (obj1[p].toString() != obj2[p].toString())) return false;
                    break;
                //Compare values
                default:
                    if (obj1[p] != obj2[p]) return false;
            }
        }
        //Check object 2 for any extra properties
        for (var p in obj2) {
            if (typeof (obj1[p]) == 'undefined') return false;
        }
        return true;
    }
    return !strictDeep ? run(obj1, obj2) : (() => {
        return run(obj1, obj2) && (JSON.stringify(obj1) === JSON.stringify(obj2))
    })();
}

/**
 *
 */
const ValidURL = (uri, secure = false) => {
    let url;
    try {
        url = new URL(uri);
    } catch (ex) {
        return false;
    }
    return !!secure ? (url.protocol === 'https:' ? true : false) : true;
}

/**
 * [stringDistance description]
 * @param  {String} str1 - string to comparation
 * @param  {String} str2 - string to comparation
 * @see https://stackoverflow.com/questions/10473745/compare-strings-javascript-return-of-likely#36566052
 * @return {Number}      - estimated distance of strings
 */
const StringDistance = (str1, str2) => {//
    const distance = (s1, s2) => {
        s1 = s1.toLowerCase()
        s2 = s2.toLowerCase()
        let costs = []
        for (let i = 0; i <= s1.length; i++) {
             let lastValue = i;
             for (let j = 0; j <= s2.length; j++) {
                  if ( i === 0 ) {
                      costs[j] = j
                  } else {
                      if ( j > 0 ) {
                          let newValue = costs[j - 1]
                          if ( s1.charAt(i - 1) != s2.charAt(j - 1) ) {
                              newValue = Math.min(Math.min(newValue, lastValue),
                              costs[j]) + 1
                          }
                          costs[j - 1] = lastValue
                          lastValue = newValue
                      }
                  }
             }
             if ( i > 0 ) {
                 costs[s2.length] = lastValue
             }
        }
        return costs[s2.length]
    }
    let longer = str1,
        shorter = str2
    if ( str1.length < str2.length ) {
        longer = str2
        shorter = str1
    }
    let longerLength = longer.length
    if ( longerLength == 0 ) {
        return 1.0
    }
    return (longerLength - distance(longer, shorter)) / parseFloat(longerLength)
}

/**-------------------------------------------------------------------------------------------- OK|
 * Replace HTML text "entires"
 * @param rule {String|Array} - rule for mathching
 * @param replacement {String|Array} - item for replace the rule(s)
 * @param model {String} - HTML text
 * @param lang {String} - optional language definition for transcript [default: en-US]
 * @return {String} - HTML text
 */
const FindAndReplace = (rule, replacement, model, i18n = false) => {
    model = model.replace(/{{+[a-zA-Z0-9_]+=+[a-zA-Z0-9_=:.\/@#&-]+}}/gm, (wholeMatch) => {
        if ( wholeMatch ) {
            wholeMatch = wholeMatch.replace(/{{/g, '').replace(/}}/g, '')
            let index = wholeMatch.split('=')
            //
            if ( Array.isArray(rule) ) {
                for (let i = 0; i < rule.length; i++) {
                     switch (index[0]) {
                         case rule[i]:
                             if ( rule[i] === 'i18n' && IsServiceWorkerContext && i18n) {
                                 return i18n.getWord(index[1])
                             } else if ( rule[i] === 'i18n' && IsWebBrowserContext ) {
                                 return i18n.getWord(index[1])
                             } else {
                                 return (_.isFunction(replacement[i])) ? replacement[i](index[1]) : replacement[i]
                             }
                         break
                     }
                }
            } else {
                switch (index[0]) {
                    case rule:
                        return (_.isFunction(replacement)) ? replacement(index[1]) : replacement
                    break
                    case 'i18n':
                        if ( IsServiceWorkerContext && lang) {
                            return i18n.getWord(index[1])
                        }
                        return i18n.getWord(index[1])
                    break
                }
            }
        } else {
            return ''
        }
    })
    return model
}

/**
 * Queue [FIFO - First in, first out] - [call with constructor]
 */
const Queue = function() {
    this.q = []
    this.__proto__.push = item => {
        this.q.push(item)
    }
    this.__proto__.shift = () => {
        return this.q.shift() // empty array return "undefined"
    }
    this.__proto__.size = () => {
        return this.q.length
    }
}

/**
 * Stack [LIFO - Last in, first out] - [call with constructor]
 */
const Stack = function() {
    this.s = []
    this.__proto__.push = item => {
        this.s.push(item)
    }
    this.__proto__.shift = () => {
        return this.s.pop() // empty array return "undefined"
    }
    this.__proto__.last = () => {
        return this.s[this.s.length -1]
    }
    this.__proto__.size = () => {
        return this.s.length
    }
}

const PathName = showPath => {
    let lp = location.pathname
    if ( lp !== '/' ) {
        let list = lp.split('/')
        if ( list.length > 1 ) {
            let response = ''
            if ( /\.html/g.test(list[list.length -1]) ) {
                response = (!!showPath) ? list.toString().replace(/,/g, '/').slice(1).replace('.html', '') : list[list.length -1].replace('.html', '')
            } else {
                if ( list[0] === '' && list[list.length -1] === '' ) {
                    response = (!!showPath) ? list.toString().replace(/,/g, '/').slice(1) + 'index' : 'index'
                }
            }
            return (response !== '') ? response : 'index'
        }
    } else {
        return 'index'
    }
}

const DirsLevel = () => {
    let lp = location.pathname
    let pn = PathName()
    // differ of base domain
    if ( lp !== '/' ) {
        // check if have .html extension (file or folder)
        if ( /\.html/g.test(lp) ) {
            let levels = lp.replace('.html', '').split('/'),
                loc = ''
            if ( levels.length > 1 ) {
                for (let i = 0; i < levels.length; i++) {
                     if ( levels[i] !== '' && levels[i] !== pn ) {
                         loc += '../'
                     }
                }
            } else {
                loc = './';
            }
            return (loc !== '') ? loc : './';
        } else {
            let levels = lp.split('/'),
                loc = '';
            if ( levels.length > 1 ) {
                for (let i = 0; i < levels.length; i++) {
                     if ( levels[i] !== '' ) {
                         loc += '../'
                     }
                }
            } else {
                loc = './'
            }
            return (loc !== '') ? loc : './'
        }

    } else {
        return './'
    }
}

const Redirect = uri => {
    location.replace(uri)
    return false
}

const SendBeacon = (uri, data, auth) => {
    try {
        if ( auth ) {
            /**
             * Chrome bug not support Blob.type === 'application/json'
             * @see https://bugs.chromium.org/p/chromium/issues/detail?id=490015
             */
            data.auth = auth
            let serializedData = JSON.stringify(data),
                rawData = false
            if ( this.brower.isChrome ) {
                rawData = new Blob([serializedData], {
                    type: 'application/x-www-form-urlencoded'
                })
            } else {
                rawData = new Blob([serializedData], {
                    type: 'application/json'
                })
            }
            // send
            if ( rawData ) {
                sendBeacon(uri, rawData)
            }
        }
    } catch(ex) {} // logger?
}

export {
    Bytes2Size,
    DeepFreeze,
    ValidURL,
    StringDistance,
    FindAndReplace,
    Queue,
    Stack,
    PathName,
    DirsLevel,
    Redirect,
    SendBeacon
}

/*
import {
    Bytes2Size,
    DeepFreeze,
    StringDistance,
    FindAndReplace,
    Queue,
    Stack,
    PathName,
    DirsLevel,
    Redirect,
    SendBeacon
} from './Functions.mjs'
*/