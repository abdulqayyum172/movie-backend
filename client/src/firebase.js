import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCBtZyDe-9amdrETJrhQSQAlFylk90Q6Rs",
  authDomain: "movie-backend-60833.firebaseapp.com",
  projectId: "movie-backend-60833",
  storageBucket: "movie-backend-60833.firebasestorage.app",
  messagingSenderId: "894031418996",
  appId: "1:894031418996:web:15990ebd65856cd9b3a321",
  measurementId: "G-EX0B3GMXQG"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Analytics conditionally
export let analytics = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app);
  }
}).catch(err => console.error("Firebase Analytics not supported", err));

export default app;
