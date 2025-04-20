// Pure JavaScript serverless function for Vercel
const express = require('express');
const serverless = require('serverless-http');

// Create Express app
const app = express();

// Setup basic middleware
app.use(express.json());

// CORS headers middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight OPTIONS requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Define simple routes for testing
app.get('/api', (req, res) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'API is operational',
    timestamp: new Date().toISOString() 
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/graphql', (req, res) => {
  res.status(200).json({
    data: {
      message: "GraphQL endpoint is ready"
    }
  });
});

// Fallback route
app.all('*', (req, res) => {
  console.log(`[API] Received ${req.method} request to ${req.url}`);
  res.status(200).json({
    success: true,
    message: 'API route accessed',
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Create serverless handler
const handler = serverless(app);

// Export the handler for Vercel
module.exports = async (req, res) => {
  console.log(`[Vercel] API Request: ${req.method} ${req.url}`);
  
  try {
    // Process the request through the Express app
    return await handler(req, res);
  } catch (error) {
    console.error('[Vercel] Error in API handler:', error);
    
    // Check if response has not been sent yet
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: 'Internal Server Error',
        error: error.message || 'Unknown error'
      });
    }
  }
}; 