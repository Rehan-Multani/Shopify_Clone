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
                    className="cursor-grab active:cursor-grabbing text-zinc-400 hover:text-zinc-600 p-1 flex-shrink-0 flex items-center justify-center"
                    title="Drag to reorder"
                    {...attributes}
                    {...listeners}
                    onClick={e => e.stopPropagation()}
                >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.5 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-10 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-10 6a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm5 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/></svg>
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

            <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200" onClick={e => e.stopPropagation()}>
                <button
                    type="button"
                    onClick={() => onToggleVisibility(id)}
                    className={`p-1.5 rounded-lg hover:bg-zinc-200/80 transition-colors flex items-center justify-center ${!sec.enabled ? 'text-red-500 bg-red-50 hover:bg-red-100/50' : 'text-zinc-500 hover:text-zinc-800'}`}
                    title={sec.enabled ? 'Hide Section' : 'Show Section'}
                >
                    {sec.enabled ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12c1.391 4.178 5.328 7.178 9.963 7.178a10.422 10.422 0 0 0 5.485-1.554m1.986-1.986A10.485 10.485 0 0 0 22.066 12c-1.39-4.178-5.327-7.178-9.963-7.178a10.435 10.435 0 0 0-5.586 1.624M12 18.75a6.75 6.75 0 1 1 6.75-6.75A6.75 6.75 0 0 1 12 18.75Zm0-12a5.25 5.25 0 1 0 5.25 5.25A5.25 5.25 0 0 0 12 6.75Zm-6 5.25a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm12 0a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /></svg>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => onToggleLock(id)}
                    className={`p-1.5 rounded-lg hover:bg-zinc-200/80 transition-colors flex items-center justify-center ${sec.locked ? 'text-blue-600 bg-blue-50 hover:bg-blue-100/50' : 'text-zinc-500 hover:text-zinc-800'}`}
                    title={sec.locked ? 'Unlock Section' : 'Lock Section'}
                >
                    {sec.locked ? (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                    ) : (
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5V6.75a4.5 4.5 0 1 1 9 0v3.75M3.75 21.75h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H3.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" /></svg>
                    )}
                </button>
                <button
                    type="button"
                    onClick={() => onDuplicate(id)}
                    className="p-1.5 rounded-lg hover:bg-zinc-200/80 text-zinc-500 hover:text-zinc-850 transition-colors flex items-center justify-center"
                    title="Duplicate Section"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376A8.965 8.965 0 0 0 12 12.75c-.125 0-.25.004-.374.012m0 0a15.998 15.998 0 0 0-3.374-.388c-.621 0-1.125.504-1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V15.75c0-.621-.504-1.125-1.125-1.125Z" /></svg>
                </button>
                <button
                    type="button"
                    onClick={() => onRemove(id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-600 transition-colors flex items-center justify-center"
                    title="Delete Section"
                >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2"><path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.34 9m-4.78 0L9 9m12 6a12 12 0 0 1-12 12h-9.75M12 4.5v15m0 0a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25" /></svg>
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
                            items={sections.map((sec, idx) => sec.sectionId || sec._id || `sec-${idx}`)}
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
