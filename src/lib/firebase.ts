import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyBIojfr9v6aKCVB29F1sdSYMoQZR6JNcIQ",
  authDomain: "desi-cart-3845f.firebaseapp.com",
  projectId: "desi-cart-3845f",
  storageBucket: "desi-cart-3845f.firebasestorage.app",
  messagingSenderId: "777002406230",
  appId: "1:777002406230:web:698c2ac44f21fb845186f7",
  measurementId: "G-CVE54HFR5E",
};

// Initialize the Firebase App singleton (safe for SSR — no Auth/Firestore here)
const app: FirebaseApp =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export default app;
