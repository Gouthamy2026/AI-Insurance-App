export const ModulePlaceholder = ({ moduleId }) => {
    return `
        <section class="module-section active">
            <div class="header-section" style="margin-bottom: 30px;">
                <h1 style="font-size: 28px; font-weight: 800; color: #1F2937; margin-bottom: 8px;">${moduleId.replace('-', ' ').toUpperCase()}</h1>
                <p style="color: #6B7280; font-size: 16px;">This module is under construction. Check back soon for updates.</p>
            </div>
            <div style="display: flex; justify-content: center; align-items: center; height: 300px; border: 2px dashed #E5E7EB; border-radius: 12px; background: #F9FAFB;">
                <p style="color: #9CA3AF; font-size: 18px; font-weight: 500;">Future Module Content Goes Here</p>
            </div>
        </section>
    `;
};
