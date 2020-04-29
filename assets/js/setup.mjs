/**
 * @license The MIT License (MIT)             - [https://github.com/Pluggeding/pluggeding.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2020 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/Pluggeding/pluggeding.github.io/blob/master/VERSIONING.md]
 */
'use strict'
import {
    IsWebBrowserContext,
    IsWebWorkerContext,
    IsServiceWorkerContext,
    IsFrameBox,
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
} from './modules/BasePrefixes.mjs'
import _ from './modules/Helpers.mjs'
import {
    Bytes2Size,
    DeepFreeze,
    DeepEqual,
    StringDistance,
    FindAndReplace,
    Queue,
    Stack,
    PathName,
    DirsLevel,
    Redirect,
    SendBeacon,
    ColorPallet,
    TimeLength,
    TimeAgo
} from './modules/Functions.mjs'
import Emitter from './modules/Emitter.mjs'
import AWIndexedDB from './modules/AwesomeIndexedDB.mjs'
import BootstrapNative from './modules/bootstrap-native.mjs'
import iLibJS from './modules/IlibJS.mjs'
import {
    Cookies as AWCookies,
    Storage as AWStorage,
    Caches as AWCache,
    CleanBrowserStoragement as AWClearBrowserStoragement
} from './modules/AwesomeStorage.mjs'

const ConnectionDB = new AWIndexedDB('Subversivo58', 1, console.log)

let BaseRootRegExp = new RegExp(BaseRoot),
    redirectAfterSetup = (dc.referrer !== '') ? (dc.referrer.test(BaseRoot) ? dc.referrer : BaseRoot) : BaseRoot,
    SettingsCFG

new iLibJS('i18n')

const Events = new Emitter('setup')

// After HTMLDocument is charged and parsed [don't wait charge stylesheet's, images and subframe's]
_.DOM.event(dc, 'DOMContentLoaded', async evt => {

    const router = PathName(true)
    switch (router) {

        case 'index':
            // check URI "search" fragment
            if ( location.search === '?utm_source=homescreen' ) {
                // is pwa launch ... register log
            }
            break

        case 'dashboard':
            break

        case 'control':
            break

        case 'policy':
            break

    }

}, _.EventOptions(false, true, true), true);