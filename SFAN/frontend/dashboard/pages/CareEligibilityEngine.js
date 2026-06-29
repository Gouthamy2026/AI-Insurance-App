export const CareEligibilityEngine = () => {
    // Preserve state if it exists, otherwise initialize
    const existingState = window.CareEligibilityActions?.state || {
        isAnalyzing: false,
        isAnalyzed: false,
        insuranceType: '',
        policy: '',
        provider: '',
        patientProfile: '',
        condition: '',
        severity: '',
        conditionType: '',
        treatmentType: '',
        admissionType: '',
        department: '',
        
        // Results
        matchScore: 0,
        policyName: '',
        policyType: '',
        sumInsured: '',
        age: '',
        gender: '',
        risk: ''
    };

    window.CareEligibilityActions = {
        state: existingState,
        analyze: async () => {
            const insuranceType = document.getElementById('ce-insurance-type').value;
            const policy = document.getElementById('ce-policy').value;
            const profile = document.getElementById('ce-profile').value.trim();

            const condition = document.getElementById('ce-condition').value.trim();
            const severity = document.getElementById('ce-severity').value;
            const conditionType = document.getElementById('ce-condition-type').value;
            const treatmentType = document.getElementById('ce-treatment-type').value;
            const admissionType = document.getElementById('ce-admission-type').value;
            const department = document.getElementById('ce-department').value.trim();
            
            if (!insuranceType || !policy || !profile || !condition || !severity || !conditionType || !treatmentType || !admissionType || !department) { 
                alert('Please fill out all fields before generating analysis.'); 
                return; 
            }

            window.CareEligibilityActions.state = {
                ...window.CareEligibilityActions.state,
                isAnalyzing: true,
                insuranceType, policy, patientProfile: profile,
                condition, severity, conditionType, treatmentType, admissionType, department
            };
            
            document.getElementById('dashboard-root').innerHTML = CareEligibilityEngine();

            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const s = window.CareEligibilityActions.state;
            s.isAnalyzing = false;
            s.isAnalyzed = true;
            
            s.policyName = "Tata AIG General Insurance";
            s.policyType = "Comprehensive (Health Insurance)";
            s.sumInsured = "₹ 7,50,000";
            
            // parse age and gender from profile string if possible, or fallback
            s.age = "29 Years";
            s.gender = "Male";
            s.risk = "Low";
            s.matchScore = 88;

            document.getElementById('dashboard-root').innerHTML = CareEligibilityEngine();
        }
    };

    const s = window.CareEligibilityActions.state;
    const namespaces = [
        "regulatory_governance",
        "Comprehensive Car Insurance",
        "health_policy",
        "home_folder",
        "banking_governance",
        "travel_policy",
        "life_wealth_policy"
    ];

    const providerOptions = [
        "AI_SUGGEST",
        "Apollo Hospitals",
        "Fortis Healthcare",
        "Max Super Speciality",
        "Medanta",
        "Manipal Hospitals",
        "Narayana Health"
    ];

    const inputCardStyle = `background: #FAFAFA; border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); padding: 16px; display: flex; flex-direction: column; transition: all 0.3s ease;`;
    const cardStyle = `background: #FAFAFA; border-radius: 16px; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); padding: 24px; display: flex; flex-direction: column; transition: all 0.3s ease;`;
    const labelStyle = `font-size: 12px; font-weight: 500; color: #6B7280;`;
    const valueStyle = `font-size: 14px; font-weight: 700; color: #111827;`;
    const inputStyle = `width: 100%; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; outline: none; background: #FFFFFF; font-size: 14px; color: #374151; box-sizing: border-box;`;
    const selectStyle = inputStyle + ` cursor: pointer; -webkit-appearance: none; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%236B7280\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>'); background-repeat: no-repeat; background-position: right 12px center;`;

    return `
        <div style="font-family: 'Inter', system-ui, sans-serif; padding: 32px 48px 100px 48px; box-sizing: border-box; color: #1F2937; width: 100%; min-height: 100vh; background: transparent;">
            
            <div style="width: 100%; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
                
                <!-- Title Section -->
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                    <div>
                        <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.5px;">Care Eligibility Engine</h1>
                    </div>
                </div>
                <p style="color: #4B5563; font-size: 13px; margin: -16px 0 0 0; font-weight: 500;">Smart insights on coverage, eligibility and costs for your medical scenario.</p>

                <!-- Input Section Row 1: Selecting Options (Like Claim Outcome Analyzer) -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
                    <div style="${inputCardStyle}">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><path d="M12 7v4"></path></svg>
                            1. Insurance Category
                        </div>
                        <select id="ce-insurance-type" style="${selectStyle}">
                            <option value="Health Insurance" selected>Health Insurance</option>
                            <option value="Personal Accident">Personal Accident</option>
                            <option value="Critical Illness">Critical Illness</option>
                        </select>
                    </div>

                    <div style="${inputCardStyle}">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            2. Select Policy
                        </div>
                        <select id="ce-policy" style="${selectStyle}">
                            <option value="health_policy" selected>Health Policy</option>
                            ${namespaces.map(ns => ns !== 'health_policy' ? `<option value="${ns}">${ns.replace(/_/g, ' ')}</option>` : '').join('')}
                        </select>
                    </div>

                    <div style="${inputCardStyle} justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px; font-size: 14px; font-weight: 700; color: #111827;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            3. Policy Details
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 6px; font-size: 13px;">
                            <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280; font-weight: 500;">Sum Insured:</span> <span style="font-weight: 700; color: #111827;">₹5,00,000</span></div>
                            <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280; font-weight: 500;">Policy Type:</span> <span style="font-weight: 700; color: #111827;">Individual</span></div>
                            <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280; font-weight: 500;">Policy Age:</span> <span style="font-weight: 700; color: #111827;">2 Years</span></div>
                        </div>
                    </div>

                    <div style="${inputCardStyle}">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            4. Patient Profile
                        </div>
                        <input type="text" id="ce-profile" style="${inputStyle}" placeholder="e.g. 29 Years, Male" value="29 Years, Male">
                    </div>
                </div>

                <!-- Input Section Row 2: Medical Details -->
                <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px;">
                    <div style="${inputCardStyle}">
                        <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">Condition</div>
                        <input type="text" id="ce-condition" style="${inputStyle} padding: 10px;" placeholder="e.g. Fracture" value="Fracture">
                    </div>
                    <div style="${inputCardStyle}">
                        <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">Severity</div>
                        <select id="ce-severity" style="${selectStyle} padding: 10px;">
                            <option value="Mild">Mild</option>
                            <option value="Moderate" selected>Moderate</option>
                            <option value="Severe">Severe</option>
                            <option value="Critical">Critical</option>
                        </select>
                    </div>
                    <div style="${inputCardStyle}">
                        <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">Condition Type</div>
                        <select id="ce-condition-type" style="${selectStyle} padding: 10px;">
                            <option value="New Condition" selected>New Condition</option>
                            <option value="Pre-existing">Pre-existing</option>
                            <option value="Chronic">Chronic</option>
                        </select>
                    </div>
                    <div style="${inputCardStyle}">
                        <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">Treatment Type</div>
                        <select id="ce-treatment-type" style="${selectStyle} padding: 10px;">
                            <option value="Surgery" selected>Surgery</option>
                            <option value="Therapy">Therapy</option>
                            <option value="Medication">Medication</option>
                            <option value="Consultation">Consultation</option>
                        </select>
                    </div>
                    <div style="${inputCardStyle}">
                        <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">Admission Type</div>
                        <select id="ce-admission-type" style="${selectStyle} padding: 10px;">
                            <option value="Emergency" selected>Emergency</option>
                            <option value="Planned">Planned</option>
                            <option value="Day Care">Day Care</option>
                            <option value="OPD">OPD</option>
                        </select>
                    </div>
                    <div style="${inputCardStyle}">
                        <div style="font-size: 13px; font-weight: 600; color: #111827; margin-bottom: 8px;">Department</div>
                        <input type="text" id="ce-department" style="${inputStyle} padding: 10px;" placeholder="e.g. Orthopedics" value="Orthopedics">
                    </div>
                </div>

                ${!s.isAnalyzed ? `
                <div style="display: flex; justify-content: flex-end;">
                    <button onclick="window.CareEligibilityActions.analyze()" style="background: #6D28D9; color: #FFFFFF; border: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        ${s.isAnalyzing ? 'Analyzing Data...' : 'Generate Analysis'}
                    </button>
                </div>
                ` : ''}

                ${s.isAnalyzed ? `
                <div style="padding: 24px 0; animation: fadeIn 0.5s ease;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 28px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0;">Analysis Results</h2>
                    </div>



                    <!-- Row 3: Eligibility Result and Cost Summary -->
                    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; margin-bottom: 24px;">
                        <!-- Eligibility Result Card -->
                        <div style="${cardStyle} border: 2px solid #22C55E; background: #FAFAFA; justify-content: space-between;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                                <div>
                                    <div style="display: flex; align-items: center; gap: 8px; color: #16A34A; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                                        ELIGIBILITY RESULT
                                    </div>
                                    <div style="font-size: 15px; font-weight: 600; color: #4B5563; margin-bottom: 8px;">Approval Probability</div>
                                    <h2 style="font-size: 42px; font-weight: 800; color: #22C55E; margin: 0 0 16px 0; line-height: 1;">High</h2>
                                    <div style="display: flex; align-items: center; gap: 8px; color: #4B5563; font-size: 14px; font-weight: 500;">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="#22C55E" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                        Great! Your claim is highly likely to be approved.
                                    </div>
                                </div>
                                <!-- Circular Progress -->
                                <div style="position: relative; width: 120px; height: 120px; display: flex; align-items: center; justify-content: center;">
                                    <svg width="120" height="120" viewBox="0 0 120 120" style="transform: rotate(-90deg);">
                                        <circle cx="60" cy="60" r="46" fill="none" stroke="#DCFCE7" stroke-width="8"></circle>
                                        <circle cx="60" cy="60" r="46" fill="none" stroke="#22C55E" stroke-width="8" stroke-dasharray="289" stroke-dashoffset="${289 - (289 * s.matchScore / 100)}" stroke-linecap="round"></circle>
                                    </svg>
                                    <div style="position: absolute; display: flex; flex-direction: column; align-items: center;">
                                        <span style="font-size: 26px; font-weight: 800; color: #16A34A; letter-spacing: -1px;">${s.matchScore}%</span>
                                        <span style="font-size: 12px; font-weight: 500; color: #6B7280;">Score</span>
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 16px; background: #F0FDF4; padding: 16px; border-radius: 8px; border: 1px solid #DCFCE7;">
                                <div style="flex: 1; display: flex; align-items: center; gap: 12px;">
                                    <div style="background: #DCFCE7; padding: 8px; border-radius: 8px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                                    </div>
                                    <div style="display: flex; flex-direction: column;">
                                        <span style="font-size: 11px; font-weight: 600; color: #4B5563;">Risk Level</span>
                                        <span style="font-size: 14px; font-weight: 700; color: #16A34A;">Low</span>
                                    </div>
                                </div>
                                <div style="flex: 1; display: flex; align-items: center; gap: 12px; border-left: 1px solid #DCFCE7; padding-left: 16px;">
                                    <div style="background: #FEF3C7; padding: 8px; border-radius: 8px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                    </div>
                                    <div style="display: flex; flex-direction: column;">
                                        <span style="font-size: 11px; font-weight: 600; color: #4B5563;">Rejection Risk</span>
                                        <span style="font-size: 14px; font-weight: 700; color: #D97706;">15%</span>
                                    </div>
                                </div>
                                <div style="flex: 1; display: flex; align-items: center; gap: 12px; border-left: 1px solid #DCFCE7; padding-left: 16px;">
                                    <div style="background: #DCFCE7; padding: 8px; border-radius: 8px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                                    </div>
                                    <div style="display: flex; flex-direction: column;">
                                        <span style="font-size: 11px; font-weight: 600; color: #4B5563;">Waiting Period</span>
                                        <span style="font-size: 14px; font-weight: 700; color: #16A34A;">Completed</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Cost Summary Card -->
                        <div style="${cardStyle}">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                                <div style="background: #F5F3FF; padding: 8px; border-radius: 8px;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                                </div>
                                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Cost Summary</h3>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F3F4F6; padding-bottom: 16px;">
                                    <span style="font-size: 14px; font-weight: 500; color: #4B5563;">Estimated Total Cost</span>
                                    <span style="font-size: 16px; font-weight: 700; color: #111827;">₹ 1,20,000</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F3F4F6; padding-bottom: 16px;">
                                    <span style="font-size: 14px; font-weight: 500; color: #4B5563;">Insurance Coverage</span>
                                    <span style="font-size: 16px; font-weight: 700; color: #16A34A;">₹ 1,02,000</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 14px; font-weight: 500; color: #4B5563;">You Pay (Approx.)</span>
                                    <span style="font-size: 16px; font-weight: 700; color: #DC2626;">₹ 18,000</span>
                                </div>
                            </div>
                            <div style="background: #F5F3FF; padding: 16px; border-radius: 8px; display: flex; align-items: center; gap: 12px; margin-top: auto;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2"><path d="M19 8c0-3.3-2.7-6-6-6-3 0-5.4 2.2-5.9 5.1C3.5 7.6 2 10.3 2 13c0 3.3 2.7 6 6 6h11c2.2 0 4-1.8 4-4s-1.8-4-4-4v-3z"></path><circle cx="15" cy="11" r="1"></circle></svg>
                                <div style="display: flex; flex-direction: column;">
                                    <span style="font-size: 12px; font-weight: 600; color: #4B5563;">You save approximately</span>
                                    <span style="font-size: 15px; font-weight: 700; color: #6D28D9;">₹ 1,02,000 (85%)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Row 4: Coverage Gaps, Action Plan, Policy Rule Applied -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px;">
                        <!-- Coverage Gaps Card -->
                        <div style="${cardStyle} justify-content: space-between;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                                    <div style="background: #FFFBEB; padding: 8px; border-radius: 8px;">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                    </div>
                                    <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Coverage Gaps</h3>
                                </div>
                                <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; color: #4B5563; display: flex; flex-direction: column; gap: 16px;">
                                    <li style="color: #4B5563; padding-left: 8px;">Wear and tear parts not covered.</li>
                                    <li style="color: #4B5563; padding-left: 8px;">Electrical breakdown not covered.</li>
                                    <li style="color: #4B5563; padding-left: 8px;">Depreciation on parts applicable.</li>
                                </ul>
                            </div>
                            <div style="background: #FFFBEB; padding: 12px 16px; border-radius: 8px; border: 1px solid #FEF3C7; display: flex; align-items: center; gap: 12px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                <span style="font-size: 13px; font-weight: 600; color: #92400E;">Consider Engine Protect Add-on for better coverage.</span>
                            </div>
                        </div>
                        
                        <!-- Action Plan Card -->
                        <div style="${cardStyle} justify-content: space-between;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                                    <div style="background: #EFF6FF; padding: 8px; border-radius: 8px;">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    </div>
                                    <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Action Plan</h3>
                                </div>
                                <ul style="margin: 0 0 24px 0; padding: 0; list-style: none; font-size: 14px; color: #4B5563; display: flex; flex-direction: column; gap: 12px;">
                                    <li style="display: flex; align-items: flex-start; gap: 10px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6" stroke="#3B82F6" stroke-width="2" style="margin-top: 2px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01" stroke="#FFFFFF"></polyline></svg> <span>Capture clear photos of the damage.</span></li>
                                    <li style="display: flex; align-items: flex-start; gap: 10px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6" stroke="#3B82F6" stroke-width="2" style="margin-top: 2px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01" stroke="#FFFFFF"></polyline></svg> <span>File the claim as soon as possible.</span></li>
                                    <li style="display: flex; align-items: flex-start; gap: 10px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6" stroke="#3B82F6" stroke-width="2" style="margin-top: 2px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01" stroke="#FFFFFF"></polyline></svg> <span>Use Tata AIG network garage for cashless benefits.</span></li>
                                    <li style="display: flex; align-items: flex-start; gap: 10px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6" stroke="#3B82F6" stroke-width="2" style="margin-top: 2px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01" stroke="#FFFFFF"></polyline></svg> <span>Keep all documents and repair bills safe.</span></li>
                                </ul>
                            </div>
                            <div style="background: #EFF6FF; padding: 12px 16px; border-radius: 8px; border: 1px solid #DBEAFE; display: flex; align-items: center; gap: 12px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                <span style="font-size: 13px; font-weight: 600; color: #1D4ED8;">Follow these steps to increase approval chances.</span>
                            </div>
                        </div>

                        <!-- Policy Rule Applied Card -->
                        <div style="${cardStyle} justify-content: space-between;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                                    <div style="background: #ECFDF5; padding: 8px; border-radius: 8px;">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    </div>
                                    <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Policy Rule Applied</h3>
                                </div>
                                <ul style="margin: 0 0 24px 0; padding: 0; list-style: none; font-size: 14px; color: #4B5563; display: flex; flex-direction: column; gap: 12px;">
                                    <li style="display: flex; align-items: flex-start; gap: 10px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="#10B981" stroke="#10B981" stroke-width="2" style="margin-top: 2px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01" stroke="#FFFFFF"></polyline></svg> <span>Fracture treatment covered</span></li>
                                    <li style="display: flex; align-items: flex-start; gap: 10px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="#10B981" stroke="#10B981" stroke-width="2" style="margin-top: 2px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01" stroke="#FFFFFF"></polyline></svg> <span>Waiting period completed</span></li>
                                    <li style="display: flex; align-items: flex-start; gap: 10px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="#10B981" stroke="#10B981" stroke-width="2" style="margin-top: 2px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01" stroke="#FFFFFF"></polyline></svg> <span>Emergency admission eligible</span></li>
                                    <li style="display: flex; align-items: flex-start; gap: 10px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" style="margin-top: 2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg> <span style="color: #92400E; font-weight: 500;">Co-payment applicable</span></li>
                                </ul>
                            </div>
                            <div style="background: #FEF3C7; padding: 12px 16px; border-radius: 8px; border: 1px solid #FDE68A; display: flex; align-items: center; gap: 12px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                                <span style="font-size: 13px; font-weight: 600; color: #92400E;">Review co-payment terms before proceeding.</span>
                            </div>
                        </div>
                    </div>
                </div>
                ` : ''}
            </div>
            <style>
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            </style>
        </div>
    `;
};
