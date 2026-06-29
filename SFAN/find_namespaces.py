import io
import re
with io.open('frontend/dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()

tags = re.findall(r'<[^>]*id="([^"]*namespace[^"]*)"[^>]*>', text)
print("Namespace IDs:", tags)
