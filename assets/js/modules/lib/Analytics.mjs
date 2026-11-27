/**
 * @file Analytics.mjs
 * @description Privacy-preserving site analytics and technical error collector stored in IndexedDB.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */

const DEFAULT_STORE = "analytics";
const DEFAULT_KEY = "site-analytics";
const DEFAULT_MAX_PAGES = 50;
const DEFAULT_MAX_ERRORS = 50;
const MAX_ERROR_MESSAGE_LENGTH = 280;

/**
 * Generates an opaque anonymous userId handle using the Web Crypto API.
 * @return {Promise<string>} 64-character hexadecimal handle with no user-identifying data.
 */
async function generateCryptographicUserId() {
    const cryptoApi = globalThis.crypto;

    if (
        !cryptoApi ||
        typeof cryptoApi.getRandomValues !== "function" ||
        !cryptoApi.subtle ||
        typeof cryptoApi.subtle.digest !== "function"
    ) {
        throw new Error(
            "Web Crypto API indisponível para gerar identificador de analytics."
        );
    }

    const entropy = new Uint8Array(32);
    cryptoApi.getRandomValues(entropy);

    const digest = await cryptoApi.subtle.digest("SHA-256", entropy);

    return Array.from(new Uint8Array(digest), byte =>
        byte.toString(16).padStart(2, "0")
    ).join("");
}

/**
 * Detects browser name and version from User-Agent Client Hints or navigator.userAgent.
 * @return {string}
 */
function detectBrowser() {
    const nav = globalThis.navigator;
    const brands = nav?.userAgentData?.brands;

    if (Array.isArray(brands) && brands.length) {
        const preferred = brands.find(
            item =>
                typeof item?.brand === "string" &&
                !/^not/i.test(item.brand) &&
                !/^chromium$/i.test(item.brand)
        );
        const fallback = brands.find(
            item =>
                typeof item?.brand === "string" && !/^not/i.test(item.brand)
        );
        const match = preferred || fallback;
        if (match?.brand) {
            return match.version
                ? `${match.brand} ${match.version}`
                : match.brand;
        }
    }

    const ua = String(nav?.userAgent || "");
    const patterns = [
        ["Edge", /Edg(?:A|iOS)?\/([\d.]+)/i],
        ["Opera", /(?:OPR|Opera)\/([\d.]+)/i],
        ["Firefox", /(?:Firefox|FxiOS)\/([\d.]+)/i],
        ["Chrome", /(?:Chrome|CriOS)\/([\d.]+)/i],
        ["Safari", /Version\/([\d.]+).*Safari/i]
    ];

    for (const [name, regex] of patterns) {
        const match = ua.match(regex);
        if (match) {
            return match[1] ? `${name} ${match[1]}` : name;
        }
    }

    return "Unknown";
}

/**
 * Detects OS name and version via User-Agent Client Hints or navigator.userAgent fallback.
 * @return {Promise<string>}
 */
async function detectOSVersion() {
    const nav = globalThis.navigator;
    const uaData = nav?.userAgentData;

    if (uaData && typeof uaData.getHighEntropyValues === "function") {
        try {
            const values = await uaData.getHighEntropyValues([
                "platform",
                "platformVersion"
            ]);
            const platform = String(
                values?.platform || uaData.platform || ""
            ).trim();
            const version = String(values?.platformVersion || "").trim();

            if (platform) {
                return version ? `${platform} ${version}` : platform;
            }
        } catch {
            // Ignore high-entropy denial and fall back to userAgent parsing.
        }
    }

    const ua = String(nav?.userAgent || "");

    const androidMatch = ua.match(/Android\s+([\d.]+)/i);
    if (androidMatch) return `Android ${androidMatch[1]}`;

    const iosMatch = ua.match(/(?:iPhone|iPad|iPod).*?OS\s+([\d_]+)/i);
    if (iosMatch) return `iOS ${iosMatch[1].replace(/_/g, ".")}`;

    const winMatch = ua.match(/Windows NT\s+([\d.]+)/i);
    if (winMatch) return `Windows NT ${winMatch[1]}`;

    const macMatch = ua.match(/Mac OS X\s+([\d_]+)/i);
    if (macMatch) return `macOS ${macMatch[1].replace(/_/g, ".")}`;

    if (/Linux/i.test(ua)) return "Linux";

    return String(nav?.platform || "Unknown");
}

/**
 * Normalizes a page path for unique page tracking.
 * @param {string} [page]
 * @return {string}
 */
function normalizePagePath(page) {
    if (typeof page === "string" && page.trim()) {
        return page.trim();
    }
    return String(globalThis.location?.pathname || "/");
}

/**
 * Extracts a concise error message from an Error or unknown value.
 * @param {*} error
 * @return {string}
 */
function extractErrorMessage(error) {
    if (error instanceof Error) {
        return String(error.message || error.name || "Error")
            .trim()
            .slice(0, MAX_ERROR_MESSAGE_LENGTH);
    }

    if (error && typeof error === "object" && "message" in error) {
        return String(error.message || "Error")
            .trim()
            .slice(0, MAX_ERROR_MESSAGE_LENGTH);
    }

    return String(error || "Unknown error")
        .trim()
        .slice(0, MAX_ERROR_MESSAGE_LENGTH);
}

export default class Analytics {
    /**
     * @param {Object} options
     * @param {Object} options.database - Opened AwesomeIndexedDB connection (DBMethods).
     * @param {boolean} [options.enable=false] - Initial consent state.
     * @param {string} [options.store="analytics"] - Object store name.
     * @param {string} [options.key="site-analytics"] - Record key inside the analytics store.
     * @param {number} [options.maxPages=50] - Maximum distinct pages kept per sync cycle.
     * @param {number} [options.maxErrors=50] - Maximum technical errors kept per sync cycle.
     * @param {Function} [options.getLanguage] - Callback returning the active language (e.g. PolicyHandler.language).
     */
    constructor({
        database = null,
        enable = false,
        store = DEFAULT_STORE,
        key = DEFAULT_KEY,
        maxPages = DEFAULT_MAX_PAGES,
        maxErrors = DEFAULT_MAX_ERRORS,
        getLanguage = null
    } = {}) {
        if (
            !database ||
            typeof database.read !== "function" ||
            typeof database.create !== "function" ||
            typeof database.update !== "function" ||
            typeof database.delete !== "function"
        ) {
            throw new TypeError("Conexão com IndexedDB inválida para Analytics.");
        }

        this.database = database;
        this.enable = Boolean(enable);
        this.store = typeof store === "string" && store.trim() ? store.trim() : DEFAULT_STORE;
        this.key = typeof key === "string" && key.trim() ? key.trim() : DEFAULT_KEY;
        this.maxPages = Number.isInteger(maxPages) && maxPages > 0 ? maxPages : DEFAULT_MAX_PAGES;
        this.maxErrors = Number.isInteger(maxErrors) && maxErrors > 0 ? maxErrors : DEFAULT_MAX_ERRORS;
        this._getLanguage =
            typeof getLanguage === "function"
                ? getLanguage
                : () => String(globalThis.document?.documentElement?.lang || "en-US");

        this._queue = Promise.resolve();
    }

    /**
     * Serializes async database operations so concurrent writes do not overwrite each other.
     * @private
     * @param {Function} task
     * @return {Promise<*>}
     */
    _enqueue(task) {
        const next = this._queue.then(() => task());
        this._queue = next.catch(() => {});
        return next;
    }

    /**
     * Collects current environment metadata for the user block.
     * @private
     * @return {Promise<{userAgent: string, browser: string, osVersion: string, language: string}>}
     */
    async _collectUserEnvironment() {
        const [osVersion] = await Promise.all([detectOSVersion()]);
        const language = String(this._getLanguage() || "en-US");

        return {
            userAgent: String(globalThis.navigator?.userAgent || ""),
            browser: detectBrowser(),
            osVersion,
            language
        };
    }

    /**
     * Ensures the analytics record exists in IndexedDB and optionally appends the current page.
     * @private
     * @param {string|null} [pageToTrack]
     * @return {Promise<Object|null>}
     */
    async _ensureAndSaveRecord(pageToTrack = null) {
        if (!this.enable) return null;

        const existing = await this.database.read({
            tbn: this.store,
            tbk: this.key
        });

        const env = await this._collectUserEnvironment();
        let record;
        let changed = false;

        if (
            existing &&
            typeof existing === "object" &&
            !Array.isArray(existing) &&
            typeof existing.userId === "string" &&
            existing.userId
        ) {
            const pages = Array.isArray(existing.user?.pages)
                ? existing.user.pages.filter(item => typeof item === "string" && item)
                : [];
            const system = Array.isArray(existing.system)
                ? existing.system.slice(0, this.maxErrors)
                : [];

            record = {
                userId: existing.userId,
                user: {
                    ...env,
                    pages
                },
                system
            };

            if (
                existing.user?.userAgent !== env.userAgent ||
                existing.user?.browser !== env.browser ||
                existing.user?.osVersion !== env.osVersion ||
                existing.user?.language !== env.language
            ) {
                changed = true;
            }
        } else {
            const userId = await generateCryptographicUserId();
            record = {
                userId,
                user: {
                    ...env,
                    pages: []
                },
                system: []
            };
            changed = true;
        }

        if (pageToTrack) {
            const normalizedPage = normalizePagePath(pageToTrack);
            if (
                normalizedPage &&
                !record.user.pages.includes(normalizedPage) &&
                record.user.pages.length < this.maxPages
            ) {
                record.user.pages.push(normalizedPage);
                changed = true;
            }
        }

        if (changed) {
            await this.database.create([
                {
                    tbn: this.store,
                    tbk: this.key,
                    tbv: record
                }
            ]);
        }

        return record;
    }

    /**
     * Updates the internal enable state. Initializes storage immediately when turned on.
     * @param {boolean} enabled
     * @return {Promise<boolean>}
     */
    async setEnabled(enabled) {
        this.enable = Boolean(enabled);

        if (this.enable) {
            await this.initialize();
        }

        return this.enable;
    }

    /**
     * Initializes the analytics record if enabled and registers the current page.
     * @param {string} [page]
     * @return {Promise<Object|null>}
     */
    initialize(page = null) {
        if (!this.enable) return Promise.resolve(null);

        const targetPage = normalizePagePath(page);
        return this._enqueue(() => this._ensureAndSaveRecord(targetPage));
    }

    /**
     * Adds a visited page to user.pages if enabled, not yet listed, and below the page cap.
     * @param {string} [page]
     * @return {Promise<Object|null>}
     */
    trackPage(page = null) {
        if (!this.enable) return Promise.resolve(null);

        const targetPage = normalizePagePath(page);
        return this._enqueue(() => this._ensureAndSaveRecord(targetPage));
    }

    /**
     * Records a technical error from a core site function into the system list.
     * @param {string} source - Core module or function identifier (e.g. "i18n", "templates", "runtime").
     * @param {*} error - Error instance or description.
     * @param {string} [page] - Page path where the error occurred.
     * @return {Promise<boolean>}
     */
    trackError(source, error, page = null) {
        if (!this.enable) return Promise.resolve(false);

        const normalizedSource =
            typeof source === "string" && source.trim()
                ? source.trim().slice(0, 80)
                : "system";
        const message = extractErrorMessage(error);
        const targetPage = normalizePagePath(page);

        return this._enqueue(async () => {
            if (!this.enable) return false;

            const record = await this._ensureAndSaveRecord(null);
            if (!record) return false;

            if (record.system.length >= this.maxErrors) {
                return false;
            }

            const alreadyRecorded = record.system.some(
                item =>
                    item?.source === normalizedSource &&
                    item?.message === message &&
                    item?.page === targetPage
            );

            if (alreadyRecorded) {
                return false;
            }

            record.system.push({
                source: normalizedSource,
                message,
                page: targetPage,
                timestamp: new Date().toISOString()
            });

            await this.database.create([
                {
                    tbn: this.store,
                    tbk: this.key,
                    tbv: record
                }
            ]);

            return true;
        });
    }
}
