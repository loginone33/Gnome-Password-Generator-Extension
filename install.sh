#!/bin/bash
set -e

EXTENSION_UUID="password-generator@loginone"
INSTALL_DIR="$HOME/.local/share/gnome-shell/extensions/$EXTENSION_UUID"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Installing/Updating GNOME Extension: $EXTENSION_UUID"

# 1. Create extension directory if it doesn't exist
mkdir -p "$INSTALL_DIR"

# 2. Copy source files
cp "$SCRIPT_DIR/metadata.json" "$INSTALL_DIR/"
cp "$SCRIPT_DIR/extension.js" "$INSTALL_DIR/"
if [ -f "$SCRIPT_DIR/password-generator-symbolic.svg" ]; then
    cp "$SCRIPT_DIR/password-generator-symbolic.svg" "$INSTALL_DIR/"
fi

echo "📁 Files copied to $INSTALL_DIR"

# 3. Create zip bundle for distribution
gnome-extensions pack -f --extra-source=password-generator-symbolic.svg -o "$SCRIPT_DIR/" 2>/dev/null || true
echo "📦 Extension zip package rebuilt!"

# 4. Enable extension in GNOME settings
if command -v gnome-extensions &> /dev/null; then
    gnome-extensions enable "$EXTENSION_UUID" 2>/dev/null || true
fi

echo "✅ Success! To apply changes immediately:"
echo "   - On X11: Press Alt+F2, type 'r' and press Enter."
echo "   - On Wayland: Log out and log back in."
