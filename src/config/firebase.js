import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// const firebaseConfig = {
//     apiKey: "AIzaSyBaee83bB8PfzzesOyozvx6VDrdv-2y8co",
//     authDomain: "mve-1-ad9e3.firebaseapp.com",
//     projectId: "mve-1-ad9e3",
//     storageBucket: "mve-1-ad9e3.firebasestorage.app",
//     messagingSenderId: "1087367399589",
//     appId: "1:1087367399589:web:0344a7c8ff4d58bdcf254c",
//     measurementId: "G-V58HPC2JN4"
//   };
  const firebaseConfig = {
    apiKey: "AIzaSyAnsKG6ohQz7G6ktN1aiKGQjlen2EGqrHc",
    authDomain: "sep490-e5896.firebaseapp.com",
    projectId: "sep490-e5896",
    storageBucket: "sep490-e5896.appspot.com",
    messagingSenderId: "127672748069",
    appId: "1:127672748069:web:5a167f672c8505273ed7cc",
    measurementId: "G-78TKH3VEXF"
  };
console.log("Initializing Firebase with config:", firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

// Initialize Analytics only in production to avoid ad blocker issues
let analytics = null;
try {
  if (process.env.NODE_ENV === 'production') {
    analytics = getAnalytics(app);
    console.log("Analytics initialized successfully");
  } else {
    console.log("Analytics skipped in development mode");
  }
} catch (error) {
  console.warn("Analytics initialization failed (likely due to ad blocker):", error.message);
}

export { analytics, auth, googleProvider, storage };
auth.settings.appVerificationDisabledForTesting = true; // For development only
