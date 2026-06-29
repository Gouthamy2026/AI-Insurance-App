/**
 * Dashboard specific API calls
 * Extends the global ApiClient if needed, or serves as a wrapper.
 */

export const DashboardService = {
    async fetchDashboardStats() {
        try {
            return await ApiClient.request('/dashboard/stats');
        } catch (error) {
            console.error("Failed to fetch stats", error);
            return null;
        }
    }
};
