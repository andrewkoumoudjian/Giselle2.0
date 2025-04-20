// Serverless function entry point for Vercel
// This file redirects requests to the compiled NestJS application

// Import the compiled handler
const { default: handler } = require('../dist/api/index');

// Export the handler for Vercel
module.exports = async (req, res) => {
  // Log the incoming request
  console.log(`[Vercel] Received ${req.method} request to ${req.url}`);
  
  try {
    // Forward the request to the NestJS handler
    return await handler(req, res);
  } catch (error) {
    // Handle any errors
    console.error('[Vercel] Error processing request:', error);
    
    // Send an error response if one hasn't been sent already
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'The server encountered an error while processing your request',
        path: req.url
      });
    }
  }
}; 