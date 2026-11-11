/**

* Indexed Events Log
* Indexed Execution Tracking
* 
* @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
* @copyright Copyright (c) 2021 Lauro Moraes - [https://github.com/subversivo58]
* @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
  */

// functions
import { PathName } from '../functions/Functions.mjs'

/**

* Local environments recognized by the logger.
* The port is intentionally not checked.
  */
  const LOCAL_HOSTS = [
  'localhost',
  '127.0.0.1',
  '::1'
  ]

/**

* Read the DEBUG configuration from the HTML document.

* 

* Only the values "true" and "false" are accepted.

* Missing or invalid values disable the logger.
  */
  const getDebugConfig = () => {
  
  if (typeof document === 'undefined') {
  return false
  }
  
  const meta = document.head?.querySelector(
  'meta[name="DEBUG"]'
  )
  
  if (!meta) return false
  
  const value = String(
  meta.getAttribute('content') ?? ''
  ).trim().toLowerCase()
  
  return value === 'true'
  }

/**

* Identify the current execution environment.
  */
  const isDevelopment = () => {
  
  if (typeof location === 'undefined') {
  return false
  }
  
  return LOCAL_HOSTS.includes(
  location.hostname.toLowerCase()
  )
  }

/**

* Logger configuration.
  */
  const DEBUG_ENABLED = getDebugConfig()
  const DEVELOPMENT = isDevelopment()

/**

* Generate an ISO timestamp.
  */
  const UNIXTIMESTAMP = () => new Date().toISOString()

/**

* Generate unique keys for log records.
* 
* The timestamp preserves chronological ordering.
* The sequence prevents collisions in the same millisecond.
* The random suffix helps distinguish different tabs.
  */
  let LogSequence = 0

const LogKey = (name, timestamp) => {

const sequence = ++LogSequence

let hex = ''

try {

    const bytes = new Uint8Array(4)

    globalThis.crypto.getRandomValues(bytes)

    hex = Array.from(bytes, byte =>
        byte.toString(16).padStart(2, '0')
    ).join('')

} catch (_) {

    hex = Date.now().toString(16)
}

return `${name}|${timestamp}-${String(sequence).padStart(6, '0')}-${hex}`

}

/**

* Check whether a value is an Error object.

* 

* Object.prototype.toString also supports errors

* originating from another JavaScript realm.
  */
  const isError = value => {
  
  if (!value || typeof value !== 'object') {
  return false
  }
  
  return (
  value instanceof Error ||
  Object.prototype.toString.call(value) === '[object Error]'
  )
  }

/**

* Capture the caller location.

* 

* Stack formats differ between Chromium and Firefox.

* Instead of removing a fixed number of lines,

* internal logger frames are filtered by filename.
  */
  const getStack = () => {
  
  const stack = new Error().stack
  
  if (typeof stack !== 'string') {
  return null
  }
  
  const lines = stack.split('\n').slice(1)
  
  const caller = lines.find(line => {
  return !/IndexedLogs.mjs/i.test(line)
  })
  
  return caller ? caller.trim() : null
  }

/**

* Extract the original stack from an Error.
  */
  const getErrorStack = error => {
  
  if (!isError(error)) {
  return null
  }
  
  return typeof error.stack === 'string'
  ? error.stack
  : null
  }

/**

* Indexed Events Log

* 

* Responsibilities:

* - Register application events.

* - Store records in the analytics object store.

* - Apply environment-specific logging rules.

* - Keep the configured maximum number of records.

* 

* The database connection is injected externally.

* This class does not create, open, or close databases.
  */
  class IndexedDBLogs {
  
  constructor(name, limit = 500) {
  
   if (typeof name !== 'string' || !name.trim()) {
     throw new TypeError(
         '[IndexedDBLogs] A non-empty logger name is required.'
     )
 }

 this.name = name.trim()

 this.limit = (
     Number.isInteger(limit) && limit > 0
 ) ? limit : 500

 this.disabled = !DEBUG_ENABLED

 this.environment = DEVELOPMENT
     ? 'development'
     : 'production'

 this.conn = null
 this._pruning = null
 this._pruneTimer = null
  
  }
  
  /**
  
  * Inject an already opened database connection.
  
  * 
  
  * The expected object is the connection returned by:
  
  * 
  
  * ConnectionDB.open(settings.database.indexed)
  
  * 
  
  * Required methods:
  
  * - update()
  
  * - read()
  
  * - delete()
      */
      setConnection(connection) {
    
    if (this.disabled) {
    return false
    }
    
    if (
    !connection ||
    typeof connection.update !== 'function' ||
    typeof connection.read !== 'function' ||
    typeof connection.delete !== 'function'
    ) {
    return false
    }
    
    this.conn = connection
    
    // Check existing records after the connection is available.
    this._schedulePrune(5000)
    
    return true
    }
  
  /**
  
  * Schedule record maintenance.
  
  * 
  
  * Consecutive writes reset the timer, avoiding
  
  * unnecessary simultaneous pruning operations.
    */
    _schedulePrune(delay = 1000) {
    
    if (this.disabled || !this.conn) {
    return false
    }
    
    if (this._pruneTimer !== null) {
    clearTimeout(this._pruneTimer)
    }
    
    this._pruneTimer = setTimeout(() => {
    
     this._pruneTimer = null

 this.prune()
    
    }, delay)
    
    return true
    }
  
  /**
  
  * Check whether a logging method is allowed
  
  * in the current environment.
    */
    _isAllowed(type) {
    
    if (this.disabled || !this.conn) {
    return false
    }
    
    const normalized = String(type).toUpperCase()
    
    // DEBUG and INFO are development-only.
    if (
    normalized === 'DEBUG' ||
    normalized === 'INFO'
    ) {
    return DEVELOPMENT
    }
    
    // Other explicitly requested events are allowed.
    return true
    }
  
  /**
  
  * Normalize the event message.
    */
    _normalizeMessage(message) {
    
    if (isError(message)) {
    return message.message || message.name
    }
    
    if (typeof message === 'string') {
    return message
    }
    
    if (message === null || message === undefined) {
    return ''
    }
    
    try {
    
     return String(message)
    
    } catch (_) {
    
     return '[Unserializable message]'
    
    }
    }
  
  /**
  
  * Register an event in IndexedDB.
  
  * 
  
  * Storage failures are intentionally silent:
  
  * logging must never interrupt application execution.
    */
    async _record(type, message, data = null, errorStack = null) {
    
    if (!this._isAllowed(type)) {
    return false
    }
    
    const timestamp = UNIXTIMESTAMP()
    
    let page = null
    
    try {
    
     page = `${PathName(true)}.html`
    
    } catch (_) {
    
     // Page identification is optional.
    
    }
    
    const record = {
    timestamp,
    page,
    type: String(type).toUpperCase(),
    message: this._normalizeMessage(message),
    data: data ?? null,
    stack: {
    caller: getStack(),
    error: errorStack
    }
    }
    
    try {
    
     await this.conn.update([{
     tbn: 'analytics',
     tbk: LogKey(this.name, timestamp),
     tbv: record
 }], 'add')

 // Maintain the configured record limit.
 this._schedulePrune()

 return true
    
    } catch (_) {
    
     // A failed log write must not break the application.
 return false
    
    }
    }
  
  /**
  
  * Register a successful operation.
  * 
  * Available in development and production.
    */
    success(message, data = null) {
    return this._record('SUCCESS', message, data)
    }
  
  /**
  
  * Register informational details.
  * 
  * Development only.
    */
    info(message, data = null) {
    return this._record('INFO', message, data)
    }
  
  /**
  
  * Register a warning.
  * 
  * Available in development and production.
    */
    warn(message, data = null) {
    return this._record('WARN', message, data)
    }
  
  /**
  
  * Register an error.
  
  * 
  
  * If an Error object is supplied, its original stack
  
  * is stored separately from the logger caller location.
    */
    error(error, data = null) {
    
    return this._record(
    'ERROR',
    error,
    data,
    getErrorStack(error)
    )
    }
  
  /**
  
  * Register debugging information.
  * 
  * Development only.
    */
    debug(message, data = null) {
    return this._record('DEBUG', message, data)
    }
  
  /**
  
  * Register a custom application event.
  
  * 
  
  * Available in development and production.
    */
    event(type, message, data = null) {
    
    if (
    typeof type !== 'string' ||
    !type.trim()
    ) {
    return Promise.resolve(false)
    }
    
    return this._record(
    type.trim().toUpperCase(),
    message,
    data
    )
    }
  
  /**
  
  * Keep only the latest "limit" records belonging
  
  * to this logger in the analytics object store.
  
  * 
  
  * Records from other loggers are never removed.
    */
    prune() {
    
    if (
    this.disabled ||
    !this.conn
    ) {
    return Promise.resolve(0)
    }
    
    if (this._pruning) {
    return this._pruning
    }
    
    this._pruning = (async () => {
    
     const candidates = await this.conn.read({
     tbn: 'analytics',
     method: 'like',
     tbk: this.name
 })

 if (!Array.isArray(candidates)) {
     return 0
 }

 const prefix = `${this.name}|`

 // The "like" method returns { key, value } objects.
 const records = candidates
     .filter(record => {

         return (
             record &&
             typeof record.key === 'string' &&
             record.key.startsWith(prefix)
         )
     })
     .sort((a, b) => {

         return a.key.localeCompare(b.key)
     })

 const excess = records.length - this.limit

 if (excess <= 0) {
     return 0
 }

 // Remove only the oldest records belonging to this logger.
 const oldest = records
     .slice(0, excess)
     .map(record => ({
         tbn: 'analytics',
         tbk: record.key
     }))

 await this.conn.delete(oldest)

 return excess
    
    })().catch(() => {
    
     // Pruning failures must not interrupt the application.
 return 0
    
    }).finally(() => {
    
     this._pruning = null
    
    })
    
    return this._pruning
    }
  
  /**
  
  * Return the current execution environment.
    */
    static get environment() {
    
    return DEVELOPMENT
    ? 'development'
    : 'production'
    }
  
  /**
  
  * Return whether the logger is enabled.
    */
    static get enabled() {
    return DEBUG_ENABLED
    }
  
  /**
  
  * Return the caller stack location.
    */
    static getStack() {
    return getStack()
    }
    }

export default IndexedDBLogs