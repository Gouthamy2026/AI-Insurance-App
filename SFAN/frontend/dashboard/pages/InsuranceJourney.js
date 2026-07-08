export const InsuranceJourney = () => {
    if (!window.InsuranceJourneyActions) {
        window.InsuranceJourneyActions = {
            sendMessage: () => {
                const input = document.getElementById('journey-input-field');
                const text = input.value.trim();
                if (!text) return;
                
                const history = JSON.parse(localStorage.getItem('sfan_journey_chat') || '[]');
                history.push({ role: "user", timestamp: "Just now", content: text });
                localStorage.setItem('sfan_journey_chat', JSON.stringify(history));
                
                // Clear input and Re-render immediately
                document.getElementById('dashboard-root').innerHTML = InsuranceJourney();
                
                // Simulate AI reply
                setTimeout(() => {
                    const currentHistory = JSON.parse(localStorage.getItem('sfan_journey_chat') || '[]');
                    currentHistory.push({
                        role: "system",
                        timestamp: "Just now",
                        content: "I have recorded this event in your journey timeline. Based on this update, your narrative has progressed.",
                        insight: true
                    });
                    localStorage.setItem('sfan_journey_chat', JSON.stringify(currentHistory));
                    document.getElementById('dashboard-root').innerHTML = InsuranceJourney();
                    
                    // Auto-scroll to bottom
                    const msgContainer = document.querySelector('.journey-messages');
                    if(msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
                }, 1000);
            },
            triggerAction: (actionText) => {
                const history = JSON.parse(localStorage.getItem('sfan_journey_chat') || '[]');
                history.push({ role: "user", timestamp: "Just now", content: actionText });
                localStorage.setItem('sfan_journey_chat', JSON.stringify(history));
                document.getElementById('dashboard-root').innerHTML = InsuranceJourney();
                
                setTimeout(() => {
                    const currentHistory = JSON.parse(localStorage.getItem('sfan_journey_chat') || '[]');
                    let reply = "Processing your request...";
                    if (actionText === "Connect Data Source") reply = "Initiating data source connection protocol. Please follow the upcoming prompts to link your accounts.";
                    if (actionText === "Ask a Question") reply = "What specific question do you have about your coverage limits or policies?";
                    if (actionText === "View Sample Analysis") reply = "Here is a sample analysis: Policyholder usually renews 2 weeks prior to expiry. Gap identified in critical illness cover.";
                    
                    currentHistory.push({ role: "system", timestamp: "Just now", content: reply, insight: false });
                    localStorage.setItem('sfan_journey_chat', JSON.stringify(currentHistory));
                    document.getElementById('dashboard-root').innerHTML = InsuranceJourney();
                    
                    const msgContainer = document.querySelector('.journey-messages');
                    if(msgContainer) msgContainer.scrollTop = msgContainer.scrollHeight;
                }, 1000);
            }
        };
    }

    let conversation = JSON.parse(localStorage.getItem('sfan_journey_chat'));
    if (!conversation || conversation.length === 0) {
        conversation = [
            {
                role: "system",
                timestamp: "Just now",
                content: "Welcome to your Insurance Journey narrative. I am designed to continuously monitor your policy events and translate them into a clear, insightful story. Your timeline is currently waiting for new events to be processed.",
                insight: false
            },
            {
                role: "system",
                timestamp: "Just now",
                content: "How would you like to begin? You can connect your policy data source, or ask me a question about your coverage to initiate the narrative.",
                insight: false,
                actions: ["Connect Data Source", "Ask a Question", "View Sample Analysis"]
            }
        ];
        localStorage.setItem('sfan_journey_chat', JSON.stringify(conversation));
    }

    const renderMessage = (msg, index) => {
        const isSystem = msg.role === "system";
        
        // Removed white background, replaced with premium glass/transparent subtle effect
        let messageStyle = isSystem 
            ? 'background: rgba(0, 0, 0, 0.02); border: 1px solid rgba(0, 0, 0, 0.06); border-radius: 20px 20px 20px 4px; box-shadow: 0 4px 24px rgba(0,0,0,0.01); color: #111827; backdrop-filter: blur(10px);' 
            : 'background: #111827; color: #FFFFFF; border-radius: 20px 20px 4px 20px; box-shadow: 0 4px 24px rgba(0,0,0,0.08);';

        let actionsHtml = '';
        if (msg.actions) {
            actionsHtml = `
                <div style="display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap;">
                    ${msg.actions.map(action => `
                        <button type="button" onclick="window.InsuranceJourneyActions.triggerAction('${action}')" style="background: transparent; border: 1px solid rgba(0,0,0,0.15); color: #374151; padding: 10px 20px; border-radius: 100px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.3s ease;" onmouseover="this.style.background='#111827'; this.style.color='#FFFFFF'; this.style.borderColor='#111827';" onmouseout="this.style.background='transparent'; this.style.color='#374151'; this.style.borderColor='rgba(0,0,0,0.15)';">${action}</button>
                    `).join('')}
                </div>
            `;
        }

        return `
            <div style="display: flex; flex-direction: column; align-items: ${isSystem ? 'flex-start' : 'flex-end'}; margin-bottom: 32px; animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; opacity: 0; animation-delay: ${index * 0.1}s;">
                <div style="font-size: 11px; font-weight: 500; color: #6B7280; margin-bottom: 8px; padding: 0 4px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ${isSystem ? 'Narrative Engine • ' + msg.timestamp : 'You • ' + msg.timestamp}
                </div>
                <div style="max-width: 85%; padding: 24px; font-size: 15px; line-height: 1.7; ${messageStyle}">
                    <div style="font-weight: 400; letter-spacing: -0.2px;">${msg.content}</div>
                    ${actionsHtml}
                </div>
            </div>
        `;
    };

    return `
        <div style="display: flex; height: calc(100vh - 80px); background: transparent; font-family: 'Inter', system-ui, sans-serif; gap: 20px; max-width: 1200px; margin: 0 auto; padding: 20px; box-sizing: border-box;">
            
            <style>
                @keyframes slideUp { 
                    from { opacity: 0; transform: translateY(15px); } 
                    to { opacity: 1; transform: translateY(0); } 
                }
                
                .journey-chat-container {
                    flex: 1.2;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                }
                
                .journey-header {
                    padding: 20px 0 24px 0;
                    margin-bottom: 24px;
                    border-bottom: 1px solid rgba(0,0,0,0.06);
                    position: sticky;
                    top: 0;
                    background: transparent;
                    backdrop-filter: blur(12px);
                    z-index: 10;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .journey-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: #111827;
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    letter-spacing: -0.5px;
                }
                
                .journey-messages {
                    flex-grow: 1;
                    overflow-y: auto;
                    padding: 10px 20px 40px 0;
                    display: flex;
                    flex-direction: column;
                    scrollbar-width: thin;
                    scrollbar-color: rgba(0,0,0,0.1) transparent;
                }
                
                .journey-messages::-webkit-scrollbar {
                    width: 4px;
                }
                .journey-messages::-webkit-scrollbar-thumb {
                    background-color: rgba(0,0,0,0.1);
                    border-radius: 4px;
                }
                
                .journey-input-area {
                    padding: 24px 20px 20px 0;
                    background: transparent;
                    position: sticky;
                    bottom: 0;
                    z-index: 10;
                    backdrop-filter: blur(12px);
                }
                
                .journey-input-wrapper {
                    position: relative;
                    width: 100%;
                }
                
                .journey-input {
                    width: 100%;
                    padding: 20px 64px 20px 28px;
                    border: 1px solid rgba(0,0,0,0.08);
                    border-radius: 16px;
                    font-size: 15px;
                    background: rgba(255,255,255,0.6);
                    color: #111827;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.02);
                    outline: none;
                    box-sizing: border-box;
                    transition: all 0.3s ease;
                    backdrop-filter: blur(8px);
                }
                
                .journey-input::placeholder {
                    color: #6B7280;
                    font-weight: 400;
                }
                
                .journey-input:focus {
                    border-color: #111827;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.05);
                    background: #FFFFFF;
                }
                
                .journey-send-btn {
                    position: absolute;
                    right: 12px;
                    top: 12px;
                    bottom: 12px;
                    width: 40px;
                    height: 40px;
                    background: #111827;
                    color: #FFFFFF;
                    border: none;
                    border-radius: 12px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .journey-send-btn:hover {
                    background: #374151;
                    transform: translateY(-1px);
                }
            </style>

            <!-- Graphic Panel on Left -->
            <div style="flex: 0.7; background: transparent; position: relative; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 60px 0;">
                <!-- Vertical Line -->
                <div style="position: absolute; left: 50%; top: 40px; bottom: 40px; width: 3px; background: linear-gradient(to bottom, #E0E7FF, #6366F1, #10B981, #E0E7FF); transform: translateX(-50%); border-radius: 3px;"></div>
                
                <!-- Timeline Nodes -->
                <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: space-between; position: relative; z-index: 2;">
                    
                    <!-- Node 1 -->
                    <div style="display: flex; justify-content: center; position: relative; animation: slideUp 0.6s ease forwards; opacity: 0; animation-delay: 0.2s;">
                        <div style="width: 72px; height: 72px; background: #FFFFFF; border: 3px solid #6366F1; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(99,102,241,0.15); overflow: hidden;">
                            <img src="assets/girl_using_phone.png" style="width: 100%; height: 100%; object-fit: cover;" alt="User">
                        </div>
                        <!-- Chat bubble Left -->
                        <div style="position: absolute; right: calc(50% + 48px); top: 12px; background: #6366F1; color: white; padding: 10px 16px; border-radius: 16px 16px 0 16px; font-size: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(99,102,241,0.2);">Exploring plans...</div>
                    </div>

                    <!-- Node 2 -->
                    <div style="display: flex; justify-content: center; position: relative; animation: slideUp 0.6s ease forwards; opacity: 0; animation-delay: 0.4s;">
                        <div style="width: 72px; height: 72px; background: #FFFFFF; border: 3px solid #10B981; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(16,185,129,0.15); overflow: hidden;">
                            <img src="assets/girl_using_phone.png" style="width: 100%; height: 100%; object-fit: cover;" alt="User">
                        </div>
                        <!-- Chat bubble Right -->
                        <div style="position: absolute; left: calc(50% + 48px); top: 12px; background: #10B981; color: white; padding: 10px 16px; border-radius: 16px 16px 16px 0; font-size: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(16,185,129,0.2);">Policy active!</div>
                    </div>

                    <!-- Node 3 -->
                    <div style="display: flex; justify-content: center; position: relative; animation: slideUp 0.6s ease forwards; opacity: 0; animation-delay: 0.6s;">
                        <div style="width: 72px; height: 72px; background: #FFFFFF; border: 3px solid #F59E0B; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(245,158,11,0.15); overflow: hidden;">
                            <img src="assets/girl_using_phone.png" style="width: 100%; height: 100%; object-fit: cover;" alt="User">
                        </div>
                        <!-- Chat bubble Left -->
                        <div style="position: absolute; right: calc(50% + 48px); top: 12px; background: #F59E0B; color: white; padding: 10px 16px; border-radius: 16px 16px 0 16px; font-size: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(245,158,11,0.2);">Submitting claim...</div>
                    </div>

                    <!-- Node 4 -->
                    <div style="display: flex; justify-content: center; position: relative; animation: slideUp 0.6s ease forwards; opacity: 0; animation-delay: 0.8s;">
                        <div style="width: 72px; height: 72px; background: #FFFFFF; border: 3px solid #6B7280; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 20px rgba(107,114,128,0.15); overflow: hidden;">
                            <img src="assets/girl_using_phone.png" style="width: 100%; height: 100%; object-fit: cover;" alt="User">
                        </div>
                         <!-- Chat bubble Right -->
                         <div style="position: absolute; left: calc(50% + 48px); top: 12px; background: #6B7280; color: white; padding: 10px 16px; border-radius: 16px 16px 16px 0; font-size: 12px; font-weight: 600; box-shadow: 0 4px 12px rgba(107,114,128,0.2);">Renewal upcoming</div>
                    </div>

                </div>
            </div>

            <div class="journey-chat-container">
                <div class="journey-header">
                    <h1 class="journey-title">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#111827" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        Insurance Journey
                    </h1>
                    <div style="font-size: 13px; font-weight: 600; color: #9CA3AF; text-transform: uppercase; letter-spacing: 1px;">
                        Awaiting Events
                    </div>
                </div>

                <div class="journey-messages">
                    ${conversation.map((msg, index) => renderMessage(msg, index)).join('')}
                </div>

                <div class="journey-input-area">
                    <div class="journey-input-wrapper">
                        <input id="journey-input-field" type="text" class="journey-input" placeholder="Type a message or event..." onkeypress="if(event.key === 'Enter') window.InsuranceJourneyActions.sendMessage()">
                        <button type="button" class="journey-send-btn" onclick="window.InsuranceJourneyActions.sendMessage()">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
};
