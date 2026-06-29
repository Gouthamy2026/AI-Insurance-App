import io
import re

# 1. Clean dashboard.html
with io.open('dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()
# Remove inline border-top: 4px solid ...
html = re.sub(r'border-top:\s*4px\s*solid\s*[^;\"\']+[;]?', '', html)
with io.open('dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)

# 2. Clean app.js
with io.open('js/app.js', 'r', encoding='utf-8') as f:
    js = f.read()
js = re.sub(r'border-top:\s*4px\s*solid\s*[^;\"\']+[;]?', '', js)
with io.open('js/app.js', 'w', encoding='utf-8') as f:
    f.write(js)

# 3. Clean style.css
with io.open('css/style.css', 'r', encoding='utf-8') as f:
    css = f.read()
css = re.sub(r'border-top:\s*4px\s*solid\s*[^;\"\']+[;]?', '', css)

# Update .glass-card in css
new_glass = r'''
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.95), rgba(248, 249, 250, 0.6));
    border: 1px solid rgba(255, 255, 255, 0.8);
    border-radius: 20px;
    box-shadow: 0 8px 32px rgba(31, 38, 135, 0.04);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, background 0.3s ease;
'''

css = re.sub(r'\.glass-container,\s*\.glass-panel,\s*\.glass-card\s*\{[^}]+\}',
             '.glass-container,\n.glass-panel,\n.glass-card {\n' + new_glass + '\n}', css)

# Update hover
hover_glass = r'''
.glass-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 28px rgba(31, 38, 135, 0.08);
    background: linear-gradient(135deg, rgba(255, 255, 255, 1), rgba(248, 249, 250, 0.8));
    border: 1px solid rgba(255, 255, 255, 1);
}
'''
css = re.sub(r'\.glass-card:hover\s*\{[^}]+\}', hover_glass, css)

with io.open('css/style.css', 'w', encoding='utf-8') as f:
    f.write(css)

print('Successfully removed all hard borders and applied light gradients!')
