// This file connects our app to Firebase, which acts as a shared,
// real-time database - every browser watching the same quiz session
// sees updates instantly (new players, new questions, new scores).

import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// These values come from your Firebase project settings and live in a
// .env file (see .env.example) so you don't commit them directly.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// db is imported everywhere else in the app to read/write quiz data.
export const db = getFirestore(app);
