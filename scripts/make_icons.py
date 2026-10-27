from PIL import Image
import io
import base64
import os

source_path = 'C:/Users/me/.gemini/antigravity-ide/brain/d39d622b-6973-4635-891a-1163682f79a8/.user_uploaded/media_1793096841526.png'
raw_logo = Image.open(source_path).convert('RGBA')

# Find true content bounding box (alpha > 10)
r, g, b, a = raw_logo.split()
bbox = a.point(lambda p: 255 if p > 10 else 0).getbbox()
print('Crop bbox:', bbox)
cropped = raw_logo.crop(bbox)
cw, ch = cropped.size
print('Cropped size:', cw, ch)

# 1. Clean Logo (Square padded with 6% border, transparent)
max_dim = max(cw, ch)
logo_pad = int(max_dim * 1.08)
clean_logo = Image.new('RGBA', (logo_pad, logo_pad), (0, 0, 0, 0))
clean_logo.paste(cropped, ((logo_pad - cw) // 2, (logo_pad - ch) // 2), cropped)
clean_logo = clean_logo.resize((1024, 1024), Image.Resampling.LANCZOS)
clean_logo.save('assets/logo.png', 'PNG')
print('assets/logo.png updated')

# 2. Splash Icon (Centered logo at ~720px on 1024x1024 transparent for optimal splash visibility)
splash_target_size = 720
splash_scaled = cropped.resize((int(cw * (splash_target_size / ch)), splash_target_size), Image.Resampling.LANCZOS)
splash_canvas = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
sw, sh = splash_scaled.size
splash_canvas.paste(splash_scaled, ((1024 - sw) // 2, (1024 - sh) // 2), splash_scaled)
splash_canvas.save('assets/splash-icon.png', 'PNG')
print('assets/splash-icon.png updated with 720px logo')

# 3. Android Adaptive Icon (Safe zone ~580px)
adaptive_target_size = 580
adaptive_scaled = cropped.resize((int(cw * (adaptive_target_size / ch)), adaptive_target_size), Image.Resampling.LANCZOS)
adaptive_canvas = Image.new('RGBA', (1024, 1024), (0, 0, 0, 0))
aw, ah = adaptive_scaled.size
adaptive_canvas.paste(adaptive_scaled, ((1024 - aw) // 2, (1024 - ah) // 2), adaptive_scaled)
adaptive_canvas.save('assets/adaptive-icon.png', 'PNG')
print('assets/adaptive-icon.png updated')

# 4. App Launcher Icon (1024x1024 on #020617 background, logo size 780px)
icon_target_size = 780
icon_scaled = cropped.resize((int(cw * (icon_target_size / ch)), icon_target_size), Image.Resampling.LANCZOS)
icon_canvas = Image.new('RGBA', (1024, 1024), (2, 6, 23, 255))
iw, ih = icon_scaled.size
icon_canvas.paste(icon_scaled, ((1024 - iw) // 2, (1024 - ih) // 2), icon_scaled)
icon_canvas.save('assets/icon.png', 'PNG')
print('assets/icon.png updated')

# 5. Favicon (64x64)
fav_target_size = 56
fav_scaled = cropped.resize((fav_target_size, fav_target_size), Image.Resampling.LANCZOS)
fav_canvas = Image.new('RGBA', (64, 64), (0, 0, 0, 0))
fav_canvas.paste(fav_scaled, ((64 - fav_target_size) // 2, (64 - fav_target_size) // 2), fav_scaled)
fav_canvas.save('assets/favicon.png', 'PNG')
print('assets/favicon.png updated')

# 6. Generate Base64 for PDF Report
buffer = io.BytesIO()
pdf_logo = clean_logo.resize((256, 256), Image.Resampling.LANCZOS)
pdf_logo.save(buffer, format='PNG')
b64_str = base64.b64encode(buffer.getvalue()).decode('utf-8')
with open('src/utils/logoBase64.ts', 'w', encoding='utf-8') as f:
    f.write('export const LOGO_BASE64 = "data:image/png;base64,' + b64_str + '";\n')
print('src/utils/logoBase64.ts updated')
