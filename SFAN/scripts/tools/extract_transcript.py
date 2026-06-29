import json

transcript_path = r"C:\Users\user\.gemini\antigravity-ide\brain\d7fe6c08-e14a-4842-8b83-35cfee553511\.system_generated\logs\transcript.jsonl"
with open(transcript_path, 'r', encoding='utf-8') as f:
    for line in f:
        if 'multi_replace_file_content' in line and 'Remove Claim Outcome Analyzer from frontend HTML' in line:
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            for call in tool_calls:
                if call["name"] == "multi_replace_file_content":
                    args = call.get("args", {})
                    chunks_str = args.get("ReplacementChunks", "[]")
                    if isinstance(chunks_str, str):
                        chunks = json.loads(chunks_str)
                    else:
                        chunks = chunks_str
                    for i, chunk in enumerate(chunks):
                        print("--- Chunk " + str(i) + " ---")
                        print(chunk.get("TargetContent", ""))
        
        if 'multi_replace_file_content' in line and 'Remove claim outcome logic from app.js' in line:
            data = json.loads(line)
            tool_calls = data.get("tool_calls", [])
            for call in tool_calls:
                if call["name"] == "multi_replace_file_content":
                    args = call.get("args", {})
                    chunks_str = args.get("ReplacementChunks", "[]")
                    if isinstance(chunks_str, str):
                        chunks = json.loads(chunks_str)
                    else:
                        chunks = chunks_str
                    for i, chunk in enumerate(chunks):
                        print("--- APP JS Chunk " + str(i) + " ---")
                        print(chunk.get("TargetContent", ""))
