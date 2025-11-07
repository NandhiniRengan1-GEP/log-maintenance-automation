const request = require('supertest');
const app = require('../src/index');

describe('Order API Tests', () => {
  describe('GET /api/orders/:id', () => {
    it('should fail with access error when user does not own order', async () => {
      // First create an order
      const createRes = await request(app)
        .post('/api/orders')
        .send({
          userId: '1',
          items: [{ id: 'item-1', quantity: 2 }]
        })
        .set('x-transaction-id', 'test-txn-201');
      
      const orderId = createRes.body.id;
      
      // Try to access with different user - BUG 10
      const res = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('x-user-id', '2') // Different user
        .set('x-transaction-id', 'test-txn-202');
      
      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Access denied');
    });
  });

  describe('GET /api/orders/user/:userId', () => {
    it('should cause memory issues with large datasets', async () => {
      const res = await request(app)
        .get('/api/orders/user/stress-test')
        .set('x-transaction-id', 'test-txn-203');
      
      // This test reveals BUG 11 (no pagination, memory exhaustion)
      expect(res.status).toBe(200);
      expect(res.body.length).toBeGreaterThan(1000);
    });
  });

  describe('POST /api/orders', () => {
    it('should create order but may leave inconsistent state on failure', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          userId: '1',
          items: [{ id: 'item-1', quantity: 1 }]
        })
        .set('x-transaction-id', 'test-txn-204');
      
      // This test is FLAKY due to BUG 12 (no transaction, inconsistent state)
      // Order may be created even if payment fails
      expect([201, 500]).toContain(res.status);
    });
  });
});
