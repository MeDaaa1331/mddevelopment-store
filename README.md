# MD Development — FiveM Headless Store & Developer Hub

<div align="center">

![MD Development Banner](https://www.mddevelopment.store/logo.png)

### Ultra-Optimized FiveM Scripts, Headless E-Commerce & 15 Free In-Browser Developer Tools

[![Website](https://img.shields.io/badge/Store-mddevelopment.store-10b981?style=for-the-badge&logo=google-chrome&logoColor=white)](https://www.mddevelopment.store/)
[![Discord](https://img.shields.io/badge/Discord-Join%20Community-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/Ze4m2Uyxjw)
[![Frameworks](https://img.shields.io/badge/FiveM-ESX%20%7C%20QBCore%20%7C%20Qbox%20%7C%20ox__lib-f59e0b?style=for-the-badge&logo=lua&logoColor=white)](https://www.mddevelopment.store/)
[![License](https://img.shields.io/badge/License-Proprietary-rose?style=for-the-badge)](https://www.mddevelopment.store/)

</div>

---

## 🌟 Overview

**MD Development** is an advanced, production-grade web platform combining a high-performance **Headless Tebex Webstore** with a comprehensive **FiveM Developer Tools Hub**. Engineered from the ground up using React 18, TypeScript, Vite 5, Tailwind CSS, and Vercel Serverless Functions with Upstash Redis persistence, the platform delivers zero-latency browsing (101 kB initial bundle), instantaneous CFX Keymaster checkout, real-time Discord cloud synchronization, and 15 professional GTA V / FiveM modding utilities.

---

## 🚀 Key Platform Features

### 🛒 1. Headless Tebex Webstore & Marketplace
- **Live Catalog Sync**: Real-time integration with the Tebex Headless API for live package details, dynamic pricing, discount tags, and category separation (Paid Escrow, Open Source, and Limited Deals).
- **Direct CFX Keymaster Delivery**: Seamless asset delivery directly to the customer's CFX.re Keymaster account upon transaction completion.
- **In-App & Direct Checkout**: Supports both embedded modal checkout and direct gateway redirects.
- **Dynamic Coupon Verification**: Serverless backend (`/api/coupons`) for instantaneous percentage and flat-rate coupon validation.
- **Rich Media Showcase**: Automatic extraction and embedding of YouTube preview video showcases, multi-screenshot galleries, and feature checklists.
- **Recent Purchases Ticker**: Live transaction feed broadcasting recent customer purchases with country flags and timestamps.

### 🎮 2. Discord OAuth2 Authentication & Cloud Sync
- **One-Click Discord Sign In**: Secure authentication using Discord OAuth2 without storing passwords or credentials.
- **Multi-Device Cloud Cart Sync**: User carts, favorite scripts, and settings are saved to Upstash Redis and automatically synchronized across all customer devices.
- **Live Community Presence**: Real-time member counters showing total members and online users via Discord Gateway APIs.
- **User Profile Dashboard**: Dedicated customer modal displaying Discord avatar, username, joined timestamp, cloud sync status, reward history, and activity logs.

### 🎰 3. Daily Wheel of Fortune (Gamified Rewards)
- **Daily 24h Free Spin**: Authenticated users can spin the wheel once every 24 hours to win Tebex discount codes.
- **Discord Server Gatekeeper**: Direct Discord Bot API verification (`/api/wheel/status`) ensuring only active Discord community members can spin.
- **Automated Tebex Coupon Generation**: When a user wins, `/api/wheel/spin` automatically calls the Tebex Plugin API to create a unique single-use coupon valid for 24 hours.
- **Escrow-Scoped 100% Jackpots**: 100% OFF coupons dynamically fetch all store packages and apply strictly to standalone escrow scripts (automatically excluding Subscriptions, All In One bundles, and Open Source resources).
- **Reward History & Cart Application**: Users can view their active coupons and expiration timers in their profile, with 1-click "Apply to Cart" activation.

### 📊 4. Real-Time Admin Analytics Dashboard (`/admin`)
- **PIN Protected**: Secured with administrative PIN authentication.
- **Interaction Analytics**: Real-time tracking of tool views, code copies, searches, country demographics, and device breakdown.
- **Live Activity Stream**: Real-time feed of user interactions, Discord sign-ins, and wheel spins.
- **Discord Members Directory**: Searchable overview of all registered Discord users with cart sizes, favorite tools, and last active dates.
- **Wheel of Fortune Spin Audit**: Complete log of every spin outcome (user, timestamp, prize won, generated coupon code, and country) with category filters (All, Wins, Jackpots, No Luck).

---

## 🛠️ FiveM Developer Tools Suite (15 Free Utilities)

Accessible at [`/devtools`](https://www.mddevelopment.store/devtools), the platform provides 15 browser-based utilities for GTA V and FiveM developers:

| Tool | Description | Supported Formats |
| :--- | :--- | :--- |
| **Vehicle Handling Editor** | Interactive handling curve visualizer and XML editor for `handling.meta`. | XML, `handling.meta` |
| **Locales & Translation Generator** | Multi-language translation engine with automated syntax formatting. | ox_lib, ESX, QBCore, JSON |
| **Flags & YTYP Generator** | 32-bit bitmask and flag calculator for models, damage, and archetype definitions. | Bitmask, Hex, Decimal |
| **Blip & Radar Designer** | Interactive GTA V radar map blip builder with live sprite search and color pickers. | ox_lib, Vanilla FiveM Lua |
| **JSON to Lua Formatter** | Converts JSON structures into formatted, syntax-validated Lua tables. | JSON, Lua Tables |
| **Weapons & Ammo Config** | Weapon damage, recoil, clip size, and attachment configuration generator. | ox_inventory, qb-weapons |
| **Audio FX & Sound Explorer** | Searchable database of GTA V frontend audio names, sound sets, and triggers. | `PlaySoundFrontend` Lua |
| **Ped & Prop Spawner** | Catalog of GTA V ped models and prop hashes with interaction boilerplate. | ox_target, qb-target |
| **Coords & PolyZone Generator**| In-game coordinate formatter for vector3, vector4, and box zones. | Vector3/4, PolyZone, ox_target |
| **Discord Webhook Builder** | Rich server log embed generator with copy-paste FiveM Lua webhook code. | Discord API, FiveM Lua |
| **GTA Controls Lookup** | Complete index of FiveM control IDs, key mapping names, and game input indices. | `IsControlJustPressed` |
| **fxmanifest.lua Builder** | Resource manifest generator with Lua 5.4, UI pages, and escrow metadata. | `fxmanifest.lua` |
| **GTA V Hash Converter** | Joaat (Jenkins One-At-A-Time) string-to-hash and hex-to-decimal converter. | `GetHashKey`, Joaat, Hex |
| **Animation & Scenario Explorer**| Search over 10,000 GTA V animation dictionaries and scenario names. | `TaskPlayAnim` Lua |
| **Color & HEX Palette Picker** | GTA V vehicle paint IDs, RGB color codes, and HEX palette generator. | RGB, HEX, Vehicle Colors |

---

## 🏗️ Technical Architecture & Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Build System & Optimization**: Vite 5 with manual vendor chunking (`vendor-react`, `vendor-icons`, `vendor-confetti`), `React.lazy()` / `Suspense` code splitting, and `React.memo` rendering optimization (101 kB initial load).
- **Backend & APIs**: Vercel Serverless Edge Functions (`/api/*`).
- **Database & Cache**: Upstash Redis REST API with pipelined atomic writes.
- **Payment & E-commerce**: Tebex Headless API (Catalog/Basket) + Tebex Plugin API (Coupon management).
- **Authentication & Stats**: Discord OAuth2 & Discord Gateway REST API.
- **Smooth Momentum Scrolling**: Lenis Smooth Scroll.

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory (or configure in Vercel Project Settings):

```env
# Tebex Configuration
VITE_TEBEX_PUBLIC_TOKEN=your_tebex_public_token
VITE_TEBEX_STORE_DOMAIN=https://your_store.tebex.io
TEBEX_SECRET_KEY=your_tebex_plugin_secret_key

# Discord OAuth2 & Bot Configuration
VITE_DISCORD_URL=https://discord.gg/Ze4m2Uyxjw
DISCORD_CLIENT_ID=your_discord_client_id
DISCORD_CLIENT_SECRET=your_discord_client_secret
DISCORD_REDIRECT_URI=https://www.mddevelopment.store/api/auth/discord/callback
DISCORD_GUILD_ID=your_discord_guild_id
DISCORD_BOT_TOKEN=your_discord_bot_token

# Upstash Redis Database (Analytics, Cloud Sync & Wheel History)
UPSTASH_REDIS_REST_URL=https://your-database.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_upstash_bearer_token
```

---

## 📦 Installation & Local Development

### 1. Clone the repository
```bash
git clone https://github.com/MeDaaa1331/mddevelopment-store.git
cd mddevelopment-store
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start local development server
```bash
npm run dev
```
The application will launch at `http://localhost:3000`.

### 4. Build for production
```bash
npm run build
```

---

## 🚢 Deployment on Vercel

The project is fully configured for continuous deployment on **Vercel**:
1. Push your changes to the `main` branch on GitHub.
2. Link your GitHub repository in the Vercel Dashboard.
3. Configure all Environment Variables in **Project Settings > Environment Variables**.
4. Vercel will automatically build and deploy both the Vite static bundle and serverless `/api/*` endpoints.

---

## 👥 Community & Support

- **Official Webstore**: [mddevelopment.store](https://www.mddevelopment.store/)
- **FiveM DevTools Hub**: [mddevelopment.store/devtools](https://www.mddevelopment.store/devtools)
- **Discord Community**: [discord.gg/Ze4m2Uyxjw](https://discord.gg/Ze4m2Uyxjw)
- **Customer Support**: Open a ticket in our official Discord server for 24/7 technical support.

---

<div align="center">
  <sub>© MD Development. All rights reserved. Grand Theft Auto and FiveM are registered trademarks of Take-Two Interactive and Rockstar Games.</sub>
</div>
