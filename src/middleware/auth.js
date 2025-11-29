import User from '../models/User.js'; // ✅ Import your User model

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
      
      // ✅ Fetch user role from MongoDB using userId field
      const dbUser = await User.findOne({ userId: req.user.uid });
      if (dbUser) {
        req.user.role = dbUser.role || 'user'; // ✅ Attach role (default 'user')
        req.user._id = dbUser._id; // ✅ Attach MongoDB _id
      } else {
        req.user.role = 'user'; // ✅ Default to 'user' if not found in DB
      }
      
      console.log('✅ Authenticated user:', req.user.uid, req.user.email, 'Role:', req.user.role);
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
export const optionalAuth = async (req, res, next) => {
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

      // ✅ Fetch user role from MongoDB (optional auth)
      const dbUser = await User.findOne({ userId: req.user.uid });
      if (dbUser) {
        req.user.role = dbUser.role || 'user';
        req.user._id = dbUser._id;
      } else {
        req.user.role = 'user';
      }
    }
  } catch (error) {
    // Silently fail, just continue without user
  }
  next();
};

// ✅ NEW: Admin authorization middleware
export const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Admin access required. You do not have permission to perform this action.'
    });
  }

  console.log('✅ Admin access granted:', req.user.email);
  next();
};