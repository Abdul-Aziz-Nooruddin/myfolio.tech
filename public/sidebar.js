/**
 * MyFolio Universal AppShell & Navigation Component
 * Professional Dark/Light Spatial Creative Operating System
 */

function injectSidebarStyles() {
  if (document.getElementById('myfolio-appshell-css')) return;
  const style = document.createElement('style');
  style.id = 'myfolio-appshell-css';
  style.textContent = `
    .app-shell-layout {
      display: flex;
      min-height: 100vh;
      width: 100%;
      position: relative;
      background: var(--mf-bg-primary, #0A0A0A);
      color: var(--mf-text-primary, #F4F1E8);
      font-family: var(--mf-font-sans, 'Inter', -apple-system, sans-serif);
      transition: background 0.25s ease, color 0.25s ease;
    }

    [data-theme="light"] .app-shell-layout {
      background: #F8FAFC !important;
      color: #0F172A !important;
    }

    #sidebarMount {
      width: 250px;
      min-width: 250px;
      max-width: 250px;
      flex: 0 0 250px;
      display: block;
      position: relative;
      z-index: 1000;
    }

    .app-main-content {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 2;
      background: transparent;
    }

    .app-sidebar {
      width: 250px;
      min-width: 250px;
      max-width: 250px;
      height: 100vh;
      position: sticky;
      top: 0;
      background: #0A0A0A;
      border-right: 1px solid #242424;
      display: flex;
      flex-direction: column;
      z-index: 1000;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.25s ease, border-color 0.25s ease;
      font-family: var(--mf-font-sans, 'Inter', -apple-system, sans-serif);
      color: #F4F1E8;
      overflow: hidden;
    }

    [data-theme="light"] .app-sidebar {
      background: #FFFFFF !important;
      border-right: 1px solid #E2E8F0 !important;
      color: #0F172A !important;
    }

    .sidebar-brand-header {
      padding: 1.15rem 1.15rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #242424;
      position: relative;
      z-index: 2;
    }

    [data-theme="light"] .sidebar-brand-header {
      border-bottom: 1px solid #E2E8F0 !important;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }

    .brand-text-col {
      display: flex;
      flex-direction: column;
    }

    .brand-name {
      font-family: 'Inter', -apple-system, sans-serif;
      font-weight: 700;
      font-size: 1.15rem;
      letter-spacing: -0.03em;
      color: #FFFFFF;
      display: flex;
      align-items: center;
    }

    [data-theme="light"] .brand-name {
      color: #0F172A !important;
    }

    .brand-name .brand-dot {
      color: #5FA5F9;
    }

    .brand-subtitle {
      font-family: var(--mf-font-mono, monospace);
      font-size: 0.6rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      color: #8E8E93;
      text-transform: uppercase;
      margin-top: 1px;
    }

    [data-theme="light"] .brand-subtitle {
      color: #64748B !important;
    }

    .theme-toggle-btn {
      background: #181818;
      border: 1px solid #282828;
      border-radius: 8px;
      color: #F4F1E8;
      padding: 6px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      flex-shrink: 0;
    }

    .theme-toggle-btn:hover {
      background: #242424;
      border-color: #383838;
      color: #FCD34D;
      transform: scale(1.05);
    }

    [data-theme="light"] .theme-toggle-btn {
      background: #F1F5F9 !important;
      border-color: #E2E8F0 !important;
      color: #0F172A !important;
    }

    [data-theme="light"] .theme-toggle-btn:hover {
      background: #E2E8F0 !important;
      color: #2563EB !important;
    }

    .sidebar-content {
      flex: 1;
      padding: 1.15rem 0.85rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 2;
      gap: 1.35rem;
    }

    .sidebar-section-title {
      font-family: var(--mf-font-mono, monospace);
      font-size: 0.65rem;
      font-weight: 700;
      letter-spacing: 0.12em;
      color: #666666;
      padding: 0 0.65rem;
      margin-bottom: 0.45rem;
      text-transform: uppercase;
    }

    [data-theme="light"] .sidebar-section-title {
      color: #94A3B8 !important;
    }

    .sidebar-menu {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .sidebar-nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.62rem 0.8rem;
      border-radius: 9999px;
      color: #A0A0A0;
      text-decoration: none;
      font-size: 0.88rem;
      font-weight: 500;
      transition: all 0.18s cubic-bezier(0.16, 1, 0.3, 1);
      position: relative;
      border: 1px solid transparent;
    }

    .sidebar-nav-item:hover {
      color: #FFFFFF;
      background: #181818;
      border-color: #262626;
      transform: translateX(2px);
    }

    .sidebar-nav-item.active {
      color: #FFFFFF;
      background: #1C1C1C;
      border-color: #333333;
      font-weight: 600;
    }

    .sidebar-nav-item.active .nav-icon {
      color: #5FA5F9;
    }

    .sidebar-nav-item .nav-icon {
      color: #777777;
      transition: color 0.18s;
      flex-shrink: 0;
    }

    .sidebar-nav-item:hover .nav-icon {
      color: #5FA5F9;
    }

    [data-theme="light"] .sidebar-nav-item {
      color: #475569 !important;
    }

    [data-theme="light"] .sidebar-nav-item:hover {
      background: #F1F5F9 !important;
      border-color: #E2E8F0 !important;
      color: #0F172A !important;
    }

    [data-theme="light"] .sidebar-nav-item.active {
      background: #EFF6FF !important;
      border-color: #BFDBFE !important;
      color: #2563EB !important;
    }

    [data-theme="light"] .sidebar-nav-item .nav-icon {
      color: #64748B !important;
    }

    [data-theme="light"] .sidebar-nav-item.active .nav-icon {
      color: #2563EB !important;
    }

    .sidebar-footer-dock {
      padding: 0.9rem;
      border-top: 1px solid #242424;
      position: relative;
      z-index: 2;
      background: #0A0A0A;
      display: flex;
      flex-direction: column;
      gap: 0.65rem;
    }

    [data-theme="light"] .sidebar-footer-dock {
      background: #FFFFFF !important;
      border-top: 1px solid #E2E8F0 !important;
    }

    .plan-status-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #141414;
      border: 1px solid #262626;
      border-radius: 9999px;
      padding: 5px 11px;
      font-size: 11.5px;
      color: #A0A0A0;
    }

    [data-theme="light"] .plan-status-pill {
      background: #F8FAFC !important;
      border-color: #E2E8F0 !important;
      color: #475569 !important;
    }

    .plan-pill-tag {
      font-family: var(--mf-font-mono, monospace);
      font-weight: 700;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 7px;
      border-radius: 9999px;
      background: rgba(95, 165, 249, 0.12);
      color: #5FA5F9;
    }

    .user-dock-profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      background: #141414;
      border: 1px solid #262626;
      border-radius: 12px;
      padding: 0.55rem 0.75rem;
      transition: border-color 0.2s;
    }

    [data-theme="light"] .user-dock-profile {
      background: #F8FAFC !important;
      border-color: #E2E8F0 !important;
    }

    .user-avatar-circle {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #1E1E1E;
      border: 1px solid #333333;
      color: #FFFFFF;
      font-size: 0.88rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    [data-theme="light"] .user-avatar-circle {
      background: #E2E8F0 !important;
      border-color: #CBD5E1 !important;
      color: #0F172A !important;
    }

    .user-meta-wrap {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
    }

    .user-name-text {
      font-size: 0.85rem;
      font-weight: 600;
      color: #F4F1E8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    [data-theme="light"] .user-name-text {
      color: #0F172A !important;
    }

    .user-email-text {
      font-size: 0.72rem;
      color: #888888;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    [data-theme="light"] .user-email-text {
      color: #64748B !important;
    }

    .user-logout-btn {
      background: transparent;
      border: none;
      color: #777777;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s;
    }

    .user-logout-btn:hover {
      color: #FF5A65;
      background: rgba(255, 90, 101, 0.1);
    }

    .sidebar-login-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      width: 100%;
      background: #181818;
      border: 1px solid #282828;
      color: #FFFFFF;
      padding: 0.65rem;
      border-radius: 9999px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      transition: all 0.2s;
    }

    .sidebar-login-btn:hover {
      background: #222222;
      border-color: #383838;
      color: #5FA5F9;
    }

    /* Universal Modal & Confirm Styles */
    .mf-universal-modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 10000000;
      background: rgba(3, 7, 18, 0.82);
      backdrop-filter: blur(14px);
      -webkit-backdrop-filter: blur(14px);
      display: none;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: var(--mf-font-sans, 'Inter', -apple-system, sans-serif);
      opacity: 0;
      transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }

    .mf-universal-modal-backdrop.active {
      display: flex !important;
      opacity: 1 !important;
    }

    .mf-universal-modal-card {
      background: #0D1117;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 20px;
      max-width: 460px;
      width: 100%;
      padding: 24px;
      color: #FFFFFF;
      box-shadow: 0 25px 60px rgba(0, 0, 0, 0.85);
      transform: scale(0.95);
      transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1);
      box-sizing: border-box;
      text-align: left;
    }

    .mf-universal-modal-backdrop.active .mf-universal-modal-card {
      transform: scale(1);
    }

    [data-theme="light"] .mf-universal-modal-card {
      background: #FFFFFF !important;
      border-color: #E2E8F0 !important;
      color: #0F172A !important;
      box-shadow: 0 25px 60px rgba(15, 23, 42, 0.15) !important;
    }

    /* Plans Drawer Modal */
    .mf-plans-drawer-card {
      background: #0D1117;
      border: 1px solid rgba(255, 255, 255, 0.14);
      border-radius: 24px;
      max-width: 720px;
      width: 100%;
      padding: 28px 24px;
      color: #FFFFFF;
      box-shadow: 0 30px 80px rgba(0, 0, 0, 0.85);
      position: relative;
      max-height: 90vh;
      overflow-y: auto;
      box-sizing: border-box;
    }

    [data-theme="light"] .mf-plans-drawer-card {
      background: #FFFFFF !important;
      border-color: #E2E8F0 !important;
      color: #0F172A !important;
      box-shadow: 0 30px 80px rgba(15, 23, 42, 0.12) !important;
    }

    /* Mobile Responsive Shell */
    .mobile-top-bar {
      display: none;
    }

    @media (max-width: 960px) {
      .app-shell-layout {
        flex-direction: column !important;
        width: 100% !important;
        min-width: 0 !important;
        overflow-x: hidden !important;
      }

      #sidebarMount {
        width: 100% !important;
        display: block !important;
        flex: 0 0 auto !important;
      }

      .app-main-content {
        width: 100% !important;
        min-width: 0 !important;
        flex: 1 1 auto !important;
        overflow-x: hidden !important;
      }

      .app-sidebar {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        bottom: 0 !important;
        width: 280px !important;
        max-width: 85vw !important;
        height: 100vh !important;
        z-index: 1000 !important;
        transform: translateX(-100%) !important;
        transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1) !important;
        box-shadow: 10px 0 30px rgba(0, 0, 0, 0.6) !important;
      }

      .app-sidebar.mobile-open {
        transform: translateX(0) !important;
      }

      .mobile-top-bar {
        display: flex !important;
        position: sticky !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        height: 56px !important;
        z-index: 990 !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 0 1rem !important;
        background: #0A0A0A !important;
        border-bottom: 1px solid #242424 !important;
      }

      [data-theme="light"] .mobile-top-bar {
        background: #FFFFFF !important;
        border-bottom: 1px solid #E2E8F0 !important;
      }

      .sidebar-backdrop {
        display: block;
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(4px);
        z-index: 998;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.3s;
      }

      .sidebar-backdrop.active {
        opacity: 1;
        pointer-events: auto;
      }
    }
  `;
  document.head.appendChild(style);
}

function toggleAppSidebar(forceState) {
  const sidebar = document.getElementById('mainAppSidebar');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar) return;

  const isOpen = forceState !== undefined ? forceState : !sidebar.classList.contains('mobile-open');
  if (isOpen) {
    sidebar.classList.add('mobile-open');
    if (backdrop) backdrop.classList.add('active');
  } else {
    sidebar.classList.remove('mobile-open');
    if (backdrop) backdrop.classList.remove('active');
  }
}

function getStoredTheme() {
  try {
    return localStorage.getItem('myfolio_theme') || 'dark';
  } catch (e) {
    return 'dark';
  }
}

function setPlatformTheme(theme) {
  const current = theme === 'light' ? 'light' : 'dark';
  try {
    localStorage.setItem('myfolio_theme', current);
  } catch (e) {}

  document.documentElement.setAttribute('data-theme', current);
  if (document.body) document.body.setAttribute('data-theme', current);

  // Update theme toggle buttons on page
  const buttons = document.querySelectorAll('.theme-toggle-btn');
  buttons.forEach(btn => {
    btn.innerHTML = current === 'dark'
      ? `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
      : `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
    btn.title = current === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
  });
}

function togglePlatformTheme() {
  const current = getStoredTheme();
  setPlatformTheme(current === 'dark' ? 'light' : 'dark');
}

/**
 * Universal Non-blocking Confirm Dialog
 * Replaces native window.confirm() with high-fidelity custom modal
 */
function showConfirmModal({
  title = 'Please Confirm',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  danger = false
} = {}) {
  return new Promise((resolve) => {
    let backdrop = document.getElementById('mf-universal-confirm-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'mf-universal-confirm-backdrop';
      backdrop.className = 'mf-universal-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    const iconColor = danger ? '#EF4444' : '#38BDF8';
    const btnBg = danger ? 'linear-gradient(135deg, #EF4444, #DC2626)' : 'linear-gradient(135deg, #2563EB, #1D4ED8)';

    backdrop.innerHTML = `
      <div class="mf-universal-modal-card">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: rgba(239,68,68,0.12); border: 1px solid rgba(239,68,68,0.3); color: ${iconColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${danger
              ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>'
              : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>'
            }
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0; letter-spacing: -0.01em;">${title}</h3>
        </div>
        <p style="font-size: 13.5px; color: #94A3B8; margin: 0 0 20px 0; line-height: 1.55;">${message}</p>
        <div style="display: flex; justify-content: flex-end; gap: 10px;">
          <button id="mfConfirmCancelBtn" type="button" style="padding: 8px 16px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.12); border-radius: 9px; color: #E2E8F0; font-size: 13px; font-weight: 600; cursor: pointer;">
            ${cancelText}
          </button>
          <button id="mfConfirmOkBtn" type="button" style="padding: 8px 18px; background: ${btnBg}; border: none; border-radius: 9px; color: #FFFFFF; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    const cleanUp = (result) => {
      backdrop.classList.remove('active');
      resolve(result);
    };

    const cancelBtn = backdrop.querySelector('#mfConfirmCancelBtn');
    const okBtn = backdrop.querySelector('#mfConfirmOkBtn');

    if (cancelBtn) cancelBtn.onclick = () => cleanUp(false);
    if (okBtn) okBtn.onclick = () => cleanUp(true);

    backdrop.onclick = (e) => {
      if (e.target === backdrop) cleanUp(false);
    };
  });
}

/**
 * Universal Non-blocking Alert Dialog
 * Replaces native window.alert() with high-fidelity custom modal
 */
function showAlertModal({
  title = 'Notification',
  message = '',
  type = 'info',
  confirmText = 'Got It'
} = {}) {
  return new Promise((resolve) => {
    let backdrop = document.getElementById('mf-universal-alert-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'mf-universal-alert-backdrop';
      backdrop.className = 'mf-universal-modal-backdrop';
      document.body.appendChild(backdrop);
    }

    let iconHtml = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';
    let iconBg = 'rgba(56,189,248,0.12)';
    let iconBorder = 'rgba(56,189,248,0.3)';
    let iconColor = '#38BDF8';

    if (type === 'error') {
      iconHtml = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>';
      iconBg = 'rgba(239,68,68,0.12)';
      iconBorder = 'rgba(239,68,68,0.3)';
      iconColor = '#EF4444';
    } else if (type === 'success') {
      iconHtml = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>';
      iconBg = 'rgba(16,185,129,0.12)';
      iconBorder = 'rgba(16,185,129,0.3)';
      iconColor = '#10B981';
    }

    backdrop.innerHTML = `
      <div class="mf-universal-modal-card">
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
          <div style="width: 36px; height: 36px; border-radius: 10px; background: ${iconBg}; border: 1px solid ${iconBorder}; color: ${iconColor}; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            ${iconHtml}
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 700; margin: 0; letter-spacing: -0.01em;">${title}</h3>
        </div>
        <p style="font-size: 13.5px; color: #94A3B8; margin: 0 0 20px 0; line-height: 1.55;">${message}</p>
        <div style="display: flex; justify-content: flex-end;">
          <button id="mfAlertOkBtn" type="button" style="padding: 8px 20px; background: #2563EB; border: none; border-radius: 9px; color: #FFFFFF; font-size: 13px; font-weight: 700; cursor: pointer; box-shadow: 0 2px 10px rgba(37,99,235,0.3);">
            ${confirmText}
          </button>
        </div>
      </div>
    `;

    backdrop.classList.add('active');

    const cleanUp = () => {
      backdrop.classList.remove('active');
      resolve();
    };

    const okBtn = backdrop.querySelector('#mfAlertOkBtn');
    if (okBtn) okBtn.onclick = cleanUp;

    backdrop.onclick = (e) => {
      if (e.target === backdrop) cleanUp();
    };
  });
}

/**
 * Universal Plans Drawer / Modal
 * Shows full breakdowns for Lifetime Starter (₹149 one-time) and Pro Creator (₹149/mo)
 */
function openPlansDrawer(event) {
  if (event) event.preventDefault();

  let backdrop = document.getElementById('mf-plans-drawer-backdrop');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'mf-plans-drawer-backdrop';
    backdrop.className = 'mf-universal-modal-backdrop';
    document.body.appendChild(backdrop);
  }

  backdrop.innerHTML = `
    <div class="mf-plans-drawer-card">
      <button type="button" onclick="closePlansDrawer()" style="position: absolute; top: 18px; right: 18px; background: rgba(255,255,255,0.06); border: none; color: #94A3B8; font-size: 22px; width: 34px; height: 34px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; line-height: 1;">&times;</button>
      
      <div style="font-size: 11px; font-weight: 800; color: #38BDF8; letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 6px;">PORTFOLIO ARCHITECTURE • PLANS &amp; PRICING</div>
      <h2 style="font-size: 1.5rem; font-weight: 800; margin: 0 0 6px 0;">Unlock Your 3D Portfolio</h2>
      <p style="font-size: 13px; color: #94A3B8; margin: 0 0 24px 0; line-height: 1.5;">Choose the publishing license that best fits your workflow. 100% Watermark removed, permanent 24/7 global hosting, and zero hidden platform fees.</p>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 20px;">
        <!-- Plan 1: Lifetime Starter -->
        <div style="background: rgba(13,148,136,0.08); border: 2px solid #0D9488; border-radius: 18px; padding: 22px 18px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 10px; font-weight: 800; background: #0D9488; color: #fff; padding: 3px 9px; border-radius: 9999px;">LIFETIME STARTER • 80% OFF</span>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 800; margin: 0 0 4px 0;">Lifetime Starter</h3>
            <div style="font-size: 1.6rem; font-weight: 900; margin-bottom: 8px;">
              <span style="font-size: 13px; text-decoration: line-through; color: #64748B; font-weight: 600; margin-right: 6px;">₹749</span>₹149 <span style="font-size: 12px; color: #94A3B8; font-weight: 600;">/ one-time</span>
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #2DD4BF; margin-bottom: 14px;">✓ Pay once • Own it forever • Zero subscriptions</div>
            <ul style="list-style: none; padding: 0; margin: 0 0 18px 0; display: flex; flex-direction: column; gap: 8px; font-size: 12px; color: #CBD5E1;">
              <li style="display: flex; gap: 8px;"><strong>✓ Permanent 24/7 Hosting:</strong> Deployed on Netlify Edge CDN with sub-100ms global latency.</li>
              <li style="display: flex; gap: 8px;"><strong>✓ 100% Watermark-Free:</strong> Removes preview badges, banners, and timers.</li>
              <li style="display: flex; gap: 8px;"><strong>✓ Standalone Source Code (.ZIP):</strong> Download your full HTML, CSS, Three.js shaders, and assets to host anywhere.</li>
              <li style="display: flex; gap: 8px;"><strong>✓ 1 Free Style Rebuild:</strong> Regenerate your theme or update skills once at any time.</li>
            </ul>
          </div>
          <a href="/pricing" style="display: block; width: 100%; padding: 11px; background: #0D9488; color: #FFFFFF; font-weight: 800; font-size: 13px; border-radius: 10px; text-decoration: none; text-align: center; box-shadow: 0 4px 14px rgba(13,148,136,0.35);">
            Choose Lifetime Starter (₹149) &rarr;
          </a>
        </div>

        <!-- Plan 2: Pro Creator -->
        <div style="background: rgba(37,99,235,0.08); border: 2.5px solid #2563EB; border-radius: 18px; padding: 22px 18px; display: flex; flex-direction: column; justify-content: space-between;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
              <span style="font-size: 10px; font-weight: 800; background: #2563EB; color: #fff; padding: 3px 9px; border-radius: 9999px;">PRO CREATOR • 70% OFF</span>
            </div>
            <h3 style="font-size: 1.25rem; font-weight: 800; margin: 0 0 4px 0;">Pro Creator</h3>
            <div style="font-size: 1.6rem; font-weight: 900; margin-bottom: 8px;">
              <span style="font-size: 13px; text-decoration: line-through; color: #64748B; font-weight: 600; margin-right: 6px;">₹499</span>₹149 <span style="font-size: 12px; color: #94A3B8; font-weight: 600;">/ month</span>
            </div>
            <div style="font-size: 11px; font-weight: 700; color: #60A5FA; margin-bottom: 14px;">✓ Billed monthly • Cancel anytime with 1-click</div>
            <ul style="list-style: none; padding: 0; margin: 0 0 18px 0; display: flex; flex-direction: column; gap: 8px; font-size: 12px; color: #CBD5E1;">
              <li style="display: flex; gap: 8px;"><strong>✓ Branded Subdomain:</strong> Claim your vanity address (<code>&lt;username&gt;.myfolio.tech</code>) with SSL.</li>
              <li style="display: flex; gap: 8px;"><strong>✓ Custom Domain Support:</strong> Connect your personal root domain (<code>yourname.dev</code>).</li>
              <li style="display: flex; gap: 8px;"><strong>✓ Continuous Live GitHub Auto-Sync:</strong> Repos, stars, and commit milestones update automatically.</li>
              <li style="display: flex; gap: 8px;"><strong>✓ Switch 3D Worlds Anytime:</strong> Swap between templates without rebuilding.</li>
              <li style="display: flex; gap: 8px;"><strong>✓ Source Code (.ZIP) &amp; Watermark-Free:</strong> All Lifetime Starter features included.</li>
            </ul>
          </div>
          <a href="/pricing" style="display: block; width: 100%; padding: 11px; background: linear-gradient(135deg, #2563EB, #1D4ED8); color: #FFFFFF; font-weight: 800; font-size: 13px; border-radius: 10px; text-decoration: none; text-align: center; box-shadow: 0 4px 16px rgba(37,99,235,0.35);">
            Choose Pro Creator (₹149/mo) &rarr;
          </a>
        </div>
      </div>

      <div style="text-align: center; font-size: 11.5px; color: #94A3B8;">
        🔒 Direct bank-to-bank settlement via YouPI Sovereign UPI • 0% Platform Fees • 100% Non-refundable digital fulfillment
      </div>
    </div>
  `;

  backdrop.classList.add('active');

  backdrop.onclick = (e) => {
    if (e.target === backdrop) closePlansDrawer();
  };
}

function closePlansDrawer() {
  const backdrop = document.getElementById('mf-plans-drawer-backdrop');
  if (backdrop) backdrop.classList.remove('active');
}

function renderSidebarUserDock(dock, user) {
  if (!dock || !user) return;
  const displayName = user.name || user.username || (user.email ? user.email.split('@')[0] : 'Engineer');
  const email = (user.email || '').toLowerCase().trim();
  const username = user.username || (email ? email.split('@')[0] : 'developer');
  const initial = displayName.charAt(0).toUpperCase();
  const isVip = email === 'abdulaziznoor9876@gmail.com';

  dock.innerHTML = `
    <div class="plan-status-pill">
      <span>Weekly Builds</span>
      <span class="plan-pill-tag" style="${isVip ? 'color:#FCD34D; background:rgba(252,211,77,0.15);' : ''}">${isVip ? 'VIP Founder' : 'Starter Free'}</span>
    </div>
    <div class="user-dock-profile">
      <a href="/profile" class="user-avatar-circle" title="View Profile" style="text-decoration: none;">${initial}</a>
      <a href="/profile" class="user-meta-wrap" title="View Profile & Settings" style="text-decoration: none; color: inherit;">
        <div class="user-name-text">${displayName}</div>
        <div class="user-email-text">@${username}</div>
      </a>
      <button class="user-logout-btn" onclick="sidebarSignOut()" title="Sign Out">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
      </button>
    </div>
  `;
}

async function hydrateSidebarUser() {
  const dock = document.getElementById('sidebarUserCard');
  if (!dock) return;

  // Immediate synchronous cache render (0 ms latency)
  try {
    const cachedRaw = localStorage.getItem('myfolio_user');
    if (cachedRaw) {
      const u = JSON.parse(cachedRaw);
      if (u && (u.name || u.username || u.email)) {
        renderSidebarUserDock(dock, u);
      }
    }
  } catch (e) {}

  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      const user = data.user || data;
      renderSidebarUserDock(dock, user);
      try {
        localStorage.setItem('myfolio_user', JSON.stringify(user));
        const email = (user.email || '').toLowerCase().trim();
        if (email === 'abdulaziznoor9876@gmail.com') {
          localStorage.setItem('myfolio_vip_admin', 'true');
        } else {
          localStorage.removeItem('myfolio_vip_admin');
        }
      } catch (e) {}
      return;
    }
  } catch (err) {}

  if (!localStorage.getItem('myfolio_user')) {
    dock.innerHTML = `
      <a href="/auth" class="sidebar-login-btn">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
        <span>Sign In / Enter</span>
      </a>
    `;
  }
}

async function sidebarSignOut() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (e) {}
  try {
    localStorage.removeItem('myfolio_user');
    localStorage.removeItem('myfolio_vip_admin');
    localStorage.removeItem('myfolio_active_vip_site');
    localStorage.removeItem('myfolio_portfolios_cache');
    localStorage.removeItem('myfolio_selected_portfolio_id');
    localStorage.removeItem('myfolio_dash_data');
    localStorage.removeItem('myfolio_generated_projects_v1');
    localStorage.removeItem('myfolio_weekly_allowance_v1');
  } catch (e) {}
  window.location.href = '/auth';
}

function initUniversalSidebar(activePage) {
  injectSidebarStyles();
  const mount = document.getElementById('sidebarMount');
  if (!mount) return;

  const activeStudio = (activePage === 'studio' || activePage === 'home') ? 'active' : '';
  const activeDashboard = activePage === 'dashboard' ? 'active' : '';
  const activePlans = (activePage === 'plans' || activePage === 'pricing') ? 'active' : '';
  const activeProfile = activePage === 'profile' ? 'active' : '';
  const activeSettings = activePage === 'settings' ? 'active' : '';

  const currentTheme = getStoredTheme();
  document.documentElement.setAttribute('data-theme', currentTheme);
  if (document.body) document.body.setAttribute('data-theme', currentTheme);

  mount.innerHTML = `
  <!-- Mobile Top Bar (< 960px) -->
  <div class="mobile-top-bar">
    <a href="/" class="brand-link" style="display:flex; align-items:center; gap:0.65rem; text-decoration:none;">
      <img src="/assets/logo-animated.webp" alt="MyFolio logo" class="brand-logo-img" width="28" height="28" style="border-radius:50%; object-fit:cover; display:block;" />
      <span class="brand-name">myfolio<span class="brand-dot">.</span></span>
    </a>
    <div style="display:flex; align-items:center; gap:8px;">
      <button class="theme-toggle-btn" onclick="togglePlatformTheme()" title="Switch Light/Dark Mode" aria-label="Toggle Theme">
        ${currentTheme === 'dark'
          ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
          : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'}
      </button>
      <button id="sidebarToggleBtn" style="background:#181818; border:1px solid #282828; border-radius:8px; color:#F4F1E8; padding:7px; cursor:pointer;" onclick="toggleAppSidebar()" aria-label="Toggle Navigation">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
      </button>
    </div>
  </div>

  <div id="sidebarBackdrop" class="sidebar-backdrop" onclick="toggleAppSidebar(false)"></div>

  <!-- Left Sidebar Shell -->
  <aside id="mainAppSidebar" class="app-sidebar">
    <div class="sidebar-brand-header">
      <a href="/" class="brand-link" style="display:flex; align-items:center; gap:0.75rem; text-decoration:none;">
        <img src="/assets/logo-animated.webp" alt="MyFolio logo" class="brand-logo-img" width="28" height="28" style="border-radius:50%; object-fit:cover; display:block;" />
        <div class="brand-text-col">
          <span class="brand-name">myfolio<span class="brand-dot">.</span></span>
          <span class="brand-subtitle">PLATFORM</span>
        </div>
      </a>
      <!-- Top Sidebar Theme Switcher -->
      <button class="theme-toggle-btn" onclick="togglePlatformTheme()" title="Switch Light/Dark Mode" aria-label="Toggle Theme">
        ${currentTheme === 'dark'
          ? '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
          : '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>'}
      </button>
    </div>

    <div class="sidebar-content">
      <div>
        <div class="sidebar-section-title">WORKSPACE</div>
        <nav class="sidebar-menu">
          <a href="/studio" class="sidebar-nav-item ${activeStudio}">
            <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"></polygon><polyline points="2 17 12 22 22 17"></polyline><polyline points="2 12 12 17 22 12"></polyline></svg>
            <span>Studio</span>
          </a>
          <a href="/dashboard" class="sidebar-nav-item ${activeDashboard}">
            <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
            <span>Dashboard</span>
          </a>
        </nav>
      </div>

      <!-- Dedicated Plans Section in Sidebar -->
      <div>
        <div class="sidebar-section-title">PLANS</div>
        <nav class="sidebar-menu">
          <a href="/pricing" class="sidebar-nav-item ${activePlans}" onclick="openPlansDrawer(event)">
            <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            <span>Plans &amp; Pricing</span>
            <span style="font-size:9.5px; background:rgba(37,99,235,0.22); color:#60A5FA; padding:2px 7px; border-radius:9999px; font-weight:800; margin-left:auto;">80% OFF</span>
          </a>
        </nav>
      </div>

      <div>
        <div class="sidebar-section-title">TEMPLATES</div>
        <nav class="sidebar-menu">
          <a href="/jack-3d" target="_blank" class="sidebar-nav-item">
            <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 16 4-4-4-4"></path><path d="m6 8-4 4 4 4"></path><path d="m14.5 4-5 16"></path></svg>
            <span>Jack 3D</span>
          </a>
          <a href="/nadia" target="_blank" class="sidebar-nav-item">
            <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polygon points="12 8 8 16 16 16"></polygon></svg>
            <span>Nadia Brand</span>
          </a>
          <a href="/kage" target="_blank" class="sidebar-nav-item">
            <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21h18M5 21V7l7-4 7 4v14M9 21V11l3-2 3 2v10"></path></svg>
            <span>Kage Temple</span>
          </a>
          <a href="/rbp" target="_blank" class="sidebar-nav-item">
            <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
            <span>RBP Kinetic</span>
          </a>
          <a href="/tom" target="_blank" class="sidebar-nav-item">
            <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect><line x1="7" y1="2" x2="7" y2="22"></line><line x1="17" y1="2" x2="17" y2="22"></line><line x1="2" y1="12" x2="22" y2="12"></line><line x1="2" y1="7" x2="7" y2="7"></line><line x1="2" y1="17" x2="7" y2="17"></line><line x1="17" y1="17" x2="22" y2="17"></line><line x1="17" y1="7" x2="22" y2="7"></line></svg>
            <span>Tom Cel 2D</span>
          </a>
          <a href="/apogee" target="_blank" class="sidebar-nav-item">
            <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            <span>Apogee Spatial</span>
          </a>
        </nav>
      </div>

      <div>
        <div class="sidebar-section-title">ACCOUNT</div>
        <nav class="sidebar-menu">
          <a href="/profile" class="sidebar-nav-item ${activeProfile}">
            <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
            <span>Profile</span>
          </a>
          <a href="/profile#security" class="sidebar-nav-item ${activeSettings}">
            <svg class="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
            <span>Settings</span>
          </a>
        </nav>
      </div>
    </div>

    <!-- Bottom User Status Dock -->
    <div class="sidebar-footer-dock" id="sidebarUserCard">
      <div class="plan-status-pill">
        <span>Plan</span>
        <span class="plan-pill-tag">Free Starter</span>
      </div>
    </div>
  </aside>
  `;

  hydrateSidebarUser();
}

// Global Non-Blocking Overrides for Native Dialogs
if (typeof window !== 'undefined') {
  window.initUniversalSidebar = initUniversalSidebar;
  window.toggleAppSidebar = toggleAppSidebar;
  window.sidebarSignOut = sidebarSignOut;
  window.getStoredTheme = getStoredTheme;
  window.setPlatformTheme = setPlatformTheme;
  window.togglePlatformTheme = togglePlatformTheme;
  window.showConfirmModal = showConfirmModal;
  window.showAlertModal = showAlertModal;
  window.openPlansDrawer = openPlansDrawer;
  window.closePlansDrawer = closePlansDrawer;

  // Safe non-blocking overrides for legacy alert/confirm
  window.confirm = function (msg) {
    console.warn('[NATIVE DIALOG BLOCKED] confirm() called with:', msg);
    showConfirmModal({ title: 'Confirmation Required', message: String(msg) });
    return false;
  };
  window.alert = function (msg) {
    console.warn('[NATIVE DIALOG BLOCKED] alert() called with:', msg);
    showAlertModal({ title: 'Notice', message: String(msg) });
  };

  // Autonomous Self-Mounting on DOM Readiness
  function autoMountSidebar() {
    const mount = document.getElementById('sidebarMount');
    if (mount && !document.getElementById('mainAppSidebar')) {
      const p = (window.location.pathname || '').toLowerCase();
      let page = 'dashboard';
      if (p.includes('studio') || p.includes('builder')) page = 'studio';
      else if (p.includes('pricing') || p.includes('plans')) page = 'plans';
      else if (p.includes('profile') || p.includes('settings') || p.includes('account')) page = 'profile';
      else if (mount.dataset && mount.dataset.page) page = mount.dataset.page;
      initUniversalSidebar(page);
    }
  }

  window.autoMountSidebar = autoMountSidebar;

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', autoMountSidebar);
    } else {
      autoMountSidebar();
    }
  }
}
