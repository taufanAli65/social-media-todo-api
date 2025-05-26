var admin = require("firebase-admin");

var serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const auth = admin.auth();

module.exports = {db, auth}