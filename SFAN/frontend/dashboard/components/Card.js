export const Card = ({ title, value, subtitle, valueColor = '#1F2937', progress, isMissingInfo }) => {
    
    let extraHtml = '';
    
    if (progress !== undefined) {
        extraHtml = `
            <div style="width: 100%; background-color: #E5E7EB; border-radius: 9999px; height: 6px; margin-top: 12px;">
                <div style="background-color: ${valueColor}; height: 6px; border-radius: 9999px; width: ${progress}%;"></div>
            </div>
        `;
    }

    if (isMissingInfo) {
        extraHtml += `
            <div style="display: flex; align-items: center; gap: 6px; margin-top: 12px; color: #DC2626; font-size: 13px; font-weight: 500;">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                Action Required
            </div>
        `;
    }

    return `
        <div class="premium-card" style="display: flex; flex-direction: column; justify-content: space-between; height: 100%;">
            <div>
                <h3 style="font-size: 15px; color: #6B7280; font-weight: 600; margin-bottom: 8px;">${title}</h3>
                <div style="display: flex; align-items: baseline; gap: 8px;">
                    <span style="font-size: 32px; font-weight: 800; color: ${valueColor};">${value}</span>
                    ${subtitle ? `<span style="font-size: 13px; color: #9CA3AF; font-weight: 500;">${subtitle}</span>` : ''}
                </div>
            </div>
            ${extraHtml}
        </div>
    `;
};
