# Vercel Environment Variables Setup

## Required Environment Variables for Main Deployment

To ensure the Super Admin system works on the main Vercel deployment (`https://manifestation-circle-app-2026.vercel.app/`), you need to set these environment variables in the Vercel dashboard:

### 1. Go to Vercel Dashboard
- Visit: https://vercel.com/dashboard
- Select your project: `manifestation-circle-app-2026`
- Go to Settings → Environment Variables

### 2. Add These Variables

#### Firebase Configuration
```
VITE_FIREBASE_API_KEY=AIzaSyDvzqhr6nSdpNTsUFK_ta6lp_vBekP142Q
VITE_FIREBASE_PROJECT_ID=manifestation-circle-2026
VITE_FIREBASE_MESSAGING_SENDER_ID=277267386730
VITE_FIREBASE_VAPID_KEY=BGkFDxutIw2jkukMsL6sIUdepGbnhJIqw1K7lNqCTiDA_7F3XwKM8s9o5ks6_8hQW6SW6hpn4wu2BxBD1WZhZOE
```

#### API Configuration
```
VITE_API_URL=https://manifestation-circle-app-2026.onrender.com
```

#### Super Admin Configuration (CRITICAL)
```
VITE_SUPER_ADMIN_EMAIL=akhilkrishna2400@gmail.com
```

### 3. Environment Settings
- Set all variables for: **Production**, **Preview**, and **Development**
- This ensures consistency across all deployment environments

### 4. Redeploy
After adding the environment variables:
1. Go to Deployments tab
2. Click "Redeploy" on the latest deployment
3. Or push a new commit to trigger automatic deployment

### 5. Verification
After deployment, check:
- Visit: `https://manifestation-circle-app-2026.vercel.app/deployment-info.json`
- Should show version 2.1.0 and superAdminEnabled: true
- Login with super admin email: `akhilkrishna2400@gmail.com`
- Shield icon should appear in navbar
- Super Admin panel should be accessible

## Troubleshooting

### If Super Admin button doesn't appear:
1. Check browser console for environment variable errors
2. Verify `VITE_SUPER_ADMIN_EMAIL` is set in Vercel dashboard
3. Clear browser cache and hard refresh (Ctrl+Shift+R)
4. Check that you're using the exact email: `akhilkrishna2400@gmail.com`

### If Super Admin panel returns 404:
1. Verify backend server is running: `https://manifestation-circle-app-2026.onrender.com`
2. Check that `SUPER_ADMIN_EMAIL` is set in Render environment variables
3. Ensure both frontend and backend have matching super admin email

## Environment Variable Priority
1. Vercel Dashboard Environment Variables (highest priority)
2. `.env` files in repository (lower priority)
3. Default values in code (lowest priority)

Make sure to set variables in Vercel Dashboard for production deployments.