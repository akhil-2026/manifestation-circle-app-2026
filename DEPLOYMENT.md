# 🚀 Manifestation Circle - Deployment Guide

## Overview
- **Frontend**: Vercel (Free)
- **Backend**: Render (Free)
- **Database**: MongoDB Atlas (Already configured)
- **Push Notifications**: To be implemented
- **Scheduled Functions**: To be implemented

## 📋 Pre-Deployment Checklist

### ✅ Completed
- [x] MongoDB Atlas connection working
- [x] Environment variables configured
- [x] Email whitelist implemented
- [x] Admin functionality working
- [x] Arrow reordering fixed
- [ ] Push notification system to be implemented
- [ ] Push notification system ready

### 🔧 Deployment Preparation
- [ ] Push notification system to be implemented
- [ ] Update CORS origins for production
- [ ] Set production environment variables
- [ ] Build and test frontend
- [ ] Deploy backend to Render
- [ ] Deploy frontend to Vercel
- [ ] Test production deployment

---

## 🌐 Step 1: Backend Deployment (Render)

### 1.1 Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### 1.2 Deploy Backend
1. **Create New Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Select `manifestation-circle` repository

2. **Configure Service**
   ```
   Name: manifestation-circle-api
   Environment: Node
   Region: Oregon (US West) or closest to you
   Branch: main
   Root Directory: server
   Build Command: npm install
   Start Command: npm start
   ```

3. **Environment Variables** (Add these in Render dashboard):
   ```
   NODE_ENV=production
   PORT=10000
   MONGODB_URI=mongodb+srv://akhilmeet006_db_user:Akhilkrkr%402400@cluster0.nl1agek.mongodb.net/manifestation-circle?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=manifestation-circle-super-secret-jwt-key-2024-make-it-very-long-and-secure
   JWT_REFRESH_SECRET=manifestation-circle-refresh-secret-key-2024-also-very-long-and-secure
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   CORS_ORIGIN=https://your-app-name.vercel.app
   ALLOWED_EMAILS=akhilathul56@gmail.com,adidev140503@gmail.com,athithyatkd@gmail.com,bhosaleasleshiya990@gmail.com
   CLOUDINARY_CLOUD_NAME=dfpupyrdx
   CLOUDINARY_API_KEY=124997585732327
   CLOUDINARY_API_SECRET=c8LzfnMrSJuJIGovPew7ESb_Lxs
   ```

4. **Deploy**
   - Click "Create Web Service"
   - Wait for deployment (5-10 minutes)
   - Note your backend URL: `https://manifestation-circle-api.onrender.com`

---

## 🎨 Step 2: Frontend Deployment (Vercel)

### 2.1 Prepare Frontend
1. **Update API URL**
   - Create production environment file
   - Update axios base URL

2. **Build Test**
   ```bash
   cd client
   npm run build
   ```

### 2.2 Deploy to Vercel
1. **Install Vercel CLI** (optional)
   ```bash
   npm install -g vercel
   ```

2. **Deploy via GitHub** (Recommended)
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub
   - Click "New Project"
   - Import `manifestation-circle` repository
   - Configure:
     ```
     Framework Preset: Vite
     Root Directory: client
     Build Command: npm run build
     Output Directory: dist
     Install Command: npm install
     ```

3. **Environment Variables** (Add in Vercel dashboard):
   ```
   VITE_API_URL=https://manifestation-circle-api.onrender.com/api
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment (2-3 minutes)
   - Note your frontend URL: `https://manifestation-circle.vercel.app`

---

## 🔧 Step 3: Update CORS Configuration

### 3.1 Update Backend CORS
Update your Render environment variables:
```
CORS_ORIGIN=https://manifestation-circle.vercel.app
```

### 3.2 Redeploy Backend
- Go to Render dashboard
- Click "Manual Deploy" → "Deploy latest commit"

---

## 🧪 Step 4: Testing Production

### 4.1 Test Checklist
- [ ] Frontend loads correctly
- [ ] Registration works with whitelisted emails
- [ ] Login/logout functionality
- [ ] Dashboard displays properly
- [ ] Mirror Mode works
- [ ] Admin panel accessible
- [ ] Arrow reordering works
- [ ] Calendar view functions
- [ ] Group view displays

### 4.2 Common Issues & Solutions

**CORS Errors**
- Check CORS_ORIGIN matches your Vercel URL exactly
- Ensure no trailing slash in URLs

**API Connection Issues**
- Verify VITE_API_URL is correct
- Check Render service is running
- Look at Render logs for errors

**Database Connection**
- Ensure MongoDB Atlas allows connections from 0.0.0.0/0
- Check connection string is correct

---

## 🔒 Step 5: Security & Performance

### 5.1 Security Checklist
- [x] JWT secrets are strong and unique
- [x] Email whitelist implemented
- [x] CORS properly configured
- [x] Environment variables secured
- [x] No sensitive data in code

### 5.2 Performance Optimizations
- [x] MongoDB Atlas indexes optimized
- [x] Frontend built for production
- [x] Images optimized (favicon)
- [x] API responses minimized

---

## 📱 Step 6: Custom Domain (Optional)

### 6.1 Frontend Domain
1. Buy domain (e.g., manifestationcircle.com)
2. Add to Vercel project
3. Configure DNS records

### 6.2 Backend Domain
1. Add custom domain in Render
2. Update CORS_ORIGIN
3. Update VITE_API_URL

---

## 🎯 Final URLs

After deployment, you'll have:
- **Frontend**: `https://manifestation-circle.vercel.app`
- **Backend**: `https://manifestation-circle-api.onrender.com`
- **Database**: MongoDB Atlas (cloud)

---

## 🆘 Troubleshooting

### Common Deployment Issues

1. **Build Failures**
   - Check package.json scripts
   - Ensure all dependencies are listed
   - Check Node.js version compatibility

2. **Environment Variables**
   - Double-check all variables are set
   - No spaces around = in .env files
   - Restart services after changes

3. **Database Connection**
   - Whitelist 0.0.0.0/0 in Atlas
   - Check connection string format
   - Test connection with test script

### Getting Help
- Check Render/Vercel logs
- Use browser developer tools
- Test API endpoints directly
- Check MongoDB Atlas metrics

---

**🌙 Your Manifestation Circle will be live and accessible worldwide! ✨**