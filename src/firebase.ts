import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth, GoogleAuthProvider, browserLocalPersistence, browserSessionPersistence, setPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDOn03xMtJps0zoDcZsdPIe3kKFmk1Z0DE",
  authDomain: "sexmatch-d0bfe.firebaseapp.com",
  projectId: "sexmatch-d0bfe",
  storageBucket: "sexmatch-d0bfe.firebasestorage.app",
  messagingSenderId: "1065119815678",
  appId: "1:1065119815678:web:50a1b6f3a61cadfa7412af",
  measurementId: "G-QSLDCG7EX4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure Google Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

// Try to set persistence to local, fallback to session if blocked
const setupPersistence = async () => {
  try {
    await setPersistence(auth, browserLocalPersistence);
  } catch (error) {
    console.warn('Local persistence not available, falling back to session persistence');
    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch (error) {
      console.error('Failed to set persistence:', error);
    }
  }
};

setupPersistence();

export { app, analytics, auth, db, storage, googleProvider }; 