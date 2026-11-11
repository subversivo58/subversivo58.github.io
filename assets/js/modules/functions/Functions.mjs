/**
 * Functions collection
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import _, {
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
} from '../helpers/Exporter.mjs'


//




const PressHoldCollorCharger = (element, initCallback, endCallback, completedCallback, timer) => {

    // make a `CustomEvent`
    let pressHoldEvent = new CustomEvent("pressHold"),
        pressHoldDuration = timer || 50, // duration "press" event
        frameId, counter = 0, finish;

    // Listening for the mouse and touch events
    element.addEventListener("mousedown", pressingDown, false);
    element.addEventListener("mouseup", notPressingDown, false);
    //element.addEventListener("mouseleave", notPressingDown, false);

    element.addEventListener("touchstart", pressingDown, {passive: false});
    element.addEventListener("touchend", notPressingDown, false);

    // Listening for our custom pressHold event
    element.addEventListener("pressHold", doSomething, false);

    function pressingDown(e) {
        // Start the timer
        requestAnimationFrame(step);
        //item.classList.add('background-charge-success')
        initCallback ? initCallback() : null;
        e.preventDefault();
    }
    function notPressingDown(e) {
        // Stop the timer
        cancelAnimationFrame(frameId);
        counter = 0;
        //item.classList.remove('background-charge-success')
        endCallback ? (endCallback(), (finish ? removeListeners() : null)) : null;
    }
    // Runs at 60fps when you are pressing down
    function step() {
        if ( counter < pressHoldDuration ) {
            frameId = requestAnimationFrame(step);
            counter++;
        } else {
            element.dispatchEvent(pressHoldEvent);
        }
    }
    function doSomething(e) {
        finish = true
        completedCallback ? completedCallback() : null;
    }

    function removeListeners() {
        element.removeEventListener("mousedown", pressingDown, false);
        element.removeEventListener("mouseup", notPressingDown, false);
        //element.addEventListener("mouseleave", notPressingDown, false);
        element.removeEventListener("touchstart", pressingDown, {passive: false});
        element.removeEventListener("touchend", notPressingDown, false);
        // Listening for our custom pressHold event
        element.removeEventListener("pressHold", doSomething, false);
    }
}





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
 * [description]
 * @param  {[type]}   node     [description]
 * @param  {Function} callback [description]
 * @param  {[type]}   options  [description]
 * @return {[type]}            [description]
 */
const SpyDOM = (node, callback, options) => {
    let observer = new MutationObserver(callback)
    observer.observe(node, options)
    return function(mutations) {
        for (let mutation of mutations) {
             for (let addedNode of [...mutation.addedNodes]) {
                  if ( Object.prototype.toString.call(addedNode).replace(/^\[object (.+)\]$/, '$1').toLowerCase() ) {
                      return addedNode;
                  }
             }
        }
    }
}

/**
 * BrightnessDetector - detect if is dark or ligth
 * @see a nice post {@link https://awik.io/determine-color-bright-dark-using-javascript/}
 * @copyright (c) 2018 Andreas Wik - [https://twitter.com/AndreasWik]
 * @param  { String } color        - rgb|a HEX formats
 * @return { Boolean }             - `true` to light, `false` to dark
 */
const BrightnessDetector = color => {
    //
    let brightness, r, g, b, hsp;
    // Check the format of the color, HEX or RGB?
    if ( color.match(/^rgb/) ) {
        // If HEX --> store the red, green, blue values in separate variables
        color = color.match(/^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*(\d+(?:\.\d+)?))?\)$/);
        r = color[1];
        g = color[2];
        b = color[3];
    } else {
        // If RGB --> Convert it to HEX: http://gist.github.com/983661
        color = +("0x" + color.slice(1).replace(color.length < 5 && /./g, '$&$&'));
        r = color >> 16;
        g = color >> 8 & 255;
        b = color & 255;
    }

    // HSP (Highly Sensitive Poo) equation from http://alienryderflex.com/hsp.html
    hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));

    // Using the HSP value, determine whether the color is light or dark
    if ( hsp > 127.5 ) {
        return true;  //'light';
    } else {
        return false; //'dark';
    }
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
            const audioElement = _.DOM.create('audio')
            audioElement.setAttribute('src', BaseRoot + sourceURL)
            audioElement.play();
            audioElement.addEventListener('ended', (event) => {
              audioElement.parentElement.removeChild(audioElement)
            })
        } catch(ex) {}
    })
}


/**
 * @REVISE - adjust selectors (button or div)
 * Color Picker - create a collor pallet
 * @param {String} element - target element (id[#] or class[.])
 */
const ColorPallet = containerTarget => {
    //const element = _.DOM.querySelector(containerTarget);
    _.DOM.waitEl(dc, containerTarget, list => {
        const element = list[0]


        element.insertAdjacentHTML('afterbegin', '<div id="pallet" class="col-12 mt-5 px-0"></div>')
        let values = '00336699CCFF',
            r,
            g,
            by,
            cor;
        const pallet = _.DOM.getById('pallet');
/*        for (r = 0; r < 6; r++) {
             for (g = 0; g < 6; g++) {
                  if ( g % 2 === 0 ) {
                      for (by = 0; by < 6; by++) {
                           cor = values.substr(2 * r, 2) + values.substr(2 * g, 2) + values.substr(2 * by, 2);
                           pallet.insertAdjacentHTML('afterbegin', '<button type="button" class="btn rounded-circle" style="background-color:#' + cor + '" btnColor="#' + cor + '">&nbsp;');
                      }
                      if ( g % 2 === 1) {
                          pallet.insertAdjacentHTML('afterbegin', '</button>');
                      }
                  }
             }
        }*/
        [

        '#ffffff', '#ffebee', '#fce4ec', '#f3e5f5', '#ede7f6', '#e3f2fd', '#e1f5fe', '#e0f7fa', '#e0f2f1', '#fffde7',
        '#f2f2f2', '#ffcdd2', '#f8bbd0', '#e1bee7', '#d1c4e9', '#bbdefb', '#b3e5fc', '#b2ebf2', '#b2dfdb', '#fff9c4',
        '#e6e6e6', '#ef9a9a', '#f48fb1', '#ce93d8', '#b39ddb', '#90caf9', '#81d4fa', '#80deea', '#80cbc4', '#fff59d',
        '#cccccc', '#e57373', '#f06292', '#ba68c8', '#9575cd', '#64b5f6', '#4fc3f7', '#4dd0e1', '#4db6ac', '#fff176',
        '#b3b3b3', '#ef5350', '#ec407a', '#ab47bc', '#7e57c2', '#42a5f5', '#29b6f6', '#26c6da', '#26a69a', '#ffee58',
        '#999999', '#f44336', '#e91e63', '#9c27b0', '#673ab7', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#ffeb3b',
        '#808080', '#e53935', '#d81b60', '#8e24aa', '#5e35b1', '#1e88e5', '#039be5', '#00acc1', '#00897b', '#fdd835',
        '#666666', '#d32f2f', '#c2185b', '#7b1fa2', '#512da8', '#1976d2', '#0288d1', '#0097a7', '#00796b', '#fbc02d',
        '#4d4d4d', '#c62828', '#ad1457', '#6a1b9a', '#4527a0', '#1565c0', '#0277bd', '#00838f', '#00695c', '#f9a825',
        '#000000', '#b71c1c', '#880e4f', '#4a148c', '#311b92', '#0d47a1', '#01579b', '#006064', '#004d40', '#f57f17'
        ].forEach((color, idx, arr) => {
             if ( idx % 10 === 0 ) {
                 pallet.insertAdjacentHTML('afterbegin', '<div class="col-12 px-0">')
             }
             pallet.insertAdjacentHTML('afterbegin', '<span class="btme m-0 d-inline-flex" style="width:8%;background-color:' + color + '" btnColor="' + color + '">&nbsp;</span>');
             if ( idx % 10 === 0 ) {
                 pallet.insertAdjacentHTML('afterbegin', '</div>')
             }

         })










        //pallet.insertAdjacentHTML('afterbegin', '<button btnColor="#FFFFFF" data-title="words.white" class="i18n btn rounded-circle bg-white">white</button><button data-title="words.restore" btnColor="default" class="i18n btn rounded-circle bg-white fa fa-undo">&#9100;</button></div>')
        //let subtree = _.qSA('[class^="i18n"]:not([translated])', _.qS(elem))
        //if ( subtree ) {
        //    ;[...subtree].forEach(node => {
        //        this.iLib.observe(node)
        //    })
        //}





    })

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
 */
const AnchorScrool = function() {
    let bod = _.DOM.getByTagName('html')[0];
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
        let offTop = 0;
        // calculate current scrolling
        window.addEventListener('scroll', function(evt) {
            offTop = target.getBoundingClientRect().y + window.scrollY - margin;
        }, false)

        element.addEventListener('click', e => {
           e.preventDefault()
           if ( offTop === 0 ) {
               offTop = target.getBoundingClientRect().y - margin;
           }
           window.scrollTo({
               top: offTop, // could be negative value
               left: 0,
               behavior: 'smooth' //@see support {@link https://caniuse.com/#feat=css-scroll-behavior}
           });
           return false
        }, _.EventOptions(false, false, false))
    }
    //
    _.DOM.waitEl(dc, '.anchor-link', index => {
        ;[...index].forEach(item => {
            let tag = item.tagName.toLowerCase()
            if ( tag === 'span' || tag === 'button' || tag === 'i' ) {
                 let target = _.DOM.getById(item.getAttribute('data-anchor-id'))
                 let margin = (item.getAttribute('data-anchor-mg')) ? item.getAttribute('data-anchor-mg') : 0
                 if ( !!target ) {
                     eventHandler(item, target, margin)
                 }
            } else if ( tag === 'a' ) {
                 if ( location.pathname.replace(/^\//, '') === item.pathname.replace(/^\//, '') && location.hostname === item.hostname ) {
                      let target = _.DOM.getById(item.hash.slice(1))
                      let margin = (item.getAttribute('data-anchor-mg')) ? item.getAttribute('data-anchor-mg') : 0
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
            let btnTop = _.DOM.getById('anchor-to-top')
            if ( bod.scrollTop > 400 ) {
                 if ( !btnTop ) {
                     let el = _.DOM.create('button')
                     el.id = 'anchor-to-top'
                     el.type = 'button'
                     el.setAttribute('class', 'fx outline-none flip-x btn-circle btn-md cp')
                     el.innerHTML = '🚀';
                     bod.appendChild(el)
                     el.addEventListener('click',() => {
                         window.scroll({
                             top: 0, // could be negative value
                             left: 0,
                             behavior: 'smooth' // https://caniuse.com/#feat=css-scroll-behavior
                         });
                         return false
                     }, _.EventOptions(false, true, false))
                     setTimeout(() => {
                         _.DOM.fadeOut(el, 2.6, () => {
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
    })
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
    // Página que declara a própria rota (ex.: 404.html, servida pelo GitHub Pages
    // em qualquer endereço inexistente) com <meta name="route" content="404">
    const declared = document.querySelector('meta[name="route"]')
    if ( declared && declared.content ) {
        return declared.content
    }
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
    ReadingTextTime,
    AnchorScrool,
    BrightnessDetector,
    SpyDOM,
    PressHoldCollorCharger
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