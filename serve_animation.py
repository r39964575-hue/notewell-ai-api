#!/usr/bin/env python3
"""
Simple HTTP server to view the puppy/cat animation
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

def main():
    print("=" * 60)
    print("Serving Puppy & Cat Animation")
    print("=" * 60)
    
    # Change to current directory
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    # Check if HTML file exists
    if not os.path.exists("puppy_cat_animation.html"):
        print("Error: puppy_cat_animation.html not found!")
        return
    
    print(f"Starting HTTP server on port {PORT}...")
    print(f"Open your browser to: http://localhost:{PORT}/puppy_cat_animation.html")
    print("\nFiles available:")
    
    # List available files
    for file in os.listdir("."):
        if file.endswith(('.html', '.txt', '.py', '.md', '.sh')):
            print(f"  http://localhost:{PORT}/{file}")
    
    print("\nPress Ctrl+C to stop the server")
    print("=" * 60)
    
    # Try to open browser automatically
    try:
        webbrowser.open(f"http://localhost:{PORT}/puppy_cat_animation.html")
        print("✓ Browser opened automatically")
    except:
        print("⚠ Could not open browser automatically")
        print("  Please open the URL manually")
    
    # Start server
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\nServer stopped.")
        except Exception as e:
            print(f"\nError: {e}")

if __name__ == "__main__":
    main()