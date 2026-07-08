export const AiAssistant = (user) => {
    const existingState = window.AiAssistantActions?.state || {
        messages: [],
        isLoading: false,
        inputValue: ''
    };

    if (!window.AiAssistantActions) {
        window.AiAssistantActions = {
            state: existingState,
            sendMessage: async (textOverride = null) => {
                const input = document.getElementById('ai-chat-input');
                const text = textOverride || (input ? input.value.trim() : '');
                
                if (!text) return;
                
                window.AiAssistantActions.state.messages.push({ role: 'user', text: text });
                window.AiAssistantActions.state.inputValue = '';
                window.AiAssistantActions.state.isLoading = true;
                
                // Re-render
                document.getElementById('dashboard-root').innerHTML = AiAssistant(user);
                
                try {
                    const token = localStorage.getItem('token');
                    const response = await fetch(`${window.API_URL || 'http://127.0.0.1:8000'}/intelligence/ai-assistant`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        },
                        body: JSON.stringify({ query: text })
                    });
                    
                    const data = await response.json();
                    
                    if (data.error) {
                        window.AiAssistantActions.state.messages.push({ role: 'ai', text: "Error: " + data.error });
                    } else {
                        window.AiAssistantActions.state.messages.push({ role: 'ai', text: data.response || JSON.stringify(data) });
                    }
                } catch (e) {
                    window.AiAssistantActions.state.messages.push({ role: 'ai', text: "Failed to connect to AI Assistant." });
                } finally {
                    window.AiAssistantActions.state.isLoading = false;
                    document.getElementById('dashboard-root').innerHTML = AiAssistant(user);
                    
                    // Scroll to bottom
                    setTimeout(() => {
                        const chatArea = document.getElementById('ai-chat-history');
                        if(chatArea) chatArea.scrollTop = chatArea.scrollHeight;
                    }, 50);
                }
            },
            handleKeyPress: (e) => {
                if (e.key === 'Enter') {
                    window.AiAssistantActions.sendMessage();
                }
            },
            setQuery: (text) => {
                window.AiAssistantActions.sendMessage(text);
            }
        };
    }

    const s = window.AiAssistantActions.state;
    const userName = user?.fullName ? user.fullName.split(' ')[0] : (user?.email || 'User');

    return `
        <section class="module-section active" style="max-width: 1000px; margin: 0 auto; padding: 40px; min-height: calc(100vh - 80px); box-sizing: border-box; animation: fadeIn 0.4s ease; background: transparent;">
            
            <style>
                @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }
                
                .ai-container {
                    background: #FFFFFF;
                    border-radius: 24px;
                    box-shadow: 0 16px 50px rgba(0,0,0,0.06);
                    padding: 40px;
                    display: flex;
                    flex-direction: column;
                    min-height: 600px;
                    max-height: 85vh;
                    position: relative;
                }
                
                .ai-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 32px;
                    flex-shrink: 0;
                }
                
                .ai-status {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .ai-icon {
                    width: 48px;
                    height: 48px;
                    background: #F3F4F6;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: hidden;
                    border: 1px solid #E5E7EB;
                }
                
                .ai-title h3 {
                    font-size: 18px;
                    font-weight: 700;
                    color: #111827;
                    margin: 0;
                }
                
                .ai-status-indicator {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    font-size: 13px;
                    font-weight: 600;
                    color: #10B981;
                }
                
                .ai-status-dot {
                    width: 8px;
                    height: 8px;
                    background: #10B981;
                    border-radius: 50%;
                }
                
                .ai-greeting {
                    margin-bottom: 30px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    position: relative;
                    flex-shrink: 0;
                }
                
                .ai-greeting h2 {
                    font-size: 28px;
                    font-weight: 800;
                    color: #1F2937;
                    margin: 0 0 12px 0;
                }
                
                .ai-greeting h3 {
                    font-size: 24px;
                    font-weight: 700;
                    color: #1F2937;
                    margin: 0 0 12px 0;
                }
                
                .ai-greeting p {
                    font-size: 15px;
                    color: #6B7280;
                    margin: 0;
                }
                
                .ai-robot-img {
                    width: 150px;
                    height: auto;
                    position: absolute;
                    right: 20px;
                    top: -20px;
                }
                
                .ai-suggestions-title {
                    font-size: 14px;
                    font-weight: 700;
                    color: #4B5563;
                    margin-bottom: 16px;
                }
                
                .ai-suggestions {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 16px;
                    margin-bottom: 20px;
                }
                
                .ai-suggestion-item {
                    background: #F9FAFB;
                    border: 1px solid #F3F4F6;
                    border-radius: 16px;
                    padding: 16px 20px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                
                .ai-suggestion-item:hover {
                    background: #F3F4F6;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
                }
                
                .ai-suggestion-content {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    font-size: 14px;
                    font-weight: 600;
                    color: #374151;
                }
                
                .chat-history {
                    flex: 1;
                    overflow-y: auto;
                    margin-bottom: 20px;
                    padding-right: 10px;
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }
                
                .chat-history::-webkit-scrollbar { width: 6px; }
                .chat-history::-webkit-scrollbar-thumb { background: #E5E7EB; border-radius: 10px; }
                
                .msg-row {
                    display: flex;
                    gap: 12px;
                    align-items: flex-end;
                    margin-bottom: 8px;
                }
                
                .msg-row-user {
                    justify-content: flex-end;
                }
                
                .msg-row-ai {
                    justify-content: flex-start;
                }

                .msg-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    flex-shrink: 0;
                    font-size: 14px;
                    font-weight: 700;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
                }
                
                .msg-icon-ai {
                    background: #FFFFFF;
                    border: 1px solid #E5E7EB;
                }
                
                .msg-icon-user {
                    background: linear-gradient(135deg, #FF7A59, #FF9A76);
                    color: white;
                }
                
                .msg-bubble {
                    padding: 16px 20px;
                    border-radius: 20px;
                    font-size: 15px;
                    line-height: 1.5;
                    max-width: 75%;
                }
                
                .msg-user {
                    background: #6366F1;
                    color: white;
                    border-bottom-right-radius: 4px;
                }
                
                .msg-ai {
                    background: #F3F4F6;
                    color: #1F2937;
                    border-bottom-left-radius: 4px;
                }
                
                .ai-input-container {
                    position: relative;
                    flex-shrink: 0;
                }
                
                .ai-input {
                    width: 100%;
                    padding: 20px;
                    padding-right: 64px;
                    background: #FFFFFF;
                    border: 2px solid #E5E7EB;
                    border-radius: 20px;
                    font-size: 15px;
                    outline: none;
                    box-sizing: border-box;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.03);
                    transition: all 0.2s;
                }
                
                .ai-input:focus {
                    border-color: #6366F1;
                    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.1);
                }
                
                .ai-send-btn {
                    position: absolute;
                    right: 12px;
                    top: 12px;
                    width: 44px;
                    height: 44px;
                    background: linear-gradient(135deg, #6366F1, #8B5CF6);
                    border: none;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                .ai-send-btn:hover {
                    transform: scale(1.05);
                }
                
                .ai-send-btn:disabled {
                    background: #D1D5DB;
                    cursor: not-allowed;
                    transform: none;
                }
            </style>

            <div class="ai-container">
                <div class="ai-header">
                    <div class="ai-status">
                        <div class="ai-icon">
                            <img src="assets/waving_robot.png" style="width: 100%; height: 100%; object-fit: cover;">
                        </div>
                        <div class="ai-title">
                            <h3>Personal AI Assistant</h3>
                            <div class="ai-status-indicator">
                                <span class="ai-status-dot"></span> Online
                            </div>
                        </div>
                    </div>
                </div>

                <div class="chat-history" id="ai-chat-history">
                    <div class="ai-greeting" style="${s.messages.length > 0 ? 'margin-bottom: 10px; padding-bottom: 20px; border-bottom: 1px solid #F3F4F6;' : ''}">
                        <div>
                            <h2>Hey, <span style="color: #3B82F6;">${userName}! 👋</span></h2>
                            <h3>How can I help you today?</h3>
                            <p>Ask me anything about insurance concepts and rules.</p>
                        </div>
                        <img src="assets/waving_robot.png" alt="Robot" class="ai-robot-img">
                    </div>

                    ${s.messages.length === 0 ? `
                    <div class="ai-suggestions-title">You can ask me about:</div>
                    <div class="ai-suggestions">
                        ${[
                            {icon: '<circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline>', text: 'What is a Waiting Period?'},
                            {icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>', text: 'What is Sum Insured?'},
                            {icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline>', text: 'What is Deductible?'},
                            {icon: '<path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path>', text: 'What is Pre-existing Disease?'},
                            {icon: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>', text: 'What is No Claim Bonus?'},
                            {icon: '<rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="15" y2="22"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="12" y1="12" x2="12" y2="12.01"></line>', text: 'What is Room Rent Limit?'},
                            {icon: '<rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line>', text: 'What is Cashless Claim?'},
                            {icon: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line>', text: 'Know my IRDAI Rights'}
                        ].map(q => `
                            <div class="ai-suggestion-item" onclick="window.AiAssistantActions.setQuery('${q.text}')">
                                <div class="ai-suggestion-content">
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6366F1" stroke-width="2">${q.icon}</svg>
                                    ${q.text}
                                </div>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><polyline points="9 18 15 12 9 6"></polyline></svg>
                            </div>
                        `).join('')}
                    </div>
                    ` : ''}

                    ${s.messages.map(m => `
                        <div class="msg-row ${m.role === 'user' ? 'msg-row-user' : 'msg-row-ai'}">
                            ${m.role === 'ai' ? `<div class="msg-icon msg-icon-ai"><img src="assets/waving_robot.png" style="width: 30px; height: 30px; object-fit: contain;"></div>` : ''}
                            
                            <div class="msg-bubble ${m.role === 'user' ? 'msg-user' : 'msg-ai'}">
                                ${m.text}
                            </div>
                            
                            ${m.role === 'user' ? `<div class="msg-icon msg-icon-user">${userName.charAt(0).toUpperCase()}</div>` : ''}
                        </div>
                    `).join('')}

                    ${s.isLoading ? `
                        <div class="msg-row msg-row-ai">
                            <div class="msg-icon msg-icon-ai"><img src="assets/waving_robot.png" style="width: 30px; height: 30px; object-fit: contain;"></div>
                            <div class="msg-bubble msg-ai" style="display: flex; gap: 4px; align-items: center; width: 60px; height: 30px;">
                                <div style="width: 8px; height: 8px; background: #9CA3AF; border-radius: 50%; animation: pulse 1s infinite;"></div>
                                <div style="width: 8px; height: 8px; background: #9CA3AF; border-radius: 50%; animation: pulse 1s infinite 0.2s;"></div>
                                <div style="width: 8px; height: 8px; background: #9CA3AF; border-radius: 50%; animation: pulse 1s infinite 0.4s;"></div>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <div class="ai-input-container">
                    <input type="text" id="ai-chat-input" class="ai-input" placeholder="Type your question here..." onkeypress="window.AiAssistantActions.handleKeyPress(event)" ${s.isLoading ? 'disabled' : ''}>
                    <button type="button" class="ai-send-btn" onclick="window.AiAssistantActions.sendMessage()" ${s.isLoading ? 'disabled' : ''}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" stroke-width="2" style="margin-right: 2px; margin-top: 2px;"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        </section>
    `;
};
