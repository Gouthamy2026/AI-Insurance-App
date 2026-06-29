import sys
from PIL import Image

img_path = r"C:\Users\user\.gemini\antigravity-ide\brain\237074dd-0247-4a62-bf72-4bc9020e07dc\media__1780902808617.png"
try:
    img = Image.open(img_path)
    print(f"Image size: {img.size}")
except Exception as e:
    print(f"Error opening image: {e}")
