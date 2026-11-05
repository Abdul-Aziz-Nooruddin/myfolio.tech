/**
 * Automated Verification: Email Delivery Resilience, HTTP API Fallback & Auth OTP Recovery
 * Tests:
 * 1. Email address & name parsing
 * 2. Render cloud host SMTP timeout formatting & diagnosis
 * 3. HTTP provider dispatch (Resend & Brevo)
 * 4. AuthHandler dev fallback handling when email delivery times out
 * 5. Complete registration flow with dev fallback
 */

const assert = require('assert');
const { EmailService } = require('../src/services/email-service');
const { AuthHandler } = require('../src/handlers/auth-handler');
const { SecurityService } = require('../src/services/security-service');

async function runTests() {
  console.log('🧪 Starting Email Resilience & Timeout Recovery Verification...\n');

  // 1. parseFrom tests
  console.log('Test 1: parseFrom header parsing');
  const p1 = EmailService.parseFrom('MyFolio <support@myfolio.tech>');
  assert.strictEqual(p1.name, 'MyFolio');
  assert.strictEqual(p1.email, 'support@myfolio.tech');

  const p2 = EmailService.parseFrom('support@myfolio.tech');
  assert.strictEqual(p2.email, 'support@myfolio.tech');
  console.log('  ✅ parseFrom passed');

  // 2. formatDeliveryError on Render / production
  console.log('Test 2: formatDeliveryError diagnostics');
  const origRender = process.env.RENDER;
  process.env.RENDER = 'true';

  const timeoutErr = new Error('Connection timeout');
  const formatted = EmailService.formatDeliveryError(timeoutErr);
  assert.ok(formatted.includes('Render Free Tier') || formatted.includes('Outbound SMTP ports'), 'Should describe Render free tier SMTP port block');
  console.log('  ✅ formatDeliveryError correctly flags Render SMTP block');

  if (origRender) process.env.RENDER = origRender;
  else delete process.env.RENDER;

  // 3. HTTP Provider Dispatch (Mocked global fetch)
  console.log('Test 3: HTTP API dispatch via Resend');
  const origFetch = global.fetch;
  let fetchCalledWith = null;

  global.fetch = async (url, opts) => {
    fetchCalledWith = { url, opts };
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: 're_mock_12345' })
    };
  };

  const origResendKey = process.env.RESEND_API_KEY;
  process.env.RESEND_API_KEY = 're_test_key';

  const httpEmailService = new EmailService();
  assert.strictEqual(httpEmailService.hasHttpProvider, true);

  const sendRes = await httpEmailService.sendMail({
    to: 'test@example.com',
    subject: 'Verification Code',
    html: '<p>Your code is 123456</p>'
  });

  assert.strictEqual(sendRes.success, true);
  assert.strictEqual(sendRes.provider, 'resend');
  assert.strictEqual(fetchCalledWith.url, 'https://api.resend.com/emails');
  console.log('  ✅ Resend HTTPS delivery succeeded without opening raw SMTP sockets');

  // Restore environment & fetch
  if (origResendKey) process.env.RESEND_API_KEY = origResendKey;
  else delete process.env.RESEND_API_KEY;
  global.fetch = origFetch;

  // 4. AuthHandler Dev Fallback when email fails
  console.log('Test 4: AuthHandler fallback in dev mode when email fails');
  const mockDb = {
    getUserByNormalizedEmail: async () => null,
    getUserByUsername: async () => null,
    createUserWithPassword: async (data) => ({ id: 'usr_test_1', ...data }),
    updateUser: async () => true,
    createSession: async () => ({ token: 'sess_tok' }),
    constructor: {
      normalizeEmail: (e) => e.trim().toLowerCase()
    }
  };

  const mockSec = new SecurityService();

  // Mock email service that intentionally simulates Connection timeout
  const failingEmailService = {
    sendSignupOtpEmail: async () => ({
      success: false,
      error: 'Connection timeout'
    })
  };

  const origNodeEnv = process.env.NODE_ENV;
  process.env.NODE_ENV = 'development';

  const auth = new AuthHandler(mockDb, mockSec, failingEmailService);

  let responseStatus = null;
  let responseBody = null;
  const mockRes = {
    status: (code) => {
      responseStatus = code;
      return {
        json: (data) => { responseBody = data; return mockRes; }
      };
    },
    json: (data) => {
      responseStatus = 200;
      responseBody = data;
      return mockRes;
    }
  };

  await auth.signup({
    body: {
      name: 'Test Candidate',
      email: 'candidate@test.com',
      username: 'testcandidate',
      password: 'Password123!',
      confirmPassword: 'Password123!',
      termsAccepted: true
    }
  }, mockRes);

  assert.strictEqual(responseStatus, 200, 'Dev fallback should return 200 instead of 500');
  assert.strictEqual(responseBody.success, true);
  assert.strictEqual(responseBody.requireOtp, true);
  assert.ok(responseBody.devOtp, 'Should return devOtp so test registration is unblocked');

  console.log('  ✅ AuthHandler dev fallback succeeded! Received OTP:', responseBody.devOtp);

  // 5. Verify the generated OTP
  console.log('Test 5: Account verification with dev fallback OTP');
  let verifyStatus = null;
  let verifyBody = null;
  const mockVerifyRes = {
    status: (code) => {
      verifyStatus = code;
      return { json: (data) => { verifyBody = data; return mockVerifyRes; } };
    },
    json: (data) => {
      verifyStatus = 200;
      verifyBody = data;
      return mockVerifyRes;
    },
    setHeader: () => {}
  };

  await auth.verifySignupOtp({
    headers: { 'user-agent': 'test-agent' },
    ip: '127.0.0.1',
    body: {
      email: 'candidate@test.com',
      otp: responseBody.devOtp
    }
  }, mockVerifyRes);

  assert.strictEqual(verifyStatus, 201, 'Account creation should return 201 Created');
  assert.strictEqual(verifyBody.success, true);
  console.log('  ✅ Account successfully created and verified with fallback OTP!');

  // Restore NODE_ENV
  process.env.NODE_ENV = origNodeEnv;

  console.log('\n🎉 ALL 5 EMAIL RESILIENCE TESTS PASSED CLEANLY!\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
