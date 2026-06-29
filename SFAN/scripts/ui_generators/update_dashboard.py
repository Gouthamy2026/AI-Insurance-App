import io
import os
import re

# 1. Update style.css for sidebar
with io.open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

sidebar_css = '''.sidebar {
    width: 280px;
    background: rgba(255,255,255,0.75);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-right: 1px solid rgba(255,255,255,0.6);
    padding: 24px;
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: fixed;
    z-index: 100;
}'''
css = re.sub(r'\.sidebar\s*\{[^}]+\}', sidebar_css, css)

active_li_css = '''.sidebar ul li.active {
    background: var(--gradient-accent);
    color: white;
    box-shadow: 0 4px 15px rgba(241,129,95,0.2);
}'''
css = re.sub(r'\.sidebar ul li\.active\s*\{[^}]+\}', active_li_css, css)

# Make sure SVGs inside active li are white
svg_css = '''.sidebar ul li.active svg {
    stroke: white;
}'''
if '.sidebar ul li.active svg' not in css:
    css += '\\n' + svg_css + '\\n'

# Fix the secondary button
btn_sec_css = '''.btn-secondary {
    background: #FFFFFF;
    color: #111215;
    border: 1px solid #E8DCE0;
    padding: 16px 24px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
}'''
css = re.sub(r'\.btn-secondary\s*\{[^}]+\}', btn_sec_css, css)

with io.open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Update dashboard.html
with io.open('dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

nav_replacement = '''                <li class="nav-header">Intelligence</li>
                <li data-target="claim-outcome"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg> Claim Outcome Analyzer</li>
                <li data-target="recommendation-engine"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg> Recommendation Engine</li>
                <li data-target="scam-detector"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"></path></svg> Scam Detector</li>
                <li data-target="ai-assistant"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> Insurance AI Assistant</li>
                <li data-target="irdai-rights"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> IRDAI Rights Assistant</li>'''

html = re.sub(r'<li class="nav-header">Intelligence</li>.*?<li data-target="medical-inflation">.*?</li>', nav_replacement, html, flags=re.DOTALL)

# Update section headers (quick and dirty replace for the placeholder ones)
html = html.replace('id="premium-benefit"', 'id="recommendation-engine"')
html = html.replace('<h2>Premium vs Benefit Analysis</h2>', '<h2>Insurance Recommendation Engine</h2>')

html = html.replace('id="policy-simplifier"', 'id="ai-assistant"')
html = html.replace('<h2>Policy Simplifier</h2>', '<h2>Insurance AI Assistant</h2>')

html = html.replace('id="risk-detector"', 'id="irdai-rights"')
html = html.replace('<h2>Risk Detector</h2>', '<h2>IRDAI Rights Assistant</h2>')

with io.open('dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
