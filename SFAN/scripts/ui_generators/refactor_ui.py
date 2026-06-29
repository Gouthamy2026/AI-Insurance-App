import io
import os
import re

# 1. Update style.css
with io.open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

new_root = '''
:root {
    /* Premium SaaS Light Theme */
    --bg-dark: #FFFFFF;
    --bg-panel: #FFFFFF;
    
    /* Primary Colors */
    --primary: #F1815F;
    --primary-hover: #F49776;
    --accent: #B69ADE;
    --off-white: #F6E9EB;
    
    /* Semantic Colors */
    --info: #B69ADE;
    --info-bg: rgba(182, 154, 222, 0.1);
    --success: #198754;
    --success-bg: rgba(25, 135, 84, 0.1);
    --warning: #FFC107;
    --warning-bg: rgba(255, 193, 7, 0.1);
    --danger: #AB2E3C;
    --danger-bg: rgba(171, 46, 60, 0.1);

    /* Text Colors */
    --text-main: #111215;
    --text-secondary: #514B52;
    --text-muted: #8D8691;
    
    /* UI Structure */
    --card-border: rgba(255,255,255,0.6);
    --glass-shadow: 0 8px 30px rgba(0,0,0,0.06);
    --gradient-bg: linear-gradient(135deg, #F6E9EB 0%, #F9F2F4 35%, #F3EDF8 70%, #FFFFFF 100%);
    --gradient-card: rgba(255, 255, 255, 0.85);
    --gradient-accent: linear-gradient(135deg, #F1815F, #F49776);
}
'''
css = re.sub(r':root\s*\{[^}]+\}', new_root.strip(), css, count=1)

# Typography
css = css.replace("font-family: 'HK Grotesk', 'Hanken Grotesk', sans-serif;", "font-family: 'Inter', sans-serif;")

# Fix role item inputs
role_css = '''.role-v2-item {
    position: relative;
    display: flex;
    align-items: center;
    padding: 20px;
    background: rgba(255,255,255,0.85);
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;
}'''
css = re.sub(r'\.role-v2-item\s*\{[^}]+\}', role_css, css)

role_hover_css = '''.role-v2-item:hover {
    transform: scale(1.02) translateY(-4px);
    box-shadow: 0 15px 35px rgba(241,129,95,0.15), 0 0 20px rgba(241,129,95,0.1);
    border-color: #F1815F;
}'''
css = re.sub(r'\.role-v2-item:hover\s*\{[^}]+\}', role_hover_css, css)

with io.open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# 2. Update HTML Files Font and specific colors
files = ['index.html', 'welcome.html', 'role.html', 'ready.html', 'dashboard.html']
for file in files:
    if not os.path.exists(file): continue
    with io.open(file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Fonts
    html = html.replace('family=Hanken+Grotesk:wght@400;500;600;700;800', 'family=Inter:wght@400;500;600;700;800')
    html = html.replace('family=Inter:wght@300;400;600;700', 'family=Inter:wght@400;500;600;700;800')
    
    # Replace old orange and lavender
    html = html.replace('#ff7b56', '#F1815F')
    html = html.replace('#c19be9', '#B69ADE')
    html = html.replace('rgba(255, 123, 86', 'rgba(241, 129, 95')
    
    with io.open(file, 'w', encoding='utf-8') as f:
        f.write(html)
