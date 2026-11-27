/**
 * @file Emitter.mjs
 * @description Event emitter built on EventTarget with a listener registry.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */
const registry = Symbol('listenerRegistry')

export default class Emitter extends EventTarget {
    /**
     * Creates an event emitter.
     */
    constructor() {
        super()

        // Keep the public listener list compatible with the original API.
        this.listeners = {
            '*': []
        }

        // Store the actual EventTarget callbacks so they can be removed later.
        this[registry] = Object.create(null)
    }

    /**
     * Adds a listener to an event.
     * @param {string} e - Event name.
     * @param {Function} cb - Listener.
     * @param {boolean} [once=false] - Removes the listener after the first call.
     * @throws {TypeError} If the listener is not a function.
     */
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

    /**
     * Removes a listener record from the registry.
     * @private
     * @param {string} event
     * @param {Object} record
     */
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

    /**
     * Removes a listener from an event.
     * @param {string} e - Event name.
     * @param {Function|false} [Fn=false] - Listener to remove. false removes all listeners of the event.
     */
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

    /**
     * Emits an event with data for its listeners.
     * @param {string} e - Event name.
     * @param {*} d - Data sent as the event detail.
     */
    emit(e, d) {
        const event = String(e)
        const detail = { detail: d }

        // Wildcard listeners receive every event, but only once when emitting '*'.
        if (event !== '*' && this.listeners['*'].length > 0) {
            this.dispatchEvent(new CustomEvent('*', detail))
        }

        this.dispatchEvent(new CustomEvent(event, detail))
    }

    /**
     * Adds a listener that runs only once.
     * @param {string} e
     * @param {Function} cb
     */
    once(e, cb) {
        this.on(e, cb, true)
    }
}