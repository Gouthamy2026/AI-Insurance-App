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

    let policies = JSON.parse(localStorage.getItem('sfan_policies') || 'null');
    if (!policies || policies.length === 0) {
        policies = [
            { id: 1, name: 'Family Health Plan', type: 'Health', insurer: 'BlueCross', number: 'POL-12345', expiry: '2025-10-12', dateAdded: new Date().toISOString() },
            { id: 2, name: 'Term Life Cover', type: 'Life', insurer: 'Prudential', number: 'PRU-98765', expiry: '2043-05-20', dateAdded: new Date().toISOString() },
            { id: 3, name: 'Auto Comprehensive', type: 'Auto', insurer: 'Geico', number: 'GCO-55443', expiry: '2024-08-15', dateAdded: new Date().toISOString() }
        ];
        localStorage.setItem('sfan_policies', JSON.stringify(policies));
    }
    const tableRows = policies.length === 0
        ? `<tr><td colspan="6" style="text-align: center; padding: 48px; color: #111827;">
             <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin-bottom: 12px; color: #111827;"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="12" y1="18" x2="12" y2="12"></line><line x1="9" y1="15" x2="15" y2="15"></line></svg>
             <p style="margin: 0; font-size: 18px; font-weight: 600; color: #111827;">No policies found in your locker.</p>
             <p style="margin: 4px 0 0 0; font-size: 15px; color: #111827;">Upload your first policy document above.</p>
           </td></tr>`
            : policies.map(p => `
            <tr class="policy-row" style="border-bottom: 1px solid #E5E7EB; transition: background 0.2s;" onmouseover="this.style.background='#F9FAFB'" onmouseout="this.style.background='white'">
                <td style="padding: 16px; font-size: 16px; font-weight: 700; color: #111827; display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                    ${p.name}
                </td>
                <td style="padding: 16px; font-size: 14px; font-weight: 600; color: #111827;"><span style="background: #F3F4F6; padding: 6px 10px; border-radius: 6px;">${p.type}</span></td>
                <td style="padding: 16px; font-size: 15px; font-weight: 500; color: #111827;">${p.insurer}</td>
                <td style="padding: 16px; font-size: 15px; font-weight: 500; color: #111827; font-family: monospace;">${p.number}</td>
                <td style="padding: 16px; font-size: 15px; font-weight: 500; color: #111827;">${p.expiry}</td>
                <td style="padding: 16px; font-size: 14px; text-align: right;">
                    <button type="button" onclick="window.InsuranceLockerActions.view('${p.name}')" style="background: none; border: none; color: #3B82F6; cursor: pointer; font-weight: 500; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#EFF6FF'" onmouseout="this.style.background='transparent'" title="View Policy"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                    <button type="button" onclick="window.InsuranceLockerActions.download('${p.name}')" style="background: none; border: none; color: #10B981; cursor: pointer; font-weight: 500; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#ECFDF5'" onmouseout="this.style.background='transparent'" title="Download"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg></button>
                    <button type="button" onclick="window.InsuranceLockerActions.analyze('${p.name}')" style="background: none; border: none; color: #8B5CF6; cursor: pointer; font-weight: 500; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#F5F3FF'" onmouseout="this.style.background='transparent'" title="Select for Analysis"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 16 16 12 12 8"></polyline><line x1="8" y1="12" x2="16" y2="12"></line></svg></button>
                    <button type="button" onclick="window.InsuranceLockerActions.delete(${p.id})" style="background: none; border: none; color: #EF4444; cursor: pointer; font-weight: 500; padding: 4px 8px; border-radius: 4px; transition: background 0.2s;" onmouseover="this.style.background='#FEF2F2'" onmouseout="this.style.background='transparent'" title="Delete"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg></button>
                </td>
            </tr>
        `).join('');

    return `
        <div style="animation: fadeIn 0.3s ease; padding: 0 20px; font-family: 'Inter', system-ui, sans-serif; max-width: 1200px; margin: 0 auto;">
            <!-- Page Header -->
            <div style="border-bottom: 1px solid #E5E7EB; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h1 style="font-size: 32px; font-weight: 800; color: #111827; margin: 0 0 8px 0; letter-spacing: -0.5px; display: flex; align-items: center; gap: 14px;">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="color: #3B82F6;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                        Insurance Locker
                    </h1>
                    <p style="color: #6B7280; font-size: 14px; font-weight: 500; margin: 0; max-width: 600px; line-height: 1.6;">Your secure, centralized repository. Upload, manage, and analyze all your policy documents in one highly protected vault.</p>
                </div>
            </div>

            <!-- Action Box with Illustration -->
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; background: #F8FAFC; padding: 32px 40px; border-radius: 20px; border: 1px solid #E2E8F0; overflow: hidden; position: relative;">
                <div style="flex: 1; position: relative; z-index: 2;">
                    <div style="display: flex; gap: 16px; align-items: center;">
                        <div style="position: relative;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2" style="position: absolute; left: 14px; top: 12px;"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                            <input type="text" placeholder="Search policies..." onkeyup="window.InsuranceLockerActions.search(this.value)" style="padding: 13px 16px 13px 44px; border: 1px solid #CBD5E1; border-radius: 10px; font-size: 16px; color: #111827; outline: none; transition: all 0.2s; width: 280px; box-shadow: 0 2px 6px rgba(0,0,0,0.02);" onfocus="this.style.borderColor='#3B82F6'; this.style.boxShadow='0 4px 12px rgba(59,130,246,0.1)'" onblur="this.style.borderColor='#CBD5E1'; this.style.boxShadow='0 2px 6px rgba(0,0,0,0.02)'">
                        </div>
                        <button type="button" onclick="window.InsuranceLockerActions.toggleForm()" style="background: #0F172A; color: white; border: none; padding: 13px 26px; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; transition: transform 0.2s, background 0.2s; display: flex; align-items: center; gap: 10px; box-shadow: 0 4px 12px rgba(15,23,42,0.15);" onmouseover="this.style.background='#1E293B'; this.style.transform='translateY(-1px)'" onmouseout="this.style.background='#0F172A'; this.style.transform='translateY(0)'">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            Upload Policy
                        </button>
                    </div>
                </div>
                
                <div style="height: 120px; position: absolute; right: 40px; bottom: 0; z-index: 1;">
                    <img src="assets/locker_illustration.png" alt="Secure Locker Illustration" style="height: 100%; object-fit: contain; mix-blend-mode: multiply; filter: contrast(1.05);">
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
                    <button type="button" onclick="window.InsuranceLockerActions.toggleForm()" style="background: white; color: #374151; border: 1px solid #D1D5DB; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer;">Cancel</button>
                    <button type="button" onclick="window.InsuranceLockerActions.upload()" style="background: #3B82F6; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">Save Record</button>
                </div>
            </div>

            <!-- Table -->
            <div style="border: 1px solid #E5E7EB; border-radius: 8px; background: white; overflow: hidden; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                <table style="width: 100%; border-collapse: collapse; text-align: left;">
                    <thead>
                        <tr style="background: #F9FAFB; border-bottom: 1px solid #E5E7EB;">
                            <th style="padding: 14px 18px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Policy Name</th>
                            <th style="padding: 14px 18px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Type</th>
                            <th style="padding: 14px 18px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Insurer</th>
                            <th style="padding: 14px 18px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Policy Number</th>
                            <th style="padding: 14px 18px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px;">Expiry Date</th>
                            <th style="padding: 14px 18px; font-size: 14px; font-weight: 700; color: #111827; text-transform: uppercase; letter-spacing: 0.5px; text-align: right;">Actions</th>
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
