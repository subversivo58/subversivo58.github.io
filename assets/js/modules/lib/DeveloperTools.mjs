/**
 * @file DeveloperTools.mjs
 * @description Browser environment inspection tools, including IndexedDB and storage inspection.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.2.0 [development stage]
 */
export default class DeveloperTools {

    constructor({
        database = null,
        databaseName = null,
        databaseVersion = null
    } = {}) {

        this.database = database;
        this.databaseName = databaseName;
        this.databaseVersion = databaseVersion;

    }

    // ==========================================
    // SERVICE WORKERS
    // ==========================================

    /**
     * List registered Service Workers.
     */
    async getServiceWorkers() {

        const registrations =
            await navigator.serviceWorker.getRegistrations();

        return {
            count: registrations.length,

            registrations: registrations.map(registration => ({

                scope: registration.scope,

                active: registration.active
                    ? {
                        scriptURL: registration.active.scriptURL,
                        state: registration.active.state
                    }
                    : null,

                waiting: registration.waiting
                    ? {
                        scriptURL: registration.waiting.scriptURL,
                        state: registration.waiting.state
                    }
                    : null,

                installing: registration.installing
                    ? {
                        scriptURL: registration.installing.scriptURL,
                        state: registration.installing.state
                    }
                    : null

            }))

        };

    }

    /**
     * Unregister one selected Service Worker.
     */
    async unregisterServiceWorker(scope) {

        if (typeof scope !== 'string' || !scope.trim()) {
            throw new TypeError('A valid Service Worker scope is required.');
        }

        const registrations =
            await navigator.serviceWorker.getRegistrations();

        const registration = registrations.find(
            item => item.scope === scope
        );

        if (!registration) {
            return {
                unregistered: false,
                scope
            };
        }

        const unregistered = await registration.unregister();

        return {
            unregistered,
            scope
        };

    }

    // ==========================================
    // INDEXEDDB
    // ==========================================

    /**
     * List available IndexedDB databases.
     */
    async getIndexedDB() {

        const databases = await indexedDB.databases();

        const objectStores = this.database
            ? Array.from(this.database.objects ?? [])
            : [];

        return {

            count: databases.length,

            databases: databases.map(database => {

                const isApplicationDatabase =
                    database.name === this.databaseName;

                return {

                    name: database.name,

                    version:
                        database.version ??
                        (isApplicationDatabase
                            ? this.databaseVersion
                            : null),

                    isApplicationDatabase,

                    objectStores: isApplicationDatabase
                        ? objectStores
                        : null

                };

            })

        };

    }

    /**
     * Delete one selected external IndexedDB database.
     */
    async deleteIndexedDB(name) {

        if (typeof name !== 'string' || !name.trim()) {
            throw new TypeError('A valid database name is required.');
        }

        if (name === this.databaseName) {
            throw new Error(
                'The application database cannot be deleted.'
            );
        }

        const databases = await indexedDB.databases();

        const exists = databases.some(
            database => database.name === name
        );

        if (!exists) {
            return {
                deleted: false,
                name
            };
        }

        return await new Promise((resolve, reject) => {

            const request = indexedDB.deleteDatabase(name);

            request.onsuccess = () => {

                resolve({
                    deleted: true,
                    name
                });

            };

            request.onerror = () => {

                reject(
                    request.error ||
                    new Error('IndexedDB deletion failed.')
                );

            };

            request.onblocked = () => {

                reject(
                    new Error(
                        `Deletion of database "${name}" is blocked.`
                    )
                );

            };

        });

    }

    // ==========================================
    // CACHE STORAGE
    // ==========================================

    /**
     * List caches and their stored request URLs.
     */
    async getCaches() {

        const names = await caches.keys();

        const cacheList = await Promise.all(
            names.map(async name => {

                const cache = await caches.open(name);
                const requests = await cache.keys();

                return {

                    name,

                    count: requests.length,

                    entries: requests.map(
                        request => request.url
                    )

                };

            })
        );

        return {
            count: cacheList.length,
            caches: cacheList
        };

    }

    /**
     * Delete one entire selected cache.
     */
    async deleteCache(name) {

        if (typeof name !== 'string' || !name.trim()) {
            throw new TypeError('A valid cache name is required.');
        }

        const deleted = await caches.delete(name);

        return {
            deleted,
            name
        };

    }

    // ==========================================
    // WEB STORAGE
    // ==========================================

    /**
     * List Local Storage and Session Storage contents.
     */
    getWebStorage() {

        /**
         * Lists the entries of a storage, each with its key and value.
         * @param {Storage} storage - localStorage or sessionStorage.
         * @return {{count: number, entries: Array<{key: string, value: string|null}>}}
         */
        const inspect = storage => {

            const entries = [];

            for (let index = 0; index < storage.length; index++) {

                const key = storage.key(index);

                entries.push({
                    key,
                    value: storage.getItem(key)
                });

            }

            return {
                count: entries.length,
                entries
            };

        };

        return {

            localStorage: inspect(localStorage),

            sessionStorage: inspect(sessionStorage)

        };

    }

    /**
     * Clear one selected Web Storage area.
     */
    clearStorage(type) {

        if (
            type !== 'localStorage' &&
            type !== 'sessionStorage'
        ) {
            throw new TypeError(
                'Storage type must be localStorage or sessionStorage.'
            );
        }

        const storage = type === 'localStorage'
            ? localStorage
            : sessionStorage;

        storage.clear();

        return {
            cleared: true,
            type
        };

    }

    // ==========================================
    // COOKIES
    // ==========================================

    /**
     * List cookies accessible through Cookie Store API.
     */
    async getCookies() {

        const cookies = await cookieStore.getAll();

        return {

            count: cookies.length,

            cookies: cookies.map(cookie => ({

                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path,
                expires: cookie.expires,
                secure: cookie.secure,
                sameSite: cookie.sameSite

            }))

        };

    }

    /**
     * Delete one selected cookie.
     */
    async deleteCookie({
        name,
        domain,
        path
    } = {}) {

        if (typeof name !== 'string' || !name.trim()) {
            throw new TypeError('A valid cookie name is required.');
        }

        const options = { name };

        if (domain) {
            options.domain = domain;
        }

        if (path) {
            options.path = path;
        }

        await cookieStore.delete(options);

        return {
            deleted: true,
            name,
            domain: domain ?? null,
            path: path ?? null
        };

    }

    // ==========================================
    // GENERAL REFRESH
    // ==========================================

    /**
     * Refresh all browser environment information.
     */
    async refresh() {

        const tasks = {

            serviceWorkers: () => this.getServiceWorkers(),

            indexedDB: () => this.getIndexedDB(),

            caches: () => this.getCaches(),

            webStorage: () => this.getWebStorage(),

            cookies: () => this.getCookies()

        };

        const names = Object.keys(tasks);

        const results = await Promise.allSettled(
            names.map(name =>
                Promise.resolve().then(() => tasks[name]())
            )
        );

        const data = {};
        const errors = {};

        results.forEach((result, index) => {

            const name = names[index];

            if (result.status === 'fulfilled') {

                data[name] = result.value;

            } else {

                errors[name] = {
                    message:
                        result.reason?.message ||
                        String(result.reason)
                };

            }

        });

        return {

            updatedAt: new Date().toISOString(),

            data,

            errors

        };

    }

}
