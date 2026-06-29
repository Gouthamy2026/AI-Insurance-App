export const Settings = () => {
    return `
        <div style="animation: fadeIn 0.3s ease; max-width: 900px; margin: 0 auto;">
            <div style="border-bottom: 1px solid #E5E7EB; padding-bottom: 16px; margin-bottom: 32px;">
                <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 4px 0; letter-spacing: -0.5px;">Settings</h1>
                <p style="color: #6B7280; font-size: 14px; margin: 0;">Configure your application preferences and security.</p>
            </div>
            
            <div style="border: 1px solid #E5E7EB; border-radius: 8px; background: white; overflow: hidden;">
                <!-- Section 1 -->
                <div style="padding: 20px 24px; border-bottom: 1px solid #E5E7EB;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #111827;">Two-Factor Authentication (2FA)</h3>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">Add an extra layer of security to your account.</p>
                        </div>
                        <button style="background: white; border: 1px solid #D1D5DB; color: #374151; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">Enable</button>
                    </div>
                </div>
                <!-- Section 2 -->
                <div style="padding: 20px 24px; border-bottom: 1px solid #E5E7EB;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #111827;">API Access Keys</h3>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">Manage your secret keys for programmatic access.</p>
                        </div>
                        <button style="background: white; border: 1px solid #D1D5DB; color: #374151; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">Manage Keys</button>
                    </div>
                </div>
                <!-- Section 3 -->
                <div style="padding: 20px 24px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <h3 style="margin: 0 0 4px 0; font-size: 14px; font-weight: 600; color: #EF4444;">Danger Zone</h3>
                            <p style="margin: 0; font-size: 13px; color: #6B7280;">Permanently delete your account and all associated data.</p>
                        </div>
                        <button style="background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">Delete Account</button>
                    </div>
                </div>
            </div>
        </div>
    `;
};
