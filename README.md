# Basement Inventory

A mobile-friendly inventory management app with QR code scanning, user accounts, and email notifications. Runs on your local network with HTTPS (required for camera access on phones).

## Features

- **QR Code Scanning** — scan item QR codes via camera or photo upload to open details
- **User Accounts** — sign up / sign in with email + password
- **Stock Alerts** — email notifications when items go out of stock or low
- **PWA** — installable on your phone's home screen (Android & iOS)
- **Full-screen Scanner** — dedicated scan view in the bottom nav
- **Item Detail Drawer** — quick quantity +/- buttons, notes editing, QR code display
- **Export / Import** — backup and restore inventory as JSON
- **Batch Print QR Codes** — print all QR codes at once

## Prerequisites

- **Python 3.12+** — [python.org](https://python.org)
- **mkcert** — for locally-trusted HTTPS certificates ([download](https://github.com/FiloSottile/mkcert/releases))
- **Git** (optional) — to clone the repo

## Quick Start

### 1. Install Python dependencies

```bash
pip install flask qrcode Pillow cryptography
```

### 2. Set up HTTPS with mkcert

```bash
# Install mkcert (Windows — put mkcert.exe somewhere in your PATH)
mkcert -install

# Generate certs for your local IP
mkcert -key-file server.key -cert-file server.crt 192.168.1.91 localhost 127.0.0.1

```

Replace `192.168.1.91` with your computer's actual local IP address.

### 3. Run the server

```bash
python server.py
```

The server starts on **https://localhost:5001** and your network IP (e.g. **https://192.168.1.91:5001**).

### 4. Access from your phone

1. Make sure your phone is on the same Wi-Fi network
2. Open **https://192.168.1.91:5001** in your phone's browser
3. Your phone will warn about an untrusted certificate — that's expected
4. **Trust the certificate:**
   - **iPhone:** Open the URL, tap "Show Details" → "Visit Website". Then go to Settings → General → About → Certificate Trust Settings and enable the mkcert root.
   - **Android:** Open the URL, tap "Proceed anyway". Or download `https://192.168.1.91:5001/ca.pem` and install it as a trusted CA.
5. Create an account (email + password) and you're in.

### 5. Enable Email Notifications (optional)

1. Enable **2-Step Verification** on your Google account: https://myaccount.google.com/security
2. Generate an **App Password**: https://myaccount.google.com/apppasswords
3. In the app, tap the **bell icon** → enter SMTP settings (Gmail, app password) → Save → Test

All registered users will receive email alerts when items go out of stock or hit their minimum quantity.

## File Structure

```
server.py             — Flask backend (API routes, QR generation, email)
storage.py            — JSON persistence (inventory, users, email config)
templates/index.html  — Single-page frontend (HTML + CSS + JS)
static/
  qr-scanner.umd.min.js       — QR scanning library
  qr-scanner-worker.min.js    — Worker for the scanner
  sw.js                       — Service worker (PWA offline support)
  manifest.json               — PWA manifest
  icons/                      — App icons (192px, 512px)
data/                 — Runtime data (NOT committed to git)
  inventory.json      — Items (auto-seeded on first run)
  users.json          — Registered users
  email_config.json   — SMTP credentials
server.crt / .key     — mkcert TLS certificates (NOT committed)
```

## API Reference

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account (email, password) |
| POST | /api/auth/login | Sign in |
| POST | /api/auth/logout | Sign out |
| GET | /api/auth/me | Get current user |
| GET | /api/items | List items (query: q, category, status) |
| POST | /api/items | Add item |
| PUT | /api/items/:id | Update item |
| DELETE | /api/items/:id | Delete item |
| GET | /api/items/:id/qrcode | Get QR code PNG |
| GET | /api/categories | List categories |
| GET | /api/stats | Inventory stats |
| GET/POST | /api/email/config | Get/set SMTP settings |
| POST | /api/email/test | Send test email to all users |

## Tips

- **Camera not working?** Make sure you're on HTTPS and the page was loaded via **https://** not **http://**
- **Can't scan?** Use the "Take photo" tab — it works on any connection
- **Data resets?** Delete `data/inventory.json` and restart — seed data regenerates
- **Change IP?** Regenerate mkcert certs with your new IP and update the email body URL in server.py

## Troubleshooting

**"Username and Password not accepted"**
→ You need an **App Password** from your Google account, not your regular Gmail password. Enable 2FA first.

**"No QR code found in image"**
→ Make sure the QR code is well-lit and centered. Try the camera tab instead.

**Blank page on phone**
→ Make sure you're accessing via **https://** not http://. Clear your browser cache.

**"Address already in use" on startup**
→ Kill the old Python process: `taskkill /f /im python.exe` then restart.
