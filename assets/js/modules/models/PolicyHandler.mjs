/**
 * @file PolicyHandler.mjs
 * @description Privacy policy consent handling and cookie-based authorization state.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
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

import { CleanBrowserStoragement, Storage as AWStorage, Cookies } from '../lib/AwesomeStorage.mjs'

/**
 * Web Permissions API
 * @type { Array }
 */
const permissionsNames = [
  "geolocation",
  "notifications",
  "push",
  "midi",
  "camera",
  "microphone",
  "speaker",
  "device-info",
  "background-fetch",
  "background-sync",
  "bluetooth",
  "persistent-storage",
  "ambient-light-sensor",
  "accelerometer",
  "gyroscope",
  "magnetometer",
  "clipboard",
  "display-capture",
  "nfc"
];
/**
 * [description]
 * @return {[type]} [description]
 */
const getAllPermissions = async () => {
    const allPermissions = {}
    // We use Promise.all to wait until all the permission queries are resolved
    await Promise.all(
        permissionsNames.map(async permissionName => {
            try {
                let permission
                switch (permissionName) {
                    case 'push':
                        // Not necessary but right now Chrome only supports push messages with  notifications
                        permission = await navigator.permissions.query({ name: permissionName, userVisibleOnly: true })
                        break
                  default:
                        permission = await navigator.permissions.query({ name: permissionName })
                }
                allPermissions[permissionName] = { state: permission.state }
            } catch(e) {
                allPermissions[permissionName] = { state: 'error', errorMessage: e.toString() }
            }
        })
    )
    return allPermissions
}

/**
 *
 */
export default class PolicyHandler {
    /**
     * Creates a policy handler.
     * @param {string} [name='default'] - Handler name, used in logs.
     * @param {boolean|Function} [logging=false]
     * @description The initial permission is 'authorized' when the __DSPolicy__ cookie exists, otherwise 'unauthorized'.
     */
    constructor(name = 'default', logging = false, analytics = null) {
        this.name       = name
        this.permission = dc.cookie.includes('__DSPolicy__') ? 'authorized' : 'unauthorized'
        this.analyticsEnabled = false
        this.analytics = analytics || null
        // to register logs
        this.log = (logging && typeof logging === 'object') ? logging : noop

        this.log.success('[Policy Handler]: ', 'handler has been initialized')
    }

    /**
     * Attaches the Analytics instance used to report technical failures.
     * @param {Object|null} analytics
     */
    setAnalytics(analytics) {
        this.analytics = analytics || null
    }

    /**
     * Loads the analytics consent state from the analytics object store,
     * falling back to legacy config/preferences.connNotific2 when present.
     * @param {Object} database - Opened AwesomeIndexedDB connection.
     * @return {Promise<boolean>}
     */
    async loadAnalyticsConsent(database) {
        if (!database || typeof database.read !== 'function') {
            return this.analyticsEnabled
        }

        try {
            const stored = await database.read({
                tbn: 'analytics',
                tbk: 'consent'
            })

            if (stored && typeof stored === 'object' && typeof stored.enabled === 'boolean') {
                this.analyticsEnabled = stored.enabled
                return this.analyticsEnabled
            }

            const preferences = await database.read({
                tbn: 'config',
                tbk: 'preferences'
            })

            if (preferences && typeof preferences === 'object' && typeof preferences.connNotific2 === 'boolean') {
                this.analyticsEnabled = preferences.connNotific2
                if (typeof database.create === 'function') {
                    await database.create([
                        {
                            tbn: 'analytics',
                            tbk: 'consent',
                            tbv: {
                                enabled: this.analyticsEnabled,
                                updatedAt: new Date().toISOString()
                            }
                        }
                    ]).catch(() => {})
                }
            }
        } catch (error) {
            console.error('[POLICY]: Could not load analytics consent', error)
            this.analytics?.trackError?.('policy', error)?.catch?.(() => {})
        }

        return this.analyticsEnabled
    }

    /**
     * Persists the user analytics consent decision in the analytics object store.
     * @param {boolean} enabled
     * @param {Object} database - Opened AwesomeIndexedDB connection.
     * @return {Promise<boolean>}
     */
    async setAnalyticsConsent(enabled, database) {
        this.analyticsEnabled = Boolean(enabled)

        if (database && typeof database.create === 'function') {
            try {
                await database.create([
                    {
                        tbn: 'analytics',
                        tbk: 'consent',
                        tbv: {
                            enabled: this.analyticsEnabled,
                            updatedAt: new Date().toISOString()
                        }
                    }
                ])
            } catch (error) {
                this.analytics?.trackError?.('policy', error)?.catch?.(() => {})
                throw error
            }
        }

        return this.analyticsEnabled
    }

    /**
     * Returns all the permissions of the browser.
     * @return {Promise<Object>}
     */
    async getAllPermissions() {
        return await getAllPermissions()
    }

    /**
     * Returns the state of one permission.
     * @param {string} permission - Permission name.
     * @return {Promise<string|undefined>}
     */
    async getPermission(permission) {
       const list = await this.getAllPermissions()
       return list[permission]
    }

    /**
     * Requests a permission.
     * @param {string} feature
     * @description The method is not implemented yet. It has no effect.
     */
    requestPermission(feature) {
        // check support
    }

    /**
     * Accepts the data storage policy: sets the __DSPolicy__ cookie for 30 days.
     * @return {Promise<void>}
     */
    acceptStoragement() {
        return Cookies.set('__DSPolicy__', Date.now(), {expire: 30, secure: true})
            .then(() => { return this.permission = 'authorized' })
            .catch(error => {
                this.analytics?.trackError?.('policy', error)?.catch?.(() => {})
                throw error
            })
    }

    /**
     * Refuses the data storage policy, optionally clearing the stored data.
     * @param {boolean} clearAllData - Clears cookies and browser storage when true.
     * @return {Promise<void>}
     */
    refuseStoragement(clearAllData) {
        const action = clearAllData
            ? Promise.resolve(CleanBrowserStoragement()).then(() => { this.permission = 'unauthorized' })
            : Cookies.del('__DSPolicy__').then(() => { return this.permission = 'unauthorized' })

        return action.catch(error => {
            this.analytics?.trackError?.('policy', error)?.catch?.(() => {})
            throw error
        })
    }

    static get permission() {
        return dc.cookie.includes('__DSPolicy__') ? 'authorized' : 'unauthorized'
    }

    static get language() {
        // A language chosen by the user (cookie) always wins.
        if ( dc.cookie.includes('i18n=') ) {
            return Cookies.getSync('i18n')
        }

        const supported = PolicyHandler.supported || []

        // Match only the primary subtag (pt, es, en...). The region suffix is ignored.
        for (const candidate of (nv.languages || [])) {
            const prefix = String(candidate).split('-')[0].toLowerCase()
            const match = supported.find(code => code.split('-')[0].toLowerCase() === prefix)
            if ( match ) return match
        }

        // Unknown language: fall back to en-US.
        return 'en-US'
    }
}

// Supported languages (from settings.source.language), set once by setup.
PolicyHandler.supported = []