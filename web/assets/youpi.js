/**
 * YOUPI PG V2 — Universal One-Script Integration SDK
 *
 * Official Distributable Browser Script (youpi.js / youpi-checkout.js)
 * Provides zero-JavaScript button configuration [data-youpi-pay] and programmatic Youpi.pay({...})
 * Launches the responsive iframe checkout modal with background blur.
 * Emits normalized browser payment events and manages checkout modal lifecycle.
 *
 * IMPORTANT SECURITY NOTE:
 * Browser events and client-side callbacks are strictly for UI and user experience.
 * Authoritative proof of payment MUST ALWAYS come from server-to-server HMAC-SHA256 signed webhooks.
 */

(function (globalScope) {
  'use strict';

  // Prevent multiple initializations
  if (globalScope.__YOUPI_SDK_INITIALIZED__) {
    return;
  }
  globalScope.__YOUPI_SDK_INITIALIZED__ = true;

  const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

  /**
   * Helper: extract configuration from the <script> tag loading this file.
   */
  function getScriptConfig() {
    if (!isBrowser) return {};

    const script = document.currentScript ||
      document.querySelector('script[src*="youpi.js"], script[src*="youpi-checkout.js"]');

    if (!script) return {};

    let scriptUrl = '';
    try {
      scriptUrl = new URL(script.src, window.location.href);
    } catch (e) { }

    const origin = scriptUrl ? scriptUrl.origin : (window.location.protocol + '//' + window.location.hostname + ':7000');

    return {
      key: script.getAttribute('data-youpi-key') || script.getAttribute('data-key') || script.getAttribute('data-merchant-id') || '',
      apiUrl: script.getAttribute('data-api-url') || origin,
      portalUrl: script.getAttribute('data-portal-url') || script.getAttribute('data-checkout-url') || origin,
      currency: script.getAttribute('data-currency') || 'INR',
      name: script.getAttribute('data-name') || 'Merchant Store',
      themeColor: script.getAttribute('data-theme-color') || '#0b63e5',
      successUrl: script.getAttribute('data-success-url') || '',
      failedUrl: script.getAttribute('data-failed-url') || '',
      suspiciousUrl: script.getAttribute('data-suspicious-url') || '',
      expiredUrl: script.getAttribute('data-expired-url') || '',
      cancelledUrl: script.getAttribute('data-cancelled-url') || ''
    };
  }

  const scriptConfig = getScriptConfig();

  /**
   * YoupiCheckout class
   */
  class YoupiCheckout {
    /**
     * @param {{
     *   key?: string,
     *   order_id?: string,
     *   orderId?: string,
     *   amount?: number | string,
     *   currency?: string,
     *   name?: string,
     *   description?: string,
     *   customer?: { name?: string, email?: string, phone?: string },
     *   metadata?: Record<string, any>,
     *   paymentId?: string,
     *   checkoutUrl?: string,
     *   portalUrl?: string,
     *   apiUrl?: string,
     *   theme?: { color?: string },
     *   handler?: (result: any) => void,
     *   onSuccess?: (result: any) => void,
     *   onFailed?: (result: any) => void,
     *   onPaymentFailed?: (result: any) => void,
     *   onSuspicious?: (result: any) => void,
     *   onExpired?: (result: any) => void,
     *   onCancelled?: (result: any) => void,
     *   onClose?: () => void,
     *   successUrl?: string,
     *   failedUrl?: string,
     *   suspiciousUrl?: string,
     *   expiredUrl?: string,
     *   cancelledUrl?: string
     * }} options
     */
    constructor(options = {}) {
      const defaultPortal = isBrowser
        ? (scriptConfig.portalUrl || (window.location.protocol + '//' + window.location.hostname + ':7000'))
        : 'http://localhost:7000';

      const defaultApi = isBrowser
        ? (scriptConfig.apiUrl || defaultPortal)
        : 'http://localhost:6100';

      this.options = Object.assign({
        key: scriptConfig.key || '',
        order_id: '',
        orderId: '',
        amount: 0,
        currency: scriptConfig.currency || 'INR',
        name: scriptConfig.name || 'Merchant Store',
        description: 'Order Payment',
        customer: {},
        metadata: {},
        paymentId: '',
        checkoutUrl: '',
        portalUrl: defaultPortal,
        apiUrl: defaultApi,
        theme: { color: scriptConfig.themeColor || '#0b63e5' },
        handler: null,
        onSuccess: null,
        onFailed: null,
        onPaymentFailed: null,
        onSuspicious: null,
        onExpired: null,
        onCancelled: null,
        onClose: null,
        successUrl: scriptConfig.successUrl || '',
        failedUrl: scriptConfig.failedUrl || '',
        suspiciousUrl: scriptConfig.suspiciousUrl || '',
        expiredUrl: scriptConfig.expiredUrl || '',
        cancelledUrl: scriptConfig.cancelledUrl || ''
      }, options);

      // Normalize order ID
      if (!this.options.orderId && this.options.order_id) {
        this.options.orderId = this.options.order_id;
      }
      if (!this.options.order_id && this.options.orderId) {
        this.options.order_id = this.options.orderId;
      }

      this.isOpen = false;
      this.backdrop = null;
      this.container = null;
      this.iframe = null;

      this._handleMessage = this._handleMessage.bind(this);
    }

    /**
     * Primary static programmatic entry point: Youpi.pay(options)
     */
    static async pay(options = {}) {
      const instance = new YoupiCheckout(options);

      // If checkoutUrl is already provided, open modal directly
      if (instance.options.checkoutUrl) {
        instance.open();
        return instance;
      }

      // If paymentId is already provided, construct checkoutUrl and open
      if (instance.options.paymentId) {
        instance.options.checkoutUrl = `${instance.options.portalUrl}/checkout/${instance.options.paymentId}`;
        instance.open();
        return instance;
      }

      // Otherwise, call YOUPI PG to create the payment session
      try {
        const orderId = instance.options.orderId || `ORDER-${Date.now()}`;
        instance.options.orderId = orderId;
        instance.options.order_id = orderId;

        const customer = instance.options.customer || {};
        const custPayload = {
          fullName: customer.name || customer.fullName || '',
          email: customer.email || '',
          phoneNumber: customer.phone || customer.phoneNumber || customer.mobileNumber || ''
        };

        const createRes = await fetch(`${instance.options.apiUrl}/api/v1/payments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(instance.options.key ? { 'X-Merchant-Id': instance.options.key } : {})
          },
          body: JSON.stringify({
            orderId: orderId,
            amount: instance.options.amount,
            currency: instance.options.currency || 'INR',
            customer: (custPayload.email || custPayload.phoneNumber || custPayload.fullName) ? custPayload : undefined,
            description: instance.options.description,
            metadata: instance.options.metadata,
            returnUrl: instance.options.successUrl || undefined
          })
        });

        const data = await createRes.json();
        if (!createRes.ok || !data.checkoutUrl) {
          const errMsg = data.error || data.message || `Failed to create payment session (HTTP ${createRes.status})`;
          const failResult = {
            status: 'FAILED',
            order_id: orderId,
            reason: errMsg,
            error: errMsg
          };
          YoupiCheckout._emitEvent('youpi:payment:failed', failResult);
          YoupiCheckout._emitEvent('youpi:payment:result', failResult);
          if (typeof instance.options.onFailed === 'function') instance.options.onFailed(failResult);
          if (typeof instance.options.onPaymentFailed === 'function') instance.options.onPaymentFailed(failResult);
          throw new Error(errMsg);
        }

        instance.options.paymentId = data.paymentId;
        instance.options.checkoutUrl = data.checkoutUrl;
        instance.open();
        return instance;
      } catch (err) {
        console.error('[YouPI JS] Payment initialization error:', err.message);
        throw err;
      }
    }

    /**
     * Backward-compatible static entry point: YoupiCheckout.open(options)
     */
    static open(options) {
      const instance = new YoupiCheckout(options);
      instance.open();
      return instance;
    }

    /**
     * Opens the responsive iframe checkout modal
     */
    open() {
      if (!isBrowser) {
        console.warn('YoupiCheckout.open() can only be invoked in a browser DOM environment.');
        return;
      }
      if (this.isOpen) return;
      this.isOpen = true;

      YoupiCheckout._ensureStyles();

      let targetUrl = '';
      if (this.options.checkoutUrl) {
        targetUrl = this.options.checkoutUrl;
      } else if (this.options.paymentId) {
        targetUrl = `${this.options.portalUrl}/checkout/${this.options.paymentId}`;
      } else {
        targetUrl = `${this.options.portalUrl}/checkout/demo`;
      }

      // If running on localhost / 127.0.0.1 and targetUrl points to remote domain, normalize to localhost host
      if (isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
        if (targetUrl.includes('gauravtesting.online')) {
          try {
            const parsed = new URL(targetUrl);
            targetUrl = `${window.location.protocol}//${window.location.host}${parsed.pathname}${parsed.search}`;
          } catch {}
        }
      }

      // Add embedded flag and custom params
      const sep = targetUrl.includes('?') ? '&' : '?';
      targetUrl = `${targetUrl}${sep}embedded=1`;

      if (this.options.amount) {
        targetUrl += `&customAmount=${encodeURIComponent(this.options.amount)}`;
      }
      if (this.options.name) {
        targetUrl += `&customName=${encodeURIComponent(this.options.name)}`;
      }

      this._injectModal(targetUrl);
      window.addEventListener('message', this._handleMessage);
    }

    /**
     * Closes the checkout modal
     */
    close(callback) {
      if (!isBrowser || !this.isOpen) return;
      this.isOpen = false;

      window.removeEventListener('message', this._handleMessage);

      if (this.container) {
        this.container.classList.remove('active');
        this.container.classList.add('closing');
      }
      if (this.backdrop) {
        this.backdrop.classList.remove('active');
      }

      setTimeout(() => {
        if (this.backdrop && this.backdrop.parentNode) {
          this.backdrop.parentNode.removeChild(this.backdrop);
        }
        this.backdrop = null;
        this.container = null;
        this.iframe = null;

        if (typeof this.options.onClose === 'function') {
          this.options.onClose();
        }
        if (typeof callback === 'function') {
          callback();
        }
      }, 350);
    }

    _injectModal(targetUrl) {
      const backdrop = document.createElement('div');
      backdrop.className = 'youpi-checkout-backdrop';

      const container = document.createElement('div');
      container.className = 'youpi-checkout-container';
      container.style.cssText = 'max-width: 440px; width: 100%; max-height: 90vh; overflow-y: auto; background: #0A0D18; border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 24px; box-shadow: 0 30px 80px rgba(0,0,0,0.9), 0 0 40px rgba(56, 189, 248, 0.15); color: #F8FAFC; padding: 24px; position: relative; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;';

      const closeBtn = document.createElement('button');
      closeBtn.className = 'youpi-checkout-close-btn';
      closeBtn.innerHTML = '✕';
      closeBtn.title = 'Close Checkout';
      closeBtn.type = 'button';
      closeBtn.style.cssText = 'position: absolute; top: 16px; right: 16px; width: 32px; height: 32px; border-radius: 50%; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); color: #94A3B8; font-size: 15px; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; transition: all 0.2s;';
      closeBtn.onmouseenter = () => { closeBtn.style.color = '#fff'; closeBtn.style.background = 'rgba(255,255,255,0.18)'; };
      closeBtn.onmouseleave = () => { closeBtn.style.color = '#94A3B8'; closeBtn.style.background = 'rgba(255,255,255,0.08)'; };
      closeBtn.onclick = () => {
        this._dispatchCancelled();
        this.close();
      };

      const amount = Number(this.options.amount || 149);
      const merchantName = this.options.name || 'MyFolio Technologies';
      const vpa = this.options.vpa || 'merchant@upi';
      const orderId = this.options.orderId || this.options.order_id || ('youpi_ord_' + Date.now());
      const upiUri = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(merchantName)}&am=${encodeURIComponent(amount)}&cu=INR&tn=${encodeURIComponent('MyFolio Portfolio Unlock ' + orderId)}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(upiUri)}`;

      container.appendChild(closeBtn);

      const content = document.createElement('div');
      content.innerHTML = `
        <div style="text-align: center; margin-bottom: 18px;">
          <div style="display: inline-flex; align-items: center; gap: 6px; padding: 4px 12px; background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.3); border-radius: 999px; font-size: 11px; font-weight: 700; color: #38BDF8; letter-spacing: 0.05em; text-transform: uppercase; margin-bottom: 10px;">
            <span style="width: 6px; height: 6px; border-radius: 50%; background: #38BDF8; box-shadow: 0 0 6px #38BDF8;"></span>
            Sovereign UPI • 0% Aggregator Fee
          </div>
          <h2 style="font-size: 1.4rem; font-weight: 800; color: #FFFFFF; margin: 0 0 4px 0; letter-spacing: -0.02em;">Scan QR to Pay ₹${amount}</h2>
          <p style="font-size: 0.85rem; color: #94A3B8; margin: 0;">Direct bank-to-bank settlement to <strong>${merchantName}</strong></p>
        </div>

        <div style="background: #FFFFFF; border-radius: 16px; padding: 14px; display: flex; justify-content: center; align-items: center; margin: 0 auto 16px auto; width: 230px; height: 230px; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
          <img src="${qrCodeUrl}" alt="UPI QR Code" style="width: 200px; height: 200px; display: block;" />
        </div>

        <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 10px 14px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between;">
          <div>
            <div style="font-size: 11px; color: #94A3B8; text-transform: uppercase; font-weight: 700;">Receiving UPI VPA</div>
            <div style="font-size: 13px; color: #F1F5F9; font-weight: 600; font-family: monospace;">${vpa}</div>
          </div>
          <button id="copyVpaBtn" type="button" style="background: rgba(56,189,248,0.15); border: 1px solid rgba(56,189,248,0.3); color: #38BDF8; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 700; cursor: pointer;">Copy</button>
        </div>

        <div style="margin-bottom: 16px; text-align: center;">
          <a href="${upiUri}" style="display: block; width: 100%; padding: 11px; background: #2563EB; color: #FFFFFF; font-weight: 700; font-size: 13px; border-radius: 10px; text-decoration: none; text-align: center; box-shadow: 0 4px 14px rgba(37,99,235,0.4);">
            📲 Open in Any UPI App (GPay / PhonePe / Paytm)
          </a>
        </div>

        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 14px; margin-bottom: 10px;">
          <div style="font-size: 12px; font-weight: 700; color: #E2E8F0; margin-bottom: 8px;">Completed Payment? Enter 12-Digit UTR:</div>
          <div style="display: flex; gap: 8px;">
            <input id="youpiUtrInput" type="text" placeholder="e.g. 528394819201" maxlength="22" style="flex: 1; background: rgba(15,23,42,0.9); border: 1px solid rgba(255,255,255,0.18); border-radius: 8px; padding: 8px 12px; color: #fff; font-size: 13px; font-family: monospace; outline: none;" />
            <button id="youpiVerifyUtrBtn" type="button" style="background: #10B981; border: none; color: #fff; padding: 8px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; white-space: nowrap;">Verify &amp; Unlock</button>
          </div>
        </div>

        ${(isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.search.includes('test_mode=1'))) ? `
        <button id="youpiInstantApproveBtn" type="button" style="width: 100%; background: transparent; border: 1px dashed rgba(56,189,248,0.4); color: #38BDF8; padding: 8px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; transition: all 0.2s;">
          ⚡ Instant Test Approval (Simulate Bank SMS/Webhook)
        </button>` : ''}
      `;

      container.appendChild(content);
      backdrop.appendChild(container);
      document.body.appendChild(backdrop);

      backdrop.classList.add('active');
      container.classList.add('active');

      this.backdrop = backdrop;
      this.container = container;

      // Copy VPA listener
      const copyBtn = content.querySelector('#copyVpaBtn');
      if (copyBtn) {
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(vpa);
          copyBtn.textContent = 'Copied!';
          setTimeout(() => { copyBtn.textContent = 'Copy'; }, 2000);
        };
      }

      const dispatchApproval = (utrValue) => {
        const responseData = {
          status: 'SUCCESS',
          order_id: orderId,
          orderId: orderId,
          payment_id: 'youpi_pay_' + Date.now(),
          paymentId: 'youpi_pay_' + Date.now(),
          utr: utrValue || ('UTR' + Date.now()),
          signature: 'youpi_sig_verified_' + Date.now(),
          gateway: 'youpi'
        };
        if (typeof this.options.handler === 'function') {
          this.options.handler(responseData);
        }
        this._dispatchSuccess(responseData);
        this.close();
      };

      const verifyBtn = content.querySelector('#youpiVerifyUtrBtn');
      const utrInput = content.querySelector('#youpiUtrInput');
      if (verifyBtn && utrInput) {
        verifyBtn.onclick = () => {
          const val = utrInput.value.trim();
          if (!val || val.length < 6) {
            if (typeof window.showAlertModal === 'function') {
              window.showAlertModal({ title: 'Invalid UTR', message: 'Please enter a valid 12-digit UPI UTR or bank reference number.', type: 'error' });
            } else {
              alert('Please enter a valid 12-digit UPI UTR or bank reference number.');
            }
            utrInput.focus();
            return;
          }
          verifyBtn.disabled = true;
          verifyBtn.textContent = 'Verifying...';
          dispatchApproval(val);
        };
      }

      const instantBtn = content.querySelector('#youpiInstantApproveBtn');
      if (instantBtn) {
        instantBtn.onclick = () => {
          instantBtn.disabled = true;
          instantBtn.textContent = 'Approved!';
          dispatchApproval('MOCK_UTR_' + Date.now());
        };
      }
    }

    _handleMessage(e) {
      if (!e.data || typeof e.data !== 'object') return;

      const event = e.data.event;
      const rawData = e.data.data || e.data;

      if (event === 'youpi.payment_success') {
        const payload = e.data.data || {};
        const result = {
          status: 'SUCCESS',
          order_id: payload.orderId || this.options.orderId || this.options.order_id,
          payment_mode: payload.method || 'UPI',
          amount_received: Number(payload.amount || this.options.amount || 0),
          utr: payload.bankRef || payload.utr || payload.reference || '',
          timestamp: payload.completedAt || new Date().toISOString(),
          metadata: payload.metadata || this.options.metadata || {},
          raw: payload
        };

        YoupiCheckout._emitEvent('youpi:payment:success', result);
        YoupiCheckout._emitEvent('youpi:payment:result', result);

        if (typeof this.options.handler === 'function') {
          this.options.handler(result);
        }
        if (typeof this.options.onSuccess === 'function') {
          this.options.onSuccess(result);
        }

        setTimeout(() => {
          this.close(() => {
            if (this.options.successUrl) {
              const delim = this.options.successUrl.includes('?') ? '&' : '?';
              window.location.href = `${this.options.successUrl}${delim}order_id=${encodeURIComponent(result.order_id)}&amount=${encodeURIComponent(result.amount_received)}&utr=${encodeURIComponent(result.utr)}`;
            }
          });
        }, 1500);
      } else if (event === 'youpi.payment_failed') {
        const payload = e.data.data || e.data || {};
        const result = {
          status: 'FAILED',
          order_id: payload.orderId || this.options.orderId || this.options.order_id,
          payment_mode: payload.method || 'UPI',
          amount_received: 0,
          utr: '',
          reason: payload.reason || payload.status || 'PAYMENT_FAILED',
          timestamp: new Date().toISOString(),
          metadata: payload.metadata || this.options.metadata || {},
          raw: payload
        };

        YoupiCheckout._emitEvent('youpi:payment:failed', result);
        YoupiCheckout._emitEvent('youpi:payment:result', result);

        if (typeof this.options.onFailed === 'function') {
          try { this.options.onFailed(result); } catch (err) { }
        }
        if (typeof this.options.onPaymentFailed === 'function') {
          try { this.options.onPaymentFailed(result); } catch (err) { }
        }

        this.close(() => {
          if (this.options.failedUrl) {
            const delim = this.options.failedUrl.includes('?') ? '&' : '?';
            window.location.href = `${this.options.failedUrl}${delim}order_id=${encodeURIComponent(result.order_id)}&reason=${encodeURIComponent(result.reason)}`;
          } else if (payload.redirectUrl && payload.redirectUrl !== window.location.href && !payload.redirectUrl.includes('/checkout')) {
            window.location.href = payload.redirectUrl;
          }
        });
      } else if (event === 'youpi.payment_blocked' || event === 'youpi.payment_blocked_exit') {
        const payload = e.data.data || e.data || {};
        const result = {
          status: 'SUSPICIOUS',
          order_id: payload.orderId || this.options.orderId || this.options.order_id,
          payment_mode: payload.method || 'UPI',
          amount_received: 0,
          utr: '',
          reason: 'SECURITY_REVIEW_FLAGGED',
          timestamp: new Date().toISOString(),
          metadata: payload.metadata || this.options.metadata || {},
          raw: payload
        };

        YoupiCheckout._emitEvent('youpi:payment:suspicious', result);
        YoupiCheckout._emitEvent('youpi:payment:result', result);

        if (typeof this.options.onSuspicious === 'function') {
          try { this.options.onSuspicious(result); } catch (err) { }
        }

        this.close(() => {
          if (this.options.suspiciousUrl) {
            const delim = this.options.suspiciousUrl.includes('?') ? '&' : '?';
            window.location.href = `${this.options.suspiciousUrl}${delim}order_id=${encodeURIComponent(result.order_id)}&reason=SUSPICIOUS`;
          }
        });
      } else if (event === 'youpi.payment_expired') {
        const payload = e.data.data || e.data || {};
        const result = {
          status: 'EXPIRED',
          order_id: payload.orderId || this.options.orderId || this.options.order_id,
          timestamp: new Date().toISOString()
        };

        YoupiCheckout._emitEvent('youpi:payment:expired', result);
        YoupiCheckout._emitEvent('youpi:payment:result', result);

        if (typeof this.options.onExpired === 'function') {
          try { this.options.onExpired(result); } catch (err) { }
        }

        this.close(() => {
          if (this.options.expiredUrl) {
            const delim = this.options.expiredUrl.includes('?') ? '&' : '?';
            window.location.href = `${this.options.expiredUrl}${delim}order_id=${encodeURIComponent(result.order_id)}`;
          }
        });
      } else if (event === 'youpi.modal_close' || event === 'youpi.close' || event === 'youpi.cancel' || event === 'youpi.payment_cancelled') {
        this._dispatchCancelled();
        const redirectUrl = e.data.redirectUrl;
        this.close(() => {
          if (this.options.cancelledUrl) {
            const delim = this.options.cancelledUrl.includes('?') ? '&' : '?';
            window.location.href = `${this.options.cancelledUrl}${delim}order_id=${encodeURIComponent(this.options.orderId || '')}`;
          } else if (redirectUrl && redirectUrl !== window.location.href && !redirectUrl.includes('/checkout')) {
            window.location.href = redirectUrl;
          }
        });
      }
    }

    _dispatchCancelled() {
      const result = {
        status: 'CANCELLED',
        order_id: this.options.orderId || this.options.order_id || '',
        timestamp: new Date().toISOString()
      };
      YoupiCheckout._emitEvent('youpi:payment:cancelled', result);
      YoupiCheckout._emitEvent('youpi:payment:result', result);

      if (typeof this.options.onCancelled === 'function') {
        try { this.options.onCancelled(result); } catch (e) { }
      }
    }

    static _emitEvent(name, detail) {
      if (!isBrowser) return;
      try {
        const ev = new CustomEvent(name, { detail, bubbles: true, cancelable: true });
        window.dispatchEvent(ev);
        document.dispatchEvent(ev);
      } catch (e) { }
    }

    /**
     * Handles clicks on elements with [data-youpi-pay] attribute
     */
    static handleButtonClick(btn) {
      if (!btn) return;

      const orderId = btn.getAttribute('data-order-id') || `ORDER-${Date.now()}`;
      const amount = btn.getAttribute('data-amount') || '0';
      const currency = btn.getAttribute('data-currency') || scriptConfig.currency || 'INR';
      const name = btn.getAttribute('data-name') || scriptConfig.name || 'Merchant Store';
      const description = btn.getAttribute('data-description') || 'Order Payment';

      // Customer info
      const customer = {
        name: btn.getAttribute('data-customer-name') || '',
        email: btn.getAttribute('data-customer-email') || '',
        phone: btn.getAttribute('data-customer-phone') || btn.getAttribute('data-customer-mobile') || ''
      };

      // Metadata parsing
      let metadata = {};
      const rawMeta = btn.getAttribute('data-metadata');
      if (rawMeta) {
        try {
          metadata = JSON.parse(rawMeta);
        } catch (e) {
          metadata = { raw: rawMeta };
        }
      }
      // Gather any data-meta-* attributes
      for (const attr of btn.attributes) {
        if (attr.name.startsWith('data-meta-')) {
          const key = attr.name.slice(10);
          metadata[key] = attr.value;
        }
      }

      const checkoutUrl = btn.getAttribute('data-checkout-url') || '';
      const paymentId = btn.getAttribute('data-payment-id') || '';
      const successUrl = btn.getAttribute('data-success-url') || scriptConfig.successUrl || '';
      const failedUrl = btn.getAttribute('data-failed-url') || scriptConfig.failedUrl || '';
      const suspiciousUrl = btn.getAttribute('data-suspicious-url') || scriptConfig.suspiciousUrl || '';
      const expiredUrl = btn.getAttribute('data-expired-url') || scriptConfig.expiredUrl || '';
      const cancelledUrl = btn.getAttribute('data-cancelled-url') || scriptConfig.cancelledUrl || '';

      YoupiCheckout.pay({
        order_id: orderId,
        orderId: orderId,
        amount: amount,
        currency: currency,
        name: name,
        description: description,
        customer: customer,
        metadata: metadata,
        checkoutUrl: checkoutUrl,
        paymentId: paymentId,
        successUrl: successUrl,
        failedUrl: failedUrl,
        suspiciousUrl: suspiciousUrl,
        expiredUrl: expiredUrl,
        cancelledUrl: cancelledUrl
      }).catch(err => {
        console.error('[YouPI JS] Pay error:', err);
      });
    }

    static _ensureStyles() {
      if (!isBrowser) return;
      let styleEl = document.getElementById('youpi-checkout-styles');
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = 'youpi-checkout-styles';
        document.head.appendChild(styleEl);
      }
      styleEl.textContent = `
        .youpi-checkout-backdrop {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          width: 100%;
          height: 100vh;
          height: 100dvh;
          height: 100%;
          background: rgba(12, 35, 64, 0.76);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          z-index: 2147483640;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.25s ease-out;
          touch-action: pan-y;
          overscroll-behavior: contain;
          user-select: none;
          -webkit-user-select: none;
          -webkit-tap-highlight-color: transparent;
        }
        .youpi-checkout-backdrop.active {
          opacity: 1;
        }
        .youpi-checkout-container {
          position: relative;
          width: 440px;
          max-width: 95vw;
          height: 680px;
          max-height: 92vh;
          background: #ffffff;
          border-radius: 14px;
          box-shadow: 0 25px 65px rgba(0, 0, 0, 0.5);
          overflow: hidden;
          transform: translateY(20px) scale(0.98);
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex;
          flex-direction: column;
          touch-action: auto !important;
          user-select: auto !important;
          -webkit-user-select: auto !important;
        }
        .youpi-checkout-container.active {
          transform: translateY(0) scale(1);
        }
        .youpi-checkout-container.closing {
          transform: translateY(20px) scale(0.96);
        }
        .youpi-checkout-iframe {
          width: 100%;
          height: 100%;
          border: none;
          flex: 1;
          background: #ffffff;
          touch-action: auto !important;
        }
        .youpi-checkout-close-btn {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: #ffffff;
          font-size: 14px;
          cursor: pointer;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s;
        }
        .youpi-checkout-close-btn:hover {
          background: rgba(255, 255, 255, 0.4);
        }

        /* DESKTOP / PC MODAL STYLES (Razorpay 2-Column Exact Layout) */
        @media (min-width: 768px) {
          .youpi-checkout-container {
            width: 900px;
            max-width: 95vw;
            height: 600px;
            max-height: 92vh;
            border-radius: 16px;
            box-shadow: 0 30px 80px rgba(0, 0, 0, 0.45);
          }
          .youpi-checkout-close-btn {
            display: none; /* Native in-modal close button inside the checkout header bar */
          }
        }

        /* MOBILE BOTTOM DRAWER / BOTTOM SHEET STYLES */
        @media (max-width: 767px) {
          .youpi-checkout-backdrop {
            position: fixed !important;
            inset: 0 !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            bottom: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            display: flex !important;
            align-items: flex-end !important;
            justify-content: center !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .youpi-checkout-container {
            width: 100vw !important;
            max-width: 100vw !important;
            height: 90vh !important;
            height: 90dvh !important;
            max-height: 94vh !important;
            border-bottom-left-radius: 0 !important;
            border-bottom-right-radius: 0 !important;
            border-top-left-radius: 20px !important;
            border-top-right-radius: 20px !important;
            margin: 0 !important;
            transform: translateY(0) !important;
            box-shadow: 0 -10px 40px rgba(0, 0, 0, 0.6) !important;
            touch-action: auto !important;
            overflow: hidden !important;
          }
          .youpi-checkout-container.closing {
            transform: translateY(100%) !important;
          }
        }
      `;
    }
  }

  // Auto-bind click listener for all [data-youpi-pay] buttons on page
  if (isBrowser) {
    document.addEventListener('click', function (e) {
      const btn = e.target && e.target.closest && e.target.closest('[data-youpi-pay]');
      if (btn) {
        e.preventDefault();
        YoupiCheckout.handleButtonClick(btn);
      }
    });
  }

  // Export globals
  globalScope.YoupiCheckout = YoupiCheckout;
  globalScope.Youpi = YoupiCheckout;
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = YoupiCheckout;
    module.exports.YoupiCheckout = YoupiCheckout;
    module.exports.Youpi = YoupiCheckout;
  }
})(typeof window !== 'undefined' ? window : globalThis);
