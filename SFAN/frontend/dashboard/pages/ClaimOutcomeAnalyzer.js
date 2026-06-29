export const ClaimOutcomeAnalyzer = () => {
    // Preserve state if it exists, otherwise initialize
    const existingState = window.ClaimOutcomeActions?.state || {
        isAnalyzing: false,
        isAnalyzed: false,
        charCount: 0,
        provider: '',
        bank: '',
        matchScore: 0,
        matchStatus: '',
        aiSummary: '',
        policyName: '',
        policyType: '',
        coverageType: '',
        policyNumber: '',
        claimCategory: '',
        whyReasons: [],
        evidence: '',
        risks: [],
        riskWarning: '',
        actionPlan: [],
        comparisonOptions: [],
        takeaway: ''
    };

    window.ClaimOutcomeActions = {
        state: existingState,
        updateCharCount: () => {
            const text = document.getElementById('claim-scenario').value;
            window.ClaimOutcomeActions.state.charCount = text.length;
            document.getElementById('char-count').innerText = `${text.length} / 500`;
        },
        analyze: async () => {
            const claimType = document.getElementById('claim-type').value;
            const policyNamespace = document.getElementById('pinecone-namespace').value;
            const preferredBank = document.getElementById('preferred-bank').value;
            const scenario = document.getElementById('claim-scenario').value.trim();
            
            if (!claimType) { alert('Please select a claim type.'); return; }
            if (!policyNamespace) { alert('Please select a policy.'); return; }
            if (!preferredBank) { alert('Please select a bank.'); return; }
            if (!scenario) { alert('Please explain your scenario.'); return; }

            window.ClaimOutcomeActions.state.isAnalyzing = true;
            document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();

            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            window.ClaimOutcomeActions.state.isAnalyzing = false;
            window.ClaimOutcomeActions.state.isAnalyzed = true;
            
            const s = window.ClaimOutcomeActions.state;
            s.provider = "Tata AIG General Insurance";
            s.bank = preferredBank === 'AI_SUGGEST' ? 'SBI Bank' : preferredBank;
            s.matchScore = 88;
            s.matchStatus = "Excellent Match";
            s.aiSummary = "Based on the terms and conditions of the " + (policyNamespace.replace(/_/g, ' ').toUpperCase()) + " policy issued by Tata AIG General Insurance and distributed through SBI Bank, your claim scenario is likely to be covered as the damages are due to an accidental event caused by heavy rain.";
            s.policyName = "Private Car Package Policy";
            s.policyType = "Comprehensive Car Insurance";
            s.coverageType = "Comprehensive";
            s.policyNumber = "(As per selected document)";
            s.claimCategory = claimType;
            
            s.whyReasons = [
                "Covers own damage due to accidents, including weather conditions like heavy rain.",
                "Includes coverage for external body damage such as bumper and headlight.",
                "Cashless repair available at network garages.",
                "24x7 claim assistance."
            ];
            s.evidence = '"This policy covers accidental loss or damage to the insured vehicle arising out of external, violent and visible means..."';
            
            s.risks = [
                "Wear and tear, mechanical/electrical breakdown not covered.",
                "Damage due to flood (if declared as area flooding) may be treated separately.",
                "Non-network garage repairs may reduce claim amount."
            ];
            s.riskWarning = "Ensure the incident is not due to negligence (drunk driving, rash driving, etc.)";
            
            s.actionPlan = [
                "Capture clear photos of the damage.",
                "File the claim as soon as possible.",
                "Use Tata AIG network garage for cashless benefits.",
                "Provide FIR / RTA report if required.",
                "Keep all documents and repair bills safe."
            ];
            
            s.comparisonOptions = [
                { provider: "ICICI Lombard General Insurance", bank: "ICICI Bank", score: 65, level: "Good Match" },
                { provider: "SBI General Insurance", bank: "SBI Bank", score: 58, level: "Moderate Match" },
                { provider: "HDFC ERGO General Insurance", bank: "HDFC Bank", score: 45, level: "Low Match" }
            ];
            
            s.takeaway = `Tata AIG General Insurance policy distributed by SBI Bank is the best match for your claim scenario with high coverage alignment and suitable benefits.`;

            document.getElementById('dashboard-root').innerHTML = ClaimOutcomeAnalyzer();
        }
    };

    const s = window.ClaimOutcomeActions.state;
    const namespaces = [
        "regulatory_governance",
        "Comprehensive Car Insurance",
        "health_policy",
        "home_folder",
        "banking_governance",
        "travel_policy",
        "life_wealth_policy"
    ];

    const bankOptions = [
        "AI_SUGGEST",
        "ICICI Bank",
        "Axis Bank",
        "SBI Bank",
        "Canara Bank",
        "Kotak Mahindra Bank",
        "IndusInd Bank",
        "Bank of Baroda",
        "IRDAI"
    ];

    const getScoreColor = (score) => {
        if (score >= 80) return '#059669'; // Green
        if (score >= 60) return '#D97706'; // Yellow/Orange
        return '#DC2626'; // Red
    };

    const cardStyle = `background: #FAFAFA; border-radius: 16px; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); padding: 24px; display: flex; flex-direction: column; transition: all 0.3s ease;`;
    const inputCardStyle = `background: #FAFAFA; border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); padding: 16px; display: flex; flex-direction: column; transition: all 0.3s ease;`;

    return `
        <div style="font-family: 'Inter', system-ui, sans-serif; padding: 32px 48px 100px 48px; box-sizing: border-box; color: #1F2937; width: 100%; min-height: 100vh; background: transparent;">

            <div style="width: 100%; max-width: 1400px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">

                <!-- Title Header -->
                <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7E22CE" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                    <div>
                        <h1 style="font-size: 24px; font-weight: 800; color: #1F2937; margin: 0;">Claim Outcome Analyzer</h1>
                    </div>
                </div>
                <p style="color: #4B5563; font-size: 13px; margin: -16px 0 0 0; font-weight: 500;">Analyze your claim scenario and get AI-powered insights on coverage, eligibility and outcome.</p>

                <!-- Input Section (Top Row) -->
                <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">

                    <!-- 1. Select Claim Type -->
                    <div style="${inputCardStyle}">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><path d="M12 7v4"></path></svg>
                            1. Select Claim Type
                        </div>
                        <select id="claim-type" style="width: 100%; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; outline: none; background: #FFFFFF; font-size: 14px; color: #374151; cursor: pointer; -webkit-appearance: none; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%236B7280\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>'); background-repeat: no-repeat; background-position: right 12px center;">
                            <option value="Vehicle Claim">Vehicle Claim</option>
                            <option value="Health Claim">Health Claim</option>
                            <option value="Travel Claim">Travel Claim</option>
                            <option value="Home Claim">Home Claim</option>
                        </select>
                    </div>

                    <!-- 2. Select Policy -->
                    <div style="${inputCardStyle}">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            2. Select Policy
                        </div>
                        <select id="pinecone-namespace" style="width: 100%; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; outline: none; background: #FFFFFF; font-size: 14px; color: #374151; cursor: pointer; -webkit-appearance: none; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%236B7280\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>'); background-repeat: no-repeat; background-position: right 12px center;">
                            <option value="Comprehensive Car Insurance" selected>Comprehensive Car Insurance</option>
                            ${namespaces.map(ns => ns !== 'Comprehensive Car Insurance' ? `<option value="${ns}">${ns.replace(/_/g, ' ')}</option>` : '').join('')}
                        </select>
                    </div>

                    <!-- 3. Select Bank -->
                    <div style="${inputCardStyle}">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M3 21h18"></path><path d="M3 10h18"></path><path d="M5 6l7-3 7 3"></path><path d="M4 10v11"></path><path d="M20 10v11"></path><path d="M8 14v3"></path><path d="M12 14v3"></path><path d="M16 14v3"></path></svg>
                            3. Select Bank
                        </div>
                        <select id="preferred-bank" style="width: 100%; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; outline: none; background: #FFFFFF; font-size: 14px; color: #374151; cursor: pointer; -webkit-appearance: none; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%236B7280\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>'); background-repeat: no-repeat; background-position: right 12px center;">
                            <option value="SBI Bank" selected>SBI Bank</option>
                            ${bankOptions.map(b => b !== 'SBI Bank' ? `<option value="${b}">${b === 'AI_SUGGEST' ? '✨ AI: Suggest Best Bank' : b}</option>` : '').join('')}
                        </select>
                    </div>

                    <!-- 4. Explain Scenario -->
                    <div style="${inputCardStyle}">
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 14px; font-weight: 700; color: #111827;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                            4. Explain Scenario
                        </div>
                        <textarea id="claim-scenario" maxlength="500" onkeyup="window.ClaimOutcomeActions.updateCharCount()" rows="3" placeholder="Describe what happened, when it happened, and the damages or expenses involved." style="width: 100%; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; outline: none; background: #FFFFFF; font-size: 13px; color: #374151; resize: none; font-family: inherit; box-sizing: border-box;">I met with an accident due to heavy rain. My car front bumper and headlight are damaged.</textarea>
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
                            <span style="font-size: 11px; color: #9CA3AF;">(Max 500 characters)</span>
                            <div style="display: flex; align-items: center; gap: 12px;">
                                <span id="char-count" style="font-size: 11px; color: #6B7280;">91 / 500</span>
                                <button onclick="window.ClaimOutcomeActions.analyze()" ${s.isAnalyzing ? 'disabled' : ''} style="display: none;"></button>
                            </div>
                        </div>
                    </div>

                </div>
                
                <!-- Fake Analyze Button for the user to trigger (hidden in the image but we need it functional) -->
                ${!s.isAnalyzed ? `
                <div style="display: flex; justify-content: flex-end;">
                    <button onclick="window.ClaimOutcomeActions.analyze()" style="background: #7E22CE; color: #FFFFFF; border: none; padding: 10px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer;">
                        ${s.isAnalyzing ? 'Analyzing...' : 'Generate Analysis'}
                    </button>
                </div>
                ` : ''}

                <!-- Analysis Results Section -->
                ${s.isAnalyzed ? `
                <div style="padding: 24px 0; animation: fadeIn 0.5s ease;">

                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 28px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#7E22CE" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        <h2 style="font-size: 22px; font-weight: 800; color: #111827; margin: 0;">Analysis Results</h2>
                    </div>

                    <!-- Top row: Recommendation and Details -->
                    <div style="display: grid; grid-template-columns: 7fr 3fr; gap: 24px; margin-bottom: 24px; align-items: stretch;">

                        <!-- CARD 1: TOP RECOMMENDATION -->
                        <div style="${cardStyle} border-left: 4px solid #059669; padding: 28px; justify-content: space-between;">
                            <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px;">
                                <div style="max-width: 60%;">
                                    <div style="display: flex; align-items: center; gap: 8px; color: #059669; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px;">
                                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                        TOP RECOMMENDATION
                                    </div>
                                    <h2 style="font-size: 32px; font-weight: 800; color: #059669; margin: 0 0 16px 0; letter-spacing: -0.5px;">${s.provider}</h2>
                                    <div style="font-size: 14px; color: #4B5563; line-height: 1.6;">
                                        This policy from ${s.provider} (distributed through ${s.bank}) is the most suitable for your scenario.
                                    </div>
                                </div>
                                <div style="border: 1px solid #E5E7EB; border-radius: 12px; padding: 20px 32px; text-align: center; background: #FFFFFF;">
                                    <div style="font-size: 10px; font-weight: 800; color: #4B5563; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Overall Alignment</div>
                                    <div style="font-size: 42px; font-weight: 900; color: #059669; line-height: 1; margin-bottom: 12px; letter-spacing: -1px;">${s.matchScore}%</div>
                                    <div style="height: 6px; background: #E5E7EB; border-radius: 3px; margin-bottom: 12px; overflow: hidden; width: 100%;">
                                        <div style="height: 100%; width: ${s.matchScore}%; background: #059669; border-radius: 3px;"></div>
                                    </div>
                                    <div style="font-size: 12px; font-weight: 700; color: #059669;">${s.matchStatus}</div>
                                </div>
                            </div>

                            <div style="background: #FFFFFF; border: 1px solid #F3E8FF; border-radius: 10px; padding: 20px;">
                                <div style="display: flex; align-items: center; gap: 8px; font-size: 12px; font-weight: 700; color: #9333EA; margin-bottom: 10px;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>
                                    AI Summary
                                </div>
                                <div style="font-size: 13px; color: #4B5563; line-height: 1.6;">${s.aiSummary}</div>
                            </div>
                        </div>

                        <!-- CARD 2: POLICY & PROVIDER DETAILS -->
                        <div style="${cardStyle}">
                            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                <h3 style="font-size: 16px; font-weight: 700; color: #2563EB; margin: 0;">Policy & Provider Details</h3>
                            </div>

                            <div style="display: flex; flex-direction: column; gap: 20px; font-size: 13px;">
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <span style="color: #6B7280; font-weight: 500;">Insurance Provider</span>
                                    <span style="font-weight: 700; color: #111827;">${s.provider}</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <span style="color: #6B7280; font-weight: 500;">Distributed Through</span>
                                    <span style="font-weight: 700; color: #111827;">${s.bank}</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <span style="color: #6B7280; font-weight: 500;">Policy Type</span>
                                    <span style="font-weight: 700; color: #111827;">${s.policyType}</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <span style="color: #6B7280; font-weight: 500;">Policy Name</span>
                                    <span style="font-weight: 700; color: #111827;">${s.policyName}</span>
                                </div>
                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                                    <span style="color: #6B7280; font-weight: 500;">Policy Number</span>
                                    <span style="font-weight: 700; color: #111827;">${s.policyNumber}</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- Middle row: Evidence, Risks, Action Plan -->
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; margin-bottom: 24px;">

                        <!-- CARD 3: WHY THIS POLICY? -->
                        <div style="${cardStyle}">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="M9 12l2 2 4-4"></path></svg>
                                <h3 style="font-size: 15px; font-weight: 700; color: #059669; margin: 0;">Why this Policy?</h3>
                            </div>
                            <ul style="margin: 0 0 20px 0; padding: 0; list-style: none; font-size: 13px; color: #4B5563; display: flex; flex-direction: column; gap: 16px; flex: 1;">
                                ${s.whyReasons.map(r => `<li style="display: flex; gap: 10px; align-items: flex-start;"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" style="margin-top: 1px; flex-shrink: 0;"><polyline points="20 6 9 17 4 12"></polyline></svg> <span>${r}</span></li>`).join('')}
                            </ul>
                            <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px;">
                                <div style="font-size: 10px; font-weight: 800; color: #059669; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Policy Evidence</div>
                                <div style="font-size: 13px; color: #065F46; line-height: 1.5;">${s.evidence}</div>
                            </div>
                        </div>

                        <!-- CARD 4: RISK FACTORS & EXCLUSIONS -->
                        <div style="${cardStyle}">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                <h3 style="font-size: 15px; font-weight: 700; color: #DC2626; margin: 0;">Risk Factors & Exclusions</h3>
                            </div>
                            <ul style="margin: 0 0 20px 0; padding-left: 20px; font-size: 13px; color: #4B5563; display: flex; flex-direction: column; gap: 16px; flex: 1;">
                                ${s.risks.map(r => `<li style="color: #4B5563;">${r}</li>`).join('')}
                            </ul>
                            <div style="background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 16px;">
                                <div style="font-size: 10px; font-weight: 800; color: #DC2626; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">Important</div>
                                <div style="font-size: 13px; color: #991B1B; line-height: 1.5;">${s.riskWarning}</div>
                            </div>
                        </div>

                        <!-- CARD 5: STRATEGIC ACTION PLAN -->
                        <div style="${cardStyle}">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563EB" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                <h3 style="font-size: 15px; font-weight: 700; color: #2563EB; margin: 0;">Strategic Action Plan</h3>
                            </div>
                            <ul style="margin: 0; padding-left: 20px; font-size: 13px; color: #4B5563; display: flex; flex-direction: column; gap: 16px;">
                                ${s.actionPlan.map(r => `<li style="color: #4B5563;">${r}</li>`).join('')}
                            </ul>
                        </div>

                    </div>

                    <!-- Bottom row: Comparison and Takeaway -->
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px;">

                        <!-- CARD 6: OTHER POLICY OPTIONS -->
                        <div style="${cardStyle}">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 20px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                                <h3 style="font-size: 15px; font-weight: 700; color: #4B5563; margin: 0;">Other Policy Options (For Comparison)</h3>
                            </div>

                            <table style="width: 100%; border-collapse: collapse; font-size: 13px; text-align: left;">
                                <thead>
                                    <tr style="border-bottom: 1px solid #E5E7EB; color: #374151;">
                                        <th style="padding: 12px 8px; font-weight: 700;">Insurance Provider</th>
                                        <th style="padding: 12px 8px; font-weight: 700;">Distributed Through</th>
                                        <th style="padding: 12px 8px; font-weight: 700;">Alignment Score</th>
                                        <th style="padding: 12px 8px; font-weight: 700;">Match Level</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${s.comparisonOptions.map(opt => `
                                    <tr style="border-bottom: 1px solid #F3F4F6;">
                                        <td style="padding: 16px 8px; font-weight: 600; color: #111827;">${opt.provider}</td>
                                        <td style="padding: 16px 8px; color: #4B5563; font-weight: 500;">${opt.bank}</td>
                                        <td style="padding: 16px 8px;">
                                            <div style="display: flex; align-items: center; gap: 12px;">
                                                <span style="font-weight: 700; width: 32px; color: #374151;">${opt.score}%</span>
                                                <div style="flex: 1; height: 6px; background: #E5E7EB; border-radius: 3px;">
                                                    <div style="width: ${opt.score}%; height: 100%; background: ${getScoreColor(opt.score)}; border-radius: 3px;"></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style="padding: 16px 8px; color: ${getScoreColor(opt.score)}; font-weight: 600;">${opt.level}</td>
                                    </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        </div>

                        <!-- CARD 7: KEY TAKEAWAY -->
                        <div style="${cardStyle} background: #FFFFFF; border: 1px solid #E9D5FF;">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9333EA" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                                <h3 style="font-size: 15px; font-weight: 700; color: #9333EA; margin: 0;">Key Takeaway</h3>
                            </div>
                            <div style="font-size: 13px; color: #374151; line-height: 1.6; font-weight: 500;">
                                ${s.takeaway}
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