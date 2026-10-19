/**
 * Prospector - Dashboard Generator
 * Creates an interactive local HTML dashboard to preview leads and approve emails.
 */

const fs = require('fs');
const path = require('path');

function generateDashboard(prospects, outputPath) {
  const safeJson = JSON.stringify(prospects).replace(/</g, '\\u003c');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Harvey Mini - B2B Outreach Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #090A0F;
      --card-bg: #12141D;
      --border: #1E2235;
      --accent: #6366F1;
      --accent-glow: rgba(99, 102, 241, 0.25);
      --success: #10B981;
      --warning: #F59E0B;
      --text: #F8FAFC;
      --text-muted: #94A3B8;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', sans-serif;
      padding: 32px 24px;
      line-height: 1.5;
    }
    .header {
      max-width: 1200px;
      margin: 0 auto 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .badge {
      background: var(--accent-glow);
      color: #818CF8;
      border: 1px solid #4F46E5;
      padding: 4px 10px;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 600;
    }
    .stats {
      display: flex;
      gap: 16px;
    }
    .stat-pill {
      background: var(--card-bg);
      border: 1px solid var(--border);
      padding: 8px 16px;
      border-radius: 8px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .stat-pill strong { color: var(--text); }
    .grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      gap: 20px;
    }
    .card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 24px;
      transition: border-color 0.2s;
    }
    .card:hover { border-color: #313854; }
    .card-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .biz-name { font-size: 18px; font-weight: 700; color: #fff; }
    .biz-meta {
      font-size: 13px;
      color: var(--text-muted);
      margin-top: 4px;
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .biz-meta a { color: #60A5FA; text-decoration: none; }
    .biz-meta a:hover { text-decoration: underline; }
    .gaps {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-bottom: 16px;
    }
    .gap-tag {
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.3);
      color: #FCD34D;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .tech-tag {
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.3);
      color: #6EE7B7;
      font-size: 11px;
      padding: 4px 8px;
      border-radius: 6px;
      font-family: 'JetBrains Mono', monospace;
    }
    .emails-box {
      background: #0B0D14;
      border: 1px solid #1C2030;
      border-radius: 8px;
      padding: 16px;
      margin-top: 16px;
    }
    .tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      border-bottom: 1px solid #1C2030;
      padding-bottom: 8px;
    }
    .tab-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      padding: 4px 8px;
      border-radius: 4px;
    }
    .tab-btn.active {
      color: #fff;
      background: #1E2338;
    }
    .email-subject {
      font-size: 13px;
      font-weight: 600;
      color: #E2E8F0;
      margin-bottom: 8px;
    }
    .email-body {
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      color: #CBD5E1;
      white-space: pre-wrap;
      line-height: 1.6;
      background: #080A10;
      padding: 12px;
      border-radius: 6px;
      border: 1px solid #161A29;
    }
    .actions {
      display: flex;
      gap: 12px;
      margin-top: 12px;
    }
    .btn {
      padding: 6px 14px;
      font-size: 12px;
      font-weight: 600;
      border-radius: 6px;
      cursor: pointer;
      border: 1px solid transparent;
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: #4F46E5; }
    .btn-secondary { background: #1C2030; color: #E2E8F0; border-color: #2D334A; }
    .btn-secondary:hover { background: #262C42; }
  </style>
</head>
<body>

  <div class="header">
    <div class="brand">
      <h2>⚡ Harvey Mini</h2>
      <span class="badge">100% Free • Powered by Gemini 3.8</span>
    </div>
    <div class="stats">
      <div class="stat-pill">Total Leads: <strong id="totalLeads">0</strong></div>
      <div class="stat-pill">With Email: <strong id="withEmail">0</strong></div>
    </div>
  </div>

  <div class="grid" id="leadsGrid"></div>

  <script>
    const leads = ${safeJson};

    document.getElementById('totalLeads').innerText = leads.length;
    document.getElementById('withEmail').innerText = leads.filter(l => l.emails && l.emails.length > 0).length;

    const grid = document.getElementById('leadsGrid');

    leads.forEach((l, idx) => {
      const card = document.createElement('div');
      card.className = 'card';

      const emailStr = l.emails && l.emails.length > 0 ? l.emails.join(', ') : 'No email detected';
      const gapsHtml = (l.detectedGaps || []).map(g => '<span class="gap-tag">' + g + '</span>').join('');
      const techHtml = (l.techStack || []).map(t => '<span class="tech-tag">' + t + '</span>').join('');

      const t1 = l.sequence ? l.sequence.touch1 : { subject: '', body: '' };
      const t2 = l.sequence ? l.sequence.touch2 : { subject: '', body: '' };
      const t3 = l.sequence ? l.sequence.touch3 : { subject: '', body: '' };

      card.innerHTML = \`
        <div class="card-top">
          <div>
            <div class="biz-name">\${l.name}</div>
            <div class="biz-meta">
              <span>📍 \${l.city || 'Unknown'}</span>
              <span>🏷️ \${l.category || 'General'}</span>
              \${l.website ? '<span>🌐 <a href="' + l.website + '" target="_blank">' + l.website.replace('https://', '').replace('http://', '') + '</a></span>' : '<span style="color:#EF4444">⚠️ No Website</span>'}
              <span>✉️ \${emailStr}</span>
            </div>
          </div>
        </div>

        <div class="gaps">
          \${techHtml}
          \${gapsHtml}
        </div>

        <div class="emails-box">
          <div class="tabs">
            <button class="tab-btn active" onclick="switchTab(\${idx}, 1)">Touch 1 (Hook)</button>
            <button class="tab-btn" onclick="switchTab(\${idx}, 2)">Touch 2 (Value)</button>
            <button class="tab-btn" onclick="switchTab(\${idx}, 3)">Touch 3 (Breakup)</button>
          </div>

          <div id="tab-content-\${idx}">
            <div class="email-subject" id="subject-\${idx}">Subject: \${t1.subject}</div>
            <div class="email-body" id="body-\${idx}">\${t1.body}</div>
          </div>

          <div class="actions">
            <button class="btn btn-primary" onclick="copyEmail(\${idx})">📋 Copy Draft</button>
            \${l.emails && l.emails.length > 0 ? \`
              <a class="btn" id="gmail-btn-\${idx}" style="background:#EA4335; color:#fff;" target="_blank" href="https://mail.google.com/mail/?view=cm&fs=1&to=\${encodeURIComponent(l.emails[0])}&su=\${encodeURIComponent(t1.subject)}&body=\${encodeURIComponent(t1.body)}">✉️ Open in Gmail</a>
              <a class="btn btn-secondary" id="mail-btn-\${idx}" href="mailto:\${l.emails[0]}?subject=\${encodeURIComponent(t1.subject)}&body=\${encodeURIComponent(t1.body)}">📱 Default Mail</a>
            \` : ''}
          </div>
        </div>
      \`;

      grid.appendChild(card);
    });

    window.switchTab = function(idx, touchNum) {
      const l = leads[idx];
      const seq = l.sequence ? l.sequence['touch' + touchNum] : { subject: '', body: '' };
      document.getElementById('subject-' + idx).innerText = 'Subject: ' + seq.subject;
      document.getElementById('body-' + idx).innerText = seq.body;

      if (l.emails && l.emails.length > 0) {
        const gmailBtn = document.getElementById('gmail-btn-' + idx);
        if (gmailBtn) {
          gmailBtn.href = 'https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(l.emails[0]) + '&su=' + encodeURIComponent(seq.subject) + '&body=' + encodeURIComponent(seq.body);
        }
        const mailBtn = document.getElementById('mail-btn-' + idx);
        if (mailBtn) {
          mailBtn.href = 'mailto:' + l.emails[0] + '?subject=' + encodeURIComponent(seq.subject) + '&body=' + encodeURIComponent(seq.body);
        }
      }

      const tabs = event.target.parentElement.querySelectorAll('.tab-btn');
      tabs.forEach(t => t.classList.remove('active'));
      event.target.classList.add('active');
    };

    window.copyEmail = function(idx) {
      const body = document.getElementById('body-' + idx).innerText;
      navigator.clipboard.writeText(body);
      alert('Email copied to clipboard!');
    };
  </script>
</body>
</html>`;

  fs.writeFileSync(outputPath, html, 'utf8');
}

module.exports = { generateDashboard };
