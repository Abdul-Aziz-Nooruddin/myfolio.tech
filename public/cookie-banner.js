/**
 * Privacy & GDPR Cookie Consent Banner Engine
 * Non-intrusive, customizable, glassmorphic UI
 */
(function() {
  const STORAGE_KEY = 'myfolio_cookie_consent';

  function initCookieBanner() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return; // User already made a choice

    const banner = document.createElement('div');
    banner.id = 'myfolioCookieBanner';
    banner.innerHTML = `
      <div class="cookie-banner-content">
        <div class="cookie-text-col">
          <div class="cookie-title">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#E8A33D" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            <span>Privacy and cookie preferences</span>
          </div>
          <p class="cookie-desc">
            We use essential session tokens and privacy-first analytics to power 3D rendering and improve portfolio performance. Learn more in our <a href="/privacy.html" target="_blank">Privacy policy</a>.
          </p>
        </div>
        <div class="cookie-btn-group">
          <button id="btnAcceptAllCookies" class="cookie-btn cookie-btn-primary">Accept all</button>
          <button id="btnDeclineCookies" class="cookie-btn cookie-btn-secondary">Essential only</button>
        </div>
      </div>
    `;

    // Inject styles
    const style = document.createElement('style');
    style.textContent = `
      #myfolioCookieBanner {
        position: fixed;
        bottom: 24px;
        left: 50%;
        transform: translateX(-50%) translateY(120%);
        z-index: 999999;
        max-width: 700px;
        width: calc(100% - 32px);
        background: rgba(10, 14, 20, 0.94);
        border: 1px solid rgba(156, 151, 184, 0.22);
        border-radius: 16px;
        padding: 18px 22px;
        box-shadow: 0 20px 50px rgba(5, 8, 10, 0.8), 0 0 30px rgba(36, 27, 61, 0.5);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        font-family: 'Inter', system-ui, -apple-system, sans-serif;
        color: #EDEAFB;
        transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      }
      #myfolioCookieBanner.visible {
        transform: translateX(-50%) translateY(0);
      }
      .cookie-banner-content {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 20px;
        flex-wrap: wrap;
      }
      .cookie-text-col {
        flex: 1;
        min-width: 260px;
      }
      .cookie-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-weight: 700;
        font-size: 0.96rem;
        margin-bottom: 6px;
        color: #EDEAFB;
      }
      .cookie-desc {
        font-size: 0.84rem;
        color: #9C97B8;
        line-height: 1.5;
        margin: 0;
      }
      .cookie-desc a {
        color: #E8A33D;
        text-decoration: underline;
        text-underline-offset: 3px;
      }
      .cookie-btn-group {
        display: flex;
        gap: 10px;
        align-items: center;
      }
      .cookie-btn {
        padding: 9px 16px;
        border-radius: 9999px;
        font-family: 'Space Grotesk', system-ui, sans-serif;
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        border: none;
        white-space: nowrap;
      }
      .cookie-btn-primary {
        background: #E8A33D;
        color: #05080A;
        box-shadow: 0 4px 14px rgba(232, 163, 61, 0.25);
      }
      .cookie-btn-primary:hover {
        background: #F0B254;
        transform: translateY(-1px);
        box-shadow: 0 6px 20px rgba(232, 163, 61, 0.35);
      }
      .cookie-btn-secondary {
        background: rgba(74, 63, 122, 0.35);
        color: #EDEAFB;
        border: 1px solid rgba(156, 151, 184, 0.25);
      }
      .cookie-btn-secondary:hover {
        background: rgba(74, 63, 122, 0.55);
      }
      @media (max-width: 600px) {
        .cookie-btn-group {
          width: 100%;
        }
        .cookie-btn {
          flex: 1;
          text-align: center;
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(banner);

    // Animate in after 1s
    setTimeout(() => {
      banner.classList.add('visible');
    }, 800);

    document.getElementById('btnAcceptAllCookies').addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: true, essential: true, timestamp: Date.now() }));
      banner.classList.remove('visible');
      setTimeout(() => banner.remove(), 400);
    });

    document.getElementById('btnDeclineCookies').addEventListener('click', () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ analytics: false, essential: true, timestamp: Date.now() }));
      banner.classList.remove('visible');
      setTimeout(() => banner.remove(), 400);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCookieBanner);
  } else {
    initCookieBanner();
  }
})();
