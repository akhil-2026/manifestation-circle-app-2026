# 🌙 MongoDB Atlas Setup for Manifestation Circle

## Quick Setup (5 minutes)

### Step 1: Create MongoDB Atlas Account
1. Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" 
3. Sign up with email and verify

### Step 2: Create Free Cluster
1. Choose **"Shared"** (Free tier)
2. Select **AWS** as provider
3. Choose region closest to you
4. Cluster Name: `manifestation-cluster`
5. Click **"Create Cluster"** (takes 3-5 minutes)

### Step 3: Create Database User
1. Go to **"Database Access"** (left sidebar)
2. Click **"Add New Database User"**
3. Username: `manifestation`
4. Password: `manifestation2024` (or generate secure one)
5. Role: **"Read and write to any database"**
6. Click **"Add User"**

### Step 4: Allow Network Access
1. Go to **"Network Access"** (left sidebar)
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (0.0.0.0/0)
4. Click **"Confirm"**

### Step 5: Get Connection String
1. Go to **"Database"** (left sidebar)
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string

### Step 6: Update Your App
1. Open `server/.env` file
2. Replace the MONGODB_URI line with your connection string:

```env
MONGODB_URI=mongodb+srv://manifestation:manifestation2024@manifestation-cluster.abc123.mongodb.net/manifestation-circle?retryWrites=true&w=majority
```

**Important**: Replace `abc123` with your actual cluster ID from Atlas.

### Step 7: Test Connection
```bash
cd server
npm run test-db
```

If you see ✅ "Successfully connected to MongoDB Atlas!" - you're ready!

### Step 8: Start Your App
```bash
# Terminal 1 - Server
cd server
npm run dev

# Terminal 2 - Client  
cd client
npm run dev
```

## 🔧 Troubleshooting

### Connection Failed?
- **Authentication Error**: Check username/password in connection string
- **Network Error**: Make sure IP is whitelisted (0.0.0.0/0)
- **DNS Error**: Wait a few minutes for cluster to be ready

### Still Having Issues?
1. Make sure cluster status is "Active" in Atlas
2. Double-check database user exists and has correct permissions
3. Verify connection string format is correct
4. Try the test connection script: `npm run test-db`

## 🚀 Production Tips

For production deployment:
1. Use strong passwords
2. Whitelist only specific IPs
3. Enable database backups
4. Monitor usage in Atlas dashboard

## 💡 Free Tier Limits
- 512 MB storage
- Shared resources
- Perfect for this app!

---

**Need help?** The Atlas interface is very user-friendly, just follow the steps above! 🌟