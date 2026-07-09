import { useDashboardState } from './hooks/useDashboardState.js';
import { Sidebar } from './layouts/SidebarBroker.js';
import { Topbar } from './layouts/Topbar.js';
import { Home } from './pages/Home.js';
import { ProfileSettingsHub } from './pages/ProfileSettingsHub.js';
import { InsuranceGoals } from './pages/InsuranceGoals.js';
import { InsuranceLocker } from './pages/InsuranceLocker.js';
import { InsuranceJourney } from './pages/InsuranceJourney.js';
import { AiAssistant } from './pages/AiAssistant.js';
import { ModulePlaceholder } from './pages/ModulePlaceholder.js';
import { DashboardService } from './services/dashboardApi.js';
import { ClaimAssessmentReportCenter } from './pages/ClaimAssessmentReportCenter.js';
import { HealthCoverageVerificationHub } from './pages/HealthCoverageVerificationHub.js?v=3';

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
        } else if (state.activeModule === 'ai-assistant') {
            dashboardRoot.innerHTML = AiAssistant(user);
        } else if (state.activeModule === 'claim-assessment') {
            dashboardRoot.innerHTML = ClaimAssessmentReportCenter();
            if (window.initClaimAssessmentReportCenter) window.initClaimAssessmentReportCenter();
        } else if (state.activeModule === 'health-coverage-verification') {
            dashboardRoot.innerHTML = HealthCoverageVerificationHub();
            if (window.initHealthCoverageVerificationHub) window.initHealthCoverageVerificationHub();
        } else {
            dashboardRoot.innerHTML = ModulePlaceholder({ moduleId: state.activeModule });
        }
    };

    // Subscribe to state changes
    subscribe(render);

    // Initial Render
    render();
});
