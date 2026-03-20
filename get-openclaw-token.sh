#!/bin/bash

echo "=== Finding OpenClaw Gateway Token ==="
echo ""

# Method 1: Check config command
echo "1. Checking 'openclaw config get gateway.token':"
openclaw config get gateway.token 2>/dev/null || echo "  Not found via config command"

echo ""

# Method 2: Check config files
echo "2. Checking config files in ~/.openclaw/:"
find ~/.openclaw -name "*.yaml" -o -name "*.yml" -o -name "*.json" -o -name "*.toml" 2>/dev/null | while read file; do
  echo "  Checking $file"
  grep -i "token\|auth\|secret" "$file" 2>/dev/null | head -3
done

echo ""

# Method 3: Check environment variables
echo "3. Checking environment variables:"
env | grep -i "openclaw\|gateway\|token" | head -10

echo ""

# Method 4: Check running gateway process
echo "4. Checking gateway process:"
ps aux | grep -i "openclaw.*gateway" | grep -v grep

echo ""

# Method 5: Try to connect to gateway
echo "5. Testing gateway connection:"
curl -s http://localhost:3001/health 2>/dev/null || \
curl -s http://localhost:3001/api/health 2>/dev/null || \
echo "  Gateway not responding on port 3001"

echo ""

# Method 6: Check if we need to generate a token
echo "6. If no token found, you may need to:"
echo "   a) Generate a new token:"
echo "      openclaw gateway token generate"
echo "   b) Or check if token is in:"
echo "      ~/.openclaw/gateway.yaml"
echo "      ~/.openclaw/config.yaml"
echo "      ~/.openclaw/secrets.yaml"

echo ""
echo "=== Quick Fix ==="
echo "If you can't find the token, you can:"
echo "1. Use the simulated API (already working)"
echo "2. Generate a new token with: openclaw gateway token generate"
echo "3. Set it as: export OPENCLAW_TOKEN=your_token"
echo "4. Restart the API server"