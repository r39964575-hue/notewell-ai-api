#!/usr/bin/env python3
"""
Create a 30-second video of animated shapes representing a puppy and cat playing.
This demonstrates video creation capability using basic Python libraries.
"""

import os
import sys
import math
import random
import subprocess
import tempfile
import shutil
from pathlib import Path

def create_frame(frame_num, total_frames, width=640, height=480):
    """
    Create a simple PPM image frame with animated circles.
    PPM format is simple and doesn't require external libraries.
    """
    # Create header for PPM format (P3 = ASCII RGB)
    ppm_header = f"P3\n{width} {height}\n255\n"
    
    # Calculate time for animation (0 to 30 seconds)
    t = frame_num / (total_frames - 1) * 30
    
    # Create image data
    pixels = []
    for y in range(height):
        row = []
        for x in range(width):
            # Background gradient (sky blue to light green)
            r = int(135 + 40 * math.sin(x/width * math.pi))
            g = int(206 + 30 * math.cos(y/height * math.pi))
            b = int(235 + 20 * math.sin((x+y)/(width+height) * math.pi))
            
            # Puppy (brown circle) - bouncing around
            puppy_x = int(width * 0.3 + width * 0.2 * math.sin(t * 2))
            puppy_y = int(height * 0.5 + height * 0.2 * math.cos(t * 1.5))
            puppy_r = 40
            
            # Cat (gray circle) - chasing the puppy
            cat_x = int(puppy_x + 60 * math.sin(t * 3))
            cat_y = int(puppy_y + 40 * math.cos(t * 2.5))
            cat_r = 35
            
            # Check if pixel is inside puppy
            dx_puppy = x - puppy_x
            dy_puppy = y - puppy_y
            dist_puppy = math.sqrt(dx_puppy*dx_puppy + dy_puppy*dy_puppy)
            
            # Check if pixel is inside cat
            dx_cat = x - cat_x
            dy_cat = y - cat_y
            dist_cat = math.sqrt(dx_cat*dx_cat + dy_cat*dy_cat)
            
            # Draw puppy (brown)
            if dist_puppy < puppy_r:
                # Add some texture
                texture = random.randint(-10, 10)
                r = min(255, max(0, 139 + texture))  # Brown
                g = min(255, max(0, 69 + texture))
                b = min(255, max(0, 19 + texture))
                
                # Add eyes
                if (abs(dx_puppy) < 8 and abs(dy_puppy + 10) < 8) or \
                   (abs(dx_puppy) < 8 and abs(dy_puppy - 10) < 8):
                    r, g, b = 255, 255, 255  # White eyes
                
                # Add nose
                if abs(dx_puppy) < 5 and abs(dy_puppy) < 5:
                    r, g, b = 0, 0, 0  # Black nose
            
            # Draw cat (gray)
            elif dist_cat < cat_r:
                # Add some texture
                texture = random.randint(-15, 15)
                r = min(255, max(0, 128 + texture))  # Gray
                g = min(255, max(0, 128 + texture))
                b = min(255, max(0, 128 + texture))
                
                # Add eyes (slitted)
                if (abs(dx_cat) < 6 and abs(dy_cat + 12) < 3) or \
                   (abs(dx_cat) < 6 and abs(dy_cat - 12) < 3):
                    r, g, b = 0, 255, 0  # Green cat eyes
                
                # Add nose
                if abs(dx_cat) < 4 and abs(dy_cat) < 4:
                    r, g, b = 255, 105, 180  # Pink nose
            
            # Draw a "ball" they're playing with (red)
            ball_x = int(width * 0.7 + width * 0.15 * math.sin(t * 1.8))
            ball_y = int(height * 0.6 + height * 0.15 * math.cos(t * 1.2))
            ball_r = 15
            
            dx_ball = x - ball_x
            dy_ball = y - ball_y
            dist_ball = math.sqrt(dx_ball*dx_ball + dy_ball*dy_ball)
            
            if dist_ball < ball_r:
                r, g, b = 255, 0, 0  # Red ball
            
            row.append(f"{r} {g} {b}")
        pixels.append(" ".join(row))
    
    return ppm_header + "\n".join(pixels)

def create_video():
    """Create a 30-second video at 10 fps (300 frames)"""
    print("Creating 30-second video of puppy and cat playing...")
    
    # Create temporary directory for frames
    temp_dir = tempfile.mkdtemp(prefix="video_frames_")
    print(f"Creating frames in: {temp_dir}")
    
    # Video parameters
    fps = 10
    duration = 30  # seconds
    total_frames = fps * duration
    
    # Create frames
    for frame_num in range(total_frames):
        if frame_num % 30 == 0:  # Progress every 3 seconds
            progress = (frame_num / total_frames) * 100
            print(f"  Creating frame {frame_num}/{total_frames} ({progress:.1f}%)")
        
        frame_content = create_frame(frame_num, total_frames)
        frame_path = os.path.join(temp_dir, f"frame_{frame_num:04d}.ppm")
        
        with open(frame_path, 'w') as f:
            f.write(frame_content)
    
    print("All frames created!")
    
    # Try to create video using FFmpeg if available
    output_video = "puppy_cat_playing.mp4"
    
    # Check for FFmpeg
    ffmpeg_path = shutil.which('ffmpeg')
    if ffmpeg_path:
        print(f"FFmpeg found at: {ffmpeg_path}")
        print("Creating MP4 video...")
        
        try:
            # Use FFmpeg to create video from frames
            cmd = [
                ffmpeg_path,
                '-y',  # Overwrite output file
                '-framerate', str(fps),
                '-i', os.path.join(temp_dir, 'frame_%04d.ppm'),
                '-c:v', 'libx264',
                '-pix_fmt', 'yuv420p',
                '-vf', 'scale=640:480',
                output_video
            ]
            
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✓ Video created successfully: {output_video}")
                
                # Get file size
                if os.path.exists(output_video):
                    size = os.path.getsize(output_video)
                    print(f"  File size: {size / 1024 / 1024:.2f} MB")
                    
                    # Create a simple HTML page to view the video
                    create_html_preview(output_video)
            else:
                print(f"✗ FFmpeg failed: {result.stderr}")
                create_alternative_output(temp_dir, fps)
                
        except Exception as e:
            print(f"✗ Error creating video: {e}")
            create_alternative_output(temp_dir, fps)
    else:
        print("FFmpeg not found. Creating alternative output...")
        create_alternative_output(temp_dir, fps)
    
    # Clean up temporary directory
    try:
        shutil.rmtree(temp_dir)
        print("Cleaned up temporary files")
    except:
        pass
    
    print("\nDone!")

def create_alternative_output(frame_dir, fps):
    """Create alternative output when FFmpeg is not available"""
    print("\nSince FFmpeg is not available, here's what you can do:")
    print(f"1. Frames are saved as PPM files in: {frame_dir}")
    print(f"2. Install FFmpeg and run:")
    print(f"   ffmpeg -framerate {fps} -i {frame_dir}/frame_%04d.ppm -c:v libx264 puppy_cat_playing.mp4")
    print("\nOr use this Python script to create an animated GIF instead:")
    
    # Create a simple script to make GIF
    gif_script = """
import imageio
import os
from pathlib import Path

frames = []
frame_dir = "FRAME_DIR"
for i in range(300):  # 30 seconds at 10 fps
    frame_path = os.path.join(frame_dir, f"frame_{i:04d}.ppm")
    if os.path.exists(frame_path):
        frames.append(imageio.imread(frame_path))

# Save as GIF
imageio.mimsave('puppy_cat_playing.gif', frames, fps=10)
print("GIF created: puppy_cat_playing.gif")
"""
    
    gif_script = gif_script.replace("FRAME_DIR", frame_dir)
    
    gif_file = "create_gif.py"
    with open(gif_file, 'w') as f:
        f.write(gif_script)
    
    print(f"3. Run: python3 {gif_file} (requires 'pip install imageio')")

def create_html_preview(video_file):
    """Create an HTML page to preview the video"""
    html_content = f"""<!DOCTYPE html>
<html>
<head>
    <title>Puppy and Cat Playing - Test Video</title>
    <style>
        body {{
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            background: #f0f0f0;
        }}
        .container {{
            background: white;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }}
        h1 {{
            color: #333;
        }}
        video {{
            width: 100%;
            border-radius: 5px;
            background: #000;
        }}
        .info {{
            margin-top: 20px;
            padding: 15px;
            background: #e8f4f8;
            border-radius: 5px;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>🎬 Puppy and Cat Playing - Test Video</h1>
        <p>30-second animated video created by OpenClaw</p>
        
        <video controls autoplay loop>
            <source src="{video_file}" type="video/mp4">
            Your browser does not support the video tag.
        </video>
        
        <div class="info">
            <h3>Video Details:</h3>
            <ul>
                <li><strong>Duration:</strong> 30 seconds</li>
                <li><strong>Resolution:</strong> 640x480 pixels</li>
                <li><strong>Format:</strong> MP4 (H.264)</li>
                <li><strong>Created:</strong> {os.path.basename(video_file)}</li>
            </ul>
            <p>This video was generated programmatically using Python to demonstrate video creation capabilities.</p>
        </div>
    </div>
</body>
</html>"""
    
    with open("video_preview.html", 'w') as f:
        f.write(html_content)
    
    print(f"  Preview page: video_preview.html")

if __name__ == "__main__":
    print("=" * 60)
    print("OpenClaw Video Creation Test")
    print("Creating 30-second video of puppy and cat playing")
    print("=" * 60)
    
    create_video()