export const RecentActivity = (dynamicData = null) => {
    
    const activities = dynamicData && dynamicData.length > 0 ? dynamicData : [
        { title: "Welcome", timestamp: "Just now", icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>` }
    ];

    const listHtml = activities.map(act => `
        <div style="display: flex; gap: 16px; align-items: center; padding: 8px 0;">
            <div style="width: 40px; height: 40px; border-radius: 8px; background: #F3F4F6; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                ${act.icon || `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><circle cx="12" cy="12" r="10"></circle></svg>`}
            </div>
            <div style="flex: 1;">
                <div style="color: #1F2937; font-size: 14px; font-weight: 600; margin-bottom: 2px;">${act.title.split(':')[0] || 'Activity'}</div>
                <div style="color: #6B7280; font-size: 13px;">${act.title.split(':')[1] || act.title}</div>
            </div>
            <div style="color: #9CA3AF; font-size: 12px; font-weight: 500;">
                ${act.timestamp}
            </div>
        </div>
    `).join('');

    return `
        <div style="width: 100%; display: flex; flex-direction: column; height: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="font-size: 16px; color: #1F2937; font-weight: 700; margin: 0;">Recent Activity</h3>
                <a href="#" style="color: #6366F1; font-size: 13px; font-weight: 600; text-decoration: none;">View all &rarr;</a>
            </div>
            
            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${listHtml}
            </div>
        </div>
    `;
};
