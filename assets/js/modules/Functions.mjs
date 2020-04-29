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
 * Sound play - execute site audio effects
 */
const SoundPlay = sourceURL => {
    // @see https://caniuse.com/#search=web%20audio
    const context = new AudioContext()
    // .ogg like Chrome and FireFox
    Fetch(sourceURL).then(response => response.arrayBuffer()).then(arrayBuffer => context.decodeAudioData(arrayBuffer)).then(audioBuffer => {
        const source = context.createBufferSource()
        source.buffer = audioBuffer
        source.connect(context.destination)
        source.start()
    }).catch(e => {
        // fallback
        try {
            const elementAudio = _.DOM.create('audio')
            audioElement.setAttribute('src', BaseRoot + sourceURL)
            audioElement.play();
        } catch(ex) {}
    })
}


/**
 * @REVISE - adjust selectors (button or div)
 * Color Picker - create a collor pallet
 * @param {String} element - target element (id[#] or class[.])
 */
const ColorPallet = containerTarget => {
    const element = _.DOM.querySelector(containerTarget);
    element.insertAdjacentHTML('afterbegin', '<div id="pallet" class="col mt-5 px-0">')
    let values = '00336699CCFF',
        r,
        g,
        by,
        cor;
    const pallet = _.DOM.getById('pallet');
    for (r = 0; r < 6; r++) {
         for (g = 0; g < 6; g++) {
              if ( g % 2 === 0 ) {
                  for (by = 0; by < 6; by++) {
                       cor = values.substr(2 * r, 2) + values.substr(2 * g, 2) + values.substr(2 * by, 2);
                       pallet.insertAdjacentHTML('afterbegin', '<button class="btn btn-lg" style="background-color:#' + cor + '" btnColor="#' + cor + '">');
                  }
                  if ( g % 2 === 1) {
                      pallet.insertAdjacentHTML('afterbegin', '</button>');
                  }
              }
         }
    }
    pallet.insertAdjacentHTML('afterbegin', '<button btnColor="#FFFFFF" data-title="words.white" class="i18n btn btn-lg bg-white"></button><button data-title="words.restore" btnColor="default" class="i18n btn btn-lg bg-white fa fa-undo"></button></div>')
    //let subtree = _.qSA('[class^="i18n"]:not([translated])', _.qS(elem))
    //if ( subtree ) {
    //    ;[...subtree].forEach(node => {
    //        this.iLib.observe(node)
    //    })
    //}
}

/**
 * Nice time for humans readable
 * @see https://stackoverflow.com/questions/8211744/convert-time-interval-given-in-seconds-into-more-human-readable-form#22731327
 * @param  { Integer } milliseconds - UNIX Timestamp
 * @return { String }
 */
const TimeLength = milliseconds => {
    let data = new Date(milliseconds);
    return data.getUTCHours() + ' hours, ' + data.getUTCMinutes() + ' minutes and ' + data.getUTCSeconds() + ' second(s)';
}

/**
 * Time ago (UNIX)
 * @param  { String|Number } time - UNIX Timestamp
 * @return { String }             - human readable time elapsed [just in current language]
 */
const TimeAgo = time => {
    let round = Math.round,
        now = Date.now(),
        t
    let format = (n, unit) => {
        let a = 'hora' == unit ? 'ha' : '1'
        unit = 1 == n ? unit : (unit !== 'mês' ? unit + 's' : unit)
        return (1 == n ? a : n) + ' ' + unit
    }
    // past / future
    let diff = (time > now) ? (time - now) : (now - time)
    // just now
    if (1e3 > diff) return 'agora'
    // s, m, h, d, w, m, y
    if (60 > (t = round(diff / 1e3))) return format(t, 'segundo')
    if (60 > (t = round(diff / 6e4))) return format(t, 'minuto')
    if (24 > (t = round(diff / 3.6e+6))) return format(t, 'hora')
    if (7 > (t = round(diff / 8.64e+7))) return format(t, 'dia');
    if (4.34812 > (t = diff / 6.048e+8)) return format(round(t), 'semana')
    if (12 > (t = round(diff / 2.63e+9))) return format(t, 'mês')
    if (10 > (t = round(diff / 3.156e+10))) return format(t, 'ano')
    // decades
    return format(round(diff / 3.156e+11), 'década')
}




/**
 * WPM (Words Per Minute) - calculate readind time expected with base 250 w2ords per minute
 * @param  { String } text - words collection
 * @return { Object }
 */
const ReadingTextTime = text => {
    let wordsByMinute = 250,
        words = text.split(/\s/g).length
    return {
        time: Math.ceil(words / wordsByMinute),
        words: words
    }
}

/**
 * Scrool Move Anchors
 *
anchorScrool() {
    let bod = _.getTN('html')[0]
    let speed = length => {
        let result = Math.abs(length)
        if ( result < 500 ) {
             return 700
        }
        if ( result > 1500 ) {
             return 1000
        } else {
             return length
        }
    }
    let eventHandler = (element, target, margin) => {
        let length = Math.abs(target.offsetTop - bod.scrollTop),
            timing = speed(length);
        element.addEventListener('click', e => {
           e.preventDefault()
           $('html, body').animate({
              scrollTop: target.offsetTop - margin
           }, timing)
           return false
        }, _.EventOptions(false, false, false))
    }
    let index = _.getCN('anchor-link')
    if ( index.length >= 1 ) {
        [...index].forEach(item => {
            let tag = item.tagName.toLowerCase()
            if ( tag === 'span' || tag === 'button' || tag === 'i' ) {
                 let target = _.getBI(_.getA(item, 'data-anchor-id'))
                 let margin = (_.getA(item, 'data-anchor-mg')) ? _.getA(item, 'data-anchor-mg') : 0
                 if ( !!target ) {
                     eventHandler(item, target, margin)
                 }
            } else if ( tag === 'a' ) {
                 if ( location.pathname.replace(/^\//, '') === item.pathname.replace(/^\//, '') && location.hostname === item.hostname ) {
                      let target = _.getBI(item.hash.slice(1))
                      let margin = (_.getA(item, 'data-anchor-mg')) ? _.getA(item, 'data-anchor-mg') : 0
                      if ( !!target ) {
                          eventHandler(item, target, margin)
                      }
                 }
            } else {
                 return false
            }
        })
        // on scroll
        wd.addEventListener('scroll', () => {
            let btnTop = _.getBI('anchor-to-top')
            if ( bod.scrollTop > 400 ) {
                 if ( !btnTop ) {
                     let el = _.create('button')
                     el.id = 'anchor-to-top'
                     el.type = 'button'
                     _.setA(el, 'class', 'fx bg-sky btn rounded-0 cp')
                     el.style.bottom = '25px'
                     el.style.right = '25px'
                     el.innerHTML = (i18n.combo.hasOwnProperty('btn_top')) ? i18n.combo.btn_top : 'Back To Top'
                     bod.appendChild(el)
                     el.addEventListener('click',() => {
                         $('html, body').animate({
                             scrollTop : 0
                         }, 800)
                         return false
                     }, _.EventOptions(false, true, false))
                     setTimeout(() => {
                         $(el).fadeOut('slow', () => {
                             el.remove()
                         })
                     }, 3000)
                 }
            } else {
                 if ( btnTop ) {
                      btnTop.parentNode.removeChild(btnTop)
                 }
            }
        }, _.EventOptions(false, true, false))
    }
}*/
















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
    DeepEqual,
    ValidURL,
    StringDistance,
    FindAndReplace,
    Queue,
    Stack,
    PathName,
    DirsLevel,
    Redirect,
    SendBeacon,
    SoundPlay,
    ColorPallet,
    TimeLength,
    TimeAgo,
    ReadingTextTime
}

/*
import {
    Bytes2Size,
    DeepFreeze,
    DeepEqual,
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