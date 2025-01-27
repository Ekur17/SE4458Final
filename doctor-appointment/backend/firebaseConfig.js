const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json"); // Firebase yönetici anahtarı

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { db };
