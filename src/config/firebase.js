import { getAnalytics } from "firebase/analytics";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Firebase configuration - IMPORTANT: Replace with real config from Firebase Console
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBaee83bB8PfzzesOyozvx6VDrdv-2y8co",
  authDomain: "mve-1-ad9e3.firebaseapp.com",
  projectId: "mve-1-ad9e3",
  storageBucket: "mve-1-ad9e3.firebasestorage.app",
  messagingSenderId: "1087367399589",
  appId: "1:1087367399589:web:0344a7c8ff4d58bdcf254c",
  measurementId: "G-V58HPC2JN4"
};
console.log("Initializing Firebase with config:", {
  ...firebaseConfig,
  apiKey: firebaseConfig.apiKey.substring(0, 10) + '...' // Show only first 10 chars for security
});

// Validate API key before initialization
if (firebaseConfig.apiKey === "INVALID_API_KEY_REPLACE_ME" || !firebaseConfig.apiKey) {
  console.error("❌ CRITICAL: Invalid Firebase API key!");
  console.error("📋 To fix this:");
  console.error("1. Go to https://console.firebase.google.com/");
  console.error("2. Select project: mve-1-ad9e3");
  console.error("3. Go to Project Settings > Your apps");
  console.error("4. Create web app or get existing config");
  console.error("5. Replace API key in .env.local or firebase.js");
  throw new Error("Firebase API key is invalid. Please check FIREBASE_API_KEY_SOLUTION.md");
}

// Initialize Firebase with error handling
let app, auth, googleProvider, storage;

try {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  storage = getStorage(app);

  console.log("✅ Firebase initialized successfully");

  // Configure Google provider
  googleProvider.addScope('email');
  googleProvider.addScope('profile');

} catch (error) {
  console.error("❌ Firebase initialization failed:", error);
  console.error("Check if API key is valid for project:", firebaseConfig.projectId);
  console.error("📖 See FIREBASE_API_KEY_SOLUTION.md for detailed fix instructions");
  throw error;
}

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
