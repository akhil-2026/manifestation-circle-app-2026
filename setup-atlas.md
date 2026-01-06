# MongoDB Atlas Setup Guide 🌙

Follow these steps to set up MongoDB Atlas for your Manifestation Circle app:

## 1. Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Verify your email address

## 2. Create a New Cluster

1. **Choose Deployment Option**: Select "Shared" (Free tier)
2. **Cloud Provider**: Choose AWS, Google Cloud, or Azure
3. **Region**: Select a region close to you
4. **Cluster Name**: `manifestation-cluster` (or any name you prefer)
5. Click "Create Cluster" (takes 3-5 minutes)

## 3. Create Database User

1. Go to **Database Access** in the left sidebar
2. Click "Add New Database User"
3. **Authentication Method**: Password
4. **Username**: `manifestation-user`
5. **Password**: `manifestation123` (or generate a secure password)
6. **Database User Privileges**: Select "Read and write to any database"
7. Click "Add User"

## 4. Configure Network Access

1. Go to **Network Access** in the left sidebar
2. Click "Add IP Address"
3. **For Development**: Click "Allow Access from Anywhere" (0.0.0.0/0)
4. **For Production**: Add your specific IP addresses
5. Click "Confirm"

## 5. Get Connection String

1. Go to **Database** in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. **Driver**: Node.js
5. **Version**: 4.1 or later
6. Copy the connection string

## 6. Update Your .env File

Replace the connection string in your `server/.env` file:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/<database-name>?retryWrites=true&w=majority
```

**Example:**
```env
MONGODB_URI=mongodb+srv://manifestation-user:manifestation123@manifestation-cluster.abc123.mongodb.net/manifestation-circle?retryWrites=true&w=majority
```

**Important**: Replace:
- `<username>` with your database username
- `<password>` with your database password  
- `<cluster-name>` with your actual cluster URL
- `<database-name>` with `manifestation-circle`

## 7. Test Connection

1. Restart your server: `npm run dev` (in server folder)
2. Look for: `✅ Connected to MongoDB`
3. If you see connection errors, double-check:
   - Username and password are correct
   - IP address is whitelisted
   - Connection string format is correct

## 8. Seed Default Data (Optional)

Run the seed script to add default affirmations:
```bash
cd server
node utils/seedData.js
```

## 🔒 Security Best Practices

### For Production:
1. **Strong Password**: Use a complex password for database user
2. **IP Whitelist**: Only allow specific IP addresses
3. **Environment Variables**: Never commit .env files to git
4. **Database Name**: Use a unique database name

### Connection String Security:
- Keep your connection string private
- Use environment variables
- Never share credentials in code or documentation

## 🚀 Deployment Notes

When deploying to platforms like Render, Railway, or Heroku:
1. Add your deployment platform's IP to Network Access
2. Set MONGODB_URI as an environment variable
3. Ensure your cluster region is close to your deployment region

## 📊 Monitoring

MongoDB Atlas provides:
- Real-time performance metrics
- Query performance insights
- Database size and usage statistics
- Automated backups (on paid tiers)

## 💡 Free Tier Limits

MongoDB Atlas Free Tier includes:
- 512 MB storage
- Shared RAM and vCPU
- No backup (manual export recommended)
- Perfect for development and small apps

---

**Need Help?** Check the [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/) or contact support.