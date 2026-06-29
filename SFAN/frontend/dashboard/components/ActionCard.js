export const ActionCard = ({ title, description, icon, actionText, onClickId }) => {
    return `
        <div class="glass-card" style="padding: 20px; display: flex; flex-direction: column; justify-content: space-between; height: 100%; transition: all 0.3s; cursor: pointer; border: 1px solid #E5E7EB;" onclick="handleNavClick('${onClickId}')" onmouseover="this.style.borderColor='var(--primary)'; this.style.transform='translateY(-4px)';" onmouseout="this.style.borderColor='#E5E7EB'; this.style.transform='translateY(0)';">
            <div>
                <div style="width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, var(--primary), #FF9A76); color: white; display: flex; align-items: center; justify-content: center; margin-bottom: 16px; box-shadow: 0 4px 10px rgba(255, 122, 89, 0.3);">
                    ${icon}
                </div>
                <h3 style="font-size: 18px; font-weight: 700; color: #1F2937; margin-bottom: 8px;">${title}</h3>
                <p style="font-size: 13px; color: #6B7280; line-height: 1.5; margin-bottom: 20px;">${description}</p>
            </div>
            <div style="font-size: 14px; font-weight: 600; color: var(--primary); display: flex; align-items: center; gap: 4px;">
                ${actionText} 
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
            </div>
        </div>
    `;
};
