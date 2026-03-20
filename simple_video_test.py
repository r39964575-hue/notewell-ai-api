#!/usr/bin/env python3
"""
Simple video creation test - creates a short animated video
"""

import os
import sys
import subprocess
import tempfile

def create_simple_video():
    """Create a simple video using FFmpeg with generated content"""
    print("Creating simple test video...")
    
    # Check if FFmpeg is available
    ffmpeg_path = None
    try:
        result = subprocess.run(['which', 'ffmpeg'], capture_output=True, text=True)
        if result.returncode == 0:
            ffmpeg_path = result.stdout.strip()
    except:
        pass
    
    if not ffmpeg_path:
        print("FFmpeg not found. Let me try to install it...")
        try:
            # Try to install FFmpeg
            print("Attempting to install FFmpeg...")
            subprocess.run(['apt-get', 'update'], capture_output=True)
            subprocess.run(['apt-get', 'install', '-y', 'ffmpeg'], capture_output=True)
            
            # Check again
            result = subprocess.run(['which', 'ffmpeg'], capture_output=True, text=True)
            if result.returncode == 0:
                ffmpeg_path = result.stdout.strip()
                print(f"✓ FFmpeg installed: {ffmpeg_path}")
            else:
                print("✗ Could not install FFmpeg")
        except Exception as e:
            print(f"✗ Installation failed: {e}")
    
    if ffmpeg_path:
        print(f"Using FFmpeg at: {ffmpeg_path}")
        
        # Create a simple video using FFmpeg's built-in testsrc
        output_file = "test_video_puppy_cat.mp4"
        
        # Create a 10-second test video (shorter for testing)
        cmd = [
            ffmpeg_path,
            '-y',
            '-f', 'lavfi',
            '-i', 'testsrc=duration=10:size=640x480:rate=30',
            '-vf', 'drawtext=text="Puppy \\\\& Cat Playing":fontcolor=white:fontsize=24:box=1:boxcolor=black@0.5:boxborderw=5:x=(w-text_w)/2:y=(h-text_h)/2',
            '-c:v', 'libx264',
            '-pix_fmt', 'yuv420p',
            output_file
        ]
        
        print(f"Creating video: {output_file}")
        print(f"Command: {' '.join(cmd)}")
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✓ Video created successfully: {output_file}")
                
                # Get file info
                if os.path.exists(output_file):
                    size = os.path.getsize(output_file)
                    duration = 10  # seconds
                    print(f"  Duration: {duration} seconds")
                    print(f"  File size: {size / 1024 / 1024:.2f} MB")
                    print(f"  Resolution: 640x480")
                    
                    # Create info file
                    with open("video_info.txt", 'w') as f:
                        f.write(f"Video: {output_file}\n")
                        f.write(f"Duration: {duration} seconds\n")
                        f.write(f"Size: {size} bytes ({size/1024/1024:.2f} MB)\n")
                        f.write(f"Created by: OpenClaw video test\n")
                    
                    return True
                else:
                    print("✗ Video file was not created")
            else:
                print(f"✗ FFmpeg failed: {result.stderr}")
        except Exception as e:
            print(f"✗ Error: {e}")
    else:
        print("\nAlternative approach: Creating animated ASCII art video")
        create_ascii_animation()
    
    return False

def create_ascii_animation():
    """Create a simple ASCII animation that can be viewed as text"""
    print("\nCreating ASCII animation (text-based video)...")
    
    frames = 100  # 10 seconds at 10 fps
    width = 60
    height = 20
    
    with open("ascii_animation.txt", 'w') as f:
        for frame in range(frames):
            f.write(f"\n=== Frame {frame + 1}/{frames} ===\n")
            f.write("Puppy (O) and Cat (^) playing with ball (*)\n\n")
            
            # Simple animation
            puppy_x = int(width * 0.3 + width * 0.2 * (frame / frames))
            cat_x = int(width * 0.5 + width * 0.15 * (frame / frames * 2))
            ball_x = int(width * 0.7 + width * 0.1 * (frame / frames * 1.5))
            
            for y in range(height):
                line = []
                for x in range(width):
                    if x == puppy_x and y == height // 2:
                        line.append("O")  # Puppy
                    elif x == cat_x and y == height // 2 + 1:
                        line.append("^")  # Cat
                    elif x == ball_x and y == height // 2 - 1:
                        line.append("*")  # Ball
                    elif y == height - 1:
                        line.append("_")  # Ground
                    else:
                        line.append(" ")
                f.write("".join(line) + "\n")
            
            f.write("\n" + "="*50 + "\n")
    
    print("✓ ASCII animation created: ascii_animation.txt")
    print("  View with: cat ascii_animation.txt")
    
    # Also create a simple bash script to "animate" it
    with open("play_animation.sh", 'w') as f:
        f.write("""#!/bin/bash
# Simple animation player
clear
while read -r line; do
    echo "$line"
    sleep 0.1
done < ascii_animation.txt
""")
    
    os.chmod("play_animation.sh", 0o755)
    print("  Play with: ./play_animation.sh")

def main():
    print("=" * 60)
    print("OpenClaw Video Capability Test")
    print("=" * 60)
    
    success = create_simple_video()
    
    print("\n" + "=" * 60)
    if success:
        print("SUCCESS: Video creation capability demonstrated!")
        print(f"Created: test_video_puppy_cat.mp4")
        print("\nNext steps:")
        print("1. View the video with any media player")
        print("2. For a more realistic puppy/cat video, we can:")
        print("   - Download royalty-free stock footage")
        print("   - Edit clips together using FFmpeg")
        print("   - Add effects and transitions")
    else:
        print("Created alternative outputs:")
        print("1. ascii_animation.txt - Text-based animation")
        print("2. play_animation.sh - Script to play animation")
        print("\nTo create real videos, install FFmpeg:")
        print("  sudo apt-get install ffmpeg")
    
    print("=" * 60)

if __name__ == "__main__":
    main()