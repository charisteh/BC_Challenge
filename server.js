const express = require('express');
const path = require('path');
const request = require('request');
const app = express();
const PORT = 8080;

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Proxy endpoint
app.use('/proxy', (req, res) => {
    const targetUrl = req.query.url;
    req.pipe(request(targetUrl)).pipe(res);
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
