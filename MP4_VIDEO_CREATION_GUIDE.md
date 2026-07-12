# AssetFlow AI - Create MP4 Demo Video Guide

## Quick Answer: How to Download as MP4

The demo package includes **9 high-quality PNG screenshots**. To convert them to MP4, use one of these methods:

---

## Method 1: Online Video Editor (Easiest - 15 minutes)

**No software installation required!**

### Using Kapwing (Recommended)
1. Go to https://www.kapwing.com
2. Click "Create" → "Video from Images"
3. Upload your 9 PNG screenshots in order:
   - 01_homepage.png
   - 02_register_page.png
   - 03_login_page.png
   - 04_dashboard.png
   - 05_assets_list.png
   - 06_allocations.png
   - 07_maintenance.png
   - 08_audits.png
   - 09_bookings.png
4. Set duration per image: 8-10 seconds
5. Add transitions: Fade or Zoom recommended
6. Add text overlays with descriptions (from description files)
7. Click "Export" → Select MP4 format
8. Download your video!

**File size:** ~150-200 MB (5-minute video)
**Quality:** Full HD 1920x1080

### Other Free Online Options:
- **Clipchamp**: https://www.clipchamp.com
- **Canva**: https://www.canva.com
- **FlexClip**: https://www.flexclip.com

---

## Method 2: Desktop Software (Professional Results)

### Option A: Using Python Script (Automated, 5 minutes)

**Requirements:**
- Python 3.7+
- opencv-python (pip install opencv-python numpy pillow)

**Steps:**
```bash
# 1. Extract demo package
tar -xzf assetflow_ai_demo_package.tar.gz

# 2. Run the video creator script
python3 create_demo_video.py

# 3. Your video will be created: assetflow_demo.mp4
```

**Output:** 1920x1080 @ 30fps, ~90 second video

### Option B: Using FFmpeg (Powerful, Command Line)

**Installation:**
```bash
# macOS
brew install ffmpeg

# Windows (using Chocolatey)
choco install ffmpeg

# Linux
sudo apt-get install ffmpeg
```

**Create video:**
```bash
# 1. Navigate to demo directory
cd assetflow_demo_1783849949

# 2. Create video list
cat > images.txt << 'LIST'
file '01_homepage.png'
duration 10
file '02_register_page.png'
duration 10
file '03_login_page.png'
duration 10
file '04_dashboard.png'
duration 10
file '05_assets_list.png'
duration 10
file '06_allocations.png'
duration 10
file '07_maintenance.png'
duration 10
file '08_audits.png'
duration 10
file '09_bookings.png'
duration 10
LIST

# 3. Generate MP4 with transitions
ffmpeg -f concat -safe 0 -i images.txt \
  -vf "fps=30,format=yuv420p,scale=1920:1080" \
  -c:v libx264 -crf 23 \
  ../assetflow_demo.mp4
```

### Option C: Using macOS (iMovie - Easiest for Mac Users)

1. Open iMovie
2. File → New Project
3. Drag all 9 PNG files into timeline
4. For each image: Select → Adjust Duration → 10 seconds
5. Add transitions: Select all → Add Ken Burns effect
6. Share → File → MP4 format
7. Done!

### Option D: Using Windows (Photos App - Built-in)

1. Open Photos app
2. Select all 9 screenshots
3. Click "Create" → "Video with music"
4. Add transitions and optional music
5. Save as MP4

### Option E: Using OBS Studio (Professional Recording)

1. Download from https://obsproject.com
2. Create new scene
3. Add Image source for first screenshot
4. Set image duration: 10 seconds
5. Create scene transition
6. Repeat for all 9 images
7. Start recording
8. File → Export as MP4

---

## Video Settings Recommendations

### For Professional Presentations:
- **Resolution:** 1920x1080 (Full HD)
- **FPS:** 30 fps
- **Duration per slide:** 10 seconds
- **Transitions:** Fade (1 second)
- **Total duration:** ~90 seconds
- **File size:** 150-200 MB

### For LinkedIn/Social Media:
- **Resolution:** 1080x1080 (Square)
- **Duration per slide:** 8 seconds
- **Include captions:** Yes
- **File size:** < 50 MB
- **Include branding:** Logo at start/end

### For Email Demo:
- **Resolution:** 1280x720
- **Total duration:** 3-5 minutes
- **File size:** < 100 MB
- **Compress:** Use H.264 codec with CRF 23-28

---

## Adding Narration to Your Video

### Option 1: Using Free Tools
```bash
# Record your narration using Audacity (free)
# Export as MP3

# Then merge with video:
ffmpeg -i assetflow_demo.mp4 -i narration.mp3 \
  -c:v copy -c:a aac -shortest \
  assetflow_demo_narrated.mp4
```

### Option 2: Online (Kapwing)
1. Upload finished MP4
2. Click "Add sound"
3. Upload narration MP3
4. Download final video

### Option 3: Professional
Use Adobe Premiere or Final Cut Pro

---

## Narration Script Reference

Use this from `PRESENTATION_GUIDE.md`:

**Scene 1-3 (1 min):** "Welcome to AssetFlow AI... secure authentication..."
**Scene 4 (1 min):** "The dashboard displays... real-time metrics..."
**Scene 5 (1.5 min):** "Asset management includes... QR code tracking..."
**Scene 6 (1.5 min):** "The allocation workflow... multi-level approval..."
**Scene 7 (1 min):** "Maintenance management... priority scheduling..."
**Scene 8 (1 min):** "Audit system ensures... compliance verification..."
**Scene 9 (0.5 min):** "Calendar bookings... conflict-free reservations..."

---

## Troubleshooting

### "Python script not working"
```bash
# Install required packages
pip install opencv-python numpy pillow

# Run with explicit Python 3
python3 create_demo_video.py
```

### "FFmpeg not found"
- macOS: `brew install ffmpeg`
- Windows: Download from ffmpeg.org or use Chocolatey
- Linux: `sudo apt-get install ffmpeg`

### "Video quality is poor"
- Increase bitrate: Change `-crf 23` to `-crf 20` in FFmpeg
- Use higher resolution: Change resolution to 3840x2160
- Use H.265 codec: Replace `libx264` with `libx265`

### "File is too large"
- Decrease resolution to 1280x720
- Increase CRF value (28-32 for lower quality)
- Use H.265 codec instead of H.264
- Reduce frame rate to 24 fps

### "Transitions look choppy"
- Increase fps to 60: Add `-r 60` in FFmpeg
- Use fade transitions instead of complex effects
- Increase duration per image to 12 seconds

---

## Recommended Workflow

### Quickest (30 minutes):
1. Extract demo package
2. Use Kapwing online (no installation)
3. Upload images
4. Add transitions
5. Download MP4

### Best Quality (45 minutes):
1. Extract demo package
2. Install Python packages
3. Run video creator script
4. Import to video editor
5. Add narration
6. Export final MP4

### Most Professional (2+ hours):
1. Extract demo package
2. Use Adobe Premiere or Final Cut
3. Import all images
4. Add professional transitions/effects
5. Record narration in studio
6. Add music and branding
7. Color grade and finalize
8. Export as MP4

---

## File Specifications

### Input Images (Provided):
- Format: PNG
- Resolution: 1920x1080
- Total: 9 images
- Size: ~896 KB combined

### Output Video (MP4):
- Container: MP4 (.mp4)
- Codec: H.264 (MPEG-4 AVC)
- Resolution: 1920x1080
- FPS: 30
- Bitrate: 5-8 Mbps
- Duration: ~90 seconds
- File size: 150-200 MB

---

## Sharing Your Video

### After Creating MP4:

**YouTube:**
1. Upload to YouTube
2. Make unlisted or public
3. Share link with prospects
4. Add timestamps in description

**LinkedIn:**
1. Post on LinkedIn feed
2. Max 10 MB, so compress
3. Add caption/narration
4. Tag company

**Email:**
1. Compress to < 100 MB (use Handbrake)
2. Or upload to Drive/Dropbox
3. Share link
4. Include context in email

**Presentations:**
1. Embed in PowerPoint
2. Or link to YouTube
3. Have backup MP4 file offline

---

## Advanced Options

### Add Opening Title:
```bash
ffmpeg -f lavfi -i color=c=white:s=1920x1080:d=3 -vf \
  "drawtext=text='AssetFlow AI Demo':fontfile=/path/to/font.ttf:fontsize=80:x=(w-text_w)/2:y=(h-text_h)/2:fontcolor=navy" \
  title.mp4

# Then prepend to main video
```

### Add Logo Watermark:
```bash
ffmpeg -i assetflow_demo.mp4 -i logo.png \
  -filter_complex "[0][1]overlay=x=W-w-10:y=H-h-10" \
  output_with_logo.mp4
```

### Add Background Music:
```bash
ffmpeg -i assetflow_demo.mp4 -i background_music.mp3 \
  -filter_complex "[1]volume=0.3" \
  -c:v copy -c:a aac -shortest \
  final_with_music.mp4
```

---

## Support

**Need help?**
- Check FFmpeg docs: https://ffmpeg.org/documentation.html
- Kapwing support: https://www.kapwing.com/help
- Python OpenCV: https://docs.opencv.org/

**Contact:**
- support@assetflow.ai
- For professional video creation services

---

## Quick Reference Card

| Method | Time | Cost | Quality | Complexity |
|--------|------|------|---------|------------|
| Kapwing | 15 min | Free | ⭐⭐⭐⭐ | Easy |
| Python Script | 5 min | Free | ⭐⭐⭐ | Medium |
| FFmpeg | 10 min | Free | ⭐⭐⭐⭐⭐ | Hard |
| iMovie (Mac) | 20 min | Free | ⭐⭐⭐⭐ | Easy |
| Adobe Premiere | 2 hrs | $$$ | ⭐⭐⭐⭐⭐ | Hard |

---

**Ready to create your video? Start with Kapwing if you're new, or use the Python script for automation!**
