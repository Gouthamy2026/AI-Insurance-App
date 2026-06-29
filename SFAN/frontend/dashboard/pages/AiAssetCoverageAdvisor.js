export const AiAssetCoverageAdvisor = () => {
    // Preserve state if it exists, otherwise initialize
    const existingState = window.AiAssetCoverageActions?.state || {
        isAnalyzing: false,
        isAnalyzed: false,
        bank: '',
        policy: '',
        notes: '',
        imageUploaded: false,
        
        // Results
        assetType: '',
        constructionType: '',
        usageType: '',
        location: '',
        confidenceScore: 0,
        matchScore: 0,
        eligibilityCount: 0,
        totalCovers: 0,
        
        coverageAlignment: 0,
        sumInsuredMatch: 0,
        policyBenefits: 0,
        premiumSuitability: 0
    };

    window.AiAssetCoverageActions = {
        state: existingState,
        uploadImage: () => {
            window.AiAssetCoverageActions.state.imageUploaded = true;
            document.getElementById('dashboard-root').innerHTML = AiAssetCoverageAdvisor();
        },
        reset: () => {
            window.AiAssetCoverageActions.state = {
                isAnalyzing: false,
                isAnalyzed: false,
                bank: '',
                policy: '',
                notes: '',
                imageUploaded: false,
                assetType: '',
                constructionType: '',
                usageType: '',
                location: '',
                confidenceScore: 0,
                matchScore: 0,
                eligibilityCount: 0,
                totalCovers: 0,
                coverageAlignment: 0,
                sumInsuredMatch: 0,
                policyBenefits: 0,
                premiumSuitability: 0
            };
            document.getElementById('dashboard-root').innerHTML = AiAssetCoverageAdvisor();
        },
        analyze: async () => {
            const bank = document.getElementById('aa-bank').value;
            const policy = document.getElementById('aa-policy').value;
            const notes = document.getElementById('aa-notes').value.trim();
            const imageUploaded = window.AiAssetCoverageActions.state.imageUploaded;
            
            if (!imageUploaded && !bank && !policy) { 
                alert('Please provide some asset details to analyze.'); 
                return; 
            }

            window.AiAssetCoverageActions.state = {
                ...window.AiAssetCoverageActions.state,
                isAnalyzing: true,
                bank, policy, notes
            };
            
            document.getElementById('dashboard-root').innerHTML = AiAssetCoverageAdvisor();

            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1500));

            const s = window.AiAssetCoverageActions.state;
            s.isAnalyzing = false;
            s.isAnalyzed = true;
            
            s.assetType = "Identified Asset";
            s.constructionType = "Standard Structure";
            s.usageType = "Personal Use";
            s.location = "Verified Location";
            s.confidenceScore = 95;
            
            s.matchScore = 85;
            s.eligibilityCount = 5;
            s.totalCovers = 5;
            
            s.coverageAlignment = 90;
            s.sumInsuredMatch = 80;
            s.policyBenefits = 85;
            s.premiumSuitability = 85;

            document.getElementById('dashboard-root').innerHTML = AiAssetCoverageAdvisor();
        }
    };

    const s = window.AiAssetCoverageActions.state;

    const inputCardStyle = `background: #FAFAFA; border-radius: 12px; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); padding: 20px; display: flex; flex-direction: column; transition: all 0.3s ease;`;
    const resultCardStyle = `background: #FAFAFA; border-radius: 16px; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); padding: 20px; display: flex; flex-direction: column; transition: all 0.3s ease;`;
    const labelStyle = `font-size: 14px; font-weight: 700; color: #111827; display: flex; align-items: center; gap: 8px; margin-bottom: 12px;`;
    const inputStyle = `width: 100%; padding: 12px; border: 1px solid #E5E7EB; border-radius: 8px; outline: none; background: #FFFFFF; font-size: 14px; color: #374151; box-sizing: border-box;`;
    const selectStyle = inputStyle + ` cursor: pointer; -webkit-appearance: none; appearance: none; background-image: url('data:image/svg+xml;charset=US-ASCII,<svg width=\"12\" height=\"12\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"%236B7280\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"6 9 12 15 18 9\"></polyline></svg>'); background-repeat: no-repeat; background-position: right 12px center;`;

    return `
        <div style="font-family: 'Inter', system-ui, sans-serif; padding: 32px 48px 100px 48px; box-sizing: border-box; color: #1F2937; width: 100%; min-height: 100vh; background: transparent;">
            
            <div style="width: 100%; max-width: 1200px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px;">
                
                <!-- Title Section -->
                <div style="display: flex; justify-content: space-between; align-items: flex-end;">
                    <div>
                        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 4px;">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                            <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0; letter-spacing: -0.5px;">AI Asset Coverage Advisor</h1>
                            <span style="background: #EDE9FE; color: #6D28D9; font-size: 12px; font-weight: 600; padding: 4px 8px; border-radius: 4px;">Beta</span>
                        </div>
                        <p style="color: #4B5563; font-size: 14px; margin: 8px 0 0 0; font-weight: 500;">Get AI-powered insurance recommendations and eligibility insights for your asset.</p>
                    </div>
                    <button onclick="window.AiAssetCoverageActions.reset()" style="background: #FAFAFA; color: #6D28D9; border: 1px solid #E5E7EB; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                        New Assessment
                    </button>
                </div>

                <!-- Inputs Section -->
                <div style="display: grid; grid-template-columns: 1.2fr 1fr 1fr 1.5fr; gap: 16px;">
                    
                    <!-- 1. Upload Image -->
                    <div style="${inputCardStyle}">
                        <div style="${labelStyle}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            1. Upload Asset Image
                        </div>
                        <div style="display: flex; gap: 12px; height: 100px;">
                            ${s.imageUploaded ? `
                                <div style="flex: 1; background: #E5E7EB; border-radius: 8px; overflow: hidden; position: relative;">
                                    <div style="position: absolute; inset: 0; background: linear-gradient(45deg, #CBD5E1, #94A3B8);"></div>
                                    <div style="position: absolute; bottom: 8px; left: 8px; font-size: 10px; background: rgba(255,255,255,0.8); padding: 2px 6px; border-radius: 4px;">Asset Detected</div>
                                </div>
                            ` : ''}
                            <button onclick="window.AiAssetCoverageActions.uploadImage()" style="flex: ${s.imageUploaded ? '0.5' : '1'}; background: #FAFAFA; border: 1px dashed #D1D5DB; border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: #6B7280; transition: all 0.2s;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                                <span style="font-size: 12px; font-weight: 500; margin-top: 8px;">${s.imageUploaded ? 'Upload More' : 'Upload Image'}</span>
                            </button>
                        </div>
                        <div style="font-size: 12px; color: #6B7280; margin-top: 12px;">${s.imageUploaded ? '1 image uploaded' : 'No images uploaded'}</div>
                    </div>

                    <!-- 2. Select Bank -->
                    <div style="${inputCardStyle}">
                        <div style="${labelStyle}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><rect x="3" y="11" width="18" height="10" rx="2"></rect><path d="M12 7v4"></path></svg>
                            2. Select Bank
                        </div>
                        <select id="aa-bank" style="${selectStyle} height: 100%;">
                            <option value="">Select a Bank...</option>
                            <option value="Bank A" ${s.bank === 'Bank A' ? 'selected' : ''}>Partner Bank A</option>
                            <option value="Bank B" ${s.bank === 'Bank B' ? 'selected' : ''}>Partner Bank B</option>
                        </select>
                    </div>

                    <!-- 3. Select Policy -->
                    <div style="${inputCardStyle}">
                        <div style="${labelStyle}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline></svg>
                            3. Select Policy
                        </div>
                        <select id="aa-policy" style="${selectStyle} height: 100%;">
                            <option value="">Select a Policy...</option>
                            <option value="Comprehensive" ${s.policy === 'Comprehensive' ? 'selected' : ''}>Comprehensive Asset Policy</option>
                            <option value="Basic" ${s.policy === 'Basic' ? 'selected' : ''}>Basic Asset Protection</option>
                        </select>
                    </div>

                    <!-- 4. Additional Notes -->
                    <div style="${inputCardStyle}">
                        <div style="${labelStyle}">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                            4. Additional Notes (Optional)
                        </div>
                        <textarea id="aa-notes" style="${inputStyle} resize: none; height: 100px;" placeholder="Enter any additional notes or context about the asset...">${s.notes}</textarea>
                        <div style="text-align: right; font-size: 11px; color: #9CA3AF; margin-top: 8px;">0 / 300</div>
                    </div>
                </div>

                ${!s.isAnalyzed ? `
                <div style="display: flex; justify-content: flex-end; margin-top: 8px;">
                    <button onclick="window.AiAssetCoverageActions.analyze()" style="background: #6D28D9; color: #FFFFFF; border: none; padding: 12px 28px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(109, 40, 217, 0.2);">
                        ${s.isAnalyzing ? 'Analyzing Asset...' : 'Analyze Asset Coverage'}
                    </button>
                </div>
                ` : ''}

                ${s.isAnalyzed ? `
                <div style="padding: 16px 0 0 0; animation: fadeIn 0.5s ease;">
                    <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 24px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline></svg>
                        <h2 style="font-size: 20px; font-weight: 800; color: #111827; margin: 0;">Analysis Results</h2>
                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1.2fr 1.2fr; gap: 20px; margin-bottom: 20px;">
                        
                        <!-- Asset Identification -->
                        <div style="${resultCardStyle}">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #6D28D9; margin-bottom: 20px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                                Asset Identification
                            </div>
                            <div style="display: flex; gap: 16px;">
                                <div style="width: 100px; height: 100px; background: #F3F4F6; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="1.5"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                                    <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280; font-size: 13px;">Asset Type</span><span style="font-weight: 600; font-size: 13px; color: #111827;">${s.assetType}</span></div>
                                    <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280; font-size: 13px;">Construction Type</span><span style="font-weight: 600; font-size: 13px; color: #111827;">${s.constructionType}</span></div>
                                    <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280; font-size: 13px;">Usage Type</span><span style="font-weight: 600; font-size: 13px; color: #111827;">${s.usageType}</span></div>
                                    <div style="display: flex; justify-content: space-between;"><span style="color: #6B7280; font-size: 13px;">Location</span><span style="font-weight: 600; font-size: 13px; color: #111827;">${s.location}</span></div>
                                </div>
                            </div>
                            <div style="margin-top: auto; padding-top: 16px;">
                                <div style="background: #F5F3FF; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 8px; color: #6D28D9; font-size: 13px; font-weight: 600;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                                        AI Confidence Score
                                    </div>
                                    <span style="font-size: 18px; font-weight: 800; color: #6D28D9;">${s.confidenceScore}%</span>
                                </div>
                            </div>
                        </div>

                        <!-- Insurance Eligibility -->
                        <div style="${resultCardStyle}">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 20px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                Insurance Eligibility
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                                ${['Property Cover', 'Fire Protection', 'Natural Disaster', 'Theft Protection', 'Contents Cover'].map(item => `
                                    <div style="display: flex; align-items: center; gap: 12px; font-size: 14px; color: #374151;">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22C55E" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                                        ${item}
                                    </div>
                                `).join('')}
                            </div>
                            <div style="margin-top: auto; background: #ECFDF5; border: 1px solid #D1FAE5; padding: 12px; border-radius: 8px; display: flex; align-items: center; gap: 8px; color: #059669; font-size: 13px; font-weight: 600;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                You are eligible for ${s.eligibilityCount} major insurance covers.
                            </div>
                        </div>

                        <!-- Coverage Opportunity Matrix -->
                        <div style="${resultCardStyle}">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #6D28D9; margin-bottom: 20px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                                Coverage Opportunity Matrix
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                                ${['Structure Cover', 'Fire & Allied Perils', 'Natural Disaster Cover', 'Burglary & Theft', 'Personal Liability'].map(item => `
                                    <div style="display: flex; align-items: center; justify-content: space-between; font-size: 14px; color: #374151;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
                                            ${item}
                                        </div>
                                        <span style="background: #ECFDF5; color: #059669; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 12px;">Available</span>
                                    </div>
                                `).join('')}
                            </div>
                            <div style="margin-top: auto; background: #F5F3FF; padding: 12px; border-radius: 8px; color: #6D28D9; font-size: 13px; font-weight: 600; text-align: center;">
                                ${s.totalCovers} / ${s.totalCovers} covers available for you
                            </div>
                        </div>

                    </div>

                    <div style="display: grid; grid-template-columns: 1fr 1fr 1.5fr; gap: 20px; margin-bottom: 24px;">
                        
                        <!-- Policy Match Score -->
                        <div style="${resultCardStyle}">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #6D28D9; margin-bottom: 20px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                                Policy Match Score
                            </div>
                            <div style="display: flex; gap: 24px; align-items: center; margin-bottom: 20px;">
                                <div style="position: relative; width: 100px; height: 100px; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                    <svg width="100" height="100" viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#F3F4F6" stroke-width="10"></circle>
                                        <circle cx="50" cy="50" r="40" fill="none" stroke="#6D28D9" stroke-width="10" stroke-dasharray="251" stroke-dashoffset="${251 - (251 * s.matchScore / 100)}" stroke-linecap="round"></circle>
                                    </svg>
                                    <div style="position: absolute; display: flex; flex-direction: column; align-items: center;">
                                        <span style="font-size: 24px; font-weight: 800; color: #111827; line-height: 1;">${s.matchScore}%</span>
                                        <span style="font-size: 10px; font-weight: 600; color: #6B7280;">Match Score</span>
                                    </div>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 12px; width: 100%;">
                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: #4B5563;"><span>Coverage Alignment</span><span>${s.coverageAlignment}%</span></div>
                                        <div style="width: 100%; background: #F3F4F6; height: 4px; border-radius: 2px;"><div style="width: ${s.coverageAlignment}%; background: #6D28D9; height: 100%; border-radius: 2px;"></div></div>
                                    </div>
                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: #4B5563;"><span>Sum Insured Match</span><span>${s.sumInsuredMatch}%</span></div>
                                        <div style="width: 100%; background: #F3F4F6; height: 4px; border-radius: 2px;"><div style="width: ${s.sumInsuredMatch}%; background: #6D28D9; height: 100%; border-radius: 2px;"></div></div>
                                    </div>
                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: #4B5563;"><span>Policy Benefits</span><span>${s.policyBenefits}%</span></div>
                                        <div style="width: 100%; background: #F3F4F6; height: 4px; border-radius: 2px;"><div style="width: ${s.policyBenefits}%; background: #6D28D9; height: 100%; border-radius: 2px;"></div></div>
                                    </div>
                                    <div>
                                        <div style="display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 4px; color: #4B5563;"><span>Premium Suitability</span><span>${s.premiumSuitability}%</span></div>
                                        <div style="width: 100%; background: #F3F4F6; height: 4px; border-radius: 2px;"><div style="width: ${s.premiumSuitability}%; background: #6D28D9; height: 100%; border-radius: 2px;"></div></div>
                                    </div>
                                </div>
                            </div>
                            <div style="margin-top: auto; background: #F5F3FF; padding: 12px; border-radius: 8px; color: #6D28D9; font-size: 12px; font-weight: 500;">
                                This policy matches your asset profile very well.
                            </div>
                        </div>

                        <!-- Exclusion Hotspots -->
                        <div style="${resultCardStyle}">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #DC2626; margin-bottom: 20px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>
                                Exclusion Hotspots
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px;">
                                <div style="display: flex; gap: 12px; font-size: 13px; color: #374151;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
                                    Wear and tear, gradual deterioration not covered.
                                </div>
                                <div style="display: flex; gap: 12px; font-size: 13px; color: #374151;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
                                    Damage due to general environmental factors may be treated separately.
                                </div>
                                <div style="display: flex; gap: 12px; font-size: 13px; color: #374151;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" stroke-width="2" style="flex-shrink: 0; margin-top: 2px;"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path></svg>
                                    Loss or damage due to unauthorized structural changes.
                                </div>
                            </div>
                            <div style="margin-top: auto; background: #FFFBEB; padding: 12px; border-radius: 8px; color: #D97706; font-size: 12px; font-weight: 500; border: 1px solid #FEF3C7;">
                                Review policy terms for complete exclusion details.
                            </div>
                        </div>

                        <!-- Coverage Scenario Simulator -->
                        <div style="${resultCardStyle}">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 15px; font-weight: 700; color: #6D28D9; margin-bottom: 20px;">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                Coverage Scenario Simulator
                            </div>
                            <div style="display: flex; flex-direction: column; gap: 16px;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #111827; font-weight: 500;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><path d="M12 2c0 0-6 6-6 12a6 6 0 0 0 12 0c0-6-6-12-6-12z"></path></svg>
                                        Fire Incident
                                    </div>
                                    <span style="font-size: 12px; font-weight: 600; color: #10B981;">Covered</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #111827; font-weight: 500;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                                        Water Damage
                                    </div>
                                    <span style="font-size: 12px; font-weight: 600; color: #F59E0B;">Partial Cover</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #111827; font-weight: 500;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                                        Burglary / Theft
                                    </div>
                                    <span style="font-size: 12px; font-weight: 600; color: #10B981;">Covered</span>
                                </div>
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="display: flex; align-items: center; gap: 10px; font-size: 14px; color: #111827; font-weight: 500;">
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7280" stroke-width="2"><path d="M3 12h18"></path><path d="M12 3v18"></path><path d="M8 8l8 8"></path><path d="M16 8l-8 8"></path></svg>
                                        Structural Damage
                                    </div>
                                    <span style="font-size: 12px; font-weight: 600; color: #DC2626;">Additional Cover Required</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- AI Coverage Summary Footer -->
                    <div style="background: #FAFAFA; border-radius: 16px; border: 1px solid #E5E7EB; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); padding: 24px; display: flex; justify-content: space-between; align-items: center;">
                        <div style="flex: 1; padding-right: 24px;">
                            <div style="display: flex; align-items: center; gap: 8px; font-size: 14px; font-weight: 700; color: #6D28D9; margin-bottom: 8px;">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>
                                AI Coverage Summary
                            </div>
                            <p style="margin: 0; font-size: 13px; color: #4B5563; line-height: 1.5;">
                                The uploaded asset is identified as a qualifying structure with good insurance eligibility. The selected policy provides strong protection for common risks. Please review exclusions and consider additional covers if required.
                            </p>
                        </div>
                        <div style="display: flex; gap: 32px; align-items: center; border-left: 1px solid #E5E7EB; padding-left: 24px;">
                            <div style="text-align: center;">
                                <div style="font-size: 11px; color: #6B7280; font-weight: 600; margin-bottom: 4px;">Eligibility</div>
                                <div style="font-size: 20px; font-weight: 800; color: #10B981;">100%</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 11px; color: #6B7280; font-weight: 600; margin-bottom: 4px;">Match Score</div>
                                <div style="font-size: 20px; font-weight: 800; color: #6D28D9;">${s.matchScore}%</div>
                            </div>
                            <div style="text-align: center;">
                                <div style="font-size: 11px; color: #6B7280; font-weight: 600; margin-bottom: 4px;">Total Covers</div>
                                <div style="font-size: 20px; font-weight: 800; color: #3B82F6;">${s.totalCovers} / 5</div>
                            </div>
                            <button style="background: #F5F3FF; color: #6D28D9; border: 1px solid #EDE9FE; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; margin-left: 16px;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                                <div style="display: flex; flex-direction: column; align-items: flex-start; text-align: left;">
                                    <span style="font-size: 10px; font-weight: 600; color: #8B5CF6;">Recommended Action</span>
                                    <span>Proceed with Policy</span>
                                </div>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-left: 8px;"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </button>
                        </div>
                    </div>

                    <div style="text-align: center; font-size: 12px; color: #9CA3AF; margin-top: 24px; display: flex; align-items: center; justify-content: center; gap: 6px;">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                        This assessment is AI-generated and should be verified by the insurance advisor before final purchase.
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
