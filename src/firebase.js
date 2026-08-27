import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAc05ufittpBFVNXtv3tHW0QJX28CvF-Xs",
  authDomain: "campus-barter-c2a14.firebaseapp.com",
  projectId: "campus-barter-c2a14",
  storageBucket: "campus-barter-c2a14.firebasestorage.app",
  messagingSenderId: "127195586035",
  appId: "1:127195586035:web:6dea888292a6c8f6178686"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);