const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const initializeFirebase = () => {
  if (admin.apps.length === 0) {
    try {
      // For now, let's skip Firebase Admin initialization
      // and just return a mock object to prevent errors
      console.log('Firebase Admin SDK: Skipping initialization for development');
      return null;
    } catch (error) {
      console.error('Error initializing Firebase Admin SDK:', error);
      return null;
    }
  }
  return admin;
};

module.exports = { admin, initializeFirebase };