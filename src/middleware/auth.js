// Simple auth middleware for EcoTrack
// In production, you should verify Firebase tokens properly

export const authenticateUser = (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Extract token
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format'
      });
    }

    // For development: Just decode the token payload (base64)
    // In production: Use firebase-admin to verify the token
    try {
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      req.user = {
        uid: payload.user_id || payload.uid,
        email: payload.email
      };
      next();
    } catch (decodeError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({
      success: false,
      message: 'Authentication failed'
    });
  }
};

// Optional: Middleware to check if user is authenticated (but don't fail)
export const optionalAuth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
      req.user = {
        uid: payload.user_id || payload.uid,
        email: payload.email
      };
    }
  } catch (error) {
    // Silently fail, just continue without user
  }
  next();
};