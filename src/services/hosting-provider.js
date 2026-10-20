/**
 * Hosting Provider - Zero-Credit Self-Hosted & Supabase CDN Engine
 * Hosts generated portfolios directly with zero external build credit limits.
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { NetlifyDeployer } = require('./netlify-deployer');

class HostingProvider {
  constructor(netlifyToken = null, supabaseUrl = null, supabaseKey = null) {
    this.hostUrl = process.env.HOST_URL || 'http://localhost:5050';
    this.useNetlify = (process.env.USE_NETLIFY === 'true' || !!netlifyToken) && process.env.USE_NETLIFY !== 'false';
    
    if (this.useNetlify && netlifyToken) {
      this.netlifyDeployer = new NetlifyDeployer(netlifyToken, supabaseUrl, supabaseKey);
    } else {
      this.netlifyDeployer = null;
    }

    if (supabaseUrl && supabaseKey) {
      try {
        this.supabase = createClient(supabaseUrl, supabaseKey);
      } catch (e) {
        this.supabase = null;
      }
    } else {
      this.supabase = null;
    }
  }

  /**
   * Deploy site files locally and to Supabase Storage CDN (0 credit limits)
   * Netlify is restricted strictly to PAID / ACTIVE subscribers.
   */
  async deploy(siteId, siteFiles, userData = {}, isPaid = false) {
    let html = '';
    let css = '';
    let js = '';

    if (typeof siteFiles === 'string') {
      html = siteFiles;
    } else if (siteFiles && typeof siteFiles === 'object') {
      html = siteFiles.html || '';
      css = siteFiles.css || '';
      js = siteFiles.js || '';
    }

    const os = require('os');
    let siteDir = path.join(process.cwd(), 'public', 'sites', siteId);

    // 1. Save locally for instant, zero-latency serving (falls back to /tmp if read-only filesystem)
    try {
      if (!fs.existsSync(siteDir)) {
        await fs.promises.mkdir(siteDir, { recursive: true });
      }
      await Promise.all([
        fs.promises.writeFile(path.join(siteDir, 'index.html'), html, 'utf8'),
        css ? fs.promises.writeFile(path.join(siteDir, 'style.css'), css, 'utf8') : Promise.resolve(),
        js ? fs.promises.writeFile(path.join(siteDir, 'script.js'), js, 'utf8') : Promise.resolve(),
        fs.promises.writeFile(path.join(siteDir, 'profile.json'), JSON.stringify(userData, null, 2), 'utf8')
      ]);
    } catch (fsErr) {
      siteDir = path.join(os.tmpdir(), 'sites', siteId);
      try {
        if (!fs.existsSync(siteDir)) {
          await fs.promises.mkdir(siteDir, { recursive: true });
        }
        await Promise.all([
          fs.promises.writeFile(path.join(siteDir, 'index.html'), html, 'utf8'),
          css ? fs.promises.writeFile(path.join(siteDir, 'style.css'), css, 'utf8') : Promise.resolve(),
          js ? fs.promises.writeFile(path.join(siteDir, 'script.js'), js, 'utf8') : Promise.resolve(),
          fs.promises.writeFile(path.join(siteDir, 'profile.json'), JSON.stringify(userData, null, 2), 'utf8')
        ]);
      } catch (tmpErr) {
        // Non-blocking fallback
      }
    }

    // Generate genuine ATS-friendly PDF resume for the portfolio owner
    try {
      const { ResumePdfGenerator } = require('./resume-pdf-generator');
      await ResumePdfGenerator.saveSiteResumePdf(siteDir, userData);
    } catch (pdfErr) {
      console.warn('[PDF] Automatic resume generation notice:', pdfErr.message);
    }

    let deployUrl = `${this.hostUrl}/p/${siteId}`;
    let provider = 'self_hosted';

    // 2. Sync to Supabase Storage Bucket (survives cloud container restarts & redeployments)
    if (this.supabase) {
      try {
        await this.supabase.storage
          .from('portfolios')
          .upload(`${siteId}/index.html`, Buffer.from(html), {
            contentType: 'text/html',
            upsert: true
          });
      } catch (sbErr) {
        // Non-blocking
      }
    }

    // 3. ONLY deploy to Netlify if user is PAID / ACTIVE subscriber
    // Unpaid preview trials (24-hour limit) are strictly self-hosted with watermarks
    if (isPaid && this.useNetlify && this.netlifyDeployer) {
      try {
        const netlifyRes = await this.netlifyDeployer.deploySite(siteId, siteFiles, userData);
        if (netlifyRes?.deployUrl) {
          deployUrl = netlifyRes.deployUrl;
          provider = 'netlify';
        }
      } catch (netErr) {
        console.warn('[HOSTING] Netlify unavailable/credit exhausted. Using zero-credit self-hosted URL:', deployUrl);
      }
    }

    return {
      siteId,
      deployUrl,
      url: deployUrl,
      provider
    };
  }

  /**
   * Retrieves site HTML from local disk or /tmp, falling back to Supabase Storage if disk was reset
   */
  async getSiteHtml(siteId) {
    const os = require('os');
    const candidates = [
      path.join(process.cwd(), 'public', 'sites', siteId, 'index.html'),
      path.join(os.tmpdir(), 'sites', siteId, 'index.html')
    ];
    for (const filePath of candidates) {
      if (fs.existsSync(filePath)) {
        try {
          return fs.readFileSync(filePath, 'utf8');
        } catch (e) {}
      }
    }

    // Fallback: Check Supabase Storage with fast timeout
    if (this.supabase) {
      try {
        const downloadPromise = this.supabase.storage
          .from('portfolios')
          .download(`${siteId}/index.html`);
        const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ data: null, error: 'timeout' }), 3000));
        const { data, error } = await Promise.race([downloadPromise, timeoutPromise]);
        if (data && !error && typeof data.text === 'function') {
          const html = await data.text();
          // Restore to local filesystem or /tmp so subsequent requests are instant
          try {
            const siteDir = path.join(process.cwd(), 'public', 'sites', siteId);
            if (!fs.existsSync(siteDir)) {
              fs.mkdirSync(siteDir, { recursive: true });
            }
            fs.writeFileSync(path.join(siteDir, 'index.html'), html, 'utf8');
          } catch (writeErr) {
            try {
              const tmpSiteDir = path.join(os.tmpdir(), 'sites', siteId);
              if (!fs.existsSync(tmpSiteDir)) {
                fs.mkdirSync(tmpSiteDir, { recursive: true });
              }
              fs.writeFileSync(path.join(tmpSiteDir, 'index.html'), html, 'utf8');
            } catch (tmpErr) {}
          }
          return html;
        }
      } catch (err) {
        // Non-blocking
      }
    }

    return null;
  }

  /**
   * Complete multi-surface purge for 24-hour preview timeouts or lapsed subscriptions
   */
  async purge(siteId) {
    const siteDir = path.join(process.cwd(), 'public', 'sites', siteId);
    if (fs.existsSync(siteDir)) {
      try {
        fs.rmSync(siteDir, { recursive: true, force: true });
      } catch (e) {}
    }
    if (this.useNetlify && this.netlifyDeployer) {
      try {
        await this.netlifyDeployer.deleteSite(siteId);
      } catch (e) {}
    }
    if (this.supabase) {
      try {
        await this.supabase.storage.from('portfolios').remove([`${siteId}/index.html`]);
      } catch (e) {}
    }
  }

  async suspend(siteId) {
    const suspendedHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Portfolio Paused</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; text-align: center; padding: 4rem 1rem; background: #090d16; color: #f3f4f6; }
    .card { max-width: 480px; margin: 0 auto; background: #111827; border: 1px solid rgba(255,255,255,0.08); padding: 2.5rem; border-radius: 16px; }
    h1 { font-size: 1.5rem; margin-bottom: 0.75rem; }
    p { color: #9ca3af; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
  </style>
</head>
<body>
  <div class="card">
    <div style="font-size: 3rem; margin-bottom: 1rem;">⏸️</div>
    <h1>Portfolio Temporarily Paused</h1>
    <p>This portfolio is currently inactive due to subscription renewal grace period.</p>
  </div>
</body>
</html>`;

    const siteDir = path.join(process.cwd(), 'public', 'sites', siteId);
    if (fs.existsSync(siteDir)) {
      fs.writeFileSync(path.join(siteDir, 'index.html'), suspendedHtml);
    }
  }

  async restore(siteId, originalHtml) {
    if (!originalHtml) return;
    const siteDir = path.join(process.cwd(), 'public', 'sites', siteId);
    if (!fs.existsSync(siteDir)) {
      fs.mkdirSync(siteDir, { recursive: true });
    }
    fs.writeFileSync(path.join(siteDir, 'index.html'), originalHtml);
  }

  /**
   * Approves paid portfolio and strips preview watermark overlay & bottom banner
   */
  async approveAndUnwatermark(siteId, userData = {}, fallbackHtml = '') {
    const siteDir = path.join(process.cwd(), 'public', 'sites', siteId);
    const indexPath = path.join(siteDir, 'index.html');
    let html = '';
    
    if (fs.existsSync(indexPath)) {
      html = fs.readFileSync(indexPath, 'utf8');
    } else {
      html = (await this.getSiteHtml(siteId)) || fallbackHtml || (global.__MYFOLIO_DRAFTS_CACHE && global.__MYFOLIO_DRAFTS_CACHE.get(siteId)?.html) || '';
      if (html) {
        try {
          fs.mkdirSync(siteDir, { recursive: true });
          fs.writeFileSync(indexPath, html, 'utf8');
        } catch (e) {}
      }
    }

    if (html) {
      // Strip watermark overlay and floating bar
      const { SiteGenerator } = require('./site-generator');
      html = SiteGenerator.stripPreviewWatermark(html);

      try {
        fs.mkdirSync(siteDir, { recursive: true });
        fs.writeFileSync(indexPath, html, 'utf8');
      } catch (e) {}

      // Keep cache updated
      if (global.__MYFOLIO_DRAFTS_CACHE && global.__MYFOLIO_DRAFTS_CACHE.has(siteId)) {
        global.__MYFOLIO_DRAFTS_CACHE.get(siteId).html = html;
      }

      // Sync clean unwatermarked site to Supabase / Netlify for paid subscriber
      let css = '';
      let js = '';
      if (fs.existsSync(path.join(siteDir, 'style.css'))) {
        try { css = fs.readFileSync(path.join(siteDir, 'style.css'), 'utf8'); } catch (e) {}
      }
      if (fs.existsSync(path.join(siteDir, 'script.js'))) {
        try { js = fs.readFileSync(path.join(siteDir, 'script.js'), 'utf8'); } catch (e) {}
      }

      return await this.deploy(siteId, { html, css, js }, userData, true);
    }

    return { siteId, deployUrl: `${this.hostUrl}/p/${siteId}`, provider: 'self_hosted' };
  }

  async delete(siteId) {
    const siteDir = path.join(process.cwd(), 'public', 'sites', siteId);
    if (fs.existsSync(siteDir)) {
      try {
        fs.rmSync(siteDir, { recursive: true, force: true });
      } catch (e) {
        console.warn(`[HOSTING] Failed to delete directory ${siteDir}:`, e.message);
      }
    }

    if (this.supabase) {
      try {
        await this.supabase.storage.from('portfolios').remove([`${siteId}/index.html`]);
      } catch (e) {}
    }
  }
}

module.exports = { HostingProvider, NetlifyDeployer };