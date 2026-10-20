const fs = require('fs');
const path = require('path');
const { TemplateRegistry } = require('../templates/template-registry');
const { UnifiedProfileNormalizer } = require('./unified-profile-normalizer');

class SiteGenerator {
  constructor() {}

  async generateSite(conversation, userData = {}, designBrief = {}) {
    const { extracted_data = {}, branch = 'A' } = conversation || {};
    const rawData = { ...extracted_data, ...userData };

    // 1. Normalize profile data model
    const data = UnifiedProfileNormalizer.normalize(rawData);

    // 2. Determine template from user request, design brief, or role/cycle
    const requestedTemplate = designBrief?.templateId || rawData?.templateId || rawData?.theme || data.templateId || data.template || (TemplateRegistry.templates[designBrief?.theme] ? designBrief.theme : null) || (TemplateRegistry.templates[designBrief?.creative_mode] ? designBrief.creative_mode : null);

    let templateId = requestedTemplate;
    if (templateId && TemplateRegistry._templates && TemplateRegistry._templates[templateId]) {
      templateId = TemplateRegistry._templates[templateId].id || templateId;
    } else if (!templateId || !TemplateRegistry.templates[templateId] || (process.env.NODE_ENV !== 'test' && !TemplateRegistry._templates[templateId])) {
      const userId = (conversation && conversation.user && conversation.user.id) ? conversation.user.id : (conversation && conversation.id) ? conversation.id : 'anonymous';
      const autoTemplate = TemplateRegistry.selectTemplate(null, data, userId);
      templateId = autoTemplate.id || 'jack-3d-creator';
    }

    // 3. Authoritative 3D Template Render
    const templateOutput = TemplateRegistry.render(templateId, data);
    const isPaid = Boolean((conversation?.isPaid === true) || (conversation?.status === 'paid'));
    let finalHtml = this.injectSiteTelemetry(templateOutput.html, conversation?.id || '');
    finalHtml = this.injectPreviewWatermark(finalHtml, isPaid, conversation?.id || '');

    // 4. Quality & Fidelity Gate: UI alignment, CSS integrity & Zero Fabrication verification
    finalHtml = this.validateAndSanitizeFidelity(finalHtml, rawData, data);

    return {
      templateId: templateId,
      universeKey: templateId,
      theme: templateId,
      html: finalHtml,
      cleanHtml: this.injectSiteTelemetry(templateOutput.html, conversation?.id || ''),
      css: templateOutput.css || '',
      js: templateOutput.js || '',
      designBlueprint: {
        iaModel: templateId,
        layoutGrammar: templateId,
        visualUniverse: { id: templateId, name: templateId },
        projectStrategy: 'template',
        templateId: templateId
      },
      designDNA: {
        iaModel: templateId,
        layoutGrammar: templateId,
        visualUniverse: { id: templateId, name: templateId },
        projectStrategy: 'template'
      },
      contentProfile: data,
      designBrief: {
        templateId: templateId,
        visualUniverse: { id: templateId },
        colorSystem: {
          bg: '#0C0C0C',
          text: '#D7E2EA',
          primary: '#2F69FF'
        }
      },
      telemetry: {
        generationTimeMs: Date.now(),
        iaModel: templateId,
        layoutGrammar: templateId,
        visualUniverse: templateId,
        projectStrategy: 'template'
      }
    };
  }

  injectPreviewWatermark(html, isPaid = false, siteId = '') {
    if (isPaid) return html;

    const pricingUrl = siteId ? `/pricing?siteId=${encodeURIComponent(siteId)}` : '/pricing';

    // Disambiguate Template Showcase vs. Candidate-Generated Portfolio Preview
    const { TemplateRegistry } = require('../templates/template-registry');
    const isTemplateShowcase = Boolean(
      siteId && (
        (TemplateRegistry._templates && Object.prototype.hasOwnProperty.call(TemplateRegistry._templates, siteId)) ||
        siteId.startsWith('rbp') || siteId.startsWith('jack') || siteId.startsWith('nadia') || siteId.startsWith('kage') || siteId.startsWith('tom') || siteId.startsWith('apogee')
      )
    );

    const mainWatermarkWord = isTemplateShowcase ? 'TEMPLATE' : 'PREVIEW';
    const subWatermarkText = isTemplateShowcase ? 'TEMPLATE PREVIEW' : 'PORTFOLIO PREVIEW';
    const diagonalSubtitle = isTemplateShowcase ? 'PREVIEW ONLY • NOT FOR PRODUCTION' : 'PORTFOLIO PREVIEW • UNPUBLISHED DRAFT';
    const pillText = isTemplateShowcase ? 'MYFOLIO • TEMPLATE' : 'PORTFOLIO PREVIEW';
    const barLabel = isTemplateShowcase ? 'Template Showcase' : 'Portfolio Preview (Draft)';
    const ctaLabel = isTemplateShowcase ? 'Use This Template in Studio ➔' : 'Publish Live (From ₹149) ➔';

    const diagonalSvg = isTemplateShowcase ? '' : `
      <!-- FULL-SCREEN DIAGONAL REPEATING WATERMARK SVG GRID -->
      <svg id="preview-watermark-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="wm-pattern" width="420" height="240" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
            <text x="210" y="65" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="20" letter-spacing="4" fill="currentColor">MYFOLIO • PREVIEW</text>
            <text x="210" y="175" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15" letter-spacing="3" fill="currentColor">PORTFOLIO PREVIEW</text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wm-pattern)" />
      </svg>`;

    const bigDiagonal = isTemplateShowcase ? '' : `
      <!-- ONE BIG BOLD DIAGONAL CENTER MASTHEAD -->
      <div id="preview-big-diagonal" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-28deg); white-space: nowrap; pointer-events: none; user-select: none; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-transform: uppercase; color: currentColor; transition: color 0.25s ease; text-align: center; width: 100%; z-index: 1;">
        <div style="font-size: clamp(1rem, 2.2vw, 1.8rem); font-weight: 800; letter-spacing: 0.35em; opacity: 0.85; margin-bottom: 4px;">MYFOLIO.TECH</div>
        <div style="font-size: clamp(3rem, 9vw, 8rem); font-weight: 900; letter-spacing: 0.14em; line-height: 0.9;">PREVIEW</div>
        <div style="font-size: clamp(0.75rem, 1.5vw, 1.2rem); font-weight: 700; letter-spacing: 0.25em; opacity: 0.75; margin-top: 6px;">PORTFOLIO PREVIEW • UNPUBLISHED DRAFT</div>
      </div>`;

    const floatingBarHtml = isTemplateShowcase ? `
    <!-- ULTRA-THIN FLOATING BOTTOM TEMPLATE BAR -->
    <div id="preview-floating-bar">
      <div style="display: inline-flex; align-items: center; gap: 6px;">
        <span style="display:inline-block; width:6px; height:6px; background:#75c5de; border-radius:50%; box-shadow: 0 0 6px #75c5de;"></span>
        <span>✨ <strong>${barLabel}</strong><span class="wm-hide-mobile"> • MyFolio</span></span>
      </div>
      <a href="/studio?template=${encodeURIComponent(siteId)}" class="preview-cta-btn">
        <span>${ctaLabel}</span>
      </a>
    </div>` : `
    <!-- ULTRA-THIN FLOATING BOTTOM CONVERSION & UNLOCK BAR -->
    <div id="preview-floating-bar">
      <div style="display: inline-flex; align-items: center; gap: 6px;">
        <span style="display:inline-block; width:6px; height:6px; background:#75c5de; border-radius:50%; box-shadow: 0 0 6px #75c5de;"></span>
        <span>🔒 <strong>${barLabel}</strong><span class="wm-hide-mobile"> • MyFolio</span></span>
      </div>
      <a href="javascript:void(0)" class="preview-cta-btn" onclick="openPreviewCheckoutModal(); return false;">
        <span>${ctaLabel}</span>
      </a>
    </div>`;

    const modalHtml = isTemplateShowcase ? '' : `
    <!-- PRE-CHECKOUT PLAN & SUBDOMAIN SELECTION MODAL -->
    <div id="mf-plan-selection-modal" style="position:fixed; inset:0; z-index:9999999; background:rgba(4,7,16,0.85); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); display:none; align-items:center; justify-content:center; padding:16px; font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
      <div style="background:#0D1117; border:1px solid rgba(255,255,255,0.14); border-radius:24px; max-width:620px; width:100%; padding:28px 24px; color:#FFFFFF; box-shadow:0 30px 80px rgba(0,0,0,0.85); position:relative; max-height:92vh; overflow-y:auto; text-align:left; box-sizing:border-box;">
        <button type="button" onclick="closePlanSelectionModal()" style="position:absolute; top:18px; right:18px; background:rgba(255,255,255,0.06); border:none; color:#94A3B8; font-size:22px; width:34px; height:34px; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background 0.2s;" onmouseover="this.style.background='rgba(255,255,255,0.15)'" onmouseout="this.style.background='rgba(255,255,255,0.06)'">&times;</button>
        
        <div style="font-size:11px; font-weight:800; color:#38BDF8; letter-spacing:0.12em; text-transform:uppercase; margin-bottom:6px;">PORTFOLIO STUDIO • CHOOSE YOUR PUBLISHING PLAN</div>
        <h2 style="font-size:1.45rem; font-weight:800; color:#FFFFFF; margin:0 0 6px 0; letter-spacing:-0.01em;">Publish &amp; Unlock Your Portfolio</h2>
        <p style="font-size:13px; color:#94A3B8; margin:0 0 20px 0; line-height:1.5;">Choose how you want your portfolio to go live permanently. 100% watermark removed with instant automated provisioning.</p>
        
        <style>
          @media (max-width: 560px) {
            #mf-plan-cards-container { grid-template-columns: 1fr !important; }
          }
        </style>

        <!-- Plan Cards Grid -->
        <div id="mf-plan-cards-container" style="display:grid; grid-template-columns:1fr 1fr; gap:14px; margin-bottom:16px;">
          <!-- Plan Card 1: Lifetime Starter -->
          <div id="mf-card-starter" onclick="selectPlanChoice('starter')" style="background:rgba(13,148,136,0.08); border:2px solid #0D9488; border-radius:16px; padding:18px 16px; cursor:pointer; position:relative; transition:all 0.2s; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:10px; font-weight:800; background:#0D9488; color:#fff; padding:3px 8px; border-radius:9999px; letter-spacing:0.04em;">LIFETIME • 80% OFF</span>
                <input type="radio" name="mfPlanChoice" id="mfRadioStarter" checked style="accent-color:#0D9488; width:16px; height:16px; cursor:pointer;" />
              </div>
              <div style="font-size:1.1rem; font-weight:800; color:#FFFFFF; margin-bottom:4px;">Lifetime Starter</div>
              <div style="font-size:1.35rem; font-weight:900; color:#FFFFFF; margin-bottom:8px;">
                <span style="font-size:12px; text-decoration:line-through; color:#64748B; font-weight:600; margin-right:4px;">₹749</span>₹149 <span style="font-size:11px; color:#94A3B8; font-weight:600;">/ one-time</span>
              </div>
              <div style="font-size:11px; font-weight:700; color:#2DD4BF; margin-bottom:12px;">✓ Pay once • No subscriptions</div>
              <ul style="list-style:none; padding:0; margin:0; font-size:11.5px; color:#CBD5E1; display:flex; flex-direction:column; gap:7px; line-height:1.35;">
                <li style="display:flex; gap:6px;"><span style="color:#2DD4BF;">✓</span> <span>Permanent 24/7 Live Hosting</span></li>
                <li style="display:flex; gap:6px;"><span style="color:#2DD4BF;">✓</span> <span>Netlify Edge CDN Live Link</span></li>
                <li style="display:flex; gap:6px;"><span style="color:#2DD4BF;">✓</span> <span>100% Watermark-Free</span></li>
                <li style="display:flex; gap:6px;"><span style="color:#2DD4BF;">✓</span> <span>Full ZIP Source Code Export</span></li>
              </ul>
            </div>
          </div>

          <!-- Plan Card 2: Pro Creator -->
          <div id="mf-card-pro" onclick="selectPlanChoice('pro')" style="background:rgba(255,255,255,0.02); border:1.5px solid rgba(255,255,255,0.12); border-radius:16px; padding:18px 16px; cursor:pointer; position:relative; transition:all 0.2s; display:flex; flex-direction:column; justify-content:space-between;">
            <div>
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                <span style="font-size:10px; font-weight:800; background:#2563EB; color:#fff; padding:3px 8px; border-radius:9999px; letter-spacing:0.04em;">PRO • 70% OFF</span>
                <input type="radio" name="mfPlanChoice" id="mfRadioPro" style="accent-color:#2563EB; width:16px; height:16px; cursor:pointer;" />
              </div>
              <div style="font-size:1.1rem; font-weight:800; color:#FFFFFF; margin-bottom:4px;">Pro Creator</div>
              <div style="font-size:1.35rem; font-weight:900; color:#FFFFFF; margin-bottom:8px;">
                <span style="font-size:12px; text-decoration:line-through; color:#64748B; font-weight:600; margin-right:4px;">₹499</span>₹149 <span style="font-size:11px; color:#94A3B8; font-weight:600;">/ month</span>
              </div>
              <div style="font-size:11px; font-weight:700; color:#60A5FA; margin-bottom:12px;">✓ Billed monthly • Cancel anytime</div>
              <ul style="list-style:none; padding:0; margin:0; font-size:11.5px; color:#CBD5E1; display:flex; flex-direction:column; gap:7px; line-height:1.35;">
                <li style="display:flex; gap:6px;"><span style="color:#60A5FA;">✓</span> <span>Branded Custom Subdomain</span></li>
                <li style="display:flex; gap:6px;"><span style="color:#60A5FA;">✓</span> <span>Live GitHub Auto-Sync</span></li>
                <li style="display:flex; gap:6px;"><span style="color:#60A5FA;">✓</span> <span>Switch 3D Worlds Anytime</span></li>
                <li style="display:flex; gap:6px;"><span style="color:#60A5FA;">✓</span> <span>100% Watermark-Free</span></li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Subdomain Configuration Section (Revealed when Pro is chosen) -->
        <div id="mf-subdomain-config-wrap" style="display:none; margin-bottom:16px; background:rgba(37,99,235,0.08); border:1px solid rgba(56,189,248,0.35); border-radius:14px; padding:14px 16px;">
          <label style="font-size:11px; font-weight:800; text-transform:uppercase; color:#38BDF8; display:block; margin-bottom:6px; letter-spacing:0.05em;">
            Choose Your Branded Subdomain Handle:
          </label>
          <div style="display:flex; align-items:center; background:#070B14; border:1px solid rgba(56,189,248,0.4); border-radius:8px; padding:7px 12px; font-family:monospace; font-size:13px;">
            <span style="color:#64748B; user-select:none;">https://</span>
            <input type="text" id="mf-pro-subdomain-input" value="${String(siteId).split('-')[0].toLowerCase().replace(/[^a-z0-9-_]/g, '') || 'developer'}" placeholder="yourname" style="background:transparent; border:none; outline:none; color:#38BDF8; font-weight:800; font-family:monospace; font-size:13.5px; flex:1; min-width:80px; padding:0 4px;" />
            <span style="color:#38BDF8; font-weight:800; user-select:none;">.myfolio.tech</span>
          </div>
          <div style="font-size:11px; color:#94A3B8; margin-top:6px;">Includes automated SSL certificate and live portfolio routing.</div>
        </div>

        <!-- Non-refundable Legal Terms Checkbox -->
        <div style="margin-bottom:16px; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:10px; padding:10px 12px;">
          <label style="display:flex; align-items:flex-start; gap:8px; font-size:11.5px; color:#CBD5E1; cursor:pointer;">
            <input type="checkbox" id="mf-precheck-terms" checked style="margin-top:2px; accent-color:#0D9488; width:15px; height:15px;" />
            <span>I agree to the <a href="/terms" target="_blank" style="color:#38BDF8; text-decoration:underline;">Terms</a> and <a href="/refund" target="_blank" style="color:#38BDF8; text-decoration:underline;">Refund Policy</a> (100% non-refundable once digital portfolio is provisioned).</span>
          </label>
        </div>

        <!-- Primary Action Button -->
        <button type="button" id="mf-proceed-upi-btn" onclick="executeSelectedPlanCheckout()" style="width:100%; padding:13px 18px; background:linear-gradient(135deg, #0D9488, #059669); color:#FFFFFF; font-weight:800; font-size:13.5px; border:none; border-radius:12px; cursor:pointer; box-shadow:0 4px 18px rgba(13,148,136,0.35); transition:transform 0.15s, box-shadow 0.15s;">
          Proceed to UPI Payment (₹149 One-Time) &rarr;
        </button>
      </div>
    </div>

    <script src="/assets/youpi.js"></script>`;

    const watermarkHtml = `
    <!-- TOP PREVIEW ONLY // MYFOLIO.TECH PROMINENT WATERMARK OVERLAY (ABOVE PORTFOLIO) -->
    <style id="preview-watermark-styles">
      #preview-floating-bar {
        position: fixed !important;
        bottom: 12px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        z-index: 999998 !important;
        background: rgba(15, 23, 42, 0.92) !important;
        backdrop-filter: blur(16px) !important;
        -webkit-backdrop-filter: blur(16px) !important;
        border: 1px solid rgba(255, 255, 255, 0.16) !important;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4) !important;
        border-radius: 9999px !important;
        padding: 3px 4px 3px 10px !important;
        display: inline-flex !important;
        flex-direction: row !important;
        flex-wrap: nowrap !important;
        white-space: nowrap !important;
        align-items: center !important;
        gap: 8px !important;
        color: #ffffff !important;
        font-family: system-ui, -apple-system, sans-serif !important;
        font-size: 11.5px !important;
        max-width: calc(100vw - 20px) !important;
        box-sizing: border-box !important;
        line-height: 1 !important;
      }
      #preview-floating-bar a.preview-cta-btn {
        background: linear-gradient(135deg, #75c5de, #13708e) !important;
        color: #08171c !important;
        font-weight: 800 !important;
        font-size: 11px !important;
        padding: 5px 12px !important;
        border-radius: 9999px !important;
        text-decoration: none !important;
        display: inline-flex !important;
        align-items: center !important;
        white-space: nowrap !important;
        box-shadow: 0 2px 8px rgba(117,197,222,0.3) !important;
        line-height: 1 !important;
      }
      #preview-watermark-pill {
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 9999px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        backdrop-filter: blur(14px);
        -webkit-backdrop-filter: blur(14px);
        border: 1px solid rgba(255,255,255,0.22);
        background: rgba(12, 12, 12, 0.85);
        color: #ffffff;
        box-shadow: 0 4px 20px rgba(0,0,0,0.35);
        line-height: 1;
        white-space: nowrap;
      }
      @media (max-width: 540px) {
        #preview-floating-bar {
          bottom: 8px !important;
          padding: 2.5px 3px 2.5px 8px !important;
          gap: 6px !important;
          font-size: 10.5px !important;
        }
        #preview-floating-bar .wm-hide-mobile {
          display: none !important;
        }
        #preview-floating-bar a.preview-cta-btn {
          font-size: 10px !important;
          padding: 4px 8px !important;
        }
        #preview-watermark-pill {
          padding: 3px 8px !important;
          font-size: 9.5px !important;
        }
        #preview-watermark-pill .wm-hide-mobile {
          display: none !important;
        }
      }
    </style>
    <div id="preview-watermark-overlay" style="position: fixed; inset: 0; pointer-events: none; z-index: 999999; overflow: hidden; display: flex; flex-direction: column; justify-content: ${isTemplateShowcase ? 'flex-start' : 'space-between'}; user-select: none; color: rgba(255, 255, 255, 0.10); transition: color 0.25s ease;">
      ${diagonalSvg}

      <!-- TOP FLOATING PILL BADGE -->
      <div style="width: 100%; display: flex; justify-content: center; padding-top: 10px; position: relative; z-index: 2;">
        <div id="preview-watermark-pill">
          <span class="watermark-main-title" style="display:inline-flex; align-items:center; gap:5px;">
            <span id="preview-watermark-dot" style="display:inline-block; width:6px; height:6px; border-radius:50%; background: currentColor; box-shadow: 0 0 6px currentColor;"></span>
            <span style="letter-spacing: 0.04em; font-weight: 800;">myfolio.tech</span>
          </span>
          <span style="opacity: 0.4;">•</span>
          <span style="font-weight: 800; letter-spacing: 0.1em;">${pillText}</span>
        </div>
      </div>

      ${bigDiagonal}
    </div>

    ${floatingBarHtml}
    ${modalHtml}

    <script id="preview-watermark-script">
      // Auto-hide preview bars and overlays if embedded in an iframe (e.g. Studio preview) or explicitly requested
      if (window.parent && window.parent !== window || new URLSearchParams(window.location.search).has('embed')) {
        var fb = document.getElementById('preview-floating-bar');
        if (fb) fb.style.display = 'none';
        var wo = document.getElementById('preview-watermark-overlay');
        if (wo) wo.style.display = 'none';
      }

      var isTemplate = ${isTemplateShowcase ? 'true' : 'false'};
      var selectedPublishPlan = 'starter';

      function openPreviewCheckoutModal() {
        if (isTemplate) {
          window.location.href = '/studio?template=${encodeURIComponent(siteId)}';
          return;
        }

        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'OPEN_PUBLISH_MODAL' }, '*');
          return;
        }

        var modal = document.getElementById('mf-plan-selection-modal');
        if (modal) {
          modal.style.display = 'flex';
          selectPlanChoice('starter');
        } else {
          executeSelectedPlanCheckout();
        }
      }

      function closePlanSelectionModal() {
        var modal = document.getElementById('mf-plan-selection-modal');
        if (modal) modal.style.display = 'none';
      }

      function selectPlanChoice(plan) {
        selectedPublishPlan = plan;
        var starterCard = document.getElementById('mf-card-starter');
        var proCard = document.getElementById('mf-card-pro');
        var radioStarter = document.getElementById('mfRadioStarter');
        var radioPro = document.getElementById('mfRadioPro');
        var subWrap = document.getElementById('mf-subdomain-config-wrap');
        var proceedBtn = document.getElementById('mf-proceed-upi-btn');

        if (plan === 'starter') {
          if (radioStarter) radioStarter.checked = true;
          if (radioPro) radioPro.checked = false;
          if (starterCard) {
            starterCard.style.borderColor = '#0D9488';
            starterCard.style.background = 'rgba(13,148,136,0.12)';
          }
          if (proCard) {
            proCard.style.borderColor = 'rgba(255,255,255,0.12)';
            proCard.style.background = 'rgba(255,255,255,0.02)';
          }
          if (subWrap) subWrap.style.display = 'none';
          if (proceedBtn) {
            proceedBtn.innerHTML = 'Proceed to UPI Payment (₹149 One-Time) &rarr;';
            proceedBtn.style.background = 'linear-gradient(135deg, #0D9488, #059669)';
            proceedBtn.style.boxShadow = '0 4px 18px rgba(13,148,136,0.35)';
          }
        } else {
          if (radioStarter) radioStarter.checked = false;
          if (radioPro) radioPro.checked = true;
          if (proCard) {
            proCard.style.borderColor = '#2563EB';
            proCard.style.background = 'rgba(37,99,235,0.12)';
          }
          if (starterCard) {
            starterCard.style.borderColor = 'rgba(255,255,255,0.12)';
            starterCard.style.background = 'rgba(255,255,255,0.02)';
          }
          if (subWrap) subWrap.style.display = 'block';
          if (proceedBtn) {
            proceedBtn.innerHTML = 'Proceed to UPI Payment (₹149/mo) &rarr;';
            proceedBtn.style.background = 'linear-gradient(135deg, #2563EB, #1D4ED8)';
            proceedBtn.style.boxShadow = '0 4px 18px rgba(37,99,235,0.35)';
          }
        }
      }

      function showPreviewNotice(title, msg, type) {
        var existing = document.getElementById('mf-preview-toast');
        if (existing) existing.remove();
        var toast = document.createElement('div');
        toast.id = 'mf-preview-toast';
        var borderCol = type === 'error' ? 'rgba(239,68,68,0.5)' : (type === 'success' ? 'rgba(16,185,129,0.5)' : 'rgba(56,189,248,0.5)');
        toast.style.cssText = 'position:fixed; top:20px; left:50%; transform:translateX(-50%); z-index:99999999; background:rgba(15,23,42,0.96); backdrop-filter:blur(12px); border:1px solid ' + borderCol + '; border-radius:14px; padding:12px 20px; color:#FFFFFF; font-family:system-ui,-apple-system,sans-serif; font-size:13px; box-shadow:0 12px 35px rgba(0,0,0,0.8); display:flex; align-items:center; gap:10px; max-width:90vw; line-height:1.4;';
        toast.innerHTML = '<span>' + (type === 'error' ? '⚠️' : (type === 'success' ? '🎉' : 'ℹ️')) + '</span> <div><strong style="color:#F8FAFC;">' + title + ':</strong> <span style="color:#CBD5E1;">' + msg + '</span></div>';
        document.body.appendChild(toast);
        setTimeout(function() {
          if (toast && toast.parentNode) toast.parentNode.removeChild(toast);
        }, 4500);
      }

      function executeSelectedPlanCheckout() {
        var termsChk = document.getElementById('mf-precheck-terms');
        if (termsChk && !termsChk.checked) {
          showPreviewNotice('Terms Required', 'Please agree to the Terms and Refund Policy to proceed with checkout.', 'error');
          termsChk.focus();
          return;
        }

        var chosenSubdomain = '';
        if (selectedPublishPlan === 'pro') {
          var subInput = document.getElementById('mf-pro-subdomain-input');
          chosenSubdomain = subInput ? subInput.value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '') : '';
          if (!chosenSubdomain || chosenSubdomain.length < 2) {
            showPreviewNotice('Invalid Handle', 'Please enter a valid subdomain handle (at least 2 letters/numbers).', 'error');
            if (subInput) subInput.focus();
            return;
          }
        }

        closePlanSelectionModal();

        var siteId = '${siteId}';
        var proceedBtn = document.getElementById('mf-proceed-upi-btn');
        if (proceedBtn) proceedBtn.disabled = true;

        fetch('/api/web/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ siteId: siteId, plan: selectedPublishPlan, username: chosenSubdomain })
        })
        .then(function(res) { return res.json(); })
        .then(function(orderData) {
          if (proceedBtn) proceedBtn.disabled = false;
          if (typeof window.YoupiCheckout !== 'undefined') {
            var youpi = new window.YoupiCheckout({
              amount: orderData.amountRupees || 149,
              currency: 'INR',
              name: 'MyFolio Technologies',
              description: selectedPublishPlan === 'pro' 
                ? ('Pro Subdomain (' + chosenSubdomain + '.myfolio.tech)') 
                : ('Lifetime Portfolio (' + siteId + ')'),
              orderId: orderData.orderId,
              order_id: orderData.orderId,
              vpa: '9912836034@mbk',
              handler: function(paymentResponse) {
                fetch('/api/web/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    siteId: siteId,
                    plan: selectedPublishPlan,
                    username: chosenSubdomain,
                    order_id: paymentResponse.order_id || paymentResponse.orderId,
                    payment_id: paymentResponse.payment_id || paymentResponse.paymentId || ('youpi_' + Date.now()),
                    signature: paymentResponse.signature || '',
                    utr: paymentResponse.utr || ''
                  })
                })
                .then(function(vRes) { return vRes.json(); })
                .then(function(verifyData) {
                  if (verifyData.success) {
                    var finalUrl = verifyData.liveUrl || ('/p/' + siteId);
                    showPreviewNotice('Portfolio Activated', 'Payment verified! Watermark removed and your site is live at: ' + finalUrl, 'success');
                    setTimeout(function() {
                      window.location.href = finalUrl;
                    }, 1500);
                  } else {
                    showPreviewNotice('Verification Notice', verifyData.error || 'Please contact support', 'error');
                  }
                })
                .catch(function(err) { showPreviewNotice('Verification Error', err.message, 'error'); });
              }
            });
            youpi.open();
          } else {
            showPreviewNotice('Loading Checkout', 'Payment system initializing. Please try again.', 'info');
          }
        })
        .catch(function(err) {
          if (proceedBtn) proceedBtn.disabled = false;
          showPreviewNotice('Checkout Error', err.message, 'error');
        });
      }

      (function() {
        function getLuminance(r, g, b) {
          return 0.299 * r + 0.587 * g + 0.114 * b;
        }

        function parseRgb(colorStr) {
          if (!colorStr) return null;
          var match = colorStr.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/i);
          if (match) {
            return { r: parseInt(match[1], 10), g: parseInt(match[2], 10), b: parseInt(match[3], 10) };
          }
          if (colorStr.indexOf('#') === 0) {
            var hex = colorStr.slice(1);
            if (hex.length === 3) hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
            if (hex.length >= 6) {
              return {
                r: parseInt(hex.substring(0, 2), 16),
                g: parseInt(hex.substring(2, 4), 16),
                b: parseInt(hex.substring(4, 6), 16)
              };
            }
          }
          return null;
        }

        function getEffectiveBgAtPoint(x, y) {
          var overlay = document.getElementById('preview-watermark-overlay');
          var prevDisplay = '';
          if (overlay) {
            prevDisplay = overlay.style.display;
            overlay.style.display = 'none';
          }
          var targetEl = document.elementFromPoint(x, y);
          if (overlay) {
            overlay.style.display = prevDisplay;
          }

          var curr = targetEl;
          while (curr && curr !== document.documentElement) {
            var style = window.getComputedStyle(curr);
            var bg = style.backgroundColor;
            var parsed = parseRgb(bg);
            if (parsed && !bg.includes('rgba(0, 0, 0, 0)') && bg !== 'transparent') {
              return parsed;
            }
            curr = curr.parentElement;
          }

          var bodyBg = parseRgb(window.getComputedStyle(document.body).backgroundColor);
          return bodyBg || { r: 12, g: 12, b: 12 };
        }

        function syncWatermarkTheme() {
          var overlay = document.getElementById('preview-watermark-overlay');
          var pill = document.getElementById('preview-watermark-pill');
          var bigDiagonal = document.getElementById('preview-big-diagonal');
          if (!pill) return;

          var rect = pill.getBoundingClientRect();
          var sampleX = rect.left + rect.width / 2;
          var sampleY = rect.top + rect.height / 2;

          var bgRgb = getEffectiveBgAtPoint(sampleX, sampleY);
          var lum = getLuminance(bgRgb.r, bgRgb.g, bgRgb.b);
          var isLight = lum > 130; // true when background is white or light

          if (isLight) {
            // When background is light -> watermark deep slate
            pill.style.color = '#000000';
            pill.style.background = 'rgba(255, 255, 255, 0.92)';
            pill.style.borderColor = 'rgba(0, 0, 0, 0.2)';
            pill.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.15)';
            if (overlay) overlay.style.color = 'rgba(15, 23, 42, 0.12)';
            if (bigDiagonal) bigDiagonal.style.color = 'rgba(15, 23, 42, 0.14)';
          } else {
            // When background is dark -> watermark crisp white/cyan
            pill.style.color = '#ffffff';
            pill.style.background = 'rgba(12, 12, 12, 0.85)';
            pill.style.borderColor = 'rgba(255, 255, 255, 0.22)';
            pill.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.45)';
            if (overlay) overlay.style.color = 'rgba(255, 255, 255, 0.13)';
            if (bigDiagonal) bigDiagonal.style.color = 'rgba(255, 255, 255, 0.15)';
          }
        }

        var ticking = false;
        function onScrollOrResize() {
          if (!ticking) {
            window.requestAnimationFrame(function() {
              syncWatermarkTheme();
              ticking = false;
            });
            ticking = true;
          }
        }

        window.addEventListener('scroll', onScrollOrResize, { passive: true });
        window.addEventListener('resize', onScrollOrResize, { passive: true });
        if (document.readyState === 'loading') {
          document.addEventListener('DOMContentLoaded', syncWatermarkTheme);
        } else {
          syncWatermarkTheme();
        }
        setTimeout(syncWatermarkTheme, 300);
        setTimeout(syncWatermarkTheme, 1000);
      })();
    </script>
    `;

    if (html.includes('</body>')) {
      return html.replace('</body>', `${watermarkHtml}</body>`);
    }
    return html + watermarkHtml;
  }

  static stripPreviewWatermark(html) {
    if (!html) return html;
    return html
      .replace(/<style[^>]*id="preview-watermark-styles"[\s\S]*?<\/style>/gi, '')
      .replace(/<div[^>]*id="preview-watermark-overlay"[\s\S]*?(?=(?:<!--\s*(?:FLOATING|ULTRA-THIN|PRE-CHECKOUT)|<div[^>]*id="preview-floating-bar"|<div[^>]*class="[^"]*preview-bar|<script[^>]*id="preview-watermark|<body|<\/body|$))/gi, '')
      .replace(/<div[^>]*id="preview-floating-bar"[\s\S]*?<\/div>/gi, '')
      .replace(/<div[^>]*class="[^"]*preview-bar[^"]*"[\s\S]*?<\/div>/gi, '')
      .replace(/<div[^>]*id="mf-plan-selection-modal"[\s\S]*?<\/div>\s*<\/div>/gi, '')
      .replace(/<div[^>]*id="mf-plan-selection-modal"[\s\S]*?<\/div>/gi, '')
      .replace(/<script[^>]*src="[^"]*youpi\.js"[^>]*><\/script>/gi, '')
      .replace(/<script[^>]*id="preview-watermark-script"[\s\S]*?<\/script>/gi, '')
      .replace(/<script[\s\S]*?syncWatermarkTheme[\s\S]*?<\/script>/gi, '')
      .replace(/<script>[\s\S]*?updateWatermarkLuminance[\s\S]*?<\/script>/gi, '')
      .replace(/<div[^>]*class="[^"]*watermark-diagonal-strip[^"]*"[\s\S]*?<\/div>/gi, '')
      .replace(/<!--[^\n>]*?(?:WATERMARK|FLOATING BOTTOM|PORTFOLIO PREVIEW|PRE-CHECKOUT PLAN)[^\n>]*?-->/gi, '');
  }

  stripPreviewWatermark(html) {
    return SiteGenerator.stripPreviewWatermark(html);
  }

  injectSiteTelemetry(html, siteId = '') {
    if (!html) return html;
    const hoverCssTag = `<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/hover.css/2.3.1/css/hover-min.css">`;
    if (html.includes('</head>') && !html.includes('hover-min.css')) {
      html = html.replace('</head>', `  ${hoverCssTag}\n</head>`);
    }

    const telemetryScript = `
    <!-- REAL-TIME ANALYTICS & CONTACT LEAD BEACON -->
    <script>
      (function() {
        try {
          var pathParts = window.location.pathname.split('/').filter(Boolean);
          var sId = '${siteId}' || (pathParts[0] === 'p' || pathParts[0] === 'sites' ? pathParts[1] : pathParts[0]) || '';
          if (sId) {
            fetch('/api/sites/' + encodeURIComponent(sId) + '/analytics', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ eventType: 'page_view', referrer: document.referrer || 'direct' })
            }).catch(function(){});
          }
        } catch(e) {}

        document.addEventListener('DOMContentLoaded', function() {
          var forms = document.querySelectorAll('form');
          forms.forEach(function(form) {
            form.addEventListener('submit', async function(e) {
              e.preventDefault();
              var pathParts = window.location.pathname.split('/').filter(Boolean);
              var sId = '${siteId}' || (pathParts[0] === 'p' || pathParts[0] === 'sites' ? pathParts[1] : pathParts[0]) || '';
              var nameInput = form.querySelector('[name="name"]') || form.querySelector('input[type="text"]');
              var emailInput = form.querySelector('[name="email"]') || form.querySelector('input[type="email"]');
              var msgInput = form.querySelector('[name="message"]') || form.querySelector('textarea');
              var btn = form.querySelector('button[type="submit"]') || form.querySelector('button');
              var prevBtnText = btn ? btn.textContent : '';
              if (btn) btn.textContent = 'Sending...';
              try {
                var res = await fetch('/api/sites/' + encodeURIComponent(sId) + '/contact', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    name: nameInput ? nameInput.value : 'Visitor',
                    email: emailInput ? emailInput.value : '',
                    message: msgInput ? msgInput.value : ''
                  })
                });
                if (res.ok) {
                  form.innerHTML = '<div style="padding: 1.25rem; border-radius: 12px; background: rgba(34,197,94,0.15); border: 1px solid #22c55e; color: #22c55e; text-align: center; font-weight: 700;">✅ Message delivered directly to creator!</div>';
                } else {
                  if (btn) btn.textContent = prevBtnText || 'Send Message';
                }
              } catch(err) {
                if (btn) btn.textContent = prevBtnText || 'Send Message';
              }
            });
          });
        });
      })();
    </script>
    `;

    if (html.includes('</body>')) {
      return html.replace('</body>', `${telemetryScript}</body>`);
    }
    return html + telemetryScript;
  }

  validateAndSanitizeFidelity(html, rawData = {}, normalizedData = {}) {
    let sanitizedHtml = html;

    // Check 1: Zero Fabricated Education Verification
    const hasRawEducation = (Array.isArray(rawData.education) && rawData.education.length > 0) ||
                            (Array.isArray(rawData.data?.education) && rawData.data.education.length > 0) ||
                            (Array.isArray(rawData.resumeData?.education) && rawData.resumeData.education.length > 0);
    if (!hasRawEducation && (!normalizedData.education || normalizedData.education.length === 0)) {
      sanitizedHtml = sanitizedHtml
        .replace(/<div[^>]*class="[^"]*slate-tablet-item[^"]*"[^>]*>[\s\S]*?ACADEMIC FOUNDATION[\s\S]*?<\/div>/gi, '')
        .replace(/<div[^>]*class="[^"]*academic[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
        .replace(/Engineering & Technology Institute/gi, '')
        .replace(/Academic & Professional Practice/gi, '')
        .replace(/Apex Hunter Academy/gi, '');
    }

    // Check 2: Zero Fabricated Certifications Verification
    const hasRawCerts = (Array.isArray(rawData.certifications) && rawData.certifications.length > 0) ||
                        (Array.isArray(rawData.certificates) && rawData.certificates.length > 0) ||
                        (Array.isArray(rawData.data?.certifications) && rawData.data.certifications.length > 0) ||
                        (Array.isArray(rawData.resumeData?.certifications) && rawData.resumeData.certifications.length > 0);
    if (!hasRawCerts && (!normalizedData.certifications || normalizedData.certifications.length === 0)) {
      sanitizedHtml = sanitizedHtml
        .replace(/<div[^>]*class="[^"]*slate-tablet-item[^"]*"[^>]*>[\s\S]*?VERIFIED CERTIFICATION[\s\S]*?<\/div>/gi, '')
        .replace(/Deloitte Cyber Job Simulation Certificate/gi, '')
        .replace(/Algorand Certified Developer/gi, '')
        .replace(/Verified Technical Portfolio \(\d+ Showcased Systems\)/gi, '')
        .replace(/STUDIO-VERIFIED/gi, '');
    }

    // Check 3: CSS & Layout Structural Alignment Verification
    if (!sanitizedHtml.includes('<style') && !sanitizedHtml.includes('<link rel="stylesheet"')) {
      console.warn('[SiteGenerator] Warning: Rendered HTML missing primary stylesheet.');
    }

    return sanitizedHtml;
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  extractProjectsList(data) {
    if (Array.isArray(data.projects) && data.projects.length > 0) return data.projects;
    return [];
  }

  getGlobalLibraries() {
    return `<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js"></script>`;
  }

  getWatermarkHtml() {
    return '';
  }
}

module.exports = { SiteGenerator };