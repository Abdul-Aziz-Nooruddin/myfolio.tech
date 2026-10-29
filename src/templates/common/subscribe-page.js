/**
 * Subscribe & Pricing Landing Page Template
 * Rendered at /subscribe, /pricing, and /payment/retry
 */

function renderSubscribePage({ siteId = 'demo', youpiKeyId = (process.env.YOUPI_MERCHANT_ID || ''), razorpayKeyId = (process.env.RAZORPAY_KEY_ID || '') } = {}) {
  const safeSiteId = String(siteId).replace(/[^a-zA-Z0-9_\-\.]/g, '');
  const safeKeyId = String(youpiKeyId || razorpayKeyId || 'youpi_merchant_live').replace(/[^a-zA-Z0-9_\-]/g, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Pricing &amp; Plans — MyFolio 3D Portfolio Studio</title>
  <meta name="description" content="Transparent, accessible developer pricing for MyFolio. Full source code ZIP export, lifetime hosting, and branded custom subdomains at ₹149. Zero vendor lock-in.">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="https://www.myfolio.tech/pricing">

  <!-- Open Graph -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://www.myfolio.tech/pricing">
  <meta property="og:title" content="Pricing &amp; Plans — MyFolio 3D Portfolio Studio">
  <meta property="og:description" content="Accessible developer pricing. Standalone source code ZIP export, lifetime hosting, and branded custom subdomains at ₹149. Zero vendor lock-in.">
  <meta property="og:image" content="https://www.myfolio.tech/assets/og/og-default.jpg">
  <meta property="og:site_name" content="MyFolio">

  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Pricing &amp; Plans — MyFolio 3D Portfolio Studio">
  <meta name="twitter:description" content="Transparent developer pricing. Standalone source code ZIP export and custom domains at ₹149.">
  <meta name="twitter:image" content="https://www.myfolio.tech/assets/og/og-default.jpg">

  <!-- Schema.org JSON-LD -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "MyFolio 3D Developer Portfolio",
    "image": "https://www.myfolio.tech/assets/og/og-default.jpg",
    "description": "Interactive 3D WebGL developer portfolios with standalone source code ZIP export, live GitHub sync, and custom subdomains.",
    "brand": {
      "@type": "Brand",
      "name": "MyFolio"
    },
    "offers": [
      {
        "@type": "Offer",
        "name": "Free Starter",
        "price": "0",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": "https://www.myfolio.tech/pricing"
      },
      {
        "@type": "Offer",
        "name": "Lifetime Starter",
        "price": "149",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": "https://www.myfolio.tech/pricing"
      },
      {
        "@type": "Offer",
        "name": "Pro Creator",
        "price": "149",
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock",
        "url": "https://www.myfolio.tech/pricing"
      }
    ]
  }
  </script>

  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="apple-touch-icon" href="/assets/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
  <script src="/sidebar.js" defer></script>
  <style>
    :root {
      --bg: #060814;
      --card: #ffffff;
      --primary: #2563eb;
      --accent: #059669;
      --text: #0f172a;
      --muted: #64748b;
      --border: rgba(15, 23, 42, 0.08);
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: #F8FAFC;
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      min-height: 100vh;
      display: flex;
      position: relative;
    }
    /* High-Speed Moving 3D Fluid Silk Background Container */
    .fluid-silk-bg-container {
      position: fixed;
      top: -6%;
      left: -6%;
      width: 112vw;
      height: 112vh;
      z-index: 0;
      pointer-events: none;
      overflow: hidden;
      background: radial-gradient(circle at 50% 40%, rgba(255, 255, 255, 0.1) 0%, rgba(240, 246, 255, 0.25) 50%, rgba(220, 235, 255, 0.55) 100%),
                  url('/assets/fluid-silk-3d-bg.jpg') center/cover no-repeat;
      animation: fluidSilkFastUndulate 6.5s ease-in-out infinite alternate;
      will-change: transform;
    }
    @keyframes fluidSilkFastUndulate {
      0% { transform: scale(1) translate(0px, 0px) rotate(0deg); }
      25% { transform: scale(1.05) translate(-22px, -14px) rotate(1.2deg); }
      50% { transform: scale(1.09) translate(16px, 20px) rotate(-1.5deg); }
      75% { transform: scale(1.05) translate(-14px, 16px) rotate(0.9deg); }
      100% { transform: scale(1.07) translate(22px, -14px) rotate(-0.9deg); }
    }
    .app-shell-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
      position: relative;
      z-index: 1;
    }
    .checkout-wrap {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      min-height: 100vh;
      position: relative;
      z-index: 2;
    }
    .checkout-container {
      max-width: 960px;
      width: 100%;
      margin: 0 auto;
      text-align: center;
    }
    .title-tag { font-size: 0.85rem; color: #2563EB; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; }
    .main-title { font-size: clamp(2rem, 4vw, 2.8rem); font-weight: 800; line-height: 1.2; margin-bottom: 12px; color: #0F172A; }
    .subtitle { color: #64748B; font-size: 1.05rem; margin-bottom: 36px; line-height: 1.6; max-width: 720px; margin-left: auto; margin-right: auto; }

    .pricing-grid-side-by-side {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
      gap: 28px;
      margin-bottom: 32px;
      align-items: stretch;
    }

    .plan-box-card {
      background: #ffffff;
      border: 1px solid rgba(226, 232, 240, 0.95);
      border-radius: 24px;
      padding: 36px 32px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      text-align: left;
      position: relative;
      box-shadow: 0 20px 45px rgba(37, 99, 235, 0.08);
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
    }
    .plan-box-card:hover {
      transform: translateY(-6px) scale(1.01);
      box-shadow: 0 28px 56px rgba(37, 99, 235, 0.14);
    }
    .plan-box-starter {
      border: 2px solid #0d9488;
    }
    .plan-box-pro {
      border: 2.5px solid #2563eb;
      box-shadow: 0 20px 50px rgba(37, 99, 235, 0.12);
    }

    .badge {
      position: absolute; top: -14px; right: 24px;
      font-size: 0.72rem; font-weight: 800; padding: 4px 14px; border-radius: 9999px; text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .badge-starter {
      background: #0d9488; color: #ffffff;
    }
    .badge-pro {
      background: #2563eb; color: #ffffff;
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
    }

    .plan-name { font-size: 1.4rem; font-weight: 800; margin-bottom: 6px; color: #0f172a; }
    .plan-price { font-size: 2.4rem; font-weight: 900; color: #0f172a; margin-bottom: 20px; }
    .plan-price span { font-size: 0.95rem; color: var(--muted); font-weight: 600; }
    .plan-features {
      list-style: none;
      margin-bottom: 24px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      text-align: left;
    }
    .plan-features li {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      line-height: 1.5;
    }
    .plan-features .feat-icon {
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: rgba(13, 148, 136, 0.15);
      color: #0d9488;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 800;
      flex-shrink: 0;
      margin-top: 2px;
    }
    .plan-box-pro .plan-features .feat-icon {
      background: rgba(37, 99, 235, 0.15);
      color: #2563eb;
    }
    .plan-features .feat-content {
      flex: 1;
      font-size: 0.92rem;
      color: #334155;
    }
    .plan-features .feat-content strong {
      color: #0f172a;
      font-weight: 700;
      margin-right: 4px;
    }
    
    .pay-btn {
      display: block; width: 100%; text-align: center; color: #ffffff;
      font-weight: 800; font-size: 1rem; padding: 15px 20px; border-radius: 14px; text-decoration: none;
      transition: transform 0.15s, box-shadow 0.15s; border: none; cursor: pointer;
    }
    .pay-btn-starter {
      background: #0d9488;
      box-shadow: 0 4px 14px rgba(13, 148, 136, 0.3);
    }
    .pay-btn-starter:hover { transform: translateY(-2px); box-shadow: 0 8px 22px rgba(13, 148, 136, 0.4); }

    .pay-btn-pro {
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      box-shadow: 0 4px 16px rgba(37, 99, 235, 0.35);
    }
    .pay-btn-pro:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(37, 99, 235, 0.45); }

    /* DARK THEME SUBSCRIBE OVERRIDES */
    [data-theme="dark"] body {
      background: #07090E;
      color: #F8FAFC;
    }
    [data-theme="dark"] .fluid-silk-bg-container {
      background: radial-gradient(circle at 50% 40%, rgba(15, 23, 42, 0.4) 0%, rgba(10, 14, 28, 0.85) 50%, rgba(3, 5, 12, 0.98) 100%),
                  url('/assets/fluid-silk-3d-bg.jpg') center/cover no-repeat;
    }
    [data-theme="dark"] .main-title {
      color: #FFFFFF;
    }
    [data-theme="dark"] .subtitle {
      color: #94A3B8;
    }
    [data-theme="dark"] .plan-box-card {
      background: rgba(15, 23, 42, 0.92);
      border-color: rgba(255, 255, 255, 0.12);
      box-shadow: 0 20px 45px rgba(0, 0, 0, 0.5);
    }
    [data-theme="dark"] .plan-box-starter {
      border: 2px solid #0d9488;
    }
    [data-theme="dark"] .plan-box-pro {
      border: 2.5px solid #38BDF8;
      box-shadow: 0 20px 50px rgba(56, 189, 248, 0.2);
    }
    [data-theme="dark"] .plan-name {
      color: #FFFFFF;
    }
    [data-theme="dark"] .plan-price {
      color: #FFFFFF;
    }
    [data-theme="dark"] .plan-price span {
      color: #94A3B8;
    }
    [data-theme="dark"] .plan-features .feat-content {
      color: #CBD5E1;
    }
    [data-theme="dark"] .plan-features .feat-content strong {
      color: #FFFFFF;
    }
    [data-theme="dark"] .plan-features li code {
      background: rgba(255, 255, 255, 0.1);
      color: #38BDF8;
      padding: 2px 6px;
      border-radius: 4px;
    }

    @media (max-width: 768px) {
      .checkout-wrap {
        padding: 30px 16px !important;
      }
      .checkout-container {
        padding: 0 !important;
      }
      .pricing-grid-side-by-side {
        grid-template-columns: 1fr !important;
        gap: 24px !important;
      }
      .plan-box-card {
        padding: 28px 20px !important;
        border-radius: 18px !important;
      }
      .main-title {
        font-size: 1.8rem !important;
      }
      .subtitle {
        font-size: 0.95rem !important;
        margin-bottom: 28px !important;
      }
    }
  </style>
</head>
<body>
  <!-- Moving 3D Fluid Silk Background Container -->
  <div class="fluid-silk-bg-container"></div>

  <div class="app-shell-layout">
    <div id="sidebarMount"></div>
    <div class="checkout-wrap">
      <div class="checkout-container">
        <div class="title-tag">PORTFOLIO STUDIO • SINGLE PORTFOLIO LICENSE</div>
        <h1 class="main-title">Publish &amp; Unlock Your Portfolio</h1>
        <p class="subtitle">Pay once for this specific portfolio (<code style="background:rgba(37,99,235,0.1); color:#2563eb; padding:2px 8px; border-radius:6px; font-weight:700;">${safeSiteId}</code>). 100% Watermark removed, permanent 24/7 live hosting, and full source code export with zero recurring subscriptions.</p>

        <div class="pricing-grid-side-by-side">
          <!-- Card 1: Lifetime Starter (₹149 One-Time) -->
          <div class="plan-box-card plan-box-starter">
            <div>
              <span class="badge badge-starter" style="background:#0d9488; color:#fff;">LIFETIME STARTER • 80% OFF</span>
              <h3 class="plan-name">Lifetime Starter</h3>
              <p style="font-size:0.85rem; color:#64748B; margin-bottom:14px; line-height:1.4;">Pay once and own your live portfolio forever. Ideal for job hunting, resumes, and sharing clean links without monthly fees.</p>
              <div class="plan-price">
                <span style="font-size:1.1rem; text-decoration:line-through; color:#94a3b8; font-weight:600; margin-right:8px;">₹749</span>₹149 <span>/ one-time</span>
              </div>
              <div style="font-size:0.8rem; font-weight:700; color:#0d9488; margin-top:-14px; margin-bottom:16px;">✓ Pay once • Zero recurring charges</div>
              <ul class="plan-features">
                <li><span class="feat-icon">✓</span> <div class="feat-content"><strong>Permanent 24/7 Hosting:</strong> Your site stays online permanently and never goes down.</div></li>
                <li><span class="feat-icon">✓</span> <div class="feat-content"><strong>100% Watermark-Free:</strong> All preview badges, upgrade banners, and countdown timers are removed.</div></li>
                <li><span class="feat-icon">✓</span> <div class="feat-content"><strong>Standalone Source Code (.ZIP):</strong> Download your full HTML, CSS, Three.js shaders, and assets to host anywhere.</div></li>
                <li><span class="feat-icon">✓</span> <div class="feat-content"><strong>1 Free Style Rebuild:</strong> Regenerate your theme or update skills once at any time.</div></li>
                <li><span class="feat-icon">✓</span> <div class="feat-content"><strong>Global Netlify Edge CDN:</strong> High-speed worldwide distribution with sub-100ms load times.</div></li>
              </ul>
            </div>
            <button class="pay-btn pay-btn-starter" onclick="startPayment('starter', 14900)">Unlock Lifetime Link (₹149) &rarr;</button>
          </div>

          <!-- Card 2: Pro Creator (₹149 / Month) -->
          <div class="plan-box-card plan-box-pro">
            <div>
              <span class="badge badge-pro" style="background:#2563eb; color:#fff;">PRO CREATOR • 70% OFF</span>
              <h3 class="plan-name">Pro Creator</h3>
              <p style="font-size:0.85rem; color:#64748B; margin-bottom:14px; line-height:1.4;">Personalized vanity domain, automatic GitHub synchronization, and continuous rebuilds for active software builders.</p>
              <div class="plan-price">
                <span style="font-size:1.1rem; text-decoration:line-through; color:#94a3b8; font-weight:600; margin-right:8px;">₹499</span>₹149 <span>/ month</span>
              </div>
              <div style="font-size:0.8rem; font-weight:700; color:#2563eb; margin-top:-14px; margin-bottom:16px;">✓ Billed monthly • Cancel anytime with 1-click</div>
              <ul class="plan-features">
                <li><span class="feat-icon">✓</span> <div class="feat-content"><strong>Branded MyFolio Subdomain:</strong> Claim your vanity address (<code>&lt;username&gt;.myfolio.tech</code>) with SSL.</div></li>
                <li><span class="feat-icon">✓</span> <div class="feat-content"><strong>Custom Domain Support:</strong> Connect your personal root domain (<code>yourname.dev</code>).</div></li>
                <li><span class="feat-icon">✓</span> <div class="feat-content"><strong>Continuous Live GitHub Auto-Sync:</strong> Repos, stars, and commit milestones update automatically.</div></li>
                <li><span class="feat-icon">✓</span> <div class="feat-content"><strong>Switch 3D Worlds Anytime:</strong> Swap between templates without rebuilding.</div></li>
                <li><span class="feat-icon">✓</span> <div class="feat-content"><strong>Permanent 24/7 Hosting &amp; Watermark Removal:</strong> All Lifetime Starter features included.</div></li>
                <li><span class="feat-icon">✓</span> <div class="feat-content"><strong>Standalone Source Code (.ZIP):</strong> Full offline production package included.</div></li>
              </ul>
              <div style="margin-bottom: 16px; background: rgba(37,99,235,0.08); border: 1px solid rgba(37,99,235,0.25); border-radius: 10px; padding: 10px 12px; text-align: left;">
                <label style="font-size: 0.78rem; font-weight: 700; text-transform: uppercase; color: #2563eb; display: block; margin-bottom: 4px;">Choose Your Subdomain Handle:</label>
                <div style="display: flex; align-items: center; background: rgba(255,255,255,0.9); border: 1px solid rgba(37,99,235,0.3); border-radius: 6px; padding: 4px 8px; font-family: monospace; font-size: 0.9rem;">
                  <span style="color: #64748b;">https://</span>
                  <input type="text" id="pricingProSubdomainInput" value="${safeSiteId.split('-')[0].toLowerCase()}" placeholder="yourname" style="border:none; outline:none; background:transparent; font-weight:700; color:#2563eb; flex:1; min-width:60px;" />
                  <span style="color: #2563eb; font-weight: 700;">.myfolio.tech</span>
                </div>
              </div>
            </div>
            <button class="pay-btn pay-btn-pro" onclick="startPayment('pro', 14900)">Unlock Pro Subdomain (₹149/mo) &rarr;</button>
          </div>
        </div>

        <!-- Pre-Payment Disclaimer Notice -->
        <div style="margin: 20px auto; max-width: 620px; padding: 14px 18px; background: rgba(15,23,42,0.65); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; text-align: left; font-size: 0.85rem; color: #cbd5e1;">
          <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="subscribeLegalCheck" checked style="margin-top: 3px; accent-color: #2563eb; width: 16px; height: 16px;" />
            <span>
              I understand that purchases are <strong>strictly 100% non-refundable</strong> once provisioned, and portfolios are subject to <strong>immediate takedown upon abuse or malicious content</strong>. I agree to the <a href="/terms" target="_blank" style="color: #38bdf8; text-decoration: underline;">Terms</a>, <a href="/privacy" target="_blank" style="color: #38bdf8; text-decoration: underline;">Privacy</a>, and <a href="/refund" target="_blank" style="color: #38bdf8; text-decoration: underline;">Refund Policy</a>.
            </span>
          </label>
        </div>

        <div style="color: #94a3b8; font-size: 0.85rem; text-align: center;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px; margin-right:4px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> 100% Secure Checkout via YouPI PG (Direct UPI &amp; Bank QR) • 0% Platform Fees • Instant Automated Activation
        </div>
      </div>
    </div>
  </div>

  <script src="/assets/youpi.js"></script>
  <script>
    window.addEventListener('DOMContentLoaded', function () {
      if (typeof initUniversalSidebar === 'function') {
        initUniversalSidebar('pricing');
      }
    });

    async function startPayment(plan, amount) {
      var chk = document.getElementById('subscribeLegalCheck');
      if (chk && !chk.checked) {
        if (typeof window.showAlertModal === 'function') {
          window.showAlertModal({ title: 'Acknowledgment Required', message: 'Please review and check the acknowledgment box confirming the non-refundable terms before checkout.', type: 'info' });
        } else {
          alert('Please review and check the acknowledgment box confirming the non-refundable terms before checkout.');
        }
        chk.focus();
        return;
      }

      var chosenSubdomain = '';
      if (plan === 'pro') {
        var subInput = document.getElementById('pricingProSubdomainInput');
        chosenSubdomain = subInput ? subInput.value.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '') : '';
        if (!chosenSubdomain || chosenSubdomain.length < 2) {
          if (typeof window.showAlertModal === 'function') {
            window.showAlertModal({ title: 'Invalid Subdomain', message: 'Please enter a valid subdomain handle (min 2 characters).', type: 'error' });
          } else {
            alert('Please enter a valid subdomain handle (min 2 characters).');
          }
          if (subInput) subInput.focus();
          return;
        }
      }

      var btn = event ? event.target : null;
      var originalText = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Opening Secure Checkout...';
      }

      try {
        var res = await fetch('/api/web/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ siteId: '${safeSiteId}', plan: plan || 'starter', username: chosenSubdomain })
        });
        var data = await res.json();

        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }

        if (typeof window.YoupiCheckout !== 'undefined') {
          var youpi = new window.YoupiCheckout({
            key: data.keyId,
            amount: data.amountRupees || (data.amount / 100) || 149,
            currency: 'INR',
            name: 'MyFolio Technologies',
            description: plan === 'pro' ? ('Pro Subdomain (' + chosenSubdomain + '.myfolio.tech)') : 'Unlock Portfolio (${safeSiteId})',
            order_id: data.orderId,
            orderId: data.orderId,
            vpa: '9912836034@mbk',
            handler: async function (paymentResponse) {
              try {
                var verifyRes = await fetch('/api/web/verify-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  credentials: 'include',
                  body: JSON.stringify({
                    siteId: '${safeSiteId}',
                    plan: plan || 'starter',
                    username: chosenSubdomain,
                    order_id: paymentResponse.order_id || paymentResponse.orderId,
                    payment_id: paymentResponse.payment_id || paymentResponse.paymentId || ('youpi_' + Date.now()),
                    signature: paymentResponse.signature || '',
                    utr: paymentResponse.utr || ''
                  })
                });
                var verifyData = await verifyRes.json();
                if (verifyData.success) {
                  var finalUrl = verifyData.liveUrl || ('/p/' + encodeURIComponent('${safeSiteId}'));
                  if (typeof window.showAlertModal === 'function') {
                    await window.showAlertModal({ title: '🎉 Portfolio Unlocked', message: 'Payment verified! Watermark removed and your site is live at: ' + finalUrl, type: 'success' });
                    window.location.href = finalUrl;
                  } else {
                    alert('🎉 Payment verified! Watermark has been removed and your portfolio is live 24/7.');
                    window.location.href = finalUrl;
                  }
                } else {
                  if (typeof window.showAlertModal === 'function') {
                    window.showAlertModal({ title: 'Payment Notice', message: verifyData.error || 'Please contact support', type: 'error' });
                  } else {
                    alert('Payment verification notice: ' + (verifyData.error || 'Please contact support'));
                  }
                }
              } catch (vErr) {
                if (typeof window.showAlertModal === 'function') {
                  window.showAlertModal({ title: 'Verification Error', message: vErr.message, type: 'error' });
                } else {
                  alert('Verification error: ' + vErr.message);
                }
              }
            }
          });
          youpi.open();
        } else {
          if (typeof window.showAlertModal === 'function') {
            window.showAlertModal({ title: 'Payment Initializing', message: 'Payment rails initializing. Please try again in a moment.', type: 'info' });
          } else {
            alert('Payment rails initializing. Please try again in a moment.');
          }
        }
      } catch (e) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
        if (typeof window.showAlertModal === 'function') {
          window.showAlertModal({ title: 'Checkout Error', message: 'Could not start checkout: ' + e.message, type: 'error' });
        } else {
          alert('Could not start checkout: ' + e.message);
        }
      }
    }
  </script>
</body>
</html>`;
}

module.exports = { renderSubscribePage };
