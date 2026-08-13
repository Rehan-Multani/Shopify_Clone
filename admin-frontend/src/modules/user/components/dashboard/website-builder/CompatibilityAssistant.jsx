import React, { useMemo, useState } from 'react';
import {
    buildCompatibilityReport,
    createRemappedSection,
} from '../../storefront/themeEngine/sectionCompatibility';
import { remapSectionWithFields } from '../../storefront/themeEngine/migrationImpact';

/**
 * Compatibility Assistant — suggests remaps; never auto-applies.
 */
export default function CompatibilityAssistant({
    sections = [],
    supportedSections = null,
    onApplyRemap,
    onDismiss,
}) {
    const report = useMemo(
        () => buildCompatibilityReport(sections, supportedSections),
        [sections, supportedSections]
    );
    const [selected, setSelected] = useState({});
    const [lastReport, setLastReport] = useState(null);

    if (!report.needsAttention) return null;

    const handleApply = (item) => {
        const suggestion = item.suggestions.find((s) => s.type === selected[item.sectionId])
            || item.suggestions[0];
        if (!suggestion || !onApplyRemap) return;
        const original = sections.find((s) => (s.sectionId || s._id) === item.sectionId) || item;
        const withFields = remapSectionWithFields(original, suggestion);
        const result = withFields || createRemappedSection(original, suggestion);
        if (result) {
            setLastReport(result.migrationReport || null);
            onApplyRemap(result);
        }
    };

    return (
        <div
            className="mx-3 mb-3 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 space-y-3"
            role="region"
            aria-label="Compatibility assistant"
        >
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-amber-900">
                        Compatibility Assistant
                    </h3>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                        {report.needsAttention} section{report.needsAttention === 1 ? '' : 's'} need attention.
                        Originals are preserved until you approve a remap.
                    </p>
                </div>
                {onDismiss && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="text-[10px] font-bold text-amber-700 hover:text-amber-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded"
                        aria-label="Dismiss compatibility assistant"
                    >
                        Dismiss
                    </button>
                )}
            </div>

            {lastReport && (
                <div className="text-[10px] bg-white/90 border border-amber-100 rounded-lg p-2 space-y-1" role="status">
                    <p className="font-black uppercase text-zinc-500">Migration Report</p>
                    {(lastReport.migrated || []).map((m) => <p key={m}>✓ Migrated: {m}</p>)}
                    {(lastReport.changed || []).map((m) => <p key={m}>⚠ Changed: {m}</p>)}
                    {(lastReport.unsupported || []).map((m) => <p key={m}>✕ Unsupported: {m}</p>)}
                    <p>✓ Original section backup preserved</p>
                </div>
            )}

            <ul className="space-y-3">
                {report.items.map((item) => (
                    <li key={item.sectionId || item.type} className="bg-white/80 border border-amber-100 rounded-xl p-3">
                        <p className="text-xs font-bold text-zinc-800">{item.name}</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                            {item.type}{item.component ? ` · ${item.component}` : ''}
                        </p>
                        {item.suggestions.length === 0 ? (
                            <p className="text-[10px] text-amber-700 mt-2">
                                No safe remap suggestion — hide or replace manually.
                            </p>
                        ) : (
                            <div className="mt-2 space-y-2">
                                <label className="block text-[9px] font-black uppercase tracking-wide text-zinc-500">
                                    Suggested
                                </label>
                                <select
                                    className="w-full text-[11px] font-semibold border border-zinc-200 rounded-lg px-2 py-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060]"
                                    value={selected[item.sectionId] || item.suggestions[0].type}
                                    onChange={(e) => setSelected((prev) => ({ ...prev, [item.sectionId]: e.target.value }))}
                                    aria-label={`Suggested remap for ${item.name}`}
                                >
                                    {item.suggestions.map((s) => (
                                        <option key={s.type} value={s.type}>{s.label || s.type}</option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => handleApply(item)}
                                    className="px-3 py-1.5 text-[10px] font-bold rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060]"
                                >
                                    Review & Remap
                                </button>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}
