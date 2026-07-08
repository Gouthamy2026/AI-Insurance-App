export const IrdaiComplianceEngine = () => {
    const existingState = window.IrdaiActions?.state || {
        isAnalyzing: false,
        isAnalyzed: false,
        query: '',
        reportData: null,
        error: null,
        loadingStage: 0,
        loadingInterval: null
    };

    if (!window.IrdaiActions) {
        window.IrdaiActions = {
            state: existingState,
            analyze: async (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                const input = document.getElementById('irdai-query');
                const query = input ? input.value.trim() : window.IrdaiActions.state.query;
                
                if (!query) {
                    window.IrdaiActions.state.error = 'Please enter a compliance-related question.';
                    window.IrdaiActions.state.isAnalyzed = true;
                    window.IrdaiActions.state.reportData = null;
                    document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();
                    return;
                }

                window.IrdaiActions.state.query = query;
                window.IrdaiActions.state.isAnalyzing = true;
                window.IrdaiActions.state.error = null;
                window.IrdaiActions.state.reportData = null;
                window.IrdaiActions.state.loadingStage = 0;
                
                // Staggered loading state
                if (window.IrdaiActions.state.loadingInterval) clearInterval(window.IrdaiActions.state.loadingInterval);
                window.IrdaiActions.state.loadingInterval = setInterval(() => {
                    const s = window.IrdaiActions.state;
                    if (s.loadingStage < 2) {
                        s.loadingStage++;
                        document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();
                    } else {
                        clearInterval(s.loadingInterval);
                    }
                }, 1500);

                document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();

                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch('http://127.0.0.1:8000/api/intelligence/irdai-compliance', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ query: query })
                    });
                    
                    const contentType = response.headers.get("content-type");
                    let data = {};
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        data = await response.json();
                    } else {
                        data = { error: `Server returned status ${response.status}` };
                    }
                    
                    if (!response.ok) {
                        throw new Error(data.detail || data.error || 'Unable to generate compliance guidance. Please try again later.');
                    }

                    if (data.error) {
                        throw new Error(data.error);
                    }

                    clearInterval(window.IrdaiActions.state.loadingInterval);
                    const s = window.IrdaiActions.state;
                    s.isAnalyzing = false;
                    s.isAnalyzed = true;
                    s.reportData = data;
                    
                    document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();
                } catch (error) {
                    console.error("API Error:", error);
                    clearInterval(window.IrdaiActions.state.loadingInterval);
                    
                    let errorMessage = 'Unable to generate compliance guidance. Please try again later.';
                    if (error.message.includes('No relevant IRDAI guidance')) {
                        errorMessage = 'No relevant IRDAI guidance was found for this question. Please refine your query.';
                    } else if (error.message.includes('Unable to retrieve IRDAI compliance documents')) {
                        errorMessage = 'Unable to retrieve IRDAI compliance documents. Please try again later.';
                    } else if (error.message.includes('Unable to generate compliance guidance')) {
                        errorMessage = 'Unable to generate compliance guidance. Please try again later.';
                    } else if (error.message === 'Please enter a compliance-related question.') {
                        errorMessage = error.message;
                    }

                    const s = window.IrdaiActions.state;
                    s.isAnalyzing = false;
                    s.isAnalyzed = true;
                    s.reportData = null;
                    s.error = errorMessage;
                    
                    document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();
                }
            },
            reset: (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                if (window.IrdaiActions.state.loadingInterval) clearInterval(window.IrdaiActions.state.loadingInterval);
                window.IrdaiActions.state.query = '';
                window.IrdaiActions.state.isAnalyzed = false;
                window.IrdaiActions.state.isAnalyzing = false;
                window.IrdaiActions.state.reportData = null;
                window.IrdaiActions.state.error = null;
                window.IrdaiActions.state.loadingStage = 0;
                document.getElementById('dashboard-root').innerHTML = IrdaiComplianceEngine();
            },
            printReport: (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                const reportContent = document.getElementById('compliance-report').innerHTML;
                const printWindow = window.open('', '', 'height=600,width=800');
                printWindow.document.write('<html><head><title>IRDAI Compliance Guidance</title>');
                printWindow.document.write('<style>body { font-family: sans-serif; line-height: 1.6; color: #1F2937; padding: 40px; } .no-print { display: none !important; } h2, h3, h4 { color: #111827; }</style>');
                printWindow.document.write('</head><body>');
                printWindow.document.write(reportContent);
                printWindow.document.write('</body></html>');
                printWindow.document.close();
                printWindow.focus();
                setTimeout(() => {
                    printWindow.print();
                    printWindow.close();
                }, 250);
            }
        };
    }
    const s = window.IrdaiActions.state;
    
    const loadingMessages = [
        "Searching IRDAI Documents...",
        "Retrieving Compliance Information...",
        "Generating Compliance Guidance..."
    ];

    return `
        <section class="module-section active" style="max-width: 900px; margin: 0 auto; padding: 40px; min-height: calc(100vh - 80px); box-sizing: border-box; background: transparent; font-family: sans-serif;">
            
            <div style="margin-bottom: 40px; border-bottom: 2px solid #E5E7EB; padding-bottom: 20px;">
                <h1 style="font-size: 28px; font-weight: bold; color: #111827; margin: 0 0 8px 0;">IRDAI Compliance Checker</h1>
                <p style="font-size: 16px; color: #4B5563; margin: 0;">Access insurance rights, grievance procedures, and regulatory guidance based directly on IRDAI documents.</p>
            </div>

            <div style="margin-bottom: 40px; padding: 32px; background: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E5E7EB;">
                <label for="irdai-query" style="display: block; font-size: 16px; font-weight: bold; color: #374151; margin-bottom: 16px;">Ask a compliance question</label>
                <div style="display: flex; gap: 12px; align-items: stretch;">
                    <input type="text" id="irdai-query" style="flex: 1; padding: 16px; border: 1px solid #D1D5DB; border-radius: 6px; font-size: 16px; outline: none; box-sizing: border-box;" placeholder="Ask an insurance rights, grievance, compliance, claim settlement, or regulatory question..." value="${s.query}">
                    <button type="button" onclick="window.IrdaiActions.analyze(event)" style="background: #8B5CF6; color: #FFFFFF; border: none; padding: 0 24px; border-radius: 6px; font-size: 16px; font-weight: bold; cursor: pointer; transition: background 0.2s;">Ask Compliance Question</button>
                </div>
            </div>

            ${s.isAnalyzing ? `
            <div style="margin-top: 40px; padding: 24px; background: #F3F4F6; border-left: 4px solid #3B82F6; color: #1F2937; font-size: 16px;">
                <strong>${loadingMessages[s.loadingStage]}</strong>
            </div>
            ` : ''}

            ${s.error && !s.isAnalyzing ? `
            <div style="margin-top: 40px; padding: 24px; background: #FEF2F2; border-left: 4px solid #EF4444; color: #991B1B; font-size: 16px; font-weight: bold;">
                ${s.error}
            </div>
            ` : ''}

            ${s.isAnalyzed && s.reportData && !s.error && !s.isAnalyzing ? `
            <div id="compliance-report" style="margin-top: 40px; padding: 40px; background: #FFFFFF; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.05); border: 1px solid #E5E7EB;">
                
                <div class="no-print" style="display: flex; justify-content: flex-end; gap: 12px; margin-bottom: 24px;">
                    <button type="button" onclick="window.IrdaiActions.reset(event)" style="background: #FFFFFF; color: #374151; border: 1px solid #D1D5DB; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer;">New Assessment</button>
                    <button type="button" onclick="window.IrdaiActions.printReport(event)" style="background: #2563EB; color: #FFFFFF; border: none; padding: 8px 16px; border-radius: 6px; font-size: 14px; font-weight: bold; cursor: pointer;">Print Report</button>
                </div>

                <h2 style="font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 32px 0; border-bottom: 1px solid #E5E7EB; padding-bottom: 16px;">IRDAI Compliance Guidance</h2>

                <div style="margin-bottom: 24px;">
                    <h4 style="font-size: 14px; text-transform: uppercase; color: #6B7280; font-weight: bold; margin: 0 0 8px 0; letter-spacing: 0.05em;">User Question</h4>
                    <p style="font-size: 18px; font-weight: bold; color: #1F2937; margin: 0;">${s.query}</p>
                </div>

                <div style="margin-bottom: 32px;">
                    <h4 style="font-size: 14px; text-transform: uppercase; color: #6B7280; font-weight: bold; margin: 0 0 8px 0; letter-spacing: 0.05em;">Compliance Explanation</h4>
                    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${s.reportData.compliance_explanation}</p>
                </div>

                <div style="margin-bottom: 32px;">
                    <h4 style="font-size: 14px; text-transform: uppercase; color: #6B7280; font-weight: bold; margin: 0 0 8px 0; letter-spacing: 0.05em;">Policyholder Rights</h4>
                    <ul style="margin: 0; padding-left: 20px; font-size: 16px; color: #374151; line-height: 1.6;">
                        ${s.reportData.policyholder_rights && s.reportData.policyholder_rights.length > 0 
                            ? s.reportData.policyholder_rights.map(r => `<li style="margin-bottom: 8px;">${r}</li>`).join('') 
                            : '<li>No specific rights identified for this scenario.</li>'}
                    </ul>
                </div>

                <div style="margin-bottom: 32px;">
                    <h4 style="font-size: 14px; text-transform: uppercase; color: #6B7280; font-weight: bold; margin: 0 0 8px 0; letter-spacing: 0.05em;">Insurer Responsibilities</h4>
                    <ul style="margin: 0; padding-left: 20px; font-size: 16px; color: #374151; line-height: 1.6;">
                        ${s.reportData.insurer_responsibilities && s.reportData.insurer_responsibilities.length > 0 
                            ? s.reportData.insurer_responsibilities.map(r => `<li style="margin-bottom: 8px;">${r}</li>`).join('') 
                            : '<li>No specific insurer responsibilities identified for this scenario.</li>'}
                    </ul>
                </div>

                <div style="margin-bottom: 32px;">
                    <h4 style="font-size: 14px; text-transform: uppercase; color: #6B7280; font-weight: bold; margin: 0 0 8px 0; letter-spacing: 0.05em;">Recommended Action</h4>
                    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${s.reportData.recommended_action}</p>
                </div>

                <div style="margin-bottom: 32px;">
                    <h4 style="font-size: 14px; text-transform: uppercase; color: #6B7280; font-weight: bold; margin: 0 0 8px 0; letter-spacing: 0.05em;">IRDAI Guidance Summary</h4>
                    <p style="font-size: 16px; color: #374151; line-height: 1.6; margin: 0; white-space: pre-wrap;">${s.reportData.irdai_guidance_summary}</p>
                </div>

            </div>
            ` : ''}

        </section>
    `;
};
