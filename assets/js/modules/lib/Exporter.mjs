/**
 * Exporter - Base dir exportation
 * @license The MIT License (MIT)             - [https://github.com/Pluggeding/pluggeding.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2020 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/Pluggeding/pluggeding.github.io/blob/master/VERSIONING.md]
 */

import Emitter from './Emitter.mjs'

import CryptoHandler from './CryptoHandler.mjs'

import GitHubAPI from './GitHubAPI.mjs'

import {
    Cookies as AWCookies,
    Storage as AWStorage,
    Caches as AWCache,
    CleanBrowserStoragement as AWClearBrowserStoragement
} from './AwesomeStorage.mjs'

import AWIndexedDB from './AwesomeIndexedDB.mjs'

import IlibJS from './IlibJS.mjs'

export {
    Emitter,
    CryptoHandler,
    GitHubAPI,
    AWCookies,
    AWStorage,
    AWCache,
    AWClearBrowserStoragement,
    AWIndexedDB,
    IlibJS
}