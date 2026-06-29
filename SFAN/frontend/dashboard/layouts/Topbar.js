export const Topbar = (user) => {
    return `
        <header style="display: flex; justify-content: space-between; align-items: center; padding: 15px 40px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100;">
            
            <!-- Global Search Bar -->
            <div style="flex: 1; max-width: 500px; position: relative;">
                <div style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input type="text" placeholder="Search policies, documents, reports, and insights..." style="width: 100%; padding: 12px 16px 12px 45px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08); background: rgba(248, 249, 250, 0.8); font-size: 14px; color: var(--text-main); outline: none; transition: all 0.2s;" onfocus="this.style.background='#fff'; this.style.borderColor='var(--primary)';" onblur="this.style.background='rgba(248, 249, 250, 0.8)'; this.style.borderColor='rgba(0,0,0,0.08)';">
            </div>

            <!-- User Profile -->
            <div class="user-info-v2" style="display: flex; align-items: center; gap: 15px; cursor: pointer; margin-left: 20px;">
                <div style="text-align: right;">
                    <p id="user-name" style="margin: 0; font-weight: 700; color: #1F2937; font-size: 15px;">${user?.fullName || user?.email || 'User'}</p>
                    <p id="user-role" style="margin: 0; font-size: 12px; color: #6B7280; font-weight: 500;">${user?.role || 'Policyholder'}</p>
                </div>
                <div id="user-initial" style="width: 44px; height: 44px; border-radius: 50%; background: linear-gradient(135deg, #FF7A59, #FF9A76); color: white; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px; box-shadow: 0 4px 10px rgba(255, 122, 89, 0.3);">
                    ${(user?.fullName || user?.email || 'U').charAt(0).toUpperCase()}
                </div>
            </div>
        </header>
    `;
};
