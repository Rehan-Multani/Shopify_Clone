import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const DEFAULT_DEV_SECRET = 'storify_payment_credentials_key_2026';

function isProductionEnv() {
    const env = String(process.env.NODE_ENV || 'development').toLowerCase();
    return env === 'production' || process.env.REQUIRE_REDIS === 'true';
}

function resolveSecretSource() {
    if (process.env.CREDENTIALS_ENCRYPTION_KEY) {
        return { secret: process.env.CREDENTIALS_ENCRYPTION_KEY, source: 'CREDENTIALS_ENCRYPTION_KEY' };
    }
    if (process.env.JWT_SECRET) {
        return { secret: process.env.JWT_SECRET, source: 'JWT_SECRET' };
    }
    return { secret: DEFAULT_DEV_SECRET, source: 'default' };
}

/**
 * Call once at service boot. Production must not use the baked-in default key.
 */
export function assertCredentialsEncryptionKey() {
    const { secret, source } = resolveSecretSource();
    if (source === 'default') {
        const msg =
            'CREDENTIALS_ENCRYPTION_KEY (or JWT_SECRET) must be set — refusing default encryption key';
        if (isProductionEnv()) {
            throw new Error(msg);
        }
        console.warn(`[encryption] WARNING: ${msg}. Dev-only default in use.`);
        return { ok: false, source };
    }
    if (String(secret).length < 16) {
        const msg = 'CREDENTIALS_ENCRYPTION_KEY / JWT_SECRET should be at least 16 characters';
        if (isProductionEnv()) throw new Error(msg);
        console.warn(`[encryption] WARNING: ${msg}`);
        return { ok: false, source };
    }
    return { ok: true, source };
}

function getKey() {
    const { secret } = resolveSecretSource();
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
        cashfree: ['appId'],
        shiprocket: ['email']
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

export default { encrypt, decrypt, encryptCredentials, decryptCredentials, maskSecret, maskCredentials, assertCredentialsEncryptionKey };
