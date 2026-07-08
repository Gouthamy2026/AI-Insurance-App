import { useDashboardState } from './hooks/useDashboardState.js?v=2';
import { Sidebar } from './layouts/SidebarPolicyholder.js?v=2';
import { Topbar } from './layouts/Topbar.js?v=2';
import { Home } from './pages/Home.js?v=8';
import { ProfileSettingsHub } from './pages/ProfileSettingsHub.js';
import { InsuranceGoals } from './pages/InsuranceGoals.js?v=6';
import { InsuranceLocker } from './pages/InsuranceLocker.js?v=3';
import { InsuranceJourney } from './pages/InsuranceJourney.js?v=2';

import { CareEligibilityEngine } from './pages/CareEligibilityEngine.js?v=1';
import { AiAssetCoverageAdvisor } from './pages/AiAssetCoverageAdvisor.js';
import { AiAssistant } from './pages/AiAssistant.js?v=3';
import { IrdaiComplianceEngine } from './pages/IrdaiComplianceEngine.js';
import { ModulePlaceholder } from './pages/ModulePlaceholder.js?v=2';
import { DashboardService } from './services/dashboardApi.js';

document.addEventListener('DOMContentLoaded', () => {

    // Auth Check
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userStr);

    // Initialize State
    const { getState, setActiveModule, subscribe } = useDashboardState();

    // DOM Elements
    const sidebarRoot = document.getElementById('sidebar-root');
    const topbarRoot = document.getElementById('topbar-root');
    const dashboardRoot = document.getElementById('dashboard-root');

    // Render Function
    const render = async () => {
        const state = getState();

        // 1. Render Layouts
        sidebarRoot.innerHTML = Sidebar(state.activeModule, setActiveModule);
        topbarRoot.innerHTML = Topbar(user);

        // 2. Render Page Content
        if (state.activeModule === 'home') {
            dashboardRoot.innerHTML = '<div style="padding: 40px; color: #6B7280; font-weight: 500;">Loading dashboard data...</div>';
            const stats = await DashboardService.fetchDashboardStats();
            // Prevent race condition: ensure user hasn't navigated away during fetch
            if (getState().activeModule === 'home') {
                dashboardRoot.innerHTML = Home(user, stats);
            }
        } else if (state.activeModule === 'profile-hub') {
            dashboardRoot.innerHTML = ProfileSettingsHub(user);
        } else if (state.activeModule === 'insurance-goals') {
            dashboardRoot.innerHTML = InsuranceGoals();
        } else if (state.activeModule === 'insurance-locker') {
            dashboardRoot.innerHTML = InsuranceLocker();
        } else if (state.activeModule === 'insurance-journey') {
            dashboardRoot.innerHTML = InsuranceJourney();
        } else if (state.activeModule === 'claim-outcome') {

        } else if (state.activeModule === 'care-eligibility-engine') {
            dashboardRoot.innerHTML = CareEligibilityEngine();
        } else if (state.activeModule === 'ai-asset-coverage') {
            dashboardRoot.innerHTML = AiAssetCoverageAdvisor();
        } else if (state.activeModule === 'irdai-compliance-engine') {
            dashboardRoot.innerHTML = IrdaiComplianceEngine();
        } else if (state.activeModule === 'ai-assistant') {
            dashboardRoot.innerHTML = AiAssistant(user);
        } else {
            dashboardRoot.innerHTML = ModulePlaceholder({ moduleId: state.activeModule });
        }
    };

    // Subscribe to state changes
    subscribe(render);

    // Initial Render
    render();
});
