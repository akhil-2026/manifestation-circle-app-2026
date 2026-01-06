# 🚀 Vercel Deployment Instructions

## Option 1: Fix Current Project

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Click on your project**: `manifestation-circle-2026-app`
3. **Settings → General**:
   - Root Directory: `client`
   - Save Changes
4. **Settings → Build & Output Settings**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. **Environment Variables**:
   - `VITE_API_URL` = `https://manifestation-circle-app-2026.onrender.com/api`
6. **Redeploy**: Go to Deployments → Redeploy

## Option 2: Create New Project (Recommended)

1. **Delete current project** (optional)
2. **Create New Project**
3. **Import Repository**: `akhil-2026/manifestation-circle-app-2026`
4. **During Setup**:
   - Framework Preset: `Vite`
   - Root Directory: `client` ⚠️ **CRITICAL**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. **Add Environment Variable**:
   - `VITE_API_URL` = `https://manifestation-circle-app-2026.onrender.com/api`
6. **Deploy**

## Why This Fixes 404 Issues

- **Root Directory = `client`** tells Vercel to build from the client folder
- **vercel.json** in client folder handles SPA routing
- **_redirects** file ensures all routes serve index.html
- **Proper build settings** ensure Vite builds correctly

## Test After Deployment

1. Visit: `https://your-new-url.vercel.app/`
2. Navigate to `/dashboard`
3. **Refresh the page** - should NOT show 404
4. Try `/register`, `/login` - all should work on refresh

## If Still Having Issues

The problem is likely that Vercel is not using `client` as the Root Directory. This is the most common cause of SPA 404 issues on Vercel.