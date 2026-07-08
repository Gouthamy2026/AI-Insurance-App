export const InsuranceGoals = () => {
    // 1. Setup global handlers if not already setup
    if (!window.InsuranceGoalsActions) {
        window.InsuranceGoalsActions = {
            save: () => {
                const title = document.getElementById('goal-title').value.trim();
                const desc = document.getElementById('goal-desc').value.trim();
                if (!title) {
                    alert('Please enter a goal title.');
                    return;
                }
                const goals = JSON.parse(localStorage.getItem('sfan_insurance_goals') || '[]');
                goals.push({ id: Date.now(), title, desc });
                localStorage.setItem('sfan_insurance_goals', JSON.stringify(goals));
                
                // Re-render
                document.getElementById('dashboard-root').innerHTML = InsuranceGoals();
            },
            delete: (id) => {
                if(confirm('Are you sure you want to delete this goal?')) {
                    let goals = JSON.parse(localStorage.getItem('sfan_insurance_goals') || '[]');
                    goals = goals.filter(g => g.id !== id);
                    localStorage.setItem('sfan_insurance_goals', JSON.stringify(goals));
                    
                    // Re-render
                    document.getElementById('dashboard-root').innerHTML = InsuranceGoals();
                }
            },
            edit: (id) => {
                const goals = JSON.parse(localStorage.getItem('sfan_insurance_goals') || '[]');
                const goal = goals.find(g => g.id === id);
                if (goal) {
                    document.getElementById('goal-title').value = goal.title;
                    document.getElementById('goal-desc').value = goal.desc;
                    // change save button to update
                    const saveBtn = document.getElementById('goal-save-btn');
                    saveBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align: middle;"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path><polyline points="17 21 17 13 7 13 7 21"></polyline><polyline points="7 3 7 8 15 8"></polyline></svg> Update Goal';
                    saveBtn.onclick = () => window.InsuranceGoalsActions.update(id);
                }
            },
            update: (id) => {
                const title = document.getElementById('goal-title').value.trim();
                const desc = document.getElementById('goal-desc').value.trim();
                if (!title) {
                    alert('Please enter a goal title.');
                    return;
                }
                let goals = JSON.parse(localStorage.getItem('sfan_insurance_goals') || '[]');
                goals = goals.map(g => g.id === id ? { ...g, title, desc } : g);
                localStorage.setItem('sfan_insurance_goals', JSON.stringify(goals));
                
                // Re-render
                document.getElementById('dashboard-root').innerHTML = InsuranceGoals();
            }
        };
    }

    let goals = JSON.parse(localStorage.getItem('sfan_insurance_goals') || 'null');
    if (!goals || goals.length === 0) {
        goals = [
            { id: 1, title: 'Critical Illness Coverage', desc: 'Secure comprehensive cover for major illnesses including cancer and heart conditions.' },
            { id: 2, title: 'Family Protection Fund', desc: 'Ensure financial stability for dependents in case of unforeseen circumstances.' }
        ];
        localStorage.setItem('sfan_insurance_goals', JSON.stringify(goals));
    }
    const goalsListHTML = goals.length === 0 
        ? `<div style="grid-column: 1 / -1; text-align: center; padding: 60px 40px; color: #111827; background: #F9FAFB; border-radius: 8px; border: 2px dashed #E5E7EB; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 400px;">
             <img src="assets/insurance_goal.png" alt="Insurance Goal" style="width: 380px; height: auto; mix-blend-mode: multiply; filter: drop-shadow(0 10px 15px rgba(0,0,0,0.1)); margin-bottom: 24px;">
             <h3 style="margin: 0 0 12px 0; font-size: 22px; font-weight: 700; color: #111827;">No goals recorded</h3>
             <p style="margin: 0; max-width: 350px; font-size: 16px; line-height: 1.6; color: #111827;">Use the form on the left to add your first insurance goal.</p>
           </div>`
        : goals.map(goal => `
            <div style="border: 1px solid #E5E7EB; border-radius: 8px; background: white; padding: 20px; display: flex; flex-direction: column; justify-content: space-between; transition: box-shadow 0.2s ease, transform 0.2s ease; height: 100%; box-sizing: border-box;" onmouseover="this.style.boxShadow='0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.boxShadow='none'; this.style.transform='none'">
                <div>
                    <h3 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #111827; display: flex; align-items: flex-start; gap: 8px; border-bottom: 1px solid #F3F4F6; padding-bottom: 12px;">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#3B82F6" stroke-width="2.5" style="flex-shrink: 0; margin-top: 2px;"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        <span style="line-height: 1.4;">${goal.title}</span>
                    </h3>
                    <p style="margin: 0 0 20px 0; font-size: 16px; font-weight: 500; color: #111827; line-height: 1.6; word-break: break-word;">${goal.desc}</p>
                </div>
                <div style="display: flex; gap: 8px; justify-content: flex-end; border-top: 1px solid #F3F4F6; padding-top: 16px; margin-top: auto;">
                    <button type="button" onclick="window.InsuranceGoalsActions.edit(${goal.id})" style="background: white; border: 1px solid #D1D5DB; color: #374151; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='#F3F4F6'" onmouseout="this.style.background='white'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        Edit
                    </button>
                    <button type="button" onclick="window.InsuranceGoalsActions.delete(${goal.id})" style="background: #FEF2F2; border: 1px solid #FECACA; color: #DC2626; padding: 6px 12px; border-radius: 6px; font-size: 13px; font-weight: 500; cursor: pointer; display: flex; align-items: center; gap: 6px; transition: all 0.2s;" onmouseover="this.style.background='#FEE2E2'" onmouseout="this.style.background='#FEF2F2'">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                        Delete
                    </button>
                </div>
            </div>
        `).join('');

    return `
        <div style="animation: fadeIn 0.3s ease; padding: 0 20px; font-family: 'Inter', system-ui, sans-serif; max-width: 1400px; margin: 0 auto;">
            <div style="border-bottom: 1px solid #E5E7EB; padding-bottom: 24px; margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
                <div>
                    <h1 style="font-size: 32px; font-weight: 800; color: #111827; margin: 0 0 8px 0; letter-spacing: -0.5px;">
                        Insurance Goal
                    </h1>
                    <p style="color: #111827; font-size: 18px; font-weight: 500; margin: 0;">Define and manage your key financial protection priorities.</p>
                </div>
                <div style="color: #111827; font-size: 15px; font-weight: 600; background: #F3F4F6; padding: 10px 18px; border-radius: 20px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);">
                    ${goals.length} Goal${goals.length !== 1 ? 's' : ''} Recorded
                </div>
            </div>
            
            <div style="display: flex; flex-wrap: wrap; gap: 40px; align-items: flex-start; justify-content: space-between;">
                <!-- Left Column: Input Form (Floating Card) -->
                <div style="flex: 1 1 500px; position: sticky; top: 20px; z-index: 10;">
                    <div style="border: 1px solid #E5E7EB; border-radius: 12px; background: white; padding: 24px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); transform: translateY(-5px); transition: transform 0.3s ease;">
                        <h2 style="font-size: 20px; font-weight: 700; color: #111827; margin: 0 0 24px 0; border-bottom: 1px solid #F3F4F6; padding-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                            Goal Details
                        </h2>
                        <div style="margin-bottom: 20px;">
                            <label style="display: block; font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 10px;">Goal Title <span style="color: #EF4444;">*</span></label>
                            <input id="goal-title" type="text" placeholder="e.g., Critical Illness Coverage" style="width: 100%; padding: 12px 16px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 16px; color: #111827; outline: none; transition: border-color 0.2s; box-sizing: border-box;" onfocus="this.style.borderColor='#3B82F6'" onblur="this.style.borderColor='#D1D5DB'">
                        </div>
                        <div style="margin-bottom: 28px;">
                            <label style="display: block; font-size: 15px; font-weight: 700; color: #111827; margin-bottom: 10px;">Goal Description</label>
                            <textarea id="goal-desc" placeholder="Detail the specific requirements and reasoning for this goal..." rows="4" style="width: 100%; padding: 12px 16px; border: 1px solid #D1D5DB; border-radius: 8px; font-size: 16px; color: #111827; outline: none; transition: border-color 0.2s; box-sizing: border-box; resize: vertical;" onfocus="this.style.borderColor='#3B82F6'" onblur="this.style.borderColor='#D1D5DB'"></textarea>
                        </div>
                        <button type="button" id="goal-save-btn" onclick="window.InsuranceGoalsActions.save()" style="width: 100%; background: #111827; color: white; border: none; padding: 12px 20px; border-radius: 6px; font-size: 14px; font-weight: 600; cursor: pointer; transition: background 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px;" onmouseover="this.style.background='#374151'" onmouseout="this.style.background='#111827'">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                            Save Goal
                        </button>
                    </div>
                </div>

                <!-- Right Column: Saved Goals Grid -->
                <div id="goals-list-container" style="flex: 1 1 500px; display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; align-content: start;">
                    ${goalsListHTML}
                </div>
            </div>
        </div>
    `;
};
