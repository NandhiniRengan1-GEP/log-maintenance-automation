const express = require('express');
const router = express.Router();
const OrderService = require('../services/orderService');

const orderService = new OrderService();

// BUG 10: Access/Permission error
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.headers['x-user-id'];
    
    // BUG: No authentication check before accessing order
    const order = await orderService.getOrderById(id);
    
    // Permission check happens AFTER fetching sensitive data
    if (order.userId !== userId) {
      throw new Error('Access denied: Order does not belong to user');
    }
    
    res.json(order);
  } catch (error) {
    next(error);
  }
});

// BUG 11: Resource exhaustion - no pagination
router.get('/user/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    // BUG: Fetches ALL orders without limit, can exhaust memory
    const orders = await orderService.getOrdersByUserId(userId);
    
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// BUG 12: Inconsistent state due to missing transaction
router.post('/', async (req, res, next) => {
  try {
    const { userId, items } = req.body;
    
    // BUG: Multiple database operations without transaction wrapper
    const order = await orderService.createOrder({ userId, items });
    
    // If this fails, order is created but inventory not updated
    await orderService.updateInventory(items);
    
    // If this fails, payment is not processed but order exists
    await orderService.processOrderPayment(order.id);
    
    res.status(201).json(order);
  } catch (error) {
    // Partial state remains even if error occurs
    next(error);
  }
});

module.exports = router;
