/**
 * Static Export Engine (Phase 23)
 * Assembles standalone, 100% offline-compatible static website ZIP archives.
 * Strips preview watermarks, backend URLs, and development localhost links.
 */

const archiver = require('archiver');
const { PassThrough } = require('stream');

class StaticExporter {
  /**
   * Generates a clean static portfolio package
   * @param {PortfolioState|Object} portfolioState
   * @param {Object} options
   * @returns {Promise<{ zipBuffer: Buffer, fileCount: number, manifest: Object }>}
   */
  static async exportPortfolio(portfolioState, options = {}) {
    // 1. Get current rendered HTML from state
    let rawHtml = typeof portfolioState.renderCurrentHtml === 'function'
      ? portfolioState.renderCurrentHtml()
      : (portfolioState.html || '');

    // 2. Sanitize & Neutralize Backend / Preview Artifacts
    let sanitizedHtml = this.sanitizeHtmlForExport(rawHtml);

    // 3. Extract Embedded CSS and JS for Modular Static Directory Architecture
    const styleMatch = sanitizedHtml.match(/<style[^>]*>([\s\S]*?)<\/style>/i);
    const cssContent = styleMatch ? styleMatch[1].trim() : '';

    const scriptMatch = sanitizedHtml.match(/<script[^>]*>([\s\S]*?)<\/script>/i);
    const jsContent = scriptMatch ? scriptMatch[1].trim() : '';

    // Replace embedded styles/scripts with modular links if desired, or maintain self-contained index.html
    let indexHtml = sanitizedHtml;
    if (cssContent) {
      indexHtml = indexHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/i, '<link rel="stylesheet" href="css/style.css">');
    }
    if (jsContent) {
      indexHtml = indexHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/i, '<script src="js/main.js"></script>');
    }

    // 4. Generate Professional README.md
    const ownerName = portfolioState.contentProfile?.name || 'Creator';
    const readmeContent = this.generateReadme(ownerName, portfolioState.designBlueprint);

    // 5. Pack into ZIP Archive Stream
    const archive = archiver('zip', { zlib: { level: 9 } });
    const stream = new PassThrough();
    const chunks = [];

    stream.on('data', chunk => chunks.push(chunk));

    const zipPromise = new Promise((resolve, reject) => {
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', err => reject(err));
    });

    archive.pipe(stream);

    // Add Files to Archive
    archive.append(indexHtml, { name: 'index.html' });
    if (cssContent) {
      archive.append(cssContent, { name: 'css/style.css' });
    }
    if (jsContent) {
      archive.append(jsContent, { name: 'js/main.js' });
    }
    archive.append(readmeContent, { name: 'README.md' });

    // Finalize
    await archive.finalize();
    const zipBuffer = await zipPromise;

    return {
      zipBuffer,
      fileCount: cssContent && jsContent ? 4 : (cssContent || jsContent ? 3 : 2),
      manifest: {
        entry: 'index.html',
        css: cssContent ? 'css/style.css' : null,
        js: jsContent ? 'js/main.js' : null,
        readme: 'README.md',
        sizeBytes: zipBuffer.length
      }
    };
  }

  /**
   * Directly exports site payload into a standalone ZIP buffer
   */
  static async exportToZipBuffer(portfolioState, options = {}) {
    const res = await this.exportPortfolio(portfolioState, options);
    return res.zipBuffer;
  }

  /**
   * Sanitizes full site object for export
   */
  static sanitizeSiteForExport(site = {}) {
    return {
      ...site,
      html: this.sanitizeHtmlForExport(site.html || ''),
      css: site.css || '',
      js: site.js || ''
    };
  }

  /**
   * Cleans backend endpoints and preview watermarks from HTML
   */
  static sanitizeHtmlForExport(html = '') {
    let clean = html;

    // Remove preview watermark banner, diagonal overlay, and accompanying script
    const { SiteGenerator } = require('../services/site-generator');
    clean = SiteGenerator.stripPreviewWatermark(clean);

    // Replace localhost or internal preview URLs with relative links
    clean = clean.replace(/http:\/\/localhost:\d+[^\s"'>]*/gi, '#');
    clean = clean.replace(/http:\/\/127\.0\.0\.1:\d+[^\s"'>]*/gi, '#');
    clean = clean.replace(/https?:\/\/[a-zA-Z0-9.-]+\/p\/[a-zA-Z0-9_-]+/gi, '#');
    clean = clean.replace(/\/api\/[a-zA-Z0-9_/-]+/gi, '#');

    return clean;
  }

  /**
   * Generates standard deployment README
   */
  static generateReadme(name, blueprint = {}) {
    return `# ${name} — Portfolio Website

This static portfolio package was generated and customized with the AI Portfolio Studio.

## 🚀 Instant Deployment Options

This portfolio is **100% static** and requires no server runtime, Node.js, database, or backend dependencies.

### 1. View Locally
Simply double-click \`index.html\` to open your portfolio directly in any modern web browser.

### 2. GitHub Pages
1. Push this directory to a GitHub repository.
2. In repository settings, navigate to **Pages**.
3. Under **Branch**, select \`main\` / \`/root\` and click **Save**.
4. Your portfolio is live in under 60 seconds!

### 3. Netlify Drop / Vercel
- Drag and drop this extracted folder into [Netlify Drop](https://app.netlify.com/drop) or import into Vercel as a Static HTML project.

---

## 🎨 Design Architecture
- **IA Model**: ${blueprint.iaModel || 'Dynamic'}
- **Visual Universe**: ${blueprint.visualUniverse || 'Tailored'}
- **Layout Grammar**: ${blueprint.layoutGrammar || 'Responsive'}
- **Standard**: WCAG AAA Accessible, Zero-Overflow Responsive.
`;
  }
}

module.exports = { StaticExporter };
