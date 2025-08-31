import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
  try {
    // Check multiple possible token locations
    let token = req.header('x-auth-token') || 
                req.header('Authorization')?.replace('Bearer ', '') ||
                req.cookies?.token;

    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: 'No authentication token provided. Access denied.' 
      });
    }

    // Remove 'Bearer ' if present
    if (token.startsWith('Bearer ')) {
      token = token.slice(7);
    }

    // Verify token
    const verified = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret');
    
    if (!verified || !verified.id) {
      return res.status(401).json({ 
        success: false,
        message: 'Invalid token. Access denied.' 
      });
    }

    req.user = verified.id;
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    
    // Handle specific JWT errors
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired. Please login again.'
      });
    } else if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token. Access denied.'
      });
    }

    res.status(500).json({ 
      success: false,
      message: 'Authentication error' 
    });
  }
};

export default auth;
