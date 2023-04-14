
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth"
import { getStorage} from "firebase/storage";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDg2454w2aVn8kUkvIeiaZmomL4zaCu7Ek",
  authDomain: "siuuu-f33e1.firebaseapp.com",
  projectId: "siuuu-f33e1",
  storageBucket: "siuuu-f33e1.appspot.com",
  messagingSenderId: "1029689882974",
  appId: "1:1029689882974:web:a58fe114778c4e6f6f37cf",
  measurementId: "G-TM7EZ7YZYX"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const auth = getAuth()
export const storage = getStorage()
export const db = getFirestore()





