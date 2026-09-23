import zlib
import struct
import os

PUBLIC_DIR = "/Users/bahadirdavdav/Desktop/Gemini Proje/gecici-email/web/public"
os.makedirs(PUBLIC_DIR, exist_ok=True)

def create_png(width, height, render_func):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # filter byte 0 (None)
        for x in range(width):
            r, g, b, a = render_func(x, y, width, height)
            raw_data.extend([r, g, b, a])
    
    compressed = zlib.compress(bytes(raw_data), level=9)
    
    def chunk(tag, data):
        c = tag + data
        crc = struct.pack(">I", zlib.crc32(c) & 0xffffffff)
        return struct.pack(">I", len(data)) + c + crc
    
    ihdr = struct.pack(">IIBBBBB", width, height, 8, 6, 0, 0, 0)
    return b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", compressed) + chunk(b"IEND", b"")

def icon_pixel(x, y, w, h):
    # Normalized coordinates 0.0 to 1.0
    nx = (x + 0.5) / w
    ny = (y + 0.5) / h

    # Outer rounded rectangle (Chassis)
    r_chassis = 0.22
    dx = max(abs(nx - 0.5) - (0.5 - r_chassis), 0)
    dy = max(abs(ny - 0.5) - (0.5 - r_chassis), 0)
    dist_chassis = (dx*dx + dy*dy)**0.5
    if dist_chassis > r_chassis:
        return (0, 0, 0, 0) # Transparent outside corner

    # Inner Keycap (Signal Orange: #ff4e00 -> 255, 78, 0)
    kx = nx - 0.5
    ky = ny - 0.5
    r_key = 0.18
    kdx = max(abs(kx) - (0.38 - r_key), 0)
    kdy = max(abs(ky) - (0.38 - r_key), 0)
    dist_key = (kdx*kdx + kdy*kdy)**0.5

    # Phosphor Green Status LED at top-right: (0.75, 0.25)
    led_dx = nx - 0.76
    led_dy = ny - 0.24
    if led_dx*led_dx + led_dy*led_dy < 0.05*0.05:
        return (0, 255, 102, 255) # Green LED

    if dist_key <= r_key:
        # Check if inside '@' symbol (drawn with concentric geometry)
        # Center circle of '@' at (0.48, 0.52)
        cx = nx - 0.48
        cy = ny - 0.52
        r = (cx*cx + cy*cy)**0.5
        
        # Center dot of '@'
        if r < 0.08:
            return (255, 255, 255, 255)
        
        # Ring of '@'
        if 0.13 <= r <= 0.22:
            # Angle check: open at bottom-right around 30-60 deg
            angle = (360 + (57.2957795 * 3.14159265 + 57.2957795 * -cx)) # simple
            return (255, 255, 255, 255)

        # Outer tail of '@'
        if 0.26 <= r <= 0.33 and not (-0.1 < cx < 0.2 and 0.0 < cy < 0.3):
            return (255, 255, 255, 255)

        # Bottom lip shadow
        if ny > 0.82:
            return (180, 40, 0, 255)

        return (255, 78, 0, 255) # Keycap orange

    # Border
    if dist_chassis > r_chassis - 0.03:
        return (45, 50, 64, 255)

    # Dark chassis #121419
    return (18, 20, 25, 255)

# Generate PNGs
png_32 = create_png(32, 32, icon_pixel)
png_48 = create_png(48, 48, icon_pixel)
png_180 = create_png(180, 180, icon_pixel)

with open(os.path.join(PUBLIC_DIR, "icon-32.png"), "wb") as f:
    f.write(png_32)

with open(os.path.join(PUBLIC_DIR, "apple-touch-icon.png"), "wb") as f:
    f.write(png_180)

# Generate multi-size favicon.ico containing 32x32 and 48x48 PNGs
# ICO Header: 2 images
ico_header = struct.pack("<HHH", 0, 1, 2)
# Offset for first image data: header (6) + 2 * dir_entry (16) = 38
offset_32 = 6 + 16 * 2
offset_48 = offset_32 + len(png_32)

entry_32 = struct.pack("<BBBBHHII", 32, 32, 0, 0, 1, 32, len(png_32), offset_32)
entry_48 = struct.pack("<BBBBHHII", 48, 48, 0, 0, 1, 32, len(png_48), offset_48)

ico_data = ico_header + entry_32 + entry_48 + png_32 + png_48
ico_path = os.path.join(PUBLIC_DIR, "favicon.ico")
with open(ico_path, "wb") as f:
    f.write(ico_data)

# Also write SVG
svg_path = os.path.join(PUBLIC_DIR, "favicon.svg")
with open(svg_path, "w", encoding="utf-8") as f:
    f.write('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <rect x="24" y="24" width="464" height="464" rx="108" fill="#121419" stroke="#2f3442" stroke-width="12"/>
  <rect x="96" y="96" width="320" height="320" rx="76" fill="#ff4e00" stroke="#ff854d" stroke-width="6"/>
  <rect x="96" y="396" width="320" height="20" rx="10" fill="#992900"/>
  <circle cx="376" cy="136" r="16" fill="#00ff66"/>
  <text x="256" y="332" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="220" font-weight="900" fill="#ffffff" text-anchor="middle">@</text>
</svg>''')

print("All icon files created successfully in:", PUBLIC_DIR)
