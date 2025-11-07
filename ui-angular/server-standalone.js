const express = require('express');
const path = require('path');
const app = express();
const PORT = 4200;

// Serve static files
app.use(express.static(__dirname));

// Serve the standalone HTML
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index-standalone.html'));
});

app.listen(PORT, () => {
    console.log('');
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║           LOG MAINTENANCE AUTOMATION - UI RUNNING             ║');
    console.log('╚════════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`  🌐 UI Available at: http://localhost:${PORT}`);
    console.log('');
    console.log('  Backend Services:');
    console.log('    • New Relic Mock:   http://localhost:3002');
    console.log('    • LLM1 Diagnostics: http://localhost:5001');
    console.log('    • LLM2 Solution:    http://localhost:5002');
    console.log('    • GitHub Service:   http://localhost:3005');
    console.log('');
    console.log('  📊 Open your browser and navigate to:');
    console.log(`     http://localhost:${PORT}`);
    console.log('');
    console.log('  Press Ctrl+C to stop the server');
    console.log('');
});
