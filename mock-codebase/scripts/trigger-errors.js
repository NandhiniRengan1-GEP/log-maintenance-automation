const axios = require('axios');

const BASE_URL = 'http://localhost:3001';

async function triggerErrors() {
  console.log('Starting error trigger sequence...\n');

  const errors = [];

  // BUG 1: Null reference error
  try {
    console.log('1. Triggering null reference error...');
    await axios.get(`${BASE_URL}/api/users/999`, {
      headers: { 'x-transaction-id': 'trigger-001', 'x-scope-id': 'error-detection' }
    });
  } catch (error) {
    errors.push({ bug: 1, error: error.response?.data || error.message });
    console.log('   ✓ Error logged to New Relic');
  }

  // BUG 2: Unhandled validation promise
  try {
    console.log('2. Triggering unhandled promise rejection...');
    await axios.post(`${BASE_URL}/api/users`, {
      name: 'Test User'
      // Missing email - will cause validation to reject
    }, {
      headers: { 'x-transaction-id': 'trigger-002', 'x-scope-id': 'error-detection' }
    });
  } catch (error) {
    errors.push({ bug: 2, error: error.response?.data || error.message });
    console.log('   ✓ Error logged to New Relic');
  }

  // BUG 7: Division by zero
  try {
    console.log('3. Triggering division by zero error...');
    await axios.get(`${BASE_URL}/api/payments/analytics/merchant-empty`, {
      headers: { 'x-transaction-id': 'trigger-003', 'x-scope-id': 'error-detection' }
    });
  } catch (error) {
    errors.push({ bug: 7, error: error.response?.data || error.message });
    console.log('   ✓ Error logged to New Relic');
  }

  // BUG 10: Access control error
  try {
    console.log('4. Triggering access control error...');
    // First create order
    const createRes = await axios.post(`${BASE_URL}/api/orders`, {
      userId: '1',
      items: [{ id: 'item-1', quantity: 1 }]
    }, {
      headers: { 'x-transaction-id': 'trigger-004a', 'x-scope-id': 'error-detection' }
    });
    
    // Try to access with wrong user
    await axios.get(`${BASE_URL}/api/orders/${createRes.data.id}`, {
      headers: { 
        'x-transaction-id': 'trigger-004b', 
        'x-scope-id': 'error-detection',
        'x-user-id': '999'
      }
    });
  } catch (error) {
    errors.push({ bug: 10, error: error.response?.data || error.message });
    console.log('   ✓ Error logged to New Relic');
  }

  // BUG 13: Database connection leak
  try {
    console.log('5. Triggering database connection leak...');
    for (let i = 0; i < 5; i++) {
      await axios.get(`${BASE_URL}/api/analytics/dashboard`, {
        headers: { 'x-transaction-id': `trigger-005-${i}`, 'x-scope-id': 'error-detection' }
      });
    }
    console.log('   ✓ Multiple unclosed connections created');
  } catch (error) {
    errors.push({ bug: 13, error: error.response?.data || error.message });
  }

  console.log('\n========================================');
  console.log(`Total errors triggered: ${errors.length}`);
  console.log('========================================\n');
  
  console.log('Error summary:');
  errors.forEach((e, i) => {
    console.log(`${i + 1}. BUG ${e.bug}: ${JSON.stringify(e.error, null, 2)}`);
  });

  console.log('\nAll errors have been logged to New Relic mock service.');
  console.log('Check mock-services/newrelic-mock/logs.json for details.\n');
}

// Check if server is running
async function checkServer() {
  try {
    await axios.get(`${BASE_URL}/health`);
    return true;
  } catch {
    return false;
  }
}

(async () => {
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.error('Error: Server is not running!');
    console.error('Please start the server first: npm start');
    process.exit(1);
  }

  await triggerErrors();
})();
