const { auth } = require('./auth');

/**
 * CLEAN SUPER ADMIN MIDDLEWARE
 * - Environment-based identification only
 * - Silent failures (404 instead of 403)
 * - No database storage or role flags
 * - Server-side verification only
 */

/**
 * Super Admin middleware - protects routes with silent failures
 */
const superAdmin = async (req, res, next) => {
  try {
    // First authenticate the user
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Check if user is super admin via environment variable
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    
    if (!superAdminEmail || req.user.email !== superAdminEmail) {
      // Silent failure - return 404 instead of 403
      return res.status(404).json({ message: 'Not found' });
    }

    next();
  } catch (error) {
    // Silent failure for any authentication errors
    res.status(404).json({ message: 'Not found' });
  }
};

/**
 * Utility function to check if email is super admin
 */
const isSuperAdmin = (email) => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  return superAdminEmail && email === superAdminEmail;
};

/**
 * Filter super admin from user arrays (for invisibility)
 */
const filterSuperAdmin = (users) => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  if (!superAdminEmail) return users;
  
  return users.filter(user => user.email !== superAdminEmail);
};

module.exports = {
  superAdmin,
  isSuperAdmin,
  filterSuperAdmin
};