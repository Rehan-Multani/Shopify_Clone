import { useState, useCallback, useRef } from 'react';

/**
 * Builder undo/redo with coalesced pushes for rapid setting edits.
 * Structural actions (add/remove/reorder) should call pushStateImmediate.
 */
export default function useBuilderHistory(initialState) {
    const [historyState, setHistoryState] = useState({
        entries: [initialState],
        pointer: 0
    });

    const stateRef = useRef(historyState);
    stateRef.current = historyState;

    const debounceTimer = useRef(null);
    const pendingEntry = useRef(null);

    const commitEntry = useCallback((nextEntry) => {
        setHistoryState((prev) => {
            const newEntries = prev.entries.slice(0, prev.pointer + 1);

            // Coalesce: if last entry exists and was a soft edit within window, replace it
            if (newEntries.length > 0) {
                // Always append for now when committing; coalescing handled by debounce overwrite
            }

            if (newEntries.length >= 50) {
                newEntries.shift();
                return {
                    entries: [...newEntries, nextEntry],
                    pointer: newEntries.length,
                };
            }

            return {
                entries: [...newEntries, nextEntry],
                pointer: newEntries.length,
            };
        });
    }, []);

    const flushPending = useCallback(() => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }
        if (pendingEntry.current) {
            const entry = pendingEntry.current;
            pendingEntry.current = null;
            commitEntry(entry);
        }
    }, [commitEntry]);

    const makeEntry = (sections, themeSettings) => ({
        sections: sections ? JSON.parse(JSON.stringify(sections)) : [],
        themeSettings: themeSettings ? JSON.parse(JSON.stringify(themeSettings)) : {},
    });

    /**
     * Debounced push — coalesces rapid setting changes into one undo step.
     */
    const pushState = useCallback((sections, themeSettings, options = {}) => {
        try {
            const nextEntry = makeEntry(sections, themeSettings);
            const immediate = options.immediate === true;

            if (immediate) {
                flushPending();
                commitEntry(nextEntry);
                return;
            }

            // Replace pending soft edit; commit after quiet period
            pendingEntry.current = nextEntry;
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                debounceTimer.current = null;
                if (pendingEntry.current) {
                    const entry = pendingEntry.current;
                    pendingEntry.current = null;

                    setHistoryState((prev) => {
                        const newEntries = prev.entries.slice(0, prev.pointer + 1);
                        // Replace last entry if it was also a soft edit (same pointer path)
                        // Prefer appending once per debounce window after last hard state
                        if (newEntries.length >= 50) {
                            newEntries.shift();
                        }
                        // If we already appended a soft entry in this typing burst, replace tip
                        const tip = newEntries[newEntries.length - 1];
                        const shouldReplaceTip = tip && tip.__soft === true;
                        const softEntry = { ...entry, __soft: true };
                        if (shouldReplaceTip) {
                            const replaced = [...newEntries.slice(0, -1), softEntry];
                            return { entries: replaced, pointer: replaced.length - 1 };
                        }
                        return {
                            entries: [...newEntries, softEntry],
                            pointer: newEntries.length,
                        };
                    });
                }
            }, 450);
        } catch (err) {
            console.error('Error pushing history state:', err);
        }
    }, [commitEntry, flushPending]);

    const pushStateImmediate = useCallback((sections, themeSettings) => {
        pushState(sections, themeSettings, { immediate: true });
    }, [pushState]);

    const undo = useCallback(() => {
        flushPending();
        const current = stateRef.current;
        if (current.pointer > 0) {
            const prevPointer = current.pointer - 1;
            setHistoryState((prev) => ({
                ...prev,
                pointer: prevPointer,
            }));
            return current.entries[prevPointer];
        }
        return null;
    }, [flushPending]);

    const redo = useCallback(() => {
        flushPending();
        const current = stateRef.current;
        if (current.pointer < current.entries.length - 1) {
            const nextPointer = current.pointer + 1;
            setHistoryState((prev) => ({
                ...prev,
                pointer: nextPointer,
            }));
            return current.entries[nextPointer];
        }
        return null;
    }, [flushPending]);

    const resetHistory = useCallback((newState) => {
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = null;
        }
        pendingEntry.current = null;
        setHistoryState({
            entries: [newState],
            pointer: 0,
        });
    }, []);

    const canUndo = historyState.pointer > 0;
    const canRedo = historyState.pointer < historyState.entries.length - 1;

    return {
        state: historyState.entries[historyState.pointer] || initialState,
        pushState,
        pushStateImmediate,
        undo,
        redo,
        resetHistory,
        canUndo,
        canRedo,
        flushPending,
    };
}
