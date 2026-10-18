/**
 * MyFolio Payment Gateway Maintenance Engine (Deactivated - YouPI Sovereign UPI Live)
 */
(function() {
  function showPaymentMaintenanceModal() {
    // Sovereign UPI Live - Maintenance deactivated
    return false;
  }

  function closePaymentMaintenanceModal() {
    const modal = document.getElementById('mfPaymentMaintenanceModal');
    if (modal) modal.style.display = 'none';
  }

  window.showPaymentMaintenanceModal = showPaymentMaintenanceModal;
  window.closePaymentMaintenanceModal = closePaymentMaintenanceModal;
})();
