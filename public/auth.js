/**
 * Portfolio Bot — Frontend Authentication Controller
 * Asynchronous dispatch, real-time strength scoring, accessible alert rendering.
 */

// View Switcher
function switchView(viewName) {
  document.querySelectorAll('.view-card').forEach(card => card.classList.remove('active'));
  hideAlert();

  const target = document.getElementById(`view${viewName.charAt(0).toUpperCase() + viewName.slice(1)}`);
  if (target) {
    target.classList.add('active');
  }

  // Synchronize Tab Buttons Highlight (White Oval Pill)
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  if (tabLogin && tabSignup) {
    if (viewName === 'login') {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
    } else if (viewName === 'signup') {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
    }
  }
}

// Password Visibility Toggle
function togglePasswordVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  if (input.type === 'password') {
    input.type = 'text';
    btn.textContent = 'Hide';
  } else {
    input.type = 'password';
    btn.textContent = 'Show';
  }
}

// Alerts
function showAlert(message, type = 'error') {
  const alert = document.getElementById('authAlert');
  if (alert) {
    alert.className = `alert-box alert-${type}`;
    alert.textContent = message;
    alert.style.display = 'block';
  }
  const inlineAlert = document.getElementById('signupInlineAlert');
  if (inlineAlert) {
    inlineAlert.className = `alert-box alert-${type}`;
    inlineAlert.textContent = message;
    inlineAlert.style.display = 'block';
  }
  if (navigator.vibrate) {
    try { navigator.vibrate(type === 'error' ? [40, 40, 40] : 30); } catch (e) {}
  }
  if (alert) {
    alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
}

function hideAlert() {
  const alert = document.getElementById('authAlert');
  if (alert) alert.style.display = 'none';
  const inlineAlert = document.getElementById('signupInlineAlert');
  if (inlineAlert) inlineAlert.style.display = 'none';
}

// Password Strength Evaluation
function evaluatePasswordStrength(password) {
  if (!password) return { score: 0, label: 'Enter password', color: 'rgba(255,255,255,0.1)' };
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;

  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasDigit = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  const variety = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length;
  if (variety >= 3) score += 1;

  const clamped = Math.min(4, Math.max(1, score));
  const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#22c55e'];
  const labels = ['Too Short', 'Weak', 'Fair', 'Strong', 'Very Strong'];

  return {
    score: clamped,
    label: labels[clamped],
    color: colors[clamped]
  };
}

// Attach Live Strength Listeners
const signupPwd = document.getElementById('signupPassword');
if (signupPwd) {
  signupPwd.addEventListener('input', (e) => {
    const result = evaluatePasswordStrength(e.target.value);
    const fill = document.getElementById('strengthFill');
    const text = document.getElementById('strengthText');
    const score = document.getElementById('strengthScore');

    fill.style.width = `${(result.score / 4) * 100}%`;
    fill.style.background = result.color;
    text.textContent = result.label;
    text.style.color = result.color;
    score.textContent = `${result.score} / 4`;
  });
}

const resetPwd = document.getElementById('resetPassword');
if (resetPwd) {
  resetPwd.addEventListener('input', (e) => {
    const result = evaluatePasswordStrength(e.target.value);
    const fill = document.getElementById('resetStrengthFill');
    const text = document.getElementById('resetStrengthText');
    const score = document.getElementById('resetStrengthScore');

    fill.style.width = `${(result.score / 4) * 100}%`;
    fill.style.background = result.color;
    text.textContent = result.label;
    text.style.color = result.color;
    score.textContent = `${result.score} / 4`;
  });
}

// 1. Handle Login
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const identifier = document.getElementById('loginIdentifier').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const btn = document.getElementById('btnLoginSubmit');

    if (!identifier || !password) {
      return showAlert('Please enter your email/username and password.');
    }

    btn.disabled = true;
    btn.innerHTML = '<span>Signing in...</span>';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ identifier, password, rememberMe })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Invalid credentials');
      }

      if (data.user) {
        try {
          localStorage.setItem('myfolio_user', JSON.stringify(data.user));
          const uEmail = (data.user.email || '').toLowerCase().trim();
          if (uEmail === 'abdulaziznoor9876@gmail.com') {
            localStorage.setItem('myfolio_vip_admin', 'true');
          } else {
            localStorage.removeItem('myfolio_vip_admin');
            localStorage.removeItem('myfolio_active_vip_site');
            localStorage.removeItem('myfolio_weekly_allowance_v1');
          }
        } catch (e) {}
      }

      showAlert('Signed in successfully! Redirecting...', 'success');
      setTimeout(() => {
        const params = new URLSearchParams(window.location.search);
        const redirect = params.get('redirect') || '/dashboard';
        window.location.href = redirect.startsWith('/') ? redirect : '/dashboard';
      }, 600);
    } catch (err) {
      showAlert(err.message);
      btn.disabled = false;
      btn.innerHTML = '<span>Sign In</span> &rarr;';
    }
  });
}

// Live Password Match Checker
function checkConfirmPasswordMatch() {
  const pwd = document.getElementById('signupPassword')?.value || '';
  const cpwd = document.getElementById('signupConfirmPassword')?.value || '';
  const matchText = document.getElementById('confirmPasswordMatchText');
  const cpwdInput = document.getElementById('signupConfirmPassword');
  if (!matchText || !cpwdInput) return;

  if (!cpwd) {
    matchText.style.display = 'none';
    cpwdInput.classList.remove('input-error');
    return;
  }

  matchText.style.display = 'block';
  if (pwd === cpwd) {
    matchText.style.color = '#10B981';
    matchText.textContent = '✓ Passwords match';
    cpwdInput.classList.remove('input-error');
  } else {
    matchText.style.color = '#EF4444';
    matchText.textContent = '✕ Passwords do not match';
    if (cpwd.length >= pwd.length || cpwd.length >= 8) {
      cpwdInput.classList.add('input-error');
    }
  }
}

const confirmPwdInput = document.getElementById('signupConfirmPassword');
if (confirmPwdInput) {
  confirmPwdInput.addEventListener('input', checkConfirmPasswordMatch);
}
if (signupPwd) {
  signupPwd.addEventListener('input', checkConfirmPasswordMatch);
}

// 2. Handle Signup
let isSignupProcessing = false;

async function executeSignup() {
  if (isSignupProcessing) return;
  hideAlert();

  const nameInput = document.getElementById('signupName');
  const emailInput = document.getElementById('signupEmail');
  const pwdInput = document.getElementById('signupPassword');
  const cpwdInput = document.getElementById('signupConfirmPassword');
  const termsInput = document.getElementById('termsAccepted');
  const btn = document.getElementById('btnSignupSubmit');

  // Reset previous error outlines
  [nameInput, emailInput, pwdInput, cpwdInput].forEach(inp => inp?.classList.remove('input-error'));

  const name = nameInput?.value?.trim() || '';
  const email = emailInput?.value?.trim() || '';
  const username = document.getElementById('signupUsername')?.value?.trim() || (email ? email.split('@')[0] : '');
  const password = pwdInput?.value || '';
  const confirmPassword = cpwdInput?.value || '';
  const termsAccepted = termsInput?.checked;

  if (!name || name.length < 2) {
    nameInput?.classList.add('input-error');
    nameInput?.focus();
    return showAlert('Please enter your full name (at least 2 characters).');
  }

  if (!email || !email.includes('@') || !email.includes('.')) {
    emailInput?.classList.add('input-error');
    emailInput?.focus();
    return showAlert('Please enter a valid email address.');
  }

  if (password.length < 8) {
    pwdInput?.classList.add('input-error');
    pwdInput?.focus();
    return showAlert('Password must be at least 8 characters long.');
  }

  if (password !== confirmPassword) {
    cpwdInput?.classList.add('input-error');
    cpwdInput?.focus();
    checkConfirmPasswordMatch();
    return showAlert('Passwords do not match. Please check your confirm password.');
  }

  if (!termsAccepted) {
    termsInput?.focus();
    return showAlert('Please check the box to agree to the Terms and Privacy Policy.');
  }

  isSignupProcessing = true;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span>Creating account...</span>';
  }

  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ name, email, username, password, confirmPassword, termsAccepted })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || data.error || 'Signup failed');
    }

    if (data.requireOtp) {
      const otpEmailEl = document.getElementById('otpEmail');
      if (otpEmailEl) otpEmailEl.value = email;
      const instruction = document.getElementById('otpInstructionText');
      if (instruction) {
        if (data.devOtp) {
          instruction.innerHTML = `Your 6-character verification code is <strong style="font-size:16px; color:#13708e; background:#e0f2fe; padding:2px 8px; border-radius:4px; letter-spacing:2px;">${data.devOtp}</strong>. It has been filled below:`;
        } else {
          instruction.innerHTML = `We sent a 6-character code (letters and numbers) to <strong>${email}</strong>. Enter it below to create your account.`;
        }
      }
      if (typeof window.switchAuthTab === 'function') {
        window.switchAuthTab('otp');
      } else {
        switchView('otp');
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<span>Create account</span> &rarr;';
      }
      const otpInput = document.getElementById('otpInput');

      if (data.devOtp) {
        showAlert(`Verification code: <strong>${data.devOtp}</strong> (entered automatically below)`, 'success');
        if (otpInput) {
          otpInput.value = data.devOtp;
          setTimeout(() => otpInput.focus(), 150);
        }
      } else {
        showAlert('Verification code sent to your email! Please check your inbox.', 'success');
        if (otpInput) {
          otpInput.value = '';
          setTimeout(() => otpInput.focus(), 150);
        }
      }
      return;
    }

    if (data.user) {
      try {
        localStorage.setItem('myfolio_user', JSON.stringify(data.user));
        const uEmail = (data.user.email || '').toLowerCase().trim();
        if (uEmail === 'abdulaziznoor9876@gmail.com') {
          localStorage.setItem('myfolio_vip_admin', 'true');
        } else {
          localStorage.removeItem('myfolio_vip_admin');
          localStorage.removeItem('myfolio_active_vip_site');
          localStorage.removeItem('myfolio_weekly_allowance_v1');
        }
      } catch (e) {}
    }

    showAlert('Account created successfully! Redirecting...', 'success');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 800);
  } catch (err) {
    console.error('[AUTH SIGNUP ERROR]', err);
    showAlert(err.message || 'An unexpected error occurred. Please try again.');
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<span>Create account</span> &rarr;';
    }
  } finally {
    isSignupProcessing = false;
  }
}

function handleSignupSubmit(e) {
  if (e) {
    e.preventDefault();
    e.stopPropagation();
  }
  executeSignup();
}
window.handleSignupSubmit = handleSignupSubmit;

const signupForm = document.getElementById('signupForm');
if (signupForm) {
  signupForm.addEventListener('submit', handleSignupSubmit);
}

// 2b. Handle OTP Verification Form
const otpForm = document.getElementById('otpForm');
if (otpForm) {
  otpForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const email = (document.getElementById('otpEmail')?.value || '').trim();
    const otpInput = document.getElementById('otpInput');
    const otp = (otpInput?.value || '').trim().toUpperCase();
    const btn = document.getElementById('btnOtpSubmit');

    if (!email) {
      showAlert('Email address is missing. Please start registration again.');
      return;
    }

    if (!otp || otp.length !== 6) {
      showAlert('Please enter the complete 6-character verification code.');
      if (otpInput) otpInput.focus();
      return;
    }

    btn.disabled = true;
    btn.innerHTML = '<span>Verifying & Creating Account...</span>';

    try {
      const res = await fetch('/api/auth/verify-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || 'Verification failed');
      }

      if (data.user) {
        try {
          localStorage.setItem('myfolio_user', JSON.stringify(data.user));
          const uEmail = (data.user.email || '').toLowerCase().trim();
          if (uEmail === 'abdulaziznoor9876@gmail.com') {
            localStorage.setItem('myfolio_vip_admin', 'true');
          }
        } catch (e) {}
      }

      showAlert('✅ Account verified and created successfully! Redirecting...', 'success');
      setTimeout(() => {
        window.location.href = data.redirectUrl || '/dashboard';
      }, 700);
    } catch (err) {
      showAlert(err.message, 'error');
      btn.disabled = false;
      btn.innerHTML = '<span>Verify & Complete Registration</span> &rarr;';
      if (otpInput) otpInput.focus();
    }
  });
}

// 2c. Handle Resend OTP
const btnResendOtp = document.getElementById('btnResendOtp');
if (btnResendOtp) {
  btnResendOtp.addEventListener('click', async (e) => {
    e.preventDefault();
    hideAlert();

    const email = (document.getElementById('otpEmail')?.value || '').trim();
    if (!email) {
      showAlert('No registration in progress. Please start signup again.');
      return;
    }

    btnResendOtp.textContent = 'Sending...';
    btnResendOtp.style.pointerEvents = 'none';

    try {
      const res = await fetch('/api/auth/resend-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to resend code');
      }

      const otpInput = document.getElementById('otpInput');
      const instruction = document.getElementById('otpInstructionText');
      if (data.devOtp) {
        if (instruction) {
          instruction.innerHTML = `Your fresh verification code is <strong style="font-size:16px; color:#13708e; background:#e0f2fe; padding:2px 8px; border-radius:4px; letter-spacing:2px;">${data.devOtp}</strong>. It has been filled below:`;
        }
        showAlert(`Fresh verification code: <strong>${data.devOtp}</strong> (entered automatically below)`, 'success');
        if (otpInput) {
          otpInput.value = data.devOtp;
          setTimeout(() => otpInput.focus(), 150);
        }
      } else {
        showAlert('A fresh 6-character verification code has been sent to your email. Please check your inbox.', 'success');
        if (otpInput) {
          otpInput.value = '';
          setTimeout(() => otpInput.focus(), 150);
        }
      }
    } catch (err) {
      showAlert(err.message, 'error');
    } finally {
      setTimeout(() => {
        btnResendOtp.textContent = "Didn't get code? Resend";
        btnResendOtp.style.pointerEvents = 'auto';
      }, 3000);
    }
  });
}

// 3. Handle Forgot Password
const forgotForm = document.getElementById('forgotForm');
if (forgotForm) {
  forgotForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const email = document.getElementById('forgotEmail').value.trim();
    const btn = document.getElementById('btnForgotSubmit');

    if (!email || !email.includes('@')) {
      return showAlert('Please enter a valid email address.');
    }

    btn.disabled = true;
    btn.innerHTML = '<span>Sending instructions...</span>';

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email })
      });

      const data = await res.json();
      showAlert(data.message || 'If an account exists, recovery instructions have been sent.', 'success');
      btn.disabled = false;
      btn.innerHTML = '<span>Send Reset Link</span> &rarr;';
    } catch (err) {
      showAlert('Could not request password reset. Please try again.');
      btn.disabled = false;
      btn.innerHTML = '<span>Send Reset Link</span> &rarr;';
    }
  });
}

// 4. Handle Reset Password
const resetForm = document.getElementById('resetForm');
if (resetForm) {
  resetForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const token = document.getElementById('resetTokenInput').value.trim();
    const password = document.getElementById('resetPassword').value;
    const confirmPassword = document.getElementById('resetConfirmPassword').value;
    const btn = document.getElementById('btnResetSubmit');

    if (!token) {
      return showAlert('Reset token is missing or invalid. Please request a new link.');
    }

    if (password.length < 8) {
      return showAlert('New password must be at least 8 characters long.');
    }

    if (password !== confirmPassword) {
      return showAlert('Passwords do not match.');
    }

    btn.disabled = true;
    btn.innerHTML = '<span>Updating password...</span>';

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token, password, confirmPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Password reset failed');
      }

      showAlert('Password updated successfully! Please sign in with your new password.', 'success');
      setTimeout(() => switchView('login'), 1500);
    } catch (err) {
      showAlert(err.message);
      btn.disabled = false;
      btn.innerHTML = '<span>Update Password</span> &rarr;';
    }
  });
}

// 5. Automatic Verification Handler & Route Parser
window.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const view = urlParams.get('view') || 'login';
  const token = urlParams.get('token');

  if (view === 'reset' && token) {
    const tokenInput = document.getElementById('resetTokenInput');
    if (tokenInput) tokenInput.value = token;
    switchView('reset');
    return;
  }

  if (view === 'verify' && token) {
    switchView('verify');
    const statusText = document.getElementById('verifyStatusText');
    const btnDash = document.getElementById('btnVerifyDashboard');

    try {
      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Verification failed');
      }

      statusText.innerHTML = '<span style="color: #10b981; font-weight: 700;">Email Verified Successfully!</span><br>Your account is fully activated.';
      btnDash.style.display = 'inline-flex';
    } catch (err) {
      statusText.innerHTML = `<span style="color: #ef4444; font-weight: 700;">Verification Failed</span><br>${err.message}`;
    }
    return;
  }

  const errorParam = urlParams.get('error');
  if (errorParam) {
    if (errorParam === 'missing_google_cloud_credentials') {
      showAlert('Google Cloud OAuth Setup Required: Please add your GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to .env from Google Cloud Console.', 'error');
    } else if (errorParam === 'missing_github_oauth_credentials') {
      showAlert('GitHub OAuth Notice: GITHUB_CLIENT_ID is not configured in .env yet. You can sign in using your Email/Password, or Google 1-Click!', 'info');
    } else {
      showAlert(`Authentication Notice: ${decodeURIComponent(errorParam)}`, 'error');
    }
  }

  switchView(view);
  initGoogleIdentityServices();
});

// 6. Google Identity Services (GIS) & Social Authentication Handler
let googleClientId = null;

async function initGoogleIdentityServices() {
  try {
    const res = await fetch('/api/auth/google/config');
    const data = await res.json();
    if (data.configured && data.clientId && typeof google !== 'undefined' && google.accounts?.id) {
      googleClientId = data.clientId;
      google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
    }
  } catch (e) {
    console.warn('[GOOGLE GIS INIT]', e.message);
  }
}

async function handleGoogleCredentialResponse(response) {
  if (!response.credential) return;
  hideAlert();
  showAlert('Verifying Google Identity...', 'info');

  try {
    const res = await fetch('/api/auth/google/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ credential: response.credential })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Google verification failed');
    }

    showAlert(`Google Verified! Welcome, ${data.user.name || data.user.email}. Redirecting...`, 'success');
    setTimeout(() => {
      window.location.href = '/dashboard';
    }, 600);
  } catch (err) {
    showAlert(err.message, 'error');
  }
}

function handleSocialAuth(provider = 'google') {
  hideAlert();

  if (provider === 'google') {
    // Navigate directly to official Google OAuth 2.0 account selection screen
    window.location.href = '/api/auth/google';
    return;
  }

  if (provider === 'github') {
    // Navigate directly to official GitHub OAuth authorization screen
    window.location.href = '/api/auth/github';
    return;
  }

  window.location.href = `/api/auth/${provider}`;
}

// Check URL pathname and query params on page load
document.addEventListener('DOMContentLoaded', () => {
  try {
    const url = new URL(window.location);
    const view = url.searchParams.get('view');
    const path = window.location.pathname.toLowerCase();
    const error = url.searchParams.get('error');

    if (view) {
      switchView(view);
    } else if (path.includes('signup') || path.includes('register')) {
      switchView('signup');
    } else if (path.includes('forgot')) {
      switchView('forgot');
    } else if (path.includes('reset')) {
      switchView('reset');
    } else if (path.includes('verify')) {
      switchView('verify');
    } else {
      switchView('login');
    }

    if (error) {
      const errorMap = {
        missing_google_cloud_credentials: 'Google OAuth keys (GOOGLE_CLIENT_ID) must be configured in Render Environment Variables to enable Google Sign-In.',
        google_failed: 'Google Sign-In could not be completed. Please try again.',
        google_auth_failed: 'Google authentication failed.',
        missing_code: 'Authorization code was not returned by Google.'
      };
      showAlert(errorMap[error] || `Authentication notice: ${error.replace(/_/g, ' ')}`, 'error');
    }
  } catch (e) {}
});

// Global Window Function Exports
window.switchView = switchView;
window.togglePasswordVisibility = togglePasswordVisibility;
window.showAlert = showAlert;
window.hideAlert = hideAlert;
window.handleSocialAuth = handleSocialAuth;
window.handleGoogleCredentialResponse = handleGoogleCredentialResponse;
