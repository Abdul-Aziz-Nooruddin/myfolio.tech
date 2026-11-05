/**
 * Email Service - Two-Track Email Automation
 * Track 5a: Transactional / Lifecycle Emails (all users, no opt-in required)
 * Track 5b: Conversion / Promotional Sequence (opt-in users only)
 */

const nodemailer = require('nodemailer');

class EmailService {
  constructor(dbService = null) {
    this.db = dbService;

    // 1. HTTP-based Email APIs (Port 443 HTTPS - immune to cloud host SMTP port blocking)
    this.resendApiKey = process.env.RESEND_API_KEY || null;
    this.brevoApiKey = process.env.BREVO_API_KEY || null;
    this.sendgridApiKey = process.env.SENDGRID_API_KEY || null;
    this.hasHttpProvider = Boolean(this.resendApiKey || this.brevoApiKey || this.sendgridApiKey);

    // 2. SMTP Settings (Titan Email, Gmail, or Custom SMTP)
    this.smtpHost = process.env.SMTP_HOST || process.env.SMTP_SERVER || process.env.MAIL_HOST || process.env.EMAIL_HOST || process.env.TITAN_HOST;
    this.smtpUser = process.env.SMTP_USER || process.env.SMTP_USERNAME || process.env.MAIL_USER || process.env.EMAIL_USER || process.env.TITAN_USER || process.env.SUPPORT_EMAIL;
    this.smtpPass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD || process.env.MAIL_PASS || process.env.MAIL_PASSWORD || process.env.EMAIL_PASS || process.env.TITAN_PASS;
    this.smtpPort = parseInt(process.env.SMTP_PORT || process.env.MAIL_PORT || process.env.EMAIL_PORT || '465', 10);
    this.smtpSecure = process.env.SMTP_SECURE === 'true' || this.smtpPort === 465;

    // Sender MUST match authenticated mailbox in Titan Email / SMTP providers
    this.fromEmail = process.env.FROM_EMAIL || (this.smtpUser ? `MyFolio <${this.smtpUser}>` : 'MyFolio <support@myfolio.tech>');

    if (this.smtpHost && this.smtpUser && this.smtpPass) {
      this.transporter = this._createSmtpTransport(this.smtpHost, this.smtpPort, this.smtpSecure);
      // Secondary fallback transport on alternate port (587 if 465, or 465 if 587)
      const altPort = this.smtpPort === 465 ? 587 : 465;
      const altSecure = altPort === 465;
      this.fallbackTransporter = this._createSmtpTransport(this.smtpHost, altPort, altSecure);
      this.hasSmtp = true;
    } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      this.transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD
        },
        connectionTimeout: 6000,
        greetingTimeout: 6000,
        socketTimeout: 8000
      });
      this.fallbackTransporter = null;
      this.hasSmtp = true;
    } else {
      this.transporter = null;
      this.fallbackTransporter = null;
      this.hasSmtp = false;
    }

    this.isConfigured = this.hasHttpProvider || this.hasSmtp;
  }

  _createSmtpTransport(host, port, secure) {
    return nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user: this.smtpUser,
        pass: this.smtpPass
      },
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
      connectionTimeout: 2500,
      greetingTimeout: 2500,
      socketTimeout: 3000,
      tls: {
        rejectUnauthorized: false
      }
    });
  }

  static parseFrom(fromStr) {
    if (!fromStr || typeof fromStr !== 'string') return { name: 'MyFolio', email: 'support@myfolio.tech' };
    const match = fromStr.match(/^\s*(?:"?([^"<]+)"?\s*)?<([^>]+)>\s*$/);
    if (match) {
      return {
        name: (match[1] || 'MyFolio').trim(),
        email: match[2].trim()
      };
    }
    return { name: 'MyFolio', email: fromStr.trim() };
  }

  static formatDeliveryError(err) {
    if (!err) return 'Email delivery failed';
    const msg = err.message || String(err);
    const isTimeout = /timeout/i.test(msg) || err.code === 'ETIMEDOUT' || err.code === 'ESOCKETTIMEDOUT';
    const isConnRefused = err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND';

    if ((isTimeout || isConnRefused) && (process.env.RENDER || process.env.NODE_ENV === 'production')) {
      return `Connection timeout (Outbound SMTP ports 465/587 blocked by cloud host. Add RESEND_API_KEY to Render environment variables or upgrade instance plan)`;
    }
    return msg;
  }

  async sendMailViaHttp({ to, subject, html, text, replyTo }) {
    const fromParsed = EmailService.parseFrom(this.fromEmail);

    if (this.resendApiKey) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: [to],
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ' '),
          reply_to: replyTo || undefined
        }),
        signal: AbortSignal.timeout(8000)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || data.error?.message || `Resend error (${response.status})`);
      }
      return { success: true, id: data.id, provider: 'resend' };
    }

    if (this.brevoApiKey) {
      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'api-key': this.brevoApiKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sender: { name: fromParsed.name, email: fromParsed.email },
          to: [{ email: to }],
          subject,
          htmlContent: html,
          textContent: text || html.replace(/<[^>]+>/g, ' '),
          replyTo: replyTo ? { email: replyTo } : undefined
        }),
        signal: AbortSignal.timeout(8000)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(data.message || `Brevo error (${response.status})`);
      }
      return { success: true, id: data.messageId, provider: 'brevo' };
    }

    if (this.sendgridApiKey) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.sendgridApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: to }] }],
          from: { email: fromParsed.email, name: fromParsed.name },
          subject,
          content: [
            { type: 'text/html', value: html },
            ...(text ? [{ type: 'text/plain', value: text }] : [])
          ]
        }),
        signal: AbortSignal.timeout(8000)
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.errors?.[0]?.message || `SendGrid error (${response.status})`);
      }
      return { success: true, provider: 'sendgrid' };
    }

    throw new Error('No HTTP email provider configured');
  }

  async verifyConnection() {
    if (this.resendApiKey) {
      try {
        const res = await fetch('https://api.resend.com/api-keys', {
          headers: { 'Authorization': `Bearer ${this.resendApiKey}` },
          signal: AbortSignal.timeout(5000)
        });
        if (res.ok) {
          return { success: true, provider: 'resend', transport: 'https' };
        }
        return { success: false, provider: 'resend', transport: 'https', error: `Resend auth failed (${res.status})` };
      } catch (e) {
        return { success: false, provider: 'resend', transport: 'https', error: e.message };
      }
    }

    if (this.brevoApiKey) {
      return { success: true, provider: 'brevo', transport: 'https' };
    }

    if (this.sendgridApiKey) {
      return { success: true, provider: 'sendgrid', transport: 'https' };
    }

    if (!this.transporter) {
      return { success: false, error: 'Transporter not configured' };
    }

    try {
      await Promise.race([
        this.transporter.verify(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Connection timeout')), 5000))
      ]);
      return { success: true, provider: 'smtp', port: this.smtpPort };
    } catch (err) {
      const formatted = EmailService.formatDeliveryError(err);
      return {
        success: false,
        provider: 'smtp',
        error: formatted,
        isRenderBlocked: Boolean(process.env.RENDER || process.env.NODE_ENV === 'production')
      };
    }
  }

  async sendMail({ to, subject, html, text, replyTo, meta = {} }) {
    if (!to || !to.includes('@')) {
      console.warn('[EMAIL] Skipped sending email: invalid or missing recipient', to);
      return { success: false, reason: 'invalid_email' };
    }

    if (process.env.NODE_ENV === 'test' && !meta.force_test_dispatch) {
      return { success: true, mocked: true };
    }

    console.log(`[EMAIL DISPATCH] To: ${to} | Subject: "${subject}" | Type: ${meta.sequence_type || 'system'}`);

    let sendSuccess = false;
    let errorMessage = null;
    let providerUsed = null;

    // 1. Prioritize HTTP Email API if configured (HTTPS Port 443 - zero block on Render / cloud)
    if (this.hasHttpProvider) {
      try {
        const httpRes = await this.sendMailViaHttp({ to, subject, html, text, replyTo });
        sendSuccess = true;
        providerUsed = httpRes.provider;
      } catch (httpErr) {
        console.warn('[EMAIL HTTP ERROR] Failed via HTTP API:', httpErr.message);
        errorMessage = httpErr.message;
      }
    }

    // 2. Fall back to / try SMTP if not yet sent and transporter is configured
    if (!sendSuccess && this.hasSmtp && this.transporter) {
      try {
        await this.transporter.sendMail({
          from: this.fromEmail,
          to,
          subject,
          html,
          text: text || html.replace(/<[^>]+>/g, ' '),
          replyTo: replyTo || undefined
        });
        sendSuccess = true;
        providerUsed = 'smtp';
      } catch (smtpErr) {
        console.warn(`[EMAIL SMTP WARN] Port ${this.smtpPort} failed: ${smtpErr.message}`);
        const isTimeout = /timeout/i.test(smtpErr.message) || smtpErr.code === 'ETIMEDOUT';
        // Only attempt fallback port if it was NOT a timeout (if cloud firewall drops SMTP, all ports time out)
        if (!isTimeout && this.fallbackTransporter) {
          try {
            await this.fallbackTransporter.sendMail({
              from: this.fromEmail,
              to,
              subject,
              html,
              text: text || html.replace(/<[^>]+>/g, ' '),
              replyTo: replyTo || undefined
            });
            sendSuccess = true;
            providerUsed = 'smtp_fallback';
          } catch (altErr) {
            console.error(`[EMAIL ERROR] Fallback SMTP also failed: ${altErr.message}`);
            errorMessage = EmailService.formatDeliveryError(smtpErr);
          }
        } else {
          errorMessage = EmailService.formatDeliveryError(smtpErr);
        }
      }
    }

    if (!this.isConfigured) {
      console.warn(`[EMAIL WARNING] Cannot send email to ${to}: No email provider configured!`);
      errorMessage = 'No email credentials (RESEND_API_KEY, BREVO_API_KEY, or SMTP) configured in environment';
    }

    if (this.db && meta.user_id) {
      try {
        await this.db.recordEmailLog({
          user_id: meta.user_id,
          email: to,
          sequence_type: meta.sequence_type || 'transactional',
          email_index: meta.email_index || 0,
          trigger_name: meta.trigger_name || subject,
          status: sendSuccess ? 'sent' : 'failed',
          error_message: errorMessage
        });
      } catch (dbErr) {
        console.warn('[EMAIL LOG] Could not save email log:', dbErr.message);
      }
    }

    return { success: sendSuccess, error: errorMessage, provider: providerUsed };
  }

  // =========================================================================
  // Track 5a: Transactional / Lifecycle Emails (No opt-in needed)
  // =========================================================================

  async sendPaymentFailedEmail(toEmail, { userId, name = 'there', plan = 'Lite', graceExpiryDate = '5 days', retryUrl = '' }) {
    const subject = `⚠️ Action Needed: Payment failed for your ${plan} portfolio subscription`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background: #fafafa; border-radius: 12px;">
        <h2 style="color: #dc2626; margin-top: 0;">Payment Failed</h2>
        <p>Hey ${name},</p>
        <p>We were unable to process your recurring subscription renewal for your portfolio site.</p>
        <p><strong>Your site is currently in a 5-day grace period (until ${graceExpiryDate}).</strong> Your live URL remains accessible during this time, but action is required to avoid takedown and permanent deletion.</p>
        <div style="margin: 28px 0;">
          <a href="${retryUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Update Payment & Keep Site Live &rarr;</a>
        </div>
        <p style="color: #71717a; font-size: 14px;">If you don't renew before the 5 days end, your portfolio design and hosting will be permanently purged.</p>
      </div>
    `;
    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'transactional', trigger_name: 'payment_failed' }
    });
  }

  async sendGraceReminderEmail(toEmail, { userId, name = 'there', milestone = 'day_1', daysLeft = '4 days', retryUrl = '', siteUrl = '' }) {
    let subject = `⏳ ${daysLeft} left to keep your portfolio live`;
    let urgency = 'medium';

    if (milestone === 'day_3') {
      subject = `⚠️ 2 days left: Your portfolio is about to be deleted`;
      urgency = 'high';
    } else if (milestone === 'day_4_5') {
      subject = `🚨 FINAL NOTICE: 12 hours left before permanent portfolio deletion`;
      urgency = 'critical';
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background: #fafafa; border-radius: 12px;">
        <h2 style="color: ${urgency === 'critical' ? '#b91c1c' : '#ea580c'}; margin-top: 0;">Grace Period Notice (${daysLeft} Remaining)</h2>
        <p>Hey ${name},</p>
        <p>This is a reminder that your portfolio subscription renewal is unpaid. You currently have <strong>${daysLeft}</strong> left in your grace window.</p>
        <p>Your portfolio URL (<a href="${siteUrl}">${siteUrl}</a>) is still holding your existing design and resume links. Once this window expires, all hosted files and design data will be permanently purged.</p>
        <div style="margin: 28px 0;">
          <a href="${retryUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Reactivate Portfolio Now &rarr;</a>
        </div>
      </div>
    `;
    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'transactional', trigger_name: `grace_reminder_${milestone}` }
    });
  }

  async sendDeletionConfirmation(toEmail, { userId, name = 'there' }) {
    const subject = `Your portfolio site has been deleted`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background: #fafafa; border-radius: 12px;">
        <h2 style="color: #4b5563; margin-top: 0;">Portfolio Takedown Completed</h2>
        <p>Hey ${name},</p>
        <p>As your unpaid grace period has elapsed, your portfolio website has been taken down and its design files purged from our hosting servers in accordance with our deletion policy.</p>
        <p>If you'd like a portfolio in the future, you can visit us anytime and generate a brand new site in seconds.</p>
      </div>
    `;
    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'transactional', trigger_name: 'deletion_confirmation' }
    });
  }

  async sendReactivationConfirmation(toEmail, { userId, name = 'there', siteUrl = '', plan = 'Lite' }) {
    const subject = `🎉 Your portfolio is live again!`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background: #fafafa; border-radius: 12px;">
        <h2 style="color: #16a34a; margin-top: 0;">Reactivation Successful</h2>
        <p>Hey ${name},</p>
        <p>Your payment succeeded and your ${plan} subscription is active again!</p>
        <p>Your portfolio design and original URL have been restored seamlessly:</p>
        <p><a href="${siteUrl}" style="font-weight: 600; color: #2563eb;">${siteUrl}</a></p>
      </div>
    `;
    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'transactional', trigger_name: 'reactivation_confirmation' }
    });
  }

  // =========================================================================
  // Track 5b: Conversion / Promotional Emails (Opt-in only)
  // =========================================================================

  async sendConversionEmail1(toEmail, { userId, name = 'there', previewUrl = '', subscribeUrl = '' }) {
    const subject = "Your portfolio's alive... for 24 hours ⏳";
    const text = `Hey ${name},

Your portfolio just went live — and it looks good. Like, "did I really make this" good.

Small catch: it's on a 24-hour preview window right now. You also have a 5-day grace period before archival.

👉 See your portfolio: ${previewUrl}

If you like what you see, lock it in before the clock runs out — then it's yours, live, for good (well, for as long as your subscription is).

Subscribe here: ${subscribeUrl}

— Devfolio AI`;

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background: #fafafa; border-radius: 12px; line-height: 1.6;">
        <h2 style="color: #18181b; margin-top: 0;">Your portfolio's alive... for 24 hours ⏳</h2>
        <p>Hey ${name},</p>
        <p>Your portfolio just went live — and it looks good. Like, <em>"did I really make this"</em> good.</p>
        <p>Small catch: it's on a <strong>24-hour preview timer</strong> right now, with an automated 5-day grace period before final takedown.</p>
        <div style="margin: 24px 0;">
          <a href="${previewUrl}" style="background: #18181b; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">👉 See Your Portfolio</a>
        </div>
        <p>If you like what you see, lock it in before the clock runs out — then it's yours, live, for good (well, for as long as your monthly subscription is).</p>
        <div style="margin: 20px 0;">
          <a href="${subscribeUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Lock In Portfolio (from ₹149/mo) &rarr;</a>
        </div>
        <p style="color: #71717a; font-size: 14px; margin-top: 32px;">— Devfolio AI</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      text,
      meta: { user_id: userId, sequence_type: 'conversion', email_index: 1, trigger_name: 'conversion_email_1_immediate' }
    });
  }

  async sendConversionEmail2(toEmail, { userId, name = 'there', subscribeUrl = '' }) {
    const subject = "Still thinking about your portfolio website?";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background: #fafafa; border-radius: 12px; line-height: 1.6;">
        <h2 style="color: #18181b; margin-top: 0;">Make your next career move stand out</h2>
        <p>Hey ${name},</p>
        <p>A personal portfolio website gets 3x more recruiter engagement than a plain PDF resume.</p>
        <p>With Devfolio, you get lightning-fast hosting, custom domain connection, and effortless live editing starting at just <strong>₹149/month</strong>.</p>
        <div style="margin: 24px 0;">
          <a href="${subscribeUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Publish Your Portfolio Site &rarr;</a>
        </div>
        <p style="color: #71717a; font-size: 14px;">— Devfolio AI</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'conversion', email_index: 2, trigger_name: 'conversion_email_2_day_3' }
    });
  }

  async sendConversionEmail3(toEmail, { userId, name = 'there', subscribeUrl = '' }) {
    const subject = "Connect your custom domain in 60 seconds";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background: #fafafa; border-radius: 12px; line-height: 1.6;">
        <h2 style="color: #18181b; margin-top: 0;">Own your digital presence</h2>
        <p>Hey ${name},</p>
        <p>Did you know you can link your own custom domain (like <code>yourname.com</code>) directly to your Devfolio site?</p>
        <p>Everything is handled automatically — SSL certificates, responsive mobile optimization, and interactive project cards.</p>
        <div style="margin: 24px 0;">
          <a href="${subscribeUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Start Your Subscription &rarr;</a>
        </div>
        <p style="color: #71717a; font-size: 14px;">— Devfolio AI</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'conversion', email_index: 3, trigger_name: 'conversion_email_3_day_6' }
    });
  }

  async sendConversionEmail4(toEmail, { userId, name = 'there', subscribeUrl = '' }) {
    const subject = "Final check: Ready to launch your portfolio?";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background: #fafafa; border-radius: 12px; line-height: 1.6;">
        <h2 style="color: #18181b; margin-top: 0;">Last check-in on your portfolio</h2>
        <p>Hey ${name},</p>
        <p>This is the final follow-up from our initial welcome series. We'd love to help you showcase your work to clients and hiring managers worldwide.</p>
        <div style="margin: 24px 0;">
          <a href="${subscribeUrl}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Get Started Now &rarr;</a>
        </div>
        <p style="color: #71717a; font-size: 14px;">— Devfolio AI</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'conversion', email_index: 4, trigger_name: 'conversion_email_4_day_9' }
    });
  }

  async sendMonthlyReengagementEmail(toEmail, { userId, name = 'there', studioUrl = '' }) {
    const subject = "Ready for a fresh portfolio update?";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #18181b; background: #fafafa; border-radius: 12px; line-height: 1.6;">
        <h2 style="color: #18181b; margin-top: 0;">Time to polish your portfolio?</h2>
        <p>Hey ${name},</p>
        <p>New projects, new skills, or a new role? Your portfolio is your 24/7 online resume.</p>
        <p>Remember, you can generate a fresh AI portfolio in 60 seconds with our Web Studio anytime.</p>
        <div style="margin: 24px 0;">
          <a href="${studioUrl || 'https://myfolio.tech/studio'}" style="background: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: 600; display: inline-block;">Generate a Fresh Preview &rarr;</a>
        </div>
        <p style="color: #71717a; font-size: 14px;">— MyFolio 3D</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'conversion_monthly', email_index: 5, trigger_name: 'conversion_email_monthly' }
    });
  }

  // =========================================================================
  // Security & Authentication Notifications (Zero Secrets / Clean Links)
  // =========================================================================

  async sendVerificationEmail(toEmail, { userId, name = 'there', verificationUrl = '' }) {
    const subject = "Verify your email address — Portfolio Bot";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; color: #f8fafc; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b;">
        <h2 style="color: #38bdf8; margin-top: 0;">Welcome to Portfolio Bot!</h2>
        <p>Hey ${name},</p>
        <p>Thank you for signing up. Please verify your email address to activate all features of your account and manage your live portfolios.</p>
        <div style="margin: 28px 0;">
          <a href="${verificationUrl}" style="background: #3b82f6; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block;">Verify Email Address &rarr;</a>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This verification link will expire in 24 hours. If you did not create an account, you can safely disregard this email.</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 12px;">Portfolio Bot Security Team • Devfolio AI</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'transactional', trigger_name: 'auth_verify_email' }
    });
  }

  async sendGoogleAuthVerifiedEmail(toEmail, { userId, name = 'there', avatarUrl = '' }) {
    const subject = "✅ Google Account Verified & Connected — myfolio.tech";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; color: #f8fafc; background: #0B1026; border-radius: 16px; border: 1px solid rgba(59, 130, 246, 0.3);">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #38bdf8; margin: 0;">Google Authentication Verified</h2>
          <p style="color: #94a3b8; font-size: 14px; margin-top: 4px;">Your Google identity has been securely verified and linked to myfolio.tech.</p>
        </div>
        <p>Hey ${name},</p>
        <p>Your Google account (<code>${toEmail}</code>) was successfully verified via Google OAuth 2.0. Your account is fully active and ready to create and deploy 3D portfolios.</p>
        <div style="background: rgba(37, 99, 235, 0.15); border: 1px solid rgba(59, 130, 246, 0.35); border-radius: 12px; padding: 16px; margin: 24px 0; display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 20px;">🛡️</span>
          <div>
            <strong style="color: #60a5fa; display: block;">Instant Security Verification: Active</strong>
            <span style="color: #cbd5e1; font-size: 13px;">Zero password hassle, protected by Google Identity Security.</span>
          </div>
        </div>
        <div style="margin: 28px 0; text-align: center;">
          <a href="${process.env.HOST_URL || 'http://localhost:5050'}/dashboard.html" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block;">Open My Dashboard &rarr;</a>
        </div>
        <hr style="border: 0; border-top: 1px solid rgba(255, 255, 255, 0.1); margin: 24px 0;" />
        <p style="color: #64748b; font-size: 12px; text-align: center;">myfolio.tech Security Team • AI Portfolio Studio</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'transactional', trigger_name: 'auth_google_verified' }
    });
  }

  async sendSignupOtpEmail(toEmail, { name = 'there', otp }) {
    const subject = `Your MyFolio Verification Code: ${otp}`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; color: #171817; background: #ffffff; border-radius: 16px; border: 1px solid rgba(23, 24, 23, 0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <div style="text-align: center; margin-bottom: 24px;">
          <h1 style="font-size: 26px; font-weight: 800; color: #171817; margin: 0 0 8px;">Verify Your Email</h1>
          <p style="color: #60615b; font-size: 14px; margin: 0;">Complete your account creation on MyFolio</p>
        </div>

        <p style="font-size: 15px; color: #171817; line-height: 1.6;">Hey <strong>${name}</strong>,</p>
        <p style="font-size: 14px; color: #60615b; line-height: 1.6;">Use the following 6-character verification code to confirm your email address and activate your account:</p>

        <div style="margin: 28px 0; text-align: center;">
          <div style="display: inline-block; background: #f4f1e8; border: 2px dashed #75c5de; border-radius: 12px; padding: 18px 36px; font-family: 'SF Mono', Monaco, Menlo, Consolas, monospace; font-size: 34px; font-weight: 900; letter-spacing: 0.35em; color: #13708e;">
            ${otp}
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #8e8f89;">
            This code contains letters and numbers and expires in 10 minutes.
          </div>
        </div>

        <p style="font-size: 13px; color: #8e8f89; line-height: 1.5;">
          If you did not attempt to sign up for MyFolio, please ignore this email. No account will be created without entering this code.
        </p>

        <hr style="border: 0; border-top: 1px solid rgba(23, 24, 23, 0.08); margin: 28px 0 20px;" />
        <p style="color: #a0a19b; font-size: 11px; text-align: center; margin: 0;">
          © 2026 MyFolio • Built by Abdul Aziz Nooruddin • All systems operational
        </p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { sequence_type: 'transactional', trigger_name: 'signup_otp' }
    });
  }

  async sendPasswordResetEmail(toEmail, { userId, name = 'there', resetUrl = '' }) {
    const subject = "Password Reset Request — Portfolio Bot";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; color: #f8fafc; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b;">
        <h2 style="color: #f59e0b; margin-top: 0;">Password Reset Request</h2>
        <p>Hey ${name},</p>
        <p>We received a request to reset the password for your Portfolio Bot account.</p>
        <div style="margin: 28px 0;">
          <a href="${resetUrl}" style="background: #f59e0b; color: #000000; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block;">Reset My Password &rarr;</a>
        </div>
        <p style="color: #94a3b8; font-size: 13px;">This link is valid for 1 hour and can only be used once. If you did not request a password reset, please ignore this email or change your password immediately if you suspect unauthorized access.</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 12px;">Portfolio Bot Security Team • Devfolio AI</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'transactional', trigger_name: 'auth_password_reset' }
    });
  }

  async sendNewLoginAlert(toEmail, { userId, name = 'there', ip = 'Unknown', userAgent = 'Unknown Device', time = new Date().toUTCString() }) {
    const subject = "Security Alert: New Sign-in to your Portfolio Bot account";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; color: #f8fafc; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b;">
        <h2 style="color: #38bdf8; margin-top: 0;">Security Alert: New Sign-in</h2>
        <p>Hey ${name},</p>
        <p>Your account was recently accessed from a new device or browser:</p>
        <ul style="background: #1e293b; padding: 16px 24px; border-radius: 8px; list-style: none; color: #cbd5e1; font-size: 14px;">
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>IP Address:</strong> ${ip}</li>
          <li><strong>Device:</strong> ${userAgent}</li>
        </ul>
        <p style="color: #94a3b8; font-size: 13px;">If this was you, no action is needed. If you did not sign in, please log in immediately and use "Log out of all devices" in your Security Settings, then change your password.</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 12px;">Portfolio Bot Security Team • Devfolio AI</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'transactional', trigger_name: 'security_new_login' }
    });
  }

  async sendPasswordChangedAlert(toEmail, { userId, name = 'there', time = new Date().toUTCString() }) {
    const subject = "Security Notice: Your password was changed";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; color: #f8fafc; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b;">
        <h2 style="color: #10b981; margin-top: 0;">Password Changed Successfully</h2>
        <p>Hey ${name},</p>
        <p>The password for your Portfolio Bot account was successfully updated on <strong>${time}</strong>.</p>
        <p>All previous active sessions have been automatically invalidated for your security.</p>
        <p style="color: #94a3b8; font-size: 13px;">If you did not make this change, please contact support or initiate a password reset immediately.</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 12px;">Portfolio Bot Security Team • Devfolio AI</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'transactional', trigger_name: 'security_password_changed' }
    });
  }

  async sendAccountDeletedAlert(toEmail, { name = 'there', time = new Date().toUTCString() }) {
    const subject = "Your Portfolio Bot account has been deleted";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 28px; color: #f8fafc; background: #0f172a; border-radius: 16px; border: 1px solid #1e293b;">
        <h2 style="color: #ef4444; margin-top: 0;">Account Deleted</h2>
        <p>Hey ${name},</p>
        <p>As requested, your Portfolio Bot account and associated session data have been permanently removed from our system on ${time}.</p>
        <p>Thank you for using Portfolio Bot. If you wish to use our services in the future, you are welcome to create a new account anytime.</p>
        <hr style="border: 0; border-top: 1px solid #1e293b; margin: 24px 0;" />
        <p style="color: #64748b; font-size: 12px;">Portfolio Bot Security Team • Devfolio AI</p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { sequence_type: 'transactional', trigger_name: 'security_account_deleted' }
    });
  }

  // =========================================================================
  // Track 5c: Dynamic User Lifecycle Automation (Tailored by User State)
  // =========================================================================

  /**
   * Funny & playful re-engagement sequence for users who signed up but haven't created a site yet
   */
  async sendNoSiteYetEmail(toEmail, { userId, name = 'there', step = 1, studioUrl = '' }) {
    const targetStudioUrl = studioUrl || `${process.env.HOST_URL || 'https://myfolio.tech'}/studio`;
    
    let subject = "Did you get lost on the way to the Studio? 🧭";
    let badgeText = "GET STARTED IN 60 SECONDS";
    let headline = "Did you get lost on the way to the Studio?";
    let bodyHtml = "";

    if (step === 2) {
      subject = "Your unfinished portfolio is giving us abandonment issues 🥺";
      badgeText = "DON'T LEAVE YOUR SKILLS IN THE DARK";
      headline = "Your unfinished portfolio misses you";
      bodyHtml = `
        <p>Hey ${name},</p>
        <p>We don't mean to be dramatic, but there is an empty 3D portfolio workspace sitting here with your name on it, wondering why nobody's claimed it yet.</p>
        <p>Recruiters spend an average of <strong>6 seconds</strong> skimming a boring PDF resume before discarding it. A living 3D portfolio gets <strong>3.2x more interview callbacks</strong> and keeps hiring managers engaged for minutes.</p>
        <p>One upload, 60 seconds, zero coding required.</p>
      `;
    } else if (step === 3) {
      subject = "Is your PDF resume still doing all the heavy lifting? 🏋️";
      badgeText = "STAND OUT FROM 500+ APPLICANTS";
      headline = "Is your PDF resume still doing all the heavy lifting?";
      bodyHtml = `
        <p>Hey ${name},</p>
        <p>Real talk: when was the last time a hiring manager said, <em>"Wow, that Times New Roman bullet point on page 2 moved me to tears"</em>?</p>
        <p>Never.</p>
        <p>Modern tech hiring is visual, spatial, and proof-driven. MyFolio turns your raw skills and project work into interactive 3D viewports, live architecture schematics, and verifiable credentials.</p>
        <p>Give it 60 seconds today. If you don't love it, you can delete it with a single click.</p>
      `;
    } else {
      // Step 1: 24 hours after signup
      bodyHtml = `
        <p>Hey ${name},</p>
        <p>We noticed you created your MyFolio account... and then vanished like a ninja into the night. 🥷</p>
        <p>Did your Wi-Fi drop? Did your cat fall asleep on the keyboard? Or are you trapped in the dreaded <em>"let me just polish my resume for the 47th time"</em> loop?</p>
        <p>Here's a secret: <strong>You don't need a finished resume.</strong> Just drop a LinkedIn profile link, upload a rough PDF, or tell our AI what you build. We generate a full 3D interactive portfolio in under 60 seconds (we timed it: less than boiling Maggi noodles 🍜).</p>
        <p>Your blank canvas is waiting.</p>
      `;
    }

    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #171817; background: #ffffff; border-radius: 16px; border: 1px solid rgba(23, 24, 23, 0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.06); line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">${badgeText}</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px;">${headline}</h2>
        ${bodyHtml}
        <div style="margin: 28px 0;">
          <a href="${targetStudioUrl}" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">🚀 Build My 3D Portfolio in 60s &rarr;</a>
        </div>
        <p style="color: #64748b; font-size: 13px; margin-top: 24px;">Zero design skills needed. Just click and see your work come to life.</p>
        <hr style="border: 0; border-top: 1px solid rgba(23, 24, 23, 0.08); margin: 28px 0 20px;" />
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">— The MyFolio Team • <a href="https://myfolio.tech" style="color: #64748b; text-decoration: none;">myfolio.tech</a></p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'lifecycle_no_site', email_index: step, trigger_name: `no_site_yet_step_${step}` }
    });
  }

  /**
   * Urgency notification sent 4-6 hours before free 24-hour preview expires
   */
  async sendPreviewExpiringSoonEmail(toEmail, { userId, name = 'there', hoursLeft = 4, previewUrl = '', subscribeUrl = '' }) {
    const targetSubscribeUrl = subscribeUrl || `${process.env.HOST_URL || 'https://myfolio.tech'}/dashboard.html`;
    const subject = `⏳ ${hoursLeft} hours left: Your 3D portfolio preview is about to freeze`;
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #171817; background: #ffffff; border-radius: 16px; border: 1px solid rgba(23, 24, 23, 0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.06); line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; background: #fef3c7; color: #b45309; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">PREVIEW EXPIRING SOON</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px;">Your 3D portfolio freezes in ${hoursLeft} hours ⏳</h2>
        <p>Hey ${name},</p>
        <p>Quick heads-up! Your 24-hour free preview window is counting down fast.</p>
        <p>In <strong>${hoursLeft} hours</strong>, your live portfolio link (<a href="${previewUrl}" style="color: #2563eb; font-weight: 600;">${previewUrl}</a>) will automatically freeze and enter standby mode.</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 16px; margin: 20px 0;">
          <strong style="color: #0f172a; display: block; margin-bottom: 6px;">Lock it in now to keep:</strong>
          <span style="color: #475569; font-size: 14px; display: block;">✓ 24/7 permanent high-speed hosting</span>
          <span style="color: #475569; font-size: 14px; display: block;">✓ Custom domain connection (yourname.com)</span>
          <span style="color: #475569; font-size: 14px; display: block;">✓ Interactive 3D viewports & project vaults</span>
        </div>
        <div style="margin: 28px 0;">
          <a href="${targetSubscribeUrl}" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">Keep My Portfolio Live (from ₹149/mo) &rarr;</a>
        </div>
        <hr style="border: 0; border-top: 1px solid rgba(23, 24, 23, 0.08); margin: 28px 0 20px;" />
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">— The MyFolio Team • <a href="https://myfolio.tech" style="color: #64748b; text-decoration: none;">myfolio.tech</a></p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'lifecycle_preview', trigger_name: 'preview_expiring_soon' }
    });
  }

  /**
   * Humorous & reassuring notification sent right when preview expires and enters 5-day grace
   */
  async sendPreviewExpiredCryoEmail(toEmail, { userId, name = 'there', previewUrl = '', retryUrl = '' }) {
    const targetRetryUrl = retryUrl || `${process.env.HOST_URL || 'https://myfolio.tech'}/dashboard.html`;
    const subject = "Your portfolio just entered cryogenic sleep 🧊";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #171817; background: #ffffff; border-radius: 16px; border: 1px solid rgba(23, 24, 23, 0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.06); line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; background: #e0f2fe; color: #0284c7; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">CRYOGENIC STANDBY • 5-DAY GRACE</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px;">Your portfolio just went to sleep 🧊</h2>
        <p>Hey ${name},</p>
        <p>The 24-hour preview timer just struck zero. Your portfolio site has officially entered cryogenic standby mode.</p>
        <p><strong>Don't panic — your work is NOT deleted!</strong> We've safely preserved all your custom data, projects, and 3D visual settings in our 5-day grace vault.</p>
        <p>During these 5 days, you can reawaken your site with 1 click. After 5 days, our automated server sweeper permanently purges unpaid preview files to make room for incoming builds.</p>
        <div style="margin: 28px 0;">
          <a href="${targetRetryUrl}" style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(2, 132, 199, 0.25);">⚡ Reawaken My Portfolio Site &rarr;</a>
        </div>
        <p style="color: #64748b; font-size: 13px;">Lock in your link now so recruiters and clients can always reach you.</p>
        <hr style="border: 0; border-top: 1px solid rgba(23, 24, 23, 0.08); margin: 28px 0 20px;" />
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">— The MyFolio Team • <a href="https://myfolio.tech" style="color: #64748b; text-decoration: none;">myfolio.tech</a></p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'lifecycle_preview', trigger_name: 'preview_expired_cryo' }
    });
  }

  /**
   * VIP onboarding and distribution tips for LIVE paid subscribers
   */
  async sendLiveWelcomeEmail(toEmail, { userId, name = 'there', siteUrl = '', plan = 'Pro', domainSettingsUrl = '' }) {
    const targetDomainUrl = domainSettingsUrl || `${process.env.HOST_URL || 'https://myfolio.tech'}/dashboard.html`;
    const subject = "🎉 You're officially LIVE! (Plus 3 ways to show it off)";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #171817; background: #ffffff; border-radius: 16px; border: 1px solid rgba(23, 24, 23, 0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.06); line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; background: #dcfce7; color: #15803d; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">PORTFOLIO PERMANENTLY LIVE</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px;">Congratulations! You are officially LIVE 🎉</h2>
        <p>Hey ${name},</p>
        <p>Your ${plan} portfolio is officially live and permanently hosted on MyFolio high-speed CDN servers.</p>
        <p>Your live address: <a href="${siteUrl}" style="color: #16a34a; font-weight: 700; text-decoration: none;">${siteUrl} ↗</a></p>
        
        <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; margin: 24px 0;">
          <strong style="color: #166534; font-size: 15px; display: block; margin-bottom: 12px;">3 Power Moves to do right now:</strong>
          <ol style="margin: 0; padding-left: 20px; color: #14532d; font-size: 14px;">
            <li style="margin-bottom: 8px;"><strong>Add to LinkedIn:</strong> Put your live link in your LinkedIn Headline & Featured section.</li>
            <li style="margin-bottom: 8px;"><strong>Connect a Custom Domain:</strong> Link your own domain (e.g. <code>yourname.com</code>) with 1 click in dashboard.</li>
            <li style="margin-bottom: 4px;"><strong>Email Signature:</strong> Add <em>"Explore my interactive work: ${siteUrl}"</em> to your outbound emails.</li>
          </ol>
        </div>

        <div style="margin: 28px 0;">
          <a href="${targetDomainUrl}" style="background: linear-gradient(135deg, #16a34a, #15803d); color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block; box-shadow: 0 4px 12px rgba(22, 163, 74, 0.25);">Manage Portfolio & Custom Domain &rarr;</a>
        </div>
        <hr style="border: 0; border-top: 1px solid rgba(23, 24, 23, 0.08); margin: 28px 0 20px;" />
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">— The MyFolio Team • <a href="https://myfolio.tech" style="color: #64748b; text-decoration: none;">myfolio.tech</a></p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'lifecycle_live', trigger_name: 'live_welcome_milestone' }
    });
  }

  /**
   * Clean win-back email for purged users inviting them to start fresh in 60s
   */
  async sendPurgedFreshStartEmail(toEmail, { userId, name = 'there', studioUrl = '' }) {
    const targetStudioUrl = studioUrl || `${process.env.HOST_URL || 'https://myfolio.tech'}/studio`;
    const subject = "Slate wiped clean — but you can rise again in 60s 🚀";
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; color: #171817; background: #ffffff; border-radius: 16px; border: 1px solid rgba(23, 24, 23, 0.1); box-shadow: 0 4px 20px rgba(0,0,0,0.06); line-height: 1.6;">
        <div style="margin-bottom: 20px;">
          <span style="display: inline-block; background: #f1f5f9; color: #475569; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; padding: 4px 10px; border-radius: 20px; text-transform: uppercase;">FRESH START</span>
        </div>
        <h2 style="font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 16px;">Slate wiped clean — ready for a fresh start? 🚀</h2>
        <p>Hey ${name},</p>
        <p>As your 5-day grace window elapsed, your previous temporary preview files have been cleared from disk in accordance with our server policy.</p>
        <p>No hard feelings! In fact, fresh starts are the best part of tech.</p>
        <p>We've just released brand new 2026 spatial themes in Web Studio — including <strong>Chrono-Obsidian Sanctuary</strong>, <strong>Cyber-Architect Sprawl</strong>, and <strong>Swiss Editorial Monograph</strong>.</p>
        <p>Whenever you're ready for your next interview or project launch, you can spin up a brand new 3D portfolio in 60 seconds.</p>
        <div style="margin: 28px 0;">
          <a href="${targetStudioUrl}" style="background: #0f172a; color: #ffffff; padding: 14px 28px; text-decoration: none; border-radius: 10px; font-weight: 700; display: inline-block;">✨ Generate Fresh Portfolio in 60s &rarr;</a>
        </div>
        <hr style="border: 0; border-top: 1px solid rgba(23, 24, 23, 0.08); margin: 28px 0 20px;" />
        <p style="color: #94a3b8; font-size: 11px; margin: 0;">— The MyFolio Team • <a href="https://myfolio.tech" style="color: #64748b; text-decoration: none;">myfolio.tech</a></p>
      </div>
    `;

    return this.sendMail({
      to: toEmail,
      subject,
      html,
      meta: { user_id: userId, sequence_type: 'lifecycle_purged', trigger_name: 'purged_fresh_start' }
    });
  }
}

module.exports = { EmailService };

