import { Card } from '../components/Card.js?v=3';
import { PolicyOverview } from '../components/PolicyOverview.js?v=5';
import { RecentActivity } from '../components/RecentActivity.js?v=3';

export const Home = (user, data) => {
    
    const userName = user?.fullName ? user.fullName.split(' ')[0] : (user?.email || 'User');
    
    // Get formatted date like "June 12, 2025"
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const today = new Date().toLocaleDateString('en-US', options);



    return `
        <section class="module-section active" style="max-width: 1400px; margin: 0 auto; padding: 30px 40px 100px 40px; min-height: calc(100vh - 80px); box-sizing: border-box; animation: fadeIn 0.4s ease; background: transparent;">
            
            <style>
                .premium-hover-box > div, 
                .premium-hover-box > section,
                .premium-hover-box .premium-card {
                    border: none !important;
                    box-shadow: none !important;
                    background: transparent !important;
                    margin: 0 !important;
                    padding: 0 !important;
                }
                
                .premium-hover-box {
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.2) 100%);
                    border: 1px solid rgba(255, 255, 255, 0.8);
                    border-radius: 20px;
                    box-shadow: 
                        0 8px 32px rgba(31, 38, 135, 0.05),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.5);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    height: 100%;
                    overflow: hidden;
                    padding: 24px;
                }
                .premium-hover-box:hover {
                    transform: translateY(-4px);
                    box-shadow: 
                        0 12px 40px rgba(31, 38, 135, 0.1),
                        inset 0 0 0 1px rgba(255, 255, 255, 0.8);
                    background: linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.3) 100%);
                }
                @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            </style>

            <div class="premium-wrapper" style="height: 100%; display: flex; flex-direction: column;">
                
                <!-- Top Header matches reference image -->
                <div class="header-section" style="margin-bottom: 32px; display: flex; justify-content: space-between; align-items: flex-end;">
                    <div style="display: flex; flex-direction: column; gap: 4px;">
                        <h1 style="font-size: 28px; font-weight: 800; color: #1F2937; margin: 0; letter-spacing: -0.5px;">Welcome back, ${userName}! 👋</h1>
                        <p style="font-size: 14px; color: #6B7280; margin: 0; font-weight: 500;">Here's what's happening with your insurance today.</p>
                    </div>
                    
                    <!-- Date Button -->
                    <div style="display: flex; align-items: center; gap: 10px; background: #FFFFFF; border: 1px solid #E5E7EB; border-radius: 8px; padding: 8px 16px; font-size: 13px; font-weight: 600; color: #4B5563; box-shadow: 0 2px 10px rgba(0,0,0,0.02);">
                        ${today}
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                    </div>
                </div>

                <!-- 2 Top Summary Cards -->
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; margin-bottom: 24px;">
                    <div class="premium-hover-box">
                        <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px;">
                            <div style="width: 48px; height: 48px; border-radius: 12px; background: #F3E8FF; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><polyline points="9 12 11 14 15 10"></polyline></svg>
                            </div>
                            <div style="flex: 1;">
                                <div style="color: #6B7280; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Total Policies</div>
                                <div style="color: #1F2937; font-size: 28px; font-weight: 800; line-height: 1;">${data?.docs_count || '0'}</div>
                                <div style="color: #9CA3AF; font-size: 12px; font-weight: 500; margin-top: 4px;">All Policies</div>
                            </div>
                        </div>
                        <a href="#" style="color: #6366F1; font-size: 13px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">View all &rarr;</a>
                    </div>
                    
                    <div class="premium-hover-box">
                        <div style="display: flex; align-items: flex-start; gap: 16px; margin-bottom: 20px;">
                            <div style="width: 48px; height: 48px; border-radius: 12px; background: #FEE2E2; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#EF4444" stroke-width="2"><path d="M20.42 4.58a5.4 5.4 0 0 0-7.65 0l-.77.78-.77-.78a5.4 5.4 0 0 0-7.65 0C1.46 6.7 1.33 10.28 4 13l8 8 8-8c2.67-2.72 2.54-6.3.42-8.42z"></path><polyline points="10.5 14.5 12 12.5 14 15.5"></polyline></svg>
                            </div>
                            <div style="flex: 1;">
                                <div style="color: #6B7280; font-size: 13px; font-weight: 600; margin-bottom: 4px;">Insurance Health Score</div>
                                <div style="display: flex; align-items: baseline; gap: 4px;">
                                    <span style="color: #1F2937; font-size: 28px; font-weight: 800; line-height: 1;">${data?.readiness_score || '0'}</span>
                                    <span style="color: #6B7280; font-size: 16px; font-weight: 600;">/100</span>
                                </div>
                                <div style="color: #10B981; font-size: 12px; font-weight: 600; margin-top: 4px; display: flex; align-items: center; gap: 4px;">
                                    <span style="width: 6px; height: 6px; border-radius: 50%; background: #10B981;"></span> Good
                                </div>
                            </div>
                        </div>
                        <a href="#" style="color: #6366F1; font-size: 13px; font-weight: 600; text-decoration: none; display: inline-flex; align-items: center; gap: 4px;">Improve Score &rarr;</a>
                    </div>
                </div>

                <!-- Main Stack Layout -->
                <div style="display: flex; flex-direction: column; gap: 24px;">
                    
                    <div class="premium-hover-box" style="height: auto;">
                        ${PolicyOverview(data?.policy_overview)}
                    </div>
                    
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px;">
                        <!-- Claim Assessment Card -->
                        <div class="premium-hover-box" onclick="handleNavClick('claim-assessment')" style="cursor: pointer;">
                            <div style="display: flex; align-items: flex-start; gap: 16px;">
                                <div style="width: 48px; height: 48px; border-radius: 12px; background: #E0E7FF; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#4F46E5" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                                </div>
                                <div>
                                    <h3 style="font-size: 16px; font-weight: 700; color: #1F2937; margin: 0 0 4px 0;">Claim Assessment</h3>
                                    <p style="font-size: 13px; color: #6B7280; margin: 0; line-height: 1.5;">Intelligent claims analysis and comprehensive report generation based on policy details.</p>
                                </div>
                            </div>
                        </div>

                        <!-- Health Coverage Verification Card -->
                        <div class="premium-hover-box" onclick="handleNavClick('health-coverage-verification')" style="cursor: pointer;">
                            <div style="display: flex; align-items: flex-start; gap: 16px;">
                                <div style="width: 48px; height: 48px; border-radius: 12px; background: #DCFCE7; display: flex; justify-content: center; align-items: center; flex-shrink: 0;">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>
                                </div>
                                <div>
                                    <h3 style="font-size: 16px; font-weight: 700; color: #1F2937; margin: 0 0 4px 0;">Health Coverage Verification</h3>
                                    <p style="font-size: 13px; color: #6B7280; margin: 0; line-height: 1.5;">Verify health procedures and treatments against active policies to determine eligibility.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="premium-hover-box" style="height: auto;">
                        ${RecentActivity(data?.recent_activity)}
                    </div>
                </div>
            </div>
        </section>
    `;
};
