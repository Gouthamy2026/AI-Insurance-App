export const ActivityItem = ({ title, timestamp, icon, onClickId }) => {
    return `
        <div style="display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #F3F4F6;">
            <div style="width: 36px; height: 36px; border-radius: 8px; background: rgba(255, 138, 101, 0.1); color: var(--primary); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                ${icon}
            </div>
            <div style="flex: 1;">
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #1F2937; font-weight: 600;">${title}</p>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 12px; color: #6B7280;">${timestamp}</span>
                    <span style="font-size: 12px; color: var(--primary); font-weight: 600; cursor: pointer;" onclick="handleNavClick('${onClickId}')">View</span>
                </div>
            </div>
        </div>
    `;
};
