import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCItG_sJR6fKGO88aDl7hqApVWYYkonGy4",
  authDomain: "se4458finalproject.firebaseapp.com",
  projectId: "se4458finalproject",
  storageBucket: "se4458finalproject.appspot.com", // "firebasestorage.app" yerine doğru URL
  messagingSenderId: "960257719717",
  appId: "1:960257719717:web:2e1af75cf14f6fad0bbc4c",
};

// Firebase'i başlat
const app = initializeApp(firebaseConfig);

// Firebase modüllerini export et
export const db = getFirestore(app);
export const auth = getAuth(app);
