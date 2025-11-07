require('dotenv').config();
const newrelic = require('newrelic');
const express = require('express');
const userRoutes = require('./api/users');
const paymentRoutes = require('./api/payments');
const orderRoutes = require('./api/orders');
const analyticsRoutes = require('./api/analytics');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  const transactionId = req.headers['x-transaction-id'] || `txn-${Date.now()}`;
  req.transactionId = transactionId;
  newrelic.addCustomAttribute('transactionId', transactionId);
  newrelic.addCustomAttribute('scopeId', req.headers['x-scope-id'] || 'default-scope');
  console.log(`[${transactionId}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/analytics', analyticsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  newrelic.noticeError(err, {
    transactionId: req.transactionId,
    path: req.path,
    method: req.method
  });
  
  res.status(err.status || 500).json({
    error: err.message,
    transactionId: req.transactionId
  });
});

app.listen(PORT, () => {
  console.log(`Mock service running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
