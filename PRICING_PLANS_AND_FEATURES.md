# MyFolio — Pricing Plans & Feature Architecture

> **Document Version**: 1.0.0  
> **Status**: Review Draft for User Approval  
> **Scope**: Dashboard, Web Studio, Standalone `/subscribe` Checkout, Razorpay Integration, and Domain Provisioning.

---
## 1. Executive Summary & Core Plan Distinction

MyFolio operates on a freemium architecture: every visitor can start with **Free Starter** for evaluation without a credit card. When ready to publish permanently and remove the 24-hour preview timer, users choose between two publishing models with limited-time launch pricing:

```text
┌─────────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                           THE THREE TIERS                                                   │
├───────────────────────────────┬──────────────────────────────────────────────┬──────────────────────────────┤
│          FREE STARTER         │               LIFETIME STARTER               │          PRO CREATOR         │
│        (Evaluation — ₹0)      │            (One-Time — ₹149)                 │       (Monthly — ₹149/mo)    │
├───────────────────────────────┼──────────────────────────────────────────────┼──────────────────────────────┤
│ DOMAIN: Temporary Preview     │ DOMAIN: Netlify Edge Domain                  │ DOMAIN: Branded Subdomain    │
│    myfolio.tech/p/<site-id>   │    e.g. https://<sitename>.netlify.app       │    https://<name>.myfolio.tech│
│    (24-Hour Expiration)       │    Permanent Edge CDN Link                   │    + Custom Domain (alex.dev)│
├───────────────────────────────┼──────────────────────────────────────────────┼──────────────────────────────┤
│ BILLING: Free Forever (₹0)    │ BILLING: Pay Once Forever (₹149)             │ BILLING: Monthly (₹149/mo)   │
│    No card needed             │    Dropped from ₹749 (Save 80% Limited Deal) │    Dropped from ₹499/mo (70%)│
├───────────────────────────────┼──────────────────────────────────────────────┼──────────────────────────────┤
│ UPDATES: 3 Builds/week        │ UPDATES: Static Deployment                   │ UPDATES: Continuous Live     │
│    24h pass + watermark       │    1 free initial rebuild + ZIP export       │    GitHub sync + switch 3D   │
└───────────────────────────────┴──────────────────────────────────────────────┴──────────────────────────────┘
```

---

## 2. Complete Plan Breakdown

### Tier 1: Free Starter (Evaluation Pass)
*Designed for: Testing out the 3D WebGL engine, customizer, and reviewing your layout before publishing.*

- **Price**: **Free (₹0)**
- **Billing**: No credit card required.
- **Allowance**: 3 portfolio build generations per week.
- **Hosting**: Temporary 24-hour evaluation preview pass (`https://myfolio.tech/p/<site-id>`).
- **Watermark**: Includes draft evaluation watermark and 24-hour countdown timer.
- **Source Code**: Offline ZIP package download is locked (requires upgrade).
- **Subdomain**: No custom or Netlify subdomain; temporary evaluation link only.
- **Expiration**: Preview link automatically locks after 24 hours.

---

### Tier 2: Lifetime Starter — One-Time Payment
*Designed for: Job seekers, students, and freelancers who want a permanent, high-speed live portfolio without any recurring monthly charges.*

- **Display Pricing**:
  - **Launch Offer Price**: **₹149** (One-time payment)
  - **Original Price**: **~~₹749~~** *(Limited Time Deal — Save 80% / Price dropped from ₹749 to ₹149)*
- **Primary Domain Type**:
  - **Netlify Edge Domain**: Hosted directly on Netlify's high-speed global edge network (`https://<sitename>.netlify.app`).
- **What You Are Paying For**:
  1. **Permanent 24/7 Live Hosting**: The 24-hour preview countdown is permanently removed; your portfolio stays online forever.
  2. **100% Watermark-Free**: All preview banners, upgrade pills, and countdown timers are stripped from the site.
  3. **Standalone Source Code (.ZIP) Export**: Instant, one-click download of the complete unbundled source code (HTML5, Vanilla CSS, JS modules, Three.js shaders, and 3D assets). You can host it on Vercel, GitHub Pages, Cloudflare, or AWS.
  4. **1 Full Free Rebuild**: Allows one complete regenerated version if you want to switch styles or update skills.
  5. **Zero Recurring Fees**: Pay ₹149 once and own the live deployment forever.

---

### Tier 3: Pro Creator — Monthly Subscription
*Designed for: Active engineers, consultants, and founders who want a personalized personal brand, live syncing, and continuous portfolio updates.*

- **Display Pricing**:
  - **Launch Offer Price**: **₹149 / month**
  - **Original Price**: **~~₹499 / month~~** *(Limited Time Deal — Save 70% / Price dropped from ₹499 to ₹149/mo)*
- **Primary Domain Type**:
  - **Branded MyFolio Subdomain**: Dedicated vanity address chosen by the user:  
    `https://<users_choice_name>.myfolio.tech` (e.g. `https://abdulaziz.myfolio.tech`).
  - **Custom Domain Connection**: Ability to link your own root domain or external subdomain (e.g. `https://abdulaziz.dev`, `https://john.tech`) with automated SSL.
- **What You Are Paying For**:
  1. **Everything in Lifetime Starter** (Permanent 24/7 hosting, watermark removal, full source code ZIP export).
  2. **Personalized Vanity Subdomain**: Choose your own clean handle (`<users_choice_name>.myfolio.tech`) managed by MyFolio's edge DNS.
  3. **Custom Domain DNS Link**: Full SSL certificate provisioning for your custom domain.
  4. **Continuous Live GitHub Auto-Sync**: The system periodically syncs your public repositories, starred projects, and latest commit activity directly to your portfolio.
  5. **Switch 3D Worlds Anytime**: Switch between any of our curated 3D worlds and visual universes whenever you want.
  6. **Cancel Anytime**: Manage and cancel your monthly renewal directly from your profile settings with 1-click.

---

## 3. Side-by-Side Comparison Matrix

| Feature / Capability | Free Starter (24h) | Lifetime Starter (One-Time) | Pro Creator (Monthly) |
| :--- | :---: | :---: | :---: |
| **Pricing** | ₹0 | **₹149** (~~₹749~~) | **₹149 / month** (~~₹499~~) |
| **Offer Deal Note** | Evaluation Mode | **Save 80% Limited Deal** | **Save 70% Limited Deal** |
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
│                        Publish Permanent Live Website                                  │
│      Choose your publishing model to go live permanently so your site never goes down  │
├──────────────────────────────────────────┬─────────────────────────────────────────────┤
│  LIFETIME STARTER      [ SAVE 80% ]      │  PRO CREATOR            [ MOST POPULAR ]    │
│  Limited Deal: Dropped from ₹749 to ₹149 │  Limited Deal: Dropped from ₹499 to ₹149/mo │
│                                          │                                             │
│  ~~₹749~~                                │  ~~₹499~~                                   │
│  ₹149  / one-time                        │  ₹149  / month                              │
│  Pay once • Zero recurring charges       │  Billed monthly • Cancel anytime            │
│                                          │                                             │
│  Netlify Edge Domain:                    │  Branded Vanity Subdomain:                  │
│  https://<sitename>.netlify.app          │  https://<your_name>.myfolio.tech           │
│                                          │                                             │
│  - Permanent 24/7 Global Hosting         │  - Permanent 24/7 Global Hosting            │
│  - 100% Watermark-Free Live Link         │  - 100% Watermark-Free Live Link            │
│  - Standalone Source Code (.ZIP)         │  - Custom Domain Linking (yourname.dev)     │
│  - 1 Free Style Rebuild                  │  - Continuous Live GitHub Auto-Sync         │
│  - Deployed to Netlify Edge CDN          │  - Switch 3D Worlds Anytime                 │
│                                          │                                             │
│  [ Choose One-Time (₹149) ]              │  [ Choose Pro Subdomain (₹149/mo) ]         │
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
