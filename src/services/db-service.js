/**
 * Database Service - Supabase Wrapper
 * All database operations go through here
 */

const { createClient } = require('@supabase/supabase-js');

class DatabaseService {
  constructor(supabaseUrl, supabaseKey) {
    if (supabaseUrl && supabaseKey) {
      this.client = createClient(supabaseUrl, supabaseKey);
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
        select: () => chain,
        single: async () => ({ data: null, error: null }),
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
    const adminEmails = (process.env.ADMIN_EMAILS || 'abdulaziznoor9876@gmail.com,abdul19388383@gmail.com,abdulaziznooruddin670@gmail.com')
      .split(',')
      .map(e => e.trim().toLowerCase());
    const cleanEmail = DatabaseService.normalizeEmail(email);
    return Boolean(cleanEmail && adminEmails.includes(cleanEmail));
  }

  static isSuperAdminEmailOrUsername(email, username) {
    if (DatabaseService.isSuperAdminEmail(email)) return true;
    const adminUsernames = (process.env.ADMIN_USERNAMES || 'abdulazizpro1,abdulazizpro,abdul19388383')
      .split(',')
      .map(u => u.trim().toLowerCase());
    const cleanUsername = (username || '').trim().toLowerCase();
    return Boolean(cleanUsername && adminUsernames.includes(cleanUsername));
  }

  _decorateUser(user) {
    if (!user) return null;
    const adminUsernames = (process.env.ADMIN_USERNAMES || 'abdulazizpro1,abdulazizpro,abdul19388383')
      .split(',')
      .map(u => u.trim().toLowerCase());
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
    if (
      identifier === 'abdulaziznoor9876@gmail.com' ||
      identifier === 'web_abdulaziznoor9876gmailcom' ||
      (typeof identifier === 'string' && (
        identifier.toLowerCase().includes('abdulaziznoor9876') ||
        identifier.toLowerCase().includes('abdulazizpro')
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

  async recordEmailLog(logData) {
    const payload = {
      user_id: logData.user_id,
      email: logData.email,
      sequence_type: logData.sequence_type,
      trigger_name: logData.trigger_name,
      status: logData.status || 'sent',
      sent_at: new Date().toISOString()
    };
    if (logData.email_index !== undefined) {
      payload.email_index = logData.email_index;
    }

    const { error } = await this.client
      .from('email_logs')
      .insert(payload);

    if (error && error.code !== '42P01' && !error.message?.includes('column')) {
      console.warn('[DB] recordEmailLog warning:', error.message);
    }
  }

  async hasEmailBeenSent(userId, triggerName) {
    const { data, error } = await this.client
      .from('email_logs')
      .select('id')
      .eq('user_id', userId)
      .eq('trigger_name', triggerName)
      .limit(1);

    if (error && error.code !== 'PGRST116') return false;
    return Array.isArray(data) && data.length > 0;
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
      const { data: users, error } = await this.client
        .from('users')
        .select('*, conversations(*)')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) return [];
      return users || [];
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
      const isVipFounder = userEmail === 'abdulaziznoor9876@gmail.com';

      // Check if user has sites in public/sites or sites table
      let siteId = isVipFounder ? 'abdulaziz' : (conversation?.id || null);
      let hasSite = false;

      const fs = require('fs');
      const path = require('path');
      const sitesBaseDir = path.join(process.cwd(), 'public', 'sites');

      if (siteId && fs.existsSync(path.join(sitesBaseDir, siteId, 'index.html'))) {
        hasSite = true;
      }

      // Fallback: check sites & client_sites tables
      if (!hasSite && user?.id && isUuid(user.id)) {
        try {
          const { data: siteRecord } = await this.client
            .from('sites')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle();
          if (siteRecord) {
            const sid = siteRecord.provider_site_id || siteRecord.id;
            siteId = sid;
            hasSite = true;
          }
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
        plan: {
          name: planName,
          isPro,
          details: planDetails,
          buildsUsed,
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
