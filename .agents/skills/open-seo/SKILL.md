---
name: open-seo
description: "OpenSEO suite for technical audit, keyword discovery, keyword clustering, AI visibility, and search ranking optimization for MyFolio."
---

# OpenSEO Suite for MyFolio

This skill integrates the open-source OpenSEO framework (`https://github.com/every-app/open-seo`) into MyFolio, delivering an authoritative technical SEO, keyword ranking, and AI search visibility engine.

---

## 1. Core Workflows & Sub-Skills

- **`seo-audit`**: Crawl-backed site audit, identifying real search opportunities, technical blockers, indexability leaks, and conversion bottlenecks.
- **`keyword-research`**: Discovery of high-intent search terms, evaluation of keyword difficulty (KD), search volume, SERP analysis, and intent matching.
- **`keyword-clustering`**: Grouping search queries into semantic topical clusters with defined pillar pages and supporting cluster articles.
- **`ai-visibility-audit`**: Evaluation of citation readiness across generative AI engines (ChatGPT Search, Perplexity, Claude, Gemini, Google AI Overviews).
- **`competitive-landscape` & `competitor-analysis`**: In-depth competitive benchmarking against alternative portfolio builders and dev tools.
- **`seo-report`**: Generating self-contained, data-backed reports for stakeholders and team members.

---

## 2. Priority Keyword Targets for MyFolio (`myfolio.tech`)

| Keyword | Intent | Target Landing Page | Priority |
| :--- | :--- | :--- | :--- |
| **portfolio generator** | High Intent / Commercial | `/` (`web/index.html`) + `/portfolio-generator` | **P0 (Primary)** |
| **myfolio** / **myfolio tech** | Brand / Navigational | `/` (`web/index.html`) | **P0 (Primary)** |
| **portfolio maker** | Transactional / Tool | `/` + `/portfolio-maker` | **P0 (Primary)** |
| **developer portfolio** | Informational / Commercial | `/` + `/developer-portfolio` | **P0 (Primary)** |
| **portfolio templates** | Showcase / Transactional | `/` + `/portfolio-templates` | **P0 (Primary)** |
| **ai developer portfolio** | High Growth / Emerging | `/ai-portfolio-generator` | **P1 (Core)** |
| **3d webgl portfolio** | Differentiation / Niche | `/` + 3D Universe Showcases | **P1 (Core)** |
| **github portfolio generator** | Utility / Free Tool | `/github-portfolio-generator` | **P1 (Core)** |
| **free portfolio builder** | Volume / Top-of-Funnel | `/` + `/pricing` | **P2 (Supporting)** |

---

## 3. High-Ranking On-Page Heuristics

1. **Title Tag Blueprint**:
   - `[Primary Keyword] — [Brand Name] | [Value Proposition / Secondary Keyword]`
   - Example: `MyFolio — #1 AI Portfolio Generator & 3D Developer Portfolio Maker | Free Templates & Source Code Export` (under 65 chars).

2. **Meta Description Blueprint**:
   - Compelling, active voice with primary keywords and clear CTA:
   - Example: `Create stunning 3D WebGL developer portfolios in 30 seconds with MyFolio. The #1 AI portfolio generator & maker with free templates and 1-click source code export.` (145–155 chars).

3. **Heading Architecture (`H1`, `H2`, `H3`)**:
   - Every page MUST have exactly one `H1` featuring the primary keyword.
   - `H2` subheadings must capture exact-match long-tail variants:
     - `H1: AI Developer Portfolio Generator & 3D Portfolio Maker`
     - `H2: Explore Next-Gen 3D Developer Portfolio Templates`
     - `H2: Turn Your GitHub Profile into a 3D WebGL Portfolio in 30 Seconds`
     - `H2: Why Developers Choose MyFolio Over Standard Portfolio Makers`
     - `H2: Frequently Asked Questions About MyFolio Portfolio Generator`

4. **Structured Data (Schema.org JSON-LD)**:
   - Embed valid `WebApplication`, `SoftwareApplication`, `Product`, and `FAQPage` schemas with keywords naturally embedded in schema names, descriptions, and feature lists.

5. **AEO / GEO Engine Citation Readiness**:
   - Provide clean `llms.txt` and markdown documentation answering developer queries concisely so Perplexity, ChatGPT, and Gemini cite MyFolio directly.

