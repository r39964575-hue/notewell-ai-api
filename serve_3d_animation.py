#!/usr/bin/env python3
"""
HTTP server for 3D Puppy & Cat Animation
"""

import http.server
import socketserver
import webbrowser
import os
import sys

PORT = 8080

class Handler(http.server.SimpleHTTPRequestHandler):
    def log_message(self, format, *args):
        # Suppress default logging
        pass
    
    def end_headers(self):
        # Add CORS headers for Three.js CDN
        self.send_header('Access-Control-Allow-Origin', '*')
        super().end_headers()

def main():
    print("=" * 60)
    print("🎬 3D Puppy & Cat Animation Server")
    print("=" * 60)
    
    # Change to current directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Check if 3D HTML file exists
    if not os.path.exists("3d_puppy_cat_animation.html"):
        print("Error: 3d_puppy_cat_animation.html not found!")
        return
    
    print(f"Starting 3D animation server on port {PORT}...")
    print(f"Open your browser to: http://localhost:{PORT}/3d_puppy_cat_animation.html")
    print("\n✨ Features:")
    print("  • Full 3D animated puppy and cat")
    print("  • Real-time lighting and shadows")
    print("  • Interactive camera controls")
    print("  • 30-second play sequence")
    print("  • Physics-based ball bouncing")
    print("\n🎮 Controls:")
    print("  • Click & drag: Rotate view")
    print("  • Scroll: Zoom in/out")
    print("  • Right-click & drag: Pan")
    print("  • UI buttons: Start/Stop/Reset animation")
    
    print("\n📁 Available files:")
    for file in os.listdir("."):
        if file.endswith(('.html', '.py', '.md')):
            print(f"  http://localhost:{PORT}/{file}")
    
    print("\n⏳ Loading may take a moment (fetching Three.js from CDN)")
    print("Press Ctrl+C to stop the server")
    print("=" * 60)
    
    # Try to open browser automatically
    try:
        webbrowser.open(f"http://localhost:{PORT}/3d_puppy_cat_animation.html")
        print("✓ Browser opened automatically")
    except:
        print("⚠ Could not open browser automatically")
        print("  Please open the URL manually")
    
    # Start server
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped. Thanks for watching! 🎬")
        except Exception as e:
            print(f"\nError: {e}")

if __name__ == "__main__":
    main()