import io

with io.open('dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Replace hardcoded blue SVG strokes with var(--primary)
html = html.replace('#4f46e5', 'var(--primary)')

# Replace color: var(--info) with color: var(--primary) for better readability
html = html.replace('color: var(--info)', 'color: var(--primary)')

# Replace stroke="var(--info)" with stroke="var(--primary)"
html = html.replace('stroke="var(--info)"', 'stroke="var(--primary)"')

with io.open('dashboard.html', 'w', encoding='utf-8') as f:
    f.write(html)
