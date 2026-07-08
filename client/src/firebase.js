import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA_K5XipT0b8DvInok7CC-XH71UJVguvVQ",
  authDomain: "movie-app-2011a.firebaseapp.com",
  projectId: "movie-app-2011a",
  storageBucket: "movie-app-2011a.firebasestorage.app",
  messagingSenderId: "448732734343",
  appId: "1:448732734343:web:b6ce7f4e3e4e3918d22922",
  measurementId: "G-WS649KGPTQ"
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
