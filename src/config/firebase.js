import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyAnsKG6ohQz7G6ktN1aiKGQjlen2EGqrHc",
    authDomain: "sep490-e5896.firebaseapp.com",
    projectId: "sep490-e5896",
    storageBucket: "sep490-e5896.firebasestorage.app",
    messagingSenderId: "127672748069",
    appId: "1:127672748069:web:5a167f672c8505273ed7cc",
    measurementId: "G-78TKH3VEXF"
  };

// In your firebase.js config
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { auth, googleProvider };
auth.settings.appVerificationDisabledForTesting = true; // For development only