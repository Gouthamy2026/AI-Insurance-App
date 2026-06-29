export const ReminderItem = ({ title, status }) => {
    
    let badgeColor = '';
    let badgeBg = '';
    let statusText = status.toUpperCase();

    switch(status.toLowerCase()) {
        case 'upcoming':
            badgeColor = '#3B82F6';
            badgeBg = '#EFF6FF';
            break;
        case 'pending':
            badgeColor = '#F59E0B';
            badgeBg = '#FFFBEB';
            break;
        case 'completed':
            badgeColor = '#10B981';
            badgeBg = '#ECFDF5';
            break;
        default:
            badgeColor = '#6B7280';
            badgeBg = '#F3F4F6';
    }

    return `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #F9FAFB; border: 1px solid #E5E7EB; border-radius: 8px; margin-bottom: 8px;">
            <div style="font-size: 14px; font-weight: 500; color: #374151;">
                ${title}
            </div>
            <div style="font-size: 11px; font-weight: 700; color: ${badgeColor}; background: ${badgeBg}; padding: 4px 10px; border-radius: 9999px;">
                ${statusText}
            </div>
        </div>
    `;
};
