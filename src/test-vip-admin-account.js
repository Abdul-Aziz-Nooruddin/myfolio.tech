const assert = require('assert');
const { DatabaseService } = require('./services/db-service');
const { AuthMiddleware } = require('./middleware/auth-middleware');

async function runVipAdminTests() {
  process.env.ADMIN_EMAILS = process.env.ADMIN_EMAILS || 'abdulaziznoor9876@gmail.com';
  process.env.ADMIN_USERNAMES = process.env.ADMIN_USERNAMES || 'abdulazizpro1';
  console.log('▶ 👑 VIP Master Account Restriction Removal Verification (abdulaziznoor9876@gmail.com)');

  const db = new DatabaseService();

  // 1. Verify User Creation / Retrieval auto-decorates as unrestricted Admin
  const adminUser = await db.createUserWithPassword({
    name: 'Abdul Aziz Nooruddin',
    email: 'abdulaziznoor9876@gmail.com',
    username: 'abdulazizpro1',
    passwordHash: 'dummy_hash',
    role: 'user' // even if default is user, should be promoted to admin
  });

  assert.strictEqual(adminUser.role, 'admin', 'Must be granted admin role');
  assert.strictEqual(adminUser.is_admin, true, 'Must have is_admin true');
  assert.strictEqual(adminUser.plan, 'unlimited', 'Must have unlimited plan');
  assert.strictEqual(adminUser.unlimited_generations, true, 'Must have unlimited generations');
  assert.strictEqual(adminUser.email_verified, true, 'Email must be verified');
  assert.strictEqual(adminUser.rate_limit_exempt, true, 'Rate limits must be exempt');
  assert.strictEqual(adminUser.allowance, 999999, 'Allowance must be unrestricted (999999)');
  console.log('✔ 1. User records for abdulaziznoor9876@gmail.com are automatically decorated as Super Admin with unlimited allowance');

  // 2. Verify Rate Limiter Bypass
  for (let i = 0; i < 50; i++) {
    const allowed = await db.checkRateLimit('abdulaziznoor9876@gmail.com', 'ai_generation', 5, 60);
    assert.strictEqual(allowed, true, `Rate limit attempt ${i + 1} must not be blocked`);
  }
  console.log('✔ 2. DB Rate limiting engine has 0 restrictions / 100% bypass for abdulaziznoor9876@gmail.com');

  // 3. Verify AuthMiddleware.requireAdmin
  let nextCalled = false;
  const mockReq = {
    user: {
      email: 'abdulaziznoor9876@gmail.com',
      username: 'abdulazizpro1',
      role: 'admin',
      is_admin: true
    }
  };
  const mockRes = {
    status: (code) => ({
      json: (data) => {
        throw new Error(`Unexpected error response: ${code} ${JSON.stringify(data)}`);
      }
    })
  };
  const mockNext = () => { nextCalled = true; };

  AuthMiddleware.requireAdmin(mockReq, mockRes, mockNext);
  assert.strictEqual(nextCalled, true, 'requireAdmin must allow abdulaziznoor9876@gmail.com');
  console.log('✔ 3. AuthMiddleware.requireAdmin successfully grants administrator authority');

  // 4. Verify AuthMiddleware.quotaLimiter
  nextCalled = false;
  const quotaGuard = AuthMiddleware.quotaLimiter(db, 'ai_generation', 1);
  await quotaGuard(mockReq, mockRes, mockNext);
  assert.strictEqual(nextCalled, true, 'quotaLimiter must pass without evaluating quota limits for admin');
  console.log('✔ 4. AuthMiddleware.quotaLimiter passes immediately with zero quota caps');

  console.log('👑 ALL RESTRICTIONS FOR abdulaziznoor9876@gmail.com SUCCESSFULLY REMOVED & VERIFIED!\n');
}

runVipAdminTests().catch(err => {
  console.error('❌ VIP Admin test failed:', err);
  process.exit(1);
});
