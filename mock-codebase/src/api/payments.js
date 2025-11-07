const express = require('express');
const router = express.Router();
const PaymentService = require('../services/paymentService');

const paymentService = new PaymentService();

// BUG 6: Unhandled promise rejection
router.post('/process', async (req, res, next) => {
  try {
    const { userId, amount, paymentMethod } = req.body;
    
    // BUG: Promise chain without proper error handling
    paymentService.validatePayment(userId, amount)
      .then(isValid => {
        if (!isValid) {
          throw new Error('Payment validation failed');
        }
        // This promise rejection is not caught
        return paymentService.processPayment(paymentMethod, amount);
      })
      .then(result => {
        res.json(result);
      });
    // Missing .catch() - unhandled promise rejection
    
  } catch (error) {
    next(error);
  }
});

// BUG 7: Server error - division by zero
router.get('/analytics/:merchantId', async (req, res, next) => {
  try {
    const { merchantId } = req.params;
    const transactions = await paymentService.getTransactions(merchantId);
    
    // BUG: No check if transactions array is empty
    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
    const averageAmount = totalAmount / transactions.length; // Division by zero if empty
    
    res.json({
      totalTransactions: transactions.length,
      totalAmount,
      averageAmount
    });
  } catch (error) {
    next(error);
  }
});

// BUG 8: Type coercion error
router.post('/refund', async (req, res, next) => {
  try {
    const { transactionId, amount } = req.body;
    
    // BUG: amount might be string, causes incorrect calculations
    const transaction = await paymentService.getTransaction(transactionId);
    
    // If amount is "50" (string) and transaction.amount is 100 (number)
    // This will perform string concatenation instead of subtraction
    const refundable = transaction.amount - amount;
    
    if (refundable < 0) {
      throw new Error('Refund amount exceeds transaction amount');
    }
    
    const refund = await paymentService.createRefund(transactionId, amount);
    res.json(refund);
  } catch (error) {
    next(error);
  }
});

// BUG 9: SQL Injection vulnerability (simulated)
router.get('/search', async (req, res, next) => {
  try {
    const { query } = req.query;
    
    // BUG: Direct string interpolation can lead to SQL injection
    const results = await paymentService.searchTransactions(query);
    
    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
