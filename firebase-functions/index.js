const { onSchedule } = require('firebase-functions/v2/scheduler');
const { initializeApp } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const { MongoClient } = require('mongodb');

// Initialize Firebase Admin
initializeApp();

/**
 * Scheduled function to send daily manifestation reminders
 * Runs every day at 9:30 PM IST (4:00 PM UTC)
 */
exports.sendDailyReminder = onSchedule({
  schedule: '30 21 * * *', // 9:30 PM daily
  timeZone: 'Asia/Kolkata', // IST timezone
  memory: '256MiB',
  timeoutSeconds: 300,
}, async (event) => {
  console.log('Starting daily reminder function...');
  
  let client;
  
  try {
    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable not set');
    }
    
    client = new MongoClient(mongoUri);
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db('manifestation-circle');
    const usersCollection = db.collection('users');
    
    // Find all users with FCM tokens and reminders enabled
    const users = await usersCollection.find({
      fcmToken: { $exists: true, $ne: null },
      reminderEnabled: { $ne: false },
      isActive: { $ne: false }
    }).toArray();
    
    console.log(`Found ${users.length} users with notifications enabled`);
    
    if (users.length === 0) {
      console.log('No users to notify');
      return;
    }
    
    // Prepare notification payload
    const notification = {
      title: '🌙 Manifestation Time',
      body: 'Look into the mirror and complete your affirmations'
    };
    
    const data = {
      type: 'daily_reminder',
      url: '/mirror-mode',
      timestamp: new Date().toISOString()
    };
    
    // Send notifications in batches
    const messaging = getMessaging();
    const batchSize = 500; // FCM multicast limit
    let totalSuccess = 0;
    let totalFailure = 0;
    const invalidTokens = [];
    
    for (let i = 0; i < users.length; i += batchSize) {
      const batch = users.slice(i, i + batchSize);
      const tokens = batch.map(user => user.fcmToken);
      
      try {
        const message = {
          tokens: tokens,
          notification: notification,
          data: data,
          webpush: {
            headers: {
              Urgency: 'high',
            },
            notification: {
              title: notification.title,
              body: notification.body,
              icon: '/favicon.svg',
              badge: '/favicon.svg',
              tag: 'manifestation-reminder',
              requireInteraction: true,
              actions: [
                {
                  action: 'open',
                  title: 'Open App',
                  icon: '/favicon.svg'
                }
              ]
            },
            fcm_options: {
              link: '/mirror-mode'
            }
          }
        };
        
        const response = await messaging.sendEachForMulticast(message);
        totalSuccess += response.successCount;
        totalFailure += response.failureCount;
        
        console.log(`Batch ${Math.floor(i/batchSize) + 1}: ${response.successCount}/${tokens.length} sent successfully`);
        
        // Collect invalid tokens
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            const error = resp.error;
            if (error.code === 'messaging/registration-token-not-registered' || 
                error.code === 'messaging/invalid-registration-token') {
              invalidTokens.push(tokens[idx]);
            }
          }
        });
        
      } catch (error) {
        console.error(`Error sending batch ${Math.floor(i/batchSize) + 1}:`, error);
        totalFailure += tokens.length;
      }
    }
    
    // Clean up invalid tokens
    if (invalidTokens.length > 0) {
      console.log(`Removing ${invalidTokens.length} invalid tokens`);
      await usersCollection.updateMany(
        { fcmToken: { $in: invalidTokens } },
        { $unset: { fcmToken: 1 } }
      );
    }
    
    console.log(`Daily reminder completed: ${totalSuccess} sent, ${totalFailure} failed`);
    
    return {
      success: true,
      totalUsers: users.length,
      successCount: totalSuccess,
      failureCount: totalFailure,
      invalidTokensRemoved: invalidTokens.length
    };
    
  } catch (error) {
    console.error('Error in daily reminder function:', error);
    throw error;
  } finally {
    if (client) {
      await client.close();
      console.log('MongoDB connection closed');
    }
  }
});

/**
 * Test function to send immediate notification (for testing)
 */
exports.sendTestNotification = onSchedule({
  schedule: 'every 1 hours', // Disabled by default
  timeZone: 'Asia/Kolkata',
  memory: '256MiB',
}, async (event) => {
  console.log('Test notification function triggered');
  
  // This function is disabled by default
  // Enable it temporarily for testing by changing the schedule
  console.log('Test function is disabled. Enable it for testing.');
  
  return { success: true, message: 'Test function disabled' };
});