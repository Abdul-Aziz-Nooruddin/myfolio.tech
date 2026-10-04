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
    const requestedTemplate = designBrief?.templateId || data.templateId || data.template || (TemplateRegistry.templates[designBrief?.theme] ? designBrief.theme : null) || (TemplateRegistry.templates[designBrief?.creative_mode] ? designBrief.creative_mode : null);

    let templateId = requestedTemplate;
    if (!templateId || !TemplateRegistry.templates[templateId] || (process.env.NODE_ENV !== 'test' && !TemplateRegistry._templates[templateId])) {
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
      html: finalHtml,
      cleanHtml: this.injectSiteTelemetry(templateOutput.html, conversation?.id || ''),
      css: templateOutput.css || '',
      js: templateOutput.js || '',
      designBlueprint: {
        iaModel: templateId,
        layoutGrammar: templateId,
        visualUniverse: { id: templateId, name: templateId },
        projectStrategy: 'template'
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

    const watermarkHtml = `
    <!-- TOP PREVIEW ONLY // MYFOLIO.TECH PROMINENT WATERMARK OVERLAY (ABOVE PORTFOLIO) -->
    <div id="preview-watermark-overlay" style="position: fixed; inset: 0; pointer-events: none; z-index: 999999; overflow: hidden; display: flex; flex-direction: column; justify-content: space-between; user-select: none;">
      <!-- TOP FLOATING PILL BADGE -->
      <div style="width: 100%; display: flex; justify-content: center; padding-top: 12px;">
        <div id="preview-watermark-pill" style="pointer-events: auto; display: inline-flex; align-items: center; gap: 8px; padding: 6px 18px; border-radius: 9999px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; transition: color 0.25s ease, background 0.25s ease, border-color 0.25s ease, box-shadow 0.25s ease; backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); border: 1px solid rgba(255,255,255,0.22); background: rgba(12, 12, 12, 0.82); color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.3);">
          <span class="watermark-main-title" style="display:inline-flex; align-items:center; gap:6px;">
            <span id="preview-watermark-dot" style="display:inline-block; width:7px; height:7px; border-radius:50%; background: currentColor; box-shadow: 0 0 6px currentColor; transition: background-color 0.25s ease;"></span>
            <span style="letter-spacing: 0.04em; font-weight: 800;">myfolio.tech</span>
          </span>
          <span style="opacity: 0.4;">•</span>
          <span style="font-weight: 700; letter-spacing: 0.1em;">PREVIEW ONLY</span>
        </div>
      </div>

      <!-- ONE BIG BOLD DIAGONAL PREVIEW ONLY WATERMARK -->
      <div id="preview-big-diagonal" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%) rotate(-28deg); white-space: nowrap; pointer-events: none; user-select: none; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: clamp(3.5rem, 11vw, 10rem); font-weight: 900; letter-spacing: 0.15em; text-transform: uppercase; color: rgba(255, 255, 255, 0.08); transition: color 0.25s ease; text-align: center; width: 100%;">
        PREVIEW ONLY
      </div>
    </div>

    <!-- FLOATING BOTTOM CONVERSION & UNLOCK BAR -->
    <div id="preview-floating-bar" style="position: fixed; bottom: 20px; left: 50%; transform: translateX(-50%); z-index: 999998; background: rgba(15, 23, 42, 0.94); backdrop-filter: blur(18px); -webkit-backdrop-filter: blur(18px); border: 1px solid rgba(255,255,255,0.18); box-shadow: 0 16px 40px rgba(0,0,0,0.6); border-radius: 9999px; padding: 10px 24px; display: flex; align-items: center; gap: 14px; color: #ffffff; font-family: system-ui, -apple-system, sans-serif; max-width: 94vw; flex-wrap: wrap; justify-content: center;">
      <div style="font-size: 0.88rem; font-weight: 600; display: flex; align-items: center; gap: 8px;">
        <span style="display:inline-block; width:8px; height:8px; background:#75c5de; border-radius:50%; box-shadow: 0 0 8px #75c5de;"></span>
        <span>🔒 <strong>Preview Only</strong> (24h Evaluation Window) • Powered by MyFolio</span>
      </div>
      <a href="${pricingUrl}" onclick="if(window.parent&&window.parent!==window){window.parent.postMessage({type:'OPEN_PUBLISH_MODAL'},'*');return false;}" style="background: linear-gradient(135deg, #75c5de, #13708e); color: #08171c; font-weight: 800; font-size: 0.85rem; padding: 8px 18px; border-radius: 9999px; text-decoration: none; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(117,197,222,0.35); transition: transform 0.2s ease;">
        <span>Buy Build & Remove Watermark (From ₹149) ➔</span>
      </a>
    </div>

    <!-- DYNAMIC BACKGROUND LUMINANCE & CONTRAST SYNC CONTROLLER -->
    <script id="preview-watermark-script">
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
            // When background is white -> text is black
            pill.style.color = '#000000';
            pill.style.background = 'rgba(255, 255, 255, 0.88)';
            pill.style.borderColor = 'rgba(0, 0, 0, 0.18)';
            pill.style.boxShadow = '0 4px 18px rgba(0, 0, 0, 0.12)';
            if (bigDiagonal) bigDiagonal.style.color = 'rgba(0, 0, 0, 0.06)';
          } else {
            // When background is black -> text is white
            pill.style.color = '#ffffff';
            pill.style.background = 'rgba(12, 12, 12, 0.82)';
            pill.style.borderColor = 'rgba(255, 255, 255, 0.2)';
            pill.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.4)';
            if (bigDiagonal) bigDiagonal.style.color = 'rgba(255, 255, 255, 0.08)';
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