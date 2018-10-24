/**
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2018 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */
import {UTILS} from './Utils.mjs'

/**
 * IndexedDB CRUD
 */
export default {
    /**
     * create banks, tables and objects
     * @param  {Object} opt
     * @return {Object}:Promise
     */
    init(opt) {
        return new Promise((resolve, reject) => {
            try {
                let data,
                    request = indexedDB.open(opt.name, opt.version)
                let createTables = dataBase => {
                    let t = opt.tables
                    for (let i = 0; i < t.length; i++) {
                         dataBase.createObjectStore( t[i] )
                    }
                    dataBase.close()
                    resolve()
                };
                let put = () => {
                    if ( !!opt.tables && Array.isArray(opt.tables) ) {
                        let tables = opt.tables,
                            errors = []
                        for (let i = 0; i < tables.length; i++) {
                            if ( tables[i].tbk !== undefined ) {
                                let transaction = data.transaction( [tables[i].tbn], 'readwrite' )
                                transaction.objectStore( tables[i].tbn ).put( tables[i].tbv, tables[i].tbk )
                            } else {
                                let obj = {}
                                obj.message = '[ERROR!] failed insert: ' + tables[i].tbn + ' values'
                                errors.push(obj)
                            }
                        }
                        if ( errors.length > 0 ) {
                            reject(errors)
                        } else {
                            resolve()
                        }
                    } else {
                         reject()
                    }
                }
                request.onsuccess = sc => {
                    data = sc.target.result
                    put()
                }
                request.onerror = er => {
                    let err_message = (er) ? er : 'Error in create|open indexedDB!'
                    reject(err_message)
                }
                request.onupgradeneeded = up => {
                    if ( !UTILS.isNull(opt.tables) && UTILS.isObject(opt.tables) ) {
                        createTables(up.target.result)
                    } else {
                        resolve({
                            ok: true
                        })
                    }
                }
            } catch(ex) {
                reject()
            }
        })
    },
    // fetch entires
    get(opt) {
        let self = this
        return new Promise((resolve, reject) => {
            let method = (!!opt.method) ? opt.method : 'one', // for method get (one object or all objects)
                dbname = opt.name,                           // for db name
                dbv    = (!!opt.version) ? opt.version : 1, // database version
                table  = (!!opt.tbn) ? opt.tbn : false,    // for table name
                key    = (!!opt.tbk) ? opt.tbk : false,   // for table key object
                data                                     // null|undefined for instance new connection
            let ready = () => {
                let request = indexedDB.open( dbname, dbv )
                let goSearch = database => {
                    switch (method) {
                        case 'count':
                            try {
                                let transact = database.transaction([table], 'readonly'),
                                    object   = transact.objectStore(table ),
                                    request = object.count()
                                request.onsuccess = () => {
                                    resolve(request.result)
                                }
                                request.onerror = e => {
                                    reject(e)
                                }
                            } catch(ex) {
                                reject(ex)
                            }
                        break
                        case 'like':
                            try {
                                let result = []
                                let transact = database.transaction([table], 'readonly'),
                                    object = transact.objectStore(table),
                                    request = object.openCursor(IDBKeyRange.bound(key, key + '\uffff'), 'prev')
                                request.onsuccess = sc => {
                                    let cursor = sc.target.result
                                    if ( cursor ) {
                                        result.push({
                                            key: cursor.key,
                                            value: cursor.value
                                        })
                                        cursor.continue()
                                    } else {
                                        database.close()
                                        resolve(result)
                                    }
                                }
                                request.onerror = err => {
                                    database.close()
                                    reject(err)
                                }
                            } catch(ex) {
                                reject(ex)
                            }
                        break
                        case 'one':
                            try {
                                let transact = database.transaction([table], 'readonly'),
                                    object   = transact.objectStore(table),
                                    request  = object.get( key )
                                request.onsuccess = sc => {
                                    if ( sc.target.result === undefined ) {
                                        reject(false)
                                    } else {
                                        database.close()
                                        resolve(sc.target.result) // value
                                    }
                                }
                                request.onerror = err => {
                                    reject(err)
                                };
                            } catch(ex) {
                                reject(ex)
                            }
                        break
                        case 'all-old':
                            try {
                                let transact = database.transaction(table).objectStore(table)
                                let result = []
                                transact.openCursor().onsuccess = sc => {
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
                            } catch(ex) {
                                reject(ex)
                            }
                        break
                        case 'all-new':
                            /**
                             * shim to old method ["openCursor()"] case no have support to new method ["getAll()"]
                             * since Chrome 48
                             */
                            try {
                                let transact = database.transaction(table).objectStore(table)
                                if ('getAll' in transact) {
                                    transact.getAll().onsuccess = event => {
                                        resolve(event.target.result) // array [values]
                                    }
                                } else {
                                    let result = []
                                    transact.openCursor().onsuccess = sc => {
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
                                }
                            } catch(ex) {
                                reject(ex)
                            }
                        break
                        default:
                            reject()
                        break
                    }
                }
                request.onsuccess = sc => {
                    data = sc.target.result
                    goSearch( data )
                }
                request.onerror = err => {
                    // @revise
                    console.error('Get Error, code: ' + er.target.errorCode)
                    reject( err )
                }
            }
            // check
            self.check({
                name: dbname,
                version: dbv
            }).then(res => {
                ready()
            }).catch(err => {
                if ( err !== false ) {
                    // @revise
                    console.error('[ERROR!] CHECK INDEXED DATABASE FAILED!')
                } else {
                    self.destroy({
                        name: dbname
                    })
                }
                reject(err)
            })
        })
        //return this;
    },
    /**
     * check if database exist (onsuccess response) or not(onupgradeneeded response) [used by get method]
     * @param  {Object} opt
     * @return {Object}:Promise
     */
    check(opt) {
        return new Promise((resolve, reject) => {
            let dbv = (!!opt.version) ? opt.version : 1,
                dbn,
                request = indexedDB.open( opt.name, dbv )
            request.onsuccess = sc => {
                if ( dbn === undefined || dbn === null ) {
                    resolve()
                } else {
                    dbn.close()
                    reject(false)
                }
            }
            request.onerror = err => {
                reject(err)
            }
            // on created
            request.onupgradeneeded = up => {
                dbn = up.target.result
            }
        })
        //return this;
    },
    /**
     * Clear entire(s)
     * @param  {Object} opt
     * @return {Object}:Promise
     */
    clear(opt) {
        let self = this
        return new Promise((resolve, reject) => {
            let method = opt.method,                          // for method get (one object or all objects)
                dbname = opt.name,                           // for db name
                dbv    = (!!opt.version) ? opt.version : 1, // database version
                table  = opt.tname,                        // for table name
                key    = opt.tkey,                        // for table key object
                data                                     // null/undefined for instance new connection
            let ready = () => {
               let request = indexedDB.open( dbname, dbv )
               let removeObject = conn => {
                   if ( method === 'all' ) {
                       let transact = conn.transaction( table, 'readwrite' ).objectStore( table )
                       transact.clear().onsuccess = sc => {
                           resolve()
                       }
                   } else {
                       let transact = conn.transaction( [table], 'readwrite' ).objectStore( table ).delete( key );
                       transact.onsuccess = sc => {
                           resolve()
                       }
                   }
               }
               request.onsuccess = sc => {
                   if ( dbn === undefined || dbn === null ) {
                       data = sc.target.result
                       removeObject( data )
                   } else {
                       // @revise
                       console.error('[ERROR!] DELETE DATABASE: ' + dbname)
                       self.destroy({
                           name: dbname
                       }).then(() => {
                           reject()
                       }).catch(() => {
                           reject()
                       })
                   }
               }
               request.onerror = err => {
                   // @revise
                   console.error('[ERROR!] FAILED CLEAR INDEXED TABLE! CODE: ' + err.target.errorCode)
                   reject(err)
               }
               request.onupgradeneeded = up => {
                   dbn = 'onupgradeneeded'
                   // @revise
                   console.error('[ERROR!] FAILED CLEAR NO HAVE DATABASE!')
               }
            }
            ready()
        })
        //return this;
    },
    /**
     * destroy data base(s)
     * @param  {Object}:Array opt
     * @return {Object}:Promise
     */
    destroy(opt) {
        return new Promise((resolve, reject) => {
            try {
                let dbv = (!!opt.version) ? opt.version : 1
                indexedDB.deleteDatabase( opt.name )
                resolve({
                    ok: true
                });
            } catch(ex) {
                reject(ex)
            }
        })
    }
}
