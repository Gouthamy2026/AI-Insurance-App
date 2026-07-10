export const HealthCoverageVerificationHub = () => {
    return `
        <section class="module-section active">
            <div class="header-section" style="margin-bottom: 30px;">
                <h1 style="font-size: 28px; font-weight: 800; color: #1F2937; margin-bottom: 8px; display: flex; align-items: center; gap: 12px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
                    Health Verification Hub
                </h1>
                <p style="color: #6B7280; font-size: 16px;">Pre-Claim Health Insurance Intelligence & Verification System</p>
            </div>

            <div id="formContainer" style="background: rgba(255, 255, 255, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(229, 231, 235, 0.8); border-radius: 16px; padding: 30px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05); margin-bottom: 30px;">
                <form id="healthVerificationForm" novalidate>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                        <div style="display: flex; flex-direction: column; margin-bottom: 15px;">
                            <label style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #000000;" for="policyType">Policy Type *</label>
                            <select id="policyType" style="color: #000000; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; font-family: inherit; transition: all 0.2s ease; outline: none; background: #fff; cursor: pointer; -webkit-appearance: none; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%236B7280\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>'); background-repeat: no-repeat; background-position: right 12px center;" required onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'" onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                                <option value="" disabled selected>Select a policy type...</option>
                                <option value="regulatory_governance">Regulatory Governance</option>
                                <option value="vehicle_policy">Vehicle Policy</option>
                                <option value="health_policy">Health Policy</option>
                                <option value="home_folder">Home Folder</option>
                                <option value="banking_governance">Banking Governance</option>
                                <option value="travel_policy">Travel Policy</option>
                                <option value="life_wealth_policy">Life & Wealth Policy</option>
                            </select>
                            <div style="color: #ef4444; font-size: 13px; margin-top: 5px; display: none;" id="error-policyType">Policy Type is required.</div>
                        </div>
                        
                        <div style="display: flex; flex-direction: column; margin-bottom: 15px;">
                            <label style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #000000;" for="insuranceProvider">Insurance Provider *</label>
                            <select id="insuranceProvider" style="color: #000000; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; font-family: inherit; transition: all 0.2s ease; outline: none; background: #fff; cursor: pointer; -webkit-appearance: none; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%236B7280\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>'); background-repeat: no-repeat; background-position: right 12px center;" required onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'" onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                                <option value="" disabled selected>Select a provider...</option>
                                <option value="SBI General">SBI General</option>
                                <option value="HDFC ERGO">HDFC ERGO</option>
                                <option value="ICICI Lombard">ICICI Lombard</option>
                                <option value="Kotak Mahindra">Kotak Mahindra</option>
                                <option value="IndusInd General">IndusInd General</option>
                                <option value="Reliance General">Reliance General</option>
                                <option value="Star Health">Star Health</option>
                                <option value="IndiaFirst Life">IndiaFirst Life</option>
                                <option value="IndusInd Nippon Life">IndusInd Nippon Life</option>
                                <option value="HDFC Life">HDFC Life</option>
                                <option value="Apollo Munich Health">Apollo Munich Health</option>
                                <option value="Canara HSBC Life">Canara HSBC Life</option>
                                <option value="Tata AIG">Tata AIG</option>
                                <option value="Zurich Kotak">Zurich Kotak</option>
                                <option value="IRDAI Regulatory Knowledge Base">IRDAI Regulatory Knowledge Base</option>
                            </select>
                            <div style="color: #ef4444; font-size: 13px; margin-top: 5px; display: none;" id="error-insuranceProvider">Insurance Provider is required.</div>
                        </div>

                        <div style="display: flex; flex-direction: column; margin-bottom: 15px;">
                            <label style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #000000;" for="medicalCondition">Medical Condition / Diagnosis *</label>
                            <input list="conditionsList" type="text" id="medicalCondition" style="color: #000000; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; font-family: inherit; transition: all 0.2s ease; outline: none;" placeholder="Search or type a condition..." required onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'" onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                            <datalist id="conditionsList">
                                <option value="Diabetes">
                                <option value="Hypertension">
                                <option value="Cataract">
                                <option value="Dengue Fever">
                                <option value="Kidney Stones">
                                <option value="Asthma">
                                <option value="Heart Disease">
                                <option value="Cancer">
                                <option value="COVID-19">
                                <option value="Arthritis">
                                <option value="Migraine">
                                <option value="Thyroid Disorder">
                                <option value="Liver Disease">
                                <option value="Pneumonia">
                            </datalist>
                            <div style="color: #ef4444; font-size: 13px; margin-top: 5px; display: none;" id="error-medicalCondition">Medical Condition is required.</div>
                        </div>

                        <div style="display: flex; flex-direction: column; margin-bottom: 15px;">
                            <label style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #000000;" for="treatmentProcedure">Treatment / Procedure *</label>
                            <input list="treatmentsList" type="text" id="treatmentProcedure" style="color: #000000; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; font-family: inherit; transition: all 0.2s ease; outline: none;" placeholder="Search or type a treatment..." required onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'" onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'">
                            <datalist id="treatmentsList">
                                <option value="Consultation">
                                <option value="Hospitalization">
                                <option value="Cataract Surgery">
                                <option value="Angioplasty">
                                <option value="Dialysis">
                                <option value="Chemotherapy">
                                <option value="Knee Replacement">
                                <option value="Appendectomy">
                                <option value="ICU Admission">
                                <option value="MRI Scan">
                                <option value="CT Scan">
                                <option value="Physiotherapy">
                            </datalist>
                            <div style="color: #ef4444; font-size: 13px; margin-top: 5px; display: none;" id="error-treatmentProcedure">Treatment Procedure is required.</div>
                        </div>

                        <div style="display: flex; flex-direction: column; margin-bottom: 15px; grid-column: span 2;">
                            <label style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #000000;" for="scenarioDescription">Scenario Description *</label>
                            <textarea id="scenarioDescription" style="color: #000000; padding: 12px 16px; border: 1px solid #d1d5db; border-radius: 8px; font-size: 15px; font-family: inherit; transition: all 0.2s ease; outline: none;" rows="3" placeholder="Describe the medical scenario in detail..." required onfocus="this.style.borderColor='#2563eb'; this.style.boxShadow='0 0 0 3px rgba(37, 99, 235, 0.1)'" onblur="this.style.borderColor='#d1d5db'; this.style.boxShadow='none'"></textarea>
                            <div style="color: #ef4444; font-size: 13px; margin-top: 5px; display: none;" id="error-scenarioDescription">Scenario Description is required (min 10 chars).</div>
                        </div>
                    </div>

                    <div style="display: flex; flex-direction: column; margin-bottom: 15px; grid-column: span 2; margin-top: 20px;">
                        <button type="button" id="verifyBtn" disabled style="background: #8b5cf6; color: white; font-size: 16px; font-weight: 600; padding: 14px 28px; border: none; border-radius: 8px; cursor: pointer; width: 100%; transition: background 0.2s ease;" onmouseover="if(!this.disabled) this.style.background='#7c3aed'" onmouseout="if(!this.disabled) this.style.background='#8b5cf6'">Verify Health Coverage</button>
                    </div>
                </form>
            </div>

            <div id="loadingState" style="display: none; text-align: center; padding: 40px;">
                <div style="border: 4px solid rgba(0,0,0,0.1); width: 40px; height: 40px; border-radius: 50%; border-left-color: #2563eb; animation: spin 1s linear infinite; margin: 0 auto 20px;"></div>
                <div id="loadingText" style="font-size: 18px; font-weight: 500; color: #2563eb;">Validating Inputs...</div>
            </div>

            <div id="resultsContainer" style="display: none;">
                <div class="header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <h2 style="font-size: 24px; font-weight: 700; color: #111827;">Verification Report</h2>
                    <div style="display: flex; gap: 10px;">
                        <button id="newAssessmentBtn" style="background: #ef4444; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: background 0.2s ease;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2v6h-6"/><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 2v6h6"/></svg>
                            New Assessment
                        </button>
                        <button id="downloadBtn" style="background: #10b981; color: white; padding: 10px 20px; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 8px; transition: background 0.2s ease;" onmouseover="this.style.background='#059669'" onmouseout="this.style.background='#10b981'">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            Download Report
                        </button>
                    </div>
                </div>
                
                <div class="report-section" id="singleReportView">
                    <!-- Single report content dynamically inserted here -->
                </div>
            </div>
            
            <style>
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                
                .report-section {
                    background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
                    border: 1px solid rgba(229, 231, 235, 0.8);
                    border-radius: 12px;
                    padding: 40px;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.03);
                    position: relative;
                }

                .report-metadata {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    margin-bottom: 35px;
                    padding-bottom: 30px;
                    border-bottom: 2px solid rgba(226, 232, 240, 0.8);
                }

                .report-metadata-item {
                    display: flex;
                    flex-direction: column;
                    background: rgba(255, 255, 255, 0.5);
                    padding: 15px;
                    border-radius: 8px;
                    border: 1px solid rgba(241, 245, 249, 1);
                }

                .report-metadata-label {
                    font-size: 12px;
                    color: #64748b;
                    text-transform: uppercase;
                    letter-spacing: 0.1em;
                    font-weight: 700;
                    margin-bottom: 6px;
                }

                .report-metadata-value {
                    font-size: 16px;
                    color: #0f172a;
                    font-weight: 600;
                }

                .report-content {
                    font-size: 16px;
                    color: #334155;
                    line-height: 1.8;
                }
                
                .report-content h1 {
                    margin-top: 30px;
                    margin-bottom: 20px;
                    font-size: 28px;
                    font-weight: 800;
                    background: linear-gradient(90deg, #1e3a8a, #3b82f6);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .report-content h2 {
                    margin-top: 40px;
                    margin-bottom: 15px;
                    font-size: 22px;
                    font-weight: 700;
                    color: #1e293b;
                    border-bottom: 1px solid #e2e8f0;
                    padding-bottom: 8px;
                }

                .report-content h3 {
                    margin-top: 30px;
                    margin-bottom: 12px;
                    color: #0f172a;
                    font-size: 18px;
                    font-weight: 600;
                }
                
                .report-content p {
                    margin-bottom: 16px;
                }
                
                .report-content strong {
                    color: #0f172a;
                    font-weight: 600;
                }
                
                .report-content ul {
                    padding-left: 24px;
                    margin-top: 12px;
                    margin-bottom: 20px;
                    background: rgba(248, 250, 252, 0.6);
                    padding: 15px 15px 15px 35px;
                    border-radius: 8px;
                    border-left: 3px solid #3b82f6;
                }

                .report-content li {
                    margin-bottom: 10px;
                }

                .report-content {
                    font-size: 15px;
                    color: #4b5563;
                    line-height: 1.6;
                }
                
                .report-list {
                    padding-left: 20px;
                    margin-top: 10px;
                }

                .report-list li {
                    margin-bottom: 6px;
                }
                
                @media (max-width: 768px) {
                    .report-metadata { grid-template-columns: 1fr; }
                    #healthVerificationForm > div:first-child { grid-template-columns: 1fr !important; }
                    #healthVerificationForm > div:first-child > div.full-width { grid-column: span 1 !important; }
                }
            </style>
        </section>
    `;
};

window.initHealthCoverageVerificationHub = () => {
    const form = document.getElementById('healthVerificationForm');
    const verifyBtn = document.getElementById('verifyBtn');
    const loadingState = document.getElementById('loadingState');
    const loadingText = document.getElementById('loadingText');
    const resultsContainer = document.getElementById('resultsContainer');
    const singleReportView = document.getElementById('singleReportView');
    let currentReportContent = '';

    if (!form || !verifyBtn) return;

    const inputs = {
        policyType: document.getElementById('policyType'),
        insuranceProvider: document.getElementById('insuranceProvider'),
        medicalCondition: document.getElementById('medicalCondition'),
        treatmentProcedure: document.getElementById('treatmentProcedure'),
        scenarioDescription: document.getElementById('scenarioDescription')
    };

    const errors = {
        policyType: document.getElementById('error-policyType'),
        insuranceProvider: document.getElementById('error-insuranceProvider'),
        medicalCondition: document.getElementById('error-medicalCondition'),
        treatmentProcedure: document.getElementById('error-treatmentProcedure'),
        scenarioDescription: document.getElementById('error-scenarioDescription')
    };

    // Inline Validation
    const validateForm = () => {
        let isValid = true;
        for (const key in inputs) {
            const val = inputs[key].value.trim();
            if (!val || (key === 'scenarioDescription' && val.length < 10)) {
                isValid = false;
                errors[key].style.display = inputs[key].value.length > 0 ? 'block' : 'none';
            } else {
                errors[key].style.display = 'none';
            }
        }
        
        verifyBtn.disabled = !isValid;
        if (isValid) {
            verifyBtn.style.background = '#8b5cf6';
            verifyBtn.style.cursor = 'pointer';
        } else {
            verifyBtn.style.background = '#9ca3af';
            verifyBtn.style.cursor = 'not-allowed';
        }
        
        return isValid;
    };

    for (const key in inputs) {
        inputs[key].addEventListener('input', validateForm);
        inputs[key].addEventListener('blur', () => {
            const val = inputs[key].value.trim();
            if (!val || (key === 'scenarioDescription' && val.length < 10)) {
                errors[key].style.display = 'block';
            }
        });
    }

    const stages = [
        "Generating Embeddings...",
        "Searching Health Policy...",
        "Retrieving Coverage Rules...",
        "Checking Waiting Periods...",
        "Analyzing Eligibility...",
        "Generating Verification Report...",
        "Rendering Results..."
    ];

    const simulateLoadingStages = () => {
        let currentStage = 0;
        let toggle = true;
        return setInterval(() => {
            if (currentStage < stages.length) {
                loadingText.textContent = stages[currentStage];
                loadingText.style.opacity = toggle ? '0.6' : '1';
                toggle = !toggle;
                if(toggle) currentStage++;
            }
        }, 600);
    };

    const generateSingleReport = (data, payload) => {
        const createSection = (title, content, iconHtml) => `
            <div style="background: white; border: 1px solid #E2E8F0; border-radius: 12px; padding: 24px; margin-bottom: 24px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <h3 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 700; color: #1E293B; display: flex; align-items: center; gap: 8px;">
                    ${iconHtml}
                    ${title}
                </h3>
                <div style="font-size: 15px; color: #475569; line-height: 1.6; white-space: pre-wrap;">${content || "No information provided."}</div>
            </div>
        `;

        const checkIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
        const alertIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;
        const clockIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`;
        const fileIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>`;
        const starIcon = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`;

        currentReportContent = `
# Health Coverage Verification Report

## Coverage Status
${data["Coverage Status"] || "No information provided."}

## Relevant Evidence
${data["Relevant Evidence"] || "No information provided."}

## Waiting Period Analysis
${data["Waiting Period Analysis"] || "No information provided."}

## Exclusions
${data["Exclusions"] || "No information provided."}

## Final Eligibility Assessment
${data["Final Eligibility Assessment"] || "No information provided."}
        `.trim();

        let htmlContent = `
            ${createSection("Coverage Status", data["Coverage Status"], checkIcon)}
            ${createSection("Relevant Evidence", data["Relevant Evidence"], fileIcon)}
            ${createSection("Waiting Period Analysis", data["Waiting Period Analysis"], clockIcon)}
            ${createSection("Exclusions", data["Exclusions"], alertIcon)}
            ${createSection("Final Eligibility Assessment", data["Final Eligibility Assessment"], starIcon)}
        `;

        singleReportView.innerHTML = `
            <div class="report-metadata">
                <div class="report-metadata-item">
                    <span class="report-metadata-label">Policy Type</span>
                    <span class="report-metadata-value">${payload.policy_type}</span>
                </div>
                <div class="report-metadata-item">
                    <span class="report-metadata-label">Provider</span>
                    <span class="report-metadata-value">${payload.insurance_provider}</span>
                </div>
                <div class="report-metadata-item">
                    <span class="report-metadata-label">Medical Condition</span>
                    <span class="report-metadata-value">${payload.medical_condition}</span>
                </div>
                <div class="report-metadata-item">
                    <span class="report-metadata-label">Treatment</span>
                    <span class="report-metadata-value">${payload.treatment_procedure}</span>
                </div>
            </div>
            <div class="report-content" style="padding: 20px 0;">
                ${htmlContent}
            </div>
        `;
    };
    
    // Download logic
    document.addEventListener('click', (e) => {
        const downloadBtn = e.target.closest('#downloadBtn');
        if (downloadBtn) {
            const blob = new Blob([currentReportContent], { type: 'text/markdown' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Health_Verification_Report_${Date.now()}.md`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    });

    // New Assessment logic
    document.addEventListener('click', (e) => {
        const newAssessmentBtn = e.target.closest('#newAssessmentBtn');
        if (newAssessmentBtn) {
            // Reset form
            form.reset();
            // Show form
            document.getElementById('formContainer').style.display = 'block';
            // Hide results
            resultsContainer.style.display = 'none';
            // Reset validation
            validateForm();
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    verifyBtn.addEventListener('click', async (event) => {
        event.preventDefault();
        
        if (!validateForm()) return;

        // UI State Update
        verifyBtn.disabled = true;
        verifyBtn.style.background = '#9ca3af';
        document.getElementById('formContainer').style.display = 'none';
        loadingState.style.display = 'block';
        resultsContainer.style.display = 'none';
        loadingText.textContent = "Validating Inputs...";
        
        const stageInterval = simulateLoadingStages();

        const payload = {
            policy_type: inputs.policyType.value.trim(),
            insurance_provider: inputs.insuranceProvider.value.trim(),
            medical_condition: inputs.medicalCondition.value.trim(),
            treatment_procedure: inputs.treatmentProcedure.value.trim(),
            scenario_description: inputs.scenarioDescription.value.trim()
        };

        try {
            const response = await fetch(window.API_URL + '/health-verification-hub/verify', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            clearInterval(stageInterval);
            loadingText.style.opacity = '1';

            if (!response.ok) {
                let errorMsg = `HTTP Error ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData.detail) errorMsg = errorData.detail;
                } catch(e) {}
                throw new Error(errorMsg);
            }

            const data = await response.json();
            
            generateSingleReport(data, payload);
            
            loadingState.style.display = 'none';
            resultsContainer.style.display = 'block';
            
            // Scroll to results gently
            resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });

        } catch (error) {
            clearInterval(stageInterval);
            loadingState.style.display = 'none';
            document.getElementById('formContainer').style.display = 'block';
            alert(`Verification Failed: ${error.message}`);
        } finally {
            verifyBtn.disabled = false;
            verifyBtn.style.background = '#8b5cf6';
        }
    });
    
    // Initial validation state
    validateForm();
};
