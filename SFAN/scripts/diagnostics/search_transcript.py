import json

paths = [
    r"C:\Users\user\.gemini\antigravity-ide\brain\f47d664b-dea5-4da6-bea1-f07569fe0ed2\.system_generated\logs\transcript.jsonl",
    r"C:\Users\user\.gemini\antigravity-ide\brain\d7fe6c08-e14a-4842-8b83-35cfee553511\.system_generated\logs\transcript.jsonl"
]

for path in paths:
    print(f"Searching {path}...")
    try:
        with open(path, "r", encoding="utf-8") as f:
            for i, line in enumerate(f):
                if "termination" in line.lower() and "error" in line.lower():
                    print(f"[{i}] {line[:300]}")
    except Exception as e:
        print(f"Error reading {path}: {e}")
