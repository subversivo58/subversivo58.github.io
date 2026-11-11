/**
 * Emmiter - Event Emitter
 * @license The MIT License (MIT)                    - [https://github.com/subversivo58/Emitter/blob/master/LICENSE]
 * @copyright Copyright (c) 2018 - 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]                - [https://github.com/subversivo58/Emitter/blob/master/VERSIONING.md]
 */
const registry = Symbol('listenerRegistry')

export default class Emitter extends EventTarget {
    constructor() {
        super()

        // Keep the public listener list compatible with the original API.
        this.listeners = {
            '*': []
        }

        // Store the actual EventTarget callbacks so they can be removed later.
        this[registry] = Object.create(null)
    }

    on(e, cb, once = false) {
        if (typeof cb !== 'function') {
            throw new TypeError('The listener must be a function')
        }

        const event = String(e)

        if (!this.listeners[event]) {
            this.listeners[event] = []
        }

        if (!this[registry][event]) {
            this[registry][event] = []
        }

        const record = {
            callback: cb,
            once: Boolean(once),
            listener: null
        }

        record.listener = eventObject => {
            if (record.once) {
                // Remove bookkeeping even if the callback throws.
                try {
                    cb(eventObject.detail)
                } finally {
                    this._removeRecord(event, record)
                }
                return
            }

            cb(eventObject.detail)
        }

        this.listeners[event].push(cb)
        this[registry][event].push(record)
        this.addEventListener(event, record.listener, record.once ? { once: true } : undefined)
    }

    _removeRecord(event, record) {
        const records = this[registry][event]
        if (!records) return

        const index = records.indexOf(record)
        if (index === -1) return

        this.removeEventListener(event, record.listener)
        records.splice(index, 1)

        const callbacks = this.listeners[event]
        if (callbacks) {
            const callbackIndex = callbacks.indexOf(record.callback)
            if (callbackIndex !== -1) {
                callbacks.splice(callbackIndex, 1)
            }

            if (callbacks.length === 0 && event !== '*') {
                delete this.listeners[event]
            }
        }

        if (records.length === 0) {
            delete this[registry][event]
        }
    }

    off(e, Fn = false) {
        const event = String(e)
        const records = this[registry][event]
        if (!records || records.length === 0) return

        // A callback removes all registrations of that callback for this event,
        // matching the original off(event, callback) intention.
        const targets = typeof Fn === 'function'
            ? records.filter(record => record.callback === Fn)
            : [...records]

        targets.forEach(record => this._removeRecord(event, record))

        if (event === '*' && !this.listeners['*']) {
            this.listeners['*'] = []
        }
    }

    emit(e, d) {
        const event = String(e)
        const detail = { detail: d }

        // Wildcard listeners receive every event, but only once when emitting '*'.
        if (event !== '*' && this.listeners['*'].length > 0) {
            this.dispatchEvent(new CustomEvent('*', detail))
        }

        this.dispatchEvent(new CustomEvent(event, detail))
    }

    once(e, cb) {
        this.on(e, cb, true)
    }
}