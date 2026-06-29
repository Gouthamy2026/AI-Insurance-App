export const InsuranceJourney = () => {
    // Array of mock timeline events as requested
    const journeyEvents = [
        {
            title: "Policy Creation",
            date: "Oct 12, 2023",
            description: "Family Health Plan policy was generated and successfully issued.",
            status: "Completed",
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`,
            color: "emerald"
        },
        {
            title: "Premium Payment",
            date: "Oct 15, 2023",
            description: "Initial annual premium payment of $1,250 processed.",
            status: "Completed",
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>`,
            color: "emerald"
        },
        {
            title: "Claim Submission",
            date: "Jan 04, 2024",
            description: "Medical expense claim #CLM-8832 submitted for outpatient care.",
            status: "Completed",
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>`,
            color: "emerald"
        },
        {
            title: "Claim Status Update",
            date: "Jan 18, 2024",
            description: "Claim #CLM-8832 is currently being assessed by the claims department.",
            status: "In Review",
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
            color: "amber"
        },
        {
            title: "Renewal Reminder",
            date: "Sep 12, 2024",
            description: "Upcoming renewal for Family Health Plan. Review coverage options.",
            status: "Pending",
            icon: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>`,
            color: "gray"
        }
    ];

    const getStatusStyles = (status) => {
        switch(status) {
            case 'Completed': return 'background: #ECFDF5; color: #059669; border: 1px solid #A7F3D0;';
            case 'In Review': return 'background: #FFFBEB; color: #D97706; border: 1px solid #FDE68A;';
            case 'Pending': return 'background: #F3F4F6; color: #4B5563; border: 1px solid #D1D5DB;';
            default: return 'background: #F3F4F6; color: #4B5563; border: 1px solid #D1D5DB;';
        }
    };

    const getIconStyles = (color) => {
        switch(color) {
            case 'emerald': return 'background: #10B981; color: white; border: 4px solid #ECFDF5; box-shadow: 0 0 0 2px #10B981;';
            case 'amber': return 'background: #F59E0B; color: white; border: 4px solid #FFFBEB; box-shadow: 0 0 0 2px #F59E0B;';
            case 'gray': return 'background: #9CA3AF; color: white; border: 4px solid #F3F4F6; box-shadow: 0 0 0 2px #9CA3AF;';
            default: return 'background: #9CA3AF; color: white;';
        }
    };

    const timelineHTML = journeyEvents.map((event, index) => {
        const isLast = index === journeyEvents.length - 1;
        return `
            <div style="position: relative; display: flex; gap: 24px; padding-bottom: ${isLast ? '0' : '40px'};">
                ${!isLast ? `<div style="position: absolute; left: 24px; top: 48px; bottom: 0; width: 2px; background: #E5E7EB;"></div>` : ''}
                
                <div style="position: relative; z-index: 2; flex-shrink: 0; width: 48px; height: 48px; border-radius: 50%; display: flex; align-items: center; justify-content: center; ${getIconStyles(event.color)} transition: transform 0.2s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
                    ${event.icon}
                </div>
                
                <div style="flex-grow: 1; background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); transition: box-shadow 0.3s ease, transform 0.3s ease;" onmouseover="this.style.boxShadow='0 12px 20px -5px rgba(0,0,0,0.1), 0 8px 10px -5px rgba(0,0,0,0.04)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='0 4px 6px -1px rgba(0,0,0,0.05)'; this.style.transform='none'">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px;">
                        <h3 style="margin: 0; font-size: 18px; font-weight: 700; color: #111827;">${event.title}</h3>
                        <span style="padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; ${getStatusStyles(event.status)}">${event.status}</span>
                    </div>
                    <div style="font-size: 13px; font-weight: 600; color: #6B7280; margin-bottom: 12px; display: flex; align-items: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                        ${event.date}
                    </div>
                    <p style="margin: 0; font-size: 15px; color: #4B5563; line-height: 1.6;">${event.description}</p>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div style="animation: fadeIn 0.4s ease; padding: 0 20px; font-family: 'Inter', system-ui, sans-serif; max-width: 900px; margin: 0 auto;">
            <!-- Header -->
            <div style="text-align: center; margin-bottom: 48px;">
                <h1 style="font-size: 32px; font-weight: 800; color: #111827; margin: 0 0 12px 0; letter-spacing: -0.5px;">Insurance Journey</h1>
                <p style="color: #6B7280; font-size: 16px; margin: 0; max-width: 500px; margin: 0 auto; line-height: 1.5;">A comprehensive chronological view of your insurance activities, from policy inception to renewals.</p>
            </div>
            
            <!-- Timeline Container -->
            <div style="padding-left: 12px; margin-bottom: 60px;">
                ${timelineHTML}
            </div>
        </div>
    `;
};
