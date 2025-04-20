function getTransferType(sender, recipient) {
    if (sender.bank === recipient.bank && sender.city === recipient.city) return 0; // Type I
    if (sender.bank === recipient.bank && sender.city !== recipient.city) return 1; // Type II
    if (sender.bank !== recipient.bank && sender.city === recipient.city) return 2; // Type III
    return 3; // Type IV
  }
  
  function calculateFee(type, amount) {
    const fees = {
      0: { rate: 0, min: 0, max: 0 },
      1: { rate: 0.005, min: 1, max: 50 },
      2: { rate: 0.005, min: 1, max: 50 },
      3: { rate: 0.01, min: 1, max: 50 },
    };
  
    const { rate, min, max } = fees[type];
    return Math.min(Math.max(amount * rate, min), max);
  }
  
  module.exports = { getTransferType, calculateFee };
  