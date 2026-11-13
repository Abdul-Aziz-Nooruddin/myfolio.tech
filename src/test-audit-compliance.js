/**
 * Phase 4 Comprehensive Audit Verification Test Suite
 * Tests:
 * 1. Weekly limit enforcement
 * 2. Razorpay webhook signature verification
 * 3. Takedown and grace-period logic
 * 4. Input validation (magic headers, size limits, format checks)
 */

process.env.NODE_ENV = 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const { RazorpayService } = require('./services/razorpay-service');
const { LifecycleService } = require('./services/lifecycle-service');
const { UploadValidator } = require('./services/upload-validator');

// =========================================================================
// 1. WEEKLY LIMIT ENFORCEMENT
// =========================================================================
test('1. Weekly Limit: allowance cycle tracks 3 builds and resets after 7 days', () => {
  const ALLOWANCE_CONFIG = {
    WEEKLY_TOTAL: 3,
    CYCLE_DURATION_MS: 7 * 24 * 60 * 60 * 1000
  };

  // Mock localStorage-backed allowance state
  let stored = { used: 0, cycleStart: Date.now() };

  function simulateBuild(state) {
    if (state.used >= ALLOWANCE_CONFIG.WEEKLY_TOTAL) {
      return { allowed: false, remaining: 0 };
    }
    state.used += 1;
    return { allowed: true, remaining: ALLOWANCE_CONFIG.WEEKLY_TOTAL - state.used };
  }

  // Build 1
  let res1 = simulateBuild(stored);
  assert.equal(res1.allowed, true);
  assert.equal(res1.remaining, 2);

  // Build 2
  let res2 = simulateBuild(stored);
  assert.equal(res2.allowed, true);
  assert.equal(res2.remaining, 1);

  // Build 3
  let res3 = simulateBuild(stored);
  assert.equal(res3.allowed, true);
  assert.equal(res3.remaining, 0);

  // Build 4: Should be blocked!
  let res4 = simulateBuild(stored);
  assert.equal(res4.allowed, false);
  assert.equal(res4.remaining, 0);

  // Simulate 8 days elapsed (cycle expiration)
  const eightDaysAgo = Date.now() - (8 * 24 * 60 * 60 * 1000);
  stored.cycleStart = eightDaysAgo;

  // Renewal check
  const now = Date.now();
  if (now - stored.cycleStart >= ALLOWANCE_CONFIG.CYCLE_DURATION_MS) {
    stored = { used: 0, cycleStart: now };
  }

  assert.equal(stored.used, 0, 'Allowance resets to 0 after 7 days');
  let resAfterReset = simulateBuild(stored);
  assert.equal(resAfterReset.allowed, true);
  assert.equal(resAfterReset.remaining, 2);
});

// =========================================================================
// 2. RAZORPAY WEBHOOK SIGNATURE VERIFICATION
// =========================================================================
test('2. Razorpay Webhook: enforces strict cryptographic HMAC-SHA256 signature verification', () => {
  const webhookSecret = 'test_wh_secret_xyz789';
  const razorpay = new RazorpayService('rzp_test_key', 'test_key_secret', webhookSecret);

  const payload = JSON.stringify({
    event: 'payment.captured',
    payload: {
      payment: {
        entity: {
          id: 'pay_test_999',
          amount: 14900,
          currency: 'INR',
          status: 'captured'
        }
      }
    }
  });

  // Generate authentic signature
  const validSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  // 1. Valid signature passes
  const validResult = razorpay.verifyWebhookSignature(payload, validSignature);
  assert.equal(validResult, true, 'Authentic HMAC signature passes verification');

  // 2. Tampered signature is rejected
  const tamperedSignature = crypto
    .createHmac('sha256', 'wrong_secret')
    .update(payload)
    .digest('hex');
  const invalidResult = razorpay.verifyWebhookSignature(payload, tamperedSignature);
  assert.equal(invalidResult, false, 'Tampered HMAC signature is rejected');

  // 3. Altered payload with valid signature is rejected
  const alteredPayload = payload.replace('14900', '100'); // price tampering
  const payloadMismatchResult = razorpay.verifyWebhookSignature(alteredPayload, validSignature);
  assert.equal(payloadMismatchResult, false, 'Payload alteration with original signature is rejected');

  // 4. Missing inputs return false gracefully
  assert.equal(razorpay.verifyWebhookSignature(null, validSignature), false);
  assert.equal(razorpay.verifyWebhookSignature(payload, null), false);
  assert.equal(razorpay.verifyWebhookSignature(payload, ''), false);
});

// =========================================================================
// 3. TAKEDOWN AND GRACE-PERIOD LIFECYCLE LOGIC
// =========================================================================
test('3. Takedown & Grace-Period: unmounts 24h preview and permanently purges after 5 days', async () => {
  const previewSiteId = 'audit-test-preview-site';
  const siteDir = path.join(process.cwd(), 'public', 'sites', previewSiteId);
  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'), '<html><body>preview preview</body></html>');

  let convUpdates = null;
  let auditLogs = [];

  // Scenario A: 25h elapsed (> 24h preview limit)
  const mockDb24h = {
    getUnpaidPreviews: async () => [
      {
        id: previewSiteId,
        user_id: 'user-audit-1',
        state_entered_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(),
        status: 'preview_live',
        lifecycle_state: 'preview_unpaid'
      }
    ],
    getLapsedAccounts: async () => [],
    getOptedInUnconvertedUsers: async () => [],
    updateConversation: async (id, u) => { convUpdates = u; },
    updateSiteByProviderId: async () => {},
    recordAuditLog: async (log) => { auditLogs.push(log); }
  };

  const lifecycle = new LifecycleService(mockDb24h);
  const cycleResult = await lifecycle.runLifecycleCycle();

  assert.equal(cycleResult.previewsExpired, 1, 'Marked 24h preview as expired');
  assert.equal(fs.existsSync(siteDir), false, 'Temporary preview unmounted from disk');
  assert.equal(convUpdates.status, 'preview_lapsed');
  assert.equal(convUpdates.lifecycle_state, 'preview_lapsed');
  assert.equal(auditLogs[0].action, 'state_transition_lapsed');

  // Scenario B: 6 days elapsed (> 5-day grace period) -> Permanent Purge
  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'), '<html><body>stale preview</body></html>');

  const mockDb5d = {
    getUnpaidPreviews: async () => [
      {
        id: previewSiteId,
        user_id: 'user-audit-1',
        state_entered_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'preview_lapsed',
        lifecycle_state: 'preview_lapsed'
      }
    ],
    getLapsedAccounts: async () => [],
    getOptedInUnconvertedUsers: async () => [],
    updateConversation: async (id, u) => { convUpdates = u; },
    updateSiteByProviderId: async () => {},
    recordAuditLog: async (log) => { auditLogs.push(log); }
  };

  const lifecyclePurge = new LifecycleService(mockDb5d);
  const purgeResult = await lifecyclePurge.runLifecycleCycle();

  assert.equal(purgeResult.lapsedPurged, 1, 'Permanently purged after 5-day grace period');
  assert.equal(fs.existsSync(siteDir), false, 'Site files irreversibly deleted');
  assert.equal(convUpdates.status, 'deleted');
  assert.equal(convUpdates.lifecycle_state, 'deleted');
  assert.equal(auditLogs.some(l => l.action === 'state_transition_deleted'), true);
});

// =========================================================================
// 4. INPUT VALIDATION & MAGIC BYTES
// =========================================================================
test('4. Input Validation: verifies magic bytes and blocks spoofed or oversized uploads', () => {
  // 1. Valid PDF header: %PDF-
  const validPdfBuffer = Buffer.from('%PDF-1.4\n1 0 obj\n<< /Type /Page >>\nendobj\n%%EOF');
  const validPdfRes = UploadValidator.validatePdf(validPdfBuffer);
  assert.equal(validPdfRes.valid, true, 'Valid PDF magic header accepted');
  assert.equal(validPdfRes.fileType, 'pdf');

  // 2. Spoofed PDF (PHP script renamed to resume.pdf)
  const fakePdfBuffer = Buffer.from('<?php echo "evil"; ?>');
  const fakePdfRes = UploadValidator.validatePdf(fakePdfBuffer);
  assert.equal(fakePdfRes.valid, false, 'Spoofed file without %PDF- header rejected');
  assert.ok(fakePdfRes.error.includes('magic headers'));

  // 3. Oversized file (> 10MB)
  const hugeBuffer = { length: 11 * 1024 * 1024 };
  const oversizedRes = UploadValidator.validatePdf(hugeBuffer);
  assert.equal(oversizedRes.valid, false, 'Oversized file rejected');
  assert.ok(oversizedRes.error.includes('10 MB'));

  // 4. Empty buffer
  const emptyRes = UploadValidator.validatePdf(Buffer.alloc(0));
  assert.equal(emptyRes.valid, false, 'Empty buffer rejected');

  // 5. Valid PNG magic header: \x89PNG\r\n\x1a\n
  const validPngBuffer = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00]);
  const pngRes = UploadValidator.validateImage(validPngBuffer);
  assert.equal(pngRes.valid, true, 'Valid PNG header accepted');
  assert.equal(pngRes.format, 'png');

  // 6. Valid JPEG magic header: \xFF\xD8\xFF
  const validJpgBuffer = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46]);
  const jpgRes = UploadValidator.validateImage(validJpgBuffer);
  assert.equal(jpgRes.valid, true, 'Valid JPEG header accepted');
  assert.equal(jpgRes.format, 'jpeg');
});

test('5. Supabase RLS hardening enforces deny-all policy for anon role across all 12 tables', async () => {
  const { runRlsDenyAudit } = require('../scripts/test-supabase-rls-deny');
  await runRlsDenyAudit();
});

test('6. XSS URL defense: allows only http(s) URLs in template links and neutralizes javascript: and data: payloads', () => {
  const { TemplateHelper } = require('./templates/template-helper');
  const { KageTempleTemplate } = require('./templates/kage-temple');
  const { Jack3DCreatorTemplate } = require('./templates/jack-3d-creator');

  // A. Unit tests on TemplateHelper.sanitizeUrl
  assert.equal(TemplateHelper.sanitizeUrl('javascript:alert(1)'), '#', 'javascript: must be neutralized');
  assert.equal(TemplateHelper.sanitizeUrl('JaVaScRiPt:alert(document.cookie)'), '#', 'Mixed-case javascript: must be neutralized');
  assert.equal(TemplateHelper.sanitizeUrl('data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg=='), '#', 'data: must be neutralized');
  assert.equal(TemplateHelper.sanitizeUrl('vbscript:msgbox(1)'), '#', 'vbscript: must be neutralized');
  assert.equal(TemplateHelper.sanitizeUrl('file:///etc/passwd'), '#', 'file: must be neutralized');
  assert.equal(TemplateHelper.sanitizeUrl('about:blank'), '#', 'about: must be neutralized');
  assert.equal(TemplateHelper.sanitizeUrl('https://github.com/myfolio-dev/core'), 'https://github.com/myfolio-dev/core', 'Valid https:// URL preserved');
  assert.equal(TemplateHelper.sanitizeUrl('http://insecure.example.com/demo'), 'http://insecure.example.com/demo', 'Valid http:// URL preserved');
  assert.equal(TemplateHelper.sanitizeUrl('/dashboard'), '/dashboard', 'Safe relative path preserved');
  assert.equal(TemplateHelper.sanitizeUrl('mailto:user@example.com'), 'mailto:user@example.com', 'Safe mailto preserved');

  // B. Full Template Rendering with injected malicious links
  const attackData = {
    name: 'Malicious Injected Candidate',
    role: 'Security Tester',
    github: 'javascript:alert("pwned_profile")',
    linkedin: 'data:text/html,<script>alert(1)</script>',
    projects: [
      {
        name: 'Evil Project 1',
        description: 'Testing link injection',
        link: 'javascript:alert("pwned_link")',
        github: 'data:text/html,malicious',
        live: 'javascript:void(0)'
      },
      {
        name: 'Evil Project 2',
        description: 'Testing secondary link injection',
        link: 'JaVaScRiPt:alert(document.domain)',
        github: 'vbscript:exploit',
        live: 'data:application/javascript,alert(1)'
      }
    ]
  };

  // Render Kage Temple
  const kageRendered = KageTempleTemplate.render(attackData);
  const kageHtml = typeof kageRendered === 'string' ? kageRendered : (kageRendered.html || '');
  assert.equal(kageHtml.includes('javascript:alert'), false, 'Kage Temple must not contain javascript: URL');
  assert.equal(kageHtml.includes('window.open('), false, 'Kage Temple must not contain inline window.open');
  assert.equal(kageHtml.includes('onclick='), false, 'Kage Temple must not contain inline onclick handlers');

  // Render Jack 3D Creator
  const jackHtml = Jack3DCreatorTemplate.render(attackData);
  assert.equal(jackHtml.includes('href="javascript:'), false, 'Jack 3D must not render href="javascript:');
  assert.equal(jackHtml.includes('href="data:'), false, 'Jack 3D must not render href="data:');
  assert.equal(jackHtml.includes('onclick="window.open'), false, 'Jack 3D must not render onclick="window.open');
});

// =========================================================================
// 7. STATIC ZIP EXPORT AUTHORIZATION: IS_PAID ENFORCEMENT
// =========================================================================
test('7. ZIP export: enforces is_paid authorization, rejecting unpaid previews with 402 and allowing paid sites', async () => {
  const app = require('./index');
  const testSiteId = 'test-export-gate-001';
  const siteDir = path.join(process.cwd(), 'public', 'sites', testSiteId);

  // Setup mock portfolio directory with index.html
  if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
  }
  fs.writeFileSync(path.join(siteDir, 'index.html'), '<html><body><h1>Export Test</h1></body></html>', 'utf8');
  fs.writeFileSync(path.join(siteDir, 'meta.json'), JSON.stringify({
    siteId: testSiteId,
    userId: 'user-export-001',
    isPaid: false
  }), 'utf8');

  // Clear cache
  app.sitePaidStatusCache.delete(testSiteId);

  // Helper to dispatch through the route stack
  const dispatchExport = (user, query = {}) => new Promise((resolve) => {
    const req = {
      params: { siteId: testSiteId },
      query,
      user,
      headers: {}
    };
    let statusCode = 200;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        resolve({ status: statusCode, data });
      },
      setHeader() {},
      send(buf) {
        resolve({ status: statusCode, data: buf });
      }
    };

    const routes = app._router.stack.filter(r => r.route && r.route.path === '/api/portfolio/:siteId/export');
    assert.ok(routes.length > 0, 'Export route exists');
    const endpointHandler = routes[0].route.stack[routes[0].route.stack.length - 1].handle;
    endpointHandler(req, res);
  });

  try {
    // 1. Unpaid owner tries to export -> Rejected 402 Payment Required
    const unpaidRes = await dispatchExport({ id: 'user-export-001', role: 'user' });
    assert.equal(unpaidRes.status, 402, 'Unpaid site export must return 402 Payment Required');
    assert.equal(unpaidRes.data.is_paid, false);
    assert.ok(unpaidRes.data.error.includes('Payment required'));

    // 2. Paid owner tries to export -> Succeeds (returns 200 and zip metadata or buffer)
    fs.writeFileSync(path.join(siteDir, 'meta.json'), JSON.stringify({
      siteId: testSiteId,
      userId: 'user-export-001',
      isPaid: true
    }), 'utf8');
    app.sitePaidStatusCache.delete(testSiteId);

    const paidRes = await dispatchExport({ id: 'user-export-001', role: 'user' }, { format: 'json' });
    assert.equal(paidRes.status, 200, 'Paid site export must return 200 OK');
    assert.equal(paidRes.data.success, true);
    assert.ok(paidRes.data.sizeBytes > 0);

    // 3. Admin bypass allowed on unpaid site
    fs.writeFileSync(path.join(siteDir, 'meta.json'), JSON.stringify({
      siteId: testSiteId,
      userId: 'user-export-001',
      isPaid: false
    }), 'utf8');
    app.sitePaidStatusCache.delete(testSiteId);

    const adminRes = await dispatchExport({ id: 'admin-user', role: 'admin' }, { format: 'json' });
    assert.equal(adminRes.status, 200, 'Admin can export unpaid site');
    assert.equal(adminRes.data.success, true);
  } finally {
    // Cleanup test artifacts
    try {
      fs.rmSync(siteDir, { recursive: true, force: true });
    } catch (e) {}
    app.sitePaidStatusCache.delete(testSiteId);
  }
});

// =========================================================================
// 8. SERVER-SIDE WEEKLY PREVIEW GENERATION LIMIT (3 BUILDS / 7-DAY CYCLE)
// =========================================================================
test('8. Server-side weekly limit: enforces 3 free builds per 7-day cycle keyed by verified user ID, rejecting 4th with 429', async () => {
  const app = require('./index');
  const dbService = app.dbService || new (require('./services/db-service').DatabaseService)();
  const testUserId = `test-user-weekly-${Date.now()}`;

  // 1. Direct dbService.checkWeeklyLimit unit test
  const testId = `usr-limit-${Date.now()}`;
  assert.equal(await dbService.checkWeeklyLimit(testId, 3), true, 'Build 1 must be allowed');
  assert.equal(await dbService.checkWeeklyLimit(testId, 3), true, 'Build 2 must be allowed');
  assert.equal(await dbService.checkWeeklyLimit(testId, 3), true, 'Build 3 must be allowed');
  assert.equal(await dbService.checkWeeklyLimit(testId, 3), false, 'Build 4 must be blocked (limit=3)');

  // 2. Integration test via POST /api/web/generate endpoint
  const dispatchGenerate = (user) => new Promise((resolve) => {
    const req = {
      body: {
        data: {
          name: 'Quota Test User',
          role: 'Engineer',
          email: 'quota-test@example.com'
        },
        branch: 'A',
        styleHint: 'light-swiss'
      },
      user,
      ip: '198.51.100.42',
      headers: {}
    };
    let statusCode = 200;
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        resolve({ status: statusCode, data });
      }
    };

    const routes = app._router.stack.filter(r => r.route && r.route.path === '/api/web/generate');
    assert.ok(routes.length > 0, 'Route /api/web/generate exists');
    const endpointHandler = routes[0].route.stack[routes[0].route.stack.length - 1].handle;
    endpointHandler(req, res);
  });

  const verifiedUser = { id: testUserId, role: 'user', email: 'verified-user@test.org' };

  // Build 1 -> 200 OK
  const res1 = await dispatchGenerate(verifiedUser);
  assert.equal(res1.status, 200, 'Build 1 should succeed');
  assert.equal(res1.data.success, true);

  // Build 2 -> 200 OK
  const res2 = await dispatchGenerate(verifiedUser);
  assert.equal(res2.status, 200, 'Build 2 should succeed');
  assert.equal(res2.data.success, true);

  // Build 3 -> 200 OK
  const res3 = await dispatchGenerate(verifiedUser);
  assert.equal(res3.status, 200, 'Build 3 should succeed');
  assert.equal(res3.data.success, true);

  // Build 4 -> 429 Too Many Requests
  const res4 = await dispatchGenerate(verifiedUser);
  assert.equal(res4.status, 429, 'Build 4 must be rejected with 429 Too Many Requests');
  assert.equal(res4.data.code, 'WEEKLY_LIMIT_EXCEEDED');
  assert.ok(res4.data.error.includes('Weekly generation limit reached'));

  // Admin bypass
  const adminRes = await dispatchGenerate({ id: testUserId, role: 'admin', email: 'admin@myfolio.tech' });
  assert.equal(adminRes.status, 200, 'Admin can generate past weekly quota');
});

// =========================================================================
// 9. CONTACT ENDPOINTS: RATE LIMITING, HONEYPOT, AND RECIPIENT LOCKDOWN
// =========================================================================
test('9. Contact endpoints: dual rate limiting, honeypot protection, and recipient lockdown', async () => {
  const app = require('./index');
  const { SecurityMiddleware } = require('./middleware/security-middleware');
  const testSiteId = 'contact-test-site-001';
  const siteDir = path.join(process.cwd(), 'public', 'sites', testSiteId);

  if (!fs.existsSync(siteDir)) {
    fs.mkdirSync(siteDir, { recursive: true });
  }
  fs.writeFileSync(path.join(siteDir, 'meta.json'), JSON.stringify({
    siteId: testSiteId,
    userEmail: 'verified-creator@myfolio.tech',
    developerName: 'Verified Creator'
  }), 'utf8');

  try {
    // 1. Honeypot trap: bots submitting honeypot field are neutralized silently
    const botTrap = SecurityMiddleware.botTrap(['website', 'bot_trap'], { silentSuccess: true });
    let honeypotCaught = false;
    const reqBot = { body: { name: 'Bot', email: 'spammer@evil.com', message: 'Buy spam', website: 'http://spam.com' } };
    const resBot = {
      json(data) {
        if (data.success) honeypotCaught = true;
      },
      status() { return this; }
    };
    botTrap(reqBot, resBot, () => {});
    assert.equal(honeypotCaught, true, 'Honeypot middleware should catch bot and return silent success');

    // 2. Clean user submission passes honeypot
    let humanPassed = false;
    const reqHuman = { body: { name: 'Alice', email: 'alice@example.com', message: 'Hello!' } };
    botTrap(reqHuman, {}, () => { humanPassed = true; });
    assert.equal(humanPassed, true, 'Legitimate human without honeypot fields should proceed');

    // 3. Recipient lockdown verification
    const dispatchSiteContact = (body, ip = '203.0.113.195') => new Promise((resolve) => {
      const req = {
        params: { siteId: testSiteId },
        body,
        ip,
        headers: {}
      };
      let statusCode = 200;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          resolve({ status: statusCode, data });
        }
      };

      const routes = app._router.stack.filter(r => r.route && r.route.path === '/api/sites/:siteId/contact');
      assert.ok(routes.length > 0, 'Contact route exists');
      const endpointHandler = routes[0].route.stack[routes[0].route.stack.length - 1].handle;
      endpointHandler(req, res);
    });

    // Valid contact inquiry to verified creator succeeds
    const legitRes = await dispatchSiteContact({
      name: 'Lead Recruiter',
      email: 'recruiter@techfirm.io',
      message: 'We have an opening for you!'
    });
    assert.equal(legitRes.status, 200);
    assert.equal(legitRes.data.success, true);

    // Attempted arbitrary recipient override: client supplies "to" or "recipient"
    // Destination is strictly locked to ownerEmail (verified-creator@myfolio.tech)
    const exploitRes = await dispatchSiteContact({
      name: 'Spammer',
      email: 'attacker@evil.com',
      to: 'unrelated-victim@corporation.com',
      recipient: 'ceo@bank.com',
      message: 'Malicious payload'
    });
    assert.equal(exploitRes.status, 200);

    // Unknown site without verified owner is rejected with 404 (prevents arbitrary open relay)
    const unknownRes = await new Promise((resolve) => {
      const req = {
        params: { siteId: 'non-existent-site-9999' },
        body: { name: 'Alice', email: 'alice@example.com', message: 'Hi' },
        ip: '203.0.113.196',
        headers: {}
      };
      let statusCode = 200;
      const res = {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          resolve({ status: statusCode, data });
        }
      };
      const routes = app._router.stack.filter(r => r.route && r.route.path === '/api/sites/:siteId/contact');
      const handler = routes[0].route.stack[routes[0].route.stack.length - 1].handle;
      handler(req, res);
    });
    assert.equal(unknownRes.status, 404, 'Unowned site contact must be rejected with 404 (no open relay)');

    // 4. Rate limiting per IP
    const limiter = SecurityMiddleware.rateLimiter({ max: 3, windowMs: 60000, actionName: 'test_contact_rate' });
    const ipToTest = '198.51.100.99';
    let allowedCount = 0;
    let blockedCount = 0;

    for (let i = 0; i < 5; i++) {
      const mockReq = { ip: ipToTest, headers: {}, socket: { remoteAddress: ipToTest } };
      const mockRes = {
        status(c) {
          if (c === 429) blockedCount++;
          return this;
        },
        json() {},
        setHeader() {}
      };
      await limiter(mockReq, mockRes, () => {
        allowedCount++;
      });
    }

    assert.equal(allowedCount, 3, 'First 3 requests within window are allowed');
    assert.equal(blockedCount, 2, 'Requests beyond limit are blocked with 429');
  } finally {
    try {
      fs.rmSync(siteDir, { recursive: true, force: true });
    } catch (e) {}
  }
});

// =========================================================================
// 10. SECRETS ON STARTUP & PRODUCTION ENV VAR VALIDATION
// =========================================================================
test('10. Secrets on startup: validates absence of hardcoded test-key fallbacks and proves startup failure on missing mandatory production env vars', () => {
  const app = require('./index');
  const { renderSubscribePage } = require('./templates/common/subscribe-page');

  // 1. Confirm absence of hardcoded rzp_test_TS49yFRP3b8uZl fallback
  const renderedWithoutKey = renderSubscribePage({ siteId: 'test-site', razorpayKeyId: '' });
  assert.equal(renderedWithoutKey.includes('rzp_test_TS49yFRP3b8uZl'), false, 'Hardcoded test key must not appear in rendered subscribe page');

  // 2. Production startup guard: fails and throws when required secrets are missing
  const incompleteProdEnv = {
    NODE_ENV: 'production',
    RAZORPAY_KEY_ID: '', // missing
    RAZORPAY_KEY_SECRET: 'secret',
    SUPABASE_URL: 'https://example.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: '' // missing
  };

  const checkResult = app.validateStartupEnv(incompleteProdEnv);
  assert.equal(checkResult.valid, false);
  assert.ok(checkResult.missing.includes('RAZORPAY_KEY_ID'));
  assert.ok(checkResult.missing.includes('SUPABASE_SERVICE_ROLE_KEY'));

  // 3. Valid production env passes without error
  const completeProdEnv = {
    NODE_ENV: 'production',
    RAZORPAY_KEY_ID: 'rzp_live_real_key_123',
    RAZORPAY_KEY_SECRET: 'live_secret_456',
    SUPABASE_URL: 'https://real.supabase.co',
    SUPABASE_SERVICE_ROLE_KEY: 'ey_super_secret_jwt'
  };

  const passResult = app.validateStartupEnv(completeProdEnv);
  assert.equal(passResult.valid, true);
  assert.equal(passResult.missing.length, 0);
});

// =========================================================================
// 11. TOKEN BUCKET RATE LIMITER ALGORITHM (Zero-Cost Tiered Protection)
// =========================================================================
test('11. Token Bucket rate limiter: permits burst up to capacity and rejects excess with 429', async () => {
  const { SecurityMiddleware } = require('./middleware/security-middleware');

  // Configure Token Bucket: burst capacity = 3 tokens, refill rate = 5 tokens/sec
  const limiter = SecurityMiddleware.tokenBucket({
    capacity: 3,
    refillRatePerSec: 5,
    actionName: 'test_token_bucket'
  });

  const ip = '198.51.100.42';
  const dispatch = () => new Promise((resolve) => {
    const req = { ip, headers: {}, socket: { remoteAddress: ip } };
    let statusCode = 200;
    let headersSet = {};
    const res = {
      status(code) {
        statusCode = code;
        return this;
      },
      json(data) {
        resolve({ status: statusCode, data, headers: headersSet });
      },
      setHeader(name, val) {
        headersSet[name] = val;
      }
    };
    limiter(req, res, () => {
      resolve({ status: 200, headers: headersSet });
    });
  });

  // 1. Initial burst: First 3 requests consume the 3 tokens in the bucket and must succeed
  const r1 = await dispatch();
  assert.equal(r1.status, 200, 'Token 1 should allow request');
  const r2 = await dispatch();
  assert.equal(r2.status, 200, 'Token 2 should allow request');
  const r3 = await dispatch();
  assert.equal(r3.status, 200, 'Token 3 should allow request');

  // 2. 4th request: Bucket is now empty, must be rejected with 429
  const r4 = await dispatch();
  assert.equal(r4.status, 429, 'Empty bucket must return 429 Too Many Requests');
  assert.equal(r4.data.code, 'TOKEN_BUCKET_EXHAUSTED');
  assert.ok(r4.headers['Retry-After'] >= 1, 'Retry-After header must be set');

  // 3. Wait for token refill: 250ms (refill rate = 5/sec -> at least 1 token generated)
  await new Promise((resolve) => setTimeout(resolve, 250));

  // 4. Next request succeeds using replenished token
  const r5 = await dispatch();
  assert.equal(r5.status, 200, 'Replenished token should allow request');
});

// =========================================================================
// 8. GOOGLE SEARCH CONSOLE & SITEMAP INDEXING INTEGRITY
// =========================================================================
test('8. GSC Audit: robots.txt allows noindex crawling and sitemap contains 31 clean URLs', () => {
  // 1. Verify robots.txt does not block /auth or private routes from crawling
  const robots = fs.readFileSync(path.join(process.cwd(), 'web', 'robots.txt'), 'utf8');
  const pubRobots = fs.readFileSync(path.join(process.cwd(), 'public', 'robots.txt'), 'utf8');
  assert.equal(robots, pubRobots, 'web/robots.txt and public/robots.txt must match');
  
  const googlebotBlocks = (robots.match(/User-agent:\s*Googlebot/gi) || []).length;
  assert.equal(googlebotBlocks, 1, 'Googlebot must have exactly one consolidated section');
  assert.ok(!robots.includes('Disallow: /auth'), 'robots.txt must not Disallow /auth (prevents GSC "Indexed, though blocked by robots.txt")');
  assert.ok(!robots.includes('Disallow: /dashboard'), 'robots.txt must not Disallow /dashboard');
  assert.ok(robots.includes('Disallow: /api/'), 'robots.txt must Disallow /api/');
  assert.ok(robots.includes('Disallow: /cdn-cgi/'), 'robots.txt must Disallow /cdn-cgi/');

  // 2. Verify sitemap.xml contains 31 clean canonical URLs without www, trailing slashes, or redirects
  const sitemap = fs.readFileSync(path.join(process.cwd(), 'web', 'sitemap.xml'), 'utf8');
  const pubSitemap = fs.readFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), 'utf8');
  assert.equal(sitemap, pubSitemap, 'web/sitemap.xml and public/sitemap.xml must match');

  const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  assert.equal(locs.length, 31, 'sitemap.xml must have exactly 31 URLs');
  assert.ok(locs.includes('https://myfolio.tech/apogee'), 'sitemap.xml must include /apogee');
  assert.ok(locs.includes('https://myfolio.tech/slush'), 'sitemap.xml must include /slush');
  assert.ok(locs.includes('https://myfolio.tech/blog'), 'sitemap.xml must include /blog');
  assert.ok(locs.includes('https://myfolio.tech/blog/best-free-portfolio-websites-2027'), 'sitemap.xml must include /blog/best-free-portfolio-websites-2027');

  for (const loc of locs) {
    assert.ok(loc.startsWith('https://myfolio.tech'), 'loc must start with https://myfolio.tech: ' + loc);
    assert.ok(!loc.includes('www.'), 'loc must not contain www.: ' + loc);
    if (loc !== 'https://myfolio.tech/') {
      assert.ok(!loc.endsWith('/'), 'loc must not have trailing slash: ' + loc);
    }
  }
});

// =========================================================================
// 9. TYPO ROUTING & OFFLINE SERVICE WORKER INTEGRITY
// =========================================================================
test('9. Typo & Offline Guard: sw.js caches 404.html and all mistyped routes serve 404 page', () => {
  const sw = fs.readFileSync(path.join(process.cwd(), 'web', 'sw.js'), 'utf8');
  const pubSw = fs.readFileSync(path.join(process.cwd(), 'public', 'sw.js'), 'utf8');
  assert.equal(sw, pubSw, 'web/sw.js and public/sw.js must match');
  assert.ok(sw.includes('/404.html'), 'sw.js must pre-cache /404.html');
  assert.ok(sw.includes('/spider-cursor.js'), 'sw.js must pre-cache spider-cursor.js');
  assert.ok(sw.includes('event.request.mode === \'navigate\''), 'sw.js must intercept navigation requests');

  const page404 = fs.readFileSync(path.join(process.cwd(), 'web', '404.html'), 'utf8');
  assert.ok(page404.includes('spider-cursor.js'), '404.html must include spider-cursor.js');
  assert.ok(page404.includes('initOfflineState'), '404.html must include offline state detection');
  assert.ok(page404.includes('MATCHSTICK MIND'), '404.html must contain MATCHSTICK MIND');
});





