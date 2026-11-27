/**
 * @file JWTManager.mjs
 * @description Management of JWT key pairs and credentials.
 * @license The MIT License (MIT) - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]
 */
import { JWToken } from "./JWToken.mjs";

export default class JWTManager {
    /**
     * Creates a JWT manager bound to a configuration and an IndexedDB connection.
     * @param {Object} [options={}]
     * @param {Object} options.config - Configuration with issuer, sub, proxy.endpoint and storage.store/storage.key.
     * @param {Object} options.database - Connection with read and update methods.
     * @throws {TypeError} If the configuration or the database connection is invalid.
     */
    constructor({ config, database } = {}) {
        if (!config || typeof config !== "object") {
            throw new TypeError("Configuração JWT não informada.");
        }

        if (!config.issuer || typeof config.issuer !== "string") {
            throw new TypeError("Issuer JWT inválido.");
        }

        if (!config.sub || typeof config.sub !== "string") {
            throw new TypeError("Subject JWT inválido.");
        }

        if (!config.proxy?.endpoint || typeof config.proxy.endpoint !== "string") {
            throw new TypeError("Endpoint do JWT Proxy inválido.");
        }

        if (
            !config.storage?.store ||
            !config.storage?.key
        ) {
            throw new TypeError("Configuração de armazenamento JWT inválida.");
        }

        if (
            !database ||
            typeof database.read !== "function" ||
            typeof database.update !== "function"
        ) {
            throw new TypeError("Conexão com IndexedDB inválida.");
        }

        this.config = config;
        this.database = database;

        this.store = config.storage.store;
        this.storageKey = config.storage.key;

        this.jwt = new JWToken({
            issuer: config.issuer
        });

        this.credentials = [];
        this.initialized = false;
        this._initializing = null;

        this._autoRefreshInterval = null;
        this._autoRefreshRunning = false;
        this._autoRefreshOAuthBlocked = false;
        this._autoRefreshBlockedAccessToken = null;
        this._refreshInFlight = new Map();
        this.autoRefreshIntervalMs = 5 * 60 * 1000;
    }


    /**
     * Normalizes a credential identifier to the external format "K_<32 hex chars>".
     * @private
     * @param {string} kid - Credential identifier, with or without the "K_" prefix.
     * @return {string} The normalized identifier.
     * @throws {TypeError} If kid is empty.
     * @throws {Error} If the format is invalid.
     */
    _normalizeKid(kid) {
        if (typeof kid !== "string" || !kid.trim()) {
            throw new TypeError("Identificador da credencial inválido.");
        }

        const normalized = kid.startsWith("K_")
            ? kid
            : `K_${kid}`;

        if (!/^K_[a-f0-9]{32}$/i.test(normalized)) {
            throw new Error("Formato de KID inválido.");
        }

        return normalized;
    }

    /**
     * Returns the identifier used for storage: the normalized KID without the "K_" prefix.
     * @private
     * @param {string} kid
     * @return {string}
     */
    _getStoredKid(kid) {
        return this._normalizeKid(kid).slice(2);
    }

    /**
     * Generates a random key identifier with 32 hexadecimal characters.
     * @private
     * @return {string}
     */
    _generateKeyId() {
        const bytes = crypto.getRandomValues(new Uint8Array(16));

        return Array.from(bytes, byte =>
            byte.toString(16).padStart(2, "0")
        ).join("");
    }


    /**
     * Validates and trims the name and description of a credential.
     * @private
     * @param {Object} [metadata={}]
     * @param {string} metadata.name
     * @param {string} metadata.description
     * @return {{name: string, description: string}}
     * @throws {TypeError} If name or description is empty.
     */
    _normalizeMetadata({ name, description } = {}) {
        name = typeof name === "string"
            ? name.trim()
            : "";

        description = typeof description === "string"
            ? description.trim()
            : "";

        if (!name || !description) {
            throw new TypeError(
                "Nome e descrição são obrigatórios."
            );
        }

        return {
            name,
            description
        };
    }


    /**
     * Converts a Base64URL value into a PEM block for a public or private key.
     * @private
     * @param {string} value - Base64URL-encoded key data.
     * @param {string} type - "private" for a private key; any other value generates a public key block.
     * @return {string} PEM-formatted key.
     */
    _toPEM(value, type) {
        const label = type === "private"
            ? "PRIVATE KEY"
            : "PUBLIC KEY";

        const base64 = value
            .replace(/-/g, "+")
            .replace(/_/g, "/")
            .padEnd(
                Math.ceil(value.length / 4) * 4,
                "="
            );

        const lines = base64.match(/.{1,64}/g) || [];

        return [
            `-----BEGIN ${label}-----`,
            ...lines,
            `-----END ${label}-----`
        ].join("\n");
    }


    /**
     * Loads the stored credentials and starts the automatic renewal check.
     * @return {Promise<JWTManager>} The initialized instance.
     * @description Calling this method again returns the same pending initialization. The renewal check runs immediately and then at each interval set by autoRefreshIntervalMs.
     */
    async initialize() {
        if (this.initialized) {
            return this;
        }

        if (this._initializing) {
            return this._initializing;
        }

        this._initializing = this._loadCredentials();

        try {
            await this._initializing;
            this.initialized = true;

            await this._runAutoRefreshCheck();

            this._startAutoRefresh();

            return this;
        } finally {
            this._initializing = null;
        }
    }

    /**
     * Reads the stored credentials from IndexedDB and keeps them in memory.
     * @private
     * @return {Promise<void>}
     * @description Accepts a single credential object or an array; invalid values are ignored.
     */
    async _loadCredentials() {
        const stored = await this.database.read({
            tbn: this.store,
            tbk: this.storageKey
        });

        if (stored === undefined || stored === null || stored === false) {
            this.credentials = [];
            return;
        }

        let credentials = stored;

        if (
            !Array.isArray(credentials) &&
            credentials &&
            typeof credentials === "object"
        ) {
            credentials = credentials.kid
                ? [credentials]
                : [];
        }

        if (!Array.isArray(credentials)) {
            throw new TypeError(
                "Registro de credenciais inválido."
            );
        }

        const loaded = [];

        for (const credential of credentials) {
            if (
                !credential ||
                typeof credential !== "object" ||
                typeof credential.kid !== "string" ||
                !credential.keyPair
            ) {
                throw new Error("Registro de credencial inválido.");
            }

            const publicKey = credential.keyPair.publicKey;
            const privateKey = credential.keyPair.privateKey;

            if (
                publicKey?.format !== "spki" ||
                typeof publicKey.value !== "string" ||
                privateKey?.format !== "pkcs8" ||
                typeof privateKey.value !== "string"
            ) {
                throw new Error(
                    `Par de chaves inválido para "${credential.kid}".`
                );
            }

            const storedKid = this._getStoredKid(credential.kid);

            await this.jwt.importKey({
                keyId: storedKid,
                type: "public",
                keyData: publicKey.value,
                format: "spki"
            });

            await this.jwt.importKey({
                keyId: storedKid,
                type: "private",
                keyData: privateKey.value,
                format: "pkcs8"
            });

            loaded.push({
                ...credential,
                tokens: Array.isArray(credential.tokens)
                    ? credential.tokens
                    : [],
                metadata: credential.metadata &&
                    typeof credential.metadata === "object"
                    ? credential.metadata
                    : {}
            });
        }

        this.credentials = loaded;
    }


    /**
     * Returns how long before expiry a token should be renewed, based on its duration.
     * @private
     * @param {string} expiresIn - Token duration: "8h", "6m" or "1y".
     * @return {number|null} Margin in milliseconds, or null when the token must not be renewed automatically.
     */
    _getAutoRefreshMarginMs(expiresIn) {
        switch (expiresIn) {
            case "8h":
                return 60 * 60 * 1000;

            case "6m":
            case "1y":
                return 24 * 60 * 60 * 1000;

            default:
                return null;
        }
    }

    _isTokenInsideRefreshWindow(token, now = Date.now()) {
        if (
            !token ||
            !token.token ||
            typeof token.jti !== "string" ||
            !token.jti ||
            typeof token.expiresAt !== "number" ||
            !Number.isFinite(token.expiresAt)
        ) {
            return false;
        }

        const margin = this._getAutoRefreshMarginMs(token.expiresIn);

        if (margin === null) {
            return false;
        }

        const expiresAtMs = token.expiresAt * 1000;

        return expiresAtMs - now <= margin;
    }

    /**
     * Starts the interval that checks tokens for automatic renewal.
     * @private
     * @return {void}
     * @description Does nothing if the interval is already running.
     */
    _startAutoRefresh() {
        if (this._autoRefreshInterval !== null) {
            return;
        }

        this._autoRefreshInterval = setInterval(() => {
            this._runAutoRefreshCheck().catch(error => {
                console.error(
                    "[JWTManager] Falha na verificação automática:",
                    error
                );
            });
        }, this.autoRefreshIntervalMs);
    }

    /**
     * Checks every stored token and renews those inside the refresh window.
     * @private
     * @return {Promise<boolean>} false if the check was skipped or could not run.
     * @description Reloads the credentials first, so changes made in other tabs are used. Renewal uses a per-token lock. After an OAuth failure, renewal waits until the GitHub access token changes.
     */
    async _runAutoRefreshCheck() {
        if (!this.initialized || this._autoRefreshRunning) {
            return false;
        }

        this._autoRefreshRunning = true;

        try {
            await this._loadCredentials();

            if (this._autoRefreshOAuthBlocked) {
                let currentAccessToken;

                try {
                    currentAccessToken = await this._getGitHubAccessToken();
                } catch {
                    return false;
                }

                if (
                    currentAccessToken ===
                    this._autoRefreshBlockedAccessToken
                ) {
                    return false;
                }

                this._autoRefreshOAuthBlocked = false;
                this._autoRefreshBlockedAccessToken = null;
            }

            for (const credential of [...this.credentials]) {
                for (const token of [...credential.tokens]) {
                    if (!this._isTokenInsideRefreshWindow(token)) {
                        continue;
                    }

                    const externalKid = this._normalizeKid(credential.kid);
                    const lockName = [
                        "jwt-auto-refresh",
                        externalKid,
                        token.jti
                    ].join(":");

                    const renewToken = async () => {
                        await this._loadCredentials();

                        const latestCredential = this.credentials.find(
                            item => item.kid === credential.kid
                        );

                        if (!latestCredential) {
                            return;
                        }

                        const latestToken = latestCredential.tokens.find(
                            item => item.jti === token.jti
                        );

                        if (
                            !latestToken ||
                            !this._isTokenInsideRefreshWindow(latestToken)
                        ) {
                            return;
                        }

                        try {
                            await this.refresh({
                                kid: externalKid,
                                jti: latestToken.jti
                            });
                        } catch (error) {
                            if (
                                error?.code === "OAUTH_EXPIRED" ||
                                error?.name === "OAUTH_EXPIRED"
                            ) {
                                this._autoRefreshOAuthBlocked = true;

                                try {
                                    this._autoRefreshBlockedAccessToken =
                                        await this._getGitHubAccessToken();
                                } catch {
                                    this._autoRefreshBlockedAccessToken = null;
                                }

                                console.warn(
                                    "[JWTManager] Renovação automática pausada: " +
                                    "é necessário revalidar a sessão OAuth do GitHub."
                                );

                                return "OAUTH_EXPIRED";
                            }

                            console.warn(
                                "[JWTManager] Não foi possível renovar o JWT:",
                                error
                            );

                            return "RETRY";
                        }

                        return "RENEWED";
                    };

                    let result;

                    try {
                        if (
                            typeof navigator !== "undefined" &&
                            navigator.locks &&
                            typeof navigator.locks.request === "function"
                        ) {
                            await navigator.locks.request(
                                lockName,
                                { ifAvailable: true },
                                async lock => {
                                    if (lock) {
                                        result = await renewToken();
                                    }
                                }
                            );
                        } else {
                            result = await renewToken();
                        }
                    } catch (error) {
                        console.warn(
                            "[JWTManager] Falha ao controlar a renovação:",
                            error
                        );
                    }

                    if (
                        result === "OAUTH_EXPIRED" ||
                        this._autoRefreshOAuthBlocked
                    ) {
                        return false;
                    }
                }
            }

            return true;
        } catch (error) {
            console.error(
                "[JWTManager] Não foi possível verificar os JWTs:",
                error
            );

            return false;
        } finally {
            this._autoRefreshRunning = false;
        }
    }


    /**
     * Persists the credentials to IndexedDB.
     * @private
     * @param {Object[]} credentials - Credentials to save.
     * @return {Promise<void>}
     */
    async _saveCredentials(credentials) {
        await this.database.update([
            {
                tbn: this.store,
                tbk: this.storageKey,
                tbv: [credentials]
            }
        ]);
    }


    /**
     * Returns copies of the stored credentials, including their key pairs and tokens.
     * @return {Object[]} Copies, so changes to the result do not affect the internal state.
     */
    getCredentials() {
        return this.credentials.map(credential => ({
            ...credential,

            keyPair: {
                ...credential.keyPair,
                publicKey: { ...credential.keyPair.publicKey },
                privateKey: { ...credential.keyPair.privateKey }
            },

            tokens: credential.tokens.map(token => ({
                ...token
            })),

            metadata: { ...credential.metadata }
        }));
    }


    async createCredential({
        name,
        description
    } = {}) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de criar credenciais."
            );
        }

        const metadata = this._normalizeMetadata({
            name,
            description
        });

        const kid = this._generateKeyId();

        if (this.credentials.some(item => item.kid === kid)) {
            throw new Error(`O identificador "${kid}" já existe.`);
        }

        const pair = await this.jwt.generateKeys({
            keyId: kid,
            extractable: true
        });

        try {
            const publicKey = await this.jwt.exportKey({
                key: pair.publicKey,
                format: "spki"
            });

            const privateKey = await this.jwt.exportKey({
                key: pair.privateKey,
                format: "pkcs8"
            });

            const credential = {
                kid,

                keyPair: {
                    publicKey: {
                        format: "spki",
                        value: publicKey
                    },
                    privateKey: {
                        format: "pkcs8",
                        value: privateKey
                    }
                },

                tokens: [],

                metadata: {
                    ...metadata,
                    issuer: this.config.issuer,
                    algorithm: "EdDSA",
                    createdAt: new Date().toISOString()
                }
            };

            const updated = [
                ...this.credentials,
                credential
            ];

            await this._saveCredentials(updated);

            this.credentials = updated;

            return this.getCredentials().find(
                item => item.kid === kid
            );

        } catch (error) {
            this.jwt.keys.delete(kid);
            throw error;
        }
    }


    /**
     * Reads the GitHub access token from the stored OAuth session.
     * @private
     * @return {Promise<string>} The access token.
     * @throws {Error} With code OAUTH_EXPIRED if there is no session.
     */
    async _getGitHubAccessToken() {
        const auth = await this.database.read({
            tbn: "github",
            tbk: "user-github"
        });

        const accessToken = auth?.tokens?.access_token;

        if (
            typeof accessToken !== "string" ||
            !accessToken
        ) {
            throw JWToken.createError(
                "OAUTH_EXPIRED",
                "Sessão OAuth do GitHub não encontrada."
            );
        }

        return accessToken;
    }


    async createToken({
        kid,
        aud,
        expiresIn = "8h",
        name,
        description
    } = {}) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de criar tokens."
            );
        }

        const metadata = this._normalizeMetadata({
            name,
            description
        });

        if (
            typeof aud !== "string" ||
            !aud.trim()
        ) {
            throw new TypeError("Audience JWT inválida.");
        }

        if (!["8h", "6m", "1y"].includes(expiresIn)) {
            throw new TypeError("Duração JWT inválida.");
        }

        const externalKid = this._normalizeKid(kid);
        const storedKid = this._getStoredKid(externalKid);

        const credential = this.credentials.find(
            item => item.kid === storedKid
        );

        if (!credential) {
            throw new Error(
                `Credencial "${externalKid}" não encontrada.`
            );
        }

        const accessToken = await this._getGitHubAccessToken();

        let response;

        try {
            response = await fetch(
                `${this.config.proxy.endpoint.replace(/\/+$/, "")}/jwt/create`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-GitHub-Access-Token": accessToken
                    },
                    body: JSON.stringify({
                        kid: storedKid,
                        aud,
                        expiresIn
                    }),
                    cache: "no-store"
                }
            );
        } catch {
            throw JWToken.createError(
                "NETWORK_ERROR",
                "Falha de comunicação com o Cloudflare Worker."
            );
        }

        let data;

        try {
            data = await response.json();
        } catch {
            data = {};
        }

        if (!response.ok) {
            throw JWToken.createError(
                data.code || "SERVER_ERROR",
                data.error || data.detail ||
                    "O Worker não conseguiu criar o JWT."
            );
        }

        if (
            typeof data.token !== "string" ||
            !data.token
        ) {
            throw JWToken.createError(
                "SERVER_ERROR",
                "Resposta do Worker sem JWT."
            );
        }

        let decoded;

        try {
            await this.jwt.verify({
                token: data.token,
                issuer: this.config.issuer,
                audience: aud,
                clockSkewSeconds: 60
            });

            decoded = this.jwt.decode(data.token);

            if (
                decoded.header.kid !== storedKid ||
                decoded.payload.sub !== this.config.sub ||
                decoded.payload.aud !== aud ||
                typeof decoded.payload.jti !== "string" ||
                !decoded.payload.jti
            ) {
                throw new Error(
                    "KID, Subject, Audience ou JTI inválido."
                );
            }

        } catch (error) {
            throw JWToken.createError(
                "INVALID_TOKEN",
                `JWT recebido não passou na validação: ${error.message}`
            );
        }

        const tokenRecord = {
            token: data.token,
            kid: storedKid,
            jti: decoded.payload.jti,

            name: metadata.name,
            description: metadata.description,

            aud,
            expiresIn,
            issuedAt: decoded.payload.iat,
            expiresAt: decoded.payload.exp,
            createdAt: new Date().toISOString()
        };

        const updatedCredential = {
            ...credential,
            tokens: [
                ...credential.tokens,
                tokenRecord
            ]
        };

        const updatedCredentials = this.credentials.map(item =>
            item.kid === storedKid
                ? updatedCredential
                : item
        );

        await this._saveCredentials(updatedCredentials);

        this.credentials = updatedCredentials;

        return { ...tokenRecord };
    }


    /**
     * Renews a JWT by its KID and JTI.
     * @param {Object} options
     * @param {string} options.kid - Credential identifier.
     * @param {string} options.jti - Unique identifier of the token to renew.
     * @return {Promise<Object>} Result of the renewal.
     * @throws {Error} If the manager is not initialized.
     * @throws {TypeError} If the KID or JTI is invalid.
     * @description Concurrent calls for the same token share a single operation.
     */
    async refresh({ kid, jti } = {}) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de renovar tokens."
            );
        }

        const externalKid = this._normalizeKid(kid);
        const storedKid = this._getStoredKid(externalKid);

        if (
            typeof jti !== "string" ||
            !jti
        ) {
            throw new TypeError("JTI inválido.");
        }

        const refreshKey = `${storedKid}:${jti}`;

        if (this._refreshInFlight.has(refreshKey)) {
            return this._refreshInFlight.get(refreshKey);
        }

        const operation = this._refreshToken({
            kid: externalKid,
            jti
        });

        this._refreshInFlight.set(refreshKey, operation);

        try {
            return await operation;
        } finally {
            if (this._refreshInFlight.get(refreshKey) === operation) {
                this._refreshInFlight.delete(refreshKey);
            }
        }
    }

    /**
     * Performs the renewal request through the JWT proxy and stores the new token.
     * @private
     * @param {Object} options
     * @param {string} options.kid
     * @param {string} options.jti
     * @return {Promise<Object>} Result of the renewal.
     * @throws {Error} If the credential or token is not found.
     */
    async _refreshToken({ kid, jti } = {}) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de renovar tokens."
            );
        }

        const externalKid = this._normalizeKid(kid);
        const storedKid = this._getStoredKid(externalKid);

        const credential = this.credentials.find(
            item => item.kid === storedKid
        );

        if (!credential) {
            throw new Error(
                `Credencial "${externalKid}" não encontrada.`
            );
        }

        if (
            typeof jti !== "string" ||
            !jti
        ) {
            throw new TypeError("JTI inválido.");
        }

        const tokenIndex = credential.tokens.findIndex(
            item => item.jti === jti
        );

        if (tokenIndex === -1) {
            throw new Error(
                `JWT com JTI "${jti}" não encontrado.`
            );
        }

        const currentRecord = credential.tokens[tokenIndex];

        if (!currentRecord.token) {
            throw new Error("JWT original não encontrado.");
        }

        const accessToken = await this._getGitHubAccessToken();

        const publicPEM = this._toPEM(
            credential.keyPair.publicKey.value,
            "public"
        );

        const newToken = await this.jwt.refresh({
            url: `${this.config.proxy.endpoint.replace(/\/+$/, "")}/jwt/refresh`,
            token: currentRecord.token,
            fetchOptions: {
                headers: {
                    "Content-Type": "application/json",
                    "X-GitHub-Access-Token": accessToken,
                    "X-JWT-Public-Key": publicPEM
                },
                body: JSON.stringify({})
            }
        });

        const decoded = this.jwt.decode(newToken);

        if (
            decoded.header.kid !== storedKid ||
            decoded.payload.sub !== this.config.sub ||
            decoded.payload.aud !== currentRecord.aud ||
            typeof decoded.payload.jti !== "string" ||
            !decoded.payload.jti ||
            decoded.payload.jti === jti
        ) {
            throw JWToken.createError(
                "INVALID_TOKEN",
                "O JWT renovado não corresponde à credencial ou não recebeu um novo JTI."
            );
        }

        const updatedRecord = {
            ...currentRecord,
            token: newToken,
            jti: decoded.payload.jti,
            issuedAt: decoded.payload.iat,
            expiresAt: decoded.payload.exp,
            createdAt: new Date().toISOString()
        };

        const updatedTokens = [...credential.tokens];
        updatedTokens[tokenIndex] = updatedRecord;

        const updatedCredential = {
            ...credential,
            tokens: updatedTokens
        };

        const updatedCredentials = this.credentials.map(item =>
            item.kid === storedKid
                ? updatedCredential
                : item
        );

        await this._saveCredentials(updatedCredentials);

        this.credentials = updatedCredentials;

        return { ...updatedRecord };
    }


    async updateCredentialMetadata({
        kid,
        name,
        description
    } = {}) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado."
            );
        }

        const externalKid = this._normalizeKid(kid);
        const storedKid = this._getStoredKid(externalKid);

        const metadata = this._normalizeMetadata({
            name,
            description
        });

        const credential = this.credentials.find(
            item => item.kid === storedKid
        );

        if (!credential) {
            throw new Error(
                `Credencial "${externalKid}" não encontrada.`
            );
        }

        const updatedCredential = {
            ...credential,
            metadata: {
                ...credential.metadata,
                ...metadata
            }
        };

        const updatedCredentials = this.credentials.map(item =>
            item.kid === storedKid
                ? updatedCredential
                : item
        );

        await this._saveCredentials(updatedCredentials);

        this.credentials = updatedCredentials;

        return this.getCredentials().find(
            item => item.kid === storedKid
        );
    }


    async updateTokenMetadata({
        kid,
        jti,
        name,
        description
    } = {}) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado."
            );
        }

        const externalKid = this._normalizeKid(kid);
        const storedKid = this._getStoredKid(externalKid);

        const metadata = this._normalizeMetadata({
            name,
            description
        });

        if (
            typeof jti !== "string" ||
            !jti
        ) {
            throw new TypeError("JTI inválido.");
        }

        const credential = this.credentials.find(
            item => item.kid === storedKid
        );

        if (!credential) {
            throw new Error(
                `Credencial "${externalKid}" não encontrada.`
            );
        }

        const tokenIndex = credential.tokens.findIndex(
            item => item.jti === jti
        );

        if (tokenIndex === -1) {
            throw new Error(
                `JWT com JTI "${jti}" não encontrado.`
            );
        }

        const updatedTokens = [...credential.tokens];

        updatedTokens[tokenIndex] = {
            ...updatedTokens[tokenIndex],
            ...metadata
        };

        const updatedCredential = {
            ...credential,
            tokens: updatedTokens
        };

        const updatedCredentials = this.credentials.map(item =>
            item.kid === storedKid
                ? updatedCredential
                : item
        );

        await this._saveCredentials(updatedCredentials);

        this.credentials = updatedCredentials;

        return {
            ...updatedTokens[tokenIndex]
        };
    }


    /**
     * Deletes a single JWT from a credential.
     * @param {Object} options
     * @param {string} options.kid - Credential identifier.
     * @param {string} options.jti - Identifier of the token to delete.
     * @return {Promise<void>}
     * @throws {Error} If the manager is not initialized.
     */
    async deleteToken({ kid, jti } = {}) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de excluir tokens."
            );
        }

        const externalKid = this._normalizeKid(kid);
        const storedKid = this._getStoredKid(externalKid);

        if (
            typeof jti !== "string" ||
            !jti
        ) {
            throw new TypeError("JTI inválido.");
        }

        const credential = this.credentials.find(
            item => item.kid === storedKid
        );

        if (!credential) {
            throw new Error(
                `Credencial "${externalKid}" não encontrada.`
            );
        }

        const tokenExists = credential.tokens.some(
            item => item.jti === jti
        );

        if (!tokenExists) {
            throw new Error(
                `JWT com JTI "${jti}" não encontrado.`
            );
        }

        const updatedCredential = {
            ...credential,
            tokens: credential.tokens.filter(
                item => item.jti !== jti
            )
        };

        const updatedCredentials = this.credentials.map(item =>
            item.kid === storedKid
                ? updatedCredential
                : item
        );

        await this._saveCredentials(updatedCredentials);

        this.credentials = updatedCredentials;

        return true;
    }


    /**
     * Deletes a credential and all of its tokens.
     * @param {string} kid - Credential identifier.
     * @return {Promise<void>}
     * @throws {Error} If the manager is not initialized or the credential does not exist.
     */
    async deleteCredential(kid) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de excluir credenciais."
            );
        }

        const storedKid = this._getStoredKid(kid);
        const externalKid = this._normalizeKid(kid);

        const exists = this.credentials.some(
            item => item.kid === storedKid
        );

        if (!exists) {
            throw new Error(
                `Credencial "${externalKid}" não encontrada.`
            );
        }

        const updated = this.credentials.filter(
            item => item.kid !== storedKid
        );

        await this._saveCredentials(updated);

        this.credentials = updated;

        this.jwt.keys.delete(storedKid);

        return true;
    }


    /**
     * Normalizes and validates a credential object for import.
     * @private
     * @param {Object} raw - Candidate credential record.
     * @return {Object} Normalized credential object ready for key import and persistence.
     * @throws {Error|TypeError} If the credential structure or key pair is invalid.
     */
    _normalizeImportedCredential(raw) {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
            throw new TypeError("Registro de credencial inválido.");
        }

        const storedKid = this._getStoredKid(raw.kid);
        const externalKid = this._normalizeKid(storedKid);

        const publicKey = raw.keyPair?.publicKey;
        const privateKey = raw.keyPair?.privateKey;

        if (
            publicKey?.format !== "spki" ||
            typeof publicKey.value !== "string" ||
            !publicKey.value.trim() ||
            privateKey?.format !== "pkcs8" ||
            typeof privateKey.value !== "string" ||
            !privateKey.value.trim()
        ) {
            throw new Error(
                `Par de chaves inválido para "${externalKid}".`
            );
        }

        const rawMeta =
            raw.metadata && typeof raw.metadata === "object" && !Array.isArray(raw.metadata)
                ? raw.metadata
                : {};

        const metadata = {
            ...rawMeta,
            name:
                typeof rawMeta.name === "string" && rawMeta.name.trim()
                    ? rawMeta.name.trim()
                    : `Credencial ${externalKid}`,
            description:
                typeof rawMeta.description === "string" && rawMeta.description.trim()
                    ? rawMeta.description.trim()
                    : "Credencial importada.",
            issuer:
                typeof rawMeta.issuer === "string" && rawMeta.issuer.trim()
                    ? rawMeta.issuer.trim()
                    : this.config.issuer,
            algorithm:
                typeof rawMeta.algorithm === "string" && rawMeta.algorithm.trim()
                    ? rawMeta.algorithm.trim()
                    : "EdDSA",
            createdAt:
                typeof rawMeta.createdAt === "string" && rawMeta.createdAt.trim()
                    ? rawMeta.createdAt.trim()
                    : new Date().toISOString()
        };

        const tokens = Array.isArray(raw.tokens)
            ? raw.tokens
                  .filter(
                      token =>
                          token &&
                          typeof token === "object" &&
                          !Array.isArray(token) &&
                          typeof token.token === "string" &&
                          token.token.trim()
                  )
                  .map(token => ({ ...token }))
            : [];

        return {
            kid: storedKid,
            keyPair: {
                publicKey: {
                    format: "spki",
                    value: publicKey.value.trim()
                },
                privateKey: {
                    format: "pkcs8",
                    value: privateKey.value.trim()
                }
            },
            tokens,
            metadata
        };
    }


    /**
     * Exports one credential (with key pair, metadata and derived tokens) as a plain object.
     * @param {string} kid - Credential identifier.
     * @return {Object} Full credential export object.
     * @throws {Error} If the manager is not initialized or the credential does not exist.
     */
    exportCredential(kid) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de exportar credenciais."
            );
        }

        const storedKid = this._getStoredKid(kid);
        const externalKid = this._normalizeKid(kid);

        const credential = this.getCredentials().find(
            item => item.kid === storedKid
        );

        if (!credential) {
            throw new Error(
                `Credencial "${externalKid}" não encontrada.`
            );
        }

        return credential;
    }


    /**
     * Exports all stored credentials (key pairs, metadata and derived tokens) as a JSON bundle.
     * @return {Object} Full credentials export bundle.
     * @throws {Error} If the manager is not initialized.
     */
    exportCredentials() {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de exportar credenciais."
            );
        }

        return {
            format: "subversivo58-credentials",
            version: 1,
            exportedAt: new Date().toISOString(),
            credentials: this.getCredentials()
        };
    }


    /**
     * Imports one credential or a bundle of credentials, overwriting existing entries with the same KID.
     * @param {string|Object|Object[]} input - JSON string, export bundle, single credential object or credential array.
     * @return {Promise<{imported: number, created: number, overwritten: number, total: number}>} Import summary.
     * @throws {Error|TypeError} If the manager is not initialized, JSON is invalid or any key pair fails validation.
     */
    async importCredentials(input) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de importar credenciais."
            );
        }

        let parsed = input;

        if (typeof parsed === "string") {
            try {
                parsed = JSON.parse(parsed);
            } catch {
                throw new TypeError("Arquivo JSON inválido.");
            }
        }

        let rawList = null;

        if (Array.isArray(parsed)) {
            rawList = parsed;
        } else if (parsed && typeof parsed === "object") {
            if (Array.isArray(parsed.credentials)) {
                rawList = parsed.credentials;
            } else if (typeof parsed.kid === "string") {
                rawList = [parsed];
            }
        }

        if (!Array.isArray(rawList) || rawList.length === 0) {
            throw new TypeError(
                "Nenhuma credencial válida encontrada no arquivo."
            );
        }

        const deduped = new Map();

        for (const entry of rawList) {
            const normalized = this._normalizeImportedCredential(entry);
            deduped.set(normalized.kid, normalized);
        }

        const candidates = Array.from(deduped.values());
        const importedKids = new Set(candidates.map(item => item.kid));

        const previousKeys = new Map();
        for (const kid of importedKids) {
            if (this.jwt.keys.has(kid)) {
                previousKeys.set(kid, this.jwt.keys.get(kid));
            }
        }

        try {
            for (const candidate of candidates) {
                await this.jwt.importKey({
                    keyId: candidate.kid,
                    type: "public",
                    keyData: candidate.keyPair.publicKey.value,
                    format: "spki"
                });

                await this.jwt.importKey({
                    keyId: candidate.kid,
                    type: "private",
                    keyData: candidate.keyPair.privateKey.value,
                    format: "pkcs8"
                });
            }

            const existingMap = new Map(
                this.credentials.map(item => [item.kid, item])
            );

            let created = 0;
            let overwritten = 0;

            for (const candidate of candidates) {
                if (existingMap.has(candidate.kid)) {
                    overwritten += 1;
                } else {
                    created += 1;
                }
                existingMap.set(candidate.kid, candidate);
            }

            const updated = Array.from(existingMap.values());

            await this._saveCredentials(updated);

            this.credentials = updated;

            return {
                imported: candidates.length,
                created,
                overwritten,
                total: updated.length
            };
        } catch (error) {
            for (const kid of importedKids) {
                if (previousKeys.has(kid)) {
                    this.jwt.keys.set(kid, previousKeys.get(kid));
                } else {
                    this.jwt.keys.delete(kid);
                }
            }
            throw error;
        }
    }
}