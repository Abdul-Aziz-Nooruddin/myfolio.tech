const { YoupiService } = require('./youpi-service');

/**
 * RazorpayService (Legacy Adapter)
 * Delegates to the sovereign YouPI Payment Gateway (YoupiService)
 * providing 0% fees, instant UPI settlement, and full backward compatibility.
 */
class RazorpayService extends YoupiService {
  constructor(keyId, keySecret, webhookSecret) {
    super(keyId, keySecret, webhookSecret);
  }
}

module.exports = {
  RazorpayService,
  YoupiService
};