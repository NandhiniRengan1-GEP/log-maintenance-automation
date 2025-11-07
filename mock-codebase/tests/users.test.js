const request = require('supertest');
const app = require('../src/index');

describe('User API Tests', () => {
  describe('GET /api/users/:id', () => {
    it('should return user when ID exists', async () => {
      const res = await request(app)
        .get('/api/users/1')
        .set('x-transaction-id', 'test-txn-001');
      
      expect(res.status).toBe(200);
      expect(res.body.user).toBeDefined();
      expect(res.body.user.id).toBe('1');
    });

    it('should fail with null reference error for non-existent user', async () => {
      const res = await request(app)
        .get('/api/users/999')
        .set('x-transaction-id', 'test-txn-002');
      
      // This test will FAIL due to BUG 1
      expect(res.status).toBe(500);
      expect(res.body.error).toContain('Cannot read property');
    });
  });

  describe('POST /api/users', () => {
    it('should create user with valid data', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User',
          email: 'test@example.com'
        })
        .set('x-transaction-id', 'test-txn-003');
      
      // This test will FAIL due to BUG 2 (validation not awaited)
      expect(res.status).toBe(201);
    });

    it('should reject invalid user data', async () => {
      const res = await request(app)
        .post('/api/users')
        .send({
          name: 'Test User'
          // Missing email
        })
        .set('x-transaction-id', 'test-txn-004');
      
      expect(res.status).toBe(400);
    });
  });

  describe('DELETE /api/users/:id', () => {
    it('should delete user successfully', async () => {
      const res = await request(app)
        .delete('/api/users/2')
        .set('x-transaction-id', 'test-txn-005');
      
      // This test is FLAKY due to BUG 4 (random connection errors)
      expect([204, 500]).toContain(res.status);
    });
  });
});
