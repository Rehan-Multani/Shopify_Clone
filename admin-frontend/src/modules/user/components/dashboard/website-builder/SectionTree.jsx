import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const SortableTreeItem = ({
    sec,
    idx,
    selectedId,
    onSelect,
    onRemove,
    onDuplicate,
    onToggleVisibility,
    onToggleLock,
    isLast
}) => {
    const id = sec.sectionId || sec._id || `sec-${idx}`;
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    const isSelected = selectedId === id;

    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={() => onSelect(id)}
            className={`flex items-center justify-between p-3 rounded-xl border select-none transition-all duration-200 group cursor-pointer
                ${isDragging ? 'opacity-40 border-dashed border-[#008060] bg-emerald-50/10 scale-95 z-50 shadow-md' : ''}
                ${isSelected ? 'bg-emerald-50/20 border-[#008060] ring-1 ring-[#008060]/30' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/60'}
            `}
        >
            <div className="flex items-center gap-2 min-w-0">
                <span
                    className="text-[12px] text-zinc-400 cursor-grab active:cursor-grabbing hover:text-zinc-600 px-1 py-1 flex-shrink-0"
                    title="Drag to reorder"
                    {...attributes}
                    {...listeners}
                    onClick={e => e.stopPropagation()}
                >
                    ☰
                </span>
                <span className="text-xs font-black text-zinc-800 capitalize truncate">
                    {sec.type.replace('-', ' ')}
                </span>
                {!sec.enabled && (
                    <span className="text-[8px] bg-red-50 border border-red-150 text-red-650 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex-shrink-0">
                        Hidden
                    </span>
                )}
                {sec.locked && (
                    <span className="text-[8px] bg-blue-50 border border-blue-150 text-blue-650 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex-shrink-0">
                        🔒 Locked
                    </span>
                )}
            </div>

            <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()}>
                <button
                    type="button"
                    onClick={() => onToggleVisibility(id)}
                    className={`p-1 rounded hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 ${!sec.enabled ? 'text-red-500' : ''}`}
                    title={sec.enabled ? 'Hide Section' : 'Show Section'}
                >
                    {sec.enabled ? '👁️' : '👁️‍🗨️'}
                </button>
                <button
                    type="button"
                    onClick={() => onToggleLock(id)}
                    className={`p-1 rounded hover:bg-zinc-200 text-zinc-500 hover:text-zinc-800 ${sec.locked ? 'text-blue-500' : ''}`}
                    title={sec.locked ? 'Unlock Section' : 'Lock Section'}
                >
                    {sec.locked ? '🔑' : '🔒'}
                </button>
                <button
                    type="button"
                    onClick={() => onDuplicate(id)}
                    className="p-1 rounded hover:bg-zinc-200 text-zinc-500 hover:text-zinc-850"
                    title="Duplicate Section"
                >
                    📋
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(id)}
                    className="p-1 rounded hover:bg-red-50 text-zinc-400 hover:text-red-600"
                    title="Delete Section"
                >
                    🗑️
                </button>
            </div>
        </div>
    );
};

export default function SectionTree({
    sections,
    selectedId,
    onSelect,
    onReorder,
    onRemove,
    onDuplicate,
    onToggleVisibility,
    onToggleLock
}) {
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over) return;

        if (active.id !== over.id) {
            const oldIndex = sections.findIndex(sec => (sec.sectionId || sec._id) === active.id);
            const newIndex = sections.findIndex(sec => (sec.sectionId || sec._id) === over.id);
            if (oldIndex !== -1 && newIndex !== -1) {
                const reordered = arrayMove([...sections], oldIndex, newIndex);
                onReorder(reordered);
            }
        }
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-zinc-200">
            <div className="p-4 border-b border-zinc-150">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Section Tree</h3>
                <p className="text-[10px] text-zinc-500 font-semibold mt-1">Rearrange and manage content blocks on the page</p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 storefront-scrollbar">
                {sections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl p-4">
                        <span className="text-2xl">🧩</span>
                        <p className="text-[11px] font-black text-zinc-400 uppercase mt-2">No Sections Yet</p>
                        <p className="text-[9px] font-semibold text-zinc-500 mt-1 max-w-[180px] mx-auto leading-relaxed">
                            Click or drag items from the Element palette to start building
                        </p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={sections.map(sec => sec.sectionId || sec._id || '')}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2">
                                {sections.map((sec, idx) => (
                                    <SortableTreeItem
                                        key={sec.sectionId || sec._id || idx}
                                        sec={sec}
                                        idx={idx}
                                        selectedId={selectedId}
                                        onSelect={onSelect}
                                        onRemove={onRemove}
                                        onDuplicate={onDuplicate}
                                        onToggleVisibility={onToggleVisibility}
                                        onToggleLock={onToggleLock}
                                        isLast={idx === sections.length - 1}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
