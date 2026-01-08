# 🧪 Firebase Cloud Messaging - Testing Guide

## Pre-Testing Setup

### 1. Complete Firebase Configuration
- [ ] Firebase project created
- [ ] Web app registered
- [ ] VAPID key generated
- [ ] Service account key downloaded
- [ ] Environment variables set

### 2. Deploy Components
- [ ] Backend deployed with Firebase environment variables
- [ ] Frontend deployed with Firebase environment variables
- [ ] Firebase Cloud Functions deployed

## 🔧 Local Testing

### 1. Start Development Servers
```bash
# Backend
cd server
npm run dev

# Frontend (new terminal)
cd client
npm run dev
```

### 2. Test Notification Flow
1. **Register/Login** to the app
2. **Go to Profile page** → Notification Settings
3. **Click "Enable"** button
4. **Grant permission** in browser popup
5. **Send test notification** using admin panel

### 3. Check Browser Console
Look for these logs:
```
✅ Firebase initialized successfully
✅ Service Worker registered
✅ FCM token generated: [token]
✅ FCM token saved to server
```

## 🌐 Production Testing

### 1. Test on Multiple Devices
- [ ] Desktop Chrome
- [ ] Desktop Firefox
- [ ] Desktop Edge
- [ ] Mobile Chrome (Android)
- [ ] Mobile Safari (iOS 16.4+)
- [ ] PWA installed on mobile

### 2. Test Notification Types
- [ ] Foreground notifications (app open)
- [ ] Background notifications (app closed)
- [ ] Test notifications (admin panel)
- [ ] Daily reminders (scheduled)

### 3. Test PWA Installation
1. **Install app** to home screen
2. **Enable notifications** in installed app
3. **Close app completely**
4. **Send test notification**
5. **Verify notification appears** on device

## 🕘 Scheduled Notification Testing

### 1. Manual Testing
Use admin panel to send daily reminder manually:
1. Login as admin
2. Go to Profile → Notification Settings
3. Click "Send Now" under Admin section

### 2. Scheduled Function Testing
```bash
# Check Firebase Functions logs
firebase functions:log

# Test locally with emulator
firebase emulators:start --only functions
```

### 3. Verify Schedule
- Function runs daily at 9:30 PM IST
- Check Firebase Console → Functions → Logs
- Monitor user feedback for timing

## 🐛 Troubleshooting

### Common Issues

#### 1. Service Worker Not Registering
**Symptoms**: No notifications, console errors
**Solutions**:
- Check HTTPS (required for service workers)
- Verify service worker file path
- Check browser console for errors
- Clear browser cache

#### 2. Permission Denied
**Symptoms**: Permission popup doesn't appear
**Solutions**:
- Check if notifications are blocked in browser
- Clear site data and try again
- Use incognito mode for testing
- Check browser notification settings

#### 3. Invalid FCM Token
**Symptoms**: Notifications not received, token errors
**Solutions**:
- Tokens are automatically cleaned up
- Re-enable notifications in profile
- Check Firebase project configuration
- Verify VAPID key is correct

#### 4. Firebase Functions Not Working
**Symptoms**: Scheduled notifications not sent
**Solutions**:
- Check Firebase Functions logs
- Verify MongoDB connection string
- Check environment variables in Functions
- Ensure billing is enabled for scheduled functions

### Debug Commands

```bash
# Check Firebase project
firebase projects:list

# Check Functions status
firebase functions:log --limit 50

# Test Functions locally
firebase emulators:start --only functions

# Check MongoDB connection
# (Use your backend health endpoint)
curl https://your-backend.onrender.com/api/health
```

## 📊 Testing Checklist

### Basic Functionality
- [ ] User can enable notifications
- [ ] Permission popup appears
- [ ] FCM token is saved to database
- [ ] Test notification works
- [ ] User can disable notifications
- [ ] Token is removed on logout

### Advanced Features
- [ ] Daily reminders work (9:30 PM IST)
- [ ] Notifications work when app is closed
- [ ] PWA notifications work on mobile
- [ ] Invalid tokens are cleaned up
- [ ] Admin can send manual reminders
- [ ] Multiple users receive notifications

### Cross-Platform Testing
- [ ] Desktop browsers (Chrome, Firefox, Edge)
- [ ] Mobile browsers (Chrome Android, Safari iOS)
- [ ] PWA on Android
- [ ] PWA on iOS (16.4+)
- [ ] Different time zones

### Error Handling
- [ ] Graceful handling of permission denial
- [ ] Proper error messages for users
- [ ] Automatic token cleanup
- [ ] Fallback for unsupported browsers

## 📈 Monitoring

### Key Metrics to Track
1. **Notification delivery rate**
2. **Permission grant rate**
3. **Token validity rate**
4. **User engagement with notifications**

### Firebase Console Monitoring
- Functions → Logs (check for errors)
- Functions → Usage (check execution count)
- Cloud Messaging → Reports (delivery stats)

### User Feedback
- Monitor user reports of missing notifications
- Check if timing (9:30 PM IST) works for users
- Gather feedback on notification content

## 🚀 Go-Live Checklist

Before enabling notifications in production:

- [ ] All tests pass on staging environment
- [ ] Firebase billing is enabled (for scheduled functions)
- [ ] Environment variables are set correctly
- [ ] Service worker is deployed and accessible
- [ ] Daily reminder schedule is verified
- [ ] User documentation is updated
- [ ] Support team is briefed on troubleshooting

## 📞 Support Information

### For Users
- Notifications require HTTPS
- Must grant permission when prompted
- Works best in installed PWA
- iOS requires iOS 16.4+ and PWA installation

### For Developers
- Check Firebase Console for function logs
- Monitor MongoDB for invalid token cleanup
- Use browser dev tools for debugging
- Test across multiple devices and browsers