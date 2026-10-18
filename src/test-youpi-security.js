/**
 * YouPI-PG Sovereign UPI Payment Gateway Test Suite
 * Validates HMAC-SHA256 signatures, zero-fee direct settlement, anti-tampering,
 * webhook processing, and preview watermark removal.
 */

process.env.NODE_ENV = process.env.NODE_ENV || 'test';
const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const { YoupiService } = require('./services/youpi-service');
const { HostingProvider } = require('./services/hosting-provider');
const app = require('./index');

test('YoupiService cryptographically verifies valid payment signatures', () => {
  const webhookSecret = 'test_youpi_secret_998877';
  const service = new YoupiService({
    merchantId: 'test_merchant_youpi',
    webhookSecret,
    apiUrl: 'https://api.youpi.local'
  });

  const orderId = 'youpi_ord_1001';
  const paymentId = 'youpi_pay_2002';
  const validSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');

  const isValid = service.verifyPaymentSignature({
    order_id: orderId,
    payment_id: paymentId,
    signature: validSignature
  });

  assert.equal(isValid, true, 'Valid HMAC-SHA256 signature passes YouPI verification');

  const isInvalid = service.verifyPaymentSignature({
    order_id: orderId,
    payment_id: paymentId,
    signature: 'bad_tampered_signature_hex'
  });

  assert.equal(isInvalid, false, 'Tampered signature is rejected by YouPI');
});

test('YoupiService detects and blocks price tampering attempts', async () => {
  const service = new YoupiService({
    merchantId: 'test_merchant_youpi',
    webhookSecret: 'test_secret_123',
    apiUrl: 'https://api.youpi.local'
  });

  // Simulate payment fetch returning ₹1 (100 paise) instead of ₹149 (14900 paise)
  service.getPayment = async (paymentId) => ({
    id: paymentId,
    order_id: 'youpi_ord_tamper',
    status: 'captured',
    amount: 100, // Attacker paid ₹1
    currency: 'INR',
    method: 'upi'
  });

  await assert.rejects(
    async () => {
      await service.verifyAndApprovePayment({
        paymentId: 'youpi_pay_tampered_1',
        orderId: 'youpi_ord_tamper',
        expectedPlan: 'lite',
        expectedAmount: 14900
      });
    },
    (err) => {
      assert.ok(err.message.includes('FRAUD ALERT: Payment amount tampering detected'));
      return true;
    },
    'Blocks payment where amount is lower than required plan price'
  );
});

test('YoupiService approves verified payment with correct amount and marks as captured', async () => {
  const service = new YoupiService({
    merchantId: 'test_merchant_youpi',
    webhookSecret: 'test_secret_123',
    apiUrl: 'https://api.youpi.local'
  });

  service.getPayment = async (paymentId) => ({
    id: paymentId,
    order_id: 'youpi_ord_valid_555',
    status: 'captured',
    amount: 14900,
    currency: 'INR',
    email: 'creator@myfolio.tech',
    method: 'upi'
  });

  const result = await service.verifyAndApprovePayment({
    paymentId: 'youpi_pay_valid_555',
    orderId: 'youpi_ord_valid_555',
    expectedPlan: 'lite',
    expectedAmount: 14900
  });

  assert.equal(result.approved, true);
  assert.equal(result.amount, 14900);
  assert.equal(result.amountRupees, 149);
  assert.equal(result.status, 'paid');
  assert.equal(result.gateway, 'youpi');
});

test('YoupiService verifies webhook signatures with X-Gateway-Signature header', () => {
  const webhookSecret = 'wh_secret_youpi_prod';
  const service = new YoupiService({
    merchantId: 'test_merchant_youpi',
    webhookSecret,
    apiUrl: 'https://api.youpi.local'
  });

  const payload = JSON.stringify({
    event: 'PAYMENT_SUCCESS',
    orderId: 'ord_youpi_999',
    amount: 14900,
    utr: 'UTR123456789'
  });

  const validSignature = crypto
    .createHmac('sha256', webhookSecret)
    .update(payload)
    .digest('hex');

  const isValid = service.verifyWebhookSignature(payload, validSignature);
  assert.equal(isValid, true, 'Valid webhook signature passes verification');

  const isInvalid = service.verifyWebhookSignature(payload, 'tampered_signature');
  assert.equal(isInvalid, false, 'Tampered webhook signature fails verification');
});

test('POST /api/web/create-order returns YouPI PG payment session', async () => {
  const routes = app._router.stack.filter(r => r.route && r.route.path === '/api/web/create-order');
  assert.ok(routes.length > 0, 'Route /api/web/create-order exists');
  const endpointHandler = routes[0].route.stack[routes[0].route.stack.length - 1].handle;

  const res = await new Promise((resolve) => {
    const req = {
      body: {
        siteId: 'test-site-youpi-order',
        plan: 'lite'
      },
      headers: { 'x-forwarded-for': '127.0.0.1' }
    };
    const responseObj = {
      statusCode: 200,
      json(data) { resolve({ status: this.statusCode, data }); },
      status(c) { this.statusCode = c; return this; }
    };
    endpointHandler(req, responseObj);
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.gateway, 'youpi');
  assert.ok(res.data.orderId);
  assert.equal(res.data.amount, 14900);
  assert.equal(res.data.currency, 'INR');
  assert.ok(res.data.keyId);
});

test('POST /api/web/verify-payment verifies YouPI native payload and unwatermarks site', async () => {
  const testSiteId = `test-youpi-verify-${Date.now()}`;
  const siteDir = path.join(process.cwd(), 'public', 'sites', testSiteId);
  fs.mkdirSync(siteDir, { recursive: true });

  const watermarkedHtml = `<!DOCTYPE html>
<html>
<body>
  <div id="preview-watermark-overlay"><div class="watermark-main-title">PREVIEW ONLY</div></div>
  <div id="preview-floating-bar"><button>Buy Now</button></div>
  <h1>Autonomous Sovereign Architect</h1>
</body>
</html>`;
  fs.writeFileSync(path.join(siteDir, 'index.html'), watermarkedHtml, 'utf8');

  const routes = app._router.stack.filter(r => r.route && r.route.path === '/api/web/verify-payment');
  assert.ok(routes.length > 0, 'Route /api/web/verify-payment exists');
  const endpointHandler = routes[0].route.stack[routes[0].route.stack.length - 1].handle;

  const res = await new Promise((resolve) => {
    const req = {
      body: {
        payment_id: 'youpi_mock_verified_99',
        order_id: 'order_youpi_mock_99',
        utr: 'UTR9988776655',
        siteId: testSiteId,
        plan: 'lite'
      }
    };
    const responseObj = {
      statusCode: 200,
      json(data) { resolve({ status: this.statusCode, data }); },
      status(c) { this.statusCode = c; return this; }
    };
    endpointHandler(req, responseObj);
  });

  assert.equal(res.status, 200);
  assert.equal(res.data.success, true);
  assert.equal(res.data.approved, true);

  const cleanHtml = fs.readFileSync(path.join(siteDir, 'index.html'), 'utf8');
  assert.ok(!cleanHtml.includes('PREVIEW ONLY'), 'Watermark stripped on YouPI payment approval');
  assert.ok(!cleanHtml.includes('preview-floating-bar'), 'Floating bar removed');
  assert.ok(cleanHtml.includes('Autonomous Sovereign Architect'), 'Portfolio content intact');

  // Cleanup
  fs.rmSync(siteDir, { recursive: true, force: true });
});
