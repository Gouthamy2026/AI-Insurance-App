export const PremiumTrend = (dynamicData = null) => {
    
    // Fallback if no data yet
    const data = dynamicData && dynamicData.length > 0 ? dynamicData : [
        { month: "Jan", docs: 0 }, { month: "Feb", docs: 0 }, 
        { month: "Mar", docs: 0 }, { month: "Apr", docs: 0 }, 
        { month: "May", docs: 0 }, { month: "Jun", docs: 0 }
    ];

    // Find max value to scale the chart dynamically. Min height of 5.
    const maxVal = Math.max(5, ...data.map(d => d.docs)) * 1.2;

    const bars = data.map(item => {
        const height = (item.docs / maxVal) * 100;
        
        return `
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px; width: 40px; flex-shrink: 0;">
                <div style="display: flex; align-items: flex-end; justify-content: center; height: 160px; width: 100%;">
                    <!-- Trend Bar -->
                    <div title="Policies Uploaded: ${item.docs}" style="width: 32px; height: ${height}%; background: #8B5CF6; border-radius: 4px 4px 0 0; transition: height 1s ease-out; cursor: pointer;"></div>
                </div>
                <span style="font-size: 12px; color: #6B7280; font-weight: 500;">${item.month}</span>
            </div>
        `;
    }).join('');

    return `
        <div style="width: 100%; display: flex; flex-direction: column; height: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="font-size: 16px; color: #1F2937; font-weight: 700; margin: 0;">Premium Trend</h3>
                <select style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #4B5563; background: #fff; cursor: pointer;">
                    <option>Yearly</option>
                </select>
            </div>
            
            <div style="display: flex; flex: 1; margin-top: 10px; position: relative; padding-bottom: 20px;">
                
                <!-- Y-Axis Labels -->
                <div style="display: flex; flex-direction: column; justify-content: space-between; height: 160px; padding-right: 16px; border-right: 1px solid #F3F4F6; color: #9CA3AF; font-size: 11px; font-weight: 500; text-align: right;">
                    <span>${Math.round(maxVal)}</span>
                    <span>${Math.round(maxVal * 0.66)}</span>
                    <span>${Math.round(maxVal * 0.33)}</span>
                    <span>0</span>
                </div>

                <!-- Chart Area Container -->
                <div style="flex: 1; overflow-x: auto; overflow-y: hidden; padding-bottom: 8px; scrollbar-width: none; -ms-overflow-style: none;">
                    <style>.premium-scroll-area::-webkit-scrollbar { display: none; }</style>
                    <!-- Chart Area -->
                    <div class="premium-scroll-area" style="display: flex; align-items: flex-end; width: max-content; min-width: 100%; padding-left: 16px; padding-right: 16px; gap: 12px; justify-content: space-between;">
                        ${bars}
                    </div>
                </div>
            </div>

            <div style="text-align: right; padding-top: 16px; border-top: 1px solid #F3F4F6;">
                <a href="#" style="color: #6366F1; font-size: 13px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                    View full analytics &rarr;
                </a>
            </div>
        </div>
    `;
};
