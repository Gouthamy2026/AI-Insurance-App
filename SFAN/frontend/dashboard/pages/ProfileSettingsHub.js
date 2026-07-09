import { AccountHubService } from '../services/accountHubApi.js';

function formatRelativeDate(dateString) {
    if (!dateString) return 'Just now';
    const date = new Date(dateString);
    const now = new Date();
    
    // Normalize to midnight for days difference
    const dateDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const nowDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffDays = Math.round((nowDay - dateDay) / (1000 * 60 * 60 * 24));
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (diffDays === 0) return `Today, ${timeStr}`;
    if (diffDays === 1) return `Yesterday, ${timeStr}`;
    
    const dateStr = date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
    return `${dateStr}, ${timeStr}`;
}

export const ProfileSettingsHub = (user = {}) => {
    // Initialize Actions
    if (!window.ProfileHubActions) {
        window.ProfileHubActions = {
            state: {
                profile: null,
                policies: null,
                notifications: null,
                activity: null,
                preferences: null,
                security: null,
            },
            switchTab: async (tabId) => {
                const contentArea = document.getElementById('profile-hub-content');
                if (!contentArea) return;
                
                contentArea.innerHTML = `
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; color: #6B7280; padding: 40px;">
                        <div class="loader-spinner" style="border: 3px solid rgba(0,0,0,0.1); width: 40px; height: 40px; border-radius: 50%; border-left-color: #2563EB; animation: spin 1s linear infinite; margin-bottom: 16px;"></div>
                        <div>Loading...</div>
                    </div>`;
                    
                try {
                    let html = '';
                    if (tabId === 'profile') {
                        const data = await AccountHubService.getProfile();
                        window.ProfileHubActions.state.profile = data;
                        html = renderProfileTab(data);
                    } else if (tabId === 'policies') {
                        const data = await AccountHubService.getPolicies();
                        window.ProfileHubActions.state.policies = data;
                        html = renderPoliciesTab(data);
                    } else if (tabId === 'notifications') {
                        const data = await AccountHubService.getNotifications();
                        window.ProfileHubActions.state.notifications = data;
                        html = renderNotificationsTab(data);
                    } else if (tabId === 'activity') {
                        const data = await AccountHubService.getActivity();
                        window.ProfileHubActions.state.activity = data;
                        html = renderActivityTab(data);
                    } else if (tabId === 'security') {
                        const data = await AccountHubService.getSecurity();
                        window.ProfileHubActions.state.security = data;
                        html = renderSecurityTab(data);
                    } else if (tabId === 'preferences') {
                        const data = await AccountHubService.getPreferences();
                        window.ProfileHubActions.state.preferences = data;
                        html = renderPreferencesTab(data);
                    }
                    contentArea.innerHTML = html;
                } catch (err) {
                    console.error(err);
                    contentArea.innerHTML = `<div style="padding: 40px; text-align: center; color: #EF4444; font-weight: 500;">Failed to load data from the server.</div>`;
                }
                
                // Update active state in sidebar
                document.querySelectorAll('.profile-nav-item').forEach(el => {
                    el.style.background = 'transparent';
                    el.style.color = '#4B5563';
                    el.style.fontWeight = '500';
                    el.style.boxShadow = 'none';
                    el.querySelector('svg').style.color = '#9CA3AF';
                    if (el.dataset.tab === tabId) {
                        el.style.background = '#FFFFFF';
                        el.style.color = '#111827';
                        el.style.fontWeight = '700';
                        el.style.boxShadow = '0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03)';
                        el.querySelector('svg').style.color = '#2563EB';
                    }
                });
            },
            togglePreference: async (el, key) => {
                const circle = el.querySelector('.toggle-circle');
                const isCurrentlyOn = el.dataset.state === 'on';
                const newState = !isCurrentlyOn;
                
                // Optimistic UI update
                el.dataset.state = newState ? 'on' : 'off';
                el.style.background = newState ? '#10B981' : '#E5E7EB';
                circle.style.transform = newState ? 'translateX(22px)' : 'translateX(2px)';
                
                try {
                    let val = newState;
                    if (key === 'theme') {
                        val = newState ? 'dark' : 'light';
                    }
                    await AccountHubService.updatePreferences({ [key]: val });
                    window.ProfileHubActions.showToast('Preferences saved successfully');
                } catch (e) {
                    // Revert on error
                    el.dataset.state = isCurrentlyOn ? 'on' : 'off';
                    el.style.background = isCurrentlyOn ? '#10B981' : '#E5E7EB';
                    circle.style.transform = isCurrentlyOn ? 'translateX(22px)' : 'translateX(2px)';
                    window.ProfileHubActions.showToast('Failed to save preference');
                }
            },
            saveProfileField: async (field, inputId) => {
                const val = document.getElementById(inputId).value;
                try {
                    await AccountHubService.updateProfile({ [field]: val });
                    window.ProfileHubActions.showToast('Profile updated successfully');
                } catch (e) {
                    window.ProfileHubActions.showToast('Failed to update profile');
                }
            },
            saveProfileChanges: async () => {
                const fields = {
                    full_name: document.getElementById('profile_full_name').value,
                    dob: document.getElementById('profile_dob').value,
                    gender: document.getElementById('profile_gender').value,
                    occupation: document.getElementById('profile_occupation').value,
                    phone_number: document.getElementById('profile_phone_number').value
                };
                
                const btn = document.getElementById('saveProfileBtn');
                const originalText = btn.innerText;
                btn.innerText = 'Saving...';
                btn.disabled = true;
                
                try {
                    await AccountHubService.updateProfile(fields);
                    window.ProfileHubActions.showToast('Profile updated successfully');
                    window.ProfileHubActions.switchTab('profile'); // Refresh
                } catch (e) {
                    window.ProfileHubActions.showToast('Failed to save profile');
                    btn.innerText = originalText;
                    btn.disabled = false;
                }
            },
            savePreferenceChanges: async (field, selectId) => {
                const val = document.getElementById(selectId).value;
                try {
                    await AccountHubService.updatePreferences({ [field]: val });
                    window.ProfileHubActions.showToast('Preference updated successfully');
                } catch (e) {
                    window.ProfileHubActions.showToast('Failed to save preference');
                }
            },
            markNotifRead: async (id) => {
                try {
                    await AccountHubService.markNotificationRead(id);
                    window.ProfileHubActions.switchTab('notifications');
                } catch (e) {}
            },
            markAllNotifsRead: async () => {
                try {
                    await AccountHubService.markAllNotificationsRead();
                    window.ProfileHubActions.switchTab('notifications');
                } catch (e) {}
            },
            deleteNotif: async (id) => {
                try {
                    await AccountHubService.deleteNotification(id);
                    window.ProfileHubActions.switchTab('notifications');
                } catch (e) {}
            },
            showToast: (msg) => {
                const toast = document.createElement('div');
                toast.innerText = msg;
                Object.assign(toast.style, {
                    position: 'fixed', bottom: '24px', right: '24px',
                    background: '#111827', color: '#FFF', padding: '14px 28px',
                    borderRadius: '8px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                    fontSize: '14px', fontWeight: '500', zIndex: '9999',
                    opacity: '0', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: 'translateY(20px)'
                });
                document.body.appendChild(toast);
                setTimeout(() => { toast.style.opacity = '1'; toast.style.transform = 'translateY(0)'; }, 10);
                setTimeout(() => {
                    toast.style.opacity = '0'; toast.style.transform = 'translateY(10px)';
                    setTimeout(() => toast.remove(), 300);
                }, 4000);
            },
            logout: () => {
                window.location.href = 'index.html';
            }
        };
    }
    
    const navItems = [
        { id: 'profile', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>', label: 'Profile' },
        { id: 'policies', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>', label: 'My Policies' },
        { id: 'notifications', icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>', label: 'Notifications' },
        { id: 'activity', icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>', label: 'Activity Center' },
        { id: 'security', icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>', label: 'Security & Privacy' },
        { id: 'preferences', icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>', label: 'Preferences' }
    ];

    const renderNav = () => navItems.map(item => `
        <li class="profile-nav-item" data-tab="${item.id}" onclick="window.ProfileHubActions.switchTab('${item.id}')" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 6px; ${item.id === 'profile' ? 'background: #FFFFFF; color: #111827; font-weight: 700; box-shadow: 0 1px 3px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.03);' : 'background: transparent; color: #4B5563; font-weight: 500;'}">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: ${item.id === 'profile' ? '#2563EB' : '#9CA3AF'}; transition: color 0.2s;">
                ${item.icon}
            </svg>
            ${item.label}
        </li>
    `).join('');

    setTimeout(() => {
        const contentArea = document.getElementById('profile-hub-content');
        if (contentArea && contentArea.innerHTML.trim() === '') {
            window.ProfileHubActions.switchTab('profile');
        }
    }, 0);

    return `
        <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; height: calc(100vh - 110px); gap: 32px; animation: fadeIn 0.4s ease; max-width: 1400px; margin: 0 auto;">
            
            <div style="width: 280px; flex-shrink: 0; display: flex; flex-direction: column; background: #F8FAFC; border-radius: 16px; padding: 24px;">
                <div style="margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid #E2E8F0;">
                    <div style="font-size: 20px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">Account Hub</div>
                    <div style="font-size: 14px; color: #64748B; margin-top: 4px;">Enterprise User Center</div>
                </div>
                
                <ul style="list-style: none; padding: 0; margin: 0; flex-grow: 1;">
                    ${renderNav()}
                </ul>
                
                <div style="border-top: 1px solid #E2E8F0; padding-top: 24px; margin-top: 24px;">
                    <li onclick="window.ProfileHubActions.logout()" style="display: flex; align-items: center; gap: 12px; padding: 14px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; background: transparent; color: #EF4444; font-weight: 600;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='transparent'">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Secure Sign Out
                    </li>
                </div>
            </div>
            
            <!-- Main Content Panel -->
            <div id="profile-hub-content" style="flex-grow: 1; background: #FFFFFF; border-radius: 16px; border: 1px solid #E2E8F0; padding: 48px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); overflow-y: auto;">
                <!-- Content injected dynamically -->
            </div>
            
            <style>
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                @keyframes spin { 
                    0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } 
                }
                
                .profile-nav-item:hover {
                    background: #FFFFFF !important;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05) !important;
                }
                
                .glass-card {
                    background: #FFFFFF;
                    border: 1px solid #E2E8F0;
                    border-radius: 16px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02), 0 2px 4px -2px rgba(0,0,0,0.02);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .glass-card:hover {
                    box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.025);
                }
                
                .input-field {
                    width: 100%;
                    padding: 12px 16px;
                    border: 1px solid #CBD5E1;
                    border-radius: 8px;
                    font-size: 15px;
                    outline: none;
                    transition: all 0.2s ease;
                    box-sizing: border-box;
                    color: #0F172A;
                    background: #F8FAFC;
                }
                .input-field:focus { 
                    border-color: #3B82F6; 
                    background: #FFFFFF;
                    box-shadow: 0 0 0 4px rgba(59,130,246,0.1); 
                }
                .input-field:disabled { background: #F1F5F9; color: #64748B; cursor: not-allowed; }
                
                .btn-primary {
                    background: #0F172A; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;
                }
                .btn-primary:hover { background: #1E293B; }
                .btn-primary:disabled { background: #94A3B8; cursor: not-allowed; }
                
                .btn-secondary {
                    background: white; color: #0F172A; border: 1px solid #CBD5E1; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;
                }
                .btn-secondary:hover { background: #F8FAFC; border-color: #94A3B8; }
                
                .toggle-switch {
                    width: 48px; height: 26px; border-radius: 26px; background: #E2E8F0; position: relative; cursor: pointer; transition: background 0.3s ease;
                }
                .toggle-circle {
                    width: 22px; height: 22px; border-radius: 50%; background: white; position: absolute; top: 2px; left: 0; transform: translateX(2px); transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1); box-shadow: 0 2px 4px rgba(0,0,0,0.15);
                }
                
                /* Custom scrollbar for content area */
                #profile-hub-content::-webkit-scrollbar { width: 8px; }
                #profile-hub-content::-webkit-scrollbar-track { background: transparent; }
                #profile-hub-content::-webkit-scrollbar-thumb { background: #CBD5E1; border-radius: 4px; }
                #profile-hub-content::-webkit-scrollbar-thumb:hover { background: #94A3B8; }
            </style>
        </div>
    `;
};


// --- RENDERERS FOR DYNAMIC TABS ---

function renderProfileTab(profile) {
    const initials = (profile.full_name || profile.email || 'U').charAt(0).toUpperCase();
    const phoneVerifiedHtml = profile.phone_number ? 
        \`<span style="font-size: 12px; font-weight: 600; color: #059669; background: #D1FAE5; padding: 6px 12px; border-radius: 12px;">Verified</span>\` : 
        \`<button style="background: white; border: 1px solid #CBD5E1; color: #0F172A; padding: 6px 14px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;" onclick="window.ProfileHubActions.showToast('Verification code sent')">Verify Now</button>\`;
    
    return \`
        <div style="animation: fadeIn 0.4s ease;">
            <!-- Top Profile Card -->
            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 48px;">
                <div style="display: flex; gap: 24px; align-items: center;">
                    <div style="width: 88px; height: 88px; border-radius: 50%; background: linear-gradient(135deg, #2563EB, #7C3AED); display: flex; justify-content: center; align-items: center; color: white; font-size: 32px; font-weight: 700; box-shadow: 0 10px 25px rgba(37,99,235,0.25);">
                        \${initials}
                    </div>
                    <div>
                        <h2 style="margin: 0 0 6px 0; font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">\${profile.full_name || 'Policyholder'}</h2>
                        <div style="display: flex; align-items: center; gap: 12px; color: #64748B; font-size: 15px; font-weight: 500;">
                            <span style="display: flex; align-items: center; gap: 6px; background: #F1F5F9; padding: 4px 10px; border-radius: 6px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                \${profile.role || 'Standard Account'}
                            </span>
                            <span>Member since \${new Date(profile.account_created_date || Date.now()).getFullYear()}</span>
                        </div>
                    </div>
                </div>
                <button class="btn-secondary" onclick="window.ProfileHubActions.showToast('Photo upload functionality is integrated in backend settings')">Change Photo</button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 32px;">
                <!-- Personal Info -->
                <div class="glass-card" style="padding: 32px;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #0F172A;">Identity Management</h3>
                        <span style="font-size: 13px; color: #64748B;">Internal Record Only</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px;">Full Legal Name</label>
                            <input type="text" id="profile_full_name" class="input-field" value="\${profile.full_name || ''}">
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px;">Date of Birth</label>
                            <input type="date" id="profile_dob" class="input-field" value="\${profile.dob || ''}">
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px;">Gender</label>
                            <select id="profile_gender" class="input-field">
                                <option value="" \${!profile.gender ? 'selected' : ''}>Select Gender</option>
                                <option value="Male" \${profile.gender === 'Male' ? 'selected' : ''}>Male</option>
                                <option value="Female" \${profile.gender === 'Female' ? 'selected' : ''}>Female</option>
                                <option value="Other" \${profile.gender === 'Other' ? 'selected' : ''}>Other</option>
                            </select>
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 600; color: #475569; margin-bottom: 8px;">Occupation</label>
                            <input type="text" id="profile_occupation" class="input-field" value="\${profile.occupation || ''}" placeholder="E.g. Senior Software Engineer">
                        </div>
                    </div>
                </div>
                
                <!-- Contact Details -->
                <div class="glass-card" style="padding: 32px;">
                    <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 700; color: #0F172A;">Contact Information</h3>
                    <div style="display: flex; flex-direction: column; gap: 20px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid #E2E8F0; border-radius: 12px; background: #F8FAFC;">
                            <div style="display: flex; align-items: center; gap: 16px;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: #DBEAFE; color: #2563EB; display: flex; justify-content: center; align-items: center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
                                <div>
                                    <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 2px;">Email Address</div>
                                    <div style="font-size: 14px; color: #64748B;">\${profile.email || 'Not provided'}</div>
                                </div>
                            </div>
                            <span style="font-size: 12px; font-weight: 600; color: #059669; background: #D1FAE5; padding: 6px 12px; border-radius: 12px;">Verified</span>
                        </div>
                        
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid #E2E8F0; border-radius: 12px;">
                            <div style="display: flex; align-items: center; gap: 16px; flex-grow: 1;">
                                <div style="width: 40px; height: 40px; border-radius: 10px; background: #F1F5F9; color: #64748B; display: flex; justify-content: center; align-items: center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div>
                                <div style="flex-grow: 1; max-width: 300px;">
                                    <div style="font-size: 14px; font-weight: 700; color: #0F172A; margin-bottom: 6px;">Phone Number</div>
                                    <input type="text" id="profile_phone_number" class="input-field" value="\${profile.phone_number || ''}" placeholder="Enter mobile number" style="padding: 8px 12px; height: 36px;">
                                </div>
                            </div>
                            \${phoneVerifiedHtml}
                        </div>
                    </div>
                    
                    <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #E2E8F0; text-align: right;">
                        <button id="saveProfileBtn" class="btn-primary" onclick="window.ProfileHubActions.saveProfileChanges()">Save Profile Changes</button>
                    </div>
                </div>
            </div>
        </div>
    \`;
}

function renderPoliciesTab(policies) {
    let policiesHtml = '<div style="color: #64748B; font-size: 15px; padding: 40px; text-align: center; border: 2px dashed #E2E8F0; border-radius: 12px;">No policies found on the backend. Please add one.</div>';
    
    if (policies && policies.length > 0) {
        policiesHtml = policies.map(p => {
            const isActive = p.status === 'Active';
            const colorHex = isActive ? '#059669' : '#D97706';
            const bgHex = isActive ? '#D1FAE5' : '#FEF3C7';
            
            return \`
            <div class="glass-card" style="padding: 32px; border-top: 6px solid \${colorHex};">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 6px;">
                            <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #0F172A;">\${p.policy_name || 'Insurance Policy'}</h3>
                            <span style="font-size: 12px; font-weight: 700; color: \${colorHex}; background: \${bgHex}; padding: 4px 10px; border-radius: 6px; text-transform: uppercase; letter-spacing: 0.5px;">\${p.status || 'Unknown'}</span>
                        </div>
                        <div style="font-size: 14px; color: #475569; display: flex; align-items: center; gap: 8px;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                            \${p.policy_number || 'N/A'} • \${p.bank || 'Unknown Provider'}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div style="font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Coverage Amount</div>
                        <div style="font-size: 20px; font-weight: 800; color: #0F172A;">\${p.coverage_amount || 'N/A'}</div>
                    </div>
                </div>
                <div style="background: #F8FAFC; border-radius: 8px; padding: 16px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; border: 1px solid #E2E8F0;">
                    <div>
                        <div style="font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Premium Cycle</div>
                        <div style="font-size: 15px; font-weight: 700; color: #0F172A;">\${p.premium || 'N/A'}</div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #64748B; text-transform: uppercase; font-weight: 700; margin-bottom: 4px;">Renewal Date</div>
                        <div style="font-size: 15px; font-weight: 700; color: \${isActive ? '#0F172A' : '#EF4444'};">\${p.renewal_date || 'N/A'}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 16px;">
                    <button class="btn-primary" style="flex: 1; \${!isActive ? 'background: #D97706;' : ''}" onclick="window.location.href='dashboard_policyholder.html'">\${isActive ? 'View Full Policy' : 'Renew Policy'}</button>
                    <button class="btn-secondary" style="flex: 1;" onclick="window.ProfileHubActions.showToast('Re-analyzing policy...')">Re-analyze Data</button>
                </div>
            </div>
            \`;
        }).join('');
    }
    
    return \`
        <div style="animation: fadeIn 0.4s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                <div>
                    <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">My Insurance Portfolio</h2>
                    <p style="color: #64748B; font-size: 15px; margin: 0;">Comprehensive overview of all synchronized policies.</p>
                </div>
                <button class="btn-secondary" style="display: flex; align-items: center; gap: 8px;" onclick="window.location.href='dashboard_policyholder.html'">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    Add Policy
                </button>
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 32px;">
                \${policiesHtml}
            </div>
        </div>
    \`;
}

function renderNotificationsTab(notifications) {
    let html = '<div style="color: #64748B; font-size: 15px; padding: 40px; text-align: center; border: 2px dashed #E2E8F0; border-radius: 12px;">You have no notifications.</div>';
    
    if (notifications && notifications.length > 0) {
        html = notifications.map(n => \`
            <div style="display: flex; gap: 20px; padding: 24px; border-bottom: 1px solid #E2E8F0; transition: background 0.2s ease; background: \${n.is_read ? 'transparent' : '#F8FAFC'};">
                <div style="width: 48px; height: 48px; border-radius: 12px; flex-shrink: 0; display: flex; justify-content: center; align-items: center; \${n.is_read ? 'background: #F1F5F9; color: #64748B;' : 'background: #DBEAFE; color: #2563EB;'}">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                </div>
                <div style="flex-grow: 1;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px;">
                        <h4 style="margin: 0; font-size: 16px; font-weight: \${n.is_read ? '600' : '700'}; color: #0F172A;">\${n.title || 'Notification'}</h4>
                        <span style="font-size: 13px; color: #64748B; font-weight: 500;">\${formatRelativeDate(n.created_at)}</span>
                    </div>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #475569; line-height: 1.5;">\${n.message || ''}</p>
                    <div style="display: flex; gap: 16px;">
                        \${!n.is_read ? \`<button style="background: transparent; border: none; padding: 0; color: #2563EB; font-size: 13px; font-weight: 600; cursor: pointer;" onclick="window.ProfileHubActions.markNotifRead(\${n.id})">Mark as read</button>\` : ''}
                        <button style="background: transparent; border: none; padding: 0; color: #EF4444; font-size: 13px; font-weight: 600; cursor: pointer;" onclick="window.ProfileHubActions.deleteNotif(\${n.id})">Delete</button>
                    </div>
                </div>
            </div>
        \`).join('');
    }
    
    return \`
        <div style="animation: fadeIn 0.4s ease;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                <div>
                    <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">Notifications</h2>
                    <p style="color: #64748B; font-size: 15px; margin: 0;">System alerts, security warnings, and compliance updates.</p>
                </div>
                \${notifications && notifications.length > 0 ? \`<button class="btn-secondary" onclick="window.ProfileHubActions.markAllNotifsRead()">Mark all as read</button>\` : ''}
            </div>
            
            <div class="glass-card" style="overflow: hidden;">
                \${html}
            </div>
        </div>
    \`;
}

function renderActivityTab(activities) {
    let html = '<div style="color: #64748B; font-size: 15px;">No recent activity found on this account.</div>';
    
    if (activities && activities.length > 0) {
        html = activities.map((item, idx) => {
            const isFirst = idx === 0;
            return \`
            <div style="position: relative; padding-bottom: \${idx === activities.length - 1 ? '0' : '32px'};">
                \${idx !== activities.length - 1 ? '<div style="position: absolute; left: 7px; top: 20px; bottom: 0; width: 2px; background: #E2E8F0;"></div>' : ''}
                <div style="position: absolute; left: 0; top: 0; width: 16px; height: 16px; border-radius: 50%; background: \${isFirst ? '#2563EB' : '#94A3B8'}; border: 3px solid white; box-shadow: 0 0 0 2px \${isFirst ? '#DBEAFE' : '#F1F5F9'};"></div>
                <div style="padding-left: 32px; padding-top: -2px;">
                    <div style="font-size: 13px; font-weight: 700; color: #64748B; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">\${formatRelativeDate(item.created_at)}</div>
                    <div style="font-size: 16px; font-weight: 700; color: #0F172A; margin-bottom: 4px;">\${item.description || 'System Event'}</div>
                    <div style="font-size: 14px; color: #475569;">Authenticated action recorded.</div>
                </div>
            </div>
            \`;
        }).join('');
    }
    
    return \`
        <div style="animation: fadeIn 0.4s ease;">
            <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">Activity Center</h2>
            <p style="color: #64748B; font-size: 15px; margin: 0 0 40px 0;">Immutable timeline of your interactions, searches, and policy requests.</p>
            
            <div class="glass-card" style="padding: 40px;">
                \${html}
            </div>
        </div>
    \`;
}

function renderSecurityTab(security) {
    return \`
        <div style="animation: fadeIn 0.4s ease;">
            <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">Security & Privacy</h2>
            <p style="color: #64748B; font-size: 15px; margin: 0 0 40px 0;">Enterprise-grade protection for your identity and insurance portfolio.</p>
            
            <div style="display: grid; grid-template-columns: 1fr 2.5fr; gap: 40px;">
                <!-- Left: Status Summary -->
                <div>
                    <div class="glass-card" style="padding: 32px; text-align: center; background: linear-gradient(180deg, #FFFFFF 0%, #F8FAFC 100%);">
                        <div style="width: 64px; height: 64px; margin: 0 auto 16px auto; background: \${security.two_factor_enabled ? '#ECFDF5' : '#FEF2F2'}; color: \${security.two_factor_enabled ? '#059669' : '#DC2626'}; border-radius: 50%; display: flex; align-items: center; justify-content: center;">
                            \${security.two_factor_enabled 
                                ? '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>'
                                : '<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>'}
                        </div>
                        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #0F172A;">Account Security</h3>
                        <p style="margin: 0 0 24px 0; font-size: 14px; color: #64748B;">\${security.two_factor_enabled ? 'Your account is highly secure.' : 'Your account is vulnerable.'}</p>
                        
                        \${!security.two_factor_enabled ? \`
                            <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 16px; border-radius: 8px; text-align: left; margin-bottom: 16px;">
                                <div style="font-size: 13px; font-weight: 700; color: #92400E; margin-bottom: 4px;">Action Required</div>
                                <div style="font-size: 13px; color: #B45309; line-height: 1.5;">Enable 2FA in the preferences tab to secure your account data.</div>
                            </div>
                        \` : ''}
                        
                        <div style="font-size: 12px; color: #94A3B8; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Last Login</div>
                        <div style="font-size: 14px; font-weight: 700; color: #475569; margin-top: 4px;">\${formatRelativeDate(security.last_login)}</div>
                    </div>
                </div>
                
                <!-- Right: Detailed Settings -->
                <div style="display: flex; flex-direction: column; gap: 32px;">
                    <div class="glass-card" style="padding: 32px;">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #0F172A;">Authentication</h3>
                                <p style="margin: 0; font-size: 14px; color: #64748B;">Update your master password.</p>
                            </div>
                            <button class="btn-secondary" onclick="window.ProfileHubActions.showToast('Authentication modal opening...')">Change Password</button>
                        </div>
                    </div>
                    
                    <div class="glass-card" style="padding: 32px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                            <div>
                                <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #0F172A;">Active Sessions</h3>
                                <p style="margin: 0; font-size: 14px; color: #64748B;">Manage devices that are currently logged in.</p>
                            </div>
                            <button class="btn-secondary" style="color: #EF4444; border-color: #FECACA;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='white'">Revoke All Other Sessions</button>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; gap: 16px;">
                            \${security.active_sessions.map(sess => \`
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px; border: 1px solid #E2E8F0; border-radius: 12px; background: \${sess.is_current ? '#F8FAFC' : 'white'};">
                                    <div style="display: flex; align-items: center; gap: 16px;">
                                        <div style="width: 40px; height: 40px; border-radius: 10px; background: \${sess.is_current ? '#DBEAFE' : '#F1F5F9'}; color: \${sess.is_current ? '#2563EB' : '#64748B'}; display: flex; justify-content: center; align-items: center;">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect></svg>
                                        </div>
                                        <div>
                                            <div style="font-size: 15px; font-weight: 700; color: #0F172A;">\${sess.device}</div>
                                            <div style="font-size: 13px; color: #64748B; margin-top: 4px;">\${sess.location} • \${sess.status}</div>
                                        </div>
                                    </div>
                                    \${sess.is_current 
                                        ? '<span style="font-size: 12px; font-weight: 700; color: #059669; background: #D1FAE5; padding: 4px 10px; border-radius: 6px; text-transform: uppercase;">Current Session</span>' 
                                        : '<button style="background: transparent; border: none; color: #EF4444; font-size: 14px; font-weight: 600; cursor: pointer;">Revoke</button>'}
                                </div>
                            \`).join('')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    \`;
}

function renderPreferencesTab(pref) {
    return \`
        <div style="animation: fadeIn 0.4s ease;">
            <h2 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 800; color: #0F172A; letter-spacing: -0.5px;">System Preferences</h2>
            <p style="color: #64748B; font-size: 15px; margin: 0 0 40px 0;">Configure platform behavior, AI characteristics, and UI themes.</p>
            
            <div class="glass-card" style="padding: 32px; margin-bottom: 32px;">
                <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 700; color: #0F172A; border-bottom: 1px solid #E2E8F0; padding-bottom: 16px;">Platform Experience</h3>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <div>
                        <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #1E293B;">Enterprise Dark Theme</h4>
                        <p style="margin: 0; font-size: 14px; color: #64748B;">Toggle low-light visual mode.</p>
                    </div>
                    <div class="toggle-switch" data-state="\${pref.theme === 'dark' ? 'on' : 'off'}" onclick="window.ProfileHubActions.togglePreference(this, 'theme')" style="background: \${pref.theme === 'dark' ? '#10B981' : '#E2E8F0'};">
                        <div class="toggle-circle" style="transform: \${pref.theme === 'dark' ? 'translateX(22px)' : 'translateX(2px)'};"></div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #1E293B;">Two-Factor Authentication</h4>
                        <p style="margin: 0; font-size: 14px; color: #64748B;">Require TOTP on login.</p>
                    </div>
                    <div class="toggle-switch" data-state="\${pref.two_factor_enabled ? 'on' : 'off'}" onclick="window.ProfileHubActions.togglePreference(this, 'two_factor_enabled')" style="background: \${pref.two_factor_enabled ? '#10B981' : '#E2E8F0'};">
                        <div class="toggle-circle" style="transform: \${pref.two_factor_enabled ? 'translateX(22px)' : 'translateX(2px)'};"></div>
                    </div>
                </div>
            </div>
            
            <div class="glass-card" style="padding: 32px;">
                <h3 style="margin: 0 0 24px 0; font-size: 18px; font-weight: 700; color: #0F172A; border-bottom: 1px solid #E2E8F0; padding-bottom: 16px;">AI Engine Configuration</h3>
                
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px;">
                    <div>
                        <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #1E293B;">Proactive Intelligence</h4>
                        <p style="margin: 0; font-size: 14px; color: #64748B;">Allow the system to automatically analyze linked assets without explicit prompts.</p>
                    </div>
                    <div class="toggle-switch" data-state="\${pref.proactive_suggestions ? 'on' : 'off'}" onclick="window.ProfileHubActions.togglePreference(this, 'proactive_suggestions')" style="background: \${pref.proactive_suggestions ? '#10B981' : '#E2E8F0'};">
                        <div class="toggle-circle" style="transform: \${pref.proactive_suggestions ? 'translateX(22px)' : 'translateX(2px)'};"></div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4 style="margin: 0 0 6px 0; font-size: 15px; font-weight: 700; color: #1E293B;">System Tone of Voice</h4>
                        <p style="margin: 0; font-size: 14px; color: #64748B;">Control the narrative output style of reports.</p>
                    </div>
                    <select id="pref_tone_of_voice" class="input-field" style="width: 250px;" onchange="window.ProfileHubActions.savePreferenceChanges('tone_of_voice', 'pref_tone_of_voice')">
                        <option value="Professional" \${pref.tone_of_voice === 'Professional' ? 'selected' : ''}>Enterprise Professional</option>
                        <option value="Friendly" \${pref.tone_of_voice === 'Friendly' ? 'selected' : ''}>Accessible / Friendly</option>
                        <option value="Concise" \${pref.tone_of_voice === 'Concise' ? 'selected' : ''}>Direct / Concise</option>
                        <option value="Legal" \${pref.tone_of_voice === 'Legal' ? 'selected' : ''}>Strict Legal / Compliance</option>
                    </select>
                </div>
            </div>
        </div>
    \`;
}
