

export const AccountHubService = {
    async getProfile() {
        return await ApiClient.request('/account-hub/profile');
    },
    async updateProfile(data) {
        return await ApiClient.request('/account-hub/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    async getPolicies() {
        return await ApiClient.request('/account-hub/policies');
    },
    async getNotifications() {
        return await ApiClient.request('/account-hub/notifications');
    },
    async markNotificationRead(id) {
        return await ApiClient.request(`/account-hub/notifications/${id}/read`, {
            method: 'PUT'
        });
    },
    async markAllNotificationsRead() {
        return await ApiClient.request('/account-hub/notifications/read-all', {
            method: 'PUT'
        });
    },
    async deleteNotification(id) {
        return await ApiClient.request(`/account-hub/notifications/${id}`, {
            method: 'DELETE'
        });
    },
    async getActivity() {
        return await ApiClient.request('/account-hub/activity');
    },
    async logActivity(description) {
        return await ApiClient.request('/account-hub/activity', {
            method: 'POST',
            body: JSON.stringify({ description })
        });
    },
    async getPreferences() {
        return await ApiClient.request('/account-hub/preferences');
    },
    async updatePreferences(data) {
        return await ApiClient.request('/account-hub/preferences', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    async getSecurity() {
        return await ApiClient.request('/account-hub/security');
    }
};
