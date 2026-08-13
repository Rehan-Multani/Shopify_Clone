import React from 'react';
import SettingsField from './SettingsField';
import BlockStyleEditor from './BlockStyleEditor';
import {
    getSectionSchema,
    mergeSectionSettings,
    getVisibleFields,
} from '../../storefront/themeEngine/sectionSchemas';

/**
 * Optional block editors for sections that use nested blocks
 * (hero content blocks, feature cards, testimonials).
 * Schema still owns top-level settings.
 */
const BlockListEditor = ({
    section,
    blockType,
    label,
    onAddBlock,
    onUpdateBlock,
    onRemoveBlock,
    fields = [],
}) => {
    const blocks = section.blocks || [];
    const sectionId = section.sectionId || section._id;

    return (
        <div className="border-t border-zinc-200/60 pt-4 space-y-3">
            <div className="flex justify-between items-center">
                <label className="text-[10px] font-black text-zinc-400 uppercase">{label}</label>
                {onAddBlock && (
                    <button
                        type="button"
                        onClick={() => onAddBlock(sectionId, blockType)}
                        className="text-[8px] bg-[#008060] text-white px-2 py-0.5 rounded font-black uppercase cursor-pointer"
                    >
                        + Add
                    </button>
                )}
            </div>
            {blocks.length === 0 && (
                <p className="text-[10px] text-zinc-400 font-medium">No blocks yet.</p>
            )}
            {blocks.map((block, index) => (
                <div key={block.blockId || index} className="p-3 border border-zinc-200 rounded-xl space-y-2 bg-zinc-50/40">
                    <div className="flex justify-between items-center">
                        <span className="text-[9px] font-black uppercase text-zinc-400">
                            {block.type || blockType} #{index + 1}
                        </span>
                        {onRemoveBlock && (
                            <button
                                type="button"
                                onClick={() => onRemoveBlock(sectionId, block.blockId || index)}
                                className="text-[9px] font-bold text-red-500 cursor-pointer"
                            >
                                Remove
                            </button>
                        )}
                    </div>
                    {fields.map((f) => (
                        <div key={f.name}>
                            <label className="block text-[9px] font-bold text-zinc-500 uppercase mb-1">{f.label}</label>
                            {f.type === 'textarea' ? (
                                <textarea
                                    value={block.settings?.[f.name] || ''}
                                    onChange={(e) => onUpdateBlock(sectionId, block.blockId || index, f.name, e.target.value)}
                                    rows={2}
                                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-[11px] font-semibold focus:outline-none"
                                />
                            ) : (
                                <input
                                    type="text"
                                    value={block.settings?.[f.name] || ''}
                                    onChange={(e) => onUpdateBlock(sectionId, block.blockId || index, f.name, e.target.value)}
                                    className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg text-[11px] font-semibold focus:outline-none"
                                />
                            )}
                        </div>
                    ))}
                    {(block.type === 'heading' || block.type === 'subheading' || block.type === 'button') && (
                        <BlockStyleEditor
                            blockType={block.type}
                            styleSettings={block.settings?.style || {}}
                            onChangeStyle={(styleKey, styleVal) => {
                                onUpdateBlock(sectionId, block.blockId || index, 'style', {
                                    ...(block.settings?.style || {}),
                                    [styleKey]: styleVal,
                                });
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

const getBlockEditorConfig = (schemaKey) => {
    switch (schemaKey) {
        case 'hero':
            return {
                blockType: 'heading',
                label: 'Hero Content Blocks',
                fields: [
                    { name: 'text', label: 'Text', type: 'text' },
                    { name: 'label', label: 'Button Label', type: 'text' },
                    { name: 'link', label: 'Button Link', type: 'text' },
                ],
            };
        case 'features-grid':
            return {
                blockType: 'feature',
                label: 'Feature Cards',
                fields: [
                    { name: 'icon', label: 'Icon', type: 'text' },
                    { name: 'title', label: 'Title', type: 'text' },
                    { name: 'text', label: 'Description', type: 'textarea' },
                ],
            };
        case 'testimonials':
            return {
                blockType: 'testimonial',
                label: 'Testimonials',
                fields: [
                    { name: 'author', label: 'Author', type: 'text' },
                    { name: 'text', label: 'Quote', type: 'textarea' },
                ],
            };
        case 'faq':
        case 'accordion':
            return {
                blockType: 'item',
                label: 'FAQ Items',
                fields: [
                    { name: 'title', label: 'Question', type: 'text' },
                    { name: 'content', label: 'Answer', type: 'textarea' },
                ],
            };
        default:
            return null;
    }
};

/**
 * Schema-driven SettingsPanel.
 * Section settings come from sectionSchemas — no type === 'hero' form trees.
 */
export default function SettingsPanel({
    section = {},
    onChangeSettings,
    onAddBlock,
    onUpdateBlock,
    onRemoveBlock,
}) {
    const type = section.type;
    const component = section.component;

    if (!type && !component) {
        return (
            <div className="h-full flex items-center justify-center p-6 text-center text-zinc-500">
                <div>
                    <p className="text-xs font-black uppercase text-zinc-400 mt-2">No Section Selected</p>
                    <p className="text-[10px] text-zinc-500 font-semibold mt-1">
                        Click any section in the center canvas to customize its layout and settings.
                    </p>
                </div>
            </div>
        );
    }

    const schema = getSectionSchema(component || type);
    const resolvedSettings = mergeSectionSettings(schema, section.settings || {});
    const visibleFields = getVisibleFields(schema, resolvedSettings);
    const blockConfig = schema?.hasBlocks ? getBlockEditorConfig(schema.schemaKey || type) : getBlockEditorConfig(type);

    const handleSettingChange = (key, val) => {
        onChangeSettings(key, val);
    };

    return (
        <div className="flex flex-col h-full bg-white border-l border-zinc-200">
            <div className="p-4 border-b border-zinc-150">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">
                    {(schema?.label || type || 'Section').replace(/-/g, ' ')} settings
                </h3>
                <p className="text-[10px] text-zinc-500 font-semibold mt-1">
                    Schema-driven controls · updates preview live · save draft to persist
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 storefront-scrollbar">
                {!schema && (
                    <div className="text-zinc-500 text-xs py-4 text-center border border-dashed border-zinc-200 rounded-xl">
                        No schema registered for <strong>{component || type}</strong>.
                        Basic blocks may still be editable below.
                    </div>
                )}

                {visibleFields.map((field) => (
                    <SettingsField
                        key={field.name}
                        field={field}
                        value={resolvedSettings[field.name]}
                        onChange={(val) => handleSettingChange(field.name, val)}
                    />
                ))}

                {blockConfig && (
                    <BlockListEditor
                        section={section}
                        blockType={blockConfig.blockType}
                        label={blockConfig.label}
                        fields={blockConfig.fields}
                        onAddBlock={onAddBlock}
                        onUpdateBlock={onUpdateBlock}
                        onRemoveBlock={onRemoveBlock}
                    />
                )}

                {(type === 'heading' || type === 'paragraph' || type === 'button' || type === 'image') && (
                    <BlockStyleEditor
                        blockType={type}
                        styleSettings={resolvedSettings.style || {}}
                        onChangeStyle={(styleKey, styleVal) => {
                            handleSettingChange('style', {
                                ...(resolvedSettings.style || {}),
                                [styleKey]: styleVal,
                            });
                        }}
                    />
                )}
            </div>
        </div>
    );
}
