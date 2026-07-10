export const ClaimAssessmentReportCenter = () => {
    return `
    <section class="module-section active" style="font-family: 'Inter', -apple-system, sans-serif;">
        
        <!-- Header -->
        <div class="header-section" style="margin-bottom: 30px;">
            <h1 style="font-size: 28px; font-weight: 800; color: #1F2937; letter-spacing: -0.02em; margin-bottom: 8px; display: flex; align-items: center; gap: 12px;">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>
                Claim Assessment Report Center
            </h1>
            <p style="font-size: 16px; color: #6B7280;">
                Generate an evidence-backed insurance assessment report using policy intelligence, regulatory guidance, and AI-powered analysis.
            </p>
        </div>

        <div class="assessment-container" style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(229, 231, 235, 0.8); border-radius: 16px; padding: 30px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); margin-bottom: 30px;">
            <!-- Intake Form -->
            <section id="assessment-intake">
                <h2 style="font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 24px; display: flex; align-items: center; gap: 8px;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    Claim Information
                </h2>
                
                <form id="assessment-form" onsubmit="event.preventDefault();">
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px;">
                        <div style="display: flex; flex-direction: column;">
                            <label style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Claim Type *</label>
                            <select id="claim_type" style="padding: 12px 16px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 15px; background: #fff; transition: border-color 0.2s; outline: none; appearance: auto; width: 100%;">
                                <option value="">Select Claim Type...</option>
                                <option value="Health Insurance">Health Insurance</option>
                                <option value="Vehicle Insurance">Vehicle Insurance</option>
                                <option value="Property Insurance">Property Insurance</option>
                                <option value="Travel Insurance">Travel Insurance</option>
                                <option value="Life Insurance">Life Insurance</option>
                            </select>
                            <div id="error-claim_type" style="color: #DC2626; font-size: 13px; margin-top: 5px; display: none;">Please select a claim type</div>
                        </div>
                        <div style="display: flex; flex-direction: column;">
                            <label style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Policy Category *</label>
                            <select id="namespace" style="padding: 12px 16px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 15px; background: #fff; transition: border-color 0.2s; outline: none; appearance: auto; width: 100%;">
                                <option value="">Select Policy Category...</option>
                            </select>
                            <div id="error-namespace" style="color: #DC2626; font-size: 13px; margin-top: 5px; display: none;">Please select a policy category</div>
                        </div>
                        <div style="display: flex; flex-direction: column; grid-column: span 2;">
                            <label style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Insurance Provider *</label>
                            <select id="insurance_provider" style="padding: 12px 16px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 15px; background: #fff; transition: border-color 0.2s; outline: none; appearance: auto; width: 100%;">
                                <option value="">Select Insurance Provider...</option>
                            </select>
                            <div id="error-insurance_provider" style="color: #DC2626; font-size: 13px; margin-top: 5px; display: none;">Please select a provider</div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; margin-bottom: 32px;">
                        <label style="font-size: 14px; font-weight: 600; color: #374151; margin-bottom: 8px;">Scenario Description *</label>
                        <textarea id="scenario_description" rows="3" placeholder="Describe claim reason, incident details, hospitalization details, vehicle accident details, property damage details, or policy dispute details..." style="padding: 16px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 15px; line-height: 1.5; background: #fff; resize: vertical; outline: none; width: 100%;"></textarea>
                        <div id="error-scenario_description" style="color: #DC2626; font-size: 13px; margin-top: 5px; display: none;">Required (min 10 chars)</div>
                    </div>

                    <div id="form-global-error" style="display: none; padding: 12px 16px; background: #FEF2F2; border-left: 4px solid #EF4444; color: #991B1B; font-size: 14px; margin-bottom: 24px; border-radius: 0 4px 4px 0;"></div>

                    <div style="display: flex; flex-direction: column;">
                        <button type="button" id="btn-submit-assessment" style="background: #8b5cf6; color: white; font-size: 16px; font-weight: 600; padding: 14px 28px; border: none; border-radius: 8px; cursor: pointer; width: 100%; transition: background 0.2s ease;" onmouseover="this.style.background='#7c3aed'" onmouseout="this.style.background='#8b5cf6'">
                            Generate Assessment Report
                        </button>
                    </div>
                </form>
            </section>
        </div>

        <!-- Workflow / Loading State -->
        <section id="analysis-workflow" style="display: none; margin-bottom: 48px; background: #FAFAFA; padding: 40px; border-radius: 8px; border: 1px solid #E5E7EB;">
            <h3 style="font-size: 18px; font-weight: 600; color: #111827; margin-bottom: 24px; text-align: center;">Executing Underwriting Analysis</h3>
            <div style="max-width: 400px; margin: 0 auto;">
                <ul id="workflow-stages" style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 16px;">
                    <!-- Stages injected via JS -->
                </ul>
            </div>
        </section>

        <!-- Final Report Presentation -->
        <section id="report-container" style="display: none; margin-top: 48px; animation: fadeIn 0.5s ease;">
            
            <style>
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .report-document {
                    background: #FFFFFF;
                    border: 1px solid #E5E7EB;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.03);
                    border-radius: 8px;
                    overflow: hidden;
                }
                .report-header {
                    background: #FAFAFA;
                    padding: 32px 40px;
                    border-bottom: 1px solid #E5E7EB;
                }
                .report-section-block {
                    padding: 32px 40px;
                    border-bottom: 1px solid #F3F4F6;
                }
                .report-section-block:last-child {
                    border-bottom: none;
                }
                .report-h3 {
                    font-size: 16px;
                    font-weight: 700;
                    color: #111827;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .report-h3 svg {
                    color: #6B7280;
                }
                .report-p {
                    font-size: 15px;
                    color: #374151;
                    line-height: 1.7;
                    margin: 0;
                }
                .report-list-items {
                    padding-left: 20px;
                    margin: 0;
                    font-size: 15px;
                    color: #374151;
                    line-height: 1.7;
                }
                .report-list-items li {
                    margin-bottom: 8px;
                }
                .final-assessment-block {
                    background: #F9FAFB;
                    padding: 32px 40px;
                    border-top: 2px solid #111827;
                }
            </style>

            <div class="report-document" id="printable-report">
                <div class="report-header">
                    <h2 style="font-size: 24px; font-weight: 700; color: #111827; margin: 0 0 8px 0; letter-spacing: -0.01em;">Official Claim Assessment Report</h2>
                    <div style="font-size: 14px; color: #6B7280; font-family: monospace;">REF: <span id="report-ref-id"></span> | STATUS: CONFIDENTIAL</div>
                </div>

                <div class="report-section-block" style="background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%); border-bottom: 1px solid #bfdbfe; border-left: 4px solid #3b82f6;">
                    <h3 class="report-h3" style="color: #1e3a8a;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                        1. User Intake Summary
                    </h3>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 16px; background: rgba(255, 255, 255, 0.7); padding: 16px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.9);">
                        <div style="color: #1e3a8a;"><strong>Claim Type:</strong> <span id="res-claim_type" style="color: #111827;"></span></div>
                        <div style="color: #1e3a8a;"><strong>Policy Type:</strong> <span id="res-policy_type" style="color: #111827;"></span></div>
                        <div style="color: #1e3a8a;"><strong>Provider:</strong> <span id="res-insurance_provider_out" style="color: #111827;"></span></div>
                        <div style="color: #1e3a8a;"><strong>Policy Ref:</strong> <span id="res-policy_ref" style="color: #111827;"></span></div>
                    </div>
                    <p class="report-p" id="res-scenario_overview" style="margin-bottom: 8px; font-weight: 600; color: #1e40af;"></p>
                    <p class="report-p" id="res-claim_summary" style="color: #374151;"></p>
                </div>

                <div class="report-section-block">
                    <h3 class="report-h3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        2. Approval Probability
                    </h3>
                    <div style="display: flex; gap: 24px; margin-bottom: 16px;">
                        <div style="background: #ECFDF5; color: #065F46; padding: 12px 20px; border-radius: 8px; font-weight: 600;">
                            Likelihood: <span id="res-approval_likelihood"></span>
                        </div>
                        <div style="background: #EFF6FF; color: #1E40AF; padding: 12px 20px; border-radius: 8px; font-weight: 600;">
                            Confidence: <span id="res-confidence_level"></span>
                        </div>
                    </div>
                    <p class="report-p" id="res-approval_summary"></p>
                </div>

                <div class="report-section-block">
                    <h3 class="report-h3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                        3. Risk Assessment
                    </h3>
                    <div style="margin-bottom: 16px;"><strong>Overall Risk Level:</strong> <span id="res-overall_risk" style="font-weight: 600; padding: 4px 8px; background: #FEF2F2; color: #991B1B; border-radius: 4px;"></span></div>
                    <p class="report-p" style="font-weight: 600; margin-bottom: 8px;">Key Risk Factors:</p>
                    <ul class="report-list-items" id="res-risk_factors"></ul>
                    <p class="report-p" style="font-weight: 600; margin-bottom: 8px; margin-top: 16px;">Coverage Concerns & Restrictions:</p>
                    <ul class="report-list-items" id="res-coverage_concerns"></ul>
                    <p class="report-p" id="res-risk_explanation" style="margin-top: 16px;"></p>
                </div>

                <div class="report-section-block">
                    <h3 class="report-h3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>
                        4. Compliance Findings
                    </h3>
                    <div style="margin-bottom: 16px;"><strong>Compliance Status:</strong> <span id="res-compliance_status"></span></div>
                    <p class="report-p" id="res-coverage_validation" style="margin-bottom: 16px;"></p>
                    <p class="report-p" id="res-irdai_observations" style="margin-bottom: 16px;"></p>
                    <p class="report-p" id="res-regulatory_considerations"></p>
                </div>
                
                <div class="report-section-block">
                    <h3 class="report-h3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="9" y1="15" x2="15" y2="15"></line></svg>
                        5. Required Documents
                    </h3>
                    <div style="margin-bottom: 16px;"><strong>Verification Status:</strong> <span id="res-verification_status"></span></div>
                    <p class="report-p" style="font-weight: 600; margin-bottom: 8px;">Required Checklist:</p>
                    <ul class="report-list-items" id="res-required_docs"></ul>
                    <p class="report-p" style="font-weight: 600; margin-bottom: 8px; margin-top: 16px;">Missing Documents:</p>
                    <ul class="report-list-items" id="res-missing_docs"></ul>
                </div>

                <div class="report-section-block">
                    <h3 class="report-h3">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 16v-4"></path><path d="M12 8h.01"></path></svg>
                        6. AI Recommendations
                    </h3>
                    <p class="report-p" style="font-weight: 600; margin-bottom: 8px;">Next Actions:</p>
                    <ul class="report-list-items" id="res-next_actions"></ul>
                    <p class="report-p" style="font-weight: 600; margin-bottom: 8px; margin-top: 16px;">Guidance & Suggestions:</p>
                    <ul class="report-list-items" id="res-guidance"></ul>
                </div>

                <div class="final-assessment-block">
                    <h3 class="report-h3" style="color: #111827;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        7. Final Decision
                    </h3>
                    <div style="display: flex; gap: 24px; margin-bottom: 24px;">
                        <div style="background: #111827; color: #FFFFFF; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 16px;">
                            Likely Outcome: <span id="res-likely_outcome"></span>
                        </div>
                        <div style="background: #F3F4F6; color: #374151; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 16px;">
                            Confidence: <span id="res-final_confidence"></span>
                        </div>
                    </div>
                    <p class="report-p" id="res-decision_explanation" style="font-size: 16px; color: #111827; margin-bottom: 16px;"></p>
                    <p class="report-p" style="font-weight: 600; margin-bottom: 8px;">Supporting Reasons:</p>
                    <ul class="report-list-items" id="res-supporting_reasons"></ul>
                </div>
            </div>
            
            <div style="display: flex; justify-content: flex-end; gap: 16px; margin-top: 24px;" class="report-actions-container">
                <button type="button" id="btn-new-assessment" style="background: #111827; color: #ffffff; border: none; padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                    New Assessment
                </button>
                <button type="button" onclick="window.print()" style="background: white; color: #111827; border: 1px solid #D1D5DB; padding: 10px 20px; font-size: 14px; font-weight: 600; border-radius: 6px; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Export as PDF
                </button>
            </div>
            <style>
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    #printable-report, #printable-report * {
                        visibility: visible;
                    }
                    #printable-report {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        margin: 0;
                        padding: 20px;
                        box-sizing: border-box;
                    }
                    .report-actions-container {
                        display: none !important;
                    }
                }
            </style>
        </section>
        
    </div>
    `;
};

window.initClaimAssessmentReportCenter = async () => {
    const btnSubmit = document.getElementById('btn-submit-assessment');
    if (!btnSubmit) return;

    const inputs = {
        claim_type: document.getElementById('claim_type'),
        namespace: document.getElementById('namespace'),
        insurance_provider: document.getElementById('insurance_provider'),
        scenario_description: document.getElementById('scenario_description')
    };

    const errors = {
        claim_type: document.getElementById('error-claim_type'),
        namespace: document.getElementById('error-namespace'),
        insurance_provider: document.getElementById('error-insurance_provider'),
        scenario_description: document.getElementById('error-scenario_description')
    };

    const globalError = document.getElementById('form-global-error');
    const workflowSection = document.getElementById('analysis-workflow');
    const workflowList = document.getElementById('workflow-stages');
    const reportContainer = document.getElementById('report-container');

    const namespaces = [
        "regulatory_governance",
        "vehicle_policy",
        "health_policy",
        "home_folder",
        "banking_governance",
        "travel_policy",
        "life_wealth_policy"
    ];

    const providers = [
        "SBI General",
        "HDFC ERGO",
        "ICICI Lombard",
        "Kotak Mahindra",
        "IndusInd General",
        "Reliance General",
        "Star Health",
        "IndiaFirst Life",
        "IndusInd Nippon Life",
        "HDFC Life",
        "Apollo Munich Health",
        "Canara HSBC Life",
        "Tata AIG",
        "Zurich Kotak",
        "IRDAI Regulatory Knowledge Base"
    ];

    // Populate namespaces
    inputs.namespace.innerHTML = '<option value="">Select Policy Category...</option>' + 
        namespaces.map(ns => `<option value="${ns}">${ns}</option>`).join('');
        
    // Populate providers
    inputs.insurance_provider.innerHTML = '<option value="">Select Insurance Provider...</option>' + 
        providers.map(p => `<option value="${p}">${p}</option>`).join('');

    const validateForm = () => {
        let isValid = true;
        
        const checkField = (field, isSelect = false, minLength = 0) => {
            const val = inputs[field].value;
            if (isSelect) {
                if (!val) {
                    errors[field].style.display = 'block';
                    inputs[field].style.borderColor = '#DC2626';
                    isValid = false;
                } else {
                    errors[field].style.display = 'none';
                    inputs[field].style.borderColor = '#D1D5DB';
                }
            } else {
                if (!val || val.trim().length < minLength) {
                    errors[field].style.display = 'block';
                    inputs[field].style.borderColor = '#DC2626';
                    isValid = false;
                } else {
                    errors[field].style.display = 'none';
                    inputs[field].style.borderColor = '#D1D5DB';
                }
            }
        };

        checkField('claim_type', true);
        checkField('namespace', true);
        checkField('insurance_provider', true);
        checkField('scenario_description', false, 10);

        btnSubmit.disabled = !isValid;
        btnSubmit.style.opacity = isValid ? '1' : '0.5';
        btnSubmit.style.cursor = isValid ? 'pointer' : 'not-allowed';
        return isValid;
    };

    Object.values(inputs).forEach(input => {
        input.addEventListener('change', validateForm);
        input.addEventListener('input', validateForm);
        input.addEventListener('blur', validateForm);
    });

    btnSubmit.addEventListener('click', async (event) => {
        event.preventDefault();
        
        if (!validateForm()) return;
        
        globalError.style.display = 'none';
        reportContainer.style.display = 'none';
        workflowSection.style.display = 'block';
        
        btnSubmit.disabled = true;
        btnSubmit.style.opacity = '0.5';

        // Setup Workflow UI
        const stages = [
            "Validating Inputs...",
            "Generating Embeddings...",
            "Searching Pinecone...",
            "Retrieving Policy Evidence...",
            "Analyzing Coverage...",
            "Generating Assessment...",
            "Rendering Report..."
        ];
        
        workflowList.innerHTML = stages.map((stage, idx) => 
            '<li id="stage-' + idx + '" style="display: flex; align-items: center; gap: 12px; font-size: 15px; color: #9CA3AF; font-weight: 500; transition: color 0.3s;">' +
                '<div class="stage-icon" id="icon-' + idx + '" style="width: 24px; height: 24px; border-radius: 50%; border: 2px solid #E5E7EB; display: flex; align-items: center; justify-content: center; transition: all 0.3s;">' +
                    '<svg id="check-' + idx + '" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" style="opacity: 0; transition: opacity 0.3s;"><polyline points="20 6 9 17 4 12"></polyline></svg>' +
                '</div>' +
                '<span>' + stage + '</span>' +
            '</li>'
        ).join('');

        // Progress logic
        let currentStage = 0;
        const markStageComplete = (idx) => {
            const li = document.getElementById('stage-' + idx);
            const icon = document.getElementById('icon-' + idx);
            const check = document.getElementById('check-' + idx);
            if(li) {
                li.style.color = '#111827';
                icon.style.borderColor = '#10B981';
                icon.style.backgroundColor = '#10B981';
                check.style.opacity = '1';
            }
        };

        const setStageActive = (idx) => {
            const li = document.getElementById('stage-' + idx);
            const icon = document.getElementById('icon-' + idx);
            if(li) {
                li.style.color = '#3B82F6';
                icon.style.borderColor = '#3B82F6';
            }
        };

        setStageActive(0);
        
        const stageInterval = setInterval(() => {
            if (currentStage < stages.length - 1) {
                markStageComplete(currentStage);
                currentStage++;
                setStageActive(currentStage);
            }
        }, 1200); 

        try {
            const response = await fetch(window.API_URL + '/assessment/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify({
                    claim_type: inputs.claim_type.value,
                    namespace: inputs.namespace.value,
                    insurance_provider: inputs.insurance_provider.value,
                    scenario_description: inputs.scenario_description.value.trim()
                })
            });

            if (!response.ok) {
                let errDetail = 'Failed to generate assessment';
                try {
                    const errData = await response.json();
                    if (errData.detail) errDetail = errData.detail;
                } catch(e) {
                    // non-json response
                }
                
                if (response.status === 404) {
                    throw new Error(errDetail || 'API endpoint not found or Pinecone namespace not found');
                } else if (response.status === 400 || response.status === 422) {
                    throw new Error(errDetail || 'Invalid request payload');
                } else if (response.status === 503) {
                    throw new Error(errDetail || 'Pinecone connection failed');
                } else if (response.status === 502) {
                    throw new Error(errDetail || 'Groq service unavailable');
                } else if (response.status === 500) {
                    throw new Error(errDetail || 'Internal server error or Embedding generation failed');
                }
                
                throw new Error(errDetail);
            }

            const data = await response.json();

            clearInterval(stageInterval);
            for (let i = currentStage; i < stages.length; i++) {
                markStageComplete(i);
            }
            
            await new Promise(r => setTimeout(r, 600));

            // Populate Report
            document.getElementById('report-ref-id').innerText = 'ASMT-' + Date.now().toString().slice(-6);
            
            // Section 1
            const sum = data.claim_summary || {};
            document.getElementById('res-claim_type').innerText = sum.claim_type || '';
            document.getElementById('res-policy_type').innerText = sum.policy_type || '';
            document.getElementById('res-insurance_provider_out').innerText = sum.insurance_provider || '';
            document.getElementById('res-policy_ref').innerText = sum.retrieved_policy_reference || '';
            document.getElementById('res-scenario_overview').innerText = sum.scenario_overview || '';
            document.getElementById('res-claim_summary').innerText = sum.summary || '';

            // Section 2
            const app = data.approval_probability || {};
            document.getElementById('res-approval_likelihood').innerText = app.approval_likelihood_percentage || '';
            document.getElementById('res-confidence_level').innerText = app.confidence_level || '';
            document.getElementById('res-approval_summary').innerText = app.assessment_summary || '';

            // Section 3
            const risk = data.risk_assessment || {};
            document.getElementById('res-overall_risk').innerText = risk.overall_risk_level || '';
            document.getElementById('res-risk_factors').innerHTML = (risk.key_risk_factors || []).map(i => `<li>${i}</li>`).join('');
            document.getElementById('res-coverage_concerns').innerHTML = [...(risk.coverage_concerns || []), ...(risk.policy_restrictions || [])].map(i => `<li>${i}</li>`).join('');
            document.getElementById('res-risk_explanation').innerText = risk.risk_explanation || '';

            // Section 4
            const comp = data.compliance_findings || {};
            document.getElementById('res-compliance_status').innerText = comp.policy_compliance_status || '';
            document.getElementById('res-coverage_validation').innerText = comp.coverage_validation_results || '';
            document.getElementById('res-irdai_observations').innerText = comp.irdai_compliance_observations || '';
            document.getElementById('res-regulatory_considerations').innerText = comp.regulatory_considerations || '';

            // Section 5
            const docs = data.required_documents || {};
            document.getElementById('res-verification_status').innerText = docs.verification_status || '';
            document.getElementById('res-required_docs').innerHTML = (docs.required_documents_checklist || []).map(i => `<li>${i}</li>`).join('');
            document.getElementById('res-missing_docs').innerHTML = (docs.missing_documents || []).map(i => `<li>${i}</li>`).join('');

            // Section 6
            const ai = data.ai_recommendations || {};
            document.getElementById('res-next_actions').innerHTML = (ai.recommended_next_actions || []).map(i => `<li>${i}</li>`).join('');
            document.getElementById('res-guidance').innerHTML = [...(ai.claim_preparation_guidance || []), ...(ai.policyholder_recommendations || []), ...(ai.risk_mitigation_suggestions || [])].map(i => `<li>${i}</li>`).join('');

            // Section 7
            const dec = data.final_decision || {};
            document.getElementById('res-likely_outcome').innerText = dec.likely_outcome || '';
            document.getElementById('res-final_confidence').innerText = dec.overall_confidence_score || '';
            document.getElementById('res-decision_explanation').innerText = dec.decision_explanation || '';
            document.getElementById('res-supporting_reasons').innerHTML = (dec.supporting_reasons || []).map(i => `<li>${i}</li>`).join('');

            workflowSection.style.display = 'none';
            reportContainer.style.display = 'block';

        } catch (error) {
            clearInterval(stageInterval);
            let errMsg = error.message;
            if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError')) {
                errMsg = 'Backend server unavailable. Please check if the API is running.';
            }
            globalError.innerText = errMsg;
            globalError.style.display = 'block';
            workflowSection.style.display = 'none';
        } finally {
            btnSubmit.disabled = false;
            btnSubmit.style.opacity = '1';
        }
    });

    const btnNewAssessment = document.getElementById('btn-new-assessment');
    if (btnNewAssessment) {
        btnNewAssessment.addEventListener('click', () => {
            reportContainer.style.display = 'none';
            document.getElementById('assessment-form').reset();
            
            // Reset validation states
            Object.values(inputs).forEach(input => input.style.borderColor = '#D1D5DB');
            Object.values(errors).forEach(error => error.style.display = 'none');
            
            validateForm(); // re-evaluate button state
            
            // Scroll to top to focus on form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
};
