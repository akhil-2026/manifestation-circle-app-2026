const { auth } = require('./auth');

/**
 * Super Admin Middleware - Verifies user is the hidden super admin
 * SECURITY: Never expose super admin email to frontend
 */
const superAdmin = async (req, res, next) => {
  try {
    // First check if user is authenticated
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Get super admin email from environment (server-side only)
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    
    if (!superAdminEmail) {
      console.error('SUPER_ADMIN_EMAIL not configured in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    // Check if authenticated user is the super admin
    if (req.user.email !== superAdminEmail) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Add super admin flag to request (never sent to frontend)
    req.isSuperAdmin = true;
    next();
  } catch (error) {
    console.error('Super admin middleware error:', error);
    res.status(401).json({ message: 'Authentication required' });
  }
};

/**
 * Check if user is super admin (utility function)
 * @param {string} userEmail - User's email address
 * @returns {boolean} - True if user is super admin
 */
const isSuperAdmin = (userEmail) => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  return superAdminEmail && userEmail === superAdminEmail;
};

/**
 * Filter out super admin from user lists
 * @param {Array} users - Array of user objects
 * @returns {Array} - Filtered array without super admin
 */
const filterSuperAdmin = (users) => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  if (!superAdminEmail) return users;
  
  return users.filter(user => user.email !== superAdminEmail);
};

/**
 * Enhanced admin middleware that allows super admin access
 */
const adminOrSuperAdmin = async (req, res, next) => {
  try {
    // First check authentication
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is super admin
    if (isSuperAdmin(req.user.email)) {
      req.isSuperAdmin = true;
      return next();
    }

    // Check if user is regular admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (error) {
    console.error('Admin/Super admin middleware error:', error);
    res.status(401).json({ message: 'Authentication required' });
  }
};

module.exports = {
  superAdmin,
  isSuperAdmin,
  filterSuperAdmin,
  adminOrSuperAdmin
};