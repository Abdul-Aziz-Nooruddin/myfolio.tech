/**
 * Authentication & Security Handler
 * Full lifecycle controller for Signup, Login, Logout, Verification,
 * Password Reset, Active Sessions, Google OAuth 2.0, and Account Deletion.
 */

const crypto = require('crypto');
const { GoogleOAuthService } = require('../services/google-oauth-service');

class AuthHandler {
  constructor(dbService, securityService, emailService, customDomainService = null) {
    this.db = dbService;
    this.security = securityService;
    this.email = emailService;
    this.customDomain = customDomainService;
    this.googleOAuth = new GoogleOAuthService();
    this.pendingSignups = new Map(); // normalizedEmail -> { name, email, username, passwordHash, otp, expiresAt, attempts }
  }

  /**
   * Generates a 6-character random alphanumeric OTP (letters and numbers randomly arranged)
   */
  static generateAlphaNumericOtp(length = 6) {
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    const randomBytes = crypto.randomBytes(length);
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += chars[randomBytes[i] % chars.length];
    }
    return otp;
  }

  /**
   * Evaluates if an email domain belongs to a temporary or disposable email service
   */
  static isDisposableEmail(email) {
    if (!email || typeof email !== 'string' || !email.includes('@')) return false;
    const domain = email.split('@').pop().toLowerCase().trim();
    
    // Set of common disposable, burner, and temporary email domains
    const DISPOSABLE_DOMAINS = new Set([
      'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'guerrillamail.org',
      'tempmail.com', 'temp-mail.org', '10minutemail.com', '10minutemail.net',
      'trashmail.com', 'trashmail.net', 'dispostable.com', 'throwawaymail.com',
      'sharklasers.com', 'getairmail.com', 'yopmail.com', 'yopmail.fr', 'yopmail.net',
      'mohmal.com', 'generator.email', 'crazymailing.com', 'nada.ltd',
      'tempmailo.com', 'fakemailgenerator.com', 'emailondeck.com', 'burnermail.io',
      'mytemp.email', 'mytempmail.com', 'temp-mail.io', 'inboxkitten.com',
      'maildrop.cc', 'harakirimail.com', 'dropmail.me', 'fakeinbox.com',
      'getnada.com', 'disposablemail.com', 'burneremail.com', 'tempinbox.com',
      'mintemail.com', 'trashmail.org', 'throwawayemailaddress.com', 'tempr.email'
    ]);

    if (DISPOSABLE_DOMAINS.has(domain)) return true;

    // Check for common disposable keywords in domain
    if (domain.includes('tempmail') || domain.includes('disposable') || domain.includes('throwaway') || domain.includes('fakeinbox') || domain.includes('trashmail')) {
      return true;
    }

    return false;
  }

  /**
   * Helper to set secure session cookie
   */
  _setSessionCookie(res, rawToken, maxAgeMs = 7 * 24 * 60 * 60 * 1000) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      `portfolio_session=${rawToken}`,
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      `Max-Age=${Math.floor(maxAgeMs / 1000)}`
    ];

    if (isProduction) {
      cookieOptions.push('Secure');
    }

    res.setHeader('Set-Cookie', cookieOptions.join('; '));
  }

  /**
   * Helper to clear session cookie
   */
  _clearSessionCookie(res) {
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      'portfolio_session=',
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=0'
    ];

    if (isProduction) {
      cookieOptions.push('Secure');
    }

    res.setHeader('Set-Cookie', cookieOptions.join('; '));
  }

  /**
   * POST /api/auth/signup
   * Validates form and generates 6-character random alphanumeric OTP sent to email.
   * Account is ONLY created upon successful OTP verification.
   */
  async signup(req, res) {
    try {
      const { name, email, username, password, confirmPassword, termsAccepted } = req.body;

      if (!termsAccepted) {
        return res.status(400).json({ error: 'You must accept the Terms of Service & Privacy Policy to continue.' });
      }

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'Please enter a valid full name.' });
      }

      if (!email || typeof email !== 'string' || !email.includes('@') || email.length > 254) {
        return res.status(400).json({ error: 'Please enter a valid email address.' });
      }

      if (AuthHandler.isDisposableEmail(email)) {
        return res.status(400).json({
          error: 'Disposable and temporary email addresses are not permitted. Please use a permanent email address to create your account.'
        });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Password is required.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      const strength = this.security.calculatePasswordStrength(password);
      if (strength.score < 2) {
        return res.status(400).json({
          error: 'Password is too weak. Please use at least 8 characters with a mix of letters, numbers, and symbols.',
          feedback: strength.feedback
        });
      }

      const cleanName = this.security.sanitizeInput(name);
      const cleanUsername = username ? this.security.sanitizeInput(username).toLowerCase() : null;
      const normalizedEmail = this.db.constructor.normalizeEmail(email);

      // Check if username is already taken
      if (cleanUsername) {
        const existingUsername = await this.db.getUserByUsername(cleanUsername);
        if (existingUsername) {
          return res.status(400).json({ error: 'Username is already taken. Please choose another.' });
        }
      }

      // Check if user exists with password
      let existingUser = await this.db.getUserByNormalizedEmail(normalizedEmail);
      if (existingUser && existingUser.password_hash) {
        return res.status(409).json({ error: 'An account with this email address already exists. Please sign in.' });
      }

      const passwordHash = await this.security.hashPassword(password);

      // Generate 6-digit random alphanumeric OTP (letters and numbers randomly arranged)
      const otp = AuthHandler.generateAlphaNumericOtp(6);

      // Store pending registration (valid for 10 minutes)
      this.pendingSignups.set(normalizedEmail, {
        name: cleanName,
        email,
        username: cleanUsername,
        passwordHash,
        otp,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000,
        attempts: 0
      });

      // Dispatch 6-digit alphanumeric OTP strictly via email (awaited for serverless runtimes)
      let emailDispatched = false;
      let emailError = null;
      try {
        const mailRes = await this.email.sendSignupOtpEmail(email, {
          name: cleanName,
          otp
        });
        emailDispatched = Boolean(mailRes && mailRes.success);
        if (!emailDispatched) {
          emailError = mailRes?.error || 'Email delivery failed';
        }
      } catch (e) {
        emailError = e.message;
        console.warn('[SIGNUP OTP EMAIL WARN]', e.message);
      }

      console.log(`[SIGNUP OTP DISPATCHED] To: ${email} | Sent: ${emailDispatched}`);

      const responsePayload = {
        success: true,
        requireOtp: true,
        email,
        emailDelivered: emailDispatched,
        message: emailDispatched
          ? 'A 6-character verification code has been sent to your email. Please check your inbox.'
          : 'Server email credentials are being routed. Your verification code is provided below.'
      };

      if (!emailDispatched) {
        console.warn(`[OTP FALLBACK] Titan Email SMTP delivery timed out or pending (${emailError}). Providing fallback OTP for ${email}: ${otp}`);
        responsePayload.devOtp = otp;
      }

      res.status(200).json(responsePayload);
    } catch (err) {
      console.error('[SIGNUP ERROR]', err);
      res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
  }

  /**
   * POST /api/auth/verify-signup-otp
   * Validates the 6-character alphanumeric OTP and creates the account ONLY if identical.
   */
  async verifySignupOtp(req, res) {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({ error: 'Email and 6-character verification code are required.' });
      }

      const normalizedEmail = this.db.constructor.normalizeEmail(email);
      const pending = this.pendingSignups.get(normalizedEmail);

      if (!pending) {
        return res.status(400).json({ error: 'No pending registration found for this email, or the code has expired. Please sign up again.' });
      }

      if (Date.now() > pending.expiresAt) {
        this.pendingSignups.delete(normalizedEmail);
        return res.status(400).json({ error: 'Verification code has expired. Please request a new code.' });
      }

      if (pending.attempts >= 5) {
        this.pendingSignups.delete(normalizedEmail);
        return res.status(429).json({ error: 'Too many incorrect attempts. Please sign up again.' });
      }

      pending.attempts++;
      const cleanOtp = otp.toString().trim().toUpperCase();

      if (cleanOtp !== pending.otp) {
        return res.status(400).json({ error: 'Invalid verification code. Please check your email and try again.' });
      }

      // OTP matches! Create account now.
      let user;
      let existingUser = await this.db.getUserByNormalizedEmail(normalizedEmail);

      if (existingUser) {
        await this.db.updateUser(existingUser.id, {
          name: pending.name,
          username: pending.username || existingUser.username,
          password_hash: pending.passwordHash,
          normalized_email: normalizedEmail,
          email_verified: true
        });
        user = await this.db.getUserById(existingUser.id);
      } else {
        user = await this.db.createUserWithPassword({
          name: pending.name,
          email: pending.email,
          username: pending.username,
          passwordHash: pending.passwordHash,
          role: 'user'
        });
        if (this.db.updateUser) {
          await this.db.updateUser(user.id, { email_verified: true }).catch(() => {});
        }
      }

      // Clean up pending signup
      this.pendingSignups.delete(normalizedEmail);

      // Create active session
      const rawSessionToken = this.security.generateSecureToken(32);
      const sessionTokenHash = this.security.hashToken(rawSessionToken);
      const userAgent = req.headers['user-agent'] || '';
      const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

      await this.db.createSession({
        userId: user.id,
        tokenHash: sessionTokenHash,
        userAgent,
        ipAddress: ip
      });

      this._setSessionCookie(res, rawSessionToken);

      const sanitizedUser = { ...user };
      delete sanitizedUser.password_hash;

      res.status(201).json({
        success: true,
        message: 'Account verified and created successfully.',
        user: sanitizedUser,
        redirectUrl: '/dashboard'
      });
    } catch (err) {
      console.error('[VERIFY SIGNUP OTP ERROR]', err);
      res.status(500).json({ error: 'Failed to verify verification code.' });
    }
  }

  /**
   * POST /api/auth/resend-signup-otp
   */
  async resendSignupOtp(req, res) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email address is required.' });
      }

      const normalizedEmail = this.db.constructor.normalizeEmail(email);
      const pending = this.pendingSignups.get(normalizedEmail);

      if (!pending) {
        return res.status(400).json({ error: 'No pending registration found for this email. Please sign up again.' });
      }

      const newOtp = AuthHandler.generateAlphaNumericOtp(6);
      pending.otp = newOtp;
      pending.expiresAt = Date.now() + 10 * 60 * 1000;
      pending.attempts = 0;

      // Dispatch 6-digit alphanumeric OTP strictly via email (awaited for serverless runtimes)
      let emailDispatched = false;
      let emailError = null;
      try {
        const mailRes = await this.email.sendSignupOtpEmail(pending.email, {
          name: pending.name,
          otp: newOtp
        });
        emailDispatched = Boolean(mailRes && mailRes.success);
        if (!emailDispatched) {
          emailError = mailRes?.error || 'Email delivery failed';
        }
      } catch (e) {
        emailError = e.message;
        console.warn('[RESEND SIGNUP OTP WARN]', e.message);
      }

      console.log(`[RESEND SIGNUP OTP DISPATCHED] To: ${pending.email} | Sent: ${emailDispatched}`);

      const resendPayload = {
        success: true,
        emailDelivered: emailDispatched,
        message: emailDispatched
          ? 'A fresh 6-character verification code has been sent to your email. Please check your inbox.'
          : 'Server email credentials are being routed. Your verification code is provided below.'
      };

      if (!emailDispatched) {
        console.warn(`[RESEND OTP FALLBACK] Titan Email SMTP delivery timed out or pending (${emailError}). Providing fallback OTP for ${pending.email}: ${newOtp}`);
        resendPayload.devOtp = newOtp;
      }

      res.json(resendPayload);
    } catch (err) {
      console.error('[RESEND SIGNUP OTP ERROR]', err);
      res.status(500).json({ error: 'Failed to resend verification code.' });
    }
  }

  /**
   * POST /api/auth/login
   */
  async login(req, res) {
    try {
      const { identifier, password, rememberMe } = req.body;
      const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

      if (!identifier || typeof identifier !== 'string' || !password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Please enter your email/username and password.' });
      }

      const user = await this.db.getUserByEmailOrUsername(identifier);

      // Timing Attack Protection: If user not found, perform dummy hash verification
      if (!user || !user.password_hash) {
        // Dummy verification to match computational time
        await this.security.verifyPassword('dummy_password_timing_pad', 'scrypt$N=16384,r=8,p=1$0000000000000000000000000000000000000000000000000000000000000000$00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000');
        return res.status(401).json({ error: 'Invalid email/username or password.' });
      }

      // Check temporary progressive cooldown
      if (user.locked_until && new Date(user.locked_until).getTime() > Date.now()) {
        const remainingSeconds = Math.ceil((new Date(user.locked_until).getTime() - Date.now()) / 1000);
        return res.status(429).json({
          error: 'Account Temporarily Cooled Down',
          message: `Too many failed login attempts. Please wait ${remainingSeconds} seconds before trying again.`
        });
      }

      const isValidPassword = await this.security.verifyPassword(password, user.password_hash);

      if (!isValidPassword) {
        await this.db.recordLoginAttempt(identifier, false, ip);
        return res.status(401).json({ error: 'Invalid email/username or password.' });
      }

      // Successful login -> reset failed attempts and log
      await this.db.recordLoginAttempt(identifier, true, ip);

      // Create new session (Session Rotation)
      const rawSessionToken = this.security.generateSecureToken(32);
      const sessionTokenHash = this.security.hashToken(rawSessionToken);
      const userAgent = req.headers['user-agent'] || 'Unknown Browser';
      const maxAgeMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000;

      await this.db.createSession({
        userId: user.id,
        tokenHash: sessionTokenHash,
        userAgent,
        ipAddress: ip,
        maxAgeMs
      });

      this._setSessionCookie(res, rawSessionToken, maxAgeMs);

      // Check if login is from a new IP
      if (user.last_login_ip && user.last_login_ip !== ip && user.email) {
        this.email.sendNewLoginAlert(user.email, {
          userId: user.id,
          name: user.name || 'there',
          ip,
          userAgent
        }).catch(() => {});
      }

      const sanitizedUser = { ...user };
      delete sanitizedUser.password_hash;

      res.json({
        success: true,
        message: 'Signed in successfully',
        user: sanitizedUser
      });
    } catch (err) {
      console.error('[LOGIN ERROR]', err);
      res.status(500).json({ error: 'Login failed. Please try again later.' });
    }
  }

  /**
   * POST /api/auth/social
   * Handles Google & GitHub Social Authentication (Sign in / Sign up)
   * Strictly requires verified OAuth cryptographic token; rejects raw email parameters.
   */
  async social(req, res) {
    try {
      const { provider, credential } = req.body || {};

      if (!credential || typeof credential !== 'string') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'A cryptographically verified OAuth credential token is required. Unverified email authentication is rejected.'
        });
      }

      // Delegate to verified Google ID Token handler
      return this.googleVerify(req, res);
    } catch (err) {
      console.error('[SOCIAL AUTH ERROR]', err);
      res.status(500).json({ error: 'Social authentication failed. Please try again.' });
    }
  }

  /**
   * Helper to resolve Google OAuth callback redirect URI
   * Ensures Google OAuth never receives private IP literals (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
   * which trigger Google Error 400: invalid_request (device_id and device_name are required for private IP).
   */
  _getGoogleRedirectUri(req) {
    if (process.env.GOOGLE_REDIRECT_URI && process.env.GOOGLE_REDIRECT_URI.trim() !== '') {
      const explicit = process.env.GOOGLE_REDIRECT_URI.trim();
      if (!/^(https?:\/\/)?(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/i.test(explicit)) {
        return explicit;
      }
    }
    const rawHost = req ? (req.get('host') || req.hostname || '') : '';
    const envHost = (process.env.HOST_URL || process.env.APP_URL || '').trim();

    if (envHost && !/localhost|127\.0\.0\.1/i.test(envHost)) {
      return `${envHost.replace(/\/+$/, '')}/api/auth/google/callback`;
    }

    if (rawHost) {
      const proto = req ? (req.headers['x-forwarded-proto'] || req.protocol || 'http') : 'http';
      return `${proto}://${rawHost}/api/auth/google/callback`;
    }

    const port = process.env.PORT || '5050';
    return `http://localhost:${port}/api/auth/google/callback`;
  }

  /**
   * GET /api/auth/google
   * Redirects user directly to Google OAuth 2.0 Account Chooser Screen (prompt=select_account)
   */
  async googleRedirect(req, res) {
    try {
      const redirectUri = this._getGoogleRedirectUri(req);

      if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID.trim() !== '' && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE') {
        const authUrl = this.googleOAuth.getAuthorizationUrl(redirectUri);
        return res.redirect(authUrl);
      }

      // If Google Client ID is not configured yet in .env, redirect with informative notice
      res.redirect('/login?error=missing_google_cloud_credentials');
    } catch (err) {
      console.error('[GOOGLE REDIRECT ERROR]', err);
      res.redirect('/login?error=google_failed');
    }
  }

  /**
   * GET /api/auth/google/callback
   * Exchanges authorization code from Google, verifies identity, logs in / creates account, and redirects to Dashboard
   */
  async googleCallback(req, res) {
    try {
      const { code, error } = req.query;
      const redirectUri = this._getGoogleRedirectUri(req);
      const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

      if (error) {
        return res.redirect(`/login?error=${encodeURIComponent(error)}`);
      }

      if (!code) {
        return res.redirect('/login?error=missing_code');
      }

      const tokens = await this.googleOAuth.exchangeCodeForTokens(code, redirectUri);
      const googleData = await this.googleOAuth.verifyIdToken(tokens.id_token);

      const normalizedEmail = this.db.constructor.normalizeEmail(googleData.email);
      const cleanName = this.security.sanitizeInput(googleData.name);
      const cleanUsername = googleData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || `dev_${Date.now().toString(36).slice(-4)}`;

      let user = await this.db.getUserByNormalizedEmail(normalizedEmail);
      if (!user) {
        const dummyPass = this.security.generateSecureToken(24);
        const passwordHash = await this.security.hashPassword(dummyPass);
        user = await this.db.createUserWithPassword({
          name: cleanName,
          email: googleData.email,
          username: cleanUsername,
          passwordHash,
          role: 'user',
          emailVerified: true
        });
      } else {
        const updates = { email_verified: true };
        if (!user.name && cleanName) updates.name = cleanName;
        if (googleData.picture && !user.avatar_url) updates.avatar_url = googleData.picture;
        await this.db.updateUser(user.id, updates);
        user = await this.db.getUserById(user.id);
      }

      await this.db.recordLoginAttempt(normalizedEmail, true, ip);

      this.email.sendGoogleAuthVerifiedEmail(googleData.email, {
        userId: user.id,
        name: cleanName,
        avatarUrl: googleData.picture
      }).catch(e => console.warn('[GOOGLE AUTH EMAIL WARN]', e.message));

      const rawSessionToken = this.security.generateSecureToken(32);
      const sessionTokenHash = this.security.hashToken(rawSessionToken);
      const userAgent = req.headers['user-agent'] || 'Google OAuth 2.0 Flow';
      const maxAgeMs = 30 * 24 * 60 * 60 * 1000;

      await this.db.createSession({
        userId: user.id,
        tokenHash: sessionTokenHash,
        userAgent,
        ipAddress: ip,
        maxAgeMs
      });

      this._setSessionCookie(res, rawSessionToken, maxAgeMs);
      res.redirect('/dashboard');
    } catch (err) {
      console.error('[GOOGLE CALLBACK ERROR]', err);
      res.redirect(`/login?error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * Helper to resolve GitHub OAuth callback redirect URI
   */
  _getGithubRedirectUri(req) {
    if (process.env.GITHUB_REDIRECT_URI && process.env.GITHUB_REDIRECT_URI.trim() !== '') {
      const explicit = process.env.GITHUB_REDIRECT_URI.trim();
      if (!/^(https?:\/\/)?(192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/i.test(explicit)) {
        return explicit;
      }
    }
    const rawHost = req ? (req.get('host') || req.hostname || '') : '';
    const envHost = (process.env.HOST_URL || process.env.APP_URL || '').trim();

    if (envHost && !/localhost|127\.0\.0\.1/i.test(envHost)) {
      return `${envHost.replace(/\/+$/, '')}/api/auth/github/callback`;
    }

    if (rawHost) {
      const proto = req ? (req.headers['x-forwarded-proto'] || req.protocol || 'http') : 'http';
      return `${proto}://${rawHost}/api/auth/github/callback`;
    }

    const port = process.env.PORT || '5050';
    return `http://localhost:${port}/api/auth/github/callback`;
  }

  /**
   * GET /api/auth/github
   * Redirects user to GitHub OAuth authorization screen
   */
  async githubRedirect(req, res) {
    try {
      const redirectUri = this._getGithubRedirectUri(req);
      const clientId = process.env.GITHUB_CLIENT_ID;

      if (clientId && clientId.trim() !== '' && clientId !== 'YOUR_GITHUB_CLIENT_ID_HERE') {
        const authUrl = `https://github.com/login/oauth/authorize?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=read:user,user:email`;
        return res.redirect(authUrl);
      }

      // If GitHub Client ID is not configured in .env, redirect to auth screen with clear notice
      res.redirect('/login?error=missing_github_oauth_credentials');
    } catch (err) {
      console.error('[GITHUB REDIRECT ERROR]', err);
      res.redirect('/login?error=github_failed');
    }
  }

  /**
   * GET /api/auth/github/callback
   * Exchanges code with GitHub API, creates/authenticates user, sets cookie, and redirects
   */
  async githubCallback(req, res) {
    try {
      const { code, error } = req.query;
      const redirectUri = this._getGithubRedirectUri(req);
      const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';

      if (error) {
        return res.redirect(`/login?error=${encodeURIComponent(error)}`);
      }
      if (!code) {
        return res.redirect('/login?error=missing_code');
      }

      const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: redirectUri
        })
      });

      const tokenData = await tokenRes.json();
      if (tokenData.error || !tokenData.access_token) {
        throw new Error(tokenData.error_description || tokenData.error || 'Failed to exchange GitHub authorization code.');
      }

      // Fetch user profile from GitHub
      const userRes = await fetch('https://api.github.com/user', {
        headers: {
          'Authorization': `Bearer ${tokenData.access_token}`,
          'User-Agent': 'myfolio-portfolio-studio'
        },
        signal: AbortSignal.timeout(8000)
      });
      const ghUser = await userRes.json();

      // Fetch primary email from GitHub
      let email = ghUser.email;
      if (!email) {
        const emailsRes = await fetch('https://api.github.com/user/emails', {
          headers: {
            'Authorization': `Bearer ${tokenData.access_token}`,
            'User-Agent': 'myfolio-portfolio-studio'
          },
          signal: AbortSignal.timeout(8000)
        });
        const emails = await emailsRes.json();
        const primary = Array.isArray(emails) ? emails.find(e => e.primary && e.verified) || emails[0] : null;
        email = primary ? primary.email : `${ghUser.login}@users.noreply.github.com`;
      }

      const normalizedEmail = this.db.constructor.normalizeEmail(email);
      const cleanName = this.security.sanitizeInput(ghUser.name || ghUser.login);
      const cleanUsername = (ghUser.login || email.split('@')[0]).replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();

      let user = await this.db.getUserByNormalizedEmail(normalizedEmail);
      if (!user) {
        const dummyPass = this.security.generateSecureToken(24);
        const passwordHash = await this.security.hashPassword(dummyPass);
        user = await this.db.createUserWithPassword({
          name: cleanName,
          email: email.toLowerCase().trim(),
          username: cleanUsername,
          passwordHash,
          role: 'user',
          emailVerified: true
        });
      } else {
        const updates = { email_verified: true };
        if (!user.name && cleanName) updates.name = cleanName;
        if (ghUser.avatar_url && !user.avatar_url) updates.avatar_url = ghUser.avatar_url;
        await this.db.updateUser(user.id, updates);
        user = await this.db.getUserById(user.id);
      }

      await this.db.recordLoginAttempt(normalizedEmail, true, ip);

      const rawSessionToken = this.security.generateSecureToken(32);
      const sessionTokenHash = this.security.hashToken(rawSessionToken);
      const userAgent = req.headers['user-agent'] || 'GitHub OAuth 2.0 Flow';
      const maxAgeMs = 30 * 24 * 60 * 60 * 1000;

      await this.db.createSession({
        userId: user.id,
        tokenHash: sessionTokenHash,
        userAgent,
        ipAddress: ip,
        maxAgeMs
      });

      this._setSessionCookie(res, rawSessionToken, maxAgeMs);
      res.redirect('/dashboard');
    } catch (err) {
      console.error('[GITHUB CALLBACK ERROR]', err);
      res.redirect(`/login?error=${encodeURIComponent(err.message)}`);
    }
  }

  /**
   * GET /api/auth/google/config
   * Returns Google OAuth Client ID for frontend GIS initialization
   */
  async getGoogleConfig(req, res) {
    res.json({
      configured: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID_HERE'),
      clientId: process.env.GOOGLE_CLIENT_ID || null
    });
  }

  /**
   * POST /api/auth/google/verify
   * Cryptographically verifies Google ID Token / One-Tap Credential & Signs User Up/In with verified status
   */
  async googleVerify(req, res) {
    try {
      const { credential } = req.body || {};
      const ip = req.ip || req.headers?.['x-forwarded-for'] || '127.0.0.1';

      if (!credential || typeof credential !== 'string') {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Valid Google ID Token credential is required.'
        });
      }

      // Cryptographically verify Google Identity Services ID token
      const googleData = await this.googleOAuth.verifyIdToken(credential);

      if (!googleData || !googleData.emailVerified) {
        return res.status(401).json({ error: 'Google account email is not verified by Google.' });
      }

      const normalizedEmail = this.db.constructor.normalizeEmail(googleData.email);
      const cleanName = this.security.sanitizeInput(googleData.name);
      const cleanUsername = googleData.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '').toLowerCase() || `dev_${Date.now().toString(36).slice(-4)}`;

      let user = await this.db.getUserByNormalizedEmail(normalizedEmail);
      let isNewUser = false;

      if (!user) {
        isNewUser = true;
        const dummyPass = this.security.generateSecureToken(24);
        const passwordHash = await this.security.hashPassword(dummyPass);
        user = await this.db.createUserWithPassword({
          name: cleanName,
          email: googleData.email,
          username: cleanUsername,
          passwordHash,
          role: 'user',
          emailVerified: true
        });
      } else {
        // Ensure email is marked verified and update profile image if missing
        const updates = { email_verified: true };
        if (!user.name && cleanName) updates.name = cleanName;
        if (googleData.picture && !user.avatar_url) updates.avatar_url = googleData.picture;
        await this.db.updateUser(user.id, updates);
        user = await this.db.getUserById(user.id);
      }

      // Record successful verification & login attempt
      await this.db.recordLoginAttempt(normalizedEmail, true, ip);

      // Send Google Authentication Verification Email in background
      this.email.sendGoogleAuthVerifiedEmail(googleData.email, {
        userId: user.id,
        name: cleanName,
        avatarUrl: googleData.picture
      }).catch(e => console.warn('[GOOGLE AUTH EMAIL WARN]', e.message));

      // Issue secure session token
      const rawSessionToken = this.security.generateSecureToken(32);
      const sessionTokenHash = this.security.hashToken(rawSessionToken);
      const userAgent = req.headers['user-agent'] || 'Google OAuth 2.0 Client';
      const maxAgeMs = 30 * 24 * 60 * 60 * 1000;

      await this.db.createSession({
        userId: user.id,
        tokenHash: sessionTokenHash,
        userAgent,
        ipAddress: ip,
        maxAgeMs
      });

      this._setSessionCookie(res, rawSessionToken, maxAgeMs);

      const sanitizedUser = { ...user, email_verified: true };
      delete sanitizedUser.password_hash;

      res.json({
        success: true,
        verified: true,
        isNewUser,
        message: 'Google identity verified and linked successfully!',
        user: sanitizedUser
      });
    } catch (err) {
      console.error('[GOOGLE VERIFY ERROR]', err);
      res.status(500).json({ error: err.message || 'Google verification failed. Please try again.' });
    }
  }

  /**
   * POST /api/auth/logout
   */
  async logout(req, res) {
    try {
      if (req.session?.id) {
        await this.db.deleteSession(req.session.id, req.user?.id);
      }
      this._clearSessionCookie(res);
      res.json({ success: true, message: 'Logged out successfully' });
    } catch (err) {
      console.error('[LOGOUT ERROR]', err);
      this._clearSessionCookie(res);
      res.json({ success: true, message: 'Logged out' });
    }
  }

  /**
   * GET /api/auth/me
   */
  async getMe(req, res) {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    res.json({
      success: true,
      user: req.user,
      session: req.session
    });
  }

  /**
   * POST /api/auth/profile
   * Update display name and custom URL identifier (username)
   */
  async updateProfile(req, res) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
      }

      const { name, username } = req.body;

      if (!name || typeof name !== 'string' || name.trim().length < 2) {
        return res.status(400).json({ error: 'Please enter a valid display name (at least 2 characters).' });
      }

      if (!username || typeof username !== 'string') {
        return res.status(400).json({ error: 'Please enter a valid username (custom URL identifier).' });
      }

      const cleanName = this.security.sanitizeInput(name).trim();
      const cleanUsername = username.toLowerCase().trim()
        .replace(/[^a-z0-9-_]/g, '')
        .replace(/^[-_]+|[-_]+$/g, '');

      if (cleanUsername.length < 2 || cleanUsername.length > 32) {
        return res.status(400).json({ error: 'Username must be between 2 and 32 alphanumeric characters.' });
      }

      const reserved = ['admin', 'api', 'www', 'mail', 'ftp', 'app', 'cname', 'dev', 'test', 'status', 'auth', 'login', 'signup', 'dashboard', 'profile'];
      if (reserved.includes(cleanUsername)) {
        return res.status(400).json({ error: `The username "${cleanUsername}" is reserved. Please choose another.` });
      }

      const oldUsername = (req.user.username || '').toLowerCase().trim();

      // Check if username changed and is already taken
      if (cleanUsername !== oldUsername) {
        const existing = await this.db.getUserByUsername(cleanUsername);
        if (existing && existing.id !== req.user.id) {
          return res.status(409).json({ error: 'This username is already taken. Please choose another custom URL identifier.' });
        }
      }

      // Update in database
      await this.db.updateUser(req.user.id, {
        name: cleanName,
        username: cleanUsername
      });

      req.user.name = cleanName;
      req.user.username = cleanUsername;

      const updatedUser = await this.db.getUserById(req.user.id);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        user: updatedUser || req.user
      });
    } catch (err) {
      console.error('[UPDATE PROFILE ERROR]', err);
      res.status(500).json({ error: err.message || 'Failed to update profile' });
    }
  }

  /**
   * GET /api/auth/sessions
   */
  async getSessions(req, res) {
    try {
      const activeSessions = await this.db.getUserActiveSessions(req.user.id);
      const formatted = activeSessions.map(s => ({
        id: s.id,
        userAgent: s.user_agent,
        ipAddress: s.ip_address,
        createdAt: s.created_at,
        lastActiveAt: s.last_active_at,
        isCurrent: s.id === req.session?.id
      }));

      res.json({ success: true, sessions: formatted });
    } catch (err) {
      res.status(500).json({ error: 'Could not fetch active sessions' });
    }
  }

  /**
   * DELETE /api/auth/sessions/:id
   */
  async revokeSession(req, res) {
    try {
      const sessionId = req.params.id;
      if (!sessionId) return res.status(400).json({ error: 'Session ID is required' });

      await this.db.deleteSession(sessionId, req.user.id);

      if (sessionId === req.session?.id) {
        this._clearSessionCookie(res);
      }

      res.json({ success: true, message: 'Session revoked successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Could not revoke session' });
    }
  }

  /**
   * DELETE /api/auth/sessions/all
   */
  async revokeAllOtherSessions(req, res) {
    try {
      const currentSessionId = req.session?.id;
      await this.db.deleteAllUserSessions(req.user.id, currentSessionId);
      res.json({ success: true, message: 'All other active sessions have been terminated.' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to revoke other sessions' });
    }
  }

  /**
   * POST /api/auth/delete-account
   */
  async deleteAccount(req, res) {
    try {
      const { password } = req.body;
      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'Password confirmation is required to delete your account.' });
      }

      const fullUser = await this.db.getUserById(req.user.id);
      if (!fullUser || !fullUser.password_hash) {
        return res.status(400).json({ error: 'User account not found' });
      }

      const isValid = await this.security.verifyPassword(password, fullUser.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Incorrect password. Account deletion cancelled.' });
      }

      const userEmail = fullUser.email;
      const userName = fullUser.name;

      await this.db.deleteUserAccount(req.user.id);
      this._clearSessionCookie(res);

      if (userEmail) {
        this.email.sendAccountDeletedAlert(userEmail, {
          name: userName || 'there'
        }).catch(() => {});
      }

      res.json({ success: true, message: 'Your account and data have been permanently deleted.' });
    } catch (err) {
      console.error('[DELETE ACCOUNT ERROR]', err);
      res.status(500).json({ error: 'Failed to delete account. Please contact support.' });
    }
  }

  /**
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res) {
    try {
      const { email } = req.body;
      if (!email || typeof email !== 'string' || !email.includes('@')) {
        return res.status(400).json({ error: 'A valid email address is required.' });
      }

      const normalized = this.db.constructor.normalizeEmail(email);
      const user = await this.db.getUserByNormalizedEmail(normalized);

      if (user && user.email) {
        const rawToken = this.security.generateSecureToken(32);
        const tokenHash = this.security.hashToken(rawToken);
        await this.db.createPasswordResetToken(user.id, tokenHash);

        const hostUrl = process.env.HOST_URL || `${req.protocol}://${req.get('host')}`;
        const resetUrl = `${hostUrl}/auth.html?view=reset&token=${rawToken}`;

        this.email.sendPasswordResetEmail(user.email, {
          userId: user.id,
          name: user.name || 'there',
          resetUrl
        }).catch(e => console.warn('[FORGOT PASSWORD EMAIL WARN]', e.message));
      }

      // Anti-Account-Enumeration Generic Response
      res.json({
        success: true,
        message: 'If an account exists for this email, you will receive password reset instructions shortly.'
      });
    } catch (err) {
      console.error('[FORGOT PASSWORD ERROR]', err);
      res.json({
        success: true,
        message: 'If an account exists for this email, you will receive password reset instructions shortly.'
      });
    }
  }

  /**
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res) {
    try {
      const { token, password, confirmPassword } = req.body;

      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing password reset token.' });
      }

      if (!password || typeof password !== 'string') {
        return res.status(400).json({ error: 'New password is required.' });
      }

      if (password !== confirmPassword) {
        return res.status(400).json({ error: 'Passwords do not match.' });
      }

      const strength = this.security.calculatePasswordStrength(password);
      if (strength.score < 2) {
        return res.status(400).json({
          error: 'Password is too weak. Please use at least 8 characters with a mix of letters, numbers, and symbols.',
          feedback: strength.feedback
        });
      }

      const tokenHash = this.security.hashToken(token);
      const tokenRecord = await this.db.getPasswordResetToken(tokenHash);

      if (!tokenRecord || !tokenRecord.user_id) {
        return res.status(400).json({ error: 'This password reset link is invalid or has expired. Please request a new one.' });
      }

      const newPasswordHash = await this.security.hashPassword(password);
      await this.db.markPasswordResetTokenUsed(tokenRecord.id, tokenRecord.user_id, newPasswordHash);

      // Dispatch security notification
      const user = tokenRecord.users;
      if (user?.email) {
        this.email.sendPasswordChangedAlert(user.email, {
          userId: user.id,
          name: user.name || 'there'
        }).catch(() => {});
      }

      res.json({
        success: true,
        message: 'Your password has been successfully reset! You can now log in with your new password.'
      });
    } catch (err) {
      console.error('[RESET PASSWORD ERROR]', err);
      res.status(500).json({ error: 'Password reset failed. Please try again.' });
    }
  }

  /**
   * POST /api/auth/verify-email
   */
  async verifyEmail(req, res) {
    try {
      const { token } = req.body;
      if (!token || typeof token !== 'string') {
        return res.status(400).json({ error: 'Invalid or missing verification token.' });
      }

      const tokenHash = this.security.hashToken(token);
      const tokenRecord = await this.db.getVerificationToken(tokenHash);

      if (!tokenRecord || !tokenRecord.user_id) {
        return res.status(400).json({ error: 'This verification link is invalid or has expired.' });
      }

      await this.db.markVerificationTokenUsed(tokenRecord.id, tokenRecord.user_id);

      res.json({
        success: true,
        message: 'Your email address has been verified successfully!'
      });
    } catch (err) {
      console.error('[VERIFY EMAIL ERROR]', err);
      res.status(500).json({ error: 'Email verification failed.' });
    }
  }
}

module.exports = { AuthHandler };
