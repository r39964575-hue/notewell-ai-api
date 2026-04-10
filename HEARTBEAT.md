# HEARTBEAT.md

# VPN Auto-Connect on Startup
# This ensures NordVPN is always connected when OpenClaw is running

## Automatic VPN Connection Command
Run the auto-VPN connector script to ensure NordVPN is connected:

```bash
cd /home/my_pc/.openclaw/workspace && node auto_vpn_connect.js
```

## What it does:
1. Checks if NordVPN is installed
2. Checks if NordVPN daemon is running (critical for WSL2)
3. If daemon not running, provides clear instructions to start it
4. If disconnected, connects automatically
5. Optimizes settings for OpenClaw compatibility
6. Verifies OpenClaw is accessible
7. Logs everything to vpn_connection.log

## WSL2-Specific Solutions:
If NordVPN daemon isn't running in WSL2:

1. **Quick fix**: Run the startup script:
   ```bash
   /home/my_pc/.openclaw/workspace/start_nordvpn.sh
   ```

2. **Manual start** (requires sudo password):
   ```bash
   sudo /etc/init.d/nordvpn start
   ```

3. **Windows alternative**: Start NordVPN from Windows app instead

4. **Auto-start configured**: NordVPN should now auto-start when you open WSL2 (added to .bashrc)

## Manual test commands:
```bash
# Test the auto-connector
node /home/my_pc/.openclaw/workspace/auto_vpn_connect.js

# Quick status check
/home/my_pc/.openclaw/workspace/start_nordvpn.sh

# Check public IP
curl -s ifconfig.me | xargs echo "Public IP:"
```
