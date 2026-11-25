
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

        if (!config.storage || typeof config.storage !== "object") {
            throw new TypeError(
                "Configuração de armazenamento JWT não informada."
            );
        }

        if (
            !config.storage.store ||
            typeof config.storage.store !== "string" ||
            !config.storage.key ||
            typeof config.storage.key !== "string"
        ) {
            throw new TypeError(
                "Object store ou chave de armazenamento inválidos."
            );
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
    }

    // --------------------------------------------------
    // Identificação da chave
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
        return kid.startsWith("K_") ? kid.slice(2) : kid;
    }

    // --------------------------------------------------
    // Inicialização
    // --------------------------------------------------

    async initialize() {
        if (this.initialized) return this;

        if (this._initializing) {
            return this._initializing;
        }

        this._initializing = this._loadCredentials();

        try {
            await this._initializing;
            this.initialized = true;
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

        if (stored === false) {
            this.credentials = [];
            return;
        }

        let credentials = stored;

        if (
            !Array.isArray(credentials) &&
            credentials &&
            typeof credentials === "object"
        ) {
            if (Object.keys(credentials).length === 0) {
                credentials = [];
            } else if (credentials.kid && credentials.keyPair) {
                credentials = [credentials];
            }
        }

        if (!Array.isArray(credentials)) {
            throw new TypeError(
                "O registro de credenciais não contém um array válido."
            );
        }

        const loaded = [];

        for (const credential of credentials) {
            if (
                !credential ||
                typeof credential !== "object" ||
                !credential.kid ||
                !credential.keyPair ||
                typeof credential.keyPair !== "object"
            ) {
                throw new Error("Registro de credencial inválido.");
            }

            const { publicKey, privateKey } = credential.keyPair;

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

            const externalKid = this._normalizeKid(credential.kid);

            await this.jwt.importKey({
                keyId: externalKid,
                type: "public",
                keyData: publicKey.value,
                format: publicKey.format
            });

            await this.jwt.importKey({
                keyId: externalKid,
                type: "private",
                keyData: privateKey.value,
                format: privateKey.format
            });

            loaded.push(credential);
        }

        this.credentials = loaded;
    }

    // --------------------------------------------------
    // Identificação
    // --------------------------------------------------

    _generateKeyId() {
        const bytes = crypto.getRandomValues(new Uint8Array(16));

        return Array.from(bytes, byte =>
            byte.toString(16).padStart(2, "0")
        ).join("");
    }

    // --------------------------------------------------
    // Persistência
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
    // Consulta de credenciais
    // --------------------------------------------------

    getCredentials() {
        return this.credentials.map(credential => ({
            ...credential,
            keyPair: {
                ...credential.keyPair,
                publicKey: { ...credential.keyPair.publicKey },
                privateKey: { ...credential.keyPair.privateKey }
            },
            tokens: [...credential.tokens],
            metadata: { ...credential.metadata }
        }));
    }

    // --------------------------------------------------
    // Criação de credenciais
    // --------------------------------------------------

    async createCredential() {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de criar credenciais."
            );
        }

        const kid = this._generateKeyId();
        const externalKid = this._normalizeKid(kid);

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

            // Registra a chave pública também pelo KID externo,
            // exatamente como será recebido no header do JWT.
            await this.jwt.importKey({
                keyId: externalKid,
                type: "public",
                keyData: publicKey,
                format: "spki"
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
                    issuer: this.config.issuer,
                    algorithm: "EdDSA",
                    createdAt: new Date().toISOString()
                }
            };

            const updatedCredentials = [...this.credentials, credential];

            await this._saveCredentials(updatedCredentials);

            this.credentials = updatedCredentials;

            return this.getCredentials().find(item => item.kid === kid);
        } catch (error) {
            this.jwt.keys.delete(kid);
            this.jwt.keys.delete(externalKid);
            throw error;
        }
    }

    // --------------------------------------------------
    // Criação de JWT no Cloudflare Worker
    // --------------------------------------------------

    async createToken({
        kid,
        aud,
        expiresIn = "8h"
    } = {}) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de criar tokens."
            );
        }

        if (!aud || typeof aud !== "string" || !aud.trim()) {
            throw new TypeError("Audience do JWT inválida.");
        }

        if (!["8h", "6m", "1y"].includes(expiresIn)) {
            throw new TypeError("Duração do JWT inválida.");
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

        // Recupera a sessão OAuth do GitHub armazenada pelo painel.
        const githubAuth = await this.database.read({
            tbn: "config",
            tbk: "user-github"
        });

        const accessToken = githubAuth?.tokens?.access_token;

        if (!accessToken || typeof accessToken !== "string") {
            throw JWToken.createError(
                "OAUTH_EXPIRED",
                "Sessão OAuth do GitHub não encontrada. Autentique-se novamente."
            );
        }

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
                        kid: externalKid,
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
            const code = data.code || data.error;

            if (code === "OAUTH_EXPIRED") {
                throw JWToken.createError(
                    "OAUTH_EXPIRED",
                    "A sessão OAuth do GitHub expirou ou é inválida."
                );
            }

            throw JWToken.createError(
                "SERVER_ERROR",
                data.error || "O Worker não conseguiu gerar o JWT."
            );
        }

        if (typeof data.token !== "string" || !data.token) {
            throw JWToken.createError(
                "SERVER_ERROR",
                "A resposta do Worker não contém um JWT válido."
            );
        }

        // Verifica assinatura e claims antes de armazenar o token.
        try {
            await this.jwt.verify({
                token: data.token,
                issuer: this.config.issuer,
                audience: aud
            });

            const decoded = this.jwt.decode(data.token);

            if (
                decoded.header.kid !== externalKid ||
                decoded.payload.sub !== this.config.sub
            ) {
                throw new Error(
                    "O KID ou o Subject do JWT não corresponde à configuração."
                );
            }
        } catch (error) {
            throw JWToken.createError(
                "INVALID_TOKEN",
                `O JWT recebido não passou na validação: ${error.message}`
            );
        }

        const decoded = this.jwt.decode(data.token);

        const tokenRecord = {
            token: data.token,
            kid: externalKid,
            aud,
            expiresIn,
            issuedAt: decoded.payload.iat,
            expiresAt: decoded.payload.exp,
            createdAt: new Date().toISOString()
        };

        const updatedCredential = {
            ...credential,
            tokens: [...credential.tokens, tokenRecord]
        };

        const updatedCredentials = this.credentials.map(item =>
            item.kid === storedKid ? updatedCredential : item
        );

        await this._saveCredentials(updatedCredentials);

        this.credentials = updatedCredentials;

        return tokenRecord;
    }

    // --------------------------------------------------
    // Exclusão de credenciais
    // --------------------------------------------------

    async deleteCredential(kid) {
        if (!this.initialized) {
            throw new Error(
                "JWTManager precisa ser inicializado antes de excluir credenciais."
            );
        }

        if (!kid || typeof kid !== "string") {
            throw new TypeError("Identificador da credencial inválido.");
        }

        const storedKid = this._getStoredKid(kid);

        const credentialExists = this.credentials.some(
            credential => credential.kid === storedKid
        );

        if (!credentialExists) {
            throw new Error(`Credencial "${kid}" não encontrada.`);
        }

        const updatedCredentials = this.credentials.filter(
            credential => credential.kid !== storedKid
        );

        await this._saveCredentials(updatedCredentials);

        this.credentials = updatedCredentials;

        this.jwt.keys.delete(storedKid);
        this.jwt.keys.delete(this._normalizeKid(storedKid));

        return true;
    }
}
