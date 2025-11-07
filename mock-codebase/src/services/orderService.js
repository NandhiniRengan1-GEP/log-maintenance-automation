class OrderService {
  constructor() {
    this.orders = new Map();
    this.inventory = new Map([
      ['item-1', 100],
      ['item-2', 50]
    ]);
  }

  async getOrderById(id) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const order = this.orders.get(id);
    if (!order) {
      throw new Error(`Order ${id} not found`);
    }
    
    return order;
  }

  async getOrdersByUserId(userId) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Returns all orders without limit (BUG 11)
    // In real scenario with thousands of orders, this causes memory issues
    const orders = Array.from(this.orders.values())
      .filter(order => order.userId === userId);
    
    // Simulate large dataset
    if (userId === 'stress-test') {
      return Array(10000).fill(null).map((_, i) => ({
        id: `order-${i}`,
        userId,
        total: Math.random() * 1000
      }));
    }
    
    return orders;
  }

  async createOrder(orderData) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const id = `order-${Date.now()}`;
    const order = {
      id,
      ...orderData,
      status: 'pending',
      createdAt: new Date()
    };
    
    this.orders.set(id, order);
    return order;
  }

  async updateInventory(items) {
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Simulates random failure (BUG 12)
    if (Math.random() < 0.2) {
      throw new Error('Inventory service unavailable');
    }
    
    for (const item of items) {
      const current = this.inventory.get(item.id) || 0;
      this.inventory.set(item.id, current - item.quantity);
    }
  }

  async processOrderPayment(orderId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simulates random payment failure (BUG 12)
    if (Math.random() < 0.15) {
      throw new Error('Payment processing failed');
    }
    
    return { status: 'paid', orderId };
  }
}

module.exports = OrderService;
