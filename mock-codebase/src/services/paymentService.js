class PaymentService {
  constructor() {
    this.transactions = new Map();
    this.initializeMockData();
  }

  initializeMockData() {
    this.transactions.set('txn-001', {
      id: 'txn-001',
      userId: '1',
      merchantId: 'merchant-1',
      amount: 100.50,
      status: 'completed',
      createdAt: new Date()
    });
  }

  async validatePayment(userId, amount) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Returns false randomly to trigger error (BUG 6)
    return Math.random() > 0.2;
  }

  async processPayment(paymentMethod, amount) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulates random payment failures (triggers BUG 6)
    if (Math.random() < 0.15) {
      throw new Error('Payment gateway timeout');
    }
    
    const transactionId = `txn-${Date.now()}`;
    const transaction = {
      id: transactionId,
      paymentMethod,
      amount,
      status: 'completed',
      createdAt: new Date()
    };
    
    this.transactions.set(transactionId, transaction);
    return transaction;
  }

  async getTransactions(merchantId) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Sometimes returns empty array (triggers BUG 7)
    if (merchantId === 'merchant-empty') {
      return [];
    }
    
    return Array.from(this.transactions.values())
      .filter(t => t.merchantId === merchantId);
  }

  async getTransaction(id) {
    await new Promise(resolve => setTimeout(resolve, 30));
    
    const transaction = this.transactions.get(id);
    if (!transaction) {
      throw new Error(`Transaction ${id} not found`);
    }
    
    return transaction;
  }

  async createRefund(transactionId, amount) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    return {
      id: `refund-${Date.now()}`,
      transactionId,
      amount,
      status: 'processed',
      createdAt: new Date()
    };
  }

  async searchTransactions(query) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Simulates SQL injection vulnerability (BUG 9)
    // In real scenario, this would be: `SELECT * FROM transactions WHERE ${query}`
    console.warn(`[SECURITY] Unsafe query executed: ${query}`);
    
    return Array.from(this.transactions.values());
  }
}

module.exports = PaymentService;
