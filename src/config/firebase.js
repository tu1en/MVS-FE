import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBaee83bB8PfzzesOyozvx6VDrdv-2y8co",
  authDomain: "mve-1-ad9e3.firebaseapp.com",
  projectId: "mve-1-ad9e3",
  storageBucket: "mve-1-ad9e3.firebasestorage.app",
  messagingSenderId: "1087367399589",
  appId: "1:1087367399589:web:0344a7c8ff4d58bdcf254c",
  measurementId: "G-V58HPC2JN4"
};

console.log("Initializing Firebase with config:", firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Cấu hình Google Auth Provider
googleProvider.setCustomParameters({
  prompt: 'select_account',
  access_type: 'offline'
});

// Thêm scopes cho Google Auth
googleProvider.addScope('email');
googleProvider.addScope('profile');

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

// Cấu hình CORS cho Firebase Storage
const corsSettings = {
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'https://classroom-app-sep490.web.app'
  ],
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600
};

console.log('Firebase initialized with config:', {
  ...firebaseConfig,
  apiKey: '***HIDDEN***' // Hide API key in logs
});

export { analytics, auth, corsSettings, googleProvider, storage };
auth.settings.appVerificationDisabledForTesting = true; // For development only
