import io
import re

with io.open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Update CSS Variables in :root
new_root = '''
:root {
    /* Premium Insurance Light Theme */
    --bg-dark: #FFFFFF;
    --bg-panel: #FFFFFF;
    
    /* Primary Colors */
    --primary: #FF8A65;
    --primary-hover: #FF7043;
    --accent: #DCC8F4;
    --off-white: #F7E5DD;
    
    /* Semantic Colors */
    --info: #DCC8F4;
    --info-bg: rgba(220, 200, 244, 0.1);
    --success: #198754;
    --success-bg: rgba(25, 135, 84, 0.1);
    --warning: #FFC107;
    --warning-bg: rgba(255, 193, 7, 0.1);
    --danger: #AB2E3C;
    --danger-bg: rgba(171, 46, 60, 0.1);

    /* Text Colors */
    --text-main: #1E1E1E;
    --text-sub: #404040;
    --text-secondary: #5F6368;
    --text-muted: #8B9098;
    
    /* UI Structure */
    --card-border: rgba(255, 255, 255, 0.2);
    --glass-shadow: 0 8px 30px rgba(0,0,0,0.08);
    --gradient-bg: linear-gradient(135deg, #F7E5DD 0%, #F4E4EF 50%, #DCC8F4 100%);
    --gradient-card: #FFFFFF;
    --gradient-accent: #FF8A65;
}
'''
css = re.sub(r':root\s*\{[^}]+\}', new_root.strip(), css, count=1)

# Enforce body text color
css = re.sub(r'body\s*\{[^\}]*\}', 'body {\\n    background: var(--gradient-bg);\\n    color: var(--text-secondary);\\n    font-weight: 400;\\n    min-height: 100vh;\\n    overflow-x: hidden;\\n}', css)

# Replace all headings
css = re.sub(r'h1, h2, h3, h4, h5, h6\s*\{[^}]+\}', 'h1, h2, h3, h4, h5, h6 {\\n    color: var(--text-main);\\n    font-weight: 700;\\n}', css)

# Update cards
card_css = '''
.glass-container,
.glass-panel,
.glass-card {
    background: var(--gradient-card);
    border: 1px solid var(--card-border);
    border-radius: 20px;
    box-shadow: var(--glass-shadow);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;
}
'''
css = re.sub(r'\.glass-container,\s*\.glass-panel,\s*\.glass-card\s*\{[^}]+\}', card_css.strip(), css)

# Update sidebar active state
active_li_css = '''.sidebar ul li.active {
    background: var(--gradient-accent);
    color: white;
    box-shadow: 0 4px 15px rgba(255, 138, 101, 0.2);
}'''
css = re.sub(r'\.sidebar ul li\.active\s*\{[^}]+\}', active_li_css, css)

sidebar_svg_css = '''.sidebar ul li svg {
    stroke: #6B7280;
}
.sidebar ul li.active svg {
    stroke: white;
}'''
css = re.sub(r'\.sidebar ul li\.active svg\s*\{[^}]+\}', '', css) # remove old
if '.sidebar ul li svg' not in css:
    css += '\\n' + sidebar_svg_css + '\\n'

# Update button primary
btn_primary_css = '''.btn-primary {
    background: var(--gradient-accent);
    color: #ffffff;
    border: none;
    padding: 16px 24px;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    width: 100%;
    display: block;
}
.btn-primary:hover {
    background: var(--primary-hover);
}'''
css = re.sub(r'\.btn-primary\s*\{[^}]+\}', btn_primary_css, css)

welcome_btn_css = '''.welcome-v2-btn {
    width: 100%;
    padding: 18px;
    font-size: 1.1rem;
    font-weight: 600;
    color: #ffffff;
    background: var(--gradient-accent);
    border: none;
    border-radius: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    box-shadow: 0 8px 20px rgba(255, 138, 101, 0.25);
}
.welcome-v2-btn:hover {
    background: var(--primary-hover);
}'''
css = re.sub(r'\.welcome-v2-btn\s*\{[^}]+\}', welcome_btn_css, css)

with io.open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)
