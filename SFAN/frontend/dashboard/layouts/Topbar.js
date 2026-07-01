export const Topbar = (user) => {
    return `
        <header style="display: flex; justify-content: space-between; align-items: center; padding: 15px 40px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); border-bottom: 1px solid rgba(0,0,0,0.05); position: sticky; top: 0; z-index: 100;">
            
            <!-- Global Search Bar -->
            <div style="flex: 1; max-width: 500px; position: relative;">
                <div style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: var(--text-muted); pointer-events: none;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                </div>
                <input type="text" id="topbar-search-input" placeholder="Search policies, documents, reports, and insights..." style="width: 100%; padding: 12px 16px 12px 45px; border-radius: 12px; border: 1px solid rgba(0,0,0,0.08); background: rgba(248, 249, 250, 0.8); font-size: 14px; color: var(--text-main); outline: none; transition: all 0.2s;" onfocus="this.style.background='#fff'; this.style.borderColor='var(--primary)';" onblur="this.style.background='rgba(248, 249, 250, 0.8)'; this.style.borderColor='rgba(0,0,0,0.08)';" onkeypress="if(event.key === 'Enter' && this.value.trim() !== '') { const val = this.value; this.value = ''; window.handleNavClick('ai-assistant'); setTimeout(() => { if(window.AiAssistantActions) window.AiAssistantActions.setQuery(val); }, 100); }">
            </div>

            <style>
                @keyframes pulseGlow {
                    0% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0.7); }
                    70% { box-shadow: 0 0 0 12px rgba(99, 102, 241, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(99, 102, 241, 0); }
                }
            </style>
            <!-- Top Right Actions -->
            <div style="display: flex; align-items: center;">
                <!-- Prominent AI Assistant Button -->
                <button onclick="window.handleNavClick('ai-assistant')" style="margin-left: 20px; border: none; cursor: pointer; display: flex; align-items: center; gap: 10px; padding: 8px 20px 8px 8px; border-radius: 100px; background: linear-gradient(135deg, #6366F1, #8B5CF6); color: #FFFFFF; font-weight: 700; font-size: 14px; transition: all 0.3s ease; animation: pulseGlow 2s infinite;" onmouseover="this.style.transform='translateY(-2px)'" onmouseout="this.style.transform='translateY(0)'" title="Personal AI Assistant">
                    <div style="width: 32px; height: 32px; background: #FFFFFF; border-radius: 50%; display: flex; justify-content: center; align-items: center; overflow: hidden; padding: 2px;">
                        <img src="assets/waving_robot.png" alt="AI Assistant" style="width: 100%; height: 100%; object-fit: contain;">
                    </div>
                    Ask AI Assistant ✨
                </button>

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
