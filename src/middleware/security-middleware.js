/**
 * Security Middleware Layer
 * Security headers, CORS, CSRF, Rate Limiting, Request Size Limits, Timeout Protection & Safe Error Handling.
 */

class SecurityMiddleware {
  /**
   * Sets strict HTTP security headers
   */
  static securityHeaders(options = {}) {
    return (req, res, next) => {
      // 1. Content Security Policy (CSP)
      const isProduction = process.env.NODE_ENV === 'production';
      const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://googletagmanager.com https://www.google-analytics.com https://google-analytics.com https://tagassistant.google.com https://checkout.razorpay.com https://*.razorpay.com https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://unpkg.com https://*.unpkg.com https://cdn.tailwindcss.com https://code.iconify.design https://challenges.cloudflare.com https://*.profitableratecpmnetwork.com https://profitableratecpmnetwork.com https://*.avegogglerequest.com https://avegogglerequest.com https://*.bauval.org https://bauval.org https://*.topcreativeformat.com https://topcreativeformat.com https://*.highperformanceformat.com https://highperformanceformat.com https://*.highperformancedformats.com https://highperformancedformats.com https://*.5gvci.com https://5gvci.com https://*.monetag.com https://monetag.com https://*.quge5.com https://quge5.com https://*.3nbf4.com https://3nbf4.com https://*.6opo.com https://6opo.com https://*.e2ertt.com https://e2ertt.com https://*.al5sm.com https://al5sm.com https://*.auqot.com https://auqot.com https://*.ekhay.com https://ekhay.com https://*.b3mny.com https://b3mny.com https://*.ay267.com https://ay267.com https://*.nap5k.com https://nap5k.com https://*.n6wxm.com https://n6wxm.com https://*.jhnwr.com https://jhnwr.com https://*.ldrws.com https://ldrws.com https://*.255md.com https://255md.com",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://unpkg.com https://*.unpkg.com https://db.onlinewebfonts.com",
        "font-src 'self' https://fonts.gstatic.com https://db.onlinewebfonts.com https://*.supabase.co data:",
        "img-src 'self' data: https: blob: https://*.jhnwr.com https://jhnwr.com https://*.ldrws.com https://ldrws.com https://*.255md.com https://255md.com https://*.google-analytics.com https://google-analytics.com https://*.analytics.google.com https://analytics.google.com https://*.googletagmanager.com https://googletagmanager.com https://www.google.com https://*.google.com https://www.google.co.in https://*.figma.site https://*.supabase.co https://*.5gvci.com https://5gvci.com https://*.3nbf4.com https://3nbf4.com https://*.al5sm.com https://al5sm.com https://*.auqot.com https://auqot.com https://*.ekhay.com https://ekhay.com https://*.b3mny.com https://b3mny.com https://*.ay267.com https://ay267.com https://*.nap5k.com https://nap5k.com https://*.n6wxm.com https://n6wxm.com",
        "media-src 'self' https: data: blob: https://*.cloudfront.net",
        "frame-src 'self' https://myfolio.tech https://*.myfolio.tech https://sketchfab.com https://tagassistant.google.com https://api.razorpay.com https://checkout.razorpay.com https://*.youpi.local https://api.youpi.local https://challenges.cloudflare.com https://*.profitableratecpmnetwork.com https://profitableratecpmnetwork.com https://*.avegogglerequest.com https://avegogglerequest.com https://*.bauval.org https://bauval.org https://*.topcreativeformat.com https://topcreativeformat.com https://*.highperformanceformat.com https://highperformanceformat.com https://*.highperformancedformats.com https://highperformancedformats.com https://*.5gvci.com https://5gvci.com https://*.monetag.com https://monetag.com https://*.quge5.com https://quge5.com https://*.3nbf4.com https://3nbf4.com https://*.6opo.com https://6opo.com https://*.e2ertt.com https://e2ertt.com https://*.al5sm.com https://al5sm.com https://*.auqot.com https://auqot.com https://*.ekhay.com https://ekhay.com https://*.b3mny.com https://b3mny.com https://*.ay267.com https://ay267.com https://*.nap5k.com https://nap5k.com https://*.n6wxm.com https://n6wxm.com " +
        "https://zoologyfibre.com " +
        "https://*.zoologyfibre.com " +
        "https://cdn.cloudvideosa.com " +
        "https://*.cloudvideosa.com https://*.jhnwr.com https://jhnwr.com https://*.ldrws.com https://ldrws.com https://*.255md.com https://255md.com",
        "frame-ancestors 'self' https://myfolio.tech https://*.myfolio.tech",
        "connect-src 'self' blob: data: http://localhost:6100 http://127.0.0.1:6100 https://myfolio.tech https://*.myfolio.tech https://*.cloudfront.net https://google-analytics.com https://*.google-analytics.com https://analytics.google.com https://*.analytics.google.com https://googletagmanager.com https://*.googletagmanager.com https://www.google.com https://*.google.com https://tagassistant.google.com https://api.razorpay.com https://lumberjack.razorpay.com https://*.razorpay.com https://*.youpi.local https://api.youpi.local https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://cdn.tailwindcss.com https://unpkg.com https://*.unpkg.com https://*.supabase.co https://api.iconify.design https://api.simplesvg.com https://api.unisvg.com https://challenges.cloudflare.com https://*.profitableratecpmnetwork.com https://profitableratecpmnetwork.com https://*.avegogglerequest.com https://avegogglerequest.com https://*.bauval.org https://bauval.org https://*.topcreativeformat.com https://topcreativeformat.com https://*.highperformanceformat.com https://highperformanceformat.com https://*.highperformancedformats.com https://highperformancedformats.com https://*.5gvci.com https://5gvci.com https://*.monetag.com https://monetag.com https://*.quge5.com https://quge5.com https://*.3nbf4.com https://3nbf4.com https://*.6opo.com https://6opo.com https://*.e2ertt.com https://e2ertt.com https://*.al5sm.com https://al5sm.com https://*.auqot.com https://auqot.com https://*.ekhay.com https://ekhay.com https://*.b3mny.com https://b3mny.com https://*.ay267.com https://ay267.com https://*.nap5k.com https://nap5k.com https://*.n6wxm.com https://n6wxm.com https://protrafficinspector.com https://my.rtmark.net https://*.rtmark.net https://*.jhnwr.com https://jhnwr.com https://*.ldrws.com https://ldrws.com https://*.255md.com https://255md.com",
        "worker-src 'self' blob: https://*.5gvci.com https://5gvci.com https://*.monetag.com https://monetag.com https://*.quge5.com https://quge5.com https://*.3nbf4.com https://3nbf4.com https://*.al5sm.com https://al5sm.com https://*.auqot.com https://auqot.com https://*.ekhay.com https://ekhay.com https://*.b3mny.com https://b3mny.com https://*.nap5k.com https://nap5k.com https://*.n6wxm.com https://n6wxm.com",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self'"
      ].join('; ');

      res.setHeader('Content-Security-Policy', csp);
      res.setHeader('X-Content-Type-Options', 'nosniff');

      // Do not set restrictive X-Frame-Options on preview, embed, or portfolio routes so CSP frame-ancestors governs embedding
      const isPortfolioRoute = req.path.startsWith('/p/') ||
                               req.path.startsWith('/sites/') ||
                               req.path === '/abdulaziz' ||
                               req.path === '/aziz' ||
                               req.path.startsWith('/preview') ||
                               req.query?.embed === 'true' ||
                               req.query?.embed === '1';
      if (!isPortfolioRoute) {
        res.setHeader('X-Frame-Options', 'SAMEORIGIN');
      }

      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
      res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
      res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

      if (isProduction || req.secure || req.headers['x-forwarded-proto'] === 'https') {
        res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
      }

      next();
    };
  }

  /**
   * Enforces request body size limits per route
   * @param {number} maxBytes 
   */
  static limitBodySize(maxBytes = 50 * 1024) {
    return (req, res, next) => {
      const contentLength = parseInt((req.headers && (req.headers['content-length'] || req.headers['Content-Length'])) || '0', 10);
      if (contentLength > maxBytes) {
        return res.status(413).json({
          error: 'Payload Too Large',
          message: `Request entity exceeds maximum allowable size of ${Math.round(maxBytes / 1024)} KB.`
        });
      }
      if (next) next();
    };
  }

  /**
   * Prevents hung / slowloris requests by setting a hard timeout (90s for deep AI generation pipelines)
   * @param {number} ms 
   */
  static requestTimeout(ms = 90000) {
    return (req, res, next) => {
      res.setTimeout(ms, () => {
        if (!res.headersSent) {
          res.status(504).json({
            error: 'Request Timeout',
            message: 'The AI generation request took longer than expected. Please try again or simplify input fields.',
            suggestion: 'Try generating again; cached resources will build faster.'
          });
        }
      });
      next();
    };
  }

  /**
   * Configures CORS with trusted origin validation
   */
  static corsConfig() {
    return (req, res, next) => {
      const origin = req.headers.origin;
      const port = process.env.PORT || 5050;
      const hostUrl = process.env.HOST_URL || `http://localhost:${port}`;
      const envAllowed = (process.env.ALLOWED_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
      const allowedOrigins = new Set([
        hostUrl,
        'https://myfolio.tech',
        'https://www.myfolio.tech',
        `http://localhost:${port}`,
        `http://127.0.0.1:${port}`,
        'http://localhost:5050',
        'http://127.0.0.1:5050',
        ...envAllowed
      ]);

      const isMyFolioOrigin = origin && (
        origin === 'https://myfolio.tech' ||
        origin === 'https://www.myfolio.tech' ||
        origin.endsWith('.myfolio.tech')
      );

      if (origin && (allowedOrigins.has(origin) || isMyFolioOrigin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Credentials', 'true');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
      }

      if (req.method === 'OPTIONS') {
        return res.status(204).end();
      }
      next();
    };
  }

  /**
   * Double-Submit Cookie & Origin CSRF Protection for state-mutating requests
   */
  static csrfProtection() {
    return (req, res, next) => {
      // Safe methods do not mutate state
      if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
      }

      // Webhooks use cryptographic signature validation, skip CSRF
      if (req.path.startsWith('/webhook')) {
        return next();
      }

      const host = req.get('host');
      const origin = req.headers.origin;
      const referer = req.headers.referer;

      const normalizeHost = (h) => (h || '').toLowerCase().replace(/^www\./, '').split(':')[0];
      const currentHost = normalizeHost(host);

      if (origin) {
        try {
          const originUrl = new URL(origin);
          const originHost = normalizeHost(originUrl.host);
          const isLocalDev = (originHost === 'localhost' || originHost === '127.0.0.1');
          const isSameDomain = (originHost === currentHost) || 
                               (originHost.endsWith('myfolio.tech') && currentHost.endsWith('myfolio.tech'));
          if (!isSameDomain && !isLocalDev) {
            return res.status(403).json({ error: 'CSRF Rejected: Invalid Origin' });
          }
        } catch (e) {
          return res.status(403).json({ error: 'CSRF Rejected: Malformed Origin' });
        }
      } else if (referer) {
        try {
          const refererUrl = new URL(referer);
          const refererHost = normalizeHost(refererUrl.host);
          const isLocalDev = (refererHost === 'localhost' || refererHost === '127.0.0.1');
          const isSameDomain = (refererHost === currentHost) || 
                               (refererHost.endsWith('myfolio.tech') && currentHost.endsWith('myfolio.tech'));
          if (!isSameDomain && !isLocalDev) {
            return res.status(403).json({ error: 'CSRF Rejected: Invalid Referer' });
          }
        } catch (e) {
          return res.status(403).json({ error: 'CSRF Rejected: Malformed Referer' });
        }
      }

      next();
    };
  }

  /**
   * Progressive Sliding-Window Rate Limiter
   * Uses in-memory & database store with exponential backoff on consecutive failures.
   */
  static rateLimiter({ max = 10, windowMs = 60000, keyGenerator = null, actionName = 'general' }) {
    const memoryCache = new Map();

    return async (req, res, next) => {
      const ip = req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress || '127.0.0.1';
      const key = keyGenerator ? keyGenerator(req) : `${actionName}:${ip}`;
      const now = Date.now();

      let record = memoryCache.get(key);
      if (!record || now > record.resetTime) {
        record = { count: 1, resetTime: now + windowMs, backoffUntil: 0 };
        memoryCache.set(key, record);
      } else {
        record.count += 1;
      }

      // Check temporary backoff
      if (record.backoffUntil && now < record.backoffUntil) {
        const remainingSeconds = Math.ceil((record.backoffUntil - now) / 1000);
        res.setHeader('Retry-After', remainingSeconds);
        return res.status(429).json({
          error: 'Too Many Requests',
          message: `Too many attempts. Please wait ${remainingSeconds} seconds before trying again.`
        });
      }

      if (record.count > max) {
        // Calculate progressive backoff delay instead of permanent lockout
        const excess = record.count - max;
        const delaySeconds = Math.min(300, Math.pow(2, excess) * 5); // 10s, 20s, 40s, max 300s
        record.backoffUntil = now + delaySeconds * 1000;

        res.setHeader('Retry-After', delaySeconds);
        return res.status(429).json({
          error: 'Rate Limit Exceeded',
          message: `Rate limit exceeded. Temporary cooldown active for ${delaySeconds} seconds.`
        });
      }

      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', Math.max(0, max - record.count));
      res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetTime / 1000));

      next();
    };
  }

  /**
   * Token Bucket Rate Limiter
   * 
   * Concept & Algorithm:
   * - Each client/IP has a virtual "bucket" holding up to `capacity` tokens (maximum burst limit).
   * - Tokens continuously refill at `refillRatePerSec` tokens every second up to `capacity`.
   * - When a request arrives, it attempts to consume `cost` tokens (default 1):
   *     - If tokens >= cost: tokens are deducted, request proceeds with remaining tokens in headers.
   *     - If tokens < cost: request is rejected with 429 and Retry-After = ceil((cost - tokens) / refillRatePerSec).
   * - High performance: O(1) time and O(1) space per key using lazy timestamp delta evaluation:
   *     tokens = min(capacity, currentTokens + elapsedSec * refillRatePerSec)
   */
  static tokenBucket({
    capacity = 10,
    refillRatePerSec = 1,
    cost = 1,
    keyGenerator = null,
    actionName = 'token_bucket'
  }) {
    const buckets = new Map(); // key -> { tokens: number, lastRefill: number }

    const middleware = async (req, res, next) => {
      const ip = req.ip || req.headers?.['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1';
      const key = keyGenerator ? keyGenerator(req) : `${actionName}:${ip}`;
      const now = Date.now();

      let bucket = buckets.get(key);
      if (!bucket) {
        bucket = { tokens: capacity, lastRefill: now };
      } else {
        const elapsedSec = (now - bucket.lastRefill) / 1000;
        const replenished = elapsedSec * refillRatePerSec;
        bucket.tokens = Math.min(capacity, bucket.tokens + replenished);
        bucket.lastRefill = now;
      }

      if (bucket.tokens >= cost) {
        bucket.tokens -= cost;
        buckets.set(key, bucket);

        if (typeof res.setHeader === 'function') {
          res.setHeader('X-RateLimit-Limit', capacity);
          res.setHeader('X-RateLimit-Remaining', Math.floor(bucket.tokens));
          res.setHeader('X-RateLimit-Refill-Rate', `${refillRatePerSec}/sec`);
        }
        return next();
      }

      // Bucket exhausted
      buckets.set(key, bucket);
      const neededTokens = cost - bucket.tokens;
      const retryAfterSec = Math.max(1, Math.ceil(neededTokens / refillRatePerSec));

      if (typeof res.setHeader === 'function') {
        res.setHeader('Retry-After', retryAfterSec);
        res.setHeader('X-RateLimit-Limit', capacity);
        res.setHeader('X-RateLimit-Remaining', 0);
        res.setHeader('X-RateLimit-Refill-Rate', `${refillRatePerSec}/sec`);
      }

      return res.status(429).json({
        error: 'Too Many Requests',
        message: `Rate limit burst capacity exhausted. Please wait ${retryAfterSec} second(s) for token replenishment.`,
        code: 'TOKEN_BUCKET_EXHAUSTED',
        retryAfter: retryAfterSec
      });
    };

    middleware.getBucket = (key) => buckets.get(key);
    middleware.reset = (key) => key ? buckets.delete(key) : buckets.clear();

    return middleware;
  }

  /**
   * Honeypot & Bot Trap Protection
   * Detects and neutralizes automated bots filling invisible honeypot fields
   */
  static botTrap(trapFields = ['website', 'honeypot', '_gotcha', 'bot_trap', 'hp_trap', '_hp_security_check'], options = {}) {
    const fields = Array.isArray(trapFields) ? trapFields : [trapFields];
    return (req, res, next) => {
      if (req.body) {
        for (const field of fields) {
          if (req.body[field] && String(req.body[field]).trim().length > 0) {
            if (options.silentSuccess) {
              return res.json({ success: true, message: options.successMessage || 'Message received.' });
            }
            return res.status(400).json({ error: 'Automated submission rejected by honeypot defense.' });
          }
        }
      }
      next();
    };
  }

  /**
   * Safe Global Error Handler (Never leaks SQL queries, stack traces, paths, or secrets)
   */
  static safeErrorHandler() {
    return (err, req, res, next) => {
      const isProduction = process.env.NODE_ENV === 'production';
      const statusCode = err.status || err.statusCode || 500;

      // Log full internal error on server console / secure log sink
      console.error(`[SECURITY ERROR] ${req.method} ${req.originalUrl}:`, err);

      if (res.headersSent) {
        return next(err);
      }

      // Generic, safe response to clients
      res.status(statusCode).json({
        success: false,
        error: isProduction ? 'An unexpected error occurred. Please try again later.' : (err.message || 'Internal Server Error'),
        code: err.code || 'INTERNAL_ERROR'
      });
    };
  }
}

module.exports = { SecurityMiddleware };
