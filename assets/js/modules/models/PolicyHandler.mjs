/**
 * Policy Handler
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
    constructor(name = 'default', logging = false) {
        this.name       = name
        this.permission = dc.cookie.includes('__DSPolicy__') ? 'authorized' : 'unauthorized'
        // to register logs
        this.log = (logging && typeof logging === 'object') ? logging : noop

        this.log.success('[Policy Handler]: ', 'handler has been initialized')
    }

    async getAllPermissions() {
        return await getAllPermissions()
    }

    async getPermission(permission) {
       const list = await this.getAllPermissions()
       return list[permission]
    }

    requestPermission(feature) {
        // check support
    }

    acceptStoragement() {
        return Cookies.set('__DSPolicy__', Date.now(), {expire: 30, secure: true}).then(() => { return this.permission = 'authorized' })
    }

    refuseStoragement(clearAllData) {
        return clearAllData ? (Promise.resolve(CleanBrowserStoragement()).then(() => { this.permission = 'unauthorized' })) : Cookies.del('__DSPolicy__').then(() => { return this.permission = 'unauthorized' })
    }

    static get permission() {
        return dc.cookie.includes('__DSPolicy__') ? 'authorized' : 'unauthorized'
    }

    static get language() {
        return dc.cookie.includes('i18n=') ? Cookies.getSync('i18n') : (dc.documentElement.lang !== '' ? dc.documentElement.lang : nv.languages[0])
    }
}