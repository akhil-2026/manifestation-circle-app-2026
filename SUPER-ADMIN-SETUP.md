# Super Admin System Documentation

## Overview
The Manifestation Circle application includes a **hidden Super Admin system** that provides full system control while remaining completely invisible to regular users and admins.

## Security Features

### 🔒 **Hidden by Design**
- Super Admin never appears in user lists, member lists, or admin panels
- No Super Admin role exposed to frontend
- All permission checks happen server-side only
- Zero visibility to other users

### 🛡️ **Environment-Based Authentication**
- Super Admin email stored securely in `SUPER_ADMIN_EMAIL` environment variable
- No hard-coded emails in source code
- Server-side only verification
- Fails safely if environment variable is missing

## Setup Instructions

### 1. Environment Configuration

#### Local Development (.env)
```bash
# Add to server/.env
SUPER_ADMIN_EMAIL=your_email@example.com
```

#### Production (Vercel/Render)
Add environment variable in your hosting platform:
```
SUPER_ADMIN_EMAIL=your_email@example.com
```

### 2. Access Methods

#### Hidden Route Access
- Navigate to: `/super-admin`
- Or use keyboard shortcut: Type `superadmin` anywhere in the app

#### Backend API Access
- All Super Admin APIs are at `/api/super-admin/*`
- Requires authentication + Super Admin email verification

## Super Admin Capabilities

### 👥 **User Management**
- ✅ View all users (except super admin)
- ✅ Create new users with any role
- ✅ Edit user details (name, email, role)
- ✅ Block/unblock users
- ✅ Promote/demote admins
- ✅ Delete users and all their data

### 📊 **System Control**
- ✅ Override calendar markings
- ✅ Modify user streaks
- ✅ Edit manifestation data
- ✅ Full affirmation control
- ✅ System health monitoring

### 🚫 **Restrictions**
- ❌ Cannot modify own Super Admin status
- ❌ Cannot delete self
- ❌ Super Admin email cannot be changed via UI

## API Endpoints

### Dashboard
```
GET /api/super-admin/dashboard
```

### User Management
```
GET    /api/super-admin/users
POST   /api/super-admin/users
PUT    /api/super-admin/users/:userId
DELETE /api/super-admin/users/:userId
PATCH  /api/super-admin/users/:userId/status
PATCH  /api/super-admin/users/:userId/role
```

### Data Override
```
PATCH /api/super-admin/users/:userId/calendar
GET   /api/super-admin/users/:userId/manifestations
PATCH /api/super-admin/manifestations/:manifestationId
```

### System Health
```
GET /api/super-admin/system/health
```

## Security Implementation

### Middleware Protection
```javascript
// All routes protected by superAdmin middleware
const { superAdmin } = require('../middleware/superAdmin');
router.get('/dashboard', superAdmin, handler);
```

### Email Verification
```javascript
// Server-side only check
const isSuperAdmin = (userEmail) => {
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  return superAdminEmail && userEmail === superAdminEmail;
};
```

### Frontend Masking
```javascript
// Super Admin appears as regular admin to frontend
if (isSuperAdmin(req.user.email)) {
  userResponse.role = 'admin'; // Hide true super admin status
}
```

## Role Hierarchy

```
Super Admin (Hidden)
├── Full system control
├── Invisible to all users
├── Can manage admins
└── Environment-based access

Admin (Visible)
├── Limited control
├── Cannot see Super Admin
├── Cannot manage Super Admin
└── Visible to other users

User/Member
├── Basic access
├── Cannot see admin functions
└── Standard user experience
```

## Deployment Checklist

### ✅ **Before Deployment**
- [ ] Set `SUPER_ADMIN_EMAIL` in production environment
- [ ] Verify Super Admin email is registered in the system
- [ ] Test Super Admin access in staging
- [ ] Confirm Super Admin is hidden from all lists

### ✅ **After Deployment**
- [ ] Test `/super-admin` route access
- [ ] Verify keyboard shortcut works
- [ ] Confirm API endpoints require proper authentication
- [ ] Test user management functions
- [ ] Verify Super Admin remains hidden

## Troubleshooting

### Access Denied
1. Check `SUPER_ADMIN_EMAIL` environment variable is set
2. Verify email matches exactly (case-sensitive)
3. Ensure user is logged in with Super Admin email
4. Check server logs for authentication errors

### Super Admin Visible
1. Check `filterSuperAdmin()` is used in all user lists
2. Verify frontend never receives Super Admin role
3. Ensure group routes filter Super Admin
4. Check admin panels exclude Super Admin

### Environment Issues
1. Restart server after adding environment variable
2. Verify environment variable syntax
3. Check for typos in email address
4. Ensure no trailing spaces in environment value

## Security Best Practices

### ✅ **Do**
- Keep Super Admin email in environment variables only
- Use server-side verification for all permissions
- Filter Super Admin from all public APIs
- Log Super Admin actions for audit trail

### ❌ **Don't**
- Hard-code Super Admin email in source code
- Expose Super Admin status to frontend
- Include Super Admin in user counts or lists
- Allow Super Admin role assignment via UI

## Emergency Access

If you lose access to Super Admin:

1. **Check Environment Variables**
   ```bash
   # Verify in production environment
   echo $SUPER_ADMIN_EMAIL
   ```

2. **Database Direct Access**
   ```javascript
   // Emergency: Manually verify in database
   db.users.findOne({ email: "your_email@example.com" })
   ```

3. **Server Logs**
   ```bash
   # Check authentication logs
   grep "Super admin" server.log
   ```

## Monitoring

### Health Check
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-app.com/api/super-admin/system/health
```

### User Count Verification
```bash
# Should exclude Super Admin from count
curl -H "Authorization: Bearer YOUR_TOKEN" \
     https://your-app.com/api/group/details
```

---

**⚠️ SECURITY WARNING**: Never commit actual Super Admin emails to version control. Always use environment variables for production deployments.