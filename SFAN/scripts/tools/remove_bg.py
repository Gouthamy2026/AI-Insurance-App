from PIL import Image

def remove_white_bg(input_path, output_path):
    img = Image.open(input_path)
    img = img.convert("RGBA")
    datas = img.getdata()
    
    new_data = []
    # threshold for considering a pixel "white"
    threshold = 235
    for item in datas:
        # item is (R, G, B, A)
        if item[0] > threshold and item[1] > threshold and item[2] > threshold:
            new_data.append((255, 255, 255, 0))
        else:
            # Optionally blend the alpha to reduce white halo, but let's stick to simple first
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    input_file = r"c:\Users\user\Documents\AI Insurance App\SFAN\frontend\assets\sfan_logo.png"
    output_file = r"c:\Users\user\Documents\AI Insurance App\SFAN\frontend\assets\sfan_logo.png"
    remove_white_bg(input_file, output_file)
    print("Background removed.")
