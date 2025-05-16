import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyA2tpuxWHjMu331P5WSJOo2bkZ6JzM-ZY8",
  authDomain: "attendance-tracker-5cfec.firebaseapp.com",
  projectId: "attendance-tracker-5cfec",
  storageBucket: "attendance-tracker-5cfec.firebasestorage.app",
  messagingSenderId: "332406328727",
  appId: "1:332406328727:web:2ffeb24821592ad03848d2"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const db = getFirestore(app);
const storage = getStorage(app);

// ✅ Only one export statement
export { auth, googleProvider, db, storage };

