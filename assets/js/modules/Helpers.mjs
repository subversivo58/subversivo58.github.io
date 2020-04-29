/**
 * Utilities collection
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

//
let passiveListener = false
//
let _ = {
    /**
     * utils utility
     */
    object2String(o) {
        return Object.prototype.toString.call(o)
    },
    hasOwnProperty(obj, prop) {
        return Object.prototype.hasOwnProperty.call(obj, prop)
    },
    inArray(needle, haystack) {
        try {
            needle.includes(haystack)
        } catch(e) {
            return false
        }
    },
    type(obj) {
        return (obj) ? this.object2String(obj).replace(/^\[object (.+)\]$/, '$1').toLowerCase() : 'undefined'
    },
    //
    string2ArrayBuffer(str) {
        let encoder = new TextEncoder('utf-8')
        return encoder.encode(str)
    },
    arrayBuffer2String(buffer) {
        let decoder = new TextDecoder('utf-8')
        return decoder.decode(buffer)
    },
    buffer2Hex(arr) {
        let i,
            len,
            hex = '',
            c
        for (i = 0, len = arr.length; i < len; i += 1) {
             c = arr[i].toString(16)
             if ( c.length < 2 ) {
                 c = '0' + c
             }
             hex += c
        }
        return hex
    },
    hex2Buffer(hex) {
      let i,
          byteLen = hex.length / 2,
          arr,
          j = 0
      if ( byteLen !== parseInt(byteLen, 10) ) {
          throw new Error("Invalid hex length '" + hex.length + "'")
      }
      arr = new Uint8Array(byteLen)
      for (i = 0; i < byteLen; i += 1) {
           arr[i] = parseInt(hex[j] + hex[j + 1], 16)
           j += 2
      }
      return arr
    },
    merge(origin, ...args) {
        if ( !Array.isArray(...args) ) {
            return origin
        }
        // no duplicates ordered by "sort()"
        return Array.from(
            new Set(origin.concat(...args))
        ).sort()
    },

    /**
     * Base64
     */
    base64(string) {
        return {
            encode: btoa,
            decode: atob
        }
    },

    /**
     * Old method to extends object
     * extend(origin, add) {
     *     // Don't do anything if add isn't an object
     *     if ( !add || !this.isObject(add) ) {
     *         return origin
     *     }
     *
     *     let keys = Object.keys(add),
     *         i = keys.length;
     *     while (i--) {
     *         origin[keys[i]] = add[keys[i]]
     *     }
     *     return origin
     * }
     */
    extend(...args) {
        try {
            return Object.assign(...args)
        } catch(e) {
            return {}
        }
    },

    /**
     * Generate UUID v4 based in `crypto.getRandomValues()`
     * @license  unlicensed at date: 4, April 2020
     * @see original question on stackoverflow - [https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript#2117523]
     *  -- note: short version ignore security `crypto.getRandomValues()` and use `Math.random()`
     * @return {String}
     */
    uuidv4(shortVersion = false) {
        return shortVersion ? Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15) : ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16))
    },
    // utils "is"
    isString(str) {
        return typeof str === 'string'
    },
    isBoolean(val) {
        return typeof val === 'boolean'
    },
    isInteger(int){
        return Number.isInteger(int)
    },
    isNumber(arg) {
        return typeof arg === 'number'
    },
    isNull(arg) {
        return arg === null
    },
    isObject(obj) {
        return typeof obj === 'object'
    },
    isElement(obj) {
        try {
            return (obj.constructor.__proto__.prototype.constructor.name) ? true : false
        } catch(_) {
            return false
        }
    },
    isNodeList(list) {
        return (!this.isUndefined(list.length) && !this.isUndefined(list.item))
    },
    isFile(inp) {
        return inp instanceof File ? true : false
    },
    isBlob(inp) {
        return inp instanceof Blob ? true : false
    },
    isArray(obj) {
        return Array.isArray(obj)
    },
    isArrayBufferView(obj) {
        return obj && obj.buffer instanceof ArrayBuffer && obj.byteLength !== undefined
    },
    isUndefined(arg) {
        return arg === void 0
    },
    isFunction(arg) {
        return typeof arg === 'function'
    },
    isPrimitive(arg) {
        return arg === null || typeof arg === 'boolean' || typeof arg === 'number' || typeof arg === 'string' || /* ES6 symbol */ typeof arg === 'symbol' || typeof arg === 'undefined'
    },
    isDate(d) {
        return this.isObject(d) && this.object2String(d) === '[object Date]'
    },
    isError(e) {
        return this.isObject(e) && (this.object2String(e) === '[object Error]' || e instanceof Error)
    },
    isRegEx(re) {
        return this.isObject(re) && this.object2String(re) === '[object RegExp]'
    },
    isSymbol(arg) {
        return typeof arg === 'symbol'
    },
    isAsyncFunction(obj) {
        return obj && this.isFunction(obj) && this.object2String(obj) === '[object AsyncFunction]'
    },
    isPromise(obj) {
        return obj && this.isObject(obj) && !this.isFunction(obj) && (obj instanceof Promise && this.object2String(obj) === '[object Promise]')
    },
    isJWT(str) {
        return this.isString(str) && /^[a-zA-Z0-9\-_]+?\.[a-zA-Z0-9\-_]+?\.([a-zA-Z0-9\-_]+)?$/.test(str)
    },
    isBase64(str) {
        //@see https://developer.mozilla.org/en-US/docs/Web/API/WindowOrWorkerGlobalScope/btoa#Polyfill
        return this.isString(str) && /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/.test(str)/*/^[A-Za-z0-9\-_]+$/.test(str)*/
    },
    isEqual(a, b) {
        return Object.is(a, b)
    },
    isMap(obj) {
        return this.isObject(obj) && (obj instanceof Map && this.object2String(obj) === '[object Map]')
    },
    isSet(obj) {
        return this.isObject(obj) && (obj instanceof Set && this.object2String(obj) === '[object Set]')
    },
    /**
     * utils utility
     */
    node2Array(nodeList) {
        return this.isNodeList(nodeList) ? [...nodeList] : []
    },
    EventOptions(capture, passive, once) {
        // test passive support [every first]
        let passiveSupport = () => {
            let supportsPassive = false
            try {
                let opts = Object.defineProperty({}, 'passive', {
                    get() {
                        supportsPassive = true
                    }
                });
                wd.addEventListener('testPassiveListener', null, opts)
                wd.removeEventListener('testPassiveListener', null, opts)
            } catch (e) {}
            if ( supportsPassive || wd.Modernizr && Modernizr.passiveeventlisteners ) {
                passiveListener = true
                return true
            }
            return supportsPassive
        }
        let ObjRes = (cap, pas, onc) => {
            return {
                capture: cap,
                passive: pas,
                once: onc
            }
        }
        if ( this.isBoolean(capture) && this.isBoolean(passive) && this.isBoolean(once) ) {
            if ( passiveListener || passiveSupport() ) {
                capture = (!!capture) ? true : false
                passive = (!!passive) ? true : false
                once = (!!once) ? true : false
                return ObjRes(capture, passive, once)
            } else {
                return capture
            }
        } else if ( this.isBoolean(capture) && this.isBoolean(passive) && !this.isBoolean(once) ) {
            if ( passiveListener || passiveSupport() ) {
                capture = (!!capture) ? true : false
                passive = (!!passive) ? true : false
                return ObjRes(capture, passive, false)
            } else {
                return capture
            }
        } else if ( this.isBoolean(capture) && !this.isBoolean(passive) && !this.isBoolean(once) ) {
            return capture
        } else  if ( !this.isBoolean(capture) && this.isBoolean(passive) && this.isBoolean(once) ) {
            if ( passiveListener || passiveSupport() ) {
                once = (!!once) ? true : false
                passive = (!!passive) ? true : false
                return ObjRes(true, passive, once)
            } else {
                return true
            }
        } else if ( !this.isBoolean(capture) && !this.isBoolean(passive) && this.isBoolean(once) ) {
            if ( passiveListener || passiveSupport() ) {
                once = (!!once) ? true : false
                return ObjRes(false, false, once)
            } else {
                // if no have support to "passive" assume no have support to "once"
                return false
            }
        }
    },
    objectSize(obj) {
        function sizeOfObject (object) {
            if ( object == null ) {
                return 0
            }
            var bytes = 0
            for (var key in object) {
                 if ( !Object.hasOwnProperty.call(object, key) ) {
                     continue
                 }
                 bytes += sizeof(key)
                 try {
                     bytes += sizeof(object[key])
                 } catch (ex) {
                     if ( ex instanceof RangeError ) {
                         // circular reference detected, final result might be incorrect
                         // let's be nice and not throw an exception
                         bytes = 0
                     }
                 }
            }
            return bytes
        }
        if ( this.isArrayBufferView(object) ) {
            return object.byteLength
        }
        var objectType = typeof (object)
        switch (objectType) {
            case 'string':
                return object.length * 2
            case 'boolean':
                return 4
            case 'number':
                return 8
            case 'object':
                return sizeOfObject(object)
            default:
                return 0
        }
    },
    isMobile: ((dc, wd) => {
        // get browser "User-Agent" or vendor ... see "opera" property in `window`
        const wua = (wd.navigator.userAgent || wd.navigator.vendor || wd.opera || '');
        try {
            /**
             * Creating a touch event ... in modern browsers with touch screens or emulators (but not mobile) does not cause errors.
             * Otherwise, it will create a `DOMException` instance
             */
            dc.createEvent("TouchEvent");

            // check touchStart event
            (('ontouchstart' in wd) || ('ontouchstart' in dc.documentElement) || wd.DocumentTouch && wd.document instanceof DocumentTouch || wd.navigator.maxTouchPoints || wd.navigator.msMaxTouchPoints) ? void(0) : new Error('failed check "ontouchstart" event');

            // check `mediaQueryList` ... pass as modern browsers
            let mQ = wd.matchMedia && matchMedia("(pointer: coarse)");
            // if no have, throw error to use "User-Agent" sniffing test
            if ( !mQ || mQ.media !== "(pointer: coarse)" || !mQ.matches ) {
                throw new Error('failed test `mediaQueryList`')
            }

            // if there are no failures the possibility of the device being mobile is great (but not guaranteed)
            return true
        } catch(ex) {
            // fall back to User-Agent sniffing
            return /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(wua) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(wua.substr(0,4))
        }
    })(document, window),
    /**
     * Minimal detect device's
     */
    device: (() => {
        let devices = {},
            windows = ua.match(/(Windows Phone);?[\s\/]+([\d.]+)?/),
            android = ua.match(/(Android);?[\s\/]+([\d.]+)?/),
            ipad = ua.match(/(iPad).*OS\s([\d_]+)/),
            ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/),
            iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/)
        devices.ios = devices.android = devices.windows = devices.iphone = devices.ipod = devices.ipad = devices.androidChrome = false
        // Windows
        if ( windows ) {
            devices.os = 'windows'
            devices.osVersion = windows[2]
            devices.windows = true
        }
        // Android
        if ( android && !windows ) {
            devices.os = 'android'
            devices.osVersion = android[2]
            devices.android = true
            devices.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0
        }
        if ( ipad || iphone || ipod ) {
            devices.os = 'ios'
            devices.ios = true
        }
        // iOS
        if ( iphone && !ipod ) {
            devices.osVersion = iphone[2].replace(/_/g, '.')
            devices.iphone = true
        }
        if ( ipad ) {
            devices.osVersion = ipad[2].replace(/_/g, '.')
            devices.ipad = true
        }
        if ( ipod ) {
            devices.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null
            devices.iphone = true
        }
        // iOS 8+ changed UA
        if ( devices.ios && devices.osVersion && ua.indexOf('Version/') >= 0 ) {
            if ( devices.osVersion.split('.')[0] === '10' ) {
                devices.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0]
            }
        }
        // Webview
        devices.webView = (iphone || ipad || ipod) && ua.match(/.*AppleWebKit(?!.*Safari)/i) || false
        // Pixel Ratio
        devices.pixelRatio = wd.devicePixelRatio || 1
        return devices
    })()
}

// allowed context's
switch (true) {
    // ServiceWorker
    case IsServiceWorkerContext:
        // do stuff...
        break

    // WebWorker
    case IsWebWorkerContext:
        // do stuff...
        break

    // "Browser" top-level context and `<iframe>`
    case IsWebBrowserContext:
    default:
        /**
         * Helper's DOM manipulate HTMLElement [not allow in (Web|Service) Worker]
         */
        _.DOM = {
            create(tag) {
                return dc.createElement(tag)
            },
            addNode(node) {
                dc.body.appendChild(node)
            },
            ceateTextNode(text) {
                return dc.createTextNode(text)
            },
            getById(id) {
                return dc.getElementById(id)
            },
            getByClassName(className) {
                return dc.getElementsByClassName(className)
            },
            getByTagName(tagName, node) {
                return node ? node.getElementsByTagName(tagName) : dc.getElementsByTagName(tagName)
            },
            querySelector(selector, node, head = false) {
                return head ? dc.head.querySelector(selector) : (selector && node) ? node.querySelector(selector) : dc.querySelector(selector)
            },
            querySelectorAll(selector, node, head = false) {
                return head ? dc.head.querySelectorAll(selector) : (selector && node) ? node.querySelectorAll(selector) : dc.querySelectorAll(selector)
            },
            getAttribute(node, attribute) {
                return node.getAttribute(attribute)
            },
            // waithing dinãmic elements
            waitEl(node = dc, selector, callback) {
                let Animation,
                    list,
                    step = () => {
                        list = this.querySelectorAll(selector, node)
                        if ( list.length !== 0 ) {
                            cancelAnimationFrame(Animation)
                            callback(list)
                        } else {
                            Animation = requestAnimationFrame(step)
                        }
                }
                setTimeout(step, 100)
            },
            getPosition(node) {
                // default positions
                let xPos = 0,
                    yPos = 0
                // loop
                while (node) {
                    if ( node.tagName === "BODY" ) {
                        // deal with browser quirks with body/window/document and page scroll
                        let xScroll = node.scrollLeft || dc.documentElement.scrollLeft,
                            yScroll = node.scrollTop  || dc.documentElement.scrollTop
                        xPos += ( node.offsetLeft - xScroll + node.clientLeft )
                        yPos += ( node.offsetTop  - yScroll + node.clientTop )
                    } else {
                       // for all other non-BODY elements
                       xPos += ( node.offsetLeft - node.scrollLeft + node.clientLeft )
                       yPos += ( node.offsetTop  - node.scrollTop  + node.clientTop )
                    }
                    node = node.offsetParent
                }
                return {
                   x: xPos,
                   y: yPos
                }
            },
            event(element, event, callback, options = false, mode = true, finallyCb = false) {
                if ( !element ) {
                    return
                }
                mode = mode ? 'addEventListener' : 'removeEventListener'
                let opts = _.isObject(options) ? options : _.EventOptions(false, true, false)

                if ( !_.isArray(element) && _.isArray(event) ) {
                    // multi events for same element
                    event.forEach((ev, idx, arr) => {
                        element[mode](ev, callback, opts)
                        if ( idx === arr.length -1 && finallyCb ) {
                            finallyCb()
                        }
                    })
                } else if ( _.isArray(element) ) {
                    let isArray = _.isArray(event)
                    // many elements for one or more events ... note: events length equal elements length
                    element.forEach((el, idx, arr) => {
                        el[mode]((isArray ? event[idx] : event), callback, opts)
                        if ( idx === arr.length -1 && finallyCb ) {
                            finallyCb()
                        }
                    })
                } else {
                    // one element one event
                    element[mode](event, callback, opts)
                    if ( finallyCb ) {
                        finallyCb()
                    }
                }
            },

            /**
             *
             */
            fadeOut(element, timing, callback = false) {
                let StyleSheet = dc.styleSheets[1],
                CSSFadeOutIdx,
                    classuuid = _.uuidv4(true)
                if ( !_.isNumber(timing) ) {
                    timing = .4
                }
                element.classList.add('fadeout-'+classuuid)
                CSSFadeOutIdx = StyleSheet.insertRule(`.fadeout-${classuuid} {
                    transition: ${timing}s;
                    opacity: 0;
                }`)
                setTimeout(() => {
                    element.classList.add('d-none')
                    StyleSheet.deleteRule(CSSFadeOutIdx)
                    if ( _.isFunction(callback) ) {
                        callback(element)
                    }
                }, (timing * 1000))
            },
            /**
             * [fadeIn description]
             * @param  {[type]}  element  [description]
             * @param  {[type]}  timing   [description]
             * @param  {Boolean} callback [description]
             * @return {[type]}           [description]
             */
            fadeIn(element, timing, callback = false) {
                let StyleSheet = dc.styleSheets[1],
                    CSSFadeInIdx,
                    classuuid = _.uuidv4(true)
                if ( !_.isNumber(timing) ) {
                    timing = .4
                }
                element.classList.add('fadein-'+classuuid)
                element.classList.remove('d-none')
                CSSFadeInIdx = StyleSheet.insertRule(`.fadein-${classuuid} {
                    opacity: 0;
                    animation-name: fadeInOpacity;
                    animation-iteration-count: 1;
                    animation-timing-function: ease-in;
                    animation-duration: ${timing}s;
                }`)
                setTimeout(() => {
                    element.classList.remove('fadein-'+classuuid)
                    StyleSheet.deleteRule(CSSFadeInIdx)
                    if ( _.isFunction(callback) ) {
                        callback(element)
                    }
                }, (timing * 1000))
            }
        }

        _.$ = function(selector) {

            // constructor
            const base = function(selector) {
                if ( !selector ) {
                    return
                }
                if ( !(this instanceof base) ) {
                    return new base(arguments[0])
                }
                if ( _.isElement(selector) && /window/gi.test(_.object2String(selector)) ) {
                    this.elems = [window]
                }
                if ( _.isElement(selector) && /document/gi.test(_.object2String(selector)) ) {
                    this.elems = [document]
                }
                this.elems = dc.querySelectorAll(selector)
            }

            let methods = {
                element() {
                    return ( this.elems.length === 1 ) ? [this.elems[0]] : this.elems
                },
                each(callback) {
                    if (!callback || typeof callback !== 'function') return;
                    for (let i = 0; i < this.elems.length; i++) {
                        callback(this.elems[i], i);
                    }
                    return this;
                },
                addClass(className) {
                    let list = className.trim().split(' ')
                    this.each(function (item) {
                        list.some(c => item.classList.add(c))
                    });
                    return this;
                },
                removeClass(className) {
                    let list = className.trim().split(' ')
                    this.each(function (item) {
                        list.some(c => item.classList.remove(c))
                    });
                    return this;
                },
                hasClass(className) {
                    for (let i = 0; i < this.elems.length; i++) {
                         if ( this.elems[i].classList.contains(className) ) {
                             return this
                         }
                    }
                    return false
                },
                attr(attribute, value) {
                    if ( !!value ) {
                        this.each(item => {
                            item.setAttribute(attribute, value)
                        })
                        return this
                    }
                    for (let i = 0; i < this.elems.length; i++) {
                         if ( this.elems[i].getAttribute(attribute) ) {
                             return this.elems[i].getAttribute(attribute)
                         }
                    }
                     return false
                },
                removeAttribute(attribute) {
                    this.each(item => {
                        item.removeAttribute(attribute)
                    })
                    return this
                },
                isVisible() {
                    for (let i = 0; i < this.elems.length; i++) {
                         if ( !!( this.elems[i].offsetWidth || this.elems[i].offsetHeight || this.elems[i].getClientRects().length ) ) {
                             return this
                         }
                    }
                    return false
                },
                remove() {
                    this.each(item => {
                        item.parentElement.removeChild(item)
                    })
                    this.elems = [] // clear
                }
            }

            // prototype farm
            let keys = Object.keys(methods)
            for (let i = 0; i < keys.length; i++) {
                 base.prototype[keys[i]] = methods[keys[i]]
            }

            //
            return new base(selector)
        }

        _.browser = {
            isSafari: (() => {
                let UA = ua.toLowerCase()
                return (UA.indexOf('safari') >= 0 && UA.indexOf('chrome') < 0 && UA.indexOf('android') < 0)
            })(),
            isUiWebView: /(iPhone|iPod|iPad).*AppleWebKit(?!.*Safari)/i.test(ua),
            isIE: nv.pointerEnabled || nv.msPointerEnabled || false,
            isIETouch: (nv.msPointerEnabled && nv.msMaxTouchPoints > 1) || (nv.pointerEnabled && nv.maxTouchPoints > 1) || false,
            islteIE9: (() => {
                // create temporary DIV
                let div = _.DOM.create('div')
                // add content to tmp DIV which is wrapped into the IE HTML conditional statement
                div.innerHTML = '<!--[if lte IE 9]><i></i><![endif]-->'
                // return true / false value based on what will browser render
                return _.DOM.getByTagName('i', div).length === 1
            })(),
            isEdge: ua.indexOf('Edge') !== -1 && (!!nv.msSaveBlob || !!nv.msSaveOrOpenBlob),
            isOpera: !!wd.opera || ua.indexOf(' OPR/') >= 0,
            isChrome: !!wd.chrome && !wd.opera || !ua.indexOf(' OPR/') >= 0,
            isFirefox: typeof wd.InstallTrigger !== 'undefined' && /Firefox/i.test(ua)
        }
        _.browser.isWindows = (_.browser.isIE || _.browser.isIETouch || _.browser.islteIE9 || _.browser.isEdge) || false

        break;
}

export default _