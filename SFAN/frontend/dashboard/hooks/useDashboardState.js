/**
 * Lightweight state manager mimicking React hooks for vanilla JS.
 */
const state = {
    activeModule: 'home',
    listeners: []
};

export const useDashboardState = () => {
    return {
        getState: () => ({ ...state }),
        setActiveModule: (moduleId) => {
            if (state.activeModule !== moduleId) {
                state.activeModule = moduleId;
                state.listeners.forEach(listener => listener(state));
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
