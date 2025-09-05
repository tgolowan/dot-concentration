const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the current directory
app.use(express.static(__dirname));

// Route for the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Health check endpoint for Railway
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Focus Dot App is running' });
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Focus Dot App is running on port ${PORT}`);
    console.log(`Visit: http://localhost:${PORT}`);
});
