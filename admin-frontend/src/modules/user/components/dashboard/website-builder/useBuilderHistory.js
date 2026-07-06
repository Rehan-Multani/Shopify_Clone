import { useState, useCallback, useRef } from 'react';

export default function useBuilderHistory(initialState) {
    const [historyState, setHistoryState] = useState({
        entries: [initialState],
        pointer: 0
    });

    // Use ref to always have latest state available in callbacks
    const stateRef = useRef(historyState);
    stateRef.current = historyState;

    const pushState = useCallback((sections, themeSettings) => {
        try {
            const nextEntry = {
                sections: sections ? JSON.parse(JSON.stringify(sections)) : [],
                themeSettings: themeSettings ? JSON.parse(JSON.stringify(themeSettings)) : {}
            };
            
            setHistoryState(prev => {
                const newEntries = prev.entries.slice(0, prev.pointer + 1);
                
                // Limit history size to 50
                if (newEntries.length >= 50) {
                    newEntries.shift();
                    return {
                        entries: [...newEntries, nextEntry],
                        pointer: newEntries.length
                    };
                }

                return {
                    entries: [...newEntries, nextEntry],
                    pointer: newEntries.length
                };
            });
        } catch (err) {
            console.error('Error pushing history state:', err);
        }
    }, []);

    const undo = useCallback(() => {
        const current = stateRef.current;
        if (current.pointer > 0) {
            const prevPointer = current.pointer - 1;
            setHistoryState(prev => ({
                ...prev,
                pointer: prevPointer
            }));
            return current.entries[prevPointer];
        }
        return null;
    }, []);

    const redo = useCallback(() => {
        const current = stateRef.current;
        if (current.pointer < current.entries.length - 1) {
            const nextPointer = current.pointer + 1;
            setHistoryState(prev => ({
                ...prev,
                pointer: nextPointer
            }));
            return current.entries[nextPointer];
        }
        return null;
    }, []);

    const resetHistory = useCallback((newState) => {
        setHistoryState({
            entries: [newState],
            pointer: 0
        });
    }, []);

    const canUndo = historyState.pointer > 0;
    const canRedo = historyState.pointer < historyState.entries.length - 1;

    return {
        state: historyState.entries[historyState.pointer] || initialState,
        pushState,
        undo,
        redo,
        resetHistory,
        canUndo,
        canRedo
    };
}
