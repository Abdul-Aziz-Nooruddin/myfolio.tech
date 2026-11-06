/**
 * Lifecycle Automation, State Machine, Email Automation & Rate Limit Tests
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { LifecycleService, LIFECYCLE_STATES } = require('./services/lifecycle-service');
const { EmailService } = require('./services/email-service');
const { DatabaseService } = require('./services/db-service');

test('Email normalization strips plus tags and lowercases', () => {
  assert.equal(DatabaseService.normalizeEmail('User+Test1@Gmail.com'), 'user@gmail.com');
  assert.equal(DatabaseService.normalizeEmail('  alex.dev+promo@company.org '), 'alex.dev@company.org');
  assert.equal(DatabaseService.normalizeEmail('john.doe@yahoo.com'), 'john.doe@yahoo.com');
});

test('LifecycleService unmounts unpaid preview after 24 hours and transitions to lapsed', async () => {
  const testSiteId = 'test-unpaid-24hr-site';
  const siteDir = path.join(process.cwd(), 'public', 'sites', testSiteId);
  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'), '<html>preview</html>');

  let updatedConversation = null;
  let auditLogs = [];

  const mockDb = {
    getUnpaidPreviews: async () => [
      {
        id: testSiteId,
        user_id: 'user-24hr-001',
        state_entered_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25 hours ago (> 24h)
        status: 'preview_live',
        lifecycle_state: 'preview_unpaid'
      }
    ],
    getLapsedAccounts: async () => [],
    getOptedInUnconvertedUsers: async () => [],
    updateConversation: async (id, updates) => {
      updatedConversation = { id, updates };
    },
    updateSiteByProviderId: async () => {},
    recordAuditLog: async (log) => {
      auditLogs.push(log);
    }
  };

  const lifecycle = new LifecycleService(mockDb);
  const results = await lifecycle.runLifecycleCycle();

  assert.equal(results.previewsExpired, 1);
  assert.equal(fs.existsSync(siteDir), false, 'Expired preview directory was unmounted from disk');
  assert.equal(updatedConversation.updates.status, 'preview_lapsed');
  assert.equal(updatedConversation.updates.lifecycle_state, 'preview_lapsed');
  assert.equal(auditLogs.length, 1);
  assert.equal(auditLogs[0].action, 'state_transition_lapsed');
});

test('LifecycleService permanently purges unpaid preview after 5 days', async () => {
  const testSiteId = 'test-unpaid-5day-site';
  const siteDir = path.join(process.cwd(), 'public', 'sites', testSiteId);
  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'), '<html>preview-5day</html>');

  let updatedConversation = null;
  let auditLogs = [];

  const mockDb = {
    getUnpaidPreviews: async () => [
      {
        id: testSiteId,
        user_id: 'user-5day-001',
        state_entered_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago (> 5d)
        status: 'preview_live',
        lifecycle_state: 'preview_unpaid'
      }
    ],
    getLapsedAccounts: async () => [],
    getOptedInUnconvertedUsers: async () => [],
    updateConversation: async (id, updates) => {
      updatedConversation = { id, updates };
    },
    updateSiteByProviderId: async () => {},
    recordAuditLog: async (log) => {
      auditLogs.push(log);
    }
  };

  const lifecycle = new LifecycleService(mockDb);
  const results = await lifecycle.runLifecycleCycle();

  assert.equal(results.lapsedPurged, 1);
  assert.equal(fs.existsSync(siteDir), false, 'Expired 5-day preview was permanently purged');
  assert.equal(updatedConversation.updates.status, 'deleted');
  assert.equal(updatedConversation.updates.lifecycle_state, 'deleted');
  assert.equal(auditLogs.length, 1);
  assert.equal(auditLogs[0].action, 'state_transition_deleted');
});

test('LifecycleService sends grace reminders and purges after 5 days unpaid', async () => {
  const testSiteId = 'test-lapsed-5day-site';
  const siteDir = path.join(process.cwd(), 'public', 'sites', testSiteId);
  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'), '<html>lapsed</html>');

  let sentEmails = [];
  const mockEmail = {
    sendGraceReminderEmail: async (to, data) => {
      sentEmails.push({ to, milestone: data.milestone });
    },
    sendDeletionConfirmation: async (to, data) => {
      sentEmails.push({ to, milestone: 'deletion' });
    }
  };

  const mockDb = {
    getUnpaidPreviews: async () => [],
    getLapsedAccounts: async () => [
      {
        id: testSiteId,
        user_id: 'user-lapsed-001',
        state_entered_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(), // 6 days ago (> 5d)
        status: 'preview_lapsed',
        lifecycle_state: 'preview_lapsed',
        users: { email: 'subscriber@example.com' },
        extracted_data: { name: 'Alex' }
      }
    ],
    getOptedInUnconvertedUsers: async () => [],
    updateConversation: async () => {},
    updateSiteByProviderId: async () => {},
    recordAuditLog: async () => {}
  };

  const lifecycle = new LifecycleService(mockDb, mockEmail);
  const results = await lifecycle.runLifecycleCycle();

  assert.equal(results.lapsedPurged, 1);
  assert.equal(fs.existsSync(siteDir), false, 'Lapsed site purged after 5 days');
  assert.equal(sentEmails.some(e => e.milestone === 'deletion'), true);
});

test('LifecycleService admin manual overrides work and record audit trail', async () => {
  let updatedConv = null;
  let auditRecord = null;

  const mockDb = {
    getConversation: async (userId) => ({
      id: 'conv-override-1',
      user_id: userId,
      status: 'preview_lapsed',
      lifecycle_state: 'preview_lapsed'
    }),
    updateConversation: async (id, updates) => {
      updatedConv = { id, updates };
    },
    recordAuditLog: async (log) => {
      auditRecord = log;
    }
  };

  const lifecycle = new LifecycleService(mockDb);
  const res = await lifecycle.overrideGracePeriod('user-123', 3, 'admin-abdulaziz', 'Customer support ticket');

  assert.equal(res.success, true);
  assert.ok(updatedConv.updates.state_entered_at);
  assert.equal(auditRecord.action, 'override_grace_period');
  assert.equal(auditRecord.admin_identifier, 'admin-abdulaziz');
});

test('LifecycleService sends funny No Site Yet emails at Day 1, 3, 7 and deduplicates', async () => {
  const sentEmails = [];
  const recordedLogs = new Set();

  const mockDb = {
    getUnpaidPreviews: async () => [],
    getLapsedAccounts: async () => [],
    getOptedInUnconvertedUsers: async () => [],
    getAllAdminUsers: async () => [
      {
        id: 'u-nosite-1',
        email: 'lazy1@example.com',
        name: 'Alex',
        computedStatus: 'no_site_yet',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days old (Day 1 trigger)
      },
      {
        id: 'u-nosite-2',
        email: 'lazy2@example.com',
        name: 'Sarah',
        computedStatus: 'no_site_yet',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days old (Day 3 trigger)
      },
      {
        id: 'u-nosite-3',
        email: 'lazy3@example.com',
        name: 'Dave',
        computedStatus: 'no_site_yet',
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8 days old (Day 7 trigger)
      }
    ],
    hasEmailBeenSent: async (userId, triggerName) => recordedLogs.has(`${userId}:${triggerName}`),
    recordAuditLog: async () => {}
  };

  const mockEmail = {
    sendNoSiteYetEmail: async (to, data) => {
      sentEmails.push({ to, step: data.step, userId: data.userId });
      recordedLogs.add(`${data.userId}:no_site_yet_step_${data.step}`);
    }
  };

  const lifecycle = new LifecycleService(mockDb, mockEmail);
  const results1 = await lifecycle.runLifecycleCycle();

  assert.equal(results1.noSiteEmailsSent, 3);
  assert.equal(sentEmails.some(e => e.to === 'lazy1@example.com' && e.step === 1), true);
  assert.equal(sentEmails.some(e => e.to === 'lazy2@example.com' && e.step === 2), true);
  assert.equal(sentEmails.some(e => e.to === 'lazy3@example.com' && e.step === 3), true);

  // Second run: MUST NOT send duplicates
  const results2 = await lifecycle.runLifecycleCycle();
  assert.equal(results2.noSiteEmailsSent, 0, 'Zero duplicate emails sent');
});

test('LifecycleService sends preview expiring soon warning within 18-24h window', async () => {
  const sentEmails = [];
  const recordedLogs = new Set();

  const mockDb = {
    getUnpaidPreviews: async () => [
      {
        id: 'preview-expiring-site',
        user_id: 'user-preview-002',
        state_entered_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(), // 20 hours old (4 hours left)
        status: 'preview_live',
        lifecycle_state: 'preview_unpaid',
        extracted_data: { email: 'previewer@example.com', name: 'Jordan' }
      }
    ],
    getLapsedAccounts: async () => [],
    getOptedInUnconvertedUsers: async () => [],
    getAllAdminUsers: async () => [],
    hasEmailBeenSent: async (userId, triggerName) => recordedLogs.has(`${userId}:${triggerName}`),
    recordAuditLog: async () => {}
  };

  const mockEmail = {
    sendPreviewExpiringSoonEmail: async (to, data) => {
      sentEmails.push({ to, hoursLeft: data.hoursLeft });
      recordedLogs.add(`${data.userId}:preview_expiring_soon`);
    }
  };

  const lifecycle = new LifecycleService(mockDb, mockEmail);
  const results = await lifecycle.runLifecycleCycle();

  assert.equal(results.expiringSoonEmailsSent, 1);
  assert.equal(sentEmails[0].to, 'previewer@example.com');
  assert.equal(sentEmails[0].hoursLeft, 4);
});

test('LifecycleService sends cryogenic sleep email when preview expires', async () => {
  const testSiteId = 'test-unpaid-cryo-site';
  const siteDir = path.join(process.cwd(), 'public', 'sites', testSiteId);
  fs.mkdirSync(siteDir, { recursive: true });
  fs.writeFileSync(path.join(siteDir, 'index.html'), '<html>cryo</html>');

  const sentEmails = [];
  const mockDb = {
    getUnpaidPreviews: async () => [
      {
        id: testSiteId,
        user_id: 'user-cryo-001',
        state_entered_at: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25h (>24h)
        status: 'preview_live',
        lifecycle_state: 'preview_unpaid',
        extracted_data: { email: 'sleeping@example.com', name: 'Robin' }
      }
    ],
    getLapsedAccounts: async () => [],
    getOptedInUnconvertedUsers: async () => [],
    getAllAdminUsers: async () => [],
    hasEmailBeenSent: async () => false,
    updateConversation: async () => {},
    updateSiteByProviderId: async () => {},
    recordAuditLog: async () => {}
  };

  const mockEmail = {
    sendPreviewExpiredCryoEmail: async (to, data) => {
      sentEmails.push({ to, name: data.name });
    }
  };

  const lifecycle = new LifecycleService(mockDb, mockEmail);
  const results = await lifecycle.runLifecycleCycle();

  assert.equal(results.previewsExpired, 1);
  assert.equal(sentEmails.length, 1);
  assert.equal(sentEmails[0].to, 'sleeping@example.com');
  assert.equal(sentEmails[0].name, 'Robin');
});

test('Strict 3-Day Cooldown: prevents any user from receiving more than 1 email every 3 days (72 hours)', async () => {
  const sentEmails = [];
  const db = new DatabaseService(null, null); // Uses mock client & in-memory/file storage

  const uniqueSuffix = Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  const testUserId = `u-throttle-test-${uniqueSuffix}`;
  const testUserEmail = `throttle_${uniqueSuffix}@example.com`;

  const mockDb = {
    getUnpaidPreviews: async () => [],
    getLapsedAccounts: async () => [],
    getOptedInUnconvertedUsers: async () => [],
    getAllAdminUsers: async () => [
      {
        id: testUserId,
        email: testUserEmail,
        name: 'Throttled User',
        computedStatus: 'no_site_yet',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days old
      }
    ],
    hasEmailBeenSent: async (id, trig) => db.hasEmailBeenSent(id, trig),
    getLastEmailSentTime: async (id, em) => db.getLastEmailSentTime(id, em),
    recordEmailLog: async (log) => db.recordEmailLog(log)
  };

  const mockEmail = {
    sendNoSiteYetEmail: async (to, data) => {
      sentEmails.push({ to, step: data.step });
      await db.recordEmailLog({
        user_id: data.userId,
        email: to,
        trigger_name: `no_site_yet_step_${data.step}`,
        status: 'sent'
      });
    }
  };

  const lifecycle = new LifecycleService(mockDb, mockEmail);

  // 1. First run: should send Step 1 email
  const res1 = await lifecycle.runLifecycleCycle();
  assert.equal(res1.noSiteEmailsSent, 1, 'First run sends initial email');
  assert.equal(sentEmails.length, 1);

  // 2. Immediate second run (within 72h window): MUST be blocked by 3-day cooldown
  const res2 = await lifecycle.runLifecycleCycle();
  assert.equal(res2.noSiteEmailsSent, 0, 'Immediate run blocked by 3-day cooldown');
  assert.equal(sentEmails.length, 1, 'No second email sent within 72h');

  // 3. Simulated next day (24h later): still within 72h cooldown -> MUST be blocked
  const oneDayLater = Date.now() + 24 * 60 * 60 * 1000;
  const canSend24h = await lifecycle.canSendToUser(testUserId, testUserEmail, oneDayLater);
  assert.equal(canSend24h, false, 'User throttled 24h after first email');

  // 4. Simulated 3 days later (72h+ elapsed): cooldown expires
  const threeDaysLater = Date.now() + 73 * 60 * 60 * 1000;
  const canSend72h = await lifecycle.canSendToUser(testUserId, testUserEmail, threeDaysLater);
  assert.equal(canSend72h, true, 'User unthrottled after 72 hours (3 days)');
});

test('DatabaseService mock client supports .limit(), .order(), and tracks email logs without error', async () => {
  const db = new DatabaseService(null, null);
  const uId = `usr_mock_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  const uEmail = `mock_${Date.now()}@example.com`;

  // Record an email log
  await db.recordEmailLog({
    user_id: uId,
    email: uEmail,
    trigger_name: 'test_trigger_alpha',
    status: 'sent'
  });

  // Check hasEmailBeenSent returns true by user_id
  const sentByUserId = await db.hasEmailBeenSent(uId, 'test_trigger_alpha');
  assert.equal(sentByUserId, true);

  // Check hasEmailBeenSent returns true by email
  const sentByEmail = await db.hasEmailBeenSent(uEmail, 'test_trigger_alpha');
  assert.equal(sentByEmail, true);

  // Check hasEmailBeenSent returns false for unsent trigger
  const sentUnsent = await db.hasEmailBeenSent(uEmail, 'unknown_trigger');
  assert.equal(sentUnsent, false);

  // Check getLastEmailSentTime returns recent timestamp
  const lastTime = await db.getLastEmailSentTime(uId, uEmail);
  assert.ok(lastTime > 0);
  assert.ok(Date.now() - lastTime < 5000);
});


