/**
 * @file LifeCycle.mjs
 * @description Application lifecycle manager, inspired by Android Lifecycle, that drives component states.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */
//
import indexedDBLogs from '../lib/IndexedLogs.mjs'
import Emitter from '../lib/Emitter.mjs'

// Note: Firefox don't support private fields in `Class` yet
const cycles    = Symbol()
const onCreate  = Symbol()
const onStart   = Symbol()
const onResume  = Symbol()
const onPause   = Symbol()
const onStop    = Symbol()
const onRestart = Symbol()
const onDestroy = Symbol()


export default class LifeCycle {

    /**
     * Creates a lifecycle manager for a named component.
     * @param {string} name
     */
    constructor(name) {
        this.name = name
        this.stack = indexedDBLogs.getStack()
        this[cycles] = {}
    }

    /**
     * Creates a resource bound to this lifecycle, using a proxy that emits change events.
     * @param {Object} resource
     * @return {Proxy}
     */
    create(resource) {
        return this[onCreate](resource)
    }

    [onCreate] = resource => {

        if ( ('constructor' in resource) && ('name' in resource.constructor) && this[cycles][resource.constructor.name] ) {
            // revise states...
            return this[cycles][resource.constructor.name].caller
        }

        let callerName = resource.constructor.name,
            event = new Emitter(callerName),
            state = {
                state: 'created'
            }

        resource.onchange = Fn => {
            return event.on('change', Fn)
        }

        resource.resume = () => {
            return this[onResume](callerName)
        }
        //...
        resource.destroy = () => {
            delete this[cycles][callerName]
        }

        let sketch = {
            state: new Proxy(state, {
                /**
                 * Proxy trap that reads a property of the target.
                 * @private
                 * @param {Object} obj
                 * @param {string|symbol} prop
                 * @return {*}
                 */
                get(obj, prop) {
                    if ( prop in obj ) {
                        return obj[prop]
                    }
                    throw new ReferenceError(`${prop} is not defined`)
                },
                /**
                 * Proxy trap that writes a property and emits a change event after the component is created.
                 * @private
                 * @param {Object} target
                 * @param {string|symbol} key
                 * @param {*} value
                 * @return {boolean}
                 */
                set(target, key, value) {
                    target[key] = value
                    if ( this.get(state, 'state') !== 'created' ) {
                        event.emit('change', value)
                    }
                    return true
                }
            }),
            caller: resource
        }

        this[cycles][callerName] = sketch

        // log here...
        return this[onStart](callerName)
    }

    [onStart] = caller => {
        //
        if ( typeof caller === 'string' && this[cycles][caller] && this[cycles][caller].state.state === 'created' ) {
            this[cycles][caller].state.state = 'started'
            return this[cycles][caller].caller
        } else if ( typeof caller === 'string' && this[cycles][caller] && this[cycles][caller].state.state !== 'created' ) {
            throw new ReferenceError(`${caller} already "created"`)
        } else if ( typeof caller !== 'string' ) {
            throw new TypeError('argument passed not is a "string" to search in cycles reference')
        } else {
            throw new SyntaxError(`${caller} is invalid!`);
        }
    }

    [onResume] = caller => {
        this[cycles][caller].state.state = 'resumed'
    }

    [onPause] = caller => {
        this[cycles][caller].state.state = 'paused'
    }

    [onStop] = caller => {
        this[cycles][caller].state.state = 'stoped'
    }

    [onRestart] = caller => {
        switch (this[cycles][caller].state.state) {
            case 'stoped':
                this[cycles][caller].state.state = 'restarted'
                this[onStart](caller)
                break
            default:
                alert('restart cycle')
                break
        }
    }

    [onDestroy] = caller => {
        delete this[cycles][caller]
    }
}