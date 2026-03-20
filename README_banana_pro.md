# 🍌 Nano Banana Pro Demonstration

This is a demonstration of the **nano-banana-pro** OpenClaw skill, which creates AI-generated banana-themed art.

## What We Created

Since we don't have a Gemini API key for the actual skill, I created a simulated version that demonstrates the concept:

### 1. **Simple Banana Art Generator** (`simple_banana_art.py`)
- Creates banana-themed ASCII art based on text prompts
- No external dependencies required
- Example usage:
  ```bash
  python3 simple_banana_art.py --prompt "A tropical banana paradise" --filename "my_art.txt"
  ```

### 2. **Interactive HTML Art Display** (`banana_art.html`)
- Visual representation of banana art
- Animated and interactive
- Shows what the real AI-generated art would look like

### 3. **Creative Banana Art Script** (`creative_banana_art.py`)
- More advanced version using PIL (Python Imaging Library)
- Creates actual image files with banana-themed graphics
- Requires `pillow` package to be installed

## How to Use the Real Skill

To use the actual **nano-banana-pro** skill, you would need:

1. **Gemini API Key** from Google AI Studio
2. **Install the skill** via ClawHub:
   ```bash
   clawhub install nano-banana-pro
   ```
3. **Set environment variable**:
   ```bash
   export GEMINI_API_KEY="your-api-key-here"
   ```
4. **Use the skill** through OpenClaw

## Example Output

We generated banana art with the prompt: **"A tropical banana paradise with monkeys"**

Check out:
- `banana_art.txt` - ASCII art version
- `banana_art.html` - Interactive web version

## Running the Demo

1. View the HTML version:
   ```bash
   # If you have a web server running from earlier:
   # The 3D animation server might still be running at http://localhost:8080
   # You can open banana_art.html directly in a browser
   ```

2. Generate more ASCII art:
   ```bash
   python3 simple_banana_art.py --prompt "Your custom prompt here" --filename "output.txt"
   ```

## What the Real Skill Does

The actual **nano-banana-pro** skill:
- Uses Google's Gemini 3 Pro Image API
- Generates high-quality images from text prompts
- Supports different resolutions (1K, 2K, 4K)
- Returns the generated image file path
- Integrates seamlessly with OpenClaw's tool system

This demonstration shows the concept and user experience without requiring API keys or external dependencies.