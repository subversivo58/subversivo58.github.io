/**
 * Console - Wraper to rewrite `console`
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
//setTimeout(console.log.bind(console, `%c/**\n * Subversivo58 | Blog\n * @license The MIT License (MIT)                  - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]\n * @copyright Copyright (c) 2017-${new Date().getFullYear()} Lauro Moraes - [https://github.com/subversivo58]\n * @version 0.1.0 [development stage]              - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]\n * @see Third Party Software                       - [https://subversivo58.local.io/copyright.html]\n*/`, 'color: #505252; font-weight:bold;font-size:14px;margin-top: 10px;'))

// DevTools warning [like a Facebook style]
//setTimeout(console.log.bind(console,'%cStop!\n%cThis is a browser feature intended for developers. If someone told you to copy and paste something here to enable a site feature or \"hack\" someone\'s account, it is a scam and will give them access to your site account.\nSee https://subversivo58.local.io/you-in-control-of-your-data.html#self-security-hosted for more information.\n\n\n','color:red; font-size:60px; font-weight: bold; -webkit-text-stroke: 1px black;','font-size: 18px; margin-top: 10px;'))


//setTimeout(console.log.bind(console, '%cIf you want to see the debug dump go to: https://subversivo58.local.io/advanced.html and activate the debug panel. There you will find all the system logs','font-size: 14px; margin-top: 10px;'))




// get module current url
const ModuleUrl = import.meta.url

// pre-store original console
const __console__ = console;

// debug object definition
const __DEBUG__ = {
    // default: beware of this change, the `console` and its properties in the global scope will be disabled
    method: 'debug:none',
    // methods allowed ... fallback to "default"
    allow: [
        'debug:none',        // disable `console`
        'development:debug', // the `console` will not be modified, all custom options are available
        'production:debug'   // only "custom debug" is avaliable ... `console` sa been disabled
    ]
}

// get debug rule from `<meta>`
const GETDEBUG = document.head.querySelector('meta[name="DEBUG"]');

//
if ( GETDEBUG ) {
    let debugtype = String(GETDEBUG.getAttribute('content')).toLowerCase();
    __DEBUG__.method = __DEBUG__.allow.includes(debugtype) ? debugtype : 'debug:none';
}

/**
 * @description check is have "captureStackTrace" property in `Error` object
 * @see V8 Stack Trace API            - {@link https://v8.dev/docs/stack-trace-api#stack-trace-collection-for-custom-exceptions}
 * @see non V8 (Firefox) Mozilla Docs - {@link https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Static_methods}
 * @type { Boolean }
 */
const captureStackTrace = 'captureStackTrace' in Error ? true : false;

/**
 * Get all console properties name
 * @note - use `.filter()` on `Object.getOwnPropertyNames()` because Firefox return "name" and "length" property
 * @return { Array } - supported propeties by `Object.getOwnPropertyNames()` ... fallback to static "possible list"
 */
const consoleTypes = ('getOwnPropertyNames' in Object) ? Object.getOwnPropertyNames(console).filter(k => !/(name|length)/.test(k)) : ["debug","error","info","log","warn","dir","dirxml","table","trace","group","groupCollapsed","groupEnd","clear","count","countReset","assert","profile","profileEnd","time","timeLog","timeEnd","timeStamp","context","memory"];

// Proxy to change "console"
const $ = new Proxy({}, {
    get: function(obj, prop) {
        if ( prop in obj ) {
            return obj[prop]
        }
        throw new ReferenceError(`${prop} is not defined`)
    },
    set: function(obj, prop, val) {
        if ( prop in obj ) {
            throw new TypeError(`Assignment to constant variable. Property: "${prop}"`)
        }
        return Reflect.set(...arguments);
    }
})

// show time (ms)
const getTime = () => {
    let tmer = typeof window !== 'undefined' ? window.performance || Date : Date
    return parseFloat(timer.now().toFixed(3));
}

//
const noop = () => {}

//
const setTimeoutSync = (callback, ms) => {
    const start = Date.now()
    let now = start

    while ( now - start < ms ) {
        now = Date.now()
    }

    if ( typeof callback === 'function' ) {
        callback()
    }
}

/**
 * @description  Check if is `Error` object or `instanceof Error`
 * @param  { Object } error -
 * @return { Boolean }      -
 */
const isError = error => typeof error === 'object' && (Object.prototype.toString.call(error) === '[object Error]' || error instanceof Error);

/**
 * @description Formater a "stack" `Error` message
 * @param  { Object } instanceOfError -
 * @return { Object }                 - return a "name" and "message" of `Error` and, formatted "stack" (`Array`)
 */
const StackTraceFormatter = instanceOfError => {
    // prevent checking
    if ( !isError(instanceOfError) ) {
        return '';
    }
    let { name, message, stack } = instanceOfError;
    const [
       baseURI,
       V8baseRegEx,
       nonV8UriReg,
       lineNumberReg,
       parentReg
    ] = [
       location.protocol + '//' + location.host + '/',
       /(\()|(:\d+:\d+)|(.*(?=:\d+:\d+))|(\))/g,
       /^(.*(?=@))|(:\d+:\d+)|(.*(?=(@|:\d+:\d+)))/g,
       /(:\d+:\d+)$/,
       /\(|\)/g
    ];
    /**
     * Adjust stack
     */
    let tmpStack = name;

    // V8 (non standart) @see
    if ( captureStackTrace ) {
        //
        tmpStack = stack.split('\n').map(line => {
            // is error description ... return
            if ( line === `${name}: ${message}` ) {
                return;
            }
            line = line.replace('at ', '').trim();
            //
            if ( / /g.test(line) ) {
                let parts = line.split(' ');
                line = parts.slice(-1)[0].replace(/\(|\)/g, '');
            }
            return line.trim();
        }).splice(3);

    } else {
        // remove first line
        tmpStack = stack/*.replace(/^.*$/m, '')*/.split('\n').map(line => {
            // is error description ... return
            if ( line.includes(name) || line === '' ) {
                return
            }
            if ( /@/g.test(line) ) {
                let parts = line.split('@');
                line = parts.slice(1)[0];
            }
            return line.trim();
        }).splice(3);
    }

    // check if value is `String` and not empty
    let isValid = (string) => {
        return typeof string === 'string' && string.trim() !== ''
    }

    return {
        name: instanceOfError.name,
        message: instanceOfError.message,
        stack: (tmpStack.length <= 2) ? (isValid(tmpStack[1]) && !captureStackTrace ? tmpStack[1] : tmpStack[0]) : tmpStack[0]
    }
}

/**
 * @name  StackTraceError
 * @description custom `Error` for "capture stack"
 */
class StackTraceError extends Error {
    constructor(...args) {
        super(...args)
        this.name = this.constructor.name
        // non V8 (Firefox)
        if ( !captureStackTrace ) {
            this.stack = Error.call(this).stack
        } else {
            // V8
            Error.captureStackTrace(this, this.constructor)
        }
        // return custom formatted "stack"
        this.stackToString = () => {
            return StackTraceFormatter(this)
        }
    }
}

//
const getStack = () => { return new StackTraceError('fake-error').stackToString().stack };

//console.log(getStack())
// genric CSS for "custom" `console`
let Style = {
    // text "default"
    default: 'color: #505252;font-weight:bold;font-size:12px;margin-top: 10px;',

    // Firefox
    link: 'font-weight: bold; color: gray; text-decoration: underline; font-size: 12px; margin-top: 12px;',

    // badages
    debug:   'border: 1px solid #3880ff; color: #3880ff; padding: 0 5px; font-size: 10px;',
    loging:  'border: 1px solid #c3c5c7; color: gray; padding: 0 5px; font-size: 10px;',
    success: 'border: 1px solid #40dc60; color: #19ac80; padding: 0 5px; font-size: 10px;',
    warning: 'border: 1px solid #ffce00; color: orange; padding: 0 5px; font-size: 10px;',
    danger:  'border: 1px solid #f04141; color: #f04141; padding: 0 5px; font-size: 10px;',
    json:    'border: 1px solid #a55403; color: #a55403; padding: 0 5px; font-size: 10px;',

    // non V8 (Firefox) force more space
    space: !captureStackTrace ? '\n\n' : '\n',
    jsonbg: 'color: #a55403; font-weight:bold;font-size:12px;margin-top: 10px;'
}

/**
 * [description]
 * @param  {[type]} content    [description]
 * @param  {[type]} _console   [description]
 * @param  {[type]} _arguments [description]
 * @return {[type]}            [description]
 */
const dispatcher = (content, style, _console, _arguments) => {
    let strings = [], objects = [];
    for (let i of _arguments) {
         if ( typeof i === 'string' ) {
             strings.push(i)
         } else {
             objects.push(i)
         }
    }
    //
    content += [...strings].toString().replace(/,/g, ' ');
    //
    setTimeout(
        _console.log.bind(
            _console,
            content,
            Style[style],
            Style.link,
            Style.default,
            ...objects,
            Style.space
        )
    )
}




const Setup = callback => {
    //
    if ( __DEBUG__.method === 'debug:none' ) {
        if ( 'log' in $ ) {
            // already "disabled"
            callback(true);
            return
        }
        //debugger
        // disable all console (global) "modes" excepty "memory"
        for (let i = 0; i < consoleTypes.length; i++) {
             let func;
             if ( consoleTypes[i] === 'memory' ) {
                 func = performance.memory
             } else {
                 func = new Function(
                      "function " + consoleTypes[i] + "() {}; "+consoleTypes[i]+".toString = function toString() { return 'function "+consoleTypes[i]+"() { [non native code] }'; }; return "+consoleTypes[i]+";"
                 )();
             }
             // attribution to `Proxy` property
             $[consoleTypes[i]] = func;
             // assign
             Object.assign($[consoleTypes[i]], Object.defineProperty(console[consoleTypes[i]], Symbol.toStringTag, { value: 'native code' }));
             // property prevent extensions
             Object.preventExtensions(console[consoleTypes[i]]);
        }
        // rewrite "console"
        console = $;
        // prevent extensions
        Object.preventExtensions($);
        //
        callback(true)
    } else {
        callback(false);
    }
}

/**
 * Custom `console` wraper
 */
class ConsoleJS {
    constructor(name) {
        this.name = name;
        this.console = {};
        this.disabled = false;


        this.setup = setTimeoutSync(Setup(status => {
            this.disabled = status;
            this.console = status ? {} : __console__;
        }))
        /*this.methods = {};
        for (let i of consoleTypes) {
            this.methods[i] = this.console[i]
        }
        this.methods.success = __console__.success*/

        return new Proxy(this, {
            get: function(obj, prop) {
                // manager methods
                if ( ['loging', 'debug', 'success', 'warning', 'danger'].includes(prop) ) {
                    return !obj.disabled ? function() {
                        dispatcher(
                            // this content
                            `%c${prop.toUpperCase()}: ${obj.name}%c${String().padStart(2, ' ')}${getStack()}${Style.space}%c`,
                            prop,
                            obj.console,
                            arguments
                        )
                    } : noop;
                } else if ( prop in obj ) {
                    return !obj.disabled ? obj[prop] : noop;
                } else {
                    throw new ReferenceError(`${prop} is not defined`)
                }
            },
            set: function(obj, prop, val) {
                if ( !prop || typeof prop !== 'string' || prop.trim() === '' ) {
                    throw new Error(`Cannot set the ${name} property`);
                } else {
                    if ( prop in obj ) {
                        throw new TypeError('Assignment to constant variable.')
                    }
                    return !obj.disabled ? Reflect.set(...arguments) : noop;
                }
            }
        })
    }

    json() {
        setTimeout(
            this.console.log.bind(
                this.console,
                `%cJSON: ${this.name}%c${String().padStart(2, ' ')}${getStack()}%c${Style.space}\n${JSON.stringify(arguments[0], null, 4)}`,
                Style.json,
                Style.link,
                Style.jsonbg,
                Style.space
            )
        )
        if ( arguments.length > 1 && arguments[1] === 'table' ) {
            setTimeout(
                this.console.table.bind(null, arguments[0])
            )
        }
    }

    revoke() {
        if ( this.disabled && __DEBUG__.method !== 'debug:none' ) {
            this.disabled = false;
            console = this.console
        }
    }
}

//
export default ConsoleJS




/*
// console properties
const consoleTypes = ('getOwnPropertyNames' in Object) ? Object.getOwnPropertyNames(console).filter(k => !/(name|length)/.test(k)) : ["debug","error","info","log","warn","dir","dirxml","table","trace","group","groupCollapsed","groupEnd","clear","count","countReset","assert","profile","profileEnd","time","timeLog","timeEnd","timeStamp","context","memory"];
// pre-store to change "console" (note: incompatible to use jQuery)
let $ = {};

// Proxy for "console"
if ( 'Proxy' in window && 'Reflect' in window ) {
    $ = function $(){
        return new Proxy(console, {
            get: function(obj, prop) {
                if ( prop in obj ) {
                    return obj[prop]
                }
                throw new ReferenceError(`${prop} is not defined`)
            },
            set: function(obj, prop, val) {
                if ( prop in obj ) {
                    throw new TypeError('Assignment to constant variable.')
                }
                return Reflect.set(...arguments);
            }
        })
    }
} else {
    $ = function $() { return console; };
}

const __DEBUG__ = {
    type: 'none'
}

const GETDEBUG = document.head.querySelector('meta[name="DEBUG"]');

function setTimeoutSync(callback, ms) {
  const start = Date.now()
  let now = start

  while (now - start < ms) {
    now = Date.now()
  }

  if (typeof callback === 'function') {
    callback()
  }
}


if ( GETDEBUG ) {
    __DEBUG__.type = String(GETDEBUG.getAttribute('content')).toLowerCase();
    setTimeoutSync(async () => {
        let warningTitleCSS = 'color:red; font-size:60px; font-weight: bold; -webkit-text-stroke: 1px black;';
        let warningDescCSS = 'font-size: 18px;';
        await setTimeout(console.log.bind(console, '%cStop!', warningTitleCSS));
        await setTimeout(console.log.bind(console, "%cThis is a browser feature intended for developers. If someone told you to copy and paste something here to enable a site feature or \"hack\" someone's account, it is a scam and will give them access to your site account.", warningDescCSS));
        await setTimeout(console.log.bind(console, '%cSee https://subversivo58.github.io/policy.html#self-security-hosted for more information.', warningDescCSS));
    }, 2)

    //
    switch (__DEBUG__.type) {

        // none console
        case 'none':
            // disable all console "modes"
            for (let i = 0; i < 24; i++) {
                 let func;
                 if ( consoleTypes[i] === 'memory' ) {
                     func = performance.memory
                 } else {
                     func = new Function(
                          "function " + consoleTypes[i] + "() {}; "+consoleTypes[i]+".toString = function toString() { return 'function "+consoleTypes[i]+"() { [non native code] }'; }; return "+consoleTypes[i]+";"
                     )();
                 }
                 // attribution to `Proxy` property
                 $[consoleTypes[i]] = func;
                 // assign
                 Object.assign($[consoleTypes[i]], Object.defineProperty(console[consoleTypes[i]], Symbol.toStringTag, { value: 'native code' }))
                 // property prevent extensions
                 Object.preventExtensions(console[consoleTypes[i]]);
            }
            // rewrite "console"
            console = $;
            // prevent extensions
            Object.preventExtensions($);
            break;

        case 'debug':
            let __console__ = console;

            function debug() {
                let __base__ = arguments[0]
                switch (true) {
                    case (/(table)/.test(arguments[0])):
                        __console__.log('%c[debug:' + arguments[0] + ']', 'color: blue;')
                        return __console__[arguments[0]].apply(__console__, [...[].slice.call(arguments).slice(1)] )
                        break;
                    case (/(dir|xml)/.test(arguments[0])):
                        __base__ = 'log'
                        break;
                    default:
                    //__console__.log(arguments[0])
                        //
                        break;
                }
                var commom = ['%c[debug:' + arguments[0] + ']', 'color: blue;', ...[].slice.call(arguments).slice(1)]
                return __console__[__base__].apply(__console__, commom );
                //return this
            }

            // get console "properties"
            for (let i = 0; i < consoleTypes.length; i++) {
                 let func;
                 if ( /(log|debug|info|warn|(dir|xml)|trace|table)/.test(consoleTypes[i]) ) {
                     func = debug.bind(this, ...[consoleTypes[i]])
                 } else if ( /(memory)/.test(consoleTypes[i]) ) {
                    func = new Proxy(__console__.memory, {
                       get: function(obj, prop) {
                           if ( prop in obj ) {
                               if ( /(jsHeapSizeLimit|totalJSHeapSize|usedJSHeapSize)/.test(prop) ) {
                                   __console__.log('%c[debug:memory:'+prop+']', 'color: blue;')
                               }
                               return obj[prop]
                           }
                           throw new ReferenceError(`${prop} is not defined`)
                       }
                    })
                 } else if ( consoleTypes[i] === 'context' ) {
                    // create "Context" with native `console.context()`
                    let context = Function(
                        'context',
                        "function Context() { return context(); }; return Context;"
                    )(__console__.context);
                    //
                    for(let j = 0; j < consoleTypes.length; j++) {
                        // all except "context"
                        if ( consoleTypes[i] !== 'context' ) {
                            if ( /(log|debug|info|warn|dir|dirxml)/.test(consoleTypes[j]) ) {
                                // rewrite to prefix
                                context[consoleTypes[j]] = debug.bind(this, ...[consoleTypes[j]])
                            } else {
                                // use native
                                context[consoleTypes[j]] = __console__.context()[consoleTypes[j]]
                            }
                        }
                    }
                    // rewrite "Context"
                    console.context = context;
                    func = console[consoleTypes[i]];
                 } else {
                     func = console[consoleTypes[i]];
                 }
                 // attribution to `Proxy` property
                 $[consoleTypes[i]] = func;
                 // assign
                 Object.assign($[consoleTypes[i]], Object.defineProperty(console[consoleTypes[i]], Symbol.toStringTag, { value: 'native code' }))
                 // property prevent extensions
                 Object.preventExtensions(console[consoleTypes[i]]);
            }
            // rewrite "console"
            window.console = $;
            // prevent extensions
            Object.preventExtensions($);
            break;
        // by default
        default:
            // get console "properties"
            for (var i = 0; i < 24; i++) {
                 var func;
                 if ( consoleTypes[i] === 'clear' ) {
                     func = new Function(
                         "function clear() { debugger; }; clear.toString = function toString() { return 'function clear() { [non native code] }'; }; return clear;"
                     )();
                 } else {
                     func = console[consoleTypes[i]];
                 }
                 // attribution to `Proxy` property
                 $[consoleTypes[i]] = func;
                 // assign
                 Object.assign($[consoleTypes[i]], Object.defineProperty(console[consoleTypes[i]], Symbol.toStringTag, { value: 'native code' }))
                 // property prevent extensions
                 Object.preventExtensions(console[consoleTypes[i]]);
            }
            // rewrite "console"
            console = $;
            // prevent extensions
            Object.preventExtensions($);
            break;
    }
}
export default console
*/