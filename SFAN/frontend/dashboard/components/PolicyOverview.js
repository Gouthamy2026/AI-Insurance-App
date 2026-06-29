export const PolicyOverview = (dynamicData = null) => {
    
    // Fallback if no data yet
    let rawData = dynamicData && dynamicData.length > 0 ? dynamicData : [{ label: 'No Policies', count: 1 }];
    
    // Sort by count descending so highest used is first
    rawData.sort((a, b) => b.count - a.count);

    // Calculate total
    const total = rawData.reduce((acc, curr) => acc + curr.count, 0);

    // Premium monochromatic color palette (Indigo/Purple shades)
    const colors = ['#312E81', '#3730A3', '#4F46E5', '#6366F1', '#818CF8', '#A5B4FC', '#C7D2FE'];

    // Map raw data to stats with percentages and colors
    const stats = rawData.map((item, index) => ({
        label: item.label,
        count: item.count,
        percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
        color: colors[index % colors.length]
    }));
    
    // SVG Donut Logic
    const radius = 60;
    const circumference = 2 * Math.PI * radius;
    let offset = 0;

    const svgCircles = stats.map(stat => {
        if (stat.percentage === 0) return '';
        const dashArray = (stat.percentage / 100) * circumference;
        const dashOffset = -offset;
        offset += dashArray;
        
        return `
            <circle 
                cx="100" cy="100" r="${radius}" 
                fill="transparent" 
                stroke="${stat.color}" 
                stroke-width="24" 
                stroke-dasharray="${dashArray} ${circumference - dashArray}" 
                stroke-dashoffset="${dashOffset}"
                style="transition: all 1s ease-out; transform: rotate(-90deg); transform-origin: 50% 50%;"
            />
        `;
    }).join('');

    const legendHtml = stats.map(stat => `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; font-size: 13px;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${stat.color};"></div>
                <span style="color: #4B5563; font-weight: 500;">${stat.label}</span>
            </div>
            <div style="display: flex; gap: 12px; color: #1F2937; font-weight: 600;">
                <span style="width: 15px; text-align: right;">${stat.count}</span>
                <span style="color: #9CA3AF; width: 45px; text-align: right;">(${stat.percentage}%)</span>
            </div>
        </div>
    `).join('');

    return `
        <div style="width: 100%; display: flex; flex-direction: column; height: 100%;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                <h3 style="font-size: 16px; color: #1F2937; font-weight: 700; margin: 0;">Policy Overview</h3>
                <select style="border: 1px solid #E5E7EB; border-radius: 6px; padding: 4px 10px; font-size: 12px; color: #4B5563; background: #fff; cursor: pointer;">
                    <option>All Policies</option>
                </select>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; flex: 1; padding: 10px 20px;">
                <!-- Donut Chart -->
                <div style="position: relative; width: 200px; height: 200px; display: flex; justify-content: center; align-items: center;">
                    <svg width="200" height="200" viewBox="0 0 200 200" style="position: absolute; top: 0; left: 0;">
                        <!-- Background ring -->
                        <circle cx="100" cy="100" r="${radius}" fill="transparent" stroke="#F3F4F6" stroke-width="24" />
                        ${svgCircles}
                    </svg>
                    <!-- Inner Text -->
                    <div style="text-align: center; z-index: 10;">
                        <div style="font-size: 28px; font-weight: 800; color: #1F2937; line-height: 1;">${total}</div>
                        <div style="font-size: 12px; color: #6B7280; font-weight: 500; margin-top: 4px;">Total</div>
                    </div>
                </div>

                <!-- Legend -->
                <div style="flex: 1; margin-left: 40px; padding-right: 10px; max-height: 200px; overflow-y: auto; scrollbar-width: thin;">
                    <style>
                        .policy-legend-scroll::-webkit-scrollbar { width: 4px; }
                        .policy-legend-scroll::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 4px; }
                    </style>
                    <div class="policy-legend-scroll" style="height: 100%;">
                        ${legendHtml}
                    </div>
                </div>
            </div>

            <div style="text-align: right; margin-top: 10px; padding-top: 16px; border-top: 1px solid #F3F4F6;">
                <a href="#" style="color: #6366F1; font-size: 13px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">
                    View full breakdown &rarr;
                </a>
            </div>
        </div>
    `;
};
