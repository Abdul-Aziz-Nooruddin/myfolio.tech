/**
 * MyFolio Universal Payment Gateway Maintenance Engine
 * Elegantly notifies users of scheduled banking rails & multi-currency settlement upgrades.
 */
(function() {
  const MAINTENANCE_CONFIG = {
    title: 'Global Payment Infrastructure Upgrade',
    badge: 'BANKING RAILS UPGRADE IN PROGRESS',
    headline: 'Multi-Currency Global Settlement Integration',
    story: `We are currently migrating our payment processing to next-generation international banking rails to natively support <strong>Apple Pay, Google Pay, UPI AutoPay, SEPA EUR/GBP bank transfers, and zero-conversion-fee international credit & debit cards</strong> across 140+ countries.`,
    pauseNotice: `Direct online card checkout is temporarily paused while partner banking compliance and cross-border currency channels are cleared.`,
    liveDate: 'October 25, 2026',
    freeNotice: `<strong>✨ Free Creator Access During Maintenance:</strong> All 3D portfolio creation, WebGL template customization, and live evaluation links remain <strong>100% free and active</strong>. You can continue building and sharing your digital world with recruiters and clients at zero cost.`,
    contactEmail: 'abdulaziznoor9876@gmail.com'
  };

  function createModalDOM() {
    if (document.getElementById('mfPaymentMaintenanceModal')) return;

    const modal = document.createElement('div');
    modal.id = 'mfPaymentMaintenanceModal';
    modal.style.cssText = `
      display: none;
      position: fixed;
      inset: 0;
      z-index: 999999;
      background: rgba(3, 7, 18, 0.88);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      align-items: center;
      justify-content: center;
      padding: 16px;
      opacity: 0;
      transition: opacity 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    `;

    modal.innerHTML = `
      <div id="mfPaymentModalCard" style="
        max-width: 540px;
        width: 100%;
        background: linear-gradient(150deg, #0b1324 0%, #060913 100%);
        border: 1px solid rgba(56, 189, 248, 0.3);
        box-shadow: 0 25px 70px rgba(0, 0, 0, 0.95), 0 0 45px rgba(56, 189, 248, 0.12);
        border-radius: 20px;
        padding: 28px;
        text-align: left;
        color: #F1F5F9;
        position: relative;
        overflow: hidden;
        transform: scale(0.95);
        transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      " onclick="event.stopPropagation()">
        
        <!-- Ambient radial glow -->
        <div style="position:absolute; top:-60px; right:-60px; width:180px; height:180px; background:radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%); pointer-events:none;"></div>
        
        <!-- Top Pill Tag & Close Button -->
        <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:16px;">
          <div style="display:inline-flex; align-items:center; gap:8px; padding:4px 12px; background:rgba(56,189,248,0.12); border:1px solid rgba(56,189,248,0.35); border-radius:999px; font-size:11px; font-weight:700; color:#38BDF8; letter-spacing:0.04em; text-transform:uppercase;">
            <span style="display:inline-block; width:7px; height:7px; border-radius:50%; background:#38BDF8; box-shadow:0 0 8px #38BDF8;"></span>
            ${MAINTENANCE_CONFIG.badge}
          </div>
          <button type="button" id="mfPaymentModalCloseBtn" style="background:transparent; border:none; color:rgba(255,255,255,0.5); font-size:24px; cursor:pointer; line-height:1; padding:4px 8px; border-radius:8px; transition:color 0.2s;" title="Close Notice">&times;</button>
        </div>

        <!-- Title & Icon -->
        <div style="display:flex; align-items:flex-start; gap:16px; margin-bottom:16px;">
          <div style="width:48px; height:48px; border-radius:14px; background:linear-gradient(135deg, rgba(56,189,248,0.2), rgba(16,185,129,0.2)); border:1px solid rgba(56,189,248,0.4); display:flex; align-items:center; justify-content:center; flex-shrink:0;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#38BDF8" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="5" width="20" height="14" rx="2"></rect>
              <line x1="2" y1="10" x2="22" y2="10"></line>
            </svg>
          </div>
          <div>
            <h3 style="font-size:1.25rem; font-weight:700; color:#F8FAFC; margin:0 0 4px; line-height:1.3;">
              ${MAINTENANCE_CONFIG.title}
            </h3>
            <p style="font-size:12px; color:#94A3B8; margin:0;">
              ${MAINTENANCE_CONFIG.headline}
            </p>
          </div>
        </div>

        <!-- Narrative Section -->
        <div style="background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:14px; padding:16px; margin-bottom:16px; font-size:12.5px; line-height:1.6; color:#CBD5E1;">
          <p style="margin:0 0 10px;">
            ${MAINTENANCE_CONFIG.story}
          </p>
          <p style="margin:0 0 12px; color:#94A3B8; font-size:12px;">
            ${MAINTENANCE_CONFIG.pauseNotice}
          </p>
          <div style="display:flex; align-items:center; gap:8px; padding:9px 12px; background:rgba(245,158,11,0.1); border:1px solid rgba(245,158,11,0.25); border-radius:8px; color:#FCD34D; font-size:12px; font-weight:600;">
            <span style="font-size:15px;">🗓️</span>
            <span>Estimated Resumption: <strong>${MAINTENANCE_CONFIG.liveDate}</strong></span>
          </div>
        </div>

        <!-- Free Creator Access Callout -->
        <div style="background:rgba(16,185,129,0.08); border:1px solid rgba(16,185,129,0.25); border-radius:12px; padding:12px 14px; margin-bottom:20px; font-size:12px; color:#A7F3D0; line-height:1.55;">
          ${MAINTENANCE_CONFIG.freeNotice}
        </div>

        <!-- Action CTAs -->
        <div style="display:flex; gap:10px; justify-content:flex-end; align-items:center;">
          <a href="mailto:${MAINTENANCE_CONFIG.contactEmail}?subject=Priority%20Portfolio%20Publishing%20%26%20Domain%20Setup&body=Hi%20Abdul%20Aziz,%0A%0AI'd%20like%20to%20publish%20my%20portfolio%20or%20connect%20a%20custom%20domain%20during%20the%20scheduled%20gateway%20maintenance.%0A%0AAccount%20Email:%20" style="
            text-decoration: none;
            font-size: 12px;
            font-weight: 500;
            color: #94A3B8;
            padding: 8px 14px;
            border-radius: 8px;
            background: rgba(255,255,255,0.05);
            border: 1px solid rgba(255,255,255,0.1);
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
          " onmouseover="this.style.color='#fff'; this.style.background='rgba(255,255,255,0.1)'" onmouseout="this.style.color='#94A3B8'; this.style.background='rgba(255,255,255,0.05)'">
            <span>Contact Founder</span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
          </a>

          <button type="button" id="mfPaymentModalDismissBtn" style="
            background: linear-gradient(135deg, #10B981, #059669);
            border: 1px solid #059669;
            color: #fff;
            padding: 9px 18px;
            border-radius: 8px;
            font-size: 12.5px;
            font-weight: 700;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            box-shadow: 0 4px 14px rgba(16,185,129,0.3);
            transition: transform 0.15s, box-shadow 0.15s;
          " onmouseover="this.style.transform='translateY(-1px)'; this.style.boxShadow='0 6px 18px rgba(16,185,129,0.45)'" onmouseout="this.style.transform='none'; this.style.boxShadow='0 4px 14px rgba(16,185,129,0.3)'">
            Continue Creating Free ➔
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closePaymentMaintenanceModal();
    });

    const closeBtn = document.getElementById('mfPaymentModalCloseBtn');
    if (closeBtn) closeBtn.onclick = closePaymentMaintenanceModal;

    const dismissBtn = document.getElementById('mfPaymentModalDismissBtn');
    if (dismissBtn) dismissBtn.onclick = closePaymentMaintenanceModal;
  }

  function showPaymentMaintenanceModal(options = {}) {
    createModalDOM();
    const modal = document.getElementById('mfPaymentMaintenanceModal');
    const card = document.getElementById('mfPaymentModalCard');
    if (!modal || !card) return;

    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
      card.style.transform = 'scale(1)';
    });

    // Close any underlying checkout modals
    try {
      const proModal = document.getElementById('proUpgradeModal');
      if (proModal) proModal.style.display = 'none';
      const legalModal = document.getElementById('dashPreCheckoutLegalModal');
      if (legalModal) legalModal.style.display = 'none';
      const studioLegalModal = document.getElementById('preCheckoutLegalModal');
      if (studioLegalModal) studioLegalModal.style.display = 'none';
      const upgradeModal = document.getElementById('upgradeProModal');
      if (upgradeModal) upgradeModal.style.display = 'none';
    } catch (e) {}
  }

  function closePaymentMaintenanceModal() {
    const modal = document.getElementById('mfPaymentMaintenanceModal');
    const card = document.getElementById('mfPaymentModalCard');
    if (!modal || !card) return;

    modal.style.opacity = '0';
    card.style.transform = 'scale(0.95)';
    setTimeout(() => {
      modal.style.display = 'none';
    }, 250);
  }

  window.showPaymentMaintenanceModal = showPaymentMaintenanceModal;
  window.closePaymentMaintenanceModal = closePaymentMaintenanceModal;

  // Intercept window events
  window.addEventListener('SHOW_PAYMENT_MAINTENANCE', (e) => {
    showPaymentMaintenanceModal(e.detail || {});
  });

  // Ready on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createModalDOM);
  } else {
    createModalDOM();
  }
})();
