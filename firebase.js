const admin = require('firebase-admin');
const firebase =require("firebase/app");
var serviceAccount = require("./serviceAccountKey.json");

var firebaseConfig = {
  apiKey: "AIzaSyCnZ-HzilmZL2XrZ8ikM23d57ykjyhEpZE",
  authDomain: "ta-course-matching-app.firebaseapp.com",
  projectId: "ta-course-matching-app",
  storageBucket: "ta-course-matching-app.appspot.com",
  messagingSenderId: "565512890086",
  appId: "1:565512890086:web:2fdf27cfbbeb1ed52ebd27"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

exports.admin = admin;

exports.firestore = admin.firestore()

exports.auth = admin.auth()