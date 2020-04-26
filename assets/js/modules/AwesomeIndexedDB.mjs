/**
 * Awesome IndexedDB - IndexedDB CRUD operations
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2020 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */

/**
 TODO:

    * Add CRUD life-cicle:
        CRUD operations auto close db after finish operation (more consistence fo Firefox)
        CRUD operations cycle is inspired by the lifecycle of Android activities
        cycle states:
        + launched - defaut initial state
        + runing   - process at stack operations
        + shutdown - after process last stack operation
        + killed   - when stack operation is aborted (destroy/clear the rest stack)



class LifeCycle {
    constructor(target) {
        // activity referrer
        this.target = target
        // stack operations
        this.fifo = new Queue()
        // state of cycle
        this.state = 'launched'
    }

    abort() {
        this.state = 'killed'
        delete this.fifo
    }
}


this.cycle = new LifeCycle(this.name)

read() {
    //
}

 */

let IsServiceWorkerContext = ( ('WorkerGlobalScope' in self) && ('ServiceWorkerGlobalScope' in self) ) ? true : false,
    IsWebWorkerContext     = ( ('WorkerGlobalScope' in self) && !('ServiceWorkerGlobalScope' in self) ) ? true : false,
    IsWebBrowserContext    = ( ('window' in self && 'document' in self) && !IsServiceWorkerContext && !IsWebWorkerContext) ? true : false

const noop = () => {}
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


// @REVISE
const DatabaseChange = db => {
    db.onversionchange = event => {
        // force close
        //db.close()
        // force reload
        //window.location.reload(true)
        console.log('> onversionchange --------------------------')
    }

    db.onclose = function(event) {
        console.log('> "onclose" event ----------------')
    }
    db.onerror = e => {
        console.error(e)
    }
}

//
const CRUDERRORMESSAGE = 'no have "database" connection object to process this operation'


// CRUD collection messages error and others
const [
    NODB,
    CRUDMETHODS,
    NOTIMPLENETED,
    REQOBJECT,
    REQARRAY
] = [
    'no have "database" connection object to process this operation',
    ['count','like','one','all','getAll'],
    'failed, this operation does not have the method used ... see methods: https://google.com',
    'failed, this operation expect a `Object` object',
    'failed, this operation expect a `Array` object'
]

// prevent initialize CRUD process case no have database
const CRUDChecker = (scope, method) => {
    if ( !scope.db ) {
        scope.log(`[IDBStorage.${method} Error]: ${CRUDERRORMESSAGE}`)
        return false
    }
    return true
}

class IDBStorage /*extends BroadcastChannel */{
    constructor(name, version = 1, logging = false) {

        //super(name)

        if ( typeof name !== 'string' || name.trim() === '' ) {
            throw new Error('[IDBStorage Error]: database name is "required" ... please, define a database name property!')
        }


        //this.postMessage(name)
        this.name = name
        this.version = (Number.isInteger(version) && Math.floor(version) > 0) ? version : 1
        // to register logs
        this.log = (logging && typeof logging === 'function') ? logging : () => {}
        // referer state
        this.opened = false
        this.db = false

        if ( IsWebBrowserContext ) {
            // open multi tabs channel for target events to this database name
            this.broadCaster = new BroadcastChannel(this.name)

            // incomming announces from other tabs "open database"
            this.broadCaster.addEventListener('message', (MessageEvent) => {
                // if same database is "opened" and tjis stay open and this page is visibility "hidden"
                if ( MessageEvent.data === this.name && this.opened && document.hidden ) {
                    // close this db
                    this.close()
                }
            }, false)

            // announce for other tabs about this event (db open)
            this.broadCaster.postMessage(this.name)

            // on change page visibility
            document.addEventListener('visibilitychange', async () => {
                // this db stay opened and this page is visible
                if ( !this.opened && !document.hidden ) {
                    // announce for other tabs about this event (db open)
                    this.broadCaster.postMessage(this.name)
                    // open this database
                    void(await this.open([]))
                }
            }, false)
        }
    }

    /**
     * [open description]
     * @param  {[type]} schema [description]
     * @return {[type]}      [description]
     */
    open(schema = false) {
        return new Promise((resolve, reject) => {
            let self = this
            // already have schema
            if ( this.db && this.db.objectStoreNames.length > 0 ) {
                // check if already storage this collection
                if ( this.db.objectStoreNames.contains(schema.tbn) ) {
                    console.log('database already created and have this "schema"')
                } else {
                    console.log('database already created, no put new "schema" ... please "updating" for add new schema!')
                    // updating this 🤔
                }
                resolve(this)
            } else {
                let request = indexedDB.open(this.name, this.version)
                request.onsuccess = sc => {
                    if ( sc.target.result !== undefined ) {
                        this.db = sc.target.result
                        this.opened = true
                        DatabaseChange(this.db)
                        // `.create()` is `Promise()` ... resolves and reject to `noop()` 🤔
                        this.create(schema).then(
                            // warn that the connection is ready ... see `ConnectionHandler()`
                            resolve({
                                close() {
                                    return self.close()
                                },
                                create(x) {
                                    return self.create(x)
                                },
                                read(x) {
                                    return self.read(x)
                                },
                                update(x) {
                                    return self.update(x)
                                },
                                delete(x) {
                                    return self.delete(x)
                                },
                                objects: self.db.objectStoreNames
                            })
                        ).catch(noop)
                    }
                }
                request.onerror = er => {
                    throw new Error(`Error on create|open indexedDB ... database name: "${this.dbname}", error: "${er}"`)
                }
                request.onupgradeneeded = up => {
                    this.db = up.target.result
                    this.opened = true
                    // add schema (table(s) name(s))
                    schema.forEach((item, idx, array) => {
                        // @REVISE
                        this.db.createObjectStore(item.tbn)
                    })
                    DatabaseChange(this.db)
                }

                //resolve(this)
            }
        })
    }
    /**
     * Close current database
     * @return {[type]} [description]
     */
    close() {
        if ( this.db ) {
            this.db.close()
            this.db = false
            this.opened = false
        }
    }
    /**
     * [create description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    create(data) {
        return new Promise((resolve, reject) => {
            if ( !CRUDChecker(this, 'create') ) {
                reject(CRUDERRORMESSAGE)
            } else if ( data && Array.isArray(data) ) {
                try {
                    let errors = []
                    data.forEach((item, idx, array) => {
                        if ( ('tbk' in item) && item.tbk !== undefined ) {
                            let transaction = this.db.transaction([item.tbn], 'readwrite'),
                                object      = transaction.objectStore(item.tbn)
                            if ( Array.isArray(item.tbk) ) {
                                item.tbk.forEach((k, i, a) => {
                                    Array.isArray(item.tbv) ? (() => {
                                        typeof item.tbv[i] !== 'undefined' ? object.put(item.tbv[i], k) : object.put({}, k)
                                    })() : object.put(item.tbv, k)
                                })
                            } else {
                                object.put(item.tbv, item.tbk)
                            }
                        } else {
                            errors.push(`failed insert: "${item.tbn}" values ... table key is: ${item.tbk}`)
                        }
                        // in last interaction
                        idx === array.length -1 ? (() => {
                            errors.length > 0 ? (() => {
                                errors.forEach(e => this.log(`[IDBStorage.create Error]: ${e}`))
                                reject(errors)
                            })() : resolve(true)
                        })(): null
                    })
                } catch(ex) {
                    this.log(`[IDBStorage.create Error]: ${ex.message}`)
                    reject(ex.message)
                }
            } else {
                let error = '"creation" operation expect a `Array` object'
                this.log(`[IDBStorage.create Error]: ${error}`)
                reject(error)
            }
        })
    }
    /**
     * [read description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    read(data) {
        return new Promise((resolve, reject) => {
            //
            try {
                //
                let methodAdjust = (method) => {
                    if ( typeof data === 'object' && !Array.isArray(data) ) {
                        if ( 'method' in data && typeof data.method === 'string' ) {
                            return CRUDMETHODS.includes(data.method) ? data.method : 'one'
                        } else {
                            return 'one'
                        }
                    } else {
                        throw new CollectionCRUDException(REQOBJECT, 1)
                    }
                }

                if ( !this.db ) {
                    throw new CollectionCRUDException(NODB, 1)
                } else if ( typeof data === 'object' && !Array.isArray(data) ) {
                    // check method ... default to "one"
                    let method = methodAdjust(data)
                    try {
                        let transact = this.db.transaction([data.tbn], 'readonly'),
                            object   = transact.objectStore(data.tbn)
                        switch (method) {
                            case 'count':
                                let counter = object.count()
                                counter.onsuccess = () => {
                                    resolve(counter.result)
                                }
                                counter.onerror = e => {
                                    reject(e)
                                }
                                break
                            case 'like':
                                let liker = object.openCursor(IDBKeyRange.bound(data.tbk, data.tbk + '\uffff'), 'prev'),
                                    likerResult = []
                                liker.onsuccess = sc => {
                                    let cursor = sc.target.result
                                    if ( cursor ) {
                                        likerResult.push({
                                            key: cursor.key,
                                            value: cursor.value
                                        })
                                        cursor.continue()
                                    } else {
                                        resolve(likerResult)
                                    }
                                }
                                liker.onerror = err => {
                                    reject(err)
                                }
                                break
                            case 'one':
                                let finder  = object.get(data.tbk)
                                finder.onsuccess = sc => {
                                    if ( sc.target.result === undefined ) {
                                        reject(false)
                                    } else {
                                        resolve(sc.target.result) // value
                                    }
                                }
                                finder.onerror = err => {
                                    reject(err)
                                }
                                break
                            case 'all':
                                let result = []
                                object.openCursor().onsuccess = sc => {
                                    let cursor = sc.target.result
                                    if ( cursor ) {
                                        /**
                                         * Old method ...
                                         *
                                         * result.push({
                                         *     key: cursor.key,
                                         *     value: cursor.value
                                         * });
                                         */
                                        result.push(cursor.value)
                                        cursor.continue()
                                    } else {
                                        resolve(result) // array [objects]
                                    }
                                }
                                break
                            case 'getAll':
                                object.getAll().onsuccess = event => {
                                    resolve(event.target.result) // array [values]
                                }
                                break
                        }
                    } catch(ex) {
                        this.log(`[IDBStorage.read Error]: ${ex.message}`)
                        reject(ex.message)
                    }
                } else {
                    let error = '"reading" operation expect a `Object` object'
                    this.log(`[IDBStorage.read Error]: ${error}`)
                    reject(error)
                }
            } catch(ex) {
                //
            }
        })
    }
    /**
     * [update description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    update(data) {}
    /**
     * [delete description]
     * @param  {[type]} data [description]
     * @return {[type]}      [description]
     */
    delete(data) {
        return new Promise((resolve, reject) => {
            if ( !CRUDChecker(this, 'delete') ) {
                reject(CRUDERRORMESSAGE)
            } else if ( typeof data === 'object' && (!Array.isArray(data) || Array.isArray(data)) ) {
                try {
                    let response = [],
                        errors   = []
                    if ( Array.isArray(data) ) {
                        data.forEach((item, idx, arr) => {
                            // in last interaction
                            idx === arr.length -1 ? (() => {
                                //
                            })() : null
                        })
                    } else {
                        let transaction = this.db.transaction([data.tbn], 'readwrite')
                        // report on the success of the transaction completing, when everything is done
                        transaction.oncomplete = function(event) {
                            // @REVISE
                            console.log('> transaction conpleted ------------')
                        }
                        transaction.onerror = function(event) {
                            console.error(event)
                        }
                        transaction.onabort = event => {
                            let error = ('customError' in event.target) ? event.target.customError : event.target.error
                            this.log(`[IDBStorage.delete Error]: "aborted" operation, ${error}`)
                            reject(error)
                        }
                        let object = transaction.objectStore(data.tbn)

                        if ( ('tbk' in data) && typeof data.tbk === 'string' ) {
                            let request = object.delete(data.tbk)
                            request.onsuccess = resolve()
                            request.onerror = reject()
                        } else if ( ('tbk' in data) && typeof data.tbk === 'object' && Array.isArray(data.tbk) ) {
                            data.tbk.forEach(async (item, idx, arr) => {
                                let request = await object.delete(item)
                                request.onsuccess = () => {
                                    return response.push(item)
                                }
                                request.onerror = () => {
                                    return errors.push(item)
                                }
                                // in last interaction
                                idx === arr.length -1 ? (() => {
                                    if ( response.length > 0 ) {
                                        resolve(response)
                                    } else if ( response.length === 0 && errors.length > 0 ) {
                                        reject(errors)
                                    } else  {
                                        reject()
                                    }
                                })() : null
                            })
                        } else {
                            transaction.customError = `table (${data.tbn}) "key" is not acceptable`
                            // abort transaction
                            transaction.abort()
                        }

                    }
                } catch(ex) {
                    this.log(`[IDBStorage.delete Error]: ${ex.message}`)
                    reject(ex.message)
                }
            } else {
                let error = '"reading" operation expect a `Array` object'
                this.log(`[IDBStorage.delete Error]: ${error}`)
                reject(error)
            }
        })
    }
    /**
     *
     */
    erase(list = false) {
        return new Promise(async (resolve, reject) => {
            try {
                let tolog = [],
                    forceClose = () => {
                    this.db.close()
                    this.db = false
                    this.opened = false
                }
                if ( Array.isArray(list) ) {
                    list.forEach(async (dbname, idx, arr) => {
                        if ( await this.exists(String(dbname)) ) {
                            // prevent force `.close()` to evite `.onversionchange()`
                            dbname === this.dbname && this.opened ? forceClose() : null
                            indexedDB.deleteDatabase(dbname)
                            tolog.push(dbname)
                        }
                        idx === arr.length -1 ? (() => {
                            tolog.length > 0 ? this.log(`[IDBStorage.erase]: database(s): "${tolog.toString()}" has been deleted`) : null
                            resolve(tolog) // expected result same equal initial list
                        })() : null
                    })
                } else {
                    let dbname = (typeof list === 'string' && list.trim() !== '' ) ? list : this.dbname
                    // prevent force `.close()` to evite `.onversionchange()`
                    dbname === this.dbname && this.opened ? forceClose() : null
                    indexedDB.deleteDatabase(dbname)
                    // log
                    this.log(`[IDBStorage.erase]: database: "${dbname}" has been deleted`)
                    resolve()
                }
            } catch(ex) {
                // log
                this.log(`[IDBStorage.erase Error]: ${ex.message}`)
                reject(ex)
            }
        })
    }
    /**
     * Erase all databases - not `throws`, not return
     */
    eraseAll() {
        (async (scope) => {
            try {
                let tolog = [],
                    result = await indexedDB.databases(),
                    forceClose = () => {
                    scope.db.close()
                    scope.db = false
                    scope.opened = false
                }
                // prevent force `.close()` to evite `.onversionchange()`
                db.name === scope.name && scope.opened ? forceClose() : null

                result.forEach(async (db, idx, arr) => {
                    if ( await scope.exists(String(db.name)) ) {
                        indexedDB.deleteDatabase(db.name)
                        tolog.push(db.name)
                    }
                    idx === arr.length -1 ? (() => {
                        tolog.length > 0 ? scope.log(`[IDBStorage.eraseAll]: database(s): "${tolog.toString()}" has been deleted`) : null
                    })() : null
                })
            } catch(ex) {
                scope.log(`[IDBStorage.eraseAll Error]: ${ex.message}`)
            }
        })(this)
    }
    /**
     * Check if database exists
     * @param {String} dbname - databse name [default: use `this.dbname`]
     */
    async exists (dbname = false) {
        dbname = (typeof dbname === 'string' && dbname.trim() !== '' ) ? dbname : this.dbname
        // Firefox not have "databases" property on `indexedDB`
        if ( !('databases' in indexedDB) ) {
            let result = await function exists() {
                return new Promise((resolve, reject) => {
                    // Try if it exist
                    let request = indexedDB.open(name);
                    request.onsuccess = function () {
                        req.result.close();
                        resolve(true);
                    }
                    request.onupgradeneeded = function (evt) {
                        evt.target.transaction.abort();
                        reject(false);
                    }
                })
            }
        } else {
           let result =  await indexedDB.databases()
           return (await result.find(db => db.name === dbname) !== undefined) ? true : false
        }
    }
}

/**
 * Minimalistic IndexedDB Storage Handler (aka MISH)
 * @param {String}   one  - database name
 * @param {Number}   two  - database version [positive `Integer`]
 * @param {Function} tree - logging handler
 */
export default function MISH(one, two, tree) {
    // instance this
    if ( !(this instanceof MISH) ) {
        return new MISH(one, two, tree)
    }

    let handler = new IDBStorage(one, two, tree)

    // return database "global" methods
    return {
        open(x) {
            // open database
            return handler.open(x)
            // return "fake" database operations (CRUD) ... see ConnectionHandler description
            //return typeof ConnectionHandler === 'function' ? ConnectionHandler() : ConnectionHandler
        },
        close() {
            // return "fake" database `.close()` method ... see ConnectionHandler description
            //return ConnectionHandler().close()
            return handler.close()
        },
        erase(x) {
            return handler.erase(x)
        },
        eraseAll() {
            return handler.eraseAll()
        },
        exists(x) {
            return handler.exists(x)
        }
    }
}