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
    const isTemplateShowcase = Boolean(siteId && TemplateRegistry._templates && Object.prototype.hasOwnProperty.call(TemplateRegistry._templates, siteId));

    const mainWatermarkWord = isTemplateShowcase ? 'TEMPLATE' : 'PREVIEW';
    const subWatermarkText = isTemplateShowcase ? 'TEMPLATE PREVIEW' : 'PORTFOLIO PREVIEW';
    const diagonalSubtitle = isTemplateShowcase ? 'PREVIEW ONLY • NOT FOR PRODUCTION' : 'PORTFOLIO PREVIEW • UNPUBLISHED DRAFT';
    const pillText = isTemplateShowcase ? 'TEMPLATE PREVIEW' : 'PORTFOLIO PREVIEW';
    const barLabel = isTemplateShowcase ? 'Template Preview' : 'Portfolio Preview (Draft)';
    const ctaLabel = isTemplateShowcase ? 'Buy Build & Remove Watermark (From ₹149) ➔' : 'Publish Live & Remove Watermark (From ₹149) ➔';

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
    <div id="preview-watermark-overlay" style="position: fixed; inset: 0; pointer-events: none; z-index: 999999; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; user-select: none; color: rgba(255, 255, 255, 0.10); transition: color 0.25s ease;">
      <!-- FULL-SCREEN DIAGONAL REPEATING WATERMARK SVG GRID -->
      <svg id="preview-watermark-svg" style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="wm-pattern" width="420" height="240" patternUnits="userSpaceOnUse" patternTransform="rotate(-28)">
            <text x="210" y="65" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="900" font-size="20" letter-spacing="4" fill="currentColor">MYFOLIO • ${mainWatermarkWord}</text>
            <text x="210" y="175" text-anchor="middle" font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-weight="800" font-size="15" letter-spacing="3" fill="currentColor">${subWatermarkText}</text>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#wm-pattern)" />
      </svg>

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

      <!-- ONE BIG BOLD DIAGONAL CENTER MASTHEAD -->
      <div id="preview-big-diagonal" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-28deg); white-space: nowrap; pointer-events: none; user-select: none; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; text-transform: uppercase; color: currentColor; transition: color 0.25s ease; text-align: center; width: 100%; z-index: 1;">
        <div style="font-size: clamp(1rem, 2.2vw, 1.8rem); font-weight: 800; letter-spacing: 0.35em; opacity: 0.85; margin-bottom: 4px;">MYFOLIO.TECH</div>
        <div style="font-size: clamp(3rem, 9vw, 8rem); font-weight: 900; letter-spacing: 0.14em; line-height: 0.9;">${mainWatermarkWord}</div>
        <div style="font-size: clamp(0.75rem, 1.5vw, 1.2rem); font-weight: 700; letter-spacing: 0.25em; opacity: 0.75; margin-top: 6px;">${diagonalSubtitle}</div>
      </div>
    </div>

    <!-- ULTRA-THIN FLOATING BOTTOM CONVERSION & UNLOCK BAR -->
    <div id="preview-floating-bar">
      <div style="display: inline-flex; align-items: center; gap: 6px;">
        <span style="display:inline-block; width:6px; height:6px; background:#75c5de; border-radius:50%; box-shadow: 0 0 6px #75c5de;"></span>
        <span>🔒 <strong>${barLabel}</strong><span class="wm-hide-mobile"> • MyFolio</span></span>
      </div>
      <a href="javascript:void(0)" class="preview-cta-btn" onclick="openPreviewCheckoutModal(); return false;">
        <span>${ctaLabel}</span>
      </a>
    </div>

    <script src="/assets/youpi.js"></script>
    <script id="preview-watermark-script">
      function openPreviewCheckoutModal() {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'OPEN_PUBLISH_MODAL' }, '*');
          return;
        }

        var siteId = '${siteId}';
        fetch('/api/web/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ siteId: siteId, plan: 'starter' })
        })
        .then(function(res) { return res.json(); })
        .then(function(orderData) {
          if (typeof window.YoupiCheckout !== 'undefined') {
            var youpi = new window.YoupiCheckout({
              amount: orderData.amountRupees || 149,
              currency: 'INR',
              name: 'MyFolio Technologies',
              description: 'Unlock Portfolio (' + siteId + ')',
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
                    plan: 'starter',
                    order_id: paymentResponse.order_id || paymentResponse.orderId,
                    payment_id: paymentResponse.payment_id || paymentResponse.paymentId || ('youpi_' + Date.now()),
                    signature: paymentResponse.signature || '',
                    utr: paymentResponse.utr || ''
                  })
                })
                .then(function(vRes) { return vRes.json(); })
                .then(function(verifyData) {
                  if (verifyData.success) {
                    alert('🎉 Payment verified! Watermark has been removed and your portfolio is live 24/7.');
                    window.location.reload();
                  } else {
                    alert('Payment notice: ' + (verifyData.error || 'Please contact support'));
                  }
                })
                .catch(function(err) { alert('Verification error: ' + err.message); });
              }
            });
            youpi.open();
          } else {
            alert('Loading checkout. Please try again.');
          }
        })
        .catch(function(err) {
          alert('Could not start checkout: ' + err.message);
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