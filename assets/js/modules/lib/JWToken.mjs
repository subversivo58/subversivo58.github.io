/**
 * Developer Tools - Browser environment inspection utilities
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/main/LICENSE]
 * @copyright Copyright (c) 2010-2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/main/VERSIONING.md]
 */
const encoder = new TextEncoder();
const decoder = new TextDecoder();

const ALGORITHM = "Ed25519";
const JWT_ALGORITHM = "EdDSA";

export class JWToken {
  constructor({
    issuer,
    audience,
    clockSkewSeconds = 0
  } = {}) {
    this.issuer = issuer;
    this.audience = audience;
    this.clockSkewSeconds = clockSkewSeconds;

    this.keys = new Map();
  }

  // --------------------------------------------------
  // Utilitários
  // --------------------------------------------------

  static base64UrlEncode(data) {
    const bytes = data instanceof Uint8Array
      ? data
      : new Uint8Array(data);

    let binary = "";

    for (const byte of bytes) {
      binary += String.fromCharCode(byte);
    }

    return btoa(binary)
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "");
  }

  static base64UrlDecode(value) {
    const base64 = value
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const padded = base64.padEnd(
      Math.ceil(base64.length / 4) * 4,
      "="
    );

    const binary = atob(padded);

    return Uint8Array.from(
      binary,
      character => character.charCodeAt(0)
    );
  }

  static encodeJSON(value) {
    return JWToken.base64UrlEncode(
      encoder.encode(JSON.stringify(value))
    );
  }

  static decodeJSON(value) {
    return JSON.parse(
      decoder.decode(
        JWToken.base64UrlDecode(value)
      )
    );
  }

  static createError(code, message) {
    const error = new Error(message);
    error.name = code;
    error.code = code;
    return error;
  }

  // --------------------------------------------------
  // Geração de chaves
  // --------------------------------------------------

  async generateKeys({
    keyId,
    extractable = true
  } = {}) {
    if (keyId && this.keys.has(keyId)) {
      throw new Error(`O keyId "${keyId}" já existe.`);
    }

    const pair = await crypto.subtle.generateKey(
      {
        name: ALGORITHM
      },
      extractable,
      ["sign", "verify"]
    );

    if (keyId) {
      this.keys.set(keyId, {
        publicKey: pair.publicKey,
        privateKey: pair.privateKey
      });
    }

    return {
      publicKey: pair.publicKey,
      privateKey: pair.privateKey
    };
  }

  // --------------------------------------------------
  // Importação de chaves
  // --------------------------------------------------

  async importKey({
    keyId,
    type,
    keyData,
    format = "pkcs8",
    extractable = false
  }) {
    if (!keyId) {
      throw new Error("keyId é obrigatório.");
    }

    if (!["public", "private"].includes(type)) {
      throw new Error("Tipo de chave inválido.");
    }

    const expectedFormat = type === "private"
      ? ["pkcs8", "jwk"]
      : ["spki", "jwk"];

    if (!expectedFormat.includes(format)) {
      throw new Error("Formato incompatível com o tipo de chave.");
    }

    const key = await crypto.subtle.importKey(
      format,
      format === "jwk"
        ? keyData
        : JWToken.base64UrlDecode(keyData),
      {
        name: ALGORITHM
      },
      extractable,
      type === "private" ? ["sign"] : ["verify"]
    );

    const entry = this.keys.get(keyId) || {};

    entry[type === "private" ? "privateKey" : "publicKey"] = key;

    this.keys.set(keyId, entry);

    return key;
  }

  // --------------------------------------------------
  // Exportação de chaves
  // --------------------------------------------------

  async exportKey({
    key,
    format
  }) {
    if (!key) {
      throw new Error("Chave não informada.");
    }

    if (!key.extractable) {
      throw new Error("A chave não permite exportação.");
    }

    if (!["pkcs8", "spki", "jwk"].includes(format)) {
      throw new Error("Formato de exportação inválido.");
    }

    const exported = await crypto.subtle.exportKey(
      format,
      key
    );

    if (format === "jwk") {
      return exported;
    }

    return JWToken.base64UrlEncode(exported);
  }

  // --------------------------------------------------
  // Assinatura
  // --------------------------------------------------

  async sign({
    payload,
    keyId,
    privateKey
  }) {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("Payload JWT inválido.");
    }

    if (!keyId) {
      throw new Error("keyId é obrigatório.");
    }

    const key = privateKey ||
      this.keys.get(keyId)?.privateKey;

    if (!key || key.type !== "private" ||
        key.algorithm?.name !== ALGORITHM) {
      throw new Error("Chave privada Ed25519 inválida.");
    }

    const header = {
      alg: JWT_ALGORITHM,
      typ: "JWT",
      kid: keyId
    };

    const encodedHeader = JWToken.encodeJSON(header);
    const encodedPayload = JWToken.encodeJSON(payload);

    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const signature = await crypto.subtle.sign(
      {
        name: ALGORITHM
      },
      key,
      encoder.encode(signingInput)
    );

    return `${signingInput}.${JWToken.base64UrlEncode(signature)}`;
  }

  // --------------------------------------------------
  // Decodificação
  // --------------------------------------------------

  decode(token) {
    if (typeof token !== "string") {
      throw new Error("JWT inválido.");
    }

    const parts = token.split(".");

    if (parts.length !== 3) {
      throw new Error("Estrutura JWT inválida.");
    }

    try {
      return {
        header: JWToken.decodeJSON(parts[0]),
        payload: JWToken.decodeJSON(parts[1])
      };
    } catch {
      throw new Error("Não foi possível decodificar o JWT.");
    }
  }

  // --------------------------------------------------
  // Verificação
  // --------------------------------------------------

  async verify({
    token,
    publicKey,
    issuer = this.issuer,
    audience = this.audience,
    clockSkewSeconds = this.clockSkewSeconds,
    now = Date.now()
  }) {
    const { header, payload } = this.decode(token);

    if (header.alg !== JWT_ALGORITHM || header.typ !== "JWT") {
      throw new Error("Algoritmo ou tipo de JWT inválido.");
    }

    if (!header.kid) {
      throw new Error("JWT sem identificação de chave (kid).");
    }

    const key = publicKey ||
      this.keys.get(header.kid)?.publicKey;

    if (!key || key.type !== "public" ||
        key.algorithm?.name !== ALGORITHM) {
      throw new Error("Chave pública Ed25519 não encontrada.");
    }

    if (typeof payload.iss !== "string" ||
        typeof payload.sub !== "string" && typeof payload.sub !== "number" ||
        typeof payload.aud !== "string" && !Array.isArray(payload.aud) ||
        typeof payload.iat !== "number" ||
        typeof payload.exp !== "number") {
      throw new Error("Claims obrigatórios ausentes ou inválidos.");
    }

    if (issuer && payload.iss !== issuer) {
      throw new Error("Issuer inválido.");
    }

    if (audience) {
      const audiences = Array.isArray(payload.aud)
        ? payload.aud
        : [payload.aud];

      if (!audiences.includes(audience)) {
        throw new Error("Audience inválida.");
      }
    }

    const nowSeconds = Math.floor(now / 1000);
    const skew = Math.max(0, clockSkewSeconds);

    if (payload.iat > nowSeconds + skew) {
      throw new Error("JWT emitido no futuro.");
    }

    if (payload.exp <= nowSeconds - skew) {
      throw new Error("JWT expirado.");
    }

    if (payload.nbf !== undefined) {
      if (typeof payload.nbf !== "number") {
        throw new Error("Claim nbf inválida.");
      }

      if (payload.nbf > nowSeconds + skew) {
        throw new Error("JWT ainda não está válido.");
      }
    }

    const parts = token.split(".");
    const signingInput = `${parts[0]}.${parts[1]}`;

    const signature = JWToken.base64UrlDecode(parts[2]);

    const valid = await crypto.subtle.verify(
      {
        name: ALGORITHM
      },
      key,
      signature,
      encoder.encode(signingInput)
    );

    if (!valid) {
      throw new Error("Assinatura JWT inválida.");
    }

    return true;
  }

  // --------------------------------------------------
  // Verificação de expiração
  // --------------------------------------------------

  isExpired(token, {
    serverTime,
    receivedMonotonic,
    monotonicNow
  } = {}) {
    const { payload } = this.decode(token);

    if (typeof payload.exp !== "number") {
      throw new Error("JWT sem claim exp válida.");
    }

    let currentTime;

    if (
      Number.isFinite(serverTime) &&
      Number.isFinite(receivedMonotonic)
    ) {
      const elapsed = (
        Number.isFinite(monotonicNow)
          ? monotonicNow
          : performance.now()
      ) - receivedMonotonic;

      currentTime = serverTime + elapsed;
    } else {
      currentTime = Date.now();
    }

    return currentTime >= payload.exp * 1000;
  }

  // --------------------------------------------------
  // Renovação
  // --------------------------------------------------

  async refresh({
    url,
    token,
    fetchOptions = {}
  }) {
    if (!url) {
      throw new Error("URL de renovação não informada.");
    }

    if (!token) {
      throw JWToken.createError(
        "INVALID_TOKEN",
        "JWT atual não informado."
      );
    }

    let response;

    try {
      response = await fetch(url, {
        ...fetchOptions,
        method: "POST",
        headers: {
          ...fetchOptions.headers,
          Authorization: `Bearer ${token}`
        }
      });
    } catch (error) {
      throw JWToken.createError(
        "NETWORK_ERROR",
        "Falha de comunicação com o servidor."
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
          "A sessão OAuth expirou."
        );
      }

      if (
        code === "INVALID_TOKEN" ||
        response.status === 401 ||
        response.status === 403
      ) {
        throw JWToken.createError(
          "INVALID_TOKEN",
          "O JWT atual é inválido."
        );
      }

      throw JWToken.createError(
        "SERVER_ERROR",
        "O servidor não conseguiu renovar o JWT."
      );
    }

    if (typeof data.token !== "string") {
      throw JWToken.createError(
        "SERVER_ERROR",
        "Resposta do servidor não contém um JWT válido."
      );
    }

    try {
      await this.verify({
        token: data.token
      });
    } catch (error) {
      throw JWToken.createError(
        "INVALID_TOKEN",
        `O novo JWT não passou na verificação: ${error.message}`
      );
    }

    return data.token;
  }
}
