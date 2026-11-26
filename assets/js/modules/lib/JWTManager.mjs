/**
 * JWT Manager - Gerenciamento de pares de chaves e credenciais JWT
 * @license The MIT License (MIT) - https://github.com/subversivo58/subversivo58.github.io/blob/main/LICENSE
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - https://github.com/subversivo58
 * @version 0.1.0 [development stage]
 */

import { JWToken } from "./JWToken.mjs";

export default class JWTManager {
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

        // RENOVAÇÃO AUTOMÁTICA
        this._autoRefreshInterval = null;
        this._autoRefreshRunning = false;
        this._autoRefreshOAuthBlocked = false;
        this._autoRefreshBlockedAccessToken = null;
        this._refreshInFlight = new Map();
        this.autoRefreshIntervalMs = 5 * 60 * 1000;
    }

    // --------------------------------------------------
    // IDENTIFICAÇÃO
    // --------------------------------------------------

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

    _getStoredKid(kid) {
        return this._normalizeKid(kid).slice(2);
    }

    _generateKeyId() {
        const bytes = crypto.getRandomValues(new Uint8Array(16));

        return Array.from(bytes, byte =>
            byte.toString(16).padStart(2, "0")
        ).join("");
    }

    // --------------------------------------------------
    // VALIDAÇÃO DE METADADOS
    // --------------------------------------------------

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

    // --------------------------------------------------
    // CONVERSÃO PEM
    // --------------------------------------------------

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

    // --------------------------------------------------
    // INICIALIZAÇÃO
    // --------------------------------------------------

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

            // Verificação imediata antes de iniciar o monitoramento.
            await this._runAutoRefreshCheck();

            // O temporizador permanece ativo enquanto esta instância existir.
            this._startAutoRefresh();

            return this;
        } finally {
            this._initializing = null;
        }
    }

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

    // --------------------------------------------------
    // RENOVAÇÃO AUTOMÁTICA
    // --------------------------------------------------

    _getAutoRefreshMarginMs(expiresIn) {
        switch (expiresIn) {
            case "8h":
                return 60 * 60 * 1000;

            case "6m":
            case "1y":
                return 24 * 60 * 60 * 1000;

            default:
                // Não renova automaticamente registros sem duração reconhecida.
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

    async _runAutoRefreshCheck() {
        if (!this.initialized || this._autoRefreshRunning) {
            return false;
        }

        this._autoRefreshRunning = true;

        try {
            // Atualiza a cópia em memória para não trabalhar com registros
            // antigos caso outra aba já tenha renovado ou excluído um token.
            await this._loadCredentials();

            // Após uma falha OAuth, aguarda a troca/renovação da sessão.
            // Enquanto o token OAuth armazenado continuar igual, não insiste.
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
                        // Recarrega os dados depois de obter o bloqueio.
                        // Outra aba pode ter renovado ou excluído este JWT.
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

                            // Falhas de rede ou do Worker não removem nem
                            // modificam o JWT. A próxima verificação tentará
                            // novamente se ele continuar na janela.
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
                        // Web Locks evita que abas diferentes renovem o
                        // mesmo JWT simultaneamente quando a API está disponível.
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
                            // O bloqueio interno de refresh continua protegendo
                            // chamadas simultâneas nesta instância do Manager.
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
            // Uma falha geral de leitura/verificação não apaga credenciais.
            console.error(
                "[JWTManager] Não foi possível verificar os JWTs:",
                error
            );

            return false;
        } finally {
            this._autoRefreshRunning = false;
        }
    }

    // --------------------------------------------------
    // PERSISTÊNCIA
    // --------------------------------------------------

    async _saveCredentials(credentials) {
        await this.database.update([
            {
                tbn: this.store,
                tbk: this.storageKey,
                tbv: [credentials]
            }
        ]);
    }

    // --------------------------------------------------
    // CONSULTA
    // --------------------------------------------------

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

    // --------------------------------------------------
    // CRIAÇÃO DE CREDENCIAL
    // --------------------------------------------------

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

    // --------------------------------------------------
    // SESSÃO OAUTH GITHUB
    // --------------------------------------------------

    async _getGitHubAccessToken() {
        const auth = await this.database.read({
            tbn: "config",
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

    // --------------------------------------------------
    // CRIAÇÃO DE JWT
    // --------------------------------------------------

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
                audience: aud
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

    // --------------------------------------------------
    // RENOVAÇÃO DE JWT
    // --------------------------------------------------

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

    // --------------------------------------------------
    // EDIÇÃO DE METADADOS DA CREDENCIAL
    // --------------------------------------------------

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

    // --------------------------------------------------
    // EDIÇÃO DE METADADOS DO JWT
    // --------------------------------------------------

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

    // --------------------------------------------------
    // EXCLUSÃO INDIVIDUAL DE JWT
    // --------------------------------------------------

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

    // --------------------------------------------------
    // EXCLUSÃO DE CREDENCIAL
    // --------------------------------------------------

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
}