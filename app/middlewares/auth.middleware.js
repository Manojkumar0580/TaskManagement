const jwt = require('jsonwebtoken');

exports.authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; // Extract token after "Bearer"
    if (!token) return res.status(401).json({ message: 'Access denied, no token provided' });
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification error:', error);  // Log the error for debugging
      res.status(400).json({ message: 'Invalid token' });
    }
  };
  