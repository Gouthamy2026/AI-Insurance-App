import io
import re
import os

with io.open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Make sidebar pure white with subtle shadow
sidebar_css = '''.sidebar {
    width: 280px;
    background: #FFFFFF;
    border-right: 1px solid rgba(255,255,255,0.2);
    box-shadow: 0 4px 20px rgba(0,0,0,0.05);
    padding: 24px;
    display: flex;
    flex-direction: column;
    height: 100vh;
    position: fixed;
    z-index: 100;
}'''
css = re.sub(r'\.sidebar\s*\{[^}]+\}', sidebar_css, css)

with io.open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

# Update HTML Files inline colors
files = ['index.html', 'welcome.html', 'role.html', 'ready.html', 'dashboard.html']
for file in files:
    if not os.path.exists(file): continue
    with io.open(file, 'r', encoding='utf-8') as f:
        html = f.read()
    
    # Replace old primary/accent colors with new ones
    html = html.replace('#F1815F', '#FF8A65')
    html = html.replace('rgba(241, 129, 95', 'rgba(255, 138, 101')
    html = html.replace('#B69ADE', '#DCC8F4')
    html = html.replace('#111215', '#1E1E1E')
    html = html.replace('#514B52', '#5F6368')
    
    with io.open(file, 'w', encoding='utf-8') as f:
        f.write(html)
