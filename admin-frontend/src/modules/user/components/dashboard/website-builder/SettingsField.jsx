import React, { useState } from 'react';
import { normalizeFieldOptions } from '../../storefront/themeEngine/sectionSchemas';
import MediaPicker, { ProductPicker, CategoryPicker } from './MediaPicker';

const GATEWAY_URL = import.meta.env.VITE_API_BASE_URL;
const ASSETS_BASE_URL = GATEWAY_URL?.replace(/\/api\/?$/, '') || 'http://localhost:5000';

const inputClass =
    'w-full px-3 py-2 border border-zinc-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060] bg-white';

const isProbablySafeUrl = (value) => {
    if (!value) return true;
    const str = String(value).trim();
    if (!str) return true;
    return /^(https?:\/\/|\/|#|mailto:|tel:)/i.test(str);
};

export const ColorPickerField = ({ value, onChange }) => (
    <div className="flex gap-2 items-center">
        <input
            type="color"
            value={value || '#000000'}
            onChange={(e) => onChange(e.target.value)}
            className="w-8 h-8 rounded border border-zinc-200 p-0 cursor-pointer"
        />
        <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#ffffff"
            maxLength={7}
            className="w-20 px-2 py-1.5 border border-zinc-200 rounded-lg text-[10px] font-bold uppercase focus:outline-none focus:ring-1 focus:ring-[#008060] bg-white shadow-sm"
        />
    </div>
);

export const ImageUploadField = ({ value, onChange, label = 'Select Image' }) => {
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const formData = new FormData();
            formData.append('image', file);
            const res = await fetch(`${GATEWAY_URL}/banners/upload`, {
                method: 'POST',
                body: formData,
            });
            const data = await res.json();
            if (res.ok && data.url) {
                onChange(data.url);
            } else {
                setError(data.message || 'Upload failed');
            }
        } catch (err) {
            console.error('Error uploading image:', err);
            setError('Connection error. Failed to upload.');
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const imageUrl = value
        ? (value.startsWith('http') || value.startsWith('data:') ? value : `${ASSETS_BASE_URL}${value.startsWith('/') ? value : `/${value}`}`)
        : null;

    return (
        <div className="space-y-2 border border-zinc-200 p-3 rounded-xl bg-zinc-50/50">
            {imageUrl && (
                <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-200 bg-white">
                    <img src={imageUrl} alt="Uploaded preview" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange('')}
                        className="absolute top-1.5 right-1.5 p-1.5 bg-red-500 hover:bg-red-600 text-white rounded-full text-[10px] w-5 h-5 flex items-center justify-center font-bold"
                        title="Remove Image"
                    >
                        ✕
                    </button>
                </div>
            )}
            <div className="flex items-center gap-3">
                <label className="flex-1 flex flex-col items-center justify-center px-4 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-xl cursor-pointer transition-all">
                    <span className="text-[10px] font-bold text-zinc-650 tracking-wide text-center">
                        {uploading ? 'Uploading...' : (imageUrl ? 'Replace Image' : label)}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
                <input
                    type="text"
                    value={value || ''}
                    placeholder="Or paste image URL"
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-[1.5] w-full px-2.5 py-2 border border-zinc-200 rounded-xl text-[10px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#008060] bg-white shadow-sm"
                />
            </div>
            {error && <p className="text-[9px] font-bold text-red-500 mt-1">{error}</p>}
        </div>
    );
};

const AlignmentField = ({ value, onChange, options = [] }) => {
    const opts = options.length
        ? options
        : [
            { value: 'left', label: 'Left' },
            { value: 'center', label: 'Center' },
            { value: 'right', label: 'Right' },
        ];
    return (
        <div className="flex gap-1.5">
            {opts.map((optItem) => {
                const val = optItem.value ?? optItem;
                const label = optItem.label ?? optItem;
                const active = value === val;
                return (
                    <button
                        key={val}
                        type="button"
                        onClick={() => onChange(val)}
                        className={`flex-1 px-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-wide border transition-all cursor-pointer ${
                            active
                                ? 'bg-[#008060] text-white border-[#008060]'
                                : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-300'
                        }`}
                    >
                        {label}
                    </button>
                );
            })}
        </div>
    );
};

const ResponsiveNumberField = ({ value, onChange, field }) => {
    const [vp, setVp] = useState('desktop');
    const defaults = field.defaultValue || { desktop: 4, tablet: 3, mobile: 2 };
    const current = (value && typeof value === 'object')
        ? { ...defaults, ...value }
        : {
            desktop: typeof value === 'number' ? value : defaults.desktop,
            tablet: defaults.tablet,
            mobile: defaults.mobile,
        };

    const setVpValue = (next) => {
        onChange({ ...current, [vp]: next === '' ? '' : Number(next) });
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-1" role="tablist" aria-label="Viewport">
                {['desktop', 'tablet', 'mobile'].map((k) => (
                    <button
                        key={k}
                        type="button"
                        role="tab"
                        aria-selected={vp === k}
                        onClick={() => setVp(k)}
                        className={`flex-1 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wide border cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060] ${
                            vp === k ? 'bg-[#008060] text-white border-[#008060]' : 'bg-white text-zinc-500 border-zinc-200'
                        }`}
                    >
                        {k}
                    </button>
                ))}
            </div>
            <label className="sr-only" htmlFor={`resp-${field.name}-${vp}`}>{field.label} {vp}</label>
            <input
                id={`resp-${field.name}-${vp}`}
                type="number"
                value={current[vp] ?? ''}
                min={field.min}
                max={field.max}
                step={field.step ?? 1}
                onChange={(e) => setVpValue(e.target.value)}
                className={inputClass}
                aria-label={`${field.label || field.name} (${vp})`}
            />
        </div>
    );
};

/**
 * Generic schema field renderer — driven by field.type only.
 */
const SettingsField = ({ field, value, onChange }) => {
    const options = normalizeFieldOptions(field);
    const type = field.type || 'text';

    let control = null;

    switch (type) {
        case 'textarea':
        case 'richText':
            control = (
                <textarea
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    rows={type === 'richText' ? 5 : 3}
                    placeholder={field.placeholder || ''}
                    className={inputClass}
                />
            );
            break;
        case 'number':
            control = (
                <input
                    type="number"
                    value={value ?? ''}
                    min={field.min}
                    max={field.max}
                    step={field.step ?? 1}
                    onChange={(e) => {
                        const raw = e.target.value;
                        onChange(raw === '' ? '' : Number(raw));
                    }}
                    className={inputClass}
                />
            );
            break;
        case 'responsiveNumber':
        case 'responsiveSpacing':
        case 'responsivePadding':
        case 'responsiveFontSize':
        case 'responsiveGap':
            control = <ResponsiveNumberField value={value} onChange={onChange} field={field} />;
            break;
        case 'boolean':
            control = (
                <label className="inline-flex items-center gap-2 cursor-pointer select-none">
                    <input
                        type="checkbox"
                        checked={!!value}
                        onChange={(e) => onChange(e.target.checked)}
                        className="rounded border-zinc-300 text-[#008060] focus:ring-[#008060]"
                    />
                    <span className="text-[11px] font-semibold text-zinc-700">
                        {value ? 'Enabled' : 'Disabled'}
                    </span>
                </label>
            );
            break;
        case 'select':
            control = (
                <select
                    value={value ?? field.defaultValue ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    className={inputClass}
                >
                    {options.map((optItem) => (
                        <option key={optItem.value} value={optItem.value}>
                            {optItem.label}
                        </option>
                    ))}
                </select>
            );
            break;
        case 'color':
            control = <ColorPickerField value={value || field.defaultValue || '#000000'} onChange={onChange} />;
            break;
        case 'image':
            control = <MediaPicker value={value || ''} onChange={onChange} label={field.label || 'Select Image'} />;
            break;
        case 'url':
            control = (
                <div className="space-y-1">
                    <input
                        type="text"
                        value={value ?? ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder={field.placeholder || 'https://… or /catalog'}
                        className={inputClass}
                    />
                    {value && !isProbablySafeUrl(value) && (
                        <p className="text-[9px] font-bold text-amber-600">
                            Prefer https://, relative paths, or # links. Backend will sanitize on save.
                        </p>
                    )}
                </div>
            );
            break;
        case 'alignment':
            control = <AlignmentField value={value || field.defaultValue || 'center'} onChange={onChange} options={options} />;
            break;
        case 'category':
        case 'categories':
            control = <CategoryPicker value={value || ''} onChange={onChange} />;
            break;
        case 'product':
            control = <ProductPicker value={value || ''} onChange={onChange} multiple={false} />;
            break;
        case 'products':
            control = <ProductPicker value={value || ''} onChange={onChange} multiple />;
            break;
        case 'spacing':
            control = (
                <input
                    type="text"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="e.g. 24px or roomy"
                    className={inputClass}
                />
            );
            break;
        case 'text':
        default:
            control = (
                <input
                    type="text"
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={field.placeholder || ''}
                    className={inputClass}
                />
            );
            break;
    }

    return (
        <div className="space-y-1.5">
            {field.label && type !== 'boolean' && (
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                    {field.label}
                </label>
            )}
            {type === 'boolean' && field.label && (
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">
                    {field.label}
                </label>
            )}
            {control}
            {field.helpText && (
                <p className="text-[9px] text-zinc-400 font-medium">{field.helpText}</p>
            )}
        </div>
    );
};

export default SettingsField;
