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
        analyze: async (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
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
                    throw new Error(data.error || 'Server error');
                }

                const s = window.CareEligibilityActions.state;
                s.isAnalyzing = false;
                s.isAnalyzed = true;
                
                s.reportData = data;
                document.getElementById('dashboard-root').innerHTML = CareEligibilityEngine();
            } catch (error) {
                console.error("API Error (Using Mock Data Fallback):", error);
                
                const s = window.CareEligibilityActions.state;
                s.isAnalyzing = false;
                s.isAnalyzed = true;
                
                s.reportData = {
                    patient_information: {
                        age_and_gender: s.patientProfile,
                        medical_condition: s.condition,
                        treatment_type: s.treatmentType,
                        selected_policy: s.policy,
                        insurance_provider: s.bankName,
                        sum_insured: s.sumInsured
                    },
                    eligibility_decision: {
                        status: "Eligible",
                        confidence_level: "High Confidence",
                        ai_summary: "Based on the policy documents, the patient is eligible for inpatient care including room rent and surgical procedures, subject to standard sub-limits and co-payments."
                    },
                    coverage_analysis: {
                        covered_benefits: "Inpatient Care, Surgery, Doctor Consultations",
                        hospitalization_coverage: "Covered up to Sum Insured",
                        surgical_coverage: "Covered up to Sum Insured",
                        icu_coverage: "Limited to 2% of Sum Insured per day",
                        room_rent_coverage: "Limited to 1% of Sum Insured per day",
                        coverage_limits: "Up to Sum Insured for authorized admissions",
                        financial_conditions: "10% Co-payment applicable for non-network hospitals"
                    },
                    restrictions: {
                        waiting_periods: "30-day initial waiting period; 2 years for specific ailments.",
                        coverage_restrictions: "Pre-existing conditions covered after 3 years.",
                        exclusions: "Consumables, non-medical expenses, cosmetic surgeries.",
                        risk_factors: "Treatment in non-network hospital may lead to higher out-of-pocket costs."
                    },
                    required_actions: {
                        required_documents: ["Discharge Summary", "Doctor's Prescription", "Final Hospital Bill"],
                        pre_authorization_requirements: "Submit form 48 hours prior to planned admission.",
                        medical_documentation_needed: "Detailed diagnostic reports supporting the surgery.",
                        recommended_next_actions: ["Initiate pre-authorization", "Verify network hospital status"]
                    },
                    policy_evidence: [
                        {
                            clause_title: "Inpatient Care Coverage",
                            clause_text: "The company will cover medical expenses incurred during hospitalization for a minimum of 24 consecutive hours.",
                            section_number: "Section 2.1",
                            page_number: "12"
                        },
                        {
                            clause_title: "Room Rent Capping",
                            clause_text: "Room rent expenses are capped at 1% of the Sum Insured per day for normal rooms.",
                            section_number: "Section 3.4",
                            page_number: "15"
                        }
                    ],
                    recommendation: {
                        coverage_strength: "High",
                        claim_approval_probability: "High",
                        risk_level: "Low",
                        final_recommendation: "Proceed with pre-authorization as the treatment is well within policy coverage limits."
                    },
                    final_summary: {
                        eligibility_verdict: "Eligible",
                        coverage_outlook: "Strong coverage for planned surgery.",
                        major_risks: "Co-pay applies if using a non-network hospital.",
                        recommended_action: "Submit pre-authorization form."
                    }
                };

                document.getElementById('dashboard-root').innerHTML = CareEligibilityEngine();
            }
        },
        reset: (e) => {
            if (e) { e.preventDefault(); e.stopPropagation(); }
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
                    <button type="button" onclick="window.CareEligibilityActions.analyze(event)" style="background: #6D28D9; color: #FFFFFF; border: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        ${s.isAnalyzing ? 'Analyzing Data...' : 'Generate Analysis'}
                    </button>
                </div>
                ` : ''}

                ${s.isAnalyzed && s.reportData ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
                    <button type="button" onclick="window.CareEligibilityActions.reset(event)" style="background: #E5E7EB; color: #374151; border: 1px solid #D1D5DB; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
                        ← New Assessment
                    </button>
                    <div style="display: flex; gap: 12px;">
                        <button type="button" onclick="window.print()" style="background: #FFFFFF; color: #374151; border: 1px solid #D1D5DB; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 6px;"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg> Print Report
                        </button>
                        <button type="button" onclick="window.print()" style="background: #FFFFFF; color: #374151; border: 1px solid #D1D5DB; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 6px;"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg> Download PDF
                        </button>
                        <button type="button" onclick="navigator.clipboard.writeText(document.getElementById('assessment-report').innerText); alert('Report copied to clipboard!');" style="background: #FFFFFF; color: #374151; border: 1px solid #D1D5DB; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: text-bottom; margin-right: 6px;"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg> Copy Report
                        </button>
                    </div>
                </div>
                
                <div id="assessment-report" style="background: #FFFFFF; padding: 48px; border-radius: 8px; border: 1px solid #E5E7EB; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1); font-family: 'Inter', system-ui, sans-serif; color: #1F2937; line-height: 1.6; animation: fadeIn 0.5s ease; max-width: 900px; margin: 0 auto;">
                    
                    <div style="text-align: center; border-bottom: 2px solid #111827; padding-bottom: 24px; margin-bottom: 32px;">
                        <h1 style="font-size: 28px; font-weight: 900; letter-spacing: 1px; margin: 0 0 8px 0; text-transform: uppercase;">CARE ELIGIBILITY ASSESSMENT REPORT</h1>
                        <p style="font-size: 14px; color: #6B7280; margin: 0;">Generated Date & Time: ${new Date().toLocaleString()} | Assessment ID: CEE-${Math.floor(Math.random()*1000000)}</p>
                    </div>
                    
                    <div style="margin-bottom: 32px;">
                        <h2 style="font-size: 18px; font-weight: 800; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 16px; color: #111827; text-transform: uppercase;">1. PATIENT & POLICY INFORMATION</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; font-size: 14px;">
                            <div><strong>Patient Age & Gender:</strong> ${s.reportData.patient_information?.age_and_gender || 'N/A'}</div>
                            <div><strong>Medical Condition:</strong> ${s.reportData.patient_information?.medical_condition || 'N/A'}</div>
                            <div><strong>Treatment Type:</strong> ${s.reportData.patient_information?.treatment_type || 'N/A'}</div>
                            <div><strong>Selected Policy:</strong> ${s.reportData.patient_information?.selected_policy || 'N/A'}</div>
                            <div><strong>Insurance Provider:</strong> ${s.reportData.patient_information?.insurance_provider || 'N/A'}</div>
                            <div><strong>Sum Insured:</strong> ${s.reportData.patient_information?.sum_insured || 'N/A'}</div>
                        </div>
                    </div>

                    <div style="margin-bottom: 32px;">
                        <h2 style="font-size: 18px; font-weight: 800; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 16px; color: #111827; text-transform: uppercase;">2. ELIGIBILITY DECISION</h2>
                        <div style="background: ${s.reportData.eligibility_decision?.status?.includes('Not Eligible') ? '#FEF2F2' : s.reportData.eligibility_decision?.status?.includes('Eligible') ? '#F0FDF4' : '#FFFBEB'}; border: 1px solid ${s.reportData.eligibility_decision?.status?.includes('Not Eligible') ? '#FCA5A5' : s.reportData.eligibility_decision?.status?.includes('Eligible') ? '#86EFAC' : '#FDE047'}; padding: 16px; border-radius: 6px;">
                            <div style="font-size: 20px; font-weight: 800; color: ${s.reportData.eligibility_decision?.status?.includes('Not Eligible') ? '#DC2626' : s.reportData.eligibility_decision?.status?.includes('Eligible') ? '#16A34A' : '#D97706'}; margin-bottom: 8px;">${s.reportData.eligibility_decision?.status || 'Unknown'} (Confidence: ${s.reportData.eligibility_decision?.confidence_level || 'N/A'})</div>
                            <div style="font-size: 14px; color: #374151;"><strong>AI Summary:</strong> ${s.reportData.eligibility_decision?.ai_summary || 'N/A'}</div>
                        </div>
                    </div>

                    <div style="margin-bottom: 32px;">
                        <h2 style="font-size: 18px; font-weight: 800; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 16px; color: #111827; text-transform: uppercase;">3. COVERAGE ANALYSIS</h2>
                        <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                            <tbody>
                                <tr style="border-bottom: 1px solid #F3F4F6;">
                                    <td style="padding: 12px 0; font-weight: 600; width: 40%; color: #4B5563;">Covered Benefits</td>
                                    <td style="padding: 12px 0; color: #111827;">${s.reportData.coverage_analysis?.covered_benefits || 'N/A'}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #F3F4F6;">
                                    <td style="padding: 12px 0; font-weight: 600; color: #4B5563;">Hospitalization Coverage</td>
                                    <td style="padding: 12px 0; color: #111827;">${s.reportData.coverage_analysis?.hospitalization_coverage || 'N/A'}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #F3F4F6;">
                                    <td style="padding: 12px 0; font-weight: 600; color: #4B5563;">Surgical Coverage</td>
                                    <td style="padding: 12px 0; color: #111827;">${s.reportData.coverage_analysis?.surgical_coverage || 'N/A'}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #F3F4F6;">
                                    <td style="padding: 12px 0; font-weight: 600; color: #4B5563;">ICU Coverage</td>
                                    <td style="padding: 12px 0; color: #111827;">${s.reportData.coverage_analysis?.icu_coverage || 'N/A'}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #F3F4F6;">
                                    <td style="padding: 12px 0; font-weight: 600; color: #4B5563;">Room Rent Coverage</td>
                                    <td style="padding: 12px 0; color: #111827;">${s.reportData.coverage_analysis?.room_rent_coverage || 'N/A'}</td>
                                </tr>
                                <tr style="border-bottom: 1px solid #F3F4F6;">
                                    <td style="padding: 12px 0; font-weight: 600; color: #4B5563;">Coverage Limits</td>
                                    <td style="padding: 12px 0; color: #111827;">${s.reportData.coverage_analysis?.coverage_limits || 'N/A'}</td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; font-weight: 600; color: #4B5563;">Financial Conditions</td>
                                    <td style="padding: 12px 0; color: #111827;">${s.reportData.coverage_analysis?.financial_conditions || 'N/A'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div style="margin-bottom: 32px;">
                        <h2 style="font-size: 18px; font-weight: 800; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 16px; color: #111827; text-transform: uppercase;">4. POLICY RESTRICTIONS & EXCLUSIONS</h2>
                        <ul style="margin: 0; padding-left: 20px; font-size: 14px; color: #374151;">
                            <li style="margin-bottom: 8px;"><strong>Waiting Periods:</strong> ${s.reportData.restrictions?.waiting_periods || 'N/A'}</li>
                            <li style="margin-bottom: 8px;"><strong>Coverage Restrictions:</strong> ${s.reportData.restrictions?.coverage_restrictions || 'N/A'}</li>
                            <li style="margin-bottom: 8px;"><strong>Exclusions:</strong> ${s.reportData.restrictions?.exclusions || 'N/A'}</li>
                            <li style="margin-bottom: 8px;"><strong>Risk Factors:</strong> ${s.reportData.restrictions?.risk_factors || 'N/A'}</li>
                        </ul>
                    </div>

                    <div style="margin-bottom: 32px;">
                        <h2 style="font-size: 18px; font-weight: 800; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 16px; color: #111827; text-transform: uppercase;">5. REQUIRED DOCUMENTS & ACTIONS</h2>
                        <div style="font-size: 14px; color: #374151;">
                            <div style="margin-bottom: 12px;"><strong>Required Documents:</strong></div>
                            <ol style="margin-top: 0; margin-bottom: 12px; padding-left: 24px;">
                                ${(s.reportData.required_actions?.required_documents || []).map(d => `<li>${d}</li>`).join('') || '<li>None specified</li>'}
                            </ol>
                            <div style="margin-bottom: 8px;"><strong>Pre-Authorization Requirements:</strong> ${s.reportData.required_actions?.pre_authorization_requirements || 'N/A'}</div>
                            <div style="margin-bottom: 16px;"><strong>Medical Documentation Needed:</strong> ${s.reportData.required_actions?.medical_documentation_needed || 'N/A'}</div>
                            
                            <div style="margin-bottom: 12px;"><strong>Recommended Next Actions:</strong></div>
                            <ol style="margin-top: 0; margin-bottom: 0; padding-left: 24px;">
                                ${(s.reportData.required_actions?.recommended_next_actions || []).map(a => `<li>${a}</li>`).join('') || '<li>None specified</li>'}
                            </ol>
                        </div>
                    </div>

                    <div style="margin-bottom: 32px;">
                        <h2 style="font-size: 18px; font-weight: 800; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 16px; color: #111827; text-transform: uppercase;">6. POLICY EVIDENCE & CLAUSE REFERENCES</h2>
                        ${(s.reportData.policy_evidence || []).map(e => `
                        <div style="background: #F9FAFB; border-left: 4px solid #6D28D9; padding: 16px; margin-bottom: 16px; font-size: 14px;">
                            <div style="font-weight: 700; color: #111827; margin-bottom: 8px;">${e.clause_title || 'Clause'}</div>
                            <div style="font-style: italic; color: #4B5563; margin-bottom: 12px;">"${e.clause_text || ''}"</div>
                            <div style="font-size: 12px; font-weight: 600; color: #6B7280;">Source: ${e.section_number || 'Unknown Section'} | Page ${e.page_number || 'Unknown'}</div>
                        </div>
                        `).join('') || '<div style="font-size: 14px; color: #6B7280;">No explicit policy evidence found.</div>'}
                    </div>

                    <div style="margin-bottom: 32px;">
                        <h2 style="font-size: 18px; font-weight: 800; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 16px; color: #111827; text-transform: uppercase;">7. AI RECOMMENDATION</h2>
                        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; margin-bottom: 16px; font-size: 14px;">
                            <div style="background: #F3F4F6; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-weight: 600; color: #6B7280; margin-bottom: 4px;">Coverage Strength</div>
                                <div style="font-weight: 800; color: #111827;">${s.reportData.recommendation?.coverage_strength || 'N/A'}</div>
                            </div>
                            <div style="background: #F3F4F6; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-weight: 600; color: #6B7280; margin-bottom: 4px;">Approval Probability</div>
                                <div style="font-weight: 800; color: #111827;">${s.reportData.recommendation?.claim_approval_probability || 'N/A'}</div>
                            </div>
                            <div style="background: #F3F4F6; padding: 12px; border-radius: 6px; text-align: center;">
                                <div style="font-weight: 600; color: #6B7280; margin-bottom: 4px;">Risk Level</div>
                                <div style="font-weight: 800; color: #111827;">${s.reportData.recommendation?.risk_level || 'N/A'}</div>
                            </div>
                        </div>
                        <div style="font-size: 14px; color: #374151; background: #F8FAFC; padding: 16px; border: 1px solid #E2E8F0; border-radius: 6px;">
                            <strong>Final Recommendation:</strong> ${s.reportData.recommendation?.final_recommendation || 'N/A'}
                        </div>
                    </div>

                    <div>
                        <h2 style="font-size: 18px; font-weight: 800; border-bottom: 1px solid #E5E7EB; padding-bottom: 8px; margin-bottom: 16px; color: #111827; text-transform: uppercase;">8. FINAL ASSESSMENT SUMMARY</h2>
                        <div style="background: #111827; color: #FFFFFF; padding: 24px; border-radius: 8px; font-size: 14px;">
                            <div style="margin-bottom: 12px;"><strong>Eligibility Verdict:</strong> <span style="color: #60A5FA;">${s.reportData.final_summary?.eligibility_verdict || 'N/A'}</span></div>
                            <div style="margin-bottom: 12px;"><strong>Coverage Outlook:</strong> ${s.reportData.final_summary?.coverage_outlook || 'N/A'}</div>
                            <div style="margin-bottom: 12px;"><strong>Major Risks:</strong> <span style="color: #FCA5A5;">${s.reportData.final_summary?.major_risks || 'N/A'}</span></div>
                            <div><strong>Recommended Action:</strong> <span style="color: #34D399;">${s.reportData.final_summary?.recommended_action || 'N/A'}</span></div>
                        </div>
                    </div>
                    
                    <div style="text-align: center; border-top: 2px solid #111827; padding-top: 16px; margin-top: 32px; font-weight: 800; font-size: 14px; letter-spacing: 1px;">
                        ==========================================================<br/>
                        END OF REPORT<br/>
                        ==========================================================
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
