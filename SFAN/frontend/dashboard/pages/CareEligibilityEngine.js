export const CareEligibilityEngine = () => {
    // Preserve state if it exists, otherwise initialize
    const existingState = window.CareEligibilityActions?.state || {
        isAnalyzing: false,
        isAnalyzed: false,
        insuranceType: '',
        insuranceType: '',
        policy: '',
        bankName: '',
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
            const bankName = document.getElementById('ce-bank')?.value || '';
            const profile = document.getElementById('ce-profile').value.trim();

            const condition = document.getElementById('ce-condition').value.trim();
            const severity = document.getElementById('ce-severity').value;
            const conditionType = document.getElementById('ce-condition-type').value;
            const treatmentType = document.getElementById('ce-treatment-type').value;
            const admissionType = document.getElementById('ce-admission-type').value;
            const department = document.getElementById('ce-department').value.trim();
            
            const sumInsured = document.getElementById('ce-sum-insured').value.trim();
            const policyType = document.getElementById('ce-policy-type').value;
            const policyAge = document.getElementById('ce-policy-age').value.trim();

            if (!insuranceType || !policy || !bankName || !profile || !condition || !severity || !conditionType || !treatmentType || !admissionType || !department || !sumInsured || !policyAge) { 
                alert('Please fill out all fields before generating analysis.'); 
                return; 
            }

            window.CareEligibilityActions.state = {
                ...window.CareEligibilityActions.state,
                isAnalyzing: true,
                insuranceType, policy, bankName, patientProfile: profile,
                condition, severity, conditionType, treatmentType, admissionType, department,
                sumInsured, policyType, policyAge
            };
            
            document.getElementById('dashboard-root').innerHTML = CareEligibilityEngine();
            try {
                const token = localStorage.getItem('token');
                const response = await fetch('http://127.0.0.1:8000/intelligence/care-eligibility', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        bank_name: bankName,
                        insurance_type: insuranceType,
                        namespace: policy,
                        patient_profile: profile,
                        condition: condition,
                        severity: severity,
                        condition_type: conditionType,
                        treatment_type: treatmentType,
                        admission_type: admissionType,
                        department: department,
                        sum_insured: sumInsured,
                        policy_type: policyType,
                        policy_age: policyAge
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    alert('Analysis failed: ' + (data.error || 'Server error'));
                    window.CareEligibilityActions.state.isAnalyzing = false;
                    document.getElementById('dashboard-root').innerHTML = CareEligibilityEngine();
                    return;
                }

                const s = window.CareEligibilityActions.state;
                s.isAnalyzing = false;
                s.isAnalyzed = true;
                
                s.eligibilityStatus = data.eligibility_status || "Requires Review";
                s.confidence = data.confidence || "Low Confidence";
                s.evidence = data.evidence || "No evidence available.";
                s.sumInsured = data.sum_insured || "Coverage amount unavailable in retrieved documents.";
                s.coverageLimits = data.coverage_limits || "Coverage amount unavailable in retrieved documents.";
                s.subLimits = data.sub_limits || "Coverage amount unavailable in retrieved documents.";
                s.coPay = data.co_pay || "Coverage amount unavailable in retrieved documents.";
                s.coverageGaps = data.coverage_gaps || [];
                s.actionPlan = data.action_plan || [];
                s.policyRulesApplied = data.policy_rules_applied || [];

                document.getElementById('dashboard-root').innerHTML = CareEligibilityEngine();
            } catch (error) {
                alert('Network error: ' + error.message);
                window.CareEligibilityActions.state.isAnalyzing = false;
                document.getElementById('dashboard-root').innerHTML = CareEligibilityEngine();
            }
        },
        reset: () => {
            window.CareEligibilityActions.state = {
                isAnalyzing: false,
                isAnalyzed: false,
                insuranceType: '', policy: '', bankName: '', provider: '', patientProfile: '',
                condition: '', severity: '', conditionType: '', treatmentType: '',
                admissionType: '', department: '',
                matchScore: 0, policyName: '', policyType: '', sumInsured: '',
                age: '', gender: '', risk: ''
            };
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

                <!-- Input Section Row 1: Selecting Options -->
                ${!s.isAnalyzed ? `
                <div style="display: grid; grid-template-columns: repeat(5, 1fr); gap: 16px;">
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

                    <div style="${inputCardStyle}">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><path d="M12 7v4"></path></svg>
                            3. Select Bank
                        </div>
                        <select id="ce-bank" style="${selectStyle}">
                            <option value="SBI Bank" selected>SBI Bank</option>
                            <option value="Canara Bank">Canara Bank</option>
                            <option value="ICICI Bank">ICICI Bank</option>
                            <option value="HDFC Bank">HDFC Bank</option>
                            <option value="Axis Bank">Axis Bank</option>
                            <option value="IDFC FIRST Bank">IDFC FIRST Bank</option>
                            <option value="Bank of Baroda">Bank of Baroda</option>
                            <option value="IndusInd Bank">IndusInd Bank</option>
                            <option value="Kotak Mahindra Bank">Kotak Mahindra Bank</option>
                        </select>
                    </div>

                    <div style="${inputCardStyle}">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            4. Policy Details
                        </div>
                        <div style="display: flex; flex-direction: column; gap: 8px;">
                            <input type="text" id="ce-sum-insured" style="${inputStyle} padding: 8px;" placeholder="Sum Insured (e.g. ₹5,00,000)" value="₹5,00,000">
                            <select id="ce-policy-type" style="${selectStyle} padding: 8px;">
                                <option value="Individual" selected>Individual</option>
                                <option value="Family Floater">Family Floater</option>
                                <option value="Group Health">Group Health</option>
                            </select>
                            <input type="text" id="ce-policy-age" style="${inputStyle} padding: 8px;" placeholder="Policy Age (e.g. 2 Years)" value="2 Years">
                        </div>
                    </div>

                    <div style="${inputCardStyle}">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            5. Patient Profile
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

                <div style="display: flex; justify-content: flex-end; margin-top: 24px;">
                    <button onclick="window.CareEligibilityActions.analyze()" style="background: #6D28D9; color: #FFFFFF; border: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        ${s.isAnalyzing ? 'Analyzing Data...' : 'Generate Analysis'}
                    </button>
                </div>
                ` : ''}

                ${s.isAnalyzed ? `
                <div style="display: flex; justify-content: flex-end; margin-bottom: 24px;">
                    <button onclick="window.CareEligibilityActions.reset()" style="background: #E5E7EB; color: #374151; border: 1px solid #D1D5DB; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        ← New Assessment
                    </button>
                </div>
                <div style="padding: 24px 0; animation: fadeIn 0.5s ease; border-top: 1px solid #E5E7EB;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 28px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0;">Analysis Results</h2>
                    </div>



                    <!-- Row 3: Eligibility Result and Coverage Summary -->
                    <div style="display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; margin-bottom: 24px;">
                        <!-- Eligibility Result Card -->
                        <div style="${cardStyle} border: 2px solid ${s.eligibilityStatus === 'Eligible' ? '#22C55E' : s.eligibilityStatus === 'Not Eligible' ? '#EF4444' : '#F59E0B'}; background: #FAFAFA; justify-content: space-between;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                                <div>
                                    <div style="display: flex; align-items: center; gap: 8px; color: ${s.eligibilityStatus === 'Eligible' ? '#16A34A' : s.eligibilityStatus === 'Not Eligible' ? '#DC2626' : '#D97706'}; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                                        ELIGIBILITY RESULT
                                    </div>
                                    <div style="font-size: 15px; font-weight: 600; color: #4B5563; margin-bottom: 8px;">Status</div>
                                    <h2 style="font-size: 32px; font-weight: 800; color: ${s.eligibilityStatus === 'Eligible' ? '#22C55E' : s.eligibilityStatus === 'Not Eligible' ? '#EF4444' : '#F59E0B'}; margin: 0 0 16px 0; line-height: 1;">${s.eligibilityStatus}</h2>
                                    <div style="display: flex; align-items: center; gap: 8px; color: #4B5563; font-size: 14px; font-weight: 500;">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                        ${s.confidence}
                                    </div>
                                </div>
                            </div>
                            <div style="display: flex; gap: 16px; background: #F8FAFC; padding: 16px; border-radius: 8px; border: 1px solid #E2E8F0;">
                                <div style="flex: 1; display: flex; align-items: flex-start; gap: 12px;">
                                    <div style="background: #E2E8F0; padding: 8px; border-radius: 8px;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                                    </div>
                                    <div style="display: flex; flex-direction: column;">
                                        <span style="font-size: 11px; font-weight: 600; color: #4B5563; margin-bottom: 4px;">EVIDENCE</span>
                                        <span style="font-size: 13px; font-style: italic; color: #334155;">"${s.evidence}"</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Coverage Summary Card -->
                        <div style="${cardStyle}">
                            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                                <div style="background: #F5F3FF; padding: 8px; border-radius: 8px;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                                </div>
                                <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Coverage Summary</h3>
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F3F4F6; padding-bottom: 16px;">
                                    <span style="font-size: 14px; font-weight: 500; color: #4B5563;">Sum Insured</span>
                                    <span style="font-size: 14px; font-weight: 700; color: #111827; text-align: right; max-width: 60%;">${s.sumInsured}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F3F4F6; padding-bottom: 16px;">
                                    <span style="font-size: 14px; font-weight: 500; color: #4B5563;">Coverage Limits</span>
                                    <span style="font-size: 14px; font-weight: 700; color: #16A34A; text-align: right; max-width: 60%;">${s.coverageLimits}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #F3F4F6; padding-bottom: 16px;">
                                    <span style="font-size: 14px; font-weight: 500; color: #4B5563;">Sub Limits</span>
                                    <span style="font-size: 14px; font-weight: 700; color: #D97706; text-align: right; max-width: 60%;">${s.subLimits}</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <span style="font-size: 14px; font-weight: 500; color: #4B5563;">Co-pay</span>
                                    <span style="font-size: 14px; font-weight: 700; color: #DC2626; text-align: right; max-width: 60%;">${s.coPay}</span>
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
                                    <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Coverage Gaps & Exclusions</h3>
                                </div>
                                <ul style="margin: 0 0 24px 0; padding-left: 20px; font-size: 14px; color: #4B5563; display: flex; flex-direction: column; gap: 16px;">
                                    ${s.coverageGaps.length > 0 ? s.coverageGaps.map(g => `<li style="color: #4B5563; padding-left: 8px;">${g}</li>`).join('') : '<li style="color: #4B5563; padding-left: 8px;">No specific exclusions found in retrieved documents.</li>'}
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Action Plan Card -->
                        <div style="${cardStyle} justify-content: space-between;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                                    <div style="background: #EFF6FF; padding: 8px; border-radius: 8px;">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                    </div>
                                    <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Required Documents & Actions</h3>
                                </div>
                                <ul style="margin: 0 0 24px 0; padding: 0; list-style: none; font-size: 14px; color: #4B5563; display: flex; flex-direction: column; gap: 12px;">
                                    ${s.actionPlan.length > 0 ? s.actionPlan.map(a => `<li style="display: flex; align-items: flex-start; gap: 10px;"><svg width="18" height="18" viewBox="0 0 24 24" fill="#3B82F6" stroke="#3B82F6" stroke-width="2" style="margin-top: 2px; flex-shrink: 0;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01" stroke="#FFFFFF"></polyline></svg> <span>${a}</span></li>`).join('') : '<li style="display: flex; align-items: flex-start; gap: 10px;"><span>No explicit actions found in retrieved documents.</span></li>'}
                                </ul>
                            </div>
                        </div>

                        <!-- Policy Rules Applied Card -->
                        <div style="${cardStyle} justify-content: space-between;">
                            <div>
                                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
                                    <div style="background: #ECFDF5; padding: 8px; border-radius: 8px;">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                    </div>
                                    <h3 style="font-size: 16px; font-weight: 700; color: #111827; margin: 0;">Policy Rules Applied</h3>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 16px;">
                                    ${s.policyRulesApplied.length > 0 ? s.policyRulesApplied.map(r => `
                                    <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 12px; border-radius: 8px;">
                                        <div style="font-size: 13px; font-weight: 700; color: #1E293B; margin-bottom: 4px;">${r.rule}</div>
                                        <div style="font-size: 12px; font-style: italic; color: #475569; margin-bottom: 6px;">"${r.clause}"</div>
                                        <div style="font-size: 11px; font-weight: 600; color: #64748B;">Source: ${r.source} (Page ${r.page})</div>
                                    </div>
                                    `).join('') : '<div style="font-size: 13px; color: #475569;">No specific rules applied.</div>'}
                                </div>
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
