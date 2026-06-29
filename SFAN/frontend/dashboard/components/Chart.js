export const Chart = (trendData = null) => {
    // We will calculate actual usage from local storage to avoid dummy data
    // This provides a real "monthly wise user experience" based on interactions.
    
    const policies = JSON.parse(localStorage.getItem('sfan_policies') || '[]');
    const goals = JSON.parse(localStorage.getItem('sfan_insurance_goals') || '[]');
    
    // Create an array of the last 6 months
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const now = new Date();
    
    let actualData = [];
    
    for (let i = 5; i >= 0; i--) {
        let d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        let mName = monthNames[d.getMonth()];
        let mYear = d.getFullYear();
        let mNum = d.getMonth();

        // Count policies added this month
        let docsCount = policies.filter(p => {
            if(!p.dateAdded) return false;
            let pd = new Date(p.dateAdded);
            return pd.getMonth() === mNum && pd.getFullYear() === mYear;
        }).length;
        
        // Use goals as a proxy for User Actions/AI
        let aiCount = goals.filter(g => {
            if(!g.id) return false;
            let gd = new Date(g.id); // ID is Date.now() timestamp
            return gd.getMonth() === mNum && gd.getFullYear() === mYear;
        }).length;
        
        actualData.push({
            month: mName,
            docs: docsCount,
            ai: aiCount
        });
    }

    const data = actualData;

    // Find max value to scale the chart dynamically. Minimum scale height of 10 to prevent huge bars for small numbers.
    const maxVal = Math.max(10, ...data.map(d => Math.max(d.docs, d.ai))) * 1.2;

    const bars = data.map(item => {
        const hDocs = (item.docs / maxVal) * 100;
        const hAi = (item.ai / maxVal) * 100;

        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 8px; flex: 1;">
                <div style="display: flex; align-items: flex-end; gap: 4px; height: 180px; width: 100%; justify-content: center;">
                    
                    <!-- Docs Bar -->
                    <div title="Policies Uploaded: ${item.docs}" style="width: 14px; height: ${hDocs}%; background: linear-gradient(180deg, #DCC8F4 0%, rgba(220, 200, 244, 0.4) 100%); border-radius: 4px 4px 0 0; transition: height 1s ease-out; cursor: pointer;"></div>
                    
                    <!-- AI Bar -->
                    <div title="Goals Recorded: ${item.ai}" style="width: 14px; height: ${hAi}%; background: linear-gradient(180deg, #FF8A65 0%, rgba(255, 138, 101, 0.4) 100%); border-radius: 4px 4px 0 0; transition: height 1s ease-out; cursor: pointer;"></div>

                </div>
                <span style="font-size: 12px; color: #6B7280; font-weight: 500;">${item.month}</span>
            </div>
        `;
    }).join('');

    return `
        <div style="width: 100%; padding: 10px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="font-size: 16px; color: #374151; font-weight: 700; margin: 0;">Platform Usage Trend</h3>
                <div style="display: flex; gap: 16px; font-size: 12px; font-weight: 500;">
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: #DCC8F4;"></span> Policies Uploaded
                    </div>
                    <div style="display: flex; align-items: center; gap: 6px;">
                        <span style="width: 10px; height: 10px; border-radius: 50%; background: #FF8A65;"></span> Goals Recorded
                    </div>
                </div>
            </div>
            
            <div style="display: flex; align-items: flex-end; width: 100%; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px;">
                ${bars}
            </div>
        </div>
    `;
};
