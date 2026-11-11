/**
 * Awesome IndexedDB - IndexedDB CRUD operations
 * Hybrid-maintenance release: preserves the original MISH API while
 * making request/transaction handling predictable.
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */

const CRUD_METHODS = new Set(['count', 'like', 'one', 'all', 'getAll']);
const WRITE_METHODS = new Set(['put', 'add']);
const CRUD_ERROR = 'No database connection is available for this operation.';
const CHANNEL_PROTOCOL = 'AwesomeIndexedDB';
const CHANNEL_PROTOCOL_VERSION = 1;

function createInstanceId() {
    try {
        if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
    } catch (_) { /* use fallback */ }
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}

const hasIndexedDB = () => typeof globalThis !== 'undefined' && !!globalThis.indexedDB;
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const unique = values => [...new Set(values)];

function makeError(message, cause) {
    const error = new Error(message);
    if (cause !== undefined) error.cause = cause;
    return error;
}

function requestResult(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('IndexedDB request failed.'));
    });
}

function transactionResult(transaction) {
    return new Promise((resolve, reject) => {
        transaction.oncomplete = () => resolve(true);
        transaction.onabort = () => reject(transaction.error || new Error('IndexedDB transaction aborted.'));
        transaction.onerror = () => reject(transaction.error || new Error('IndexedDB transaction failed.'));
    });
}

function normalizeSchema(schema) {
    if (schema === false || schema == null) return [];
    if (!Array.isArray(schema)) throw new TypeError('The schema must be an array of Object Store definitions.');
    return schema.map((item, index) => {
        if (!isObject(item) || typeof item.tbn !== 'string' || !item.tbn.trim()) {
            throw new TypeError(`Invalid schema at index ${index}: each entry requires a non-empty "tbn" string.`);
        }
        return item;
    });
}

class IDBStorage {
    constructor(name, version = 1, logging = false) {
        if (typeof name !== 'string' || !name.trim()) {
            throw new TypeError('[IDBStorage] A non-empty database name is required.');
        }
        if (!hasIndexedDB()) throw new Error('[IDBStorage] IndexedDB is not available in this environment.');

        this.name = name;
        this.version = Number.isInteger(version) && version > 0 ? version : 1;
        this.log = typeof logging === 'function' ? logging : () => {};
        this.opened = false;
        this.db = null;
        this._opening = null;
        this._disposed = false;
        this._schema = [];
        this._instanceId = createInstanceId();
        this._changeListeners = new Set();
        this._peers = new Map();
        this.broadCaster = null;
        this._visibilityHandler = null;
        this._messageHandler = null;

        // Each page/instance has an independent IndexedDB connection.
        // BroadcastChannel only coordinates state and data-change notifications;
        // it never acts as a lock and never closes another page's connection.
        if (typeof window !== 'undefined' && typeof document !== 'undefined' &&
            typeof globalThis.BroadcastChannel === 'function') {
            try {
                this.broadCaster = new globalThis.BroadcastChannel(this.name);
                this._messageHandler = event => this._handleBroadcastMessage(event.data);
                this.broadCaster.addEventListener('message', this._messageHandler);

                this._visibilityHandler = () => {
                    this._broadcast(document.hidden ? 'page-hidden' : 'page-visible');
                };
                document.addEventListener('visibilitychange', this._visibilityHandler);
                this._broadcast('instance-ready');
            } catch (error) {
                this.broadCaster?.close();
                this.broadCaster = null;
                this._report('BroadcastChannel', error);
            }
        }
    }

    _broadcast(type, details = {}) {
        if (!this.broadCaster || this._disposed) return;
        const message = {
            protocol: CHANNEL_PROTOCOL,
            protocolVersion: CHANNEL_PROTOCOL_VERSION,
            database: this.name,
            version: this.version,
            instanceId: this._instanceId,
            type,
            opened: this.opened,
            visible: typeof document !== 'undefined' ? !document.hidden : true,
            timestamp: Date.now(),
            ...details
        };
        try {
            this.broadCaster.postMessage(message);
        } catch (error) {
            this._report('BroadcastChannel.postMessage', error);
        }
    }

    _handleBroadcastMessage(message) {
        if (!message || typeof message !== 'object' ||
            message.protocol !== CHANNEL_PROTOCOL ||
            message.protocolVersion !== CHANNEL_PROTOCOL_VERSION ||
            message.database !== this.name ||
            message.instanceId === this._instanceId) return;

        const peerId = message.instanceId;
        if (typeof peerId !== 'string' || !peerId) return;

        switch (message.type) {
            case 'instance-ready':
                this._peers.set(peerId, {
                    visible: Boolean(message.visible),
                    opened: Boolean(message.opened),
                    lastSeen: message.timestamp || Date.now()
                });
                // Handshake: tell a newly discovered instance our current state.
                this._broadcast('instance-state');
                break;
            case 'instance-state':
                this._peers.set(peerId, {
                    visible: Boolean(message.visible),
                    opened: Boolean(message.opened),
                    lastSeen: message.timestamp || Date.now()
                });
                break;
            case 'db-open':
            case 'page-visible':
            case 'page-hidden':
                this._peers.set(peerId, {
                    visible: Boolean(message.visible),
                    opened: message.type === 'db-open' || this._peers.get(peerId)?.opened === true,
                    lastSeen: message.timestamp || Date.now()
                });
                break;
            case 'db-close':
            case 'instance-disposed':
                this._peers.delete(peerId);
                break;
            case 'db-versionchange':
                this._peers.set(peerId, {
                    visible: Boolean(message.visible),
                    opened: false,
                    lastSeen: message.timestamp || Date.now()
                });
                break;
            case 'db-change':
                this._emitChange({
                    type: 'change',
                    source: 'remote',
                    database: this.name,
                    operation: message.operation,
                    stores: Array.isArray(message.stores) ? message.stores.slice() : [],
                    instanceId: peerId,
                    timestamp: message.timestamp || Date.now()
                });
                break;
            case 'db-deleted':
                this._emitChange({
                    type: 'deleted',
                    source: 'remote',
                    database: this.name,
                    instanceId: peerId,
                    timestamp: message.timestamp || Date.now()
                });
                break;
            default:
                // Ignore unknown message types for forward compatibility.
                break;
        }
    }

    _emitChange(change) {
        for (const listener of this._changeListeners) {
            try { listener(change); }
            catch (error) { this._report('onChange', error); }
        }
    }

    _announceChange(operation, stores) {
        const event = {
            type: 'change',
            source: 'local',
            database: this.name,
            operation,
            stores: Array.isArray(stores) ? stores.slice() : [],
            instanceId: this._instanceId,
            timestamp: Date.now()
        };
        this._emitChange(event);
        this._broadcast('db-change', { operation, stores: event.stores });
    }

    onChange(callback) {
        if (typeof callback !== 'function') throw new TypeError('onChange() expects a callback function.');
        if (this._disposed) throw new Error('This AwesomeIndexedDB instance has been disposed.');
        this._changeListeners.add(callback);
        return () => this._changeListeners.delete(callback);
    }

    _report(method, error) {
        try { this.log(`[IDBStorage.${method} Error]: ${error?.message || error}`); } catch (_) { /* logging must not break storage */ }
    }

    _assertOpen(method) {
        if (!this.db) throw makeError(`[IDBStorage.${method}]: ${CRUD_ERROR}`);
    }

    _assertStore(name) {
        if (typeof name !== 'string' || !name.trim()) throw new TypeError('A non-empty "tbn" Object Store name is required.');
        if (!this.db.objectStoreNames.contains(name)) {
            throw makeError(`Object Store "${name}" does not exist. Reopen the database with a higher version and include this store in the schema.`);
        }
    }

    open(schema = []) {
        if (this._disposed) return Promise.reject(new Error('This AwesomeIndexedDB instance has been disposed.'));
        if (this._opening) return this._opening;

        let definitions;
        try { definitions = normalizeSchema(schema); }
        catch (error) { return Promise.reject(error); }
        this._schema = definitions;

        if (this.db) {
            try {
                for (const item of definitions) this._assertStore(item.tbn);
                return Promise.resolve(this._connection());
            } catch (error) { return Promise.reject(error); }
        }

        this._opening = new Promise((resolve, reject) => {
            let settled = false;
            const request = globalThis.indexedDB.open(this.name, this.version);

            request.onupgradeneeded = event => {
                const db = event.target.result;
                try {
                    for (const item of definitions) {
                        if (!db.objectStoreNames.contains(item.tbn)) {
                            const options = {};
                            if (typeof item.keyPath === 'string' || Array.isArray(item.keyPath)) options.keyPath = item.keyPath;
                            if (typeof item.autoIncrement === 'boolean') options.autoIncrement = item.autoIncrement;
                            db.createObjectStore(item.tbn, options);
                        }
                    }
                } catch (error) {
                    try { event.target.transaction.abort(); } catch (_) { /* transaction may already be inactive */ }
                    if (!settled) { settled = true; reject(error); }
                }
            };

            request.onsuccess = event => {
                const db = event.target.result;
                if (this._disposed) {
                    db.close();
                    if (!settled) { settled = true; reject(new Error('This AwesomeIndexedDB instance has been disposed.')); }
                    return;
                }

                this.db = db;
                this.opened = true;
                db.onversionchange = versionEvent => {
                    this._broadcast('db-versionchange', {
                        oldVersion: versionEvent.oldVersion,
                        newVersion: versionEvent.newVersion
                    });
                    this.close('versionchange');
                };
                db.onclose = () => {
                    if (this.db === db) {
                        this.db = null;
                        this.opened = false;
                        this._broadcast('db-close', { reason: 'connection-closed' });
                    }
                };

                try {
                    for (const item of definitions) this._assertStore(item.tbn);
                    if (settled) {
                        db.close();
                        return;
                    }

                    // Preserve the original open(schema) behavior: entries that
                    // contain `tbk` also seed records after the stores exist.
                    const seedData = definitions.filter(item => Object.prototype.hasOwnProperty.call(item, 'tbk'));
                    const finishOpen = () => {
                        if (settled) return;
                        settled = true;
                        this._broadcast('db-open');
                        resolve(this._connection());
                    };

                    if (seedData.length) {
                        this.create(seedData).then(finishOpen).catch(error => {
                            this.close('seed-failed');
                            if (!settled) { settled = true; reject(error); }
                        });
                    } else {
                        finishOpen();
                    }
                } catch (error) {
                    this.close('open-validation-failed');
                    if (!settled) { settled = true; reject(error); }
                }
            };

            request.onerror = () => {
                if (!settled) {
                    settled = true;
                    reject(request.error || makeError(`Could not open database "${this.name}".`));
                }
            };
            request.onblocked = () => this._report('open', `Opening "${this.name}" is blocked by another connection. Close old-version connections in other pages.`);
        }).finally(() => { this._opening = null; });

        return this._opening;
    }

    _connection() {
        const handler = this;
        return {
            close() { return handler.close(); },
            create(data) { return handler.create(data); },
            read(data) { return handler.read(data); },
            update(data, method) { return handler.update(data, method); },
            delete(data) { return handler.delete(data); },
            onChange(callback) { return handler.onChange(callback); },
            get objects() { return handler.db ? handler.db.objectStoreNames : []; }
        };
    }

    close(reason = 'manual') {
        const db = this.db;
        if (!db) return;
        this.db = null;
        this.opened = false;
        try { db.close(); }
        finally { this._broadcast('db-close', { reason }); }
    }

    async _writeBatch(data, operation, method = 'put') {
        this._assertOpen(operation);
        if (!Array.isArray(data) || data.length === 0) throw new TypeError(`"${operation}" expects a non-empty Array.`);
        if (operation === 'update' && !WRITE_METHODS.has(method)) {
            throw new TypeError(`Unsupported update method "${method}". Use "put" or "add".`);
        }

        const stores = unique(data.map(item => item?.tbn).filter(name => typeof name === 'string' && name));
        if (stores.length !== unique(data.map(item => item?.tbn)).length) throw new TypeError('Every entry must contain a valid "tbn" Object Store name.');
        for (const name of stores) this._assertStore(name);

        const transaction = this.db.transaction(stores, 'readwrite');
        const done = transactionResult(transaction);
        try {
            for (const item of data) {
                if (!isObject(item)) throw new TypeError('Each write entry must be an object.');
                if (!('tbk' in item) || item.tbk === undefined) throw new TypeError(`A key "tbk" is required for Object Store "${item.tbn}".`);
                const store = transaction.objectStore(item.tbn);
                const keys = Array.isArray(item.tbk) ? item.tbk : [item.tbk];
                const values = Array.isArray(item.tbv) ? item.tbv : null;
                for (let index = 0; index < keys.length; index++) {
                    const key = keys[index];
                    const value = values ? (index < values.length ? values[index] : {}) : item.tbv;
                    if (operation === 'delete') store.delete(key);
                    else if (store.keyPath !== null && store.keyPath !== undefined) store[method](value);
                    else store[method](value, key);
                }
            }
            await done;
            this._announceChange(operation, stores);
            return true;
        } catch (error) {
            try { transaction.abort(); } catch (_) { /* transaction may already be inactive */ }
            await done.catch(() => {});
            throw error;
        }
    }

    create(data) {
        return this._writeBatch(data, 'create', 'put').catch(error => { this._report('create', error); throw error; });
    }

    update(data, method = 'put') {
        return this._writeBatch(data, 'update', method).catch(error => { this._report('update', error); throw error; });
    }

    async read(data) {
        try {
            this._assertOpen('read');
            if (!isObject(data)) throw new TypeError('"read" expects an object.');
            this._assertStore(data.tbn);
            const method = typeof data.method === 'string' && CRUD_METHODS.has(data.method) ? data.method : 'one';
            const transaction = this.db.transaction([data.tbn], 'readonly');
            const store = transaction.objectStore(data.tbn);
            let result;

            switch (method) {
                case 'count': result = await requestResult(store.count()); break;
                case 'one': result = await requestResult(store.get(data.tbk)); break;
                case 'getAll': result = await requestResult(store.getAll()); break;
                case 'all': {
                    result = [];
                    await new Promise((resolve, reject) => {
                        const request = store.openCursor();
                        request.onerror = () => reject(request.error || new Error('Cursor request failed.'));
                        request.onsuccess = event => {
                            const cursor = event.target.result;
                            if (cursor) { result.push(cursor.value); cursor.continue(); }
                            else resolve();
                        };
                    });
                    break;
                }
                case 'like': {
                    if (typeof data.tbk !== 'string') throw new TypeError('The "like" method requires a string key prefix.');
                    result = [];
                    const range = IDBKeyRange.bound(data.tbk, `${data.tbk}\uffff`);
                    await new Promise((resolve, reject) => {
                        const request = store.openCursor(range, 'next');
                        request.onerror = () => reject(request.error || new Error('Cursor request failed.'));
                        request.onsuccess = event => {
                            const cursor = event.target.result;
                            if (cursor) { result.push({ key: cursor.key, value: cursor.value }); cursor.continue(); }
                            else resolve();
                        };
                    });
                    break;
                }
            }
            if (method === 'one' && result === undefined) return false;
            return result;
        } catch (error) { this._report('read', error); throw error; }
    }

    delete(data) {
        const entries = Array.isArray(data) ? data : [data];
        if (!entries.length) return Promise.resolve([]);
        let normalized;
        try {
            normalized = entries.map(item => {
                if (!isObject(item) || !('tbk' in item)) throw new TypeError('Each delete entry requires "tbn" and "tbk".');
                return { tbn: item.tbn, tbk: item.tbk, tbv: undefined };
            });
        } catch (error) {
            this._report('delete', error);
            return Promise.reject(error);
        }
        return this._writeBatch(normalized, 'delete').then(() => Array.isArray(data) ? normalized.map(item => item.tbk) : true)
            .catch(error => { this._report('delete', error); throw error; });
    }

    async exists(dbname = this.name) {
        if (typeof dbname !== 'string' || !dbname.trim()) dbname = this.name;
        const idb = globalThis.indexedDB;
        if (typeof idb.databases === 'function') {
            const databases = await idb.databases();
            return databases.some(database => database.name === dbname);
        }
        return new Promise((resolve, reject) => {
            let wasCreated = false;
            const request = idb.open(dbname);
            request.onupgradeneeded = event => {
                wasCreated = true;
                try { event.target.transaction.abort(); } catch (_) { /* expected for a new database */ }
            };
            request.onsuccess = event => {
                event.target.result.close();
                resolve(!wasCreated);
            };
            request.onerror = () => {
                if (wasCreated && request.error?.name === 'AbortError') resolve(false);
                else reject(request.error || new Error(`Could not check database "${dbname}".`));
            };
            request.onblocked = () => this._report('exists', `Checking "${dbname}" is blocked by another connection.`);
        });
    }

    async _deleteDatabase(dbname) {
        if (dbname === this.name) this.close('database-delete-requested');
        return new Promise((resolve, reject) => {
            const request = globalThis.indexedDB.deleteDatabase(dbname);
            request.onsuccess = () => {
                if (dbname === this.name) this._broadcast('db-deleted');
                resolve(true);
            };
            request.onerror = () => reject(request.error || new Error(`Could not delete database "${dbname}".`));
            request.onblocked = () => this._report('deleteDatabase', `Deletion of "${dbname}" is waiting for connections in other pages to close.`);
        });
    }

    async erase(list = false) {
        const names = Array.isArray(list) ? unique(list.filter(name => typeof name === 'string' && name.trim()))
            : [typeof list === 'string' && list.trim() ? list : this.name];
        const deleted = [];
        for (const name of names) {
            if (await this.exists(name)) {
                await this._deleteDatabase(name);
                deleted.push(name);
            }
        }
        if (deleted.length) this.log(`[IDBStorage.erase]: deleted database(s): "${deleted.join(', ')}"`);
        return Array.isArray(list) ? deleted : (deleted.length > 0);
    }

    async eraseAll() {
        if (typeof globalThis.indexedDB.databases !== 'function') {
            throw new Error('eraseAll() is not supported by this browser because indexedDB.databases() is unavailable.');
        }
        const databases = await globalThis.indexedDB.databases();
        const deleted = [];
        for (const database of databases) {
            if (database.name) {
                await this._deleteDatabase(database.name);
                deleted.push(database.name);
            }
        }
        if (deleted.length) this.log(`[IDBStorage.eraseAll]: deleted database(s): "${deleted.join(', ')}"`);
        return deleted;
    }

    dispose() {
        if (this._disposed) return;
        this.close('dispose');
        this._broadcast('instance-disposed');
        this._disposed = true;
        if (this._visibilityHandler && typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
        }
        if (this.broadCaster && this._messageHandler) {
            this.broadCaster.removeEventListener('message', this._messageHandler);
        }
        this.broadCaster?.close();
        this.broadCaster = null;
        this._visibilityHandler = null;
        this._messageHandler = null;
        this._changeListeners.clear();
        this._peers.clear();
    }

}

/**
 * Minimalistic IndexedDB Storage Handler (MISH).
 * @param {string} one Database name.
 * @param {number} two Database version (positive integer).
 * @param {Function} tree Optional logging callback.
 */
export default function MISH(one, two, tree) {
    if (!(this instanceof MISH)) return new MISH(one, two, tree);
    const handler = new IDBStorage(one, two, tree);
    return {
        open(schema) { return handler.open(schema); },
        close() { return handler.close(); },
        erase(list) { return handler.erase(list); },
        eraseAll() { return handler.eraseAll(); },
        exists(name) { return handler.exists(name); },
        onChange(callback) { return handler.onChange(callback); },
        // Explicit cleanup for listeners and BroadcastChannel resources.
        dispose() { return handler.dispose(); }
    };
}
