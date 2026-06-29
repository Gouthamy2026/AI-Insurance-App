export const InsuranceLocker = () => {
    // Initialize Actions
    if (!window.InsuranceLockerActions) {
        window.InsuranceLockerActions = {
            toggleForm: () => {
                const form = document.getElementById('locker-upload-form');
                form.style.display = form.style.display === 'none' ? 'block' : 'none';
            },
            upload: () => {
                const name = document.getElementById('pol-name').value.trim();
                const type = document.getElementById('pol-type').value;
                const insurer = document.getElementById('pol-insurer').value.trim();
                const number = document.getElementById('pol-number').value.trim();
                const expiry = document.getElementById('pol-expiry').value;
                
                if (!name || !type || !insurer || !number || !expiry) {
                    alert('Please fill out all fields to record the policy.');
                    return;
                }
                
                const policies = JSON.parse(localStorage.getItem('sfan_policies') || '[]');
                policies.push({ id: Date.now(), name, type, insurer, number, expiry, dateAdded: new Date().toISOString() });
                localStorage.setItem('sfan_policies', JSON.stringify(policies));
                
                // Refresh
                document.getElementById('dashboard-root').innerHTML = InsuranceLocker();
            },
            delete: (id) => {
                if (confirm('Permanently delete this policy record?')) {
                    let policies = JSON.parse(localStorage.getItem('sfan_policies') || '[]');
                    policies = policies.filter(p => p.id !== id);
                    localStorage.setItem('sfan_policies', JSON.stringify(policies));
                    document.getElementById('dashboard-root').innerHTML = InsuranceLocker();
                }
            },
            search: (query) => {
                const rows = document.querySelectorAll('.policy-row');
                const q = query.toLowerCase();
                rows.forEach(row => {
                    if (row.innerText.toLowerCase().includes(q)) {
                        row.style.display = '';
                    } else {
                        row.style.display = 'none';
                    }
                });
            },
            view: (name) => alert('Viewing document: ' + name),
            download: (name) => alert('Downloading document: ' + name),
            analyze: (name) => {
                // Mock action for selecting policy for analysis
                localStorage.setItem('sfan_selected_analysis_policy', name);
                alert(name + ' has been selected for Claim Outcome Analysis.');
            }
        };
    }

    const policies = JSON.parse(localStorage.getItem('sfan_policies') || '[]');

    const tableRows = policies.length === 0 
        ? `<tr><td colspan="6" style="text-align: center; padding: 48px; color: #6B7280;">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; color: #9CA3AF;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
             <p style="margin: 0; font-size: 15px; font-weight: 500; color: #374151;">No policies found in your locker.</p>
             <p style="margin: 4px 0 0 0; font-size: 13px;">Upload your first policy document above.</p>
           </td></tr>`
        : policies.map(p => `
            <tr class="policy-row" style="border-bottom: 1px solid #E5E7EB; transition: background 0.2s;" onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='white'">
                <td style="padding: 16px; font-size: 14px; font-weight: 600; color: #111827; display: flex; align-items: center; gap: 8px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    ${p.name}
                </td>
                <td style="padding: 16px; font-size: 13px; color: #4B5563;"><span style="background: #F3F4F6; padding: 4px 8px; border-radius: 4px;">${p.type}</span></td>
                <td style="padding: 16px; font-size: 14px; color: #111827;">${p.insurer}</td>
                <td style="padding: 16px; font-size: 13px; color: #6B7280; font-family: monospace;">${p.number}</td>
                <td style="padding: 16px; font-size: 14px; color: #111827;">${p.expiry}</td>
                <td style="padding: 16px; font-size: 13px; text-align: right;">
                    <button onclick="window.InsuranceLockerActions.view('${p.name}')" style="background: none; border: none; color: #3B82F6; cursor: pointer; font-weight: 500; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#EFF6FF'" onmouseout="this.style.background='transparent'" title="View Policy"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                    <button onclick="window.InsuranceLockerActions.download('${p.name}')" style="background: none; border: none; color: #10B981; cursor: pointer; font-weight: 500; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#ECFDF5'" onmouseout="this.style.background='transparent'" title="Download"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>
                    <button onclick="window.InsuranceLockerActions.analyze('${p.name}')" style="background: none; border: none; color: #8B5CF6; cursor: pointer; font-weight: 500; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#F5F3FF'" onmouseout="this.style.background='transparent'" title="Select for Analysis"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg></button>
                    <button onclick="window.InsuranceLockerActions.delete(${p.id})" style="background: none; border: none; color: #EF4444; cursor: pointer; font-weight: 500; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='transparent'" title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
            </tr>
        `).join('');

    return `
        <div style="animation: fadeIn 0.3s ease; padding: 0 20px; font-family: 'Inter', system-ui, sans-serif; max-width: 1200px; margin: 0 auto;">
            <!-- Header -->
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 24px;">
                <div>
                    <h1 style="font-size: 26px; font-weight: 700; color: #111827; margin: 0 0 6px 0; display: flex; align-items: center; gap: 10px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #3B82F6;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Insurance Locker
                    </h1>
                    <p style="color: #6B7280; font-size: 14px; margin: 0;">Secure repository for all your policy documents.</p>
                </div>
                <div style="display: flex; gap: 12px; align-items: center;">
                    <div style="position: relative;">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2" style="position: absolute; left: 10px; top: 10px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <input type="text" placeholder="Search policies..." onkeyup="window.InsuranceLockerActions.search(this.value)" style="padding: 8px 12px 8px 34px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='#3B82F6'" onblur="this.style.borderColor='#D1D5DB'">
                    </div>
                    <button onclick="window.InsuranceLockerActions.toggleForm()" style="background: #111827; color: white; border: none; padding: 9px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; gap: 8px;" onmouseover="this.style.background='#374151'" onmouseout="this.style.background='#111827'">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                        Upload Policy
                    </button>
                </div>
            </div>

            <!-- Upload Form (Hidden by default) -->
            <div id="locker-upload-form" style="display: none; border: 1px solid #E5E7EB; border-radius: 8px; background: #F9FAFB; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #111827;">Add New Policy Record</h3>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px;">
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Policy Document</label>
                        <input type="file" style="width: 100%; font-size: 13px; color: #4B5563; padding: 6px 0;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Policy Name *</label>
                        <input id="pol-name" type="text" placeholder="e.g., Family Health Plan" style="width: 100%; padding: 8px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; outline: none; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Policy Type *</label>
                        <select id="pol-type" style="width: 100%; padding: 8px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; outline: none; box-sizing: border-box; background: white;">
                            <option value="Health">Health</option>
                            <option value="Life">Life</option>
                            <option value="Auto">Auto</option>
                            <option value="Home">Home</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Insurer Name *</label>
                        <input id="pol-insurer" type="text" placeholder="e.g., BlueCross" style="width: 100%; padding: 8px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; outline: none; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Policy Number *</label>
                        <input id="pol-number" type="text" placeholder="e.g., POL-12345" style="width: 100%; padding: 8px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; outline: none; box-sizing: border-box;">
                    </div>
                    <div>
                        <label style="display: block; font-size: 12px; font-weight: 600; color: #374151; margin-bottom: 6px;">Expiry Date *</label>
                        <input id="pol-expiry" type="date" style="width: 100%; padding: 8px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 13px; outline: none; box-sizing: border-box;">
                    </div>
                </div>
                <div style="display: flex; justify-content: flex-end; gap: 12px;">
                    <button onclick="window.InsuranceLockerActions.toggleForm()" style="background: white; color: #374151; border: 1px solid #D1D5DB; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">Cancel</button>
                    <button onclick="window.InsuranceLockerActions.upload()" style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">Save Record</button>
                </div>
            </div>

            <!-- Table -->
            <div style="border: 1px solid #E5E7EB; border-radius: 8px; background: white; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
                            <th style="padding: 12px 16px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Policy Name</th>
                            <th style="padding: 12px 16px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Type</th>
                            <th style="padding: 12px 16px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Insurer</th>
                            <th style="padding: 12px 16px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Policy Number</th>
                            <th style="padding: 12px 16px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px;">Expiry Date</th>
                            <th style="padding: 12px 16px; font-size: 12px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Actions</th>
                        </tr>
                    </thead>
                    <tbody id="policies-table-body">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
};
