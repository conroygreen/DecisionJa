import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDDoKagH7Gekp81ZKyU_u6cGa9q5oV7FFk",
  authDomain: "constituency-dash-board.firebaseapp.com",
  projectId: "constituency-dash-board"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };