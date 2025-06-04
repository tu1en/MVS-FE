import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

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

// In your firebase.js config
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const storage = getStorage(app);

export { auth, googleProvider, storage };
auth.settings.appVerificationDisabledForTesting = true; // For development only