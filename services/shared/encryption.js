import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getKey() {
    const secret = process.env.CREDENTIALS_ENCRYPTION_KEY || process.env.JWT_SECRET || 'storify_payment_credentials_key_2026';
    return crypto.createHash('sha256').update(String(secret)).digest();
}

/**
 * Encrypt a string or object. Objects are JSON-stringified first.
 * Returns a compact string: iv:authTag:ciphertext (hex).
 */
export function encrypt(value) {
    if (value === null || value === undefined || value === '') return '';
    const plaintext = typeof value === 'string' ? value : JSON.stringify(value);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
}

/**
 * Decrypt a value produced by encrypt().
 * If parseJson is true, attempts JSON.parse on the result.
 */
export function decrypt(payload, { parseJson = false } = {}) {
    if (!payload) return parseJson ? {} : '';
    // Plaintext legacy values (not yet encrypted)
    if (!String(payload).includes(':')) {
        if (parseJson) {
            try { return JSON.parse(payload); } catch { return {}; }
        }
        return payload;
    }

    try {
        const [ivHex, authTagHex, dataHex] = String(payload).split(':');
        if (!ivHex || !authTagHex || !dataHex) {
            return parseJson ? {} : '';
        }
        const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), Buffer.from(ivHex, 'hex'));
        decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(dataHex, 'hex')),
            decipher.final()
        ]).toString('utf8');

        if (parseJson) {
            try { return JSON.parse(decrypted); } catch { return {}; }
        }
        return decrypted;
    } catch (err) {
        console.error('Credential decryption failed:', err.message);
        return parseJson ? {} : '';
    }
}

/**
 * Encrypt a credentials object field-by-field into a single encrypted JSON blob.
 */
export function encryptCredentials(credentials = {}) {
    return encrypt(credentials);
}

/**
 * Decrypt credentials JSON blob.
 */
export function decryptCredentials(encrypted) {
    return decrypt(encrypted, { parseJson: true }) || {};
}

/**
 * Mask a secret for safe UI display. Keeps last 4 chars when long enough.
 */
export function maskSecret(value, visible = 4) {
    if (!value || typeof value !== 'string') return '';
    if (value.length <= visible) return '••••••••';
    return `${'•'.repeat(Math.min(12, value.length - visible))}${value.slice(-visible)}`;
}

/**
 * Build a safe public view of credentials (secrets masked; public keys kept).
 */
export function maskCredentials(gateway, credentials = {}) {
    const publicFields = {
        razorpay: ['keyId'],
        stripe: ['publishableKey'],
        payu: ['merchantKey'],
        cashfree: ['appId']
    };
    const allowed = publicFields[gateway] || [];
    const result = {};
    for (const [key, val] of Object.entries(credentials || {})) {
        if (!val) {
            result[key] = '';
        } else if (allowed.includes(key)) {
            result[key] = val;
        } else {
            result[key] = maskSecret(String(val));
            result[`${key}Configured`] = true;
        }
    }
    return result;
}

export default { encrypt, decrypt, encryptCredentials, decryptCredentials, maskSecret, maskCredentials };
