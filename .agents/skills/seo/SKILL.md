---
name: seo
description: Authoritative Technical SEO, Schema.org JSON-LD structured data engine, Core Web Vitals optimization, and Generative Engine Optimization (GEO/AEO/llms.txt) for MyFolio.
---

# MyFolio Technical SEO & GEO Optimization Engine

This skill encapsulates authoritative technical search engine optimization, Schema.org JSON-LD structured data, Core Web Vitals optimization, and Generative Engine Optimization (GEO) for MyFolio platform pages and dynamically generated developer portfolios.

---

## 1. Core Technical SEO Rules & Invariants

1. **Strict Canonical Hostname**:
   - The authoritative production hostname is `https://www.myfolio.tech`.
   - Never use non-canonical URLs without `www.` on marketing/public pages.
   - For custom user domains, use `https://<username>.myfolio.tech`.
   - For temporary user preview builds, use `https://www.myfolio.tech/p/<siteId>`.

2. **Indexable vs. Non-Indexable Route Enforcement**:
   - **Public Indexable Routes**: `/`, `/about`, `/contact`, `/pricing`, `/faq`, `/terms`, `/privacy`, `/refund`, `/studio`, `/rbp`, `/jack-3d`, `/nadia`, `/kage`, `/tom`, `/slush`.
     - MUST have unique descriptive `<title>` (40–70 characters).
     - MUST have `<meta name="description">` (120–160 characters).
     - MUST have `<link rel="canonical" href="...">`.
     - MUST have Open Graph (`og:type`, `og:title`, `og:description`, `og:image`, `og:site_name`, `og:url`).
     - MUST have Twitter Card (`twitter:card="summary_large_image"`).
     - MUST have valid Schema.org JSON-LD (`@context: "https://schema.org"`).
   - **Non-Indexable Utility & App Routes**: `/404`, `/admin`, `/auth`, `/login`, `/dashboard`, `/profile`, `/thank-you`.
     - MUST have `<meta name="robots" content="noindex, nofollow">`.
     - MUST NOT be listed in `sitemap.xml`.
     - MUST be disallowed in `robots.txt`.

3. **Sitemap Synchronization (`web/sitemap.xml` & `public/sitemap.xml`)**:
   - Every public indexable route must be present with `<changefreq>`, `<priority>`, and recent `<lastmod>` (YYYY-MM-DD).
   - Previews and templates must include `<image:image>` entries for Google Image Search discovery.

---

## 2. Structured Data (Schema.org JSON-LD) Standards

All platform and generated pages MUST emit clean, valid, unminified or safely serialized JSON-LD:

- **Platform Homepage**: `WebApplication` with `offers` (Free Starter, Lifetime Starter, Pro Creator).
- **Studio Editor**: `WebApplication` with `applicationCategory: "DesignApplication"`.
- **Pricing Page**: `Product` with complete `Offer` list in INR (`priceCurrency: "INR"`).
- **FAQ Page**: `FAQPage` with `Question` and `acceptedAnswer` entities.
- **About Page**: `AboutPage` with `Organization` and founder details.
- **Contact Page**: `ContactPage` with official support coordinates.
- **Generated Portfolios**: Dynamically generated via `SeoMetadataSynthesizer`:
  - `@type: "ProfilePage"`
  - `mainEntity: { @type: "Person", name, jobTitle, description, image, sameAs, knowsAbout }`
  - Optional `hasPart: [{ @type: "CreativeWork", name, description, url }]` for verified portfolio projects.

---

## 3. Generative Engine Optimization (GEO) & AI Search Citation

To ensure high citation frequency by AI answer engines (ChatGPT Search, Perplexity, Gemini, Claude, Google AI Overviews):

1. **`llms.txt` Knowledge Standard**:
   - Maintain `public/llms.txt` and `web/llms.txt` adhering to the `/llms.txt` standard.
   - Every indexable page must link to it: `<link rel="help" href="https://www.myfolio.tech/llms.txt" type="text/plain" title="LLM Knowledge File">`.
   - Maintain authoritative facts (e.g. 100% full source code export ZIP, ₹149 per build pricing, zero vendor lock-in).
2. **Semantic Header Hierarchy**:
   - Exactly ONE `<h1>` per page expressing the primary subject.
   - Strict hierarchical nesting: `<h1>` → `<h2>` → `<h3>`. No skipping levels.
3. **Structured Lists & Case Studies**:
   - AI search models prioritize bulleted facts, clear pricing breakdowns, and explicitly declared technical skills.

---

## 4. Core Web Vitals & WebGL Performance Guidelines

Because MyFolio features rich 3D canvases (Three.js, WebGL shaders, Lenis inertia scrolling):

1. **LCP (Largest Contentful Paint)**:
   - Preload critical hero backdrop images (`<link rel="preload" as="image" href="...">`).
   - Deliver all focal images in WebP with explicit `width`, `height`, and `decoding="async"`.
2. **CLS (Cumulative Layout Shift)**:
   - Provide aspect ratio wrappers (`aspect-ratio: 16/9` or fixed CSS dimensions) for 3D canvas containers to prevent layout shift during WebGL initialization.
3. **INP & CPU Hygiene**:
   - Suspend Three.js `requestAnimationFrame` render loops when canvas is scrolled out of viewport (via `IntersectionObserver`).
   - Immediately honor `prefers-reduced-motion: reduce` by disabling canvas rotation and disabling Lenis smooth wheel.

---

## 5. Verification Commands

Always run the automated verification script before committing SEO changes:
```bash
npm run audit:seo
# Or directly:
node scripts/audit-seo.js
```
The script runs 66+ checks across technical discovery, public marketing pages, non-indexable routes, and the dynamic portfolio synthesizer.
