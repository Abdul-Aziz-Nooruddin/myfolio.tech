/**
 * Subscribe & Pricing Landing Page Template
 * Rendered at /subscribe, /pricing, and /payment/retry
 */

function renderSubscribePage({ siteId = 'demo', razorpayKeyId = (process.env.RAZORPAY_KEY_ID || '') } = {}) {
  const safeSiteId = String(siteId).replace(/[^a-zA-Z0-9_\-\.]/g, '');
  const safeKeyId = String(razorpayKeyId || '').replace(/[^a-zA-Z0-9_]/g, '');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Unlock Your Portfolio — myfolio.tech</title>
  <link rel="icon" type="image/png" href="/assets/favicon.png">
  <link rel="apple-touch-icon" href="/assets/favicon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/style.css">
  <script src="/sidebar.js"></script>
  <script src="/assets/payment-maintenance.js"></script>
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
    .plan-features { list-style: none; margin-bottom: 28px; display: flex; flex-direction: column; gap: 12px; font-size: 0.92rem; color: #334155; }
    .plan-features li { display: flex; align-items: flex-start; gap: 10px; line-height: 1.4; }
    .plan-features li::before { content: '✔'; color: #059669; font-weight: 800; font-size: 1rem; flex-shrink: 0; }
    
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
    [data-theme="dark"] .plan-features {
      color: #CBD5E1;
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
        <div class="title-tag">PORTFOLIO STUDIO • SELECT YOUR PLAN</div>
        <h1 class="main-title">Unlock Your 3D Portfolio</h1>
        <p class="subtitle">Remove the 24-hour preview watermark, keep your portfolio online, and choose the plan that best fits your workflow.</p>

        <div class="pricing-grid-side-by-side">
          <!-- Box 1: Lifetime Starter -->
          <div class="plan-box-card plan-box-starter">
            <div>
              <span class="badge badge-starter">LIFETIME STARTER</span>
              <h3 class="plan-name">Lifetime Starter</h3>
              <div class="plan-price"><span style="font-size:1.1rem; text-decoration:line-through; color:#94a3b8; font-weight:600; margin-right:8px;">₹749</span>₹149 <span>/ one-time</span></div>
              <div style="font-size:0.75rem; font-weight:700; color:#c2410c; margin-top:-14px; margin-bottom:16px;">Limited Deal • Price dropped from ₹749</div>
              <ul class="plan-features">
                <li>Permanent 24/7 Live Hosting (Never goes down after 24h)</li>
                <li>Deployed &amp; Hosted on Netlify Edge CDN</li>
                <li>Permanent Global Netlify Live Link</li>
                <li>100% Watermark-Free Clean Website</li>
                <li>Static Standalone ZIP Code Export</li>
                <li>Pay Once • Zero Recurring Subscriptions</li>
              </ul>
            </div>
            <button class="pay-btn pay-btn-starter" onclick="startPayment('starter', 14900)">Unlock Lifetime Link (₹149)</button>
          </div>

          <!-- Box 2: Pro Creator -->
          <div class="plan-box-card plan-box-pro">
            <div>
              <span class="badge badge-pro">MOST POPULAR</span>
              <h3 class="plan-name">Pro Creator</h3>
              <div class="plan-price"><span style="font-size:1.1rem; text-decoration:line-through; color:#94a3b8; font-weight:600; margin-right:8px;">₹499</span>₹149 <span>/ month</span></div>
              <div style="font-size:0.75rem; font-weight:700; color:#2563eb; margin-top:-14px; margin-bottom:16px;">Limited Deal • Price dropped from ₹499/mo</div>
              <ul class="plan-features">
                <li>Permanent 24/7 Live Hosting (Never goes down)</li>
                <li>Branded Subdomain: <code>&lt;username&gt;.myfolio.tech</code></li>
                <li>Custom Domain Linking (<code>yourname.dev</code>)</li>
                <li>Switch 3D Worlds Anytime</li>
                <li>Continuous Live GitHub Auto-Sync</li>
                <li>100% Watermark-Free Clean Website</li>
                <li>Static Standalone ZIP Code Export</li>
              </ul>
            </div>
            <button class="pay-btn pay-btn-pro" onclick="startPayment('pro', 14900)">Unlock Pro Domain (₹149/mo)</button>
          </div>
        </div>

        <!-- Pre-Payment Disclaimer Notice -->
        <div style="margin: 20px auto; max-width: 640px; padding: 14px 18px; background: rgba(15,23,42,0.65); border: 1px solid rgba(255,255,255,0.12); border-radius: 12px; text-align: left; font-size: 0.85rem; color: #cbd5e1;">
          <label style="display: flex; align-items: flex-start; gap: 10px; cursor: pointer;">
            <input type="checkbox" id="subscribeLegalCheck" checked style="margin-top: 3px; accent-color: #2563eb; width: 16px; height: 16px;" />
            <span>
              I understand that purchases are <strong>strictly 100% non-refundable</strong> once provisioned, and portfolios are subject to <strong>immediate takedown upon abuse or malicious content</strong>. I agree to the <a href="/terms" target="_blank" style="color: #38bdf8; text-decoration: underline;">Terms</a>, <a href="/privacy" target="_blank" style="color: #38bdf8; text-decoration: underline;">Privacy</a>, and <a href="/refund" target="_blank" style="color: #38bdf8; text-decoration: underline;">Refund Policy</a>.
            </span>
          </label>
        </div>

        <div style="color: #94a3b8; font-size: 0.85rem; text-align: center;">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="vertical-align:-1px; margin-right:4px;"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> 100% Secure Checkout via Razorpay, UPI &amp; Cards • Instant Automated Activation
        </div>
      </div>
    </div>
  </div>

  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <script>
    window.addEventListener('DOMContentLoaded', () => {
      if (typeof initUniversalSidebar === 'function') {
        initUniversalSidebar('pricing');
      }
    });

    async function startPayment(plan, amount) {
      if (typeof showPaymentMaintenanceModal === 'function') {
        showPaymentMaintenanceModal({ plan, siteId: '${safeSiteId}' });
        return;
      }

      const chk = document.getElementById('subscribeLegalCheck');
      if (chk && !chk.checked) {
        alert('Please review and check the acknowledgment box confirming the non-refundable terms and policies before checkout.');
        chk.focus();
        return;
      }

      const btn = event?.target;
      const originalText = btn ? btn.textContent : '';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Connecting Razorpay...';
      }

      try {
        const res = await fetch('/api/web/create-order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ siteId: '${safeSiteId}', plan })
        });
        const data = await res.json();

        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }

        if (data.orderId && typeof Razorpay !== 'undefined') {
          const options = {
            key: data.keyId || '${safeKeyId}',
            amount: data.amount,
            currency: data.currency || 'INR',
            name: 'myfolio.tech',
            description: plan === 'pro' ? 'Pro Creator Domain & Unlimited Sync' : 'Lifetime Starter Portfolio Unlock',
            image: '/assets/logo-3d.jpg',
            order_id: data.orderId,
            handler: async function (response) {
              if (btn) {
                btn.disabled = true;
                btn.textContent = 'Verifying Payment...';
              }
              const verifyRes = await fetch('/api/web/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                  siteId: '${safeSiteId}',
                  plan: plan,
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                window.location.href = '/dashboard.html?payment=success';
              } else {
                alert('Payment verification error: ' + (verifyData.error || 'Please contact support'));
                if (btn) {
                  btn.disabled = false;
                  btn.textContent = originalText;
                }
              }
            },
            theme: {
              color: '#2563eb'
            }
          };

          const rzp = new Razorpay(options);
          rzp.on('payment.failed', function (response) {
            alert('Payment failed: ' + (response.error.description || 'Transaction cancelled.'));
          });
          rzp.open();
        } else if (data.paymentUrl) {
          window.location.href = data.paymentUrl;
        } else {
          alert('Could not initialize checkout. Please verify your payment settings.');
        }
      } catch (e) {
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalText;
        }
        alert('Could not start checkout: ' + e.message);
      }
    }
  </script>
</body>
</html>`;
}

module.exports = { renderSubscribePage };
