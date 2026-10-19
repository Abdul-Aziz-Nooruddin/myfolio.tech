# ⚡ Harvey Mini - Autonomous Sales Prospector

A lightweight, zero-cost B2B sales prospector powered by your free Google Gemini API.
**100% isolated** from your core application code.

---

### Features
1. **Targeted Business Discovery**: Finds real businesses in any niche and city.
2. **Deep Technical Profiling**: Scans their website, detects CMS/Tech stack (WordPress, Wix, Webflow), identifies missing viewports, poor mobile support, and missing booking systems.
3. **Hyper-Personalized Cold Emails**: Generates a 3-touch sequence pitching your web design / 3D portfolio studio (`myfolio.tech`) using Google's Gemini 3.8 Flash model.
4. **Visual Outbox Dashboard**: An interactive local HTML dashboard to inspect leads, review emails, and 1-click copy drafts or open in your email client.

---

### Usage

Run with default parameters (Architects in Mumbai):
```bash
node tools/prospector/index.js
```

Or customize your niche, city, and number of prospects:
```bash
node tools/prospector/index.js --niche "Interior Designers" --city "Dubai" --limit 5
```

```bash
node tools/prospector/index.js --niche "Dental Clinics" --city "London" --limit 5
```

```bash
node tools/prospector/index.js --niche "Web3 Startups" --city "San Francisco" --limit 3
```

---

### Automated Email Dispatch

To automatically find leads, profile them, write sequences, AND send the emails without manual clicking:
```bash
node tools/prospector/index.js --niche "Fashion Designers" --city "New York" --limit 5 --auto-send
```
* Uses your configured SMTP from `.env` (`support@myfolio.tech` / Titan / Gmail).
* Features automated 10-second pacing between sends to safeguard your domain sender reputation.
* Automatically appends a standard 1-click unsubscribe opt-out footer.

---

### View Output
After running, open the visual dashboard in your browser:
```bash
open tools/prospector/output/dashboard.html
```
Or check the generated `prospects.csv` and `prospects.json` in `tools/prospector/output/`.
