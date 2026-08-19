# MD Development — FiveM Tebex Webstore

Modern, ultra-fast headless webstore for FiveM scripts with native Tebex integration, Discord live stats, instant CFX Keymaster checkout, real-time coupon verification, and rich video/screenshot galleries.

## Features

- **Tebex Headless API:** Real-time package syncing, automatic discounts, and checkout integration.
- **Discord Live Statistics:** Real-time member count and online presence counter.
- **Live Recent Purchases Ticker:** Automatically displays the last 5 completed transactions.
- **Auto YouTube Video Showcase:** Automatically extracts and embeds YouTube preview videos.
- **Multi-Screenshot Gallery:** Interactive screenshot carousel with arrow keys and thumbnail navigation.
- **Serverless API Backends:** Secure coupon validation and payments feed on Vercel (`/api/*`).
- **Smooth Momentum Scrolling:** Powered by Lenis smooth scroll.
- **Monochrome Glassmorphic UI:** Modern dark mode interface built with React & Tailwind CSS.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Fill in your Tebex and Discord configuration:
- `VITE_TEBEX_PUBLIC_TOKEN`: Your Tebex Headless API Public Token
- `VITE_TEBEX_STORE_DOMAIN`: Your store domain (e.g. `https://medaaa.tebex.io`)
- `VITE_DISCORD_URL`: Your Discord invite URL
- `TEBEX_SECRET_KEY`: Your Tebex Secret Key (for serverless `/api/coupons` and `/api/recent-payments`)

### 3. Run Locally
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```

## Deployment on Vercel
Deploy to Vercel with zero configuration. Add your `TEBEX_SECRET_KEY`, `VITE_TEBEX_PUBLIC_TOKEN`, and other environment variables in your Vercel Project Settings.
