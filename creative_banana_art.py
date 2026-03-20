#!/usr/bin/env python3
"""
Creative Banana Art Generator
A fun alternative to Gemini API that creates banana-themed art using PIL.
"""

import argparse
import os
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import random
import math

def create_banana_art(prompt, filename, resolution="1K"):
    """Create banana-themed art based on the prompt."""
    
    # Map resolution to dimensions
    resolution_map = {
        "1K": (1024, 1024),
        "2K": (2048, 2048),
        "4K": (4096, 4096)
    }
    
    width, height = resolution_map.get(resolution, (1024, 1024))
    
    # Create a new image with a gradient background
    image = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(image)
    
    # Create a gradient background
    for y in range(height):
        # Yellow gradient from top to bottom
        r = int(255 * (1 - y/height * 0.3))
        g = int(255 * (1 - y/height * 0.1))
        b = int(50 * (1 - y/height * 0.5))
        draw.line([(0, y), (width, y)], fill=(r, g, b))
    
    # Draw banana shapes based on the prompt
    prompt_lower = prompt.lower()
    
    if any(word in prompt_lower for word in ['banana', 'fruit', 'yellow']):
        # Draw bananas
        for i in range(random.randint(3, 8)):
            x = random.randint(100, width - 100)
            y = random.randint(100, height - 100)
            size = random.randint(50, 150)
            
            # Draw banana shape (ellipse with curve)
            draw.ellipse([x, y, x + size, y + size//3], fill='yellow', outline='brown', width=3)
            
            # Add stem
            draw.line([x + size//2, y, x + size//2, y - 20], fill='green', width=5)
    
    if any(word in prompt_lower for word in ['monkey', 'ape', 'primate']):
        # Draw monkey face
        monkey_x = width // 2
        monkey_y = height // 2
        monkey_size = 200
        
        # Face
        draw.ellipse([monkey_x - monkey_size, monkey_y - monkey_size, 
                     monkey_x + monkey_size, monkey_y + monkey_size], 
                    fill='brown', outline='black', width=3)
        
        # Eyes
        eye_size = 30
        draw.ellipse([monkey_x - 50 - eye_size, monkey_y - 30 - eye_size,
                     monkey_x - 50 + eye_size, monkey_y - 30 + eye_size], 
                    fill='white')
        draw.ellipse([monkey_x + 50 - eye_size, monkey_y - 30 - eye_size,
                     monkey_x + 50 + eye_size, monkey_y - 30 + eye_size], 
                    fill='white')
        
        # Pupils
        draw.ellipse([monkey_x - 50 - 10, monkey_y - 30 - 10,
                     monkey_x - 50 + 10, monkey_y - 30 + 10], 
                    fill='black')
        draw.ellipse([monkey_x + 50 - 10, monkey_y - 30 - 10,
                     monkey_x + 50 + 10, monkey_y - 30 + 10], 
                    fill='black')
        
        # Mouth
        draw.arc([monkey_x - 40, monkey_y + 20, monkey_x + 40, monkey_y + 80],
                 start=0, end=180, fill='black', width=5)
    
    if any(word in prompt_lower for word in ['tropical', 'island', 'beach']):
        # Draw palm trees
        for i in range(random.randint(2, 4)):
            tree_x = random.randint(100, width - 100)
            tree_y = height - 100
            
            # Trunk
            draw.rectangle([tree_x - 10, tree_y - 200, tree_x + 10, tree_y], 
                          fill='brown')
            
            # Leaves
            for angle in range(0, 360, 45):
                rad = math.radians(angle)
                leaf_x = tree_x + int(80 * math.cos(rad))
                leaf_y = tree_y - 200 + int(80 * math.sin(rad))
                
                # Draw leaf shape
                points = []
                for j in range(5):
                    leaf_rad = rad + math.radians(j * 15 - 30)
                    px = leaf_x + int(40 * math.cos(leaf_rad))
                    py = leaf_y + int(40 * math.sin(leaf_rad))
                    points.append((px, py))
                
                draw.polygon(points, fill='green')
    
    if any(word in prompt_lower for word in ['abstract', 'pattern', 'design']):
        # Draw abstract pattern
        for i in range(20):
            x1 = random.randint(0, width)
            y1 = random.randint(0, height)
            x2 = random.randint(0, width)
            y2 = random.randint(0, height)
            
            color = random.choice(['yellow', 'orange', 'green', 'brown'])
            draw.line([(x1, y1), (x2, y2)], fill=color, width=random.randint(2, 8))
            
            # Draw circles at intersections
            draw.ellipse([x1 - 10, y1 - 10, x1 + 10, y1 + 10], 
                        fill=color, outline='black')
            draw.ellipse([x2 - 10, y2 - 10, x2 + 10, y2 + 10], 
                        fill=color, outline='black')
    
    # Add text with the prompt
    try:
        # Try to use a system font
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf", 24)
    except:
        # Fall back to default font
        font = ImageFont.load_default()
    
    # Draw text background
    text_bbox = draw.textbbox((0, 0), f"Prompt: {prompt}", font=font)
    text_width = text_bbox[2] - text_bbox[0]
    text_height = text_bbox[3] - text_bbox[1]
    
    draw.rectangle([10, 10, 20 + text_width, 20 + text_height], 
                  fill='white', outline='black', width=2)
    
    # Draw text
    draw.text((15, 15), f"Prompt: {prompt}", fill='black', font=font)
    
    # Save the image
    output_path = Path(filename)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    
    image.save(str(output_path), 'PNG')
    
    full_path = output_path.resolve()
    print(f"\n🎨 Creative Banana Art saved: {full_path}")
    print(f"📐 Resolution: {resolution} ({width}x{height})")
    print(f"📝 Prompt: {prompt}")
    print(f"MEDIA:{full_path}")
    
    return full_path

def main():
    parser = argparse.ArgumentParser(
        description="Creative Banana Art Generator - Creates banana-themed art without API keys"
    )
    parser.add_argument(
        "--prompt", "-p",
        required=True,
        help="Art description/prompt (banana-themed art will be created)"
    )
    parser.add_argument(
        "--filename", "-f",
        required=True,
        help="Output filename (e.g., banana-art.png)"
    )
    parser.add_argument(
        "--resolution", "-r",
        choices=["1K", "2K", "4K"],
        default="1K",
        help="Output resolution: 1K, 2K, or 4K (default: 1K)"
    )
    
    args = parser.parse_args()
    
    print(f"🍌 Creating Creative Banana Art...")
    print(f"   Prompt: {args.prompt}")
    print(f"   Output: {args.filename}")
    print(f"   Resolution: {args.resolution}")
    
    try:
        create_banana_art(args.prompt, args.filename, args.resolution)
    except Exception as e:
        print(f"Error creating art: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()