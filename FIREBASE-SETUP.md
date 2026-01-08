# Firebase Cloud Messaging Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Name it: `manifestation-circle-notifications`
4. Enable Google Analytics (optional)
5. Create project

## Step 2: Enable Cloud Messaging

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Go to **Cloud Messaging** tab
3. Under **Web configuration**, click **Generate key pair**
4. Copy the **VAPID key** (you'll need this)

## Step 3: Get Web App Config

1. In Project Settings, go to **General** tab
2. Scroll to **Your apps** section
3. Click **Web app** icon (`</>`)
4. Register app name: `manifestation-circle-web`
5. Copy the config object (you'll need these values)

## Step 4: Generate Service Account Key

1. In Firebase Console, go to **Project Settings**
2. Go to **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file
5. Extract these values from the JSON:
   - `project_id`
   - `client_email`
   - `private_key`

## Step 5: Enable Cloud Functions

1. In Firebase Console, go to **Functions**
2. Click **Get started**
3. Follow the setup (this enables the Functions API)

## Step 6: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

## Required Environment Variables

### Frontend (Vercel)
```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_PROJECT_ID=your_project_id_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id_here
VITE_FIREBASE_VAPID_KEY=your_vapid_key_here
```

### Backend (Render)
```env
FIREBASE_PROJECT_ID=your_project_id_here
FIREBASE_CLIENT_EMAIL=your_client_email_here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY_HERE\n-----END PRIVATE KEY-----"
```

### Firebase Functions Environment
```bash
# Set environment variables for Firebase Functions
firebase functions:config:set mongodb.uri="your_mongodb_atlas_connection_string"
firebase functions:config:set app.environment="production"

# Deploy functions
firebase deploy --only functions
```

⚠️ **Important**: The private key must include the `\n` characters for line breaks.

## Deployment Steps

### 1. Deploy Firebase Functions
```bash
cd firebase-functions
npm install
cd ..
firebase deploy --only functions
```

### 2. Update Service Worker Config
After getting your Firebase config, update the service worker file:
`client/public/firebase-messaging-sw.js`

Replace the placeholder values with your actual Firebase config.

### 3. Deploy Frontend and Backend
Deploy your updated frontend and backend with the new environment variables.

## Testing Notifications

1. **Enable notifications** in your Profile page
2. **Send test notification** using the admin panel
3. **Check browser console** for any errors
4. **Verify service worker** is registered correctly

## Troubleshooting

### Common Issues:
1. **Service worker not registering**: Check browser console for errors
2. **Notifications not appearing**: Verify permission is granted
3. **Invalid token errors**: Tokens are automatically cleaned up
4. **Function deployment fails**: Check Firebase CLI is logged in

### Debug Steps:
1. Check Firebase Functions logs: `firebase functions:log`
2. Test locally: `firebase emulators:start --only functions`
3. Verify environment variables are set correctly
4. Check MongoDB connection from Functions

## Production Checklist

- [ ] Firebase project created and configured
- [ ] Web app registered in Firebase
- [ ] VAPID key generated
- [ ] Service account key downloaded
- [ ] Environment variables set in Vercel
- [ ] Environment variables set in Render
- [ ] Firebase Functions deployed
- [ ] Service worker updated with config
- [ ] Notifications tested on multiple devices
- [ ] Daily reminder schedule verified (9:30 PM IST)

## Next Steps

After completing this setup:
1. Add the environment variables to Vercel and Render
2. Deploy the updated code
3. Test notifications on your device
4. Deploy the Firebase Cloud Function for scheduled notifications
5. Monitor Firebase Functions logs for any issues