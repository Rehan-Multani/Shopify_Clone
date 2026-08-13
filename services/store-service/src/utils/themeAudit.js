/**
 * Persist theme lifecycle audit events (no PII).
 */
import ThemeAuditEvent from '../models/ThemeAuditEvent.js';
import { AUDIT_ACTIONS } from './themeAuditActions.js';

export { AUDIT_ACTIONS };

const stripMeta = (meta = {}) => {
    if (!meta || typeof meta !== 'object') return {};
    const { email, password, token, authorization, card, phone, address, ...rest } = meta;
    return rest;
};

export const recordThemeAudit = async ({
    storeId,
    actorId = '',
    action,
    themeId = '',
    themeVersion = '',
    previousVersion = '',
    metadata = {},
} = {}) => {
    if (!storeId || !AUDIT_ACTIONS.includes(action)) return null;
    try {
        return await ThemeAuditEvent.create({
            storeId,
            actorId: String(actorId || '').slice(0, 64),
            action,
            themeId: String(themeId || '').slice(0, 120),
            themeVersion: String(themeVersion || '').slice(0, 40),
            previousVersion: String(previousVersion || '').slice(0, 40),
            metadata: stripMeta(metadata),
        });
    } catch (err) {
        console.error('[ThemeAudit]', err.message);
        return null;
    }
};

export default recordThemeAudit;
