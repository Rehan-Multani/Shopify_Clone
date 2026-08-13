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
    onMoveUp,
    onMoveDown,
    isFirst,
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
    const label = (sec.name || sec.type || 'section').replace(/-/g, ' ');

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`flex items-center justify-between p-3 rounded-xl border select-none transition-all duration-200 group
                ${isDragging ? 'opacity-40 border-dashed border-[#008060] bg-emerald-50/10 scale-95 z-50 shadow-md' : ''}
                ${isSelected ? 'bg-emerald-50/20 border-[#008060] ring-1 ring-[#008060]/30' : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/60'}
            `}
        >
            <button
                type="button"
                onClick={() => onSelect(id)}
                className="flex items-center gap-2 min-w-0 flex-1 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060] rounded-lg"
                aria-current={isSelected ? 'true' : undefined}
            >
                <span
                    className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 p-1 flex-shrink-0 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060] rounded"
                    title="Drag to reorder"
                    aria-label={`Drag ${label} to reorder`}
                    {...attributes}
                    {...listeners}
                    onClick={(e) => e.stopPropagation()}
                >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-10 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-10 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
                </span>
                <span className="text-xs font-black text-zinc-800 capitalize truncate">{label}</span>
                {!sec.enabled && (
                    <span className="text-[8px] bg-red-50 border border-red-150 text-red-650 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex-shrink-0">
                        Hidden
                    </span>
                )}
                {sec.locked && (
                    <span className="text-[8px] bg-blue-50 border border-blue-150 text-blue-650 px-1.5 py-0.5 rounded font-black uppercase tracking-wider flex-shrink-0">
                        Locked
                    </span>
                )}
            </button>

            <div
                className="flex items-center gap-0.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <button type="button" onClick={() => onMoveUp(id)} disabled={isFirst}
                    className="p-1.5 rounded-lg hover:bg-zinc-200/80 text-zinc-500 disabled:opacity-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060]"
                    aria-label={`Move ${label} up`} title="Move Up">↑</button>
                <button type="button" onClick={() => onMoveDown(id)} disabled={isLast}
                    className="p-1.5 rounded-lg hover:bg-zinc-200/80 text-zinc-500 disabled:opacity-20 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060]"
                    aria-label={`Move ${label} down`} title="Move Down">↓</button>
                <button type="button" onClick={() => onToggleVisibility(id)}
                    className={`p-1.5 rounded-lg hover:bg-zinc-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060] ${!sec.enabled ? 'text-red-500' : 'text-zinc-500'}`}
                    aria-label={sec.enabled ? `Hide ${label}` : `Show ${label}`}
                    title={sec.enabled ? 'Hide Section' : 'Show Section'}>
                    {sec.enabled ? '👁' : '🚫'}
                </button>
                <button type="button" onClick={() => onDuplicate(id)}
                    className="p-1.5 rounded-lg hover:bg-zinc-200/80 text-zinc-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060]"
                    aria-label={`Duplicate ${label}`} title="Duplicate">⧉</button>
                <button type="button" onClick={() => onToggleLock(id)}
                    className={`p-1.5 rounded-lg hover:bg-zinc-200/80 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#008060] ${sec.locked ? 'text-blue-600' : 'text-zinc-500'}`}
                    aria-label={sec.locked ? `Unlock ${label}` : `Lock ${label}`}
                    title={sec.locked ? 'Unlock' : 'Lock'}>
                    {sec.locked ? '🔒' : '🔓'}
                </button>
                <button type="button" onClick={() => onRemove(id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    aria-label={`Delete ${label}`} title="Delete">✕</button>
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
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = sections.findIndex((sec) => (sec.sectionId || sec._id) === active.id);
        const newIndex = sections.findIndex((sec) => (sec.sectionId || sec._id) === over.id);
        if (oldIndex !== -1 && newIndex !== -1) {
            onReorder(arrayMove([...sections], oldIndex, newIndex));
        }
    };

    const moveBy = (id, dir) => {
        const oldIndex = sections.findIndex((sec, idx) => (sec.sectionId || sec._id || `sec-${idx}`) === id);
        if (oldIndex < 0) return;
        const newIndex = oldIndex + dir;
        if (newIndex < 0 || newIndex >= sections.length) return;
        onReorder(arrayMove([...sections], oldIndex, newIndex));
    };

    return (
        <div className="flex flex-col h-full bg-white border-r border-zinc-200" role="navigation" aria-label="Page sections">
            <div className="p-4 border-b border-zinc-150">
                <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest">Section Tree</h3>
                <p className="text-[10px] text-zinc-500 font-semibold mt-1">
                    Drag or use ↑ ↓ buttons to reorder
                </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 storefront-scrollbar">
                {sections.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-zinc-200 rounded-2xl p-4">
                        <p className="text-[11px] font-black text-zinc-400 uppercase mt-2">No Sections Yet</p>
                    </div>
                ) : (
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext
                            items={sections.map((sec, idx) => sec.sectionId || sec._id || `sec-${idx}`)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2" role="list">
                                {sections.map((sec, idx) => (
                                    <div key={sec.sectionId || sec._id || idx} role="listitem">
                                        <SortableTreeItem
                                            sec={sec}
                                            idx={idx}
                                            selectedId={selectedId}
                                            onSelect={onSelect}
                                            onRemove={onRemove}
                                            onDuplicate={onDuplicate}
                                            onToggleVisibility={onToggleVisibility}
                                            onToggleLock={onToggleLock}
                                            onMoveUp={(id) => moveBy(id, -1)}
                                            onMoveDown={(id) => moveBy(id, 1)}
                                            isFirst={idx === 0}
                                            isLast={idx === sections.length - 1}
                                        />
                                    </div>
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </div>
        </div>
    );
}
