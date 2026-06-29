import { useState, useCallback } from 'react';

export default function useBuilderHistory(initialState) {
    const [history, setHistory] = useState([initialState]);
    const [pointer, setPointer] = useState(0);

    const pushState = useCallback((sections, themeSettings) => {
        const nextState = {
            sections: JSON.parse(JSON.stringify(sections)),
            themeSettings: JSON.parse(JSON.stringify(themeSettings))
        };
        
        // Remove everything after current pointer if we are in the middle of undo/redo history
        const newHistory = history.slice(0, pointer + 1);
        
        // Limit history size to 50 entries
        if (newHistory.length >= 50) {
            newHistory.shift();
            setPointer(prev => Math.max(0, prev - 1));
        }

        setHistory([...newHistory, nextState]);
        setPointer(newHistory.length);
    }, [history, pointer]);

    const undo = useCallback(() => {
        if (pointer > 0) {
            const prevPointer = pointer - 1;
            setPointer(prevPointer);
            return history[prevPointer];
        }
        return null;
    }, [history, pointer]);

    const redo = useCallback(() => {
        if (pointer < history.length - 1) {
            const nextPointer = pointer + 1;
            setPointer(nextPointer);
            return history[nextPointer];
        }
        return null;
    }, [history, pointer]);

    const resetHistory = useCallback((newState) => {
        setHistory([newState]);
        setPointer(0);
    }, []);

    const canUndo = pointer > 0;
    const canRedo = pointer < history.length - 1;

    return {
        state: history[pointer] || initialState,
        pushState,
        undo,
        redo,
        resetHistory,
        canUndo,
        canRedo
    };
}
