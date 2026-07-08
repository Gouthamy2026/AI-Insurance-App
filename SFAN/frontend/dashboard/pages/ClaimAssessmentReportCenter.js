export const ClaimAssessmentReportCenter = () => {
    // 1. Initialize State
    const existingState = window.ClaimAssessmentReportState;
    const initialState = existingState || {
        isAnalyzing: false,
        isAnalyzed: false,
        loadingStep: 0,
        errorMessage: '',
        errorStatus: null,
        configLoaded: false,
        namespaces: [],
        providers: [],
        claimTypes: [
            { id: 'Health Insurance', label: 'Health Insurance' },
            { id: 'Vehicle Insurance', label: 'Vehicle Insurance' },
            { id: 'Property Insurance', label: 'Property Insurance' },
            { id: 'Travel Insurance', label: 'Travel Insurance' },
            { id: 'Life Insurance', label: 'Life Insurance' }
        ],
        policyType: '',
        claimType: '',
        provider: '',
        scenario: '',
        report: null
    };
    
    window.ClaimAssessmentReportState = initialState;
    const s = window.ClaimAssessmentReportState;
    
    // 2. Define Actions
    window.ClaimAssessmentReportActions = {
        loadConfig: async () => {
            if (s.configLoaded) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://127.0.0.1:8000/claim-assessment/config', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if (res.ok) {
                    const data = await res.json();
                    s.namespaces = data.namespaces || [];
                    s.providers = (data.providers || []).map(p => ({id: p, label: p}));
                    s.configLoaded = true;
                    document.getElementById('dashboard-root').innerHTML = ClaimAssessmentReportCenter();
                } else {
                    s.errorStatus = res.status;
                    s.errorMessage = 'Failed to load configuration.';
                    s.configLoaded = true;
                    document.getElementById('dashboard-root').innerHTML = ClaimAssessmentReportCenter();
                }
            } catch(e) {
                s.errorStatus = 500;
                s.errorMessage = 'Network error: Backend server is unreachable.';
                s.configLoaded = true;
                document.getElementById('dashboard-root').innerHTML = ClaimAssessmentReportCenter();
            }
        },
        
        updateField: (field, value) => {
            s[field] = value;
            if (field === 'scenario') {
                const charCount = document.getElementById('char-count');
                if (charCount) charCount.innerText = `${value.length} / 2000`;
            }
        },
        
        reset: (e) => {
            if(e) e.preventDefault();
            window.ClaimAssessmentReportState = {
                ...initialState,
                configLoaded: s.configLoaded,
                namespaces: s.namespaces,
                providers: s.providers,
                claimTypes: s.claimTypes
            };
            document.getElementById('dashboard-root').innerHTML = ClaimAssessmentReportCenter();
        },
        
        analyze: async (e) => {
            if (e) e.preventDefault();
            
            // Read from DOM
            s.claimType = document.getElementById('input-claim-type').value;
            s.policyType = document.getElementById('input-policy-type').value;
            s.provider = document.getElementById('input-provider').value;
            s.scenario = document.getElementById('input-scenario').value;
            
            // Validation
            if (!s.claimType || !s.policyType || !s.provider || !s.scenario) {
                s.errorStatus = 400;
                s.errorMessage = 'All fields are required. Please fill out the form completely.';
                document.getElementById('dashboard-root').innerHTML = ClaimAssessmentReportCenter();
                return;
            }
            if (s.scenario.trim().length < 10) {
                s.errorStatus = 400;
                s.errorMessage = 'Scenario description must be at least 10 characters long.';
                document.getElementById('dashboard-root').innerHTML = ClaimAssessmentReportCenter();
                return;
            }
            
            s.isAnalyzing = true;
            s.isAnalyzed = false;
            s.errorMessage = '';
            s.errorStatus = null;
            s.loadingStep = 1;
            document.getElementById('dashboard-root').innerHTML = ClaimAssessmentReportCenter();
            
            const loadingInterval = setInterval(() => {
                if (s.loadingStep < 3 && s.isAnalyzing) {
                    s.loadingStep += 1;
                    const stepEl = document.getElementById('loading-text');
                    if (stepEl) stepEl.innerText = window.ClaimAssessmentReportActions.getLoadingText(s.loadingStep);
                }
            }, 1500);
            
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://127.0.0.1:8000/claim-assessment/report', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
                    body: JSON.stringify({
                        policy_type: s.policyType,
                        claim_type: s.claimType,
                        insurance_provider: s.provider,
                        scenario_description: s.scenario
                    })
                });
                
                const data = await response.json();
                clearInterval(loadingInterval);
                
                if (!response.ok) {
                    s.isAnalyzing = false;
                    s.errorStatus = response.status;
                    s.errorMessage = data.detail || 'An unexpected error occurred.';
                    document.getElementById('dashboard-root').innerHTML = ClaimAssessmentReportCenter();
                    return;
                }
                
                s.isAnalyzing = false;
                s.isAnalyzed = true;
                s.report = data;
                document.getElementById('dashboard-root').innerHTML = ClaimAssessmentReportCenter();
                
            } catch (err) {
                clearInterval(loadingInterval);
                s.isAnalyzing = false;
                s.errorStatus = 503;
                s.errorMessage = 'Database Unreachable. The server did not respond.';
                document.getElementById('dashboard-root').innerHTML = ClaimAssessmentReportCenter();
            }
        },
        
        getLoadingText: (step) => {
            const steps = [
                "Initializing...",
                "Generating Embeddings...",
                "Searching Database...",
                "Analyzing Claim..."
            ];
            return steps[step] || "Processing...";
        }
    };
    
    if(!s.configLoaded) {
        window.ClaimAssessmentReportActions.loadConfig();
    }
    
    // UI Helpers
    const renderError = () => {
        if(!s.errorMessage) return '';
        return `
            <div style="background: #FEE2E2; border-left: 4px solid #DC2626; padding: 16px; margin-top: 16px; border-radius: 8px;">
                <h4 style="color: #DC2626; margin: 0 0 8px 0; font-weight: 700;">Error (HTTP ${s.errorStatus})</h4>
                <p style="color: #4B5563; margin: 0; font-size: 14px;">${s.errorMessage}</p>
            </div>
        `;
    };
    
    const cardStyle = `background: rgba(255, 255, 255, 1); border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); padding: 32px;`;
    
    return `
        <div style="font-family: 'Inter', system-ui, sans-serif; padding: 40px; color: #1F2937; width: 100%; min-height: 100vh; background: #F8FAFC; box-sizing: border-box;">
            <div style="max-width: 1000px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px;">
                
                <!-- Header -->
                <div style="border-bottom: 2px solid #E2E8F0; padding-bottom: 16px;">
                    <h1 style="font-size: 28px; font-weight: 800; color: #0F172A; margin: 0;">Claim Assessment Report Center</h1>
                    <p style="color: #64748B; font-size: 15px; margin: 4px 0 0 0;">AI-Powered Claim Adjudication and Eligibility Review</p>
                </div>
                
                <!-- Form Section -->
                <div style="${cardStyle}">
                    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0 0 24px 0; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px;">INPUT PARAMETERS</h2>
                    
                    ${!s.configLoaded ? `
                        <div style="text-align: center; padding: 40px; color: #64748B;">Loading Configuration...</div>
                    ` : `
                    <form onsubmit="window.ClaimAssessmentReportActions.analyze(event)" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                        
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px;">CLAIM TYPE</label>
                            <select id="input-claim-type" style="width: 100%; padding: 12px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px;">
                                <option value="">Select Claim Type...</option>
                                ${s.claimTypes.map(c => `<option value="${c.id}" ${s.claimType === c.id ? 'selected' : ''}>${c.label}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px;">POLICY CATEGORY</label>
                            <select id="input-policy-type" style="width: 100%; padding: 12px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px;">
                                <option value="">Select Policy...</option>
                                ${s.namespaces.map(n => `<option value="${n.id}" ${s.policyType === n.id ? 'selected' : ''}>${n.label}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div>
                            <label style="display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px;">INSURANCE PROVIDER</label>
                            <select id="input-provider" style="width: 100%; padding: 12px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px;">
                                <option value="">Select Provider...</option>
                                ${s.providers.map(p => `<option value="${p.id}" ${s.provider === p.id ? 'selected' : ''}>${p.label}</option>`).join('')}
                            </select>
                        </div>
                        
                        <div style="grid-column: span 3;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                <label style="font-size: 13px; font-weight: 700; color: #374151;">SCENARIO DESCRIPTION</label>
                                <span id="char-count" style="font-size: 12px; color: #64748B;">${s.scenario.length} / 2000</span>
                            </div>
                            <textarea id="input-scenario" onkeyup="window.ClaimAssessmentReportActions.updateField('scenario', this.value)" rows="5" maxlength="2000" placeholder="Enter claim scenario details..." style="width: 100%; padding: 12px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 14px; box-sizing: border-box; font-family: inherit;">${s.scenario}</textarea>
                        </div>
                        
                        <div style="grid-column: span 3;">
                            ${renderError()}
                            <div style="display: flex; justify-content: flex-end; gap: 16px; margin-top: 16px;">
                                <button type="button" onclick="window.ClaimAssessmentReportActions.reset(event)" style="padding: 12px 24px; background: transparent; border: 1px solid #CBD5E1; border-radius: 8px; cursor: pointer; font-weight: 600;" ${s.isAnalyzing ? 'disabled' : ''}>Clear</button>
                                <button type="button" onclick="window.ClaimAssessmentReportActions.analyze(event)" style="padding: 12px 32px; background: #0F172A; color: #FFF; border: none; border-radius: 8px; cursor: ${s.isAnalyzing ? 'not-allowed' : 'pointer'}; font-weight: 600;" ${s.isAnalyzing ? 'disabled' : ''}>
                                    ${s.isAnalyzing ? 'Analyzing...' : 'Generate Assessment Report'}
                                </button>
                            </div>
                        </div>
                    </form>
                    `}
                </div>
                
                <!-- Loading State -->
                ${s.isAnalyzing ? `
                <div style="${cardStyle} text-align: center;">
                    <h3 style="font-size: 20px; font-weight: 700; color: #0F172A;">Analyzing Claim Parameters</h3>
                    <p id="loading-text" style="color: #64748B; margin-top: 8px;">${window.ClaimAssessmentReportActions.getLoadingText(s.loadingStep)}</p>
                </div>
                ` : ''}
                
                <!-- Generated Report -->
                ${s.isAnalyzed && s.report ? `
                <div style="background: #FFF; border-radius: 12px; border: 1px solid #E2E8F0; padding: 40px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
                    <h2 style="font-size: 24px; font-weight: 800; border-bottom: 2px solid #0F172A; padding-bottom: 12px; margin-bottom: 32px;">Claim Assessment Report</h2>
                    
                    <div style="display: flex; flex-direction: column; gap: 24px;">
                        <div>
                            <h3 style="font-size: 14px; font-weight: 800; color: #64748B; text-transform: uppercase;">1. Claim Summary</h3>
                            <p style="font-size: 16px; margin-top: 8px;">${s.report.claim_summary}</p>
                        </div>
                        
                        <div>
                            <h3 style="font-size: 14px; font-weight: 800; color: #64748B; text-transform: uppercase;">2. Eligibility Review</h3>
                            <p style="font-size: 16px; margin-top: 8px;">${s.report.claim_eligibility_review}</p>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                            <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; border: 1px solid #BBF7D0;">
                                <h3 style="font-size: 14px; font-weight: 800; color: #166534; text-transform: uppercase;">3. Approval Probability</h3>
                                <p style="font-size: 16px; color: #15803D; margin-top: 8px;">${s.report.approval_probability}</p>
                            </div>
                            <div style="background: #FEF2F2; padding: 20px; border-radius: 8px; border: 1px solid #FECACA;">
                                <h3 style="font-size: 14px; font-weight: 800; color: #991B1B; text-transform: uppercase;">4. Risk Analysis</h3>
                                <p style="font-size: 16px; color: #B91C1C; margin-top: 8px;">${s.report.risk_analysis}</p>
                            </div>
                        </div>
                        
                        <div>
                            <h3 style="font-size: 14px; font-weight: 800; color: #64748B; text-transform: uppercase;">5. Policy Coverage Review</h3>
                            <p style="font-size: 16px; margin-top: 8px; font-family: Georgia, serif; font-style: italic; background: #F8FAFC; padding: 16px; border-left: 4px solid #CBD5E1;">"${s.report.policy_coverage_review}"</p>
                        </div>
                        
                        <div>
                            <h3 style="font-size: 14px; font-weight: 800; color: #64748B; text-transform: uppercase;">6. Compliance Review</h3>
                            <p style="font-size: 16px; margin-top: 8px;">${s.report.compliance_review}</p>
                        </div>
                        
                        <div>
                            <h3 style="font-size: 14px; font-weight: 800; color: #64748B; text-transform: uppercase;">7. Documentation Checklist</h3>
                            <ul style="margin-top: 8px; padding-left: 20px;">
                                ${s.report.documentation_checklist.map(d => `<li style="font-size: 16px; margin-bottom: 4px;">${d}</li>`).join('')}
                            </ul>
                        </div>
                        
                        <div style="background: #EFF6FF; padding: 20px; border-radius: 8px; border: 1px solid #BFDBFE;">
                            <h3 style="font-size: 14px; font-weight: 800; color: #1E40AF; text-transform: uppercase;">8. AI Recommendations</h3>
                            <p style="font-size: 16px; color: #1D4ED8; margin-top: 8px;">${s.report.ai_recommendations}</p>
                        </div>
                        
                        <div style="background: #0F172A; color: #FFF; padding: 24px; border-radius: 8px; text-align: center;">
                            <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; color: #94A3B8;">9. Final Assessment</h3>
                            <p style="font-size: 20px; font-weight: 700; margin-top: 12px;">${s.report.final_assessment}</p>
                        </div>
                        
                    </div>
                </div>
                ` : ''}
            </div>
        </div>
    `;
};
