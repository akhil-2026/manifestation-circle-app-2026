# 🚀 Quick Deployment Steps

## 1. Backend (Render) - 5 minutes

### Option A: GitHub Integration (Recommended)
1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Deploy on Render**:
   - Go to [render.com](https://render.com)
   - Sign up/login with GitHub
   - Click "New +" → "Web Service"
   - Select your repository
   - Configure:
     - **Name**: `manifestation-circle-api`
     - **Environment**: Node
     - **Root Directory**: `server`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`

3. **Add Environment Variables**:
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://akhilmeet006_db_user:Akhilkrkr%402400@cluster0.nl1agek.mongodb.net/manifestation-circle?retryWrites=true&w=majority&appName=Cluster0
   JWT_SECRET=manifestation-circle-super-secret-jwt-key-2024-make-it-very-long-and-secure
   JWT_REFRESH_SECRET=manifestation-circle-refresh-secret-key-2024-also-very-long-and-secure
   JWT_EXPIRE=7d
   JWT_REFRESH_EXPIRE=30d
   CORS_ORIGIN=https://manifestation-circle.vercel.app
   ALLOWED_EMAILS=akhilathul56@gmail.com,adidev140503@gmail.com,athithyatkd@gmail.com,bhosaleasleshiya990@gmail.com
   ```

4. **Deploy**: Click "Create Web Service"
   - ✅ Your API will be at: `https://manifestation-circle-api.onrender.com`

---

## 2. Frontend (Vercel) - 3 minutes

### Option A: GitHub Integration (Recommended)
1. **Deploy on Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Configure:
     - **Framework**: Vite
     - **Root Directory**: `client`
     - **Build Command**: `npm run build`
     - **Output Directory**: `dist`

2. **Add Environment Variable**:
   ```
   VITE_API_URL=https://manifestation-circle-api.onrender.com/api
   ```

3. **Deploy**: Click "Deploy"
   - ✅ Your app will be at: `https://manifestation-circle.vercel.app`

---

## 3. Update CORS (Important!)

1. **Go back to Render**
2. **Update CORS_ORIGIN** environment variable:
   ```
   CORS_ORIGIN=https://your-actual-vercel-url.vercel.app
   ```
3. **Redeploy** the backend service

---

## 🎯 Final Result

- **Frontend**: `https://manifestation-circle.vercel.app`
- **Backend**: `https://manifestation-circle-api.onrender.com`
- **Database**: MongoDB Atlas (already configured)

## ✅ Test Your Deployment

1. Visit your Vercel URL
2. Try registering with a whitelisted email
3. Test all features:
   - Login/logout
   - Dashboard
   - Mirror Mode
   - Admin Panel (if admin)
   - Calendar
   - Group View

---

## 🆘 If Something Goes Wrong

### Backend Issues
- Check Render logs in dashboard
- Verify all environment variables are set
- Test API endpoint directly: `https://your-api.onrender.com/api/health`

### Frontend Issues
- Check Vercel deployment logs
- Verify VITE_API_URL is correct
- Check browser console for errors

### CORS Issues
- Make sure CORS_ORIGIN matches your Vercel URL exactly
- No trailing slashes
- Redeploy backend after CORS changes

---

**🌙 Your Manifestation Circle will be live in under 10 minutes! ✨**