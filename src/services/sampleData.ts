import { TebexCategory, TebexPackage, FAQItem } from '../types';

export const SAMPLE_PACKAGES: TebexPackage[] = [
  {
    id: 201,
    name: "MD Banking & Contactless POS System",
    description: `<h3>Elevate your server economy with MD Banking V2</h3>
<p>A complete, modern banking overhaul built from the ground up with a sleek glassmorphic NUI interface. Designed for seamless roleplay and flawless performance.</p>
<h4>Key Capabilities:</h4>
<ul>
  <li><strong>Contactless NFC Cards & POS Terminals:</strong> Businesses can bill customers directly using physical or digital terminals.</li>
  <li><strong>Shared Business & Society Accounts:</strong> Multi-tier access control with deposit, withdraw, and transaction history logs.</li>
  <li><strong>IBAN Wire Transfers & Quick PIN:</strong> Send money instantly to players online or offline via unique bank account numbers.</li>
  <li><strong>Cryptocurrency & Investment Wallet:</strong> Configurable crypto exchange rates with live wallet integration.</li>
  <li><strong>Interactive ATM Animations:</strong> Custom prop and card insertion audio cues.</li>
</ul>
<p>Fully optimized with <strong>0.00ms idle resmon</strong>. Includes automated Discord webhook transaction logging.</p>`,
    price: 34.99,
    original_price: 39.99,
    discount: 12,
    currency: "EUR",
    category_id: 1,
    category_name: "Paid",
    category_type: "paid",
    slug: "md-banking",
    frameworks: ['ESX', 'QB'],
    resmon: "0.00ms idle",
    youtube_id: "dQw4w9WgXcQ",
    image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=800&q=80"
    ],
    is_featured: true,
    is_bestseller: true,
    is_open_source: false,
    features: [
      "Contactless NFC Card & POS Terminal billing system",
      "Shared Society & Business accounts with permissions",
      "Wire transfers with IBAN & Offline player transfers",
      "Custom ATM props and realistic card insertion audio",
      "Full Discord audit logging with steam identifiers"
    ],
    config_preview: `Config = {}
Config.Framework = "auto" -- auto (ESX / QB)
Config.Language = "en"
Config.EnablePOS = true
Config.CardDeliveryPrice = 150
Config.SocietyAccounts = { "police", "ambulance", "mechanic", "realestate" }
Config.DiscordWebhook = "https://discord.com/api/webhooks/..."`
  },
  {
    id: 202,
    name: "MD Vehicleshop & Dealership 2.0",
    description: `<h3>Next-Generation Vehicleshop for FiveM</h3>
<p>An all-in-one vehicle dealership system featuring dynamic test drives, realistic vehicle finance loans, customizable showroom display spots, and daily discount deals.</p>
<h4>Core Features:</h4>
<ul>
  <li><strong>Interactive 3D Showroom:</strong> Rotate, open doors, rev engine, inspect trunk, and change colors in real-time.</li>
  <li><strong>Vehicle Financing & Down Payments:</strong> Players can buy cars on credit with automated recurring loan repayments.</li>
  <li><strong>Daily Rotating Deals:</strong> Server automatically applies discounts to selected vehicles every restart.</li>
  <li><strong>Player-Owned Dealership Support:</strong> Dealership job with commission, stock ordering, and employee management.</li>
</ul>
<p>Supports custom addon vehicles with zero configuration needed. 0.00ms resmon.</p>`,
    price: 32.99,
    original_price: 39.99,
    discount: 17,
    currency: "EUR",
    category_id: 1,
    category_name: "Paid",
    category_type: "deals",
    slug: "md-vehicleshop",
    frameworks: ['ESX', 'QB'],
    resmon: "0.00ms",
    youtube_id: "dQw4w9WgXcQ",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=800&q=80"
    ],
    is_featured: true,
    is_bestseller: true,
    is_open_source: false,
    features: [
      "Dynamic test drive system with configurable timer & dimension routing",
      "Vehicle financing with interest rates & repossession on missed payments",
      "Daily automated deals & limited edition vehicle showcases",
      "Custom categories (Supercars, SUVs, Sedans, Bikes, Boats, Planes)",
      "Player-owned dealership mode with employee commissions"
    ],
    config_preview: `Config = {}
Config.Framework = "auto" -- ESX / QB
Config.TestDriveDuration = 60 -- seconds
Config.FinancingEnabled = true
Config.MinDownPayment = 0.20 -- 20%
Config.DealershipJob = "cardealer"`
  },
  {
    id: 203,
    name: "MD Advanced Weed Farming & Lab System",
    description: `<h3>The Most In-Depth Illegal Farming Resource</h3>
<p>Immersive plant cultivation system featuring seed crossbreeding, soil pH/water management, drying racks, chemical lab mixing, packaging, and custom smoke props.</p>
<h4>System Breakdown:</h4>
<ul>
  <li><strong>Plant Anywhere or in Indoor Shells:</strong> Place pots in private warehouses or out in hidden wilderness spots.</li>
  <li><strong>Realistic Plant Care:</strong> Water, fertilizer, and light requirements dictate harvest yield and strain quality.</li>
  <li><strong>Joint Rolling & Weed Brick Packaging:</strong> Multi-tier processing tables for street sale baggies or bulk gang distribution.</li>
  <li><strong>Police Drug Raids:</strong> Police can burn or seize plants with burner props and receive evidence items.</li>
</ul>
<p>Plug and play for ESX and QBCore servers.</p>`,
    price: 26.99,
    original_price: 32.99,
    discount: 18,
    currency: "EUR",
    category_id: 1,
    category_name: "Paid",
    category_type: "deals",
    slug: "md-weedsystem",
    frameworks: ['ESX', 'QB'],
    resmon: "0.00ms",
    youtube_id: "dQw4w9WgXcQ",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1603909223429-69bb7101f420?auto=format&fit=crop&w=800&q=80"
    ],
    is_featured: true,
    is_new: true,
    is_open_source: false,
    features: [
      "Strain crossbreeding with custom THC potency calculation",
      "Dynamic plant growth models with 6 realistic stage props",
      "Indoor hydro-lights and automatic sprinkler systems",
      "Bulk bagging, joint rolling, and drug dealer sell system",
      "Police destruction & burner animation with alert triggers"
    ],
    config_preview: `Config = {}
Config.Framework = "auto" -- ESX / QB
Config.GrowthTime = 45 -- minutes per stage
Config.WaterDrainRate = 0.05
Config.PoliceDestroyTime = 10 -- seconds`
  },
  {
    id: 204,
    name: "MD Luxury Motel & Apartment Housing",
    description: `<h3>Complete Room Rental & Motel System</h3>
<p>Modern motel and apartment complex system with room keys, shared access, wardrobe dressing rooms, private stashes, and rent billing.</p>
<h4>Highlights:</h4>
<ul>
  <li><strong>Multiple Motel Locations:</strong> Pink Cage, Sandy Shores, Paleto Bay, and Luxury Downtown Suites.</li>
  <li><strong>Instance / Routing Bucket Protection:</strong> Zero interior interference between players in the same room.</li>
  <li><strong>Lockpicking & Police Breaching:</strong> Criminals can lockpick rooms, and police can issue raid warrants.</li>
</ul>`,
    price: 24.99,
    currency: "EUR",
    category_id: 1,
    category_name: "Paid",
    category_type: "paid",
    slug: "md-motel-system",
    frameworks: ['ESX', 'QB'],
    resmon: "0.00ms",
    youtube_id: "dQw4w9WgXcQ",
    image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"
    ],
    is_featured: false,
    is_new: true,
    is_open_source: false,
    features: [
      "Instance routing bucket system for infinite room capacities",
      "Shared room keys and temporary guest access",
      "Integrated stash, wardrobe, and logout bed actions",
      "Automatic rent renewals with bank billing"
    ],
    config_preview: `Config = {}
Config.Framework = "auto" -- ESX / QB
Config.WeeklyRent = 500
Config.MaxKeyHolders = 4`
  },
  {
    id: 205,
    name: "MD Warehouse & Logistics Cargo Job",
    description: `<h3>Interactive Logistics & Cargo Operations</h3>
<p>An engaging civilian delivery and warehouse logistics job with forklift cargo loading, flatbed pallet securing, route GPS navigations, and company tier progression.</p>
<h4>Features:</h4>
<ul>
  <li><strong>Forklift Pallet Loading:</strong> Physical synchronization of cargo crates onto delivery trucks.</li>
  <li><strong>Group Work & Multiplayer Delivery:</strong> Up to 4 players can work together on the same cargo contract.</li>
  <li><strong>Company Upgrades:</strong> Unlock faster trucks, refrigerated cargo, and hazardous material permits.</li>
</ul>`,
    price: 21.99,
    original_price: 25.99,
    discount: 15,
    currency: "EUR",
    category_id: 1,
    category_name: "Paid",
    category_type: "deals",
    slug: "md-warehouse-logistics",
    frameworks: ['ESX', 'QB'],
    resmon: "0.00ms",
    youtube_id: "dQw4w9WgXcQ",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1587293852726-70cdb56c2866?auto=format&fit=crop&w=800&q=80"
    ],
    is_featured: false,
    is_bestseller: false,
    is_open_source: false,
    features: [
      "Realistic forklift physics with pallet synchronization",
      "Multi-player group work support for up to 4 employees",
      "Tiered career progression with license permits and bonus pay",
      "Dynamic delivery locations across Los Santos & Blaine County"
    ],
    config_preview: `Config = {}
Config.Framework = "auto" -- ESX / QB
Config.PayPerPallet = 350
Config.GroupWorkMax = 4`
  },
  {
    id: 206,
    name: "MD Master Server Script Pack (5-in-1)",
    description: `<h3>The Ultimate MD Development Megapack</h3>
<p>Get all our signature resources in one massive discounted package! Includes <strong>MD Banking</strong>, <strong>MD Vehicleshop</strong>, <strong>MD WeedSystem</strong>, <strong>MD Motel</strong>, and <strong>MD Warehouse</strong>.</p>
<h4>Bundle Benefits:</h4>
<ul>
  <li><strong>Over 45% Discount:</strong> Save big compared to individual purchases.</li>
  <li><strong>Priority Lifetime Discord Support:</strong> Direct 1-on-1 assistance with your server developer.</li>
  <li><strong>All Future Updates Included:</strong> Free lifetime updates directly via Keymaster.</li>
</ul>`,
    price: 89.99,
    original_price: 154.95,
    discount: 42,
    currency: "EUR",
    category_id: 2,
    category_name: "Deals",
    category_type: "deals",
    slug: "md-master-bundle",
    frameworks: ['ESX', 'QB'],
    resmon: "0.01ms total",
    youtube_id: "dQw4w9WgXcQ",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    screenshots: [
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
    ],
    is_featured: true,
    is_bestseller: true,
    is_open_source: false,
    features: [
      "Includes MD Banking, Vehicleshop, WeedSystem, Motel, and Warehouse",
      "Instant delivery of all assets to your CFX Keymaster",
      "VIP Discord Role with priority support queue",
      "Pre-configured multi-framework bridges"
    ],
    config_preview: `-- MD Development Master Pack
-- 5 resources in 1 single purchase`
  },
  {
    id: 207,
    name: "MD Banking & POS System [Open Source]",
    description: `<h3>100% Unlocked Source Code Edition</h3>
<p>The complete un-obfuscated, un-encrypted source code for MD Banking & Contactless POS System. Built for developer teams wanting complete freedom to modify, expand, or integrate with custom frameworks.</p>
<h4>What's Included:</h4>
<ul>
  <li><strong>Unencrypted Client & Server Lua Code:</strong> Full access to all events, exports, and callbacks.</li>
  <li><strong>Uncompiled React / Tailwind Source:</strong> Full frontend repository with source components and styling.</li>
  <li><strong>Custom Database Migrations:</strong> Clean SQL schemas for custom core integrations.</li>
</ul>`,
    price: 79.99,
    currency: "EUR",
    category_id: 3,
    category_name: "Open Source",
    category_type: "opensource",
    slug: "md-banking-opensource",
    frameworks: ['ESX', 'QB'],
    resmon: "0.00ms",
    youtube_id: "dQw4w9WgXcQ",
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=800&q=80",
    is_featured: true,
    is_open_source: true,
    features: [
      "100% Unencrypted client and server Lua code",
      "Complete React / Tailwind UI source files included",
      "Full permission to customize for your own server projects",
      "Commercial protection for your own community"
    ],
    config_preview: `-- 100% Unlocked Open Source Version
-- All files open for customization`
  },
  {
    id: 208,
    name: "MD Vehicleshop & Dealership [Open Source]",
    description: `<h3>100% Unlocked Vehicleshop Source Code</h3>
<p>Fully unencrypted and open source release of MD Vehicleshop 2.0. Perfect for developer teams looking to add custom vehicle financing logic, dealership exports, or custom web integrations.</p>`,
    price: 69.99,
    currency: "EUR",
    category_id: 3,
    category_name: "Open Source",
    category_type: "opensource",
    slug: "md-vehicleshop-opensource",
    frameworks: ['ESX', 'QB'],
    resmon: "0.00ms",
    youtube_id: "dQw4w9WgXcQ",
    image: "https://images.unsplash.com/photo-1542282088-72c9c27ed0cd?auto=format&fit=crop&w=800&q=80",
    is_featured: false,
    is_open_source: true,
    features: [
      "100% Unlocked Lua & NUI files",
      "Easy custom exports for vehicle stats and keys",
      "Editable showroom UI themes and colors"
    ],
    config_preview: `-- Open Source Edition
-- Full access to all events and exports`
  }
];

export const SAMPLE_CATEGORIES: TebexCategory[] = [
  {
    id: 0,
    name: "All Scripts",
    slug: "all",
    description: "Browse all available FiveM scripts & systems created by MD Development.",
    order: 1,
    packages: SAMPLE_PACKAGES
  },
  {
    id: 1,
    name: "Paid",
    slug: "paid",
    description: "Premium standalone & framework scripts for ESX and QBCore.",
    order: 2,
    packages: SAMPLE_PACKAGES.filter(p => !p.is_open_source)
  },
  {
    id: 2,
    name: "Deals",
    slug: "deals",
    description: "Special limited-time discounts, sales, and mega bundles.",
    order: 3,
    packages: SAMPLE_PACKAGES.filter(p => (p.discount && p.discount > 0) || p.category_type === 'deals')
  },
  {
    id: 3,
    name: "Open Source",
    slug: "opensource",
    description: "100% unlocked source code packages for advanced developers and server teams.",
    order: 4,
    packages: SAMPLE_PACKAGES.filter(p => p.is_open_source || p.category_type === 'opensource')
  }
];

export const FAQ_ITEMS: FAQItem[] = [
  {
    id: "faq-1",
    question: "How do I receive my scripts after purchasing on Tebex?",
    answer: "All script purchases are delivered automatically and instantly via the official CFX.re Keymaster portal linked to your Cfx.re / FiveM account. Once checkout completes, your package will be immediately downloadable under 'Granted Assets'.",
    category: "general"
  },
  {
    id: "faq-2",
    question: "Which frameworks are supported by MD Development?",
    answer: "All our scripts natively support ESX Legacy and QBCore (QB). The scripts automatically detect your active framework with zero configuration required.",
    category: "installation"
  },
  {
    id: "faq-3",
    question: "How do I use the new customer discount code?",
    answer: "If this is your first purchase, enter the code 'new15' during checkout or apply it directly in your basket to receive an automatic 15% discount on your entire order.",
    category: "payments"
  },
  {
    id: "faq-4",
    question: "Where can I get support or ask pre-sale questions?",
    answer: "You can join our official Discord server at https://discord.gg/Ze4m2Uyxjw to open a support ticket, chat with the community, or get help with installation.",
    category: "general"
  }
];
