#!/usr/bin/env python3
"""
Simple Banana Art Generator
Creates banana-themed ASCII art based on prompts.
"""

import argparse
import random
import sys
from datetime import datetime

def generate_banana_ascii(prompt):
    """Generate banana-themed ASCII art based on prompt."""
    
    prompt_lower = prompt.lower()
    
    # Collection of banana-themed ASCII art
    banana_arts = [
        """
           _
         _| |_
        |     |
        |  🍌  |
        |_____|
          | |
          |_|
        """,
        """
           _
         /   \\
        |  🍌  |
        \\_____/
          | |
          |_|
        """,
        """
          .--.
         /    \\
        | BANANA |
         \\____/
          |  |
          |__|
        """,
        """
           __
          /  \\
         | 🐒 |
         |🍌🍌|
          \\__/
        """,
        """
          🌴
          |
         / \\
        / 🍌 \\
        \\___/
        """,
        """
          ╔══════════╗
          ║  BANANA  ║
          ║   FACT   ║
          ║  FACTORY ║
          ╚══════════╝
        """
    ]
    
    # Select art based on prompt keywords
    if any(word in prompt_lower for word in ['monkey', 'ape', 'primate']):
        art = banana_arts[3]  # Monkey with bananas
    elif any(word in prompt_lower for word in ['tropical', 'island', 'palm']):
        art = banana_arts[4]  # Palm tree
    elif any(word in prompt_lower for word in ['factory', 'industrial', 'production']):
        art = banana_arts[5]  # Banana factory
    else:
        art = random.choice(banana_arts[:3])  # Random banana art
    
    # Add prompt as title
    result = f"🍌 BANANA ART GENERATOR 🍌\n"
    result += f"Prompt: {prompt}\n"
    result += f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n"
    result += "=" * 40 + "\n"
    result += art
    result += "=" * 40 + "\n"
    result += "Art created with 🍌 Nano Banana Pro (Simulated) 🍌\n"
    
    return result

def create_text_art_file(prompt, filename):
    """Create a text file with banana ASCII art."""
    
    ascii_art = generate_banana_ascii(prompt)
    
    # Save to file
    with open(filename, 'w') as f:
        f.write(ascii_art)
    
    print(f"\n🍌 Banana ASCII Art saved to: {filename}")
    print(f"📝 Prompt: {prompt}")
    print("\n" + ascii_art)
    
    return filename

def main():
    parser = argparse.ArgumentParser(
        description="Simple Banana Art Generator - Creates banana-themed ASCII art"
    )
    parser.add_argument(
        "--prompt", "-p",
        required=True,
        help="Art description/prompt"
    )
    parser.add_argument(
        "--filename", "-f",
        default="banana_art.txt",
        help="Output filename (default: banana_art.txt)"
    )
    
    args = parser.parse_args()
    
    print(f"🍌 Generating Banana ASCII Art...")
    
    try:
        create_text_art_file(args.prompt, args.filename)
    except Exception as e:
        print(f"Error creating art: {e}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()