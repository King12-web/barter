import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
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

/* Pages read the cached profile from localStorage. Drop it as soon
   as Firebase reports there is no session, so the two can't drift. */
onAuthStateChanged(auth, (user) => {
  if (user === null) localStorage.removeItem("currentUser");
});