import client from "firebase/app";
import "firebase/auth"
import "firebase/firestore";

if (client.apps.length === 0) {
    const config = 
        {
            apiKey: "AIzaSyCnZ-HzilmZL2XrZ8ikM23d57ykjyhEpZE",
            authDomain: "ta-course-matching-app.firebaseapp.com",
            projectId: "ta-course-matching-app",
            storageBucket: "ta-course-matching-app.appspot.com",
            messagingSenderId: "565512890086",
            appId: "1:565512890086:web:2fdf27cfbbeb1ed52ebd27"
        };
	client.initializeApp(config);
}
export default client;