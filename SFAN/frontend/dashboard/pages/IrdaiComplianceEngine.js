export const IrdaiComplianceEngine = () => {
    const existingState = window.IrdaiActions?.state || {
        isAnalyzing: false,
        isAnalyzed: false,
        query: '',
        violations: 'Automatically scan for breaches of IRDAI regulations including claim rejections, misrepresentation, and turnaround time (TAT) delays.',
        insights: 'Understand your policyholder rights, applicable IRDAI circulars, grievance redressal norms, and fair practices code.',
        escalation: 'Step-by-step guide to escalate your complaint to the Insurer Grievance Redressal, Insurance Ombudsman, or Consumer Court.',
        responsibility: 'Check if the insurer has fulfilled their obligations as per IRDAI norms, covering policy terms, disclosure requirements, and service standards.',
        riskAlerts: 'Identify potential risks such as high rejection likelihood, policy lapsing, underinsurance, and gaps in your coverage renewal.',
        aiAnalysis: 'Our AI analyzes your query against IRDAI regulations, circulars, and past cases to detect issues and generate actionable recommendations.',
        sourceContext: '',
        showModal: false,
        modalTitle: ''
    };

    if (!window.IrdaiActions) {
        window.IrdaiActions = {
            state: existingState,
            analyze: async () => {
                const input = document.getElementById('irdai-query');
                const query = input ? input.value.trim() : window.IrdaiActions.state.query;
                
                if (!query) {
                    alert('Please enter a query.');
                    return;
                }

                window.IrdaiActions.state.query = query;
                window.IrdaiActions.state.isAnalyzing = true;
                document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();

                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://127.0.0.1:8000/intelligence/irdai-compliance', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ query: query })
                    });
                    
                    const data = await response.json();
                    if (!response.ok) {
                        alert('Analysis failed: ' + (data.error || 'Server error'));
                        window.IrdaiActions.state.isAnalyzing = false;
                        document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();
                        return;
                    }

                    const s = window.IrdaiActions.state;
                    s.isAnalyzing = false;
                    s.isAnalyzed = true;
                    s.violations = data.violations || "No specific violations identified based on the provided context.";
                    s.insights = data.insights || "No specific insights identified based on the provided context.";
                    s.escalation = data.escalation || "No specific escalation path identified based on the provided context.";
                    s.responsibility = data.responsibility || "No specific responsibility identified based on the provided context.";
                    s.riskAlerts = data.riskAlerts || "No specific risk alerts identified based on the provided context.";
                    s.aiAnalysis = data.aiAnalysis || "No specific AI analysis generated based on the provided context.";
                    s.sourceContext = data.sourceContext || "No raw database chunks retrieved.";
                    
                    document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();
                } catch (error) {
                    alert('Network error: ' + error.message);
                    window.IrdaiActions.state.isAnalyzing = false;
                    document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();
                }
            },
            setQuery: (text) => {
                window.IrdaiActions.state.query = text;
                document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();
                window.IrdaiActions.analyze();
            },
            openModal: (title) => {
                window.IrdaiActions.state.modalTitle = title;
                window.IrdaiActions.state.showModal = true;
                document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();
            },
            closeModal: () => {
                window.IrdaiActions.state.showModal = false;
                document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();
            }
        };
    }
    const s = window.IrdaiActions.state;
    return `
        <section class="module-section active" style="max-width: 1200px; margin: 0 auto; padding: 40px; min-height: calc(100vh - 80px); box-sizing: border-box; animation: fadeIn 0.4s ease; background: transparent;">
            
            <style>
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .irdai-header {
                    margin-bottom: 32px;
                }
                
                .irdai-title {
                    font-size: 24px;
                    font-weight: 800;
                    color: #1F2937;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    margin: 0 0 8px 0;
                }
                
                .irdai-subtitle {
                    font-size: 14px;
                    color: #6B7280;
                    margin: 0;
                }
                .irdai-subtitle {
                    font-size: 14px;
                    color: #6B7280;
                    margin: 0;
                }
                
                .irdai-input-card {
                    background: #FFFFFF;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    margin-bottom: 24px;
                    border: 1px solid rgba(0,0,0,0.04);
                }
                
                .irdai-input-wrapper {
                    position: relative;
                    margin: 16px 0;
                }
                
                .irdai-input {
                    width: 100%;
                    padding: 16px 160px 16px 48px;
                    border: 1px solid #E5E7EB;
                    border-radius: 12px;
                    font-size: 14px;
                    outline: none;
                    transition: border-color 0.2s;
                    box-sizing: border-box;
                }
                
                .irdai-input:focus {
                    border-color: #6366F1;
                }
                
                .irdai-analyze-btn {
                    position: absolute;
                    right: 8px;
                    top: 8px;
                    bottom: 8px;
                    background: linear-gradient(135deg, #6366F1, #8B5CF6);
                    color: #FFFFFF;
                    border: none;
                    border-radius: 8px;
                    padding: 0 20px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: transform 0.2s;
                }
                
                .irdai-analyze-btn:hover {
                    transform: scale(1.02);
                }
                
                .irdai-chip-container {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                
                .irdai-chip {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: #F9FAFB;
                    border: 1px solid #E5E7EB;
                    border-radius: 100px;
                    font-size: 12px;
                    font-weight: 600;
                    color: #4B5563;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .irdai-chip:hover {
                    background: #F3F4F6;
                    border-color: #D1D5DB;
                }
                
                .irdai-cards-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }
                
                .irdai-card {
                    background: #FFFFFF;
                    border-radius: 20px;
                    padding: 24px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    border: 1px solid rgba(0,0,0,0.04);
                    display: flex;
                    flex-direction: column;
                    height: 100%;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                
                .irdai-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 12px 30px rgba(0,0,0,0.06);
                }
                
                .irdai-card-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    margin-bottom: 20px;
                }
                
                .irdai-card-title {
                    font-size: 16px;
                    font-weight: 700;
                    color: #1F2937;
                    margin: 0 0 8px 0;
                }
                
                .irdai-card-desc {
                    font-size: 13px;
                    color: #6B7280;
                    line-height: 1.5;
                    margin: 0 0 20px 0;
                    flex: 1;
                }
                
                .irdai-card-link {
                    font-size: 13px;
                    font-weight: 600;
                    color: #6366F1;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 4px;
                    margin-top: auto;
                }
            </style>

            <div class="irdai-header">
                <h1 class="irdai-title">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                    IRDAI Compliance Compass
                </h1>
                <p class="irdai-subtitle">AI-powered insights on compliance, consumer protection, and regulatory guidance.</p>
            </div>
            </div>

            <div class="irdai-input-card">
                <div style="font-size: 14px; font-weight: 700; color: #1F2937;">Ask your compliance or consumer protection question</div>
                <div class="irdai-input-wrapper">
                    <div style="position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #9CA3AF;">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <input type="text" id="irdai-query" class="irdai-input" placeholder="E.g., My claim was rejected unfairly. Is this a violation of IRDAI guidelines?" value="${s.query}">
                    <div style="position: absolute; right: 180px; top: 50%; transform: translateY(-50%); color: #9CA3AF; font-size: 12px; font-weight: 500;">
                        0/500
                    </div>
                    <button id="analyze-btn" class="irdai-analyze-btn" onclick="window.IrdaiActions.analyze()">
                        ${s.isAnalyzing ? `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                            Analyzing...
                        ` : `
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                            Analyze Now
                        `}
                    </button>
                </div>
                <div style="font-size: 13px; font-weight: 600; color: #4B5563; margin-bottom: 12px;">Try asking about:</div>
                <div class="irdai-chip-container">
                    <div class="irdai-chip" onclick="window.IrdaiActions.setQuery('My health insurance claim was rejected. What are the IRDAI claim rejection guidelines?')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>
                        Claim rejection guidelines
                    </div>
                    <div class="irdai-chip" onclick="window.IrdaiActions.setQuery('The insurer is delaying my claim settlement for 3 months. What is the turnaround time as per IRDAI?')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                        Delay in claim settlement
                    </div>
                    <div class="irdai-chip" onclick="window.IrdaiActions.setQuery('I was sold a life insurance policy under false promises. What are the rules for mis-selling?')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EC4899" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        Mis-selling or wrong advice
                    </div>
                    <div class="irdai-chip" onclick="window.IrdaiActions.setQuery('What are the rules for cancelling my policy and getting a refund during the free look period?')">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2z"></path><line x1="18" y1="9" x2="12" y2="15"></line><line x1="12" y1="9" x2="18" y2="15"></line></svg>
                        Policy cancellation rules
                    </div>
                </div>
            </div>

            <div id="irdai-results-grid" class="irdai-cards-grid" style="display: ${s.isAnalyzed ? 'grid' : 'none'}; margin-top: 32px; animation: fadeIn 0.4s ease;">
                <div class="irdai-card">
                    <div class="irdai-card-icon" style="background: #FEE2E2;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                    </div>
                    <h3 class="irdai-card-title">Compliance Violation Detector</h3>
                    <p class="irdai-card-desc">${s.violations}</p>
                    <a href="#" onclick="event.preventDefault(); window.IrdaiActions.openModal('Compliance Violation DB Evidence');" class="irdai-card-link">Check Violations <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
                </div>

                <div class="irdai-card">
                    <div class="irdai-card-icon" style="background: #D1FAE5;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <h3 class="irdai-card-title">Regulatory Protection Insights</h3>
                    <p class="irdai-card-desc">${s.insights}</p>
                    <a href="#" onclick="event.preventDefault(); window.IrdaiActions.openModal('Regulatory Insights DB Evidence');" class="irdai-card-link">View Insights <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
                </div>

                <div class="irdai-card">
                    <div class="irdai-card-icon" style="background: #FEF3C7;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    </div>
                    <h3 class="irdai-card-title">Complaint & Escalation Guide</h3>
                    <p class="irdai-card-desc">${s.escalation}</p>
                    <a href="#" onclick="event.preventDefault(); window.IrdaiActions.openModal('Escalation Guide DB Evidence');" class="irdai-card-link">View Escalation Path <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
                </div>

                <div class="irdai-card">
                    <div class="irdai-card-icon" style="background: #DBEAFE;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><rect x="3" y="7" width="18" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>
                    </div>
                    <h3 class="irdai-card-title">Insurer Responsibility Checker</h3>
                    <p class="irdai-card-desc">${s.responsibility}</p>
                    <a href="#" onclick="event.preventDefault(); window.IrdaiActions.openModal('Insurer Responsibility DB Evidence');" class="irdai-card-link">Check Responsibility <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
                </div>

                <div class="irdai-card">
                    <div class="irdai-card-icon" style="background: #FFE4E6;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E11D48" stroke-width="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path><path d="M13.73 21a2 2 0 0 1-3.46 0"></path></svg>
                    </div>
                    <h3 class="irdai-card-title">Consumer Risk Alerts</h3>
                    <p class="irdai-card-desc">${s.riskAlerts}</p>
                    <a href="#" onclick="event.preventDefault(); window.IrdaiActions.openModal('Risk Alerts DB Evidence');" class="irdai-card-link">View Risk Alerts <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
                </div>

                <div class="irdai-card">
                    <div class="irdai-card-icon" style="background: #F3E8FF;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                    </div>
                    <h3 class="irdai-card-title">AI-Powered Compliance Analysis</h3>
                    <p class="irdai-card-desc">${s.aiAnalysis}</p>
                    <a href="#" onclick="event.preventDefault(); window.IrdaiActions.openModal('Raw Pinecone Database Extracts');" class="irdai-card-link">How AI Works <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></a>
                </div>
            </div>

            <!-- Modal for Raw Context -->
            ${s.showModal ? `
            <div style="position: fixed; inset: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; animation: fadeIn 0.2s ease;">
                <div style="background: #FFF; width: 90%; max-width: 800px; max-height: 85vh; border-radius: 16px; display: flex; flex-direction: column; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.2);">
                    <div style="padding: 24px; border-bottom: 1px solid #E5E7EB; display: flex; justify-content: space-between; align-items: center; background: #FAFAFA;">
                        <h2 style="margin: 0; font-size: 18px; color: #111827; display: flex; align-items: center; gap: 8px;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>
                            ${s.modalTitle}
                        </h2>
                        <button onclick="window.IrdaiActions.closeModal()" style="background: none; border: none; cursor: pointer; color: #6B7280; padding: 4px; border-radius: 4px; transition: background 0.2s;">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <div style="padding: 24px; overflow-y: auto; background: #1E1E1E; color: #D4D4D4; font-family: monospace; font-size: 13px; line-height: 1.6; white-space: pre-wrap;">${s.sourceContext}</div>
                </div>
            </div>
            ` : ''}
        </section>
    `;
};
