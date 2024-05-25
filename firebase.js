const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://skipli-ai-default-rtdb.firebaseio.com/'
});

const db = admin.database();

module.exports = db;
