export const ProfileSettingsHub = (user = {}) => {
    // Initialize Actions
    if (!window.ProfileHubActions) {
        window.ProfileHubActions = {
            switchTab: (tabId) => {
                const contentArea = document.getElementById('profile-hub-content');
                if (contentArea) {
                    contentArea.innerHTML = getTabContent(tabId, window.currentUserData || {});
                    
                    // Update active state in sidebar
                    document.querySelectorAll('.profile-nav-item').forEach(el => {
                        el.style.background = 'transparent';
                        el.style.color = '#4B5563';
                        el.style.fontWeight = '500';
                        el.querySelector('svg').style.color = '#9CA3AF';
                        if (el.dataset.tab === tabId) {
                            el.style.background = '#EFF6FF';
                            el.style.color = '#1D4ED8';
                            el.style.fontWeight = '600';
                            el.querySelector('svg').style.color = '#2563EB';
                        }
                    });
                }
            },
            toggleSwitch: (el) => {
                const circle = el.querySelector('.toggle-circle');
                if (el.dataset.state === 'on') {
                    el.dataset.state = 'off';
                    el.style.background = '#E5E7EB';
                    circle.style.transform = 'translateX(2px)';
                } else {
                    el.dataset.state = 'on';
                    el.style.background = '#10B981';
                    circle.style.transform = 'translateX(22px)';
                }
                window.ProfileHubActions.showToast('Preferences saved successfully');
            },
            showToast: (msg) => {
                const toast = document.createElement('div');
                toast.innerText = msg;
                Object.assign(toast.style, {
                    position: 'fixed',
                    bottom: '20px',
                    right: '20px',
                    background: '#111827',
                    color: '#FFF',
                    padding: '12px 24px',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    fontSize: '14px',
                    fontWeight: '500',
                    zIndex: '9999',
                    opacity: '0',
                    transition: 'opacity 0.3s ease, transform 0.3s ease',
                    transform: 'translateY(10px)'
                });
                document.body.appendChild(toast);
                setTimeout(() => {
                    toast.style.opacity = '1';
                    toast.style.transform = 'translateY(0)';
                }, 10);
                setTimeout(() => {
                    toast.style.opacity = '0';
                    toast.style.transform = 'translateY(10px)';
                    setTimeout(() => toast.remove(), 300);
                }, 3000);
            },
            logout: () => {
                alert('Logging out...');
                window.location.href = 'index.html';
            }
        };
    }
    
    window.currentUserData = user;

    const navItems = [
        { id: 'profile', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>', label: 'Profile' },
        { id: 'policies', icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>', label: 'My Policies' },
        { id: 'notifications', icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path>', label: 'Notifications' },
        { id: 'activity', icon: '<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>', label: 'Activity Center' },
        { id: 'security', icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>', label: 'Security & Privacy' },
        { id: 'preferences', icon: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>', label: 'Preferences' }
    ];

    const renderNav = () => navItems.map(item => `
        <li class="profile-nav-item" data-tab="${item.id}" onclick="window.ProfileHubActions.switchTab('${item.id}')" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; margin-bottom: 4px; ${item.id === 'profile' ? 'background: #EFF6FF; color: #1D4ED8; font-weight: 600;' : 'background: transparent; color: #4B5563; font-weight: 500;'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: ${item.id === 'profile' ? '#2563EB' : '#9CA3AF'}; transition: color 0.2s;">
                ${item.icon}
            </svg>
            ${item.label}
        </li>
    `).join('');

    // Trigger initial render of 'profile' tab after insertion
    setTimeout(() => {
        const contentArea = document.getElementById('profile-hub-content');
        if (contentArea && contentArea.innerHTML.trim() === '') {
            window.ProfileHubActions.switchTab('profile');
        }
    }, 0);

    return `
        <div style="font-family: 'Inter', system-ui, sans-serif; display: flex; height: calc(100vh - 120px); gap: 32px; animation: fadeIn 0.3s ease;">
            
            <!-- Left Sidebar Navigation -->
            <div style="width: 260px; flex-shrink: 0; display: flex; flex-direction: column; background: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px -1px rgba(0, 0, 0, 0.02);">
                <div style="margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid #F3F4F6;">
                    <div style="font-size: 18px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">Account Hub</div>
                    <div style="font-size: 13px; color: #6B7280; margin-top: 4px;">Manage settings & identity</div>
                </div>
                
                <ul style="list-style: none; padding: 0; margin: 0; flex-grow: 1;">
                    ${renderNav()}
                </ul>
                
                <div style="border-top: 1px solid #F3F4F6; padding-top: 24px; margin-top: 24px;">
                    <li onclick="window.ProfileHubActions.logout()" style="display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: 8px; cursor: pointer; transition: all 0.2s ease; background: transparent; color: #EF4444; font-weight: 600;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='transparent'">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                            <polyline points="16 17 21 12 16 7"></polyline>
                            <line x1="21" y1="12" x2="9" y2="12"></line>
                        </svg>
                        Sign Out
                    </li>
                </div>
            </div>
            
            <!-- Main Content Panel -->
            <div id="profile-hub-content" style="flex-grow: 1; background: #FFFFFF; border-radius: 16px; border: 1px solid #E5E7EB; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02); overflow-y: auto;">
                <!-- Content injected dynamically -->
            </div>
            
            <style>
                .profile-nav-item:hover {
                    background: #F3F4F6 !important;
                }
                .profile-nav-item[data-tab="profile"].active { background: #EFF6FF !important; }
                
                .glass-card {
                    background: rgba(255, 255, 255, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid #E5E7EB;
                    border-radius: 12px;
                    box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02);
                }
                
                .input-field {
                    width: 100%;
                    padding: 10px 14px;
                    border: 1px solid #D1D5DB;
                    border-radius: 8px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                    color: #111827;
                }
                .input-field:focus { border-color: #3B82F6; box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
                .input-field:disabled { background: #F9FAFB; color: #6B7280; cursor: not-allowed; }
                
                .btn-primary {
                    background: #111827; color: white; border: none; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;
                }
                .btn-primary:hover { background: #374151; }
                
                .btn-secondary {
                    background: white; color: #374151; border: 1px solid #D1D5DB; padding: 10px 20px; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s;
                }
                .btn-secondary:hover { background: #F9FAFB; }
                
                .toggle-switch {
                    width: 44px; height: 24px; border-radius: 24px; background: #E5E7EB; position: relative; cursor: pointer; transition: background 0.3s;
                }
                .toggle-circle {
                    width: 20px; height: 20px; border-radius: 50%; background: white; position: absolute; top: 2px; left: 0; transform: translateX(2px); transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1); box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
            </style>
        </div>
    `;
};

// Helper to render specific tab content
function getTabContent(tabId, user) {
    const initials = (user.fullName || user.email || 'U').charAt(0).toUpperCase();
    
    if (tabId === 'profile') {
        const userProfile = JSON.parse(localStorage.getItem('sfan_user_profile') || '{}');
        const policies = JSON.parse(localStorage.getItem('sfan_policies') || '[]');
        
        let linkedAssetsHtml = policies.length > 0 ? policies.map(p => `
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='transparent'">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 8px; height: 8px; border-radius: 50%; background: ${p.status === 'Active' ? '#10B981' : '#F59E0B'};"></div>
                    <div style="font-size: 13px; font-weight: 500; color: #374151;">${p.type || 'Insurance Policy'}</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
            </div>
        `).join('') : '<div style="font-size: 13px; color: #6B7280; padding: 12px 0;">No assets linked yet.</div>';

        const phoneVal = userProfile.phone || '';
        const phoneVerifiedHtml = userProfile.phone ? 
            `<span style="font-size: 12px; font-weight: 600; color: #10B981; background: #D1FAE5; padding: 4px 8px; border-radius: 12px;">Verified</span>` : 
            `<button style="background: white; border: 1px solid #D1D5DB; color: #374151; padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; cursor: pointer;" onclick="window.ProfileHubActions.showToast('Verification code sent')">Verify Now</button>`;
        
        const verificationPercent = userProfile.phone ? '100' : '70';

        return `
            <div style="animation: fadeIn 0.4s ease;">
                <!-- Top Profile Card -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px;">
                    <div style="display: flex; gap: 24px; align-items: center;">
                        <div style="width: 80px; height: 80px; border-radius: 50%; background: linear-gradient(135deg, #3B82F6, #8B5CF6); display: flex; justify-content: center; align-items: center; color: white; font-size: 28px; font-weight: 700; box-shadow: 0 4px 12px rgba(59,130,246,0.3);">
                            ${initials}
                        </div>
                        <div>
                            <h2 style="margin: 0 0 4px 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">${user.fullName || 'Policyholder'}</h2>
                            <div style="display: flex; align-items: center; gap: 8px; color: #6B7280; font-size: 14px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                                ${user.role || 'Standard Account'}
                            </div>
                        </div>
                    </div>
                    <button class="btn-secondary" onclick="window.ProfileHubActions.showToast('Edit profile coming soon')">Edit Profile</button>
                </div>
                
                <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 32px;">
                    <!-- Left Column -->
                    <div style="display: flex; flex-direction: column; gap: 32px;">
                        <!-- Personal Info -->
                        <div class="glass-card" style="padding: 24px;">
                            <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #111827;">Personal Information</h3>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <div>
                                    <label style="display: block; font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 6px;">Full Name</label>
                                    <input type="text" class="input-field" value="${user.fullName || ''}" placeholder="Not provided">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 6px;">Date of Birth</label>
                                    <input type="date" class="input-field" value="${userProfile.dob || ''}">
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 6px;">Gender</label>
                                    <select class="input-field">
                                        <option value="" ${!userProfile.gender ? 'selected' : ''}>Select Gender</option>
                                        <option value="Male" ${userProfile.gender === 'Male' ? 'selected' : ''}>Male</option>
                                        <option value="Female" ${userProfile.gender === 'Female' ? 'selected' : ''}>Female</option>
                                        <option value="Other" ${userProfile.gender === 'Other' ? 'selected' : ''}>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label style="display: block; font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 6px;">Occupation</label>
                                    <input type="text" class="input-field" value="${userProfile.occupation || ''}" placeholder="E.g. Software Engineer">
                                </div>
                            </div>
                            <div style="margin-top: 16px; text-align: right;">
                                <button class="btn-primary" onclick="window.ProfileHubActions.showToast('Profile updated')">Save Changes</button>
                            </div>
                        </div>
                        
                        <!-- Contact Details -->
                        <div class="glass-card" style="padding: 24px;">
                            <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #111827;">Contact Details</h3>
                            <div style="display: flex; flex-direction: column; gap: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; background: #F9FAFB;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #E0E7FF; color: #4F46E5; display: flex; justify-content: center; align-items: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg></div>
                                        <div>
                                            <div style="font-size: 13px; font-weight: 600; color: #111827;">Email Address</div>
                                            <div style="font-size: 13px; color: #6B7280;">${user.email || 'Not provided'}</div>
                                        </div>
                                    </div>
                                    <span style="font-size: 12px; font-weight: 600; color: #10B981; background: #D1FAE5; padding: 4px 8px; border-radius: 12px;">Verified</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px;">
                                    <div style="display: flex; align-items: center; gap: 12px;">
                                        <div style="width: 32px; height: 32px; border-radius: 8px; background: #F3F4F6; color: #6B7280; display: flex; justify-content: center; align-items: center;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></div>
                                        <div>
                                            <div style="font-size: 13px; font-weight: 600; color: #111827;">Phone Number</div>
                                            <div style="font-size: 13px; color: #6B7280;">${phoneVal || 'Not provided'}</div>
                                        </div>
                                    </div>
                                    ${phoneVerifiedHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right Column -->
                    <div style="display: flex; flex-direction: column; gap: 32px;">
                        <!-- Verification Progress -->
                        <div class="glass-card" style="padding: 24px;">
                            <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #111827;">Account Verification</h3>
                            <p style="margin: 0 0 20px 0; font-size: 13px; color: #6B7280;">Complete your profile to unlock all features.</p>
                            
                            <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
                                <span style="color: #4F46E5;">${verificationPercent}% Complete</span>
                                <span style="color: #6B7280;">100%</span>
                            </div>
                            <div style="width: 100%; background: #E5E7EB; height: 8px; border-radius: 4px; margin-bottom: 20px; overflow: hidden;">
                                <div style="width: ${verificationPercent}%; background: #4F46E5; height: 100%; border-radius: 4px;"></div>
                            </div>
                            
                            ${verificationPercent === '100' ? 
                            `<div style="background: #ECFDF5; border: 1px solid #A7F3D0; padding: 12px; border-radius: 8px; display: flex; gap: 10px; align-items: flex-start;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2.5" style="margin-top: 2px; flex-shrink: 0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                <div>
                                    <div style="font-size: 13px; font-weight: 600; color: #065F46;">All Set!</div>
                                    <div style="font-size: 12px; color: #047857; margin-top: 2px;">Your profile is fully verified and secure.</div>
                                </div>
                            </div>` :
                            `<div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 12px; border-radius: 8px; display: flex; gap: 10px; align-items: flex-start;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5" style="margin-top: 2px; flex-shrink: 0;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                <div>
                                    <div style="font-size: 13px; font-weight: 600; color: #92400E;">Suggestion</div>
                                    <div style="font-size: 12px; color: #B45309; margin-top: 2px;">Verify your phone number to secure your account and complete verification.</div>
                                </div>
                            </div>`
                            }
                        </div>
                        
                        <!-- Quick Links -->
                        <div class="glass-card" style="padding: 24px;">
                            <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #111827;">Linked Assets</h3>
                            <div style="display: flex; flex-direction: column; gap: 12px;">
                                ${linkedAssetsHtml}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (tabId === 'policies') {
        const policies = JSON.parse(localStorage.getItem('sfan_policies') || '[]');
        
        let policiesHtml = '<div style="color: #6B7280; font-size: 14px; padding: 24px; text-align: center; border: 1px dashed #D1D5DB; border-radius: 8px;">No policies found. Head to the Insurance Locker to add one.</div>';
        
        if (policies.length > 0) {
            policiesHtml = policies.map(p => {
                const isActive = p.status === 'Active';
                const colorHex = isActive ? '#10B981' : '#F59E0B';
                const bgHex = isActive ? '#D1FAE5' : '#FEF3C7';
                
                return `
                <div class="glass-card" style="padding: 24px; border-top: 4px solid ${colorHex};">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
                        <div>
                            <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 700; color: #111827;">${p.type || 'Insurance Policy'}</h3>
                            <div style="font-size: 13px; color: #6B7280;">${p.policyNumber || 'N/A'}</div>
                        </div>
                        <span style="font-size: 11px; font-weight: 600; color: ${colorHex}; background: ${bgHex}; padding: 4px 10px; border-radius: 10px; text-transform: uppercase;">${p.status || 'Unknown'}</span>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                        <div>
                            <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Premium</div>
                            <div style="font-size: 14px; font-weight: 600; color: #111827;">${p.premium || 'N/A'}</div>
                        </div>
                        <div>
                            <div style="font-size: 11px; color: #6B7280; text-transform: uppercase; font-weight: 600; margin-bottom: 4px;">Renewal Date</div>
                            <div style="font-size: 14px; font-weight: 600; color: ${isActive ? '#111827' : '#EF4444'};">${p.renewalDate || 'N/A'}</div>
                        </div>
                    </div>
                    <div style="display: flex; gap: 12px;">
                        <button class="btn-primary" style="flex: 1; ${!isActive ? 'background: #F59E0B;' : ''}">${isActive ? 'View Details' : 'Renew Now'}</button>
                        <button class="btn-secondary" style="flex: 1;">${isActive ? 'Raise Claim' : 'View Details'}</button>
                    </div>
                </div>
                `;
            }).join('');
        }
        
        return `
            <div style="animation: fadeIn 0.4s ease;">
                <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">My Policies (Quick View)</h2>
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 32px 0;">Overview of your active and upcoming policy statuses.</p>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                    ${policiesHtml}
                </div>
            </div>
        `;
    }

    if (tabId === 'security') {
        return `
            <div style="animation: fadeIn 0.4s ease;">
                <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">Security & Privacy</h2>
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 32px 0;">Manage your security settings, active sessions, and privacy preferences.</p>
                
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 32px;">
                    <!-- Left: Security Score -->
                    <div>
                        <div class="glass-card" style="padding: 24px; text-align: center; background: linear-gradient(to bottom, #FFFFFF, #F8FAFC);">
                            <h3 style="margin: 0 0 16px 0; font-size: 15px; font-weight: 600; color: #475569;">Security Score</h3>
                            <div style="position: relative; width: 120px; height: 120px; margin: 0 auto 20px auto;">
                                <svg width="120" height="120" viewBox="0 0 120 120">
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#E2E8F0" stroke-width="10"></circle>
                                    <circle cx="60" cy="60" r="50" fill="none" stroke="#F59E0B" stroke-width="10" stroke-dasharray="314" stroke-dashoffset="125" stroke-linecap="round" transform="rotate(-90 60 60)"></circle>
                                </svg>
                                <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                                    <span style="font-size: 28px; font-weight: 800; color: #0F172A;">60</span>
                                    <span style="font-size: 12px; font-weight: 600; color: #64748B;">/ 100</span>
                                </div>
                            </div>
                            <div style="background: #FFFBEB; border: 1px solid #FDE68A; padding: 12px; border-radius: 8px; text-align: left;">
                                <div style="font-size: 13px; font-weight: 600; color: #92400E; margin-bottom: 4px;">Action Required</div>
                                <div style="font-size: 12px; color: #B45309;">Enable Two-Factor Authentication to boost your score to 90.</div>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Right: Settings -->
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <div class="glass-card" style="padding: 24px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                                <div>
                                    <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111827;">Two-Factor Authentication (2FA)</h3>
                                    <p style="margin: 0; font-size: 13px; color: #6B7280;">Add an extra layer of security to your account.</p>
                                </div>
                                <div class="toggle-switch" data-state="off" onclick="window.ProfileHubActions.toggleSwitch(this)">
                                    <div class="toggle-circle"></div>
                                </div>
                            </div>
                            <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 20px 0;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h3 style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #111827;">Change Password</h3>
                                    <p style="margin: 0; font-size: 13px; color: #6B7280;">Last changed 3 months ago.</p>
                                </div>
                                <button class="btn-secondary">Update</button>
                            </div>
                        </div>
                        
                        <div class="glass-card" style="padding: 24px;">
                            <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #111827;">Active Sessions</h3>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #E5E7EB;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect><rect x="9" y="9" width="6" height="6"></rect><line x1="9" y1="1" x2="9" y2="4"></line><line x1="15" y1="1" x2="15" y2="4"></line><line x1="9" y1="20" x2="9" y2="23"></line><line x1="15" y1="20" x2="15" y2="23"></line><line x1="20" y1="9" x2="23" y2="9"></line><line x1="20" y1="14" x2="23" y2="14"></line><line x1="1" y1="9" x2="4" y2="9"></line><line x1="1" y1="14" x2="4" y2="14"></line></svg>
                                    <div>
                                        <div style="font-size: 14px; font-weight: 600; color: #111827;">MacBook Pro - Chrome</div>
                                        <div style="font-size: 12px; color: #6B7280;">New York, USA • Active now</div>
                                    </div>
                                </div>
                                <span style="font-size: 12px; font-weight: 600; color: #10B981;">Current</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect><line x1="12" y1="18" x2="12.01" y2="18"></line></svg>
                                    <div>
                                        <div style="font-size: 14px; font-weight: 600; color: #111827;">iPhone 13 - Safari</div>
                                        <div style="font-size: 12px; color: #6B7280;">New York, USA • Last active 2h ago</div>
                                    </div>
                                </div>
                                <button style="background: transparent; border: none; color: #EF4444; font-size: 13px; font-weight: 500; cursor: pointer;">Revoke</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (tabId === 'preferences') {
        return `
            <div style="animation: fadeIn 0.4s ease;">
                <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">Preferences</h2>
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 32px 0;">Customize your dashboard experience and AI assistant behaviors.</p>
                
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #111827;">Appearance</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #374151;">Dark Mode</h4>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">Switch to a dark theme for low-light environments.</p>
                        </div>
                        <div class="toggle-switch" data-state="off" onclick="window.ProfileHubActions.toggleSwitch(this)">
                            <div class="toggle-circle"></div>
                        </div>
                    </div>
                </div>
                
                <div class="glass-card" style="padding: 24px; margin-bottom: 24px;">
                    <h3 style="margin: 0 0 20px 0; font-size: 16px; font-weight: 600; color: #111827;">AI Assistant Behavior</h3>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <div>
                            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #374151;">Proactive Suggestions</h4>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">Allow the AI to proactively analyze events and suggest actions.</p>
                        </div>
                        <div class="toggle-switch" data-state="on" onclick="window.ProfileHubActions.toggleSwitch(this)" style="background: #10B981;">
                            <div class="toggle-circle" style="transform: translateX(22px);"></div>
                        </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #374151;">Tone of Voice</h4>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">Choose how the AI interacts with you.</p>
                        </div>
                        <select class="input-field" style="width: 200px;">
                            <option>Professional</option>
                            <option>Friendly</option>
                            <option>Concise</option>
                        </select>
                    </div>
                </div>
            </div>
        `;
    }
    
    if (tabId === 'activity') {
        const history = JSON.parse(localStorage.getItem('sfan_ai_history') || '[]');
        
        let activityHtml = '<div style="color: #6B7280; font-size: 14px;">No recent activity found.</div>';
        
        if (history.length > 0) {
            activityHtml = history.reverse().slice(0, 5).map((item, idx) => {
                const color = idx === 0 ? '#3B82F6' : (idx === 1 ? '#10B981' : '#F59E0B');
                const timeStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : 'Recently';
                return `
                <div style="position: relative;">
                    <div style="position: absolute; left: -33px; top: 0; width: 16px; height: 16px; border-radius: 50%; background: ${color}; border: 4px solid white;"></div>
                    <div style="font-size: 12px; font-weight: 600; color: #6B7280; margin-bottom: 4px;">${timeStr}</div>
                    <div style="font-size: 15px; font-weight: 600; color: #111827;">AI Assistant Interaction</div>
                    <div style="font-size: 14px; color: #4B5563; margin-top: 4px;">You asked: "${item.user || 'Query'}"</div>
                </div>
                `;
            }).join('');
        }
        
        return `
            <div style="animation: fadeIn 0.4s ease;">
                <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">Activity Center</h2>
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 32px 0;">A timeline of your recent interactions and system events.</p>
                
                <div class="glass-card" style="padding: 32px;">
                    <div style="position: relative; padding-left: 24px; border-left: 2px solid #E5E7EB; display: flex; flex-direction: column; gap: 32px;">
                        ${activityHtml}
                    </div>
                </div>
            </div>
        `;
    }
    
    if (tabId === 'notifications') {
        const notifications = JSON.parse(localStorage.getItem('sfan_notifications') || '[]');
        
        let notifsHtml = '<div style="color: #6B7280; font-size: 14px; padding: 16px; text-align: center;">No new notifications.</div>';
        
        if (notifications.length > 0) {
            notifsHtml = notifications.map((n, i) => `
                <div style="display: flex; align-items: flex-start; gap: 16px; padding: 16px; ${i !== notifications.length - 1 ? 'border-bottom: 1px solid #E5E7EB;' : ''} ${i === 0 ? 'background: #F9FAFB; border-radius: 8px 8px 0 0;' : ''}">
                    <div style="width: 40px; height: 40px; border-radius: 50%; background: #EFF6FF; color: #3B82F6; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                    </div>
                    <div style="flex: 1;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                            <h4 style="margin: 0; font-size: 14px; font-weight: 600; color: #111827;">${n.title || 'Notification'}</h4>
                            <span style="font-size: 12px; color: #6B7280;">${n.time || 'Recently'}</span>
                        </div>
                        <p style="margin: 0; font-size: 13px; color: #4B5563;">${n.message || ''}</p>
                    </div>
                </div>
            `).join('');
        }
        
        return `
            <div style="animation: fadeIn 0.4s ease;">
                <h2 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #111827; letter-spacing: -0.5px;">Notifications</h2>
                <p style="color: #6B7280; font-size: 14px; margin: 0 0 32px 0;">Alerts and updates requiring your attention.</p>
                
                <div class="glass-card" style="padding: 16px;">
                    ${notifsHtml}
                </div>
            </div>
        `;
    }

    return `<div style="padding: 40px; text-align: center; color: #6B7280;">Tab content for ${tabId} coming soon.</div>`;
}
