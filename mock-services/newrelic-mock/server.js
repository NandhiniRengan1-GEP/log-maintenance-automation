const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = 3002;

app.use(cors());
app.use(express.json());

// In-memory error storage (simulating New Relic database)
let errorLogs = [];

// Seed with some pre-existing errors
function seedErrors() {
  errorLogs = [
    {
      id: uuidv4(),
      transactionId: 'txn-seed-001',
      scopeId: 'user-service-prod',
      error: {
        message: "TypeError: Cannot read property 'id' of undefined",
        stack: "TypeError: Cannot read property 'id' of undefined\n    at /app/src/api/users.js:11:51",
        type: 'TypeError'
      },
      containerName: 'user-service-pod-7f8b9c',
      roleInstance: 'aks-nodepool1-12345',
      occurrenceCount: 47,
      firstOccurrence: new Date(Date.now() - 86400000).toISOString(),
      lastOccurrence: new Date().toISOString(),
      metadata: {
        environment: 'production',
        region: 'eastus',
        service: 'user-service',
        version: '1.2.3'
      }
    },
    {
      id: uuidv4(),
      transactionId: 'txn-seed-002',
      scopeId: 'payment-service-prod',
      error: {
        message: "UnhandledPromiseRejectionWarning: Error: Payment gateway timeout",
        stack: "Error: Payment gateway timeout\n    at PaymentService.processPayment (/app/src/services/paymentService.js:28:13)",
        type: 'UnhandledPromiseRejection'
      },
      containerName: 'payment-service-pod-a3c4d5',
      roleInstance: 'aks-nodepool1-67890',
      occurrenceCount: 23,
      firstOccurrence: new Date(Date.now() - 43200000).toISOString(),
      lastOccurrence: new Date().toISOString(),
      metadata: {
        environment: 'production',
        region: 'westus',
        service: 'payment-service',
        version: '2.1.0'
      }
    },
    {
      id: uuidv4(),
      transactionId: 'txn-seed-003',
      scopeId: 'analytics-service-prod',
      error: {
        message: "Error: Database connection lost",
        stack: "Error: Database connection lost\n    at UserService.deleteUser (/app/src/services/userService.js:65:13)",
        type: 'DatabaseError'
      },
      containerName: 'analytics-service-pod-e2f1g3',
      roleInstance: 'aks-nodepool1-11223',
      occurrenceCount: 12,
      firstOccurrence: new Date(Date.now() - 21600000).toISOString(),
      lastOccurrence: new Date().toISOString(),
      metadata: {
        environment: 'production',
        region: 'centralus',
        service: 'analytics-service',
        version: '1.0.5'
      }
    }
  ];
}

seedErrors();

// MCP Server endpoints for New Relic

// Query errors by transaction ID or scope ID
app.post('/api/nrql/query', async (req, res) => {
  try {
    const { query, timeRange } = req.body;
    
    console.log(`[New Relic MCP] Query received: ${query}`);
    
    // Parse NRQL-like query (simplified)
    let results = [...errorLogs];
    
    // Filter by time range
    if (timeRange) {
      const now = Date.now();
      const rangeMs = parseTimeRange(timeRange);
      results = results.filter(log => {
        const logTime = new Date(log.lastOccurrence).getTime();
        return (now - logTime) <= rangeMs;
      });
    }
    
    res.json({
      results: results,
      metadata: {
        count: results.length,
        timeRange: timeRange || 'all'
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get error details by transaction ID
app.get('/api/errors/transaction/:transactionId', (req, res) => {
  const { transactionId } = req.params;
  const error = errorLogs.find(log => log.transactionId === transactionId);
  
  if (!error) {
    return res.status(404).json({ error: 'Transaction not found' });
  }
  
  res.json(error);
});

// Get errors by scope/service
app.get('/api/errors/scope/:scopeId', (req, res) => {
  const { scopeId } = req.params;
  const timeRange = req.query.timeRange || '24h';
  
  const now = Date.now();
  const rangeMs = parseTimeRange(timeRange);
  
  const errors = errorLogs.filter(log => {
    const matchesScope = log.scopeId === scopeId;
    const withinTimeRange = (now - new Date(log.lastOccurrence).getTime()) <= rangeMs;
    return matchesScope && withinTimeRange;
  });
  
  res.json({
    scopeId,
    timeRange,
    errors,
    summary: {
      totalErrors: errors.length,
      totalOccurrences: errors.reduce((sum, e) => sum + e.occurrenceCount, 0)
    }
  });
});

// Log new error (called by instrumented app)
app.post('/api/errors', (req, res) => {
  const errorLog = {
    id: uuidv4(),
    ...req.body,
    firstOccurrence: new Date().toISOString(),
    lastOccurrence: new Date().toISOString(),
    occurrenceCount: 1
  };
  
  // Check if similar error exists
  const existing = errorLogs.find(log => 
    log.error.message === errorLog.error.message &&
    log.scopeId === errorLog.scopeId
  );
  
  if (existing) {
    existing.occurrenceCount++;
    existing.lastOccurrence = new Date().toISOString();
    console.log(`[New Relic] Updated existing error: ${existing.id} (count: ${existing.occurrenceCount})`);
  } else {
    errorLogs.push(errorLog);
    console.log(`[New Relic] New error logged: ${errorLog.id}`);
  }
  
  res.status(201).json(existing || errorLog);
});

// Get all errors (for debugging)
app.get('/api/errors', (req, res) => {
  res.json({
    total: errorLogs.length,
    errors: errorLogs
  });
});

// Clear all errors (for testing)
app.delete('/api/errors', (req, res) => {
  errorLogs = [];
  seedErrors();
  res.json({ message: 'Errors cleared and reseeded' });
});

// Helper function
function parseTimeRange(range) {
  const matches = range.match(/(\d+)([smhd])/);
  if (!matches) return 86400000; // default 24 hours
  
  const value = parseInt(matches[1]);
  const unit = matches[2];
  
  const multipliers = {
    's': 1000,
    'm': 60000,
    'h': 3600000,
    'd': 86400000
  };
  
  return value * (multipliers[unit] || 3600000);
}

app.listen(PORT, () => {
  console.log(`New Relic Mock Service running on port ${PORT}`);
  console.log(`Total errors in database: ${errorLogs.length}`);
});

module.exports = app;
