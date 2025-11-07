// Validation utilities

async function validateUser(userData) {
  // This returns a promise (BUG 2 - often not awaited)
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!userData.email || !userData.name) {
        reject(new Error('Email and name are required'));
      }
      
      if (!userData.email.includes('@')) {
        reject(new Error('Invalid email format'));
      }
      
      resolve(true);
    }, 50);
  });
}

function validatePayment(paymentData) {
  if (!paymentData.amount || paymentData.amount <= 0) {
    throw new Error('Invalid payment amount');
  }
  
  if (!paymentData.paymentMethod) {
    throw new Error('Payment method is required');
  }
  
  return true;
}

module.exports = {
  validateUser,
  validatePayment
};
