export const Profile = (user) => {
    // Professional IT SaaS look
    return `
        <div style="animation: fadeIn 0.3s ease; max-width: 900px; margin: 0 auto;">
            <div style="border-bottom: 1px solid #E5E7EB; padding-bottom: 16px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <h1 style="font-size: 24px; font-weight: 600; color: #111827; margin: 0 0 4px 0; letter-spacing: -0.5px;">User Profile</h1>
                    <p style="color: #6B7280; font-size: 14px; margin: 0;">Manage your personal information and security preferences.</p>
                </div>
                <button style="background: #111827; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; transition: background 0.2s;">Save Changes</button>
            </div>
            
            <div style="display: grid; grid-template-columns: 250px 1fr; gap: 40px;">
                <!-- Avatar Section -->
                <div style="display: flex; flex-direction: column; align-items: flex-start;">
                    <div style="width: 128px; height: 128px; border-radius: 8px; background: #F3F4F6; border: 1px solid #E5E7EB; display: flex; justify-content: center; align-items: center; color: #6B7280; font-size: 40px; font-weight: 600; margin-bottom: 16px;">
                        ${(user.fullName || user.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <button style="background: white; border: 1px solid #D1D5DB; color: #374151; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; width: 128px; cursor: pointer;">Upload Image</button>
                </div>
                
                <!-- Details Section -->
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px;">Full Name</label>
                            <input type="text" value="${user.fullName || ''}" placeholder="Enter your name" style="width: 100%; padding: 8px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; color: #111827; outline: none; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3B82F6'" onblur="this.style.borderColor='#D1D5DB'">
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px;">Email Address</label>
                            <input type="email" value="${user.email || ''}" disabled style="width: 100%; padding: 8px 12px; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 14px; color: #6B7280; background: #F9FAFB; box-sizing: border-box; cursor: not-allowed;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px;">Role / Access Level</label>
                            <input type="text" value="${user.role || 'Standard'}" disabled style="width: 100%; padding: 8px 12px; border: 1px solid #E5E7EB; border-radius: 6px; font-size: 14px; color: #6B7280; background: #F9FAFB; box-sizing: border-box; cursor: not-allowed;">
                        </div>
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 500; color: #374151; margin-bottom: 6px;">Organization</label>
                            <input type="text" placeholder="Optional" style="width: 100%; padding: 8px 12px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 14px; color: #111827; outline: none; box-sizing: border-box;">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
};
