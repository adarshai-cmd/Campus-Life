import os
from PIL import Image, ImageDraw

def create_campus_life_icon(size: int, output_path: str):
    # Create high-res image with smooth alpha
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Corner radius
    radius = int(size * 0.22)
    
    # Draw rounded rectangle with Emerald gradient approximation
    # Background: #0D5C46 to #084232
    for y in range(size):
        # Interpolate between Pine (#0D5C46: 13, 92, 70) and Forest (#084232: 8, 66, 50)
        ratio = y / size
        r = int(13 * (1 - ratio) + 8 * ratio)
        g = int(92 * (1 - ratio) + 66 * ratio)
        b = int(70 * (1 - ratio) + 50 * ratio)
        draw.line([(0, y), (size, y)], fill=(r, g, b, 255))
        
    # Create rounded mask
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.rounded_rectangle([(0, 0), (size, size)], radius=radius, fill=255)
    
    # Apply mask
    img.putalpha(mask)
    
    # Draw book & beacon symbol in white & emerald
    draw = ImageDraw.Draw(img)
    scale = size / 192.0
    stroke_w = max(2, int(4.5 * scale))
    
    # Center origin
    cx = size // 2
    cy = size // 2
    
    # Book geometry scaled
    # Left page curve
    lp1 = (cx - int(38 * scale), cy + int(24 * scale))
    lp2 = (cx - int(18 * scale), cy + int(18 * scale))
    lp3 = (cx, cy + int(26 * scale))
    lp_top1 = (cx - int(38 * scale), cy - int(16 * scale))
    lp_top2 = (cx - int(18 * scale), cy - int(22 * scale))
    lp_top3 = (cx, cy - int(14 * scale))
    
    # Right page curve
    rp1 = (cx, cy + int(26 * scale))
    rp2 = (cx + int(18 * scale), cy + int(18 * scale))
    rp3 = (cx + int(38 * scale), cy + int(24 * scale))
    rp_top1 = (cx, cy - int(14 * scale))
    rp_top2 = (cx + int(18 * scale), cy - int(22 * scale))
    rp_top3 = (cx + int(38 * scale), cy - int(16 * scale))
    
    # Draw book outline
    draw.line([lp_top1, lp1], fill=(255, 255, 255, 255), width=stroke_w)
    draw.line([lp1, lp2, lp3], fill=(255, 255, 255, 255), width=stroke_w)
    draw.line([lp_top1, lp_top2, lp_top3], fill=(255, 255, 255, 255), width=stroke_w)
    
    draw.line([rp_top3, rp3], fill=(255, 255, 255, 255), width=stroke_w)
    draw.line([rp1, rp2, rp3], fill=(255, 255, 255, 255), width=stroke_w)
    draw.line([rp_top1, rp_top2, rp_top3], fill=(255, 255, 255, 255), width=stroke_w)
    
    # Center spine
    draw.line([lp_top3, lp3], fill=(255, 255, 255, 255), width=stroke_w)
    
    # Star / Beacon on top in emerald green (#34D399: 52, 211, 153)
    star_top = (cx, cy - int(36 * scale))
    star_right = (cx + int(6 * scale), cy - int(26 * scale))
    star_bottom = (cx, cy - int(22 * scale))
    star_left = (cx - int(6 * scale), cy - int(26 * scale))
    draw.polygon([star_top, star_right, star_bottom, star_left], fill=(52, 211, 153, 255))
    
    # Subtle inner border
    draw.rounded_rectangle([(int(2*scale), int(2*scale)), (size - int(2*scale), size - int(2*scale))], radius=radius, outline=(255, 255, 255, 50), width=int(2*scale))
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    img.save(output_path, 'PNG')
    print(f"Generated icon: {output_path} ({size}x{size})")

if __name__ == '__main__':
    base_dir = '/Users/adarshpandey/Desktop/student/public'
    create_campus_life_icon(192, f'{base_dir}/icons/icon-192.png')
    create_campus_life_icon(512, f'{base_dir}/icons/icon-512.png')
    create_campus_life_icon(180, f'{base_dir}/icons/apple-touch-icon.png')
    create_campus_life_icon(180, f'{base_dir}/apple-touch-icon.png')
    create_campus_life_icon(48, f'{base_dir}/favicon.png')
