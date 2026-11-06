/**
 * Lifecycle Service — Deterministic State Machine & Scheduled Automation
 * Enforces strict site lifecycles (24-hour preview takedown, 5-day lapsed grace period, permanent purge)
 * Driven by cron (Section 6) — NOT reasoning/LLM-driven.
 */

const fs = require('fs');
const path = require('path');
const cron = require('node-cron');

const LIFECYCLE_STATES = {
  PREVIEW_UNPAID: 'preview_unpaid',
  LIVE: 'live',
  PREVIEW_LAPSED: 'preview_lapsed',
  DELETED: 'deleted'
};

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours free preview window
const FIVE_DAYS_MS = 5 * 24 * 60 * 60 * 1000; // 5 days total retention before permanent deletion
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000; // Strict 72-hour cooldown: at most 1 email per user every 3 days

class LifecycleService {
  constructor(dbService, emailService = null, notifier = null, hostingProvider = null) {
    this.db = dbService;
    this.email = emailService;
    this.notifier = notifier;
    this.hostingProvider = hostingProvider;
    this.cronTask = null;
    this.diskPurgeInterval = null;
    this.lastSentTimes = new Map();
    this.usersEmailedInThisCycle = new Set();
  }

  setNotifier(notifierFn) {
    this.notifier = notifierFn;
  }

  getLastSentTime(userId, userEmail) {
    let t = 0;
    if (userId && this.lastSentTimes.has(userId)) {
      t = Math.max(t, this.lastSentTimes.get(userId));
    }
    if (userEmail && this.lastSentTimes.has(userEmail.toLowerCase().trim())) {
      t = Math.max(t, this.lastSentTimes.get(userEmail.toLowerCase().trim()));
    }
    return t;
  }

  markUserEmailed(userId, userEmail, time = Date.now()) {
    if (userId) {
      this.lastSentTimes.set(userId, time);
      this.usersEmailedInThisCycle.add(userId);
    }
    if (userEmail) {
      const clean = userEmail.toLowerCase().trim();
      this.lastSentTimes.set(clean, time);
      this.usersEmailedInThisCycle.add(clean);
    }
  }

  async canSendToUser(userId, userEmail, now = Date.now()) {
    if (userId && this.usersEmailedInThisCycle.has(userId)) return false;
    if (userEmail && this.usersEmailedInThisCycle.has(userEmail.toLowerCase().trim())) return false;

    // Check in-service memory cache
    const localLast = this.getLastSentTime(userId, userEmail);
    if (localLast && (now - localLast < THREE_DAYS_MS)) {
      return false;
    }

    // Check persistent database / file history
    if (this.db && typeof this.db.getLastEmailSentTime === 'function') {
      try {
        const dbLast = await this.db.getLastEmailSentTime(userId, userEmail);
        if (dbLast && (now - dbLast < THREE_DAYS_MS)) {
          return false;
        }
      } catch (e) {}
    }

    return true;
  }

  startScheduler(cronExpression = '0 9 */3 * *') {
    // Run initial sweep on startup to keep disk clean of sites older than 24 hours
    this.purgeOrphanAndExpiredDiskSites(TWENTY_FOUR_HOURS_MS);

    // Ephemeral disk purge sweep runs every 6 hours so temporary previews are unmounted cleanly
    this.diskPurgeInterval = setInterval(() => {
      this.purgeOrphanAndExpiredDiskSites(TWENTY_FOUR_HOURS_MS);
    }, 6 * 60 * 60 * 1000);
    if (this.diskPurgeInterval.unref) this.diskPurgeInterval.unref();

    // Lifecycle re-engagement and conversion emails run strictly on the 3-day cron schedule
    this.cronTask = cron.schedule(cronExpression, async () => {
      console.log(`[LIFECYCLE CRON] Running deterministic 3-day lifecycle check (schedule: ${cronExpression})...`);
      try {
        await this.runLifecycleCycle();
        this.purgeOrphanAndExpiredDiskSites(TWENTY_FOUR_HOURS_MS);
      } catch (err) {
        console.error('[LIFECYCLE CRON ERROR]:', err);
      }
    });
    console.log(`[LIFECYCLE] Scheduler & Auto-Purge Sweeper started (Cron: ${cronExpression} - Strict 3-Day Frequency)`);
  }

  /**
   * Ephemeral Auto-Purge Sweeper
   * Automatically deletes expired preview sites from public/sites/ older than maxAgeMs (default 24 hours)
   */
  purgeOrphanAndExpiredDiskSites(maxAgeMs = TWENTY_FOUR_HOURS_MS) {
    const sitesRoot = path.join(process.cwd(), 'public', 'sites');
    if (!fs.existsSync(sitesRoot)) return { purgedCount: 0 };

    let purgedCount = 0;
    const now = Date.now();

    try {
      const entries = fs.readdirSync(sitesRoot, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory()) continue;
        const dirPath = path.join(sitesRoot, entry.name);

        try {
          const stats = fs.statSync(dirPath);
          const ageMs = now - stats.mtimeMs;

          // If directory is older than maxAgeMs (24 hours), purge it completely
          if (ageMs >= maxAgeMs) {
            fs.rmSync(dirPath, { recursive: true, force: true });
            purgedCount++;
          }
        } catch (dirErr) {
          // Non-blocking
        }
      }

      if (purgedCount > 0) {
        console.log(`🧹 [AUTO-PURGE] Cleaned up ${purgedCount} expired preview portfolio(s) older than 24 hours from disk.`);
      }
    } catch (err) {
      console.warn('[AUTO-PURGE] Disk sweep notice:', err.message);
    }

    return { purgedCount };
  }

  stopScheduler() {
    if (this.cronTask) {
      this.cronTask.stop();
      this.cronTask = null;
    }
    if (this.diskPurgeInterval) {
      clearInterval(this.diskPurgeInterval);
      this.diskPurgeInterval = null;
    }
  }

  /**
   * Main deterministic cycle executed on every scheduled tick
   */
  async runLifecycleCycle() {
    const results = {
      previewsExpired: 0,
      lapsedRemindersSent: 0,
      lapsedPurged: 0,
      conversionEmailsSent: 0,
      noSiteEmailsSent: 0,
      expiringSoonEmailsSent: 0,
      liveWelcomeEmailsSent: 0
    };

    const now = Date.now();
    this.usersEmailedInThisCycle.clear();

    // 1. Process Unpaid Previews (24-hour preview window & 5-day permanent deletion)
    const activePreviews = await this.db.getUnpaidPreviews();
    for (const item of activePreviews) {
      const enteredAt = item.state_entered_at ? new Date(item.state_entered_at).getTime() : new Date(item.created_at).getTime();
      const elapsed = now - enteredAt;

      // If older than 5 days, permanently purge entirely
      if (elapsed >= FIVE_DAYS_MS) {
        console.log(`[LIFECYCLE] Preview ${item.id} exceeded 5-day maximum retention. Permanently deleting.`);
        await this.transitionToDeleted(item, 'unpaid_preview_5day_timeout');
        results.lapsedPurged++;
      } else if (elapsed >= TWENTY_FOUR_HOURS_MS) {
        console.log(`[LIFECYCLE] Preview ${item.id} exceeded 24-hour active window. Marking lapsed.`);
        await this.transitionToLapsed(item, 'unpaid_preview_24hr_timeout');
        results.previewsExpired++;
      } else if (elapsed >= 18 * 60 * 60 * 1000) {
        // Between 18h and 24h: ~4-6 hours remaining on free clock
        if (this.email && item.user_id && typeof this.db.hasEmailBeenSent === 'function') {
          const sent = await this.db.hasEmailBeenSent(item.user_id, 'preview_expiring_soon');
          if (!sent && typeof this.email.sendPreviewExpiringSoonEmail === 'function') {
            const user = item.users || (typeof this.db.getUserById === 'function' ? await this.db.getUserById(item.user_id) : null);
            const userEmail = user?.email || item.extracted_data?.email;
            const userName = user?.name || item.extracted_data?.name || 'there';
            if (userEmail && (await this.canSendToUser(item.user_id, userEmail, now))) {
              const hoursLeft = Math.max(1, Math.round((TWENTY_FOUR_HOURS_MS - elapsed) / (60 * 60 * 1000)));
              const previewUrl = item.live_url || `${process.env.HOST_URL || 'https://myfolio.tech'}/p/${item.id}`;
              const subscribeUrl = `${process.env.HOST_URL || 'https://myfolio.tech'}/subscribe?userId=${item.user_id}`;
              await this.email.sendPreviewExpiringSoonEmail(userEmail, {
                userId: item.user_id,
                name: userName,
                hoursLeft,
                previewUrl,
                subscribeUrl
              });
              this.markUserEmailed(item.user_id, userEmail, now);
              results.expiringSoonEmailsSent++;
            }
          }
        }
      }
    }

    // 2. Process Lapsed Subscriptions (5-day grace period & reminders on Day 1, 3, 4.5)
    const lapsedAccounts = await this.db.getLapsedAccounts();
    for (const item of lapsedAccounts) {
      const enteredAt = item.state_entered_at ? new Date(item.state_entered_at).getTime() : new Date(item.updated_at).getTime();
      const elapsed = now - enteredAt;
      const elapsedDays = elapsed / (24 * 60 * 60 * 1000);

      const user = item.users || (item.user_id ? await this.db.getUserById(item.user_id) : null);
      const userEmail = user?.email || item.extracted_data?.email;
      const userName = item.extracted_data?.name || 'there';
      const siteUrl = item.live_url || `${process.env.HOST_URL || 'http://localhost:5050'}/p/${item.id}`;
      const retryUrl = `${process.env.HOST_URL || 'http://localhost:5050'}/payment/retry?userId=${item.user_id}`;

      // Check for 5-day expiration
      if (elapsed >= FIVE_DAYS_MS) {
        console.log(`[LIFECYCLE] Lapsed account ${item.id} exceeded 5-day grace period. Permanently purging.`);
        await this.transitionToDeleted(item, 'lapsed_5day_timeout');
        if (this.email && userEmail && (await this.canSendToUser(item.user_id, userEmail, now))) {
          if (typeof this.email.sendPurgedFreshStartEmail === 'function') {
            const sent = typeof this.db.hasEmailBeenSent === 'function' ? await this.db.hasEmailBeenSent(item.user_id, 'purged_fresh_start') : false;
            if (!sent) {
              await this.email.sendPurgedFreshStartEmail(userEmail, { userId: item.user_id, name: userName });
              this.markUserEmailed(item.user_id, userEmail, now);
            }
          } else if (typeof this.email.sendDeletionConfirmation === 'function') {
            await this.email.sendDeletionConfirmation(userEmail, { userId: item.user_id, name: userName });
            this.markUserEmailed(item.user_id, userEmail, now);
          }
        }
        results.lapsedPurged++;
        continue;
      }

      // Check milestones for grace period emails
      if (this.email && userEmail && (await this.canSendToUser(item.user_id, userEmail, now))) {
        if (elapsedDays >= 4.5) {
          const sent = await this.db.hasEmailBeenSent(item.user_id, 'grace_reminder_day_4_5');
          if (!sent) {
            await this.email.sendGraceReminderEmail(userEmail, {
              userId: item.user_id,
              name: userName,
              milestone: 'day_4_5',
              daysLeft: '12 hours',
              retryUrl,
              siteUrl
            });
            this.markUserEmailed(item.user_id, userEmail, now);
            results.lapsedRemindersSent++;
          }
        } else if (elapsedDays >= 3.0) {
          const sent = await this.db.hasEmailBeenSent(item.user_id, 'grace_reminder_day_3');
          if (!sent) {
            await this.email.sendGraceReminderEmail(userEmail, {
              userId: item.user_id,
              name: userName,
              milestone: 'day_3',
              daysLeft: '2 days',
              retryUrl,
              siteUrl
            });
            this.markUserEmailed(item.user_id, userEmail, now);
            results.lapsedRemindersSent++;
          }
        } else if (elapsedDays >= 1.0) {
          const sent = await this.db.hasEmailBeenSent(item.user_id, 'grace_reminder_day_1');
          if (!sent) {
            await this.email.sendGraceReminderEmail(userEmail, {
              userId: item.user_id,
              name: userName,
              milestone: 'day_1',
              daysLeft: '4 days',
              retryUrl,
              siteUrl
            });
            this.markUserEmailed(item.user_id, userEmail, now);
            results.lapsedRemindersSent++;
          }
        }
      }
    }

    // 3. Process Dynamic Lifecycle Sequences for Registered Users (NO SITE YET & LIVE)
    if (typeof this.db.getAllAdminUsers === 'function') {
      try {
        const allUsers = await this.db.getAllAdminUsers(500);
        for (const u of (allUsers || [])) {
          const userEmail = u.email || u.normalized_email;
          if (!userEmail) continue;
          const userName = u.name || 'there';
          const userId = u.id;
          const status = u.computedStatus || (u.siteId ? 'preview' : 'no_site_yet');
          const createdAt = u.created_at ? new Date(u.created_at).getTime() : now;
          const elapsedDays = (now - createdAt) / (24 * 60 * 60 * 1000);

          // Track 3a: NO SITE YET users (Funny re-engagement sequences with strict 3-day cooldown)
          if (status === 'no_site_yet' && this.email && typeof this.email.sendNoSiteYetEmail === 'function') {
            if (!(await this.canSendToUser(userId, userEmail, now))) {
              continue;
            }

            if (elapsedDays >= 7.0) {
              const sent = typeof this.db.hasEmailBeenSent === 'function' ? await this.db.hasEmailBeenSent(userId, 'no_site_yet_step_3') : false;
              if (!sent) {
                await this.email.sendNoSiteYetEmail(userEmail, { userId, name: userName, step: 3 });
                this.markUserEmailed(userId, userEmail, now);
                results.noSiteEmailsSent++;
              }
            } else if (elapsedDays >= 3.0) {
              const sent = typeof this.db.hasEmailBeenSent === 'function' ? await this.db.hasEmailBeenSent(userId, 'no_site_yet_step_2') : false;
              if (!sent) {
                await this.email.sendNoSiteYetEmail(userEmail, { userId, name: userName, step: 2 });
                this.markUserEmailed(userId, userEmail, now);
                results.noSiteEmailsSent++;
              }
            } else if (elapsedDays >= 1.0) {
              const sent = typeof this.db.hasEmailBeenSent === 'function' ? await this.db.hasEmailBeenSent(userId, 'no_site_yet_step_1') : false;
              if (!sent) {
                await this.email.sendNoSiteYetEmail(userEmail, { userId, name: userName, step: 1 });
                this.markUserEmailed(userId, userEmail, now);
                results.noSiteEmailsSent++;
              }
            }
          }

          // Track 3b: LIVE (Paid) users welcome & tips milestone
          if (status === 'live' && this.email && typeof this.email.sendLiveWelcomeEmail === 'function') {
            if (!(await this.canSendToUser(userId, userEmail, now))) {
              continue;
            }
            const sent = typeof this.db.hasEmailBeenSent === 'function' ? await this.db.hasEmailBeenSent(userId, 'live_welcome_milestone') : false;
            if (!sent) {
              const siteUrl = u.siteUrl ? `${process.env.HOST_URL || 'https://myfolio.tech'}${u.siteUrl}` : `${process.env.HOST_URL || 'https://myfolio.tech'}/dashboard.html`;
              await this.email.sendLiveWelcomeEmail(userEmail, {
                userId,
                name: userName,
                siteUrl,
                plan: u.plan === 'starter' ? 'Starter' : 'Pro'
              });
              this.markUserEmailed(userId, userEmail, now);
              results.liveWelcomeEmailsSent++;
            }
          }
        }
      } catch (userLoopErr) {
        console.warn('[LIFECYCLE] User lifecycle sequence warning:', userLoopErr.message);
      }
    }

    // 4. Process Conversion Sequence for Opted-in Users (Days 3, 6, 9)
    if (typeof this.db.getOptedInUnconvertedUsers === 'function') {
      const unconvertedUsers = await this.db.getOptedInUnconvertedUsers();
      for (const user of (unconvertedUsers || [])) {
        const createdAt = new Date(user.created_at).getTime();
        const elapsedDays = (now - createdAt) / (24 * 60 * 60 * 1000);
        const userEmail = user.email;
        const userName = user.name || 'there';
        const subscribeUrl = `${process.env.HOST_URL || 'http://localhost:5050'}/subscribe?userId=${user.id}`;

        if (!userEmail) continue;
        if (!(await this.canSendToUser(user.id, userEmail, now))) {
          continue;
        }

        if (elapsedDays >= 30.0) {
          const sentMonthly = await this.db.hasEmailBeenSent(user.id, 'conversion_email_monthly');
          if (!sentMonthly) {
            await this.email.sendMonthlyReengagementEmail(userEmail, { userId: user.id, name: userName });
            this.markUserEmailed(user.id, userEmail, now);
            results.conversionEmailsSent++;
          }
        } else if (elapsedDays >= 9.0) {
          const sent = await this.db.hasEmailBeenSent(user.id, 'conversion_email_4_day_9');
          if (!sent) {
            await this.email.sendConversionEmail4(userEmail, { userId: user.id, name: userName, subscribeUrl });
            this.markUserEmailed(user.id, userEmail, now);
            results.conversionEmailsSent++;
          }
        } else if (elapsedDays >= 6.0) {
          const sent = await this.db.hasEmailBeenSent(user.id, 'conversion_email_3_day_6');
          if (!sent) {
            await this.email.sendConversionEmail3(userEmail, { userId: user.id, name: userName, subscribeUrl });
            this.markUserEmailed(user.id, userEmail, now);
            results.conversionEmailsSent++;
          }
        } else if (elapsedDays >= 3.0) {
          const sent = await this.db.hasEmailBeenSent(user.id, 'conversion_email_2_day_3');
          if (!sent) {
            await this.email.sendConversionEmail2(userEmail, { userId: user.id, name: userName, subscribeUrl });
            this.markUserEmailed(user.id, userEmail, now);
            results.conversionEmailsSent++;
          }
        }
      }
    }

    return results;
  }

  /**
   * Transition to lapsed preview state after 24-hour evaluation window expires
   */
  async transitionToLapsed(item, reason = 'unpaid_preview_24hr_timeout') {
    const siteId = item.id;
    const siteDir = path.join(process.cwd(), 'public', 'sites', siteId);

    // Clean up temporary live preview directory so preview is no longer publicly served
    if (fs.existsSync(siteDir)) {
      try {
        fs.rmSync(siteDir, { recursive: true, force: true });
        console.log(`[LIFECYCLE] Unmounted expired preview directory: ${siteDir}`);
      } catch (rmErr) {
        console.warn(`[LIFECYCLE] Error removing preview directory ${siteDir}:`, rmErr.message);
      }
    }

    // Update DB record to preview_lapsed
    await this.db.updateConversation(siteId, {
      status: 'preview_lapsed',
      lifecycle_state: LIFECYCLE_STATES.PREVIEW_LAPSED,
      state_entered_at: new Date().toISOString()
    });

    try {
      await this.db.updateSiteByProviderId(siteId, {
        status: 'preview_lapsed',
        lifecycle_state: LIFECYCLE_STATES.PREVIEW_LAPSED
      });
    } catch (e) {}

    // Audit log
    await this.db.recordAuditLog({
      admin_identifier: 'system_cron',
      action: 'state_transition_lapsed',
      target_user_id: item.user_id,
      reason,
      details: { siteId, previous_state: item.lifecycle_state || item.status }
    });

    // Notify user immediately that their preview entered cryogenic sleep (5-day grace active)
    if (this.email && item.user_id) {
      try {
        const user = item.users || (typeof this.db.getUserById === 'function' ? await this.db.getUserById(item.user_id) : null);
        const userEmail = user?.email || item.extracted_data?.email;
        const userName = user?.name || item.extracted_data?.name || 'there';
        const previewUrl = item.live_url || `${process.env.HOST_URL || 'https://myfolio.tech'}/p/${siteId}`;
        const retryUrl = `${process.env.HOST_URL || 'https://myfolio.tech'}/payment/retry?userId=${item.user_id}`;

        if (userEmail && typeof this.db.hasEmailBeenSent === 'function') {
          const sent = await this.db.hasEmailBeenSent(item.user_id, 'preview_expired_cryo');
          if (!sent && typeof this.email.sendPreviewExpiredCryoEmail === 'function') {
            await this.email.sendPreviewExpiredCryoEmail(userEmail, {
              userId: item.user_id,
              name: userName,
              previewUrl,
              retryUrl
            });
          }
        }
      } catch (err) {
        console.warn('[LIFECYCLE] Error sending preview expired cryo email:', err.message);
      }
    }
  }

  /**
   * Transition to permanent deleted state and purge design/build artifact
   */
  async transitionToDeleted(item, reason = '') {
    const siteId = item.id;
    const siteDir = path.join(process.cwd(), 'public', 'sites', siteId);

    // Purge design & build artifact from disk, Netlify and Supabase CDN
    if (this.hostingProvider) {
      await this.hostingProvider.purge(siteId).catch(() => {});
      console.log(`[LIFECYCLE] Purged site multi-surface deployment for: ${siteId}`);
    } else {
      const siteDir = path.join(process.cwd(), 'public', 'sites', siteId);
      if (fs.existsSync(siteDir)) {
        try {
          fs.rmSync(siteDir, { recursive: true, force: true });
          console.log(`[LIFECYCLE] Purged site directory: ${siteDir}`);
        } catch (rmErr) {
          console.warn(`[LIFECYCLE] Error removing site directory ${siteDir}:`, rmErr.message);
        }
      }
    }

    // Update DB record
    await this.db.updateConversation(siteId, {
      status: 'deleted',
      lifecycle_state: LIFECYCLE_STATES.DELETED,
      design_brief: null,
      extracted_data: {},
      state_entered_at: new Date().toISOString()
    });

    try {
      await this.db.updateSiteByProviderId(siteId, {
        status: 'deleted',
        lifecycle_state: LIFECYCLE_STATES.DELETED
      });
    } catch (e) {}

    // Audit log
    await this.db.recordAuditLog({
      admin_identifier: 'system_cron',
      action: 'state_transition_deleted',
      target_user_id: item.user_id,
      reason,
      details: { siteId, previous_state: item.lifecycle_state || item.status }
    });
  }

  // =========================================================================
  // Admin Manual Overrides (Section 7)
  // =========================================================================

  async overrideGracePeriod(userId, extraDays, adminId, reason = 'Customer support request') {
    const extraMs = Number(extraDays) * 24 * 60 * 60 * 1000;
    const conversation = await this.db.getConversation(userId);
    if (!conversation) throw new Error('User conversation not found');

    const currentEntered = conversation.state_entered_at ? new Date(conversation.state_entered_at).getTime() : Date.now();
    const newEnteredAt = new Date(currentEntered + extraMs).toISOString();

    await this.db.updateConversation(conversation.id, {
      state_entered_at: newEnteredAt
    });

    await this.db.recordAuditLog({
      admin_identifier: adminId,
      action: 'override_grace_period',
      target_user_id: userId,
      reason,
      details: { extraDays, newEnteredAt }
    });

    return { success: true, message: `Grace period extended by ${extraDays} days` };
  }

  async forceRestoreAccount(userId, adminId, reason = 'Payment gateway resolution') {
    const conversation = await this.db.getConversation(userId);
    if (!conversation) throw new Error('User conversation not found');

    await this.db.updateConversation(conversation.id, {
      status: 'paid',
      lifecycle_state: LIFECYCLE_STATES.LIVE,
      state_entered_at: new Date().toISOString()
    });

    await this.db.recordAuditLog({
      admin_identifier: adminId,
      action: 'force_restore_account',
      target_user_id: userId,
      reason,
      details: { previous_state: conversation.lifecycle_state }
    });

    return { success: true, message: 'Account force restored to live state' };
  }

  async forceTakedownAccount(userId, adminId, reason = 'Terms of service violation / Chargeback') {
    const conversation = await this.db.getConversation(userId);
    if (!conversation) throw new Error('User conversation not found');

    await this.transitionToDeleted(conversation, reason);

    await this.db.recordAuditLog({
      admin_identifier: adminId,
      action: 'force_takedown_account',
      target_user_id: userId,
      reason,
      details: { siteId: conversation.id }
    });

    return { success: true, message: 'Account forced takedown completed' };
  }
}

module.exports = { LifecycleService, LIFECYCLE_STATES };
