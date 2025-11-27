// Auth middleware for EcoTrack
// Extracts Firebase token and attaches user info to request

export const authenticateUser = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Please login.'
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

    // Decode Firebase token (basic JWT decode)
    try {
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      // Extract user info from token
      req.user = {
        uid: payload.user_id || payload.uid || payload.sub,
        email: payload.email,
        name: payload.name || payload.displayName,
        displayName: payload.name || payload.displayName
      };
      
      // Validate required fields
      if (!req.user.uid) {
        console.error('Token payload:', payload);
        return res.status(401).json({
          success: false,
          message: 'Invalid token: user ID not found'
        });
      }
      
      console.log('✅ Authenticated user:', req.user.uid, req.user.email);
      next();
      
    } catch (decodeError) {
      console.error('Token decode error:', decodeError);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
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
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      req.user = {
        uid: payload.user_id || payload.uid || payload.sub,
        email: payload.email,
        name: payload.name || payload.displayName,
        displayName: payload.name || payload.displayName
      };
    }
  } catch (error) {
    // Silently fail, just continue without user
  }
  next();
};