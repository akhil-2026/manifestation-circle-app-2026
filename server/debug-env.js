require('dotenv').config();

console.log('🔍 Debugging Environment Variables...\n');

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

console.log('FIREBASE_PROJECT_ID:', projectId);
console.log('FIREBASE_CLIENT_EMAIL:', clientEmail);
console.log('FIREBASE_PRIVATE_KEY length:', privateKey ? privateKey.length : 'undefined');
console.log('FIREBASE_PRIVATE_KEY starts with:', privateKey ? privateKey.substring(0, 50) + '...' : 'undefined');

console.log('\nChecking conditions:');
console.log('projectId exists:', !!projectId);
console.log('clientEmail exists:', !!clientEmail);
console.log('privateKey exists:', !!privateKey);
console.log('All exist:', !!(projectId && clientEmail && privateKey));

if (privateKey) {
  console.log('\nPrivate key processing:');
  const processedKey = privateKey.replace(/\\n/g, '\n');
  console.log('Processed key starts with:', processedKey.substring(0, 50) + '...');
  console.log('Contains newlines:', processedKey.includes('\n'));
}