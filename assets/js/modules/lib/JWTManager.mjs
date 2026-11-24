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

            await this.jwt.importKey({
                keyId: credential.kid,
                type: "public",
                keyData: publicKey.value,
                format: publicKey.format
            });

            await this.jwt.importKey({
                keyId: credential.kid,
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

        bytes[6] = (bytes[6] & 0x0f) | 0x40;
        bytes[8] = (bytes[8] & 0x3f) | 0x80;

        const hex = Array.from(bytes, byte =>
            byte.toString(16).padStart(2, "0")
        ).join("");

        return [
            hex.slice(0, 8),
            hex.slice(8, 12),
            hex.slice(12, 16),
            hex.slice(16, 20),
            hex.slice(20)
        ].join("-");
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
            throw error;
        }
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

        const credentialExists = this.credentials.some(
            credential => credential.kid === kid
        );

        if (!credentialExists) {
            throw new Error(`Credencial "${kid}" não encontrada.`);
        }

        const updatedCredentials = this.credentials.filter(
            credential => credential.kid !== kid
        );

        await this._saveCredentials(updatedCredentials);

        this.credentials = updatedCredentials;
        this.jwt.keys.delete(kid);

        return true;
    }
}
