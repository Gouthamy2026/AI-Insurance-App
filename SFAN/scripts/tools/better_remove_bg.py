from PIL import Image, ImageDraw

def remove_bg_floodfill(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Create an RGB copy for floodfill mask
    rgb_img = img.convert("RGB")
    
    # Floodfill from the top-left corner (0,0) replacing background with magenta (255, 0, 255)
    # thresh=30 allows it to capture slightly off-white pixels
    ImageDraw.floodfill(rgb_img, xy=(0, 0), value=(255, 0, 255), thresh=30)
    
    datas = img.getdata()
    mask_datas = rgb_img.getdata()
    
    new_data = []
    for i in range(len(datas)):
        # If the mask pixel is magenta, it means it was part of the background
        if mask_datas[i] == (255, 0, 255):
            new_data.append((255, 255, 255, 0)) # Make transparent
        else:
            new_data.append(datas[i]) # Keep original pixel
            
    img.putdata(new_data)
    img.save(output_path, "PNG")

if __name__ == "__main__":
    input_file = r"c:\Users\user\Documents\AI Insurance App\SFAN\sfan_logo.png"
    output_file = r"c:\Users\user\Documents\AI Insurance App\SFAN\frontend\assets\sfan_logo.png"
    remove_bg_floodfill(input_file, output_file)
    print("Background successfully removed using improved method.")
