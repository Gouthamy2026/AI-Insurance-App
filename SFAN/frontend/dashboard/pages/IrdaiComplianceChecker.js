export const IrdaiComplianceChecker = () => {
    // Initialization logic for the DOM events
    window.initIrdaiComplianceChecker = () => {
        const queryInput = document.getElementById('irdai-query-input');
        const submitBtn = document.getElementById('btn-irdai-analyze');
        const errorMsg = document.getElementById('irdai-error-msg');
        const form = document.getElementById('irdai-form');
        
        // Inline Validation
        const validateInput = () => {
            const val = queryInput.value.trim();
            if (!val) {
                errorMsg.textContent = "Query cannot be empty.";
                errorMsg.style.display = 'block';
                return false;
            }
            if (val.length < 10) {
                errorMsg.textContent = "Please provide more detail (minimum 10 characters).";
                errorMsg.style.display = 'block';
                return false;
            }
            if (val.length > 1000) {
                errorMsg.textContent = "Query is too long (maximum 1000 characters).";
                errorMsg.style.display = 'block';
                return false;
            }
            
            errorMsg.style.display = 'none';
            return true;
        };

        queryInput.addEventListener('input', validateInput);
        
        form.addEventListener('submit', async (event) => {
            event.preventDefault(); // Never reload
            
            if (!validateInput()) return;
            
            const query = queryInput.value.trim();
            const outputArea = document.getElementById('irdai-output');
            const loadingArea = document.getElementById('irdai-loading');
            const loadingText = document.getElementById('irdai-loading-text');
            
            // Disable UI
            submitBtn.disabled = true;
            queryInput.disabled = true;
            outputArea.style.display = 'none';
            loadingArea.style.display = 'flex';
            
            // Loading Experience Simulation for UI feedback
            const loadingSteps = [
                "Validating Query...",
                "Generating Embedding...",
                "Searching IRDAI Regulations...",
                "Retrieving Consumer Protection Rules...",
                "Building Regulatory Context...",
                "Generating Compliance Answer...",
                "Rendering Response..."
            ];
            
            let currentStep = 0;
            const stepInterval = setInterval(() => {
                if (currentStep < loadingSteps.length) {
                    loadingText.textContent = loadingSteps[currentStep];
                    currentStep++;
                }
            }, 600); // cycle through steps artificially while waiting for API

            try {
                const token = localStorage.getItem('token');
                const baseUrl = window.API_URL || 'http://127.0.0.1:8000';
                const response = await fetch(baseUrl + '/api/irdai-checker/analyze', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ query })
                });

                clearInterval(stepInterval);
                
                if (!response.ok) {
                    const errData = await response.json().catch(() => ({}));
                    throw new Error(errData.detail || `HTTP ${response.status}`);
                }

                const data = await response.json();
                
                // Render Response
                document.getElementById('irdai-out-query').textContent = query;
                document.getElementById('irdai-out-response').textContent = data.ai_response || "No response generated.";
                
                loadingArea.style.display = 'none';
                outputArea.style.display = 'block';
                outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });

            } catch (error) {
                clearInterval(stepInterval);
                loadingArea.style.display = 'none';
                errorMsg.textContent = `Error: ${error.message}`;
                errorMsg.style.display = 'block';
            } finally {
                submitBtn.disabled = false;
                queryInput.disabled = false;
            }
        });
    };

    return `
        <div style="font-family: 'Inter', system-ui, sans-serif; animation: fadeIn 0.4s ease; max-width: 1100px; margin: 0 auto; padding-bottom: 60px;">
            <style>
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
                .glass-card { background: #FFFFFF; border: 1px solid #E2E8F0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.02); }
                .irdai-textarea { width: 100%; padding: 16px 20px; border: 2px solid #E2E8F0; border-radius: 12px; font-size: 16px; font-weight: 500; outline: none; transition: all 0.2s; box-sizing: border-box; font-family: inherit; resize: vertical; min-height: 120px; color: #1E293B; }
                .irdai-textarea:focus { border-color: #8b5cf6; box-shadow: 0 0 0 4px rgba(139,92,246,0.1); }
                .irdai-textarea:disabled { background: #F8FAFC; cursor: not-allowed; }
                
                .example-chip { background: #F3E8FF; color: #6B21A8; font-size: 13px; font-weight: 600; padding: 8px 16px; border-radius: 20px; cursor: pointer; transition: all 0.2s; border: 1px solid #E9D5FF; white-space: nowrap; }
                .example-chip:hover { background: #E9D5FF; color: #581C87; border-color: #D8B4FE; }

                .irdai-btn { background: #8b5cf6; color: white; border: none; padding: 16px 32px; border-radius: 12px; font-size: 16px; font-weight: 700; cursor: pointer; transition: background 0.2s, transform 0.1s; display: inline-flex; align-items: center; gap: 8px; }
                .irdai-btn:hover { background: #7c3aed; }
                .irdai-btn:active { transform: scale(0.98); }
                .irdai-btn:disabled { background: #C4B5FD; cursor: not-allowed; transform: none; }
                
                .error-text { color: #EF4444; font-size: 14px; font-weight: 600; margin-top: 8px; display: none; }
                
                .response-section { margin-bottom: 32px; }
                .response-section h3 { font-size: 15px; font-weight: 800; color: #64748B; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; border-bottom: 1px solid #F1F5F9; padding-bottom: 8px; }
                .response-section p { font-size: 16px; color: #0F172A; line-height: 1.6; font-weight: 500; }
                
                .primary-response { background: #F8FAFC; padding: 24px; border-radius: 12px; border-left: 4px solid #8b5cf6; margin-bottom: 32px; }
                .primary-response h3 { border: none; padding: 0; color: #8b5cf6; margin-bottom: 16px; }
                .primary-response p { font-size: 18px; font-weight: 600; color: #1E293B; }
            </style>

            <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 32px;">
                <div style="width: 56px; height: 56px; border-radius: 16px; background: linear-gradient(135deg, #8b5cf6, #3B82F6); display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 8px 16px rgba(139, 92, 246, 0.25);">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                        <line x1="9" y1="12" x2="15" y2="12"></line>
                        <line x1="12" y1="9" x2="12" y2="15"></line>
                    </svg>
                </div>
                <div>
                    <h1 style="margin: 0 0 4px 0; font-size: 28px; font-weight: 800; color: #1F2937; letter-spacing: -0.02em;">IRDAI Compliance & Consumer Protection Hub</h1>
                    <p style="margin: 0; color: #64748B; font-size: 16px; font-weight: 500;">Ask questions related to policyholder rights, grievances, and IRDAI regulations.</p>
                </div>
            </div>

            <!-- Query Input Form -->
            <div class="glass-card" style="padding: 40px; margin-bottom: 24px;">
                <form id="irdai-form">
                    <label style="display: block; font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">Ask Your Compliance Question</label>
                    <textarea 
                        id="irdai-query-input" 
                        class="irdai-textarea" 
                        placeholder="Ask an IRDAI compliance or consumer protection question...&#10;e.g., 'What should I do if my insurer delays claim settlement?'"
                        ></textarea>
                    
                    <div id="irdai-error-msg" class="error-text"></div>
                    
                    <div style="margin-top: 16px; display: flex; flex-direction: row; gap: 8px; overflow-x: auto; padding-bottom: 8px;">
                        <div class="example-chip" onclick="document.getElementById('irdai-query-input').value = this.innerText; document.getElementById('irdai-query-input').focus();">What is the maximum time allowed to settle a life insurance claim?</div>
                        <div class="example-chip" onclick="document.getElementById('irdai-query-input').value = this.innerText; document.getElementById('irdai-query-input').focus();">Can my health insurer reject a claim for a pre-existing disease after 3 years?</div>
                        <div class="example-chip" onclick="document.getElementById('irdai-query-input').value = this.innerText; document.getElementById('irdai-query-input').focus();">How do I escalate a grievance if the insurance company ignores my complaint?</div>
                    </div>
                    
                    <div style="margin-top: 24px; text-align: right;">
                        <button type="submit" id="btn-irdai-analyze" class="irdai-btn">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="17 8 12 3 7 8"></polyline>
                                <line x1="12" y1="3" x2="12" y2="15"></line>
                            </svg>
                            Analyze Compliance
                        </button>
                    </div>
                </form>
            </div>

            <!-- Loading State -->
            <div id="irdai-loading" class="glass-card" style="display: none; padding: 60px; text-align: center; flex-direction: column; align-items: center; justify-content: center; margin-bottom: 24px;">
                <div class="loader-spinner" style="width: 48px; height: 48px; border: 4px solid #F1F5F9; border-top-color: #8b5cf6; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 24px;"></div>
                <h3 id="irdai-loading-text" style="font-size: 20px; font-weight: 700; color: #0F172A; margin: 0;">Initializing...</h3>
                <p style="color: #64748B; margin-top: 8px;">Retrieving evidence from Pinecone...</p>
            </div>

            <!-- Structured Output -->
            <div id="irdai-output" class="glass-card" style="display: none; padding: 40px; border-top: 8px solid #8b5cf6;">
                <div style="margin-bottom: 24px;">
                    <h3 style="font-size: 16px; font-weight: 700; color: #4F46E5; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        User Query
                    </h3>
                    <p id="irdai-out-query" style="font-weight: 500; font-style: italic; color: #111827; margin: 0; padding: 16px; background: #F8FAFC; border-radius: 8px; border: 1px solid #E2E8F0;"></p>
                </div>
                <div>
                    <h3 style="font-size: 16px; font-weight: 700; color: #10B981; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20"></path><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                        AI Response
                    </h3>
                    <p id="irdai-out-response" style="white-space: pre-wrap; line-height: 1.8; color: #334155; font-size: 16px; margin: 0;"></p>
                </div>
            </div>
        </div>
    `;
};
