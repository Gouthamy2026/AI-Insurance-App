import sys

path = r"c:\Users\user\Documents\AI Insurance App\SFAN\frontend\css\style.css"
try:
    with open(path, "rb") as f:
        content = f.read()
    
    # It might be mixed utf-8 and utf-16. 
    # Let's decode it safely. If there are null bytes, it's a sign of UTF-16
    content_str = content.decode("utf-8", errors="replace")
    
    # Clean up null bytes if Add-Content messed it up
    content_str = content_str.replace('\x00', '')
    
    with open(path, "w", encoding="utf-8") as f:
        f.write(content_str)
    print("Fixed CSS encoding.")
except Exception as e:
    print("Error:", e)
