import { Sidebar } from './layouts/SidebarBroker.js';
import { Topbar } from './layouts/Topbar.js';
import { ClaimAssessmentReportCenter } from './pages/ClaimAssessmentReportCenter.js';

document.addEventListener('DOMContentLoaded', () => {
    // Auth Check
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token || !userStr) {
        window.location.href = 'index.html';
        return;
    }

    const user = JSON.parse(userStr);

    // DOM Elements
    const sidebarRoot = document.getElementById('sidebar-root');
    const topbarRoot = document.getElementById('topbar-root');
    const dashboardRoot = document.getElementById('dashboard-root');

    // Override handleNavClick to redirect back to dashboard
    window.handleNavClick = (moduleId) => {
        if (moduleId === 'logout') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            return;
        }
        // For other modules, redirect to the main broker dashboard
        const role = user.role || 'broker';
        window.location.href = `dashboard_${role}.html?module=${moduleId}`;
    };

    const render = () => {
        // Set active module to something unique so nothing is highlighted in sidebar by default
        // We'll use 'claim-assessment'
        sidebarRoot.innerHTML = Sidebar('claim-assessment', () => {});
        topbarRoot.innerHTML = Topbar(user);
        
        dashboardRoot.innerHTML = ClaimAssessmentReportCenter();
        
        // Attach event listeners for the page
        if (window.initClaimAssessmentReportCenter) {
            window.initClaimAssessmentReportCenter();
        }
    };

    render();
});
