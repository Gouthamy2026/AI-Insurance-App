export const Notifications = () => {
    return `
        <div style="animation: fadeIn 0.3s ease; max-width: 900px; margin: 0 auto;">
            <div style="border-bottom: 1px solid #E5E7EB; padding-bottom: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 4px 0; letter-spacing: -0.5px;">Notifications</h1>
                    <p style="color: #6B7280; font-size: 14px; margin: 0;">System alerts and application updates.</p>
                </div>
                <button disabled style="background: #F3F4F6; color: #9CA3AF; border: 1px solid #E5E7EB; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: not-allowed;">Mark all read</button>
            </div>
            
            <div style="border: 1px dashed #D1D5DB; border-radius: 8px; padding: 48px; text-align: center; background: #F9FAFB;">
                <svg style="margin: 0 auto 12px auto; color: #9CA3AF;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #374151;">No new notifications</h3>
                <p style="margin: 0; font-size: 13px; color: #6B7280;">You're all caught up. We'll notify you when system events occur.</p>
            </div>
        </div>
    `;
};
