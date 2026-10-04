# MyFolio — Pricing Plans & Feature Architecture

> **Document Version**: 1.0.0  
> **Status**: Review Draft for User Approval  
> **Scope**: Dashboard, Web Studio, Standalone `/subscribe` Checkout, Razorpay Integration, and Domain Provisioning.

---

## 1. Executive Summary & Core Plan Distinction

MyFolio operates on a dual publishing model designed to serve both one-time portfolio creators and active developers who want an evolving personal brand:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 THE CORE DISTINCTION                                        │
├──────────────────────────────────────────────┬──────────────────────────────────────────────┤
│               ONE-TIME PAYMENT               │             MONTHLY SUBSCRIPTION             │
│            (Lifetime Starter — ₹149)         │             (Pro Creator — ₹149/mo)          │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 🌐 DOMAIN: Netlify Domain                    │ 🌐 DOMAIN: Branded MyFolio Subdomain        │
│    e.g. https://<sitename>.netlify.app       │    e.g. https://<users_choice_name>.myfolio.tech│
│                                              │    + Custom Domain (e.g. alex.dev)           │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 💳 BILLING: Pay Once Forever (₹149)          │ 💳 BILLING: Monthly Recurring (₹149/month)   │
│    Zero recurring subscription fees          │    Cancel anytime via dashboard              │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ 🚀 UPDATES: Static Deployment                │ 🚀 UPDATES: Continuous Live GitHub Sync      │
│    1 free initial rebuild + ZIP export       │    Switch 3D worlds anytime + auto-sync      │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 2. Complete Plan Breakdown

### Tier 1: Free Starter (24-Hour Preview Mode)
*Best for: Testing out the 3D WebGL engine and reviewing your portfolio before purchase.*

- **Price**: **Free (₹0)**
- **Allowance**: 3 portfolio build generations per week.
- **Hosting**: Temporary 24-hour preview pass (`https://myfolio.tech/p/<site-id>`).
- **Watermark**: Includes the interactive 24-Hour Preview Mode badge and expiration timer.
- **Source Code**: Offline ZIP export is locked (requires upgrade).
- **Subdomain**: No custom or Netlify subdomain; temporary preview link only.
- **Expiration**: Preview link automatically locks after 24 hours.

---

### Tier 2: Lifetime Starter — One-Time Payment
*Best for: Job seekers, students, and freelancers who want a permanent, high-speed live portfolio without any recurring monthly charges.*

- **Display Pricing**:
  - **Big Offer Price**: **₹149** (One-time payment)
  - **Anchored Original Price**: **~~₹749~~** *(80% OFF Limited Launch Deal)*
- **Primary Domain Type**:
  - **Netlify Domain / Global Edge CDN Link**: Hosted directly on Netlify's high-speed edge network (`https://<sitename>.netlify.app` or permanent Edge CDN route).
- **Included Features**:
  1. **Permanent 24/7 Live Hosting**: The 24-hour preview countdown is permanently removed; your portfolio never goes down.
  2. **100% Watermark-Free**: All preview banners, upgrade pills, and countdown timers are stripped from the site.
  3. **Standalone Source Code (.ZIP) Export**: Instant, one-click download of the complete unbundled source code (HTML5, Vanilla CSS, JS modules, Three.js shaders, and 3D assets). You can host it on Vercel, GitHub Pages, Cloudflare, or AWS.
  4. **1 Full Free Rebuild**: Allows one complete regenerated version if you want to switch styles or update skills.
  5. **Zero Recurring Fees**: Pay ₹149 once and own the live deployment forever.

---

### Tier 3: Pro Creator — Monthly Subscription
*Best for: Active engineers, consultants, and founders who want a personalized personal brand, live syncing, and continuous portfolio updates.*

- **Display Pricing**:
  - **Big Offer Price**: **₹149 / month**
  - **Anchored Original Price**: **~~₹1,499 / month~~** *(or ~~₹499 / month~~)*
- **Primary Domain Type**:
  - **Branded MyFolio Subdomain**: Dedicated vanity URL chosen by the user:  
    `https://<users_choice_name>.myfolio.tech` (e.g. `https://abdulaziz.myfolio.tech`).
  - **Custom Domain Connection**: Ability to link your own root domain or external subdomain (e.g. `https://abdulaziz.dev`, `https://john.tech`).
- **Included Features**:
  1. **Everything in Lifetime Starter** (Permanent 24/7 hosting, watermark removal, ZIP export).
  2. **Personalized Subdomain**: Choose your own clean handle (`<users_choice_name>.myfolio.tech`) managed by MyFolio's edge DNS.
  3. **Custom Domain DNS Link**: Full SSL certificate provisioning for your custom domain.
  4. **Continuous Live GitHub Auto-Sync**: The system periodically syncs your public repositories, starred projects, and latest commit activity directly to your portfolio.
  5. **Switch 3D Worlds Anytime**: Switch between any of our curated 3D worlds and visual universes whenever you want.
  6. **Real Visitor Analytics**: Track real visitor impressions, unique views, top referrers, and geographic distribution directly from your dashboard.
  7. **Cancel Anytime**: Manage and cancel your monthly renewal directly from your profile settings.

---

## 3. Side-by-Side Comparison Matrix

| Feature / Capability | Free Starter (24h) | Lifetime Starter (One-Time) | Pro Creator (Monthly) |
| :--- | :---: | :---: | :---: |
| **Pricing** | ₹0 | **₹149** (~~₹749~~) | **₹149 / month** (~~₹1,499~~) |
| **Payment Frequency** | None | **One-Time Only** | **Monthly Recurring** |
| **Live Hosting Duration** | 24 Hours | **Permanent (Lifetime)** | **Permanent (Active Sub)** |
| **Live Domain Format** | `myfolio.tech/p/<id>` | **`<name>.netlify.app`** | **`<username>.myfolio.tech`** |
| **Custom Domain Support** | No | No | **Yes (`yourname.dev`)** |
| **Watermark Removal** | No | **100% Watermark-Free** | **100% Watermark-Free** |
| **Standalone Code (.ZIP)** | Locked | **Unlocked (Full Code)** | **Unlocked (Full Code)** |
| **Live GitHub Auto-Sync** | No | No | **Yes (Continuous)** |
| **Studio Updates** | Initial 3 builds | 1 Rebuild Included | **Switch 3D Worlds Anytime** |
| **Dashboard Analytics** | Basic views | Basic views | **Full Visitor Intelligence** |

---

## 4. Visual UI Layout Specs (How it will be rendered in Modals)

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                      🚀 Publish Permanent Live Website                                 │
│      Choose your publishing model to go live permanently so your site never goes down  │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│  LIFETIME STARTER        [ 80% OFF ]     │  PRO SUBDOMAIN          [ MOST POPULAR ]    │
│                                          │                                             │
│  ~~₹749~~                                │  ~~₹1,499~~ (or ~~₹499~~)                   │
│  ₹149  / one-time                        │  ₹149  / month                              │
│  Pay once • Zero recurring charges       │  Billed monthly • Cancel anytime            │
│                                          │                                             │
│  🌐 Netlify Edge Domain                  │  🌐 Branded Subdomain:                      │
│     https://<sitename>.netlify.app       │     https://<your_name>.myfolio.tech        │
│                                          │                                             │
│  ✓ Permanent 24/7 Global Hosting         │  ✓ Permanent 24/7 Global Hosting            │
│  ✓ 100% Watermark-Free Live Link         │  ✓ 100% Watermark-Free Live Link            │
│  ✓ Standalone Source Code (.ZIP)         │  ✓ Custom Domain Linking (yourname.dev)     │
│  ✓ 1 Free Style Rebuild                  │  ✓ Continuous Live GitHub Auto-Sync         │
│  ✓ Deployed to Netlify Edge CDN          │  ✓ Switch 3D Worlds Anytime                 │
│                                          │                                             │
│  [ Choose One-Time (₹149) ]              │  [ Choose Pro Subdomain (₹149/mo) ]         │
└──────────────────────────────────────────┴─────────────────────────────────────────────┘
```

---

## 5. Technical & Payment Gateway Mapping

1. **Razorpay Plan Identifiers**:
   - `starter` (or alias `lite`): Amount `14900` paise (₹149.00). Triggers `HostingProvider.approveAndUnwatermark()` and provisions Netlify live link.
   - `pro`: Amount `14900` paise (₹149.00/mo). Triggers subdomain registration in `custom-domains.json` and enables GitHub auto-sync.
2. **Refund & Cancellation Policy Compliance**:
   - Both plans comply with Indian Consumer Protection (E-Commerce) Rules and Razorpay merchant standards.
   - Digital provisioning and Netlify/Edge DNS binding are executed immediately upon webhook confirmation.
   - All purchases are strictly non-refundable once assets are compiled and live links are issued.
