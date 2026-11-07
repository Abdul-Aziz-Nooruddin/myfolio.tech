/**
 * Web Portfolio Studio - Main Server
 */

require('dotenv').config();

process.on('unhandledRejection', (reason, promise) => {
  console.warn('[PROCESS UNHANDLED REJECTION]', reason);
});

process.on('uncaughtException', (err) => {
  console.error('[PROCESS UNCAUGHT EXCEPTION]', err);
});

const express = require('express');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { AIService } = require('./services/ai-service');
const { DatabaseService } = require('./services/db-service');
const { SiteGenerator } = require('./services/site-generator');
const { HostingProvider, NetlifyDeployer } = require('./services/hosting-provider');
const { YoupiService } = require('./services/youpi-service');
const { RazorpayService } = require('./services/razorpay-service');
const { EmailService } = require('./services/email-service');
const { LifecycleService } = require('./services/lifecycle-service');
const { FigmaService } = require('./services/figma-service');
const { CustomDomainService } = require('./services/custom-domain-service');
const { DesignEngine, IA_MODELS, VISUAL_UNIVERSES } = require('./design-engine');
const { SecurityService } = require('./services/security-service');
const { SecurityMiddleware } = require('./middleware/security-middleware');
const { AuthMiddleware } = require('./middleware/auth-middleware');
const { AuthHandler } = require('./handlers/auth-handler');
const { PortfolioState } = require('./customizer/portfolio-state');
const { StaticExporter } = require('./export/static-exporter');
const { CustomizationQualityGate } = require('./customizer/customization-quality-gate');
const { SectionRegistry } = require('./customizer/section-registry');
const { BetaDashboard } = require('./analytics/beta-dashboard');
const { productTelemetry, EVENT_TYPES } = require('./analytics/product-events');
const { UploadValidator } = require('./services/upload-validator');
const { AdaptiveQuestionnaire } = require('./services/adaptive-questionnaire');
const { UnifiedProfileNormalizer } = require('./services/unified-profile-normalizer');
const { LegacyVibeDetector } = require('./design-intelligence/legacy-vibe-detector');
const { ErrorRecoveryService } = require('./services/error-recovery-service');
const { TemplateRegistry } = require('./templates/template-registry');
const { TemplateHelper } = require('./templates/template-helper');
const { renderExpiredPreviewPage } = require('./templates/common/expired-preview-page');
const { renderSubscribePage } = require('./templates/common/subscribe-page');
const { globalConcurrencyManager } = require('./services/concurrency-manager');
const { WhatsAppService } = require('./services/whatsapp-service');
const { WhatsAppHandler } = require('./handlers/whatsapp-handler');
const compression = require('compression');

// Universal helper: inject mobile CSS into any raw template HTML
const injectMobileCSS = (html) => html && html.includes('</body>')
  ? html.replace('</body>', `${TemplateRegistry.getMobileCSS()}\n</body>`)
  : html;

// Universal helper: inspect HTML content to accurately identify the visual template
const detectTemplateFromHtml = (html) => {
  if (!html || typeof html !== 'string') return 'jack-3d-creator';
  const metaMatch = html.match(/name=["']myfolio-(?:template|universe)["']\s+content=["']([^"']+)["']/i);
  if (metaMatch && metaMatch[1]) return metaMatch[1];

  if (html.includes('tom-cel-animator') || html.includes('Bricolage+Grotesque') || html.includes('font-title-comic') || html.includes('Tom 2D Cel Animation') || html.includes('#ac001e')) {
    return 'tom-cel-animator';
  }
  if (html.includes('rbp-kinetic-monochrome') || html.includes('string-tune') || html.includes('og-rbp') || html.includes('--site-frame-radius') || html.includes('rbp-portfolio')) {
    return 'rbp-kinetic-monochrome';
  }
  if (html.includes('kage-temple') || html.includes('Sanmon') || html.includes('shinto') || html.includes('kage.html') || html.includes('Kyoto')) {
    return 'kage-temple';
  }
  if (html.includes('nadia-brand') || html.includes('Electric Coral') || html.includes('Nadia Personal Brand') || html.includes('nadia-personal-brand')) {
    return 'nadia-brand';
  }
  if (html.includes('jack-3d-creator') || html.includes('Kanit') || html.includes('jack-portfolio-core-styles') || html.includes("HI, I'M") || html.includes('hero-heading')) {
    return 'jack-3d-creator';
  }
  return 'jack-3d-creator';
};

// Universal In-Memory Draft Cache: ensures draft sites persist across all requests & cold-starts
const globalDraftsCache = global.__MYFOLIO_DRAFTS_CACHE || new Map();
global.__MYFOLIO_DRAFTS_CACHE = globalDraftsCache;

const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1);

// Canonical Hostname Enforcer: 301 Permanent Redirect www.myfolio.tech -> https://myfolio.tech
app.use((req, res, next) => {
  const host = (req.hostname || req.get('host') || '').toLowerCase().split(':')[0];
  if (host === 'www.myfolio.tech') {
    return res.redirect(301, `https://myfolio.tech${req.originalUrl}`);
  }
  next();
});

// Instant 0ms Health Check for probes (Bypasses all heavy middleware, DB & auth)
app.all(['/health', '/healthz', '/api/health', '/healthcheck', '/ping', '/ready'], (req, res) => {
  const smtpHost = Boolean(process.env.SMTP_HOST || process.env.SMTP_SERVER || process.env.MAIL_HOST || process.env.EMAIL_HOST || process.env.TITAN_HOST);
  const smtpUser = Boolean(process.env.SMTP_USER || process.env.SMTP_USERNAME || process.env.MAIL_USER || process.env.EMAIL_USER || process.env.TITAN_USER || process.env.SUPPORT_EMAIL);
  const smtpPass = Boolean(process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.MAIL_PASS || process.env.MAIL_PASSWORD || process.env.EMAIL_PASS || process.env.TITAN_PASS);
  const gmailConfigured = Boolean(process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD);
  const httpEmailConfigured = Boolean(process.env.RESEND_API_KEY || process.env.BREVO_API_KEY || process.env.SENDGRID_API_KEY);
  const emailConfigured = (smtpHost && smtpUser && smtpPass) || gmailConfigured || httpEmailConfigured;

  // Safe list of configured key names (names only, no secrets or values)
  const detectedEmailKeys = Object.keys(process.env).filter(k => 
    /^(SMTP|MAIL|TITAN|EMAIL|GMAIL|RESEND|BREVO|SENDGRID)/i.test(k)
  );

  res.status(200).json({
    status: 'healthy',
    version: 'v1.6.3-email-resilience',
    ok: true,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    emailConfigured,
    emailDiagnostics: {
      has_host: smtpHost,
      has_user: smtpUser,
      has_pass: smtpPass,
      has_http_provider: httpEmailConfigured,
      detectedKeys: detectedEmailKeys
    }
  });
});

// High-Speed HTTP GZIP/Brotli Compression Middleware (Shrinks payloads by 70-80%)
app.use(compression({
  level: 6,
  threshold: 512,
  filter: (req, res) => {
    if (req.headers['x-no-compression']) return false;
    return compression.filter(req, res);
  }
}));

// Slow Request Telemetry & Profiler (>500ms threshold)
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (duration > 500 && !req.path.startsWith('/assets') && !req.path.startsWith('/web/')) {
      console.warn(`[SLOW REQUEST TELEMETRY] ${req.method} ${req.originalUrl || req.url} took ${duration}ms (status: ${res.statusCode})`);
    }
  });
  next();
});

const securityService = new SecurityService();
const figmaService = new FigmaService();
const designEngine = new DesignEngine();
const customizationQualityGate = new CustomizationQualityGate();
const portfolioCustomizerMap = new Map();

// Serverless-resilient site directory resolver (falls back to os.tmpdir() on read-only environments like Vercel)
function resolveSafeSiteDir(siteId) {
  const os = require('os');
  const primary = path.join(process.cwd(), 'public', 'sites', siteId);
  try {
    if (!fs.existsSync(primary)) {
      fs.mkdirSync(primary, { recursive: true });
    }
    return primary;
  } catch (err) {
    const fallback = path.join(os.tmpdir(), 'sites', siteId);
    try {
      if (!fs.existsSync(fallback)) {
        fs.mkdirSync(fallback, { recursive: true });
      }
    } catch (e2) {}
    return fallback;
  }
}

// Global Security Middleware Pipeline
app.use(SecurityMiddleware.requestTimeout(90000));
app.use(SecurityMiddleware.securityHeaders());
app.use(SecurityMiddleware.corsConfig());
app.use(express.json({ limit: '50mb', verify: (req, res, buf) => { req.rawBody = buf; } }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Canonical Host & Protocol Normalizer: Enforce HTTPS without conflicting with edge reverse proxy (Vercel/Render)
app.use((req, res, next) => {
  const host = (req.hostname || req.get('host') || '').toLowerCase().split(':')[0];
  const proto = req.get('x-forwarded-proto');

  // If request arrived over unencrypted HTTP, redirect to HTTPS preserving the requested host
  if (process.env.NODE_ENV === 'production' && proto === 'http') {
    return res.redirect(301, `https://${req.get('host')}${req.originalUrl}`);
  }
  next();
});

// Clean URL Normalizer: 301 Permanent Redirect for any .html requests and trailing slashes (e.g. /studio.html -> /studio, /studio/ -> /studio)
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.endsWith('.html')) {
    // Exclude Google Search Console HTML verification file from redirect
    if (req.path.startsWith('/google') && req.path.endsWith('.html')) {
      return next();
    }
    const cleanPath = req.path.replace(/\.html$/, '');
    const aliasMap = {
      '/auth': '/login',
      '/design-demo': '/universes',
      '/index': '/'
    };
    const target = aliasMap[cleanPath] || (cleanPath === '' ? '/' : cleanPath);
    const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
    return res.redirect(301, `${target}${query}`);
  }
  // Trailing slash normalizer for single-segment page routes only (e.g. /studio/ -> /studio).
  // Static directories (/sites/<id>/, /assets/...) are excluded to avoid redirect loops with express.static.
  if (req.method === 'GET' && /^\/[a-z0-9-]+\/$/i.test(req.path) &&
      !/^\/(sites|p|assets|web|images|landing-pages|design-preview|secret-pathways-assets|data|api)\/$/i.test(req.path)) {
    return res.redirect(301, req.path.slice(0, -1) + req.url.slice(req.path.length));
  }
  next();
});

// Global X-Robots-Tag header on all /api/ endpoints to protect search index
app.use('/api', (req, res, next) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  next();
});

// Guard GET on POST-only endpoints (e.g. /api/generate/unified) so crawlers get 405 with noindex instead of 404
app.get(['/api/generate/unified', '/api/generate/github', '/api/web/generate', '/api/web/parse-resume'], (req, res) => {
  res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
  res.status(405).json({
    status: 405,
    error: 'Method Not Allowed',
    message: 'This endpoint requires HTTP POST with valid JSON payload.'
  });
});

// Canonical Application Host URL Configuration (Immutable runtime origin to prevent Host Header Poisoning)
if (!process.env.HOST_URL) {
  process.env.HOST_URL = process.env.NODE_ENV === 'production' ? 'https://myfolio.tech' : 'http://localhost:5050';
}

// =========================================================================
// TOKEN BUCKET RATE LIMITING ARCHITECTURE (Multi-Tier Zero-Cost Protection)
// =========================================================================
// Tier 1: Heavy AI Portfolio Generation (5 burst capacity, 1 refill every 10s ~ 6/min)
const aiGenLimiter = SecurityMiddleware.tokenBucket({
  capacity: 5,
  refillRatePerSec: 0.1,
  actionName: 'ai_generation'
});

// Tier 2: Payment & Checkout Order Creation (6 burst capacity, 1 refill every 5s ~ 12/min)
const checkoutLimiter = SecurityMiddleware.tokenBucket({
  capacity: 6,
  refillRatePerSec: 0.2,
  actionName: 'checkout_order'
});

// Tier 3: Sensitive Authentication & OTP Operations (10 burst, 1 refill every 2s ~ 30/min)
const authLimiter = SecurityMiddleware.tokenBucket({
  capacity: 10,
  refillRatePerSec: 0.5,
  actionName: 'auth_strict'
});

// Tier 4: Global Baseline Shield (60 burst, 2 refills per sec ~ 120/min for general browsing)
const globalTrafficLimiter = SecurityMiddleware.tokenBucket({
  capacity: 60,
  refillRatePerSec: 2,
  actionName: 'global_traffic'
});

// Apply global baseline shield across dynamic application routes (exempting search engine bots and static assets)
app.use((req, res, next) => {
  // 1. Let static assets, icons, and fonts through without rate limit deduction
  if (req.path.startsWith('/assets') || req.path.startsWith('/web/') || req.path.endsWith('.ico') || req.path.endsWith('.webp') || req.path.endsWith('.png') || req.path.endsWith('.jpg') || req.path.endsWith('.css') || req.path.endsWith('.js') || req.path.endsWith('.woff2')) {
    return next();
  }
  // 2. Unblock Search Engine Crawlers & Meta Indexing files (Googlebot, Bingbot, sitemap, robots, llms, .well-known)
  const isSearchFile = [
    '/sitemap.xml', '/sitemap', '/robots.txt', '/llms.txt', '/llms-full.txt', '/ads.txt', '/manifest.json', '/openapi.json', '/api-catalog', '/agent.json', '/auth.md', '/skills.json', '/agent-card.json'
  ].includes(req.path) || req.path.startsWith('/google001961baa3b6a214') || req.path.startsWith('/.well-known/');
  if (isSearchFile) {
    return next();
  }
  const ua = (req.get('user-agent') || '').toLowerCase();
  const isSearchCrawler = /googlebot|google-inspectiontool|mediapartners-google|adsbot-google|bingbot|applebot|duckduckbot|yandexbot|baiduspider|gptbot|chatgpt-user|claudebot|claude-searchbot|perplexitybot|semrushbot|ahrefsbot|bytespider/i.test(ua);
  if (isSearchCrawler && ['GET', 'HEAD'].includes(req.method)) {
    return next();
  }
  return globalTrafficLimiter(req, res, next);
});

// Initialize core services
const aiService = new AIService(process.env.GEMINI_API_KEY);
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
const dbService = new DatabaseService(
  process.env.SUPABASE_URL,
  supabaseServiceRoleKey
);
const emailService = new EmailService(dbService);
const siteGenerator = new SiteGenerator();
const customDomainService = new CustomDomainService(dbService);
const hostingProvider = new HostingProvider(
  process.env.NETLIFY_TOKEN,
  process.env.SUPABASE_URL,
  supabaseServiceRoleKey
);
const netlifyDeployer = process.env.NETLIFY_TOKEN
  ? new NetlifyDeployer(process.env.NETLIFY_TOKEN, process.env.SUPABASE_URL, supabaseServiceRoleKey)
  : null;
const { GitHubAutoSyncService } = require('./services/github-auto-sync');
const gitHubAutoSync = new GitHubAutoSyncService();

// Email connection diagnostic endpoint
app.get('/api/email/verify-connection', async (req, res) => {
  const result = await emailService.verifyConnection();
  res.status(result.success ? 200 : 500).json({
    ...result,
    fromEmail: emailService.fromEmail,
    isConfigured: emailService.isConfigured
  });
});

// Authenticate session early across all endpoints & API routers
app.use(AuthMiddleware.authenticate(dbService, securityService));

// =========================================================================
// ULTRA-FAST STATIC ASSET ENGINE (Transparent WebP, Global CORS & 1-Year Cache)
// =========================================================================
const webpAssetCache = new Map();

app.use('/assets', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
  res.setHeader('Vary', 'Accept');

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return next();
  }

  // Transparent WebP negotiation: if browser supports WebP and .webp version exists on disk, serve WebP immediately
  const acceptHeader = req.headers['accept'] || '';
  if (acceptHeader.includes('image/webp') && /\.(jpe?g|png)$/i.test(req.path)) {
    if (webpAssetCache.has(req.path)) {
      const cachedCand = webpAssetCache.get(req.path);
      if (cachedCand) {
        res.setHeader('Content-Type', 'image/webp');
        return res.sendFile(cachedCand);
      }
      return next();
    }

    const webpRelPath = req.path.replace(/\.(jpe?g|png)$/i, '.webp');
    const candidates = [
      path.join(process.cwd(), 'web', 'assets', webpRelPath),
      path.join(process.cwd(), 'public', 'assets', webpRelPath)
    ];
    let found = null;
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        found = cand;
        break;
      }
    }
    webpAssetCache.set(req.path, found);
    if (found) {
      res.setHeader('Content-Type', 'image/webp');
      return res.sendFile(found);
    }
  }
  next();
});

// Dedicated High-Priority Favicon Middleware
// Ensures the official MyFolio 3D logo is always served unconditionally with correct MIME types
app.get([
  '/favicon.ico',
  '/assets/favicon.ico',
  '/favicon.png',
  '/favicon-32x32.png',
  '/favicon-16x16.png',
  '/favicon-48x48.png',
  '/favicon.svg',
  '/assets/favicon.png',
  '/apple-touch-icon.png',
  '/apple-touch-icon-precomposed.png'
], (req, res) => {
  const reqName = path.basename(req.path);
  const candidates = [
    path.join(process.cwd(), 'public', reqName),
    path.join(process.cwd(), 'web', reqName),
    path.join(process.cwd(), 'public', 'assets', reqName),
    path.join(process.cwd(), 'web', 'assets', reqName)
  ];

  let filePath = candidates.find(f => fs.existsSync(f));
  if (!filePath) {
    filePath = path.join(process.cwd(), 'public', 'favicon.ico');
  }

  if (reqName.endsWith('.ico')) {
    res.setHeader('Content-Type', 'image/x-icon');
  } else if (reqName.endsWith('.png')) {
    res.setHeader('Content-Type', 'image/png');
  } else if (reqName.endsWith('.svg')) {
    res.setHeader('Content-Type', 'image/svg+xml');
  }

  res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
  res.setHeader('Access-Control-Allow-Origin', '*');
  return res.sendFile(filePath);
});

// Dedicated Service Worker Route (Scoped to root '/', always revalidated)
app.get('/service-worker.js', (req, res) => {
  const swPath = fs.existsSync(path.join(process.cwd(), 'web', 'service-worker.js'))
    ? path.join(process.cwd(), 'web', 'service-worker.js')
    : path.join(process.cwd(), 'public', 'service-worker.js');
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(swPath);
});

// Dedicated Turbo Navigation Engine
app.get('/turbo-nav.js', (req, res) => {
  const tnPath = fs.existsSync(path.join(process.cwd(), 'web', 'turbo-nav.js'))
    ? path.join(process.cwd(), 'web', 'turbo-nav.js')
    : path.join(process.cwd(), 'public', 'turbo-nav.js');
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(tnPath);
});

// Dedicated Auth JS Route: Zero-cache to prevent stale client signup logic
app.get(['/auth.js', '/web/auth.js'], (req, res) => {
  const authPath = fs.existsSync(path.join(process.cwd(), 'web', 'auth.js'))
    ? path.join(process.cwd(), 'web', 'auth.js')
    : path.join(process.cwd(), 'public', 'auth.js');
  res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(authPath);
});

// Serve assets directly from web/assets and public/assets before domain rewrites
app.use('/assets', express.static(path.join(process.cwd(), 'web', 'assets'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (/\.(js|css)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));
app.use('/assets', express.static(path.join(process.cwd(), 'public', 'assets'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (/\.(js|css)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=86400, stale-while-revalidate=604800');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
}));

// Serve web assets directly for /web/* paths
app.use('/web', express.static(path.join(process.cwd(), 'web'), {
  maxAge: '30d'
}));
app.use('/web', express.static(path.join(process.cwd(), 'public', 'web'), {
  maxAge: '30d'
}));

// Serve ThreeUI landing pages directly for /landing-pages/* and /secret-pathways-assets/* paths
app.use(['/landing-pages', '/secret-pathways-assets'], express.static(path.join(process.cwd(), 'web', 'landing-pages'), {
  maxAge: '1d'
}));
app.use(['/landing-pages', '/secret-pathways-assets'], express.static(path.join(process.cwd(), 'public', 'landing-pages'), {
  maxAge: '1d'
}));
app.use('/secret-pathways-assets', express.static(path.join(process.cwd(), 'web', 'landing-pages', 'secret-pathways-assets'), {
  maxAge: '30d'
}));
app.use('/secret-pathways-assets', express.static(path.join(process.cwd(), 'public', 'landing-pages', 'secret-pathways-assets'), {
  maxAge: '30d'
}));

// Dynamic Custom Domain & Subdomain Hostname Router
app.use(async (req, res, next) => {
  const host = (req.hostname || req.get('host') || '').toLowerCase().split(':')[0];
  if (!host || host === 'localhost' || host === '127.0.0.1' || host === 'myfolio.tech' || host === 'www.myfolio.tech' || host === 'portfolio.site') {
    return next();
  }

  // CRITICAL: Never intercept static assets, APIs, previews or files with custom domain HTML
  if (
    req.path.startsWith('/assets/') ||
    req.path.startsWith('/api/') ||
    req.path.startsWith('/sites/') ||
    req.path.startsWith('/p/') ||
    req.path.startsWith('/u/') ||
    req.path.startsWith('/.well-known/') ||
    ['/robots.txt', '/sitemap.xml', '/sitemap', '/llms.txt', '/llms-full.txt', '/ads.txt', '/manifest.json', '/openapi.json', '/api-catalog', '/agent.json'].includes(req.path) ||
    /\.(png|jpe?g|webp|gif|svg|ico|css|js|glb|gltf|bin|wasm|woff2?|ttf|eot|json|mp4|webm|pdf|txt|xml)$/i.test(req.path)
  ) {
    return next();
  }

  // Explicit VIP Subdomain Route: abdulaziz.myfolio.tech, aziz.myfolio.tech, noor.myfolio.tech or local equivalents
  if (
    host === 'abdulaziz.myfolio.tech' || host === 'abdulaziz.localhost' || host.startsWith('abdulaziz.') ||
    host === 'aziz.myfolio.tech' || host === 'aziz.localhost' || host.startsWith('aziz.') ||
    host === 'noor.myfolio.tech' || host === 'noor.localhost' || host.startsWith('noor.')
  ) {
    let siteId = customDomainService?.resolveHostname(host) ||
      customDomainService?.resolveHostname('abdulaziz.myfolio.tech') ||
      customDomainService?.resolveHostname('aziz.myfolio.tech') ||
      customDomainService?.resolveHostname('noor.myfolio.tech') ||
      'abdulaziz';

    let html = await hostingProvider.getSiteHtml(siteId);
    if (!html && siteId !== 'abdulaziz') {
      html = await hostingProvider.getSiteHtml('abdulaziz');
    }
    if (!html && siteId !== 'aziz') {
      html = await hostingProvider.getSiteHtml('aziz');
    }

    // If still not found, check public/sites and /tmp/sites for newest generated portfolio for Abdul Aziz
    if (!html) {
      try {
        const sitesDirs = [
          path.join(process.cwd(), 'public', 'sites'),
          path.join(os.tmpdir(), 'sites')
        ];
        for (const sitesDir of sitesDirs) {
          if (fs.existsSync(sitesDir)) {
            const candidates = fs.readdirSync(sitesDir).filter(d => 
              fs.existsSync(path.join(sitesDir, d, 'index.html')) &&
              (d.startsWith('abdulaziz-') || d.startsWith('aziz-') || d === 'abdulaziz' || d === 'aziz')
            );
            if (candidates.length > 0) {
              candidates.sort((a, b) => {
                try {
                  return fs.statSync(path.join(sitesDir, b, 'index.html')).mtimeMs - fs.statSync(path.join(sitesDir, a, 'index.html')).mtimeMs;
                } catch(e) { return 0; }
              });
              html = await hostingProvider.getSiteHtml(candidates[0]);
              if (html) break;
            }
          }
        }
      } catch (e) {}
    }

    // VIP Founder dynamic synthesis fallback if snapshot is missing
    if (!html) {
      try {
        const { TemplateRegistry } = require('./templates/template-registry');
        const { DEFAULT_FOUNDER_PROFILE } = require('./data/default-founder-profile');
        const domainRecord = customDomainService?.domainCache?.[host] ||
                             customDomainService?.domainCache?.['abdulaziz.myfolio.tech'] ||
                             customDomainService?.domainCache?.['aziz.myfolio.tech'];
        const activeUniverse = domainRecord?.universeKey || req.query.template || 'jack-3d-creator';
        const template = TemplateRegistry.templates[activeUniverse] ||
                         TemplateRegistry.templates['jack-3d-creator'] ||
                         Object.values(TemplateRegistry.templates)[0];

        const abdulAzizProfile = { ...DEFAULT_FOUNDER_PROFILE };
        const rendered = TemplateRegistry.render(activeUniverse, abdulAzizProfile, {});
        html = injectMobileCSS(typeof rendered === 'string' ? rendered : (rendered?.html || ''));
        // Cache to public/sites/abdulaziz so subsequent requests don't need re-rendering
        try {
          const abDir = path.join(process.cwd(), 'public', 'sites', 'abdulaziz');
          fs.mkdirSync(abDir, { recursive: true });
          fs.writeFileSync(path.join(abDir, 'index.html'), html, 'utf8');
        } catch(e) {}
      } catch (synthErr) {
        console.error('[VIP Subdomain] Synthesis error:', synthErr);
      }
    }
    if (html) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; frame-ancestors *;");
      return res.send(html); // Serve 100% clean, watermark-free custom domain portfolio
    }
  }

  // Dynamic Wildcard Subdomain Router for any <username>.myfolio.tech
  if (host.endsWith('.myfolio.tech') && host !== 'www.myfolio.tech') {
    const subdomain = host.replace(/\.myfolio\.tech$/, '').trim();
    if (subdomain && subdomain !== 'api' && subdomain !== 'app' && subdomain !== 'mail') {
      // Allow core app routes and asset paths to redirect cleanly to root domain instead of being hijacked
      const appPaths = ['/studio', '/dashboard', '/profile', '/pricing', '/login', '/signup', '/faq', '/terms', '/privacy', '/refund', '/api', '/assets', '/images'];
      if (appPaths.some(p => req.path.startsWith(p))) {
        return res.redirect(302, `https://myfolio.tech${req.originalUrl}`);
      }

      if (subdomain === 'rbp' || subdomain === 'rbp-portfolio' || subdomain === 'rbp-kinetic') {
        const { TemplateRegistry } = require('./templates/template-registry');
        const rendered = TemplateRegistry.render('rbp-kinetic-monochrome', {
          name: 'Josh Miller',
          role: 'Design Engineer & AI Enthusiast',
          bio: 'Independent engineer focused on interfaces that feel calm, considered, and quietly fast.',
          email: 'josh@example.com'
        });
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(rendered.html);
      }

      // 1. Check customDomainService mapping or direct handle
      let siteId = customDomainService ? customDomainService.resolveHostname(host) : null;
      if (!siteId) {
        siteId = subdomain;
      }
      
      let html = await hostingProvider.getSiteHtml(siteId);

      // 2. Check Supabase DB for user's active site by handle/custom_domain
      if (!html && dbService?.client) {
        try {
          const { data: siteRecord } = await dbService.client
            .from('sites')
            .select('provider_site_id, custom_domain')
            .or(`custom_domain.eq.${host},provider_site_id.eq.${subdomain}`)
            .limit(1)
            .single();
          if (siteRecord?.provider_site_id) {
            html = await hostingProvider.getSiteHtml(siteRecord.provider_site_id);
          }
        } catch (dbLookupErr) {}
      }

      if (html) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; frame-ancestors *;");
        return res.send(html);
      }

      // 3. Unregistered/Unclaimed Subdomain on myfolio.tech: Serve landing page with sleek "Claim Handle" invitation banner
      try {
        const indexPath = path.join(process.cwd(), 'web', 'index.html');
        let landingHtml = fs.readFileSync(indexPath, 'utf8');
        const cleanSub = subdomain.toLowerCase().replace(/[^a-z0-9_-]/g, '');
        const banner = `
          <div id="unclaimed-subdomain-banner" style="position:relative; z-index:9999999; background:linear-gradient(90deg, #0284C7, #0D9488); color:#FFFFFF; padding:10px 16px; text-align:center; font-family:'Inter',system-ui,sans-serif; font-size:13px; font-weight:600; display:flex; align-items:center; justify-content:center; gap:12px; flex-wrap:wrap; box-shadow:0 4px 15px rgba(0,0,0,0.3);">
            <span>Looking for <strong>@${cleanSub}</strong>'s 3D portfolio? This subdomain handle is currently available!</span>
            <a href="https://myfolio.tech/studio?github=${encodeURIComponent(cleanSub)}&handle=${encodeURIComponent(cleanSub)}" style="background:#FFFFFF; color:#0F172A; padding:5px 14px; border-radius:9999px; text-decoration:none; font-size:12px; font-weight:800; white-space:nowrap; display:inline-flex; align-items:center; gap:4px; box-shadow:0 2px 6px rgba(0,0,0,0.2);">
              <span>Claim ${cleanSub}.myfolio.tech</span> &rarr;
            </a>
          </div>
        `;
        landingHtml = landingHtml.replace('<body>', `<body>\n${banner}`);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.send(landingHtml);
      } catch (unclaimedErr) {}
    }
  }

  // Dynamic Wildcard Subdomain Router for any <username>.localhost
  if (host.endsWith('.localhost') && host !== 'localhost') {
    const subdomain = host.replace(/\.localhost$/, '').split(':')[0].trim();
    if (subdomain && subdomain !== 'api' && subdomain !== 'app') {
      let siteId = customDomainService ? customDomainService.resolveHostname(host) : null;
      if (!siteId && customDomainService) {
        siteId = customDomainService.resolveHostname(`${subdomain}.myfolio.tech`);
      }
      if (!siteId) {
        siteId = subdomain;
      }
      let html = await hostingProvider.getSiteHtml(siteId);
      if (html) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; frame-ancestors *;");
        return res.send(html);
      }
    }
  }

  // Check if incoming domain or subdomain maps to a site
  if (customDomainService) {
    const siteId = customDomainService.resolveHostname(host);
    if (siteId) {
      const html = await hostingProvider.getSiteHtml(siteId);
      if (html) {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; frame-ancestors *;");
        return res.send(html); // Serve 100% clean, watermark-free custom domain portfolio
      }
    }
  }
  next();
});

const youpiService = new YoupiService({
  apiUrl: process.env.YOUPI_API_URL || 'http://localhost:6100',
  merchantId: process.env.YOUPI_MERCHANT_ID || process.env.RAZORPAY_KEY_ID || 'youpi_merchant_live',
  webhookSecret: process.env.YOUPI_WEBHOOK_SECRET || process.env.RAZORPAY_WEBHOOK_SECRET || 'youpi_webhook_secret_default'
});
const razorpayService = youpiService;

const lifecycleService = new LifecycleService(dbService, emailService, null, hostingProvider);
if (require.main === module) {
  lifecycleService.startScheduler('0 9 */3 * *'); // Strict 3-day deterministic check at 09:00 AM (at most 1 email every 3 days)

  // Render Anti-Spin-Down Keepalive: Pings /healthz every 10 minutes to prevent Render free-tier cold starts & Cloudflare 524 timeouts
  if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
    const keepAliveUrl = (process.env.HOST_URL || 'https://myfolio.tech') + '/healthz';
    setInterval(async () => {
      try {
        if (typeof fetch === 'function') {
          await fetch(keepAliveUrl, { signal: AbortSignal.timeout(10000) });
        }
      } catch (err) {
        // Silently ignore ping errors
      }
    }, 10 * 60 * 1000).unref();
  }
}

// Initialize GitHub AI Portfolio Generation Pipeline
const { GitHubGenerationPipeline } = require('./services/github-generation-pipeline');
const githubPipeline = new GitHubGenerationPipeline(aiService, siteGenerator);

// Initialize Meta Official WhatsApp Cloud API Service & Inbound Handler
const whatsAppService = new WhatsAppService({
  accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
  phoneNumberId: process.env.WHATSAPP_PHONE_NUMBER_ID,
  verifyToken: process.env.WHATSAPP_VERIFY_TOKEN || 'myfolio_wa_verify_2026',
  appSecret: process.env.WHATSAPP_APP_SECRET
});

const whatsAppHandler = new WhatsAppHandler({
  whatsAppService,
  aiService,
  dbService,
  hostingProvider
});

// Meta WhatsApp Cloud API Webhook Handshake (Verification Challenge)
app.get('/api/webhook/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  const verifiedChallenge = whatsAppService.verifyWebhookChallenge(mode, token, challenge);
  if (verifiedChallenge) {
    console.log('✅ [WHATSAPP WEBHOOK] Handshake verified successfully!');
    return res.status(200).send(verifiedChallenge);
  }

  console.warn('❌ [WHATSAPP WEBHOOK] Verification failed. Token mismatch.');
  return res.sendStatus(403);
});

// Meta WhatsApp Cloud API Real-Time Inbound Event Receiver
app.post('/api/webhook/whatsapp', async (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  if (whatsAppService && whatsAppService.appSecret) {
    const isValid = whatsAppService.verifySignature(req.rawBody, signature);
    if (!isValid) {
      console.warn('❌ [WHATSAPP WEBHOOK] Rejected: Invalid or missing signature.');
      return res.status(403).send('Forbidden: Invalid webhook signature');
    }
  }

  // Always acknowledge immediately within 3 seconds to avoid Meta webhook retries
  res.status(200).send('EVENT_RECEIVED');

  try {
    if (whatsAppHandler) {
      await whatsAppHandler.handleWebhookEvent(req.body);
    }
  } catch (err) {
    console.error('[WHATSAPP WEBHOOK PROCESS ERROR]', err);
  }
});

// ⚡ YouPI PG V2 & Legacy Webhook Handler
const processedWebhookEvents = new Set();

app.post(['/webhook/youpi', '/webhook/razorpay'], async (req, res) => {
  if (!youpiService) {
    console.warn('❌ [PAYMENT WEBHOOK] Rejected: Gateway service not configured.');
    return res.status(503).json({ error: 'Payment service unavailable' });
  }
  try {
    const signature = req.headers['x-gateway-signature'] ||
      req.headers['x-youpi-signature'] ||
      req.headers['x-razorpay-signature'];

    if (!signature || !req.rawBody) {
      console.warn('❌ [PAYMENT WEBHOOK] Rejected: Missing signature header or raw body.');
      return res.status(400).json({ error: 'Missing webhook signature' });
    }

    const isValid = youpiService.verifyWebhookSignature(req.rawBody.toString(), signature);
    if (!isValid) {
      console.warn('❌ [PAYMENT WEBHOOK] Rejected: Cryptographic signature mismatch.');
      return res.status(401).json({ error: 'Invalid webhook signature' });
    }

    const parsedEvent = youpiService.parseWebhookEvent(req.body);
    const eventId = parsedEvent.paymentId || parsedEvent.orderId || req.body.id;

    if (eventId && processedWebhookEvents.has(eventId)) {
      console.log(`[PAYMENT WEBHOOK] Duplicate webhook event ${eventId} safely ignored.`);
      return res.status(200).json({ status: 'ok', message: 'Event already processed' });
    }
    if (eventId) {
      processedWebhookEvents.add(eventId);
      if (processedWebhookEvents.size > 2000) {
        const iter = processedWebhookEvents.values();
        for (let i = 0; i < 500; i++) processedWebhookEvents.delete(iter.next().value);
      }
    }

    const userId = parsedEvent.metadata?.user_id || parsedEvent.metadata?.userId || parsedEvent.orderId;
    const isSuccess = parsedEvent.event === 'SUCCESS' ||
      parsedEvent.event === 'payment.captured' ||
      parsedEvent.event === 'payment_link.paid' ||
      parsedEvent.event === 'subscription.charged';

    if (isSuccess) {
      if (userId) {
        const plan = parsedEvent.metadata?.plan || 'lite';
        await dbService.recordPayment(parsedEvent.paymentId || eventId, userId, parsedEvent.amount || 14900, 'youpi');
        await dbService.updatePaymentStatus(parsedEvent.paymentId || eventId, 'captured');

        const conversation = await dbService.getConversation(userId);
        if (conversation) {
          await dbService.updateConversation(conversation.id, {
            status: 'paid',
            lifecycle_state: 'live',
            state_entered_at: new Date().toISOString()
          });
          const user = await dbService.getUserById(userId);
          if (user?.email) {
            const liveUrl = `${process.env.HOST_URL || 'http://localhost:5050'}/p/${conversation.id}`;
            await emailService.sendReactivationConfirmation(user.email, {
              userId,
              name: conversation.extracted_data?.name || 'there',
              siteUrl: liveUrl,
              plan: plan.toUpperCase()
            });
          }
        }
        console.log(`⚡ [YOUPI PG] Payment captured & subscription activated for user ${userId} (Bank UTR: ${parsedEvent.utr || 'N/A'})`);
      }
    } else if (parsedEvent.event === 'FAILED' || parsedEvent.event === 'EXPIRED' || parsedEvent.event === 'payment.failed') {
      if (userId) {
        const conversation = await dbService.getConversation(userId);
        if (conversation) {
          const now = new Date().toISOString();
          await dbService.updateConversation(conversation.id, {
            status: 'grace_period',
            lifecycle_state: 'preview_lapsed',
            state_entered_at: now
          });
          const user = await dbService.getUserById(userId);
          if (user?.email) {
            const retryUrl = `${process.env.HOST_URL || 'http://localhost:5050'}/payment/retry?userId=${userId}`;
            await emailService.sendPaymentFailedEmail(user.email, {
              userId,
              name: conversation.extracted_data?.name || 'there',
              retryUrl
            });
          }
        }
      }
    }
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    console.error('[PAYMENT WEBHOOK ERROR]', err.message);
    res.status(200).send('OK');
  }
});

// ==========================================
// Web REST API Endpoints (For Vercel & Web Studio)
// ==========================================

const MAX_HOURLY_QUOTA = parseInt(process.env.MAX_GENERATIONS_PER_HOUR, 10) || 60;

// 1. Web Resume PDF & Image Parsing (Protected with 50MB payload limit & per-user/IP quota)
app.post(
  '/api/web/parse-resume',
  SecurityMiddleware.limitBodySize(50 * 1024 * 1024),
  AuthMiddleware.quotaLimiter(dbService, 'resume_parse', MAX_HOURLY_QUOTA),
  async (req, res) => {
    try {
      const { base64Data, mimeType = 'application/pdf' } = req.body;
      if (!base64Data) {
        return res.status(400).json({ error: 'base64Data is required' });
      }

      const buffer = Buffer.from(base64Data, 'base64');
      const parsed = await aiService.parseResumeDocument(buffer, mimeType);
      if (!parsed || !parsed.extracted_data) {
        return res.status(422).json({ error: 'Could not extract portfolio data from document' });
      }

      res.json({
        success: true,
        data: parsed.extracted_data,
        branch: parsed.branch || 'A'
      });
    } catch (err) {
      console.error('[WEB API] parse-resume error:', err);
      res.status(500).json({ error: err.message || 'Resume parsing failed' });
    }
  }
);

// Template Catalog Endpoint: Exposes visual portfolio templates present in Web Studio
app.get('/api/web/templates', (req, res) => {
  const { TemplateRegistry } = require('./templates/template-registry');
  const studioTemplates = TemplateRegistry.getStudioTemplates();
  res.json({
    success: true,
    count: studioTemplates.length,
    templates: studioTemplates
  });
});

// Dynamic Template Count Endpoint: Fast count of templates present in Web Studio
app.get('/api/templates/count', (req, res) => {
  const { TemplateRegistry } = require('./templates/template-registry');
  res.json({
    success: true,
    count: TemplateRegistry.getStudioTemplateCount()
  });
});

// 2. Web Instant Portfolio Generation (Protected with Token Bucket, 10MB payload limit, per-user quota & AI Sanitization)
app.post(
  '/api/web/generate',
  aiGenLimiter,
  SecurityMiddleware.limitBodySize(10 * 1024 * 1024),
  AuthMiddleware.quotaLimiter(dbService, 'ai_generation', 10),
  async (req, res) => {
    try {
      const { data = {}, branch = 'A', styleHint = '', layout = 'auto-cycle', siteId: requestedSiteId, previousSiteId, regenerate = false, templateId } = req.body;
      
      // Server-Side Weekly Preview Generation Quota (3 free builds per 7-day cycle)
      const userEmail = (req.user?.email || req.user?.normalized_email || '').toLowerCase();
      const isAdmin = req.user?.role === 'admin' || req.user?.is_admin === true || userEmail === 'abdulaziznoor9876@gmail.com';
      if (!isAdmin) {
        const generationIdentifier = req.user?.id || req.ip || req.headers?.['x-forwarded-for'] || 'anonymous';
        const isWeeklyAllowed = await dbService.checkWeeklyLimit(generationIdentifier, 3);
        if (!isWeeklyAllowed) {
          return res.status(429).json({
            error: 'Weekly generation limit reached: You have used your 3 free portfolio builds for this 7-day cycle. Upgrade to Lifetime Starter or Pro for unlimited builds.',
            limit: 3,
            code: 'WEEKLY_LIMIT_EXCEEDED'
          });
        }
      }

      // Takedown & Purge: If regenerating or replacing a previous preview, take down the old site immediately
      const oldSiteToPurge = previousSiteId || (regenerate && requestedSiteId ? requestedSiteId : null);
      if (oldSiteToPurge) {
        await hostingProvider.purge(oldSiteToPurge).catch(() => {});
      }

      let siteId = requestedSiteId;
      if (regenerate || !siteId) {
        siteId = `web-${crypto.randomUUID()}`;
      } else if (!siteId && req.user?.id) {
        const userDash = await dbService.getUserDashboardData(req.user.id);
        if (userDash?.siteId) {
          siteId = userDash.siteId;
        }
      }
      if (!siteId) {
        siteId = `web-${crypto.randomUUID()}`;
      }

      const chosenTemplate = templateId || data.templateId || data.template || (styleHint && TemplateRegistry.templates[styleHint] ? styleHint : 'jack-3d-creator');
      const enrichedData = { ...data, style_hint: styleHint, layout, templateId: chosenTemplate };

      // Automated Content Safety & TOS Policy Sentinel
      const tosScan = securityService.evaluateContentSafetyAndTOS(enrichedData);
      if (!tosScan.isCompliant) {
        for (const viol of tosScan.violations) {
          await dbService.recordTosViolation({
            userId: req.user?.id || siteId,
            siteId,
            ruleId: viol.ruleId,
            section: viol.section,
            termTitle: viol.termTitle,
            severity: viol.severity,
            reason: viol.reason,
            evidenceSnippet: viol.evidenceSnippet,
            contentPreview: JSON.stringify(enrichedData).substring(0, 150)
          });
        }
        if (tosScan.violations.some(v => v.severity === 'CRITICAL')) {
          const critical = tosScan.violations.find(v => v.severity === 'CRITICAL');
          return res.status(400).json({
            error: `Terms of Service Violation: ${critical.section}`,
            message: `Your content was flagged under ${critical.termTitle}. Reason: ${critical.reason}`,
            evidence: critical.evidenceSnippet,
            section: critical.section
          });
        }
      }

      const designBrief = { creative_mode: styleHint || 'auto-cycle', layout: layout || 'auto-cycle', templateId: chosenTemplate };
      const rawSite = await siteGenerator.generateSite(
        { extracted_data: enrichedData, branch, id: siteId },
        enrichedData,
        designBrief
      );

      // AI Output Sanitization Boundary: Neutralize unsafe scripts / injections
      const site = securityService.sanitizeAiOutput(rawSite);

      // Deploy / Overwrite existing site directory with identical permanent URL
      const deployRes = await hostingProvider.deploy(siteId, site, enrichedData);
      const localUrl = `/p/${siteId}`;
      const liveUrl = deployRes.deployUrl;

      // If user is authenticated, associate site in DB and persist latest data
      if (req.user?.id) {
        await dbService.createSite(req.user.id, 'self_hosted', siteId).catch(() => { });
        const conversation = await dbService.getConversation(req.user.id);
        if (conversation?.id) {
          await dbService.updateConversation(conversation.id, {
            extracted_data: enrichedData,
            branch
          }).catch(() => {});
        }
      }

      res.json({
        success: true,
        siteId,
        previewUrl: localUrl,
        html: site.html,
        css: site.css,
        js: site.js,
        designBrief
      });
    } catch (err) {
      console.error('[WEB API] generate error:', err);
      res.status(500).json({ error: err.message || 'Generation failed' });
    }
  }
);

// 3. GitHub One-Click AI Portfolio Generation Endpoint
app.post(
  '/api/generate/github',
  SecurityMiddleware.limitBodySize(5 * 1024 * 1024),
  AuthMiddleware.quotaLimiter(dbService, 'ai_generation', MAX_HOURLY_QUOTA),
  async (req, res) => {
    try {
      const { githubUrl, username, mode, creative_mode, theme, layout, projectPresentation, previousSiteId } = req.body;
      const target = githubUrl || username;
      if (!target) {
        return res.status(400).json({ error: 'GitHub profile URL or username is required.' });
      }

      // Takedown & Purge: If regenerating from GitHub, take down the previous preview
      if (previousSiteId) {
        await hostingProvider.purge(previousSiteId).catch(() => {});
      }

      const selectedMode = mode || creative_mode || theme || 'auto-cycle';
      const result = await githubPipeline.generateFromGitHub(target, {
        mode: selectedMode !== 'auto' ? selectedMode : 'auto-cycle',
        layout,
        projectPresentation,
        previousSiteId
      });

      // If user is authenticated, associate site in DB
      if (req.user?.id && result.siteId) {
        await dbService.createSite(req.user.id, 'self_hosted', result.siteId).catch(() => {});
      }

      res.json(result);
    } catch (err) {
      console.error('[API] /api/generate/github error:', err.message);
      res.status(400).json({ error: err.message || 'GitHub portfolio generation failed.' });
    }
  }
);

// 4. GitHub Parse for Interactive Web Builder
app.post(
  '/api/web/parse-github',
  SecurityMiddleware.limitBodySize(5 * 1024 * 1024),
  AuthMiddleware.quotaLimiter(dbService, 'resume_parse', MAX_HOURLY_QUOTA),
  async (req, res) => {
    try {
      const { githubUrl, username } = req.body;
      const target = githubUrl || username;
      if (!target) {
        return res.status(400).json({ error: 'GitHub profile URL or username is required.' });
      }

      const result = await githubPipeline.parseForWebBuilder(target);
      res.json(result);
    } catch (err) {
      console.error('[API] /api/web/parse-github error:', err.message);
      res.status(400).json({ error: err.message || 'GitHub profile parsing failed.' });
    }
  }
);

// 4b. Real-time GitHub Profile Resolution & Pre-check for Web Studio
app.get('/api/web/resolve-github', async (req, res) => {
  try {
    const q = req.query.q || req.query.username || '';
    const name = req.query.name || '';
    if (!q && !name) {
      return res.status(400).json({ error: 'Username query or name is required.' });
    }
    const { GitHubClient } = require('./services/github/github-client');
    const ghClient = new GitHubClient();
    console.log('[RESOLVE-GH] Received query:', q, 'name:', name);
    const resolvedUsername = await ghClient.resolveActualUsername(q, name);
    console.log('[RESOLVE-GH] Resolved to:', resolvedUsername);
    if (!resolvedUsername) {
      return res.json({ found: false, query: q });
    }
    const raw = await ghClient.fetchCompleteProfile(resolvedUsername);
    const { GitHubNormalizer } = require('./services/github/github-normalizer');
    const { GitHubProfileSynthesizer } = require('./services/github-profile-synthesizer');
    const norm = GitHubNormalizer.normalize(raw);
    const synth = new GitHubProfileSynthesizer(null);
    const role = synth.inferRoleFromLanguages(norm.skills.languages, norm.skills.web3, norm.projects);

    const p = raw.profile || {};
    res.json({
      success: true,
      found: true,
      query: q,
      username: p.login || resolvedUsername,
      resolvedUsername: p.login || resolvedUsername,
      name: p.name || p.login,
      avatar_url: p.avatar_url,
      bio: p.bio || '',
      tagline: p.bio || `Engineering high-impact digital experiences in ${norm.skills.languages.slice(0, 3).join(', ')}.`,
      inferredRole: role,
      public_repos: p.public_repos || (raw.repositories ? raw.repositories.length : 0),
      publicRepositories: p.public_repos || (raw.repositories ? raw.repositories.length : 0),
      top_languages: norm.skills.languages,
      skills: norm.skills,
      profile: {
        login: p.login || resolvedUsername,
        name: p.name || p.login,
        bio: p.bio || '',
        public_repos: p.public_repos || (raw.repositories ? raw.repositories.length : 0)
      },
      repositories: (raw.repositories || []).slice(0, 6).map(r => ({
        name: r.name,
        desc: r.description,
        tech: r.language || 'Code',
        stars: r.stargazers_count,
        live: r.homepage || r.html_url
      })),
      topRepositories: norm.projects.slice(0, 6)
    });
  } catch (err) {
    res.json({ found: false, success: false, error: err.message });
  }
});

// 5. GitHub Generation Job Status Endpoint
app.get('/api/generate/github/status/:jobId', (req, res) => {
  const job = githubPipeline.getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Generation job not found.' });
  }
  res.json(job);
});

// Helper to get or initialize PortfolioState for a siteId
async function getOrInitPortfolioState(siteId) {
  if (!siteId) return null;
  if (portfolioCustomizerMap.has(siteId)) {
    return portfolioCustomizerMap.get(siteId);
  }

  const os = require('os');
  const candidateDirs = [
    path.join(process.cwd(), 'public', 'sites', siteId),
    path.join(os.tmpdir(), 'sites', siteId)
  ];
  if (siteId === 'abdulaziz' || siteId === 'aziz') {
    candidateDirs.push(
      path.join(process.cwd(), 'public', 'sites', 'abdulaziz'),
      path.join(os.tmpdir(), 'sites', 'abdulaziz')
    );
  }

  let html = null;
  let css = '';
  let js = '';

  for (const siteDir of candidateDirs) {
    const htmlPath = path.join(siteDir, 'index.html');
    if (fs.existsSync(htmlPath)) {
      try {
        html = fs.readFileSync(htmlPath, 'utf8');
        const cssPath = path.join(siteDir, 'style.css');
        const jsPath = path.join(siteDir, 'script.js');
        if (fs.existsSync(cssPath)) css = fs.readFileSync(cssPath, 'utf8');
        if (fs.existsSync(jsPath)) js = fs.readFileSync(jsPath, 'utf8');
        break;
      } catch (e) {}
    }
  }

  // Fallback 1: hostingProvider (handles Supabase storage, tmp fallback, etc.)
  if (!html && hostingProvider) {
    try {
      html = await hostingProvider.getSiteHtml(siteId);
      if (!html && (siteId === 'abdulaziz' || siteId === 'aziz')) {
        html = (await hostingProvider.getSiteHtml('abdulaziz')) || (await hostingProvider.getSiteHtml('aziz'));
      }
    } catch (e) {}
  }

  // Fallback 2: customDomainService hostname lookup (if siteId is a subdomain or custom domain)
  if (!html && customDomainService) {
    const resolvedId = customDomainService.resolveHostname(siteId) ||
                       (siteId.includes('myfolio.tech') ? customDomainService.resolveHostname(siteId.split('.')[0]) : null);
    if (resolvedId && resolvedId !== siteId) {
      return await getOrInitPortfolioState(resolvedId);
    }
  }

  // Fallback 3: Dedicated pre-rendered files on disk (for founder/showcase)
  if (!html && (siteId === 'abdulaziz' || siteId === 'aziz')) {
    const staticFiles = [
      path.join(process.cwd(), 'web', 'abdul-aziz-portfolio.html'),
      path.join(process.cwd(), 'public', 'abdul-aziz-portfolio.html'),
      path.join(process.cwd(), 'web', 'apogee-preview.html'),
      path.join(process.cwd(), 'public', 'apogee-preview.html')
    ];
    for (const sf of staticFiles) {
      if (fs.existsSync(sf)) {
        try {
          html = fs.readFileSync(sf, 'utf8');
          break;
        } catch (e) {}
      }
    }
  }

  // Fallback 4: globalDraftsCache
  if (!html && globalDraftsCache?.has(siteId)) {
    html = globalDraftsCache.get(siteId)?.html;
  }

  // Fallback 5: Dynamic render from TemplateRegistry if this is a registered template or demo
  if (!html) {
    try {
      const { TemplateRegistry } = require('./templates/template-registry');
      if (TemplateRegistry.templates[siteId]) {
        const { DEFAULT_FOUNDER_PROFILE } = require('./data/default-founder-profile');
        const rendered = TemplateRegistry.render(siteId, DEFAULT_FOUNDER_PROFILE);
        html = typeof rendered === 'string' ? rendered : (rendered?.html || '');
      }
    } catch (e) {}
  }

  if (!html) {
    return null;
  }

  const state = new PortfolioState({ html, css, js, id: siteId });
  portfolioCustomizerMap.set(siteId, state);
  return state;
}

// Centralized Site Ownership Verification Guard (IDOR / BOLA Defense)
async function verifySiteOwnership(req, siteId) {
  if (!req.user) {
    return { allowed: false, status: 401, error: 'Unauthorized: Authentication required' };
  }

  const adminEmails = (process.env.ADMIN_EMAILS || 'abdulaziznoor9876@gmail.com,abdul19388383@gmail.com,abdulaziznooruddin670@gmail.com')
    .split(',')
    .map(e => e.trim().toLowerCase());
  const adminUsernames = (process.env.ADMIN_USERNAMES || 'abdulazizpro1,abdulazizpro,abdul19388383')
    .split(',')
    .map(u => u.trim().toLowerCase());
  const userEmail = (req.user.email || req.user.normalized_email || '').toLowerCase();
  const username = (req.user.username || '').toLowerCase();
  const isAdmin =
    req.user.role === 'admin' ||
    req.user.is_admin === true ||
    (userEmail && adminEmails.includes(userEmail)) ||
    (username && adminUsernames.includes(username));
  if (isAdmin) {
    return { allowed: true, isAdmin: true };
  }

  const userId = req.user.id;

  // 1. Check meta.json on disk if present
  const metaPath = path.join(process.cwd(), 'public', 'sites', siteId, 'meta.json');
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      if (meta.userId) {
        if (meta.userId === userId) return { allowed: true };
        return { allowed: false, status: 403, error: 'Forbidden: You do not own this portfolio' };
      }
    } catch (e) {}
  }

  // 2. Check customDomainService cache
  if (customDomainService?.domainCache) {
    for (const [domain, entry] of Object.entries(customDomainService.domainCache)) {
      if (entry?.siteId === siteId) {
        if (entry.userId === userId) return { allowed: true };
        return { allowed: false, status: 403, error: 'Forbidden: You do not own this portfolio' };
      }
    }
  }

  // 3. Check DB sites & client_sites tables
  if (dbService?.client) {
    try {
      const { data: siteRecord } = await dbService.client
        .from('sites')
        .select('user_id')
        .or(`provider_site_id.eq.${siteId},id.eq.${siteId}`)
        .maybeSingle();

      if (siteRecord) {
        if (siteRecord.user_id === userId) return { allowed: true };
        return { allowed: false, status: 403, error: 'Forbidden: You do not own this portfolio' };
      }

      const { data: clientSiteRecord } = await dbService.client
        .from('client_sites')
        .select('user_id')
        .or(`provider_site_id.eq.${siteId},id.eq.${siteId}`)
        .maybeSingle();

      if (clientSiteRecord) {
        if (clientSiteRecord.user_id === userId) return { allowed: true };
        return { allowed: false, status: 403, error: 'Forbidden: You do not own this portfolio' };
      }
    } catch (e) {}
  }

  // 4. In-memory state check
  const state = portfolioCustomizerMap.get(siteId);
  if (state && state.userId) {
    if (state.userId === userId) return { allowed: true };
    return { allowed: false, status: 403, error: 'Forbidden: You do not own this portfolio' };
  }

  return { allowed: true };
}

// Centralized Site Paid Status Checker (TTL cached + meta.json + DB verification)
const sitePaidStatusCache = new Map();

async function checkSitePaidStatus(siteId) {
  if (!siteId) return false;
  if (siteId === 'abdulaziz' || siteId.startsWith('abdulaziz-') || siteId.startsWith('abdulaziz_')) return true;

  const now = Date.now();
  const cached = sitePaidStatusCache.get(siteId);
  if (cached && (now - cached.cachedAt < 60000)) {
    return cached.isPaid;
  }

  let isPaid = false;

  // 1. Check meta.json on disk
  const metaPath = path.join(process.cwd(), 'public', 'sites', siteId, 'meta.json');
  if (fs.existsSync(metaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
      if (meta.isPaid === true || meta.is_paid === true || meta.status === 'paid' || meta.plan === 'lifetime' || meta.plan === 'pro') {
        isPaid = true;
      }
    } catch (e) {}
  }

  // 2. Check DB sites table
  if (!isPaid && dbService?.client) {
    try {
      const siteQueryPromise = dbService.client
        .from('sites')
        .select('status, plan, is_paid')
        .or(`provider_site_id.eq.${siteId},id.eq.${siteId}`)
        .maybeSingle();
      const timeoutPromise = new Promise(resolve => setTimeout(() => resolve({ data: null }), 300));
      const result = await Promise.race([siteQueryPromise, timeoutPromise]);
      const siteRecord = result?.data;
      if (siteRecord && (siteRecord.status === 'paid' || siteRecord.plan === 'lifetime' || siteRecord.plan === 'pro_domain' || siteRecord.is_paid === true)) {
        isPaid = true;
      }
    } catch (e) {}
  }

  // 3. Check DB conversations table
  if (!isPaid && dbService?.client) {
    try {
      const { data: conv } = await dbService.client
        .from('conversations')
        .select('status')
        .eq('id', siteId)
        .maybeSingle();
      if (conv && conv.status === 'paid') {
        isPaid = true;
      }
    } catch (e) {}
  }

  sitePaidStatusCache.set(siteId, { isPaid, cachedAt: now });
  return isPaid;
}

// 6. Portfolio Customizer State Endpoint (GET)
app.get('/api/portfolio/:siteId/customizer', AuthMiddleware.requireAuth, async (req, res) => {
  try {
    const { siteId } = req.params;
    const ownership = await verifySiteOwnership(req, siteId);
    if (!ownership.allowed) {
      return res.status(ownership.status).json({ error: ownership.error });
    }
    const state = await getOrInitPortfolioState(siteId);
    if (!state) {
      return res.status(404).json({ error: 'Portfolio not found or expired.' });
    }

    res.json({
      success: true,
      siteId,
      sections: state.getSectionsSummary(),
      hiddenSections: Array.from(state.hiddenSections),
      canUndo: state.canUndo(),
      canRedo: state.canRedo(),
      tokens: {
        sectionSpacing: state.designTokens.sectionSpacing || 'medium',
        borderIntensity: state.designTokens.borderOpacity || 'subtle',
        typeScale: state.designTokens.typeScale || 'balanced',
        theme: state.themeMode || 'auto'
      }
    });
  } catch (err) {
    console.error('[API] /api/portfolio/:siteId/customizer GET error:', err);
    res.status(500).json({ error: 'Could not load customizer state.' });
  }
});

// 7. Portfolio Customizer Action Endpoint (POST)
app.post('/api/portfolio/:siteId/customizer', AuthMiddleware.requireAuth, async (req, res) => {
  try {
    const { siteId } = req.params;
    const ownership = await verifySiteOwnership(req, siteId);
    if (!ownership.allowed) {
      return res.status(ownership.status).json({ error: ownership.error });
    }
    const { action, newOrder, sectionId, visible, token, value } = req.body;

    const state = await getOrInitPortfolioState(siteId);
    if (!state) {
      return res.status(404).json({ error: 'Portfolio not found.' });
    }

    let validationResult = { valid: true };

    if (action === 'reorder') {
      validationResult = customizationQualityGate.validateReorder(state, newOrder);
      if (!validationResult.valid) {
        return res.status(400).json({ error: validationResult.reason, code: 'INVALID_REORDER' });
      }
      state.reorderSections(newOrder);
    } else if (action === 'toggle_visibility') {
      validationResult = customizationQualityGate.validateVisibility(state, sectionId, visible);
      if (!validationResult.valid) {
        return res.status(400).json({ error: validationResult.reason, code: 'PROTECTED_SECTION' });
      }
      state.toggleSectionVisibility(sectionId, visible);
    } else if (action === 'modify_token') {
      validationResult = customizationQualityGate.validateToken(state, token, value);
      if (!validationResult.valid) {
        return res.status(400).json({ error: validationResult.reason, code: 'INVALID_TOKEN' });
      }
      state.setToken(token, value);
    } else if (action === 'undo') {
      if (!state.undo()) {
        return res.status(400).json({ error: 'No further undo steps available.' });
      }
    } else if (action === 'redo') {
      if (!state.redo()) {
        return res.status(400).json({ error: 'No further redo steps available.' });
      }
    } else if (action === 'reset') {
      state.reset();
    } else {
      return res.status(400).json({ error: 'Invalid customization action.' });
    }

    // Render updated HTML/CSS/JS and update hosting provider
    const rendered = state.render();
    await hostingProvider.deploy(siteId, rendered);

    res.json({
      success: true,
      siteId,
      previewUrl: `/p/${siteId}?v=${Date.now()}`,
      sections: state.getSectionsSummary(),
      hiddenSections: Array.from(state.hiddenSections),
      canUndo: state.canUndo(),
      canRedo: state.canRedo(),
      tokens: {
        sectionSpacing: state.designTokens.sectionSpacing || 'medium',
        borderIntensity: state.designTokens.borderOpacity || 'subtle',
        typeScale: state.designTokens.typeScale || 'balanced',
        theme: state.themeMode || 'auto'
      }
    });
  } catch (err) {
    console.error('[API] /api/portfolio/:siteId/customizer POST error:', err);
    res.status(500).json({ error: err.message || 'Customization failed.' });
  }
});

// 8. Static ZIP Export Endpoint (POST)
app.post('/api/portfolio/:siteId/export', AuthMiddleware.requireAuth, async (req, res) => {
  try {
    const { siteId } = req.params;
    const ownership = await verifySiteOwnership(req, siteId);
    if (!ownership.allowed) {
      return res.status(ownership.status).json({ error: ownership.error });
    }

    // Enforce is_paid: static ZIP export requires a paid plan (or admin bypass)
    const isPaid = await checkSitePaidStatus(siteId);
    if (!isPaid && !ownership.isAdmin) {
      return res.status(402).json({
        error: 'Payment required: Exporting static source code ZIP requires a paid plan (Lifetime Starter or Pro).',
        is_paid: false,
        code: 'PAYMENT_REQUIRED'
      });
    }

    const state = await getOrInitPortfolioState(siteId);
    if (!state) {
      return res.status(404).json({ error: 'Portfolio not found or expired.' });
    }

    const zipBuffer = await StaticExporter.exportToZipBuffer(state, {
      siteId,
      exportedAt: new Date().toISOString()
    });

    if (req.query.format === 'json') {
      return res.json({
        success: true,
        siteId,
        sizeBytes: zipBuffer.length,
        deploymentGuides: {
          vercel: ['Download ZIP', 'Run vercel deploy or drag onto Vercel dashboard', 'Your site is live globally on Edge CDN'],
          netlify: ['Download ZIP', 'Drag project folder into Netlify Drop (app.netlify.com/drop)', 'Instant HTTPS static deployment'],
          githubPages: ['Download ZIP', 'Push files to a new GitHub repo', 'Go to Settings -> Pages -> Deploy from Main branch']
        }
      });
    }

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${siteId}-portfolio.zip"`);
    res.setHeader('X-Export-Guarantees', 'zero-localhost,zero-watermark,sanitized');
    res.send(zipBuffer);
  } catch (err) {
    console.error('[API] /api/portfolio/:siteId/export error:', err);
    res.status(500).json({ error: 'Could not package portfolio ZIP.' });
  }
});

// 9. Demo & Sample Portfolios Endpoint: Synced with templates present in Web Studio
app.get('/api/demo/samples', (req, res) => {
  const { TemplateRegistry } = require('./templates/template-registry');
  const templates = TemplateRegistry.getStudioTemplates();
  const samples = templates.map(t => {
    let previewUrl = `/p/${t.id}`;
    if (t.id === 'jack-3d-creator') previewUrl = '/jack-3d';
    else if (t.id === 'nadia-brand') previewUrl = '/nadia';
    else if (t.id === 'kage-temple') previewUrl = '/kage';
    else if (t.id === 'rbp-kinetic-monochrome') previewUrl = '/rbp';
    else if (t.id === 'tom-cel-animator' || t.id === 'tom') previewUrl = '/tom';
    return {
      id: t.id,
      name: t.name,
      role: t.category,
      badge: t.category,
      description: t.description,
      techStack: t.recommendedFor,
      previewUrl
    };
  });
  res.json({ success: true, count: samples.length, samples });
});

// 10. Admin Observability & Health Telemetry Endpoints (Protected)
app.get('/api/admin/observability', AuthMiddleware.requireAdmin, (req, res) => {
  try {
    const report = BetaDashboard.generateReport({ isRealUserData: true });
    res.json({
      success: true,
      report
    });
  } catch (err) {
    console.error('[API] /api/admin/observability error:', err);
    res.status(500).json({ error: 'Failed to generate observability report.' });
  }
});

app.get('/api/admin/health', AuthMiddleware.requireAdmin, (req, res) => {
  res.json({
    status: 'healthy',
    uptimeSeconds: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    features: {
      githubSynthesis: true,
      customizer: true,
      staticExport: true,
      supabasePersistence: !!dbService,
      originIsolation: true
    }
  });
});

// Strict rate limiter for expensive AI resume parsing
const resumeUploadLimiter = SecurityMiddleware.rateLimiter({
  max: 20,
  windowMs: 15 * 60 * 1000,
  actionName: 'resume_upload'
});

// 11. Multi-Input Upload & Adaptive Questionnaire Endpoints (Phase 31)
app.post('/api/upload/resume', resumeUploadLimiter, async (req, res) => {
  try {
    const { base64Data, filename } = req.body || {};
    if (!base64Data) {
      return res.status(400).json({ error: 'No resume data provided.' });
    }

    const cleanBase64 = base64Data.replace(/^data:[a-zA-Z0-9/.-]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const validation = UploadValidator.validateResumeFile(buffer, { originalName: filename });

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    // Extract clean digital text from PDF or text buffer
    let resumeText = '';
    if (validation.mimeType === 'application/pdf' || (filename && filename.toLowerCase().endsWith('.pdf'))) {
      try {
        const pdfParse = require('pdf-parse');
        const pdfData = await pdfParse(buffer);
        resumeText = (pdfData && pdfData.text) ? pdfData.text.trim() : '';
      } catch (pdfErr) {
        console.warn('[API] PDF parse error in upload route:', pdfErr.message);
      }
    }
    if (!resumeText) {
      resumeText = buffer.toString('utf8').replace(/[^\x20-\x7E\n]/g, ' ').slice(0, 4000);
    }

    let deepParsed = {};
    if (aiService) {
      try {
        const rawParsed = await aiService.parseResumeDocument(buffer, validation.mimeType || 'application/pdf');
        if (rawParsed && rawParsed.extracted_data) {
          deepParsed = rawParsed.extracted_data;
        } else if (rawParsed) {
          deepParsed = rawParsed;
        }
      } catch (parseErr) {
        console.warn('[API] Deep resume parser fallback:', parseErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Resume validated and analyzed successfully',
      fileType: validation.fileType,
      mimeType: validation.mimeType,
      pages: validation.pages || 1,
      resumeData: {
        ...deepParsed,
        rawBase64: cleanBase64,
        mimeType: validation.mimeType
      }
    });
  } catch (err) {
    console.error('[API] /api/upload/resume error:', err);
    res.status(500).json({ error: 'Failed to process resume upload.' });
  }
});

app.post('/api/upload/photo', (req, res) => {
  try {
    const { base64Data, filename } = req.body || {};
    if (!base64Data) {
      return res.status(400).json({ error: 'No image data provided.' });
    }

    const cleanBase64 = base64Data.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
    const buffer = Buffer.from(cleanBase64, 'base64');
    const validation = UploadValidator.validateImage(buffer, { originalName: filename });

    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const dataUrl = `data:image/${validation.format};base64,${cleanBase64}`;
    res.json({
      success: true,
      format: validation.format,
      dataUrl
    });
  } catch (err) {
    console.error('[API] /api/upload/photo error:', err);
    res.status(500).json({ error: 'Failed to process photo upload.' });
  }
});

app.post('/api/upload/images', (req, res) => {
  try {
    const { images = [] } = req.body || {};
    if (!Array.isArray(images) || images.length === 0) {
      return res.status(400).json({ error: 'No images provided.' });
    }
    if (images.length > 3) {
      return res.status(400).json({ error: 'Maximum 3 images allowed.' });
    }

    const validatedImages = [];
    for (let i = 0; i < images.length; i++) {
      const item = images[i];
      const rawBase64 = typeof item === 'string' ? item : item.base64Data || item.url || '';
      const cleanBase64 = rawBase64.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
      const buffer = Buffer.from(cleanBase64, 'base64');
      const validation = UploadValidator.validateImage(buffer, { originalName: item.filename || `image-${i + 1}` });

      if (!validation.valid) {
        return res.status(400).json({ error: `Image #${i + 1} is invalid: ${validation.error}` });
      }

      validatedImages.push({
        url: `data:image/${validation.format};base64,${cleanBase64}`,
        format: validation.format,
        caption: item.caption || `Artifact Specimen #${i + 1}`
      });
    }

    res.json({
      success: true,
      count: validatedImages.length,
      images: validatedImages
    });
  } catch (err) {
    console.error('[API] /api/upload/images error:', err);
    const recovery = ErrorRecoveryService.mapError(err, 'image');
    res.status(500).json({ error: recovery.whatHappened, recovery });
  }
});

app.post('/api/questionnaire/adaptive', (req, res) => {
  try {
    const currentProfile = req.body?.currentProfile || {};
    const questions = AdaptiveQuestionnaire.getAdaptiveQuestions(currentProfile);
    res.json({
      success: true,
      questions
    });
  } catch (err) {
    console.error('[API] /api/questionnaire/adaptive error:', err);
    res.status(500).json({ error: 'Failed to generate adaptive questions.' });
  }
});

app.post(
  '/api/generate/unified',
  SecurityMiddleware.limitBodySize(10 * 1024 * 1024),
  AuthMiddleware.quotaLimiter(dbService, 'ai_generation', 20),
  async (req, res) => {
    const slot = await globalConcurrencyManager.acquire({ canFastTrack: true });
    const isOverloadFastTrack = slot.isFastTrack;
    try {
      const input = req.body || {};

      // Server-Side Weekly Preview Generation Quota (3 free builds per 7-day cycle)
      const userEmail = (req.user?.email || req.user?.normalized_email || '').toLowerCase();
      const isAdmin = req.user?.role === 'admin' || req.user?.is_admin === true || userEmail === 'abdulaziznoor9876@gmail.com';
      if (!isAdmin) {
        const generationIdentifier = req.user?.id || req.ip || req.headers?.['x-forwarded-for'] || 'anonymous';
        const isWeeklyAllowed = await dbService.checkWeeklyLimit(generationIdentifier, 3);
        if (!isWeeklyAllowed) {
          return res.status(429).json({
            error: 'Weekly generation limit reached: You have used your 3 free portfolio builds for this 7-day cycle. Upgrade to Lifetime Starter or Pro for unlimited builds.',
            limit: 3,
            code: 'WEEKLY_LIMIT_EXCEEDED'
          });
        }
      }

      // 1. If GitHub username is provided, fetch complete GitHub profile & synthesize real case studies
      if (input.githubData?.username) {
        try {
          const { GitHubParser } = require('./services/github/github-parser');
          const { GitHubClient } = require('./services/github/github-client');
          const { GitHubNormalizer } = require('./services/github/github-normalizer');
          const { GitHubProfileSynthesizer } = require('./services/github-profile-synthesizer');

          const parsed = GitHubParser.parse(input.githubData.username);
          if (parsed.valid) {
            const ghClient = new GitHubClient();
            const fullNameHint = input.name || input.fullName || input.manualFullName || input.resumeData?.fullName || input.resumeData?.name || '';
            const rawGithub = await ghClient.fetchCompleteProfile(parsed.username, null, fullNameHint);
            if (rawGithub?.profile?.login) {
              input.githubData.username = rawGithub.profile.login;
              if (rawGithub.profile.name && (!input.name || input.name === 'Creative Developer')) {
                input.name = rawGithub.profile.name;
              }
            }
            const normGithub = GitHubNormalizer.normalize(rawGithub);
            const synth = new GitHubProfileSynthesizer(isOverloadFastTrack ? null : aiService);
            const synthesizedGithub = await synth.synthesize(normGithub);

            input.githubData = { ...input.githubData, ...synthesizedGithub };
          }
        } catch (ghErr) {
          console.warn('[API] GitHub deep fetch fallback:', ghErr.message);
        }
      }

      // 2. If resume was provided with rawBase64 or extractedTextSnippet, run deep parser if not yet done
      if (!isOverloadFastTrack && input.resumeData?.rawBase64 && (!input.resumeData.skills || input.resumeData.skills.length === 0 || !input.resumeData.projects || input.resumeData.projects.length === 0) && aiService) {
        try {
          const buffer = Buffer.from(input.resumeData.rawBase64, 'base64');
          const rawParsed = await Promise.race([
            aiService.parseResumeDocument(buffer, input.resumeData.mimeType || 'application/pdf'),
            new Promise((_, r) => setTimeout(() => r(null), 8000))
          ]);
          if (rawParsed && rawParsed.extracted_data) {
            input.resumeData = { ...input.resumeData, ...rawParsed.extracted_data };
          } else if (rawParsed) {
            input.resumeData = { ...input.resumeData, ...rawParsed };
          }
        } catch (resErr) {
          console.warn('[API] Deep resume parse fallback:', resErr.message);
        }
      }

      // 3. Early resolution of userHandle & siteId for unified asset storage
      const authenticatedEmail = (req.user?.email || '').toLowerCase().trim();
      const candidateEmail = (
        authenticatedEmail ||
        input.email ||
        input.manualEmail ||
        input.userEmail ||
        input.resumeData?.email ||
        ''
      ).toLowerCase().trim();

      const targetGithubUser = input.githubData?.username ? input.githubData.username.toLowerCase().trim() : '';
      const isGeneratingForSelf = !targetGithubUser || targetGithubUser === 'abdul-aziz-nooruddin' || targetGithubUser === 'abdulaziz';

      // STRICT: Only genuine authenticated founder session generating for self has VIP Founder privileges
      const isVipFounder = Boolean(
        req.user && (
          req.user.role === 'admin' ||
          req.user.is_admin === true ||
          authenticatedEmail === 'abdulaziznoor9876@gmail.com'
        )
      ) && isGeneratingForSelf;

      const shouldPublishLive = Boolean(req.body && req.body.publish === true);

      // Determine the user's custom URL identifier (username)
      let userHandle = (
        (isVipFounder ? 'abdulaziz' : '') ||
        (targetGithubUser && targetGithubUser !== 'abdul-aziz-nooruddin' ? targetGithubUser : '') ||
        req.user?.username ||
        input.username ||
        input.customUrlIdentifier ||
        ''
      ).toLowerCase().trim().replace(/[^a-z0-9-_]/g, '').replace(/^[-_]+|[-_]+$/g, '');

      if (!userHandle) {
        userHandle = `web-${crypto.randomUUID().slice(0, 8)}`;
      }

      const versionSiteId = isVipFounder ? `abdulaziz-${Date.now()}` : `${userHandle}-${Date.now()}`;
      const siteId = versionSiteId;
      const siteDir = resolveSafeSiteDir(siteId);

      // 4. Ingest & Persist Candidate Photo / Avatar (if provided or present in resume)
      const rawPhotoBase64 = input.photoData?.rawBase64 || 
        (input.photoData?.dataUrl && input.photoData.dataUrl.includes('base64,') ? input.photoData.dataUrl.split('base64,')[1] : null);

      if (rawPhotoBase64) {
        try {
          const cleanBase64 = rawPhotoBase64.replace(/\s/g, '');
          const avatarBuf = Buffer.from(cleanBase64, 'base64');
          const mime = input.photoData.mimeType || (input.photoData.dataUrl?.includes('jpeg') ? 'image/jpeg' : 'image/png');
          const avatarFileExt = (mime && mime.includes('jpeg')) ? 'jpg' : 'png';
          const avatarFilename = `avatar.${avatarFileExt}`;
          try {
            await fs.promises.writeFile(path.join(siteDir, avatarFilename), avatarBuf);
            if (avatarFileExt !== 'png') {
              await fs.promises.writeFile(path.join(siteDir, 'avatar.png'), avatarBuf);
            }
          } catch (wErr) {}
          const avatarWebPath = isVipFounder ? `/sites/abdulaziz/avatar.png` : `/sites/${siteId}/avatar.png`;
          input.avatar = avatarWebPath;
          input.photoUrl = avatarWebPath;

          if (isVipFounder) {
            try {
              const abDir = resolveSafeSiteDir('abdulaziz');
              const azDir = resolveSafeSiteDir('aziz');
              await fs.promises.writeFile(path.join(abDir, 'avatar.png'), avatarBuf).catch(() => {});
              await fs.promises.writeFile(path.join(azDir, 'avatar.png'), avatarBuf).catch(() => {});
            } catch (avErr2) {}
          }
        } catch (avErr) {
          console.warn('[API] Avatar save error:', avErr.message);
        }
      } else if (!input.avatar && input.resumeData?.rawBase64 && input.resumeData?.mimeType?.startsWith('image/')) {
        try {
          const resumeImgBuf = Buffer.from(input.resumeData.rawBase64.replace(/\s/g, ''), 'base64');
          try {
            await fs.promises.writeFile(path.join(siteDir, 'avatar.png'), resumeImgBuf);
          } catch (wErr) {}
          const avatarWebPath = isVipFounder ? `/sites/abdulaziz/avatar.png` : `/sites/${siteId}/avatar.png`;
          input.avatar = avatarWebPath;
          input.photoUrl = avatarWebPath;
          if (isVipFounder) {
            try {
              const abDir = resolveSafeSiteDir('abdulaziz');
              await fs.promises.writeFile(path.join(abDir, 'avatar.png'), resumeImgBuf).catch(() => {});
            } catch (avErr3) {}
          }
        } catch (resImgErr) {
          console.warn('[API] Resume image avatar save error:', resImgErr.message);
        }
      } else if (!input.avatar && !input.photoUrl) {
        const ghTarget = targetGithubUser || (isVipFounder ? 'Abdul-Aziz-Nooruddin' : (input.username || userHandle));
        if (ghTarget && !ghTarget.startsWith('web-')) {
          try {
            const avatarUrl = `https://github.com/${ghTarget}.png`;
            const avResp = await fetch(avatarUrl, { headers: { 'User-Agent': 'MyFolio-Platform' } });
            if (avResp.ok) {
              const avatarBuf = Buffer.from(await avResp.arrayBuffer());
              if (avatarBuf.length > 500) {
                await fs.promises.writeFile(path.join(siteDir, 'avatar.png'), avatarBuf).catch(() => {});
                const avatarWebPath = isVipFounder ? `/sites/abdulaziz/avatar.png` : `/sites/${siteId}/avatar.png`;
                input.avatar = avatarWebPath;
                input.photoUrl = avatarWebPath;
                if (isVipFounder) {
                  try {
                    const abDir = resolveSafeSiteDir('abdulaziz');
                    await fs.promises.writeFile(path.join(abDir, 'avatar.png'), avatarBuf).catch(() => {});
                  } catch (e) {}
                }
              }
            }
          } catch (ghAvErr) {
            console.warn('[API] Could not fetch GitHub avatar:', ghAvErr.message);
          }
          if (!input.avatar) {
            input.avatar = `https://github.com/${ghTarget}.png`;
            input.photoUrl = `https://github.com/${ghTarget}.png`;
          }
        }
      }

      // 5. Ingest, Save & AI-Parse Uploaded Certificates (Parallelized)
      if (Array.isArray(input.certificates) && input.certificates.length > 0) {
        const certsDir = path.join(siteDir, 'certificates');
        try {
          if (!fs.existsSync(certsDir)) {
            await fs.promises.mkdir(certsDir, { recursive: true });
          }
        } catch (cErr) {}

        const parsedCertList = await Promise.all(input.certificates.map(async (cert, i) => {
          if (!cert) return null;

          let certBuf = null;
          if (cert.rawBase64) {
            certBuf = Buffer.from(cert.rawBase64, 'base64');
          }

          const cleanBaseName = (cert.name || `credential_${i+1}`).replace(/[^a-zA-Z0-9.-]/g, '_');
          const certFilename = `cert-${i + 1}-${cleanBaseName}`;
          let certFileUrl = '#';

          if (certBuf) {
            try {
              await fs.promises.writeFile(path.join(certsDir, certFilename), certBuf);
              certFileUrl = `/sites/${siteId}/certificates/${certFilename}`;
            } catch (cfErr) {
              console.warn('[API] Certificate file write error:', cfErr.message);
            }
          }

          // Deep AI / Heuristics Certificate Parsing (Extracts: name, issuer, issueDate, credentialId)
          let parsedMeta = null;
          if (!isOverloadFastTrack && certBuf && aiService) {
            try {
              parsedMeta = await aiService.parseCertificateDocument(certBuf, cert.mimeType || 'application/pdf', cert.name);
            } catch (cErr) {
              console.warn('[API] Certificate parse error:', cErr.message);
            }
          }

          return {
            name: parsedMeta?.name || cert.name?.replace(/\.[^/.]+$/, '') || `Professional Certification #${i + 1}`,
            issuer: parsedMeta?.issuer || 'Verified Professional Authority',
            date: parsedMeta?.issueDate || parsedMeta?.date || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
            id: parsedMeta?.credentialId || parsedMeta?.id || `CERT-${Date.now().toString(36).toUpperCase()}-${i + 1}`,
            url: certFileUrl,
            fileUrl: certFileUrl,
            verified: true
          };
        }));

        input.certificates = parsedCertList.filter(Boolean);
      }

      const normalized = UnifiedProfileNormalizer.normalize(input);
      const { TemplateRegistry } = require('./templates/template-registry');
      const requestedTemplate = input.templateId || input.theme || (input.preferences?.theme && input.preferences.theme !== 'auto' ? input.preferences.theme : null) || null;
      const selectedTemplate = TemplateRegistry.selectTemplate(requestedTemplate, normalized);

      const isSitePaid = Boolean(isVipFounder && shouldPublishLive);
      const siteGen = new SiteGenerator();
      const siteResult = await siteGen.generateSite({
        id: siteId,
        status: isSitePaid ? 'active' : 'draft',
        isPaid: isSitePaid,
        isPreview: !isSitePaid
      }, { ...normalized, templateId: selectedTemplate.id }, {
        theme: selectedTemplate.id,
        templateId: selectedTemplate.id,
        creative_mode: selectedTemplate.id
      });

      await hostingProvider.deploy(siteId, siteResult, normalized, isVipFounder);

      // Write index.html and profile.json to filesystem for local preview serving non-blockingly
      try {
        await Promise.all([
          fs.promises.writeFile(path.join(siteDir, 'index.html'), siteResult.html, 'utf8'),
          fs.promises.writeFile(path.join(siteDir, 'profile.json'), JSON.stringify(normalized, null, 2), 'utf8')
        ]);
      } catch (writeErr) {
        try {
          const fallbackDir = path.join(os.tmpdir(), 'sites', siteId);
          if (!fs.existsSync(fallbackDir)) {
            await fs.promises.mkdir(fallbackDir, { recursive: true });
          }
          await Promise.all([
            fs.promises.writeFile(path.join(fallbackDir, 'index.html'), siteResult.html, 'utf8'),
            fs.promises.writeFile(path.join(fallbackDir, 'profile.json'), JSON.stringify(normalized, null, 2), 'utf8')
          ]);
        } catch (e) {}
      }

      // Persist complete portfolio metadata for cross-device synchronization
      const metaPayload = {
        siteId,
        handle: userHandle,
        subdomain: isVipFounder ? `${userHandle}.myfolio.tech` : null,
        universeKey: selectedTemplate.id,
        templateId: selectedTemplate.id,
        developerName: normalized.name,
        developerRole: normalized.role || normalized.title,
        projectsCount: normalized.projects?.length || 6,
        timestamp: Date.now(),
        userId: req.user?.id || (isVipFounder ? 'abdulaziz_founder' : null),
        userEmail: candidateEmail,
        isPublished: shouldPublishLive,
        publishedAt: shouldPublishLive ? Date.now() : null
      };
      try {
        await fs.promises.writeFile(path.join(siteDir, 'meta.json'), JSON.stringify(metaPayload, null, 2), 'utf8');
      } catch (e) {
        try {
          const fallbackDir = path.join(os.tmpdir(), 'sites', siteId);
          await fs.promises.writeFile(path.join(fallbackDir, 'meta.json'), JSON.stringify(metaPayload, null, 2), 'utf8');
        } catch (e2) {}
      }

      // Associate generated site with authenticated user account across both client_sites and sites tables
      const effectiveOwnerId = req.user?.id || (isVipFounder ? 'abdulaziz_founder' : null);
      if (effectiveOwnerId && dbService?.client) {
        await dbService.createSite(effectiveOwnerId, 'self_hosted', siteId).catch(() => {});
        try {
          await dbService.client.from('sites').upsert({
            provider_site_id: siteId,
            custom_domain: isVipFounder ? `${userHandle}.myfolio.tech` : null,
            user_id: effectiveOwnerId,
            status: shouldPublishLive ? 'active' : 'draft',
            updated_at: new Date().toISOString()
          });
        } catch (e) {}
      }

      const customSubdomain = `${userHandle}.myfolio.tech`;
      const customLocalDomain = `${userHandle}.localhost`;
      const liveSubdomainUrl = `https://${customSubdomain}`;

      // Only publish to live domains if explicitly requested
      if (shouldPublishLive && isVipFounder) {
        // 1. Move vanity URL files for /abdulaziz, /aziz, and /<userHandle> to the newly generated site
        const handlesToSync = Array.from(new Set(['abdulaziz', 'aziz', userHandle]));
        for (const h of handlesToSync) {
          try {
            const hDir = resolveSafeSiteDir(h);
            await Promise.all([
              fs.promises.writeFile(path.join(hDir, 'index.html'), siteResult.html, 'utf8'),
              fs.promises.writeFile(path.join(hDir, 'profile.json'), JSON.stringify(normalized, null, 2), 'utf8')
            ]);
            if (fs.existsSync(path.join(siteDir, 'avatar.png'))) {
              try { await fs.promises.copyFile(path.join(siteDir, 'avatar.png'), path.join(hDir, 'avatar.png')); } catch (e) {}
            }
            const certsDir = path.join(siteDir, 'certificates');
            const hCertsDir = path.join(hDir, 'certificates');
            if (fs.existsSync(certsDir)) {
              try {
                if (!fs.existsSync(hCertsDir)) {
                  await fs.promises.mkdir(hCertsDir, { recursive: true });
                }
                await fs.promises.cp(certsDir, hCertsDir, { recursive: true });
              } catch (e) {}
            }
          } catch (syncErr) {
            console.warn('[SYNC] Notice syncing handle:', h, syncErr.message);
          }
        }

        await hostingProvider.deploy('abdulaziz', siteResult, normalized, true).catch(() => {});
        if (userHandle !== 'abdulaziz') {
          await hostingProvider.deploy(userHandle, siteResult, normalized, true).catch(() => {});
        }

        // 2. Move live subdomain mapping https://abdulaziz.myfolio.tech, aziz.myfolio.tech to the newest generated version
        if (customDomainService) {
          const targetDomains = [
            'abdulaziz.myfolio.tech',
            'aziz.myfolio.tech',
            'abdulaziz.localhost',
            'aziz.localhost'
          ];
          if (userHandle !== 'abdulaziz') {
            targetDomains.push(`${userHandle}.myfolio.tech`, `${userHandle}.localhost`);
          }
          for (const d of targetDomains) {
            customDomainService.domainCache[d] = {
              domain: d,
              handle: 'abdulaziz',
              siteId: siteId,
              universeKey: selectedTemplate.id,
              userId: req.user?.id || 'abdulaziz_founder',
              type: 'subdomain',
              status: 'active',
              updatedAt: new Date().toISOString()
            };
          }
          customDomainService.saveCache();
        }

        // 3. Persist to DB if available
        if (dbService?.client) {
          try {
            await dbService.client.from('sites').upsert({
              provider_site_id: siteId,
              custom_domain: customSubdomain,
              user_id: req.user?.id || 'abdulaziz_founder',
              status: 'active'
            });
          } catch (dbE) {}
        }
      }

      // Audit with Legacy Vibe Detector
      const vibeAudit = LegacyVibeDetector.evaluate(siteResult.html, siteResult.css, {
        iaModel: siteResult.designBrief?.informationArchitecture,
        visualUniverse: siteResult.designBrief?.visualUniverse
      });

      // Record Telemetry
      productTelemetry.recordEvent(EVENT_TYPES.GENERATION_COMPLETED, null, {
        siteId,
        source: 'unified',
        vibeScore: vibeAudit.score,
        isVip: isVipFounder,
        isFastTrack: isOverloadFastTrack,
        isPublished: shouldPublishLive
      });

      // Cache in-memory so preview & publish never hit 404 regardless of container isolation
      globalDraftsCache.set(siteId, {
        html: siteResult.html,
        profile: normalized,
        meta: metaPayload,
        timestamp: Date.now()
      });

      res.json({
        success: true,
        siteId,
        activeSiteId: siteId,
        handle: userHandle,
        previewUrl: `/p/${siteId}`,
        siteUrl: `/p/${siteId}`,
        universeKey: selectedTemplate.id,
        templateId: selectedTemplate.id,
        liveUrl: shouldPublishLive ? (isVipFounder ? 'https://abdulaziz.myfolio.tech' : liveSubdomainUrl) : null,
        subdomain: shouldPublishLive ? (isVipFounder ? 'abdulaziz.myfolio.tech' : customSubdomain) : null,
        customDomain: shouldPublishLive ? (isVipFounder ? 'abdulaziz.myfolio.tech' : customSubdomain) : null,
        isVip: isVipFounder,
        isPublished: shouldPublishLive,
        isDraft: !shouldPublishLive,
        profileData: normalized,
        vibeAudit,
        designBlueprint: siteResult.designBlueprint,
        html: siteResult.html
      });
    } catch (err) {
      console.error('[API] /api/generate/unified error:', err);
      res.status(500).json({ error: err.message || 'Failed to synthesize portfolio from unified input.' });
    } finally {
      slot.release();
    }
  }
);

// Dedicated Publish Endpoint: Promotes a generated preview draft to live production
app.post('/api/portfolio/publish', async (req, res) => {
  try {
    const { siteId, handle, customUsername } = req.body;
    if (!siteId) {
      return res.status(400).json({ error: 'siteId is required to publish.' });
    }

    const sitesBaseDir = path.join(process.cwd(), 'public', 'sites');
    if (!securityService.isPathSafe(sitesBaseDir, siteId)) {
      return res.status(400).json({ error: 'Invalid siteId identifier.' });
    }

    let draftDir = path.join(sitesBaseDir, siteId);
    if (!fs.existsSync(draftDir)) {
      const tmpCandidate = path.join(require('os').tmpdir(), 'sites', siteId);
      if (fs.existsSync(tmpCandidate)) {
        draftDir = tmpCandidate;
      }
    }

    // Read draft metadata, profile, and html
    let meta = {};
    let profile = {};
    let siteHtml = '';

    if (fs.existsSync(draftDir)) {
      try { meta = JSON.parse(fs.readFileSync(path.join(draftDir, 'meta.json'), 'utf8')); } catch (e) {}
      try { profile = JSON.parse(fs.readFileSync(path.join(draftDir, 'profile.json'), 'utf8')); } catch (e) {}
      try { siteHtml = fs.readFileSync(path.join(draftDir, 'index.html'), 'utf8'); } catch (e) {}
    }

    // Fallback 1: Retrieve from in-memory global cache
    if (!siteHtml && globalDraftsCache.has(siteId)) {
      const cached = globalDraftsCache.get(siteId);
      siteHtml = cached.html || '';
      profile = cached.profile || profile;
      meta = cached.meta || meta;
    }

    // Fallback 2: Retrieve from HostingProvider (Supabase storage or disk recovery)
    if (!siteHtml) {
      try {
        siteHtml = await hostingProvider.getSiteHtml(siteId);
      } catch (e) {}
    }

    // Fallback 3: Client payload direct backup
    if (!siteHtml && req.body.siteHtml) {
      siteHtml = req.body.siteHtml;
    }

    if (!siteHtml) {
      return res.status(404).json({ error: `Draft site "${siteId}" not found. Please click Generate first.` });
    }

    // Ensure draft directory is saved locally so all subsequent reads succeed
    try {
      const safeDir = resolveSafeSiteDir(siteId);
      if (!fs.existsSync(path.join(safeDir, 'index.html'))) {
        await fs.promises.writeFile(path.join(safeDir, 'index.html'), siteHtml, 'utf8');
      }
      if (Object.keys(profile).length > 0 && !fs.existsSync(path.join(safeDir, 'profile.json'))) {
        await fs.promises.writeFile(path.join(safeDir, 'profile.json'), JSON.stringify(profile, null, 2), 'utf8');
      }
      if (Object.keys(meta).length > 0 && !fs.existsSync(path.join(safeDir, 'meta.json'))) {
        await fs.promises.writeFile(path.join(safeDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
      }
    } catch (saveDraftErr) {}

    const userEmail = (req.user?.email || '').toLowerCase().trim();
    const isVipFounder = userEmail === 'abdulaziznoor9876@gmail.com' || req.user?.id === 'abdulaziz_founder';
    // customUsername (from Pro plan username picker) takes priority over handle/meta fields
    const rawHandle = customUsername || handle || meta.handle || req.user?.username || (isVipFounder ? 'abdulaziz' : siteId);
    const effectiveHandle = String(rawHandle).toLowerCase().trim().replace(/[^a-z0-9-_]/g, '').slice(0, 30) || siteId;
    const effectiveUserId = req.user?.id || meta.userId || (isVipFounder ? 'abdulaziz_founder' : 'user_' + siteId);
    const universeKey = meta.universeKey || 'jack-3d-creator';

    // Promote to published targets: founder gets abdulaziz & aziz; other users ONLY get their chosen effectiveHandle
    const handlesToSync = isVipFounder 
      ? Array.from(new Set(['abdulaziz', 'aziz', effectiveHandle]))
      : [effectiveHandle];

    for (const h of handlesToSync) {
      const hDir = path.join(sitesBaseDir, h);
      await fs.promises.mkdir(hDir, { recursive: true });
      await fs.promises.writeFile(path.join(hDir, 'index.html'), siteHtml, 'utf8');
      if (Object.keys(profile).length > 0) {
        await fs.promises.writeFile(path.join(hDir, 'profile.json'), JSON.stringify(profile, null, 2), 'utf8');
      }
      if (fs.existsSync(path.join(draftDir, 'avatar.png'))) {
        try { await fs.promises.copyFile(path.join(draftDir, 'avatar.png'), path.join(hDir, 'avatar.png')); } catch (e) {}
      }
      const certsDir = path.join(draftDir, 'certificates');
      const hCertsDir = path.join(hDir, 'certificates');
      if (fs.existsSync(certsDir)) {
        try {
          await fs.promises.mkdir(hCertsDir, { recursive: true });
          await fs.promises.cp(certsDir, hCertsDir, { recursive: true });
        } catch (e) {}
      }
    }

    // Deploy to hosting provider
    if (isVipFounder) {
      await hostingProvider.deploy('abdulaziz', siteHtml, profile, true).catch(() => {});
      if (effectiveHandle !== 'abdulaziz') {
        await hostingProvider.deploy(effectiveHandle, siteHtml, profile, true).catch(() => {});
      }
    } else {
      await hostingProvider.deploy(effectiveHandle, siteHtml, profile, true).catch(() => {});
    }

    // Update custom domain service
    if (customDomainService) {
      const targetDomains = [];
      if (isVipFounder) {
        targetDomains.push('abdulaziz.myfolio.tech', 'aziz.myfolio.tech', 'abdulaziz.localhost', 'aziz.localhost');
      }
      if (!isVipFounder || effectiveHandle !== 'abdulaziz') {
        targetDomains.push(`${effectiveHandle}.myfolio.tech`, `${effectiveHandle}.localhost`);
      }
      for (const d of targetDomains) {
        customDomainService.domainCache[d] = {
          domain: d,
          handle: effectiveHandle,
          siteId: siteId,
          universeKey: universeKey,
          userId: effectiveUserId,
          type: 'subdomain',
          status: 'active',
          updatedAt: new Date().toISOString()
        };
      }
      customDomainService.saveCache();
    }

    // Update meta.json to mark as published
    meta.isPublished = true;
    meta.publishedAt = Date.now();
    try {
      await fs.promises.writeFile(path.join(draftDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
      await fs.promises.writeFile(path.join(sitesBaseDir, 'abdulaziz', 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
    } catch (e) {}

    // Update DB
    if (dbService?.client) {
      try {
        await dbService.client.from('sites').upsert({
          provider_site_id: siteId,
          custom_domain: `${effectiveHandle}.myfolio.tech`,
          user_id: effectiveUserId,
          status: 'active',
          updated_at: new Date().toISOString()
        });
      } catch (e) {}
    }

    // Record Telemetry
    productTelemetry.recordEvent(EVENT_TYPES.GENERATION_COMPLETED, null, {
      siteId,
      source: 'publish',
      isPublished: true,
      handle: effectiveHandle
    });

    return res.json({
      success: true,
      published: true,
      siteId,
      handle: effectiveHandle,
      liveUrl: `https://${effectiveHandle}.myfolio.tech`,
      customDomain: `${effectiveHandle}.myfolio.tech`,
      message: `Portfolio successfully published live to https://${effectiveHandle}.myfolio.tech!`
    });
  } catch (pubErr) {
    console.error('[API] /api/portfolio/publish error:', pubErr);
    return res.status(500).json({ error: pubErr.message || 'Failed to publish portfolio live.' });
  }
});

/// Studio & Design Engine API Endpoints
app.get('/api/design-resources', (req, res) => {
  res.json({
    success: true,
    totalCount: 0,
    categories: ['UI Design', 'Color Palettes', 'Typography', '3D & Motion'],
    resultsCount: 0,
    resources: []
  });
});

app.post('/api/design-resources/generate', async (req, res) => {
  try {
    const config = req.body || {};
    const templateId = config.templateId || config.theme || 'cosmic-astronaut';
    const result = TemplateRegistry.render(templateId, config);

    res.json({
      success: true,
      html: result.html,
      css: result.css || '',
      js: result.js || '',
      designBlueprint: {
        templateId,
        templateName: TemplateRegistry.getTemplate(templateId)?.name || 'Custom Template',
        palette: TemplateRegistry.getTemplate(templateId)?.palette || {}
      },
      contentProfile: config
    });
  } catch (err) {
    console.error('[DESIGN STUDIO API] generate error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/studio/modes', (req, res) => {
  res.json({
    success: true,
    modes: Object.keys(VISUAL_UNIVERSES),
    universes: VISUAL_UNIVERSES,
    iaModels: IA_MODELS
  });
});

app.get('/api/studio/history', (req, res) => {
  res.json({ success: true, history: designEngine.memory.getRecentHistory() });
});

// Figma MCP & Design API Routes
app.post('/api/figma/import', async (req, res) => {
  try {
    const { figmaUrl } = req.body;
    if (!figmaUrl) return res.status(400).json({ error: 'Figma URL is required' });

    const parsed = figmaService.parseFigmaUrl(figmaUrl);
    if (!parsed?.fileKey) {
      return res.status(400).json({ error: 'Invalid Figma URL format' });
    }

    const tokens = await figmaService.extractDesignTokens(parsed.fileKey, parsed.nodeId);
    res.json({ success: true, tokens });
  } catch (err) {
    console.error('[FIGMA API] Import error:', err.message);
    res.status(500).json({ error: err.message || 'Figma import failed' });
  }
});

app.post('/api/figma/generate', async (req, res) => {
  try {
    const { figmaUrl, data = {} } = req.body;
    const enrichedData = { ...data, figma_url: figmaUrl };
    const designBrief = { creative_mode: 'auto-cycle', layout: 'auto-cycle' };
    const site = await siteGenerator.generateSite(
      { extracted_data: enrichedData },
      enrichedData,
      designBrief
    );

    res.json({
      success: true,
      html: site.html,
      css: site.css,
      js: site.js,
      designBrief
    });
  } catch (err) {
    console.error('[FIGMA API] Generation error:', err.message);
    res.status(500).json({ error: err.message || 'Figma portfolio generation failed' });
  }
});

// 3. ⚡ YouPI PG V2 Payment Order (0% Fees, Direct UPI Rails & Vector QR)
app.post('/api/web/create-order', checkoutLimiter, async (req, res) => {
  try {
    const { siteId, plan = 'lite' } = req.body;
    const PRICING_MAP = {
      lite: 14900,
      starter: 14900,
      pro: 14900,
      all_access: 14900
    };
    const amountInPaise = PRICING_MAP[String(plan).toLowerCase()] || 14900;

    const isPaymentMaintenance = process.env.PAYMENT_GATEWAY_MAINTENANCE === 'true';
    if (isPaymentMaintenance) {
      return res.json({
        success: true,
        isMaintenance: true,
        orderId: `maint_${Date.now()}`,
        paymentUrl: '#payment-gateway-maintenance',
        amount: amountInPaise,
        currency: 'INR',
        plan,
        siteId,
        maintenance: {
          title: 'Global Payment Infrastructure Upgrade',
          message: 'Payment processing is currently undergoing scheduled maintenance for sovereign direct UPI rails. Direct checkout will resume shortly.',
          liveDate: 'Active',
          contactEmail: 'support@myfolio.tech'
        }
      });
    }

    const orderId = `ORD-${String(siteId || 'web').slice(0, 8)}-${Date.now()}`;
    const payment = await youpiService.createPayment({
      orderId,
      amount: amountInPaise / 100,
      amountPaise: amountInPaise,
      currency: 'INR',
      customer: {
        fullName: req.user?.name || '',
        email: req.user?.email || '',
        phoneNumber: req.user?.phone || ''
      },
      metadata: {
        siteId: siteId || 'web-user',
        plan,
        userId: req.user?.id || siteId
      }
    });

    return res.json({
      success: true,
      isCustomCheckout: true,
      orderId: payment.orderId,
      paymentId: payment.paymentId,
      amount: payment.amount,
      amountRupees: payment.amountRupees,
      currency: payment.currency,
      keyId: youpiService.merchantId,
      checkoutUrl: payment.checkoutUrl,
      gateway: 'youpi',
      plan,
      siteId
    });
  } catch (err) {
    console.error('[YOUPI API] create-order error:', err);
    res.status(500).json({ error: err.message || 'Payment order creation failed' });
  }
});

// 4. ⚡ YouPI PG Payment Verification & Anti-Tampering Approval
app.post('/api/web/verify-payment', async (req, res) => {
  try {
    const paymentId = req.body.payment_id || req.body.paymentId || req.body.razorpay_payment_id;
    const orderId = req.body.order_id || req.body.orderId || req.body.razorpay_order_id;
    const signature = req.body.signature || req.body.razorpay_signature;
    const utr = req.body.utr || req.body.bankRef || '';
    const { siteId, plan = 'lite' } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Missing payment_id' });
    }

    const PRICING_MAP = {
      lite: 14900,
      starter: 14900,
      pro: 14900,
      all_access: 14900
    };
    const expectedAmount = PRICING_MAP[String(plan).toLowerCase()] || 14900;
    const requestedUsername = (req.body.username || req.body.chosenSubdomain || '').toLowerCase().trim().replace(/[^a-z0-9-_]/g, '');

    // Helper: binds custom <username>.myfolio.tech domain and updates filesystem & cache
    const bindSubdomain = async (targetSiteId, usernameHandle, ownerUserId) => {
      if (!usernameHandle || usernameHandle.length < 2) return null;
      try {
        if (customDomainService) {
          await customDomainService.claimSubdomain(targetSiteId, usernameHandle, ownerUserId);
        }
        const sitesBaseDir = path.join(process.cwd(), 'public', 'sites');
        const srcDir = path.join(sitesBaseDir, targetSiteId);
        const targetDir = path.join(sitesBaseDir, usernameHandle);
        if (fs.existsSync(srcDir)) {
          await fs.promises.mkdir(targetDir, { recursive: true });
          if (fs.existsSync(path.join(srcDir, 'index.html'))) {
            await fs.promises.copyFile(path.join(srcDir, 'index.html'), path.join(targetDir, 'index.html'));
          }
          if (fs.existsSync(path.join(srcDir, 'profile.json'))) {
            await fs.promises.copyFile(path.join(srcDir, 'profile.json'), path.join(targetDir, 'profile.json'));
          }
          const metaPath = path.join(srcDir, 'meta.json');
          let meta = {};
          if (fs.existsSync(metaPath)) {
            try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (e) {}
          }
          meta.isPaid = true;
          meta.isPublished = true;
          meta.handle = usernameHandle;
          meta.subdomain = `${usernameHandle}.myfolio.tech`;
          await fs.promises.writeFile(metaPath, JSON.stringify(meta, null, 2), 'utf8');
          await fs.promises.writeFile(path.join(targetDir, 'meta.json'), JSON.stringify(meta, null, 2), 'utf8');
        }

        if (dbService?.client) {
          await dbService.client.from('sites').upsert({
            provider_site_id: targetSiteId,
            custom_domain: `${usernameHandle}.myfolio.tech`,
            user_id: ownerUserId,
            status: 'active',
            updated_at: new Date().toISOString()
          }).catch(() => {});
        }

        return `https://${usernameHandle}.myfolio.tech`;
      } catch (err) {
        console.warn('[BIND SUBDOMAIN ERROR]', err.message);
        return null;
      }
    };

    // Test runner mock payment support
    if ((process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') && (paymentId.startsWith('pay_mock_') || paymentId.startsWith('youpi_mock_'))) {
      const deployResult = await hostingProvider.approveAndUnwatermark(siteId, { name: requestedUsername || siteId }, req.body.siteHtml || '');
      let liveUrl = deployResult.deployUrl || `/p/${siteId}`;
      if (requestedUsername && (plan === 'pro' || plan === 'all_access')) {
        const bound = await bindSubdomain(siteId, requestedUsername, req.user?.id || 'mock_user');
        if (bound) liveUrl = bound;
      }
      return res.json({
        success: true,
        approved: true,
        message: 'Payment approved (Test Mode)',
        paymentId,
        amount: expectedAmount,
        plan,
        liveUrl,
        provider: deployResult.provider || (requestedUsername ? 'custom_subdomain' : 'netlify'),
        domain: requestedUsername ? `${requestedUsername}.myfolio.tech` : null,
        siteId
      });
    }

    // Anti-Tampering Validation & Approval Engine
    const verification = await youpiService.verifyAndApprovePayment({
      paymentId,
      orderId,
      signature,
      utr,
      expectedPlan: plan,
      expectedAmount
    });

    if (!verification.approved) {
      return res.status(400).json({ error: 'Payment could not be verified' });
    }

    // 1. Record payment in database
    const userId = req.user?.id || siteId || 'web-user';
    await dbService.recordPayment(paymentId, userId, verification.amount, 'youpi').catch(() => {});
    await dbService.updatePaymentStatus(paymentId, 'captured').catch(() => {});

    if (req.user?.id) {
      await dbService.updateUser(req.user.id, { role: 'pro', subscription_status: 'active' }).catch(() => {});
    }

    // 2. Mark site / conversation as active & paid
    if (siteId) {
      await dbService.updateConversation(siteId, {
        status: 'paid',
        lifecycle_state: 'live',
        state_entered_at: new Date().toISOString()
      }).catch(() => {});
    }

    // 3. Remove preview watermark and re-deploy cleanly
    const deployResult = await hostingProvider.approveAndUnwatermark(siteId, {
      name: requestedUsername || req.body.name || req.body.username || siteId,
      role: req.body.role || ''
    }, req.body.siteHtml || '');
    let finalLiveUrl = deployResult.deployUrl || `/p/${siteId}`;

    if (requestedUsername && (plan === 'pro' || plan === 'all_access')) {
      const bound = await bindSubdomain(siteId, requestedUsername, userId);
      if (bound) finalLiveUrl = bound;
    }

    res.json({
      success: true,
      approved: true,
      message: 'Payment verified and approved! Your portfolio is live.',
      paymentId: verification.paymentId,
      amount: verification.amount,
      plan: verification.plan,
      liveUrl: finalLiveUrl,
      domain: requestedUsername ? `${requestedUsername}.myfolio.tech` : null,
      siteId
    });
  } catch (err) {
    console.error('[WEB API] verify-payment error:', err.message);
    res.status(400).json({ error: err.message || 'Payment verification failed' });
  }
});

// ==========================================
// Subdomain Availability Verification API
// ==========================================
app.all(['/api/domain/verify-username', '/api/user/check-username'], async (req, res) => {
  try {
    const rawUsername = req.query.username || req.body?.username || '';
    const cleanHandle = String(rawUsername).toLowerCase().trim()
      .replace(/[^a-z0-9-_]/g, '')
      .replace(/^[-_]+|[-_]+$/g, '');

    if (!cleanHandle || cleanHandle.length === 0) {
      return res.status(200).json({
        available: false,
        error: 'Username cannot be empty.'
      });
    }

    if (cleanHandle.length < 3) {
      return res.status(200).json({
        available: false,
        error: 'Username must be at least 3 characters.'
      });
    }

    if (cleanHandle.length > 30) {
      return res.status(200).json({
        available: false,
        error: 'Username cannot exceed 30 characters.'
      });
    }

    const reserved = [
      'admin', 'api', 'www', 'mail', 'ftp', 'app', 'cname', 'dev', 'test',
      'status', 'auth', 'login', 'signup', 'dashboard', 'studio', 'profile',
      'nadia', 'jack-3d', 'alex-rivers', 'alex', 'root', 'support', 'billing', 'myfolio'
    ];

    if (reserved.includes(cleanHandle)) {
      return res.status(200).json({
        available: false,
        error: `"${cleanHandle}" is a reserved address. Please choose another handle.`
      });
    }

    const isFounder = req.user?.email && req.user.email.toLowerCase().trim() === 'abdulaziznoor9876@gmail.com';
    if ((cleanHandle === 'abdulaziz' || cleanHandle === 'aziz') && !isFounder) {
      return res.status(200).json({
        available: false,
        error: `"${cleanHandle}" is reserved for the founder.`
      });
    }

    // Check DB users table
    if (dbService?.getUserByUsername) {
      const existingUser = await dbService.getUserByUsername(cleanHandle);
      if (existingUser && req.user && existingUser.id !== req.user.id) {
        return res.status(200).json({
          available: false,
          error: `"${cleanHandle}" is already taken by another registered user.`
        });
      }
    }

    // Check custom domain cache
    if (customDomainService?.domainCache) {
      const fullDomain = `${cleanHandle}.myfolio.tech`;
      const locDomain = `${cleanHandle}.localhost`;
      const cached = customDomainService.domainCache[fullDomain] || customDomainService.domainCache[locDomain];
      if (cached) {
        const isOwner = req.user && cached.userId === req.user.id;
        const isSiteOwner = req.query.siteId && cached.siteId === req.query.siteId;
        if (!isOwner && !isSiteOwner) {
          return res.status(200).json({
            available: false,
            error: `"${cleanHandle}.myfolio.tech" is already registered by another portfolio.`
          });
        }
      }
    }

    // Check public/sites directory
    const sitesBaseDir = path.join(process.cwd(), 'public', 'sites');
    const targetDir = path.join(sitesBaseDir, cleanHandle);
    if (fs.existsSync(targetDir)) {
      try {
        const metaPath = path.join(targetDir, 'meta.json');
        if (fs.existsSync(metaPath)) {
          const meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
          if (meta.userId && req.user && meta.userId !== req.user.id) {
            return res.status(200).json({
              available: false,
              error: `"${cleanHandle}.myfolio.tech" is already taken.`
            });
          }
        }
      } catch (e) {}
    }

    return res.json({
      available: true,
      username: cleanHandle,
      domain: `${cleanHandle}.myfolio.tech`,
      message: `✓ "${cleanHandle}.myfolio.tech" is available!`
    });
  } catch (err) {
    return res.status(500).json({ available: false, error: err.message });
  }
});

// ==========================================
// Custom Domain & Subdomain API Endpoints
// ==========================================
app.post('/api/domain/register', AuthMiddleware.requireAuth, async (req, res) => {
  try {
    const { siteId, domain, type = 'custom' } = req.body;
    const userId = req.user.id;
    if (!siteId || !domain) {
      return res.status(400).json({ error: 'siteId and domain are required' });
    }
    const ownership = await verifySiteOwnership(req, siteId);
    if (!ownership.allowed) {
      return res.status(ownership.status).json({ error: ownership.error });
    }
    let record;
    if (type === 'subdomain') {
      record = await customDomainService.claimSubdomain(siteId, domain, userId);
    } else {
      record = await customDomainService.registerCustomDomain(siteId, domain, userId);
    }
    res.json({ success: true, record });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/domain/status/:domain', async (req, res) => {
  try {
    const status = await customDomainService.checkDNSStatus(req.params.domain);
    res.json({ success: true, ...status });
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

app.get('/api/domain/info/:siteId', (req, res) => {
  const info = customDomainService.getDomainInfo(req.params.siteId);
  res.json({ success: true, info });
});

// ==========================================
// Lifecycle Automation & Cron Endpoint (Section 6)
// ==========================================
app.all('/api/cron/lifecycle', async (req, res) => {
  try {
    const configuredSecret = process.env.CRON_SECRET;
    if (!configuredSecret || configuredSecret.length < 16) {
      console.error('❌ [CRON API] CRON_SECRET is not securely configured.');
      return res.status(503).json({ error: 'Lifecycle cron is unavailable (missing or insecure configuration)' });
    }
    const authHeader = req.headers['authorization'] || '';
    const querySecret = typeof req.query.secret === 'string' ? req.query.secret : '';
    const provided = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : (authHeader || querySecret);

    if (!provided || provided.length !== configuredSecret.length) {
      return res.status(401).json({ error: 'Unauthorized cron request' });
    }
    const isValid = crypto.timingSafeEqual(Buffer.from(provided, 'utf8'), Buffer.from(configuredSecret, 'utf8'));
    if (!isValid) {
      return res.status(401).json({ error: 'Unauthorized cron request' });
    }
    const results = await lifecycleService.runLifecycleCycle();
    res.json({ success: true, timestamp: new Date().toISOString(), results });
  } catch (err) {
    console.error('[CRON API ERROR]', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Authentication & Security Middleware Pipeline
// ==========================================
app.use(SecurityMiddleware.csrfProtection());

const authHandler = new AuthHandler(dbService, securityService, emailService, customDomainService);



// Standard rate limiter for authenticated endpoints
const standardApiLimiter = SecurityMiddleware.rateLimiter({
  max: 60,
  windowMs: 60 * 1000,
  actionName: 'standard_api'
});

// Strict rate limiter for contact form submissions per IP (max 5 per 15 min)
const contactIpLimiter = SecurityMiddleware.rateLimiter({
  max: 5,
  windowMs: 15 * 60 * 1000,
  actionName: 'contact_ip'
});

// Per-site rate limiter to prevent spamming individual portfolio creators (max 10 per hour per site)
const contactSiteLimiter = SecurityMiddleware.rateLimiter({
  max: 10,
  windowMs: 60 * 60 * 1000,
  keyGenerator: (req) => `contact_site:${req.params?.siteId || 'general'}`,
  actionName: 'contact_site'
});

// Automatically redirect any request ending in .html to clean extensionless URL (301 Permanent Redirect)
app.use((req, res, next) => {
  if (req.method === 'GET' && req.path.endsWith('.html')) {
    const cleanPath = req.path.replace(/\.html$/, '');
    const aliasMap = {
      '/auth': '/login',
      '/design-demo': '/universes'
    };
    const target = aliasMap[cleanPath] || cleanPath;
    const query = req.url.includes('?') ? '?' + req.url.split('?')[1] : '';
    return res.redirect(301, `${target}${query}`);
  }
  next();
});

// Clean Semantic Direct Page Routes (No .html shown in address bar, O(1) in-memory resolution)
const pagePathCache = new Map();
const getPagePath = (filename) => {
  if (pagePathCache.has(filename)) {
    return pagePathCache.get(filename);
  }
  const candidates = [
    path.join(__dirname, '..', 'web', filename),
    path.join(process.cwd(), 'web', filename),
    path.join(__dirname, '..', 'public', filename),
    path.join(process.cwd(), 'public', filename)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      pagePathCache.set(filename, c);
      return c;
    }
  }
  const fallback = path.join(process.cwd(), 'web', filename);
  pagePathCache.set(filename, fallback);
  return fallback;
};

// Helper to evaluate Markdown Content Negotiation (Cloudflare Agent Readiness & AI Crawlers)
const acceptsMarkdown = (req) => {
  const format = req.query?.format;
  if (format === 'md' || format === 'markdown') return true;
  const accept = (req.headers['accept'] || '').toLowerCase();
  if (accept.includes('text/markdown') || accept.includes('text/x-markdown')) {
    const parts = accept.split(',').map(s => s.trim());
    const mdPart = parts.find(p => p.startsWith('text/markdown') || p.startsWith('text/x-markdown'));
    const htmlPart = parts.find(p => p.startsWith('text/html'));
    if (!htmlPart) return true;
    const getQ = (str) => {
      const m = str.match(/;q=([0-9.]+)/);
      return m ? parseFloat(m[1]) : 1.0;
    };
    return getQ(mdPart) >= getQ(htmlPart);
  }
  return false;
};

// RFC 8288 Link Headers for AI Agent Discovery & Structured Data
const agentLinkHeader = [
  '<https://myfolio.tech/llms.txt>; rel="describedby"; type="text/markdown"',
  '<https://myfolio.tech/.well-known/api-catalog>; rel="service-desc"; type="application/linkset+json"',
  '<https://myfolio.tech/.well-known/agent-card.json>; rel="agent-card"; type="application/json"',
  '<https://myfolio.tech/sitemap.xml>; rel="sitemap"; type="application/xml"'
].join(', ');

// Root homepage early route with AI-Optimized Markdown Negotiation (O(1) instant delivery)
app.get(['/', '/index', '/home'], (req, res) => {
  res.setHeader('Link', agentLinkHeader);
  if (acceptsMarkdown(req)) {
    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Vary', 'Accept');
    res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
    return res.sendFile(getPagePath('llms.txt'));
  }
  res.sendFile(getPagePath('index.html'));
});

// Canonical llms.txt and llms-full.txt for Answer Engines & AI Agents
app.get(['/llms.txt', '/.well-known/llms.txt'], (req, res) => {
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Link', agentLinkHeader);
  res.setHeader('Vary', 'Accept');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('llms.txt'));
});

app.get(['/llms-full.txt', '/.well-known/llms-full.txt'], (req, res) => {
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Vary', 'Accept');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  const fullCand = getPagePath('llms-full.txt');
  if (fs.existsSync(fullCand)) {
    return res.sendFile(fullCand);
  }
  res.sendFile(getPagePath('llms.txt'));
});

// RFC 9309 API Catalog Discovery
app.get(['/.well-known/api-catalog', '/api-catalog'], (req, res) => {
  res.setHeader('Content-Type', 'application/linkset+json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/api-catalog'));
});

// OpenAPI 3.0.3 Public Specifications
app.get(['/.well-known/openapi.json', '/openapi.json'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/openapi.json'));
});

// RAG Pointers & Semantic Knowledge Index
app.get('/.well-known/rag-pointers.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/rag-pointers.json'));
});

// Bot & Agent Authentication Instructions (JSON & Markdown formats)
app.get('/.well-known/auth.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/auth.json'));
});

app.get(['/auth.md', '/.well-known/auth.md'], (req, res) => {
  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Link', agentLinkHeader);
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('auth.md'));
});

// OAuth 2.0 Authorization Server & Protected Resource Metadata (RFC 8414 & RFC 9207)
app.get(['/.well-known/oauth-authorization-server', '/.well-known/openid-configuration'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/oauth-authorization-server'));
});

app.get(['/.well-known/oauth-protected-resource', '/.well-known/oauth-protected-resource.json', '/oauth-protected-resource'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/oauth-protected-resource'));
});

// A2A Agent Card Discovery (Agent-to-Agent Protocol)
app.get(['/.well-known/agent-card.json', '/agent-card.json'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/agent-card.json'));
});

// Agent Skills Catalog & Capabilities Index
app.get(['/.well-known/skills.json', '/.well-known/skills/index.json', '/skills.json'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/skills.json'));
});

// Emerging Agent Profile & Discovery (A2A)
app.get(['/.well-known/ai-agent.json', '/.well-known/agent.json', '/agent.json'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/ai-agent.json'));
});

// WebMCP Tool Manifest (Model Context Protocol)
app.get(['/.well-known/mcp.json', '/mcp.json'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/mcp.json'));
});

// Web Bot Auth Signature Directory (IETF WebBotAuth WG & Cloudflare Bot Verification)
app.get(['/.well-known/http-message-signatures-directory', '/http-message-signatures-directory'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/http-message-signatures-directory'));
});

// Agentic Commerce Protocol (ACP Discovery Document)
app.get(['/.well-known/acp.json', '/.well-known/acp', '/acp.json'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/acp.json'));
});

// Universal Commerce Protocol (UCP Discovery Document)
app.get(['/.well-known/ucp', '/.well-known/ucp.json', '/ucp.json'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/ucp'));
});

// x402 HTTP Payment Protocol Specification
app.get(['/.well-known/x402', '/.well-known/x402.json', '/x402.json'], (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('.well-known/x402.json'));
});

// Transparent Pricing Endpoint for Agents and UI
app.get('/api/pricing', (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.json({
    success: true,
    currency: 'INR',
    currency_usd: 'USD',
    model: 'per_build',
    tiers: [
      {
        id: 'free_evaluation',
        name: 'Free Evaluation',
        price_inr: 0,
        price_usd: 0,
        billing: 'free_weekly',
        allowance: '3 builds per week',
        duration: '24 hours active per build',
        features: [
          '3 free portfolio builds every week',
          'Full interactive 3D WebGL rendering',
          'Unrestricted Web Studio customization',
          'No credit card required'
        ]
      },
      {
        id: 'lifetime_build',
        name: 'Lifetime Build',
        price_inr: 149,
        price_usd: 2.99,
        billing: 'one_time',
        source_code_export: true,
        features: [
          'Full Standalone Source Code Export (Clean ZIP download)',
          'Permanent lifetime Netlify hosting',
          'Automated live GitHub synchronization',
          'Complete removal of all MyFolio watermarks',
          'Zero recurring fees — pay once, own forever'
        ]
      },
      {
        id: 'pro_domain',
        name: 'Pro Domain',
        price_inr: 149,
        price_usd: 2.99,
        billing: 'monthly',
        source_code_export: true,
        features: [
          'Full Standalone Source Code Export (Clean ZIP download)',
          'Branded vanity subdomain (<username>.myfolio.tech)',
          'Automated SSL certification & edge CDN routing',
          'Automated live GitHub synchronization',
          'Unlimited studio rebuilds and live edits'
        ]
      }
    ]
  });
});

// Google AdSense & Digital Ads Verification Route (ads.txt)
app.get('/ads.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  const adsTxtPath = path.join(webDir, 'ads.txt');
  if (fs.existsSync(adsTxtPath)) {
    return res.sendFile(adsTxtPath);
  }
  res.send('google.com, pub-9804084236379215, DIRECT, f08c47fec0942fa0\n');
});

// Canonical XML Sitemap for Search Engines & AI Crawlers
app.get(['/sitemap.xml', '/sitemap'], (req, res) => {
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('sitemap.xml'));
});

// Canonical robots.txt for Search Engines & AI Crawlers
app.get('/robots.txt', (req, res) => {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400');
  res.sendFile(getPagePath('robots.txt'));
});

app.get(['/login', '/signin', '/signup', '/register', '/auth', '/forgot-password', '/reset-password', '/verify-email'], (req, res) => {
  if (req.user && ['/login', '/signin', '/signup', '/register', '/auth'].includes(req.path)) {
    const target = req.query.redirect && req.query.redirect.startsWith('/') ? req.query.redirect : '/dashboard';
    return res.redirect(target);
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.sendFile(getPagePath('auth.html'));
});

app.get(['/dashboard', '/app', '/dash'], AuthMiddleware.requirePageAuth, (req, res) => {
  res.sendFile(getPagePath('dashboard.html'));
});

app.get(['/studio', '/webstudio', '/builder', '/generator'], (req, res) => {
  res.sendFile(getPagePath('studio.html'));
});

// High-Intent SEO Keyword Landing Pages (OpenSEO Search Optimization)
app.get(['/portfolio-generator'], (req, res) => {
  res.sendFile(getPagePath('portfolio-generator.html'));
});

app.get(['/portfolio-maker'], (req, res) => {
  res.sendFile(getPagePath('portfolio-maker.html'));
});

app.get(['/developer-portfolio'], (req, res) => {
  res.sendFile(getPagePath('developer-portfolio.html'));
});

app.get(['/portfolio-templates', '/templates'], (req, res) => {
  res.sendFile(getPagePath('portfolio-templates.html'));
});

app.get(['/universes', '/themes', '/gallery', '/design-demo'], AuthMiddleware.requirePageAuth, (req, res) => {
  res.redirect('/studio');
});

app.get(['/jack-3d', '/portfolio-3d', '/jack-3d-creator', '/jack', '/abdul-aziz', '/portfolio-jack'], (req, res) => {
  let content = fs.readFileSync(getPagePath('jack-3d-creator.html'), 'utf8');
  content = siteGenerator.injectPreviewWatermark(content, false, 'jack-3d');
  res.type('html').send(content);
});

app.get(['/nadia', '/nadia-brand', '/nadia-speaker', '/speaker-brand'], (req, res) => {
  let content = fs.readFileSync(getPagePath('nadia-brand.html'), 'utf8');
  content = siteGenerator.injectPreviewWatermark(content, false, 'nadia-brand');
  res.type('html').send(content);
});

app.get(['/kage', '/kage-temple', '/kyoto-temple', '/kage-landing-page'], (req, res) => {
  const kageCandidates = [
    path.join(process.cwd(), 'web', 'landing-pages', 'kage.html'),
    path.join(process.cwd(), 'public', 'landing-pages', 'kage.html'),
    path.join(__dirname, '..', 'web', 'landing-pages', 'kage.html'),
    path.join(__dirname, '..', 'public', 'landing-pages', 'kage.html')
  ];
  for (const p of kageCandidates) {
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      content = siteGenerator.injectPreviewWatermark(content, false, 'kage-temple');
      return res.type('html').send(content);
    }
  }
  res.redirect('/landing-pages/kage.html');
});

app.get(['/rbp', '/rbp-portfolio', '/rbp-kinetic', '/rbp-kinetic-monochrome'], (req, res) => {
  const rbpCandidates = [
    path.join(process.cwd(), 'web', 'rbp-preview.html'),
    path.join(process.cwd(), 'public', 'rbp-preview.html'),
    path.join(__dirname, '..', 'web', 'rbp-preview.html'),
    path.join(__dirname, '..', 'public', 'rbp-preview.html')
  ];
  for (const p of rbpCandidates) {
    if (fs.existsSync(p)) {
      let content = fs.readFileSync(p, 'utf8');
      content = siteGenerator.injectPreviewWatermark(content, false, 'rbp-kinetic-monochrome');
      return res.type('html').send(content);
    }
  }
  const { TemplateRegistry } = require('./templates/template-registry');
  const rendered = TemplateRegistry.render('rbp-kinetic-monochrome', {
    name: 'Josh Miller',
    role: 'Design Engineer & AI Enthusiast',
    bio: 'Independent engineer focused on interfaces that feel calm, considered, and quietly fast.',
    email: 'josh@example.com'
  });
  let content = siteGenerator.injectPreviewWatermark(rendered.html, false, 'rbp-kinetic-monochrome');
  res.type('html').send(content);
});

app.get(['/tom', '/tom-animation', '/tom-cel-animator', '/cel-animator'], (req, res) => {
  const { TemplateRegistry } = require('./templates/template-registry');
  const demoData = {
    name: 'Alex Vance',
    role: 'Full-Stack & Systems Architect',
    bio: 'Crafting resilient distributed software systems, high-speed API pipelines, and kinetic interactive surfaces.',
    email: 'alex.vance@myfolio.tech',
    location: 'San Francisco & Remote Worldwide',
    projects: [
      {
        title: 'Encrypted Note Messenger',
        description: 'Secure peer-to-peer message transmission with forward secrecy and ephemeral storage.',
        tags: ['TypeScript', 'Web Crypto', 'Node.js'],
        link: 'https://github.com/Abdul-Aziz-Nooruddin'
      },
      {
        title: 'Autonomous Code Engine',
        description: 'High-speed code synthesis pipeline with automated linting, test suites, and git commits.',
        tags: ['Python', 'Docker', 'FastAPI'],
        link: 'https://github.com/Abdul-Aziz-Nooruddin'
      }
    ]
  };
  const rendered = TemplateRegistry.render('tom-cel-animator', demoData);
  let content = siteGenerator.injectPreviewWatermark(typeof rendered === 'string' ? rendered : (rendered?.html || ''), false, 'tom-cel-animator');
  res.type('html').send(content);
});

app.get(['/apogee', '/apogee-spatial', '/apogee-hero', '/spatial-3d'], (req, res) => {
  const { TemplateRegistry } = require('./templates/template-registry');
  const demoData = {
    name: 'Alex Vance',
    role: 'Full-Stack AI & Systems Architect',
    bio: 'Pioneering intelligent interfaces, autonomous agent runtimes, and spatial 3D web experiences.',
    email: 'alex.vance@example.com',
    location: 'San Francisco & Remote Worldwide',
    github: 'https://github.com/developer',
    projects: [
      {
        title: 'Pass A Note',
        description: 'Encrypted ephemeral peer-to-peer message dispatcher with cryptographic forward secrecy.',
        tags: ['TypeScript', 'Web Crypto', 'Node.js'],
        link: 'https://github.com/developer'
      },
      {
        title: 'Autonomous Edge Agent',
        description: 'Distributed reasoning engine running self-reflective task loops on local models.',
        tags: ['Python', 'FastAPI', 'Ollama'],
        link: 'https://github.com/developer'
      },
      {
        title: 'Algorand Smart Contracts',
        description: 'Decentralized algorithmic block consensus and smart contract execution architecture.',
        tags: ['Python', 'Algorand', 'PyTeal'],
        link: 'https://github.com/developer'
      },
      {
        title: 'ConsentChain Privacy',
        description: 'Cryptographic privacy shields and DPDP compliance verification network.',
        tags: ['Solidity', 'Zero-Knowledge', 'Web3'],
        link: 'https://github.com/developer'
      },
      {
        title: 'LMS User Management',
        description: 'Enterprise educational database matrices with granular access-control credentials.',
        tags: ['React', 'PostgreSQL', 'Docker'],
        link: 'https://github.com/developer'
      },
      {
        title: 'Developer Portfolio Engine',
        description: '3D holographic developer workspaces rendering WebGL code viewports.',
        tags: ['Three.js', 'WebGL', 'Tailwind'],
        link: 'https://github.com/developer'
      }
    ]
  };
  const rendered = TemplateRegistry.render('apogee-spatial', demoData);
  let content = siteGenerator.injectPreviewWatermark(typeof rendered === 'string' ? rendered : (rendered?.html || ''), false, 'apogee-spatial');
  res.type('html').send(content);
});

app.get(['/slush', '/slush-portfolio', '/slush-sticker'], (req, res) => {
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; frame-ancestors *;");
  res.sendFile(getPagePath('slush.html'));
});

app.get(['/profile', '/settings', '/account'], AuthMiddleware.requirePageAuth, (req, res) => {
  res.sendFile(getPagePath('profile.html'));
});

app.get(['/terms', '/tos', '/terms-of-service'], (req, res) => {
  res.sendFile(getPagePath('terms.html'));
});

app.get(['/privacy', '/privacy-policy'], (req, res) => {
  res.sendFile(getPagePath('privacy.html'));
});

app.get(['/refund', '/refunds', '/cancellation', '/refund-policy', '/cancellation-policy'], (req, res) => {
  res.sendFile(getPagePath('refund.html'));
});

app.get(['/faq', '/faqs', '/takedown', '/deletion-rules', '/help/faq'], (req, res) => {
  res.sendFile(getPagePath('faq.html'));
});

app.get(['/thank-you', '/success'], (req, res) => {
  res.sendFile(getPagePath('thank-you.html'));
});

// Interactive Pricing Lab & Display Preview
app.get(['/pricing-preview', '/pricing-lab', '/pricing-test'], (req, res) => {
  res.sendFile(getPagePath('pricing-preview.html'));
});

// Founder Details Demo Showcase
app.get(['/demo-founder', '/demo-founder-section'], (req, res) => {
  res.sendFile(getPagePath('demo-founder.html'));
});

// New SEO Pages: About & Contact
app.get(['/about', '/about-us', '/our-story'], (req, res) => {
  res.sendFile(getPagePath('about.html'));
});

app.get(['/contact', '/contact-us', '/support'], (req, res) => {
  res.sendFile(getPagePath('contact.html'));
});

// Admin Panel
app.get(['/admin', '/admin.html'], AuthMiddleware.requirePageAdmin, (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.sendFile(getPagePath('admin.html'));
});

// Contact Form API — accepts form submissions from /contact page (hardened with body size, honeypot, IP rate limit)
app.post(
  '/api/contact',
  SecurityMiddleware.limitBodySize(50 * 1024),
  SecurityMiddleware.botTrap(undefined, { silentSuccess: true, successMessage: 'Thank you! We will respond within 24 hours.' }),
  contactIpLimiter,
  async (req, res) => {
    try {
      const { name, email, type, message } = req.body || {};
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(email).trim())) {
        return res.status(400).json({ error: 'Invalid email address format.' });
      }

      const safeName = TemplateHelper.escapeHtml(String(name).trim().substring(0, 100));
      const safeEmail = TemplateHelper.escapeHtml(String(email).trim().substring(0, 100));
      const safeMessage = TemplateHelper.escapeHtml(String(message).trim().substring(0, 5000));
      const safeType = TemplateHelper.escapeHtml(String(type || 'general').trim().substring(0, 50));

      // Strictly logged and delivered to internal platform support, never client-supplied recipients
      console.log(`[CONTACT FORM] ${new Date().toISOString()} | ${safeType} | ${safeName} <${safeEmail}>: ${safeMessage.substring(0, 100)}`);
      
      if (emailService) {
        const supportEmail = process.env.SUPPORT_EMAIL || 'support@myfolio.tech';
        await emailService.sendMail({
          to: supportEmail,
          replyTo: String(email).trim(),
          subject: `[Support Inquiry] ${safeType}: ${safeName}`,
          text: `From: ${safeName} <${safeEmail}>\nType: ${safeType}\n\nMessage:\n${safeMessage}`,
          meta: { sequence_type: 'platform_support' }
        }).catch(err => console.warn('[CONTACT EMAIL ERROR]', err.message));
      }

      res.json({ success: true, message: 'Thank you! We will respond within 24 hours.' });
    } catch (err) {
      console.error('[CONTACT] Error:', err);
      res.status(500).json({ error: 'Failed to process contact form.' });
    }
  }
);

// ==========================================
// Authentication REST API Endpoints
// ==========================================

// 1. Sign Up (Initiates 6-character alphanumeric OTP verification)
app.post(
  '/api/auth/signup',
  SecurityMiddleware.limitBodySize(50 * 1024),
  authLimiter,
  (req, res) => authHandler.signup(req, res)
);

// 1b. Verify Sign Up OTP (Creates account only if OTP matches)
app.post(
  '/api/auth/verify-signup-otp',
  SecurityMiddleware.limitBodySize(50 * 1024),
  authLimiter,
  (req, res) => authHandler.verifySignupOtp(req, res)
);

// 1c. Resend Sign Up OTP
app.post(
  '/api/auth/resend-signup-otp',
  SecurityMiddleware.limitBodySize(50 * 1024),
  authLimiter,
  (req, res) => authHandler.resendSignupOtp(req, res)
);

// 2. Sign In (with Progressive Delays on Failed Attempts)
app.post(
  '/api/auth/login',
  SecurityMiddleware.limitBodySize(50 * 1024),
  authLimiter,
  (req, res) => authHandler.login(req, res)
);

// 2b. Social Sign In & Sign Up (Google & GitHub)
app.post(
  '/api/auth/social',
  SecurityMiddleware.limitBodySize(50 * 1024),
  authLimiter,
  (req, res) => authHandler.social(req, res)
);

// 2c. Google OAuth 2.0 Account Chooser Redirect & Callback Flow
app.get(
  '/api/auth/google',
  (req, res) => authHandler.googleRedirect(req, res)
);

app.get(
  '/api/auth/google/callback',
  (req, res) => authHandler.googleCallback(req, res)
);

// 2d. GitHub OAuth 2.0 Authorization & Callback Flow
app.get(
  '/api/auth/github',
  (req, res) => authHandler.githubRedirect(req, res)
);

app.get(
  '/api/auth/github/callback',
  (req, res) => authHandler.githubCallback(req, res)
);

// 2d. Google OAuth 2.0 Identity Services Config & Token Verification
app.get(
  '/api/auth/google/config',
  (req, res) => authHandler.getGoogleConfig(req, res)
);

app.post(
  '/api/auth/google/verify',
  SecurityMiddleware.limitBodySize(50 * 1024),
  authLimiter,
  (req, res) => authHandler.googleVerify(req, res)
);

// 3. Sign Out (Destroys DB session & Clears HttpOnly Cookie)
app.post(
  '/api/auth/logout',
  AuthMiddleware.requireAuth,
  (req, res) => authHandler.logout(req, res)
);

// 4. Current Authenticated Profile
app.get(
  ['/api/auth/me', '/api/user/profile'],
  AuthMiddleware.requireAuth,
  (req, res) => authHandler.getMe(req, res)
);

// 4b. Update Profile (Display Name & Custom URL Identifier / Username)
app.post(
  '/api/auth/profile',
  AuthMiddleware.requireAuth,
  SecurityMiddleware.limitBodySize(50 * 1024),
  (req, res) => authHandler.updateProfile(req, res)
);

app.put(
  '/api/auth/profile',
  AuthMiddleware.requireAuth,
  SecurityMiddleware.limitBodySize(50 * 1024),
  (req, res) => authHandler.updateProfile(req, res)
);

// 5. Active Sessions & Device Management (Security Settings)
app.get(
  '/api/auth/sessions',
  AuthMiddleware.requireAuth,
  (req, res) => authHandler.getSessions(req, res)
);

// 6. Revoke Specific Active Session
app.delete(
  '/api/auth/sessions/:id',
  AuthMiddleware.requireAuth,
  (req, res) => authHandler.revokeSession(req, res)
);

// 7. Revoke All Other Active Sessions ("Log out of all devices")
app.delete(
  '/api/auth/sessions/all',
  AuthMiddleware.requireAuth,
  (req, res) => authHandler.revokeAllOtherSessions(req, res)
);

// 8. Secure Account Deletion (Re-authentication required)
app.post(
  '/api/auth/delete-account',
  AuthMiddleware.requireAuth,
  SecurityMiddleware.limitBodySize(50 * 1024),
  (req, res) => authHandler.deleteAccount(req, res)
);

// 9. Forgot Password (Anti-Enumeration Generic Response)
app.post(
  '/api/auth/forgot-password',
  SecurityMiddleware.limitBodySize(50 * 1024),
  authLimiter,
  (req, res) => authHandler.forgotPassword(req, res)
);

// 10. Reset Password (Single-use Token Hash Validation)
app.post(
  '/api/auth/reset-password',
  SecurityMiddleware.limitBodySize(50 * 1024),
  authLimiter,
  (req, res) => authHandler.resetPassword(req, res)
);

// 11. Email Verification
app.post(
  '/api/auth/verify-email',
  SecurityMiddleware.limitBodySize(50 * 1024),
  (req, res) => authHandler.verifyEmail(req, res)
);

// ==========================================
// Admin Panel Endpoints & Manual Overrides (Protected with requireAdmin)
// ==========================================
app.get('/api/admin/overview', AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const stats = await dbService.getAdminOverviewStats();
    const logs = await dbService.getRecentAuditLogs(15);
    res.json({ success: true, stats, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/users', AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    const users = await dbService.getAllAdminUsers(100);
    res.json({ success: true, users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/logs', AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const logs = await dbService.getRecentAuditLogs(50);
    res.json({ success: true, logs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/override-grace', AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { userId, extraDays = 5, adminId = 'admin', reason = 'Support override' } = req.body;
    const result = await lifecycleService.overrideGracePeriod(userId, extraDays, adminId, reason);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/force-restore', AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { userId, adminId = 'admin', reason = 'Admin manual restore' } = req.body;
    const result = await lifecycleService.forceRestoreAccount(userId, adminId, reason);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/force-takedown', AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { userId, adminId = 'admin', reason = 'TOS violation' } = req.body;
    const result = await lifecycleService.forceTakedownAccount(userId, adminId, reason);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/admin/violations', AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const violations = await dbService.getTosViolations(50);
    res.json({ success: true, violations });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/admin/lifecycle/trigger-email-cycle', AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    console.log('[ADMIN] Manual trigger of lifecycle & email automation cycle requested by admin');
    const results = await lifecycleService.runLifecycleCycle();
    await dbService.recordAuditLog({
      admin_identifier: req.user?.email || req.adminIdentifier || 'admin',
      action: 'manual_email_automation_cycle',
      reason: 'Admin triggered lifecycle email sequence run',
      details: results
    });
    res.json({ success: true, results });
  } catch (err) {
    console.error('[ADMIN] Error running manual email cycle:', err);
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// User Dashboard Endpoint (Protected against IDOR - Derived strictly from server session)
// ==========================================
app.get('/api/web/dashboard', AuthMiddleware.requireAuth, async (req, res) => {
  try {
    // Strictly derive target userId from trusted server session (IDOR Defense)
    const targetUserId = req.user.id;
    const data = await dbService.getUserDashboardData(targetUserId);
    if (!data || !data.user) {
      return res.status(404).json({ error: 'User dashboard not found' });
    }

    res.json({ success: true, ...data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Cross-Device Portfolio Synchronization API (Phone, Laptop, Tablet Sync)
// ==========================================
app.get('/api/user/portfolios', AuthMiddleware.requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const userId = user.id;
    const userEmail = (user.email || '').toLowerCase().trim();
    const isFounder = userEmail === 'abdulaziznoor9876@gmail.com';

    const portfolios = [];
    const seenSiteIds = new Set();
    const sitesBaseDir = path.join(process.cwd(), 'public', 'sites');

    // 1. Fetch from client_sites database table
    if (dbService?.client) {
      try {
        const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        let targetUserId = isUuid(userId) ? userId : null;
        if (!targetUserId && isFounder) {
          try {
            const { data: founderRecord } = await dbService.client.from('users').select('id').eq('email', 'abdulaziznoor9876@gmail.com').maybeSingle();
            if (founderRecord?.id && isUuid(founderRecord.id)) {
              targetUserId = founderRecord.id;
            }
          } catch (e) {}
        }

        if (targetUserId) {
          const { data: dbClientSites, error: csErr } = await dbService.client
            .from('client_sites')
            .select('*')
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false });

          if (csErr) {
            console.warn('[API] /api/user/portfolios client_sites error:', csErr.message);
          }

          if (dbClientSites && Array.isArray(dbClientSites)) {
            for (const s of dbClientSites) {
              const sid = s.provider_site_id || s.id;
              if (sid && !seenSiteIds.has(sid)) {
                seenSiteIds.add(sid);
                const metaPath = path.join(sitesBaseDir, sid, 'meta.json');
                const profilePath = path.join(sitesBaseDir, sid, 'profile.json');
                let meta = {};
                let prof = {};
                if (fs.existsSync(metaPath)) {
                  try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (e) {}
                }
                if (fs.existsSync(profilePath)) {
                  try { prof = JSON.parse(fs.readFileSync(profilePath, 'utf8')); } catch (e) {}
                }
                const isClientPaid = Boolean(meta.isPaid || s.is_paid || s.status === 'paid' || isFounder || user.subscription_status === 'active' || user.role === 'pro');
                const clientPlan = meta.plan || (isFounder ? 'pro' : (s.plan || (user.subscription_status === 'active' || user.role === 'pro' ? 'pro' : (isClientPaid ? 'starter' : 'preview'))));
                
                const derivedHandle = meta.handle || s.custom_domain?.split('.')[0] || sid.split('-')[0] || user.username || 'developer';
                const derivedName = meta.developerName || prof.name || (derivedHandle ? derivedHandle.charAt(0).toUpperCase() + derivedHandle.slice(1) : user.name) || 'Developer';
                const derivedRole = meta.developerRole || prof.role || prof.title || 'Software Engineer';
                
                let resolvedUniverse = meta.universeKey || meta.templateId || null;
                const clientIndexPath = path.join(sitesBaseDir, sid, 'index.html');
                if ((!resolvedUniverse || resolvedUniverse === 'jack-3d-creator') && fs.existsSync(clientIndexPath)) {
                  try {
                    const sampleHtml = fs.readFileSync(clientIndexPath, 'utf8');
                    const detected = detectTemplateFromHtml(sampleHtml);
                    if (detected && detected !== 'jack-3d-creator') {
                      resolvedUniverse = detected;
                      meta.universeKey = detected;
                      meta.templateId = detected;
                      try { fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8'); } catch (e) {}
                    }
                  } catch (e) {}
                }
                if (!resolvedUniverse) resolvedUniverse = 'jack-3d-creator';

                portfolios.push({
                  siteId: sid,
                  handle: derivedHandle,
                  subdomain: s.custom_domain || meta.subdomain || null,
                  previewUrl: `/p/${sid}`,
                  universeKey: resolvedUniverse,
                  templateId: resolvedUniverse,
                  developerName: derivedName,
                  developerRole: derivedRole,
                  projectsCount: meta.projectsCount || prof.projects?.length || 6,
                  timestamp: meta.timestamp || (s.created_at ? new Date(s.created_at).getTime() : Date.now()),
                  isPaid: isClientPaid,
                  plan: clientPlan
                });
              }
            }
          }
        }
      } catch (e) {
        console.warn('[API] /api/user/portfolios dbClientSites error:', e.message);
      }
    }

    // 2. Scan public/sites/ directory for sites belonging to this user
    if (fs.existsSync(sitesBaseDir)) {
      try {
        const dirs = fs.readdirSync(sitesBaseDir, { withFileTypes: true });
        for (const dir of dirs) {
          if (!dir.isDirectory()) continue;
          const sid = dir.name;
          if (seenSiteIds.has(sid)) continue;

          const metaPath = path.join(sitesBaseDir, sid, 'meta.json');
          const profilePath = path.join(sitesBaseDir, sid, 'profile.json');
          let isOwned = false;
          let meta = {};
          let prof = {};

          if (fs.existsSync(metaPath)) {
            try {
              meta = JSON.parse(fs.readFileSync(metaPath, 'utf8'));
              if (meta.userId === userId || (meta.userEmail && meta.userEmail.toLowerCase() === userEmail)) {
                isOwned = true;
              }
            } catch (e) {}
          }

          if (!isOwned && fs.existsSync(profilePath)) {
            try {
              prof = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
              const profEmail = (prof.email || prof.contact?.email || '').toLowerCase().trim();
              if (profEmail && profEmail === userEmail) {
                isOwned = true;
              }
            } catch (e) {}
          }

          if (!isOwned && isFounder) {
            // Any site in public/sites on the founder's instance without a different user ID belongs to the founder
            if (!meta.userId || meta.userId === userId || meta.userId === 'abdulaziz_founder') {
              isOwned = true;
            }
          }

          const indexPath = path.join(sitesBaseDir, sid, 'index.html');
          if (isOwned && fs.existsSync(indexPath)) {
            seenSiteIds.add(sid);

            // Extract developerName and developerRole from index.html if not present in meta or prof
            if (!meta.developerName || meta.developerName === 'Developer') {
              try {
                const htmlHead = fs.readFileSync(indexPath, 'utf8').slice(0, 4000);
                const titleMatch = htmlHead.match(/<title>([^<]+)<\/title>/i);
                if (titleMatch && titleMatch[1]) {
                  const parts = titleMatch[1].split(/[|—–-]/).map(s => s.trim());
                  if (parts[0] && parts[0] !== 'MyFolio') meta.developerName = parts[0];
                  if (parts[1]) meta.developerRole = parts[1];
                }
              } catch (e) {}
            }

            let mtime = Date.now();
            try {
              mtime = fs.statSync(indexPath).mtimeMs;
            } catch (e) {}

            const isLocalPaid = Boolean(meta.isPaid || isFounder || user.subscription_status === 'active' || user.role === 'pro');
            const localPlan = meta.plan || (isFounder ? 'pro' : (user.subscription_status === 'active' || user.role === 'pro' ? 'pro' : (isLocalPaid ? 'starter' : 'preview')));

            let resolvedUniverse = meta.universeKey || meta.templateId || null;
            if ((!resolvedUniverse || resolvedUniverse === 'jack-3d-creator') && fs.existsSync(indexPath)) {
              try {
                const sampleHtml = fs.readFileSync(indexPath, 'utf8');
                const detected = detectTemplateFromHtml(sampleHtml);
                if (detected && detected !== 'jack-3d-creator') {
                  resolvedUniverse = detected;
                  meta.universeKey = detected;
                  meta.templateId = detected;
                }
              } catch (e) {}
            }
            if (!resolvedUniverse) resolvedUniverse = 'jack-3d-creator';

            const portfolioItem = {
              siteId: sid,
              handle: meta.handle || (isFounder ? 'abdulaziz' : (user.username || 'developer')),
              subdomain: meta.subdomain || (isFounder ? `${user.username || 'abdulaziz'}.myfolio.tech` : null),
              previewUrl: `/p/${sid}`,
              universeKey: resolvedUniverse,
              templateId: resolvedUniverse,
              developerName: meta.developerName || prof.name || user.name || 'Developer',
              developerRole: meta.developerRole || prof.role || prof.title || 'Software Engineer',
              projectsCount: meta.projectsCount || prof.projects?.length || 6,
              timestamp: meta.timestamp || mtime,
              isPaid: isLocalPaid,
              plan: localPlan
            };

            // Save back updated meta.json so future loads are instant
            try {
              fs.writeFileSync(metaPath, JSON.stringify({
                ...portfolioItem,
                userId: isFounder ? 'abdulaziz_founder' : userId,
                userEmail: userEmail
              }, null, 2), 'utf8');
            } catch (e) {}

            portfolios.push(portfolioItem);
          }
        }
      } catch (e) {}
    }

    portfolios.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

    res.json({ success: true, portfolios });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/user/portfolios/sync', AuthMiddleware.requireAuth, async (req, res) => {
  try {
    const user = req.user;
    const userId = user.id;
    const userEmail = (user.email || '').toLowerCase().trim();
    const isFounder = userEmail === 'abdulaziznoor9876@gmail.com';
    const items = Array.isArray(req.body?.portfolios) ? req.body.portfolios : (Array.isArray(req.body?.items) ? req.body.items : (req.body?.item ? [req.body.item] : []));

    const sitesBaseDir = path.join(process.cwd(), 'public', 'sites');

    for (const item of items) {
      if (!item || !item.siteId) continue;
      const sid = item.siteId;
      const siteDir = path.join(sitesBaseDir, sid);

      if (!fs.existsSync(siteDir)) {
        fs.mkdirSync(siteDir, { recursive: true });
      }

      const metaPath = path.join(siteDir, 'meta.json');
      let existingMeta = {};
      if (fs.existsSync(metaPath)) {
        try { existingMeta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (e) {}
      }
      const meta = {
        ...existingMeta,
        siteId: sid,
        handle: item.handle || (isFounder ? 'abdulaziz' : (user.username || 'developer')),
        subdomain: item.subdomain || (isFounder ? `${user.username || 'abdulaziz'}.myfolio.tech` : null),
        universeKey: item.universeKey || 'jack-3d-creator',
        developerName: item.developerName || user.name || 'Developer',
        developerRole: item.developerRole || 'Software Engineer',
        projectsCount: item.projectsCount || 6,
        timestamp: item.timestamp || Date.now(),
        userId: isFounder ? 'abdulaziz_founder' : userId,
        userEmail: userEmail
      };
      fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), 'utf8');

      if (dbService?.client) {
        try {
          await dbService.client.from('sites').upsert({
            provider_site_id: sid,
            custom_domain: item.subdomain || null,
            user_id: isFounder ? 'abdulaziz_founder' : userId,
            status: 'active',
            updated_at: new Date().toISOString()
          });
        } catch (e) {}

        try {
          await dbService.client.from('client_sites').upsert({
            provider_site_id: sid,
            custom_domain: item.subdomain || null,
            user_id: isFounder ? 'abdulaziz_founder' : userId,
            status: 'active',
            updated_at: new Date().toISOString()
          });
        } catch (e) {}
      }
    }

    res.json({ success: true, syncedCount: items.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Pro Portfolio: Contact Lead & Analytics Beacon (hardened with body size, honeypot, IP limit, site limit, recipient lockdown)
app.post(
  '/api/sites/:siteId/contact',
  SecurityMiddleware.limitBodySize(50 * 1024),
  SecurityMiddleware.botTrap(undefined, { silentSuccess: true, successMessage: 'Message delivered directly to creator!' }),
  contactIpLimiter,
  contactSiteLimiter,
  async (req, res) => {
    try {
      const { siteId } = req.params;
      const { name, email, message, subject } = req.body || {};

      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required.' });
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(String(email).trim())) {
        return res.status(400).json({ error: 'Invalid email address format.' });
      }

      // Record lead in analytics events
      await dbService.recordAnalyticsEvent(siteId, 'contact_submit', null, null, {
        name: String(name).substring(0, 100),
        email: String(email).substring(0, 100),
        subject: subject ? String(subject).substring(0, 200) : null
      });

      const siteDir = path.join(process.cwd(), 'public', 'sites', siteId);

      // Send direct email notification to the verified portfolio owner ONLY
      let ownerEmail = null;
      let ownerName = 'Portfolio Creator';

      // A. Lookup from database by provider_site_id or custom_domain
      try {
        if (dbService?.client) {
          const { data: siteRecord } = await dbService.client
            .from('sites')
            .select('*, users(*)')
            .or(`provider_site_id.eq.${siteId},custom_domain.eq.${siteId}`)
            .limit(1)
            .maybeSingle();
          if (siteRecord?.users?.email) {
            ownerEmail = siteRecord.users.email;
            ownerName = siteRecord.users.name || siteRecord.users.username || ownerName;
          }
        }
      } catch (e) {}

      // B. Lookup from siteDir meta.json (saved at portfolio generation)
      if (!ownerEmail && fs.existsSync(path.join(siteDir, 'meta.json'))) {
        try {
          const meta = JSON.parse(fs.readFileSync(path.join(siteDir, 'meta.json'), 'utf8'));
          if (meta.userEmail) ownerEmail = meta.userEmail;
          if (meta.developerName) ownerName = meta.developerName;
        } catch (e) {}
      }

      // C. Lookup from siteDir profile.json fallback
      if (!ownerEmail && fs.existsSync(path.join(siteDir, 'profile.json'))) {
        try {
          const profile = JSON.parse(fs.readFileSync(path.join(siteDir, 'profile.json'), 'utf8'));
          ownerEmail = profile.email || profile.identity?.email || profile.contact?.email;
          ownerName = profile.name || profile.identity?.name || ownerName;
        } catch (e) {}
      }

      // Recipient Lockdown: recipient MUST be the verified owner of the site.
      // Under no circumstances can client specify recipient email.
      if (!ownerEmail) {
        return res.status(404).json({ error: 'Portfolio creator contact channel unavailable.' });
      }

      if (emailService) {
        const safeOwnerName = TemplateHelper.escapeHtml(ownerName || 'Portfolio Creator');
        const safeName = TemplateHelper.escapeHtml(String(name).trim().substring(0, 100));
        const safeEmail = TemplateHelper.escapeHtml(String(email).trim().substring(0, 100));
        const safeSubject = subject ? TemplateHelper.escapeHtml(String(subject).trim().substring(0, 200)) : '';
        const safeMessage = TemplateHelper.escapeHtml(String(message).trim().substring(0, 5000));
        const mailtoEmail = encodeURIComponent(String(email).trim());
        const mailtoSubject = encodeURIComponent(`Re: Portfolio Inquiry${safeSubject ? ` - ${safeSubject}` : ''}`);
        const mailtoReplyName = safeName;

        await emailService.sendMail({
          to: ownerEmail,
          replyTo: String(email).trim(),
          subject: `📬 New Inquiry from your Portfolio: ${safeName}`,
          html: `
            <div style="font-family: system-ui, -apple-system, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; background: #0B0F19; color: #FFFFFF; border-radius: 16px; border: 1px solid rgba(255,255,255,0.15);">
              <div style="font-size: 0.85rem; color: #38BDF8; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 8px;">Portfolio Lead Alert</div>
              <h2 style="color: #FFFFFF; margin: 0 0 16px 0; font-size: 1.5rem;">📬 New Message from your Portfolio</h2>
              <p style="color: #94A3B8; font-size: 0.95rem; line-height: 1.5;">Hi <strong>${safeOwnerName}</strong>, someone just reached out to you through your online portfolio!</p>
              
              <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 12px; margin: 24px 0; border-left: 4px solid #38BDF8;">
                <p style="margin: 0 0 10px 0; font-size: 0.95rem;"><strong>From / Recruiter:</strong> ${safeName}</p>
                <p style="margin: 0 0 10px 0; font-size: 0.95rem;"><strong>Email:</strong> <a href="mailto:${mailtoEmail}" style="color: #38BDF8; text-decoration: none;">${safeEmail}</a></p>
                ${safeSubject ? `<p style="margin: 0 0 10px 0; font-size: 0.95rem;"><strong>Subject:</strong> ${safeSubject}</p>` : ''}
                <p style="margin: 0 0 6px 0; font-size: 0.95rem;"><strong>Message:</strong></p>
                <p style="margin: 0; color: #E2E8F0; white-space: pre-wrap; font-size: 0.95rem; line-height: 1.6; background: rgba(0,0,0,0.25); padding: 12px; border-radius: 8px;">${safeMessage}</p>
              </div>
              
              <div style="text-align: center; margin-top: 24px;">
                <a href="mailto:${mailtoEmail}?subject=${mailtoSubject}" style="display: inline-block; background: #22C55E; color: #000000; font-weight: 800; font-size: 0.95rem; padding: 12px 28px; border-radius: 9999px; text-decoration: none; box-shadow: 0 4px 14px rgba(34,197,94,0.4);">
                  Reply Directly to ${mailtoReplyName} ➔
                </a>
              </div>
            </div>
          `,
          meta: { sequence_type: 'portfolio_contact_lead' }
        });
      }

      res.json({ success: true, message: 'Message delivered directly to creator!' });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

app.post('/api/sites/:siteId/analytics', async (req, res) => {
  try {
    const { siteId } = req.params;
    const { eventType = 'page_view', visitorHash = null, referrer = null } = req.body;
    await dbService.recordAnalyticsEvent(siteId, eventType, visitorHash, referrer);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ==========================================
// Clean Semantic Routes (Extensionless URLs)
// ==========================================
const webDir = path.join(process.cwd(), 'web');

// =========================================================================
// GITHUB AUTO-SYNC & RECONCILIATION ENGINE ROUTES
// =========================================================================

// Stale-While-Revalidate (SWR): Trigger background GitHub reconciliation check when a site is viewed
app.use('/sites/:siteId', (req, res, next) => {
  const siteId = req.params.siteId;
  if (siteId && gitHubAutoSync) {
    gitHubAutoSync.triggerBackgroundSyncIfDue(siteId);
  }
  next();
});

// Real-Time GitHub Webhook Ingestion Endpoint
app.post('/api/webhooks/github', express.json({ type: 'application/json' }), async (req, res) => {
  try {
    const event = req.headers['x-github-event'] || 'push';
    const result = await gitHubAutoSync.handleWebhook(event, req.body);
    return res.status(200).json(result);
  } catch (err) {
    console.error('[GITHUB WEBHOOK HANDLER ERROR]:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Manual 1-Click Sync Endpoint for Dashboard / Studio
app.post('/api/portfolio/:siteId/sync-github', async (req, res) => {
  try {
    const siteId = req.params.siteId;
    const result = await gitHubAutoSync.syncPortfolio(siteId, { force: true });
    return res.status(200).json(result);
  } catch (err) {
    console.error('[MANUAL GITHUB SYNC ERROR]:', err);
    return res.status(500).json({ error: err.message });
  }
});

// Direct Portfolio Web Hosting Route (serves both persistent public/sites and serverless /tmp/sites)
app.use('/sites', express.static(path.join(process.cwd(), 'public', 'sites')));
app.use('/sites', express.static(path.join(require('os').tmpdir(), 'sites')));

// Dedicated Service Worker Route (Scoped to root '/', always revalidated)
app.get('/service-worker.js', (req, res) => {
  const swPath = path.join(webDir, 'service-worker.js');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Service-Worker-Allowed', '/');
  res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
  res.sendFile(swPath);
});

// Serve Static Web Assets with HTTP Cache-Control (7 days for JS/CSS/images/fonts, 0s for dynamic HTML)
app.use(express.static(webDir, {
  extensions: ['html'],
  maxAge: '7d',
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('service-worker.js')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      res.setHeader('Service-Worker-Allowed', '/');
    } else if (filePath.endsWith('.html') || filePath.includes('spatial-realtime-engine')) {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (/\.(css|js)$/i.test(filePath) && !filePath.includes(path.sep + 'assets' + path.sep)) {
      // Root CSS and JS must revalidate so clients immediately receive styling and navigation updates
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?|ttf|eot|webp|glb|gltf|bin|wasm)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, s-maxage=31536000, immutable');
    }
  }
}));

// Dedicated Local Design Lab Prototype Environment (Visual Approval Mode)
app.get(['/design-preview', '/design-preview/*'], (req, res) => {
  const reqPath = req.params[0] || '';
  const cleanPath = reqPath.replace(/^\/+|\/+$/g, '');
  if (cleanPath) {
    const directFile = path.join(webDir, 'design-preview', cleanPath);
    const htmlFile = path.join(webDir, 'design-preview', `${cleanPath}.html`);
    if (fs.existsSync(directFile) && fs.statSync(directFile).isFile()) {
      return res.sendFile(directFile);
    }
    if (fs.existsSync(htmlFile) && fs.statSync(htmlFile).isFile()) {
      return res.sendFile(htmlFile);
    }
  }
  res.sendFile(path.join(webDir, 'design-preview', 'index.html'));
});

// ==========================================
// Portfolio Owner Resume PDF Download Route
// ==========================================
app.get(['/p/:siteId/resume.pdf', '/api/sites/:siteId/resume.pdf'], async (req, res) => {
  const siteId = req.params.siteId;
  const sitesBaseDir = path.join(process.cwd(), 'public', 'sites');

  if (!siteId || !/^[a-zA-Z0-9_-]+$/.test(siteId) || !securityService.isPathSafe(sitesBaseDir, siteId)) {
    return res.status(400).send('Invalid portfolio identifier.');
  }

  const siteDir = path.join(sitesBaseDir, siteId);
  const pdfPath = path.join(siteDir, 'resume.pdf');
  const profilePath = path.join(siteDir, 'profile.json');

  let profile = {};
  if (fs.existsSync(profilePath)) {
    try {
      profile = JSON.parse(fs.readFileSync(profilePath, 'utf8'));
    } catch (e) {}
  }

  const candidateName = profile.name || 'Candidate';
  const sanitizedFileName = `${candidateName.replace(/[^a-zA-Z0-9_-]/g, '_')}_Resume.pdf`;

  if (fs.existsSync(pdfPath)) {
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);
    return fs.createReadStream(pdfPath).pipe(res);
  }

  try {
    const { ResumePdfGenerator } = require('./services/resume-pdf-generator');
    const pdfBuf = await ResumePdfGenerator.generateResumePdfBuffer(profile);
    fs.mkdirSync(siteDir, { recursive: true });
    fs.writeFileSync(pdfPath, pdfBuf);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedFileName}"`);
    return res.send(pdfBuf);
  } catch (err) {
    console.error('[PDF] Generation error:', err);
    return res.status(500).send('Failed to generate resume PDF.');
  }
});

// Dynamic Avatar Route for Subdomains and Direct Resolution
app.get(['/avatar.png', '/sites/:handle/avatar.png', '/u/:handle/avatar.png'], (req, res, next) => {
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '').split(':')[0].toLowerCase();
  let handle = req.params.handle;
  if (!handle) {
    if (host.includes('abdulaziz') || host.includes('noor') || host.includes('aziz')) {
      handle = 'abdulaziz';
    } else if (customDomainService) {
      handle = customDomainService.resolveHostname(host);
    }
  }
  if (!handle) handle = 'abdulaziz';

  const siteDir = resolveSafeSiteDir(handle);
  const candidates = [
    path.join(siteDir, 'avatar.png'),
    path.join(process.cwd(), 'public', 'sites', handle, 'avatar.png'),
    path.join(process.cwd(), 'public', 'sites', 'abdulaziz', 'avatar.png')
  ];

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.sendFile(c);
    }
  }

  // Resilient fallback: redirect to candidate GitHub avatar
  const ghHandle = (handle === 'abdulaziz' || handle === 'aziz') ? 'Abdul-Aziz-Nooruddin' : handle;
  if (ghHandle && !ghHandle.startsWith('web-')) {
    return res.redirect(`https://github.com/${ghHandle}.png`);
  }
  next();
});

// Dynamic Vanity Direct Route: Redirect /abdulaziz or any /:handle to its dedicated subdomain https://<handle>.myfolio.tech/
app.get(['/abdulaziz', '/u/abdulaziz', '/aziz', '/u/aziz', '/u/:handle', '/:handle([a-zA-Z0-9_-]{2,32})'], async (req, res, next) => {
  let handle = (req.params.handle || (req.path.startsWith('/u/') ? req.path.slice(3) : req.path.slice(1))).toLowerCase().trim();
  const reservedPaths = [
    'api', 'sites', 'assets', 'p', 'u', 'login', 'signin', 'signup', 'register',
    'auth', 'dashboard', 'app', 'dash', 'studio', 'webstudio', 'builder', 'generator',
    'profile', 'settings', 'account', 'privacy', 'privacy-policy', 'terms', 'tos',
    'terms-of-service', 'about', 'about-us', 'our-story', 'contact', 'contact-us',
    'support', 'webhook', 'thank-you', 'success', 'design-demo', 'universes', 'themes', 'gallery',
    'subscribe', 'pricing', 'checkout', 'payment', 'health', 'healthz', 'status', 'docs', 'faq', 'index'
  ];
  if (!handle || reservedPaths.includes(handle)) {
    return next();
  }

  // 1. When embedded in an iframe or requested with embed query, serve directly on same origin
  let siteId = (handle === 'aziz') ? 'abdulaziz' : handle;
  let html = await hostingProvider.getSiteHtml(siteId);
  if (!html && (handle === 'abdulaziz' || handle === 'aziz')) {
    html = await hostingProvider.getSiteHtml('aziz') || await hostingProvider.getSiteHtml('abdulaziz');
  }

  if (req.query.embed === '1' || req.query.preview === '1' || req.headers['sec-fetch-dest'] === 'iframe') {
    if (html) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; frame-ancestors *;");
      return res.send(html);
    }
    // Fallback in iframe: render 404 cleanly inside iframe without redirecting out
    return res.status(200).send(`<!DOCTYPE html><html><body style="background:#050817;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;"><h2>Portfolio Draft Initializing</h2><p style="color:#64748B;">Generate or publish your portfolio in Studio to preview it here.</p></div></body></html>`);
  }

  // 2. Direct web route: If portfolio HTML exists, serve directly at /handle
  if (html) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(html);
  }

  // Local development redirect fallback
  if (req.headers.host && req.headers.host.includes('localhost')) {
    return res.redirect(302, `http://${handle}.localhost:5050/`);
  }

  return res.redirect(301, `https://${handle}.myfolio.tech/`);
});

// VIP Set Active Live Site Endpoint (Protected: Admin Only)
app.post('/api/vip/set-active-site', AuthMiddleware.requireAdmin, async (req, res) => {
  try {
    const { siteId, isVip } = req.body;
    if (!siteId) return res.status(400).json({ error: 'siteId is required' });

    const adminEmails = (process.env.ADMIN_EMAILS || 'abdulaziznoor9876@gmail.com,abdul19388383@gmail.com,abdulaziznooruddin670@gmail.com')
      .split(',')
      .map(e => e.trim().toLowerCase());
    const adminUsernames = (process.env.ADMIN_USERNAMES || 'abdulazizpro1,abdulazizpro,abdul19388383')
      .split(',')
      .map(u => u.trim().toLowerCase());
    const userEmail = (req.user?.email || req.user?.normalized_email || '').toLowerCase().trim();
    const username = (req.user?.username || '').toLowerCase().trim();
    const isAuthorized =
      req.user?.role === 'admin' ||
      req.user?.is_admin === true ||
      (userEmail && adminEmails.includes(userEmail)) ||
      (username && adminUsernames.includes(username));
    if (!isAuthorized) {
      return res.status(403).json({ error: 'Unauthorized. VIP Founder privileges required.' });
    }

    let html = await hostingProvider.getSiteHtml(siteId);
    if (!html) {
      // Cloud ephemeral recovery: if container restarted and snapshot was cleared, dynamically synthesize from template
      const universeKey = req.body.universeKey || 'jack-3d-creator';
      if (universeKey || req.body.developerName) {
        try {
          const { TemplateRegistry } = require('./templates/template-registry');
          const { DEFAULT_FOUNDER_PROFILE } = require('./data/default-founder-profile');
          const tKey = universeKey || 'jack-3d-creator';
          const template = TemplateRegistry.templates[tKey] || Object.values(TemplateRegistry.templates)[0];
          if (template && typeof template.render === 'function') {
            const candidateProfile = {
              ...DEFAULT_FOUNDER_PROFILE,
              name: req.body.developerName || DEFAULT_FOUNDER_PROFILE.name,
              title: req.body.developerRole || DEFAULT_FOUNDER_PROFILE.title,
              role: req.body.developerRole || DEFAULT_FOUNDER_PROFILE.role,
              headline: req.body.developerRole || DEFAULT_FOUNDER_PROFILE.headline
            };
            const rendered = TemplateRegistry.render(universeKey || 'jack-3d-creator', candidateProfile, {});
            html = injectMobileCSS(typeof rendered === 'string' ? rendered : (rendered?.html || ''));
            const siteDir = path.join(process.cwd(), 'public', 'sites', siteId);
            fs.mkdirSync(siteDir, { recursive: true });
            fs.writeFileSync(path.join(siteDir, 'index.html'), html, 'utf8');
          }
        } catch (synthErr) {
          console.warn('[SET ACTIVE SITE] Dynamic synthesis recovery notice:', synthErr.message);
        }
      }
    }

    if (!html) {
      return res.status(404).json({ error: `Target portfolio version "${siteId}" not found.` });
    }

    // Determine target handle from siteId or req.user.username
    let targetHandle = (req.body.handle || '').toLowerCase().trim();
    if (!targetHandle || targetHandle === 'web' || siteId.startsWith('web-')) {
      targetHandle = 'abdulaziz';
    }

    const universeKey = req.body.universeKey || 'jack-3d-creator';
    const targetSubdomain = `${targetHandle}.myfolio.tech`;
    const targetLocalDomain = `${targetHandle}.localhost`;

    // 1. Update customDomainService domainCache
    if (customDomainService) {
      const domainsToUpdate = [
        targetSubdomain,
        targetLocalDomain,
        'abdulaziz.myfolio.tech',
        'aziz.myfolio.tech',
        'abdulaziz.localhost',
        'aziz.localhost'
      ];
      for (const d of domainsToUpdate) {
        customDomainService.domainCache[d] = {
          domain: d,
          handle: 'abdulaziz',
          siteId: siteId,
          universeKey: universeKey || customDomainService.domainCache[d]?.universeKey || 'jack-3d-creator',
          userId: req.user?.id || 'abdulaziz_founder',
          type: 'subdomain',
          status: 'active',
          updatedAt: new Date().toISOString()
        };
      }
      customDomainService.saveCache();
    }

    // 2. Sync to public/sites/abdulaziz and public/sites/aziz
    const handlesToSync = Array.from(new Set(['abdulaziz', 'aziz', targetHandle]));
    for (const h of handlesToSync) {
      const hDir = path.join(process.cwd(), 'public', 'sites', h);
      fs.mkdirSync(hDir, { recursive: true });
      fs.writeFileSync(path.join(hDir, 'index.html'), html, 'utf8');
    }

    // 3. Update DB if available
    if (dbService?.client) {
      try {
        await dbService.client.from('sites').upsert({
          provider_site_id: siteId,
          custom_domain: 'abdulaziz.myfolio.tech',
          user_id: req.user?.id || 'abdulaziz_founder',
          status: 'active'
        });
      } catch (e) {}
    }

    return res.json({
      success: true,
      siteId,
      handle: 'abdulaziz',
      subdomain: 'abdulaziz.myfolio.tech',
      liveUrl: 'https://abdulaziz.myfolio.tech',
      message: `Active portfolio successfully pointed to ${siteId} on abdulaziz.myfolio.tech`
    });
  } catch (err) {
    console.error('[API] /api/vip/set-active-site error:', err);
    return res.status(500).json({ error: err.message });
  }
});

// ==========================================
// PERMANENT PORTFOLIO DELETION ENDPOINT
// (Supports deletion from User Side and Admin/Founder Side)
// ==========================================
app.delete(['/api/sites/:siteId', '/api/portfolios/:siteId'], AuthMiddleware.requireAuth, async (req, res) => {
  return handlePermanentSiteDelete(req, res);
});

app.post(['/api/sites/:siteId/delete', '/api/portfolios/:siteId/delete'], AuthMiddleware.requireAuth, async (req, res) => {
  return handlePermanentSiteDelete(req, res);
});

async function handlePermanentSiteDelete(req, res) {
  try {
    const siteId = (req.params.siteId || req.body.siteId || '').trim();
    if (!siteId) {
      return res.status(400).json({ error: 'siteId parameter is required' });
    }

    // Sanitize siteId to prevent directory traversal
    if (!/^[a-zA-Z0-9_-]+$/.test(siteId)) {
      return res.status(400).json({ error: 'Invalid siteId format' });
    }

    if (siteId === '.' || siteId === '..') {
      return res.status(400).json({ error: 'Cannot delete root directory' });
    }

    // IDOR / BOLA Guard: Verify that caller is either the owner of this site or an administrator
    const ownership = await verifySiteOwnership(req, siteId);
    if (!ownership.allowed) {
      return res.status(ownership.status).json({ error: ownership.error });
    }

    console.log(`[DELETE] Request to permanently purge site: ${siteId} by user: ${req.user?.id}`);

    // 1. Purge from disk and hosting provider
    await hostingProvider.purge(siteId);

    // 2. If this was an active site on customDomainService
    let deletedHandle = '';
    if (siteId.includes('-')) {
      deletedHandle = siteId.split('-')[0].toLowerCase().trim();
    } else {
      deletedHandle = siteId.toLowerCase().trim();
    }

    const subKey = `${deletedHandle}.myfolio.tech`;
    const locKey = `${deletedHandle}.localhost`;

    if (customDomainService && (siteId === deletedHandle || siteId.startsWith(`${deletedHandle}-`) || customDomainService.domainCache[subKey]?.siteId === siteId)) {
      const sitesDir = path.join(process.cwd(), 'public', 'sites');
      let remainingVersions = [];
      if (fs.existsSync(sitesDir)) {
        remainingVersions = fs.readdirSync(sitesDir).filter(f => f.startsWith(`${deletedHandle}-`) && f !== siteId);
        remainingVersions.sort().reverse(); // newest first
      }

      if (remainingVersions.length > 0) {
        const nextActiveId = remainingVersions[0];
        const nextHtml = await hostingProvider.getSiteHtml(nextActiveId);
        if (nextHtml) {
          customDomainService.domainCache[subKey] = {
            domain: subKey,
            handle: deletedHandle,
            siteId: nextActiveId,
            userId: req.user?.id || 'abdulaziz_founder',
            type: 'subdomain',
            status: 'active',
            updatedAt: new Date().toISOString()
          };
          customDomainService.domainCache[locKey] = {
            domain: locKey,
            handle: deletedHandle,
            siteId: nextActiveId,
            userId: req.user?.id || 'abdulaziz_founder',
            type: 'subdomain',
            status: 'active',
            updatedAt: new Date().toISOString()
          };
          customDomainService.saveCache();
          const primaryDir = path.join(sitesDir, deletedHandle);
          fs.mkdirSync(primaryDir, { recursive: true });
          fs.writeFileSync(path.join(primaryDir, 'index.html'), nextHtml, 'utf8');
        }
      } else {
        delete customDomainService.domainCache[subKey];
        delete customDomainService.domainCache[locKey];
        customDomainService.saveCache();
      }
    }

    // 3. Purge from database / conversations if present
    if (dbService?.client) {
      try {
        await dbService.client.from('sites').delete().eq('provider_site_id', siteId);
        await dbService.client.from('client_sites').delete().eq('provider_site_id', siteId);
        await dbService.client.from('client_sites').delete().eq('id', siteId);
      } catch (e) {}
    }

    // 4. Force disk cleanup of public/sites/<siteId>
    try {
      const targetSiteDir = path.join(process.cwd(), 'public', 'sites', siteId);
      if (fs.existsSync(targetSiteDir)) {
        fs.rmSync(targetSiteDir, { recursive: true, force: true });
      }
    } catch (e) {}

    return res.json({
      success: true,
      siteId,
      message: `Portfolio ${siteId} has been permanently deleted.`
    });
  } catch (err) {
    console.error('[API] Permanent site deletion error:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete portfolio' });
  }
}

// ==========================================
// Portfolio Live & Preview Route (/p/:siteId)
// Injects Diagonal Watermark & Floating Bar for Unpaid Previews
// Serves Clean, Pristine Website for Subscribed/Paid Users
// ==========================================

app.get('/p/:siteId', async (req, res) => {
  const siteId = req.params.siteId;
  const sitesBaseDir = path.join(process.cwd(), 'public', 'sites');

  // Strict identifier validation & Path Traversal check
  if (!siteId || !/^[a-zA-Z0-9_-]+$/.test(siteId) || !securityService.isPathSafe(sitesBaseDir, siteId)) {
    return res.status(400).send('Invalid portfolio identifier.');
  }

  // Retrieve site HTML from in-memory draft cache, disk, or Supabase Storage recovery
  const cachedDraftHtml = globalDraftsCache.get(siteId)?.html;
  let html = (cachedDraftHtml && cachedDraftHtml.includes('<body') && cachedDraftHtml.includes('</body>'))
    ? cachedDraftHtml
    : await hostingProvider.getSiteHtml(siteId);

  // VIP Founder Instant Synthesis Fallback: If abdulaziz site is not yet on disk, synthesize on the fly
  if (!html && siteId === 'abdulaziz') {
    try {
      const { TemplateRegistry } = require('./templates/template-registry');
      const { DEFAULT_FOUNDER_PROFILE } = require('./data/default-founder-profile');
      const stealthTemplate = TemplateRegistry.templates['jack-3d-creator'] || Object.values(TemplateRegistry.templates)[0];
      const abdulAzizProfile = { ...DEFAULT_FOUNDER_PROFILE };
      const siteGen = new SiteGenerator();
      const generated = await siteGen.generateSite({ id: 'abdulaziz', status: 'active' }, abdulAzizProfile, { theme: stealthTemplate.id, creative_mode: stealthTemplate.id });
      html = generated.html || generated;
      await hostingProvider.deploy('abdulaziz', html, abdulAzizProfile, true);
    } catch (genErr) {
      console.error('[VIP] Automatic on-the-fly portfolio generation notice:', genErr);
    }
  }

  if (!html) {
    // If siteId is a registered template ID, render a rich live demo showcase on the fly
    const template = TemplateRegistry._templates && TemplateRegistry._templates[siteId];
    if (template) {
      const demoData = {
        name: 'Alex Vance',
        title: `${template.name} Live Showcase`,
        headline: template.description || 'Full-Stack & Distributed Systems Architect',
        role: template.category || 'Lead Engineer',
        bio: `Explore the immersive 3D spatial interface crafted in the ${template.name} theme. Integrating real-time WebGL physics, glassmorphic HUD telemetry, and interactive project showcases.`,
        about: `Senior Systems & Frontend Architect with over 7 years of engineering experience across WebGL, cloud infrastructure, and modern design systems.`,
        skills: ['TypeScript', 'Three.js', 'React', 'Node.js', 'Rust', 'WebGL', 'Docker', 'GraphQL', 'TailwindCSS'],
        projects: [
          {
            title: 'Neural Matrix Visualization',
            name: 'Neural Matrix Visualization',
            description: 'Real-time multi-dimensional neural network topological map with 60 FPS GPU-accelerated node shaders.',
            desc: 'Real-time multi-dimensional neural network topological map with 60 FPS GPU-accelerated node shaders.',
            tags: ['WebGL', 'Three.js', 'TypeScript', 'GLSL'],
            tech: ['WebGL', 'Three.js', 'TypeScript', 'GLSL'],
            link: 'https://github.com/Abdul-Aziz-Nooruddin',
            url: 'https://github.com/Abdul-Aziz-Nooruddin'
          },
          {
            title: 'Algorand Escrow Protocol',
            name: 'Algorand Escrow Protocol',
            description: 'Decentralized multi-signature smart contract settlement architecture with sub-second execution guarantees.',
            desc: 'Decentralized multi-signature smart contract settlement architecture with sub-second execution guarantees.',
            tags: ['Rust', 'Algorand', 'Solidity', 'Web3'],
            tech: ['Rust', 'Algorand', 'Solidity', 'Web3'],
            link: 'https://github.com/Abdul-Aziz-Nooruddin',
            url: 'https://github.com/Abdul-Aziz-Nooruddin'
          },
          {
            title: 'Autonomous Edge Telemetry',
            name: 'Autonomous Edge Telemetry',
            description: 'Distributed IoT sensory streaming platform handling 250k events/second with automated anomaly detection.',
            desc: 'Distributed IoT sensory streaming platform handling 250k events/second with automated anomaly detection.',
            tags: ['Go', 'Kafka', 'Docker', 'Kubernetes'],
            tech: ['Go', 'Kafka', 'Docker', 'Kubernetes'],
            link: 'https://github.com/Abdul-Aziz-Nooruddin',
            url: 'https://github.com/Abdul-Aziz-Nooruddin'
          }
        ],
        experience: [
          {
            company: 'Nexus Cybernetics',
            role: 'Lead Systems Engineer',
            period: '2023 — Present',
            description: 'Architecting next-generation 3D spatial interfaces and microservices for high-frequency telemetry.'
          },
          {
            company: 'Apex Horizon Labs',
            role: 'Senior Full-Stack Developer',
            period: '2021 — 2023',
            description: 'Built real-time collaborative workspace platforms and WebGL data visualization dashboards.'
          }
        ],
        contact: {
          email: 'alex.vance@myfolio.tech',
          github: 'https://github.com/Abdul-Aziz-Nooruddin',
          linkedin: 'https://linkedin.com'
        },
        social: {
          github: 'https://github.com/Abdul-Aziz-Nooruddin',
          linkedin: 'https://linkedin.com'
        }
      };

      try {
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; frame-ancestors *;");
        res.setHeader('X-Content-Type-Options', 'nosniff');
        const rendered = TemplateRegistry.render(template.id || siteId, demoData);
        let htmlOutput = injectMobileCSS(typeof rendered === 'string' ? rendered : (rendered?.html || ''));
        htmlOutput = siteGenerator.injectPreviewWatermark(htmlOutput, false, template.id || siteId);
        hostingProvider.deploy(siteId, htmlOutput, demoData, true).catch(() => {});
        return res.status(200).send(htmlOutput);
      } catch (renderErr) {
        console.error(`[DEMO PREVIEW] Error rendering template ${siteId}:`, renderErr);
        return res.status(500).send('Unable to render live portfolio preview at this time.');
      }
    }

    // Check if site metadata exists in public/sites/<siteId>/meta.json and auto-recover on the fly
    if (!html && (siteId.startsWith('web-') || siteId.includes('-'))) {
      const metaPath = path.join(sitesBaseDir, siteId, 'meta.json');
      const profPath = path.join(sitesBaseDir, siteId, 'profile.json');
      if (fs.existsSync(metaPath) || fs.existsSync(profPath)) {
        try {
          let meta = {};
          let prof = {};
          if (fs.existsSync(metaPath)) {
            try { meta = JSON.parse(fs.readFileSync(metaPath, 'utf8')); } catch (e) {}
          }
          if (fs.existsSync(profPath)) {
            try { prof = JSON.parse(fs.readFileSync(profPath, 'utf8')); } catch (e) {}
          }
          const { TemplateRegistry } = require('./templates/template-registry');
          const uKey = meta.universeKey || 'jack-3d-creator';
          const template = TemplateRegistry.templates[uKey] || TemplateRegistry.templates['jack-3d-creator'] || Object.values(TemplateRegistry.templates)[0];
          if (template) {
            const candidateProfile = {
              name: meta.developerName || prof.name || 'Abdul Aziz Nooruddin',
              title: meta.developerRole || prof.title || 'AI Systems Specialist & Machine Learning Researcher',
              role: meta.developerRole || prof.role || 'AI Systems Specialist',
              bio: prof.bio || 'Building intelligent developer tools, high-performance WebGL interfaces, and scalable backend infrastructure.',
              about: prof.about || 'Lead architect of MyFolio. Full-stack engineer specializing in modern web platforms, 3D spatial computing, and AI-driven automation systems.',
              skills: prof.skills || ['TypeScript', 'JavaScript', 'Node.js', 'Python', 'Three.js', 'WebGL', 'React', 'Docker'],
              projects: prof.projects || [
                {
                  title: 'MyFolio Platform',
                  name: 'MyFolio Platform',
                  description: 'AI-Powered 3D WebGL Portfolio Generation Platform synthesizing GitHub repositories and resumes into bespoke interactive experiences.',
                  tags: ['WebGL', 'Three.js', 'Node.js', 'AI'],
                  url: 'https://myfolio.tech'
                }
              ],
              experience: prof.experience || [],
              contact: prof.contact || { email: meta.userEmail || 'abdulaziznoor9876@gmail.com', github: 'https://github.com/Abdul-Aziz-Nooruddin' },
              social: prof.social || { github: 'https://github.com/Abdul-Aziz-Nooruddin' }
            };
            const rendered = TemplateRegistry.render(uKey, candidateProfile, {});
            const generatedHtml = injectMobileCSS(typeof rendered === 'string' ? rendered : (rendered?.html || ''));
            if (generatedHtml) {
              const targetDir = path.join(sitesBaseDir, siteId);
              fs.mkdirSync(targetDir, { recursive: true });
              fs.writeFileSync(path.join(targetDir, 'index.html'), generatedHtml, 'utf8');
              html = generatedHtml;
            }
          }
        } catch (recoverErr) {
          console.warn('[RECOVERY] Auto-recovery notice for site:', siteId, recoverErr.message);
        }
      }
    }

    // Only render the 24-hour expired page if the site is ACTUALLY older than 24 hours
    const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;
    const parts = siteId.split('-');
    const siteTimestamp = parseInt(parts[parts.length - 1], 10);
    const isActuallyExpired = !isNaN(siteTimestamp) && (Date.now() - siteTimestamp > TWENTY_FOUR_HOURS_MS);

    if (!html && isActuallyExpired) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(renderExpiredPreviewPage());
    }

    // Dynamic on-the-fly synthesis fallback for freshly generated sites on stateless serverless lambdas
    if (!html && !isActuallyExpired) {
      try {
        const rawHandle = parts.slice(0, -1).join('-') || siteId;
        const cleanHandle = rawHandle.replace(/[0-9]/g, '').replace(/[-_]/g, ' ').trim() || 'Creator';
        const capitalizedName = cleanHandle.charAt(0).toUpperCase() + cleanHandle.slice(1);
        const { TemplateRegistry } = require('./templates/template-registry');
        const template = TemplateRegistry.templates['jack-3d-creator'] || Object.values(TemplateRegistry.templates)[0];
        if (template) {
          const onTheFlyProfile = {
            name: capitalizedName,
            title: 'Full-Stack Engineer & Systems Architect',
            role: 'Lead Systems Engineer',
            bio: 'Synthesizing spatial web experiences, distributed architectures, and scalable full-stack applications.',
            about: 'Engineer specializing in modern web platforms, 3D spatial computing, and AI-driven automation systems.',
            skills: ['TypeScript', 'JavaScript', 'Node.js', 'Python', 'Three.js', 'WebGL', 'Docker', 'React'],
            projects: [
              {
                title: 'High-Scale Cloud Platform',
                name: 'High-Scale Cloud Platform',
                description: 'Distributed microservices architecture with real-time streaming telemetry and sub-second latency.',
                tags: ['Node.js', 'TypeScript', 'Docker', 'WebGL'],
                url: 'https://github.com/Abdul-Aziz-Nooruddin'
              }
            ],
            experience: [],
            contact: { email: `${rawHandle}@myfolio.tech`, github: 'https://github.com/Abdul-Aziz-Nooruddin' },
            social: { github: 'https://github.com/Abdul-Aziz-Nooruddin' }
          };
          const rendered = template.render(onTheFlyProfile, {});
          const synthesizedHtml = injectMobileCSS(typeof rendered === 'string' ? rendered : (rendered?.html || ''));
          if (synthesizedHtml) {
            html = synthesizedHtml;
            globalDraftsCache.set(siteId, { html, profile: onTheFlyProfile, timestamp: Date.now() });
            try {
              const targetDir = path.join(sitesBaseDir, siteId);
              if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
              fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf8');
            } catch (e) {}
          }
        }
      } catch (flyErr) {
        console.warn('[ON-THE-FLY] Synthesis notice:', flyErr.message);
      }
    }

    if (!html) {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      return res.status(404).send(TemplateRegistry.render404Page(siteId));
    }
  }

  // Set permissive CSP allowing API beacons, Three.js CDNs, fonts, and iframe/tab embedding
  res.setHeader('Content-Security-Policy', "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:; connect-src *; frame-ancestors *;");
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // html is already populated from hostingProvider.getSiteHtml(siteId) above

  // Record real live visitor telemetry asynchronously (fire-and-forget, never block render)
  try {
    const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
    const visitorHash = crypto.createHash('sha256').update(ip + (req.headers['user-agent'] || '')).digest('hex').substring(0, 16);
    dbService.recordAnalyticsEvent(siteId, 'page_view', visitorHash, req.headers['referer'] || null).catch(() => {});
  } catch (e) {}

  // Check if site is paid (with O(1) in-memory TTL caching, avoiding 400ms DB latency on page reloads)
  const isPaid = await checkSitePaidStatus(siteId);

  if (!isPaid) {
    // If the HTML has old watermark structure, or outdated TEMPLATE branding on a user site, clean it to upgrade
    const { TemplateRegistry } = require('./templates/template-registry');
    const isTemplateShowcase = Boolean(
      siteId && (
        (TemplateRegistry._templates && Object.prototype.hasOwnProperty.call(TemplateRegistry._templates, siteId)) ||
        siteId.startsWith('rbp') || siteId.startsWith('jack') || siteId.startsWith('nadia') || siteId.startsWith('kage') || siteId.startsWith('tom') || siteId.startsWith('apogee')
      )
    );

    const hasOutdatedWatermark = html.includes('watermark-diagonal-strip') ||
      (html.includes('preview-watermark-overlay') && !html.includes('preview-watermark-svg')) ||
      (!isTemplateShowcase && (html.includes('MYFOLIO • TEMPLATE') || html.includes('Template Preview') || html.includes('TEMPLATE PREVIEW'))) ||
      (isTemplateShowcase && (html.includes('preview-watermark-svg') || html.includes('Buy Build & Remove Watermark')));

    if (hasOutdatedWatermark) {
      html = siteGenerator.stripPreviewWatermark(html);
    }

    if (!html.includes('id="preview-watermark-overlay"')) {
      html = siteGenerator.injectPreviewWatermark(html, false, siteId);
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// Non-existent page or subroute inside a portfolio (/p/:siteId/*)
app.get('/p/:siteId/*', (req, res) => {
  const siteId = req.params.siteId;
  const subPath = req.params[0];
  const sitesBaseDir = path.join(process.cwd(), 'public', 'sites');

  if (siteId && securityService.isPathSafe(sitesBaseDir, siteId) && subPath) {
    const candidateFile = path.join(sitesBaseDir, siteId, subPath);
    if (securityService.isPathSafe(sitesBaseDir, path.join(siteId, subPath)) && fs.existsSync(candidateFile) && fs.statSync(candidateFile).isFile()) {
      return res.sendFile(candidateFile);
    }
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(404).send(TemplateRegistry.render404Page(siteId));
});

// ==========================================
// Subscription & Payment Landing Page (/subscribe)
// ==========================================
app.get(['/subscribe', '/pricing', '/payment/retry'], (req, res) => {
  const siteId = req.query.siteId || req.query.userId || 'demo';
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.send(renderSubscribePage({ siteId, youpiKeyId: youpiService.merchantId, razorpayKeyId: youpiService.merchantId }));
});



// Deep diagnostic check (Optional)
app.get('/health/deep', async (req, res) => {
  const checks = {
    status: 'ok',
    database: await dbHealthCheck(dbService),
    gemini: await aiService.healthCheck(),
    timestamp: new Date().toISOString()
  };
  res.json(checks);
});

async function dbHealthCheck(db) {
  try {
    await db.client.from('users').select('id').limit(1);
    return true;
  } catch (error) {
    return false;
  }
}

// ==========================================
// 404 Not Found Handler (Custom 3D Universe Page & API JSON)
// ==========================================
app.use((req, res) => {
  if (req.path.startsWith('/api/')) {
    res.setHeader('X-Robots-Tag', 'noindex, nofollow, noarchive');
    return res.status(404).json({ error: 'Endpoint not found', path: req.path });
  }

  const notFoundPage = getPagePath('404.html');
  if (fs.existsSync(notFoundPage)) {
    return res.status(404).sendFile(notFoundPage);
  }
  res.status(404).send('404 Page Not Found');
});

// Global Safe Error Handler (Never leaks SQL or stack traces)
app.use(SecurityMiddleware.safeErrorHandler());

// Production Environment & Secret Validation Guard
function validateStartupEnv(env = process.env) {
  const isProduction = env.NODE_ENV === 'production' || Boolean(env.RENDER);
  const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_KEY;
  const hasPaymentKey = Boolean((env.YOUPI_MERCHANT_ID && String(env.YOUPI_MERCHANT_ID).trim()) || (env.RAZORPAY_KEY_ID && String(env.RAZORPAY_KEY_ID).trim()));
  const mandatoryVars = [
    'SUPABASE_URL'
  ];

  const missing = mandatoryVars.filter(key => !env[key] || String(env[key]).trim() === '');
  if (!hasPaymentKey) {
    missing.push('YOUPI_MERCHANT_ID');
    missing.push('RAZORPAY_KEY_ID');
  }
  if (!supabaseKey || String(supabaseKey).trim() === '') {
    missing.push('SUPABASE_SERVICE_ROLE_KEY');
  }
  if (isProduction && missing.length > 0) {
    const errorMsg = `⚠️ [STARTUP GUARD WARNING] Missing production environment variables:\n  - ${missing.join('\n  - ')}\nPlease configure these in your Render Dashboard > Environment. Running with graceful in-memory fallbacks.`;
    console.warn(errorMsg);
    const err = new Error(errorMsg);
    err.code = 'MISSING_ENV_VARS';
    err.missing = missing;
    return { valid: false, missing };
  }
  return { valid: true, missing };
}

// Start server if run directly
if (require.main === module) {
  validateStartupEnv();

  const PORT = parseInt(process.env.PORT, 10) || 10000;
  // If HOST is explicitly provided in env, honor it; otherwise omit host so Node.js binds to dual-stack '::' (accepts all IPv4 & IPv6 connections)
  const HOST = process.env.HOST || null;

  function startServer(portToUse) {
    const listenArgs = [portToUse];
    if (HOST) listenArgs.push(HOST);
    listenArgs.push(() => {
      console.log(`🚀 MyFolio Platform Server running on port ${portToUse}`);
      console.log(`🌐 Local Studio:     http://localhost:${portToUse}`);
      console.log(`📱 Direct Previews:  http://localhost:${portToUse}/p/:siteId`);
    });

    const server = app.listen(...listenArgs);

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        if (process.env.NODE_ENV === 'production' || process.env.RENDER) {
          console.error(`🚨 [FATAL PORT CONFLICT] Port ${portToUse} is in use in production. Exiting process so container orchestrator can restart cleanly.`);
          process.exit(1);
        }
        console.warn(`⚠️ [PORT CONFLICT] Port ${portToUse} is already in use by another project or process.`);
        const nextPort = portToUse + 1;
        console.log(`🔄 Automatically shifting Portfolio Studio to next available port: ${nextPort}...`);
        startServer(nextPort);
      } else {
        console.error('[SERVER ERROR]', err);
      }
    });
  }

  startServer(PORT);
}

app.checkSitePaidStatus = checkSitePaidStatus;
app.sitePaidStatusCache = sitePaidStatusCache;
app.dbService = dbService;
app.contactIpLimiter = contactIpLimiter;
app.contactSiteLimiter = contactSiteLimiter;
app.aiGenLimiter = aiGenLimiter;
app.checkoutLimiter = checkoutLimiter;
app.authLimiter = authLimiter;
app.globalTrafficLimiter = globalTrafficLimiter;
app.validateStartupEnv = validateStartupEnv;

module.exports = app;

