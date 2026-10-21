/**
 * Authentication & Authorization Middleware
 * Session extraction from HttpOnly cookies, RBAC, IDOR defense, and per-user quotas.
 */

class AuthMiddleware {
  /**
   * Helper to parse cookie string from headers without requiring external dependency
   * @param {string} cookieHeader 
   * @returns {Record<string, string>}
   */
  static parseCookies(cookieHeader = '') {
    const list = {};
    if (!cookieHeader) return list;

    cookieHeader.split(';').forEach(cookie => {
      let [name, ...rest] = cookie.split('=');
      name = name?.trim();
      if (!name) return;
      const value = rest.join('=').trim();
      if (!value) return;
      list[name] = decodeURIComponent(value);
    });

    return list;
  }

  /**
   * Primary Authenticator
   * Reads HttpOnly cookie -> Hashes -> Validates against DB (with O(1) TTL memory cache) -> Attaches req.user & req.session
   */
  static authenticate(dbService, securityService) {
    const SESSION_CACHE_TTL_MS = 60 * 1000; // 60s fast memory cache
    const MAX_CACHE_ENTRIES = 1000;
    const sessionCache = new Map(); // tokenHash -> { user, session, cachedAt }
    const sessionTouchDebounce = new Map(); // sessionId -> lastTouchTimestamp

    return async (req, res, next) => {
      try {
        const reqPath = req.path || '';

        // FAST-PATH: Static assets never require session verification
        if (
          reqPath.startsWith('/assets/') ||
          reqPath.startsWith('/images/') ||
          reqPath.startsWith('/fonts/') ||
          reqPath.startsWith('/favicon') ||
          /\.(css|js|webp|png|jpg|jpeg|gif|svg|ico|woff2?|ttf|eot|map)$/i.test(reqPath)
        ) {
          req.user = null;
          req.session = null;
          return next();
        }

        const cookies = AuthMiddleware.parseCookies(req.headers.cookie);
        let rawToken = cookies.portfolio_session;

        // Fallback for API clients sending Bearer token
        if (!rawToken && req.headers.authorization) {
          const authHeader = req.headers.authorization;
          if (authHeader.startsWith('Bearer ')) {
            rawToken = authHeader.slice(7).trim();
          }
        }

        if (!rawToken) {
          const isLocalDev = process.env.NODE_ENV !== 'test' && (
            req.hostname === 'localhost' ||
            req.hostname === '127.0.0.1' ||
            req.get('host')?.includes('localhost') ||
            req.get('host')?.includes('127.0.0.1')
          );
          if (isLocalDev) {
            req.user = {
              id: 'local-dev-user-01',
              username: 'abdulaziz',
              email: 'support@myfolio.tech',
              name: 'Abdul Aziz Nooruddin',
              role: 'admin',
              is_admin: true,
              tier: 'pro'
            };
            req.session = {
              id: 'local-dev-session',
              user_id: 'local-dev-user-01'
            };
            return next();
          }

          req.user = null;
          req.session = null;
          return next();
        }

        const tokenHash = securityService.hashToken(rawToken);

        // Check O(1) in-memory session cache
        const now = Date.now();
        const cached = sessionCache.get(tokenHash);
        if (cached && (now - cached.cachedAt < SESSION_CACHE_TTL_MS)) {
          req.user = cached.user;
          req.session = cached.session;
          return next();
        }

        const sessionRecord = await dbService.getSessionByTokenHash(tokenHash);

        if (!sessionRecord || !sessionRecord.users) {
          sessionCache.delete(tokenHash);
          req.user = null;
          req.session = null;
          return next();
        }

        // Sanitize user object (never leak password hash)
        const user = { ...sessionRecord.users };
        delete user.password_hash;

        const session = {
          id: sessionRecord.id,
          userId: sessionRecord.user_id,
          createdAt: sessionRecord.created_at,
          lastActiveAt: sessionRecord.last_active_at,
          userAgent: sessionRecord.user_agent,
          ipAddress: sessionRecord.ip_address
        };

        // Cache session in memory (bounded to MAX_CACHE_ENTRIES)
        if (sessionCache.size >= MAX_CACHE_ENTRIES) {
          const oldestKey = sessionCache.keys().next().value;
          sessionCache.delete(oldestKey);
        }
        sessionCache.set(tokenHash, { user, session, cachedAt: now });

        req.user = user;
        req.session = session;

        // Asynchronously touch last_active_at at most once every 5 minutes per session
        const lastTouch = sessionTouchDebounce.get(sessionRecord.id) || 0;
        if (now - lastTouch > 300000) {
          sessionTouchDebounce.set(sessionRecord.id, now);
          dbService.touchSession(sessionRecord.id).catch(() => {});
        }

        next();
      } catch (err) {
        console.error('[AUTH MIDDLEWARE ERROR]', err.message);
        req.user = null;
        req.session = null;
        next();
      }
    };
  }

  /**
   * Guard: Rejects unauthenticated requests
   */
  static requireAuth(req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        error: 'Unauthorized',
        message: 'Authentication required. Please sign in.'
      });
    }
    next();
  }

  /**
   * Guard: Enforces Admin Role
   */
  static requireAdmin(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required.' });
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

    if (!isAdmin) {
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Administrator privileges required for this resource.'
      });
    }

    next();
  }

  /**
   * Guard for browser pages: Redirects unauthenticated users to /login?redirect=...
   */
  static requirePageAuth(req, res, next) {
    const isLocalDev = process.env.NODE_ENV !== 'test' && (
      req.hostname === 'localhost' ||
      req.hostname === '127.0.0.1' ||
      req.get('host')?.includes('localhost') ||
      req.get('host')?.includes('127.0.0.1')
    );
    if (isLocalDev) {
      if (!req.user) {
        req.user = {
          id: 'local-dev-user-01',
          username: 'abdulaziz',
          email: 'support@myfolio.tech',
          name: 'Abdul Aziz Nooruddin',
          role: 'admin',
          is_admin: true,
          tier: 'pro'
        };
      }
      return next();
    }

    if (!req.user) {
      const target = encodeURIComponent(req.originalUrl || req.url || '/dashboard');
      return res.redirect(`/login?redirect=${target}`);
    }
    next();
  }

  /**
   * Guard for admin browser pages: Redirects to /login if unauthenticated, or to /dashboard if non-admin
   */
  static requirePageAdmin(req, res, next) {
    const isLocalDev = process.env.NODE_ENV !== 'test' && (
      req.hostname === 'localhost' ||
      req.hostname === '127.0.0.1' ||
      req.get('host')?.includes('localhost') ||
      req.get('host')?.includes('127.0.0.1')
    );
    if (isLocalDev) {
      return next();
    }

    if (!req.user) {
      const target = encodeURIComponent(req.originalUrl || req.url || '/admin');
      return res.redirect(`/login?redirect=${target}`);
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

    if (!isAdmin) {
      return res.redirect('/dashboard');
    }
    next();
  }

  /**
   * IDOR Defense Guard: Verifies ownership of requested resource
   * @param {Function} getResourceOwnerIdFn - (req) => Promise<string|null>
   */
  static requireOwnership(getResourceOwnerIdFn) {
    return async (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      try {
        const ownerId = await getResourceOwnerIdFn(req);
        if (!ownerId) {
          return res.status(404).json({ error: 'Resource not found' });
        }

        const adminEmails = (process.env.ADMIN_EMAILS || 'abdulaziznoor9876@gmail.com,abdul19388383@gmail.com,abdulaziznooruddin670@gmail.com')
          .split(',')
          .map(e => e.trim().toLowerCase());
        const adminUsernames = (process.env.ADMIN_USERNAMES || 'abdulazizpro1,abdulazizpro,abdul19388383')
          .split(',')
          .map(u => u.trim().toLowerCase());
        const userEmail = (req.user.email || req.user.normalized_email || '').toLowerCase();
        const username = (req.user.username || '').toLowerCase();
        const isSuperAdmin =
          req.user.role === 'admin' ||
          req.user.is_admin === true ||
          (userEmail && adminEmails.includes(userEmail)) ||
          (username && adminUsernames.includes(username));

        if (ownerId !== req.user.id && !isSuperAdmin) {
          return res.status(403).json({
            error: 'Forbidden',
            message: 'You do not have permission to access or modify this resource.'
          });
        }

        next();
      } catch (err) {
        return res.status(500).json({ error: 'Authorization check failed' });
      }
    };
  }

  /**
   * Per-User Resource Quota Guard (for AI Generation & PDF Parsing)
   */
  static quotaLimiter(dbService, actionName = 'ai_generation', maxPerHour = 10) {
    return async (req, res, next) => {
      if (process.env.NODE_ENV === 'test') {
        return next();
      }

      const userEmail = (req.user?.email || req.user?.normalized_email || '').toLowerCase();
      const userUsername = (req.user?.username || '').toLowerCase();

      // Check if user is super admin or abdulaziznoor9876@gmail.com
      if (
        req.user?.role === 'admin' ||
        req.user?.is_admin === true ||
        userEmail === 'abdulaziznoor9876@gmail.com' ||
        userUsername === 'abdulazizpro1' ||
        userUsername === 'abdulazizpro'
      ) {
        return next(); // Complete exemption from any rate limit or quota
      }

      const identifier = req.user?.id || req.ip || 'anonymous';
      const windowHours = 1;

      try {
        const allowed = await dbService.checkRateLimit(
          identifier,
          actionName,
          maxPerHour,
          windowHours * 60
        );

        if (!allowed) {
          return res.status(429).json({
            error: 'Quota Exceeded',
            message: `You have reached the maximum quota of ${maxPerHour} ${actionName.replace('_', ' ')} requests per hour. Please wait or upgrade your plan.`
          });
        }

        next();
      } catch (err) {
        // Fail-safe: allow request if rate limit table error occurs, log warning
        console.warn('[QUOTA LIMITER WARN]', err.message);
        next();
      }
    };
  }
}

module.exports = { AuthMiddleware };
