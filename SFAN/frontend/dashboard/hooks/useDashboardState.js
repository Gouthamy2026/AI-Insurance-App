/**
 * Lightweight state manager mimicking React hooks for vanilla JS.
 */
console.log("[DEBUG] useDashboardState.js loaded! State initializing to 'home'. If you see this, the page just loaded or refreshed.");
const state = {
    activeModule: 'home',
    listeners: []
};

export const useDashboardState = () => {
    return {
        getState: () => ({ ...state }),
        setActiveModule: (moduleId) => {
            console.log(`[DEBUG] setActiveModule requested: ${moduleId}`);
            console.trace("[DEBUG] Trace for setActiveModule call");
            if (state.activeModule !== moduleId) {
                console.log(`[DEBUG] State changing from ${state.activeModule} to ${moduleId}`);
                state.activeModule = moduleId;
                state.listeners.forEach(listener => listener(state));
            } else {
                console.log(`[DEBUG] State is already ${moduleId}, ignoring.`);
            }
        },
        subscribe: (listener) => {
            state.listeners.push(listener);
            // Return unsubscribe function
            return () => {
                state.listeners = state.listeners.filter(l => l !== listener);
            };
        }
    };
};
