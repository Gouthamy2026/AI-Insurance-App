import io
import re
with io.open('frontend/dashboard.html', 'r', encoding='utf-8') as f:
    text = f.read()
selects = re.findall(r'<select[^>]*id="([^"]+)"[^>]*>', text)
print("Select IDs:", selects)
