/**
 * MyFolio Universal AppShell & Navigation Component
 * Professional Dark Spatial Creative Operating System
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
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      font-family: var(--mf-font-sans, 'Inter', -apple-system, sans-serif);
      color: #F4F1E8;
      overflow: hidden;
    }

    .sidebar-brand-header {
      padding: 1.25rem 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid #242424;
      position: relative;
      z-index: 2;
    }

    .brand-link {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      text-decoration: none;
      color: inherit;
    }

    .brand-logo-mark {
      width: 22px;
      height: 22px;
      position: relative;
      transform: rotate(12deg);
      flex-shrink: 0;
    }

    .brand-logo-mark span {
      position: absolute;
      width: 9.5px;
      height: 9.5px;
      border-radius: 2.5px;
    }

    .brand-logo-mark .sq-1 { top: 0; left: 0; background: #FFFFFF; }
    .brand-logo-mark .sq-2 { top: 0; right: 0; background: #5FA5F9; }
    .brand-logo-mark .sq-3 { bottom: 0; left: 0; background: #8E8E93; }
    .brand-logo-mark .sq-4 { bottom: 0; right: 0; background: #FFFFFF; }

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

    .sidebar-content {
      flex: 1;
      padding: 1.25rem 0.85rem;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      position: relative;
      z-index: 2;
      gap: 1.5rem;
    }

    .sidebar-section-title {
      font-family: var(--mf-font-mono, monospace);
      font-size: 0.65rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      color: #666666;
      padding: 0 0.65rem;
      margin-bottom: 0.5rem;
      text-transform: uppercase;
    }

    .sidebar-menu {
      display: flex;
      flex-direction: column;
      gap: 0.3rem;
    }

    .sidebar-nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.65rem 0.8rem;
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

    .sidebar-footer-dock {
      padding: 1rem;
      border-top: 1px solid #242424;
      position: relative;
      z-index: 2;
      background: #0A0A0A;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .plan-status-pill {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: #141414;
      border: 1px solid #262626;
      border-radius: 9999px;
      padding: 6px 12px;
      font-size: 11.5px;
      color: #A0A0A0;
    }

    .plan-pill-tag {
      font-family: var(--mf-font-mono, monospace);
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 2px 8px;
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
      padding: 0.6rem 0.75rem;
      transition: border-color 0.2s;
    }

    .user-dock-profile:hover {
      border-color: #383838;
    }

    .user-avatar-circle {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #1E1E1E;
      border: 1px solid #333333;
      color: #FFFFFF;
      font-size: 0.9rem;
      font-weight: 700;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
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

    .user-email-text {
      font-size: 0.72rem;
      color: #888888;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
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
      padding: 0.7rem;
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
        background: rgba(8, 13, 32, 0.95) !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        border-bottom: 1px solid var(--mf-border, rgba(255, 255, 255, 0.08)) !important;
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

function scrollToSection(id, event) {
  const el = document.getElementById(id);
  if (el) {
    if (event) event.preventDefault();
    try { history.pushState(null, '', '#' + id); } catch (e) {}
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
window.scrollToSection = scrollToSection;

async function hydrateSidebarUser() {
  const dock = document.getElementById('sidebarUserCard');
  if (!dock) return;

  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      const user = data.user || data;
      const displayName = user.name || user.username || (user.email ? user.email.split('@')[0] : 'Engineer');
      const email = (user.email || '').toLowerCase().trim();
      const username = user.username || (email ? email.split('@')[0] : 'developer');
      const initial = displayName.charAt(0).toUpperCase();
      const isVip = email === 'abdulaziznoor9876@gmail.com';

      try {
        localStorage.setItem('myfolio_user', JSON.stringify(user));
        if (isVip) {
          localStorage.setItem('myfolio_vip_admin', 'true');
        } else {
          localStorage.removeItem('myfolio_vip_admin');
        }
      } catch (e) {}

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
      return;
    }
  } catch (err) {}

  dock.innerHTML = `
    <a href="/auth" class="sidebar-login-btn">
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
      <span>Sign In / Enter</span>
    </a>
  `;
}

async function sidebarSignOut() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (e) {}
  try {
    localStorage.removeItem('myfolio_user');
    localStorage.removeItem('myfolio_vip_admin');
    localStorage.removeItem('myfolio_active_vip_site');
  } catch (e) {}
  window.location.href = '/auth';
}

function initUniversalSidebar(activePage) {
  injectSidebarStyles();
  const mount = document.getElementById('sidebarMount');
  if (!mount) return;

  const activeStudio = (activePage === 'studio' || activePage === 'home') ? 'active' : '';
  const activeDashboard = activePage === 'dashboard' ? 'active' : '';
  const activePortfolios = activePage === 'portfolios' ? 'active' : '';
  const activeAnalytics = activePage === 'analytics' ? 'active' : '';
  const activeProfile = activePage === 'profile' ? 'active' : '';
  const activeSettings = activePage === 'settings' ? 'active' : '';

  mount.innerHTML = `
  <!-- Mobile Top Bar (< 960px) -->
  <div class="mobile-top-bar" style="background:#0A0A0A !important; border-bottom:1px solid #242424 !important;">
    <a href="/" class="brand-link" style="display:flex; align-items:center; gap:0.65rem; text-decoration:none;">
      <video class="brand-logo-video" autoplay loop muted playsinline webkit-playsinline poster="/assets/logo-3d.png" width="28" height="28" aria-hidden="true" style="border-radius:50%; object-fit:cover; display:block; flex-shrink:0;">
        <source src="/assets/logo-animated.webm" type="video/webm">
        <source src="/assets/logo-animated.mp4" type="video/mp4">
        <img src="/assets/logo-3d.png" alt="MyFolio logo" width="28" height="28" style="border-radius:50%;" />
      </video>
      <span class="brand-name">myfolio<span class="brand-dot">.</span></span>
    </a>
    <button id="sidebarToggleBtn" style="background:#181818; border:1px solid #282828; border-radius:8px; color:#F4F1E8; padding:7px; cursor:pointer;" onclick="toggleAppSidebar()" aria-label="Toggle Navigation">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
    </button>
  </div>

  <div id="sidebarBackdrop" class="sidebar-backdrop" onclick="toggleAppSidebar(false)"></div>

  <!-- Left Sidebar Shell -->
  <aside id="mainAppSidebar" class="app-sidebar">
    <div class="sidebar-brand-header">
      <a href="/" class="brand-link" style="display:flex; align-items:center; gap:0.75rem; text-decoration:none;">
        <video class="brand-logo-video" autoplay loop muted playsinline webkit-playsinline poster="/assets/logo-3d.png" width="32" height="32" aria-hidden="true" style="border-radius:50%; object-fit:cover; display:block; flex-shrink:0;">
          <source src="/assets/logo-animated.webm" type="video/webm">
          <source src="/assets/logo-animated.mp4" type="video/mp4">
          <img src="/assets/logo-3d.png" alt="MyFolio logo" width="32" height="32" style="border-radius:50%;" />
        </video>
        <div class="brand-text-col">
          <span class="brand-name">myfolio<span class="brand-dot">.</span></span>
          <span class="brand-subtitle">PLATFORM</span>
        </div>
      </a>
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

function getStoredTheme() {
  return 'dark';
}

function setPlatformTheme() {
  document.documentElement.setAttribute('data-theme', 'dark');
}

function togglePlatformTheme() {
  // Dark mode is default & mandatory
}

window.initUniversalSidebar = initUniversalSidebar;
window.toggleAppSidebar = toggleAppSidebar;
window.sidebarSignOut = sidebarSignOut;
window.getStoredTheme = getStoredTheme;
window.setPlatformTheme = setPlatformTheme;
window.togglePlatformTheme = togglePlatformTheme;
