export const AiInsights = (dynamicData = null) => {
    
    const insights = dynamicData && dynamicData.length > 0 ? dynamicData : [
        { title: "Welcome to AI Insights", status: "Info" }
    ];

    const renderInsightBox = (insight) => {
        let colors, icon, desc;
        
        if (insight.status === "Completed") {
            colors = { bg: '#F0FDF4', border: '#DCFCE7', iconBg: '#22C55E', text: '#166534', sub: '#15803D' };
            icon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
            desc = "Great! You are all caught up.";
        } else if (insight.status === "Pending") {
            colors = { bg: '#FFFBEB', border: '#FEF3C7', iconBg: 'transparent', text: '#92400E', sub: '#B45309' };
            icon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            desc = "Recommended action based on your profile.";
        } else {
            colors = { bg: '#EFF6FF', border: '#DBEAFE', iconBg: 'transparent', text: '#1E40AF', sub: '#1D4ED8' };
            icon = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
            desc = "Processing your latest documents.";
        }

        return `
            <div style="background: ${colors.bg}; border: 1px solid ${colors.border}; border-radius: 12px; padding: 16px; display: flex; gap: 16px; margin-bottom: 16px;">
                <div style="width: 24px; height: 24px; border-radius: 50%; background: ${colors.iconBg}; display: flex; justify-content: center; align-items: center; flex-shrink: 0; margin-top: 2px;">
                    ${icon}
                </div>
                <div>
                    <div style="color: ${colors.text}; font-size: 14px; font-weight: 700; margin-bottom: 4px;">${insight.title}</div>
                    <div style="color: ${colors.sub}; font-size: 13px;">${desc}</div>
                </div>
            </div>
        `;
    };

    return `
        <div style="width: 100%; display: flex; flex-direction: column; height: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="font-size: 16px; color: #1F2937; font-weight: 700; margin: 0; display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path></svg>
                    AI Insights
                </h3>
                <a href="#" style="color: #6366F1; font-size: 13px; font-weight: 600; text-decoration: none;">View all insights &rarr;</a>
            </div>
            
            <div style="display: flex; flex-direction: column;">
                ${insights.map(i => renderInsightBox(i)).join('')}
            </div>
        </div>
    `;
};
