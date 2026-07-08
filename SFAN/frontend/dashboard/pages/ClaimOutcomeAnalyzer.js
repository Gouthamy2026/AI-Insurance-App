export const ClaimOutcomeAnalyzer = () => {
    
    const existingState = window.ClaimAssessmentState;
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
        
        // Search inputs for custom dropdowns
        searchProvider: '',
        searchPolicyType: '',
        searchClaimType: '',
        
        dropdownOpen: null,
        
        report: null,
        
        validation: {
            policyType: true,
            claimType: true,
            provider: true,
            scenario: true
        }
    };
    
    window.ClaimAssessmentState = initialState;
    const s = window.ClaimAssessmentState;
    
    window.ClaimAssessmentActions = {
        loadConfig: async () => {
            if(s.configLoaded) return;
            try {
                const token = localStorage.getItem('token');
                const res = await fetch('http://127.0.0.1:8000/claim-assessment/config', {
                    headers: { 'Authorization': 'Bearer ' + token }
                });
                if(res.ok) {
                    const data = await res.json();
                    s.namespaces = data.namespaces || [];
                    s.providers = (data.providers || []).map(p => ({id: p, label: p}));
                    s.configLoaded = true;
                    document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
                } else {
                    console.error('Config fetch failed:', res.status);
                    s.errorStatus = res.status;
                    s.errorMessage = res.status === 401 ? 'Session expired. Please log in again.' : 'Failed to initialize knowledge base. Please try again.';
                    // Force the UI out of the loading state so the error can be shown
                    s.configLoaded = true;
                    document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
                }
            } catch(e) {
                console.error('Failed to load config:', e);
                s.errorStatus = 500;
                s.errorMessage = 'Network error: Backend server is unreachable.';
                s.configLoaded = true;
                document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
            }
        },
        reset: (e) => {
            if(e) e.preventDefault();
            window.ClaimAssessmentState = {
                ...initialState,
                configLoaded: s.configLoaded,
                namespaces: s.namespaces,
                providers: s.providers,
                claimTypes: s.claimTypes
            };
            document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
        },
        toggleDropdown: (id, e) => {
            if(e) { e.preventDefault(); e.stopPropagation(); }
            s.dropdownOpen = s.dropdownOpen === id ? null : id;
            document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
        },
        selectOption: (field, id, label, e) => {
            if(e) { e.preventDefault(); e.stopPropagation(); }
            s[field] = id;
            s.dropdownOpen = null;
            
            // Auto-route IRDAI
            if(field === 'provider' && id === 'IRDAI Regulatory Knowledge Base') {
                const irdaiNs = s.namespaces.find(n => n.id === 'regulatory_governance');
                if(irdaiNs) s.policyType = irdaiNs.id;
            }
            
            window.ClaimAssessmentActions.validateInline();
            document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
        },
        updateSearch: (field, value, e) => {
            if(e) { e.preventDefault(); e.stopPropagation(); }
            s[field] = value;
            document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
        },
        updateCharCount: () => {
            const el = document.getElementById('scenario');
            if(el) {
                const text = el.value;
                s.scenario = text;
                const charCount = document.getElementById('char-count');
                if(charCount) charCount.innerText = `${text.length} / 2000`;
                s.validation.scenario = text.trim().length >= 10 && text.trim().length <= 2000;
                if(!s.validation.scenario && text.length > 0) el.style.borderColor = '#EF4444';
                else el.style.borderColor = '#D1D5DB';
                
                const btn = document.getElementById('generate-btn');
                if(btn) btn.disabled = !s.validation.scenario;
            }
        },
        validateInline: () => {
            s.validation.policyType = s.policyType.trim() !== '';
            s.validation.claimType = s.claimType.trim() !== '';
            s.validation.provider = s.provider.trim() !== '';
            s.validation.scenario = s.scenario.trim().length >= 10 && s.scenario.trim().length <= 2000;
        },
        analyze: async (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
            s.dropdownOpen = null;
            
            const elScenario = document.getElementById('scenario');
            if(elScenario) s.scenario = elScenario.value;
            
            window.ClaimAssessmentActions.validateInline();
            
            if(!s.validation.policyType || !s.validation.claimType || !s.validation.provider || !s.validation.scenario) {
                document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
                return;
            }
            
            s.isAnalyzing = true;
            s.isAnalyzed = false;
            s.errorMessage = '';
            s.errorStatus = null;
            s.loadingStep = 1;
            document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
            
            const loadingInterval = setInterval(() => {
                if(s.loadingStep < 6 && s.isAnalyzing) {
                    s.loadingStep += 1;
                    const stepEl = document.getElementById('loading-text');
                    if(stepEl) stepEl.innerText = window.ClaimAssessmentActions.getLoadingText(s.loadingStep);
                }
            }, 1200);
            
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
                    document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
                    return;
                }
                
                s.loadingStep = 7;
                document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
                
                setTimeout(() => {
                    s.isAnalyzing = false;
                    s.isAnalyzed = true;
                    s.report = data;
                    document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
                }, 800);
                
            } catch (err) {
                clearInterval(loadingInterval);
                s.isAnalyzing = false;
                s.errorStatus = 500;
                s.errorMessage = 'Network error or server is unreachable.';
                document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
            }
        },
        getLoadingText: (step) => {
            const steps = [
                "",
                "Generating Vector Embeddings...",
                "Scanning SFAN Knowledge Base...",
                "Extracting Relevant Policy Documents...",
                "Validating Pinecone Context Integrity...",
                "Initializing Analyst LLM Logic...",
                "Formatting Final Assessment Report...",
                "Rendering Analyst Document..."
            ];
            return steps[step] || "Processing...";
        }
    };

    if(!s.configLoaded) {
        window.ClaimAssessmentActions.loadConfig();
    }

    const renderError = () => {
        if(!s.errorMessage) return '';
        let title = "Error";
        let color = "#DC2626";
        let bg = "#FEE2E2";
        if(s.errorStatus === 400) { title = "Validation Error"; }
        if(s.errorStatus === 404) { title = "Context Retrieval Error"; color = "#D97706"; bg = "#FEF3C7"; }
        if(s.errorStatus === 500) { title = "System Failure"; }
        if(s.errorStatus === 502 || s.errorStatus === 503) { title = "Service Timeout"; }
        
        return `
            <div style="background: ${bg}; border-left: 4px solid ${color}; padding: 16px; margin-top: 16px; border-radius: 8px; animation: slideIn 0.3s ease;">
                <h4 style="color: ${color}; margin: 0 0 8px 0; font-weight: 700; font-size: 14px; display: flex; align-items: center; gap: 8px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    ${title} (HTTP ${s.errorStatus})
                </h4>
                <p style="color: #4B5563; margin: 0; font-size: 14px;">${s.errorMessage}</p>
            </div>
        `;
    };
    
    const renderCustomDropdown = (id, options, selectedId, searchVal, searchField, label, isValid) => {
        const isOpen = s.dropdownOpen === id;
        const filtered = options.filter(o => o.label.toLowerCase().includes(searchVal.toLowerCase()));
        const selectedLabel = selectedId ? (options.find(o => o.id === selectedId)?.label || 'Selected') : `Select ${label}`;
        
        return `
            <div style="position: relative;">
                <label style="display: block; font-size: 13px; font-weight: 700; color: #374151; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.5px;">${label}</label>
                <div onclick="window.ClaimAssessmentActions.toggleDropdown('${id}', event)" style="width: 100%; padding: 12px 16px; border: 1px solid ${isValid ? '#D1D5DB' : '#EF4444'}; border-radius: 8px; background: #FFFFFF; font-size: 15px; color: ${selectedId ? '#111827' : '#9CA3AF'}; cursor: pointer; display: flex; justify-content: space-between; align-items: center; box-sizing: border-box;">
                    <span style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${selectedLabel}</span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                ${!isValid ? `<span style="color: #EF4444; font-size: 12px; margin-top: 4px; display: block;">${label} is required</span>` : ''}
                
                ${isOpen ? `
                <div style="position: absolute; top: calc(100% + 4px); left: 0; width: 100%; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1); z-index: 50; max-height: 250px; display: flex; flex-direction: column;">
                    <div style="padding: 8px; border-bottom: 1px solid #E5E7EB;">
                        <input type="text" placeholder="Search..." value="${searchVal}" oninput="window.ClaimAssessmentActions.updateSearch('${searchField}', this.value, event)" onclick="(e) => e.stopPropagation()" style="width: 100%; padding: 8px; border: 1px solid #D1D5DB; border-radius: 6px; outline: none; font-size: 14px; box-sizing: border-box;" autofocus>
                    </div>
                    <div style="overflow-y: auto; padding: 4px;">
                        ${filtered.length > 0 ? filtered.map(o => `
                            <div onclick="window.ClaimAssessmentActions.selectOption('${id}', '${o.id}', '${o.label}', event)" style="padding: 10px 12px; border-radius: 4px; cursor: pointer; font-size: 14px; color: #374151; transition: background 0.15s;" onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background='transparent'">
                                ${o.label}
                            </div>
                        `).join('') : `<div style="padding: 10px 12px; font-size: 14px; color: #9CA3AF; text-align: center;">No results found</div>`}
                    </div>
                </div>
                ` : ''}
            </div>
        `;
    };

    const glassCardStyle = `background: rgba(255, 255, 255, 0.95); border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05); padding: 32px;`;

    // Click outside to close dropdowns (hacky inline global listener setup, normally done differently)
    if(s.dropdownOpen) {
        window.onclick = function(e) {
            if(window.ClaimAssessmentState && window.ClaimAssessmentState.dropdownOpen) {
                window.ClaimAssessmentState.dropdownOpen = null;
                document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
            }
        }
    } else {
        window.onclick = null;
    }

    return `
        <div style="font-family: 'Inter', system-ui, sans-serif; padding: 40px 48px 100px 48px; box-sizing: border-box; color: #1F2937; width: 100%; min-height: 100vh; background: #F8FAFC;">
            <div style="width: 100%; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 32px;">

                <!-- Enterprise Header -->
                <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 2px solid #E2E8F0; padding-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 16px;">
                        <div style="background: #0F172A; padding: 12px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.2);">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        </div>
                        <div>
                            <h1 style="font-size: 28px; font-weight: 800; color: #0F172A; margin: 0; letter-spacing: -0.5px;">Claim Assessment Report Center</h1>
                            <p style="color: #64748B; font-size: 15px; margin: 4px 0 0 0; font-weight: 500;">Enterprise AI-Powered Policy Evidential Intelligence</p>
                        </div>
                    </div>
                </div>

                <!-- Input Form Section -->
                <div style="${glassCardStyle} position: relative;">
                    <h2 style="font-size: 18px; font-weight: 700; color: #0F172A; margin: 0 0 24px 0; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #F1F5F9; padding-bottom: 12px;">
                        CLAIM INFORMATION
                    </h2>
                    
                    ${!s.configLoaded ? `
                        <div style="padding: 40px; text-align: center; color: #64748B;">
                            <div class="spinner" style="border-top-color: #0F172A; margin: 0 auto 16px auto;"></div>
                            Initializing Knowledge Base Connections...
                        </div>
                    ` : `
                    <form onsubmit="window.ClaimAssessmentActions.analyze(event)" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                        
                        ${renderCustomDropdown('claimType', s.claimTypes, s.claimType, s.searchClaimType, 'searchClaimType', '1. Claim Type', s.validation.claimType)}
                        ${renderCustomDropdown('policyType', s.namespaces, s.policyType, s.searchPolicyType, 'searchPolicyType', '2. Policy Category', s.validation.policyType)}
                        ${renderCustomDropdown('provider', s.providers, s.provider, s.searchProvider, 'searchProvider', '3. Insurance Provider', s.validation.provider)}

                        <div style="grid-column: span 3; margin-top: 8px;">
                            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                <label style="font-size: 13px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.5px;">4. Scenario Description</label>
                                <span id="char-count" style="font-size: 12px; font-weight: 600; color: ${s.scenario.length < 10 || s.scenario.length > 2000 ? '#EF4444' : '#64748B'};">${s.scenario.length} / 2000</span>
                            </div>
                            <textarea id="scenario" maxlength="2000" onkeyup="window.ClaimAssessmentActions.updateCharCount()" onclick="(e) => e.stopPropagation()" rows="5" placeholder="Describe claim reason, incident details, hospitalization details, vehicle accident details, property damage details, or policy dispute details." style="width: 100%; padding: 16px; border: 1px solid ${s.validation.scenario ? '#D1D5DB' : '#EF4444'}; border-radius: 8px; outline: none; background: #FFFFFF; font-size: 15px; color: #111827; box-sizing: border-box; transition: border-color 0.2s; resize: vertical; font-family: inherit;">${s.scenario}</textarea>
                            ${!s.validation.scenario && s.scenario.length > 0 ? '<span style="color: #EF4444; font-size: 12px; margin-top: 4px; display: block;">Description must be between 10 and 2000 characters.</span>' : ''}
                        </div>

                        <div style="grid-column: span 3; display: flex; justify-content: flex-end; align-items: center; gap: 16px; margin-top: 16px;">
                            ${renderError()}
                            <div style="flex-grow: 1;"></div>
                            <button type="button" onclick="window.ClaimAssessmentActions.reset(event)" style="background: transparent; border: 1px solid #CBD5E1; color: #475569; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s;" ${s.isAnalyzing ? 'disabled' : ''}>
                                Clear Form
                            </button>
                            <button type="button" id="generate-btn" onclick="window.ClaimAssessmentActions.analyze(event)" style="background: #0F172A; color: #FFFFFF; border: none; padding: 12px 32px; border-radius: 8px; font-size: 15px; font-weight: 600; cursor: ${s.isAnalyzing ? 'not-allowed' : 'pointer'}; opacity: ${s.isAnalyzing ? '0.7' : '1'}; transition: background 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.2);" ${s.isAnalyzing ? 'disabled' : ''}>
                                ${s.isAnalyzing ? `<div class="spinner"></div> Generating...` : `Generate Assessment Report`}
                            </button>
                        </div>
                    </form>
                    `}
                </div>

                <!-- Loading State -->
                ${s.isAnalyzing ? `
                <div style="${glassCardStyle} text-align: center; padding: 64px 24px; animation: fadeIn 0.5s ease;">
                    <div class="loader-pulse"></div>
                    <h3 style="font-size: 20px; font-weight: 700; color: #0F172A; margin: 24px 0 8px 0;">Assembling AI Intelligence</h3>
                    <p id="loading-text" style="color: #64748B; font-size: 15px; font-weight: 500;">${window.ClaimAssessmentActions.getLoadingText(s.loadingStep)}</p>
                    
                    <div style="width: 100%; max-width: 400px; height: 6px; background: #E2E8F0; border-radius: 3px; margin: 24px auto 0 auto; overflow: hidden;">
                        <div style="height: 100%; width: ${(s.loadingStep / 7) * 100}%; background: #0F172A; border-radius: 3px; transition: width 0.5s ease;"></div>
                    </div>
                </div>
                ` : ''}

                <!-- Generated Report Full Width -->
                ${s.isAnalyzed && s.report ? `
                <div id="report-container" style="background: #FFFFFF; border-radius: 12px; border: 1px solid #E2E8F0; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05); padding: 48px; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);">
                    
                    <div style="text-align: center; border-bottom: 2px solid #F1F5F9; padding-bottom: 32px; margin-bottom: 40px;">
                        <h2 style="font-size: 32px; font-weight: 900; color: #0F172A; margin: 0 0 12px 0; letter-spacing: -1px;">Intelligence Analyst Report</h2>
                        <div style="display: flex; justify-content: center; gap: 24px; color: #64748B; font-size: 14px; font-weight: 500;">
                            <span>Provider: <strong style="color: #0F172A;">${s.providers.find(p=>p.id===s.provider)?.label || s.provider}</strong></span>
                            <span>|</span>
                            <span>Policy Category: <strong style="color: #0F172A;">${s.namespaces.find(n=>n.id===s.policyType)?.label || s.policyType}</strong></span>
                            <span>|</span>
                            <span>Date: <strong style="color: #0F172A;">${new Date().toLocaleDateString()}</strong></span>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; gap: 40px; color: #334155; font-size: 16px; line-height: 1.8;">
                        
                        <div style="padding-left: 24px; border-left: 4px solid #3B82F6;">
                            <h3 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Executive Summary</h3>
                            <p style="margin: 0;">${s.report.executive_summary}</p>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
                            <div>
                                <h3 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">Claim Eligibility Review</h3>
                                <p style="margin: 0;">${s.report.claim_eligibility_review}</p>
                            </div>
                            <div>
                                <h3 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">Approval Assessment</h3>
                                <p style="margin: 0;">${s.report.approval_assessment}</p>
                            </div>
                        </div>

                        <div>
                            <h3 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">Coverage Review</h3>
                            <p style="margin: 0;">${s.report.coverage_review}</p>
                        </div>

                        <div style="background: #F8FAFC; padding: 24px; border-radius: 8px; border: 1px solid #E2E8F0;">
                            <h3 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Policy Clause Interpretation</h3>
                            <p style="margin: 0; font-family: 'Georgia', serif; font-size: 17px; font-style: italic; color: #1E293B;">"${s.report.policy_clause_interpretation}"</p>
                        </div>

                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
                            <div style="padding-left: 24px; border-left: 4px solid #EF4444;">
                                <h3 style="font-size: 18px; font-weight: 800; color: #B91C1C; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Risk Analysis</h3>
                                <p style="margin: 0;">${s.report.risk_analysis}</p>
                            </div>
                            <div style="padding-left: 24px; border-left: 4px solid #64748B;">
                                <h3 style="font-size: 18px; font-weight: 800; color: #334155; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">Compliance Review</h3>
                                <p style="margin: 0;">${s.report.compliance_review}</p>
                            </div>
                        </div>

                        <div>
                            <h3 style="font-size: 18px; font-weight: 800; color: #0F172A; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px; border-bottom: 1px solid #E2E8F0; padding-bottom: 8px;">Documentation Checklist</h3>
                            <ul style="margin: 0; padding-left: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                                ${Array.isArray(s.report.documentation_checklist) 
                                    ? s.report.documentation_checklist.map(doc => `<li>${doc}</li>`).join('') 
                                    : `<li>${s.report.documentation_checklist}</li>`}
                            </ul>
                        </div>

                        <div style="background: #F0FDF4; padding: 24px; border-radius: 8px; border: 1px solid #BBF7D0;">
                            <h3 style="font-size: 18px; font-weight: 800; color: #166534; margin: 0 0 12px 0; text-transform: uppercase; letter-spacing: 1px;">AI Recommendations</h3>
                            <p style="margin: 0; color: #15803D;">${s.report.ai_recommendations}</p>
                        </div>

                        <div style="background: #EEF2FF; padding: 32px; border-radius: 8px; border: 2px solid #C7D2FE; text-align: center;">
                            <h3 style="font-size: 20px; font-weight: 900; color: #312E81; margin: 0 0 16px 0; text-transform: uppercase; letter-spacing: 1px;">Final Assessment Conclusion</h3>
                            <p style="margin: 0; color: #3730A3; font-size: 18px; font-weight: 600;">${s.report.final_assessment}</p>
                        </div>

                    </div>
                </div>
                ` : ''}

            </div>
            <style>
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes slideIn { from { opacity: 0; transform: translateX(-10px); } to { opacity: 1; transform: translateX(0); } }
                .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #FFF; border-radius: 50%; animation: spin 0.8s linear infinite; }
                @keyframes spin { to { transform: rotate(360deg); } }
                .loader-pulse { width: 48px; height: 48px; border-radius: 50%; background: #0F172A; margin: 0 auto; animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
                @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: .5; transform: scale(1.1); } }
            </style>
        </div>
    `;
};
