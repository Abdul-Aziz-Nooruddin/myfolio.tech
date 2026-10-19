/**
 * Prospector - Automated Email Dispatcher
 * Sends personalized emails via your configured SMTP (Titan / Gmail).
 * Completely isolated in tools/prospector.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');

function getTransporter() {
  const smtpHost = process.env.SMTP_HOST || process.env.TITAN_HOST;
  const smtpUser = process.env.SMTP_USER || process.env.TITAN_USER || process.env.SUPPORT_EMAIL;
  const smtpPass = process.env.SMTP_PASS || process.env.TITAN_PASS;
  const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const smtpSecure = process.env.SMTP_SECURE === 'true' || smtpPort === 465;

  if (smtpHost && smtpUser && smtpPass) {
    return {
      transporter: nodemailer.createTransport({
        host: smtpHost,
        port: smtpPort,
        secure: smtpSecure,
        auth: { user: smtpUser, pass: smtpPass },
        tls: { rejectUnauthorized: false }
      }),
      fromEmail: process.env.FROM_EMAIL || `MyFolio <${smtpUser}>`
    };
  } else if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    return {
      transporter: nodemailer.createTransport({
        service: 'gmail',
        auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD }
      }),
      fromEmail: `MyFolio <${process.env.GMAIL_USER}>`
    };
  }

  return null;
}

async function sendOutreachEmail(prospect, { delayMs = 12000 } = {}) {
  const config = getTransporter();
  if (!config) {
    throw new Error('SMTP not configured in .env (Check SMTP_HOST, SMTP_USER, SMTP_PASS or GMAIL_USER)');
  }

  const { transporter, fromEmail } = config;
  const recipient = (prospect.emails && prospect.emails[0]) || prospect.contactEmail;

  if (!recipient || !recipient.includes('@')) {
    return { success: false, reason: 'No valid recipient email address found.' };
  }

  const touch1 = prospect.sequence && prospect.sequence.touch1;
  if (!touch1 || !touch1.body) {
    return { success: false, reason: 'No generated email sequence found for prospect.' };
  }

  const emailBody = `${touch1.body}\n\n---\nIf you prefer not to receive future emails, reply with "unsubscribe" and we will remove your address immediately.`;

  const mailOptions = {
    from: fromEmail,
    to: recipient,
    subject: touch1.subject,
    text: emailBody
  };

  const info = await transporter.sendMail(mailOptions);

  // Safe pacing between emails to prevent SMTP spam rate limit flags
  if (delayMs > 0) {
    await new Promise(r => setTimeout(r, delayMs));
  }

  return { success: true, messageId: info.messageId, recipient };
}

module.exports = { sendOutreachEmail, getTransporter };
