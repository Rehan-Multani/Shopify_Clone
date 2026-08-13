import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    setAnalyticsConsent,
    CONSENT_KEY,
    persistConsentAudit,
} from './themeEngine/themeAnalytics';
import { getStorePath } from './storeUrlHelper';

/**
 * First-party consent banner — analytics only, no third-party SDK.
 * Does not block storefront browsing when rejected.
 */
export default function ConsentBanner({ storeId }) {
    const [visible, setVisible] = useState(() => {
        try {
            return !localStorage.getItem(CONSENT_KEY);
        } catch {
            return true;
        }
    });
    const [prefsOpen, setPrefsOpen] = useState(false);
    const [analyticsOn, setAnalyticsOn] = useState(true);

    const applyConsent = (value) => {
        setAnalyticsConsent(value);
        setVisible(false);
        setPrefsOpen(false);
        window.dispatchEvent(new CustomEvent('storify-consent-updated', { detail: value }));
        persistConsentAudit({ storeId, consent: value });
    };

    const accept = () => applyConsent('granted');
    const reject = () => applyConsent('denied');

    const savePrefs = () => {
        applyConsent(analyticsOn ? 'granted' : 'denied');
    };

    if (!visible) return null;

    return (
        <div className="fixed inset-x-0 bottom-0 z-[200] p-4 pointer-events-none">
            <div className="max-w-xl mx-auto pointer-events-auto bg-white border border-zinc-200 shadow-2xl rounded-2xl p-5">
                {!prefsOpen ? (
                    <>
                        <p className="text-sm font-bold text-zinc-900">Analytics preferences</p>
                        <p className="text-xs text-zinc-600 mt-2 leading-relaxed">
                            We use anonymous analytics to understand store and theme performance.
                            No email or phone is collected for this.
                        </p>
                        <p className="text-[11px] text-zinc-400 mt-2">
                            See our{' '}
                            <Link
                                to={getStorePath(storeId, '/pages/privacy-policy')}
                                className="underline text-zinc-600 hover:text-zinc-900"
                            >
                                Privacy Policy
                            </Link>
                            .
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <button type="button" onClick={accept} className="px-3 py-2 text-xs font-bold rounded-xl bg-zinc-900 text-white">
                                Accept Analytics
                            </button>
                            <button type="button" onClick={reject} className="px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200">
                                Reject
                            </button>
                            <button type="button" onClick={() => setPrefsOpen(true)} className="px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200">
                                Manage Preferences
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-sm font-bold text-zinc-900">Preferences</p>
                        <label className="mt-4 flex items-center justify-between text-sm">
                            <span className="font-semibold text-zinc-700">Analytics</span>
                            <button
                                type="button"
                                role="switch"
                                aria-checked={analyticsOn}
                                onClick={() => setAnalyticsOn((v) => !v)}
                                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${analyticsOn ? 'bg-emerald-600 text-white' : 'bg-zinc-200 text-zinc-600'}`}
                            >
                                {analyticsOn ? 'On' : 'Off'}
                            </button>
                        </label>
                        <div className="mt-4 flex gap-2">
                            <button type="button" onClick={savePrefs} className="px-3 py-2 text-xs font-bold rounded-xl bg-zinc-900 text-white">
                                Save Preferences
                            </button>
                            <button type="button" onClick={() => setPrefsOpen(false)} className="px-3 py-2 text-xs font-bold rounded-xl border border-zinc-200">
                                Back
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
