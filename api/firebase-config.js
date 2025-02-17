var admin = require("firebase-admin");
const { getAuth } = require("firebase-admin/auth");

var serviceAccount = require("../firebase.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

module.exports = {db, auth}