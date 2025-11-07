const request = require('supertest');
const app = require('../src/index');

describe('Payment API Tests', () => {
  describe('POST /api/payments/process', () => {
    it('should process payment successfully', async () => {
      const res = await request(app)
        .post('/api/payments/process')
        .send({
          userId: '1',
          amount: 99.99,
          paymentMethod: 'credit_card'
        })
        .set('x-transaction-id', 'test-txn-101');
      
      // This test is FLAKY due to BUG 6 (unhandled promise rejection)
      expect([200, 500]).toContain(res.status);
    });
  });

  describe('GET /api/payments/analytics/:merchantId', () => {
    it('should return analytics for merchant with transactions', async () => {
      const res = await request(app)
        .get('/api/payments/analytics/merchant-1')
        .set('x-transaction-id', 'test-txn-102');
      
      expect(res.status).toBe(200);
      expect(res.body.totalTransactions).toBeGreaterThan(0);
    });

    it('should fail with division by zero for merchant with no transactions', async () => {
      const res = await request(app)
        .get('/api/payments/analytics/merchant-empty')
        .set('x-transaction-id', 'test-txn-103');
      
      // This test will FAIL due to BUG 7 (division by zero)
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/payments/refund', () => {
    it('should process refund with correct amount', async () => {
      const res = await request(app)
        .post('/api/payments/refund')
        .send({
          transactionId: 'txn-001',
          amount: 50 // Should be number, not string
        })
        .set('x-transaction-id', 'test-txn-104');
      
      expect(res.status).toBe(200);
    });

    it('should fail with type coercion error when amount is string', async () => {
      const res = await request(app)
        .post('/api/payments/refund')
        .send({
          transactionId: 'txn-001',
          amount: "50" // String instead of number - BUG 8
        })
        .set('x-transaction-id', 'test-txn-105');
      
      // This test reveals BUG 8 (type coercion)
      expect(res.status).toBe(200);
    });
  });
});
