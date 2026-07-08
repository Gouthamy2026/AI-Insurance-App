export const Sidebar = (activeModule, setActiveModule) => {

    // Function to handle clicks and update state
    window.handleNavClick = (moduleId) => {
        if (moduleId === 'logout') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = 'index.html';
            return;
        }
        setActiveModule(moduleId);
    };

    const navSections = [
        {
            title: "INSURANCE MODULES",
            items: [
                { id: 'home', label: 'Dashboard Home', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>' },

                { id: 'care-eligibility-engine', label: 'Care Eligibility Engine', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>' },
                { id: 'ai-asset-coverage', label: 'AI Asset Coverage Advisor', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>' },
                { id: 'irdai-compliance-engine', label: 'IRDAI Compliance Compass', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polygon></svg>' }
            ]
        },
        {
            title: "CLIENT MANAGEMENT",
            items: [
                { id: 'client-portfolios', label: 'Client Portfolios', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>' },
                { id: 'insurance-locker', label: 'My Insurance Locker', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>' },
                { id: 'insurance-journey', label: 'Insurance Journey', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>' }
            ]
        },
        {
            title: "ACCOUNT",
            items: [
                { id: 'profile', label: 'My Profile', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>' },
                { id: 'notifications', label: 'Notifications', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>' },
                { id: 'settings', label: 'Settings', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>' },
                { id: 'logout', label: 'Logout', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>' }
            ]
        }
    ];

    const listHtml = navSections.map(section => `
        <li class="nav-header" style="font-size: 11px; font-weight: 800; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px; margin-top: 24px; margin-bottom: 8px; padding-left: 15px; pointer-events: none;">
            ${section.title}
        </li>
        ${section.items.map(item => `
            <li 
                onclick="handleNavClick('${item.id}')"
                class="${activeModule === item.id ? 'active' : ''}"
                style="display: flex; align-items: center; gap: 12px; padding: 12px 15px; margin-bottom: 4px; border-radius: 8px; cursor: pointer; transition: all 0.2s;"
            >
                ${item.icon} <span style="font-size: 14px; font-weight: 500;">${item.label}</span>
            </li>
        `).join('')}
    `).join('');

    return `
        <div class="sidebar" style="transition: width 0.3s;">
            <div class="logo-small" style="display:flex; align-items:center; padding: 10px 5px; margin-bottom: 25px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 25px;">
                <div style="position: relative; margin-right: 15px;">
                    <img src="assets/sfan_logo.png" alt="SFAN Logo" style="width: 60px; height: 60px; border-radius: 14px; object-fit: cover; box-shadow: 0 8px 16px rgba(255, 138, 101, 0.25);">
                </div>
                <div style="display: flex; flex-direction: column;">
                    <h2 style="font-size: 2.2rem; font-weight: 900; color: var(--text-main); margin: 0; letter-spacing: -0.5px; line-height: 1;">SFAN</h2>
                    <span style="font-size: 0.75rem; color: var(--primary); font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-top: 2px;">Insurance Intelligence</span>
                </div>
            </div>
            <nav style="height: calc(100vh - 150px); overflow-y: auto;">
                <ul id="nav-menu" style="list-style: none; padding: 0; margin: 0;">
                    ${listHtml}
                </ul>
            </nav>
        </div>
    `;
};
