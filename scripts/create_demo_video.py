import os
import sys
import subprocess
from PIL import Image, ImageDraw, ImageFont

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

ARTIFACT_DIR = r"C:\Users\shrea\.gemini\antigravity\brain\4cfca2c4-7887-4bdf-8bed-4f93c274fff3"
FFMPEG = r"node_modules\ffmpeg-static\ffmpeg.exe"
AUDIO_FILE = "demo_voiceover.mp3"
OUTPUT_VIDEO = "racksmith_demo_walkthrough.mp4"

WIDTH, HEIGHT = 1920, 1080

scenes = [
    {
        "image": "01_initial_page.png",
        "duration": 12.0,
        "badge": "SANITY CONTEXT MCP • EURORACK INTELLIGENCE",
        "title": "Meet Racksmith: The Intelligent Eurorack Planner",
        "sub": "Autonomous Planning • Real-Time Sanity Knowledge Lake • Zero Power Overloads"
    },
    {
        "image": "02_ambient_7u.png",
        "duration": 15.0,
        "badge": "DETERMINISTIC VALIDATION • 3D HARDWARE",
        "title": "1. Ambient 7U System (Plaits, Rings, Maths, Clouds)",
        "sub": "Deterministic HP Width & 3-Rail Power (+12V, -12V, +5V) with 80% Inrush Headroom"
    },
    {
        "image": "03_depth_collision.png",
        "duration": 16.0,
        "badge": "CRITICAL HARDWARE PROTECTION • COLLISION ALERT",
        "title": "2. Physical Depth Collision Detection (9.5mm Overrun)",
        "sub": "Doepfer A-110-1 (55mm) vs Palette 62 (45.5mm): Bus Board Collision Highlighted in Red"
    },
    {
        "image": "04_spec_conflict_modal.png",
        "duration": 15.0,
        "badge": "SANITY CONTEXT ENGINE • PROVENANCE",
        "title": "3. Specification Contradictions & Errata Resolution",
        "sub": "Maths 60mA Manual vs 90mA Verified Lab Errata: User Resolves & Persists to Sanity"
    },
    {
        "image": "agent_03_mcp_response.png",
        "duration": 15.0,
        "badge": "MODEL CONTEXT PROTOCOL (MCP) • LIVE WIRE",
        "title": "4. Autonomous AI Agent & Real-Time MCP Protocol",
        "sub": "Protocol Tools: getCase, searchSanityKnowledge, getContradictions, validateRack"
    },
    {
        "image": "06_export_bom_modal.png",
        "duration": 16.3,
        "badge": "PRODUCTION READY • LIVE ON VERCEL",
        "title": "5. Provenance BOM Export & Live Deployment",
        "sub": "Live Demo: https://racksmith.vercel.app • GitHub: Shreyansh00987/Racksmith"
    }
]

def get_font(size, bold=False):
    # Try Windows system fonts
    font_names = ["segoeui.ttf", "segoeuib.ttf", "arial.ttf", "arialbd.ttf"] if not bold else ["segoeuib.ttf", "arialbd.ttf", "segoeui.ttf"]
    for name in font_names:
        p = os.path.join(os.environ.get("WINDIR", "C:\\Windows"), "Fonts", name)
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except Exception:
                pass
    return ImageFont.load_default()

def create_composite_frame(scene, idx):
    img_path = os.path.join(ARTIFACT_DIR, scene["image"])
    orig = Image.open(img_path).convert("RGBA")

    # Create 1080p canvas with dark studio background
    canvas = Image.new("RGBA", (WIDTH, HEIGHT), (11, 13, 18, 255))

    # Scale screenshot to fit upper ~82% of screen
    target_h = int(HEIGHT * 0.84)
    target_w = int(orig.width * (target_h / orig.height))
    if target_w > WIDTH:
        target_w = WIDTH
        target_h = int(orig.height * (target_w / orig.width))
    
    scaled_orig = orig.resize((target_w, target_h), Image.Resampling.LANCZOS)
    pos_x = (WIDTH - target_w) // 2
    pos_y = 12
    canvas.paste(scaled_orig, (pos_x, pos_y))

    # Draw modern lower-third glassmorphic banner
    draw = ImageDraw.Draw(canvas)
    banner_y = HEIGHT - 150
    draw.rectangle([(0, banner_y), (WIDTH, HEIGHT)], fill=(14, 17, 24, 245))
    draw.line([(0, banner_y), (WIDTH, banner_y)], fill=(34, 211, 238, 180), width=3) # Cyan glowing accent line

    # Fonts
    font_badge = get_font(20, bold=True)
    font_title = get_font(34, bold=True)
    font_sub = get_font(22, bold=False)

    # Badge pill
    badge_text = scene["badge"]
    draw.rounded_rectangle([(40, banner_y + 14), (40 + len(badge_text) * 11 + 20, banner_y + 40)], radius=6, fill=(8, 47, 73, 220), outline=(14, 116, 144, 255))
    draw.text((50, banner_y + 16), badge_text, fill=(56, 189, 248, 255), font=font_badge)

    # Title
    draw.text((40, banner_y + 48), scene["title"], fill=(255, 255, 255, 255), font=font_title)

    # Subtitle
    draw.text((40, banner_y + 96), scene["sub"], fill=(156, 163, 175, 255), font=font_sub)

    # Right indicator
    step_str = f"STEP {idx+1}/6  •  RACKSMITH DEMO"
    draw.text((WIDTH - 340, banner_y + 18), step_str, fill=(148, 163, 184, 255), font=font_badge)

    out_frame_path = f"frame_scene_{idx}.png"
    canvas.convert("RGB").save(out_frame_path, quality=95)
    print(f"Generated frame for scene {idx+1}: {out_frame_path}")
    return out_frame_path

def main():
    print("Generating 1080p video frames for all 6 scenes...")
    frame_files = []
    for idx, sc in enumerate(scenes):
        frame_path = create_composite_frame(sc, idx)
        frame_files.append((frame_path, sc["duration"]))

    # Create ffmpeg concat demuxer file
    concat_txt = "concat_list.txt"
    with open(concat_txt, "w", encoding="utf-8") as f:
        for frame_path, dur in frame_files:
            abs_frame = os.path.abspath(frame_path).replace("\\", "/")
            f.write(f"file '{abs_frame}'\n")
            f.write(f"duration {dur}\n")
        # Repeat last file for ffmpeg concat requirement
        last_frame = os.path.abspath(frame_files[-1][0]).replace("\\", "/")
        f.write(f"file '{last_frame}'\n")

    print("Encoding high-definition video with synchronized voiceover...")
    cmd = [
        FFMPEG,
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concat_txt,
        "-i", AUDIO_FILE,
        "-c:v", "libx264",
        "-pix_fmt", "yuv420p",
        "-r", "30",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        OUTPUT_VIDEO
    ]

    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode == 0:
        print(f"Demo Video Successfully Created: {OUTPUT_VIDEO} (Size: {os.path.getsize(OUTPUT_VIDEO) / (1024*1024):.2f} MB)")
        
        # Verify video duration
        probe_cmd = [FFMPEG, "-i", OUTPUT_VIDEO]
        p_res = subprocess.run(probe_cmd, stderr=subprocess.PIPE, text=True)
        import re
        m = re.search(r"Duration: (\d+:\d+:\d+\.\d+)", p_res.stderr)
        if m:
            print("Final Video Duration:", m.group(1))
    else:
        print("Video encoding failed:")
        print(res.stderr[-1000:])

if __name__ == "__main__":
    main()
