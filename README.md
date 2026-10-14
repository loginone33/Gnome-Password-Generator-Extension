# Password Generator for GNOME Shell

**Password Generator** is a lightweight, customizable GNOME Shell extension that lets you generate strong passwords directly from the GNOME panel. This extension accesses the clipboard to instantly copy passwords.

---

## Features

- **One-Click Generation**: Left-click the panel icon to immediately generate a password using your saved configuration and copy it to your clipboard.
- **On-Screen Confirmation**: Shows a native GNOME OSD confirmation bubble with the generated password length.
- **Customizable Options**: Right-click the panel icon to open the settings menu:
  - **Password Length**: Adjustable from 4 to 32 characters via `−` / `+` steppers or direct numeric entry.
  - **Lowercase Characters**: `a-z` toggle.
  - **Uppercase Characters**: `A-Z` toggle.
  - **Digits**: `0-9` toggle.
  - **Special Characters**: `!@#$%^&*...` toggle.
  - **Exclude Ambiguous Characters**: Filter out confusing characters such as `l`, `I`, `1`, `o`, `O`, `0`, and `|`.
- **Persistent Configuration**: Settings are saved locally in `~/.config/gnome-password-generator.json`.
- **Clean & Lightweight**: Native GNOME Shell implementation with zero external dependencies.

---

## Compatibility

- **GNOME Shell**: 45, 46, 47, 48, 49, 50
- **Session**: Wayland & X11

---

## Installation & Deployment

### Local Installation

1. Clone or download this repository:
   ```bash
   git clone https://github.com/loginone33/Gnome-Password-Generator-Extension.git
   cd Gnome-Password-Generator-Extension
   ```
2. Run the included installation script:
   ```bash
   chmod +x install.sh
   ./install.sh
   ```
3. Restart GNOME Shell (log out and log back in on Wayland, or press `Alt+F2`, type `r`, and press `Enter` on X11).
4. Enable the extension:
   ```bash
   gnome-extensions enable password-generator@loginone
   ```

---

## Support & Donations

If you like this extension and want to support its ongoing development, your support is greatly appreciated!

[![Ko-fi](https://img.shields.io/badge/Ko--fi-Donate%20(PayPal)-ff5e5b.svg)](https://ko-fi.com/loginone)
[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-Donate-yellow.svg)](https://buymeacoffee.com/loginone)

- **Ko-fi** *(PayPal available)*: [ko-fi.com/loginone](https://ko-fi.com/loginone)
- **Buy Me A Coffee**: [buymeacoffee.com/loginone](https://buymeacoffee.com/loginone)
