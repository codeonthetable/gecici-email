import os
from PIL import Image, ImageDraw, ImageFont

PUBLIC_DIR = "/Users/bahadirdavdav/Desktop/Gemini Proje/gecici-email/web/public"
os.makedirs(PUBLIC_DIR, exist_ok=True)

# 1. Generate favicon.svg
svg_content = '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#181a22"/>
      <stop offset="100%" stop-color="#0b0c10"/>
    </linearGradient>
    <linearGradient id="btnGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff6a26"/>
      <stop offset="100%" stop-color="#e63e00"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="16" stdDeviation="16" flood-color="#000000" flood-opacity="0.6"/>
    </filter>
  </defs>

  <!-- Chassis Body -->
  <rect x="24" y="24" width="464" height="464" rx="108" fill="url(#bgGrad)" stroke="#2f3442" stroke-width="8"/>
  
  <!-- Screws in 4 corners -->
  <circle cx="68" cy="68" r="8" fill="#3a4052"/>
  <circle cx="444" cy="68" r="8" fill="#3a4052"/>
  <circle cx="68" cy="444" r="8" fill="#3a4052"/>
  <circle cx="444" cy="444" r="8" fill="#3a4052"/>

  <!-- Mechanical Push Keycap -->
  <rect x="96" y="96" width="320" height="320" rx="76" fill="url(#btnGrad)" filter="url(#shadow)" stroke="#ff854d" stroke-width="4"/>
  <rect x="96" y="396" width="320" height="20" rx="10" fill="#992900"/>

  <!-- Centered Bold '@' Symbol -->
  <text x="256" y="330" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="220" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="-4">@</text>

  <!-- Phosphor Green Signal LED -->
  <circle cx="376" cy="136" r="16" fill="#00ff66" stroke="#00b347" stroke-width="3"/>
  <circle cx="376" cy="136" r="8" fill="#ffffff" opacity="0.6"/>
</svg>'''

svg_path = os.path.join(PUBLIC_DIR, "favicon.svg")
with open(svg_path, "w", encoding="utf-8") as f:
    f.write(svg_content)
print(f"Generated {svg_path}")

# 2. Render PNGs using Pillow
size = 512
img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Outer Chassis
draw.rounded_rectangle([24, 24, 488, 488], radius=108, fill=(18, 20, 26), outline=(47, 52, 66), width=8)

# Screws
for cx, cy in [(68, 68), (444, 68), (68, 444), (444, 444)]:
    draw.ellipse([cx-8, cy-8, cx+8, cy+8], fill=(58, 64, 82))

# Mechanical Keycap
draw.rounded_rectangle([96, 96, 416, 416], radius=76, fill=(255, 78, 0), outline=(255, 133, 77), width=4)
draw.rounded_rectangle([96, 396, 416, 416], radius=10, fill=(153, 41, 0))

# Try loading font or draw crisp '@'
try:
    font = ImageFont.truetype("/System/Library/Fonts/SFNS.ttf", 220)
except Exception:
    try:
        font = ImageFont.truetype("/Library/Fonts/Arial.ttf", 200)
    except Exception:
        font = ImageFont.load_default()

bbox = draw.textbbox((0, 0), "@", font=font)
w = bbox[2] - bbox[0]
h = bbox[3] - bbox[1]
draw.text((256 - w/2, 245 - h/2), "@", fill=(255, 255, 255), font=font)

# LED
draw.ellipse([360, 120, 392, 152], fill=(0, 255, 102), outline=(0, 179, 71), width=3)
draw.ellipse([372, 132, 380, 140], fill=(255, 255, 255))

# Save 512x512 master
master_png = os.path.join(PUBLIC_DIR, "icon-512.png")
img.save(master_png, "PNG")

# Save apple-touch-icon.png (180x180)
apple_icon = img.resize((180, 180), Image.Resampling.LANCZOS)
apple_icon.save(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), "PNG")

# Save multi-size favicon.ico (16, 32, 48, 64)
ico_sizes = [(16, 16), (32, 32), (48, 48), (64, 64)]
img.save(os.path.join(PUBLIC_DIR, "favicon.ico"), format="ICO", sizes=ico_sizes)
print("Generated favicon.ico and apple-touch-icon.png successfully!")
