/**
 * WebPush - Web Push 100% no navegador (zero dependências, Web Crypto API)
 * @description API espelhando `web-push`. Content-Encoding: aes128gcm. Proxy obrigatório.
 * @see  Push API - W3C                       - [https://w3c.github.io/push-api/]
 * @see  RFC 8291 - Message Encryption        - [https://datatracker.ietf.org/doc/html/rfc8291]
 * @license The MIT License (MIT)             - [https://github.com/subversivo58/subversivo58.github.io/blob/master/LICENSE]
 * @copyright Copyright (c) 2026 Lauro Moraes - [https://github.com/subversivo58]
 * @version 0.1.0 [development stage]         - [https://github.com/subversivo58/subversivo58.github.io/blob/master/VERSIONING.md]
 */

const DEFAULT_TTL = 2419200;
const DEFAULT_EXPIRATION_SECONDS = 12 * 60 * 60;
const MAX_EXPIRATION_SECONDS = 24 * 60 * 60;

// ---------- helpers ----------

function b64uToBytes(b64u) {
  const pad = '='.repeat((4 - (b64u.length % 4)) % 4);
  const b64 = (b64u + pad).replace(/-/g, '+').replace(/_/g, '/');
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bytesToB64u(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = '';
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function concatBytes(...arrays) {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const a of arrays) { out.set(a, off); off += a.length; }
  return out;
}

function utf8(str) { return new TextEncoder().encode(str); }

function normalizePayload(payload) {
  if (payload == null) return null;
  if (typeof payload === 'string') return payload;
  if (typeof payload === 'object') return JSON.stringify(payload);
  throw new Error('payload must be a string, object, or null.');
}

// ---------- VAPID keys ----------

export async function generateVAPIDKeys() {
  const kp = await crypto.subtle.generateKey(
    { name: 'ECDSA', namedCurve: 'P-256' },
    true,
    ['sign', 'verify']
  );
  const raw = new Uint8Array(await crypto.subtle.exportKey('raw', kp.publicKey));
  const jwk = await crypto.subtle.exportKey('jwk', kp.privateKey);
  return { publicKey: bytesToB64u(raw), privateKey: jwk.d };
}

async function importVapidPrivateKey(privateKeyB64u) {
  return crypto.subtle.importKey(
    'jwk',
    { kty: 'EC', crv: 'P-256', d: privateKeyB64u },
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign']
  );
}

// ---------- VAPID JWT (ES256) ----------

async function buildVapidJwt(audience, subject, publicKeyB64u, privateKeyB64u, expiration) {
  if (!audience) throw new Error('No audience for VAPID.');
  if (!subject || typeof subject !== 'string') throw new Error('No subject set.');
  if (!publicKeyB64u || typeof publicKeyB64u !== 'string') throw new Error('No publicKey.');
  if (!privateKeyB64u || typeof privateKeyB64u !== 'string') throw new Error('No privateKey.');
  if (b64uToBytes(publicKeyB64u).length !== 65) throw new Error('publicKey must be 65 bytes.');
  if (b64uToBytes(privateKeyB64u).length !== 32) throw new Error('privateKey must be 32 bytes.');

  if (expiration == null) {
    expiration = Math.floor(Date.now() / 1000) + DEFAULT_EXPIRATION_SECONDS;
  } else {
    if (!Number.isInteger(expiration) || expiration < 0) throw new Error('Invalid expiration.');
    if (expiration >= Math.floor(Date.now() / 1000) + MAX_EXPIRATION_SECONDS) {
      throw new Error('Expiration > 24h.');
    }
  }

  const header = { typ: 'JWT', alg: 'ES256' };
  const payload = { aud: audience, exp: expiration, sub: subject };
  const signingInput = bytesToB64u(utf8(JSON.stringify(header))) + '.' +
                       bytesToB64u(utf8(JSON.stringify(payload)));

  const key = await importVapidPrivateKey(privateKeyB64u);
  const sig = new Uint8Array(await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, key, utf8(signingInput)
  ));
  return signingInput + '.' + bytesToB64u(sig);
}

function audienceFromEndpoint(endpoint) {
  const u = new URL(endpoint);
  return u.protocol + '//' + u.host;
}

// ---------- Criptografia do payload (RFC 8291 / aes128gcm) ----------

async function hkdf(salt, ikm, info, length) {
  const baseKey = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt, info }, baseKey, length * 8
  );
  return new Uint8Array(bits);
}

async function encryptPayload(subscription, payloadString) {
  if (!subscription || !subscription.endpoint) throw new Error('subscription.endpoint required.');
  if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
    throw new Error('subscription.keys.p256dh and .auth required.');
  }

  const uaPublic = b64uToBytes(subscription.keys.p256dh);
  if (uaPublic.length !== 65) throw new Error('p256dh must be 65 bytes.');
  const authSecret = b64uToBytes(subscription.keys.auth);
  if (authSecret.length < 16) throw new Error('auth must be >= 16 bytes.');

  const asKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']
  );
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', asKeyPair.publicKey));
  const uaPublicKey = await crypto.subtle.importKey(
    'raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []
  );
  const ecdhSecret = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'ECDH', public: uaPublicKey }, asKeyPair.privateKey, 256
  ));

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const prkKey = await crypto.subtle.importKey('raw', ecdhSecret, 'HKDF', false, ['deriveBits']);
  const ikm = new Uint8Array(await crypto.subtle.deriveBits(
    { name: 'HKDF', hash: 'SHA-256', salt: authSecret,
      info: concatBytes(utf8('WebPush: info\0'), uaPublic, asPublic) },
    prkKey, 256
  ));

  const cek = await hkdf(salt, ikm, utf8('Content-Encoding: aes128gcm\0'), 16);
  const nonce = await hkdf(salt, ikm, utf8('Content-Encoding: nonce\0'), 12);

  const plaintext = concatBytes(utf8(payloadString), new Uint8Array([2]));
  const aesKey = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ciphertext = new Uint8Array(await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: nonce, tagLength: 128 }, aesKey, plaintext
  ));

  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, ciphertext.length + 16 + 1 + 65, false);
  const idlen = new Uint8Array([asPublic.length]);
  const header = concatBytes(salt, rs, idlen, asPublic);

  return concatBytes(header, ciphertext);
}

// ---------- WebPushError ----------

export class WebPushError extends Error {
  constructor(message, statusCode, headers, body, endpoint) {
    super(message);
    this.name = 'WebPushError';
    this.statusCode = statusCode;
    this.headers = headers;
    this.body = body;
    this.endpoint = endpoint;
  }
}

// ---------- WebPush ----------

export class WebPush {
  constructor(proxy) {
    if (typeof proxy !== 'string' || proxy.length === 0) {
      throw new Error('WebPush constructor requires a proxy URL string.');
    }
    this._proxy = proxy.replace(/\/$/, '');
    this._vapidDetails = null;
  }

  setVapidDetails(subject, publicKey, privateKey) {
    if (arguments.length === 1 && subject === null) { this._vapidDetails = null; return; }
    if (!subject || typeof subject !== 'string') throw new Error('subject must be string.');
    if (!publicKey || typeof publicKey !== 'string') throw new Error('publicKey must be string.');
    if (!privateKey || typeof privateKey !== 'string') throw new Error('privateKey must be string.');
    if (b64uToBytes(publicKey).length !== 65) throw new Error('publicKey must be 65 bytes.');
    if (b64uToBytes(privateKey).length !== 32) throw new Error('privateKey must be 32 bytes.');
    this._vapidDetails = { subject, publicKey, privateKey };
  }

  async encrypt(subscription, payload) {
    return encryptPayload(subscription, normalizePayload(payload));
  }

  async getVapidHeaders(audience, subject, publicKey, privateKey, expiration) {
    const jwt = await buildVapidJwt(audience, subject, publicKey, privateKey, expiration);
    return { Authorization: 'vapid t=' + jwt + ', k=' + publicKey };
  }

  async generateRequestDetails(subscription, payload, options = {}) {
    if (!subscription || !subscription.endpoint) throw new Error('subscription.endpoint required.');
    const endpoint = subscription.endpoint;

    const vapid = options.vapidDetails || this._vapidDetails;
    const ttl = options.TTL ?? DEFAULT_TTL;
    const extraHeaders = options.headers || {};

    const headers = { TTL: String(ttl), ...extraHeaders };
    let body = null;

    if (payload != null) {
      if (!subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
        throw new Error('subscription.keys required for payload.');
      }
      body = await encryptPayload(subscription, normalizePayload(payload));
      headers['Content-Encoding'] = 'aes128gcm';
      headers['Content-Type'] = 'application/octet-stream';
      headers['Content-Length'] = String(body.length);
    } else {
      headers['Content-Length'] = '0';
    }

    if (vapid) {
      const audience = audienceFromEndpoint(endpoint);
      const jwt = await buildVapidJwt(audience, vapid.subject, vapid.publicKey, vapid.privateKey, options.expiration);
      headers.Authorization = 'vapid t=' + jwt + ', k=' + vapid.publicKey;
    }

    const finalEndpoint = this._proxy + '/' + endpoint;

    return { method: 'POST', endpoint: finalEndpoint, originalEndpoint: endpoint, headers, body };
  }

  async sendNotification(subscription, payload, options = {}) {
    const details = await this.generateRequestDetails(subscription, payload, options);

    const resp = await fetch(details.endpoint, {
      method: details.method,
      headers: details.headers,
      body: details.body || undefined,
      mode: 'cors',
      credentials: 'omit',
    });

    const text = await resp.text().catch(() => '');
    if (resp.status < 200 || resp.status > 299) {
      throw new WebPushError(
        'Unexpected response code',
        resp.status,
        Object.fromEntries(resp.headers.entries()),
        text,
        details.originalEndpoint
      );
    }
    return { statusCode: resp.status, body: text, headers: Object.fromEntries(resp.headers.entries()) };
  }
}

export default WebPush;
