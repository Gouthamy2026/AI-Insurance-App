import os
import re

html_files = ['dashboard_broker.html', 'dashboard_individual.html', 'dashboard_policyholder.html']
for f in html_files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        content = re.sub(r'(\.js\?v=)\d+', r'\g<1>99', content)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)

js_files = ['dashboard/main_broker.js', 'dashboard/main_individual.js', 'dashboard/main_policyholder.js']
for f in js_files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        content = re.sub(r'(\.js\?v=)\d+', r'\g<1>99', content)
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
