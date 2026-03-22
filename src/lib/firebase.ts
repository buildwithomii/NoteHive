import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC809AWEge2JW2ZE_yCCG5Te7Vv3eb-EBs",
  authDomain: "notehive-48544.firebaseapp.com",
  projectId: "notehive-48544",
  storageBucket: "notehive-48544.firebasestorage.app",
  messagingSenderId: "27949129736",
  appId: "1:27949129736:web:0a51c2dc6ab8df2f6731bd",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();

