import { DocCategory, DocArticle } from '../types/docs';

export const DOCS_CATEGORIES: DocCategory[] = [
  {
    id: 'getting-started',
    name: 'Getting Started & Setup',
    slug: 'getting-started',
    icon: 'Rocket',
    articles: []
  },
  {
    id: 'user-profile',
    name: 'User Profile & MD Points',
    slug: 'user-profile',
    icon: 'User',
    articles: []
  },
  {
    id: 'official-scripts',
    name: 'Official FiveM Scripts',
    slug: 'official-scripts',
    icon: 'Layers',
    articles: []
  }
];

export const DOCS_ARTICLES: DocArticle[] = [
  // ==========================================
  // GENERAL & GETTING STARTED
  // ==========================================
  {
    id: 'welcome',
    title: 'Welcome to MD Development',
    category: 'Getting Started & Setup',
    categorySlug: 'getting-started',
    badge: 'Guide',
    description: 'Overview of MD Development standards, 0.00ms idle resmon optimization, and multi-framework architecture.',
    sections: [
      {
        id: 'overview',
        title: 'About MD Development',
        content: `MD Development produces modern, ultra-optimized FiveM scripts specifically tailored for roleplay communities. Every resource is created from scratch with modern glassmorphism NUI web interfaces, ultra-low resource monitor footprint (**0.00ms idle resmon**), and native support for both **ESX Legacy** and **QBCore**.`
      },
      {
        id: 'standards',
        title: 'Core Standards & Architecture',
        content: `When installing any MD script, you can count on the following design standards:
- **0.00ms Resmon:** Sleep loops, proximity targets (ox_target/qb-target), and zero CPU wasted on non-active players.
- **Multi-Framework Auto Bridge:** Built-in automatic detection for ESX Legacy, QBCore, and Qbox without manual config toggles.
- **Ox Ecosystem Ready:** First-class compatibility with **ox_lib**, **oxmysql**, and **ox_inventory**.
- **Modern UI Stack:** React, Tailwind CSS, and lightweight vector assets designed for high-resolution 1080p, 1440p, and 4K gaming monitors.
- **Discord Webhook Logging:** Built-in audit trail logging for transactions, inventory transfers, and admin actions.`
      },
      {
        id: 'links',
        title: 'Important Community Links',
        content: `Join our official community for fast ticket support, direct update announcements, and exclusive community resources:
- **Official Store:** [mddevelopment.store](https://www.mddevelopment.store)
- **Tebex Store:** [medaaa.tebex.io](https://medaaa.tebex.io)
- **Discord Community:** [discord.gg/Ze4m2Uyxjw](https://discord.gg/Ze4m2Uyxjw)
- **CFX Keymaster:** [keymaster.fivem.net](https://keymaster.fivem.net)`
      }
    ]
  },
  {
    id: 'keymaster-escrow',
    title: 'CFX Keymaster & Asset Escrow',
    category: 'Getting Started & Setup',
    categorySlug: 'getting-started',
    badge: 'Essential',
    description: 'How to claim, download, and transfer your purchased FiveM scripts via CFX Keymaster.',
    sections: [
      {
        id: 'how-it-works',
        title: 'How CFX Asset Delivery Works',
        content: `When you purchase any resource on our Tebex store, the package is automatically linked to the **CFX.re / FiveM account** you provided at checkout. FiveM secures these assets through the official **CFX Asset Escrow** system.`,
        callout: {
          type: 'info',
          title: 'Account Verification',
          message: 'Always ensure you log in to Tebex with the same CFX account that owns your FiveM Server License Key!'
        }
      },
      {
        id: 'download-steps',
        title: 'Step-by-Step: Downloading your Scripts',
        steps: [
          {
            number: 1,
            title: 'Log in to CFX Keymaster',
            desc: 'Navigate to https://keymaster.fivem.net and log into your primary Cfx.re account.'
          },
          {
            number: 2,
            title: 'Open Granted Assets',
            desc: 'Click on the "Purchased assets" or "Granted assets" tab on the left navigation menu.'
          },
          {
            number: 3,
            title: 'Download the Package',
            desc: 'Find the MD Development resource (e.g. md-banking, md-vehicleshop) and click the "Download" button to save the official .zip file.'
          },
          {
            number: 4,
            title: 'Extract to Server',
            desc: 'Extract the downloaded folder directly into your server resources directory (e.g. resources/[md]/).'
          }
        ]
      },
      {
        id: 'license-transfer',
        title: 'Transferring Licenses',
        content: `CFX Keymaster allows you to perform a one-time transfer of any granted asset to another CFX account:
1. Open [keymaster.fivem.net/assets](https://keymaster.fivem.net/assets).
2. Locate the asset you wish to transfer.
3. Click **Transfer Ownership** and enter the exact Cfx.re username of the target account.
4. Confirm the transfer.

**Note:** CFX limits transfers to one time per asset. Open Source (unlocked) packages are also delivered directly through CFX Keymaster under Granted Assets, providing the full unencrypted source code.`
      }
    ]
  },
  {
    id: 'server-setup',
    title: 'Server Requirements & Setup',
    category: 'Getting Started & Setup',
    categorySlug: 'getting-started',
    badge: 'Setup',
    description: 'Prerequisites, ox_lib installation, database configuration, and optimal server.cfg start order.',
    sections: [
      {
        id: 'prerequisites',
        title: 'Minimum Server Requirements',
        content: `Before installing any MD scripts, make sure your FiveM server environment meets these criteria:
- **Server Artifact Build:** 6683 or newer (Recommended: latest recommended build from runtime.fivem.net).
- **Database Engine:** MariaDB 10.6+ or MySQL 8.0+.
- **Database Connector:** [oxmysql](https://github.com/overextended/oxmysql) (v2.10.0+ recommended).
- **Library Dependency:** [ox_lib](https://github.com/overextended/ox_lib) (Required by modern FiveM resources).
- **Framework:** ESX Legacy (v1.9.0+) or QBCore / Qbox latest.`
      },
      {
        id: 'server-cfg',
        title: 'Optimal server.cfg Resource Order',
        content: `The start order in your **server.cfg** is critical. Core dependencies such as **oxmysql** and **ox_lib** must be loaded before your framework and MD scripts:`,
        code: {
          language: 'bash',
          title: 'server.cfg',
          code: `# 1. Core FiveM & Database Connector
ensure chat
ensure spawnmanager
ensure oxmysql

# 2. UI & Library Essentials
ensure ox_lib

# 3. Framework (ESX Legacy or QBCore)
ensure es_extended     # OR qb-core
ensure ox_target       # OR qb-target
ensure ox_inventory    # OR qb-inventory

# 4. MD Development Scripts
ensure md-gasstations
ensure md-heisttablet
ensure md-banking
ensure md-cryptoV2
ensure md-hud
ensure md-vehicleshop
ensure md_motel
ensure [md-weedsystem]
ensure md-mdt`
        }
      }
    ]
  },
  {
    id: 'common-errors',
    title: 'Troubleshooting & Common Errors',
    category: 'Getting Started & Setup',
    categorySlug: 'getting-started',
    badge: 'Help',
    description: 'Common FiveM script errors, causes, and step-by-step solutions.',
    sections: [
      {
        id: 'nil-value',
        title: '1. "Attempt to index a nil value (global ox_lib / ESX)"',
        content: `**Cause:** The resource is trying to access \`ox_lib\` or the framework before it has finished initializing, or \`ox_lib\` is not started in \`server.cfg\` prior to this resource.
**Fix:**
1. Verify that \`ensure ox_lib\` is placed **above** the script in \`server.cfg\`.
2. Check that \`ox_lib\` is running without errors in the server console on launch.
3. If using ESX, ensure your \`es_extended\` is using export \`ESX = exports['es_extended']:getSharedObject()\`.`
      },
      {
        id: 'escrow-auth',
        title: '2. "You lack the required entitlement to use <resource>"',
        content: `**Cause:** The FiveM server license key running your server does not belong to the same CFX account that purchased the asset.
**Fix:**
1. Check which account owns the server key at [keymaster.fivem.net](https://keymaster.fivem.net).
2. Either regenerate your server license key from the purchasing account, or use the **Transfer Asset** option on Keymaster to send the script to your server key account.
3. Restart your FiveM server.`
      },
      {
        id: 'sql-error',
        title: '3. "Table not found / column missing in field list"',
        content: `**Cause:** The accompanying \`.sql\` file was not imported into your database.
**Fix:** Open HeidiSQL or your database manager, connect to your server database, and run the \`install.sql\` or \`sql/schema.sql\` file located inside the script folder.`
      }
    ]
  },
  {
    id: 'general-faq',
    title: 'Frequently Asked Questions (FAQ)',
    category: 'Getting Started & Setup',
    categorySlug: 'getting-started',
    badge: 'FAQ',
    description: 'Frequently asked questions regarding delivery, updates, refunds, and support.',
    sections: [
      {
        id: 'delivery',
        title: 'How do I receive my scripts after purchasing on Tebex?',
        content: `All script purchases are delivered automatically and instantly via the official **CFX.re Keymaster** portal linked to your Cfx.re / FiveM account. Once checkout completes, your package will be immediately downloadable under **Purchased / Granted Assets**.`
      },
      {
        id: 'frameworks',
        title: 'Which frameworks are supported?',
        content: `All our scripts natively support **ESX Legacy** and **QBCore** (including Qbox). The scripts feature an automatic framework detection engine with zero manual configuration required.`
      },
      {
        id: 'discount-code',
        title: 'How do I use the new customer discount code?',
        content: `If this is your first purchase, enter the coupon code **new15** during checkout or apply it directly in your cart drawer to receive an automatic **15% discount** on your entire order.`
      },
      {
        id: 'support-ticket',
        title: 'Where can I get support or ask pre-sale questions?',
        content: `Join our official Discord server at **https://discord.gg/Ze4m2Uyxjw** and open a support ticket. Our team is active daily and will assist you with setup, bug resolution, or custom inquiries.`
      }
    ]
  },

  // ==========================================
  // USER PROFILE & MD POINTS LOYALTY SYSTEM
  // ==========================================
  {
    id: 'user-profile-overview',
    title: 'User Profile & Account Hub',
    category: 'User Profile & MD Points',
    categorySlug: 'user-profile',
    badge: 'Account Guide',
    description: 'Overview of your MD Development user profile, Discord authentication, account synchronization, and tab navigation.',
    sections: [
      {
        id: 'account-overview',
        title: 'Account Authentication & Identity',
        content: `Your MD Development profile is seamlessly connected through **Discord OAuth2**. By logging in with your Discord account, your server activity, loyalty points, and store preferences are instantly synchronized.

**Profile Header Features:**
- **Discord Avatar & Handle:** Displays your live Discord profile picture, display name, and @username.
- **Discord Member Badge:** Highlights whether you are verified in the official MD Development Discord guild.
- **Discord ID Copy:** One-click button to copy your unique Discord SnowFlake ID for support tickets or Tebex whitelist claims.
- **MD Points Counter:** Always-visible gold badge displaying your active, spendable MD Points balance in real time.`
      },
      {
        id: 'tabs-breakdown',
        title: 'The 4 Profile Categories',
        content: `Your profile is organized into four intuitive, dedicated tabs:

1. **MD Points & Rewards:** Track your loyalty balance, complete earning activities (Discord login, server sync, daily wheel, devtools), redeem storewide discount coupons, and purchase extra Daily Wheel spins.
2. **Gift Card Checker:** An official Tebex-connected gift card validator. Enter any 16-digit card code to inspect remaining balance, validity status, expiration, and redeem directly into your shopping cart.
3. **Wheel Rewards:** View all discount vouchers won from the Daily Wheel of Fortune, complete with real-time countdown expiration timers and one-click cart application.
4. **Activity History:** A timestamped audit log of every point transaction, reward redemption, and tool usage linked to your profile.`
      },
      {
        id: 'cloud-synchronization',
        title: 'Automatic Cloud Synchronization',
        content: `Because your session is cryptographically linked to your Discord profile:
- **Persistent Shopping Cart:** Items added to your cart remain saved even if you switch browsers or devices.
- **Pinned DevTools:** Your favorite FiveM developer utilities stay pinned across sessions.
- **Secure Loyalty Balances:** Points and wheel spins are protected by server-side verification with anti-cheat protection.`,
        callout: {
          type: 'info',
          title: 'Discord Member Perks',
          message: 'Signing in with Discord awards an immediate +100 MD Points welcome bonus, and joining the official Discord guild grants an additional +50 MD Points bonus!'
        }
      }
    ]
  },
  {
    id: 'md-points-loyalty-system',
    title: 'MD Points Earning & Redemption Guide',
    category: 'User Profile & MD Points',
    categorySlug: 'user-profile',
    badge: 'Loyalty System',
    description: 'Complete breakdown of how MD Points are earned, daily quests, store cashback, and how to redeem exclusive coupons up to 50% OFF.',
    sections: [
      {
        id: 'what-are-points',
        title: 'What are MD Points?',
        content: `**MD Points** is MD Development's official community rewards and cashback program. Unlike ordinary store discounts, MD Points can be earned completely free through daily community engagement, developer tool usage, and store purchases.

Points never expire as long as your account remains active, allowing you to save up for major storewide discounts or purchase extra spins on the Daily Wheel of Fortune.`
      },
      {
        id: 'how-to-earn-points',
        title: 'How to Earn MD Points (Earning Activities)',
        content: `You can earn points through the following automated activities:`,
        table: {
          headers: ['Activity', 'Reward', 'Cooldown / Limit', 'Description'],
          rows: [
            ['Discord Login (Sign-in)', '+100 MD Points', 'One-time bonus', 'Sign in to the MD Development store using your Discord account for an instant welcome bonus.'],
            ['Join Official Discord', '+50 MD Points', 'One-time bonus', 'Join our official Discord community and claim your membership bonus in your profile.'],
            ['Daily Wheel of Fortune', '+20 MD Points', 'Once per 24 hours', 'Spin the Daily Wheel on the homepage or in your profile to receive free points and discounts.'],
            ['Use FiveM DevTools', '+20 MD Points', 'Once per 24 hours', 'Perform an action in any of our 15 free developer tools (e.g. Handling Editor, Locales Translator).'],
            ['Download Free Scripts', '+20 MD Points', 'Per unique script', 'Download any verified free community resource from our store catalog.'],
            ['Store Purchases (Cashback)', '15 pts per 1.00 €', 'Unlimited on all orders', 'Receive automatic 15 MD Points for every 1 Euro spent on any Tebex script or megapack.']
          ]
        },
        callout: {
          type: 'tip',
          title: 'Daily Streak Tip',
          message: 'Spinning the Daily Wheel (+20 pts) and using any FiveM DevTools utility (+20 pts) yields 40 free MD Points every single day!'
        }
      },
      {
        id: 'redeeming-points',
        title: 'Redeeming Points for Store Discounts & Wheel Spins',
        content: `Once you have accumulated enough MD Points, you can instantly redeem them directly inside your profile for official Tebex coupon codes:`,
        table: {
          headers: ['Reward', 'Cost', 'Tier Badge', 'Details & Usage'],
          rows: [
            ['10% OFF Storewide', '100 MD Points', 'STARTER', 'Generates an exclusive 10% coupon code valid for all FiveM scripts in your basket.'],
            ['20% OFF Storewide', '250 MD Points', 'POPULAR', 'Generates an exclusive 20% coupon code applicable to your entire Tebex order.'],
            ['30% OFF Storewide', '350 MD Points', 'ADVANCED', 'Generates an exclusive 30% coupon code for premium scripts and bundles.'],
            ['50% OFF Storewide', '500 MD Points', 'BEST VALUE (Jackpot)', 'Unlocks a massive 50% discount on any purchase in the MD Development catalog.'],
            ['Extra Wheel Spin', '300 MD Points', 'EXTRA SPIN', 'Instantly resets your Daily Wheel cooldown so you can spin again immediately to win up to 100% OFF.']
          ]
        }
      },
      {
        id: 'coupon-rules',
        title: 'Coupon Rules & No Expiration',
        content: `When you redeem an MD Points reward:
- **Instant Code Generation:** An official Tebex coupon code is created instantly on the server and added to your profile.
- **No Expiration (Lifetime Validity):** Unlike Daily Wheel rewards which expire after 24 hours, coupons purchased with MD Points **have no time limit**. They remain permanently in your account until you decide to use them on a checkout.
- **One-Click Application:** Click the **Apply to Cart** button in your profile to automatically attach the discount to your basket.
- **Single Use:** Each redeemed coupon code can be redeemed once on your account.`,
        callout: {
          type: 'tip',
          title: 'Save for Big Releases',
          message: 'Because coupons redeemed with MD Points never expire, you can safely accumulate points and save your 50% OFF Jackpot coupon for major script releases or bundles!'
        }
      }
    ]
  },
  {
    id: 'gift-card-checker-guide',
    title: 'Tebex Gift Card Checker & Usage',
    category: 'User Profile & MD Points',
    categorySlug: 'user-profile',
    badge: 'Tebex Feature',
    description: 'How to check your official Tebex gift card balance, verify validity in real time, and redeem funds during checkout.',
    sections: [
      {
        id: 'how-it-works',
        title: 'Direct Tebex Plugin API Integration',
        content: `The **Gift Card Checker** in your user profile connects directly to the official **Tebex Plugin API**. When you enter your 16-digit card code, the system performs a live lookup on the Tebex server to verify the card authenticity and exact available balance.`
      },
      {
        id: 'how-to-check',
        title: 'How to Check your Gift Card Balance',
        steps: [
          {
            number: 1,
            title: 'Open your User Profile',
            desc: 'Click on your Discord avatar or profile button in the top navigation bar to open the profile modal.'
          },
          {
            number: 2,
            title: 'Select "Gift Card Checker"',
            desc: 'Click on the Gift Card Checker tab in the navigation bar.'
          },
          {
            number: 3,
            title: 'Enter your 16-Digit Code',
            desc: 'Type or paste your gift card code into the input field (e.g. 0031408887191979 or 0031-4088-8719-1979).'
          },
          {
            number: 4,
            title: 'Click "Check Balance"',
            desc: 'The system queries Tebex in real time and updates the virtual gift card display with your live available balance, initial credit, card status, and custom notes.'
          }
        ]
      },
      {
        id: 'card-statuses',
        title: 'Understanding Card Statuses',
        content: `The Gift Card Checker will report one of the following states:
- **ACTIVE (Green):** The card is valid and has funds ready to be spent.
- **REDEEMED / DEPLETED (Gray):** The gift card is valid, but the entire balance (0.00 EUR) has already been spent.
- **VOIDED (Red):** The gift card was disabled or cancelled by the store administrator.
- **EXPIRED (Amber):** The card has passed its designated expiration date.
- **NOT FOUND (Red):** The code does not match any card issued on our Tebex store.`
      },
      {
        id: 'redemption-rules',
        title: 'Redeeming Your Card & Partial Balances',
        content: `**How to Redeem:**
- **In-App:** Click the **Redeem in Cart** button on the result card to automatically apply the code to your cart.
- **Tebex Checkout:** During final checkout on Tebex, paste the 16-digit code into the "Coupons / Gift Cards" input field.

**Partial Balances Supported:**
You are never required to spend the entire gift card balance in a single transaction. Any remaining funds stay securely tied to your code and can be used on future script releases. If your basket total exceeds your card balance, you can pay the remaining difference using Credit Card, PayPal, Apple Pay, or any supported gateway.`,
        callout: {
          type: 'tip',
          title: 'Giveaway Gift Cards',
          message: 'If you won a gift card in our Discord giveaways, simply enter the code here to confirm your credit before shopping!'
        }
      }
    ]
  },
  {
    id: 'wheel-rewards-and-history',
    title: 'Wheel Rewards & Activity Audit Log',
    category: 'User Profile & MD Points',
    categorySlug: 'user-profile',
    badge: 'Account Audit',
    description: 'How to manage your Daily Wheel of Fortune discounts, countdown timers, and review your complete account history.',
    sections: [
      {
        id: 'wheel-rewards-tab',
        title: 'Wheel Rewards Tab',
        content: `Every time you spin the **Daily Wheel of Fortune**, any discount coupons you win (10%, 20%, 30%, 50%, or 100% OFF) are automatically deposited into the **Wheel Rewards** tab.

**Key Features:**
- **Active Countdown Timers:** Each coupon card displays a live countdown timer showing the hours remaining before expiration (coupons are valid for 24 hours).
- **One-Click Copy:** Copy the unique discount code with a single click.
- **One-Click Apply:** Directly inject the coupon into your active basket so you never miss a discount.`
      },
      {
        id: 'activity-history-tab',
        title: 'Activity History & Points Audit',
        content: `The **Activity History** tab maintains a transparent, chronological ledger of all actions taken on your account:

**Recorded Events Include:**
- **Points Earned:** Daily check-ins, wheel spins, Discord bonuses, and store purchase cashbacks.
- **Points Spent:** Coupon tier redemptions and extra wheel spin purchases.
- **FiveM DevTools Usage:** Timestamped logs of tools utilized (Handling Editor, Locales Translator, etc.).
- **Free Script Downloads:** History of community resources claimed.

You can filter the history using the category chips: **All**, **MD Points**, or **DevTools**.`
      }
    ]
  },

  // ==========================================
  // 1. MD FUEL & GAS STATIONS
  // ==========================================
  {
    id: 'md-gasstations',
    title: 'MD Fuel & Gas Stations',
    category: 'Official FiveM Scripts',
    categorySlug: 'official-scripts',
    frameworks: ['ESX', 'QBCore'],
    resmon: '0.00ms idle',
    tebexUrl: 'https://medaaa.tebex.io/package/7658009',
    tebexSlug: 'md-gasstations',
    description: 'The ultimate fuel and ownable gas station business system for FiveM. Realistic pump nozzle physics, EV chargers, fuel deliveries, and full business management.',
    sections: [
      {
        id: 'overview',
        title: 'Overview & System Architecture',
        content: `**MD Fuel & Gas Stations** is an enterprise-grade fueling and station business simulation resource. It completely replaces legacy fuel scripts with modern physics, detailed business management, and full support for both electric and combustion vehicles.

**Key Features:**
- **Realistic Fuel Nozzle & Cable Physics:** Players grab physical nozzles from pumps, stretch the cord to the fuel cap, and manually hold the trigger to refuel.
- **Electric Vehicle (EV) Chargers:** Configurable EV charging stations with custom battery charging animations and kilowatt pricing.
- **Ownable Gas Station Businesses:** Players can buy gas stations across San Andreas, set retail fuel prices per gallon/liter, hire employees, and manage reserves.
- **Wholesale Fuel Delivery Logistics:** Fuel reserves deplete with sales; station owners must drive tanker trucks or hire logistics employees to haul wholesale deliveries from the refinery.
- **Dynamic Fuel Market:** Real-time fuel price fluctuations based on local demand score, consumption rates, and market volatility.
- **Portable Jerry Cans:** Buy and fill portable fuel canisters for emergency roadside refueling.
- **0.00ms Idle Resmon:** Highly optimized distance culling and zero tick loops when not interacting with pumps.`
      },
      {
        id: 'compatibility',
        title: 'Compatibility & Anti-Conflict Rules',
        callout: {
          type: 'warning',
          title: 'Remove Legacy Fuel Resources',
          message: 'You MUST stop and remove any existing fuel scripts (e.g. ox_fuel, LegacyFuel, ps-fuel, cdn-fuel, lj-fuel, qb-fuel) before starting md-gasstations to prevent entity and state bag conflicts.'
        },
        content: `The script includes built-in conflict detection (\`Config.Compatibility.failOnFuelResourceConflict = true\`) which alerts you in the server console if conflicting fuel scripts are running simultaneously.

**State Bags Used:**
- Primary: \`Entity(veh).state.fuel\`
- Mirror: \`Entity(veh).state.md_gasstations_fuel\``
      },
      {
        id: 'installation',
        title: 'Step-by-Step Installation',
        steps: [
          {
            number: 1,
            title: 'Place in Resources',
            desc: 'Extract md-gasstations into your server resources directory (e.g. resources/[md]/md-gasstations).'
          },
          {
            number: 2,
            title: 'Automatic SQL Migrations',
            desc: 'The script automatically creates all required database tables (md_gasstations_stations, md_gasstations_logs, md_gasstations_employees) upon first server boot.'
          },
          {
            number: 3,
            title: 'Add Cargo Manifest Item to Inventory',
            desc: 'Add the gas_delivery_manifest item into ox_inventory/data/items.lua for wholesale tanker runs.',
            code: {
              language: 'lua',
              title: 'ox_inventory/data/items.lua',
              code: `['gas_delivery_manifest'] = {
    label = 'Fuel Delivery Manifest',
    weight = 10,
    stack = false,
    close = true,
    description = 'A secured manifest for a wholesale fuel delivery.'
},`
            }
          },
          {
            number: 4,
            title: 'Add to server.cfg',
            desc: 'Ensure md-gasstations is started after ox_lib and your framework.',
            code: {
              language: 'bash',
              title: 'server.cfg',
              code: `ensure ox_lib
ensure es_extended # or qb-core
ensure md-gasstations`
            }
          }
        ]
      },
      {
        id: 'configuration',
        title: 'Configuration Reference (shared/config.lua)',
        content: `Detailed breakdown of key configuration options in \`shared/config.lua\`:`,
        code: {
          language: 'lua',
          title: 'shared/config.lua',
          code: `Config = Config or {}

Config.Framework = 'auto' -- 'esx', 'qb' or 'auto'
Config.Debug = false
Config.Locale = 'en' -- 'cs', 'en' or custom
Config.UILocale = 'en-US'
Config.Currency = 'USD'
Config.CurrencySymbol = '$'

Config.Economy = {
    currencyPrecision = 2,
    paymentPrecision = 0, -- integer support for inventory cash
    purchaseAccount = 'bank',
    orderAccount = 'bank',
    withdrawalAccount = 'bank',
    retailPaymentOrder = { 'cash', 'bank' },
    retailTaxRate = 0.15, -- 15% sales tax
    minimumWithdrawal = 1.00,
    maximumStationBalance = 999999999.99,
}

Config.Business = {
    defaultPurchasePrice = 250000, -- Price to buy an unowned station
    defaultCapacity = 1500.0,      -- Fuel tank volume in liters/gallons
    defaultInitialStock = 300.0,   -- Initial fuel loaded on purchase
    maximumEmployees = 12,
    minimumFuelPrice = 0.55,       -- Price floor per unit
    maximumFuelPrice = 10.0,       -- Price ceiling per unit
    maximumStationNameLength = 30,
    allowOwnerToSell = false,
}

Config.Fueling = {
    unownedStationPrice = 4.00,
    enableConsumption = true,
    consumptionIntervalMs = 1000,
    baseConsumptionPerSecond = 0.018,
    defaultTankCapacityLiters = 65.0,
    requireEngineOff = true,
    interactionDistance = 2.5,
    flowLitersPerSecond = 1.15,
}`
        }
      },
      {
        id: 'roles-permissions',
        title: 'Business Roles & Permissions Hierarchy',
        content: `Station owners can hire employees and assign them custom roles with granular permission toggles:`,
        table: {
          headers: ['Role Name', 'Default Permissions', 'Description'],
          rows: [
            ['Owner', 'All Permissions', 'Full control: rename station, withdraw profits, fire staff, sell station.'],
            ['Manager', 'pricing, orders, deliveries, operations', 'Adjusts retail fuel pricing, hires cashiers, and orders wholesale fuel.'],
            ['Accountant', 'pricing, finances', 'Monitors station balance, transaction ledger, and audits sales taxes.'],
            ['Logistics', 'orders, deliveries, operations', 'Drives tanker trucks to pick up wholesale fuel orders from the refinery.']
          ]
        }
      },
      {
        id: 'gameplay-usage',
        title: 'In-Game Usage & Mechanics',
        content: `**How to Refuel a Vehicle:**
1. Drive up to any pump station and turn off your engine (\`Config.Fueling.requireEngineOff = true\`).
2. Target the pump nozzle using your target system (\`ox_target\` / \`qb-target\`) or press the interaction prompt.
3. Walk over to your vehicle's fuel tank cap and interact to insert the nozzle.
4. Hold the mouse button / trigger to pump fuel. The digital display on the pump will update price and liters in real-time.
5. Return the nozzle to the pump holder and complete the payment using Cash or Bank Card.

**How to Manage an Owned Gas Station:**
1. Walk to the management terminal located inside the gas station shop.
2. Open the station tablet dashboard.
3. Review total fuel reserves, set retail prices per liter, manage employee permissions, order wholesale tanker deliveries, or withdraw business profits to your bank account.`
      }
    ]
  },

  // ==========================================
  // 2. MD HEIST TABLET
  // ==========================================
  {
    id: 'md-heisttablet',
    title: 'MD Heist Tablet',
    category: 'Official FiveM Scripts',
    categorySlug: 'official-scripts',
    frameworks: ['ESX', 'QBCore'],
    resmon: '0.00ms idle',
    tebexUrl: 'https://medaaa.tebex.io/package/7636179',
    tebexSlug: 'md-heisttablet',
    description: 'Advanced darknet criminal tablet featuring 10 pre-configured multi-stage heists, hacker minigames, team lobbies, and criminal reputation progression.',
    sections: [
      {
        id: 'overview',
        title: 'Overview & System Architecture',
        content: `**MD Heist Tablet** is the ultimate organized crime and heist management system for FiveM. Criminals use a portable darknet tablet to assemble crews, acquire illegal tools, and initiate 10 fully choreographed heist contracts across the map.

**Core Capabilities:**
- **Encrypted Darknet Tablet:** Accessible anywhere via the physical \`heist_tablet\` item.
- **Multi-Player Crew Lobbies:** Host creates a contract lobby and invites crew members via tablet notifications with synchronized mission status.
- **Criminal Reputation & Leaderboard:** Earn criminal points upon successful jobs, ranking players on a public or darknet leaderboard.
- **Integrated Police Dispatch:** Auto-alerts police with blips and camera coordinates via \`cd_dispatch\`, \`ps-dispatch\`, \`qs-dispatch\`, or \`core_dispatch\`.
- **Custom Minigames:** Built-in matrix hacking, keypad password decryptors, thermal charge timing, and drill controls.`
      },
      {
        id: 'ten-heists',
        title: 'The 10 Pre-Configured Heists',
        content: `Every heist contract is uniquely scripted with custom props, hacking stages, and tailored reward pools:
1. **Cargo Train Robbery:** Ambush the moving freight train in Blaine County, disable brakes via computer terminal, and breach security shipping containers.
2. **Fleeca Bank Branches:** Classic neighborhood bank heists featuring thermal charges, safety deposit box drills, and teller drawers.
3. **Luxury Yacht Raid:** Board a billionaire's offshore yacht, bypass keypad lasers, and loot luxury art and offshore gold.
4. **Pacific Standard Bank:** The ultimate multi-tier vault robbery with thermite vault door fuses, hacking terminals, and heavy cash trolleys.
5. **Paleto Bay Rural Bank:** Heavy ballistic assault on the northern bank vault with specialized drilling equipment.
6. **Vangelico Jewelry Exchange:** Precision smash-and-grab heist with custom glass display counters and police silent alarm triggers.
7. **Bobcat Security Depot:** Military warehouse raid for military-grade assault rifles, ammunition crates, and tactical gear.
8. **Humane Labs Infiltration:** Chemical bioweapons facility raid with keycard decryptors, ventilation bypass, and hazmat loot.
9. **Offshore Oil Rig Heist:** Helicopter or speedboat insertion onto an ocean platform to crack high-value industrial safes.
10. **Union Depository:** The pinnacle bank job requiring synchronized hacking cards, elevator shaft rappel, and gold bullion bars.`
      },
      {
        id: 'minigames',
        title: 'Interactive Minigames & Tools',
        content: `Heists incorporate five specialized mechanics that challenge player skill rather than relying on RNG:
- **Box Hacking:** Grid matrix memory and sequence matching with timed tile shuffles (\`shuffleInterval = 2500ms\`).
- **Terminal Hacking:** Brute-force hexadecimal cryptographic decryption with a 30-second time limit.
- **Keypad Password Station:** Formatted randomized password strings (\`%s%s%s%s-%s%s%s%s-%s%s%s%s\`) requiring clues gathered around the job site.
- **Pneumatic Drill:** Heat and pressure management to avoid breaking drill bits while opening safety deposit boxes.
- **Thermite Charge Placement:** Synchronized fuse timing that melts electronic magnetic vault locks.`
      },
      {
        id: 'inventory-items',
        title: 'Inventory Items (ox_inventory/data/items.lua)',
        content: `Add these official heist tools and equipment items from \`OX/items.txt\` into your \`ox_inventory/data/items.lua\`:`,
        code: {
          language: 'lua',
          title: 'ox_inventory/data/items.lua',
          code: `['heist_tablet'] = {
    label = 'Heist Tablet',
    weight = 300,
    stack = false,
    close = true,
    description = 'Encrypted darknet tablet for planning criminal contracts.'
},
['drill'] = {
    label = 'Heavy Drill',
    weight = 1500,
    stack = false,
    close = true,
    description = 'Pneumatic drill for cracking safety deposit boxes.'
},
['encoder'] = {
    label = 'Digital Encoder',
    weight = 400,
    stack = false,
    close = true,
    description = 'Cryptographic encoder for cloning security keycards.'
},
['hacking_card'] = {
    label = 'Hacking Card',
    weight = 100,
    stack = false,
    close = true,
    description = 'High-frequency RFID chip bypass card.'
},
['usb_drive'] = {
    label = 'USB Drive',
    weight = 100,
    stack = false,
    close = true,
    description = 'Flash drive containing brute-force decryption algorithms.'
},
['termit'] = {
    label = 'Thermite Charge',
    weight = 500,
    stack = false,
    close = true,
    description = 'High-temperature incendiary charge for melting vault locks.'
},
['gps_tracker'] = {
    label = 'GPS Jammer',
    weight = 4200,
    stack = false,
    close = true,
    description = 'Military signal jammer to delay police dispatch.'
},`
        }
      },
      {
        id: 'sql',
        title: 'Database Schema (sql/install.sql)',
        content: `Run this SQL script in HeidiSQL or your database manager to create cooldown and reputation leaderboard tables:`,
        code: {
          language: 'sql',
          title: 'sql/install.sql',
          code: `CREATE TABLE IF NOT EXISTS \`md_heisttablet_cooldown\` (
    \`id\`         INT          NOT NULL DEFAULT 1,
    \`expires_at\` BIGINT       NOT NULL DEFAULT 0,
    \`updated_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO \`md_heisttablet_cooldown\` (\`id\`, \`expires_at\`) VALUES (1, 0);

CREATE TABLE IF NOT EXISTS \`md_heisttablet_leaderboard\` (
    \`identifier\` VARCHAR(60)  NOT NULL,
    \`char_name\`  VARCHAR(100) NOT NULL,
    \`points\`     INT          DEFAULT 0,
    \`completed\`  INT          DEFAULT 0,
    \`updated_at\` TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (\`identifier\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
        }
      },
      {
        id: 'config-walkthrough',
        title: 'Configuration Reference (config.lua)',
        code: {
          language: 'lua',
          title: 'config.lua',
          code: `Config = {}
Config.Framework = 'auto' -- 'esx', 'qb' or 'auto'
Config.Locale = 'en'
Config.TabletItem = 'heist_tablet'

-- Dispatch Integrations: 'cd_dispatch', 'ps-dispatch', 'qs-dispatch', 'core_dispatch'
Config.DispatchSystem = 'cd_dispatch'

-- Global Animations
Config.Animations = {
    Hacking = { dict = 'amb@prop_human_atm@male@base', clip = 'base', flag = 49 },
    PlaceBomb = { dict = 'anim@heists@ornate_bank@thermal_charge', clip = 'thermal_charge', flag = 16, duration = 3000 },
    Looting = { dict = 'random@domestic', clip = 'pickup_low', flag = 49, duration = 3000 },
}

-- Each heist has customizable police requirements, cooldowns, and loot
Config.Heists = {
    ['train'] = {
        label = 'Cargo Train Robbery',
        points = 15,
        cooldown = 7200, -- seconds
        requirePolice = true,
        minPoliceOnline = 2,
        policeJob = 'police',
        items = { HackUSB = 'usb_drive', Explosive = 'termit' }
    }
}`
        }
      }
    ]
  },

  // ==========================================
  // 3. MD BANKING
  // ==========================================
  {
    id: 'md-banking',
    title: 'MD Banking',
    category: 'Official FiveM Scripts',
    categorySlug: 'official-scripts',
    frameworks: ['ESX', 'QBCore'],
    resmon: '0.00ms idle',
    tebexUrl: 'https://medaaa.tebex.io/package/7598762',
    tebexSlug: 'md-banking',
    description: 'Next-generation banking and cashless commerce system. Physical contactless NFC cards, POS billing terminals, shared society accounts, and IBAN wire transfers.',
    sections: [
      {
        id: 'overview',
        title: 'System Overview & Core Features',
        content: `**MD Banking** completely redefines in-game transactions with a sleek glassmorphic NUI inspired by modern mobile banking applications (Revolut, Apple Pay):
- **Contactless NFC Bank Cards:** Physical items in ox_inventory. Players tap their card on POS terminals to complete in-store purchases without pulling cash.
- **Portable POS Terminals & Business Invoices:** Authorized businesses (police, mechanics, restaurants) can issue direct bills using hotkey F7 or place stationary countertop terminals.
- **Shared Business & Society Accounts:** Multi-tier permission levels (Owner, Manager, Employee) with deposit, withdraw, and transaction history logs.
- **IBAN Wire Transfers:** Send money directly to offline or online players via unique account numbers.
- **Interactive ATM Animations & Audio:** Custom prop animations, card insertion sound cues, and withdrawal prompts.
- **3 Premium Card Tiers:** Obsidian Black, Platinum White, and Cyber Gold VIP.`
      },
      {
        id: 'sql',
        title: 'Database Schema (sql/install.sql)',
        content: `Import \`sql/install.sql\` into your database:`,
        code: {
          language: 'sql',
          title: 'sql/install.sql',
          code: `CREATE TABLE IF NOT EXISTS \`md_banking_accounts\` (
  \`id\` int(11) NOT NULL AUTO_INCREMENT,
  \`account_number\` varchar(50) NOT NULL,
  \`owner_identifier\` varchar(64) DEFAULT NULL,
  \`account_name\` varchar(100) NOT NULL DEFAULT 'Personal Account',
  \`balance\` bigint(20) NOT NULL DEFAULT 500,
  \`account_type\` varchar(20) NOT NULL DEFAULT 'personal',
  \`created_at\` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (\`id\`),
  UNIQUE KEY \`account_number\` (\`account_number\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
        }
      },
      {
        id: 'items',
        title: 'Inventory Item (OX/item.txt)',
        content: `Copy \`bank_card.png\` from the \`OX/\` folder to \`ox_inventory/web/images/\`, then add the item definition into \`ox_inventory/data/items.lua\`:`,
        code: {
          language: 'lua',
          title: 'ox_inventory/data/items.lua',
          code: `['bank_card'] = {
    label = 'Bank Card',
    weight = 10,
    stack = false,
    close = true,
    description = 'Contactless NFC card for MD Banking'
},`
        }
      },
      {
        id: 'config',
        title: 'Configuration (config.lua)',
        code: {
          language: 'lua',
          title: 'config.lua',
          code: `Config = {}
Config.Locale = 'cs' -- 'cs' or 'en'
Config.CardItem = 'bank_card'
Config.StartingBalance = 500
Config.CurrencySymbol = '$'

-- Groups that can access /terminal command to spawn POS terminals
Config.AdminGroups = {
    ['admin'] = true,
}

-- Hotkey & Jobs for mobile billing
Config.BillingKey = 'F7'
Config.BillingJobs = {
    ['police'] = true,
    ['mechanic'] = true,
    ['ambulance'] = true,
    ['cardealer'] = true
}

-- Pre-Configured Bank Locations
Config.BankLocations = {
    { name = "Fleeca Bank Legion Square", coords = vec3(149.3966, -1042.2002, 28.5680), heading = 339.0 },
    { name = "Fleeca Bank Hawick", coords = vec3(314.22, -278.85, 54.17), heading = 340.0 },
    { name = "Fleeca Bank Del Perro", coords = vec3(-1212.98, -330.84, 37.78), heading = 296.0 },
    { name = "Pacific Standard Bank", coords = vec3(241.61, 225.13, 106.29), heading = 340.0 }
}

-- ATM Props
Config.AtmModels = {
    \`prop_atm_01\`,
    \`prop_atm_02\`,
    \`prop_atm_03\`,
    \`prop_fleeca_atm\`
}

-- POS Countertop Terminal Models
Config.TerminalModels = {
    { label = "Standard Terminal", model = \`prop_till_01\` },
    { label = "Minimalist Terminal", model = \`prop_till_03\` },
}

-- Discord Audit Webhook
Config.DiscordWebhook = "https://discord.com/api/webhooks/..."`
        }
      },
      {
        id: 'pos-billing',
        title: 'POS Terminals & In-Game Billing Workflow',
        content: `**How to Spawn & Position a POS Terminal:**
1. Server staff with admin permissions type \`/terminal\` in chat while standing at a counter.
2. Select the terminal model (\`prop_till_01\` or \`prop_till_03\`) and assign it to a target business society.
3. Position the prop using gizmo controls and press Enter to lock it permanently in the database.

**Issuing an Invoice via F7:**
1. Authorized employees (Police, Mechanic, Medic) press **F7** to open the quick billing pad.
2. Enter the target player ID, amount, and reason (e.g. "Speeding fine: 120 mph").
3. The invoice is sent directly to the customer's screen where they can tap their physical \`bank_card\` to approve payment.`
      },
      {
        id: 'exports',
        title: 'Developer Exports',
        table: {
          headers: ['Export Name', 'Scope', 'Arguments', 'Return Value'],
          rows: [
            ['exports[\'md-banking\']:GetAccountBalance', 'Server', 'source', 'number (balance)'],
            ['exports[\'md-banking\']:AddMoney', 'Server', 'source, amount, reason', 'boolean (success)'],
            ['exports[\'md-banking\']:RemoveMoney', 'Server', 'source, amount, reason', 'boolean (success)'],
            ['exports[\'md-banking\']:OpenBank', 'Client', 'none', 'Opens banking UI']
          ]
        }
      }
    ]
  },

  // ==========================================
  // 4. MD CRYPTO V2
  // ==========================================
  {
    id: 'md-cryptoV2',
    title: 'MD Crypto V2',
    category: 'Official FiveM Scripts',
    categorySlug: 'official-scripts',
    frameworks: ['ESX', 'QBCore'],
    resmon: '0.00ms idle',
    tebexUrl: 'https://medaaa.tebex.io/package/7470140',
    tebexSlug: 'md-crypto-v2',
    description: 'Realistic cryptocurrency ecosystem with physical mining rig hardware, CoinGecko live market pricing, candle charts, and anonymous wallet transfers.',
    sections: [
      {
        id: 'overview',
        title: 'Overview & Capabilities',
        content: `**MD Crypto V2** is a complete decentralized economy simulator:
- **Physical Hardware Mining Rigs:** Players purchase mining frames, motherboards, and graphics cards (\`gpu_basic\`, \`gpu_advanced\`) to assemble rigs in apartments, motels, or private warehouses.
- **CoinGecko Real-Time API Integration:** Live price tracking for Bitcoin, Ethereum, and custom tokens synced with real-world crypto markets.
- **Offline Simulation Mode:** For servers wanting a standalone economy, a built-in algorithmic engine simulates volatility, market bull/bear runs, and unexpected flash crashes.
- **Trading Exchange & Candlestick Charts:** Interactive candlestick market charts with 15-minute, 1-hour, and 24-hour historical records.
- **Multi-Account Wallet Management:** Players can register up to 3 distinct anonymous crypto wallets with hashed password protection.`
      },
      {
        id: 'supported-tokens',
        title: 'Supported Cryptocurrencies & Tickers',
        content: `MD Crypto V2 comes configured with 12 popular tokens synced to CoinGecko:`,
        table: {
          headers: ['Ticker', 'Name', 'CoinGecko ID', 'Brand Color', 'Description'],
          rows: [
            ['BCD', 'Bitcloud', 'bitcoin', '#F7931A', 'Digital gold of the virtual economy.'],
            ['ATH', 'Aetherium', 'ethereum', '#627EEA', 'Decentralized platform for smart systems.'],
            ['BLX', 'Bloxcoin', 'binancecoin', '#F3BA2F', 'Utility token of the Blox Chain ecosystem.'],
            ['SLS', 'Solis', 'solana', '#9945FF', 'High-speed virtual ledger system.'],
            ['RFL', 'Riffle', 'ripple', '#00AAE4', 'Fast corporate transfer ledger.'],
            ['CDN', 'Cordanum', 'cardano', '#0D6EFD', 'Proof-of-stake ledger framework.'],
            ['PUP', 'Puppecoin', 'dogecoin', '#C2A633', 'Community token driven by memes and digital culture.'],
            ['PLT', 'Polytope', 'polkadot', '#E6007A', 'Multi-chain protocol connecting specialized blockchains.']
          ]
        }
      },
      {
        id: 'items',
        title: 'Mining Hardware & Items (OX/items.txt)',
        code: {
          language: 'lua',
          title: 'ox_inventory/data/items.lua',
          code: `['crypto_tablet'] = {
    label = 'Crypto Tablet',
    weight = 500,
    stack = false,
    close = true,
    description = 'Trade, buy, sell & manage your Crypto portfolio.'
},
['mining_rig'] = {
    label = 'Mining Rig Chassis',
    weight = 3000,
    stack = false,
    close = true,
    description = 'Body and power supply frame for your crypto mining station.'
},
['gpu_basic'] = {
    label = 'Basic GPU (RTX 3060)',
    weight = 500,
    stack = false,
    close = true,
    description = 'Budget mining card. Excellent efficiency but lower hashrate output.'
},
['gpu_advanced'] = {
    label = 'Advanced GPU (RTX 4090)',
    weight = 500,
    stack = false,
    close = true,
    description = 'High performance mining GPU with maximum hashrate capacity.'
},`
        }
      },
      {
        id: 'sql',
        title: 'Database Schema (sql_reference.sql)',
        content: `The database tables are automatically verified on server boot. You can also manually review or import \`sql_reference.sql\`:`,
        code: {
          language: 'sql',
          title: 'sql_reference.sql',
          code: `CREATE TABLE IF NOT EXISTS \`md_crypto_accounts\` (
    \`id\`            INT AUTO_INCREMENT PRIMARY KEY,
    \`identifier\`    VARCHAR(60)  NOT NULL COMMENT 'Player identifier (ESX/QB)',
    \`account_name\`  VARCHAR(40)  NOT NULL COMMENT 'Crypto account name',
    \`password_hash\` VARCHAR(255) NOT NULL COMMENT 'Hashed password',
    \`bank_linked\`   TINYINT(1)   DEFAULT 0 COMMENT '0 = unlinked, 1 = linked',
    \`balance_usd\`   DOUBLE       DEFAULT 0.00 COMMENT 'USD balance in the crypto wallet',
    \`created_at\`    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY \`unique_account\` (\`account_name\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
        }
      },
      {
        id: 'config',
        title: 'Configuration Reference (config.lua)',
        code: {
          language: 'lua',
          title: 'config.lua',
          code: `Config = {}
Config.Framework = 'auto' -- 'esx' or 'qb'
Config.Locale = 'en'
Config.TabletItem = 'crypto_tablet'
Config.MaxAccounts = 3
Config.TradeFee = 0.01 -- 1% trading fee

-- Real prices via CoinGecko or offline mathematical simulation
Config.UseRealPrices = true
Config.PriceUpdateInterval = 300 -- 5 minutes
Config.CandleInterval = 300
Config.CandleHistory = 192 -- 48 hours history

-- Simulation Parameters (only used if UseRealPrices = false)
Config.PriceSimulation = {
    tickInterval = 60,
    volatility = 0.025,
    trend = 0.0,
    crashChance = 0.002,
    boomChance = 0.002,
}`
        }
      }
    ]
  },

  // ==========================================
  // 5. MD HUD
  // ==========================================
  {
    id: 'md-hud',
    title: 'MD HUD',
    category: 'Official FiveM Scripts',
    categorySlug: 'official-scripts',
    frameworks: ['ESX', 'QBCore', 'Standalone'],
    resmon: '0.00ms idle',
    tebexUrl: 'https://medaaa.tebex.io/package/7651460',
    tebexSlug: 'md-hud',
    description: 'Ultra-clean, modern FiveM player and vehicle HUD. In-game customization settings menu, square minimap radar, and multi-voice engine support.',
    sections: [
      {
        id: 'overview',
        title: 'Overview & Key Features',
        content: `**MD HUD** provides an ultra-responsive, beautiful interface with virtually **0.00ms idle resmon**:
- **Player Status Rings / Bars:** Health, Armor, Hunger, Thirst, Stamina, Oxygen (swimming depth time), Server ID, and Stress.
- **Vehicle Dashboard Speedometer:** Real-time speed (MPH or KM/H), current gear (R, N, 1-8), RPM gauge, fuel gauge, engine health percentage, headlight indicators (low/high beam), and door lock indicators.
- **Multi-Vehicle Types:** Automatically detects whether player is operating a Car, Boat (speed displays in Knots), Aircraft, or Bicycle.
- **Minimap Radar System:** Clean square minimap with street name and compass heading overlay. Automatically hides on foot (configurable).
- **In-Game Customizer (/hud):** Players can open \`/hud\` to switch between 4 HUD styles, adjust scale (0.6x to 1.4x), opacity, color pickers, and configure auto-hide rules.
- **Cinematic Movie Mode (/cinematic):** Instant toggle of black top and bottom letterbox bars for content creators and roleplay events.
- **Voice System Detection:** Native support for \`pma-voice\`, \`saltychat\`, \`mumble-voip\`, and \`native\` with live microphone range feedback.`
      },
      {
        id: 'installation',
        title: 'Step-by-Step Installation',
        steps: [
          {
            number: 1,
            title: 'Extract to Resources',
            desc: 'Extract md-hud into your server resources directory (e.g. resources/[md]/md-hud).'
          },
          {
            number: 2,
            title: 'Ensure Dependencies',
            desc: 'Ensure your voice system (pma-voice) and fuel system (ox_fuel / LegacyFuel / md-gasstations) are started.'
          },
          {
            number: 3,
            title: 'Add to server.cfg',
            desc: 'Add ensure md-hud to server.cfg after your framework.',
            code: {
              language: 'bash',
              title: 'server.cfg',
              code: `ensure es_extended # or qb-core
ensure md-hud`
            }
          }
        ]
      },
      {
        id: 'config',
        title: 'Configuration Reference (config.lua)',
        code: {
          language: 'lua',
          title: 'config.lua',
          code: `Config = {}
Config.Framework = 'auto' -- 'esx', 'qbcore', 'qbox', 'standalone'
Config.Locale = 'en'      -- 'cs' | 'en'

Config.SettingsCommand = 'hud' -- Command to open settings menu
Config.ShowCinematicBarsCommand = 'cinematic' -- Cinematic letterbox bars
Config.SpeedUnit = 'MPH'       -- 'KMH' | 'MPH'
Config.VoiceSystem = 'pma-voice' -- 'pma-voice' | 'saltychat' | 'mumble-voip' | 'native'
Config.FuelSystem = 'ox_fuel'  -- 'ox_fuel' | 'LegacyFuel' | 'ps-fuel' | 'cdn-fuel' | 'default'

Config.RefreshRates = {
    PlayerStatus = 400, -- ms
    Vehicle = 150,      -- ms
    Compass = 50,       -- ms
}

Config.Radar = {
    OnlyInVehicle = true,  -- Hide minimap while walking on foot
    AlwaysShow = false,    -- Always show minimap
    Shape = 'square',      -- 'square' | 'circle'
    CustomPosition = true,
    OffsetX = 0.0,
    OffsetY = -0.025,
}

Config.Defaults = {
    PlayerStyle = 1,       -- Default Player HUD style (1 - 4)
    CarStyle = 1,          -- Default Vehicle HUD style (1 - 4)
    Scale = 1.0,           -- Global HUD scale (0.6 to 1.4)
    Opacity = 0.95,        -- Global HUD opacity (0.3 to 1.0)
    CinematicMode = false,
    
    AutoHide = {
        Health = false,
        Armor = true,
        Hunger = false,
        Thirst = false,
        Stamina = false,
        Oxygen = true,
    },

    AlertThresholds = {
        Health = 20,
        Hunger = 20,
        Thirst = 20,
        Oxygen = 25,
        Fuel = 15,
        Engine = 30,
    }
}`
        }
      },
      {
        id: 'commands',
        title: 'Player Commands & Customization',
        content: `Players have complete control over their HUD presentation:
- \`/hud\` — Opens the interactive settings modal. Allows switching HUD styles (Ring vs Bar layout), adjusting overall UI scale, setting individual element colors, and moving screen offsets.
- \`/cinematic\` — Toggles black cinematic top and bottom bars for filming video showcases or cinematic roleplay scenes.`
      }
    ]
  },

  // ==========================================
  // 6. MD VEHICLESHOP
  // ==========================================
  {
    id: 'md-vehicleshop',
    title: 'MD Vehicleshop',
    category: 'Official FiveM Scripts',
    categorySlug: 'official-scripts',
    frameworks: ['ESX', 'QBCore'],
    resmon: '0.00ms idle',
    tebexUrl: 'https://medaaa.tebex.io/package/7264174',
    tebexSlug: 'md-vehicleshop',
    description: 'Premier FiveM dealership system. 3D interactive showroom, private virtual dimension test drives, vehicle loans & financing, and dealer employee jobs.',
    sections: [
      {
        id: 'overview',
        title: 'Overview & Dealership Capabilities',
        content: `**MD Vehicleshop** is the most complete vehicle dealership package available for FiveM:
- **Interactive 3D Showroom:** Orbit camera rotation, open/close vehicle doors, rev engine, test horn, inspect trunk space, and preview 10 custom primary/secondary paint swatches in real-time.
- **Dimension-Isolated Test Drives:** Players test drive vehicles inside an isolated routing bucket. Includes multiple pre-configured test tracks (Letiště Airport Runway, Offroad Mountain Trail) with auto countdown and return teleport.
- **Automated Daily Deals:** Automatically picks 5 random showroom vehicles every 24 hours and applies configurable discounts (15% to 25%).
- **In-Game Admin Panel:** Authorized staff can modify vehicle stock, apply custom discounts, toggle sales availability, and inspect sales statistics (\`views\`, \`sales\`, \`total_revenue\`).
- **Studio Screenshot Tool:** Automatically spawns vehicles in an isolated studio and takes high-resolution images uploaded directly to a Discord webhook.
- **Automated Plate Generator:** Generates unique 8-character alphanumeric license plates upon purchase.`
      },
      {
        id: 'installation',
        title: 'Step-by-Step Installation',
        steps: [
          {
            number: 1,
            title: 'Extract to Resources',
            desc: 'Extract md-vehicleshop into your resources directory (e.g. resources/[md]/md-vehicleshop).'
          },
          {
            number: 2,
            title: 'Automatic SQL Migrations',
            desc: 'The script automatically creates md_vehicleshop_stats, md_vehicleshop_data, and md_vehicle_shop_data tables on startup.'
          },
          {
            number: 3,
            title: 'Configure Webhooks',
            desc: 'Set your DiscordWebhook and AdminWebhook in config.lua to receive sales and admin logs.'
          },
          {
            number: 4,
            title: 'Add to server.cfg',
            desc: 'Add ensure md-vehicleshop to server.cfg.',
            code: {
              language: 'bash',
              title: 'server.cfg',
              code: `ensure md-vehicleshop`
            }
          }
        ]
      },
      {
        id: 'sql',
        title: 'Database Schema',
        content: `Created automatically on server startup:`,
        code: {
          language: 'sql',
          title: 'Database Tables',
          code: `CREATE TABLE IF NOT EXISTS \`md_vehicleshop_stats\` (
    \`model\` VARCHAR(50) NOT NULL,
    \`views\` INT(11) DEFAULT 0,
    \`sales\` INT(11) DEFAULT 0,
    PRIMARY KEY (\`model\`)
);

CREATE TABLE IF NOT EXISTS \`md_vehicleshop_data\` (
    \`key_name\` VARCHAR(50) NOT NULL,
    \`data_value\` BIGINT(20) DEFAULT 0,
    PRIMARY KEY (\`key_name\`)
);

CREATE TABLE IF NOT EXISTS \`md_vehicle_shop_data\` (
    \`model\` VARCHAR(50) NOT NULL,
    \`stock\` INT(11) DEFAULT 0,
    \`discount_percent\` INT(11) DEFAULT 0,
    \`sales_disabled\` TINYINT(1) DEFAULT 0,
    \`image_url\` VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (\`model\`)
);`
        }
      },
      {
        id: 'config',
        title: 'Configuration Reference (config.lua)',
        code: {
          language: 'lua',
          title: 'config.lua',
          code: `Config = {}
Config.Currency = '$'
Config.AdminGroups = { ['admin'] = true }

Config.Blip = {
    Sprite = 225,
    Color = 0,
    Scale = 0.7,
    Label = 'PDM Dealership'
}

Config.DealerLocation = {
    coords = vector3(-56.9273, -1098.8639, 25.4224), 
    heading = 33.87,
    model = 'a_m_m_business_01'
}

Config.ShowroomLocation = {
    coords = vector3(-44.5118, -1097.9941, 26.6224),
    heading = 336.22,
    cameraCoords = vector3(-48.8478, -1092.3673, 27.8132)
}

Config.SpawnPoint = {
    coords = vector3(-32.0301, -1091.3553, 26.4223),
    heading = 327.75
}

-- Multi-Track Test Drives
Config.TestDrive = {
    Price = 500,
    Time = 60, -- seconds
    ReturnCoords = vector3(-57.5251, -1096.7699, 26.4223),
    Locations = {
        { label = 'Airport Runway', coords = vector3(-940.6094, -3176.9819, 13.9444), heading = 57.44 },
        { label = 'Offroad Trail', coords = vector3(-1068.0640, 4603.4912, 120.5299), heading = 281.51 }
    }
}

-- Automated Daily Deals
Config.DailyDeals = {
    Enabled = true,
    Count = 5,
    DiscountMin = 15,
    DiscountMax = 25,
}`
        }
      }
    ]
  },

  // ==========================================
  // 7. MD MOTEL
  // ==========================================
  {
    id: 'md_motel',
    title: 'MD Motel',
    category: 'Official FiveM Scripts',
    categorySlug: 'official-scripts',
    frameworks: ['ESX', 'QBCore'],
    resmon: '0.00ms idle',
    tebexUrl: 'https://medaaa.tebex.io/package/7337693',
    tebexSlug: 'md-motel',
    description: 'Complete apartment and motel rental system. Routing bucket instance rooms, shared room keys, expandable stash upgrades, and weekly rent auto-billing.',
    sections: [
      {
        id: 'overview',
        title: 'System Architecture & Features',
        content: `**MD Motel** solves the housing bottleneck on high-population FiveM servers:
- **Routing Bucket Virtual Instancing:** Every room uses an interior shell placed in a private virtual routing dimension. Hundreds of players can rent rooms at Pink Cage Motel simultaneously with zero interior collision or visual overlap.
- **Physical Room Keys:** Stored as physical \`keys\` items in \`ox_inventory\`. Players can lock and unlock room doors from the outside and inside.
- **Roommate Management:** Room owners can duplicate keys and register up to 3 trusted roommates (\`Config.MaxManagers = 3\`) granting them full access to the room and stash.
- **Expandable Stash Upgrades:** 4 distinct storage tiers ranging from 50kg up to 150kg.
- **Wardrobe & Changing Room:** Integrated clothing wardrobe allowing players to browse, save, and change saved outfits.
- **Automated Rent Billing:** Automatically checks room expiration every 5 minutes and sends rent warnings 24 hours prior to eviction.`
      },
      {
        id: 'sql',
        title: 'Database Schema (sql/install.sql)',
        code: {
          language: 'sql',
          title: 'sql/install.sql',
          code: `CREATE TABLE IF NOT EXISTS \`md_motel_rentals\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`motel_id\` VARCHAR(50) NOT NULL,
    \`room_id\` INT NOT NULL,
    \`owner_identifier\` VARCHAR(60) NOT NULL,
    \`expire_time\` DATETIME NOT NULL,
    \`stash_level\` INT DEFAULT 1,
    \`is_locked\` TINYINT DEFAULT 1,
    \`last_player_position\` TEXT,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX \`idx_motel_room\` (\`motel_id\`, \`room_id\`),
    INDEX \`idx_owner\` (\`owner_identifier\`),
    INDEX \`idx_expire\` (\`expire_time\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS \`md_motel_managers\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`rental_id\` INT NOT NULL,
    \`manager_identifier\` VARCHAR(60) NOT NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;`
        }
      },
      {
        id: 'items',
        title: 'Inventory Item (keys)',
        content: `Add the physical room key item into your \`ox_inventory/data/items.lua\`:`,
        code: {
          language: 'lua',
          title: 'ox_inventory/data/items.lua',
          code: `['keys'] = {
    label = 'Motel Room Key',
    weight = 50,
    stack = false,
    close = true,
    description = 'Physical brass key to a rented motel room.'
},`
        }
      },
      {
        id: 'config',
        title: 'Configuration Reference (config.lua)',
        code: {
          language: 'lua',
          title: 'config.lua',
          code: `Config = {}
Config.Framework = 'esx' -- 'esx' or 'qb'
Config.Locale = 'cs'    -- 'cs' or 'en'
Config.KeyItem = 'keys'
Config.KeyPrice = 150
Config.MaxManagers = 3  -- Maximum roommates per room
Config.RentCheckInterval = 5 -- Minutes between checks
Config.RentWarningTime = 1440 -- Minutes before expiration to notify

-- 4 Stash Tiers
Config.StashUpgrades = {
    [1] = { slots = 20, weight = 50000, price = 0, label = 'Basic (50kg)' },
    [2] = { slots = 35, weight = 75000, price = 1500, label = 'Medium (75kg)' },
    [3] = { slots = 50, weight = 100000, price = 2500, label = 'Large (100kg)' },
    [4] = { slots = 75, weight = 150000, price = 5000, label = 'Premium (150kg)' }
}

-- Pink Cage Motel (36 Pre-Configured Rooms)
Config.Motels = {
    ['pink_cage'] = {
        label = 'Pink Cage Motel',
        blip = { enabled = true, sprite = 475, color = 0, scale = 0.8 },
        menuPosition = vector3(325.1548, -229.1728, 54.1472),
        menuHeading = 250.0,
    }
}`
        }
      },
      {
        id: 'tenant-operations',
        title: 'Tenant Operations & Room Management',
        content: `**Renting a Room:**
1. Walk up to the Pink Cage reception counter and interact with the manager.
2. Browse available rooms, view weekly rental prices ($600/week default), and confirm lease.
3. You will receive a physical \`keys\` item tied to your room number.

**Managing Roommates & Stash Upgrades:**
1. Stand inside your room and interact with the room management terminal.
2. Select **Roommates** to invite online players. They will receive their own duplicated key.
3. Select **Stash Upgrades** to expand storage capacity from 50kg up to 150kg.`
      }
    ]
  },

  // ==========================================
  // 8. MD WEEDSYSTEM
  // ==========================================
  {
    id: 'md-weedsystem',
    title: 'MD WeedSystem',
    category: 'Official FiveM Scripts',
    categorySlug: 'official-scripts',
    frameworks: ['ESX', 'QBCore'],
    resmon: '0.00ms idle',
    tebexUrl: 'https://medaaa.tebex.io/package/7370467',
    tebexSlug: 'md-weedsystem',
    description: 'The most comprehensive illegal cannabis cultivation and processing system for FiveM. Plant pots anywhere, strain breeding, watering, joint rolling, and street dealer sales.',
    sections: [
      {
        id: 'overview',
        title: 'System Breakdown & 3-in-1 Package',
        content: `**MD WeedSystem** is a complete, deep illegal farming gameplay loop packaged into 3 synchronized modules:
1. **md-weedsystem:** Core farming, soil nutrition, plant growth stages, watering, and processing tables.
2. **md-drugsell:** Complete NPC street corner selling system with negotiation chances and police dispatch calls.
3. **weedpot:** Custom physical props and plant models created by Mrs. BZZZ.

**Key Mechanics:**
- **Plant Anywhere:** Place pots in secret forests, mountain slopes, private apartments, or industrial warehouses.
- **6 Distinct Cannabis Strains:**
  - Regular Weed (\`regweed_seed\`, \`regweed_bud\`, \`regweed_bag\`)
  - Banana Kush (\`bananakush_seed\`, \`bananakush_bud\`, \`bananakush_bag\`)
  - Purple Haze (\`purplehaze_seed\`, \`purplehaze_bud\`, \`purplehaze_bag\`)
  - Blue Dream (\`bluedream_seed\`, \`bluedream_bud\`, \`bluedream_bag\`)
  - Orange Crush (\`orangecrush_seed\`, \`orangecrush_bud\`, \`orangecrush_bag\`)
  - Cosmic Kush (\`cosmickush_seed\`, \`cosmickush_bud\`, \`cosmickush_bag\`)
- **Realistic Plant Care:** Plants consume water over time. If water drops to 0%, the plant withers and dies. Add fertilizer to accelerate growth.
- **Bud Harvesting & Rolling Tables:** Harvest raw buds, place them on processing tables to roll joints or pack 10g baggies.`
      },
      {
        id: 'installation',
        title: 'Step-by-Step Installation',
        steps: [
          {
            number: 1,
            title: 'Place in Resources',
            desc: 'Copy the entire [md-weedsystem] folder into your resources directory.'
          },
          {
            number: 2,
            title: 'Add to server.cfg',
            desc: 'Add ensure [md-weedsystem] into your server.cfg. Bracket syntax starts all 3 sub-resources automatically.',
            code: {
              language: 'bash',
              title: 'server.cfg',
              code: `ensure [md-weedsystem]`
            }
          },
          {
            number: 3,
            title: 'Import SQL Database Tables',
            desc: 'Execute the SQL script located in md-weedsystem/sql/install.sql to save placed pots across server restarts.'
          },
          {
            number: 4,
            title: 'Copy Items & Icons',
            desc: 'Copy item definitions and PNG icons from the OX folder into your ox_inventory.'
          }
        ]
      },
      {
        id: 'sql',
        title: 'Database Schema (sql/install.sql)',
        code: {
          language: 'sql',
          title: 'sql/install.sql',
          code: `CREATE TABLE IF NOT EXISTS \`md_weedsystem_pots\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`coords\` VARCHAR(255) NOT NULL,
    \`rotation\` FLOAT DEFAULT 0,
    \`state\` VARCHAR(50) DEFAULT 'empty',
    \`seed_type\` VARCHAR(100) DEFAULT NULL,
    \`water_level\` FLOAT DEFAULT 0,
    \`fertilizer_level\` FLOAT DEFAULT 0,
    \`growth_phase\` INT DEFAULT 0,
    \`growth_time\` BIGINT DEFAULT 0,
    \`last_update\` BIGINT DEFAULT 0,
    \`owner\` VARCHAR(100) DEFAULT NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS \`md_weedsystem_wild_plants\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`location_index\` INT NOT NULL,
    \`coords\` VARCHAR(255) NOT NULL,
    \`collected\` TINYINT(1) DEFAULT 0,
    \`respawn_time\` BIGINT DEFAULT 0,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS \`md_weedsystem_tables\` (
    \`id\` int(11) NOT NULL AUTO_INCREMENT,
    \`coords\` longtext NOT NULL,
    \`rotation\` float NOT NULL,
    \`owner\` varchar(50) DEFAULT NULL,
    PRIMARY KEY (\`id\`)
);`
        }
      },
      {
        id: 'items',
        title: 'Inventory Items (ox_inventory/data/items.lua)',
        code: {
          language: 'lua',
          title: 'ox_inventory/data/items.lua',
          code: `['empty_pot'] = {
    label = 'Prázdný květináč',
    weight = 500,
    stack = true,
    close = true,
    description = 'Květináč pro pěstování rostlin',
    client = { event = 'md-weedsystem:client:usePot' }
},
['weed_table'] = {
    label = 'Balící stůl',
    weight = 1000,
    stack = true,
},
['soil_bag'] = {
    label = 'Hlína',
    weight = 1000,
    stack = false,
    close = true,
},
['fertilizer'] = {
    label = 'Hnojivo',
    weight = 175,
},
['water_bottle'] = {
    label = 'Water Bottle',
    weight = 100,
    stack = true,
},
-- Seeds
['regweed_seed'] = { label = 'Semínko trávy', weight = 3 },
['bananakush_seed'] = { label = 'Banana Kush semínko', weight = 3 },
['purplehaze_seed'] = { label = 'Purple Haze semínko', weight = 3 },
['bluedream_seed'] = { label = 'Blue Dream semínko', weight = 3 },
['orangecrush_seed'] = { label = 'Orange Crush semínko', weight = 3 },
['cosmickush_seed'] = { label = 'Cosmic Kush semínko', weight = 3 },
-- Buds
['regweed_bud'] = { label = 'Weed Palička', weight = 5 },
['bananakush_bud'] = { label = 'Banana Kush Palička', weight = 5 },
['purplehaze_bud'] = { label = 'Purple Haze Palička', weight = 5 },
['bluedream_bud'] = { label = 'Blue Dream Palička', weight = 5 },
['orangecrush_bud'] = { label = 'Orange Crush Palička', weight = 5 },
['cosmickush_bud'] = { label = 'Cosmic Kush Palička', weight = 5 },
-- 10g Bags
['regweed_bag'] = { label = 'Sáček Trávy', weight = 7 },
['bananakush_bag'] = { label = '10g Banana Kush Trávy', weight = 10 },
['purplehaze_bag'] = { label = '10g Purple Haze Trávy', weight = 10 },
['bluedream_bag'] = { label = '10g Blue Dream Trávy', weight = 10 },
['orangecrush_bag'] = { label = '10g Orange Crush Trávy', weight = 10 },
['cosmickush_bag'] = { label = '10g Cosmic Kush Trávy', weight = 10 },`
        }
      },
      {
        id: 'cultivation-cycle',
        title: 'Step-by-Step Cultivation & Harvesting Cycle',
        content: `**1. Seed Foraging:**
Harvest wild cannabis seeds in the wilderness near Mount Chiliad (\`Config.SeedCollection\`).

**2. Placing Pots & Adding Soil:**
Use the \`empty_pot\` item from your inventory. A placement gizmo lets you align the pot. Once placed, interact and apply a \`soil_bag\` to prepare the soil.

**3. Planting & Growth Care:**
Plant any of the 6 seed strains. Monitor the water gauge: plants consume water continuously. If water reaches 0%, the plant permanently dies. Add \`fertilizer\` to boost growth speed.

**4. Harvesting & Rolling Table:**
Once growth reaches 100%, harvest the raw buds. Place down a \`weed_table\` (Balící stůl) to roll joints or pack 10-gram baggies ready for street distribution.`
      },
      {
        id: 'drug-selling',
        title: 'Street Corner Dealing (md-drugsell)',
        content: `**MD WeedSystem** includes the dedicated \`md-drugsell\` system:
- **Global NPC Selling:** Target pedestrians on any street corner with \`ox_target\` to offer baggies.
- **Blacklist Protection:** Police officers, paramedics, security guards, and shopkeepers will immediately reject offers and trigger emergency dispatch calls.
- **Anti-Spam Memory:** Pedestrians remember sales attempts for 30 seconds (\`memory = 30\`) to prevent repetitive farming.
- **Special Named Dealers:** Static NPC dealers (El Chapo, Tyrone) buy wholesale batches with a +15% price bonus.`
      }
    ]
  },

  // ==========================================
  // 9. MD MDT
  // ==========================================
  {
    id: 'md-mdt',
    title: 'MD MDT',
    category: 'Official FiveM Scripts',
    categorySlug: 'official-scripts',
    frameworks: ['ESX', 'QBCore'],
    resmon: '0.00ms idle',
    tebexUrl: 'https://medaaa.tebex.io/package/7414555',
    tebexSlug: 'md-mdt',
    description: 'High-performance Mobile Data Terminal for Police and EMS. Citizen profiles, incident reports, criminal record histories, warrants, and vehicle registration.',
    sections: [
      {
        id: 'overview',
        title: 'Overview & Officer Capabilities',
        content: `**MD MDT** provides a clean, responsive computer system for law enforcement and medical personnel:
- **Citizen Database:** Mugshots, DNA tags, licenses (Driver, Weapon, Hunting), criminal histories, and active arrest warrants.
- **Vehicle Registration & Stolen Flags:** Search vehicles by license plate or owner name, check stolen vehicle flags, impound logs, and vehicle registration status.
- **Incident & Arrest Report Collaboration:** Officers can create incident reports, attach evidence photos, tag participating officers, and calculate suggested fines/jail sentences.
- **Active BOLO System:** Broadcast Be-On-The-Lookout alerts across all patrol vehicles with Low, Medium, and High priority flags.
- **Medical EMS Mode:** Paramedics can log patient medical histories, blood types, and hospital admission records.`
      },
      {
        id: 'installation',
        title: 'Step-by-Step Installation',
        steps: [
          {
            number: 1,
            title: 'Extract to Resources',
            desc: 'Extract md-mdt into your server resources directory (e.g. resources/[md]/md-mdt).'
          },
          {
            number: 2,
            title: 'Import SQL Database',
            desc: 'Execute sql/install.sql in your database manager.'
          },
          {
            number: 3,
            title: 'Add police_tablet Item',
            desc: 'Add the police_tablet item into ox_inventory/data/items.lua and copy police_tablet.png into ox_inventory/web/images/.',
            code: {
              language: 'lua',
              title: 'ox_inventory/data/items.lua',
              code: `['police_tablet'] = {
    label = 'Police MDT Tablet',
    weight = 500,
    stack = false,
    close = true,
    description = 'Encrypted Mobile Data Terminal for law enforcement and EMS.'
},`
            }
          },
          {
            number: 4,
            title: 'Add to server.cfg',
            desc: 'Add ensure md-mdt to your server.cfg.',
            code: {
              language: 'bash',
              title: 'server.cfg',
              code: `ensure md-mdt`
            }
          }
        ]
      },
      {
        id: 'sql',
        title: 'Database Schema (sql/install.sql)',
        code: {
          language: 'sql',
          title: 'sql/install.sql',
          code: `CREATE TABLE IF NOT EXISTS \`md_mdt_officers\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`identifier\` VARCHAR(60) NOT NULL UNIQUE,
    \`name\` VARCHAR(100) NOT NULL DEFAULT '',
    \`callsign\` VARCHAR(20) NOT NULL DEFAULT '',
    \`badge_number\` VARCHAR(20) NOT NULL DEFAULT '',
    \`photo\` TEXT DEFAULT NULL,
    \`notes\` TEXT DEFAULT NULL,
    \`job\` VARCHAR(50) NOT NULL DEFAULT 'police',
    \`rank\` VARCHAR(50) NOT NULL DEFAULT '',
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX \`idx_identifier\` (\`identifier\`),
    INDEX \`idx_callsign\` (\`callsign\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS \`md_mdt_citizens\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`identifier\` VARCHAR(60) NOT NULL UNIQUE,
    \`name\` VARCHAR(100) NOT NULL,
    \`notes\` TEXT DEFAULT NULL,
    \`mugshot\` TEXT DEFAULT NULL,
    \`fingerprint\` VARCHAR(100) DEFAULT NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`
        }
      },
      {
        id: 'config',
        title: 'Configuration (config.lua)',
        code: {
          language: 'lua',
          title: 'config.lua',
          code: `Config = {}
Config.Framework = 'auto'
Config.ItemName = 'police_tablet'
Config.Command = 'mdt'

Config.PoliceJobs = {
    'police',
    'sheriff',
}

Config.EMSJobs = {
    'ambulance',
}

Config.Licenses = {
    { id = 'drive', label = 'Drivers License' },
    { id = 'weapon', label = 'Firearms License' },
    { id = 'hunting', label = 'Hunting License' },
}

Config.IncidentCategories = {
    'Traffic Violation',
    'Assault',
    'Robbery',
    'Homicide',
    'Drug Offense',
    'Weapon Offense',
    'Domestic Violence',
    'Trespassing',
    'Public Disturbance',
    'Warrant Service',
    'Other',
}

Config.PenaltyTypes = {
    'Warning',
    'Fine',
    'Community Service',
    'License Suspension',
    'Jail Time',
}

Config.BOLOPriorities = { 'Low', 'Medium', 'High' }
Config.WarrantTypes = { 'Arrest Warrant', 'Search Warrant' }
Config.DiscordWebhook = 'https://discord.com/api/webhooks/...'
Config.MaxSearchResults = 50
Config.AutoRegisterCitizens = true`
        }
      },
      {
        id: 'console-commands',
        title: 'Server Console Maintenance Commands',
        content: `Run these maintenance commands directly in the server console to keep databases and vehicle models synchronized:`,
        table: {
          headers: ['Command', 'Purpose', 'Usage Scenario'],
          rows: [
            ['mdt_debug_vehicles', 'Vehicle Debugging', 'Runs diagnostic tests if vehicle hashes display instead of model names.'],
            ['mdt_sync_vehicles', 'Vehicle Database Sync', 'Forces synchronization of newly spawned or purchased vehicles into MDT.'],
            ['mdt_sync_citizens', 'Citizen Database Sync', 'Imports newly created framework characters into the citizen registry.'],
            ['mdt_resolve_vehicles', 'Vehicle Name Resolver', 'Resolves display labels for custom addon vehicles.']
          ]
        }
      },
      {
        id: 'in-game-workflow',
        title: 'Officer In-Game Workflow',
        content: `**Opening the MDT:**
Authorized personnel (police, sheriff, ambulance) can open the terminal by using the \`police_tablet\` item from their inventory or typing \`/mdt\` while on duty.

**Filing an Incident Report:**
1. Navigate to **Incidents** and click **New Report**.
2. Set the category (e.g. Armed Robbery) and incident location.
3. Add involved suspects, assign penal code charges with automatic suggested fine and jail calculations, and attach photographic evidence URLs.
4. Save the report. The suspect's criminal record profile will instantly update across all MDT units.`
      }
    ]
  }
];

// Populate category articles
DOCS_CATEGORIES.forEach(cat => {
  cat.articles = DOCS_ARTICLES.filter(a => a.categorySlug === cat.slug);
});
