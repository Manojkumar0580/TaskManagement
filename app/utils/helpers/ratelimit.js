const rateLimit = require('express-rate-limit');
// Rate Limiter for Login Endpoint
const loginRateLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Maximum 5 requests per window
    message: {
      status: false,
      statusCode: 429,
      message: 'Too many login attempts. Please try again later.',
    },
  });

  module.exports = loginRateLimiter;