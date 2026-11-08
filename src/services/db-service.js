/**
 * Database Service - Supabase Wrapper
 * All database operations go through here
 */

// Ensure WebSocket is defined for @supabase/supabase-js realtime initialization across any Node.js environment
if (typeof globalThis.WebSocket === 'undefined') {
  globalThis.WebSocket = class WebSocketShim {
    constructor() {}
    addEventListener() {}
    removeEventListener() {}
    send() {}
    close() {}
  };
}

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

class DatabaseService {
  constructor(supabaseUrl, supabaseKey) {
    if (supabaseUrl && supabaseKey) {
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      });
    } else {
      // In-memory / Mock client fallback for localized testing & graceful degradation
      this.client = this._createMockClient();
    }
    this._memoryStore = {
      users: new Map(),
      sessions: new Map(),
      verificationTokens: new Map(),
      passwordResetTokens: new Map(),
      rateLimits: new Map(),
      conversations: new Map(),
      clientSites: new Map(),
      payments: new Map(),
      auditLogs: [],
      emailLogs: [],
      analytics: []
    };
  }

  _createMockClient() {
    const createChain = () => {
      const chain = {
        eq: () => chain,
        gte: () => chain,
        lte: () => chain,
        in: () => chain,
        order: () => chain,
        limit: () => chain,
        select: () => chain,
        single: async () => ({ data: null, error: null }),
        maybeSingle: async () => ({ data: null, error: null }),
        upsert: async () => ({ data: null, error: null }),
        update: () => chain,
        insert: (payload) => ({ select: () => ({ single: async () => ({ data: { id: 'usr_' + Date.now(), ...(Array.isArray(payload) ? payload[0] : payload) }, error: null }) }) }),
        delete: () => chain
      };
      return chain;
    };

    return {
      from: () => createChain()
    };
  }

  static normalizeEmail(email) {
    if (!email) return '';
    return email.trim().toLowerCase();
  }

  // ==========================================
  // Core User Operations
  // ==========================================

  static isSuperAdminEmail(email) {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    const cleanEmail = DatabaseService.normalizeEmail(email);
    return Boolean(cleanEmail && adminEmails.includes(cleanEmail));
  }

  static isSuperAdminEmailOrUsername(email, username) {
    if (DatabaseService.isSuperAdminEmail(email)) return true;
    const adminUsernames = (process.env.ADMIN_USERNAMES || '')
      .split(',')
      .map(u => u.trim().toLowerCase())
      .filter(Boolean);
    const cleanUsername = (username || '').trim().toLowerCase();
    return Boolean(cleanUsername && adminUsernames.includes(cleanUsername));
  }

  _decorateUser(user) {
    if (!user) return null;
    const adminUsernames = (process.env.ADMIN_USERNAMES || '')
      .split(',')
      .map(u => u.trim().toLowerCase())
      .filter(Boolean);
    const isSuperAdmin =
      DatabaseService.isSuperAdminEmail(user.email || user.normalized_email) ||
      (user.username && adminUsernames.includes(user.username.trim().toLowerCase())) ||
      user.role === 'admin' ||
      user.is_admin === true;
    if (isSuperAdmin) {
      user.role = 'admin';
      user.is_admin = true;
      user.plan = 'unlimited';
      user.unlimited_generations = true;
      user.email_verified = true;
      user.rate_limit_exempt = true;
      user.allowance = 999999;
      user.tier = 'vip_founder';
    }
    return user;
  }

  async getUser(phoneNumber) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return this._decorateUser(data);
  }

  async createUser(phoneNumber) {
    const { data, error } = await this.client
      .from('users')
      .insert({ phone_number: phoneNumber })
      .select()
      .single();

    if (error) throw error;
    return this._decorateUser(data);
  }

  async createUserWithPassword({ name, email, username, passwordHash, role = 'user', phone = null, emailVerified = false }) {
    const normalizedEmail = DatabaseService.normalizeEmail(email);
    const cleanUsername = username ? username.trim().toLowerCase() : null;
    const isSuperAdmin = DatabaseService.isSuperAdminEmailOrUsername(normalizedEmail, cleanUsername);

    const payload = {
      name: name || (isSuperAdmin ? 'Abdul Aziz' : ''),
      email: email.trim(),
      normalized_email: normalizedEmail,
      username: cleanUsername,
      password_hash: passwordHash,
      role: isSuperAdmin ? 'admin' : (role || 'user'),
      phone_number: phone || `web_${normalizedEmail.replace(/[^a-z0-9]/g, '')}`,
      email_verified: isSuperAdmin ? true : Boolean(emailVerified),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await this.client
      .from('users')
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === '42703' || error.code === 'PGRST204' || (error.message && error.message.includes('column'))) {
        const fallbackPayload = {
          email: email.trim(),
          phone_number: phone || `web_${normalizedEmail.replace(/[^a-z0-9]/g, '')}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        if (name) fallbackPayload.name = name;
        if (cleanUsername) fallbackPayload.username = cleanUsername;
        if (passwordHash) fallbackPayload.password_hash = passwordHash;
        if (role) fallbackPayload.role = isSuperAdmin ? 'admin' : role;
        if (normalizedEmail) fallbackPayload.normalized_email = normalizedEmail;
        fallbackPayload.email_verified = isSuperAdmin ? true : Boolean(emailVerified);

        const { data: fallbackData, error: fbError } = await this.client
          .from('users')
          .insert(fallbackPayload)
          .select()
          .single();

        if (fbError) throw fbError;
        return this._decorateUser(fallbackData);
      }
      throw error;
    }
    return this._decorateUser(data);
  }

  async getUserById(userId) {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return this._decorateUser(data);
  }

  async getUserByNormalizedEmail(email) {
    const normalized = DatabaseService.normalizeEmail(email);
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('normalized_email', normalized)
        .single();

      if (error && error.code !== 'PGRST116') {
        if (error.code === '42703' || (error.message && error.message.includes('column'))) {
          const { data: fallbackData } = await this.client
            .from('users')
            .select('*')
            .eq('phone_number', `web_${normalized.replace(/[^a-z0-9]/g, '')}`)
            .single();
          return this._decorateUser(fallbackData);
        }
        throw error;
      }
      return this._decorateUser(data);
    } catch (e) {
      return null;
    }
  }

  async getUserByUsername(username) {
    if (!username || typeof username !== 'string') return null;
    const clean = username.trim().toLowerCase();
    try {
      const { data, error } = await this.client
        .from('users')
        .select('*')
        .eq('username', clean)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return this._decorateUser(data);
    } catch (e) {
      return null;
    }
  }

  async getUserByEmailOrUsername(identifier) {
    if (!identifier || typeof identifier !== 'string') return null;
    const isEmail = identifier.includes('@');
    if (isEmail) {
      return await this.getUserByNormalizedEmail(identifier);
    }
    return await this.getUserByUsername(identifier);
  }

  async updateUser(userId, updates) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    const { error } = await this.client
      .from('users')
      .update(cleanUpdates)
      .eq('id', userId);

    if (error) {
      if (error.code === '42703' || error.code === 'PGRST204' || (error.message && error.message.includes('column'))) {
        const safeUpdates = { ...cleanUpdates };
        delete safeUpdates.normalized_email;
        delete safeUpdates.email_marketing_opt_in;
        delete safeUpdates.email_verified;
        delete safeUpdates.password_hash;
        delete safeUpdates.failed_login_attempts;
        delete safeUpdates.locked_until;
        delete safeUpdates.avatar_url;
        delete safeUpdates.is_admin;
        delete safeUpdates.plan;
        delete safeUpdates.unlimited_generations;
        delete safeUpdates.tier;
        delete safeUpdates.allowance;
        const { error: fbErr } = await this.client.from('users').update(safeUpdates).eq('id', userId);
        if (fbErr) {
          // Minimal fallback with just basic fields
          await this.client.from('users').update({
            name: cleanUpdates.name || undefined,
            username: cleanUpdates.username || undefined,
            updated_at: new Date().toISOString()
          }).eq('id', userId);
        }
        return;
      }
      throw error;
    }
  }

  // ==========================================
  // Session Management
  // ==========================================

  async createSession({ userId, tokenHash, userAgent = '', ipAddress = '', maxAgeMs = 7 * 24 * 60 * 60 * 1000 }) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + maxAgeMs).toISOString();

    const { data, error } = await this.client
      .from('sessions')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        user_agent: userAgent ? userAgent.substring(0, 500) : 'Unknown Device',
        ip_address: ipAddress ? ipAddress.substring(0, 100) : 'Unknown IP',
        expires_at: expiresAt,
        created_at: now.toISOString(),
        last_active_at: now.toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getSessionByTokenHash(tokenHash) {
    if (!tokenHash) return null;
    const { data, error } = await this.client
      .from('sessions')
      .select('*, users(*)')
      .eq('token_hash', tokenHash)
      .single();

    if (error && error.code !== 'PGRST116') return null;
    if (!data) return null;

    // Check expiration
    if (new Date(data.expires_at).getTime() < Date.now()) {
      await this.deleteSession(data.id);
      return null;
    }

    return data;
  }

  async getUserActiveSessions(userId) {
    const now = new Date().toISOString();
    const { data, error } = await this.client
      .from('sessions')
      .select('id, user_agent, ip_address, created_at, last_active_at, expires_at')
      .eq('user_id', userId)
      .gt('expires_at', now)
      .order('last_active_at', { ascending: false });

    if (error) return [];
    return data || [];
  }

  async touchSession(sessionId) {
    try {
      await this.client
        .from('sessions')
        .update({ last_active_at: new Date().toISOString() })
        .eq('id', sessionId);
    } catch (e) {
      // Non-critical touch failure
    }
  }

  async deleteSession(sessionId, userId = null) {
    let query = this.client.from('sessions').delete().eq('id', sessionId);
    if (userId) {
      query = query.eq('user_id', userId);
    }
    const { error } = await query;
    if (error) throw error;
    return true;
  }

  async deleteAllUserSessions(userId, exceptSessionId = null) {
    let query = this.client.from('sessions').delete().eq('user_id', userId);
    if (exceptSessionId) {
      query = query.neq('id', exceptSessionId);
    }
    const { error } = await query;
    if (error) throw error;
    return true;
  }

  // ==========================================
  // Verification Tokens
  // ==========================================

  async createVerificationToken(userId, tokenHash, expiresInMs = 24 * 60 * 60 * 1000) {
    const expiresAt = new Date(Date.now() + expiresInMs).toISOString();

    // Invalidate any existing unused tokens for this user
    await this.client
      .from('verification_tokens')
      .delete()
      .eq('user_id', userId);

    const { data, error } = await this.client
      .from('verification_tokens')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getVerificationToken(tokenHash) {
    if (!tokenHash) return null;
    const { data, error } = await this.client
      .from('verification_tokens')
      .select('*, users(*)')
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .single();

    if (error && error.code !== 'PGRST116') return null;
    if (!data) return null;

    if (new Date(data.expires_at).getTime() < Date.now()) {
      return null;
    }
    return data;
  }

  async markVerificationTokenUsed(tokenId, userId) {
    await this.client
      .from('verification_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenId);

    await this.updateUser(userId, { email_verified: true });
  }

  // ==========================================
  // Password Reset Tokens
  // ==========================================

  async createPasswordResetToken(userId, tokenHash, expiresInMs = 60 * 60 * 1000) {
    const expiresAt = new Date(Date.now() + expiresInMs).toISOString();

    // Invalidate any older reset tokens
    await this.client
      .from('password_reset_tokens')
      .delete()
      .eq('user_id', userId);

    const { data, error } = await this.client
      .from('password_reset_tokens')
      .insert({
        user_id: userId,
        token_hash: tokenHash,
        expires_at: expiresAt,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getPasswordResetToken(tokenHash) {
    if (!tokenHash) return null;
    const { data, error } = await this.client
      .from('password_reset_tokens')
      .select('*, users(*)')
      .eq('token_hash', tokenHash)
      .is('used_at', null)
      .single();

    if (error && error.code !== 'PGRST116') return null;
    if (!data) return null;

    if (new Date(data.expires_at).getTime() < Date.now()) {
      return null;
    }
    return data;
  }

  async markPasswordResetTokenUsed(tokenId, userId, newPasswordHash) {
    // 1. Mark token used
    await this.client
      .from('password_reset_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenId);

    // 2. Update password hash & reset failed attempts
    await this.updateUser(userId, {
      password_hash: newPasswordHash,
      failed_login_attempts: 0,
      locked_until: null
    });

    // 3. Invalidate ALL existing active sessions for security
    await this.deleteAllUserSessions(userId);
  }

  // ==========================================
  // Progressive Delays & Brute Force Management
  // ==========================================

  async recordLoginAttempt(identifier, success, ip = '') {
    const user = await this.getUserByEmailOrUsername(identifier);
    if (!user) return;

    if (success) {
      await this.updateUser(user.id, {
        failed_login_attempts: 0,
        locked_until: null,
        last_login_at: new Date().toISOString(),
        last_login_ip: ip
      });
    } else {
      const attempts = (user.failed_login_attempts || 0) + 1;
      let lockedUntil = null;

      // Progressive temporary backoff (never permanent)
      if (attempts >= 5) {
        const cooldownMinutes = Math.min(60, Math.pow(2, attempts - 5) * 5); // 5m, 10m, 20m, 40m, max 60m
        lockedUntil = new Date(Date.now() + cooldownMinutes * 60 * 1000).toISOString();
      }

      await this.updateUser(user.id, {
        failed_login_attempts: attempts,
        locked_until: lockedUntil
      });
    }
  }

  // ==========================================
  // Secure Account Deletion
  // ==========================================

  async deleteUserAccount(userId) {
    if (!userId) throw new Error('User ID is required');

    // 1. Invalidate all sessions
    await this.deleteAllUserSessions(userId);

    // 2. Remove tokens
    await this.client.from('verification_tokens').delete().eq('user_id', userId);
    await this.client.from('password_reset_tokens').delete().eq('user_id', userId);

    // 3. Delete user's conversations and client sites
    await this.client.from('conversations').delete().eq('user_id', userId);
    await this.client.from('client_sites').delete().eq('user_id', userId);

    // 4. Delete user record
    const { error } = await this.client.from('users').delete().eq('id', userId);
    if (error) throw error;

    return true;
  }

  // ==========================================
  // Existing Conversation, Site, Payment Methods
  // ==========================================

  async getConversation(userId) {
    if (!userId || typeof userId !== 'string') return null;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    if (!isUuid) return null;

    const { data, error } = await this.client
      .from('conversations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  async createConversation(userId) {
    const { data, error } = await this.client
      .from('conversations')
      .insert({ user_id: userId, status: 'idle' })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateConversation(conversationId, updates) {
    const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
    const { error } = await this.client
      .from('conversations')
      .update(cleanUpdates)
      .eq('id', conversationId);

    if (error) {
      if (error.code === 'PGRST204' || (error.message && error.message.includes('column'))) {
        const safeUpdates = { ...cleanUpdates };
        delete safeUpdates.lifecycle_state;
        delete safeUpdates.state_entered_at;
        const { error: retryErr } = await this.client
          .from('conversations')
          .update(safeUpdates)
          .eq('id', conversationId);
        if (retryErr) {
          console.warn('[DB] updateConversation fallback error:', retryErr.message);
        }
        return;
      }
      throw error;
    }
  }

  async isMessageProcessed(messageId) {
    const { data, error } = await this.client
      .from('processed_messages')
      .select('message_id')
      .eq('message_id', messageId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  }

  async markMessageProcessed(messageId, userId = null) {
    const isValidUuid = typeof userId === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);
    const safeUserId = isValidUuid ? userId : null;

    const { error } = await this.client
      .from('processed_messages')
      .insert({ message_id: messageId, user_id: safeUserId })
      .single();

    if (error && error.code !== '23505') throw error;
  }

  async createSite(userId, provider, providerSiteId) {
    const { data, error } = await this.client
      .from('client_sites')
      .insert({
        user_id: userId,
        hosting_provider: provider,
        provider_site_id: providerSiteId,
        status: 'preview'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateSite(siteId, updates) {
    const { error } = await this.client
      .from('client_sites')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', siteId);

    if (error) throw error;
  }

  async recordPayment(paymentId, userId, amount, gateway) {
    const { error } = await this.client
      .from('payments')
      .insert({
        payment_id: paymentId,
        user_id: userId,
        amount,
        gateway,
        status: 'pending'
      });

    if (error) throw error;
  }

  async getPayment(paymentId) {
    const { data, error } = await this.client
      .from('payments')
      .select('*')
      .eq('payment_id', paymentId)
      .single();

    if (error) throw error;
    return data;
  }

  async updatePaymentStatus(paymentId, status) {
    const { error } = await this.client
      .from('payments')
      .update({ status, processed_at: new Date().toISOString() })
      .eq('payment_id', paymentId);

    if (error) throw error;
  }

  async checkRateLimit(identifier, action, maxCount = 10, windowMinutes = 1) {
    const adminEmails = (process.env.ADMIN_EMAILS || '')
      .split(',')
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);
    const adminUsernames = (process.env.ADMIN_USERNAMES || '')
      .split(',')
      .map(u => u.trim().toLowerCase())
      .filter(Boolean);

    if (
      DatabaseService.isSuperAdminEmailOrUsername(identifier, identifier) ||
      (typeof identifier === 'string' && (
        adminEmails.some(e => e && identifier.toLowerCase().includes(e.replace(/[^a-z0-9]/g, ''))) ||
        adminUsernames.some(u => u && identifier.toLowerCase().includes(u))
      ))
    ) {
      return true; // Zero restrictions, 100% exempt
    }

    const windowStart = new Date(Date.now() - windowMinutes * 60 * 1000).toISOString();

    const { data, error } = await this.client
      .from('rate_limits')
      .select('*')
      .eq('identifier', identifier)
      .eq('action', action)
      .gte('window_start', windowStart)
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    if (!data) {
      await this.client
        .from('rate_limits')
        .upsert({
          identifier,
          action,
          count: 1,
          window_start: new Date().toISOString()
        });
      return true;
    }

    if (data.count >= maxCount) return false;

    await this.client
      .from('rate_limits')
      .update({ count: data.count + 1 })
      .eq('identifier', identifier)
      .eq('action', action);

    return true;
  }

  static normalizeEmail(email) {
    if (!email || typeof email !== 'string') return '';
    const clean = email.trim().toLowerCase();
    const parts = clean.split('@');
    if (parts.length !== 2) return clean;
    let [local, domain] = parts;
    local = local.split('+')[0];
    return `${local}@${domain}`;
  }

  _getEmailLogFilePath() {
    return path.join(process.cwd(), 'src', 'data', 'email-dispatch-history.json');
  }

  _loadEmailLogsFromFile() {
    try {
      const filePath = this._getEmailLogFilePath();
      if (!fs.existsSync(filePath)) return [];
      const content = fs.readFileSync(filePath, 'utf8');
      const parsed = JSON.parse(content);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  _persistEmailLogToFile(entry) {
    try {
      const filePath = this._getEmailLogFilePath();
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      const existing = this._loadEmailLogsFromFile();
      existing.push(entry);
      // Retain the last 2000 logs to prevent file bloat
      const trimmed = existing.slice(-2000);
      fs.writeFileSync(filePath, JSON.stringify(trimmed, null, 2), 'utf8');
    } catch (e) {
      // Non-blocking
    }
  }

  async recordEmailLog(logData) {
    const isUuid = (val) => typeof val === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(val);
    const cleanEmail = logData.email ? logData.email.toLowerCase().trim() : '';
    const nowIso = new Date().toISOString();

    const memEntry = {
      id: `elog_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      user_id: logData.user_id || null,
      email: cleanEmail,
      sequence_type: logData.sequence_type || null,
      trigger_name: logData.trigger_name,
      status: logData.status || 'sent',
      sent_at: nowIso
    };

    // 1. In-memory storage for immediate session deduplication
    if (!this._memoryStore) this._memoryStore = {};
    if (!Array.isArray(this._memoryStore.emailLogs)) this._memoryStore.emailLogs = [];
    this._memoryStore.emailLogs.push(memEntry);

    // 2. Persist to local JSON file so restarts retain history
    this._persistEmailLogToFile(memEntry);

    // 3. Persist to Supabase if available (only using valid schema columns)
    if (this.client && process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)) {
      try {
        const dbPayload = {
          user_id: isUuid(logData.user_id) ? logData.user_id : null,
          email: cleanEmail,
          trigger_name: logData.trigger_name,
          status: logData.status || 'sent',
          error_message: logData.error_message || null,
          sent_at: nowIso
        };
        const { error } = await this.client
          .from('email_logs')
          .insert(dbPayload);
        if (error && error.code !== '42P01') {
          console.warn('[DB] Supabase recordEmailLog notice:', error.message);
        }
      } catch (err) {
        // Handled by in-memory & file storage
      }
    }
  }

  async hasEmailBeenSent(identifier, triggerName) {
    if (!identifier) return false;
    const cleanId = typeof identifier === 'string' ? identifier.trim() : String(identifier);
    const isEmail = cleanId.includes('@');
    const cleanEmail = isEmail ? cleanId.toLowerCase() : null;

    // 1. Check in-memory store
    if (this._memoryStore?.emailLogs?.length) {
      const foundInMem = this._memoryStore.emailLogs.some(log => {
        if (log.trigger_name !== triggerName) return false;
        if (cleanEmail && log.email && log.email.toLowerCase() === cleanEmail) return true;
        if (log.user_id && log.user_id === cleanId) return true;
        return false;
      });
      if (foundInMem) return true;
    }

    // 2. Check local file persistence
    const fileLogs = this._loadEmailLogsFromFile();
    if (fileLogs.length) {
      const foundInFile = fileLogs.some(log => {
        if (log.trigger_name !== triggerName) return false;
        if (cleanEmail && log.email && log.email.toLowerCase() === cleanEmail) return true;
        if (log.user_id && log.user_id === cleanId) return true;
        return false;
      });
      if (foundInFile) return true;
    }

    // 3. Check Supabase
    if (this.client && process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)) {
      try {
        let query = this.client
          .from('email_logs')
          .select('id')
          .eq('trigger_name', triggerName);

        if (cleanEmail) {
          query = query.eq('email', cleanEmail);
        } else {
          query = query.eq('user_id', cleanId);
        }

        const { data, error } = await query.limit(1);
        if (!error && Array.isArray(data) && data.length > 0) return true;
      } catch (e) {
        // Fall back to false
      }
    }

    return false;
  }

  async getLastEmailSentTime(identifier, email = null) {
    const cleanId = identifier ? String(identifier).trim() : null;
    const cleanEmail = email ? email.toLowerCase().trim() : (cleanId && cleanId.includes('@') ? cleanId.toLowerCase() : null);

    let latestTime = 0;

    // 1. In-memory check
    if (this._memoryStore?.emailLogs?.length) {
      for (const log of this._memoryStore.emailLogs) {
        const matchesUser = (cleanId && log.user_id && log.user_id === cleanId);
        const matchesEmail = (cleanEmail && log.email && log.email.toLowerCase() === cleanEmail);
        if (matchesUser || matchesEmail) {
          const t = new Date(log.sent_at).getTime();
          if (t > latestTime) latestTime = t;
        }
      }
    }

    // 2. File persistence check
    const fileLogs = this._loadEmailLogsFromFile();
    for (const log of fileLogs) {
      const matchesUser = (cleanId && log.user_id && log.user_id === cleanId);
      const matchesEmail = (cleanEmail && log.email && log.email.toLowerCase() === cleanEmail);
      if (matchesUser || matchesEmail) {
        const t = new Date(log.sent_at).getTime();
        if (t > latestTime) latestTime = t;
      }
    }

    // 3. Supabase check
    if (this.client && process.env.SUPABASE_URL && (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY)) {
      try {
        let query = this.client
          .from('email_logs')
          .select('sent_at')
          .order('sent_at', { ascending: false })
          .limit(1);

        if (cleanEmail) {
          query = query.eq('email', cleanEmail);
        } else if (cleanId) {
          query = query.eq('user_id', cleanId);
        }

        const { data } = await query;
        if (Array.isArray(data) && data[0]?.sent_at) {
          const t = new Date(data[0].sent_at).getTime();
          if (t > latestTime) latestTime = t;
        }
      } catch (e) {}
    }

    return latestTime;
  }

  async recordAuditLog(auditData) {
    const { error } = await this.client
      .from('admin_audit_logs')
      .insert({
        admin_identifier: auditData.admin_identifier || 'system',
        action: auditData.action,
        target_user_id: auditData.target_user_id,
        reason: auditData.reason,
        details: auditData.details || {},
        created_at: new Date().toISOString()
      });

    if (error && error.code !== '42P01' && !error.message?.includes('schema cache')) {
      console.warn('[DB] recordAuditLog warning:', error.message);
    }
  }

  async getUnpaidPreviews() {
    const { data, error } = await this.client
      .from('conversations')
      .select('*, users(*)')
      .in('status', ['preview_live', 'preview_unpaid']);

    if (error) return [];
    return data || [];
  }

  async getLapsedAccounts() {
    const { data, error } = await this.client
      .from('conversations')
      .select('*, users(*)')
      .in('status', ['preview_lapsed', 'grace_period', 'suspended']);

    if (error) return [];
    return data || [];
  }

  async getOptedInUnconvertedUsers() {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('email_marketing_opt_in', true);

    if (error) return [];
    return data || [];
  }

  async updateSiteByProviderId(providerSiteId, updates) {
    try {
      const cleanUpdates = { ...updates, updated_at: new Date().toISOString() };
      const { error } = await this.client
        .from('client_sites')
        .update(cleanUpdates)
        .eq('provider_site_id', providerSiteId);

      if (error) {
        if (error.code === 'PGRST204') {
          const safeUpdates = { ...cleanUpdates };
          delete safeUpdates.lifecycle_state;
          await this.client.from('client_sites').update(safeUpdates).eq('provider_site_id', providerSiteId);
          return;
        }
        console.warn('[DB] updateSiteByProviderId warning:', error.message);
      }
    } catch (e) {
      console.warn('[DB] updateSiteByProviderId catch warning:', e.message);
    }
  }

  async checkWeeklyLimit(userId, maxGenerations = 3) {
    if (!userId) return true;
    const now = Date.now();
    const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
    const oneWeekAgo = new Date(now - oneWeekMs).toISOString();

    const memKey = `${userId}:weekly_preview_generation`;
    let memRecord = this._memoryStore?.rateLimits?.get(memKey);
    if (memRecord && (now - memRecord.windowStart > oneWeekMs)) {
      memRecord = null;
    }

    if (this.client && process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data, error } = await this.client
          .from('rate_limits')
          .select('*')
          .eq('identifier', userId)
          .eq('action', 'weekly_preview_generation')
          .gte('window_start', oneWeekAgo)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') throw error;

        if (!data) {
          await this.client
            .from('rate_limits')
            .upsert({
              identifier: userId,
              action: 'weekly_preview_generation',
              count: 1,
              window_start: new Date().toISOString()
            });
          if (this._memoryStore?.rateLimits) {
            this._memoryStore.rateLimits.set(memKey, { count: 1, windowStart: now });
          }
          return true;
        }

        if (data.count >= maxGenerations) {
          if (this._memoryStore?.rateLimits) {
            this._memoryStore.rateLimits.set(memKey, { count: data.count, windowStart: new Date(data.window_start).getTime() });
          }
          return false;
        }

        await this.client
          .from('rate_limits')
          .update({ count: data.count + 1 })
          .eq('identifier', userId)
          .eq('action', 'weekly_preview_generation');

        if (this._memoryStore?.rateLimits) {
          this._memoryStore.rateLimits.set(memKey, { count: data.count + 1, windowStart: new Date(data.window_start).getTime() });
        }
        return true;
      } catch (err) {
        // Fall back to memoryStore if DB query fails
      }
    }

    // In-memory fallback (when running with mock client or during local testing)
    if (!memRecord) {
      if (this._memoryStore?.rateLimits) {
        this._memoryStore.rateLimits.set(memKey, { count: 1, windowStart: now });
      }
      return true;
    }

    if (memRecord.count >= maxGenerations) {
      return false;
    }

    memRecord.count += 1;
    if (this._memoryStore?.rateLimits) {
      this._memoryStore.rateLimits.set(memKey, memRecord);
    }
    return true;
  }

  async recordAnalyticsEvent(siteId, eventType = 'page_view', visitorHash = null, referrer = null, metadata = {}) {
    const { error } = await this.client
      .from('site_analytics')
      .insert({
        site_id: siteId,
        event_type: eventType,
        visitor_hash: visitorHash,
        referrer: referrer,
        metadata: metadata,
        created_at: new Date().toISOString()
      });

    if (error && error.code !== '42P01') {
      console.warn('[DB] recordAnalyticsEvent warning:', error.message);
    }
  }

  async getSiteAnalytics(siteId) {
    const { data, error } = await this.client
      .from('site_analytics')
      .select('*')
      .eq('site_id', siteId);

    if (error || !data) return { totalViews: 0, uniqueVisitors: 0, events: [] };

    const uniqueHashes = new Set(data.map(d => d.visitor_hash).filter(Boolean));
    return {
      totalViews: data.filter(d => d.event_type === 'page_view').length,
      uniqueVisitors: uniqueHashes.size,
      contactSubmissions: data.filter(d => d.event_type === 'contact_submit').length,
      events: data
    };
  }

  async getAdminOverviewStats() {
    try {
      const { data: convs } = await this.client.from('conversations').select('id, status, lifecycle_state, created_at, state_entered_at');
      const { data: users } = await this.client.from('users').select('id');
      const { data: payments } = await this.client.from('payments').select('amount, status').eq('status', 'captured');

      const allConvs = convs || [];
      const liveCount = allConvs.filter(c => c.lifecycle_state === 'live' || c.status === 'paid').length;
      const lapsedCount = allConvs.filter(c => c.lifecycle_state === 'preview_lapsed' || c.status === 'preview_lapsed').length;
      const previewCount = allConvs.filter(c => c.lifecycle_state === 'preview_unpaid' || c.status === 'preview_live').length;
      const totalRevenue = (payments || []).reduce((acc, p) => acc + (p.amount ? p.amount / 100 : 0), 0);

      return {
        totalUsers: (users || []).length,
        activeSubscribers: liveCount,
        lapsedAccounts: lapsedCount,
        activePreviews: previewCount,
        totalRevenue: Math.round(totalRevenue)
      };
    } catch (e) {
      return { totalUsers: 0, activeSubscribers: 0, lapsedAccounts: 0, activePreviews: 0, totalRevenue: 0 };
    }
  }

  async getAllAdminUsers(limit = 100) {
    try {
      let users = [];
      const { data, error } = await this.client
        .from('users')
        .select('*, conversations(*), client_sites(*)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        const { data: fallbackUsers } = await this.client
          .from('users')
          .select('*, conversations(*)')
          .order('created_at', { ascending: false })
          .limit(limit);
        users = fallbackUsers || [];
      } else {
        users = data || [];
      }

      return users.map(u => {
        const conv = (u.conversations && u.conversations[0]) || {};
        const clientSites = Array.isArray(u.client_sites) ? u.client_sites : [];
        const sortedClientSites = clientSites.slice().sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        const latestClientSite = sortedClientSites[0] || null;

        const email = (u.email || u.normalized_email || '').toLowerCase().trim();
        const isVipFounder = DatabaseService.isSuperAdminEmail(email);

        let siteId = (latestClientSite && (latestClientSite.provider_site_id || latestClientSite.id)) || conv.id || null;
        if (!siteId && isVipFounder) siteId = 'abdulaziz';

        let status = 'no_site_yet';
        if (siteId) {
          const createdAt = latestClientSite?.created_at || conv.created_at || u.created_at;
          const ageMs = createdAt ? (Date.now() - new Date(createdAt).getTime()) : 0;
          const isPast24Hours = ageMs > (24 * 60 * 60 * 1000);

          if (latestClientSite?.status === 'deleted' || conv.status === 'deleted' || conv.lifecycle_state === 'deleted') {
            status = 'deleted';
          } else if (isVipFounder || u.plan === 'pro' || u.plan === 'starter' || u.is_vip || latestClientSite?.status === 'live' || latestClientSite?.status === 'paid' || conv.status === 'live' || conv.lifecycle_state === 'live') {
            status = 'live';
          } else if (latestClientSite?.status === 'preview_lapsed' || conv.lifecycle_state === 'preview_lapsed' || conv.status === 'preview_lapsed' || isPast24Hours) {
            status = 'expired';
          } else {
            status = 'preview';
          }
        }

        return {
          ...u,
          siteId,
          siteUrl: siteId ? `/p/${siteId}` : null,
          computedStatus: status
        };
      });
    } catch (e) {
      return [];
    }
  }

  async getRecentAuditLogs(limit = 30) {
    try {
      const { data, error } = await this.client
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return [];
      return data || [];
    } catch (e) {
      return [];
    }
  }

  async recordTosViolation(violationData) {
    try {
      const logRecord = {
        admin_identifier: 'content_safety_sentinel',
        action: 'tos_violation_flagged',
        target_user_id: violationData.userId || violationData.siteId || 'anonymous_user',
        reason: `${violationData.section} (${violationData.severity})`,
        details: {
          siteId: violationData.siteId,
          ruleId: violationData.ruleId,
          section: violationData.section,
          termTitle: violationData.termTitle,
          severity: violationData.severity,
          reason: violationData.reason,
          evidenceSnippet: violationData.evidenceSnippet,
          status: 'FLAGGED',
          contentPreview: violationData.contentPreview || ''
        },
        created_at: new Date().toISOString()
      };
      await this.recordAuditLog(logRecord);
      return logRecord;
    } catch (e) {
      console.warn('[DB] recordTosViolation error:', e.message);
      return null;
    }
  }

  async getTosViolations(limit = 50) {
    try {
      const { data, error } = await this.client
        .from('admin_audit_logs')
        .select('*')
        .eq('action', 'tos_violation_flagged')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return [];
      return (data || []).map(d => ({
        id: d.id || `viol-${Math.random().toString(36).substr(2, 9)}`,
        userId: d.target_user_id,
        siteId: d.details?.siteId || d.target_user_id,
        ruleId: d.details?.ruleId || 'TOS_POLICY',
        section: d.details?.section || d.reason || 'General Terms of Service',
        termTitle: d.details?.termTitle || 'Prohibited Content & Activity Clause',
        severity: d.details?.severity || 'HIGH',
        reason: d.details?.reason || d.reason || 'Flagged for Terms of Service review.',
        evidenceSnippet: d.details?.evidenceSnippet || 'Evidence captured during generation scan.',
        status: d.details?.status || 'FLAGGED',
        createdAt: d.created_at
      }));
    } catch (e) {
      return [];
    }
  }

  async getUserDashboardData(userId) {
    try {
      const isUuid = (str) => typeof str === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
      const user = await this.getUserById(userId);
      let conversation = isUuid(userId) ? await this.getConversation(userId) : null;
      
      // Also look up conversation by user.id if not found
      if (!conversation?.id && user?.id && isUuid(user.id)) {
        conversation = await this.getConversation(user.id);
      }

      const userEmail = (user?.email || '').toLowerCase().trim();
      const isVipFounder = DatabaseService.isSuperAdminEmail(userEmail);

      // Check if user has sites in public/sites or sites table
      let siteId = isVipFounder ? 'abdulaziz' : (conversation?.id || null);
      let hasSite = false;

      const fs = require('fs');
      const path = require('path');
      const sitesBaseDir = path.join(process.cwd(), 'public', 'sites');

      if (siteId && fs.existsSync(path.join(sitesBaseDir, siteId, 'index.html'))) {
        hasSite = true;
      }

      // Fallback: check client_sites table
      let totalBuildsCount = 0;
      if (user?.id && isUuid(user.id)) {
        try {
          const { count } = await this.client
            .from('client_sites')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id);
          if (typeof count === 'number') totalBuildsCount = count;
        } catch (e) {}

        if (!hasSite) {
          try {
            const { data: clientRecord } = await this.client
              .from('client_sites')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            if (clientRecord) {
              const sid = clientRecord.provider_site_id || clientRecord.id;
              siteId = sid;
              hasSite = true;
            }
          } catch (e) {}
        }
      }

      // Fallback: check candidate directory names, ensuring strict ownership verification
      if (!hasSite && user) {
        const candidateNames = [isVipFounder ? 'abdulaziz' : null, user.id, user.username].filter(Boolean);
        for (const cand of candidateNames) {
          const candDir = path.join(sitesBaseDir, cand);
          if (fs.existsSync(path.join(candDir, 'index.html'))) {
            const metaFile = path.join(candDir, 'meta.json');
            let isOwner = isVipFounder;
            if (!isOwner && fs.existsSync(metaFile)) {
              try {
                const meta = JSON.parse(fs.readFileSync(metaFile, 'utf8'));
                if (meta.userId === user.id || (meta.userEmail && meta.userEmail.toLowerCase().trim() === userEmail)) {
                  isOwner = true;
                }
              } catch (e) {}
            }
            if (isOwner) {
              siteId = cand;
              hasSite = true;
              break;
            }
          }
        }
      }

      let analytics = { totalViews: 0, uniqueVisitors: 0 };
      if (hasSite && siteId) {
        analytics = await this.getSiteAnalytics(siteId);
      }

      const isPro = isVipFounder || user?.role === 'pro' || user?.role === 'admin' || user?.subscription_status === 'active' || conversation?.status === 'paid';
      const planName = isVipFounder ? 'VIP Founder / Master Edition' : (isPro ? 'Pro Builder (₹149/mo)' : 'Free Starter Tier');
      const planDetails = isVipFounder
        ? 'Includes VIP custom domain mapping (abdulaziz.myfolio.tech), zero watermarks, edge CDN distribution, and recruiter analytics tracking.'
        : (isPro
          ? 'Includes custom domain mapping, zero watermarks, edge CDN distribution, and recruiter analytics tracking.'
          : 'Includes 100% free live portfolio generation, 24-hour preview links, and high-fidelity 3D templates.');
      const buildsLimit = (isPro || isVipFounder) ? 'Unlimited' : 3;
      const buildsUsed = conversation?.extracted_data?._regens_used || 0;
      const buildsRemaining = (isPro || isVipFounder) ? 'Unlimited' : Math.max(0, 3 - buildsUsed);
      const buildsLabel = (isPro || isVipFounder) ? 'Unlimited Builds Active' : `${buildsRemaining} / 3 Builds Remaining`;

      return {
        user,
        conversation,
        siteId: hasSite ? siteId : null,
        analytics: analytics || { totalViews: 0, uniqueVisitors: 0 },
        regensUsed: buildsUsed,
        totalBuilds: totalBuildsCount,
        plan: {
          name: planName,
          isPro,
          details: planDetails,
          buildsUsed: totalBuildsCount > 0 ? totalBuildsCount : buildsUsed,
          buildsLimit,
          buildsRemaining,
          buildsLabel
        }
      };
    } catch (e) {
      return null;
    }
  }
}

module.exports = { DatabaseService };
