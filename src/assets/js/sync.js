// Encryption and transport for anonymous sync.
//
// A sync key (generated, or any string of MIN_KEY_LENGTH or more) is stretched
// with PBKDF2 into two secrets: a vault id that tells the server where the data
// lives, and an AES-GCM key that never leaves the browser. The server only
// stores a hash of the vault id and the encrypted, gzipped snapshot.
import http from '@/http'

export const MIN_KEY_LENGTH = 12

const HEADER = 'X-Sync-Vault'
const SALT = 'sharpsword.io sync v1'
// OWASP's 2023 recommendation for PBKDF2-SHA256; ~0.3–1s, once per device
const ITERATIONS = 600000
// first byte of every encrypted snapshot, so the format can change later
const FORMAT = 1
// Crockford base32: no I, L, O or U to misread when copying a key by hand
const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'

const encoder = new TextEncoder()

export const canSync = () => Boolean(
    window.isSecureContext && window.crypto?.subtle && window.CompressionStream && window.DecompressionStream
)

// 125 random bits as XXXXX-XXXXX-XXXXX-XXXXX-XXXXX
export const generateKey = () => {
    const chars = Array.from(crypto.getRandomValues(new Uint8Array(25)), b => ALPHABET[b & 31])
    return [0, 5, 10, 15, 20].map(i => chars.slice(i, i + 5).join('')).join('-')
}

// Generated keys are accepted in any case and with or without dashes; anything
// else is used exactly as typed, apart from surrounding spaces.
export const normalizeKey = (input) => {
    const trimmed = input.trim()
    const compact = trimmed.toUpperCase().replace(/[\s-]/g, '')
    if (compact.length === 25 && [...compact].every(c => ALPHABET.includes(c))) {
        return compact.match(/.{5}/g).join('-')
    }
    return trimmed
}

const toHex = (bytes) => Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')

const toBase64 = (bytes) => {
    let binary = ''
    for (let i = 0; i < bytes.length; i += 0x8000) {
        binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
    }
    return btoa(binary)
}

const fromBase64 = (text) => Uint8Array.from(atob(text), c => c.charCodeAt(0))

const pipe = async (bytes, transform) => {
    const stream = new Blob([bytes]).stream().pipeThrough(transform)
    return new Uint8Array(await new Response(stream).arrayBuffer())
}

// { vault, key }: the hex vault id for the server and the base64 encryption key
export const deriveKeys = async (secret) => {
    const material = await crypto.subtle.importKey('raw', encoder.encode(secret), 'PBKDF2', false, ['deriveBits'])
    const bits = new Uint8Array(await crypto.subtle.deriveBits(
        { name: 'PBKDF2', hash: 'SHA-256', salt: encoder.encode(SALT), iterations: ITERATIONS },
        material,
        512,
    ))
    return { vault: toHex(bits.subarray(0, 32)), key: toBase64(bits.subarray(32)) }
}

export const importKey = (key) => crypto.subtle.importKey('raw', fromBase64(key), 'AES-GCM', false, ['encrypt', 'decrypt'])

export const encrypt = async (value, cryptoKey) => {
    const packed = await pipe(encoder.encode(JSON.stringify(value)), new CompressionStream('gzip'))
    const iv = crypto.getRandomValues(new Uint8Array(12))
    const sealed = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, packed))
    const out = new Uint8Array(1 + iv.length + sealed.length)
    out.set([FORMAT])
    out.set(iv, 1)
    out.set(sealed, 1 + iv.length)
    return toBase64(out)
}

export const decrypt = async (data, cryptoKey) => {
    const bytes = fromBase64(data)
    if (bytes[0] !== FORMAT) {
        throw new Error('This cloud copy was saved by a newer version of SharpSword. Reload to update.')
    }
    const packed = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.subarray(1, 13) }, cryptoKey, bytes.subarray(13))
    const json = await pipe(packed, new DecompressionStream('gzip'))
    return JSON.parse(new TextDecoder().decode(json))
}

// { version, data? }. Version 0 means nothing is stored under this vault;
// data is left out when it is still at `known`.
export const fetchVault = async (baseUrl, vault, known = -1) => {
    const response = await http.get(`${baseUrl}/api/v1/sync`, { headers: { [HEADER]: vault }, params: { known } })
    return response.data
}

// { saved: true, version } or, when another device saved first,
// { saved: false, version, data } with the copy to merge before retrying.
export const putVault = async (baseUrl, vault, baseVersion, data) => {
    try {
        const response = await http.put(`${baseUrl}/api/v1/sync`, { baseVersion, data }, { headers: { [HEADER]: vault } })
        return { saved: true, ...response.data }
    } catch (error) {
        if (error.response?.status === 409) {
            return { saved: false, ...error.response.data }
        }
        throw error
    }
}

export const deleteVault = async (baseUrl, vault) => {
    await http.delete(`${baseUrl}/api/v1/sync`, { headers: { [HEADER]: vault } })
}
